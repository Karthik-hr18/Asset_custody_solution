// src/router.rs
use axum::{
    extract::{Json, Path, State},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::state::{AppState, Proposal};
use crate::soroban_runner::{build_xdr, submit_xdr};
use std::sync::Arc;

/// Build the top-level router with application state attached
pub fn app_router(state: AppState) -> Router {
    Router::new()
        .route("/", get(root))
        .route("/propose", post(create_proposal))
        .route("/proposals", get(list_proposals))
        .route("/proposals/:id/sign", post(sign_proposal))
        .route("/build_tx", post(build_tx))
        .route("/submit_tx", post(submit_tx))
        .route("/withdraw_execute/:id", post(execute_withdraw))
        .with_state(state)
}

async fn root() -> &'static str {
    "✅ Asset Custody Backend"
}

#[derive(Deserialize)]
pub struct CreateReq {
    proposer: String,
    destination: String,
    asset_code: String,
    amount: String,
    xdr_unsigned: Option<String>,
}

#[derive(Serialize)]
struct CreateRes {
    id: String,
}

/// Create a proposal
async fn create_proposal(
    State(state): State<AppState>,
    Json(payload): Json<CreateReq>,
) -> Json<CreateRes> {
    let p = Proposal {
        id: Uuid::new_v4(),
        proposer: payload.proposer,
        destination: payload.destination,
        asset_code: payload.asset_code,
        amount: payload.amount,
        xdr_unsigned: payload.xdr_unsigned,
        signatures: vec![],
        status: "pending".into(),
    };

    let id = p.id;
    state.proposals.write().await.push(p);
    println!("📝 New proposal {}", id);
    Json(CreateRes { id: id.to_string() })
}

/// List all proposals
async fn list_proposals(State(state): State<AppState>) -> Json<Vec<Proposal>> {
    let v = state.proposals.read().await.clone();
    Json(v)
}

#[derive(Deserialize)]
pub struct SignReq {
    pub key: String,
    pub signature: String,
}

/// Add a signature to a proposal
async fn sign_proposal(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<SignReq>,
) -> Json<Option<Proposal>> {
    let mut store = state.proposals.write().await;
    if let Some(p) = store.iter_mut().find(|p| p.id.to_string() == id) {
        if !p.signatures.contains(&payload.signature) {
            p.signatures.push(payload.signature.clone());
        }
        // If required signatures >= 2 (or maybe the contract has different threshold),
        // mark ready_to_submit when 2 signatures reached
        if p.signatures.len() >= 2 {
            p.status = "ready_to_submit".into();
        }
        println!("🖊 Proposal {} signed by {}", id, payload.key);
        return Json(Some(p.clone()));
    }
    Json(None)
}

/// Build unsigned XDR for an arbitrary function (used by frontend to get XDR and sign in Freighter)
#[derive(Deserialize)]
struct BuildTxReq {
    function: String,
    params: serde_json::Value,
}

#[derive(Serialize)]
struct BuildTxRes {
    ok: bool,
    xdr: Option<String>,
    error: Option<String>,
}

async fn build_tx(
    State(_state): State<AppState>,
    Json(req): Json<BuildTxReq>,
) -> Json<BuildTxRes> {
    // Read env
    let contract_id = std::env::var("ASSET_CONTRACT_ID").unwrap_or_default();
    let source = std::env::var("DEPLOYER_ID").unwrap_or_default();
    let rpc = std::env::var("RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".into());
    let network = std::env::var("NETWORK_PASSPHRASE").unwrap_or_else(|_| "Test SDF Network ; September 2015".into());

    if contract_id.is_empty() || source.is_empty() {
        return Json(BuildTxRes {
            ok: false,
            xdr: None,
            error: Some("ASSET_CONTRACT_ID or DEPLOYER_ID not set".into()),
        });
    }

    // Build arg list as &str slices: ["--owner", "G...", "--amount", "10"]
    let mut arg_vec: Vec<String> = vec![];
    if let Some(map) = req.params.as_object() {
        for (k, v) in map {
            arg_vec.push(format!("--{}", k));
            // remove quotes if value serialized with ""
            let mut s = v.to_string();
            if s.starts_with('"') && s.ends_with('"') {
                s = s.trim_matches('"').to_string();
            }
            arg_vec.push(s);
        }
    }

    let arg_slices: Vec<&str> = arg_vec.iter().map(|s| s.as_str()).collect();

    match build_xdr(&contract_id, &source, &rpc, &network, &req.function, &arg_slices).await {
        Ok(xdr) => Json(BuildTxRes { ok: true, xdr: Some(xdr), error: None }),
        Err(e) => Json(BuildTxRes { ok: false, xdr: None, error: Some(format!("{}", e)) }),
    }
}

/// Submit a signed XDR to network (backend passes to CLI)
#[derive(Deserialize)]
struct SubmitReq {
    signed_xdr: String,
}

#[derive(Serialize)]
struct SubmitRes {
    ok: bool,
    tx_hash: Option<String>,
    error: Option<String>,
}

async fn submit_tx(
    State(state): State<AppState>,
    Json(req): Json<SubmitReq>,
) -> Json<SubmitRes> {
    let rpc = std::env::var("RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".into());

    match submit_xdr(&rpc, req.signed_xdr.trim()).await {
        Ok(out) => Json(SubmitRes { ok: true, tx_hash: Some(out), error: None }),
        Err(e) => Json(SubmitRes { ok: false, tx_hash: None, error: Some(format!("{}", e)) }),
    }
}

/// When a proposal has reached "ready_to_submit", build the withdraw XDR for that proposal.
/// This returns the unsigned XDR to be signed by the required parties.
/// It does NOT automatically submit (frontend should sign and call /submit_tx).
async fn execute_withdraw(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Json<BuildTxRes> {
    // find proposal
    let store = state.proposals.read().await;
    let maybe = store.iter().find(|p| p.id.to_string() == id).cloned();
    drop(store);

    let p = match maybe {
        Some(p) => p,
        None => return Json(BuildTxRes { ok: false, xdr: None, error: Some("proposal not found".into()) }),
    };

    if p.status != "ready_to_submit" {
        return Json(BuildTxRes { ok: false, xdr: None, error: Some("proposal not ready to submit".into()) });
    }

    // Build withdraw XDR:
    let contract_id = std::env::var("ASSET_CONTRACT_ID").unwrap_or_default();
    let source = std::env::var("DEPLOYER_ID").unwrap_or_default();
    let rpc = std::env::var("RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".into());
    let network = std::env::var("NETWORK_PASSPHRASE").unwrap_or_else(|_| "Test SDF Network ; September 2015".into());

    let args_vec = vec![
        "--owner".to_string(),
        p.destination.clone(), // owner = custody account owner
        "--amount".to_string(),
        p.amount.clone(),
        "--signatures_count".to_string(),
        p.signatures.len().to_string(),
    ];
    let args_slices: Vec<&str> = args_vec.iter().map(|s| s.as_str()).collect();

    match build_xdr(&contract_id, &source, &rpc, &network, "withdraw_assets", &args_slices).await {
        Ok(xdr) => Json(BuildTxRes { ok: true, xdr: Some(xdr), error: None }),
        Err(e) => Json(BuildTxRes { ok: false, xdr: None, error: Some(format!("{}", e)) }),
    }
}
