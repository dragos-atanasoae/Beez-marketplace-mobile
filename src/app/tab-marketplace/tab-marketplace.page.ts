import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocaleDataModel } from '../models/localeData.model';
import { MarketplaceCategoriesPage } from '../pages/marketplace/marketplace-categories/marketplace-categories.page';
import { MarketplaceLocationsPage } from '../pages/marketplace/marketplace-locations/marketplace-locations.page';
import { MarketplaceProductsPage } from '../pages/marketplace/marketplace-products/marketplace-products.page';
import { AnalyticsService } from '../services/analytics.service';
import { DeliveryAddressService } from '../services/delivery-address.service';
import { InternationalizationService } from '../services/internationalization.service';
import { LoadingService } from '../services/loading.service';
import { MarketplaceService } from '../services/marketplace.service';

@Component({
  selector: 'app-tab-marketplace',
  templateUrl: './tab-marketplace.page.html',
  styleUrls: ['./tab-marketplace.page.scss'],
})
export class TabMarketplacePage implements OnInit {
  @Output() hideComponentEvent = new EventEmitter<boolean>();

  referralCode = localStorage.getItem('referralCode');
  localeData = new LocaleDataModel();

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
    private loadingService: LoadingService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private deliveryAddressService: DeliveryAddressService,
    private marketplaceService: MarketplaceService,
    private internationalizationService: InternationalizationService
  ) {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
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
        this.openMarketplaceProducts('search');
      }
      console.log(res.requestData);
      setTimeout(() => {
        this.loadingService.dismissLoading();
      }, 1000);
    });
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
    this.marketplaceService.postNewVendorNotificationsStatus(this.city.id, this.newVendorNotificationsStatus).subscribe(res => console.log(res)
    );
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

  selectVendor(vendor: any) {
    this.selectedVendor = vendor;
    console.log(this.selectedVendor);
    if (this.searchResult) {
      this.getCategories();
    } else {
      this.openMarketplaceVendor(vendor);
    }
  }

  async openMarketplaceVendor(vendorDetails: any) {
    const modal = await this.modalCtrl.create({
      component: MarketplaceCategoriesPage,
      componentProps:
      {
        vendor: vendorDetails,
        county: this.county,
        city: this.city
      }
    });
    this.marketplaceService.getShoppingCart(vendorDetails.id, this.city.Id);
    modal.present();
  }

  /**
   * @description Open marketplace products page
   * @param context - default | search
   */
  async openMarketplaceProducts(context: string) {
    console.log('Filtered products list:', this.searchResult.filter(item => parseInt(item.vendorId, 2) === this.selectedVendor.id));
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductsPage,
      componentProps:
      {
        context,
        products: this.searchResult.filter(item => item.vendorId === this.selectedVendor.id.toString()),
        allCategories: this.categories,
        selectedCategory: this.categories[0],
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
