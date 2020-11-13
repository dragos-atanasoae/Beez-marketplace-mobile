import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LocaleDataModel } from 'src/app/models/localeData.model';

export class StatusDetails {
  text: string;
  icon: string;
  color?: any = 'var(--ion-color-tertiary)';
}

@Component({
  selector: 'app-refund-details',
  templateUrl: './refund-details.page.html',
  styleUrls: ['./refund-details.page.scss'],
})
export class RefundDetailsPage implements OnInit {
  @Input() refundInfo: any;
  localeData: LocaleDataModel;

  constructor(private modalCtrl: ModalController,
              private internationalizationService: InternationalizationService,
              private translate: TranslateService) { }

  ngOnInit() {
    console.log(this.refundInfo);
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  /**
   * @name checkRefundStatus
   * @description Check the status of the refund and switch icon and text by status
   */
  checkRefundStatus(status: any): { status: StatusDetails } {
    switch (status) {
      case 'Pending':
        return {
          status: {
            icon: './assets/icon/order_states/icon_initiated.svg',
            text: this.translate.instant('pages.refundDetails.statusListRefund.statusPending'),
          }
        };
      case 'VendorApproved':
        return {
          status: {
            icon: './assets/icon/icon_refund_accepted.svg',
            text: this.translate.instant('pages.refundDetails.statusListRefund.statusApproved')
          }
        };
      case 'VendorDenied':
        return {
          status: {
            icon: './assets/icon/icon_refund_denied.svg',
            text: this.translate.instant('pages.refundDetails.statusListRefund.statusDenied'),
            color: 'var(--ion-color-danger)'
          }
        };
      case 'BeezApproved':
        return {
          status: {
            icon: './assets/icon/icon_refund_accepted.svg',
            text: this.translate.instant('pages.refundDetails.statusListRefund.statusApproved')
          }
        };
      case 'BeezDenied':
        return {
          status: {
            icon: './assets/icon/icon_refund_denied.svg',
            text: this.translate.instant('pages.refundDetails.statusListRefund.statusDenied'),
            color: 'var(--ion-color-danger)'
          }
        };
      default:
        return {
          status: {
            icon: './assets/icon/order_states/icon_initiated.svg',
            text: 'Status'
          }
        };
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
