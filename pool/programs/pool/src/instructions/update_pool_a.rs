use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use crate::states::PoolA;

#[derive(Accounts)]
pub struct UpdatePoolA<'info> {
    #[account(
        mut,
        seeds = [b"poolA", admin.key().as_ref()],
        bump = pool_state.bump,
    )]
    pub pool_state: Account<'info, PoolA>,
    
    pub admin: Signer<'info>,
    
    #[account(
        constraint = sol_vault.key() == pool_state.sol_vault
    )]
    pub sol_vault: Account<'info, TokenAccount>,
    
    #[account(
        constraint = usdc_vault.key() == pool_state.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
}

pub fn handler(ctx: Context<UpdatePoolA>) -> Result<()> {
    let pool = &mut ctx.accounts.pool_state;
    pool.sol_pool = ctx.accounts.sol_vault.amount;
    pool.usdc_pool = ctx.accounts.usdc_vault.amount;
    Ok(())
}
