import { PublicKey } from "@solana/web3.js";
import { connection, pools } from "./discoverPools.js";
import checkPrices from "./checkPrices.js";
export default async function monitor() {
    console.log("Starting monitoring");
    for (const [poolAddr, vaults] of pools) {
        console.log(` Monitoring pool: ${poolAddr}`);
        console.log(`   SOL:  ${vaults.solVault}`);
        console.log(`   USDC: ${vaults.usdcVault}`);
        connection.onAccountChange(new PublicKey(vaults.solVault), checkPrices, "processed");
        connection.onAccountChange(new PublicKey(vaults.usdcVault), checkPrices, "processed");
    }
    console.log("Monitoring active");
    await new Promise(() => { });
}
//# sourceMappingURL=monitor.js.map