// src/soroban_runner.rs
use anyhow::Result;
use crate::cli::run_cli;

/// Build-only XDR for a contract function (does NOT send).
/// Returns the XDR string on success.
pub async fn build_xdr(
    contract_id: &str,
    source_account: &str,
    rpc_url: &str,
    network_passphrase: &str,
    fn_name: &str,
    args: &[&str],
) -> Result<String> {
    // stellar contract invoke --id <id> --source-account <src> --rpc-url <rpc> --network-passphrase <net> --send=no --build-only -- <fn> --arg value ...
    let mut vec_args: Vec<&str> = vec![
        "contract",
        "invoke",
        "--id",
        contract_id,
        "--source-account",
        source_account,
        "--rpc-url",
        rpc_url,
        "--network-passphrase",
        network_passphrase,
        "--send=no",
        "--build-only",
        "--",
        fn_name,
    ];

    // extend by function args
    for a in args {
        vec_args.push(a);
    }

    let (stdout, stderr) = run_cli(vec_args.iter().map(|s| *s)).await?;

    // CLI writes XDR to stdout (trim)
    Ok(stdout.trim().to_string())
}

/// Submit a signed XDR envelope using the stellar CLI (or Horizon client).
/// Returns CLI stdout.
pub async fn submit_xdr(rpc_url: &str, signed_xdr: &str) -> Result<String> {
    let args = vec![
        "tx",
        "send",
        "--rpc-url",
        rpc_url,
        "--xdr",
        signed_xdr,
    ];
    let (stdout, _stderr) = run_cli(args.iter().map(|s| *s)).await?;
    Ok(stdout.trim().to_string())
}
