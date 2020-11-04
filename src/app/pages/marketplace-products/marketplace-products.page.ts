import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { ShoppingCartPage } from '../shopping-cart/shopping-cart.page';
import { LoadingService } from 'src/app/services/loading.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn } from 'ng-animate';
import { ImageViewerOptionsModel } from 'src/app/models/imageViewerOptions.model';
import { MarketplaceProductDetailsPage } from '../marketplace-product-details/marketplace-product-details.page';
import { ImageViewerPage } from '../image-viewer/image-viewer.page';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/services/analytics.service';
@Component({
  selector: 'app-marketplace-products',
  templateUrl: './marketplace-products.page.html',
  styleUrls: ['./marketplace-products.page.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1.2, delay: 0.2 }
      }),
    ]),
  ]
})
export class MarketplaceProductsPage implements OnInit, OnDestroy {
  @Input() context: string;
  @Input() products: any;
  @Input() vendor: any;
  @Input() allCategories: any;
  @Input() selectedCategory: any;
  @Input() city: any;
  @Input() county: any;

  @ViewChild(IonContent) ionContent: IonContent;

  private unsubscribe$: Subject<boolean> = new Subject();
  localeData: any;
  productsList = [];
  shoppingCartList: any = [];
  totalCart: Observable<any>;
  cartValue = 0;
  eventContext: 'Products';

  constructor(
    private analyticsService: AnalyticsService,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private marketplaceService: MarketplaceService,
    private internationalizationService: InternationalizationService
    ) {}

  ngOnInit() {
    if (this.context === 'search') {
      // this.selectedCategory = null;
      console.log('Products page context: ', this.context);
      this.productsList = this.products;
      console.log(this.productsList);
    } else {
      console.log('Default products page');
      this.getProductsForCategories();
    }
    this.getShoppingCart();
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  searchProduct(keyword: string) {
    if (keyword.length >= 3) {
      console.log('search', keyword);
      this.loadingService.presentLoading();
      this.marketplaceService.foodMarketplaceSearch(this.city.Id, keyword).subscribe((res: any) => {
        console.log(res);
        if (res.status === 'success') {
          this.context = 'search';
          this.productsList = res.products.filter(item => item.vendorId === this.vendor.id.toString());
          console.log(this.productsList);
          this.loadingService.dismissLoading();
        }
        this.loadingService.dismissLoading();
      });
    }
  }

  cancelSearch() {
    this.context = null;
    this.updateActiveCategory(this.selectedCategory);
  }

  getProductsForCategories() {
    this.loadingService.presentLoading();
    this.marketplaceService.getProductsForCategory(this.selectedCategory.id, this.vendor.id, this.city.Id)
    .subscribe((res: any) => {
      if (res.requestStatus === 'Success') {
        this.productsList = res.requestData;
        if (localStorage.getItem('selectedProductFromGuestMode')) {
          const product = res.requestData.find((el: any) => el.id.toString() === localStorage.getItem('selectedProductFromGuestMode'));
          console.log('Selected Product', product);
          this.openMarketplaceProductsDetails(product).then(() => localStorage.removeItem('selectedProductFromGuestMode'));
        }
      }
      this.loadingService.dismissLoading();
    });
  }

  updateActiveCategory(category: any) {
    this.ionContent.scrollToTop(300);
    // this.loadingService.presentLoading();
    this.selectedCategory = category;
    this.context = null;
    this.getProductsForCategories();
    this.analyticsService.logEvent('update_selected_category', { context: this.eventContext });
  }

  /**
   * @name getShoppingCart
   * @description Get data for the active shopping cart(shopping cart initiated)
   */
  getShoppingCart() {
    this.marketplaceService.getShoppingCart(this.vendor.id, this.city.Id);
    // Get SHOPPING CART LIST data from service
    this.marketplaceService.shoppingCartList$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.shoppingCartList = res);
    this.totalCart = this.marketplaceService.totalCart;
    this.totalCart.subscribe(res => {
      this.cartValue = res;
      console.log('Total cart: ', this.cartValue);

    });
  }

  async openMarketplaceProductsDetails(productDetails: any) {
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductDetailsPage,
      componentProps: {
        productDetails,
        context: 'add',
        vendor: this.vendor,
        county: this.county,
        city: this.city
      },
      cssClass: 'overlay_tutorial'
    });
    this.analyticsService.logEvent('open_product_details', { context: this.eventContext });
    modal.present();
    modal.onDidDismiss().then((data: any) => {
      if (data.data === 'successfullyAddedToCart') {
        console.log('successfullyAddedToCart');
      }
    });
  }

  async openShoppingCart() {
    const modal = await this.modalCtrl.create({
      component: ShoppingCartPage,
      componentProps:
      {
        vendor: this.vendor,
        county: this.county,
        city: this.city
      }
    });
    this.analyticsService.logEvent('open_shopping_cart', { context: this.eventContext });
    modal.present();
  }

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
