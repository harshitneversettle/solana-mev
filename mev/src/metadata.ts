import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { publicKey } from "@metaplex-foundation/umi";
import fs from "fs";

const connection = new Connection(clusterApiUrl("devnet"));

const secretKey = JSON.parse(
  fs.readFileSync("/home/titan/solana-mev-analyzer/pool/admin.json", "utf8")
);
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

const umi = createUmi(clusterApiUrl("devnet"));
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(secretKey)
);
umi.use(keypairIdentity(umiKeypair));

const mint = publicKey("5J4s6FTaiyGQ477MBAz1AtUVepbpxvV4L3qQGsDMBd7x");

await createV1(umi, {
  mint,
  authority: umi.identity,
  name: "Albus Dumbledore",
  symbol: "GRYF",
  uri: "https://raw.githubusercontent.com/harshitneversettle/images/main/token_uri.json",
  sellerFeeBasisPoints: percentAmount(0),
  tokenStandard: TokenStandard.Fungible,
}).sendAndConfirm(umi);

console.log("done");
