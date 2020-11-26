import { style } from '@angular/animations';
import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit, OnDestroy, Output, EventEmitter, NgZone } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LoadingService } from 'src/app/services/loading.service';
import { ModalController, ToastController, LoadingController, Platform } from '@ionic/angular';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { TranslateService } from '@ngx-translate/core';
import { StripeCardPaymentModel } from 'src/app/models/stripeCardPayment.model';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
declare var Stripe;
const { Keyboard } = Plugins;
@Component({
  selector: 'app-stripe-add-payment-method',
  templateUrl: './stripe-add-payment-method.component.html',
  styleUrls: ['./stripe-add-payment-method.component.scss'],
})
export class StripeAddPaymentMethodComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cardNumberElement') cardNumberElement: ElementRef;
  @ViewChild('cardExpiryElement') cardExpiryElement: ElementRef;
  @ViewChild('cardCvcElement') cardCvcElement: ElementRef;
  @Input() paymentDetails: any;
  @Input() donationDetails: any;
  @Output() eventNewPaymentMethodAdded = new EventEmitter<object>();
  private unsubscribe$: Subject<boolean> = new Subject();
  localeData = new LocaleDataModel();

  stripe = Stripe(environment.stripeToken, { locale: 'ro' });
  cardNumber;
  cardExpiry;
  cardCvc;

  cardErrors = {
    cardNumberErrors: null,
    cardNumberComplete: false,
    cardExpiryErrors: null,
    cardExpiryComplete: false,
    cardCvcErrors: null,
    cardCvcComplete: false
  };
  cardHolder: FormControl;
  formNotValid = true;

  amountToPay: FormControl;
  showAmountToPayInput = false;
  paymentMethods = [];
  prevPaymentMethods = [];
  isKeyboardActive = false;
  isCardHolderActive = false;
  disableButton = false;
  eventContext = 'Add Card';

  constructor(
    public platform: Platform,
    public zone: NgZone,
    private loadingService: LoadingService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private internationalizationService: InternationalizationService,
    private stripePaymentService: StripePaymentService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.amountToPay = new FormControl(((this.paymentDetails.transactionType === 'upFront' || this.paymentDetails.payNow) ? this.paymentDetails.amount : null),
      Validators.compose([Validators.required, Validators.min(2)]));
    if (this.paymentDetails.productType === 'ShopCart' || this.paymentDetails.payNow || this.paymentDetails.transactionType === 'upFront') {
      this.amountToPay.setValue(this.paymentDetails.amount);
      console.log('Amount to pay: ', this.amountToPay.value);
    }
    this.initializeProductType();
    this.cardHolder = new FormControl('', Validators.required);
    console.log(this.paymentDetails);
    this.getPaymentMethods();
    this.stripePaymentService.getPaymentMethods('initialize');

    this.getPaymentMethods();
    // Listen for show/hide keyboard to hide the slide navigation buttons
    if (!this.platform.is('desktop')) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.zone.run(() => {
          this.isKeyboardActive = true;
        });
      });
      Keyboard.addListener('keyboardDidHide', () => {
        this.zone.run(() => {
          this.isKeyboardActive = false;
          this.isCardHolderActive = false;
        });
      });
    }
    console.log(this.paymentDetails);
  }

  ngAfterViewInit() {
    this.initializeStripeElementsForm();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
    if (this.cardNumber) {
      this.cardNumber.destroy();
    }
    if (this.cardExpiry) {
      this.cardExpiry.destroy();
    }
    if (this.cardCvc) {
      this.cardCvc.destroy();
    }
  }

  getPaymentMethods() {
    this.stripePaymentService.oldPaymentMethodsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => { console.log(res); this.prevPaymentMethods = res; });
    this.stripePaymentService.paymentMethodsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => { console.log(res); this.paymentMethods = res.reverse(); });
    console.log('List of cards from Stripe: ', this.paymentMethods);
  }

  initializeStripeElementsForm() {
    const elements = this.stripe.elements({ locale: 'ro' });
    const classes = {
      base: 'stripe_input_base',
      complete: '',
      empty: '',
      focus: 'stripe_input_focus',
      invalid: 'stripe_input_invalid'
    };

    const styles = {
      base: {
        iconColor: '#636363',
        color: '#636363',

        '::placeholder': {
          color: '#aca8a8'
        }
      },
    };

    this.cardNumber = elements.create('cardNumber', { placeholder: 'Card number', showIcon: true, iconStyle: 'solid', classes, style: styles });
    this.cardNumber.mount(this.cardNumberElement.nativeElement);
    this.cardNumber.addEventListener('change', ({ elementType, complete, error }) => {
      this.onChangeStripeElement(elementType, complete, error);
    });

    this.cardExpiry = elements.create('cardExpiry', { placeholder: 'Expiry date', classes, style: styles });
    this.cardExpiry.mount(this.cardExpiryElement.nativeElement);
    this.cardExpiry.addEventListener('change', ({ elementType, complete, error }) => {
      this.onChangeStripeElement(elementType, complete, error);
    });

    this.cardCvc = elements.create('cardCvc', { placeholder: 'Code CVC', classes, style: styles });
    this.cardCvc.mount(this.cardCvcElement.nativeElement);
    this.cardCvc.addEventListener('change', ({ elementType, complete, error }) => {
      this.onChangeStripeElement(elementType, complete, error);
    });
    this.onBlur();
    this.onFocus();
  }

  onChangeStripeElement(elementType: string, complete: boolean, error: any) {
    switch (elementType) {
      case 'cardNumber':
        this.cardErrors.cardNumberErrors = error !== undefined ? error.message : null;
        this.cardErrors.cardNumberComplete = complete;
        break;
      case 'cardExpiry':
        this.cardErrors.cardExpiryErrors = error !== undefined ? error.message : null;
        this.cardErrors.cardExpiryComplete = complete;
        break;
      case 'cardCvc':
        this.cardErrors.cardCvcErrors = error !== undefined ? error.message : null;
        this.cardErrors.cardCvcComplete = complete;
        break;
    }
    if (this.cardErrors.cardNumberErrors == null && this.cardErrors.cardExpiryErrors == null && this.cardErrors.cardCvcErrors == null) {
      if ((!this.cardErrors.cardNumberComplete || !this.cardErrors.cardExpiryComplete || !this.cardErrors.cardCvcComplete)) {
        this.formNotValid = true;
      } else {
        this.formNotValid = false;
      }
    } else {
      console.log(this.cardErrors);
      this.formNotValid = true;
    }
  }

  initializeProductType() {
    switch (this.paymentDetails.productType) {
      case 'ProductObjective':
        this.amountToPay.setValue(this.paymentDetails.amount);
        break;
      case 'OnlineBeezPayOrder':
        this.amountToPay.setValue(this.paymentDetails.amount);
        break;
      case 'Voucher':
        this.amountToPay.setValue(this.paymentDetails.amount);
        break;
      case 'ShopCart':
        this.amountToPay.setValue(this.paymentDetails.amount);
        break;
      case 'Donation':
        this.amountToPay.setValue(null);
        this.showAmountToPayInput = true;
        break;
      default:
        this.amountToPay.setValue(null);
        break;
    }
  }

  /**
   * @description Create a Stripe token for add payment method
   */
  async createStripeToken() {
    this.loadingService.presentLoading(true);
    const { token, error } = await this.stripe.createToken(this.cardNumber);
    if (token) {
      console.log(this.paymentDetails);
      this.paymentDetails.amount = this.amountToPay.value ? this.amountToPay.value : this.paymentDetails.amount;
      switch (this.paymentDetails.transactionType) {
        case 'payment':
          this.postPaymentIntent(token);
          break;
        case 'upFront':
          this.postPaymentIntent(token);
          break;
        case 'donation':
          this.postPaymentIntent(token);
          break;
        case 'orderWithoutUpfront':
          this.addCardWithoutPaymentIntent();
          break;
        case 'addCard':
          this.addCardWithoutPaymentIntent();
          break;
        default:
          console.log('Invalid case');
          break;
      }
      // this.postPaymentIntent(token);
    } else {
      console.log(error);
      this.errorHandling(error);
      this.loadingService.dismissLoading();
    }
  }

  /**
   * @description Add payment method(card) with payment intent. Get client secret from backend then confirm card payment to Stripe
   * @param token
   */
  postPaymentIntent(token: string) {
    console.log(token);
    this.disableButton = true;
    const stripePaymentData: any = {
      productId: this.paymentDetails.productId,
      product: this.paymentDetails.productType,
      amount: this.paymentDetails.amount,
    };
    // Post payment intent and receive client secret key for Stripe
    this.stripePaymentService.postPaymentIntent(stripePaymentData).subscribe((res: any) => {
      if (res.status === 'success') {
        // Send card details & client secret to Stripe
        this.stripe.confirmCardPayment(res.data.clientSecret, {
          payment_method: {
            card: this.cardNumber,
            billing_details: {
              name: this.cardHolder.value,
            },
          },
          receipt_email: localStorage.getItem('userName'),
          setup_future_usage: 'off_session'
        }).then((result: any) => {
          if (result.error) {
            console.log(result, result.error);
            this.errorHandling(result.error);
            this.disableButton = false;
          } else if (result.paymentIntent.status === 'succeeded') {
            this.analyticsService.logEvent('add_card_with_payment_intent', { context: this.eventContext });
            console.log('Payment success!');
            setTimeout(() => {
              this.loadingService.dismissLoading();
              this.stripePaymentService.getPaymentMethods('initialize');
              this.eventNewPaymentMethodAdded.emit({ context: this.paymentDetails.transactionType, status: 'success' });
            }, 3000);
          }
          // this.disableButton = false;
        });
      } else {
        this.disableButton = false;
        this.presentToast(res.data.userMessage);
        this.loadingService.dismissLoading();
      }
    });
  }

  /**
   * @description Add new payment method without payment intent
   */
  async addCardWithoutPaymentIntent() {
    this.disableButton = true;
    console.log('Add card without payment intent');
    this.stripePaymentService.postNewPaymentMethod().subscribe(async (paymentResponse: any) => {
      if (paymentResponse.status === 'success') {
        this.stripe.confirmCardSetup(
          paymentResponse.data.clientSecret,
          {
            payment_method: {
              card: this.cardNumber,
              billing_details: {
                name: this.cardHolder.value
              }
            },
          }
        ).then((result) => {
          if (result.error) {
            // Display error.message in your UI.
            console.log('ERROR: ', result.error.message);
            this.errorHandling(result.error);
            this.disableButton = false;
          } else {
            const pooling = setInterval(() => {
              // console.log(this.prevPaymentMethods.length === this.paymentMethods.length, this.prevPaymentMethods, this.paymentMethods);
              if (this.prevPaymentMethods.length === this.paymentMethods.length) {
                // console.log('Ask api again');
                this.stripePaymentService.getPaymentMethods('update');
              } else {
                this.stripePaymentService.getPaymentMethods('initialize');
                this.eventNewPaymentMethodAdded.emit({ context: 'addCard', status: 'success' });
                this.loadingService.dismissLoading();
                this.disableButton = false;
                this.analyticsService.logEvent('add_card', { context: this.eventContext });
                // console.log('Stop asking for new data');
                clearInterval(pooling);
              }
            }, 2000);
          }
        });
      } else {
        this.loadingService.dismissLoading();
        this.presentToast(paymentResponse.data.userMessage);
      }
      console.log(paymentResponse);
    }, () => this.loadingService.dismissLoading());
  }

  onBlur() {
    this.cardCvc.on('blur', () => {
      document.querySelector('#icon_cvc').classList.remove('input_img_focused');
      this.isKeyboardActive = false;
    });
    this.cardExpiry.on('blur', () => {
      document.querySelector('#icon_expiry_date').classList.remove('input_img_focused');
      this.isKeyboardActive = false;
    });
    this.cardNumber.on('blur', () => {
      this.isKeyboardActive = false;
    });
  }

  onFocus() {
    this.cardCvc.on('focus', () => {
      console.log(document.querySelector('#input_img_cvc'));
      document.querySelector('#icon_cvc').classList.add('input_img_focused');
      this.isKeyboardActive = true;
    });
    this.cardExpiry.on('focus', () => {
      console.log(document.querySelector('#input_img_expiry'));
      document.querySelector('#icon_expiry_date').classList.add('input_img_focused');
      this.isKeyboardActive = true;
    });
    this.cardNumber.on('focus', () => {
      this.isKeyboardActive = true;
    });
  }

  ionFocusCardHolder() {
    console.log('On focus');
    this.isCardHolderActive = true;
    console.log(this.isCardHolderActive);
  }

  ionBlurCardHolder() {
    console.log('On blur');
    this.isCardHolderActive = false;
  }

  /**
   * @name errorHandling
   * @description Handling error and select the error messsage to show
   * @param error
   */
  errorHandling(error: any) {
    const message = this.translate.instant('components.stripeAddPaymentMethod.errors.' + error.decline_code ? error.decline_code : error.code);
    this.presentToast(message).then(() => this.loadingService.dismissLoading());
  }

  /**
   * @description Toggle the input pay another amount
   */
  toggleInput() {
    if (this.showAmountToPayInput) {
      this.showAmountToPayInput = false;
      this.amountToPay.setValue(this.paymentDetails.amount);
    } else {
      this.showAmountToPayInput = true;
      this.amountToPay.setValue(null);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: 'bottom',
      duration: 10000,
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
