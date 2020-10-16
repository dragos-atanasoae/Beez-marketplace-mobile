import { transition, trigger, useAnimation } from '@angular/animations';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { fadeOut, slideInDown } from 'ng-animate';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { OrderDetailsPage } from 'src/app/pages/order-details/order-details.page';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';

export interface StatusDetails {
  text: string;
  icon: string;
  btnAction: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  animations: [
    trigger('toggleHistory', [
      transition(':enter', useAnimation(slideInDown), {
        params: { timing: 0.3, delay: 0.3 }
      }),
      transition(':leave', useAnimation(fadeOut), {
        params: { timing: 0.3, delay: 0 }
      })
    ])
  ]
})
export class OrdersPage implements OnInit {
  @ViewChild('sectionActiveOrders', { read: ElementRef }) sectionActiveOrders: ElementRef;
  @ViewChild('sectionHistory', { read: ElementRef }) sectionHistory: ElementRef;

  localeData = new LocaleDataModel();
  today = new Date();

  activeOrdersList = [];
  ordersHistory = [];
  btnordersHistory = 'View history';
  showHistory = false;
  activeFilter = '';
  showLoadingSkeleton = true;
  showFirstOrderTemplate = false;
  customAlertOptions = {
    cssClass: 'custom_alert'
  };

  constructor(
    private loadingService: LoadingService,
    private marketplaceService: MarketplaceService,
    private modalCtrl: ModalController,
    private router: Router,
    private translate: TranslateService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.getOrdersList();
  }

  /**
   * @name getOrdersList
   * @description Get the list of Orders
   */
  getOrdersList() {
    console.log('get all beezpay items...');
    this.loadingService.presentLoading();
    this.marketplaceService.getAllOrders()
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.showFirstOrderTemplate = response.items.length >= 1 ? false : true;
          this.activeOrdersList = this.getFilteredOrders(response.items, 'active');
          this.ordersHistory = this.getFilteredOrders(response.items, 'history');
        }
        this.loadingService.dismissLoading();
        this.showLoadingSkeleton = false;
      });
  }

  /**
   * @description Filter and order the active orders list and history orders
   * @param orders
   * @param filter
   */
  getFilteredOrders(orders: any, filter: string) {
    let filteredOrders: [] = [];
    switch (filter) {
      case 'active':
        filteredOrders = orders.filter((el: any) => el.category === 'ShoppingOrder' && (el.value - el.paidValue !== 0 || (el.status.status !== 'Delivered' && el.status.status !== 'Paid')));
        break;
      case 'history':
        filteredOrders = orders.filter((el: any) => el.category === 'ShoppingOrder' && el.value - el.paidValue === 0 && (el.status.status === 'Delivered' || el.status.status === 'Paid'));
        break;
    }
    // Order the list of orders by creation date
    filteredOrders.sort((a: any, b: any) => {
      return (Date.parse(b.creationDate) - Date.parse(a.creationDate));
    });
    return filteredOrders;
  }

  /**
   * @description Open Order details Page(modal)
   * @param order
   */
  async openOrderDetailsPage(order: any) {
    const modal = await this.modalCtrl.create({
      component: OrderDetailsPage,
      componentProps: {order}
    });

    modal.present();
    modal.onWillDismiss().then(() => this.getOrdersList());
  }

  scrollToElement(element) {
    console.log('Scroll to: ', element);
    element.nativeElement.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  toggleordersHistory() {
    this.showHistory = !this.showHistory;
    switch (this.showHistory) {
      case true:
        this.btnordersHistory = 'Hide history';
        setTimeout(() => {
          this.scrollToElement(this.sectionHistory);
        }, 300);
        break;
      case false:
        this.btnordersHistory = 'View history';
        this.scrollToElement(this.sectionActiveOrders);
        break;
      default:
        break;
    }
  }

  getOrderStatus(order: any): { status: StatusDetails } {
    const orderStatus = order.status.status;
    switch (orderStatus) {
      case 'Initiated':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.initiated'),
            icon: './assets/icon/order_states/icon_initiated_status.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      case 'PendingToOrder':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.pendingToOrder'),
            icon: './assets/icon/order_states/icon_pending_to_order_inactive.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionOrderNow')
          }
        };

      case 'Ordered':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.ordered'),
            icon: './assets/icon/order_states/icon_ordered_inactive.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionReceived')
          }
        };

      case 'Delivered':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.delivered'),
            icon: './assets/icon/order_states/icon_delivered_inactive.svg',
            btnAction: order.paidValue < order.value ? this.translate.instant('pages.beezPayTab.labelActionPay') :
              this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      case 'ReturnRequested':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.returnRequested'),
            icon: './assets/icon/order_states/icon_other_status.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      case 'Returned':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.returned'),
            icon: './assets/icon/order_states/icon_other_status.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      case 'CancellationRequested':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.cancellationRequested'),
            icon: './assets/icon/order_states/icon_other_status.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      case 'Cancelled':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.canceled'),
            icon: './assets/icon/order_states/icon_other_status.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      //  Offline shops status

      case 'PendingCreated':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.pendingToOrder'),
            icon: './assets/icon/order_states/icon_pending_to_order_inactive.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      case 'Paid':
        return {
          status: {
            text: this.translate.instant('pages.beezPayTab.statusOfOrder.ordered'),
            icon: './assets/icon/order_states/icon_ordered_inactive.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };

      default:
        return {
          status: {
            text: '',
            icon: './assets/icon/order_states/icon_other_status.svg',
            btnAction: this.translate.instant('pages.beezPayTab.labelActionViewDetails')
          }
        };
    }
  }

  navigateToPath(finalPath: string) {
    console.log(finalPath);
    this.zone.run(() => this.router.navigateByUrl(finalPath)).then();
  }

  /**
   * @name doRefresh
   * @description Pull to refresh
   * @param refresher
   */
  doRefresh(refresher: any) {
    this.getOrdersList();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.target.complete();
    }, 2000);
  }

}
