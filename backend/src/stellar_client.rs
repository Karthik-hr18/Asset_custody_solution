// src/stellar_client.rs
use anyhow::Result;
use serde_json::Value;
use reqwest::Client;

pub async fn submit_transaction(horizon_url: &str, signed_envelope_xdr: &str) -> Result<Value> {
    let client = Client::new();
    let res = client
        .post(format!("{}/transactions", horizon_url))
        .form(&[("tx", signed_envelope_xdr)])
        .send()
        .await?;
    let status = res.status();
    let text = res.text().await?;
    if !status.is_success() {
        return Err(anyhow::anyhow!("Horizon returned {}: {}", status.as_u16(), text));
    }
    let json: Value = serde_json::from_str(&text)?;
    Ok(json)
}

pub async fn get_account_balance(horizon_url: &str, account_id: &str) -> Result<String> {
    let client = Client::new();
    let res = client.get(format!("{}/accounts/{}", horizon_url, account_id)).send().await?;
    if !res.status().is_success() {
        return Err(anyhow::anyhow!("Account not found"));
    }
    let json: Value = res.json().await?;
    let balances = json["balances"].as_array().ok_or_else(|| anyhow::anyhow!("Malformed"))?;
    for b in balances {
        if b["asset_type"] == "native" {
            if let Some(bal) = b["balance"].as_str() {
                return Ok(bal.to_string());
            }
        }
    }
    Err(anyhow::anyhow!("No native balance"))
}
