import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KycValidationService {

  apiURL = environment.apiURL;
  prefixUrlByCountry: string;
  username: string;
  jwtToken: string;
  header: any;

  isKycValid$ = new BehaviorSubject(false);

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
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', 'Bearer ' + localStorage.getItem('currentUserToken'))
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
  }

  /**
   * @name getStatusKYC
   * @description Get status of Know Your Customer Validation for the current user
   */
  getStatusKYC() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/GetKYCStatus?tag=' + this.username;
    this.httpClient.get(url, { headers: this.header }).subscribe((res: any) => {
      this.isKycValid$.next((res === 'Required' || res === 'Exception') ? false : true);
    });
  }

  /**
   * @name uploadDocumentsForKYC
   * @description Upload documents for KYC Validation
   * @param body Body parameters {tag: string, mugshotFile: string, idCardFile: string}
   */
  uploadDocumentsForKYC(body: any) {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.username = localStorage.getItem('userName');
    this.jwtToken = localStorage.getItem('jwtToken');
    const header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + localStorage.getItem('currentUserToken'))
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/PostKYCRequest';
    return this.httpClient.post(url, body, { headers: header });
  }
}
