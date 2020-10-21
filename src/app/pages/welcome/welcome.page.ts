import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { GeneralInfoService } from 'src/app/services/general-info.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { LanguageService } from 'src/app/services/language.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InternationalizationService } from 'src/app/services/internationalization.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit, OnDestroy {

  language: string;
  generalInfo: any;
  year = new Date();
  private unsubscribe$: Subject<boolean> = new Subject();
  productFromExternalLink = null;
  localeData: any;

  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private languageService: LanguageService,
    private generalInfoService: GeneralInfoService,
    private ngZone: NgZone,
    private internationalizationService: InternationalizationService,
  ) {
  }

  ngOnInit() {
    this.getDailyGeneralInfo();
    // this.language = localStorage.getItem('language') ? localStorage.getItem('language') : 'ro';
    if (!localStorage.getItem('language')) {
      console.log('No language in localStorage');
      this.language = navigator.language.split('-')[0] === 'ro' ? 'ro' : 'en';
      localStorage.setItem('language', this.language);
      this.translate.use(this.language);
    } else {
      this.language = localStorage.getItem('language');
      this.translate.use(this.language);
    }

    localStorage.setItem('country', 'ro');

    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  ionViewWillEnter() {

  }

  /**
   * @description Initialize language of the app
   */
  setAccountLanguage() {
    this.languageService.setLanguage(this.language);
  }

  /**
   * @Description Get general statistic info about number of users and total value of savings(calculated daily in backend)
   */
  getDailyGeneralInfo() {
    this.generalInfoService.getDailyGeneralInfo().subscribe((res: any) => {
      this.generalInfo = res;
    });
  }

  /**
   * @description Change the display language
   */
  async changeLanguage() {
    const title = this.translate.instant('pages.welcome.languageOptions');
    const btnCancel = this.translate.instant('buttons.buttonCancel');
    const alertChangeLanguage = await this.alertCtrl.create({
      header: title,
      inputs: [
        {
          type: 'radio',
          label: 'English',
          value: 'en',
          checked: localStorage.getItem('language') === 'en'
        },
        {
          type: 'radio',
          label: 'Română',
          value: 'ro',
          checked: localStorage.getItem('language') === 'ro'
        },
      ],
      buttons: [
        {
          text: btnCancel,
          cssClass: 'alert_btn_cancel'
        },
        {
          text: 'OK',
          handler: data => {
            localStorage.setItem('language', data);
            this.language = data;
            this.translate.setDefaultLang(data);
            this.translate.use(this.language);
            console.log(this.language);
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    alertChangeLanguage.present();
  }

}
