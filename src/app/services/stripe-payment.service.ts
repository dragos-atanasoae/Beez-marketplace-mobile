import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { StripeCardPaymentModel } from '../models/stripeCardPayment.model';

@Injectable({
  providedIn: 'root'
})
export class StripePaymentService {

  apiURL = environment.apiURL;
  prefixUrlByCountry: string;
  username: string;
  token: string;
  jwtToken: string;
  header: any;

  paymentProcessor$ = new BehaviorSubject(null);
  paymentMethodsList$ = new BehaviorSubject([]);
  oldPaymentMethodsList$ = new BehaviorSubject([]);
  oldList = [];

  constructor(private httpClient: HttpClient) { }

  /**
   * @name prepareHeadersForHttpRequest
   * @description Prepare headers for all http requests, get token from local storage and put it in header
   */
  prepareHeaderForRequest() {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.username = localStorage.getItem('userName');
    this.header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
  }

  /**
   * @name getPaymentProcessor
   * @description Get the payment processor(Stripe or Netopia) for the active user
   */
  getPaymentProcessor() {
    this.prepareHeaderForRequest();
    const url: string = this.prefixUrlByCountry + this.apiURL + 'api/user/PaymentProcessor';
    return this.httpClient.get(url, { headers: this.header }).subscribe((res: any) => {
      console.log(res);
      if (res.status === 'success') {
        this.paymentProcessor$.next(res.data.processor);
      } else {
        this.paymentProcessor$.next(null);
      }
    });
  }

  /**
   * @name postPaymentIntent
   * @description Post payment intent and receive the secret key for send payment to Stripe, and save the payment method
   * @param paymentDetails
   */
  postPaymentIntent(paymentDetails: any) {
    this.prepareHeaderForRequest();
    const apiUrl: string = this.prefixUrlByCountry + this.apiURL + 'api/Stripe/PaymentIntent';
    return this.httpClient.post(apiUrl, paymentDetails, { headers: this.header });
  }

  /**
   * @name postPaymentIntentForExistingMethod
   * @description Post an intent payment for a existing payment method and receive the secret key to perform the Stripe payment
   * @param productId ID of the product or Order
   * @param product Product types:  Productobjective, Voucher, Donation, ShopCart
   * @param amount Amount ot pay
   * @param paymentMethodId ID of the payment method received from getPaymentMethods
   */
  postPaymentIntentForExistingMethod(paymentData: StripeCardPaymentModel) {
    this.prepareHeaderForRequest();
    const url: string = this.prefixUrlByCountry + this.apiURL + 'api/Stripe/Payments';
    return this.httpClient.post(url, paymentData, {headers: this.header});
  }

  /**
   * @name getPaymentMethods
   * @description Get the payment methods and serve like BehaviorSubject for the whole app
   * @param action update/initialize
   */
  getPaymentMethods(action: string) {
    this.prepareHeaderForRequest();
    const url: string = this.prefixUrlByCountry + this.apiURL + 'api/user/PaymentMethods';
    return this.httpClient.get(url, { headers: this.header })
    .subscribe((res: any) => {
      console.log(res);
      if (res.status === 'success') {
        if (action === 'update') {
          console.log('Update list');
          this.paymentMethodsList$.next(res.data.paymentMethods);
          this.oldPaymentMethodsList$.next(this.oldList);
        } else {
          console.log('Reinitialize list');
          this.paymentMethodsList$.next(res.data.paymentMethods);
          this.oldPaymentMethodsList$.next(res.data.paymentMethods);
          this.oldList = res.data.paymentMethods;
        }
      } else {
        this.paymentMethodsList$.next([]);
        this.oldPaymentMethodsList$.next([]);
      }
    });
  }

  /**
   * @name postNewPaymentMethod
   * @description Get secret key for Stripe used to add a new payment method without a initial payment
   */
  postNewPaymentMethod() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/NewPaymentMethod';
    return this.httpClient.post(url, {}, { headers: this.header });
  }

  /**
   * @name postPaymentMethodName
   * @description Update the name of the payment method
   * @param id
   * @param name
   */
  postPaymentMethodName(id: number, name: string) {
    this.prepareHeaderForRequest();
    const url: string = this.prefixUrlByCountry + this.apiURL + 'api/user/PaymentMethodNames';
    return this.httpClient.post(url, { id, name }, { headers: this.header });
  }

  /**
   * @name removePaymentMethod
   * @description Remove the payment method from Beez and Stripe
   * @param id
   */
  removePaymentMethod(id: number) {
    this.prepareHeaderForRequest();
    const url: string = this.prefixUrlByCountry + this.apiURL + 'api/user/PaymentMethodRemove';
    return this.httpClient.post(url, { id }, { headers: this.header });
  }

}
