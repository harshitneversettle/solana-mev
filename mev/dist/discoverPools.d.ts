import { Connection, PublicKey } from "@solana/web3.js";
declare const connection: Connection;
declare const PROGRAM_ID: PublicKey;
declare const SOL_MINT = "So11111111111111111111111111111111111111112";
declare const USDC_MINT = "5J4s6FTaiyGQ477MBAz1AtUVepbpxvV4L3qQGsDMBd7x";
declare const pools: Map<any, any>;
export default function discoverPools(): Promise<Map<any, any>>;
export { pools, connection, PROGRAM_ID, SOL_MINT, USDC_MINT };
//# sourceMappingURL=discoverPools.d.ts.map