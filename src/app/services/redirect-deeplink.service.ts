import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectDeeplinkService {

  $productFromExternalLink = new BehaviorSubject({ url: null, product: null });
  $pathComponents = new BehaviorSubject([]);

  constructor(
    private httpClient: HttpClient,
    private loadingService: LoadingService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  managePathRedirect(path: string) {
    // replace "?" and "=" with "/" then split path to individual elements(string)
    const pathString = path.replace(/[?=]/g, '/');
    const pathComponents = pathString.split('/').filter(item => item !== '');
    console.log(pathComponents);
    if (localStorage.getItem('currentUserToken')) {
      this.switchMainRoute(pathComponents);
    } else {
      this.$pathComponents.next(pathComponents);
    }
  }

  switchMainRoute(pathComponents: any) {
    switch (pathComponents[0]) {
      case 'home':
        this.switchTabsRoute(pathComponents);
        break;
      case 'food-marketplace':
        console.log('redirect to food marketplace section');
        this.switchShopsListSection('foodMarketplace');
        break;
      case 'marketplace-products':
        console.log('redirect to food marketplace products');
        this.switchFoodMarketplaceVendor();
        break;
      default:
        this.navigateToPath('tabs/search/null');
        break;
    }
  }

  switchTabsRoute(pathComponents: any) {
    switch (pathComponents[1]) {
      case 'home-page':
        console.log('redirect to shops no selection');
        this.navigateToPath('tabs/search/null');
        break;
      case 'sweet_deals':
        console.log('redirect to deals feed tab');
        this.navigateToPath('tabs/deals-feed');
        break;
      case 'beez-pay':
        console.log('redirect to BeezPay tab');
        this.navigateToPath('tabs/beez-pay');
        break;
      case 'profile':
        console.log('redirect to profile tab');
        this.navigateToPath('tabs/profile');
        break;
      case 'donations':
        console.log('redirect to donations tab');
        this.navigateToPath('tabs/donations');
        break;
      case 'shops':
        console.log('Shop section: ', pathComponents[3]);
        this.switchShopsListSection(pathComponents[3]);
        break;
      default:
        console.log('redirect to search default');
        this.navigateToPath('tabs/search/null');
        break;
    }
  }

  switchShopsListSection(subPath: string) {
    switch (subPath) {
      case 'beezPayShopsList':
        console.log('BeezPay Shops List');
        this.navigateToPath('tabs/search/beezPay');
        break;
      case 'cashbackShopsList':
        console.log('Cashback Shops List');
        this.navigateToPath('tabs/search/cashback');
        break;
      case 'foodMarketplace':
        console.log('Marketplace vendors list');
        this.navigateToPath('tabs/search/marketplace');
        break;
      case 'vouchersShopsList':
        console.log('Vouchers Shops List');
        this.navigateToPath('tabs/search/vouchers');
        break;
    }
  }

  switchFoodMarketplaceVendor() {
    console.log('Redirect to vendor');
    this.navigateToPath('tabs/search/marketplace');
  }

  navigateToPath(finalPath: string) {
    this.ngZone.run(() => this.router.navigateByUrl(finalPath).then(() => this.$pathComponents.next([]))).then();
  }
}
