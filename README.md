# Solana MEV Arbitrage Bot

## Project Overview

This project implements a real-time MEV arbitrage analyzer on Solana Devnet, designed to detect price inefficiencies across liquidity pools that trade the same asset pair. The system continuously monitors on-chain state changes, computes pool prices, and flags arbitrage-style MEV opportunities when meaningful price divergence appears.

The goal is not only detection, but accurate simulation of real MEV conditions in a controlled environment.

### Core Concept
**Real-world scenario:**
Pool A: SOL = 200 USDC (expensive)
Pool B: SOL = 150 USDC (cheap)
→ Buy low in Pool B, sell high in Pool A = Profit


### Devnet Simulation
- Created **two SOL/USDC pools** under the same program ID
- **Intentionally imbalanced** initial liquidity ratios  
- After targeted transactions, price divergence occurs naturally
- Creates **real MEV opportunities** for detection

## Features
- Discovers liquidity pools by analyzing program transactions
- WebSocket-based real-time vault balance monitoring
- Calculates USDC/SOL prices using constant product AMM formula
- Detects profitable arbitrage spreads across multiple pools
- Production-grade async TypeScript implementation

## Tech Stack
TypeScript @solana/web3.js
Helius RPC (WebSocket + HTTP) dotenv configuration
Solana devnet deployment Map-based pool tracking


## Architecture
1.discoverPools() → Scans program txs → Finds SOL/USDC vault pairs
2.monitor() → WebSocket subscriptions on vault accounts
3.checkPrices() → Calculates prices → Detects spreads > 1%


## Results
Detected 26.56% arbitrage spread between pools:
Pool A (WvtiBJAf...): 324.0000 USDC/SOL
Pool B (6PU2L3Mz...): 256.0000 USDC/SOL
Profit potential: 68.0000 USDC per SOL traded


## Demo Output
Found 24 transactions
Checking prices
WvtiBJAf...: 324.0000 USDC/SOL
6PU2L3Mz...: 256.0000 USDC/SOL
Spread: 26.56%
ARBITRAGE OPPORTUNITY!
Buy: 6PU2L3Mz... @ 256.0000
Sell: WvtiBJAf... @ 324.0000
Profit: 68.0000 USDC/SOL



## Setup
```bash
npm install @solana/web3.js dotenv typescript ts-node
cp .env.example .env
npx tsc
node dist/index.js
```
Key Implementation Details
Pool Discovery: getSignaturesForAddress() + preTokenBalances parsing
Real-time Monitoring: onAccountChange("confirmed") commitment level
Price Calculation: USDC_balance / SOL_balance = USDC_per_SOL
Arbitrage Detection: Sort prices → Compare cheapest vs expensive (>1% spread)

## Files
```
├── discoverPools.ts  # Transaction parsing + pool discovery
├── monitor.ts        # WebSocket account change subscriptions
├── checkPrices.ts    # Price calculation + arbitrage detection
└── index.ts          # Main entry point
```

## Built By
| Name        | Harshit Yadav                      |
| ----------- | ---------------------------------- |
| Education   | B.Tech Computer Science (3rd Year) |
| Role        | Solana Blockchain Developer        |
| Specialties | MEV, DeFi protocols, Anchor/Rust   |
| Email       | harshityadav5499@gmail.com         |
| X           | @Harshit_yad4v                     |
