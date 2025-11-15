<p align="center">
  <img src="assets/Logo.png" alt="Bulwark Custody Logo" width="240" style="max-width:80%;height:auto;">
</p>

<h1 align="center">🐂 Bulwark Custody</h1>
<p align="center">Secure Multisig Asset Custody on Stellar — Powered by Soroban, Rust, and React</p>

---
## 👤 About Me
- **Name:** Karthik H R
- Student at Bangalore Institute Of Technology 
- Enthusiastic blockchain developer  
- Passionate about Stellar + Rust ecosystems  
- Interested in security, wallets, and smart contract design  
- Deeply motivated to build simple tools that make blockchain safer for real users  
- Focused on production-grade architectures with minimal moving parts
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

📊 System Architecture

flowchart TD
  F[Frontend (React/Vite)\n- WalletConnect\n- ProposalForm\n- ProposalList] 
  B[Backend (Rust/Axum)\n- router.rs\n- stellar_client.rs\n- soroban_runner.rs]
  C[Soroban Smart Contract (WASM)\n- lib.rs\n- helpers.rs]
  S[(Stellar Network)]

  F -->|REST Calls| B
  B -->|Contract Invoke| C
  C --> S
  B --> S
scss
Copy code
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
🔧 Installation Guide
This guide sets up the complete Bulwark Custody system:

Rust backend (Axum)

Soroban smart contract (WASM)

React frontend (Vite)

Freighter wallet integration

Futurenet RPC

No database is required.

📝 Prerequisites

🔹 System Requirements
macOS, Linux, or Windows (WSL recommended)

Git installed

🔹 Required Software
Tool	Purpose	Install
Rust (Stable)	Backend server	https://rustup.rs
Node.js 18+	Frontend (Vite)	https://nodejs.org
Soroban CLI	Build + deploy contracts	https://soroban.stellar.org
Freighter Wallet	Sign transactions	https://freighter.app

Check installations:

bash
Copy code
rustc --version
cargo --version
node --version
npm --version
soroban --version


📁 Project Structure
Copy code
project_root/
├── backend/
├── frontend/
└── smartcontract/

📥 Clone Repository
bash
Copy code
git clone https://github.com/Karthik-hr16/Asset_custody_soluton.git
🚀 Backend Setup (Rust / Axum)
1️⃣ Enter backend folder
bash
Copy code
cd backend
2️⃣ Create environment file
bash
Copy code
cp .env.example .env
3️⃣ Add required variables in .env
ini
Copy code
SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org
CONTRACT_ID=CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K
4️⃣ Build
bash
Copy code
cargo build
5️⃣ Run backend
bash
Copy code
cargo run
Backend available at:
➡️ http://localhost:3000

🧠 Smart Contract (Soroban)
1️⃣ Enter contract directory
bash
Copy code
cd ../smartcontract/asset_custody
2️⃣ Build smart contract
bash
Copy code
soroban build
3️⃣ Check deployed contract
bash
Copy code
soroban contract status \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K
4️⃣ Optional — invoke a function
bash
Copy code
soroban contract invoke \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K \
  --fn <function_name>
🌐 Frontend Setup (React / Vite)
1️⃣ Navigate to frontend
bash
Copy code
cd ../../frontend
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Start development server
bash
Copy code
npm run dev
Frontend runs at:
➡️ http://localhost:5173

4️⃣ Build production bundle
bash
Copy code
npm run build
5️⃣ Preview production
bash
Copy code
npm run preview
🔗 Freighter Wallet Setup
Install Freighter → https://freighter.app

Open Freighter → Settings

Switch network to Futurenet

Approve signing prompts when requested

🧪 Full Development Workflow (Fast Mode)
🟣 Terminal 1 — Backend
bash
Copy code
cd backend
cargo run
🔵 Terminal 2 — Frontend
bash
Copy code
cd frontend
npm run dev
🟢 Terminal 3 — Rebuild smart contract on changes
bash
Copy code
cd smartcontract/asset_custody
soroban build

## ✨ Features

Bulwark Custody provides secure, lightweight on-chain asset custody built on Stellar using Soroban smart contracts.

### 🔐 Core Features
- **Multisig Custody Logic**  
  Secure, on-chain proposal creation, approval, and execution.

- **Wallet-based Authentication**  
  Uses **Freighter** and other Stellar wallets for signing.

- **Decentralized State Storage**  
  No database — all critical data lives on Soroban or the Stellar network.

- **Secure Backend Relay**  
  Rust (Axum) backend builds and relays transactions safely.

- **Futurenet Compatible**  
  Fully deployed and functioning on Stellar Futurenet.

- **User-Friendly Frontend**  
  React + Vite interface for proposal creation and approvals.

- **Global, Verifiable Flows**  
  Every action is recorded on-chain and verifiable.


## 🧱 Project Overview Diagram

### 🎨 Mermaid Diagram (GitHub compatible)
```mermaid
flowchart TD
  User --> F[Frontend (React / Vite)]
  F -->|REST API| B[Backend (Rust / Axum)]
  B -->|Invoke| C[Soroban Contract]
  C --> S[(Stellar Network)]

  F -->|Wallet Signatures| W[Freighter Wallet]


