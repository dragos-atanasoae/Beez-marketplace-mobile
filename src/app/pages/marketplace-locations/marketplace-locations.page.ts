import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { Platform, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { DeliveryAddressService } from 'src/app/services/delivery-address.service';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-marketplace-locations',
  templateUrl: './marketplace-locations.page.html',
  styleUrls: ['./marketplace-locations.page.scss'],
})
export class MarketplaceLocationsPage implements OnInit {
  @ViewChild('addressSuggestionsElement') addressSuggestionsElement: ElementRef;
  country = localStorage.getItem('country');
  language = localStorage.getItem('language');
  referralCode = localStorage.getItem('referralCode');
  token = localStorage.getItem('currentUserToken');
  eventContext = 'Marketplace locations page';
  isKeyboardActive = false;
  localeData = new LocaleDataModel();
  showAddressInput = false;
  listOfCities = [];
  listOfCounties = [];
  selectedCounty = null;
  selectedCity = null;
  selectedLocation: any;
  locationsHistory = [];
  county: FormControl;
  city: FormControl;
  validationMessages = {
    county: [
      { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredCounty') },
    ],
    city: [
      { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredCity') },
    ]
  };
  keywordCity = 'name';

  constructor(
    private platform: Platform,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router,
    private loadingService: LoadingService,
    public deliveryAddressService: DeliveryAddressService,
    private userService: UserService,
    private internationalizationService: InternationalizationService,
    private analyticsService: AnalyticsService,
    private ngZone: NgZone
  ) {
    this.county = new FormControl('', Validators.required);
    this.city = new FormControl('', Validators.required);
    // Listen for show/hide keyboard to hide the slide navigation buttons
    if (!this.platform.is('desktop')) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.ngZone.run(() => {
          this.isKeyboardActive = true;
          setTimeout(() => {
            this.addressSuggestionsElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        });
      });
      Keyboard.addListener('keyboardDidHide', () => {
        this.ngZone.run(() => {
          this.isKeyboardActive = false;
        });
      });
    }
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
    if (this.token) {
      this.getLocationsHistory();
    }
  }

  async openMarketplace() {
    localStorage.setItem('county', JSON.stringify(this.selectedCounty));
    localStorage.setItem('city', JSON.stringify(this.selectedCity));
    this.modalCtrl.dismiss('select');
  }

  closeModal() {
    if (localStorage.getItem('county') === null || localStorage.getItem('city') === null) {
      console.log('No selection for location');
      this.modalCtrl.dismiss('noSelection');
    } else {
      this.modalCtrl.dismiss('cancel');
    }
  }

  selectLocations(location: any) {
    this.selectedCounty = {
      Id: location.county.id,
      Name: location.county.name
    };
    this.selectedCity = {
      Id: location.city.id,
      Name: location.city.name
    };
    this.selectedLocation = location;
    this.showAddressInput = false;
  }

  /**
   * @name onChangeSearchCities
   * @description Get autocomplete cities for given keyword
   * @param value searched value
   */
  onChangeSearchCities(value: string) {
    if (value && value.length >= 3) {
      this.deliveryAddressService.getAutocompleteCities(value)
        .subscribe((res: any) => {
          this.listOfCities = res.suggestions;
        });
    }
  }

  getLocationsHistory() {
    this.loadingService.presentLoading();
    this.userService.getUserProfileLocations()
      .subscribe((res: any) => {
        console.log(res);
        this.locationsHistory = res.locations.reverse();
        console.log(this.locationsHistory);
        this.loadingService.dismissLoading();
      });
  }

  postSelectedCity(city: any) {
    console.log(city.name + ', ' + 'Romania', city);
    const label = city.name + ', ' + 'Romania';
    if (this.token) {
      this.userService.postUserProfileLocations(city.id, label)
        .subscribe((res: any) => {
          if (res.status === 'success') {
            this.getLocationsHistory();
            this.selectLocations(res.userProfileLocation);
          } else if (res.status === 'error') {
            this.showAddressInput = false;
            this.presentToast(res.message);
          }
          console.log(res);
        });
    } else {
      this.selectedCounty = this.deliveryAddressService.listOfCounties.find((county: any) => county.Id === city.countyId);
      console.log(this.selectedCounty);
      this.selectedCity = {Id: city.id, Name: city.name.split(' (')[0]};
    }
  }

  confirmLocation() {
    if (this.selectedCounty !== null && this.selectedCity !== null) {
      const eventParams = { context: this.eventContext };
      this.analyticsService.logEvent('confirm_location', eventParams);
      this.openMarketplace();
    }
  }

  deleteSelectedCity(cityId) {
    this.userService.deleteSelectedCity(cityId)
      .subscribe((res: any) => {
        console.log(res);
        this.getLocationsHistory();
      });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          handler: () => this.toastCtrl.dismiss()
        }
      ],
      cssClass: 'custom_toast'
    });
    toast.present();
  }

  /**
   * @name presentLoading
   * @param message
   */
  async presentLoading() {
    this.loadingService.presentLoading();
    setTimeout(() => {
      this.loadingService.dismissLoading();
    }, 1000);
  }
}
