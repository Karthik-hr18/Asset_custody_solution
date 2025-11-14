/**
 * Stellar Utility Module 
 * ---------------------------------------
 * - Detect Freighter
 * - Connect wallet
 * - Check admin
 * - Fetch balance
 * - Build XDR (backend)
 * - Sign XDR (Freighter)
 * - Submit signed XDR (backend)
 */

import * as StellarSdk from "stellar-sdk";

// --------------------------------------------------------------
// FREIGHTER CHECK
// --------------------------------------------------------------
export function isFreighterInstalled() {
  return (
    typeof window !== "undefined" &&
    typeof window.freighterApi !== "undefined" &&
    typeof window.freighterApi.getPublicKey === "function"
  );
}

// --------------------------------------------------------------
// CONNECT FREIGHTER → GET PUBLIC KEY
// --------------------------------------------------------------
export async function connectFreighter() {
  if (!isFreighterInstalled()) {
    throw new Error("❌ Freighter wallet not installed.");
  }

  try {
    const publicKey = await window.freighterApi.getPublicKey();

    if (!publicKey) {
      throw new Error("Freighter returned no public key. Unlock Freighter and try again.");
    }

    console.log("🔐 Freighter connected:", publicKey);
    return publicKey;
  } catch (err) {
    console.error("Freighter connect error:", err);
    throw new Error("⚠️ Could not connect to Freighter.");
  }
}

// --------------------------------------------------------------
// ADMIN CHECK
// --------------------------------------------------------------
export function isAdminWallet(publicKey) {
  const admin = import.meta.env.VITE_DEPLOYER_ID; // from .env

  if (!admin) {
    console.warn("⚠️ Admin wallet not configured in .env");
    return false;
  }

  return admin.trim() === publicKey.trim();
}

// --------------------------------------------------------------
// STELLAR NETWORK
// --------------------------------------------------------------
const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// --------------------------------------------------------------
// FETCH NATIVE BALANCE
// --------------------------------------------------------------
export async function getBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);

    const native = account.balances.find((b) => b.asset_type === "native");

    return native ? parseFloat(native.balance).toFixed(2) : "0.00";
  } catch (err) {
    console.error("Balance fetch failed:", err);
    return "0.00";
  }
}

// --------------------------------------------------------------
// REQUEST UNSIGNED XDR FROM BACKEND
// --------------------------------------------------------------
export async function requestUnsignedXDR(fnName, params) {
  try {
    const res = await fetch("http://127.0.0.1:8000/build_tx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ function: fnName, params }),
    });

    const body = await res.json();

    if (!body.ok) {
      throw new Error(body.error || "Backend failed to build XDR");
    }

    console.log("📦 Unsigned XDR from backend:", body.xdr);
    return body.xdr;
  } catch (err) {
    console.error("Unsigned XDR error:", err);
    throw new Error("Failed to get unsigned XDR from server.");
  }
}

// --------------------------------------------------------------
// SIGN XDR USING FREIGHTER
// --------------------------------------------------------------
export async function signXDRWithFreighter(xdrString) {
  if (!isFreighterInstalled()) {
    throw new Error("Freighter wallet not installed.");
  }

  try {
    const signedXdr = await window.freighterApi.signTransaction(
      xdrString,
      NETWORK_PASSPHRASE
    );

    if (!signedXdr) {
      throw new Error("Freighter failed to sign.");
    }

    console.log("🖊 Signed XDR:", signedXdr);
    return signedXdr;
  } catch (err) {
    console.error("❌ Freighter signing error:", err);
    throw new Error("Signing was rejected or failed.");
  }
}

// --------------------------------------------------------------
// SUBMIT SIGNED XDR TO BACKEND
// --------------------------------------------------------------
export async function submitSignedXDR(signedXdr) {
  try {
    const res = await fetch("http://127.0.0.1:8000/submit_tx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signed_xdr: signedXdr }),
    });

    const body = await res.json();

    if (!body.ok) {
      throw new Error(body.error || "Submit TX failed.");
    }

    console.log("🚀 Transaction submitted. Hash:", body.tx_hash);
    return body.tx_hash;
  } catch (err) {
    console.error("Submit TX error:", err);
    throw new Error("Failed to submit signed transaction.");
  }
}
