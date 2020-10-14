import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiURL = environment.apiURL;
  prefixUrlByCountry: string;
  username: string;
  token: string;
  jwtToken: string;
  header: any;
  phoneVerificationIsRequired$ = new BehaviorSubject(false);

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
   * @name getProfileInfo
   * @description Get all profile informations for given user
   */
  getProfileInfo() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/ProfileInfo';
    return this.httpClient.get(url + '?tag=' + this.username, { headers: this.header });
  }

  /**
   * @description Get the history of the Selected FoodMarketplace locations
   */
  getUserProfileLocations() {
    this.prepareHeaderForRequest();
    const apiUrl = this.prefixUrlByCountry + this.apiURL + 'api/UserProfileLocations';
    return this.httpClient.get(apiUrl, {headers: this.header});
  }

  /**
   * @description Post new foodmarketplace location to history
   * @param cityId
   * @param label
   */
  postUserProfileLocations(cityId: number, label: string) {
    const apiUrl = this.prefixUrlByCountry + this.apiURL + 'api/UserProfileLocations';
    const body = {
      cityId,
      locationLabel: label
    };
    return this.httpClient.post(apiUrl, body, {headers: this.header});
  }

  /**
   * @description Delete location from foodmarketplace locations history
   * @param cityId
   */
  deleteSelectedCity(cityId: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/UserProfileLocations?id=' + cityId;
    return this.httpClient.delete(url, {headers: this.header});
  }

  /**
   * @description Get the current version of the mobile app registered in database
   * @param platform - expected values: android | ios | huawei
   */
  getCurrentVersion(platform: string) {
    this.prepareHeaderForRequest();
    // this.header = new HttpHeaders()
    //   .set('Content-Type', 'application/json')
    //   .set('Authorization', 'Bearer ' + this.token)
    //   .set('X-Token', this.jwtToken)
    //   .set('Cache-Control', 'no-cache');
    const url = 'https://ro' + this.apiURL + 'api/mobile/CurrentVersion?platform=' + platform;
    return this.httpClient.get(url, {headers: this.header});
  }

  getCanUsePayLater() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + '/api/user/CanUsePayLater';
    return this.httpClient.get(url, {headers: this.header});
  }

  /**
   * @name getPhoneVerificationStatus
   * @description check if the user has the validated phone number
   */
  getPhoneVerificationStatus() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/PhoneNumber/IsVerified?tag=';
    this.httpClient.get(url + this.username, { headers: this.header }).subscribe((res: any) => {
      this.phoneVerificationIsRequired$.next(res === 'NumberIsVerified' ? false : true);
    });
  }

  /**
   * @name VerifyNumber
   * @description send the number to be checked
   * @param phoneNumber
   */
  verifyPhoneNumber(phoneNumber: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/PhoneNumber/VerifyNumber?tag=';
    return this.httpClient.post(url + this.username + '&phoneNumber=' + phoneNumber.toString(), {}, { headers: this.header });
  }

  /**
   * @name verifyConfirmationCode
   * @description send the code to be verified and to validate account/phone number
   * @param validationCode
   */
  verifyConfirmationCode(validationCode: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/PhoneNumber/VerifyCode?tag=' + this.username + '&code=' + validationCode;
    return this.httpClient.post(url, {}, { headers: this.header });
  }
}
