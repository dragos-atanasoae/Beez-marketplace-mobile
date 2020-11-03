import { LoadingService } from 'src/app/services/loading.service';
import { AnalyticsService } from './../../services/analytics.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastOptions } from '@ionic/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LoginModel } from 'src/app/models/login.model';
import { FacebookProfileModel } from 'src/app/models/facebookProfile.model';
import { ModalController, AlertController, ToastController, MenuController, Platform, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ResetPasswordPage } from '../reset-password/reset-password.page';
import { ManageAccountService } from 'src/app/services/manage-account.service';
// import { FacebookLoginResponse, Facebook } from '@ionic-native/facebook/ngx';

import { Plugins } from '@capacitor/core';
// import { ResponseSignInWithApplePlugin } from '@capacitor-community/apple-sign-in';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  language: string;
  localeData = new LocaleDataModel();
  currentYear = new Date().getFullYear();
  passwordType = 'password';
  passwordIcon = 'eye-off';
  loginForm: FormGroup;

  loginModel = new LoginModel();
  toastOptions: ToastOptions;
  resetPasswordResponse: any;

  // Facebook authentication
  // facebookAuthData: FacebookLoginResponse;
  private facebookProfileData = new FacebookProfileModel();
  facebookAuthApiResponse: any;
  modifiedProfilePictureUrl: string;
  userEmail: any;
  getProfileInfoResponse: any;
  validationMessages = {
    email: [
      { type: 'required', message: '' },
      { type: 'pattern', message: '' },
    ],
    passwd: [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' }
    ],
  };
  eventContext = 'LoginPage';
  showAppleSignIn = false;
  selectedCountry = localStorage.getItem('country') ? localStorage.getItem('country') : 'ro';
  step = 1;
  guestPreviewProduct = null;

  constructor(
    public modalCtrl: ModalController,
    public menuCtrl: MenuController,
    public platform: Platform,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public loadingService: LoadingService,
    private toastCtrl: ToastController,
    private authenticationService: AuthenticationService,
    private internationalizationService: InternationalizationService,
    private manageAccountService: ManageAccountService,
    private navCtrl: NavController,
    private analyticsService: AnalyticsService,
    private router: Router,
    // private facebook: Facebook,
  ) {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });

    if (this.platform.is('ios')) {
      this.showAppleSignIn = true;
    }

    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required, Validators.email])),
      passwd: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(6)
      ]))
    });
    this.validationMessages = {
      email: [
        { type: 'required', message: this.translate.instant('pages.login.validationMessages.emailRequired') },
        { type: 'pattern', message: this.translate.instant('pages.login.validationMessages.emailWrongFormat') },
      ],
      passwd: [
        { type: 'required', message: this.translate.instant('pages.login.validationMessages.passwordRequired') },
        { type: 'minlength', message: this.translate.instant('pages.login.validationMessages.passwordLength') }
      ]
    };
  }

  ngOnInit() {
    this.selectedCountry = 'ro';
    // this.getDeviceLocaleData();
    this.guestPreviewProduct = JSON.parse(localStorage.getItem('guestPreviewProduct'));
    console.log(this.guestPreviewProduct);
  }

  ionViewDidLoad() {
    localStorage.removeItem('currentUserToken');
    localStorage.removeItem('userName');
  }

  getDeviceLocaleData() {
    const deviceCountry = navigator.language.split('-')[1];

    console.log('Device country is: ', deviceCountry);
    if (deviceCountry === 'RO' || deviceCountry === 'GB') {
      console.log('Preselected country: ', deviceCountry);
      localStorage.setItem('country', deviceCountry === 'GB' ? 'uk' : deviceCountry.toLowerCase());
      this.selectedCountry = deviceCountry === 'GB' ? 'uk' : deviceCountry.toLowerCase();
    } else {
      console.log('The device country is not UK or RO. Please select your country');
      localStorage.setItem('country', 'ro');
      this.selectedCountry = 'ro';
    }
  }

  selectLanguage(country: string, language: string) {
    this.language = language;
    localStorage.setItem('country', country);
    localStorage.setItem('language', language);
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    this.selectedCountry = country;
  }

  /**
   * @Name hideShowPassword
   * @description Toggle type of input for password field
   */
  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  /**
   * @description Select the account
   * @param context login type Beez/Faceebook/Apple account
   */
  selectAccountType(context: string) {
    const country = localStorage.getItem('country');
    switch (context) {
      case 'login':
        this.login(country);
        this.analyticsService.initializeMixpanel();
        break;
      case 'facebook':
        this.facebookLogin(country);
        this.analyticsService.initializeMixpanel();
        break;
      case 'apple':
        this.openAppleSignIn(country);
        break;
    }
  }

  /**
   * @description Send user name & password and request authentication token
   */
  login(country: string) {
    this.loadingService.presentLoading();
    const credentials = {
      username: this.loginForm.controls.email.value,
      password: this.loginForm.controls.passwd.value
    };
    localStorage.setItem('userName', this.loginForm.controls.email.value);
    // console.log('Login page form' + JSON.stringify(credentials));
    this.authenticationService.login(country, credentials)
      .subscribe((authenticationResponse: any) => {
        console.log('Authentication response: ', authenticationResponse);
        this.onLoginSuccessful(authenticationResponse.access_token, authenticationResponse.userName, authenticationResponse.JWT);
        const eventParams = { context: this.eventContext };
        this.analyticsService.logEvent('login', eventParams);
      },
        (error) => this.handleLoginErrors(error));
  }

  /**
   * @description Save token and user email in localStorage and redirect the user
   * @param token - (string)
   * @param userName (string) email
   */
  onLoginSuccessful(token: string, userName: string, jwtToken: any) {
    localStorage.setItem('currentUserToken', token);
    localStorage.setItem('userName', userName);
    localStorage.setItem('jwtToken', token);
    this.getProfileInfo(userName);
    this.analyticsService.segmentIdentify();
    this.analyticsService.logEvent('login', {});
    this.navCtrl.navigateRoot('/tabs');
    if (localStorage.getItem('guestPreviewProduct')) {
      localStorage.removeItem('guestPreviewProduct');
    }
  }

  /**
   * @description Handle login errors and show the error message or redirect for Locked Accounts
   */
  handleLoginErrors(error: any) {
    this.loadingService.dismissLoading();
    console.log('Authentication error: ', error);
    const authenticationError: any = error;
    // console.log('TEST: ', authenticationError.error);
    const username = localStorage.getItem('userName');
    switch (authenticationError.error.message) {
      case 'locked_user':
        // console.log('User account is locked');
        this.navCtrl.navigateRoot('/account-locked');
        // redirect to locked account page
        break;
      case 'Invalid UserName or Password':
        // console.log('Invalid authentication data');
        this.presentToastWithAction(this.translate.instant('pages.login.errorInvalidCredentials'));
        break;
      default:
        // console.log('test');
        break;
    }

    const eventParams = { context: this.eventContext, error: authenticationError.error, email: username };
    this.analyticsService.logEvent('login', eventParams);
  }

  /**
   * @description Open the modal with email input for reset password, pass the email address to modal
   */
  async openResetPasswordModal() {
    const emailAddress = this.loginModel.username !== undefined ? this.loginModel.username : '';
    const modal = await this.modalCtrl.create({
      component: ResetPasswordPage,
      componentProps: { email: emailAddress, country: this }
    });
    modal.present();
  }

  // ================ 2 ================
  // ========= GET PROFILE INFO ========
  // ===================================
  getProfileInfo(userName: string) {
    this.authenticationService.getLinkedProfileInfo(userName).subscribe(response => {
      // console.log(response);
      this.getProfileInfoResponse = response;
      if (this.getProfileInfoResponse.responseSend.status !== 'error') {
        const infoProfile = this.getProfileInfoResponse.externalList[0];
        this.facebookProfileData.profilePicture = infoProfile !== undefined ? infoProfile.pictureProvider.replace(/\(AND\)/g, '&') : null;
        this.facebookProfileData.firstName = infoProfile !== undefined ? infoProfile.firstNameProvider : null;
        this.facebookProfileData.lastName = infoProfile !== undefined ? infoProfile.lastNameProvider : null;
        this.facebookProfileData.facebookID = infoProfile !== undefined ? infoProfile.idProvider : null;
        this.facebookProfileData.facebookEmail = infoProfile !== undefined ? infoProfile.emailProvider : null;
        this.saveFacebookProfileData();
      }
    });
  }

  // ================== 3 =====================
  // ========= FACEBOOK AUTHENTICATION ========
  // ==========================================
  // *** 3.1 FACEBOOK LOGIN ***
  // ==========================
  facebookLogin(country: string) {
    // const eventParams = { context: this.eventContext };
    // this.analyticsService.logEvent('login_facebook', eventParams);
    // this.facebook.login(['public_profile', 'email'])
    //   .then((res: FacebookLoginResponse) => {
    //     this.facebookAuthData = res;
    //     this.getFacebookData(country);
    //     console.log('Logged into Facebook!', res);
    //     console.log(this.facebookAuthData);
    //   })
    //   .catch(e => console.log('Error logging into Facebook', e));
  }
  // *** 3.2 GET DATA FROM FACEBOOK ***
  // ==================================
  getFacebookData(country: string) {
    // this.facebook.api('/me?fields=id,first_name,last_name,email,picture.type(large)', ['public_profile', 'email'])
    //   .then(data => {
    //     // console.log(data);
    //     this.facebookProfileData.facebookID = data.id;
    //     this.facebookProfileData.firstName = data.first_name;
    //     this.facebookProfileData.lastName = data.last_name;
    //     this.facebookProfileData.facebookEmail = data.email;
    //     this.facebookProfileData.profilePicture = data.picture.data.url;

    //     console.log(this.facebookProfileData);

    //     if (this.facebookProfileData !== null) {
    //       // console.log(this.facebookProfileData.facebookEmail);
    //       this.facebookProfileData.profilePicture = this.facebookProfileData.profilePicture.replace(/&/g, '(AND)');
    //       if (this.facebookProfileData.facebookEmail !== null || this.facebookProfileData.facebookEmail !== undefined) {
    //         this.postUserData('facebook', country, '', data.id, data.email, data.first_name, data.last_name, this.facebookProfileData.profilePicture, '', '');
    //       } else {
    //         this.postUserData('facebook', country, '', data.id, 'inexistent', data.first_name, data.last_name, this.facebookProfileData.profilePicture, '', '');
    //       }
    //     }
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }
  // *** 3.3 SAVE FACEBOOK PROFILE INFO TO LOCAL STORAGE ***
  // =======================================================
  saveFacebookProfileData() {
    localStorage.setItem('facebookProfilePicture', this.facebookProfileData.profilePicture);
    localStorage.setItem('facebookFirstName', this.facebookProfileData.firstName);
    localStorage.setItem('facebookLastName', this.facebookProfileData.lastName);
    localStorage.setItem('facebookID', this.facebookProfileData.facebookID);
    localStorage.setItem('facebookEmail', this.facebookProfileData.facebookEmail);
  }

  // *** 3.4 SEND AUTHETICATION DATA TO BEEZ ***
  // ===========================================
  /**
   * @name postUserData
   * @param country
   * @param userEmail
   * @param idProvider
   * @param emailProvider
   * @param firstNameProvider
   * @param lastNameProvider
   * @param pictureProvider
   * @param confirmPassword
   * @param promoCode
   */
  postUserData(
    provider: string,
    country: string,
    userEmail: string,
    idProvider: string,
    emailProvider: string,
    firstNameProvider: string,
    lastNameProvider: string,
    pictureProvider: string,
    confirmPassword: string,
    promoCode: string) {
    console.log('Test post API Facebook');
    this.authenticationService.postFacebookLogin(country, userEmail, idProvider, emailProvider, firstNameProvider, lastNameProvider, pictureProvider, confirmPassword, promoCode)
      .subscribe(response => {
        console.log('Response API FACEBOOK: ' + JSON.stringify(response));
        this.facebookAuthApiResponse = response;
        if (this.facebookAuthApiResponse.status === 'token') {
          console.log(this.facebookAuthApiResponse);
          this.userEmail = this.facebookAuthApiResponse.email;
          this.saveFacebookProfileData();
          this.onLoginSuccessful(this.facebookAuthApiResponse.message, this.facebookAuthApiResponse.email, this.facebookAuthApiResponse.JWT);
        } else if (this.facebookAuthApiResponse.status === 'error') {
          console.log(this.facebookAuthApiResponse.message);
          if (this.facebookAuthApiResponse.message === 'Confirm Password' || this.facebookAuthApiResponse.message === 'Invalid Password') {
            if (this.facebookAuthApiResponse.message === 'Confirm Password') {
              this.alertPromptPassword(provider, country, this.facebookAuthApiResponse.userMessage);
            } else {
              this.alertPromptPassword(provider, country, this.facebookAuthApiResponse.userMessage);
            }
          } else if (this.facebookAuthApiResponse.message === 'Solicit User Email' || this.facebookAuthApiResponse.message === 'User email not valid') {
            console.log('prompt for Email address');
            if (this.facebookAuthApiResponse.message === 'Solicit User Email') {
              this.alertPromptEmail(provider, country, this.facebookAuthApiResponse.userMessage);

            } else {
              this.alertPromptEmail(provider, country, this.facebookAuthApiResponse.userMessage);
            }
          }
        }
      });
  }
  // *** 3.5 ALERT PROMPT PASSWORD ***
  // =================================
  // show alert prompt password for existing Beez account(if facebook account email == beez account email)
  async alertPromptPassword(provider: string, country: string, msg: any) {
    const title = this.translate.instant('pages.login.facebookAuthentication.alertPromtedPassword.title');
    const placeholderText = this.translate.instant('pages.login.facebookAuthentication.alertPromtedPassword.inputPlaceholder');
    const buttonCancel = this.translate.instant('pages.login.facebookAuthentication.alertPromtedPassword.buttonCancel');
    const buttonConfirm = this.translate.instant('pages.login.facebookAuthentication.alertPromtedPassword.buttonConfirm');

    const promptPasswordAlert = await this.alertCtrl.create({
      header: title,
      message: msg,
      inputs: [
        {
          name: 'password',
          placeholder: placeholderText,
          type: 'password'
        }
      ],
      buttons: [
        {
          text: buttonCancel,
          role: 'cancel',
          handler: data => {
            console.log('Renunță confirmare parola asociere facebook');
          },
          cssClass: 'alert_btn_cancel'
        },
        {
          text: buttonConfirm,
          handler: data => {
            const userPassword = data.password;
            this.postUserData(
              provider,
              country,
              this.userEmail,
              this.facebookProfileData.facebookID,
              this.facebookProfileData.facebookEmail,
              this.facebookProfileData.firstName,
              this.facebookProfileData.lastName,
              this.modifiedProfilePictureUrl,
              userPassword, '');
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    promptPasswordAlert.present();
  }

  // *** 3.6 ALERT PROMPT EMAIL ***
  // ==============================
  // show alert prompt email if facebook account doesn't have a valid email address
  async alertPromptEmail(provider: string, country: string, msg: string) {
    const title = this.translate.instant('pages.login.facebookAuthentication.alertPromptedEmail.title');
    const placeholderText = this.translate.instant('pages.login.facebookAuthentication.alertPromptedEmail.inputPlaceholder');
    const buttonCancel = this.translate.instant('pages.login.facebookAuthentication.alertPromptedEmail.buttonCancel');
    const buttonConfirm = this.translate.instant('pages.login.facebookAuthentication.alertPromptedEmail.buttonConfirm');

    const promptPasswordAlert = await this.alertCtrl.create({
      header: title,
      message: msg,
      inputs: [
        {
          name: 'email',
          placeholder: placeholderText,
          type: 'text'
        }
      ],
      buttons: [
        {
          text: buttonCancel,
          role: 'cancel',
          handler: data => {
            console.log('Renunta adaugare email');
          },
          cssClass: 'alert_btn_cancel'
        },
        {
          text: buttonConfirm,
          handler: data => {
            const userEmail = data.email;
            this.facebookProfileData.facebookEmail = provider === 'apple' ? 'inexistent' : 'inexistent';
            this.postUserData(
              provider,
              country,
              userEmail,
              this.facebookProfileData.facebookID,
              this.facebookProfileData.facebookEmail,
              this.facebookProfileData.firstName,
              this.facebookProfileData.lastName,
              this.modifiedProfilePictureUrl, '', '');
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    promptPasswordAlert.present();
  }

  // async signInWIthApple(country: string) {
  //   try {
  //     const response: ResponseSignInWithApplePlugin = await SignInWithApple.Authorize();
  //     console.log('Apple sign in: ', response);
  //   } catch (e) {
  //     console.log('Apple sing in error: ', e);
  //   }
  // }

  /**
   * @description Open SignInWithApple native component and get authentication data from Apple account
   * @param country
   */
  openAppleSignIn(country: string) {
    const { SignInWithApple } = Plugins;
    // SignInWithApple.Authorize()
    //   .then(async (res: ResponseSignInWithApplePlugin) => {
    //     if (res.response && res.response.identityToken) {
    //       console.log(res);
    //       this.facebookProfileData.facebookID = res.response.user;
    //       this.facebookProfileData.firstName = res.response.givenName;
    //       this.facebookProfileData.lastName = res.response.familyName;
    //       this.facebookProfileData.facebookEmail = res.response.email !== null ? res.response.email : 'inexistent';
    //       this.facebookProfileData.profilePicture = '';
    //       this.postUserData(
    //         'apple', country, '',
    //         this.facebookProfileData.facebookID,
    //         this.facebookProfileData.facebookEmail,
    //         this.facebookProfileData.firstName,
    //         this.facebookProfileData.lastName,
    //         this.modifiedProfilePictureUrl, '', '');
    //     } else {
    //       console.log('error');
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }

  goToNextStep() {
    const email = this.loginForm.get('email').value;
    this.authenticationService.checkIfHasAccountCreated(email)
      .subscribe((res: any) => {
        if (res.status === 'success') {
          if (res.hasCreatedAccount) {
            this.step = 2;
            console.log(this.loginForm.value);
          } else {
            localStorage.setItem('userName', email);
            this.router.navigateByUrl('/register');
          }
        }
      });
  }

  goBack() {
    if (this.step === 2) {
      this.step--;
    } else {
      this.navCtrl.navigateBack('/welcome');
    }
  }



  /**
   * @Name present
   * @Param message
   */
  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 5000,
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }

  /**
   * *** Show Toast Message with close button ***
   * @description Show a toast message without duration, this toast message can be closed from close button
   * @Param message
   */
  async presentToastWithAction(msg: string) {
    console.log('show toast with action');
    const toast = await this.toastCtrl.create({
      message: msg,
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
