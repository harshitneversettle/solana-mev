use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::states::Pool;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Swap<'info>{
    #[account(
        mut ,
        seeds = [b"pool" , owner.key().as_ref()] ,
        bump ,
    )]
    pub pool_state : Account<'info ,Pool> ,

    /// CHECK: only for seed 
    #[account()]
    pub owner: UncheckedAccount<'info>,

    #[account(mut)]
    pub user : Signer<'info> ,

    #[account(mut)]
    pub sol_ata : Account<'info , TokenAccount> ,

    #[account(mut)]
    pub usdc_ata : Account<'info , TokenAccount > ,

    #[account(mut)]
    pub user_sol_ata : Account<'info , TokenAccount> ,

    #[account(mut)]
    pub user_usdc_ata : Account<'info , TokenAccount> ,

    pub system_program : Program<'info , System> ,
    pub token_program : Program<'info , Token >
}

pub fn handler(ctx: Context<Swap> , amount : u64 , swap_usdc : bool ) -> Result<()> {    // amount sol -> usdc 
    let pool_state = &mut ctx.accounts.pool_state ;
    let owner = ctx.accounts.owner.key() ;
    require!(amount > 0 , ErrorCode::InvalidAmount) ;
    let amount_decimals = amount.checked_mul(1e9 as u64).expect("Overflow") ;

    let signer_seeds : &[&[&[u8]]] = &[&[
        b"pool" , 
        owner.as_ref() ,
        &[ctx.bumps.pool_state]
    ]];
    let mut pool_sol = pool_state.sol_pool ;
    let mut pool_usdc = pool_state.usdc_pool ;
    let k = pool_sol.checked_mul(pool_usdc).expect("erorr") as u128 ;
    let mut net_corresponding_sol = 0 as u64 ;

    if swap_usdc {
        // => usdc will increase ans sol will decrease 
        let usdc_new = pool_usdc.checked_add(amount).expect("overflow") ;
        let sol_new = k.checked_div(usdc_new as u128).unwrap() ;
        net_corresponding_sol = pool_sol.checked_sub(sol_new as u64 ).expect("error") ;

        // user -> pool 
        let transfer_accounts = Transfer{
            from : ctx.accounts.user_usdc_ata.to_account_info() ,
            to : ctx.accounts.usdc_ata.to_account_info() ,
            authority : ctx.accounts.user.to_account_info() ,
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts) ;
        token::transfer(cpi_ctx, amount) ;

        let transfer_accounts2 = Transfer{
            from : ctx.accounts.sol_ata.to_account_info() ,
            to : ctx.accounts.user_sol_ata.to_account_info() ,
            authority : pool_state.to_account_info()
        } ;
        let cpi_ctx2 = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_accounts2, signer_seeds) ;
        token::transfer(cpi_ctx2, net_corresponding_sol) ;

        pool_sol = pool_sol.checked_sub(net_corresponding_sol).expect("overflow") ;
        pool_usdc = pool_usdc.checked_add(amount).expect("overflow") ;
        pool_state.sol_pool = pool_sol ;
        pool_state.usdc_pool = pool_usdc ;

    }
    
    Ok(())
}
