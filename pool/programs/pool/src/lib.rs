use anchor_lang::prelude::*;

mod instructions;
use instructions::*;
pub mod error; 
use error::ErrorCode;

mod states;
use states::*; 
declare_id!("BLBysPbLSYXUjwXY3hJhjLqUwAJ8F3i6Yw7C2ZzA1otp");

#[program]
pub mod pool {
    use super::*;

    pub fn init_pool_a(ctx: Context<InitPoolA> , name : String) -> Result<()> {
        instructions::init_pool_a::handler(ctx , name) ;
        Ok(())
    }

    pub fn init_pool_b(ctx: Context<InitPoolB> , name : String) -> Result<()> {
        instructions::init_pool_b::handler(ctx , name) ;
        Ok(())
    }

    pub fn swap_a(ctx: Context<SwapA> , amount : u64 , swap_usdc : bool) -> Result<()> {
        instructions::swap_sol_usdc_A::handler(ctx , amount , swap_usdc) ;
        Ok(())
    }
    pub fn update_pool_a(ctx: Context<UpdatePoolA>) -> Result<()> {
    instructions::update_pool_a::handler(ctx)
    }

    pub fn swap_b(ctx: Context<SwapB> , amount : u64 , swap_usdc : bool) -> Result<()> {
        instructions::swap_sol_usdc_B::handler(ctx , amount , swap_usdc) ;
        Ok(())
    }


    pub fn update_pool_b(ctx: Context<UpdatePoolB>) -> Result<()> {
        instructions::update_pool_b::handler(ctx)
    }

}
