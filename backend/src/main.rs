use axum::{
    extract::{Json, Path},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use axum::response::Json as AxumJson;
use dotenvy::dotenv;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{env, net::SocketAddr};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

mod cli;
use cli::run_cli;

#[derive(Deserialize)]
struct BuildTxReq {
    function: String,
    params: serde_json::Value,
}

#[derive(Deserialize)]
struct SubmitTxReq {
    signed_xdr: String,
}

async fn health() -> &'static str {
    "✅ Backend running"
}

/// Build unsigned XDR
async fn build_tx(Json(req): Json<BuildTxReq>) -> impl IntoResponse {
    tracing::info!("Building XDR for fn {}", req.function);

    let contract_id = env::var("ASSET_CONTRACT_ID").unwrap_or_default();
    let source = env::var("DEPLOYER_ID").unwrap_or_default();
    let rpc = env::var("RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".into());
    let network = env::var("NETWORK_PASSPHRASE").unwrap_or_else(|_| "Test SDF Network ; September 2015".into());

    if contract_id.is_empty() || source.is_empty() {
        return AxumJson(json!({ "ok": false, "error": "Missing env vars" }));
    }

    let mut args_vec: Vec<String> = vec![
        "contract".to_string(),
        "invoke".to_string(),
        "--id".to_string(),
        contract_id,
        "--source-account".to_string(),
        source,
        "--rpc-url".to_string(),
        rpc,
        "--network-passphrase".to_string(),
        network,
        "--send=no".to_string(),
        "--build-only".to_string(),
        "--".to_string(),
        req.function.clone(),
    ];

    if let Some(map) = req.params.as_object() {
        for (k, v) in map {
            args_vec.push(format!("--{}", k));

            let mut vs = v.to_string();
            if vs.starts_with('"') && vs.ends_with('"') {
                vs = vs.trim_matches('"').to_string();
            }
            args_vec.push(vs);
        }
    }

    let args_ref: Vec<&str> = args_vec.iter().map(|s| s.as_str()).collect();
    tracing::info!("CLI args: {:?}", args_ref);

    match run_cli(&args_ref).await {
        Ok((stdout, stderr)) => {
            if !stderr.trim().is_empty() {
                tracing::warn!("stderr: {}", stderr);
            }
            AxumJson(json!({ "ok": true, "xdr": stdout.trim() }))
        }
        Err(e) => AxumJson(json!({ "ok": false, "error": format!("{}", e) })),
    }
}

/// Submit signed XDR to network
async fn submit_tx(Json(req): Json<SubmitTxReq>) -> impl IntoResponse {
    let rpc = env::var("RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".into());

    let args = vec![
        "tx", "send",
        "--rpc-url", &rpc,
        "--xdr", &req.signed_xdr,
    ];

    let args_ref: Vec<&str> = args.iter().map(|s| *s).collect();

    match run_cli(&args_ref).await {
        Ok((stdout, stderr)) => {
            if !stderr.trim().is_empty() {
                tracing::warn!("stderr: {}", stderr);
            }
            AxumJson(json!({ "ok": true, "tx_hash": stdout.trim() }))
        }
        Err(e) => AxumJson(json!({ "ok": false, "error": format!("{}", e) })),
    }
}

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    println!("🛠 Using CLI: {}", env::var("SOROBAN_CLI").unwrap_or("stellar".into()));

    let port = env::var("PORT").unwrap_or_else(|_| "8000".into());
    let addr: SocketAddr = format!("127.0.0.1:{}", port).parse().unwrap();

    let cors = CorsLayer::new()
        .allow_methods([axum::http::Method::GET, axum::http::Method::POST])
        .allow_origin(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/build_tx", post(build_tx))
        .route("/submit_tx", post(submit_tx))
        .layer(cors);

    println!("🚀 Backend running at http://{}", addr);

    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
