//! Holds a payment handler allowing to create and pay [BOLT 11] invoices.
//!
//! [BOLT 11]: https://github.com/lightning/bolts/blob/master/11-payment-encoding.md

use crate::config::{Config, LDK_PAYMENT_RETRY_TIMEOUT};
use crate::connection::ConnectionManager;
use crate::error::Error;
use crate::liquidity::LiquiditySource;
use crate::logger::{log_error, log_info, FilesystemLogger, Logger};
use crate::payment::payment_store::{
	LSPFeeLimits, PaymentDetails, PaymentDirection, PaymentKind, PaymentStatus, PaymentStore,
};
use crate::peer_store::{PeerInfo, PeerStore};
use crate::types::{ChannelManager, KeysManager};

use lightning::ln::channelmanager::{PaymentId, RecipientOnionFields, Retry, RetryableSendFailure};
use lightning::ln::PaymentHash;
use lightning::routing::router::{PaymentParameters, RouteParameters};

use lightning_invoice::{payment, Bolt11Invoice, Currency};

use bitcoin::hashes::Hash;

use std::sync::{Arc, RwLock};

/// A payment handler allowing to create and pay [BOLT 11] invoices.
///
/// Should be retrieved by calling [`Node::bolt11_payment`].
///
/// [BOLT 11]: https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
/// [`Node::bolt11_payment`]: crate::Node::bolt11_payment
pub struct Bolt11Payment {
	runtime: Arc<RwLock<Option<tokio::runtime::Runtime>>>,
	channel_manager: Arc<ChannelManager>,
	connection_manager: Arc<ConnectionManager<Arc<FilesystemLogger>>>,
	keys_manager: Arc<KeysManager>,
	liquidity_source: Option<Arc<LiquiditySource<Arc<FilesystemLogger>>>>,
	payment_store: Arc<PaymentStore<Arc<FilesystemLogger>>>,
	peer_store: Arc<PeerStore<Arc<FilesystemLogger>>>,
	config: Arc<Config>,
	logger: Arc<FilesystemLogger>,
}

impl Bolt11Payment {
	pub(crate) fn new(
		runtime: Arc<RwLock<Option<tokio::runtime::Runtime>>>,
		channel_manager: Arc<ChannelManager>,
		connection_manager: Arc<ConnectionManager<Arc<FilesystemLogger>>>,
		keys_manager: Arc<KeysManager>,
		liquidity_source: Option<Arc<LiquiditySource<Arc<FilesystemLogger>>>>,
		payment_store: Arc<PaymentStore<Arc<FilesystemLogger>>>,
		peer_store: Arc<PeerStore<Arc<FilesystemLogger>>>, config: Arc<Config>,
		logger: Arc<FilesystemLogger>,
	) -> Self {
		Self {
			runtime,
			channel_manager,
			connection_manager,
			keys_manager,
			liquidity_source,
			payment_store,
			peer_store,
			config,
			logger,
		}
	}

	/// Send a payment given an invoice.
	pub fn send(&self, invoice: &Bolt11Invoice) -> Result<PaymentId, Error> {
		let rt_lock = self.runtime.read().unwrap();
		if rt_lock.is_none() {
			return Err(Error::NotRunning);
		}

		let (payment_hash, recipient_onion, route_params) = payment::payment_parameters_from_invoice(&invoice).map_err(|_| {
			log_error!(self.logger, "Failed to send payment due to the given invoice being \"zero-amount\". Please use send_using_amount instead.");
			Error::InvalidInvoice
		})?;

		let payment_id = PaymentId(invoice.payment_hash().to_byte_array());
		if let Some(payment) = self.payment_store.get(&payment_id) {
			if payment.status == PaymentStatus::Pending
				|| payment.status == PaymentStatus::Succeeded
			{
				log_error!(self.logger, "Payment error: an invoice must not be paid twice.");
				return Err(Error::DuplicatePayment);
			}
		}

		let payment_secret = Some(*invoice.payment_secret());
		let retry_strategy = Retry::Timeout(LDK_PAYMENT_RETRY_TIMEOUT);

		match self.channel_manager.send_payment(
			payment_hash,
			recipient_onion,
			payment_id,
			route_params,
			retry_strategy,
		) {
			Ok(()) => {
				let payee_pubkey = invoice.recover_payee_pub_key();
				let amt_msat = invoice.amount_milli_satoshis().unwrap();
				log_info!(self.logger, "Initiated sending {}msat to {}", amt_msat, payee_pubkey);

				let kind = PaymentKind::Bolt11 {
					hash: payment_hash,
					preimage: None,
					secret: payment_secret,
				};

				let payment = PaymentDetails {
					id: payment_id,
					kind,
					amount_msat: invoice.amount_milli_satoshis(),
					direction: PaymentDirection::Outbound,
					status: PaymentStatus::Pending,
                    user_token: "".to_string()
				};
				self.payment_store.insert(payment)?;

				Ok(payment_id)
			},
			Err(e) => {
				log_error!(self.logger, "Failed to send payment: {:?}", e);
				match e {
					RetryableSendFailure::DuplicatePayment => Err(Error::DuplicatePayment),
					_ => {
						let kind = PaymentKind::Bolt11 {
							hash: payment_hash,
							preimage: None,
							secret: payment_secret,
						};
						let payment = PaymentDetails {
							id: payment_id,
							kind,
							amount_msat: invoice.amount_milli_satoshis(),
							direction: PaymentDirection::Outbound,
							status: PaymentStatus::Failed,
                    user_token: "".to_string()
						};

						self.payment_store.insert(payment)?;
						Err(Error::PaymentSendingFailed)
					},
				}
			},
		}
	}

	/// Send a payment given an invoice and an amount in millisatoshi.
	///
	/// This will fail if the amount given is less than the value required by the given invoice.
	///
	/// This can be used to pay a so-called "zero-amount" invoice, i.e., an invoice that leaves the
	/// amount paid to be determined by the user.
	pub fn send_using_amount(
		&self, invoice: &Bolt11Invoice, amount_msat: u64,
	) -> Result<PaymentId, Error> {
		let rt_lock = self.runtime.read().unwrap();
		if rt_lock.is_none() {
			return Err(Error::NotRunning);
		}

		if let Some(invoice_amount_msat) = invoice.amount_milli_satoshis() {
			if amount_msat < invoice_amount_msat {
				log_error!(
					self.logger,
					"Failed to pay as the given amount needs to be at least the invoice amount: required {}msat, gave {}msat.", invoice_amount_msat, amount_msat);
				return Err(Error::InvalidAmount);
			}
		}

		let payment_hash = PaymentHash(invoice.payment_hash().to_byte_array());
		let payment_id = PaymentId(invoice.payment_hash().to_byte_array());
		if let Some(payment) = self.payment_store.get(&payment_id) {
			if payment.status == PaymentStatus::Pending
				|| payment.status == PaymentStatus::Succeeded
			{
				log_error!(self.logger, "Payment error: an invoice must not be paid twice.");
				return Err(Error::DuplicatePayment);
			}
		}

		let payment_secret = invoice.payment_secret();
		let expiry_time = invoice.duration_since_epoch().saturating_add(invoice.expiry_time());
		let mut payment_params = PaymentParameters::from_node_id(
			invoice.recover_payee_pub_key(),
			invoice.min_final_cltv_expiry_delta() as u32,
		)
		.with_expiry_time(expiry_time.as_secs())
		.with_route_hints(invoice.route_hints())
		.map_err(|_| Error::InvalidInvoice)?;
		if let Some(features) = invoice.features() {
			payment_params = payment_params
				.with_bolt11_features(features.clone())
				.map_err(|_| Error::InvalidInvoice)?;
		}
		let route_params =
			RouteParameters::from_payment_params_and_value(payment_params, amount_msat);

		let retry_strategy = Retry::Timeout(LDK_PAYMENT_RETRY_TIMEOUT);
		let recipient_fields = RecipientOnionFields::secret_only(*payment_secret);

		match self.channel_manager.send_payment(
			payment_hash,
			recipient_fields,
			payment_id,
			route_params,
			retry_strategy,
		) {
			Ok(()) => {
				let payee_pubkey = invoice.recover_payee_pub_key();
				log_info!(
					self.logger,
					"Initiated sending {} msat to {}",
					amount_msat,
					payee_pubkey
				);

				let kind = PaymentKind::Bolt11 {
					hash: payment_hash,
					preimage: None,
					secret: Some(*payment_secret),
				};

				let payment = PaymentDetails {
					id: payment_id,
					kind,
					amount_msat: Some(amount_msat),
					direction: PaymentDirection::Outbound,
					status: PaymentStatus::Pending,
                    user_token: "".to_string()
				};
				self.payment_store.insert(payment)?;

				Ok(payment_id)
			},
			Err(e) => {
				log_error!(self.logger, "Failed to send payment: {:?}", e);

				match e {
					RetryableSendFailure::DuplicatePayment => Err(Error::DuplicatePayment),
					_ => {
						let kind = PaymentKind::Bolt11 {
							hash: payment_hash,
							preimage: None,
							secret: Some(*payment_secret),
						};

						let payment = PaymentDetails {
							id: payment_id,
							kind,
							amount_msat: Some(amount_msat),
							direction: PaymentDirection::Outbound,
							status: PaymentStatus::Failed,
                    user_token: "".to_string()
						};
						self.payment_store.insert(payment)?;

						Err(Error::PaymentSendingFailed)
					},
				}
			},
		}
	}

	/// Returns a payable invoice that can be used to request and receive a payment of the amount
	/// given.
	pub fn receive(
		&self, amount_msat: u64, description: &str, expiry_secs: u32,
	) -> Result<Bolt11Invoice, Error> {
		self.receive_inner(Some(amount_msat), description, expiry_secs)
	}

	/// Returns a payable invoice that can be used to request and receive a payment for which the
	/// amount is to be determined by the user, also known as a "zero-amount" invoice.
	pub fn receive_variable_amount(
		&self, description: &str, expiry_secs: u32,
	) -> Result<Bolt11Invoice, Error> {
		self.receive_inner(None, description, expiry_secs)
	}

	fn receive_inner(
		&self, amount_msat: Option<u64>, description: &str, expiry_secs: u32,
	) -> Result<Bolt11Invoice, Error> {
		let currency = Currency::from(self.config.network);
		let keys_manager = Arc::clone(&self.keys_manager);
		let invoice = match lightning_invoice::utils::create_invoice_from_channelmanager(
			&self.channel_manager,
			keys_manager,
			Arc::clone(&self.logger),
			currency,
			amount_msat,
			description.to_string(),
			expiry_secs,
			None,
		) {
			Ok(inv) => {
				log_info!(self.logger, "Invoice created: {}", inv);
				inv
			},
			Err(e) => {
				log_error!(self.logger, "Failed to create invoice: {}", e);
				return Err(Error::InvoiceCreationFailed);
			},
		};

		let payment_hash = PaymentHash(invoice.payment_hash().to_byte_array());
		let id = PaymentId(payment_hash.0);
		let kind = PaymentKind::Bolt11 {
			hash: payment_hash,
			preimage: None,
			secret: Some(invoice.payment_secret().clone()),
		};

		let payment = PaymentDetails {
			id,
			kind,
			amount_msat,
			direction: PaymentDirection::Inbound,
			status: PaymentStatus::Pending,
                    user_token: "".to_string()
		};

		self.payment_store.insert(payment)?;

		Ok(invoice)
	}

	/// Returns a payable invoice that can be used to request a payment of the amount given and
	/// receive it via a newly created just-in-time (JIT) channel.
	///
	/// When the returned invoice is paid, the configured [LSPS2]-compliant LSP will open a channel
	/// to us, supplying just-in-time inbound liquidity.
	///
	/// If set, `max_total_lsp_fee_limit_msat` will limit how much fee we allow the LSP to take for opening the
	/// channel to us. We'll use its cheapest offer otherwise.
	///
	/// [LSPS2]: https://github.com/BitcoinAndLightningLayerSpecs/lsp/blob/main/LSPS2/README.md
	pub fn receive_via_jit_channel(
		&self, amount_msat: u64, description: &str, expiry_secs: u32,
		max_total_lsp_fee_limit_msat: Option<u64>,
	) -> Result<Bolt11Invoice, Error> {
		self.receive_via_jit_channel_inner(
			Some(amount_msat),
			description,
			expiry_secs,
			max_total_lsp_fee_limit_msat,
			None,
		)
	}

	/// Returns a payable invoice that can be used to request a variable amount payment (also known
	/// as "zero-amount" invoice) and receive it via a newly created just-in-time (JIT) channel.
	///
	/// When the returned invoice is paid, the configured [LSPS2]-compliant LSP will open a channel
	/// to us, supplying just-in-time inbound liquidity.
	///
	/// If set, `max_proportional_lsp_fee_limit_ppm_msat` will limit how much proportional fee, in
	/// parts-per-million millisatoshis, we allow the LSP to take for opening the channel to us.
	/// We'll use its cheapest offer otherwise.
	///
	/// [LSPS2]: https://github.com/BitcoinAndLightningLayerSpecs/lsp/blob/main/LSPS2/README.md
	pub fn receive_variable_amount_via_jit_channel(
		&self, description: &str, expiry_secs: u32,
		max_proportional_lsp_fee_limit_ppm_msat: Option<u64>,
	) -> Result<Bolt11Invoice, Error> {
		self.receive_via_jit_channel_inner(
			None,
			description,
			expiry_secs,
			None,
			max_proportional_lsp_fee_limit_ppm_msat,
		)
	}

	fn receive_via_jit_channel_inner(
		&self, amount_msat: Option<u64>, description: &str, expiry_secs: u32,
		max_total_lsp_fee_limit_msat: Option<u64>,
		max_proportional_lsp_fee_limit_ppm_msat: Option<u64>,
	) -> Result<Bolt11Invoice, Error> {
		let liquidity_source =
			self.liquidity_source.as_ref().ok_or(Error::LiquiditySourceUnavailable)?;

		let (node_id, address) = liquidity_source
			.get_liquidity_source_details()
			.ok_or(Error::LiquiditySourceUnavailable)?;

		let rt_lock = self.runtime.read().unwrap();
		let runtime = rt_lock.as_ref().unwrap();

		let peer_info = PeerInfo { node_id, address };

		let con_node_id = peer_info.node_id;
		let con_addr = peer_info.address.clone();
		let con_cm = Arc::clone(&self.connection_manager);

		// We need to use our main runtime here as a local runtime might not be around to poll
		// connection futures going forward.
		tokio::task::block_in_place(move || {
			runtime.block_on(async move {
				con_cm.connect_peer_if_necessary(con_node_id, con_addr).await
			})
		})?;

		log_info!(self.logger, "Connected to LSP {}@{}. ", peer_info.node_id, peer_info.address);

		let liquidity_source = Arc::clone(&liquidity_source);
		let (invoice, lsp_total_opening_fee, lsp_prop_opening_fee) =
			tokio::task::block_in_place(move || {
				runtime.block_on(async move {
					if let Some(amount_msat) = amount_msat {
						liquidity_source
							.lsps2_receive_to_jit_channel(
								amount_msat,
								description,
								expiry_secs,
								max_total_lsp_fee_limit_msat,
							)
							.await
							.map(|(invoice, total_fee)| (invoice, Some(total_fee), None))
					} else {
						liquidity_source
							.lsps2_receive_variable_amount_to_jit_channel(
								description,
								expiry_secs,
								max_proportional_lsp_fee_limit_ppm_msat,
							)
							.await
							.map(|(invoice, prop_fee)| (invoice, None, Some(prop_fee)))
					}
				})
			})?;

		// Register payment in payment store.
		let payment_hash = PaymentHash(invoice.payment_hash().to_byte_array());
		let lsp_fee_limits = LSPFeeLimits {
			max_total_opening_fee_msat: lsp_total_opening_fee,
			max_proportional_opening_fee_ppm_msat: lsp_prop_opening_fee,
		};
		let id = PaymentId(payment_hash.0);
		let kind = PaymentKind::Bolt11Jit {
			hash: payment_hash,
			preimage: None,
			secret: Some(invoice.payment_secret().clone()),
			lsp_fee_limits,
		};
		let payment = PaymentDetails {
			id,
			kind,
			amount_msat,
			direction: PaymentDirection::Inbound,
			status: PaymentStatus::Pending,
                    user_token: "".to_string()
		};

		self.payment_store.insert(payment)?;

		// Persist LSP peer to make sure we reconnect on restart.
		self.peer_store.add_peer(peer_info)?;

		Ok(invoice)
	}

	/// Sends payment probes over all paths of a route that would be used to pay the given invoice.
	///
	/// This may be used to send "pre-flight" probes, i.e., to train our scorer before conducting
	/// the actual payment. Note this is only useful if there likely is sufficient time for the
	/// probe to settle before sending out the actual payment, e.g., when waiting for user
	/// confirmation in a wallet UI.
	///
	/// Otherwise, there is a chance the probe could take up some liquidity needed to complete the
	/// actual payment. Users should therefore be cautious and might avoid sending probes if
	/// liquidity is scarce and/or they don't expect the probe to return before they send the
	/// payment. To mitigate this issue, channels with available liquidity less than the required
	/// amount times [`Config::probing_liquidity_limit_multiplier`] won't be used to send
	/// pre-flight probes.
	pub fn send_probes(&self, invoice: &Bolt11Invoice) -> Result<(), Error> {
		let rt_lock = self.runtime.read().unwrap();
		if rt_lock.is_none() {
			return Err(Error::NotRunning);
		}

		let (_payment_hash, _recipient_onion, route_params) = payment::payment_parameters_from_invoice(&invoice).map_err(|_| {
			log_error!(self.logger, "Failed to send probes due to the given invoice being \"zero-amount\". Please use send_probes_using_amount instead.");
			Error::InvalidInvoice
		})?;

		let liquidity_limit_multiplier = Some(self.config.probing_liquidity_limit_multiplier);

		self.channel_manager
			.send_preflight_probes(route_params, liquidity_limit_multiplier)
			.map_err(|e| {
				log_error!(self.logger, "Failed to send payment probes: {:?}", e);
				Error::ProbeSendingFailed
			})?;

		Ok(())
	}

	/// Sends payment probes over all paths of a route that would be used to pay the given
	/// zero-value invoice using the given amount.
	///
	/// This can be used to send pre-flight probes for a so-called "zero-amount" invoice, i.e., an
	/// invoice that leaves the amount paid to be determined by the user.
	///
	/// See [`Self::send_probes`] for more information.
	pub fn send_probes_using_amount(
		&self, invoice: &Bolt11Invoice, amount_msat: u64,
	) -> Result<(), Error> {
		let rt_lock = self.runtime.read().unwrap();
		if rt_lock.is_none() {
			return Err(Error::NotRunning);
		}

		let (_payment_hash, _recipient_onion, route_params) = if let Some(invoice_amount_msat) =
			invoice.amount_milli_satoshis()
		{
			if amount_msat < invoice_amount_msat {
				log_error!(
					self.logger,
					"Failed to send probes as the given amount needs to be at least the invoice amount: required {}msat, gave {}msat.", invoice_amount_msat, amount_msat);
				return Err(Error::InvalidAmount);
			}

			payment::payment_parameters_from_invoice(&invoice).map_err(|_| {
				log_error!(self.logger, "Failed to send probes due to the given invoice unexpectedly being \"zero-amount\".");
				Error::InvalidInvoice
			})?
		} else {
			payment::payment_parameters_from_zero_amount_invoice(&invoice, amount_msat).map_err(|_| {
				log_error!(self.logger, "Failed to send probes due to the given invoice unexpectedly being not \"zero-amount\".");
				Error::InvalidInvoice
			})?
		};

		let liquidity_limit_multiplier = Some(self.config.probing_liquidity_limit_multiplier);

		self.channel_manager
			.send_preflight_probes(route_params, liquidity_limit_multiplier)
			.map_err(|e| {
				log_error!(self.logger, "Failed to send payment probes: {:?}", e);
				Error::ProbeSendingFailed
			})?;

		Ok(())
	}
}
