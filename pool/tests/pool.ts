import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pool } from "../target/types/pool";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import fs from "fs";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createSyncNativeInstruction,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  HarvestWithheldTokensToMintInstructionData,
  mintTo,
  TOKEN_PROGRAM_ID,
  transfer,
} from "@solana/spl-token";
import { assert, trace } from "console";
import { use } from "chai";
import dotenv from "dotenv" ;

dotenv.config()
describe("pool", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const connection = new Connection(
    process.env.HELIUS_RPC ,
    "confirmed"
  );

  const program = anchor.workspace.pool as Program<Pool>;

  const Harshit = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(
          "/home/titan/solana-mev-analyzer/pool/admin.json",
          "utf8"
        )
      )
    )
  );

  const Virat = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(
          "/home/titan/solana-mev-analyzer/pool/user.json",
          "utf8"
        )
      )
    )
  );
  let sol_mint: PublicKey;
  let usdc_mint: PublicKey;
  before(async () => {
    sol_mint = new PublicKey("So11111111111111111111111111111111111111112");
    // usdc_mint = await createMint(
    //   connection,
    //   Harshit,
    //   Harshit.publicKey,
    //   null,
    //   9
    // );
    usdc_mint = new PublicKey("5J4s6FTaiyGQ477MBAz1AtUVepbpxvV4L3qQGsDMBd7x");
    let adminSolAta = await getOrCreateAssociatedTokenAccount(
      connection,
      Harshit,
      sol_mint,
      Harshit.publicKey
    );
    let adminUsdcAta = await getOrCreateAssociatedTokenAccount(
      connection,
      Harshit,
      usdc_mint,
      Harshit.publicKey
    );

    const ix1 = SystemProgram.transfer({
      fromPubkey: Harshit.publicKey,
      toPubkey: adminSolAta.address,
      lamports: 1 * LAMPORTS_PER_SOL,
    });
    const ix2 = createSyncNativeInstruction(adminSolAta.address);
    const tx = new Transaction().add(ix1, ix2);
    await sendAndConfirmTransaction(connection, tx, [Harshit]);
  });

  // it("init poolA (Raydium)", async () => {
  //   let owner1 = Harshit;
  //   let name1 = "Raydium SOL/USDC";

  //   const [poolState, poolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("poolA"), owner1.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const [vaultAuth, vaultBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("vault_auth_a"), poolState.toBuffer()],
  //     program.programId
  //   );

  //   const tx = await program.methods
  //     .initPoolA(name1)
  //     .accounts({
  //       owner: owner1.publicKey,
  //       solMint: sol_mint,
  //       usdcMint: usdc_mint,
  //     })
  //     .signers([owner1])
  //     .rpc();

  //   const pool = await program.account.poolA.fetch(poolState);
  //   await connection.confirmTransaction(tx, "confirmed");

  //   const ix1 = SystemProgram.transfer({
  //     fromPubkey: Harshit.publicKey,
  //     toPubkey: pool.solVault,
  //     lamports: 0.5 * LAMPORTS_PER_SOL,
  //   });
  //   const ix2 = createSyncNativeInstruction(pool.solVault);
  //   const tx2 = new Transaction().add(ix1, ix2);
  //   await sendAndConfirmTransaction(connection, tx2, [Harshit]);

  //   await mintTo(
  //     connection,
  //     Harshit,
  //     usdc_mint,
  //     pool.usdcVault,
  //     Harshit,
  //     50 * 1e9
  //   );

  //   await program.methods
  //     .updatePoolA()
  //     .accounts({
  //       poolState: poolState,
  //       admin: Harshit.publicKey,
  //       solVault: pool.solVault,
  //       usdcVault: pool.usdcVault,
  //     })
  //     .signers([Harshit])
  //     .rpc();

  //   const solVault = await getAccount(connection, pool.solVault);
  //   const usdcVault = await getAccount(connection, pool.usdcVault);

  //   console.log("tx:", tx);
  //   console.log("pool:", pool.name);
  //   console.log("admin:", pool.admin.toBase58());
  //   console.log("bump:", pool.bump);
  //   console.log("solVault:", pool.solVault.toBase58());
  //   console.log("usdcVault:", pool.usdcVault.toBase58());
  //   console.log("solMint:", solVault.mint.toBase58());
  //   console.log("usdcMint:", usdcVault.mint.toBase58());
  // });

  // it("init poolB (Orca)", async () => {
  //   let owner2 = Virat;
  //   let name2 = "Orca SOL/USDC";

  //   const [poolState, poolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("poolB"), owner2.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const [vaultAuth] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("vault_auth_b"), poolState.toBuffer()],
  //     program.programId
  //   );

  //   const tx = await program.methods
  //     .initPoolB(name2)
  //     .accounts({
  //       owner: owner2.publicKey,
  //       solMint: sol_mint,
  //       usdcMint: usdc_mint,
  //     })
  //     .signers([owner2])
  //     .rpc();
  //   await connection.confirmTransaction(tx, "confirmed");

  //   const pool = await program.account.poolB.fetch(poolState);

  //   const ix1 = SystemProgram.transfer({
  //     fromPubkey: Harshit.publicKey,
  //     toPubkey: pool.solVault,
  //     lamports: 0.5 * LAMPORTS_PER_SOL,
  //   });
  //   const ix2 = createSyncNativeInstruction(pool.solVault);
  //   const tx2 = new Transaction().add(ix1, ix2);
  //   await sendAndConfirmTransaction(connection, tx2, [Harshit]);

  //   await mintTo(
  //     connection,
  //     Harshit,
  //     usdc_mint,
  //     pool.usdcVault,
  //     Harshit,
  //     50 * 1e9
  //   );

  //   await program.methods
  //     .updatePoolB()
  //     .accounts({
  //       poolState: poolState,
  //       admin: Virat.publicKey,
  //       solVault: pool.solVault,
  //       usdcVault: pool.usdcVault,
  //     })
  //     .signers([Virat])
  //     .rpc();

  //   const solVault = await getAccount(connection, pool.solVault);
  //   const usdcVault = await getAccount(connection, pool.usdcVault);

  //   console.log("tx:", tx);
  //   console.log("pool:", pool.name);
  //   console.log("admin:", pool.admin.toBase58());
  //   console.log("bump:", pool.bump);
  //   console.log("solVault:", pool.solVault.toBase58());
  //   console.log("usdcVault:", pool.usdcVault.toBase58());
  //   console.log("solMint:", solVault.mint.toBase58());
  //   console.log("usdcMint:", usdcVault.mint.toBase58());
  // });

  // it("Exchange 10 USDC for SOL in Pool-A (Raydium)", async () => {
  //   const poolOwner = Harshit;
  //   const user = Virat;
  //   const amount = new anchor.BN(10 * 1e9);

  //   const [poolState] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("poolA"), poolOwner.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const [vaultAuth] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("vault_auth_a"), poolState.toBuffer()],
  //     program.programId
  //   );

  //   const poolBefore = await program.account.poolA.fetch(poolState);

  //   const userSolAta = await getOrCreateAssociatedTokenAccount(
  //     connection,
  //     user,
  //     sol_mint,
  //     user.publicKey
  //   );

  //   const userUsdcAta = await getOrCreateAssociatedTokenAccount(
  //     connection,
  //     user,
  //     usdc_mint,
  //     user.publicKey
  //   );

  //   await mintTo(
  //     connection,
  //     Harshit,
  //     usdc_mint,
  //     userUsdcAta.address,
  //     Harshit.publicKey,
  //     20 * 1e9
  //   );

  //   const ix1 = SystemProgram.transfer({
  //     fromPubkey: user.publicKey,
  //     toPubkey: userSolAta.address,
  //     lamports: 0.1 * LAMPORTS_PER_SOL,
  //   });
  //   const ix2 = createSyncNativeInstruction(userSolAta.address);
  //   const tx2 = new Transaction().add(ix1, ix2);
  //   await sendAndConfirmTransaction(connection, tx2, [user]);

  //   const userSolBefore = (await getAccount(connection, userSolAta.address))
  //     .amount;
  //   const userUsdcBefore = (await getAccount(connection, userUsdcAta.address))
  //     .amount;

  //   console.log(
  //     "Pool before: SOL",
  //     (Number(poolBefore.solPool) / 1e9).toString(),
  //     "USDC",
  //     (Number(poolBefore.usdcPool) / 1e9).toString()
  //   );
  //   console.log(
  //     "User before: SOL",
  //     (Number(userSolBefore) / 1e9).toString(),
  //     "USDC",
  //     (Number(userUsdcBefore) / 1e9).toString()
  //   );

  //   const tx = await program.methods
  //     .swapA(amount, true)
  //     .accounts({
  //       poolState: poolState,
  //       owner: poolOwner.publicKey,
  //       vaultAuthA: vaultAuth,
  //       user: user.publicKey,
  //       solAta: poolBefore.solVault,
  //       usdcAta: poolBefore.usdcVault,
  //       userSolAta: userSolAta.address,
  //       userUsdcAta: userUsdcAta.address,
  //       solMint: sol_mint,
  //       usdcMint: usdc_mint,
  //     })
  //     .signers([user])
  //     .rpc({ commitment: "confirmed" });

  //   await program.methods
  //     .updatePoolA()
  //     .accounts({
  //       poolState: poolState,
  //       admin: poolOwner.publicKey,
  //       solVault: poolBefore.solVault,
  //       usdcVault: poolBefore.usdcVault,
  //     })
  //     .signers([poolOwner])
  //     .rpc();

  //   const poolAfter = await program.account.poolA.fetch(poolState);
  //   const userSolAfter = (await getAccount(connection, userSolAta.address))
  //     .amount;
  //   const userUsdcAfter = (await getAccount(connection, userUsdcAta.address))
  //     .amount;

  //   console.log(
  //     "Pool after: SOL",
  //     (Number(poolAfter.solPool) / 1e9).toString(),
  //     "USDC",
  //     (Number(poolAfter.usdcPool) / 1e9).toString()
  //   );
  //   console.log(
  //     "User after: SOL",
  //     (Number(userSolAfter) / 1e9).toString(),
  //     "USDC",
  //     (Number(userUsdcAfter) / 1e9).toString()
  //   );
  //   console.log("tx:", tx);
  // });

  it("Exchange 10 USDC for SOL in Pool-B (Orca)", async () => {
    const poolOwner = Virat;
    const user = Harshit;
    const amount = new anchor.BN(10 * 1e9);

    const [poolState] = PublicKey.findProgramAddressSync(
      [Buffer.from("poolB"), poolOwner.publicKey.toBuffer()],
      program.programId
    );

    const [vaultAuth] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_auth_b"), poolState.toBuffer()],
      program.programId
    );

    const poolBefore = await program.account.poolB.fetch(poolState);

    const userSolAta = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      sol_mint,
      user.publicKey
    );

    const userUsdcAta = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      usdc_mint,
      user.publicKey
    );

    await mintTo(
      connection,
      Harshit,
      usdc_mint,
      userUsdcAta.address,
      Harshit.publicKey,
      20 * 1e9
    );

    const ix1 = SystemProgram.transfer({
      fromPubkey: user.publicKey,
      toPubkey: userSolAta.address,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    });
    const ix2 = createSyncNativeInstruction(userSolAta.address);
    const tx2 = new Transaction().add(ix1, ix2);
    await sendAndConfirmTransaction(connection, tx2, [user]);

    const userSolBefore = (await getAccount(connection, userSolAta.address))
      .amount;
    const userUsdcBefore = (await getAccount(connection, userUsdcAta.address))
      .amount;

    console.log(
      "Pool before: SOL",
      (Number(poolBefore.solPool) / 1e9).toString(),
      "USDC",
      (Number(poolBefore.usdcPool) / 1e9).toString()
    );
    console.log(
      "User before: SOL",
      (Number(userSolBefore) / 1e9).toString(),
      "USDC",
      (Number(userUsdcBefore) / 1e9).toString()
    );

    const tx = await program.methods
      .swapB(amount, true)
      .accounts({
        poolState: poolState,
        owner: poolOwner.publicKey,
        vaultAuthB: vaultAuth,
        user: user.publicKey,
        solAta: poolBefore.solVault,
        usdcAta: poolBefore.usdcVault,
        userSolAta: userSolAta.address,
        userUsdcAta: userUsdcAta.address,
        solMint: sol_mint,
        usdcMint: usdc_mint,
      })
      .signers([user])
      .rpc({ commitment: "confirmed" });

    await program.methods
      .updatePoolB()
      .accounts({
        poolState: poolState,
        admin: poolOwner.publicKey,
        solVault: poolBefore.solVault,
        usdcVault: poolBefore.usdcVault,
      })
      .signers([poolOwner])
      .rpc();

    const poolAfter = await program.account.poolB.fetch(poolState);
    const userSolAfter = (await getAccount(connection, userSolAta.address))
      .amount;
    const userUsdcAfter = (await getAccount(connection, userUsdcAta.address))
      .amount;

    console.log(
      "Pool after: SOL",
      (Number(poolAfter.solPool) / 1e9).toString(),
      "USDC",
      (Number(poolAfter.usdcPool) / 1e9).toString()
    );
    console.log(
      "User after: SOL",
      (Number(userSolAfter) / 1e9).toString(),
      "USDC",
      (Number(userUsdcAfter) / 1e9).toString()
    );
    console.log("tx:", tx);
  });
});
