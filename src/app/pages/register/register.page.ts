import { LoadingService } from 'src/app/services/loading.service';
import { Component, OnInit } from '@angular/core';
import { RegisterModel } from 'src/app/models/register.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FacebookProfileModel } from 'src/app/models/facebookProfile.model';
import { NavController, Platform, ToastController, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
// import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { ManageAccountService } from 'src/app/services/manage-account.service';
import { Plugins } from '@capacitor/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
// import { ResponseSignInWithApplePlugin } from '@capacitor-community/apple-sign-in';

const { Browser } = Plugins;
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  language: string;
  loading = false;
  registerData = new RegisterModel();
  accept = false;
  passwordType = 'password';
  passwordIcon = 'eye-off';
  registerResponse: any;
  registerForm: FormGroup;
  chooseAccountType: FormGroup;

  facebookAuthData: any;
  facebookProfileData = new FacebookProfileModel();
  facebookAuthApiResponse: any;
  userEmail = '';
  userPassword = '';
  modifiedProfilePictureUrl: string;

  showAppleSignUp = false;

  validationMessages = {
    email: [
      { type: 'required', message: '' },
      { type: 'pattern', message: '' },
    ],
    passwd: [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' }
    ],
    confirm_passwd: [
      { type: 'required', message: '' },
      { type: 'minlength', message: '' }
    ],
    accept_term_of_use: [
      { type: 'required', message: '' }
    ],
    confirm_age_over_18: [
      { type: 'required', message: '' }
    ]
  };

  selectedCountry = localStorage.getItem('country') ? localStorage.getItem('country') : 'ro';
  email = localStorage.getItem('userName');

  constructor(
    private analyticsService: AnalyticsService,
    public navCtrl: NavController,
    public translate: TranslateService,
    public platform: Platform,
    private loadingService: LoadingService,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    // public events: Events,
    private authenticationService: AuthenticationService,
    private manageAccountService: ManageAccountService,
    // private facebook: Facebook
    ) {
    this.language = localStorage.getItem('language');
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);

    if (this.platform.is('ios')) {
      this.showAppleSignUp = true;
    }

    this.registerForm = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required, Validators.email])),
      passwd: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(6)])),
      confirm_passwd: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(6)])),
      accept_term_of_use: new FormControl(false, Validators.requiredTrue),
      confirm_age_over_18: new FormControl(false, Validators.requiredTrue),
      promo_code: new FormControl()
    });
  }

  ngOnInit() {
    this.getDeviceLocaleData();
    this.initializeValidationMessages();
  }

  getDeviceLocaleData() {
    const deviceCountry = navigator.language.split('-')[1];

    console.log('Device country is: ', deviceCountry);
    if (deviceCountry === 'RO' || deviceCountry === 'GB' || deviceCountry === 'UK') {
      console.log('Preselected country: ', deviceCountry);
      localStorage.setItem('country', (deviceCountry === 'GB' || deviceCountry === 'UK') ? 'uk' : deviceCountry.toLowerCase());
      this.selectedCountry = (deviceCountry === 'GB' || deviceCountry === 'UK') ? 'uk' : deviceCountry.toLowerCase();
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

  // =============== 1 =================
  // =========== REGISTER  =============
  // ===================================

  // *** 1.1 SHOW/HIDE PASSWORD ***
  // ==============================
  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
    this.facebookLogEvents('Show/Hide Password', { context: 'Register Page' });
  }

  initializeValidationMessages() {
    this.validationMessages = {
      email: [
        { type: 'required', message: this.translate.instant('pages.register.validationMessages.emailRequired') },
        { type: 'pattern', message: this.translate.instant('pages.register.validationMessages.emailWrongFormat') },
      ],
      passwd: [
        { type: 'required', message: this.translate.instant('pages.register.validationMessages.passwordRequired') },
        { type: 'minlength', message: this.translate.instant('pages.register.validationMessages.passwordLength') }
      ],
      confirm_passwd: [
        { type: 'required', message: this.translate.instant('pages.register.validationMessages.passwordConfirm') },
        { type: 'minlength', message: this.translate.instant('pages.register.validationMessages.passwordLength') }
      ],
      accept_term_of_use: [
        { type: 'required', message: this.translate.instant('pages.register.validationMessages.requiredField') }
      ],
      confirm_age_over_18: [
        { type: 'required', message: this.translate.instant('pages.register.validationMessages.requiredField') }
      ]
    };
  }

  // *** 1.2 REGISTER WITH EMAIL AND PASSWORD ***
  // ============================================
  register(country: string) {
    this.loadingService.presentLoading();
    this.registerData = {
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.passwd.value,
      confirmPassword: this.registerForm.controls.confirm_passwd.value,
      acceptTermsOfUse: this.registerForm.controls.accept_term_of_use.value,
      confirmLegalAge: this.registerForm.controls.confirm_age_over_18.value,
      promoCode: (this.registerData.promoCode === null || this.registerData.promoCode === '') ? this.registerForm.controls.promo_code.value : 'NuAre',
    };

    // console.log('Register page form' + JSON.stringify(this.registerData));

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.loadingService.dismissLoading();
      const toastMessage = this.translate.instant('pages.register.toastMessages.wrongConfirmPassword');
      this.presentToast(toastMessage);
    } else {
      this.authenticationService.register(country, this.registerData)
        .subscribe(data => {
          this.registerResponse = data;
          this.authenticationService.registerResponse = this.registerResponse;
          this.onRegisterSuccessful(country);
        },
          (errorResponse) => this.showError(errorResponse));
    }
  }

  // *** 1.3 REGISTER SUCCESSFUL ***
  // ===============================
  onRegisterSuccessful(country: string) {
    this.loadingService.dismissLoading();
    this.userEmail = this.registerData.email;
    if (this.registerData.promoCode !== 'NuAre') {
      localStorage.setItem('promoCodeOnRegister', this.registerData.promoCode);
    }
    localStorage.setItem('userName', this.userEmail);
    this.analyticsService.segmentIdentify();
    this.analyticsService.logEvent('register', {email: this.userEmail, promo_code: this.registerData.promoCode});
    this.login(country);
    const toastMessage = this.translate.instant('pages.register.toastMessages.registerSuccessfully');
    this.presentToast(toastMessage);
    this.registerForm.reset();
  }

  // *** 1.4 SHOW REGISTER ERROR ***
  // ===============================
  showError(errorResponse) {
    let message: string;
    if (errorResponse.error[''][1]) {
       message =  errorResponse.error[''][1];
    } else if (errorResponse.error[''][0]) {
      message =  errorResponse.error[''][0];
    } else {
      message = 'Something went wrong';
    }
    this.presentToast(message);
    this.loadingService.dismissLoading();
  }

  // *** 1.5 LOGIN AFTER REGISTRATION PROCESS IS COMPLETE ***
  // ========================================================
  login(country: string) {
    const loginCredentials = {
      username: this.registerData.email,
      password: this.registerData.password
    };
    this.authenticationService.login(country, loginCredentials).subscribe(response => {
      const res: any = response;
      this.onLoginSuccessful(res.access_token, this.userEmail, res.JWT);
      // console.log(response);
    });
  }

  onLoginSuccessful(token: string, userEmail: string, jwtToken: string) {
    localStorage.setItem('currentUserToken', token);
    localStorage.setItem('userName', userEmail);
    localStorage.setItem('jwtToken', jwtToken);
    this.setAccountLanguage();
    this.analyticsService.segmentIdentify();
    this.analyticsService.logEvent('login', {});
  }

  async displayErrorLogin() {
    this.loadingService.dismissLoading();
    if (localStorage.getItem('loginError') !== '0') {
      const toast = await this.toastCtrl.create({
        message: localStorage.getItem('loginError'),
        duration: 4000,
        position: 'bottom',
        cssClass: 'custom_toast'
      });
      toast.present();
    }
  }

  /**
   * @name setAccountLanguage
   * @description Set the default language for created account(POST to database) and then redirect to tabs view
   */
  setAccountLanguage() {
    this.manageAccountService.postLanguage(localStorage.getItem('language')).subscribe(response => {
      // console.log(response);
      this.navCtrl.navigateRoot('/tabs');
    });
  }

  // ================== 2 =====================
  // ========= FACEBOOK AUTHENTICATION ========
  // ==========================================
  // *** 2.1 FACEBOOK LOGIN ***
  // ===================================
  facebookLogin(country: string) {
    // this.facebookLogEvents('Register with Facebook', { context: 'Register Page' });
    // this.facebook.login(['public_profile', 'email'])
    //   .then((res: FacebookLoginResponse) => {
    //     this.facebookAuthData = res;
    //     this.getFacebookData(country);
    //     // console.log('Logged into Facebook!', res);
    //     // console.log(this.facebookAuthData);
    //   })
    //   .catch(e => console.log('Error logging into Facebook', e));
  }
  // *** 2.2 GET DATA FROM FACEBOOK ***
  // ==================================
  getFacebookData(country: string) {
    // this.facebook.api('/me?fields=id,first_name,last_name,email,picture.type(large)', ['public_profile', 'email'])
    //   .then(data => {
    //     this.facebookProfileData.facebookID = data.id;
    //     this.facebookProfileData.firstName = data.first_name;
    //     this.facebookProfileData.lastName = data.last_name;
    //     this.facebookProfileData.facebookEmail = data.email;
    //     this.facebookProfileData.profilePicture = data.picture.data.url;

    //     if (this.facebookProfileData !== null) {
    //       this.modifiedProfilePictureUrl = this.facebookProfileData.profilePicture.replace(/&/g, '(AND)');
    //       if (this.facebookProfileData.facebookEmail !== null || this.facebookProfileData.facebookEmail !== undefined) {
    //         this.postUserData('facebook', country, '', data.id, data.email, data.first_name, data.last_name, this.modifiedProfilePictureUrl, '', '');
    //       } else {
    //         this.postUserData('facebook', country, '', data.id, 'inexistent', data.first_name, data.last_name, this.modifiedProfilePictureUrl, '', '');
    //       }
    //     }
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }
  // *** 2.3 SAVE FACEBOOK PROFILE INFO TO LOCAL STORAGE ***
  // =======================================================
  saveFacebookProfileData() {
    localStorage.setItem('facebookProfilePicture', this.facebookProfileData.profilePicture);
    localStorage.setItem('facebookFirstName', this.facebookProfileData.firstName);
    localStorage.setItem('facebookLastName', this.facebookProfileData.lastName);
    localStorage.setItem('facebookID', this.facebookProfileData.facebookID);
    localStorage.setItem('facebookEmail', this.facebookProfileData.facebookEmail);
  }

  // *** 2.4 SEND AUTHETICATION DATA TO BEEZ ***
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
  // *** 2.5 ALERT PROMPT PASSWORD ***
  // =================================
  // show alert prompt password for existing Beez account(if facebook account email == beez account email)
  async alertPromptPassword(provider: string, country: string, msg: string) {
    const title = this.translate.instant('facebookAuthentication.alertPromptedPassword.title');
    const placeholderText = this.translate.instant('facebookAuthentication.alertPromptedPassword.inputPlaceholder');
    const buttonCancel = this.translate.instant('facebookAuthentication.alertPromptedPassword.buttonCancel');
    const buttonConfirm = this.translate.instant('facebookAuthentication.alertPromptedPassword.buttonConfirm');

    const promptedPasswordAlert = await this.alertCtrl.create({
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
          cssClass: 'alert_btn_cancel'
        },
        {
          text: buttonConfirm,
          handler: data => {
            this.userPassword = data.password;
            this.postUserData(
              provider,
              country,
              this.userEmail,
              this.facebookProfileData.facebookID,
              this.facebookProfileData.facebookEmail,
              this.facebookProfileData.firstName,
              this.facebookProfileData.lastName,
              this.modifiedProfilePictureUrl,
              this.userPassword, '');
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    promptedPasswordAlert.present();
  }
  // *** 2.6 ALERT PROMPT EMAIL ***
  // ==============================
  // show alert prompt email if facebook account doesn't have a valid email address
  async alertPromptEmail(provider: string, country: string, msg: string) {
    const title = this.translate.instant('facebookAuthentication.alertPromptedEmail.title');
    const placeholderText = this.translate.instant('facebookAuthentication.alertPromptedEmail.inputPlaceholder');
    const buttonCancel = this.translate.instant('facebookAuthentication.alertPromptedEmail.buttonCancel');
    const buttonConfirm = this.translate.instant('facebookAuthentication.alertPromptedEmail.buttonConfirm');

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

  selectRegisterType(authContext: string) {
    const country = localStorage.getItem('country');
    if (this.registerForm.get('confirm_age_over_18').value && this.registerForm.get('accept_term_of_use').value) {
      switch (authContext) {
        case 'register':
          this.register(country);
          break;
        case 'registerWithFacebook':
          this.facebookLogin(country);
          break;
        case 'registerWithApple':
          this.openAppleSignIn(country);
          break;
      }
    } else {
      if (!this.registerForm.get('confirm_age_over_18').value) {
        this.registerForm.get('confirm_age_over_18').markAsDirty();
      }
      if (!this.registerForm.get('accept_term_of_use').value) {
        this.registerForm.get('accept_term_of_use').markAsDirty();
      }
    }
  }

  /**
   * @description Open SignInWithApple native component and get authentication data from Apple account
   * @param country
   */
  openAppleSignIn(country: string) {
    console.log(country);
    // const { SignInWithApple } = Plugins;
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

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ],
      duration: 4000,
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }


  openTermsOfUse() {
    const termsOfUseUrl = 'https://use-beez.com/Terms';
    Browser.open({ url: termsOfUseUrl, windowName: '_blank' });
    this.facebookLogEvents('Open Terms of Use Page', { context: 'Register Page' });
  }

  openPrivacyPolicies() {
    const privacyPoliciesUrl = 'https://use-beez.com/Privacy';
    Browser.open({ url: privacyPoliciesUrl, windowName: '_blank' });
    this.facebookLogEvents('Open Privacy Policies Page', { context: 'Register Page' });
  }

  /**
   * @name facebookLogEvents
   * @description Send users log interactions to Facebook analytics
   * @param event
   * @param params
   */
  facebookLogEvents(event: string, params: any) {
    // this.facebook.logEvent(event, params)
    //   .then(res => {
    //     console.log('Facebook log event: ' + res);
    //   })
    //   .catch(e => console.log(e));
  }
}
