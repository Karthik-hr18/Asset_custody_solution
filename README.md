<p align="center">
  <img src="assets/logo.png" alt="Bulwark Custody Logo" width="240" style="max-width:80%;height:auto;">
</p>

<h1 align="center">🐂 Bulwark Custody</h1>
<p align="center">Secure Multisig Asset Custody on Stellar — Powered by Soroban, Rust, and React</p>

---

## 🧩 Project Description

Bulwark Custody is a lightweight, secure multisig custody system built on the **Stellar blockchain** using **Soroban smart contracts**, a **Rust (Axum/Tokio) backend**, and a **React (Vite)** frontend.  
The system enables users to create custody proposals, sign them using wallets like **Freighter**, and relay them through a secure Rust backend that interacts directly with the Stellar network.

No database is used — all state relies on:
- **Soroban smart contract storage**
- **Stellar network transactions**
- **Frontend state + backend relay**

This architecture keeps the system decentralized, verifiable, and easy to maintain.

---

## 🎯 Vision Statement

Our mission is to make secure asset custody accessible to everyone on Stellar — with simplicity, transparency, and safety at the core.  
Bulwark Custody provides a clean multisig flow backed by Soroban and Rust, eliminating complex infrastructure while enhancing trust and decentralization.  
We aim to demonstrate that secure custody doesn’t require enterprise-level tooling — only well-designed smart contracts, simple relayers, and intuitive UX.

---

## 🔗 Live Smart Contract

**Soroban Contract ID:**  
`CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K`

**Network:** Futurenet  
**RPC:** `https://rpc-futurenet.stellar.org`

### Verify Contract
```bash
soroban contract status \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K

flowchart TD
  F[Frontend (React/Vite)\n- WalletConnect\n- ProposalForm\n- ProposalList] 
  B[Backend (Rust/Axum)\n- router.rs\n- stellar_client.rs\n- soroban_runner.rs]
  C[Soroban Smart Contract\n- lib.rs\n- helpers.rs]
  S[(Stellar Network)]

  F -->|REST Calls| B
  B -->|Contract Invoke| C
  C --> S
  B --> S
Frontend (React)
        │
        ▼
Backend (Rust/Axum)
        │
        ▼
Soroban Smart Contract (WASM)
        │
        ▼
Stellar Network (Futurenet)

## 🔧 Installation Guide

This guide will help you set up the complete Bulwark Custody system on your local machine, including:

- Rust backend (Axum)
- Soroban smart contract (WASM)
- React (Vite) frontend
- Wallet integration (Freighter)
- Futurenet RPC connectivity

> **Note:** No database is required for this project.

---

## 📝 Prerequisites

Before starting, install the following tools:

### 🔹 System Requirements
- macOS, Linux, or Windows (WSL recommended)
- Git

### 🔹 Required Software
| Tool | Why | Install |
|------|------|---------|
| **Rust (Stable Toolchain)** | Backend server (Axum/Tokio) | https://rustup.rs |
| **Node.js 18+** | React (Vite) frontend | https://nodejs.org |
| **Soroban CLI** | Compile & deploy smart contracts | https://soroban.stellar.org |
| **Freighter Wallet** | Sign Stellar transactions | https://freighter.app |
| **Stellar Futurenet RPC** | Network endpoint | Already public |

To verify installation:

```bash
rustc --version
cargo --version
node --version
npm --version
soroban --version

project_root/
├── backend/
├── frontend/
└── smartcontract/

git clone https://github.com/Karthik-hr16/Asset_custody_soluton.git

🚀 Backend (Rust / Axum)
1️⃣ Enter backend folder
cd backend

2️⃣ Create .env
cp .env.example .env

3️⃣ Add required variables

Paste inside backend/.env:

SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org
CONTRACT_ID=CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K

4️⃣ Build backend
cargo build

5️⃣ Run backend
cargo run


Backend runs at:

http://localhost:3000

🧠 Smart Contract (Soroban)
1️⃣ Enter contract folder
cd ../smartcontract/asset_custody

2️⃣ Build contract
soroban build

3️⃣ Check deployed contract (already deployed)
soroban contract status \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K

4️⃣ (Optional) Invoke a function
soroban contract invoke \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K \
  --fn <function_name>

🌐 Frontend (React / Vite)
1️⃣ Enter frontend folder
cd ../../frontend

2️⃣ Install dependencies
npm install

3️⃣ Start dev server
npm run dev


Frontend runs at:

http://localhost:5173

4️⃣ Build production bundle
npm run build

5️⃣ Preview production bundle
npm run preview

🔗 Freighter Wallet Setup

Install Freighter → https://freighter.app

Open Freighter → Settings

Select Futurenet network

Approve signing requests when prompted

🧪 Full Dev Workflow (Short Version)
🟣 Terminal 1 — Backend
cd backend
cargo run

🔵 Terminal 2 — Frontend
cd frontend
npm run dev

🟢 Terminal 3 — Rebuild contract on changes
cd smartcontract/asset_custody
soroban build


You are now ready to use Bulwark Custody locally!


---


