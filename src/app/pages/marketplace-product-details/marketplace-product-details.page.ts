import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { ImageViewerOptionsModel } from 'src/app/models/imageViewerOptions.model';
import { ImageViewerPage } from '../image-viewer/image-viewer.page';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketplace-product-details',
  templateUrl: './marketplace-product-details.page.html',
  styleUrls: ['./marketplace-product-details.page.scss'],
})
export class MarketplaceProductDetailsPage implements OnInit {
  @Input() productDetails: any;
  @Input() context: string;
  @Input() city: any;
  @Input() vendor: any;
  token = localStorage.getItem('currentUserToken');
  quantity = 0;
  isDisabled = false;
  localeData = new LocaleDataModel();
  eventContext = 'Product Details';

  constructor(
    private analyticsService: AnalyticsService,
    private internationalizationService: InternationalizationService,
    private marketplaceService: MarketplaceService,
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    // Initialize quantity by context
    this.quantity = this.context === 'edit' ? this.productDetails.quantity : 1;
    console.log(this.productDetails);
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  closeModal(data?: string) {
    this.modalCtrl.dismiss(data);
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addProductToCart() {
    this.isDisabled = true;
    if (this.token) {
      this.analyticsService.logEvent('add_product_to_cart', { context: this.eventContext });
      this.marketplaceService.addProductToCart(this.productDetails.id, this.quantity, this.vendor.id, this.city.Id);
    } else {
      this.modalCtrl.dismiss();
      this.router.navigateByUrl('login');
    }
  }

  editProductFromCart() {
    this.analyticsService.logEvent('edit_product_quantity', { context: this.eventContext });
    this.marketplaceService.editProductFromCart(this.productDetails.productReferenceId, this.quantity, this.vendor.id, this.city.Id);
  }

  /**
   * @name openImageViewer
   * @description Open product image in modal with zoom options
   * @param imageSrc
   * @param imageTitle
   */
  async openImageViewer(imageSrc: string, imageTitle: string) {
    const viewerOptions: ImageViewerOptionsModel = {
      imageSource: imageSrc,
      zoom: true,
      zoomButtonsPosition: 'bottom',
      title: imageTitle,
      darkMode: true,
    };

    const imageViewer = await this.modalCtrl.create({
      component: ImageViewerPage,
      componentProps: {
        options: viewerOptions
      },
      cssClass: 'modal_image_viewer',
      animated: false
    });
    this.analyticsService.logEvent('open_product_image', { context: this.eventContext });
    imageViewer.present();
  }

}
