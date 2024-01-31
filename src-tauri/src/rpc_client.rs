use crate::walletrpc::wallet_rpc_service_client::WalletRpcServiceClient;
use crate::walletrpc::{
    CloseChannelRequest, ConnectToPeerRequest, CreateInvoiceReply, CreateInvoiceRequest,
    DisconnectPeerRequest, GeneralNodeNameRequest, GeneralSuccessReply, GetNodeIdReply,
    GetOnChainAddressReply, GetOnChainBalanceReply, ListChannelsReply, ListPeersReply,
    OpenChannelRequest, PayInvoiceRequest, StartNodeReply, GetEsploraAddressReply, GetNetAddressReply
};

pub mod walletrpc {
    tonic::include_proto!("walletrpc");
}

pub async fn start_node(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<StartNodeReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let req = tonic::Request::new(req);
    let response = client.start_node(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn stop_node(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let req = tonic::Request::new(req);
    let response = client.stop_node(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn is_node_running(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.is_node_running(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn get_node_id(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GetNodeIdReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.get_node_id(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn get_esplora_address(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GetEsploraAddressReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.get_esplora_address(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn get_net_address(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GetNetAddressReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.get_net_address(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn connect_to_peer(
    req: ConnectToPeerRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.connect_to_peer(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn disconnect_peer(
    req: DisconnectPeerRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.disconnect_peer(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn list_peers(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<ListPeersReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.list_peers(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn open_channel(
    req: OpenChannelRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.open_channel(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn close_channel(
    req: CloseChannelRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.close_channel(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn list_channels(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<ListChannelsReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.list_channels(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn get_on_chain_address(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GetOnChainAddressReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.get_on_chain_address(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn get_on_chain_balance(
    req: GeneralNodeNameRequest,
) -> Result<tonic::Response<GetOnChainBalanceReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.get_on_chain_balance(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn pay_invoice(
    req: PayInvoiceRequest,
) -> Result<tonic::Response<GeneralSuccessReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.pay_invoice(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

pub async fn create_invoice(
    req: CreateInvoiceRequest,
) -> Result<tonic::Response<CreateInvoiceReply>, Box<dyn std::error::Error>> {
    let mut client = WalletRpcServiceClient::connect("http://[::1]:50051").await?;
    let response = client.create_invoice(req).await?;

    println!("RESPONSE={:?}", response);
    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
}
