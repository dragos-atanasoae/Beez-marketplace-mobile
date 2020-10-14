export class RegisterModel {
    email: string;
    // phoneNumber: string;
    password: string;
    confirmPassword: string;
    acceptTermsOfUse: boolean;
    confirmLegalAge: boolean; // over 18 years old
    promoCode: string;

    constructor() {}
}
