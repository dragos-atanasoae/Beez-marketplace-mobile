import { trigger, transition, useAnimation, query, style, stagger, animate } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { slideInUp, slideOutUp, slideInRight } from 'ng-animate';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { MarketplaceLocationsPage } from 'src/app/pages/marketplace-locations/marketplace-locations.page';
import { MarketplaceProductsPage } from 'src/app/pages/marketplace-products/marketplace-products.page';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { DeliveryAddressService } from 'src/app/services/delivery-address.service';
import { EventsService } from 'src/app/services/events.service';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
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
export class MarketplacePage implements OnInit {
  @Output() hideComponentEvent = new EventEmitter<boolean>();
  private unsubscribe$: Subject<boolean> = new Subject();

  referralCode = localStorage.getItem('referralCode');
  localeData = new LocaleDataModel();
  eventContext = 'Marketplace Tab';
  city: any = JSON.parse(localStorage.getItem('city'));
  county: any = JSON.parse(localStorage.getItem('county'));

  // Vendors
  vendorsList: any = null;
  copyList: any = [];
  selectedVendor: any = null;
  metacategories = [
    { id: 0, name: 'Bacanie', imgUrl: 'bacanie' },
  ];
  // Product categories
  categories: any = null;
  selectedCategory: any = null;

  // Metacategories
  categoriesDropdownIsActive = false;
  activeCategory = null;

  // Search
  searchIsActive = false;
  searchResult = null;
  newVendorNotificationsStatus = null;
  searchedKeyword = null;

  constructor(
    private analyticsService: AnalyticsService,
    private deliveryAddressService: DeliveryAddressService,
    private internationalizationService: InternationalizationService,
    private loadingService: LoadingService,
    private marketplaceService: MarketplaceService,
    private modalCtrl: ModalController,
    private eventsService: EventsService,
    private translate: TranslateService,
  ) {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });

    this.eventsService.event$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res === 'refreshVendorsList') {
        console.log('Test refresh');
        this.getVendorsListForMarketplace();
      }
    });
  }

  ngOnInit() {
    console.log('City from local storage', this.city);
    if (this.city === null) {
      this.openMarketplaceLocations();
    } else {
      this.getVendorsListForMarketplace();
      this.getFollowingInfo();
    }
  }

  /**
   * @description Get list of Vendors available on Food Marketplace
   * and redirect to vednor products page if is received redirect data from guest mode or deeplinking
   */
  getVendorsListForMarketplace() {
    this.city = JSON.parse(localStorage.getItem('city'));
    this.county = JSON.parse(localStorage.getItem('county'));
    console.log(this.county, this.city);
    this.marketplaceService.getVendorsList(this.city.Id).subscribe((res: any) => {
      console.log(res);
      if (res.status === 'success') {
        this.metacategories = res.activeMetaCategories;
        this.vendorsList = res.vendors;
        this.copyList = this.vendorsList;
        console.log('Buffered vendor ', localStorage.getItem('selectedVendorFromGuestMode'));
        if (localStorage.getItem('selectedVendorFromGuestMode')) {
          const vendor = res.vendors.find((el: any) => el.id.toString() === localStorage.getItem('selectedVendorFromGuestMode'));
          console.log('Selected Vendor', vendor);
          this.selectVendor(vendor);
          localStorage.removeItem('selectedVendorFromGuestMode');
          // this.openMarketplaceVendor(vendor).then(() => localStorage.removeItem('selectedVendorFromGuestMode'));
        }
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
  getCategories(context: string) {
    this.loadingService.presentLoading();
    this.marketplaceService.getCategories(this.selectedVendor.id, this.city.Id).subscribe((res: any) => {
      if (res.requestStatus === 'Success') {
        this.categories = res.requestData;
        // this.openMarketplaceProducts('search');
        if (localStorage.getItem('selectedCategoryFromGuestMode')) {
          this.selectedCategory = res.requestData.find((el: any) => el.id.toString() === localStorage.getItem('selectedCategoryFromGuestMode'));
          console.log('Selected Category', this.selectedCategory);
          this.openMarketplaceProducts(context).then(() => localStorage.removeItem('selectedCategoryFromGuestMode'));
        } else {
          this.selectedCategory = this.categories[0];
          this.openMarketplaceProducts(context);
        }
      }
      console.log(res.requestData);
      setTimeout(() => {
        this.loadingService.dismissLoading();
      }, 1000);
    });
  }

  selectVendor(vendor: any) {
    this.selectedVendor = vendor;
    console.log(this.selectedVendor);
    this.analyticsService.logEvent('select_vendor', { context: this.eventContext, city: this.city, vendor: this.selectVendor });
    if (this.searchResult) {
      this.getCategories('search');
    } else {
      this.getCategories('default');
    }
  }

  /**
   * @name getFollowingInfo
   * @description Get status of new vendor notifications
   */
  getFollowingInfo() {
    this.marketplaceService.getNewVendorNotificationsStatus(this.city.Id).subscribe((res: any) => {
      if (res.status === 'success') {
        this.newVendorNotificationsStatus = res.userData[0].isFollowing;
      }
    });
  }

  /**
   * @name toggleNewVendorNotifications
   * @description Enable/Disable notifications for new vendor on selected location/city
   */
  async toggleNewVendorNotifications() {
    this.analyticsService.logEvent(this.newVendorNotificationsStatus ? 'turn_on_new_vendor_notifications' : 'turn_off_new_vendor_notifications', { context: this.eventContext, city: this.city, status: this.newVendorNotificationsStatus });
    this.marketplaceService.postNewVendorNotificationsStatus(this.city.id, this.newVendorNotificationsStatus).subscribe(res => console.log(res));
  }

  searchInProperty(value: any, keyword: any) {
    keyword = keyword.toUpperCase();
    if (value !== null) {
      return value.toString().toUpperCase().indexOf(keyword) > -1;
    }
    return false;
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

  resetList() {
    this.vendorsList = this.copyList;
  }

  // async openMarketplaceVendor(vendorDetails: any) {
  //   const modal = await this.modalCtrl.create({
  //     component: MarketplaceCategoriesPage,
  //     componentProps:
  //     {
  //       vendor: vendorDetails,
  //       county: this.county,
  //       city: this.city
  //     }
  //   });
  //   this.marketplaceService.getShoppingCart(vendorDetails.id, this.city.Id);
  //   modal.present();
  // }

  /**
   * @description Open marketplace products page
   * @param context - default | search
   */
  async openMarketplaceProducts(context: string) {
    // console.log('Filtered products list:', this.searchResult.filter(item => parseInt(item.vendorId, 2) === this.selectedVendor.id));
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductsPage,
      componentProps:
      {
        context,
        products: context === 'search' ? this.searchResult.filter(item => item.vendorId === this.selectedVendor.id.toString()) : [],
        allCategories: this.categories,
        selectedCategory: this.selectedCategory,
        vendor: this.selectedVendor,
        county: this.county,
        city: this.city
      }
    });
    modal.present();
  }

  async openMarketplaceLocations() {
    const modal = await this.modalCtrl.create({
      component: MarketplaceLocationsPage
    });
    modal.present();
    modal.onDidDismiss().then((data) => {
      switch (data.data) {
        case 'select':
          this.getVendorsListForMarketplace();
          this.newVendorNotificationsStatus = null;
          this.getFollowingInfo();
          break;
        case 'noSelection':
          this.hideComponentEvent.emit(true);
          break;
        default:
          console.log('Cancel select location');
          break;
      }
    });
  }
}

