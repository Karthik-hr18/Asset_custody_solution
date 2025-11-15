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
# 🔗 Live Smart Contract

**Soroban Contract ID:**  
`CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K`

**Network:** Futurenet  
**RPC:** `https://rpc-futurenet.stellar.org`

---

## 🔍 Verify Contract

```bash
soroban contract status \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K

## 📊 System Architecture

flowchart TD
  F[Frontend (React/Vite)\n- WalletConnect\n- ProposalForm\n- ProposalList] 
  B[Backend (Rust/Axum)\n- router.rs\n- stellar_client.rs\n- soroban_runner.rs]
  C[Soroban Smart Contract (WASM)\n- lib.rs\n- helpers.rs]
  S[(Stellar Network)]

  F -->|REST Calls| B
  B -->|Contract Invoke| C
  C --> S
  B --> S

### 🧱 Layer Overview

```
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
```

---

## 🔧 Installation Guide

This guide sets up the complete Bulwark Custody system:

* Rust backend (Axum)
* React frontend (Vite)
* Soroban smart contract
* Freighter wallet integration
* Futurenet RPC

> No database required.

---

## 📝 Prerequisites

### 🔹 System Requirements

* macOS, Linux, or Windows (WSL recommended)
* Git installed

### 🔹 Required Software

| Tool             | Purpose           | Install                                                    |
| ---------------- | ----------------- | ---------------------------------------------------------- |
| Rust (Stable)    | Backend server    | [https://rustup.rs](https://rustup.rs)                     |
| Node.js 18+      | Frontend (Vite)   | [https://nodejs.org](https://nodejs.org)                   |
| Soroban CLI      | Build contract    | [https://soroban.stellar.org](https://soroban.stellar.org) |
| Freighter Wallet | Sign transactions | [https://freighter.app](https://freighter.app)             |

### ✔ Verify tools

```bash
rustc --version
cargo --version
node --version
npm --version
soroban --version
```

---

## 🏗 Project Structure

```
project_root/
├── backend/
├── frontend/
└── smartcontract/
```

---

## 📥 Clone Repository

```bash
git clone https://github.com/Karthik-hr16/Asset_custody_soluton.git
```

---

## 🔧 Backend Setup (Rust / Axum)

### 1️⃣ Enter backend folder

```bash
cd backend
```

### 2️⃣ Create `.env`

```bash
cp .env.example .env
```

### 3️⃣ Add variables

```
SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org
CONTRACT_ID=CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K
```

### 4️⃣ Build

```bash
cargo build
```

### 5️⃣ Run backend

```bash
cargo run
```

➡ Backend: **[http://localhost:3000](http://localhost:3000)**

---

## 🧠 Smart Contract Setup (Soroban)

### 1️⃣ Enter folder

```bash
cd ../smartcontract/asset_custody
```

### 2️⃣ Build contract

```bash
soroban build
```

### 3️⃣ Verify deployment

```bash
soroban contract status \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K
```

### 4️⃣ Optional — invoke function

```bash
soroban contract invoke \
  --rpc https://rpc-futurenet.stellar.org \
  --id CCBSCMH5GIEGBK3EFOYUJN5LXXY44YNUAPKUE7IC7WTLQ7MECSNLJM7K \
  --fn <function_name>
```

---

## 🌐 Frontend Setup (React / Vite)

### 1️⃣ Enter folder

```bash
cd ../../frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start dev server

```bash
npm run dev
```

➡ Frontend: **[http://localhost:5173](http://localhost:5173)**

### 4️⃣ Production build

```bash
npm run build
npm run preview
```

---

## 🔗 Freighter Wallet Setup

1. Install Freighter → [https://freighter.app](https://freighter.app)
2. Open Freighter → Settings
3. Switch network → **Futurenet**
4. Approve signing prompts

---

## 🧪 Full Development Workflow (Fast Mode)

### 🟣 Terminal 1 — Backend

```bash
cd backend
cargo run
```

### 🔵 Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

### 🟢 Terminal 3 — Smart Contract rebuild

```bash
cd smartcontract/asset_custody
soroban build
```

---

## ✨ Features

### 🔐 Core Features

* Multisig custody logic
* Wallet authentication (Freighter)
* No database — decentralized state
* Rust backend relay
* Soroban smart contract
* React interface
* Fully verifiable flows

---




