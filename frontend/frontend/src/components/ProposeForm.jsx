// frontend/src/components/ProposeForm.jsx
import React, { useState } from "react";
import {
  requestUnsignedXDR,
  signXDRWithFreighter,
  submitSignedXDR,
} from "../utils/stellar";

/**
 * Admin – Create Custody Account
 * ---------------------------------
 * Flow:
 *  1. Backend builds unsigned XDR
 *  2. Freighter signs XDR
 *  3. Backend submits signed TX
 */

export default function ProposalForm({ walletAddress }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("⚠️ Connect your Freighter wallet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Building transaction...");

      // 1️⃣ Build unsigned XDR via backend
      const unsignedXdr = await requestUnsignedXDR(
        "create_custody_account",
        {
          owner: walletAddress,
          required_signatures: 2,
          insurance: true,
        }
      );

      if (!unsignedXdr) throw new Error("Backend returned no XDR.");

      // 2️⃣ Sign with Freighter
      setStatus("📝 Signing in Freighter...");
      const signed = await signXDRWithFreighter(unsignedXdr);

      if (!signed) throw new Error("Signing rejected.");

      // 3️⃣ Submit to backend
      setStatus("🚀 Submitting to Stellar testnet...");
      const txHash = await submitSignedXDR(signed);

      setStatus(`✅ Success!\nTX Hash:\n${txHash}`);
    } catch (err) {
      console.error("❌ Error:", err);
      setStatus("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm max-w-md"
    >
      {/* Display wallet address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Admin Wallet Address
        </label>
        <input
          type="text"
          readOnly
          value={walletAddress || ""}
          className="w-full p-2 rounded bg-gray-100 border text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!walletAddress || loading}
        className={`w-full px-4 py-2 rounded-lg text-white font-medium transition ${
          !walletAddress || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Processing..." : "Create Custody Account"}
      </button>

      {/* Status Display */}
      {status && (
        <pre
          className={`mt-3 text-sm whitespace-pre-line ${
            status.startsWith("❌") ? "text-red-600" : "text-green-700"
          }`}
        >
          {status}
        </pre>
      )}
    </form>
  );
}
