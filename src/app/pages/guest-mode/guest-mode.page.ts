import { Component, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { IonContent, IonSlides, ModalController } from '@ionic/angular';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { MarketplaceLocationsPage } from '../marketplace-locations/marketplace-locations.page';
import { trigger, transition, useAnimation, query, style, stagger, animate } from '@angular/animations';
import { slideInRight, slideInUp, slideOutUp } from 'ng-animate';
import { MarketplaceProductDetailsPage } from '../marketplace-product-details/marketplace-product-details.page';
import { BackButtonActionService } from 'src/app/services/back-button-action.service';
@Component({
  selector: 'app-guest-mode',
  templateUrl: './guest-mode.page.html',
  styleUrls: ['./guest-mode.page.scss'],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', useAnimation(slideInUp), {
        params: { timing: 0.8, delay: 0 }
      }),
      transition(':leave', useAnimation(slideOutUp), {
        params: { timing: 0.2, delay: 0 }
      })
    ]),
    trigger('fadeIn', [
      transition(':enter', useAnimation(slideInRight), {
        params: { timing: 0.2, delay: 0 }
      }),
      // transition(':leave', useAnimation(fadeOut), {
      //   params: { timing: 0.5, delay: 0 }
      // })
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter',
          [style({ opacity: 0, transform: 'translateX(-20%)' }), stagger('50ms', animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0%)' })))],
          { optional: true }
        ),
        query(':leave',
          animate('200ms', style({ opacity: 0 })),
          { optional: true }
        )
      ])
    ])
  ]
})
export class GuestModePage implements OnInit {
  @Output() hideComponentEvent = new EventEmitter<boolean>();
  @ViewChild('marketplaceSlides') marketplaceSlides: IonSlides;
  @ViewChild('ionContent') ionContent: IonContent;

  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  eventContext = 'Guest Page';
  city: any = JSON.parse(localStorage.getItem('city'));
  county: any = JSON.parse(localStorage.getItem('county'));
  localeData = new LocaleDataModel();
  context = null;
  // Vendors
  vendorsList: any = null;
  copyList: any = [];
  selectedVendor: any = null;

  // Product categories
  categories: any = null;
  selectedCategory: any = null;
  productsList: any = null;

  // Metacategories
    metacategories = [
      { id: 0, name: 'Bacanie', imgUrl: 'bacanie' },
    ];
  categoriesDropdownIsActive = false;
  activeCategory = null;

  // Search
  searchIsActive = false;
  searchResult = null;
  newVendorNotificationsStatus = null;
  searchedKeyword = null;

  constructor(
    private analyticsService: AnalyticsService,
    private backActionService: BackButtonActionService,
    private loadingService: LoadingService,
    private internationalizationService: InternationalizationService,
    private marketplaceService: MarketplaceService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    if (this.city) {
      this.getVendorsList();
    } else {
      this.openMarketplaceLocations();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.marketplaceSlides.lockSwipes(true);
    }, 500);
    if (this.marketplaceSlides.isBeginning) {
      this.backActionService.listenForBackEvent();
    }
  }

  getVendorsList() {
    this.city = JSON.parse(localStorage.getItem('city'));
    this.county = JSON.parse(localStorage.getItem('county'));
    console.log(this.county, this.city);
    this.marketplaceService.getVendorsList(this.city.Id).subscribe((res: any) => {
      console.log(res);
      if (res.status === 'success') {
        this.metacategories = res.activeMetaCategories;
        this.vendorsList = res.vendors;
        this.copyList = this.vendorsList;
        // when switch to another location
        if (this.searchedKeyword) {
          this.onSearchChange(this.searchedKeyword);
        }
      }
    });
  }

  /**
   * @name getCategories
   * @description Get the list of products categories for the selected vendor
   */
  getCategories() {
    this.loadingService.presentLoading();
    this.marketplaceService.getCategories(this.selectedVendor.id, this.city.Id).subscribe((res: any) => {
      if (res.requestStatus === 'Success') {
        this.categories = res.requestData;
        this.selectedCategory = this.categories[0];
        this.getProductsForCategories();
        console.log('Product categories: ', this.categories);
      }
    });
  }

  getProductsForCategories() {
    this.marketplaceService.getProductsForCategory(this.selectedCategory.id, this.selectedVendor.id, this.city.Id)
    .subscribe((res: any) => {
      if (res.requestStatus === 'Success') {
        this.productsList = res.requestData;
        console.log('Products list: ', this.productsList);
      }
      setTimeout(() => {
        this.nextSlide();
      }, 500);
      this.marketplaceService.selectedCategoryFromGuestMode$.next(this.selectedCategory.id);
      localStorage.setItem('selectedCategoryFromGuestMode', this.selectedCategory.id);
      this.loadingService.dismissLoading();
    });
  }

  updateActiveCategory(category: any) {
    this.ionContent.scrollToTop(300).then(() => console.log('Scroll')
    );
    // this.loadingService.presentLoading();
    this.selectedCategory = category;
    this.context = null;
    this.getProductsForCategories();
    // this.analyticsService.logEvent('update_selected_category', { context: this.eventContext });
  }

  /**
   * @name onSearchChange
   * @description Search product for all vendors and filter vendors by result
   * @param keyword
   */
  onSearchChange(keyword: string) {
    this.searchedKeyword = keyword;
    if (keyword.length >= 3) {
      this.loadingService.presentLoading();
      console.log('search', keyword);
      this.marketplaceService.foodMarketplaceSearch(this.city.Id, keyword).subscribe((res: any) => {
        console.log(res);
        if (res.status === 'success') {
          this.searchResult = res.products;
          console.log(this.searchResult);
          const filteredIds = [...new Set(this.searchResult.map((product: any) => product.vendorId))];
          console.log(filteredIds);
          const filteredVendorsList = this.copyList.filter(item => filteredIds.includes(item.id.toString()));
          console.log(filteredVendorsList);
          this.vendorsList = filteredVendorsList;
          this.analyticsService.logEvent('search_on_marketplace', { context: this.eventContext, search: keyword });
        }
        this.loadingService.dismissLoading();
      });
    }
  }

  /**
   * @name cancelSearch
   * @description Hide searchbar and reset the vendors list
   */
  cancelSearch() {
    this.searchedKeyword = null;
    this.searchResult = null;
    this.searchIsActive = false;
    this.vendorsList = this.copyList;
  }

  searchProduct(keyword: string) {
    if (keyword.length >= 3) {
      console.log('search', keyword);
      this.loadingService.presentLoading();
      this.marketplaceService.foodMarketplaceSearch(this.city.Id, keyword).subscribe((res: any) => {
        console.log(res);
        if (res.status === 'success') {
          this.context = 'search';
          this.productsList = res.products.filter(item => item.vendorId === this.selectedVendor.id.toString());
          console.log(this.productsList);
          this.loadingService.dismissLoading();
        }
        this.loadingService.dismissLoading();
      });
    }
  }

  resetList() {
    this.vendorsList = this.copyList;
  }

  selectVendor(vendor: any) {
    console.log(vendor);
    this.selectedVendor = vendor;
    this.getCategories();
    this.marketplaceService.selectedVendorFromGuestMode$.next(vendor.id);
    localStorage.setItem('selectedVendorFromGuestMode', vendor.id);
  }

  nextSlide() {
    this.marketplaceSlides.lockSwipes(false);
    this.marketplaceSlides.slideNext();
    this.marketplaceSlides.lockSwipes(true);
  }

  previousSlide() {
    this.marketplaceSlides.lockSwipes(false);
    this.marketplaceSlides.slidePrev();
    this.marketplaceSlides.lockSwipes(true);
  }

  async openMarketplaceLocations() {
    const modal = await this.modalCtrl.create({
      component: MarketplaceLocationsPage
    });
    modal.present();
    modal.onDidDismiss().then((data) => {
      switch (data.data) {
        case 'select':
          this.getVendorsList();
          break;
        case 'noSelection':
          this.openMarketplaceLocations();
          break;
        default:
          console.log('Cancel select location');
          break;
      }
    });
  }

  async openMarketplaceProductsDetails(productDetails: any) {
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductDetailsPage,
      componentProps: {
        productDetails,
        context: 'add',
        vendor: this.selectedVendor,
        county: this.county,
        city: this.city
      },
      cssClass: 'overlay_tutorial'
    });
    this.marketplaceService.selectedProductFromGuestMode$.next(productDetails.id);
    localStorage.setItem('selectedProductFromGuestMode', productDetails.id);
    // this.analyticsService.logEvent('open_product_details', { context: this.eventContext });
    modal.present();
    modal.onDidDismiss().then((data: any) => {
      if (data.data === 'successfullyAddedToCart') {
        console.log('successfullyAddedToCart');
      }
    });
  }

  resetPreviewProduct() {
    localStorage.removeItem('guestPreviewProduct');
  }

}
