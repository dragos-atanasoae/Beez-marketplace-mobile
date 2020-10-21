import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, useAnimation } from '@angular/animations';
import { zoomIn, zoomOut, slideInUp, slideOutDown, slideInDown, fadeIn } from 'ng-animate';
import { StripeCardPaymentModel } from 'src/app/models/stripeCardPayment.model';
import { EventsService } from 'src/app/services/events.service';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

declare var Stripe;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  animations: [
    trigger('animationSlideInOut', [
      transition(':enter', useAnimation(fadeIn), {
        params: { timing: 0.2, delay: 0 }
      }),
      transition(':leave', useAnimation(slideOutDown), {
        params: { timing: 0.1, delay: 0 }
      }),
    ]),
  ]
})
export class PaymentPage implements OnInit, OnDestroy {

  @Input() paymentDetails: any;
  @Input() donationDetails: any;

  localeData = new LocaleDataModel();
  country = localStorage.getItem('country');
  eventContext = 'Payment Page';
  stripe = Stripe(environment.apiURL === '-test-api.use-beez.com/' ? 'pk_test_rGzVsaLqy9AQSvCCWhCaNxVK00GhrAj3U5' : 'pk_live_NuLbq6PSfgLbYZNTWvuURv5B00er7SXsoR', { locale: 'ro' });
  private unsubscribe$: Subject<boolean> = new Subject();
  paymentMethods = [];
  selectedCard = null;
  showCardsList = false;
  showAddCardForm = false;

  amountToPay: FormControl;
  showAmountToPayInput = false;
  disableButton = false;

  installments = [];
  selectedAmount = 0;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingService: LoadingService,
    private internationalizationService: InternationalizationService,
    private translate: TranslateService,
    private stripePaymentService: StripePaymentService,
    private eventsService: EventsService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    console.log('Payment details: ', this.paymentDetails);
    console.log(this.donationDetails);
    this.amountToPay = new FormControl((this.paymentDetails.transactionType === 'upFront' ? this.paymentDetails.amount : null),
      Validators.compose([Validators.required, Validators.min(2)]));
    if (this.paymentDetails.productType === 'ShopCart' || this.paymentDetails.payNow || this.paymentDetails.transactionType === 'upFront') {
      this.amountToPay.setValue(this.paymentDetails.amount);
      console.log(this.amountToPay.value);
    }
    this.initializeProductType();
    this.getPaymentMethods();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  initializeProductType() {
    switch (this.paymentDetails.productType) {
      case 'ProductObjective':
        this.amountToPay.setValue(this.paymentDetails.amount);
        break;
      case 'BeezVip12':
        this.amountToPay.setValue(this.paymentDetails.amount);
        break;
      case 'OnlineBeezPayOrder':
        this.amountToPay.setValue(this.paymentDetails.amount);
        if (!this.paymentDetails.payNow) {
          this.installments = this.paymentDetails.payLaterDetails?.installments.details.map(x => {x.selected = false; return x; });
          console.log('Updated installments:', this. installments);
          this.autoSelectInstallment();
        }
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

  getPaymentMethods() {
    this.stripePaymentService.paymentMethodsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.paymentMethods = res);
    console.log('List of cards from Stripe: ', this.paymentMethods);
    if (this.paymentMethods.length > 0) {
      this.showCardsList = true;
      this.showAddCardForm = false;
    } else {
      this.showCardsList = false;
      this.showAddCardForm = true;
    }
  }

  /**
   * @name updateSelectedInstallments
   * @description Calculate sum of selected installments value/leftToPay
   */
  updateSelectedInstallments() {
    console.log('Update selected installments: ', this.installments);
    // Update amount to pay
    let amount = 0;
    this.installments.forEach(item => amount += item.selected ? parseFloat(item.leftToPay.toFixed(2)) : 0);
    console.log(amount);
    this.amountToPay.setValue(amount);
  }

  /**
   * @name autoSelectInstallment
   * @description Find and select first installment with leftToPay value (!isPaid)
   */
  autoSelectInstallment() {
    const firstUnpaidInstallment = this.installments.find(x => x.leftToPay > 0 && !x.isPaid);
    console.log(this.installments.find(x => x.leftToPay > 0 && !x.isPaid));
    this.installments.map(x => {
      if (x.orderNumber === firstUnpaidInstallment.orderNumber) {
        x.selected = true;
      }
    });
    console.log('Preselected installment: ', this.installments);
    this.updateSelectedInstallments();
  }

  /**
   * @description Post Stripe payment using the selected card
   */
  postStripePayment() {
    this.analyticsService.logEvent('post_payment', { context: this.eventContext });
    this.disableButton = true;
    this.loadingService.presentLoading(true);
    const cardPaymentData: StripeCardPaymentModel = {
      Product: this.paymentDetails.productType,
      ProductId: this.paymentDetails.productId,
      PaymentMethodId: this.selectedCard.id,
      Amount: this.amountToPay.value,
      AnonymousDonation: null,
      NicknameDonation: null
    };
    console.log(cardPaymentData);

    this.stripePaymentService.postPaymentIntentForExistingMethod(cardPaymentData).subscribe((res: any) => {
      // console.log(res);
      if (res.status === 'error') {
        this.loadingService.dismissLoading();
        this.analyticsService.logEvent('payment_error', { context: this.eventContext });
        if (res.data.retryPayment) {
          console.log('The payment has additional confirmation');
          this.analyticsService.logEvent('retry_payment', { context: this.eventContext });
          this.confirmStripeCardPayment(res.data.retryPayment.clientSecret, res.data.retryPayment.stripePaymentMethodId);
        } else {
          this.disableButton = false;
          this.presentToast(res.data.userMessage);
        }
      } else if (res.status === 'success') {
        setTimeout(() => {
          this.analyticsService.logEvent('payment_successful', { context: this.eventContext });
          this.switchTransactionType('payment');
          // this.modalCtrl.dismiss();
          // this.eventsService.publishEvent('payment:success');
          // this.loadingService.dismissLoading();
        }, 5000);
      }
    });
  }

  confirmStripeCardPayment(clientSecret: string, paymentMethodId: string) {
    // Pass the failed PaymentIntent to your client from your server
    this.stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId
    }).then((result: any) => {
      if (result.error) {
        // Show error to your customer
        // console.log(result.error.message);
        // this.presentToast(result.error.message);
        this.disableButton = false;
        this.presentToast(this.translate.instant('components.stripeAddPaymentMethod.errors.payment_intent_incompatible_payment_method'));
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // The payment is complete!
          this.switchTransactionType('payment');
          // this.modalCtrl.dismiss();
          // this.eventsService.publishEvent('payment:success');
        }
      }
    });
  }

  receiveSelectedCard($event) {
    console.log($event);
    this.selectedCard = $event;
  }

  receiveEventPaymentMethodAdded($event: any) {
    console.log('Add card with payment intent succeeded', $event);
    if ($event.status === 'success') {
      this.showAddCardForm = false;
      this.switchTransactionType($event.context);
    }
    this.loadingService.dismissLoading();
  }

  /**
   * @name switchTransactionsType
   * @description Switch transaction type: add card or payment
   * @param context
   */
  switchTransactionType(context: string) {
    console.log('switch transaction type');
    switch (context) {
      case 'addCard':
        this.presentToast(this.translate.instant('pages.payment.toastMessageCardSuccessfulyAdded'));
        break;
      case 'payment':
        this.loadingService.dismissLoading();
        this.modalCtrl.dismiss();
        this.eventsService.publishEvent('payment:success');
        this.disableButton = false;
        break;
      case 'upFront':
        this.loadingService.dismissLoading();
        this.modalCtrl.dismiss();
        this.eventsService.publishEvent('payment:success');
        this.disableButton = false;
        break;
      case 'donation':
        this.loadingService.dismissLoading();
        this.modalCtrl.dismiss();
        this.disableButton = false;
        // TODO
        break;
    }
  }

  toggleInput() {
    if (this.showAmountToPayInput) {
      this.showAmountToPayInput = false;
      if (!this.paymentDetails.payNow) {
        this.installments = this.paymentDetails.payLaterDetails?.installments.details.map(x => {if (!x.isPaid) {x.selected = true; } return x; });
        console.log('Updated installments:', this. installments);
      }
      this.amountToPay.setValue(this.paymentDetails.amount);
    } else {
      this.showAmountToPayInput = true;
      this.amountToPay.setValue(null);
      if (!this.paymentDetails.payNow) {
        this.installments = this.paymentDetails.payLaterDetails?.installments.details.map(x => {x.selected = false; return x; });
        console.log('Updated installments:', this. installments);
      }
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      buttons: [{ text: 'OK', role: 'cancel' }],
      cssClass: 'custom_toast'
    });

    toast.present();
  }

  closeModal() {
    if (this.showAddCardForm && this.paymentMethods.length > 0) {
      this.showAddCardForm = false;
      this.showCardsList = true;
    } else {
      this.modalCtrl.dismiss();
    }
  }
}
