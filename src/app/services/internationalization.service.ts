import { Injectable } from '@angular/core';
import { LocaleDataModel } from '../models/localeData.model';
import { Observable, of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map, retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternationalizationService implements TranslateLoader {

  localeData = new LocaleDataModel();

  constructor(
    public http: HttpClient
  ) {}

  getTranslation(lang: string): Observable<any> {
    console.log('Get translation language from API');
    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Access-Control-Allow-Origin', '*' )
        .set('Timeout', '1000')
        .set('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
        .set('Pragma', 'no-cache')
        .set('Expires', '0');
    return this.http.get(`${environment.headlessCmsUrl}api/DataGetter/${lang}/mobile`, { headers }).pipe(
      retry(2),
      catchError(() => {
        if (lang.toUpperCase() === 'RO') {
          return this.http.get('/assets/i18n/ro.json');
        } else {
          return this.http.get('/assets/i18n/en.json');
        }
      }),
      map((response: JSON) => {
          return response;
      })
    );
  }

  initializeCountry(): Observable<any> {
    const country = localStorage.getItem('country');

    switch (country) {
      case 'ro':
        this.localeData.currency = 'RON';
        this.localeData.localeID = 'ro';
        break;
      case 'uk':
        this.localeData.currency = '£';
        this.localeData.localeID = 'en-GB';
        break;
      default:
        this.localeData.currency = 'RON';
        this.localeData.localeID = 'ro';
        localStorage.setItem('country', 'ro');
        break;
    }
    console.log(this.localeData);
    // let data = {currencyType: this.currencyType, currencyText: this.currencyText, localeID: this.localeID};
    return of(this.localeData);
  }
}
