//! Holds a payment handler allowing to create and pay [BOLT 12] offers and refunds.
//!
//! [BOLT 12]: https://github.com/lightning/bolts/blob/master/12-offer-encoding.md

use crate::config::LDK_PAYMENT_RETRY_TIMEOUT;
use crate::error::Error;
use crate::logger::{log_error, log_info, FilesystemLogger, Logger};
use crate::payment::payment_store::{
	PaymentDetails, PaymentDirection, PaymentKind, PaymentStatus, PaymentStore,
};
use crate::types::ChannelManager;

use lightning::ln::channelmanager::{PaymentId, Retry};
use lightning::offers::offer::{Amount, Offer};
use lightning::offers::parse::Bolt12SemanticError;

use rand::RngCore;

use std::sync::{Arc, RwLock};

/// A payment handler allowing to create and pay [BOLT 12] offers and refunds.
///
/// Should be retrieved by calling [`Node::bolt12_payment`].
///
/// [BOLT 12]: https://github.com/lightning/bolts/blob/master/12-offer-encoding.md
/// [`Node::bolt12_payment`]: crate::Node::bolt12_payment
pub struct Bolt12Payment {
	runtime: Arc<RwLock<Option<tokio::runtime::Runtime>>>,
	channel_manager: Arc<ChannelManager>,
	payment_store: Arc<PaymentStore<Arc<FilesystemLogger>>>,
	logger: Arc<FilesystemLogger>,
}

impl Bolt12Payment {
	pub(crate) fn new(
		runtime: Arc<RwLock<Option<tokio::runtime::Runtime>>>,
		channel_manager: Arc<ChannelManager>,
		payment_store: Arc<PaymentStore<Arc<FilesystemLogger>>>, logger: Arc<FilesystemLogger>,
	) -> Self {
		Self { runtime, channel_manager, payment_store, logger }
	}

	/// Send a payment given an offer.
	///
	/// If `payer_note` is `Some` it will be seen by the recipient and reflected back in the invoice
	/// response.
	pub fn send(&self, offer: &Offer, payer_note: Option<String>) -> Result<PaymentId, Error> {
		let rt_lock = self.runtime.read().unwrap();
		if rt_lock.is_none() {
			return Err(Error::NotRunning);
		}

		let quantity = None;
		let amount_msats = None;
		let mut random_bytes = [0u8; 32];
		rand::thread_rng().fill_bytes(&mut random_bytes);
		let payment_id = PaymentId(random_bytes);
		let retry_strategy = Retry::Timeout(LDK_PAYMENT_RETRY_TIMEOUT);
		let max_total_routing_fee_msat = None;

		let offer_amount_msat = match offer.amount() {
			Some(Amount::Bitcoin { amount_msats }) => amount_msats,
			Some(_) => {
				log_error!(self.logger, "Failed to send payment as the provided offer was denominated in an unsupported currency.");
				return Err(Error::UnsupportedCurrency);
			},
			None => {
				log_error!(self.logger, "Failed to send payment due to the given offer being \"zero-amount\". Please use send_using_amount instead.");
				return Err(Error::InvalidOffer);
			},
		};

		match self.channel_manager.pay_for_offer(
			&offer,
			quantity,
			amount_msats,
			payer_note.clone(),
			payment_id,
			retry_strategy,
			max_total_routing_fee_msat,
		) {
			Ok(()) => {
				let payee_pubkey = offer.signing_pubkey();
				log_info!(
					self.logger,
					"Initiated sending {:?} to {}",
					offer_amount_msat,
					payee_pubkey
				);

				let kind = PaymentKind::Bolt12 { hash: None, preimage: None, secret: None, description: None };
				let payment = PaymentDetails {
					id: payment_id,
					kind,
					amount_msat: Some(*offer_amount_msat),
					direction: PaymentDirection::Outbound,
					status: PaymentStatus::Pending,
                    user_token: payer_note.unwrap()
				};
				self.payment_store.insert(payment)?;

				Ok(payment_id)
			},
			Err(e) => {
				log_error!(self.logger, "Failed to send payment: {:?}", e);
				match e {
					Bolt12SemanticError::DuplicatePaymentId => Err(Error::DuplicatePayment),
					_ => {
						let kind = PaymentKind::Bolt12 { hash: None, preimage: None, secret: None , description: None};
						let payment = PaymentDetails {
							id: payment_id,
							kind,
							amount_msat: Some(*offer_amount_msat),
							direction: PaymentDirection::Outbound,
							status: PaymentStatus::Failed,
                            user_token: payer_note.unwrap()
						};
						self.payment_store.insert(payment)?;
						Err(Error::PaymentSendingFailed)
					},
				}
			},
		}
	}

	/// Send a payment given an offer and an amount in millisatoshi.
	///
	/// This will fail if the amount given is less than the value required by the given offer.
	///
	/// This can be used to pay a so-called "zero-amount" offers, i.e., an offer that leaves the
	/// amount paid to be determined by the user.
	///
	/// If `payer_note` is `Some` it will be seen by the recipient and reflected back in the invoice
	/// response.
	pub fn send_using_amount(
		&self, offer: &Offer, payer_note: Option<String>, amount_msat: u64,
	) -> Result<PaymentId, Error> {
		let rt_lock = self.runtime.read().unwrap();
		if rt_lock.is_none() {
			return Err(Error::NotRunning);
		}

		let quantity = None;
		let amount_msats = None;
		let mut random_bytes = [0u8; 32];
		rand::thread_rng().fill_bytes(&mut random_bytes);
		let payment_id = PaymentId(random_bytes);
		let retry_strategy = Retry::Timeout(LDK_PAYMENT_RETRY_TIMEOUT);
		let max_total_routing_fee_msat = None;

		let offer_amount_msat = match offer.amount() {
			Some(Amount::Bitcoin { amount_msats }) => *amount_msats,
			Some(_) => {
				log_error!(self.logger, "Failed to send payment as the provided offer was denominated in an unsupported currency.");
				return Err(Error::UnsupportedCurrency);
			},
			None => amount_msat,
		};

		if amount_msat < offer_amount_msat {
			log_error!(
				self.logger,
				"Failed to pay as the given amount needs to be at least the offer amount: required {}msat, gave {}msat.", offer_amount_msat, amount_msat);
			return Err(Error::InvalidAmount);
		}

		match self.channel_manager.pay_for_offer(
			&offer,
			quantity,
			amount_msats,
			payer_note.clone(),
			payment_id,
			retry_strategy,
			max_total_routing_fee_msat,
		) {
			Ok(()) => {
				let payee_pubkey = offer.signing_pubkey();
				let offer_amount_msat = offer.amount();
				log_info!(
					self.logger,
					"Initiated sending {:?} to {}",
					offer_amount_msat,
					payee_pubkey
				);

				let kind = PaymentKind::Bolt12 { hash: None, preimage: None, secret: None, description: None};
				let payment = PaymentDetails {
					id: payment_id,
					kind,
					amount_msat: Some(amount_msat),
					direction: PaymentDirection::Outbound,
					status: PaymentStatus::Pending,
                    user_token: payer_note.clone().unwrap()
				};
				self.payment_store.insert(payment)?;

				Ok(payment_id)
			},
			Err(e) => {
				log_error!(self.logger, "Failed to send payment: {:?}", e);
				match e {
					Bolt12SemanticError::DuplicatePaymentId => Err(Error::DuplicatePayment),
					_ => {
						let kind = PaymentKind::Bolt12 { hash: None, preimage: None, secret: None, description: None};
						let payment = PaymentDetails {
							id: payment_id,
							kind,
							amount_msat: Some(amount_msat),
							direction: PaymentDirection::Outbound,
							status: PaymentStatus::Failed,
                            user_token: payer_note.clone().unwrap()
						};
						self.payment_store.insert(payment)?;
						Err(Error::PaymentSendingFailed)
					},
				}
			},
		}
	}

	/// Returns a payable offer that can be used to request and receive a payment of the amount
	/// given.
	pub fn receive(&self, amount_msat: u64, description: &str) -> Result<Offer, Error> {
		let offer_builder =
			self.channel_manager.create_offer_builder(description.to_string()).map_err(|e| {
				log_error!(self.logger, "Failed to create offer builder: {:?}", e);
				Error::OfferCreationFailed
			})?;
		let offer = offer_builder.amount_msats(amount_msat).build().map_err(|e| {
			log_error!(self.logger, "Failed to create offer: {:?}", e);
			Error::OfferCreationFailed
		})?;
		Ok(offer)
	}

	/// Returns a payable offer that can be used to request and receive a payment for which the
	/// amount is to be determined by the user, also known as a "zero-amount" offer.
	pub fn receive_variable_amount(&self, description: &str) -> Result<Offer, Error> {
		let offer_builder =
			self.channel_manager.create_offer_builder(description.to_string()).map_err(|e| {
				log_error!(self.logger, "Failed to create offer builder: {:?}", e);
				Error::OfferCreationFailed
			})?;
		let offer = offer_builder.build().map_err(|e| {
			log_error!(self.logger, "Failed to create offer: {:?}", e);
			Error::OfferCreationFailed
		})?;
		Ok(offer)
	}
}
