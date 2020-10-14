import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class GeneralInfoService {

  apiURL = environment.apiURL;

  constructor( private httpClient: HttpClient) { }

  getDailyGeneralInfo() {
    const dailyGeneralInfoUrl = 'https://ro' + this.apiURL + 'api/Utils/GeneralInfoPanelStatic';
    return this.httpClient.get(dailyGeneralInfoUrl);
  }
}
