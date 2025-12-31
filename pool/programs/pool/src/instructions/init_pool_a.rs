use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount}};
use crate::states::PoolA;

#[derive(Accounts)]
pub struct InitPoolA<'info>{
    #[account(
        init , 
        payer = owner ,
        space = 8 + PoolA::INIT_SPACE ,
        seeds = [b"poolA" , owner.key().as_ref()] ,
        bump ,
    )]
    pub pool_state : Account<'info ,PoolA> ,
    #[account(mut)]
    pub owner : Signer<'info> ,

    /// CHECK: only for seed
    #[account(
        init ,
        payer = owner ,
        space = 8 ,
        seeds = [b"vault_auth_a" , pool_state.key().as_ref()] ,
        bump ,
    )]
    pub vault_auth_a : UncheckedAccount<'info> ,
    #[account(
        init_if_needed ,
        payer = owner ,
        associated_token::mint = sol_mint ,
        associated_token::authority = vault_auth_a ,
    )]
    pub sol_ata : Account<'info , TokenAccount> ,

    #[account(
        init_if_needed ,
        payer = owner ,
        associated_token::mint = usdc_mint ,
        associated_token::authority = vault_auth_a ,
    )]
    pub usdc_ata : Account<'info , TokenAccount > ,

    pub sol_mint : Account<'info , Mint > ,
    pub usdc_mint : Account<'info , Mint > ,
    pub system_program : Program<'info , System> ,
    pub token_program : Program<'info , Token > ,
    pub associated_token_program : Program<'info , AssociatedToken> ,
}

pub fn handler(ctx: Context<InitPoolA>, name: String) -> Result<()> {
    let pool = &mut ctx.accounts.pool_state;

    pool.admin = ctx.accounts.owner.key();
    pool.sol_vault = ctx.accounts.sol_ata.key();
    pool.usdc_vault = ctx.accounts.usdc_ata.key();
    pool.name = name;
    pool.bump = ctx.bumps.pool_state ;
    pool.sol_pool = ctx.accounts.sol_ata.amount;
pool.usdc_pool = ctx.accounts.usdc_ata.amount;

    pool.vault_bump = ctx.bumps.vault_auth_a ;
    Ok(())
}
