// frontend/src/components/ProposalsList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { isFreighterInstalled } from "../utils/stellar";

/**
 * ProposalsList — Freighter Edition
 * ---------------------------------
 * - Fetch custody accounts / proposals from backend
 * - Users see their own custody requests
 * - Admin sees all requests + can approve/sign
 * - Freighter used for message signing (NOT Rabet)
 */

export default function ProposalsList({ walletAddress, isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  // ----------------------------------------------------------
  // Fetch proposals from backend
  // ----------------------------------------------------------
  async function fetchData() {
    if (!walletAddress) return;
    setLoading(true);
    setStatusMsg("");

    try {
      const res = await axios.get(`${backendURL}/proposals`);
      const all = res.data || [];

      // USERS see only their own proposals
      // ADMIN sees everything
      const filtered = isAdmin
        ? all
        : all.filter((p) => p.owner === walletAddress);

      setItems(filtered);
    } catch (err) {
      console.error("❌ Failed to fetch proposals:", err);
      setStatusMsg("❌ Could not fetch proposals from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [walletAddress, isAdmin]);

  // ----------------------------------------------------------
  // Admin signs a proposal using Freighter
  // ----------------------------------------------------------
  async function handleAdminSign(proposalId) {
    if (!isAdmin) return;

    if (!isFreighterInstalled()) {
      alert("❌ Freighter not installed.");
      return;
    }

    if (!walletAddress) {
      alert("Connect Freighter first.");
      return;
    }

    try {
      setStatusMsg("✍️ Signing approval using Freighter...");

      // Freighter message signing
      const message = `Approve custody proposal ID: ${proposalId}`;
      const signature = await window.freighterApi.signMessage(message);

      if (!signature?.signature) {
        throw new Error("No signature returned by Freighter");
      }

      // Send signature to backend
      const res = await axios.post(
        `${backendURL}/proposals/${proposalId}/sign`,
        {
          signer: walletAddress,
          signature: signature.signature,
        }
      );

      if (res.data?.ok) {
        setStatusMsg("✅ Proposal signed successfully.");
        fetchData();
      } else {
        setStatusMsg("❌ Failed to sign proposal.");
      }
    } catch (err) {
      console.error("Sign error:", err);
      setStatusMsg("❌ Signature rejected by user or failed.");
    }
  }

  // ----------------------------------------------------------
  // UI Rendering
  // ----------------------------------------------------------
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Custody Accounts / Requests
        </h2>

        <button
          onClick={fetchData}
          disabled={loading}
          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No custody requests found.</p>
      ) : (
        <div className="space-y-4">
          {items.map((p, idx) => (
            <div
              key={p.id || idx}
              className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="text-sm font-semibold text-gray-800">
                Request #{idx + 1}
              </p>

              <p className="text-xs text-gray-600 mt-1">
                Owner:{" "}
                <span className="font-mono text-xs break-all">{p.owner}</span>
              </p>

              <p className="text-xs text-gray-600">
                Required Signatures:{" "}
                <span className="font-semibold">{p.required_signatures}</span>
              </p>

              <p className="text-xs text-gray-600">
                Insurance:{" "}
                <span className="font-semibold">
                  {p.insurance ? "Enabled" : "Disabled"}
                </span>
              </p>

              <p className="text-xs text-gray-600">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    p.status === "ready"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {p.status}
                </span>
              </p>

              <p className="text-xs text-gray-600">
                Signatures:{" "}
                <span className="font-semibold">{p.signatures?.length || 0}</span>
              </p>

              {/* Admin Only: Sign Button */}
              {isAdmin && (
                <button
                  onClick={() => handleAdminSign(p.id)}
                  disabled={p.status === "ready"}
                  className={`mt-3 text-xs px-3 py-1 rounded ${
                    p.status === "ready"
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {p.status === "ready" ? "Approved" : "Sign Request"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {statusMsg && (
        <p className="mt-3 text-xs whitespace-pre-line text-slate-600">
          {statusMsg}
        </p>
      )}
    </div>
  );
}
