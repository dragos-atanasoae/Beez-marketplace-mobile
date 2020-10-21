import { VipSubscriptionPage } from '../../pages/profile/vip-subscription/vip-subscription.page';
import { LoadingService } from 'src/app/services/loading.service';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FacebookProfileModel } from 'src/app/models/facebookProfile.model';
import { ModalController, AlertController, ToastController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
// import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ManageAccountService } from 'src/app/services/manage-account.service';
import { Router, NavigationExtras } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { WalletModel } from 'src/app/models/wallet.model';
import { WalletService } from 'src/app/services/wallet.service';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { UserService } from 'src/app/services/user.service';
import { Plugins } from '@capacitor/core';
import { ManageAddressesPage } from '../../pages/profile/manage-addresses/manage-addresses.page';
import { ManageStripeCardsPage } from '../../pages/profile/manage-stripe-cards/manage-stripe-cards.page';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { takeUntil } from 'rxjs/operators';
import { transition, trigger, useAnimation } from '@angular/animations';
import { bounceIn, fadeIn, fadeOut } from 'ng-animate';

const { Browser } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 0.8, delay: 0 }
      }),
      transition(':leave', useAnimation(fadeOut), {
        params: { timing: 0.3, delay: 0 }
      })
    ]),
  ]
})
export class ProfilePage implements OnInit, OnDestroy {

  language: string;
  country: string;
  localeData = new LocaleDataModel();
  userEmail: string;
  helloUserName: string;
  requireKycValidation: boolean;
  // Referral
  promoCode: string;
  addPromoCodeResponse: any;
  referralInfo: any;
  referralCode: string;
  referralLink: string;
  promoCodeForm: FormGroup;

  // Facebook Login variables
  facebookProfileData = new FacebookProfileModel();
  facebookAuthData: any;
  facebookAuthApiResponse: any;
  modifiedProfilePictureUrl: any;
  getProfileInfoResponse: any;
  facebookProfileDataSubscriber: Subscription;

  // Dashboard
  walletInfo: WalletModel;
  showDetailsCashback = true;
  showDetailsBeezPay = false;
  showDetailsInvitations = false;
  isVIPMember: boolean;

  // progress bar variables
  availableBeezPay = 0;
  lockedBeezPay = 0;
  noData = false;
  notificationsCount: number;
  profileInfo: any;
  eventContext: 'Profile Page';

  paymentProcessor = null;
  private unsubscribe$: Subject<boolean> = new Subject();

  constructor(
    private router: Router,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingService: LoadingService,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public platform: Platform,
    private analyticsService: AnalyticsService,
    // private facebook: Facebook,
    private walletService: WalletService,
    public notificationService: NotificationService,
    private internationalizationService: InternationalizationService,
    private authenticationService: AuthenticationService,
    private manageAccountService: ManageAccountService,
    private userService: UserService,
    private stripePaymentService: StripePaymentService,
  ) {
    this.country = localStorage.getItem('country');
    this.language = localStorage.getItem('language');
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    this.referralCode = localStorage.getItem('referralCode');
    this.userEmail = localStorage.getItem('userName');
    this.promoCodeForm = new FormGroup({
      promo_code: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(4)])),
    });
    this.helloUserName = this.userEmail.substr(0, this.userEmail.indexOf('@'));
    this.notificationService.notificationsCount.subscribe(r => this.notificationsCount = r);
  }

  ionViewWillEnter() {
    this.getDashboardInfo();
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.getReferralInfo();
    this.getPaymentProcessor();
    // this.getDashboardInfo();
    // this.isVipMember();
    this.getVipDetails();
    if (this.country === 'ro') {
      this.getProfileInfo();
    }
    this.getUserInformation();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  getPaymentProcessor() {
    this.stripePaymentService.paymentProcessor$.subscribe(res => {this.paymentProcessor = res; console.log('Payment processor', this.paymentProcessor); });
  }

  /**
   * @name getUserInformation
   * @description Get all information about user like contact address, delivery address, isVip etc
   */
  getUserInformation() {
    this.userService.getProfileInfo()
      .subscribe((response: any) => {
        // console.log(response);
        if (response.status === 'succes') {
          this.profileInfo = response.data;
        }
      }, error => console.log('Could not load profile information.'));
  }

  /**
   * @name isVipMember
   * @description Check if user is vip member
   */
  isVipMember() {
    this.walletService.isVipMember()
      .subscribe((response: any) => {
        this.isVIPMember = response;
      });
  }

  /**
   * @name isVipMember
   * @description Check if user is vip member
   */
  getVipDetails() {
    this.walletService.vipDetails$
      .subscribe((response: any) => {
        this.isVIPMember = response.isVip;
        console.log(this.isVIPMember);
      });
  }

  async openVipSubscriptionDetails() {
    const modal = await this.modalCtrl.create({
      component: VipSubscriptionPage,
    });
    this.analyticsService.logEvent('open_vip_subscription_page', {context: this.eventContext});
    await modal.present();
  }

  /**
   * @name getProfileInfo
   * @description Update view of profile details if facebook account is linked
   */
  getProfileInfo() {
    this.facebookProfileDataSubscriber = this.authenticationService.getLinkedProfileInfo(this.userEmail).subscribe(response => {
      const getProfileInfoResponse: any = response;
      if (getProfileInfoResponse.responseSend.status !== 'Error') {
        const infoProfile = getProfileInfoResponse.externalList[0];
        this.facebookProfileData.profilePicture = infoProfile.pictureProvider.replace(/\(AND\)/g, '&');
        this.facebookProfileData.firstName = infoProfile.firstNameProvider;
        this.facebookProfileData.lastName = infoProfile.lastNameProvider;
        this.facebookProfileData.facebookID = infoProfile.idProvider;
        this.facebookProfileData.facebookEmail = infoProfile.emailProvider;
        this.saveFacebookProfileData();
      } else {
        // console.log('Profile picture:' + this.facebookProfileData.profilePicture);
        // console.log('Profile firstname:' + this.facebookProfileData.firstName);
        // console.log('Profile lastname:' + this.facebookProfileData.lastName);
      }
    });
  }

  /**
   * @name getReferralInfo
   * @description Get referral info(referral link, referral code, number of invitations: aproved, pending)
   */
  getReferralInfo() {
    this.manageAccountService.getReferralInfo().subscribe(data => {
      this.referralInfo = data;
      // console.log(this.referralInfo);
    });
  }

  /**
   * @name getDashboardInfo
   * @description Get wallet info from database
   */
  getDashboardInfo() {
    this.loadingService.presentLoading();
    this.walletService.getWalletInfo().subscribe(response => {
      const res: any = response;
      // console.log(res.hasOwnProperty('isSuccess'));
      if (res.hasOwnProperty('isSuccess')) {
        if (res.isSuccess) {
          // console.log(res.status);
        }
      } else {
        this.walletInfo = res;
        if (this.walletInfo.availableBeezPay === 0 && this.walletInfo.lockedBeezPay === 0) {
          this.noData = true;
        } else {
          this.noData = false;
          this.availableBeezPay = (this.walletInfo.availableBeezPay * 100) / this.walletInfo.maxBeezPay;
          this.lockedBeezPay = (this.walletInfo.lockedBeezPay * 100) / this.walletInfo.maxBeezPay;
        }
        // console.log(this.walletInfo);
      }
      this.loadingService.dismissLoading();
    }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name openManageCreditCards
   * @description Open modal Manage credit cards
   */
  async openManageCreditCards() {
    // console.log(this.profileInfo.CreditCards);
    const modal = await this.modalCtrl.create({
      component: ManageStripeCardsPage,
      componentProps: { profileInfo: this.profileInfo }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data === 'creditCardListChanged') {
        if (this.paymentProcessor === 'Stripe') {
          this.stripePaymentService.getPaymentMethods('initialize');
        }
        this.getUserInformation();
      }
    });
    this.analyticsService.logEvent('open_manage_cards_page', {context: this.eventContext});
    await modal.present();
  }

  /**
   * @name openManageAddresses
   * @description Open modal Manage addresses
   */
  async openManageAddresses() {
    const modal = await this.modalCtrl.create({
      component: ManageAddressesPage,
      componentProps: { profileInfo: this.profileInfo }
    });
    await modal.present();
    this.analyticsService.logEvent('open_manage_addresses_page', {context: this.eventContext});
    modal.onDidDismiss().then((data) => {
      if (data.data === 'add' || data.data === 'edit') {
        this.getUserInformation();
      }
    });
  }

  /**
   * @name addPromoCode
   * @description Add promo code to database
   */
  addPromoCode() {
    this.loadingService.presentLoading();
    // console.log('Adding promo code: ' + this.promoCode);
    const eventParams: any = { context: this.eventContext, promo_code: this.promoCode };
    this.manageAccountService.addPromoCode(this.promoCode).subscribe(data => {
      this.addPromoCodeResponse = data;
      if (this.addPromoCodeResponse === 'OK') {
        const toastMessage = this.translate.instant('pages.profileTab.alertAddPromoCode.addPromoCodeSuccesfully');
        this.presentToast(toastMessage);
        this.analyticsService.logEvent('add_promo_code', eventParams);
      } else {
        this.presentToast(this.addPromoCodeResponse);
        eventParams.error = this.addPromoCodeResponse;
        this.analyticsService.logEvent('add_promo_code_error', eventParams);
      }
      this.loadingService.dismissLoading();
    }, () => this.loadingService.dismissLoading());
    this.promoCodeForm.reset();
  }


  /**
   * @name alertAddPromoCode
   * @description Show alert with input to add Beez promo code
   */
  async alertAddPromoCode() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('pages.profileTab.alertAddPromoCode.title'),
      inputs: [
        {
          type: 'text',
          placeholder: this.translate.instant('pages.profileTab.alertAddPromoCode.placeholder')
        }
      ],
      buttons: [
        {
          role: 'cancel',
          text: this.translate.instant('buttons.buttonCancel'),
          cssClass: 'alert_btn_cancel'
        },
        {
          text: this.translate.instant('pages.profileTab.alertAddPromoCode.buttonAdd'),
          handler: data => {
            this.promoCode = data[0];
            this.addPromoCode();
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    alert.present();
  }

  /**
   * @name openTransactionsListPage
   * @description Open transactions list page by context(cashback or beezPay payments)
   * @param context
   */
  openTransactionsListPage(context: string) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        contextData: context
      }
    };
    const eventParams = { context: this.eventContext };
    this.router.navigate(['transactions-list'], navigationExtras);
    switch (context) {
      case 'payments':
        this.analyticsService.logEvent('go_to_payments_list', eventParams);
        break;
      case 'cashback':
        this.analyticsService.logEvent('go_to_cashback_savings', eventParams);
        break;
      default:
        break;
    }
  }

  // ====================== 3 =========================
  // ============ FACEBOOK AUTHENTICATION  ============
  // ==================================================

  // *** 3.1 FACEBOOK LOGIN ***
  // ==========================
  facebookLogin() {
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    // this.analyticsService.logEvent('link_facebook_account', eventParams);
    // this.postInteractionsLogAnalytics('Profile Page', 'Conectare Facebook', 'Asociere cont Facebook', 'Click', 'facebookLogin()', '', '', '', '');
    // this.facebook.login(['public_profile', 'email'])
    //   .then((res: FacebookLoginResponse) => {
    //     this.facebookAuthData = res;
    //     this.getFacebookData();
    //     // console.log('Logged into Facebook!', res);
    //     // console.log(this.facebookAuthData);
    //   })
    //   .catch(e => console.log('Error logging into Facebook', e));
  }
  // *** 3.2 GET DATA FROM FACEBOOK ***
  // ==================================
  getFacebookData() {
    // this.facebook.api('/me?fields=id,first_name,last_name,email,picture.type(large)', ['public_profile', 'email'])
    //   .then(data => {
    //     // console.log(data);
    //     this.facebookProfileData.facebookID = data.id;
    //     this.facebookProfileData.firstName = data.first_name;
    //     this.facebookProfileData.lastName = data.last_name;
    //     this.facebookProfileData.facebookEmail = data.email;
    //     this.facebookProfileData.profilePicture = data.picture.data.url;
    //     // let string = this.facebookProfileData.toString();
    //     // console.log(this.facebookProfileData);

    //     if (this.facebookProfileData !== null) {
    //       // console.log(this.facebookProfileData.facebookEmail);
    //       this.modifiedProfilePictureUrl = this.facebookProfileData.profilePicture.replace(/&|_/g, '(AND)');
    //       if (this.facebookProfileData.facebookEmail !== null || this.facebookProfileData.facebookEmail !== undefined) {
    //         this.postFacebookProfileDataToBeez(this.userEmail, data.id, data.email, data.first_name, data.last_name, this.modifiedProfilePictureUrl, '', '');
    //       } else {
    //         this.postFacebookProfileDataToBeez(this.userEmail, data.id, 'inexistent', data.first_name, data.last_name, this.modifiedProfilePictureUrl, '', '');
    //       }
    //     }
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }
  // *** 3.3 SEND FACEBOOK PROFILE DATA TO BEEZ ***
  // ===========================================
  postFacebookProfileDataToBeez(userEmail: string, idProvider: string, emailProvider: string, firstNameProvider: string, lastNameProvider: string, pictureProvider: string, confirmPassword: string, promoCode: string) {
    this.authenticationService.postFacebookLink(userEmail, idProvider, emailProvider, firstNameProvider, lastNameProvider, pictureProvider, confirmPassword, promoCode).subscribe(response => {
      // console.log('Response API FACEBOOK: ' + JSON.stringify(response));
      this.facebookAuthApiResponse = response;
      if (this.facebookAuthApiResponse.status === 'token') {
        // console.log(this.facebookAuthApiResponse);
        this.presentToast(this.facebookAuthApiResponse.userMessage);
        this.onJoinSuccessful(this.facebookAuthApiResponse.message);
      } else if (this.facebookAuthApiResponse.status === 'error') {
        // console.log(this.facebookAuthApiResponse.message);
        if (this.facebookAuthApiResponse.message === 'Facebook linked to another account') {
          this.presentToast(this.facebookAuthApiResponse.userMessage);
          this.facebookProfileData.facebookID = null;
          this.facebookProfileData.firstName = null;
          this.facebookProfileData.lastName = null;
          this.facebookProfileData.profilePicture = null;
        } else if (this.facebookAuthApiResponse.message === 'User email not valid') {
          this.presentToast(this.facebookAuthApiResponse.userMessage);
        }
      }
    });
  }

  // *** 3.4 ON LINKED SUCCESSFULLY ***
  // ==================================
  onJoinSuccessful(token: string) {
    // console.log('TOKEN: ' + token);
    localStorage.setItem('currentUserToken', token);
    localStorage.setItem('userName', this.userEmail);
    this.saveFacebookProfileData();
    this.analyticsService.initializeMixpanel();
  }

  // *** 3.5 SAVE FACEBOOK PROFILE INFO TO LOCAL STORAGE ***
  // =======================================================
  saveFacebookProfileData() {
    localStorage.setItem('facebookProfilePicture', this.facebookProfileData.profilePicture);
    localStorage.setItem('facebookFirstName', this.facebookProfileData.firstName);
    localStorage.setItem('facebookLastName', this.facebookProfileData.lastName);
    localStorage.setItem('facebookID', this.facebookProfileData.facebookID);
    localStorage.setItem('facebookEmail', this.facebookProfileData.facebookEmail);
  }

  // *** 3.6 CLEAR FACEBOOK PROFILE INFO FROM LOCAL STORAGE ***
  // =======================================================
  clearFacebookProfileData() {
    this.loadingService.presentLoading();
    localStorage.removeItem('facebookProfilePicture');
    localStorage.removeItem('facebookFirstName');
    localStorage.removeItem('facebookLastName');
    localStorage.removeItem('facebookID');
    localStorage.removeItem('facebookEmail');
    setTimeout(() => {
      this.loadingService.dismissLoading();
    }, 500);
  }

  /**
   * @name presentToast
   * @param toastMessage
   */
  async presentToast(toastMessage) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 4000,
      cssClass: 'custom_toast'
    });
    toast.present();
  }

  /**
   * *** Pull to Refresh page ***
   * @param refresher
   */
  doRefresh(refresher) {
    this.getDashboardInfo();
    setTimeout(() => {
      this.getReferralInfo();
      this.getProfileInfo();
      this.getUserInformation();
      refresher.target.complete();
    }, 1000);
  }
  ionViewDidLeave() {
    this.facebookProfileDataSubscriber.unsubscribe();
  }

}
