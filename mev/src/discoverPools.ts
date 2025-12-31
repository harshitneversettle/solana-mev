import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const connection = new Connection(process.env.HELIUS_RPC!, {
  wsEndpoint: process.env.WSS_HELIUS,
  commitment: "processed",
});

const PROGRAM_ID = new PublicKey(
  "BLBysPbLSYXUjwXY3hJhjLqUwAJ8F3i6Yw7C2ZzA1otp"
);
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "5J4s6FTaiyGQ477MBAz1AtUVepbpxvV4L3qQGsDMBd7x";
const pools = new Map();

export default async function discoverPools() {
  const signatures = await connection.getSignaturesForAddress(
    PROGRAM_ID,
    {},
    "confirmed"
  );
  console.log(`Found ${signatures.length} transactions \n`);

  for (const i of signatures) {
    const tx = await connection.getTransaction(i.signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (
      !tx?.meta ||
      !tx.meta.preTokenBalances ||
      tx.meta.preTokenBalances.length === 0
    )
      continue;

    const keys = tx.transaction.message.getAccountKeys();
    const vaultsByOwner = new Map();

    for (const balance of tx.meta.preTokenBalances) {
      const vault = keys.staticAccountKeys[balance.accountIndex]!.toBase58();
      const owner = balance.owner;

      if (!vaultsByOwner.has(owner)) vaultsByOwner.set(owner, []);
      vaultsByOwner.get(owner)!.push({ vault, mint: balance.mint });
    }

    for (const [owner, vaults] of vaultsByOwner) {
      if (vaults.length < 2 || pools.has(owner)) continue;

      const ownerIndex = keys.staticAccountKeys.findIndex(
        (k) => k.toBase58() === owner
      );
      if (ownerIndex !== -1 && ownerIndex < 2) continue;

      const solVault = vaults.find((v : any) => v.mint === SOL_MINT)?.vault;
      const usdcVault = vaults.find((v : any) => v.mint === USDC_MINT)?.vault;

      if (solVault && usdcVault) {
        pools.set(owner, { solVault, usdcVault });
        console.log(` Discovered pool: ${owner}`);
        console.log(`   SOL Vault:  ${solVault}`);
        console.log(`   USDC Vault: ${usdcVault}`);
        console.log("\n") ;
      }
    }
  }

  console.log(`Total pools: ${pools.size}`);
  return pools;
}

export { pools, connection, PROGRAM_ID, SOL_MINT, USDC_MINT };
