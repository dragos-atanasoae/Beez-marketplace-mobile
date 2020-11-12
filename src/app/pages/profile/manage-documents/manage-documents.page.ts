import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IonSlides, ModalController, AlertController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { KycValidationService } from 'src/app/services/kyc-validation.service';
import { WalletService } from 'src/app/services/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { LocaleDataModel } from 'src/app/models/localeData.model';

import { Plugins, CameraResultType, CameraSource, CameraDirection, CameraPhoto } from '@capacitor/core';
import { Document } from 'src/app/models/document';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HelpPage } from '../help/help.page';

const { Camera } = Plugins;
@Component({
  selector: 'app-manage-documents',
  templateUrl: './manage-documents.page.html',
  styleUrls: ['./manage-documents.page.scss'],
})
export class ManageDocumentsPage implements OnInit, OnDestroy {
  @ViewChild('kycSlides') kycSlides: IonSlides;
  private unsubscribe$: Subject<boolean> = new Subject();

  slidesOptions = {
    slidesPerView: 1,
    centeredSlides: true,
    initalSlide: 0,
    slideToClickedSlide: false,
    scrollbar: false,
  };

  localeData = new LocaleDataModel();
  language: string;
  country: string;
  counterBack = 0;

  isKycValid: boolean;

  selectedDocumentType: string;

  idCardFileName: string = null;
  selfieFileName: string = null;

  idCardFileContent: string;
  selfieFileContent: string;

  picture: string;
  cameraType: any;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingService: LoadingService,
    private kycValidationService: KycValidationService,
    private walletService: WalletService,
    public translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.checkStatusOfKYC();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  nextSlide() {
    this.kycSlides.lockSwipes(false);
    this.kycSlides.slideNext();
    this.kycSlides.lockSwipes(true);
  }

  previousSlide() {
    this.kycSlides.lockSwipes(false);
    this.kycSlides.slidePrev();
    this.kycSlides.lockSwipes(true);
  }

  /**
   * @name takePicture
   * @description Capture picture from camera preview
   */
  async takePicture(documentType: string) {
    switch (documentType) {
      case 'idCard':
        await Camera.getPhoto({
          quality: 60,
          allowEditing: false,
          source: CameraSource.Camera,
          direction: CameraDirection.Rear,
          resultType: CameraResultType.DataUrl
        }).then((res: CameraPhoto) => {
          this.uploadImageFile('idCard', res.dataUrl);
        });

        break;
      case 'selfie':
        await Camera.getPhoto({
          quality: 60,
          allowEditing: false,
          source: CameraSource.Camera,
          direction: CameraDirection.Front,
          resultType: CameraResultType.DataUrl
        }).then((res: CameraPhoto) => {
          this.uploadImageFile('selfie', res.dataUrl);
        });
        break;
      default:
        break;
    }
  }

  /**
   * @name uploadImageFile
   * @description Upload selected image to database
   */
  uploadImageFile(selectedDocumentType: string, imageBase64: string) {
    this.loadingService.presentLoading();
    const date = new Date();
    const uploadData: Document = {
      tag: localStorage.getItem('userName'),
      content: imageBase64,
      fileName: selectedDocumentType + date.getDate() + date.getMonth() + date.getFullYear() + date.getHours() + date.getMinutes() + date.getSeconds() + '.jpg',
      fileType: selectedDocumentType,
    };

    this.walletService.uploadDocument(uploadData).subscribe(res => {
      console.log(res);
      switch (selectedDocumentType) {
        case 'idCard':
          this.idCardFileName = res === 'Success' ? uploadData.fileName : null;
          if (res === 'Success') {
            console.log('idCard uploaded, Go to next step');
            this.loadingService.dismissLoading();
            this.nextSlide();
          } else {
            this.loadingService.dismissLoading();
            this.alertUserMessage('error');
          }
          break;
        case 'selfie':
          this.selfieFileName = res === 'Success' ? uploadData.fileName : null;
          if (res === 'Success') {
            console.log('Selfie uploaded, Go to next step');
            this.loadingService.dismissLoading();
            this.uploadDocumentsNameForKYC();
          } else {
            this.loadingService.dismissLoading();
            this.alertUserMessage('error');
          }
          break;
      }
    }, () => this.loadingService.dismissLoading());

  }

  /**
   * @name uploadDocumentsForKYC
   * @description Upload documents name for KYC Validation
   * @param body
   */
  uploadDocumentsNameForKYC() {
    this.loadingService.presentLoading();
    const body = {
      Tag: localStorage.getItem('userName'),
      MugshotFile: this.selfieFileName,
      IdCardFile: this.idCardFileName
    };
    this.kycValidationService.uploadDocumentsForKYC(body)
      .subscribe((response: any) => {
        this.checkStatusOfKYC();
        this.loadingService.dismissLoading();
        console.log(response);
        this.alertUserMessage(response.status);
      });
  }

  /**
   * @name alertUserMessage
   * @description Successfully upload documents
   * @param status
   */
  async alertUserMessage(status: string) {
    let title: string; let message: string; let img: string;
    switch (status) {
      case 'success':
        title = this.translate.instant('pages.manageDocuments.alertUserMessage.successTitle');
        message = this.translate.instant('pages.manageDocuments.alertUserMessage.messageSuccess');
        img = './assets/icon/Icon_Success.svg';
        break;
      case 'error':
        this.previousSlide();
        title = this.translate.instant('pages.manageDocuments.alertUserMessage.errorTitle');
        message = this.translate.instant('pages.manageDocuments.alertUserMessage.errorMessage');
        img = './assets/imgs/bee-characters/Bee-NoResults.svg';
        break;
      default:
        break;
    }
    const content =
      '<img class="bee_character" src="' + img + ' ">' +
      '<p class="alert-title">' + title + '</p>' +
      '<p class="alert-content">' + message + '</p>';
    const alert = await this.alertCtrl.create({
      message: content,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: () => { if (status === 'success') { this.modalCtrl.dismiss(); } },
          cssClass: 'alert_btn_action'
        },
      ],
      cssClass: 'alert_feedback',
    });
    alert.present();
  }

  /**
   * @name checkStatusOfKYC
   * @description Check status of KYC Validation
   */
  checkStatusOfKYC() {
    this.loadingService.presentLoading();
    this.kycValidationService.getStatusKYC();
    this.kycValidationService.isKycValid$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.isKycValid = res);
    if (this.isKycValid) {
      this.idCardFileName = 'idCard.jpg';
      this.selfieFileName = 'selfie.jpg';
      this.loadingService.dismissLoading();
    } else {
      this.loadingService.dismissLoading();
      this.kycSlides.lockSwipes(true);
    }
  }

  /**
   * @name alertUploadFileInfo
   * @description Show alert with info about required files
   */
  async alertUploadFileInfo() {
    const msg = this.translate.instant('pages.manageDocuments.alertUploadFileInfo.message');
    const alert = await this.alertCtrl.create({
      subHeader: this.translate.instant('pages.manageDocuments.alertUploadFileInfo.title'),
      message: '<p class="alert_content">' + msg + '</p>',
      buttons:
        [
          {
            text: this.translate.instant('pages.manageDocuments.alertUploadFileInfo.buttonOk'),
            cssClass: 'alert_btn_action',
            role: 'cancel',
          }],
      cssClass: 'custom_alert',
      backdropDismiss: false
    });
    alert.present();
  }

  /**
   * @name alertChangeDocument
   * @description Show alert with info about changing the uploaded documents
   */
  async alertChangeDocument() {
    const alert = await this.alertCtrl.create({
      subHeader: this.translate.instant('pages.manageDocuments.alertChangeSavedDocs.title'),
      message: this.translate.instant('pages.manageDocuments.alertChangeSavedDocs.message'),
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
          cssClass: 'alert_btn_cancel'
        }
      ],
      cssClass: 'custom_alert'
    });
    alert.present();
  }

  /**
   * @name openModalContact
   * @description Opent Help
   */
  async openModalContact() {
    const modal = await this.modalCtrl.create({
      component: HelpPage
    });
    modal.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
