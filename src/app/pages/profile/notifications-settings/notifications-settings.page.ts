import { Component, OnInit } from '@angular/core';
import { NotificationsSettingsModel } from 'src/app/models/notificationsSettings.model';
import { TranslateService } from '@ngx-translate/core';
import { ToastController, Platform } from '@ionic/angular';
import { ManageAccountService } from 'src/app/services/manage-account.service';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';

@Component({
  selector: 'app-notifications-settings',
  templateUrl: './notifications-settings.page.html',
  styleUrls: ['./notifications-settings.page.scss'],
})
export class NotificationsSettingsPage implements OnInit {

  language: string;
  subscription: Subscription;
  notificationsSettings = new NotificationsSettingsModel();
  settingsString: string;

  saveSettingsResponse: any;
  requestDescription: string;
  requestType: string;
  requestResponse: any;

  // FoodMarketplace Notifications settings
  newVendorNotificationsList = [];
  followedVendorsNotificationsList = [];

  constructor(
    public translate: TranslateService,
    private toastCtrl: ToastController,
    private loadingService: LoadingService,
    public platform: Platform,
    private marketplaceService: MarketplaceService,
    private manageAccountService: ManageAccountService
    ) {
      this.language = localStorage.getItem('language');
      this.translate.setDefaultLang(this.language);
      this.translate.use(this.language);
      console.log(this.language);
      this.loadingService.presentLoading();
  }

  ngOnInit() {
    this.getProfileNotificationsSettings();
    this.getNotificationsSettingsForNewVendors();
    this.getNotificationsSettingsForVendorPromotions();
  }


  // ===================== 1 =======================
  // ========= GET NOTIFICATION SETTINGS ===========
  // ===============================================
  getProfileNotificationsSettings() {
    console.log(this.notificationsSettings);
    this.subscription = this.manageAccountService.getNotificationsSettings().subscribe(response => {
      const responseSettings: any = response;
      this.notificationsSettings.emailCritice = responseSettings.email_critice;
      this.notificationsSettings.emailOperationale = responseSettings.email_operationale;
      this.notificationsSettings.emailComerciale = responseSettings.email_comerciale;
      this.notificationsSettings.emailFeedback = responseSettings.email_feedback;
      this.notificationsSettings.smsCritice = responseSettings.sms_critice;
      this.notificationsSettings.smsOperationale = responseSettings.sms_operationale;
      this.notificationsSettings.smsComerciale = responseSettings.sms_comerciale;
      this.notificationsSettings.smsFeedback = responseSettings.sms_feedback;
      this.notificationsSettings.desktopCritice = responseSettings.desktop_critice;
      this.notificationsSettings.desktopOperationale = responseSettings.desktop_operationale;
      this.notificationsSettings.desktopComerciale = responseSettings.desktop_comerciale;
      this.notificationsSettings.desktopFeedback = responseSettings.desktop_feedback;
      this.notificationsSettings.appCritice = responseSettings.app_critice;
      this.notificationsSettings.appOperationale = responseSettings.app_operationale;
      this.notificationsSettings.appComerciale = responseSettings.app_comerciale;
      this.notificationsSettings.appFeedback = responseSettings.app_feedback;
      this.notificationsSettings.whatsappCritice = responseSettings.whatsapp_critice;
      this.notificationsSettings.whatsappOperationale = responseSettings.whatsapp_operationale;
      this.notificationsSettings.whatsappComerciale = responseSettings.whatsapp_comerciale;
      this.notificationsSettings.whatsappFeedback = responseSettings.whatsapp_feedback;
      this.notificationsSettings.messengerComerciale = responseSettings.messenger_comerciale;
      this.notificationsSettings.isUsCitizen = responseSettings.isUsCitizen;
      console.log(this.notificationsSettings);
      this.loadingService.dismissLoading();
    });
  }

  getNotificationsSettingsForNewVendors() {
    this.marketplaceService.getNewVendorNotificationsStatus().subscribe((res: any) => this.newVendorNotificationsList = res.userData);
  }

  getNotificationsSettingsForVendorPromotions() {
    this.marketplaceService.getVendorFollowingStatus().subscribe((res: any) => this.followedVendorsNotificationsList = res.userData);
  }

  // ===================== 2 ========================
  // ========= SAVE NOTIFICATION SETTINGS ===========
  // ================================================
  saveNotificationsSettings() {
    this.loadingService.presentLoading();
    // this.notificationsSettingsModel = this.notificationsSettings;
    console.log(this.notificationsSettings);
    this.settingsString =
      + String(this.notificationsSettings.emailCritice ? 1 : 0)
      + String(this.notificationsSettings.emailOperationale ? 1 : 0)
      + String(this.notificationsSettings.emailComerciale ? 1 : 0)
      + String(this.notificationsSettings.emailFeedback ? 1 : 0)
      + String(this.notificationsSettings.smsCritice ? 1 : 0)
      + String(this.notificationsSettings.smsOperationale ? 1 : 0)
      + String(this.notificationsSettings.smsComerciale ? 1 : 0)
      + String(this.notificationsSettings.smsFeedback ? 1 : 0)
      + String(this.notificationsSettings.desktopCritice ? 1 : 0)
      + String(this.notificationsSettings.desktopOperationale ? 1 : 0)
      + String(this.notificationsSettings.desktopComerciale ? 1 : 0)
      + String(this.notificationsSettings.desktopFeedback ? 1 : 0)
      + String(this.notificationsSettings.appCritice ? 1 : 0)
      + String(this.notificationsSettings.appOperationale ? 1 : 0)
      + String(this.notificationsSettings.appComerciale ? 1 : 0)
      + String(this.notificationsSettings.appFeedback ? 1 : 0)
      + String(this.notificationsSettings.whatsappCritice ? 1 : 0)
      + String(this.notificationsSettings.whatsappOperationale ? 1 : 0)
      + String(this.notificationsSettings.whatsappComerciale ? 1 : 0)
      + String(this.notificationsSettings.whatsappFeedback ? 1 : 0)
      + String(this.notificationsSettings.messengerComerciale ? 1 : 0)
      + String(this.notificationsSettings.isUsCitizen ? 1 : 0);

    console.log(this.settingsString);

    this.manageAccountService.saveNotificationsSettings(this.settingsString)
      .subscribe(data => {
        console.log(data);
        this.saveSettingsResponse = data;
        this.onSettingsSavedSuccesfully(this.saveSettingsResponse);
      },
        () => this.showError() as any);
  }

  updateStatusOfNewVendorNotifications(item: any) {
    this.loadingService.presentLoading();
    this.marketplaceService.postNewVendorNotificationsStatus(item.cityId, item.isFollowing).subscribe((res: any) => {
      this.newVendorNotificationsList.forEach((element: any) => {
        if (element.cityId === res.userData[0].cityId) {
          element.isFollowing = res.userData[0].isFollowing;
        }
        console.log(this.newVendorNotificationsList);
        this.loadingService.dismissLoading();
      });
    });
  }

  updateNotificationsStatusForVendorPromotions(item: any) {
    this.loadingService.presentLoading();
    this.marketplaceService.postVendorFollowingStatus(item.cityId, item.vendorId, item.isFollowing).subscribe((res: any) => {
      this.followedVendorsNotificationsList.forEach((element: any) => {
        if (element.cityId === res.userData[0].cityId && element.vendorId === res.userData[0].vendorId) {
          element.isFollowing = res.userData[0].isFollowing;
        }
        console.log(this.followedVendorsNotificationsList);
        this.loadingService.dismissLoading();
      });
    });
  }

  // ============================ 3 ============================
  // ========= SAVE SETTINGS RESPONSE(SUCCESS/ERROR) ===========
  // ===========================================================
  // ************* 3.1 **************
  // **** On Save Successfully *****
  // ********************************
  onSettingsSavedSuccesfully(saveSettingsResponse: any) {
    this.getProfileNotificationsSettings();
    console.log(saveSettingsResponse);
    this.loadingService.dismissLoading();
    const message = this.translate.instant('pages.notificationsSettings.settingsSavedToastMessage');
    this.presentToast(message);
  }
  // ************* 3.2 ****************
  // **** Show Save Settings Error ****
  // **********************************
  showError() {
    const message = localStorage.getItem('registerError');
    this.presentToast(message);
    this.loadingService.dismissLoading();
  }

  // ================= 5 ====================
  // ========= SHOW TOAST MESSAGE ===========
  // ========================================
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }
}
