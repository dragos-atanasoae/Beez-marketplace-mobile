import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonTabs, ModalController, NavController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../services/analytics.service';
import { ManageAccountService } from '../services/manage-account.service';
import { StripePaymentService } from '../services/stripe-payment.service';

import {
  Plugins,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from '@capacitor/core';
import { Mixpanel, MixpanelPeople } from '@ionic-native/mixpanel/ngx';
import { BackButtonActionService } from '../services/back-button-action.service';
import { WalletService } from '../services/wallet.service';
import { Router } from '@angular/router';

const { PushNotifications, Keyboard } = Plugins;

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
  accountBeezData: any;
  notificationsCount: number;
  isKeyboardActive = false;
  heightOfTabsBar = 50;
  isVIPMember = true;

  constructor(
    public platform: Platform,
    private navCtrl: NavController,
    public zone: NgZone,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private managerAccountService: ManageAccountService,
    private mixpanel: Mixpanel,
    private mixpanelPeople: MixpanelPeople,
    private stripePaymentService: StripePaymentService,
    private walletService: WalletService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.reloadLang(localStorage.getItem('language'));

    if (!this.platform.is('desktop')) {
      // console.log('Platform mobile, get the device token', !this.platform.is('desktop'));
      this.analyticsService.initializeMixpanel();
      this.analyticsService.segmentIdentify();
      this.initializeDeviceToken();
    } else {
      // console.log('Skip initialization of push notifications');
    }
    this.getUserExternalId();
    this.getVipDetails();
    this.stripePaymentService.getPaymentProcessor();
    this.stripePaymentService.getPaymentMethods('initialize');
    this.listenForBackEvent();
  }

  ngAfterViewInit(): void {
    // Recalculate position of fab button, for new iOS devices with no hardware button add more margin-bottom
    setTimeout(() => {
      this.heightOfTabsBar = this.tabsBar.nativeElement.offsetHeight;
    }, 500);
  }

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
          this.analyticsService.firebaseIdentifyUser(res.externalId);
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
    // Set user unique ID in Mixpanel
    this.mixpanel.identify(this.userExternalId);

    // Set user profile in mixpanel
    this.mixpanelPeople.set({
      $distinct_id: this.userExternalId,
      $email: localStorage.getItem('userName'),
    }).then(() => {
      // console.log('Mixpanel people: ', user);
    });

    // Add device token, used for push notifications, to the Mixpanel profile
    if (this.platform.is('android')) {
      this.mixpanelPeople.set({ $android_devices: [this.deviceToken] });
    } else if (this.platform.is('ios')) {
      this.mixpanelPeople.set({ $ios_devices: [this.deviceToken] });
    }
  }

  /**
   * @name isVipMember
   * @description Check if user is vip member
   */
  getVipDetails() {
    this.walletService.getVipDetails();
    this.walletService.vipDetails$
      .subscribe((response: any) => {
        this.isVIPMember = response.isVip;
        console.log(this.isVIPMember);
      });
  }

  /**
   * @name analyticsRegisterWithPromoCode
   * @description Save the event(Register with promo code) to analytics if on the register is added a valid promo code
   */
  analyticsRegisterWithPromoCode() {
    if (this.promoCodeOnRegister !== undefined || this.promoCodeOnRegister !== null) {
      const eventParams = { promo_code_on_register: this.promoCodeOnRegister };
      this.analyticsService.logEvent('register_with_promo_code', eventParams);
    }
  }

  /**
   * *** PUSH NOTIFICATIONS ***
   * ********* START **********
   */

  /**
   * @name initializeDeviceToken
   * @description Get Device token from Firebase
   */
  async initializeDeviceToken() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // console.log('Error: Permision denied');
      }
    });
    // Get the device token from firebase
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        // console.log('Device token: ', token.value);
        this.saveDeviceToken(token.value);
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        console.log('Action performed: ', notification);
        // alert('Push action performed: ' + JSON.stringify(notification));
      }
    );

    setTimeout(() => {
      this.intializeMixpanelUserProfile();
    }, 500);
  }

  /**
   * @name saveDeviceToken
   * @description Save device token to Beez database
   * @param deviceToken - received from firebase
   */
  saveDeviceToken(deviceToken: string) {
    this.deviceToken = deviceToken;
    this.managerAccountService.postDeviceToken(deviceToken).subscribe(response => {
      const res: any = response;
      if (res.status === 'success') {
        // console.log('Device token saved successfully ' + res.message);
        localStorage.setItem('deviceToken', deviceToken);
      } else {
        // console.log('Error: device token can\'t be saved: ' + res.message);
      }
    });
  }

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
    if (this.activeTab === 'profile') {
      // this.notificationService.unreadNotifications();
    }
    const eventParams = { active_tab: this.activeTab };
    this.analyticsService.logEvent('select_tab_' + this.activeTab, eventParams);
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
   * @description Show toast message
   * @param msg
   */
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

/**
 * @description Overwrite back button for android platform(back and exit)
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
   * @description Show toast message to confirm close app
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

}
