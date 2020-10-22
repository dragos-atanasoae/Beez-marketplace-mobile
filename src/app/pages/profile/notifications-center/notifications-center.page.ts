import { AnalyticsService } from 'src/app/services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from '@ionic/angular';
import { NotificationService } from 'src/app/services/notification.service';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notifications-center.page.html',
  styleUrls: ['./notifications-center.page.scss'],
})
export class NotificationsCenterPage {
  language = localStorage.getItem('language');

  notificationsList: any = [];
  noRecords = false;
  totalNumberOfRecords = 0;
  page = 1;
  pageSize = 20;

  selectedNotification: any;
  wasMarked = false;
  buttons: any;
  alert: any;
  isLoading: boolean;
  showOverlayDetails = false;
  notification = null;
  eventContext = 'Notification Center Page';

  constructor(
    private notificationsService: NotificationService,
    public translate: TranslateService,
    private loadingService: LoadingService,
    public alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private analyticsService: AnalyticsService) {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter NotificationsCenterPage');
    this.getNotificationsHistory();
  }

  ionViewDidLeave() {
    console.log('Get unread notifications');
    this.notificationsService.unreadNotifications();
  }

  /**
   * @name getNotificationsHistory
   * @description get list of notifications
   */
  getNotificationsHistory() {
    this.noRecords = false;
    this.page = 1;
    this.pageSize = 20;
    this.loadingService.presentLoading();
    this.notificationsService.getNotificationsHistory(this.page, this.pageSize)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.totalNumberOfRecords = response.notifications.TotalNumberOfRecords;
          if (response.notifications.Results.length === 0) {
            this.notificationsList = 'empty';
          } else {
            this.notificationsList = response.notifications.Results;
          }
          console.log('Notifications list', this.notificationsList);
        }
        this.loadingService.dismissLoading();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name loadMore
   * @description load next 20 notifications
   */
  loadMore() {
    this.loadingService.presentLoading();
    this.notificationsService.getNotificationsHistory(this.page, this.pageSize)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.totalNumberOfRecords = response.notifications.TotalNumberOfRecords;
          this.notificationsList = this.notificationsList.concat(response.notifications.Results);
        }
        this.loadingService.dismissLoading();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name loadMoreNotification
   * @description Load more notification (next 20)
   * @param infiniteScroll
   */
  loadMoreNotification(infiniteScroll: any) {
    this.page++;
    if (this.notificationsList.length === this.totalNumberOfRecords) {
      console.log('No more notifications');
      this.noRecords = true;
    } else {
      this.loadMore();
      if (infiniteScroll) {
        infiniteScroll.target.complete();
      }
    }
  }

  /**
   * @name markAsRead
   * @descriptionget mark notification as seen
   * @param notificationId
   */
  markAsRead(notificationId: number) {
    this.notificationsService.markAsRead(notificationId)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          console.log('Mark notification as read');
          this.wasMarked = true;
          this.markAsReadOnView();
          this.logAnalyticsEvents('mark_notification_as_read');
        }
      });
  }

  /**
   * @name markAsReadOnView
   * @description Mark notification as read on ui
   */
  markAsReadOnView() {
    if (this.wasMarked) {
      this.notificationsList.forEach(x => {
        if (x.Id === this.selectedNotification.Id) {
          x.Seen = true;
        }
      });
    }
  }

  /**
   * @name navigateTo
   * @description Navigate to specific page
   */
  navigateTo() {
    this.logAnalyticsEvents('notification_call_to_action');
    const link = this.checkNotifiation();
    console.log(link);
    const segmentNavigationExtras: NavigationExtras = {
      queryParams: {
        selectedSegment: ''
      }
    };
    switch (link) {
      case 'BeezPay':
        this.router.navigate(['/tabs/beez-pay'], segmentNavigationExtras);
        break;
      case 'Voucher':
        this.router.navigate(['/tabs/beez-pay'], segmentNavigationExtras);
        break;
      case 'Promotion':
        segmentNavigationExtras.queryParams.selectedSegment = 'viewPromotions';
        this.router.navigate(['/tabs/deals-feed'], segmentNavigationExtras);
        break;
      case 'FlashDeal':
        segmentNavigationExtras.queryParams.selectedSegment = 'viewFlashDeals';
        this.router.navigate(['/tabs/deals-feed'], segmentNavigationExtras);
        break;
      case 'Commission':
        const navigationExtras: NavigationExtras = {
          queryParams: {
            contextData: 'cashback'
          }
        };
        this.router.navigate(['transactions-list'], navigationExtras);
        break;
      case 'Donation':
        this.router.navigate(['/tabs/donations']);
        break;
      case 'BeezPayReceive':
        const navigationExtrasRec: NavigationExtras = {
          queryParams: {
            selectedSegment: 'receiveProduct',
            productId: this.notification.ProductId
          }
        };
        this.router.navigate(['/tabs/beez-pay'], navigationExtrasRec);
        break;
      case 'BuyViaBeezPay':
        this.router.navigateByUrl('tabs/search/beezPay');
        break;
      default:
        this.showOverlayDetails = false;
    }
  }

  /**
   * @description Check if string from notification link is an object
   */
  checkNotifiation() {
    let link = this.selectedNotification.Link;
    if (link.includes('NotificationType')) {
      this.notification = JSON.parse(link);
      link = this.notification.NotificationType;
      if (this.notification.Action === 'Receive') {
        return 'BeezPayReceive';
      }
    }
    return link;
  }

  /**
   * @name getTextBtn
   */
  getTextBtn(): string {
    const link = this.checkNotifiation();
    switch (link) {
      case 'BeezPay':
        return this.translate.instant('pages.notificationCenter.buttonViewProducts');
      case 'Voucher':
        return this.translate.instant('pages.notificationCenter.buttonViewVouchers');
      case 'Commission':
        return this.translate.instant('pages.notificationCenter.buttonViewCashback');
      case 'Donation':
        return this.translate.instant('pages.notificationCenter.buttonViewCampaigns');
      case 'BeezPayReceive':
        return this.translate.instant('pages.notificationCenter.buttonReceived');
      case 'Promotion':
        return this.translate.instant('pages.notificationCenter.buttonViewPromotions');
      case 'FlashDeal':
        return this.translate.instant('pages.notificationCenter.buttonViewFlashDeals');
      case 'KycRequestDenied':
        return this.translate.instant('pages.notificationCenter.btnUploadFiles');
      case 'BuyViaBeezPay':
        return this.translate.instant('pages.notificationCenter.btnViewShopsList');
      default:
        return 'Ok';
    }
  }

  /**
   * @name openNotificationDetails
   * @description Open notification details
   * @param selectedNotification
   */
  openNotificationDetails(selectedNotification) {
    this.selectedNotification = selectedNotification;
    this.showOverlayDetails = true;
  }

  /**
   * @name closeNotificationDetails
   * @param action
   */
  closeNotificationDetails(action?: string) {
    this.showOverlayDetails = false;
    if (!this.selectedNotification.Seen) {
      this.markAsRead(this.selectedNotification.Id);
    }
    if (action === 'goTo') {
      this.navigateTo();
    }
  }

  /**
   * @name logAnalyticsEvents
   * @param eventName
   */
  logAnalyticsEvents(eventName?: string) {
    const eventParams = { context: this.eventContext, notification_type: this.selectedNotification.Link };
    this.analyticsService.logEvent(eventName, eventParams);
  }
}
