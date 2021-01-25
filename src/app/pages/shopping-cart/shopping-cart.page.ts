import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ModalController, IonSlides, AlertController, ToastController } from '@ionic/angular';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { Observable, Subject } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { PaymentPage } from '../payment/payment.page';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { ImageViewerOptionsModel } from 'src/app/models/imageViewerOptions.model';

import { MarketplaceProductDetailsPage } from '../marketplace-product-details/marketplace-product-details.page';
import { ImageViewerPage } from '../image-viewer/image-viewer.page';
import { takeUntil } from 'rxjs/operators';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { FormControl, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.page.html',
  styleUrls: ['./shopping-cart.page.scss'],
})
export class ShoppingCartPage implements OnInit, OnDestroy {

  @Input() vendor: any;
  @Input() city: any;
  @Input() county: any;
  @ViewChild('slidesCheckout', { static: true }) slidesCheckout: IonSlides;

  private unsubscribe$: Subject<boolean> = new Subject();

  localeData: LocaleDataModel;
  shoppingCart: any;
  shoppingCartList: any = [];
  totalCart: Observable<any>;
  cartValue = 0;
  shoppingCartId: number;
  products: [];
  selectedAddress = null;
  currentIndex: number;
  infoDeliveryReaded = false;
  eventContext = 'Shopping cart page';
  paymentProcessor = null;
  disableButton = false;
  beezVoucherCode: FormControl;
  expandOrderSummary = false;

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingService: LoadingService,
    private analyticsService: AnalyticsService,
    private currencyPipe: CurrencyPipe,
    private translate: TranslateService,
    private marketplaceService: MarketplaceService,
    private stripePaymentService: StripePaymentService,
    private internationalizationService: InternationalizationService) {
    this.beezVoucherCode = new FormControl('', [Validators.required]);
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.getShoppingCart();
    this.getActiveSlideIndex();
    this.getPaymentProcessor();
    this.slidesCheckout.lockSwipes(true);

    console.log(this.vendor);

  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  getActiveSlideIndex() {
    this.slidesCheckout.getActiveIndex().then((data) => {
      this.currentIndex = data;
      console.log(data);
    });
  }

  nextSlide() {
    this.slidesCheckout.lockSwipes(false);
    this.slidesCheckout.slideNext();
    this.currentIndex++;
    this.slidesCheckout.lockSwipes(true);
    // if (!this.infoDeliveryReaded) {
    //   this.showAlertDeliveryTime();
    // }
  }

  previousSlide() {
    this.slidesCheckout.lockSwipes(false);
    this.slidesCheckout.slidePrev();
    this.currentIndex--;
    this.slidesCheckout.lockSwipes(true);
  }

  /**
   * @name logAnalyticsEvent
   * @description Log analytics events for checkout
   */
  logAnalyticsEvent(event: string) {
    const eventParams = { context: this.eventContext, cart_value: this.cartValue };
    console.log(eventParams);
    this.analyticsService.logEvent(event, eventParams);
  }

  /**
   * @description Get the payment processor - expected values: Stripe or Netopia
   */
  getPaymentProcessor() {
    this.stripePaymentService.paymentProcessor$.subscribe(res => { this.paymentProcessor = res; console.log('Payment processor', this.paymentProcessor); });
  }

  /**
   * @name getShoppingCart
   * @description Get data for the active shopping cart(shopping cart initiated)
   */
  getShoppingCart() {
    this.marketplaceService.getShoppingCart(this.vendor.id, this.city.Id);
    this.marketplaceService.shoppingCartId.subscribe(res => this.shoppingCartId = res);
    this.marketplaceService.shoppingCartList$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.shoppingCartList = res);

    const shoppingCart: Observable<any> = this.marketplaceService.shoppingCart;
    shoppingCart.subscribe(res => {
      this.shoppingCart = res;
    });

    this.totalCart = this.marketplaceService.totalCart;
    this.totalCart.subscribe(res => {
      this.cartValue = res;
      console.log('Total cart: ', this.cartValue);
    });
  }

  /**
   * @name openMarketplaceProductsDetails
   * @description Open product details to edit the quantity of the product
   * @param productDetails
   */
  async openMarketplaceProductsDetails(productDetails: any) {
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductDetailsPage,
      componentProps: {
        productDetails,
        context: 'edit',
        city: this.city,
        vendor: this.vendor
      },
      cssClass: 'overlay_tutorial'
    });
    this.analyticsService.logEvent('open_product_details', { context: this.eventContext });
    modal.present();
    modal.onDidDismiss().then((data: any) => {
      if (data.data === 'successfullyAddedToCart') {
        console.log('successfullyAddedToCart');
      }
    });
  }

  /**
   * @name showAlertDeliveryTime
   * @description Show alert message about estimate delivery time
   */
  async showAlertDeliveryTime() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('pages.marketplace.shoppingCart.alertDeliveryTime.header'),
      message: this.translate.instant('pages.marketplace.shoppingCart.alertDeliveryTime.message'),
      buttons: [
        {
          text: 'Ok',
          handler: () => { this.infoDeliveryReaded = true; }
        }
      ],
      cssClass: 'custom_alert'
    });
    alert.present();
  }

  /**
   * @name alertRemoveProduct
   * @description Show alert to confirm the remove product action
   * @param productDetails
   */
  async alertRemoveProduct(productDetails: any) {
    const modal = await this.modalCtrl.create({
      component: CustomAlertComponent,
      componentProps: {
        header: this.translate.instant('pages.marketplace.shoppingCart.alertRemoveProduct.header'),
        message: this.translate.instant('pages.marketplace.shoppingCart.alertRemoveProduct.message'),
        btnOk: this.translate.instant('buttons.buttonRemove'),
        btnCancel: this.translate.instant('buttons.buttonCancel'),
      },
      cssClass: 'modal_no_background'
    });
    modal.present();

    modal.onDidDismiss().then((res: any) => {
      console.log(res.data);
      if (res.data === 'success') {
        this.analyticsService.logEvent('remove_product_from_cart', { context: this.eventContext });
        this.marketplaceService.editProductFromCart(productDetails.productReferenceId, 0, this.vendor.id, this.city.Id, true);
      }
    });
  }

  /**
   * @name receiveSelectedAddress
   * @description Listen for event select address and receive the selected address
   * @param $event
   */
  receiveSelectedAddress($event) {
    this.selectedAddress = $event;
    console.log(this.selectedAddress);
  }

  /**
   * @name checkoutShoppingCart
   * @description Checkout/Save the shopping cart and create order. On success, clear the shopping cart and go to Payment page
   */
  checkoutShoppingCart() {
    this.disableButton = true;
    this.loadingService.presentLoading();
    this.logAnalyticsEvent('checkout_shopping_cart');
    console.log(this.shoppingCartId, this.vendor.id, this.city.Id, this.selectedAddress.Id);
    this.analyticsService.logEvent('checkout_shopping_cart', { context: this.eventContext });
    this.marketplaceService.checkoutShoppingCart(this.shoppingCartId, this.vendor.id, this.city.Id, this.selectedAddress.Id).subscribe((res: any) => {
      if (res.status === 'success') {
        this.loadingService.dismissLoading();
        if (this.cartValue > 0) {
          this.modalCtrl.dismiss();
          this.openPaymentPage(res.orderId);
        } else {
          this.modalCtrl.dismiss().then(() => {
            this.modalCtrl.dismiss();
            this.router.navigate(['/tabs/orders']);
            localStorage.setItem('selectedOrder', res.orderId)
          });
        }
      } else { this.loadingService.dismissLoading(); }
    }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name openPaymentPage
   * @description Open payment page for the current order/shopping cart
   * @param orderId
   */
  async openPaymentPage(orderId: number) {
    this.getShoppingCart();
    const payment = {
      transactionType: 'payment', // values: addCard, upFront, payment, donation
      productId: orderId, // orderId receive from checkout shopping cart
      amount: this.cartValue, //
      productType: 'ShopCart', // values: Productobjective, Voucher, Donation, ShopCart
      name: '',
    };
    const modal = await this.modalCtrl.create({
      component: this.paymentProcessor === 'Stripe' ? PaymentPage : PaymentPage,
      componentProps: { paymentDetails: payment }
    });
    this.analyticsService.logEvent('open_payment_page', { context: this.eventContext });
    modal.present();
    modal.onDidDismiss().then(() => {
      this.marketplaceService.getShoppingCart(this.vendor.id, this.city.Id);
      this.modalCtrl.dismiss().then(() => { this.modalCtrl.dismiss().then(() => { this.modalCtrl.dismiss(); }); });
      this.router.navigate(['/tabs/orders']);
    });
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

  closeModal() {
    this.modalCtrl.dismiss();
  }

  /**
* @name validateVoucherCode
* @description Check if a beez voucher can be used for FM cart
*/
  validateVoucherCode() {
    const body = {
      vendorId: this.vendor.id,
      preselectedCityId: this.city.Id,
      voucherCode: this.beezVoucherCode.value
    }

    console.log('Validate VOUCHER CODE body: ', body);

    if (this.beezVoucherCode.valid) {
      this.loadingService.presentLoading();
      this.marketplaceService.validateVoucherCode(body)
        .subscribe((response: any) => {
          console.log(response);
          this.loadingService.dismissLoading();
          if (response.canBeUsed) {
            this.beezVoucherCode.reset();
            // Update order values after voucher code is applied
            this.updateOrderValues(response.cartOrOrder);
            this.presentToastWithAction(this.translate.instant('pages.marketplace.shoppingCart.toastMessages.voucherBeezAppliedSuccessfully') + this.currencyPipe.transform(
              response.cartOrOrder.vouchersTotalValue, this.localeData.currency, 'symbol-narrow', '.0-2', this.localeData.localeID
            ));
          } else {
            this.presentToastWithAction(this.translate.instant(response.cmsKeyErrorMessage));
          }
        }, () => this.loadingService.dismissLoading())
    }
  }

  removeVoucher(voucherId: string) {
    this.loadingService.presentLoading();
    const body = {
      vendorId: this.vendor.id,
      preselectedCityId: this.city.Id,
      voucherId: voucherId
    }

    console.log('Remove VOUCHER body: ', body);
    this.marketplaceService.removeVoucher(body)
      .subscribe((response: any) => {
        this.loadingService.dismissLoading();
        console.log(response);
        // Update order values after voucher code is removed
        this.updateOrderValues(response);
      }, () => this.loadingService.dismissLoading())
  }

  /**
   * @name updateOrderValues
   * @description Update order values after voucher code is applied or removed
   */
  updateOrderValues(response: any) {
    // update discount value
    this.shoppingCart.vouchersTotalValue = response.vouchersTotalValue;

    // update vouchers list
    this.shoppingCart.vouchers = response.vouchers;

    // update entire shopping cart
    this.marketplaceService.shoppingCart$.next(this.shoppingCart);

    // update cart value
    this.marketplaceService.totalCart$.next(response.totalValue);

    console.log('this.marketplaceService.shoppingCart ', this.marketplaceService.shoppingCart);
  }

  /**
 * @name presentToastWithAction
 * @description Show a toast message without duration, this toast message can be closed from close button
 * @param message
 */
  async presentToastWithAction(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: () => this.toastCtrl.dismiss()
      }],
      duration: 5000,
      position: 'top',
      cssClass: 'custom_toast'
    });
    toast.present();
  }
}
