import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject, BehaviorSubject } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  private username: any;
  private token: any;
  private jwtToken: string;
  private apiURL = environment.apiURL;
  private prefixUrlByCountry: string;
  headers: any;
  guestHeader: any;

  shoppingCartList$ = new BehaviorSubject([]);
  promotionsList$ = new BehaviorSubject([]);

  totalCart$ = new Subject<number>();
  totalCart = this.totalCart$.asObservable();

  shoppingCartId$ = new Subject<number>();
  shoppingCartId = this.shoppingCartId$.asObservable();

  constructor(private httpClient: HttpClient,
              private loadingService: LoadingService,
              private modalController: ModalController) { }

  prepareHeaderForRequest() {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.username = localStorage.getItem('userName');
    this.token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
    this.guestHeader = new HttpHeaders().set('Content-Type', 'application/json').set('Cache-Control', 'no-cache');
  }

  getVendorsList(selectedCity: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/GetOnlineVendors?preselectedCityId=' + selectedCity;
    return this.httpClient.get(url, { headers: this.token ? this.headers : this.guestHeader });
  }

  /**
   * @name getCategories
   * @description Get the list of Categories of the products
   * @param vendorId The vendor id
   * @param selectedCity Id of selected city
   */
  getCategories(vendorId: number, selectedCity: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/Products/GetCategories?vendorId=' + vendorId + '&preselectedCityId=' + selectedCity;
    return this.httpClient.get(url, { headers: this.token ? this.headers : this.guestHeader });
  }

  /**
   * @name getProductsForCategory
   * @description Get the list of the products for selected Category
   * @param categoryId ID of the selected category
   * @param vendorId The vendor id
   * @param selectedCity Id of selected city
   */
  getProductsForCategory(categoryId: string, vendorId: number, selectedCity: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/Products/GetProductsForCategory?categoryId=' + categoryId + '&vendorId=' + vendorId + '&preselectedCityId=' + selectedCity;
    return this.httpClient.get(url, { headers: this.token ? this.headers : this.guestHeader });
  }

  /**
   * @name getShoppingCart
   * @description Get the products added to the current shopping cart
   * @param vendorId The vendor id
   * @param selectedCity Id of selected city
   */
  getShoppingCart(vendorId: number, selectedCity: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/ShoppingCart/ActiveCart?vendorId=' + vendorId + '&preselectedCityId=' + selectedCity;
    this.httpClient.get(url, { headers: this.headers })
      .subscribe((res: any) => {
        console.log(res);
        if (res.requestStatus === 'Success') {
          this.shoppingCartId$.next(res.requestData.shoppingCartId);
          this.shoppingCartList$.next(res.requestData.products);
          this.totalCart$.next(res.requestData.totalValue);
        }
      });
  }

  /**
   * @name getOrdersList
   * @description Get list of marketplace orders
   */
  getOrdersList() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/GetOrders';
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getOrderDetails
   * @description Get the maketplace Order Details
   * @param orderId
   */
  getOrderDetails(orderId: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/GetOrderDetails?orderId=' + orderId;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getAllOrders
   * @description Get list of all products (online/offline/voucher/marketplace)
   */
  getAllOrders() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/BeezPay/Items';
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getItemDetails
   * @param itemId
   * @param itemCategory
   */
  getItemDetails(itemId: any, itemCategory: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/BeezPay/ItemDetails?id=' + itemId + '&category=' + itemCategory;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name addProductToCart
   * @description Add an product to shopping cart
   * @param id The ID of the selected product
   * @param quantity Quantity of the product
   * @param vendorId The vendor id
   * @param selectedCity Id of selected city
   */
  addProductToCart(id: string, quantity: number, selectedVendorId: number, selectedCity: number) {
    this.prepareHeaderForRequest();
    this.loadingService.presentLoading();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/ShoppingCart/AddProductToCart';
    const body = {
      ProductId: id,
      ProductQuantity: quantity,
      PreselectedCityId: selectedCity,
      VendorId: selectedVendorId
    };
    this.httpClient.post(url, body, { headers: this.headers })
      .subscribe((res: any) => {
        console.log(res);
        if (res.requestStatus === 'Success') {
          this.shoppingCartList$.next(res.requestData.products);
          this.totalCart$.next(res.requestData.totalValue);
          this.modalController.dismiss('successfullyAddedToCart');
        }
        this.loadingService.dismissLoading();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name editProductFromCart
   * @description Edit existing product from shopping cart
   * @param id The ID of the selected product
   * @param quantity Quantity of the product
   * @param isRemove If true then will remove product
   * @param vendorId The vendor id
   * @param selectedCity Id of selected city
   */
  editProductFromCart(id: string, quantity: number, selectedVendorId: number, selectedCity: number, isRemove?: boolean) {
    this.prepareHeaderForRequest();
    this.loadingService.presentLoading();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/ShoppingCart/EditProductInCart';
    const body = {
      ProductId: id,
      ProductQuantity: quantity,
      PreselectedCityId: selectedCity,
      VendorId: selectedVendorId
    };
    this.httpClient.post(url, body, { headers: this.headers })
      .subscribe((res: any) => {
        console.log(res);
        if (res.requestStatus === 'Success') {
          this.shoppingCartList$.next(res.requestData.products);
          this.totalCart$.next(res.requestData.totalValue);
          if (!isRemove) {
            this.modalController.dismiss('successfullyAddedToCart');
          }
        }
        this.loadingService.dismissLoading();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name checkoutShoppingCart
   * @param shoppingCartId
   * @param vendorId
   * @param addressId
   */
  checkoutShoppingCart(shoppingCartId: number, vendorId: number, selectedCity: number, addressId: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/CheckOutShoppingCart';
    const body = {
      ShoppingCartId: shoppingCartId,
      VendorId: vendorId,
      PreselectedCityId: selectedCity,
      AddressId: addressId
    };
    return this.httpClient.post(url, body, { headers: this.headers });
  }

  /**
   * @name postOrderRefund
   * @description Post Refund order request for missing products from the marketplace order
   * @param orderId ID of the order where are missing products
   * @param amount Total amount of the missing products
   * @param productsList list of the missing products EX: [{productId: 1000, unitValue: 24, missingQuantity: 2}]
   */
  postOrderRefund(orderId: number, amount: number, productsList: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/OrderRefund';
    const body = {
      orderId,
      refundAmount: amount,
      products: productsList
    };
    return this.httpClient.post(url, body, { headers: this.headers });
  }

  /**
   * @name postOrderFeedback
   * @description Post feedback message for the selected order
   * @param orderId
   * @param message // Feedback message
   */
  postOrderFeedback(orderId: number, message: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/OrderFeedback';
    const body = {
      OrderId: orderId,
      Message: message
    };
    return this.httpClient.post(url, body, { headers: this.headers });
  }

  /**
   * @name removeOrder
   * @description Remove markeplace order
   * @param id
   */
  removeOrder(id: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/OrderDelete';
    const body = { orderId: id };
    return this.httpClient.post(url, body, { headers: this.headers });
  }

  /**
   * @name getNewVendorNotificationsStatus
   * @description Get status of notifications for new vendors on the selected location
   * @param cityId
   */
  getNewVendorNotificationsStatus(cityId?: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/NewVendorNotifications' + (cityId !== undefined ? '?cityId=' + cityId : '');
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name postNewVendorNotificationsStatus
   * @description Enable/disable notifications for new vendors on the selected location
   * @param cityId
   * @param following
   */
  postNewVendorNotificationsStatus(cityId: number, follow: boolean) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/NewVendorNotifications';
    const body = {
      cityId,
      isFollowing: follow
    };
    return this.httpClient.post(url, body, { headers: this.headers });
  }

  /**
   * @name getVendorFollowingStatus
   * @description Get status of following vendor for notifications when a new promotion is added
   * * The call of the method without parameters will return a list of the all vendors with following status
   * @param cityId
   */
  getVendorFollowingStatus(cityId?: number, vendorId?: number) {
    this.prepareHeaderForRequest();
    let url = this.prefixUrlByCountry + this.apiURL + 'api/User/VendorFollowers';
    if (cityId && vendorId) {
      url = url + '?cityId=' + cityId + '&vendorId=' + vendorId;
    }
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name postVendorFollowingStatus
   * @description Post status of the following vendor
   * @param vendorId
   */
  postVendorFollowingStatus(cityId: number, vendorId: number, follow: boolean) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/User/VendorFollowers';
    const body = {
      cityId,
      vendorId,
      isFollowing: follow
    };
    return this.httpClient.post(url, body, { headers: this.headers });
  }

  /**
   * @name foodMarketplaceSearch
   * @description Get result from FoodMarketplace search
   * @param cityId
   * @param keyword
   */
  foodMarketplaceSearch(cityId: number, keyword: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/FoodMarketplaceSearch?cityId=' + cityId + '&keyword=' + keyword;
    return this.httpClient.get(url, {headers: this.token ? this.headers : this.guestHeader});
  }

  /**
   * @name getInvoiceUrl
   * @description Get invoice URL for the current order
   * @param productId
   * @param categoryName  Categories: OnlineProduct / OfflineProduct / Voucher / FlashVoucher / ShoppingOrder
   */
  getInvoiceUrl(productId: number, categoryName: string) {
    const url = this.prefixUrlByCountry + this.apiURL + 'api/BeezPay/InvoiceDownloadUrl?id=' + productId + '&category=' + categoryName;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getPromotionsList
   * @description Get list of promotions
   */
  getPromotionsList() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/deals/Promos';
    this.httpClient.get(url, { headers: this.headers }).subscribe((res: any) => {
      console.log(res);
      if (res) {
        const promotionsList = res.filter((item: any) => item.promotionType === 'Vendor');
        console.log('FM Promotions:', promotionsList);
        this.promotionsList$.next(promotionsList);
      }
    })
  }
}
