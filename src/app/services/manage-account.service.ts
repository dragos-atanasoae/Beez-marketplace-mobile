import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { Mixpanel } from '@ionic-native/mixpanel/ngx';

@Injectable({
  providedIn: 'root'
})
export class ManageAccountService {

  username: string;
  token: string;
  jwtToken: string;
  baseURL = environment.apiURL;
  prefixUrlByCountry: string;
  header: any;

  manageAccountRequestUrl: string;
  getNotificationsSettingsUrl: string;
  postNotificationsSettingsUrl: string;
  getReferralInfoUrl: string;

  requestAccountResponse: any;
  getSettingsResponse: any;
  saveSettingsResponse: any;
  referralInfo: Observable<any>;
  addPromoCodeError: any;
  addPromoCodeResponse: any;

  constructor(
    private httpClient: HttpClient,
    // private mixpanel: Mixpanel,
  ) {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
  }

  /**
   * @description Prepare the header for all HTTP requests, get the session token, username and country from local storage
   * @param contentType
   */
  prepareHeaderForRequest(contentType: string) {
    this.username = localStorage.getItem('userName');
    this.token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.header = new HttpHeaders()
      .set('Content-Type', contentType)
      .set('Authorization', 'Bearer ' + this.token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
  }

  /**
   * @name manageAccountRequest
   * @description Post the account management requests (delete account, delete all user personal data, request info about personal data stored)
   * @type POST - API request
   * @param requestDescription
   * @param requestType
   */
  manageAccountRequest(requestDescription: string, requestType: string, removeAccountReason?: string) {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    this.manageAccountRequestUrl = this.prefixUrlByCountry + this.baseURL + 'api/notifications/SendRequest?description='
      + requestDescription + '&email=' + this.username + '&type=' + requestType + '&reason=' + removeAccountReason;
    return this.httpClient.post(this.manageAccountRequestUrl, null, { headers: this.header });
  }

  /**
   * @name getNotificationsSettings
   * @description Get all account notifications settings
   * @type GET - API request
   */
  getNotificationsSettings() {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    this.getNotificationsSettingsUrl = this.prefixUrlByCountry + this.baseURL + 'api/notifications/GetSettings?tag=' + this.username;
    return this.httpClient.get(this.getNotificationsSettingsUrl, { headers: this.header });
  }

  /**
   * @name saveNotificationsSettings
   * @description Post the settings/preferences about notifications(in app, sms, email, social media, etc)
   * @type POST - API request
   * @param settingsString
   */
  saveNotificationsSettings(settingsString: string) {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    this.postNotificationsSettingsUrl = this.prefixUrlByCountry + this.baseURL + 'api/notifications/SaveSettings?settings=' + settingsString + '&tag=' + this.username + '&test=1';
    return this.httpClient.post(this.postNotificationsSettingsUrl, null, { headers: this.header });
  }

  /**
   * @name getReferralInfo
   * @description Get details about referral(referral link, numbers of invitations, etc)
   * @type GET - API request
   */
  getReferralInfo(): Observable<any> {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    this.getReferralInfoUrl = this.prefixUrlByCountry + this.baseURL + 'api/InternalOffers/GetReferralInfo?tag=' + this.username;
    return this.referralInfo = this.httpClient.get(this.getReferralInfoUrl, { headers: this.header });
  }

  /**
   * @name addPromoCode
   * @description Add referral promo code to database
   * @type POST - API request
   * @param promoCode
   */
  addPromoCode(promoCode: string) {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    const urlApiPromoCode: string = this.prefixUrlByCountry + this.baseURL + 'api/Promo/RegisterPromoCode?email=' + this.username + '&promoCode=' + promoCode;
    return this.httpClient.post(urlApiPromoCode, null, { headers: this.header });
  }

  /**
   * @name getUserExternalId
   * @description Get user external id from database
   * @type GET - API request
   */
  getUserExternalId() {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    const urlApiUserExternalId = this.prefixUrlByCountry + this.baseURL + 'api/user/ExternalId?tag=' + this.username;
    return this.httpClient.get(urlApiUserExternalId, { headers: this.header });
  }

  /**
   * @name postDeviceToken
   * @description The device token received from firebase is saved to Beez database
   * (the device token is used for push notifications)
   * @type POST - API request
   * @param deviceToken
   */
  postDeviceToken(deviceToken: string) {
    this.prepareHeaderForRequest('application/json');
    const urlApiPostDeviceToken = this.prefixUrlByCountry + this.baseURL + 'api/user/DeviceToken';
    const body = {
      Tag: this.username,
      Token: deviceToken,
      Platform: localStorage.getItem('platform')
    };
    return this.httpClient.post(urlApiPostDeviceToken, body, { headers: this.header });
  }

  /**
   * @name deleteDeviceToken
   * @description Delete the device token from Beez database(the token is used for push notifications)
   * @type POST - API request
   */
  deleteDeviceToken(country: string, deviceToken: string) {
    this.prepareHeaderForRequest('application/json');
    const url = 'https://' + country + this.baseURL + 'api/user/DeleteDeviceToken';
    const body = {
      Tag: this.username,
      Token: deviceToken,
    };
    return this.httpClient.post(url, body, { headers: this.header });
  }

  /**
   * @name getLanguage
   * @description Get the language settings for current user
   * @type GET - API request
   */
  getLanguage() {
    this.prepareHeaderForRequest('application/x-www-form-urlencoded');
    const url = this.prefixUrlByCountry + this.baseURL + 'api/user/GetLanguage?tag=' + this.username;
    return this.httpClient.get(url, { headers: this.header });
  }

  /**
   * @name setLanguage
   * @description Set(POST) the language settings for current user
   * @param language
   * @type POST - API request
   */
  postLanguage(language: string) {
    this.prepareHeaderForRequest('application/json');
    const url = this.prefixUrlByCountry + this.baseURL + 'api/user/SetLanguage';
    const body = {
      Tag: this.username,
      Language: language
    };
    return this.httpClient.post(url, body, { headers: this.header });
  }
}
