/**
 * frontend/src/utils/stellar.js
 *
 * Stellar utility helpers for Bulwark Custody (Freighter + Backend relay)
 *
 * - Detect Freighter
 * - Connect wallet (get public key)
 * - Check admin
 * - Fetch balance (Horizon)
 * - Request unsigned XDR from backend
 * - Sign XDR with Freighter
 * - Submit signed XDR to backend
 *
 * Notes:
 *  - Ensure you run the frontend at http://localhost:5173 (Freighter injects reliably on localhost).
 *  - Set these env vars in frontend/.env (Vite): VITE_BACKEND_URL, VITE_HORIZON_URL, VITE_NETWORK
 */

import * as StellarSdk from "stellar-sdk";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
// VITE_NETWORK should be "TESTNET" or "FUTURENET" or a full passphrase string
const NETWORK_ENV = import.meta.env.VITE_NETWORK || "TESTNET";

export const NETWORK_PASSPHRASE =
  NETWORK_ENV === "FUTURENET"
    ? "Test SDF Future Network ; October 2022" // replace with actual futurenet passphrase if different
    : StellarSdk.Networks.TESTNET;

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

/* -------------------------
   Freighter detection
   ------------------------- */
export function isFreighterInstalled() {
  return (
    typeof window !== "undefined" &&
    !!window.freighterApi &&
    typeof window.freighterApi.getPublicKey === "function"
  );
}

/* -------------------------
   Connect: get public key
   ------------------------- */
export async function connectFreighter() {
  if (!isFreighterInstalled()) {
    throw new Error("Freighter not installed (window.freighterApi missing).");
  }

  try {
    // getPublicKey may throw if the wallet is locked
    const publicKey = await window.freighterApi.getPublicKey();
    if (!publicKey) {
      throw new Error("Freighter returned no public key (wallet locked?).");
    }
    console.debug("Freighter publicKey:", publicKey);
    return publicKey;
  } catch (err) {
    // bubble up the original error message if present
    const msg = err?.message || String(err);
    throw new Error(`Failed to connect Freighter: ${msg}`);
  }
}

/* -------------------------
   Admin check
   ------------------------- */
export function isAdminWallet(publicKey) {
  const admin = import.meta.env.VITE_DEPLOYER_ID || "";
  if (!admin) {
    // graceful fallback in dev
    return false;
  }
  return admin.trim() === (publicKey || "").trim();
}

/* -------------------------
   Fetch native XLM balance
   ------------------------- */
export async function getBalance(publicKey) {
  if (!publicKey) return "0.00";

  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? parseFloat(native.balance).toFixed(7) : "0.00";
  } catch (err) {
    console.warn("getBalance failed:", err?.message || err);
    // Could be account not found; return 0.00
    return "0.00";
  }
}

/* -------------------------
   Request unsigned XDR from backend
   - backend should return { ok: true, xdr: "<unsigned_xdr>" }
   - or { ok: false, error: "reason" }
   ------------------------- */
export async function requestUnsignedXDR(fnName, params = {}) {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/build_tx`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // include function name and params in a small predictable wrapper
      body: JSON.stringify({ function: fnName, params }),
      credentials: "omit",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Backend build_tx HTTP ${res.status}: ${txt}`);
    }

    const body = await res.json();
    if (!body || body.ok !== true || !body.xdr) {
      throw new Error(body?.error || "Backend did not return an unsigned XDR");
    }

    return body.xdr;
  } catch (err) {
    console.error("requestUnsignedXDR error:", err);
    throw err;
  }
}

/* -------------------------
   Sign XDR using Freighter
   - Some Freighter versions accept (xdr, networkPassphrase)
   - Some accept an options object { xdr, networkPassphrase }
   - We'll try both forms.
   ------------------------- */
export async function signXDRWithFreighter(xdrString) {
  if (!isFreighterInstalled()) {
    throw new Error("Freighter not installed.");
  }

  // defensive: ensure xdrString exists
  if (!xdrString || typeof xdrString !== "string") {
    throw new Error("Invalid XDR provided to signXDRWithFreighter.");
  }

  try {
    // Modern Freighter exposes signTransaction(xdr, networkPassphrase)
    if (typeof window.freighterApi.signTransaction === "function") {
      // try primitive form first
      try {
        const signed = await window.freighterApi.signTransaction(
          xdrString,
          NETWORK_PASSPHRASE
        );
        // signed may be an XDR string or object depending on version
        return signed;
      } catch (e) {
        // attempt object-style call if primitive fails
        const signed2 = await window.freighterApi.signTransaction({
          xdr: xdrString,
          networkPassphrase: NETWORK_PASSPHRASE,
        });
        return signed2;
      }
    }

    // Some older versions use signTransactionXDR or similar — try fallback names
    if (typeof window.freighterApi.signTransactionXDR === "function") {
      return await window.freighterApi.signTransactionXDR(xdrString);
    }

    throw new Error("Freighter does not expose a signTransaction API in this environment.");
  } catch (err) {
    console.error("Freighter signing failed:", err?.message || err);
    throw new Error("Freighter failed to sign XDR (user rejected or locked).");
  }
}

/* -------------------------
   Submit signed XDR to backend (relay)
   - backend expects { signed_xdr: "<signed_xdr>" }
   - returns { ok: true, tx_hash } on success
   ------------------------- */
export async function submitSignedXDR(signedXdr) {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/submit_tx`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signed_xdr: signedXdr }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Submit TX HTTP ${res.status}: ${txt}`);
    }

    const body = await res.json();
    if (!body || body.ok !== true) {
      throw new Error(body?.error || "Backend failed to submit signed transaction.");
    }

    return body.tx_hash;
  } catch (err) {
    console.error("submitSignedXDR error:", err?.message || err);
    throw err;
  }
}
