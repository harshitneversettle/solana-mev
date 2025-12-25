use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::states::Pool;

#[derive(Accounts)]
pub struct InitPool<'info>{
    #[account(
        init , 
        payer = owner ,
        space = 8 + Pool::INIT_SPACE ,
        seeds = [b"pool" , owner.key().as_ref()] ,
        bump ,
    )]
    pub pool_state : Account<'info ,Pool> ,
    #[account(mut)]
    pub owner : Signer<'info> ,
    #[account(mut)]
    pub sol_Ata : Account<'info , TokenAccount> ,
    #[account(mut)]
    pub usdc_Ata : Account<'info , TokenAccount > ,
    pub system_program : Program<'info , System> ,
    pub token_account : Program<'info , Token >
}

pub fn handler(ctx: Context<InitPool>, name: String) -> Result<()> {
    let pool = &mut ctx.accounts.pool_state;

    pool.admin = ctx.accounts.owner.key();
    pool.sol_vault = ctx.accounts.sol_Ata.key();
    pool.usdc_vault = ctx.accounts.usdc_Ata.key();
    pool.name = name;
    pool.bump = ctx.bumps.pool_state ;
    pool.sol_pool = 0 ;
    pool.usdc_pool = 0 ;
    Ok(())
}
