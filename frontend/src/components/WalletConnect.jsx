// frontend/src/components/WalletConnect.jsx
import React, { useEffect, useState } from "react";
import {
  connectFreighter,
  getBalance,
  isFreighterInstalled,
  isAdminWallet,
} from "../utils/stellar";

export default function WalletConnect({ onWalletConnected }) {
  const [status, setStatus] = useState("checking"); // checking | disconnected | connected | error
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------------------------------------------
  // Load Account Balance
  // -------------------------------------------------------
  const loadBalance = async (pk) => {
    try {
      const bal = await getBalance(pk);
      setBalance(bal);
    } catch (err) {
      console.error("Balance fetch error:", err);
      setBalance("0.00");
    }
  };

  // -------------------------------------------------------
  // Connect Freighter
  // -------------------------------------------------------
  const connectWallet = async () => {
    setStatus("checking");

    if (!isFreighterInstalled()) {
      setStatus("error");
      alert(
        "❌ Freighter Wallet not detected.\nInstall it from https://freighter.app/ and open this app at http://localhost:5173"
      );
      return;
    }

    try {
      const pk = await connectFreighter();

      if (!pk) {
        setStatus("error");
        alert("❌ Freighter returned no publicKey. Unlock Freighter and try again.");
        return;
      }

      setPublicKey(pk);
      setIsAdmin(isAdminWallet(pk));
      setStatus("connected");

      await loadBalance(pk);

      if (onWalletConnected) onWalletConnected(pk);
    } catch (err) {
      console.error("Freighter connection failed:", err);
      // nicer error handling for user
      const msg = err && err.message ? err.message : String(err);
      alert("❌ Freighter connection failed:\n" + msg);
      setStatus("error");
    }
  };

  // -------------------------------------------------------
  // Auto-connect Freighter on page load
  // -------------------------------------------------------
  useEffect(() => {
    // We check after load to give the extension time to inject
    const autoConnect = async () => {
      // Quick host check: Freighter injects reliably on http://localhost
      // If you're using an IP or non-localhost host, warn the user.
      const host = window.location.hostname;
      if (host !== "localhost" && host !== "127.0.0.1") {
        // Still allow manual connect, but auto-check will be disabled
        setStatus("disconnected");
        return;
      }

      // If not installed, set to disconnected (not error) so UI shows 'Connect' button
      if (!isFreighterInstalled()) {
        setStatus("disconnected");
        return;
      }

      // Defer slightly so extension has time to inject
      await new Promise((r) => setTimeout(r, 300));

      try {
        // Try to get public key (may throw if locked)
        const pk = await (window.freighterApi && window.freighterApi.getPublicKey
          ? window.freighterApi.getPublicKey().catch(() => null)
          : null);

        if (pk) {
          console.log("🔄 Auto-connected to Freighter:", pk);
          setPublicKey(pk);
          setIsAdmin(isAdminWallet(pk));
          setStatus("connected");
          await loadBalance(pk);
          if (onWalletConnected) onWalletConnected(pk);
        } else {
          setStatus("disconnected");
        }
      } catch (err) {
        console.warn("Auto-connect failed:", err);
        setStatus("disconnected");
      }
    };

    // run on mount
    autoConnect();
  }, [onWalletConnected]);

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="p-5 bg-white rounded-2xl shadow border border-gray-100 w-full max-w-md">
      {/* Checking */}
      {status === "checking" && (
        <p className="text-slate-500 text-sm">🔄 Checking Freighter...</p>
      )}

      {/* Connected */}
      {status === "connected" && (
        <div>
          <p className="text-green-600 font-semibold">✅ Freighter Connected</p>

          {isAdmin ? (
            <p className="text-xs text-orange-600 font-bold mt-1">👑 Admin Account</p>
          ) : (
            <p className="text-xs text-blue-600 font-bold mt-1">🙋 User Account</p>
          )}

          <p className="text-xs text-slate-500 break-all mt-2">{publicKey}</p>

          <p className="text-xs text-slate-400 mt-1">
            Balance: {balance ? `${balance} XLM` : "Loading..."}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={connectWallet}
              className="bg-gray-200 text-sm px-3 py-1 rounded hover:bg-gray-300 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Disconnected */}
      {status === "disconnected" && (
        <div>
          <p className="text-red-500 font-medium mb-2">❌ Wallet not connected</p>

          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Connect Freighter
          </button>

          <p className="text-xs text-slate-400 mt-2">
            Ensure you run the app at <code>http://localhost:5173</code> and have the Freighter extension installed.
          </p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div>
          <p className="text-red-500 font-medium mb-2">❌ Freighter connection error</p>

          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>

          <p className="text-xs text-slate-400 mt-2">
            If problems persist, open the Freighter extension and unlock your wallet, then retry.
          </p>
        </div>
      )}
    </div>
  );
}
