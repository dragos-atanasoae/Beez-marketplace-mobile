import { AnalyticsService } from 'src/app/services/analytics.service';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { ToastController, NavParams, NavController, ModalController, IonSlides, AlertController } from '@ionic/angular';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WalletModel } from 'src/app/models/wallet.model';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn, zoomIn, zoomOut } from 'ng-animate';
import { LoadingService } from 'src/app/services/loading.service';
import { DeliveryAddressService } from 'src/app/services/delivery-address.service';
import { ManageDocumentsPage } from '../profile/manage-documents/manage-documents.page';
import { KycValidationService } from 'src/app/services/kyc-validation.service';
import { Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HelpPage } from '../profile/help/help.page';

const { Camera } = Plugins;

@Component({
  selector: 'app-withdrawal',
  templateUrl: './withdrawal.page.html',
  styleUrls: ['./withdrawal.page.scss'],
  animations: [
    trigger('animationButtons', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1.2, delay: 0.2 }
      }),
    ]),
  ]
})
export class WithdrawalPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonSlides, { static: true }) withdrawalSlides: IonSlides;
  private unsubscribe$: Subject<boolean> = new Subject();
  isKycValid = false;
  localeData = new LocaleDataModel();
  language: string;
  country: string;
  counterBack = 0;
  walletInfo: WalletModel;
  withdrawalForm: FormGroup;
  donationForm: FormGroup;

  donationDetails = {
    anonymous: false,
    nickname: '',
    productId: 0
  };

  /** * @name withdrawalContext - values expected: withdraw or donate */
  withdrawalContext: string;
  avaialbleToWithdraw = 0;
  withdrawalAmount: FormControl;
  currency: string;
  currentIndex = 0; // active index of slides
  errorMinimumRequest = false;
  errorRequestToMuch = false;

  /** * @name selectedDocumentType - values expected: idCard or bankAccount */
  selectedDocumentType: string;
  idCardFileName: string = null;
  bankAccountFileName: string = null;
  lockIdCardFileUpload = false;
  lockBankAccountFileUpload = false;

  showOverlayAnonymousDonation = false;
  isAnonymousDonation = true;
  nickname: FormControl;
  eventContext = 'Withdrawal Page';

  validationMessages = {
    name: [
      { type: 'required', message: 'Numele este obligatoriu' }
    ],
    surname: [
      { type: 'required', message: 'Prenumele este obligatoriu' }
    ],
    email: [
      { type: 'required', message: 'Introduceți o adresă de email' },
      { type: 'pattern', message: 'Verifică adresa de email' }
    ],
    phoneNumber: [
      { type: 'required', message: 'Numărul de telefon este obligatoriu' },
      { type: 'minlength', message: 'Numărul introdus nu este valid (ex: 0722333444)' },
    ],
    amount: [
      { type: 'required', message: 'Introduceți suma pe care doriți să o retrageți' },
      { type: 'min', message: 'Pentru a putea solicita retragerea economiilor disponibile trebuie să aveți minim 50 lei economisiți!' },
      { type: 'max', message: 'Suma introdusă depășește valoarea economiilor din contul dumneavoastră!' }
    ],
  };


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingService: LoadingService,
    private addressService: DeliveryAddressService,
    private walletService: WalletService,
    public translate: TranslateService,
    private currencyPipe: CurrencyPipe,
    private internationalizationProvider: InternationalizationService,
    private kycValidationService: KycValidationService,
    private analyticsService: AnalyticsService
  ) {
    this.country = localStorage.getItem('country');
    this.language = localStorage.getItem('language');
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    this.currency = this.country === 'ro' ? 'RON' : 'pounds';
    if (this.country === 'ro') {
      this.getAddress();
    }
    this.withdrawalContext = this.navParams.get('withdrawalContext');
    if (this.withdrawalContext === 'donation') {
      this.donationDetails = this.navParams.get('donationDetails');
      console.log(this.donationDetails);
    }
    this.walletInfo = this.navParams.get('walletInfo');
    console.log(this.walletInfo);
    this.withdrawalForm = new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required])),
      surname: new FormControl('', Validators.compose([
        Validators.required])),
      saveData: new FormControl(true)
    });

    this.donationForm = new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required])),
      surname: new FormControl('', Validators.compose([
        Validators.required])),
      email: new FormControl('', Validators.compose([
        Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9- .]+$')])),
      phoneNumber: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(10)])),
      saveData: new FormControl(true)
    });

    this.withdrawalAmount = new FormControl('', Validators.compose([Validators.required, Validators.min(this.withdrawalContext === 'withdraw' ? 50 : 1), Validators.max(this.walletInfo.available)]));
    this.nickname = new FormControl('');
  }

  ngOnInit() {
    if (this.navParams.get('walletInfo')) {
      this.walletInfo = this.navParams.get('walletInfo');
    } else {
      this.getWalletInfo();
    }
    // Initialize locale context
    this.internationalizationProvider.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.initializeValidationMessages();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  ngAfterViewInit() {
    // lock swipe to next slide
    this.withdrawalSlides.lockSwipeToNext(true);
    this.withdrawalSlides.ionSlideDidChange.subscribe(() => {
      this.withdrawalSlides.getActiveIndex().then((idx) => {
        this.currentIndex = idx;
        if (idx === 0) {
          this.withdrawalSlides.lockSwipeToNext(true);
        }
      });
    });
    // Check if the amount inserted on the input is > 50(lei or pounds) and < availableToWithdraw
    this.withdrawalAmount.valueChanges.subscribe(res => {
      this.errorMinimumRequest = (res < 50) ? true : false;
      this.errorRequestToMuch = res > this.walletInfo.available ? true : false;
    });
  }

  getAddress() {
    this.addressService.getListOfDeliveryAddresses().subscribe((res: any) => {
      if (res.deliveryAddresses.length > 0) {
        if (this.withdrawalContext === 'donation') {
          this.donationForm.patchValue({
            name: res.deliveryAddresses[0].Name,
            surname: res.deliveryAddresses[0].Surname,
            email: res.deliveryAddresses[0].Email,
            phoneNumber: res.deliveryAddresses[0].PhoneNumber
          });
        } else {
          this.withdrawalForm.patchValue({
            name: res.deliveryAddresses[0].Name,
            surname: res.deliveryAddresses[0].Surname
          });
        }
      }
    });
  }

  initializeValidationMessages() {
    const minAmount = this.currencyPipe.transform(50, this.localeData.currency, 'symbol-narrow', '.0-0', this.localeData.localeID);
    this.validationMessages = {
      name: [
        { type: 'required', message: this.translate.instant('pages.withdrawal.validationMessages.lastnameRequired') }
      ],
      surname: [
        { type: 'required', message: this.translate.instant('pages.withdrawal.validationMessages.firstnameRequired') }
      ],
      email: [
        { type: 'required', message: this.translate.instant('pages.withdrawal.validationMessages.emailRequired') },
        { type: 'pattern', message: this.translate.instant('pages.withdrawal.validationMessages.emailFormatWrong') }
      ],
      phoneNumber: [
        { type: 'required', message: this.translate.instant('pages.withdrawal.validationMessages.phoneRequired') },
        { type: 'minlength', message: this.translate.instant('pages.withdrawal.validationMessages.phoneWrongFormat') },
      ],
      amount: [
        { type: 'required', message: this.translate.instant('pages.withdrawal.validationMessages.amountRequired') },
        { type: 'min', message: this.translate.instant('pages.withdrawal.validationMessages.amountMin') + ' ' + minAmount },
        { type: 'max', message: this.translate.instant('pages.withdrawal.validationMessages.amountMax') }
      ],
    };
  }

  /**
   * @name getWalletInfo
   */
  getWalletInfo() {
    this.walletService.getWalletInfo().subscribe((res: any) => {
      if (res.hasOwnProperty('isSuccess')) {
        if (!res.isSuccess) {
          // console.log(res.status);
        }
      } else {
        this.walletInfo = res;
        // console.log(this.walletInfo);
      }
    });
  }

  /**
   * @name selectDocumentTypeForUpload
   * @description Select the type of document to prepare for upload(ex: idCard or bankAccount)
   * @param name
   */
  selectDocumentTypeForUpload(name: string) {
    switch (name) {
      case 'idCard':
        console.log('Add ID card');
        if (!this.lockIdCardFileUpload) {
          this.getPicture();
          this.selectedDocumentType = name;
        } else {
          this.alertChangeDocument();
        }
        break;
      case 'bankAccount':
        console.log('Add bank account proof');
        this.getPicture();
        this.selectedDocumentType = name;
        break;
    }
  }

  async alertChangeDocument() {
    const alert = await this.alertCtrl.create({
      subHeader: this.translate.instant('pages.withdrawal.alertChangeSavedDocs.title'),
      message: this.translate.instant('pages.withdrawal.alertChangeSavedDocs.message'),
      buttons: [
        {
          text: this.translate.instant('buttons.buttonCancel'),
          role: 'cancel',
          cssClass: 'alert_btn_cancel'
        },
        {
          text: 'Contact',
          handler: () => {
            this.openModalContact();
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    alert.present();
  }

  async openModalContact() {
    const modal = await this.modalCtrl.create({
      component: HelpPage
    });
    modal.present();
  }

  /**
   * @name getPicture
   * @description Get a picture of requested document from camera or gallery
   */
  async getPicture() {
    const imageData = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      presentationStyle: 'popover',
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true
    });

    const base64Image = imageData.dataUrl;
    console.log(base64Image);
    this.uploadImageFile(base64Image);
  }

  /**
   * @name uploadImageFile
   * @param base64Image
   * @description Upload selected image to database
   */
  uploadImageFile(base64Image: any) {
    this.loadingService.presentLoading();
    const date = new Date();
    const uploadData = {
      content: base64Image,
      fileName: this.selectedDocumentType + date.getDate() + date.getMonth() + date.getFullYear() + date.getHours() + date.getMinutes() + date.getSeconds() + '.jpg',
      fileType: this.selectedDocumentType,
      tag: localStorage.getItem('userName')
    };

    this.walletService.uploadDocument(uploadData).subscribe(res => {
      // console.log(res);
      switch (this.selectedDocumentType) {
        case 'idCard':
          this.idCardFileName = res === 'Success' ? uploadData.fileName : null;
          this.loadingService.dismissLoading();
          break;
        case 'bankAccount':
          this.bankAccountFileName = res === 'Success' ? uploadData.fileName : null;
          this.loadingService.dismissLoading();
          break;
      }
    }, () => {
      this.presentToast(this.translate.instant('pages.withdrawal.toastMessages.uploadError'));
      this.loadingService.dismissLoading();
    });
  }

  logAnalyticsEvents(eventName: string, amountDonated?: number) {
    // console.log(eventName, amountDonated);
    const eventParams = { context: this.eventContext, amount_donated: amountDonated >= 50 ? amountDonated : '' };
    this.analyticsService.logEvent(eventName, eventParams);
  }

  /**
   * @name sendWithdrawalRequest
   * @description Post withdrawal request
   */
  sendWithdrawalRequest() {
    this.loadingService.presentLoading();
    const withdrawalData = {
      Amount: this.withdrawalAmount.value * 1,
      BankAccountFile: this.bankAccountFileName,
      Name: this.withdrawalForm.get('name').value,
      Surname: this.withdrawalForm.get('surname').value,
      Tag: localStorage.getItem('userName'),
    };
    const eventParams = { context: this.eventContext };
    // console.log(withdrawalData);
    this.walletService.sendWithdrawalRequest(withdrawalData).subscribe((res: any) => {
      console.log(res);
      if (res.status === 'success') {
        this.modalCtrl.dismiss(this.withdrawalAmount.value);
        this.presentToast(this.translate.instant('pages.withdrawal.toastMessages.withdrawSuccess'));
        this.analyticsService.logEvent('withdraw_request_success', eventParams);
      } else {
        this.analyticsService.logEvent('withdraw_request_error', eventParams);
        this.presentToast(this.translate.instant('pages.withdrawal.toastMessages.withdrawRequestError'));
      }
      this.loadingService.dismissLoading();
    }, () => {
      this.loadingService.dismissLoading();
      this.presentToast(this.translate.instant('pages.withdrawal.toastMessages.withdrawRequestError'));
    });
  }

  async alertUploadFileInfo(fileType: string) {
    let msg: string;
    switch (fileType) {
      case 'idCardWithdrawal':
        msg = this.translate.instant('pages.withdrawal.alertUploadFileInfo.idCardWithdrawal');
        break;
      case 'idCardDonation':
        msg = this.translate.instant('pages.withdrawal.alertUploadFileInfo.idCardDonation');
        break;
      case 'bankAccount':
        msg = this.translate.instant('pages.withdrawal.alertUploadFileInfo.bankAccount') + '<br><span id="disclaimer_bank_account">'
          + this.translate.instant(this.country === 'ro' ? 'pages.withdrawal.alertUploadFileInfo.labelDisclaimerBankAccountRO' : 'pages.withdrawal.alertUploadFileInfo.labelDisclaimerBankAccountUK') + '</span>';
        break;
      default:
        break;
    }
    const alert = await this.alertCtrl.create({
      subHeader: this.translate.instant('pages.withdrawal.alertUploadFileInfo.title'),
      message: '<p class="alert_content">' + msg + '</p>',
      buttons:
        [
          {
            text: this.translate.instant('pages.withdrawal.alertUploadFileInfo.buttonGotIt'),
            cssClass: 'alert_btn_action',
            role: 'cancel',
          }],
      cssClass: 'custom_alert',
      backdropDismiss: false
    });
    alert.present();
  }

  /**
   * @name nextSlide
   * @description Unlock the swipe of slides, navigate to the next slide and get the current index of slides
   */
  nextSlide() {
    this.withdrawalSlides.lockSwipeToNext(false);
    this.withdrawalSlides.slideNext();
    this.withdrawalSlides.getActiveIndex().then((idx) => {
      this.currentIndex = idx;
      console.log(this.currentIndex);
    });
  }

  /**
   * @name previousSlide
   * @description Navigate to previous slide and lock the swipe to the next
   */
  previousSlide() {
    this.withdrawalSlides.slidePrev();
    this.withdrawalSlides.getActiveIndex().then((idx) => {
      this.currentIndex = idx;
      console.log(this.currentIndex);
    });
    // lock swipe to next slide
    this.withdrawalSlides.lockSwipeToNext(true);
  }

  /**
   * @name checkStatusOfKYC
   * @description Check status of KYC Validation before submit order
   * * status "Required" || "Exceptio" -> open manageDocuments modal, to upload the required documents
   * * status "Pending" || "Validated" ->  continue the withdrawal/donation flow -> nextSlide()
   * @param id
   * @param name
   */
  checkStatusOfKYC() {
    this.loadingService.presentLoading();
    this.kycValidationService.getStatusKYC();
    this.kycValidationService.isKycValid$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.isKycValid = res);
    // console.log('KYC Status: ', res);
    if (!this.isKycValid) {
      this.openManageDocumentsModal();
    } else {
      this.nextSlide();
    }
    this.loadingService.dismissLoading();
  }

  /**
   * @name openManageDocumentsModal
   * @description Open Manage Documents Modal to upload the required documents for KYC validation
   * * on modal did dismiss(onDidDismiss) verify the upload response and continue to orderProduct() flow only on success response
   */
  async openManageDocumentsModal() {
    const modal = await this.modalCtrl.create({
      component: ManageDocumentsPage
    });
    modal.onDidDismiss().then(() => {
        if (this.isKycValid) {
          console.log('KYC documents uploaded successful, Continue to next step Withdrawal/Donation');
          this.nextSlide();
        }
      });
    modal.present();
  }

  /**
   * @name presentToast
   * @param toastMessage
   */
  async presentToast(toastMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
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
   * @name closeModal
   */
  closeModal() {
    this.modalCtrl.dismiss();
  }

}
