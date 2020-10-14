export class WalletModel {
    // General
    paid: number;
    panding: number;
    available: number;
    eval: number;
    // Commisions(cashback)
    aproved: number;
    availableCashback: number;
    pendingCashback: number;
    totalCashback: number;
    canceledCashback: number;
    // Invite&Earn
    invitationsAvailableSum: number;
    invitationsCount: number;
    invitationsPendingSum: number;
    // Beez Pay money
    maxBeezPay: number;
    lockedBeezPay: number;
    availableBeezPay: number;
    totalGuarantees: number;
    // Beez Pay product value
    paidBeezPay: number;
    totalBeezPay: number;
    total: number; // total value of wallet(cashback + bonuses + invite&earn)
    totalBonusesAvailable: number;

    constructor() {}
}
