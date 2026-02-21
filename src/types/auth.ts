export enum AdminRole {
    ROOT = 'ROOT',                               // Ultimate founder (can manage admins)
    SUPER_ADMIN = 'SUPER_ADMIN',                 // Can manage Wallet + TrainCredit + Issue Refunds
    TRAINCREDIT_MANAGER = 'TRAINCREDIT_MANAGER', // B2B access only (Merchant management)
    WALLET_MANAGER = 'WALLET_MANAGER',           // B2C access only (User & Card management)
}

export interface AdminProfile {
    uid: string;
    email: string;
    displayName: string;
    role: AdminRole;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string;
}
