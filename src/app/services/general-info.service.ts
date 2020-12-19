import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class GeneralInfoService {

  apiURL = environment.apiURL;
  prefixUrlByCountry: string;
  username: string;
  token: string;
  jwtToken: string;
  header: any;

  constructor( private httpClient: HttpClient) { }

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
   * @description Get General info for welcome page
   */
  getDailyGeneralInfo() {
    const dailyGeneralInfoUrl = 'https://ro' + this.apiURL + 'api/Utils/GeneralInfoPanelStatic';
    return this.httpClient.get(dailyGeneralInfoUrl);
  }

  /**
   * @name getSlidesInfo
   * @description Get slides data to show on the home tab
   */
  getSlidesInfo() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/DisplayCards?tag=' + this.username;
    return this.httpClient.get(url, { headers: this.header });
  }

  /**
   * @name markAsSeenOrClosed
   * @description Mark slide from carousel as seen or closed
   * @param body
   */
  markAsSeenOrClosed(body: any) {
    body.tag = this.username;
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/DisplayCards';
    return this.httpClient.post(url, body, { headers: this.header });
  }
}
