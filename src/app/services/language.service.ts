import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LNG_KEY = 'language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  selected = '';

  constructor(private translate: TranslateService) { }

  setInitialAppLanguage() {
    let language = localStorage.getItem(LNG_KEY);
    switch (language) {
      case 'ro':
        this.translate.setDefaultLang('ro');
        this.setLanguage('ro');
        break;
      case 'en':
        this.translate.setDefaultLang('en');
        this.setLanguage('en');
        break;
      default:
        language = this.translate.getBrowserLang();
        if (language === 'ro') {
          this.translate.setDefaultLang(language);
          this.setLanguage('ro');
        } else {
          this.translate.setDefaultLang('en');
          this.setLanguage('en');
        }
        break;
    }
  }

  getLanguages() {
    return [
      { text: 'English', value: 'en', img: 'assets/imgs/en.png' },
      { text: 'Romanian', value: 'ro', img: 'assets/imgs/de.png' },
    ];
  }

  setLanguage(lng: string) {
    this.translate.use(lng);
    this.selected = lng;
    localStorage.setItem(LNG_KEY, lng);
  }
}
