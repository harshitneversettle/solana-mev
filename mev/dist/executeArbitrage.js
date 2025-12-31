"use strict";
// import {
//   PublicKey,
//   Transaction,
//   TransactionInstruction,
//   Keypair,
// } from "@solana/web3.js";
// import { connection, pools } from "./discoverPools.js";
// import { prices } from "./checkPrices.js";
// import fs from "fs";
// const payer = Keypair.fromSecretKey(
//   Uint8Array.from(
//     JSON.parse(
//       fs.readFileSync("/home/titan/solana-mev-analyzer/pool/admin.json", "utf8")
//     )
//   )
// );
// export default async function executeArbitrage() {
//   if (prices.size < 2) return;
//   const priceEntries = Array.from(prices.entries());
//   const [pool1, pool2] = priceEntries;
//   const spread = Math.abs(pool1![1] - pool2![1]);
//   const spreadPercent = (spread / Math.min(pool1![1], pool2![1])) * 100;
//   if (spreadPercent < 2.0) return;
//   const cheapPool = pool1![1] < pool2![1] ? pool1![0] : pool2![0];
//   const expensivePool = pool1![1] > pool2![1] ? pool1![0] : pool2![0];
//   console.log(`Executing arbitrage: ${spreadPercent.toFixed(2)}%`);
//   const tx = new Transaction();
//   const swapIx1 = await buildSwapInstruction(cheapPool, true);
//   const swapIx2 = await buildSwapInstruction(expensivePool, false);
//   tx.add(swapIx1);
//   tx.add(swapIx2);
//   const signature = await connection.sendTransaction(tx, [payer], {
//     skipPreflight: false,
//     preflightCommitment: "processed",
//   });
//   console.log(`Transaction: ${signature}`);
//   await connection.confirmTransaction(signature, "confirmed");
// }
// async function buildSwapInstruction(
//   poolAddress: string,
//   buyingSol: boolean
// ): Promise<TransactionInstruction> {
//   const poolData = pools.get(poolAddress);
//   if (!poolData) throw new Error("Pool not found");
//   const instructionData = Buffer.alloc(16);
//   instructionData.writeUInt32LE(buyingSol ? 1 : 0, 0);
//   instructionData.writeBigUInt64LE(BigInt(100000000), 8);
//   return new TransactionInstruction({
//     programId: new PublicKey("BLBysPbLSYXUjwXY3hJhjLqUwAJ8F3i6Yw7C2ZzA1otp"),
//     keys: [
//       { pubkey: payer.publicKey, isSigner: true, isWritable: true },
//       { pubkey: new PublicKey(poolAddress), isSigner: false, isWritable: true },
//       {
//         pubkey: new PublicKey(poolData.solVault),
//         isSigner: false,
//         isWritable: true,
//       },
//       {
//         pubkey: new PublicKey(poolData.usdcVault),
//         isSigner: false,
//         isWritable: true,
//       },
//     ],
//     data: instructionData,
//   });
// }
//# sourceMappingURL=executeArbitrage.js.map