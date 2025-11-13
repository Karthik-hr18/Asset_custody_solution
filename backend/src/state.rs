// src/state.rs
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Proposal {
    pub id: Uuid,
    pub proposer: String,
    pub destination: String,
    pub asset_code: String,
    pub amount: String,
    pub xdr_unsigned: Option<String>,
    pub signatures: Vec<String>,
    pub status: String, // pending | ready_to_submit | submitted | completed
}

#[derive(Clone, Default)]
pub struct AppState {
    pub proposals: Arc<RwLock<Vec<Proposal>>>,
    pub horizon_url: String,
}

impl AppState {
    pub async fn new() -> Self {
        let horizon_url = std::env::var("HORIZON_URL")
            .unwrap_or_else(|_| "https://horizon-testnet.stellar.org".into());

        AppState {
            proposals: Arc::new(RwLock::new(Vec::new())),
            horizon_url,
        }
    }
}
