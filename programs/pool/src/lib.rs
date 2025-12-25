use anchor_lang::prelude::*;

mod instructions;
use instructions::*;
pub mod error; 
use error::ErrorCode;

mod states;
use states::*; 
declare_id!("7yVCR76dY28qYyxjcJMDLHqmQ5Z4nHef3muRYhzXGzDn");

#[program]
pub mod pool {
    use super::*;

    pub fn init_pool(ctx: Context<InitPool> , name : String) -> Result<()> {
        instructions::init_pool::handler(ctx , name) ;
        Ok(())
    }
}
