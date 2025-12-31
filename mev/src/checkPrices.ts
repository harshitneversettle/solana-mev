import { PublicKey } from "@solana/web3.js";
import { connection, pools } from "./discoverPools.js";

const prices = new Map();

export default async function checkPrices() {
  console.log("Checking prices");

  for (const [poolAddr, vaults] of pools) {
    try {
      const solBal = await connection.getTokenAccountBalance(
        new PublicKey(vaults.solVault)
      );
      const usdcBal = await connection.getTokenAccountBalance(
        new PublicKey(vaults.usdcVault)
      );

      if (!solBal.value.uiAmount || !usdcBal.value.uiAmount) continue;

      const price = usdcBal.value.uiAmount / solBal.value.uiAmount;
      prices.set(poolAddr, price);

      console.log(
        `   ${poolAddr}...: ${price.toFixed(4)} USDC/SOL`
      );
    } catch (error) {
      console.log(`   ${poolAddr}... failed`);
    }
  }

  if (prices.size < 2) {
    console.log("arbitrage is not possible with one pool only ");
    return;
  }

  const priceArray = Array.from(prices.entries());
  if (!priceArray[0] || !priceArray[1]) {
    console.log("   Insufficient price data");
    return;
  }

  priceArray.sort((a, b) => a[1] - b[1]);

  const [cheapPool, cheapPrice] = priceArray[0];
  const [expensivePool, expensivePrice] = priceArray[1];

  const spread = expensivePrice - cheapPrice;
  const spreadPercent = (spread / cheapPrice) * 100;

  console.log(`Spread: ${spreadPercent.toFixed(2)}%`);

  if (spreadPercent > 1.0) {
    console.log("ARBITRAGE OPPORTUNITY!");
    console.log(
      `   Buy:  ${cheapPool} at ${cheapPrice.toFixed(4)}`
    );
    console.log(
      `   Sell: ${expensivePool} at ${expensivePrice.toFixed(4)}`
    );
    console.log(`   Profit: ${spread.toFixed(4)} USDC/SOL`);
  }
}

export { prices };
