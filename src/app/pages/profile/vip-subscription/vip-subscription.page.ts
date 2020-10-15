// import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { EventsService } from './../../../services/events.service';
import { WalletService } from './../../../services/wallet.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocaleDataModel } from './../../../models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentPage } from '../../payment/payment.page';

const { Browser } = Plugins;

@Component({
  selector: 'app-vip-subscription',
  templateUrl: './vip-subscription.page.html',
  styleUrls: ['./vip-subscription.page.scss'],
})
export class VipSubscriptionPage implements OnInit, OnDestroy {
  private unsubscribe$: Subject<boolean> = new Subject();
  isVIPMember: boolean;
  subscriptionCost = 99;
  expirationDate: string;
  localeData = new LocaleDataModel();

  constructor(private modalCtrl: ModalController,
              private router: Router,
              // private inAppBrowser: InAppBrowser,
              private translate: TranslateService,
              private walletService: WalletService,
              private eventsService: EventsService,
              private internationalizationService: InternationalizationService) {
    // * Listen for the payment success event
    this.eventsService.event$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res === 'payment:success') {
        this.modalCtrl.dismiss().then(() => { this.modalCtrl.dismiss().then(() => { this.modalCtrl.dismiss(); }); });
        this.alertSubscriptionPaidSuccessfully();
        this.walletService.getVipDetails();
      }
    });
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.getVipDetails();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  goToShops() {
    this.closeModal();
    this.router.navigateByUrl('/tabs/search/null');
  }

  /**
   * @name getVipDetails
   * @description Get VIP status and VIP expiration date for an user.
   */
  getVipDetails() {
    this.walletService.vipDetails$
      .subscribe((response: any) => {
        this.isVIPMember = response.isVip;
        this.expirationDate = response.expirationDate;
      });
  }

  /**
   * @name openWhatsapp
   * @description Open Whatsapp conversation with Beez phone number
   */
  openWhatsapp() {
    const userEmail = localStorage.getItem('userName');
    const messagePart1 = this.translate.instant('contactSupportWhatsapp.messagePart1');
    const messagePart2 = this.translate.instant('contactSupportWhatsapp.messagePart2');
    const messagePart3 = this.translate.instant('contactSupportWhatsapp.messagePart3.vipSubscription');
    const contactMessage = messagePart1 + ' ' + userEmail + ', ' + messagePart2 + ' ' + messagePart3;
    Browser.open({url: 'https://api.whatsapp.com/send?phone=+40744791302&text=' + contactMessage, windowName: '_system'});
    // this.inAppBrowser.create('https://api.whatsapp.com/send?phone=+40744791302&text=' + contactMessage, '_system');
  }

  async openPaymentModal() {
    const paymentData = {
      transactionType: 'payment',
      productId: null,
      amount: 99,
      productType: 'BeezVip12',
      name: 'Beez Vip',
    };
    console.log('Payment data: ', paymentData);
    const modal = await this.modalCtrl.create({
      component: PaymentPage,
      componentProps: {
        paymentDetails: paymentData
      }
    });
    modal.present();
  }

  async alertSubscriptionPaidSuccessfully() {
    const modal = await this.modalCtrl.create({
      component: CustomAlertComponent,
      componentProps: {
        header: this.translate.instant('pages.profileTab.vipSubscription.alertSubscriptionPaidSuccessfully.header'),
        btnOk: this.translate.instant('pages.profileTab.vipSubscription.alertSubscriptionPaidSuccessfully.btnOk'),
        image: './assets/icon/profile_icons/icon_vip_crown.svg',
        isVip: true
      },
      cssClass: 'modal_no_background'
    });
    modal.present();
    modal.onDidDismiss().then((res: any) => {
      console.log(res.data);
      if (res.data === 'success') {
        this.router.navigateByUrl('/tabs/search/null');
      }
    });
  }

}
