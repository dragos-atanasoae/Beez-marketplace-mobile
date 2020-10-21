import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { Country } from 'src/app/validators/country.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { AccountValidationService } from 'src/app/services/account-validation.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastController } from '@ionic/angular';
import { PhoneValidator } from 'src/app/validators/phone.validator';
import { trigger, transition, useAnimation } from '@angular/animations';
import { shake } from 'ng-animate';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.scss'],
  animations: [
    trigger('animationError', [
      transition(':enter', useAnimation(shake), {
        params: { timing: 0.8, delay: 0.3 }
      }),
    ]),
  ]
})
export class PhoneVerificationComponent implements OnInit {
  @Input() existentPhoneNumber: string;
  @Output() verifiedPhoneNumber = new EventEmitter<string>();

  country: string;
  currentIndex = 0;
  phoneNumber: string;
  invalidCodeMsg = '';
  userErrorMsg = ''; // error message when user press more than 3 time validate number or resend code
  phoneNumberAlreadyUsed = false;
  codeIsValid: boolean = null;
  resendCodeDisabled = false;
  verifyNumberDisabled = false;
  countdownBeforeResendCode = 0;
  countdownBeforeVerifyNumberAgain = 0;
  countResendCodeAction = 0;
  intervalId: any;
  waitingForConfirmationCode = false;

  countries = [
    new Country('RO', 'Romania'),
    new Country('GB', 'United Kingdom'),
    // new Country('CA', 'Canada')
  ];
  selectedCountry: any = {
    code: '+44',
    iso: 'GB',
    name: 'United Kingdom',
    sampleFixedPhone: '0121 234 5678',
    sampleMobilePhone: '07400 123456'
  };

  phoneNumberUtil = PhoneNumberUtil.getInstance();
  countryPhoneGroup: FormGroup;
  validationCode: FormControl;
  phone: any;

  validationMessages = {
    phone: [
      { type: 'required', message: 'Phone is required' },
      { type: 'validCountryPhone', message: 'Phone incorrect for the country selected' }
    ]
  };
  helloUserName = '';
  email = '';
  eventContext = 'Phone Validation';

  constructor(
    private analyticsService: AnalyticsService,
    private loadingService: LoadingService,
    private toastCtrl: ToastController,
    private accountValidationService: AccountValidationService,
    private translate: TranslateService,

  ) {
    this.country = localStorage.getItem('country');
    this.switchCountryPhoneNumberFormat();
    this.validationCode = new FormControl('', {
      validators: Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ])
    });
  }

  ngOnInit() {
    console.log(this.existentPhoneNumber);
    // country & phone validation
    const countryForm = new FormControl(this.country === 'uk' ? this.countries[1] : this.countries[0], Validators.required);
    const phoneForm = new FormControl('', {
      validators: Validators.compose([
        Validators.required,
        PhoneValidator.validCountryPhone(countryForm)
      ])
    });

    this.validationCode.valueChanges.subscribe(data => {
      console.log(data, this.validationCode.valid);
      this.codeIsValid = true;
      this.invalidCodeMsg = '';
    });

    this.countryPhoneGroup = new FormGroup({
      country: countryForm,
      phone: phoneForm
    });

    if (this.existentPhoneNumber) {
      this.countryPhoneGroup.patchValue({phone: this.existentPhoneNumber});
      this.countryPhoneGroup.disable();
    }

    this.countryPhoneGroup.valueChanges.subscribe(data => {
      console.log(data);
      console.log('Country: ', this.countryPhoneGroup.value.country);
      this.selectedCountry = this.countryPhoneGroup.value.country;
    });
  }

  /**
   * @name switchCountryPhoneNumberFormat
   * @description Get the country of active session and select the right phone format for the input/placeholder
   */
  switchCountryPhoneNumberFormat() {
    switch (this.country) {
      case 'ro':
        this.selectedCountry = {
          code: '+40',
          iso: 'RO',
          name: 'Romania',
          sampleFixedPhone: '021 123 4567',
          sampleMobilePhone: '0712 345 678',
        };
        break;
      case 'uk':
        this.selectedCountry = {
          code: '+44',
          iso: 'GB',
          name: 'United Kingdom',
          sampleFixedPhone: '0121 234 5678',
          sampleMobilePhone: '07400 123456'
        };
        break;
    }
  }

  /**
   * @name VerifyNumber
   * @description send the number to be checked
   * @param phoneNumber
   */
  verifyNumber(isResend?: boolean) {
    this.loadingService.presentLoading();
    this.invalidCodeMsg = '';
    this.validationCode.reset();
    const phone = this.countryPhoneGroup.get('phone').value;
    // check if user try to validate the same phone number
    if (phone === this.phoneNumber) {
      this.countResendCodeAction++;
    } else { // reset  vars when user try another number
      this.countResendCodeAction = 0;
      this.resendCodeDisabled = false;
      this.userErrorMsg = '';
    }
    this.phoneNumber = phone;

    let formatedPhoneNumber = '';
    switch (this.selectedCountry.iso) {
      case 'RO':
        formatedPhoneNumber = this.phoneNumber.slice(this.phoneNumber.length - 9);
        break;
      case 'GB':
        formatedPhoneNumber = this.phoneNumber.slice(this.phoneNumber.length - 10);
        break;
      default:
        break;
    }

    this.phoneNumber = this.selectedCountry.code + formatedPhoneNumber;

    if (this.countResendCodeAction <= 3) {
      this.analyticsService.logEvent('send_phone_number', { context: this.eventContext });
      this.accountValidationService.verifyNumber(this.phoneNumber)
        .subscribe((response) => {
          // "TagIsNull", "CreatedAndSent", "NumberAlreadyUsed", "phoneNumber Is To Short"
          switch (response) {
            case 'CreatedAndSent':
              this.waitingForConfirmationCode = true;
              this.countResendCodeAction++;
              if (!isResend) {
                this.verifyNumberDisabled = true;
                this.countdownBeforeVerifyNumberAgain = 30 * this.countResendCodeAction;
                this.intervalId = setInterval(() => {
                  this.countdownBeforeVerifyNumberAgain--;
                  if (this.countdownBeforeVerifyNumberAgain < 0) {
                    this.verifyNumberDisabled = false;
                    clearInterval(this.intervalId);
                    this.intervalId = -1;
                  }
                }, 1000);
              }
              break;
            case 'NumberAlreadyUsed':
              this.phoneNumberAlreadyUsed = true;
              this.presentToast(this.translate.instant('components.accountValidation.messagePhoneAlreadyUsed'));
              break;
            case 'phoneNumber Is To Short':
              console.log('Phone number is to short');
              this.presentToast(this.translate.instant('components.accountValidation.userErrorMsg'));
              break;
            default:
              console.log('Error on verify phone number');
              this.presentToast(this.translate.instant('components.accountValidation.userErrorMsg'));
              break;
          }
          this.loadingService.dismissLoading();
        }, () => this.loadingService.dismissLoading());
    } else {
      // error message when user press more than 3 time validate number or resend code
      this.userErrorMsg = this.translate.instant('components.accountValidation.userErrorMsg');
      this.resendCodeDisabled = true;
      this.loadingService.dismissLoading();
    }
  }

  /**
   * @name verifyCode
   * @description send the code to be verified
   */
  verifyCode() {
    this.loadingService.presentLoading();
    this.analyticsService.logEvent('send_validation_code', { context: this.eventContext });
    this.accountValidationService.verifyCode(this.validationCode.value, this.phoneNumber)
      .subscribe((response) => {
        switch (response) {
          case 'CodeIsValidated':
            this.invalidCodeMsg = '';
            this.codeIsValid = true;
            this.verifiedPhoneNumber.emit(this.phoneNumber);
            this.existentPhoneNumber = this.phoneNumber;
            this.waitingForConfirmationCode = false;
            this.countryPhoneGroup.disable();
            this.analyticsService.logEvent('phone_validated', { context: this.eventContext });
            break;
          case 'AnErrorOcurred':
            this.invalidCodeMsg = this.translate.instant('components.accountValidation.invalidCodeMsg');
            if (this.resendCodeDisabled && this.countdownBeforeResendCode < 10) {
              this.countdownBeforeResendCode = this.countdownBeforeResendCode + 10 * this.countResendCodeAction;
            }
            this.codeIsValid = false;
            this.analyticsService.logEvent('phone_validation_error', { context: this.eventContext, error: response });
            break;
          default:
            console.log('Error on verify the validation code');
            break;
        }
        this.loadingService.dismissLoading();
      }, () => this.loadingService.dismissLoading());
  }

  resendVerificationCode() {
    this.countResendCodeAction++;
    if (this.countResendCodeAction <= 3) {
      this.countdownResendCode(10);
      this.verifyNumber(true);
    } else {
      this.userErrorMsg = this.translate.instant('components.accountValidation.userErrorMsg');
    }
  }

  countdownResendCode(time: number) {
    this.resendCodeDisabled = true;
    this.countdownBeforeResendCode = time * this.countResendCodeAction;
    this.intervalId = setInterval(() => {
      this.countdownBeforeResendCode--;
      if (this.countdownBeforeResendCode < 0) {
        this.resendCodeDisabled = false;
        clearInterval(this.intervalId);
        this.intervalId = -1;
      }
    }, 1000);
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 6000,
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: () => this.toastCtrl.dismiss()
      }],
      cssClass: 'custom_toast'
    });
    toast.present();
  }

}
