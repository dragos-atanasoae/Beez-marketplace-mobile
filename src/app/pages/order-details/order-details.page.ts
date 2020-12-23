import { RefundDetailsPage } from './../refund-details/refund-details.page';
// import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ConfirmDeleteDataComponent } from './../../components/confirm-delete-data/confirm-delete-data.component';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { Plugins } from '@capacitor/core';
import { PaymentPage } from '../payment/payment.page';
import { ImageViewerOptionsModel } from 'src/app/models/imageViewerOptions.model';
import { ImageViewerPage } from '../image-viewer/image-viewer.page';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn, slideInLeft } from 'ng-animate';
import { MissingProductsPage } from '../missing-products/missing-products.page';
import { LoadingService } from 'src/app/services/loading.service';
import { FormControl, Validators } from '@angular/forms';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { Subject } from 'rxjs';
import { EventsService } from 'src/app/services/events.service';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

const { Browser } = Plugins;

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1, delay: 0 }
      }),
    ]),
    trigger('slideIn', [
      transition(':enter', useAnimation(slideInLeft), {
        params: { timing: 0.8, delay: 0 }
      }),
    ]),
  ]
})
export class OrderDetailsPage implements OnInit, OnDestroy {

  @Input() order: any;

  localeData: LocaleDataModel;
  messageReviewOrder: FormControl;

  orderDetails: any;
  iconOrderStatus = '';
  labelOrderStatus = '';
  showOverlayPaymentSuccess = false;
  showOverlayReviewOrder = false;
  reviewSubmited = false;
  paymentProcessor = null;
  private unsubscribe$: Subject<boolean> = new Subject();
  eventContext = 'Order Details';
  undeliveredProducts: any = [];

  constructor(
    private alertCtrl: AlertController,
    private analyticsService: AnalyticsService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private internationalizationService: InternationalizationService,
    private translate: TranslateService,
    private marketplaceService: MarketplaceService,
    private callNumber: CallNumber,
    private inAppBrowser: InAppBrowser,
    private stripePaymentService: StripePaymentService,
    private loadingService: LoadingService,
    private eventsService: EventsService
  ) {
    this.messageReviewOrder = new FormControl('', Validators.required);
    this.eventsService.event$.subscribe((res) => {
      if (res === 'payment:success') {
        this.showOverlayPaymentSuccess = true;
        this.getItemDetails();
      }
    });
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.getItemDetails();
    this.getPaymentProcessor();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  /**
   * @description Get the payment processor - expected values: Stripe or Netopia
   */
  getPaymentProcessor() {
    this.stripePaymentService.paymentProcessor$.subscribe(res => { this.paymentProcessor = res; console.log('Payment processor', this.paymentProcessor); });
  }

  /**
   * @name receiveCloseOverlayEvent
   * @description Listen for event close payment overlay to update the order details
   * @param $event
   */
  receiveCloseOverlayEvent($event) {
    this.showOverlayPaymentSuccess = $event;
    this.getItemDetails();
  }

  /**
   * @name getItemDetails
   * @description Get details for the current order
   */
  getItemDetails() {
    this.loadingService.presentLoading();
    this.marketplaceService.getItemDetails(this.order.id, this.order.category)
      .subscribe((response: any) => {
        this.loadingService.dismissLoading();
        if (response.status === 'success') {
          this.orderDetails = response.item;
          // extract undelivered products
          this.undeliveredProducts = this.orderDetails.orderInfo.products.filter((el => (el.quantityRefund != null && el.quantityRefund != 0)));
          this.checkOrderStatus(this.orderDetails.status.status);
        }
        console.log(response.item);
      });
  }

  /**
   * @name getInvoiceUrl
   * @description Get invoice URL for the current order
   */
  getInvoiceUrl() {
    this.analyticsService.logEvent('download_invoice', { context: this.eventContext });
    this.loadingService.presentLoading();
    this.marketplaceService.getInvoiceUrl(this.orderDetails.id, 'ShoppingOrder').subscribe((res: any) => {
      if (res.status === 'success') {
        this.openLinkInAppBrowser(res.url, 'view_invoice');
      } else {
        this.presentToast(this.translate.instant('pages.marketplace.orderDetails.toastMessages.errorDownloadInvoice'));
      }
      this.loadingService.dismissLoading();
    });
  }

  /**
   * @name checkOrderStatus
   * @description Check the status of the order and switch icon and text by status
   * @param orderStatus
   */
  checkOrderStatus(orderStatus: string) {
    switch (orderStatus) {
      case 'PendingToOrder':
        this.iconOrderStatus = './assets/icon/order_states/icon_pending_to_order.svg';
        this.labelOrderStatus = this.translate.instant('pages.marketplace.statusOfOrder.pendingToOrder');
        // this.showToastInfoDelivery();
        break;
      case 'Paid':
        this.iconOrderStatus = this.orderDetails.shippmentInfo.shipmentStatus !== null ? './assets/icon/order_states/icon_ordered.svg' : './assets/icon/order_states/icon_ordered.svg';
        this.labelOrderStatus = this.translate.instant(this.orderDetails.shippmentInfo.shipmentStatus !== null ? 'pages.marketplace.statusOfOrder.deliveryInProgress' : 'pages.marketplace.statusOfOrder.ordered');
        // this.showToastInfoDelivery();
        break;
      case 'Delivered':
        this.iconOrderStatus = './assets/icon/order_states/icon_delivered.svg';
        this.labelOrderStatus = this.translate.instant('pages.marketplace.statusOfOrder.delivered');
        break;
      case 'Cancelled':
        this.iconOrderStatus = './assets/icon/order_states/icon_other_status.svg';
        this.labelOrderStatus = this.translate.instant('pages.marketplace.statusOfOrder.cancelled');
        break;
      case 'DeletedByUser':
        this.iconOrderStatus = './assets/icon/order_states/icon_other_status.svg';
        this.labelOrderStatus = this.translate.instant('pages.marketplace.statusOfOrder.deletedByUser');
        break;
      default:
        this.iconOrderStatus = '';
        this.labelOrderStatus = '';
        break;
    }
  }

  /**
   * @name openPaymentPage
   * @description Open the payment page for the current order, productType: 'ShopCart'
   */
  async openPaymentPage() {
    const payment = {
      transactionType: 'payment', // values: addCard, upFront, payment, donation
      productId: this.orderDetails.id, // orderId receive from checkout shopping cart
      amount: this.orderDetails.value, //
      productType: 'ShopCart', // values: Productobjective, Voucher, Donation, ShopCart
      name: '',
    };
    const modal = await this.modalCtrl.create({
      // component: PaymentPage,
      component: this.paymentProcessor === 'Stripe' ? PaymentPage : PaymentPage,
      componentProps: { paymentDetails: payment }
    });

    modal.present();
    this.analyticsService.logEvent('open_payment_page', { context: this.eventContext });
    modal.onDidDismiss().then(() => {
      this.getItemDetails();
    });
  }

  /**
   * @name showAlertOrderCodeInfo
   * @description Show alert message about order code (required to confirm the order at delivery time)
   */
  async showAlertOrderCodeInfo() {
    const modal = await this.modalCtrl.create({
      component: CustomAlertComponent,
      componentProps: {
        image: './assets/icon/Icon_Warning.svg',
        message: this.translate.instant('pages.marketplace.orderDetails.alertOrderCodeInfo.message'),
        btnOk: 'Ok',
      },
      cssClass: 'modal_no_background'
    });
    this.analyticsService.logEvent('show_order_code_info', { context: this.eventContext });
    modal.present();
  }

  /**
   * @name modalConfirmRemoveOrder
   * @description Open modal quiz for remove foodmarketplace order
   */
  async modalConfirmRemoveOrder() {
    const answersList = [];
    for (let index = 1; index < 5; index++) {
      answersList.push({ id: index, answer: this.translate.instant('components.confirmDeleteData.foodMarketplace.answer' + index) });
    }
    const modal = await this.modalCtrl.create({
      component: ConfirmDeleteDataComponent,
      componentProps: {
        type: 'FoodMarketplace',
        title: this.translate.instant('components.confirmDeleteData.foodMarketplace.title'),
        answersList
      },
      showBackdrop: true,
      backdropDismiss: false,
      cssClass: 'modal_confirm_delete_data'
    });
    modal.present();
    modal.onDidDismiss().then((data) => {
      if (data.data === 'close') { } else {
        this.removeOrder();
      }
    });
  }

  /**
   * @name removeOrder
   * @description Remove marketplace order
   */
  removeOrder() {
    this.analyticsService.logEvent('remove_order', { context: this.eventContext });
    this.marketplaceService.removeOrder(this.orderDetails.id)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.modalCtrl.dismiss();
          this.analyticsService.logEvent('order_removed', { context: this.eventContext });
          this.showAlertMessageThankYou(this.translate.instant('pages.marketplace.orderDetails.toastMessages.successRemoveOrder'));
        } else {
          this.analyticsService.logEvent('error_on_remove_order', { context: this.eventContext });
          this.presentToast(this.translate.instant('pages.marketplace.orderDetails.toastMessages.errorRemoveOrder'));
        }
      });
  }

  /**
   * @name sendReview
   * @description Post feedback for the current order
   */
  sendReview() {
    this.analyticsService.logEvent('post_feedback', { context: this.eventContext });
    this.loadingService.presentLoading();
    this.marketplaceService.postOrderFeedback(this.orderDetails.id, this.messageReviewOrder.value).subscribe((res: any) => {
      this.loadingService.dismissLoading();
      if (res.status === 'success') {
        this.reviewSubmited = true;
        this.getItemDetails();
      }
    });
  }

  async openRefundDetails() {
    const modal = await this.modalCtrl.create({
      component: RefundDetailsPage,
      componentProps: { refundInfo: this.orderDetails?.refundInfo }
    });

    await modal.present();
  }

  /**
   * @name openMissingProductsModal
   * @description Open modal to select the missing products from the current order
   */
  async openMissingProductsModal() {
    const modal = await this.modalCtrl.create({
      component: MissingProductsPage,
      componentProps: {
        productsList: this.orderDetails.orderInfo.products,
        orderId: this.orderDetails.id
      }
    });
    this.analyticsService.logEvent('open_missing_products_page', { context: this.eventContext });
    modal.present();
    modal.onWillDismiss().then((res) => { if (res.data === 'success') { this.getItemDetails(); } });
  }

  /**
   * @name openLinkInAppBrowser
   * @description Open link in InAppBrowser
   * @param url
   * @param context
   */
  openLinkInAppBrowser(url: string, context: string) {
    Browser.open({ url });
  }

  contactSupport() {
    if (this.orderDetails.customerSupport.HasWhatsApp) {
      this.openWhatsapp();
    } else {
      this.callBeez();
    }
  }

  /**
   * @name openWhatsapp
   * @description Open Whatsapp conversation with Beez phone number
   */
  openWhatsapp() {
    this.analyticsService.logEvent('contact_via_whatsapp', { context: this.eventContext });
    const userEmail = localStorage.getItem('userName');
    const messagePart1 = this.translate.instant('contactSupportWhatsapp.messagePart1');
    const messagePart2 = this.translate.instant('contactSupportWhatsapp.messagePart2');
    const messagePart3 = this.translate.instant('contactSupportWhatsapp.messagePart3.foodMarketplaceOrder');
    const contactMessage = messagePart1 + ' ' + userEmail + ', ' + messagePart2 + ' ' + messagePart3 + ' ' + this.orderDetails.id;
    // Browser.open({ url: 'https://api.whatsapp.com/send?phone=' + this.orderDetails.customerSupport.WhatsAppPhoneNumber + '&text=' + contactMessage,  windowName: '_system' });
    this.inAppBrowser.create('https://api.whatsapp.com/send?phone=' + this.orderDetails.customerSupport.WhatsAppPhoneNumber + '&text=' + contactMessage, '_system');
  }

  /**
   * @name callBeez
   * @description Open Beez phone number in phone dialer
   */
  callBeez() {
    this.analyticsService.logEvent('contact_via_phone_call', { context: this.eventContext });
    this.callNumber.callNumber(this.orderDetails.customerSupport.PhoneNumber, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  /**
   * @name openImageViewer
   * @description Open modal to view image in fullscreen mode with options zoomIn/zoomOut
   * @param imageSrc
   * @param imageTitle
   */
  async openImageViewer(imageSrc: string, imageTitle: string) {
    const viewerOptions: ImageViewerOptionsModel = {
      imageSource: imageSrc,
      zoom: true,
      zoomButtonsPosition: 'bottom',
      title: imageTitle,
      darkMode: true,
    };

    const imageViewer = await this.modalCtrl.create({
      component: ImageViewerPage,
      componentProps: {
        options: viewerOptions
      },
      cssClass: 'modal_image_viewer',
      animated: false
    });
    this.analyticsService.logEvent('open_product_image', { context: this.eventContext });
    imageViewer.present();
  }

  /**
   * @name showAlertMessageThankYou
   * @description Show alert thank you for feedback
   */
  async showAlertMessageThankYou(userMsg: string) {
    const image = './assets/imgs/bee-characters/bee_feedback.svg';
    const content =
      '<img class="bee_character" src="' + image + '">' +
      '<p class="alert-title">' + this.translate.instant('pages.marketplace.orderDetails.alertMessageThankYou.message') + '</p>' +
      '<p class="alert-content">' + userMsg + '</p>';
    const alert = await this.alertCtrl.create({
      message: content,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'alert_btn_action'
        },
      ],
      cssClass: 'alert_feedback',
    });
    alert.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  /**
   * @name presentToast
   * @description Present toast message
   * @param message
   */
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ],
      duration: 10000,
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }

}
