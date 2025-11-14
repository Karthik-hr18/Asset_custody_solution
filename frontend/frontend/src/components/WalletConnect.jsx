// frontend/src/components/WalletConnect.jsx
import React, { useEffect, useState } from "react";
import {
  connectFreighter,
  getBalance,
  isFreighterInstalled,
  isAdminWallet,
} from "../utils/stellar";

export default function WalletConnect({ onWalletConnected }) {
  const [status, setStatus] = useState("checking"); 
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
      alert("❌ Freighter Wallet not detected.\nInstall it from https://freighter.app/");
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
      alert("❌ Freighter connection failed:\n" + err.message);
      setStatus("error");
    }
  };

  // -------------------------------------------------------
  // Auto-connect Freighter on page load
  // -------------------------------------------------------
  useEffect(() => {
    const autoConnect = async () => {
      if (!isFreighterInstalled()) {
        setStatus("disconnected");
        return;
      }

      try {
        const pk = await window.freighterApi
          ?.getPublicKey()
          ?.catch(() => null);

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

    autoConnect();
  }, []);

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

          <button
            onClick={connectWallet}
            className="bg-gray-200 text-sm px-3 py-1 rounded hover:bg-gray-300 transition mt-3"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Disconnected */}
      {status === "disconnected" && (
        <div>
          <p className="text-red-500 font-medium mb-2">
            ❌ Wallet not connected
          </p>

          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Connect Freighter
          </button>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div>
          <p className="text-red-500 font-medium mb-2">
            ❌ Freighter connection error
          </p>

          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
