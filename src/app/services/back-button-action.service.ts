import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class BackButtonActionService {

    // set up hardware back button event.
    lastTimeBackPress = 0;
    timePeriodToExit = 2000;
    toastExit: any;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) { }

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
