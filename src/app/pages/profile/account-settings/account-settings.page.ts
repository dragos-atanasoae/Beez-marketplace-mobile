import { ConfirmDeleteDataComponent } from './../../../components/confirm-delete-data/confirm-delete-data.component';
import { LoadingService } from 'src/app/services/loading.service';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { Component } from '@angular/core';
import { ToastController, NavController, AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ManageAccountService } from 'src/app/services/manage-account.service';
import { Plugins } from '@capacitor/core';
import { EventsService } from 'src/app/services/events.service';

const { Browser, Device } = Plugins;

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage {
  language: string;
  loading: any;
  appVersionNumber = '-';
  toastMessage: string;
  resetPasswordResponse: any;

  emailAddress: string;
  referralCode: string;
  currentTime: number;
  hello: string;
  helloUserName: string;

  profileSection: string;
  profileEmail: string;
  showInfoStoredData = false;

  settingsString: string;

  saveSettingsResponse: any;
  requestDescription: string;
  requestType: string;
  requestResponse: any;
  eventContext = 'Account Settings';

  constructor(
    public toastCtrl: ToastController,
    public loadingService: LoadingService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private eventsService: EventsService,
    private translate: TranslateService,
    private authenticationService: AuthenticationService,
    private manageAccountService: ManageAccountService,
    private analyticsService: AnalyticsService,
  ) {
    this.language = localStorage.getItem('language');
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    console.log(this.language);
    // Get the App verion number
    this.getDeviceInfo();
    this.emailAddress = localStorage.getItem('userName');
    this.referralCode = localStorage.getItem('referralCode');
  }

  ionViewWillEnter() {
    const eventParams = {};
    this.analyticsService.logEvent('select_settings_page', eventParams);
  }

  /**
   * @description Get the device info & appVersion
   */
  async getDeviceInfo() {
    const deviceInfo = await Device.getInfo();
    this.appVersionNumber = deviceInfo.appVersion;
  }

  /**
   * @name changeLanguage
   * @description Change the display language
   */
  async changeLanguage() {
    const title = this.translate.instant('pages.accountSettingsPage.alertChangeLanguage.title');
    const btnCancel = this.translate.instant('buttons.buttonCancel');
    const alertChangeLanguage = await this.alertCtrl.create({
      header: title,
      inputs: [
        {
          type: 'radio',
          label: 'English',
          value: 'en',
          checked: localStorage.getItem('language') === 'en'
        },
        {
          type: 'radio',
          label: 'Română',
          value: 'ro',
          checked: localStorage.getItem('language') === 'ro'
        },
      ],
      buttons: [
        {
          text: btnCancel,
          cssClass: 'alert_btn_cancel'
        },
        {
          text: 'OK',
          handler: data => {
            this.loadingService.presentLoading();
            localStorage.setItem('language', data);
            this.language = data;
            this.translate.setDefaultLang(data);
            this.translate.use(this.language);
            console.log(this.language);
            setTimeout(() => {
              this.loadingService.dismissLoading();
            }, 800);
            this.setAccountLanguage(data);
            const eventParams = { context: this.eventContext, user_code: this.referralCode, language: data };
            this.analyticsService.logEvent('change_language', eventParams);
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    alertChangeLanguage.present();
  }

  /**
   * @name setAccountLanguage
   * @description Set the default language for created account(POST to database)
   */
  setAccountLanguage(language: string) {
    this.manageAccountService.postLanguage(language).subscribe((response: any) => {
      console.log(response);
      if (response.status === 'success') {
        this.translate.reloadLang(language);
        this.eventsService.publishEvent('updateLanguage');
      }
    });
  }

  /**
   * @name resetPassword
   * @description Send request to reset password, receive email with link for change password
   * @param email
   */
  resetPassword() {
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('reset_password', eventParams);
    const country = localStorage.getItem('country');
    this.authenticationService.recoverPassword(country, this.emailAddress).subscribe(res => {
      console.log(res);
      this.resetPasswordResponse = res;
      this.presentToast(this.resetPasswordResponse.userMessage);
    });
  }

  /**
   * @name logout
   * @description Delete all user data from local storage and redirect to authentication
   */
  logout() {
    this.deleteDeviceToken();
    console.log('Logout from Account Settings Page');
    const language = localStorage.getItem('language');
    // remove user from local storage to log user out
    localStorage.clear();
    localStorage.setItem('language', language);
    this.navCtrl.navigateRoot('welcome');
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('account_settings_page', eventParams);
  }

  /**
   * @name deleteDeviceToken
   * @description Delete device token, used for push notifications, from database
   */
  deleteDeviceToken() {
    const deviceToken = localStorage.getItem('deviceToken');
    const country = localStorage.getItem('country');
    this.manageAccountService.deleteDeviceToken(country, deviceToken).subscribe(res => {
      console.log(res);
    });
  }

  /**
   * *** Show/Hide info about personal data(GDPR) ***
   */
  showInfoData() {
    if (this.showInfoStoredData) {
      this.showInfoStoredData = false;
    } else {
      this.showInfoStoredData = true;
      const eventParams = { context: this.eventContext, user_code: this.referralCode };
      this.analyticsService.logEvent('show_info_about_stored_data', eventParams);
    }
  }

  /**
   * *** REQUEST INFORMATION ABOUT PERSONAL DATA ***
   */
  requestData() {
    this.loadingService.presentLoading();
    console.log('Request data');
    this.requestDescription = 'Solicită informare cu privire asupra datelor personale';
    this.requestType = 'request data';
    this.manageAccountService.manageAccountRequest(this.requestDescription, this.requestType)
      .subscribe(data => {
        this.loadingService.dismissLoading();
        this.requestResponse = data;
        this.onAccountManagementRequestSuccesfull();
      }, () => this.loadingService.dismissLoading());
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('request_stored_data', eventParams);
  }

  /**
   * *** REQUEST DELETE PERSONAL DATA ***
   */
  requestDeleteData() {
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('request_delete_stored_data', eventParams);
    this.loadingService.presentLoading();
    this.requestDescription = 'Solicită ștergerea datelor personale';
    this.requestType = 'delete data';
    console.log('Request delete data');
    this.manageAccountService.manageAccountRequest(this.requestDescription, this.requestType)
      .subscribe(data => {
        this.requestResponse = data;
        this.onAccountManagementRequestSuccesfull();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name modalConfirmRequestDeleteAccount
   */
  async modalConfirmRequestDeleteAccount() {
    const answersList = [];
    for (let index = 1; index < 5; index++) {
      answersList.push({ id: index, answer: this.translate.instant('components.confirmDeleteData.account.answer' + index) });
    }
    const modal = await this.modalCtrl.create({
      component: ConfirmDeleteDataComponent,
      componentProps: {
        type: 'Account',
        title: this.translate.instant('components.confirmDeleteData.account.title'),
        answersList
      },
      showBackdrop: true,
      backdropDismiss: false,
      cssClass: 'modal_confirm_delete_data'
    });
    modal.present();
    modal.onDidDismiss().then((data) => {
      if (data.data === 'close') { } else {
        this.requestDeleteAccount(data.data.reason);
      }
    });
  }

  /**
   * *** REQUEST DELETE ACCOUNT ***
   */
  requestDeleteAccount(removeAccountReason?: string) {
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('request_delete_account', eventParams);
    this.loadingService.dismissLoading();
    this.requestDescription = 'Solicită ștergere cont use-beez.com';
    this.requestType = 'delete account';
    console.log('Request delete account');
    this.manageAccountService.manageAccountRequest(this.requestDescription, this.requestType, removeAccountReason)
      .subscribe(data => {
        this.requestResponse = data;
        this.onAccountManagementRequestSuccesfull();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * *** ON REQUEST IS SUCCESSFULLY ***
   */
  onAccountManagementRequestSuccesfull() {
    this.loadingService.dismissLoading();
    this.presentToast(this.translate.instant('pages.accountSettingsPage.toastMessages.onAccountManagementRequestSuccesfull'));
  }

  /**
   * *** Open Web Page ***
   * @description Open Terms of Use, Privacy Policy, About web Page in system default browser
   * @param webPage
   */
  openWebPage(webPage: string) {
    let pageUrl = '';
    switch (webPage) {
      case 'privacyPolicy':
        pageUrl = 'https://use-beez.com/privacy';
        break;
      case 'termsOfUse':
        pageUrl = 'https://use-beez.com/terms';
        break;
      case 'about':
        pageUrl = 'https://use-beez.com/about';
        break;
      default:
        break;
    }

    Browser.open({ url: pageUrl, windowName: '_blank' });
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('open_' + pageUrl, eventParams);
  }

  /**
   * @description Open Selected Page
   * @param pageName
   */
  openPage(pageName: string) {
    this.navCtrl.navigateForward('/' + pageName);
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('open_' + pageName, eventParams);
  }

  /**
   * *** SHOW TOAST MESSAGES ***
   * @param message
   */
  async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }

  /**
   * *** Open Terms of Use ***
   * @description Open Terms of Use from https://use-beez.com in inAppBrowser
   */
  openTermsOfUse() {
    const termsOfUseUrl = 'https://use-beez.com/Terms';
    Browser.open({ url: termsOfUseUrl, windowName: '_blank' });
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('open_termsOfUse_page', eventParams);
  }

  /**
   * *** Open Privacy Policies ***
   * @description Open Privacy policies web page in inAppBrowser
   */
  openPrivacyPolicies() {
    const privacyPoliciesUrl = 'https://use-beez.com/Privacy';
    Browser.open({ url: privacyPoliciesUrl, windowName: '_blank' });
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('open_privacy_policies_page', eventParams);
  }
}
