# 🐂 Bulwark Custody — Secure Stellar Asset Custody System

<p align="center">
  <img src="assets/logo.png" alt="Bulwark Custody Logo" width="250"/>
</p>

<h1 align="center">Bulwark Custody</h1>


A lightweight, full-stack multisig custody tool built on **Soroban**, **Rust (Axum/Tokio)**, and **React (Vite)**.  
No database. No centralized storage. 100% blockchain-driven logic.

Bulwark Custody enables users to create, approve, and execute Stellar asset custody actions using a clean UX and a simple relay backend.

---

## 👤 About Me
- **Name:** Karthik H R 
- Enthusiastic blockchain developer  
- Passionate about Stellar + Rust ecosystems  
- Interested in security, wallets, and smart contract design  
- Deeply motivated to build simple tools that make blockchain safer for real users  
- Focused on production-grade architectures with minimal moving parts

---

# 🧩 Project Description 

Bulwark Custody is a lightweight multisig custody system designed for Stellar assets.  
The project consists of a **Rust backend** that exposes simple HTTP routes, a **React frontend** for creating proposals and performing multisig approvals, and a **Soroban smart contract** that holds custody logic and finalizes operations.  

No database is used; the system relies fully on Stellar/Soroban state and direct interactions between the frontend and backend. The backend acts as a secure relay that builds transactions, interacts with the Horizon RPC via `stellar_client.rs`, and executes contract calls using `soroban_runner.rs`. Users create proposals directly from the frontend, sign using wallet connectors like Freighter, and submit operations securely to the Stellar blockchain.  
This architecture keeps everything simple, auditable, decentralized, and easy to extend.

---

# 🎯 Vision Statement 

Our vision is to make secure Stellar asset custody available to everyone — individuals, teams, and organizations — without complex infrastructure. By combining lightweight components (React, Rust, Soroban) and avoiding database dependencies, we create a custody workflow that is fully transparent, decentralized, and easy to audit. This project aims to show how multisig approvals and custody can be implemented cleanly on Stellar, empowering users to control their assets securely with minimal trust in intermediaries. Simplicity, safety, and clarity drive the design.

---

# 🛠 Software Development Plan 

1. **Smart Contract Development (Soroban)**  
   Implement custody logic: proposal structs, multisig thresholds, validation, and execution entrypoints inside `lib.rs`.

2. **Backend Routing (Rust / Axum)**  
   Set up `main.rs` and `router.rs` with routes for creating proposals, validating signatures, and relaying contract calls via `soroban_runner.rs`.

3. **Stellar RPC Integration**  
   Use `stellar_client.rs` to build, simulate, and submit Stellar/Soroban transactions with no database required.

4. **Frontend UI (React/Vite)**  
   Build wallet connection, proposal form, proposal list, and approval workflow using `WalletConnect.jsx`, `ProposalForm.jsx`, and related components.

5. **Testing & Validation**  
   Test cross-stack flow: contract → backend → frontend → Stellar. Validate multisig approvals and signing flow.

6. **Deployment**  
   Deploy Soroban contract, run backend with environment variables, and host frontend with Vite or static hosting.

---

# 🧪 Project Architecture

project_root/
│
├── backend/
│ ├── Cargo.toml
│ ├── .env.example
│ └── src/
│ ├── main.rs
│ ├── router.rs
│ ├── soroban_runner.rs
│ ├── state.rs
│ └── stellar_client.rs
│
├── frontend/
│ ├── package.json
│ ├── vite.config.js
│ └── src/
│ ├── App.css
│ ├── App.jsx
│ ├── index.css
│ ├── main.jsx
│ ├── components/
│ │ ├── WalletConnect.jsx
│ │ ├── ProposalList.jsx
│ │ ├── ProposalForm.jsx
│ │ └── Navbar.jsx
│ └── utils/
│ └── stellar.js
│
├── smartcontract/
│ └── asset_custody/
│ ├── Cargo.toml
│ └── src/
│ ├── lib.rs
│ └── helpers.rs
│
└── README.md

---

# ⚙️ Installation Guide 

### 1️⃣ Install Dependencies
- Rust (stable)
- Node.js (18+)
- Soroban CLI
- A Stellar wallet extension (Freighter recommended)

---

### 2️⃣ Backend Setup (Rust)
```bash
cd backend
cp .env.example .env      # Fill in RPC URL + contract ID
cargo build
cargo run
cd smartcontract/asset_custody
soroban build
# To deploy:
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/asset_custody.wasm --rpc <RPC_URL>
cd frontend
npm install
npm run dev

I started this project because I wanted to understand how secure custody systems actually work. Stellar’s simplicity and Soroban’s smart contract model inspired me to build a multisig custody workflow that feels safe and transparent. Learning Rust, smart contracts, and decentralized transaction flows has taught me how important security is for real users. My goal is to build tools that make blockchain safer, clearer, and more accessible for everyone.

flowchart TD
    A[Frontend (React/Vite)
    - WalletConnect
    - ProposalForm
    - ProposalList] -->|REST API| B[Backend (Rust/Axum)
    - main.rs
    - router.rs
    - soroban_runner.rs
    - stellar_client.rs]

    B -->|Contract Call| C[Soroban Smart Contract
    - lib.rs
    - helpers.rs]

    C --> D[(Stellar Network)]
