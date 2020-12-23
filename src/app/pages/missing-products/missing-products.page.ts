import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn, slideInDown, slideOutDown } from 'ng-animate';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-missing-products',
  templateUrl: './missing-products.page.html',
  styleUrls: ['./missing-products.page.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1.2, delay: 0 }
      }),
    ]),
    trigger('slideIn', [
      transition(':enter', useAnimation(slideInDown), {
        params: { timing: 0.2, delay: 0 }
      }),
      transition(':leave', useAnimation(slideOutDown), {
        params: { timing: 0.2, delay: 0 }
      }),
    ]),
  ]
})
export class MissingProductsPage implements OnInit {
  @Input() productsList: any;
  @Input() orderId: number;

  localeData: LocaleDataModel;
  missingProducts = [];
  totalRefund = 0;
  selectedProduct = null;
  showOverlaySelectQuantity = false;
  showOverlayRefundResponse = false;
  refundRequestReceived = false;
  eventContext: 'Missing Products';

  constructor(
    private analyticsService: AnalyticsService,
    private modalCtrl: ModalController,
    private internationalizationService: InternationalizationService,
    private marketplaceService: MarketplaceService,
    private loadingService: LoadingService

  ) { }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    this.productsList.forEach(element => {
      element.missingQuantity = 0;
    });
    console.log('Order ID: ', this.orderId, 'Products list: ', this.productsList);
  }

  /**
   * @description Select the product as missing from order.
   * * If the quantity is 1, add the product to missingProducts list else ask to select the missing quantity
   * @param product
   */
  selectMissingProduct(product) {
    const quantity = product.quantityRefund ? product.quantity - product.quantityRefund : product.quantity;
    // Toggle selection of the products where quantity === 1
    if (quantity === 1) {
      if (product.missingQuantity === 0) {
        this.productsList.map((item) => {
          if (item.name === product.name) {
            item.missingQuantity = 1;
          }
        });
      } else {
        this.productsList.map((item) => {
          if (item.name === product.name) {
            item.missingQuantity = 0;
          }
        });
      }
      this.updateMissingProductsList();
    } else if (quantity !== 0) {
      // Show overlay select quantity for missing product
      this.selectedProduct = product;
      this.showOverlaySelectQuantity = true;
    }
    this.analyticsService.logEvent('select_missing_product', { context: this.eventContext });
  }

  /**
   * @description Update the missingProducts list after product selection or on change quantity of the missing product and update totalRefund value
   */
  updateMissingProductsList() {
    this.missingProducts = this.productsList.filter((prod) => prod.missingQuantity > 0);
    // console.log(this.missingProducts);
    this.totalRefund = 0;
    this.missingProducts.forEach((prod) => {
      this.totalRefund = this.totalRefund + (prod.missingQuantity * prod.unitValue);
    });
    // console.log('total refund: ', this.totalRefund);
  }

  /**
   * @description Change quantity missing for the selected product
   * @param product
   */
  changeMissingQuantity(action: string) {
    if (action === 'add') {
      this.selectedProduct.missingQuantity++;
    } else {
      this.selectedProduct.missingQuantity--;
    }
  }

  /**
   * @description Save selected quantity for the selected missing product and update the missing products list
   */
  saveChangesForCurrentProduct() {
    this.productsList.forEach((product) => {
      if (product.id === this.selectedProduct.id) {
        product.missingQuantity = this.selectedProduct.missingQuantity;
      }
    });
    this.updateMissingProductsList();
    this.showOverlaySelectQuantity = false;
    // console.log(this.missingProducts);
  }

  /**
   * @description Send REFUND request for the missing products
   */
  sendOrderRefund() {
    this.loadingService.presentLoading();
    // Remove all unnecessary properties from object(product)
    const products = this.missingProducts.map(product => {
      return {
        productId: product.id,
        unitValue: product.unitValue,
        missingQuantity: product.missingQuantity
      };
    });
    this.marketplaceService.postOrderRefund(this.orderId, this.totalRefund, products).subscribe((res: any) => {
      // console.log(res);
      this.showOverlayRefundResponse = true;
      this.analyticsService.logEvent('send_refund_request', { context: this.eventContext });
      if (res.status === 'success') {
        this.analyticsService.logEvent('refund_request_successfuly_sent', { context: this.eventContext });
        this.refundRequestReceived = true;
      } else {
        this.analyticsService.logEvent('refund_request_error', { context: this.eventContext });
      }
      this.loadingService.dismissLoading();
    });
  }

  /**
   * @description Close the overlay refund response and dismiss the current modal if the response of request is success
   */
  closeOverlayRefundResponse() {
    this.showOverlayRefundResponse = false;
    if (this.refundRequestReceived) {
      this.modalCtrl.dismiss('success');
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
