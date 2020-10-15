import { trigger, transition, useAnimation, query, style, stagger, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { bounceIn } from 'ng-animate';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { ShoppingCartPage } from '../../shopping-cart/shopping-cart.page';
import { MarketplaceProductsPage } from '../marketplace-products/marketplace-products.page';


@Component({
  selector: 'app-marketplace-categories',
  templateUrl: './marketplace-categories.page.html',
  styleUrls: ['./marketplace-categories.page.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 0.8, delay: 0 }
      }),
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter',
          [style({ opacity: 0, transform: 'translateX(-20%)' }), stagger('40ms', animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0%)' })))],
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
export class MarketplaceCategoriesPage implements OnInit, OnDestroy {

  localeData: any;
  categories = [];
  private unsubscribe$: Subject<boolean> = new Subject();
  selectedCategory = null;
  products: any;
  selectedProduct = null;
  shoppingCartList: any = [];
  totalCart: Observable<any>;
  cartValue = 0;
  city: any;
  county: any;
  vendor: any;
  statusOfFollowingVendor = true;

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private marketplaceService: MarketplaceService,
    private internationalizationService: InternationalizationService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params && params.city) {
        this.city = JSON.parse(params.city);
        this.county = JSON.parse(params.county);
        this.vendor = JSON.parse(params.vendor);
        console.log(this.vendor);
      }
    });
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    console.log(this.vendor);
    this.getCategories();
    this.getShoppingCart();
    this.getFollowingStatus();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  goBack() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        county: JSON.stringify(this.county),
        city: JSON.stringify(this.city),
      }
    };
    this.router.navigate(['/food-marketplace'], navigationExtras);
  }

  /**
   * @name getShoppingCart
   * @description Get data for the active shopping cart(shopping cart initiated)
   */
  getShoppingCart() {
    this.marketplaceService.getShoppingCart(this.vendor.id, this.city.Id);
    this.totalCart = this.marketplaceService.totalCart;
    this.marketplaceService.shoppingCartList$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.shoppingCartList = res);

    this.totalCart.subscribe(res => {
      this.cartValue = res;
      console.log('Total cart: ', this.cartValue);
    });
  }

  getCategories() {
    this.loadingService.presentLoading();
    this.marketplaceService.getCategories(this.vendor.id, this.city.Id).subscribe((res: any) => {
      if (res.requestStatus === 'Success') {
        this.categories = res.requestData;
      }
      console.log(res.requestData);
      setTimeout(() => {
        this.loadingService.dismissLoading();
      }, 1000);
    });
  }

  async openMarketplaceProducts(category: any) {
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductsPage,
      componentProps:
      {
        allCategories: this.categories,
        selectedCategory: category,
        vendor: this.vendor,
        county: this.county,
        city: this.city
      }
    });
    modal.present();
  }

  async openShoppingCart() {
    const modal = await this.modalCtrl.create({
      component: ShoppingCartPage,
      animated: false,
      componentProps:
      {
        vendor: this.vendor,
        county: this.county,
        city: this.city
      }
    });
    modal.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async showAlertInfo() {
    const alert = await this.alertCtrl.create({
      header: 'Info',
      subHeader: this.translate.instant('pages.marketplace.marketplaceCategories.alertInfo.subHeader'),
      message: this.translate.instant('pages.marketplace.marketplaceCategories.alertInfo.message'),
      buttons: [
        {
          text: 'Ok',
          role: 'close'
        }
      ],
      cssClass: 'custom_alert'
    });
    alert.present();
  }

  /**
   * @name getFollowingStatus
   * @description Get following status for the new promotions from the current vendor
   */
  getFollowingStatus() {
    this.marketplaceService.getVendorFollowingStatus(this.city.Id, this.vendor.id).subscribe((res: any) => this.statusOfFollowingVendor = res.userData[0].isFollowing);
  }

  /**
   * @name updateVendorFollowingStatus
   * @description Post status of vendor following
   */
  updateVendorFollowingStatus() {
    this.marketplaceService.postVendorFollowingStatus(this.city.Id, this.vendor.id, true).subscribe((res: any) => this.statusOfFollowingVendor = res.userData[0].isFollowing);
  }

}
