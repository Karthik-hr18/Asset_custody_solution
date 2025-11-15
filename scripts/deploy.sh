#!/bin/bash

echo "🚀 Building Soroban contract..."
cd smartcontract/asset_custody
soroban build

echo "📡 Deploying contract to Stellar RPC..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/asset_custody.wasm \
  --rpc $SOROBAN_RPC_URL \
  --source $DEPLOYER_SECRET)

echo "✅ Contract Deployed: $CONTRACT_ID"

echo "🔧 Updating backend environment..."
cd ../../backend
sed -i "" "s/CONTRACT_ID=.*/CONTRACT_ID=$CONTRACT_ID/" .env

echo "📦 Building backend..."
cargo build --release

echo "▶️ Starting backend..."
cargo run &

echo "🌐 Starting frontend..."
cd ../frontend
npm install
npm run dev

echo "🎉 Deployment complete! Visit: http://localhost:5173"
