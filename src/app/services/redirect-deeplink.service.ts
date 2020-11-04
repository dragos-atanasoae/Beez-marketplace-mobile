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
      this.switchFoodMarketplaceVendor(pathComponents);
    }
  }

  switchMainRoute(pathComponents: any) {
    switch (pathComponents[0]) {
      case 'home':
        this.switchTabsRoute(pathComponents);
        break;
      case 'food-marketplace':
        console.log('redirect to food marketplace section');
        this.switchFoodMarketplaceVendor(pathComponents);
        break;
      case 'marketplace-products':
        console.log('redirect to food marketplace products');
        this.switchFoodMarketplaceVendor(pathComponents);
        break;
      default:
        this.navigateToPath('tabs/marketplace');
        break;
    }
  }

  switchTabsRoute(pathComponents: any) {
    switch (pathComponents[1]) {
      case 'home-page':
        console.log('redirect to shops no selection');
        this.navigateToPath('tabs/marketplace');
        break;
      case 'orders':
        console.log('redirect to BeezPay tab');
        localStorage.setItem('selectedOrder', pathComponents[2]);
        this.navigateToPath('tabs/orders');
        break;
      case 'profile':
        console.log('redirect to profile tab');
        this.navigateToPath('tabs/profile');
        break;
      case 'shops':
        console.log('Shop section: ', pathComponents[3]);
        break;
      default:
        console.log('redirect to search default');
        this.navigateToPath('tabs/marketplace');
        break;
    }
  }

  switchFoodMarketplaceVendor(pathComponents: any) {
    console.log('Redirect to vendor');
    if (pathComponents[2]) {
      localStorage.setItem('selectedVendorFromGuestMode', pathComponents[2]);
    }
    if (pathComponents[4]) {
      localStorage.setItem('selectedCategoryFromGuestMode', pathComponents[4]);
    }
    if (pathComponents[6]) {
      localStorage.setItem('selectedProductFromGuestMode', pathComponents[6]);
    }
    if (localStorage.getItem('currentUserToken')) {
      this.navigateToPath('tabs/marketplace');
    }
  }

  navigateToPath(finalPath: string) {
    this.ngZone.run(() => this.router.navigateByUrl(finalPath).then(() => this.$pathComponents.next([]))).then();
  }
}
