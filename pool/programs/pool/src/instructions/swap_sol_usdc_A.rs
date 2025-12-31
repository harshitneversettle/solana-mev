use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::pool;
use crate::states::PoolA;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct SwapA<'info>{
    #[account(
        mut ,
        seeds = [b"poolA" , owner.key().as_ref()] ,
        bump ,
    )]
    pub pool_state : Account<'info ,PoolA> ,

    /// CHECK: only for seed 
    #[account()]
    pub owner: UncheckedAccount<'info>,

    /// CHECK: only for seed
    #[account(
        mut ,
        seeds = [b"vault_auth_a" , pool_state.key().as_ref()] ,
        bump = pool_state.vault_bump ,
    )]
    pub vault_auth_a : UncheckedAccount<'info> ,

    #[account(mut)]
    pub user : Signer<'info> ,

    #[account(
        mut ,
        associated_token::mint = sol_mint ,
        associated_token::authority = vault_auth_a ,
    )]
    pub sol_ata : Account<'info , TokenAccount> ,

    #[account(
        mut , 
        associated_token::mint = usdc_mint ,
        associated_token::authority = vault_auth_a ,
    )]
    pub usdc_ata : Account<'info , TokenAccount > ,

    #[account(
        mut , 
        associated_token::mint = sol_mint ,
        associated_token::authority = user ,
    )]
    pub user_sol_ata : Account<'info , TokenAccount> ,

    #[account(
        mut , 
        associated_token::mint = usdc_mint ,
        associated_token::authority = user ,
    )]
    pub user_usdc_ata : Account<'info , TokenAccount> ,

    #[account(mut)]
    pub usdc_mint : Account<'info , Mint > ,

    #[account(mut)]
    pub sol_mint : Account<'info , Mint > ,


    pub system_program : Program<'info , System> ,
    pub token_program : Program<'info , Token >
} 

pub fn handler(ctx: Context<SwapA> , amount : u64 , swap_usdc : bool ) -> Result<()> {    // amount sol -> usdc 
    let pool_state = &mut ctx.accounts.pool_state ;
    let owner = ctx.accounts.owner.key() ;
    require!(amount > 0 , ErrorCode::InvalidAmount) ;
    if swap_usdc {
        usdc_sol(ctx, amount)?;
    }else {
        sol_usdc(ctx, amount)?;
    }
    Ok(())
}

pub fn usdc_sol(ctx: Context<SwapA> , amount : u64)->Result<()>{
    let pool_state = &mut ctx.accounts.pool_state ;
    let vault_auth_a = &ctx.accounts.vault_auth_a ;
    let pool_state_key = pool_state.key();
    let owner = ctx.accounts.owner.key() ;
    let pool_sol = pool_state.sol_pool;
    let pool_usdc = pool_state.usdc_pool; 
    let k = (pool_sol as u128).checked_mul(pool_usdc as u128).expect("erorr");
    let mut net_corresponding_sol = 0 as u64 ;
    let signer_seeds : &[&[&[u8]]] = &[&[
        b"vault_auth_a" , 
        pool_state_key.as_ref() ,
        &[pool_state.vault_bump]
    ]];
    // => usdc will increase ans sol will decrease 
        let usdc_new = (pool_usdc as u128).checked_add(amount as u128).expect("overflow") ;
        let sol_new = k.checked_div(usdc_new as u128).unwrap() ;
        net_corresponding_sol = (pool_sol).checked_sub(sol_new as u64).expect("error") ;

        require!(net_corresponding_sol > 0 , ErrorCode::InvalidAmount) ;
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
            authority : vault_auth_a.to_account_info()
        } ;
        let cpi_ctx2 = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_accounts2, signer_seeds) ;
        token::transfer(cpi_ctx2, net_corresponding_sol) ;

        pool_state.sol_pool = pool_sol
        .checked_sub(net_corresponding_sol)
        .ok_or(ErrorCode::InvalidAmount)?;
        pool_state.usdc_pool = pool_usdc
            .checked_add(amount)
            .ok_or(ErrorCode::InvalidAmount)?;
    Ok(())
}

pub fn sol_usdc(ctx: Context<SwapA> , amount : u64)->Result<()>{
    let pool_state = &mut ctx.accounts.pool_state ;
    let vault_auth_a = &ctx.accounts.vault_auth_a ;
    let pool_state_key = pool_state.key();
    let owner = ctx.accounts.owner.key() ;
    let pool_sol = pool_state.sol_pool;
    let pool_usdc = pool_state.usdc_pool;
    let k = (pool_sol as u128).checked_mul(pool_usdc as u128).expect("erorr");
    let mut net_corresponding_usdc = 0 as u64 ;
    let signer_seeds : &[&[&[u8]]] = &[&[
        b"vault_auth_a" , 
        pool_state_key.as_ref() ,
        &[pool_state.vault_bump]
    ]];
    // => sol will increase ans usdc will decrease 
        let sol_new = (pool_sol as u128).checked_add(amount as u128).expect("overflow") ;
        let usdc_new = k.checked_div(sol_new as u128).unwrap() ;
        net_corresponding_usdc = (pool_usdc).checked_sub(usdc_new as u64).expect("error") ;

        require!(net_corresponding_usdc > 0 , ErrorCode::InvalidAmount) ;
        // user -> pool 
        let transfer_accounts = Transfer{
            from : ctx.accounts.user_sol_ata.to_account_info() ,
            to : ctx.accounts.sol_ata.to_account_info() ,
            authority : ctx.accounts.user.to_account_info() ,
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts) ;
        token::transfer(cpi_ctx, amount) ;

        let transfer_accounts2 = Transfer{
            from : ctx.accounts.usdc_ata.to_account_info() ,
            to : ctx.accounts.user_usdc_ata.to_account_info() ,
            authority : vault_auth_a.to_account_info()
        } ;
        let cpi_ctx2 = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_accounts2, signer_seeds) ;
        token::transfer(cpi_ctx2, net_corresponding_usdc) ;

        pool_state.sol_pool = pool_sol
        .checked_add(amount)
        .ok_or(ErrorCode::InvalidAmount)?;
    pool_state.usdc_pool = pool_usdc
        .checked_sub(net_corresponding_usdc)
        .ok_or(ErrorCode::InvalidAmount)?;
    
    Ok(())
}
