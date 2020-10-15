import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, IonTabs, ModalController, NavController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { WalletModel } from '../models/wallet.model';
import { AnalyticsService } from '../services/analytics.service';
import { LoadingService } from '../services/loading.service';
import { ManageAccountService } from '../services/manage-account.service';
import { StripePaymentService } from '../services/stripe-payment.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, AfterViewInit {
  @ViewChild('ionTabs', { static: true }) ionTabs: IonTabs;
  @ViewChild('tabsBar', { read: ElementRef }) tabsBar: ElementRef;

  // set up hardware back button event.
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  toastExit: any;
  country: string;
  activeTab: any;
  userExternalId: string;
  deviceToken: string;
  promoCodeOnRegister: string;
  walletInfo = new WalletModel();
  accountBeezData: any;
  notificationsCount: number;
  isKeyboardActive = false;
  heightOfTabsBar = 50;
  eventContext = 'Tabs Page';
  isVIPMember = true;

  constructor(
    public platform: Platform,
    private router: Router,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    public zone: NgZone,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private managerAccountService: ManageAccountService,
    private stripePaymentService: StripePaymentService
  ) { }

  ngOnInit() {
    // this.translate.reloadLang(localStorage.getItem('language'));

    if (!this.platform.is('desktop')) {
      // console.log('Platform mobile, get the device token', !this.platform.is('desktop'));
      this.analyticsService.initializeMixpanel();
      // this.initializeDeviceToken();
    } else {
      // console.log('Skip initialization of push notifications');
    }

    this.stripePaymentService.getPaymentProcessor();
    this.stripePaymentService.getPaymentMethods('initialize');
  }

  ngAfterViewInit(): void {
    // Recalculate position of fab button, for new iOS devices with no hardware button add more margin-bottom
    setTimeout(() => {
      this.heightOfTabsBar = this.tabsBar.nativeElement.offsetHeight;
    }, 500);
  }

  /**
   * *** ANALYTICS INITIALIZATION ***
   * ************ START *************
   */

  /**
   * @name getUserExternalId
   * @description Get User External id from database ***
   */
  getUserExternalId() {
    this.managerAccountService.getUserExternalId().subscribe(response => {
      const res: any = response;
      if (res.status === 'success') {
        this.userExternalId = res.externalId;
        localStorage.setItem('userExternalId', this.userExternalId);
        // console.log(this.userExternalId);
        if (!this.platform.is('desktop')) {
          this.intializeMixpanelUserProfile();
          this.initializeFirebaseAnalytics(res.externalId);
        }
      } else if (res.status === 'unauthorized') {
        this.logout();
      } else {
        this.getUserExternalId();
      }
    }, (error) => this.logout());
  }

  /**
   * @name initializeMixpanelUserProfile
   * @description Set Mixpanel User profile
   */
  intializeMixpanelUserProfile() {
    // // Set user unique ID in Mixpanel
    // this.mixpanel.identify(this.userExternalId);
    // // Set user profile in mixpanel
    // const user = {
    //   $distinct_id: this.userExternalId,
    //   $email: localStorage.getItem('userName'),
    // };

    // this.mixpanelPeople.set(user).then(() => {
    //   // console.log('Mixpanel people: ', user);
    // });

    // if (this.platform.is('android')) {
    //   this.mixpanelPeople.set({ $android_devices: [this.deviceToken] });
    // } else if (this.platform.is('ios')) {
    //   this.mixpanelPeople.set({ $ios_devices: [this.deviceToken] });
    // }
  }

  /**
   * @name initializeFirebaseAnalytics
   * @description Set UserExternalID for firebase analytics
   * @param userId
   */
  initializeFirebaseAnalytics(userId: string) {
    // this.firebase.setUserId(userId)
    //   .then(() => console.log(userId, 'saved'))
    //   .catch(() => console.log('Error firebase')
    //   );
    // const email = localStorage.getItem('userName');
    // this.firebase.setUserProperty('email', email)
    //   .then(() => { console.log(email, 'saved to firebase analytics profile'); this.analyticsRegisterWithPromoCode('firebase'); })
    //   .catch(() => console.log('Error on save email to firebase analytics profile'));
  }

  /**
   * @name saveAccountValueToAnalytics
   * @description Save the Beez Account data to analytics for marketing team
   */
  saveAccountValueToAnalytics() {
    const eventParams = { context: this.eventContext, account_beez_data: this.accountBeezData };
    this.analyticsService.logEvent('update_beezaccount_values', eventParams);
  }

  /**
   * @name analyticsRegisterWithPromoCode
   * @description Save the event(Register with promo code) to analytics if on the register is added a valid promo code
   * @param analyticsPlatform
   */
  analyticsRegisterWithPromoCode(analyticsPlatform: string) {
    if (this.promoCodeOnRegister !== undefined || this.promoCodeOnRegister !== null) {
      const eventParams = { context: this.eventContext, promo_code_on_register: this.promoCodeOnRegister };
      this.analyticsService.logEvent('register_with_promo_code', eventParams);
    }
  }

  /**
   * *** ANALYTICS INITIALIZATION ***
   * ************* END **************
   */
  /**
   * *** NAVIGATION ***
   * ****** START *****
   */

  /**
   * @name getSelectedTab
   * @description Get active tab and save analytics log(Firebase, Facebook, Mixplanel)
   */
  getSelectedTab() {
    this.activeTab = this.ionTabs.getSelected();
    this.listenForBackEvent();
    // get number of unread notifications
    if (this.activeTab === 'tab-profile') {
      // this.notificationService.unreadNotifications();
    }
    const eventParams = { context: this.eventContext, active_tab: this.activeTab };
    this.analyticsService.logEvent('select_tab', eventParams);
  }

  /**
   * @name logout
   * @description Delete all user data from local storage and redirect to authentication
   */
  logout() {
    const language = localStorage.getItem('language');
    // remove user from local storage to log user out
    localStorage.clear();
    localStorage.setItem('language', language);
    this.navCtrl.navigateRoot('welcome');
  }

  /**
   * @decsription Overwrite back button for android platform(back and exit)
   */
  listenForBackEvent() {
    this.platform.backButton.subscribe(async () => {
      const url = this.router.url;

      // close action sheet
      try {
        const element = await this.actionSheetCtrl.getTop();
        if (element) {
          element.dismiss();
          return;
        }
      } catch (error) { }

      // close popover
      try {
        const element = await this.popoverCtrl.getTop();
        if (element) {
          element.dismiss();
          return;
        }
      } catch (error) { }

      // close modal
      try {
        const element = await this.modalCtrl.getTop();
        if (element) {
          element.dismiss();
          return;
        }
      } catch (error) { }

      // close alert
      try {
        const element = await this.alertCtrl.getTop();
        if (element) {
          element.dismiss();
          return;
        }
      } catch (err) { }

      if (url.indexOf('tabs') > -1) {
        if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        } else {
          this.presentToastExit();
        }
      }
    });
  }

  /**
   * *** TOAST MESSAGES ***
   * ******* START ********
   */

  async presentToastExit() {
    this.toastExit = await this.toastCtrl.create({
      message: this.translate.instant('backButtonExitAppToastMessage'),
      buttons: [
        {
          text: 'Exit',
          handler: () => {
            // tslint:disable-next-line:no-string-literal
            navigator['app'].exitApp();
          }
        }
      ],
      cssClass: 'custom_toast',
      duration: 2000
    });
    this.toastExit.present();
    this.lastTimeBackPress = new Date().getTime();
  }


  async presentToast(msg: any) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 10000,
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: () => this.toastCtrl.dismiss()
      }],
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }

  async openMarketplaceLocations() {
    // const modal = await this.modalCtrl.create({
    //   component: MarketplaceLocationsPage
    // });
    // modal.present();
  }

}
