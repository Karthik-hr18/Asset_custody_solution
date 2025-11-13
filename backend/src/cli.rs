// src/cli.rs
use anyhow::{anyhow, Result};
use std::env;
use tokio::process::Command;

/// Run a CLI command and return (stdout, stderr) as Strings.
pub async fn run_cli<I, S>(args: I) -> Result<(String, String)>
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let cli = env::var("SOROBAN_CLI").unwrap_or_else(|_| "stellar".into());

    let mut cmd = Command::new(cli);
    for a in args {
        cmd.arg(a.as_ref());
    }

    let output = cmd.output().await.map_err(|e| {
        anyhow!(
            "failed to spawn CLI process (ensure stellar CLI is installed and SOROBAN_CLI points to it): {}",
            e
        )
    })?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() {
        return Err(anyhow!(
            "CLI returned non-zero exit code.\nstdout:\n{}\nstderr:\n{}",
            stdout,
            stderr
        ));
    }

    Ok((stdout, stderr))
}
