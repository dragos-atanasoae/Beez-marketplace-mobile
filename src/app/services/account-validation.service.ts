import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountValidationService {
  apiURL = environment.apiURL;
  prefixUrlByCountry: string;
  username: string;
  header: any;
  jwtToken: any;


  constructor(private httpClient: HttpClient) { }

  /**
   * @name prepareHeadersForHttpRequest
   * @description Prepare headers for all http requests, get token from local storage and put it in header
   */
  prepareHeaderForRequest() {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.username = localStorage.getItem('userName');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + localStorage.getItem('currentUserToken'))
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
  }

  /**
   * @name isVerified
   * @description check if the user has the validated phone number
   */
  isVerified() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/PhoneNumber/IsVerified?tag=';
    return this.httpClient.get(url + this.username, { headers: this.header });
  }

  /**
   * @name VerifyNumber
   * @description send the number to be checked
   * @param phoneNumber
   */
  verifyNumber(phoneNumber: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/PhoneNumber/VerifyNumber?tag=';
    return this.httpClient.post(url + this.username + '&phoneNumber=' + phoneNumber.replace('+', '%2B'), {}, { headers: this.header });
  }

  /**
   * @name verifyCode
   * @description send the code to be verified and to validate account/phone number
   * @param validationCode
   * @param phoneNumber
   */
  verifyCode(validationCode: string, phoneNumber: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/PhoneNumber/VerifyCode?tag=' + this.username + '&code=' + validationCode + '&phoneNumber=' + phoneNumber.replace('+', '%2B');
    return this.httpClient.post(url, {}, { headers: this.header });
  }
}
