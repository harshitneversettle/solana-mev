use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PoolB{
    pub admin : Pubkey ,
    #[max_len(100) ]
    pub name : String , 
    pub usdc_vault : Pubkey ,
    pub sol_vault : Pubkey ,
    pub sol_pool : u64 ,
    pub usdc_pool : u64 ,
    pub fee : u32 ,
    pub bump : u8 ,
    pub vault_bump : u8 ,
}