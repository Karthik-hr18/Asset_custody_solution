// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WalletConnect from "./components/WalletConnect";
import ProposalForm from "./components/ProposeForm";     // Admin actions
import ProposalsList from "./components/ProposalsList";  // User + Admin view

/**
 * Asset Custody Solution (Freighter Edition)
 * ------------------------------------------
 * - Freighter login only (Rabet removed)
 * - Admin auto-detection using .env
 * - Admin can create custody accounts
 * - Users can view their own accounts
 * - Admin sees approval requests
 * - Fully aligned with backend / smart contract structure
 */

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  // Admin wallet (from .env) — must match Freighter address
  const ADMIN_WALLET =
    import.meta.env.VITE_ADMIN_WALLET ||
    import.meta.env.VITE_DEPLOYER_ID ||
    "GADMINPLACEHOLDER123456";

  // Role detection
  const isAdmin =
    typeof walletAddress === "string" &&
    walletAddress.trim() === ADMIN_WALLET.trim();

  // Handle Freighter login
  const handleWalletConnected = (publicKey) => {
    setWalletAddress(publicKey || null);
  };

  // Handle Disconnect
  const handleDisconnect = () => {
    setWalletAddress(null);
  };

  // Warn if admin env missing
  useEffect(() => {
    if (
      !import.meta.env.VITE_ADMIN_WALLET &&
      !import.meta.env.VITE_DEPLOYER_ID &&
      ADMIN_WALLET.includes("GADMINPLACEHOLDER")
    ) {
      console.warn("⚠️ Admin wallet not configured in .env");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">

      {/* ------------------ Top Navigation Bar ------------------ */}
      <Navbar
        walletAddress={walletAddress}
        isAdmin={isAdmin}
        onDisconnect={handleDisconnect}
      />

      {/* ------------------ Main Page Content ------------------ */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ------------------ LEFT SIDEBAR ------------------ */}
          <div className="lg:col-span-1 space-y-6">

            {/* Wallet Connection Box */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Wallet
              </h2>
              <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>

            {/* Quick Info / Admin Info */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Quick Info
              </h2>

              <p className="text-sm text-slate-600">
                Connect your <strong>Freighter Wallet</strong> to use the custody system.
              </p>

              <p className="text-sm text-slate-500 mt-3">
                <strong>Admin Address:</strong>
                <span className="font-mono text-xs block break-all mt-1">
                  {ADMIN_WALLET}
                </span>
              </p>

              <p className="text-xs text-slate-400 mt-2 italic">
                Admin creates custody accounts. Users can deposit, withdraw, and view history.
              </p>
            </div>
          </div>

          {/* ------------------ RIGHT MAIN PANEL ------------------ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Admin — Create Custody Account Section */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                Create Custody Account
              </h2>

              {isAdmin ? (
                <ProposalForm walletAddress={walletAddress} />
              ) : (
                <div className="p-4 rounded border border-dashed border-gray-200 bg-gray-50">
                  <p className="text-sm text-slate-600 mb-1">
                    Only the admin can create custody accounts.
                  </p>
                  <p className="text-sm text-slate-500">
                    Connect using the admin wallet to unlock this feature.
                  </p>
                </div>
              )}
            </div>

            {/* All custody accounts / requests */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                Custody Accounts / Requests
              </h2>
              <ProposalsList
                walletAddress={walletAddress}
                isAdmin={isAdmin}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
