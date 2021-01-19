import { CurrencyPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';

@Component({
  selector: 'app-apply-beez-voucher',
  templateUrl: './apply-beez-voucher.page.html',
  styleUrls: ['./apply-beez-voucher.page.scss'],
})
export class ApplyBeezVoucherPage implements OnInit {
  @Input() vendor: any;
  @Input() city: any;
  @Input() shoppingCart: any;

  voucherCode: FormControl;
  localeData: LocaleDataModel;

  constructor(private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingService: LoadingService,
    private translate: TranslateService,
    private currencyPipe: CurrencyPipe,
    private marketplaceService: MarketplaceService,
    private internationalizationService: InternationalizationService) {
    this.voucherCode = new FormControl('', [Validators.required]);
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  /**
  * @name validateVoucherCode
  * @description Check if a beez voucher can be used for FM cart
  */
  validateVoucherCode() {
    const body = {
      vendorId: this.vendor.id,
      preselectedCityId: this.city.Id,
      voucherCode: this.voucherCode.value
    }

    console.log('Validate VOUCHER CODE body: ', body);

    if (this.voucherCode.valid) {
      this.loadingService.presentLoading();
      this.marketplaceService.validateVoucherCode(body)
        .subscribe((response: any) => {
          console.log(response);
          this.loadingService.dismissLoading();
          if (response.canBeUsed) {
            this.voucherCode.reset();
            // Update order values after voucher code is applied
            this.updateOrderValues(response.cartOrOrder);
            this.presentToast(this.translate.instant('pages.applyBeezVoucher.toastMessages.success') + this.currencyPipe.transform(
              response.cartOrOrder.vouchersTotalValue, this.localeData.currency, 'symbol-narrow', '.0-2', this.localeData.localeID
            ));
          } else {
            this.presentToast(this.translate.instant(response.cmsKeyErrorMessage));
          }
        }, () => this.loadingService.dismissLoading())
    }
  }

  removeVoucher(voucherId: string) {
    this.loadingService.presentLoading();
    const body = {
      vendorId: this.vendor.id,
      preselectedCityId: this.city.Id,
      voucherId: voucherId
    }

    console.log('Remove VOUCHER body: ', body);
    this.marketplaceService.removeVoucher(body)
      .subscribe((response: any) => {
        this.loadingService.dismissLoading();
        console.log(response);
        // Update order values after voucher code is removed
        this.updateOrderValues(response);
      }, () => this.loadingService.dismissLoading())
  }

  /**
   * @name updateOrderValues
   * @description Update order values after voucher code is applied or removed
   */
  updateOrderValues(response: any) {
    // update discount value
    this.shoppingCart.vouchersTotalValue = response.vouchersTotalValue;

    // update vouchers list
    this.shoppingCart.vouchers = response.vouchers;

    // update entire shopping cart
    this.marketplaceService.shoppingCart$.next(this.shoppingCart);

    // update cart value
    this.marketplaceService.totalCart$.next(response.totalValue);

    console.log('this.marketplaceService.shoppingCart ', this.marketplaceService.shoppingCart);
  }

  closeModal() {
    this.modalCtrl.dismiss('cancel');
  }

  /**
   * @name presentToast
   * @description Show toast message
   * @param message
   */
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ],
      position: 'bottom',
      duration: 5000,
      cssClass: 'custom_toast'
    });
    toast.present();
  }
}
