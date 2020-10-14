export class CardPaymentModel {
    Tag: string;
    SetRecurrence: boolean;
    RecurrenceType: string;
    Week: number;
    Day: number;
    Currency: string;
    Amount: number;
    BillingType: string;
    FirstName: string;
    LastName: string;
    EmailAddress: string;
    Address: string;
    MobilPhone: string;

    constructor() {
        this.SetRecurrence = false;
        this.RecurrenceType = 'Weekly';
        this.Week = 0;
        this.Day = 0;
        this.Currency = 'RON';
        this.Amount = null;
        this.BillingType = '';
        this.FirstName = '';
        this.LastName = '';
        this.Tag = '';
        this.EmailAddress = '';
        this.Address = '';
        this.MobilPhone = '';
    }
}
