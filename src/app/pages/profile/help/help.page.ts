import { AnalyticsService } from 'src/app/services/analytics.service';
import { Component } from '@angular/core';
import { ToastController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Plugins } from '@capacitor/core';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

const { Browser } = Plugins;

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage {

  language: string;
  country = localStorage.getItem('country');
  emailSubject = '';
  emailBody = '';
  counterBack = 0;
  referralCode: string;
  currentPlatform: string;
  eventContext = 'Help Page';
  walkthroughsProperties = JSON.parse(localStorage.getItem('walkthroughsProperties'));

  constructor(
    private platform: Platform,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public translate: TranslateService,
    private callNumber: CallNumber,
    private emailComposer: EmailComposer,
    private inAppBrowser: InAppBrowser,
    private analyticsService: AnalyticsService
    ) {
    this.language = localStorage.getItem('language');
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    console.log(this.language);
    this.referralCode = localStorage.getItem('referralCode');
    this.currentPlatform = this.platform.platforms().toString();
    console.log(this.currentPlatform);
  }

  ionViewWillEnter() {
    // Send to analytics open page
    this.analyticsService.logEvent('select_help_page', {});
  }

  /**
   * @name openFacebookMessenger
   * @description Contact Beez support in Facebook messenger app
   */
  openFacebookMessenger() {
    Browser.open({ url: 'https://m.me/usebeez?ref=app', windowName: '_system' });
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('contact_facebook_messenger', eventParams);
  }
  /**
   * @name openWhatsapp
   * @description Open Whatsapp conversation with Beez phone number
   */
  openWhatsapp() {
    const userEmail = localStorage.getItem('userName');
    const messagePart1 = this.translate.instant('pages.help.contactWhatsapp.messagePart1');
    const messagePart2 = this.translate.instant('pages.help.contactWhatsapp.messagePart2');
    const contactMessage = messagePart1 + ' ' + userEmail + ', ' + messagePart2 + '';
    this.inAppBrowser.create('https://api.whatsapp.com/send?phone=' + this.translate.instant('pages.help.labelPhoneNumber') + '&text=' + contactMessage, '_system');
    // Browser.open({url: 'https://api.whatsapp.com/send?phone=40732516760&text=' + contactMessage, windowName: '_system'});
    const eventParams = { context: this.eventContext };
    this.analyticsService.logEvent('contact_via_whatsapp', eventParams);
  }

  /**
   * @name sendEmail
   */
  async sendEmail() {
    const email = {
      to: 'contact@use-beez.com',
      cc: 'lucian@use-beez.com',
      subject: this.emailSubject,
      body: this.emailBody,
      isHtml: true
    };
    // Send a text message using default options
    this.emailComposer.open(email);

    const eventParams = { context: this.eventContext };
    this.analyticsService.logEvent('contact_via_email', eventParams);
  }

  /**
   * @name callBeez
   * @description Open Beez phone number in phone dialer
   */
  callBeez() {
    const eventParams = { context: this.eventContext };
    this.analyticsService.logEvent('call_support_help_page', eventParams);
    this.callNumber.callNumber(this.translate.instant('pages.help.labelPhoneNumber'), true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  /**
   * @name presentToast
   * @param toastMessage
   */
  async presentToast(toastMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 5000,
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }
}
