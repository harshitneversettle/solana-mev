## ProgramId :  BLBysPbLSYXUjwXY3hJhjLqUwAJ8F3i6Yw7C2ZzA1otp


# Solana MEV Arbitrage Analyzer 

A real-time MEV analyzer built on **Solana Devnet** to detect **arbitrage opportunities** caused by price imbalances across liquidity pools trading the same asset pair.

---

## Overview

The system monitors two SOL/USDC pools under the same program ID and tracks their on-chain state changes. Both pools (Pool A and Pool B) start with the same initial liquidity, so SOL is priced identically in each market (this is a setup like , we can assume PoolA as Raydium and poolB as Orca)

To simulate a real MEV scenario, a swap is intentionally executed in one of the pools, creating a price imbalance between Pool A and Pool B. Because the script is already listening for state changes, this swap immediately triggers a re-computation of prices in both pools. If the resulting price spread between them exceeds 1%, the system flags it as an arbitrage-style MEV opportunity.

**Example:**
- Pool A: 200 USDC / SOL
- Pool B: 150 USDC / SOL  
→ Buy in Pool B, sell in Pool A

To enable deterministic testing, pools are intentionally initialized with imbalanced liquidity on Devnet.

---
## Pool Initialization

Both liquidity pools are created using a **custom AMM program written in Rust with Anchor**.

- Two independent SOL/USDC pools are initialized under the same program ID  
- Each pool starts with identical SOL and USDC reserves  
- This ensures both pools have the same initial price  
- A controlled swap is later executed in one pool to introduce price divergence  

This setup allows deterministic creation of MEV conditions on Devnet while keeping the system behavior realistic and reproducible.

---
## How It Works

1. **Pool Discovery**  
   Scans program transactions to dynamically identify SOL and USDC vault pairs.

2. **Real-Time Monitoring**  
   Uses WebSocket subscriptions (`onAccountChange`) to react instantly to vault balance updates.

3. **Price Calculation**  
   Computes prices using constant-product AMM math:  
   `USDC per SOL = USDC_reserve / SOL_reserve`

4. **Arbitrage Detection**  
   Compares pool prices and flags opportunities when the spread exceeds a configurable threshold (default: 1%).

---

## Features

- Dynamic pool discovery (no hardcoded addresses)
- Real-time ledger monitoring
- Constant product AMM price calculation
- Cross-pool arbitrage detection
- Async, event-driven TypeScript design

---## Demo: Real Arbitrage Detection

### Initial Balanced State
Both pools start with identical SOL/USDC pricing.

<img width="800" height="500" alt="Initial Balanced Pools" src="https://github.com/user-attachments/assets/c60ebb78-d3ef-48f5-b3d8-ecdd58384af7" />

### the script finds the pool in the chain , 
the script is monitoring the states 

<img width="700" height="400" alt="Swap Transaction" src="https://github.com/user-attachments/assets/d5e99baf-4e20-4e31-9b2c-ff57164b342d" />

### Transaction Creates Imbalance
script detects the state change , imbalance , ie. mev oppurtunity 
Bot identifies 23.45% price spread and flags profitable trade.
Spread: 23.45%
Buy: WvtiBJAf.... at 324.0000 USDC/SOL
Sell: 6PU2L3Mz.... at 400.0000 USDC/SOL
Profit: 76.0000 USDC/SOL ( demo , liquidity is low )

<img width="700" height="350" alt="Arbitrage Detected" src="https://github.com/user-attachments/assets/af6a67a8-cab4-401b-a9fc-84cbf131ddac" />

Why Such Large Profits?
1. **Devnet Low Liquidity**: 
   - Pool A: 1 SOL / 324 USDC
   - Pool B: 1 SOL / 400 USDC  
   - Small reserves = massive % swings per swap

2. **Intentionally Extreme Swap**:





---

## Tech Stack

- TypeScript – Real-time MEV analyzer and monitoring logic

- @solana/web3.js – Blockchain interaction and account subscriptions

- Helius RPC (HTTP + WebSocket) – Low-latency block and account data

- Solana Devnet – Testing and simulation environment

- Rust + Anchor – Custom AMM pool program used to create and control test liquidity pools

---

## Project Structure
```
├── discoverPools.ts # Pool discovery via transaction analysis
├── monitor.ts # WebSocket vault subscriptions
├── checkPrices.ts # Price calculation + spread detection
└── index.ts # Entry point
```

---

## Setup

```bash
npm install
cp .env.example .env
npx tsc
node dist/index.js
```
---
## Future Work

- Extend detection to **multi-pool and multi-hop arbitrage paths**
- Add **backrun and sandwich pattern analysis**
- Integrate **transaction simulation** to estimate execution profitability

---
## Author

- Harshit Yadav , 
- Solana Blockchain Developer , 
- Focus: MEV, DeFi systems, on-chain analysis
- Email: harshityadav5499@gmail.com
- X: @Harshit_yad4v




