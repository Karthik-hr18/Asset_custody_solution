#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, log, symbol_short, Address, Env, Symbol,
};

// ----------------------------------------------------------
// 📦 Data Structures
// ----------------------------------------------------------

#[contracttype]
#[derive(Clone)]
pub struct CustodyAccount {
    pub owner: Address,
    pub balance: i128,
    pub required_signatures: u32,
    pub is_insured: bool,
    pub is_active: bool,
}

// Key mapping type for storage
#[contracttype]
pub enum CustodyBook {
    Account(Address),
}

// Global key for total custody accounts counter
const TOTAL_ACCOUNTS: Symbol = symbol_short!("TOT_ACC");

// ----------------------------------------------------------
// ⚙️ Contract Definition
// ----------------------------------------------------------

#[contract]
pub struct AssetCustodyContract;

#[contractimpl]
impl AssetCustodyContract {
    /// Create a new custody account.
    ///
    /// Requirements:
    /// - The caller must authorize the call (`require_auth()`).
    /// - Minimum `required_signatures` is 2 for multi-sig safety.
    pub fn create_custody_account(
        env: Env,
        owner: Address,
        required_signatures: u32,
        insurance: bool,
    ) -> bool {
        owner.require_auth();

        let account_key = CustodyBook::Account(owner.clone());

        // Reject duplicates
        if env.storage().instance().has(&account_key) {
            log!(&env, "⚠️ Custody account already exists");
            return false;
        }

        if required_signatures < 2 {
            panic!("❌ Multi-sig requires at least 2 signatures");
        }

        let account = CustodyAccount {
            owner: owner.clone(),
            balance: 0,
            required_signatures,
            is_insured: insurance,
            is_active: true,
        };

        env.storage().instance().set(&account_key, &account);

        // Update total account counter
        let mut total: u64 = env.storage().instance().get(&TOTAL_ACCOUNTS).unwrap_or(0);
        total += 1;
        env.storage().instance().set(&TOTAL_ACCOUNTS, &total);

        // Extend storage life
        env.storage().instance().extend_ttl(5000, 5000);

        log!(&env, "✅ Custody account created for {}", owner);
        true
    }

    /// Deposit assets into a custody account.
    ///
    /// Requirements:
    /// - Caller must be the account owner.
    /// - Amount must be positive.
    pub fn deposit_assets(env: Env, owner: Address, amount: i128) -> bool {
        owner.require_auth();

        if amount <= 0 {
            panic!("❌ Deposit amount must be positive");
        }

        let account_key = CustodyBook::Account(owner.clone());
        let mut account: CustodyAccount = env
            .storage()
            .instance()
            .get(&account_key)
            .unwrap_or_else(|| panic!("⚠️ Custody account not found"));

        if !account.is_active {
            panic!("⚠️ Custody account is not active");
        }

        account.balance += amount;
        env.storage().instance().set(&account_key, &account);
        env.storage().instance().extend_ttl(5000, 5000);

        log!(
            &env,
            "💰 Deposit successful. New balance: {} XLM",
            account.balance
        );
        true
    }

    /// Withdraw assets with multi-signature verification.
    ///
    /// Requirements:
    /// - Caller must be the account owner.
    /// - Signatures count must meet required threshold.
    /// - Sufficient balance must exist.
    pub fn withdraw_assets(
        env: Env,
        owner: Address,
        amount: i128,
        signatures_count: u32,
    ) -> bool {
        owner.require_auth();

        if amount <= 0 {
            panic!("❌ Withdrawal amount must be positive");
        }

        let account_key = CustodyBook::Account(owner.clone());
        let mut account: CustodyAccount = env
            .storage()
            .instance()
            .get(&account_key)
            .unwrap_or_else(|| panic!("⚠️ Custody account not found"));

        if !account.is_active {
            panic!("⚠️ Custody account inactive");
        }

        if signatures_count < account.required_signatures {
            panic!(
                "🚫 Insufficient signatures. Required: {}, Provided: {}",
                account.required_signatures, signatures_count
            );
        }

        if account.balance < amount {
            panic!("🚫 Insufficient balance for withdrawal");
        }

        account.balance -= amount;
        env.storage().instance().set(&account_key, &account);
        env.storage().instance().extend_ttl(5000, 5000);

        log!(
            &env,
            "✅ Withdrawal of {} XLM successful. Remaining: {}",
            amount,
            account.balance
        );
        true
    }

    /// View custody account details.
    pub fn view_custody_account(env: Env, owner: Address) -> CustodyAccount {
        let account_key = CustodyBook::Account(owner.clone());

        env.storage().instance().get(&account_key).unwrap_or(CustodyAccount {
            owner: owner.clone(),
            balance: 0,
            required_signatures: 0,
            is_insured: false,
            is_active: false,
        })
    }

    /// Get total number of custody accounts created (global metric).
    pub fn total_accounts(env: Env) -> u64 {
        env.storage().instance().get(&TOTAL_ACCOUNTS).unwrap_or(0)
    }
}
