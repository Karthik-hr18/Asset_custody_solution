// frontend/src/components/Navbar.jsx
import React from "react";

/**
 * Navigation Bar (Freighter Only)
 * -------------------------------------------------
 * - Shows brand + network
 * - Displays connected Freighter address
 * - Shows Admin badge
 * - Copy & Disconnect wallet
 */

export default function Navbar({ walletAddress, isAdmin, onDisconnect }) {
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`
    : "";

  const networkName =
    import.meta.env.VITE_NETWORK_NAME || "Testnet";

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    alert("📋 Wallet address copied!");
  };

  return (
    <nav className="w-full bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ------------------ Left Side: Branding ------------------ */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-sm">
            AC
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Asset Custody
            </h1>
            <p className="text-xs text-gray-500">
              Stellar Multi-Signature Platform
            </p>
          </div>
        </div>

        {/* ---------------- Right Side: Network + Wallet ---------------- */}
        <div className="flex items-center gap-4">

          {/* Network Badge */}
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            🌐 {networkName}
          </span>

          {/* No wallet connected */}
          {!walletAddress && (
            <span className="text-xs text-gray-500 italic">
              Freighter not connected
            </span>
          )}

          {/* Wallet connected */}
          {walletAddress && (
            <div className="flex items-center gap-2">

              {/* Admin Badge */}
              {isAdmin && (
                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold shadow-sm">
                  Admin
                </span>
              )}

              {/* Address Bubble */}
              <button
                onClick={copyAddress}
                className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-mono hover:bg-indigo-100 transition shadow-sm"
                title="Copy address"
              >
                {shortAddress}
              </button>

              {/* Disconnect Button */}
              <button
                onClick={onDisconnect}
                className="text-red-500 text-sm hover:text-red-600 font-bold"
                title="Disconnect wallet"
              >
                ⏏
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
