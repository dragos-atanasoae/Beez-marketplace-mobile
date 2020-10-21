import { AnalyticsService } from './../../services/analytics.service';
import { Component, OnInit, ViewChild, Input, NgZone, OnDestroy } from '@angular/core';
import { NavParams, ModalController, ToastController, Platform } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DeliveryAddressService } from 'src/app/services/delivery-address.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

const { Keyboard } = Plugins;

declare var google;
@Component({
  selector: 'app-edit-delivery-address',
  templateUrl: './edit-delivery-address.page.html',
  styleUrls: ['./edit-delivery-address.page.scss'],
})
export class EditDeliveryAddressPage implements OnInit, OnDestroy {

  @ViewChild(IonicSelectableComponent) selectCityComponent: IonicSelectableComponent;
  @Input() context: string;
  @Input() donationContext: boolean;
  @Input() selectedAddress: any;
  @Input() isMarketplace = false;
  @Input() county: any;
  @Input() city: any;
  country: string;
  private unsubscribe$: Subject<boolean> = new Subject();
  phoneVerificationRequired = false;
  phoneNumber = null;

  deliveryAddressForm: FormGroup;
  submitted = false;
  validationMessages: any;
  countries = [
    { name: 'Romania' },
    { name: 'United Kingdom' }
  ];
  listOfCounties = [];
  listOfCities: any = [];
  eventContext = 'Edit Delivery Address';
  fiscalNumberError = '';

  autocompleteAddress = { addressExtended: '' };
  extendedGoogleAddress: string = null;

  isKeyboardActive = false;
  sectionPersonalDetailsIsLocked = true;
  hideButtonConfirmChanges = false;

  autocompleteCities: any;
  selectedCityId: any;
  autocompleteStreets: any;
  selectedStreetId: any;
  keywordCity = 'name';
  keywordStreet = 'name';


  constructor(
    public platform: Platform,
    public zone: NgZone,
    private modalCtrl: ModalController,
    public toastCtrl: ToastController,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private analyticsService: AnalyticsService,
    private deliveryAddressService: DeliveryAddressService,
    private translate: TranslateService,
    private userService: UserService,
  ) {
    this.country = localStorage.getItem('country');
    this.validationMessages = {
      Name: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredName') }
      ],
      Surname: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredSurname') }
      ],
      Email: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredEmail') },
        { type: 'email', message: this.translate.instant('pages.editAddress.validationMessages.patternEmail') }
      ],
      PhoneNumber: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredPhoneNumber') },
        { type: 'minlength', message: this.translate.instant('pages.editAddress.validationMessages.minLengthPhoneNumber') },
      ],
      Address: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredAddress') },
        { type: 'minlength', message: this.translate.instant('pages.editAddress.validationMessages.validAddress') },
      ],
      Country: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredCountry') },
      ],
      County: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredCounty') },
      ],
      City: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredCity') },
      ],
      AddressZip: [
        { type: 'required', message: this.translate.instant('pages.editAddress.validationMessages.requiredPostalCode') },
      ]
    };
  }

  ngOnInit() {
    console.log('Context: ' + this.context, 'Selected address: ', this.selectedAddress);
    this.userService.getPhoneVerificationStatus();
    this.getPhoneValidationStatus();
    this.deliveryAddressForm = this.formBuilder.group({
      Name: ['', Validators.required],
      Surname: ['', Validators.required],
      Email: [localStorage.getItem('userName'), [Validators.required, Validators.email]],
      PhoneNumber: ['', [Validators.minLength(10)]],
      Country: [this.country === 'ro' ? 'Romania' : 'United Kingdom', Validators.required],
      County: [''],
      City: ['', this.country === 'ro' ? Validators.required : []],
      Address: ['', Validators.required],
      AddressZip: ['', this.country === 'uk' ? Validators.required : []],
      ContactInfo: [''],
      ForBusiness: [false],
      FiscalNumber: [''],
      StreetId: 0,
      CityId: 0,
    });
    this.listOfCounties = this.deliveryAddressService.listOfCounties;
    if (this.context === 'add') {
      this.getUserInformation();
    } else {
      this.setFormValues();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  ionViewWillEnter() {
    // Listen for show/hide keyboard to hide the slide navigation buttons
    if (!this.platform.is('desktop')) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.zone.run(() => {
          this.isKeyboardActive = true;
          console.log('Keyboard will show', this.isKeyboardActive);
        });
      });

      Keyboard.addListener('keyboardDidHide', () => {
        this.zone.run(() => {
          this.isKeyboardActive = false;
          console.log('Keyboard did hide', this.isKeyboardActive);
        });
      });
    }
  }

  getPhoneValidationStatus() {
    this.userService.phoneVerificationIsRequired$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => {
      console.log('Phone validation required: ', res);
      this.phoneVerificationRequired = res;
    });
  }

  /**
   * @description Set form values with selected option from Fan Courier API
   * @ame onSelectOption
   * @param obj city or street
   * @param type 'city' || 'street'
   */
  onSelectOption(obj: any, type: string) {
    console.log(obj, ' ', type);
    switch (type) {
      case 'city':
        this.selectedCityId = obj.id;
        this.deliveryAddressForm.patchValue({
          City: obj.name,
          CityId: obj.id,
          Address: ''
        });
        break;
      case 'street':
        this.selectedStreetId = obj.id;
        this.deliveryAddressForm.patchValue({
          Address: this.trimStreet(obj.name),
          StreetId: obj.id
        });
        break;
      default:
        break;
    }
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
          this.autocompleteCities = res.suggestions;
        });
    }
  }

  /**
   * @name onChangeSearchStreet
   * @description Get autocomplete streets for given keyword
   * @param value searched value
   */
  onChangeSearchStreet(value: string) {
    console.log(this.selectedCityId);
    if (value && value.length >= 3 && this.selectedCityId) {
      this.deliveryAddressService.getAutocompleteStreets(value, this.selectedCityId)
        .subscribe((res: any) => {
          this.autocompleteStreets = res.suggestions;
        });
    }
  }

  closeCityAutocomplete(event) {
    console.log(event);
    const address = this.deliveryAddressForm.value;
    if (this.selectedCityId && address.City.name) {
      this.deliveryAddressForm.patchValue({ City: address.City.name });
    } else {
      this.deliveryAddressForm.controls.City.reset();
      this.deliveryAddressForm.controls.City.markAsTouched();
    }
  }

  closeSteetAutocomplete(event) {
    console.log(event);
    const address = this.deliveryAddressForm.value;
    if (this.selectedStreetId && address.Address.name) {
      this.deliveryAddressForm.patchValue({ Address: this.trimStreet(address.Address.name) });
    } else {
      this.deliveryAddressForm.controls.Address.reset();
      this.deliveryAddressForm.controls.Address.markAsTouched();
    }
  }

  /**
   * @name onClearOption
   * @description reeset from values on clear selected option
   */
  onClearOption() {
    this.deliveryAddressForm.patchValue({
      Address: null,
      CityId: null,
      StreetId: null
    });
    console.log(this.deliveryAddressForm.value);
  }

  /**
   * @name trimStreet
   * @description Remove unnecessary details from street
   * $"{a.Type} {a.Name} (de la {a.FromNumber} la {a.ToNumber}, {a.PostalCode})"
   * @param s
   */
  trimStreet(s: string) {
    return s.slice(0, s.indexOf('(de la')) + s.slice(s.indexOf(')') + 1);
  }

  /**
   * @name getUserInformation
   * @description Get all information about user like contact address, delivery address, isVip etc
   */
  getUserInformation() {
    this.userService.getProfileInfo()
      .subscribe((response: any) => {
        console.log(response);
        if (response.status === 'succes') {
          const contactAddress = response.data.ContactAddress;
          console.log('CONTACT ADDRESS: ', contactAddress);
          this.selectedCityId = contactAddress.CityId;
          console.log('SELECTED CITY ID CONTACT: ', this.selectedCityId);
          this.deliveryAddressForm.patchValue({
            Name: contactAddress.Name,
            Surname: contactAddress.Surname,
            Email: localStorage.getItem('userName'),
            PhoneNumber: contactAddress.PhoneNumber,
            StreetId: contactAddress.StreetId,
            CityId: contactAddress.CityId,
          });
          this.phoneNumber = contactAddress.PhoneNumber;
          if (contactAddress.Name && contactAddress.Surname && contactAddress.PhoneNumber) {
            this.sectionPersonalDetailsIsLocked = true;
          } else {
            this.sectionPersonalDetailsIsLocked = false;
            this.hideButtonConfirmChanges = true;
          }
        } else {
          this.sectionPersonalDetailsIsLocked = false;
        }
      }, error => console.log('Could not load profile information.'));
  }

  portChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
  }

  setFormValues() {
    console.log(this.selectedAddress);
    this.extendedGoogleAddress = this.selectedAddress.AddressExtended;
    this.autocompleteAddress.addressExtended = this.selectedAddress.AddressExtended;
    this.deliveryAddressForm.patchValue({
      Name: this.selectedAddress.Name,
      Surname: this.selectedAddress.Surname,
      Email: this.selectedAddress.Email,
      PhoneNumber: this.selectedAddress.PhoneNumber,
      Country: this.selectedAddress.Country,
      County: this.selectedAddress.County,
      City: this.selectedAddress.City,
      Address: this.selectedAddress.Address,
      AddressZip: this.selectedAddress.AddressZip,
      ContactInfo: this.selectedAddress.ContactInfo,
      ForBusiness: this.selectedAddress.ForBusiness,
      FiscalNumber: this.selectedAddress.FiscalNumber,
      StreetId: this.selectedAddress.StreetId,
      CityId: this.selectedAddress.IdCity,
    });
    this.phoneNumber = this.selectedAddress.PhoneNumber;
    if (this.context !== 'editContactAddress') {
      this.selectedCityId = this.selectedAddress.IdCity;
    } else {
      this.deliveryAddressForm.controls.Email.setValue(localStorage.getItem('userName'));
      if (!this.selectedAddress.PhoneNumber || !this.selectedAddress.Name || !this.selectedAddress.Surname) {
        this.sectionPersonalDetailsIsLocked = false;
        this.hideButtonConfirmChanges = true;
      }
      this.selectedCityId = this.selectedAddress.CityId;
    }
    console.log(this.selectedCityId);
  }

  getListOfCounties() {
    this.deliveryAddressService.getListOfCounties('Romania', this.isMarketplace,
      this.city !== undefined ? this.city.Id : null).subscribe(response => {
        const res: any = response;
        this.listOfCounties = res.countiesList;
        console.log(this.listOfCounties);
        this.getListOfCities('Romania', this.county.Name);
      });
  }

  getListOfCities(country: string, county: string) {
    this.loadingService.presentLoading();
    this.deliveryAddressService
      .getListOfCities(country, county, this.isMarketplace,
        this.city !== undefined ? this.city.Id : null).subscribe((response: any) => {
          console.log(response);
          this.loadingService.dismissLoading();
          if (response.citiesList !== null) {
            this.listOfCities = response.citiesList;
            // @Deprecated - used to open automatically the component select city
            // setTimeout(() => {
            //   this.selectCityComponent.open().then(() => { });
            // }, 200);
          }

        }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name fiscalNumberValidation
   * @description Api call to validate fiscal number (ANAF)
   */
  fiscalNumberValidation() {
    const address: any = this.deliveryAddressForm.value;
    if (this.country === 'ro') {
      if (this.selectedStreetId && address.Address.name) {
        address.Address = this.trimStreet(address.Address.name);
      }
      // ro context does not have google suggestions
      address.AddressExtended = '';
    } else {
      address.AddressExtended = this.autocompleteAddress.addressExtended;
    }
    console.log(address);
    if (address.FiscalNumber) {
      this.deliveryAddressService.fiscalNumberValidation(this.deliveryAddressForm.value.FiscalNumber)
        .subscribe((res: any) => {
          if (!res.validCui) {
            this.fiscalNumberError = this.translate.instant('pages.editAddress.fiscalNumberError');
          } else {
            address.ForBusiness = true;
            this.saveAddress(address);
            this.fiscalNumberError = '';
          }
        });
    } else {
      address.ForBusiness = false;
      this.saveAddress(address);
    }
  }

  saveAddress(address: any) {
    switch (this.context) {
      case 'add':
        this.addAddress(address);
        break;
      case 'edit':
        this.editDeliveryAddress(address);
        break;
      case 'editContactAddress':
        this.editContactAddress(address);
        break;
    }
  }

  addAddress(address) {
    this.loadingService.presentLoading();
    this.deliveryAddressService.addDeliveryAddress(address).
      subscribe((res: any) => {
        this.loadingService.dismissLoading();
        if (res.status === 'success') {
          this.closeModal('add');
          this.logAnalyticsEvents('successfully_added_address');
          if (this.isMarketplace) {
            if (address.City.toLowerCase().indexOf(this.city.Name.toLowerCase()) >= 0) {
              this.presentToast(this.translate.instant('pages.editAddress.toastMessages.onAddSuccess'));
            } else {
              this.presentToast(this.translate.instant('pages.editAddress.toastMessages.onAddErrorFoodMarketplace'));
            }
          } else {
            this.presentToast(this.translate.instant('pages.editAddress.toastMessages.onAddSuccess'));
          }
        } else {
          this.presentToast(res.userMessage);
        }
      }, () => this.loadingService.dismissLoading());
  }

  editDeliveryAddress(address) {
    this.loadingService.presentLoading();
    address.Id = this.selectedAddress.Id;
    console.log('EDIT ADDRESS: ', address);

    this.deliveryAddressService.updateDeliveryAddress(address)
      .subscribe((response: any) => {
        this.loadingService.dismissLoading();
        if (response.status === 'success') {
          this.closeModal('edit');
          this.logAnalyticsEvents('successfully_changed_address');
          this.presentToast(this.translate.instant('pages.editAddress.toastMessages.onEditSuccess'));
        } else {
          this.presentToast(response.userMessage);
        }
      }, () => this.loadingService.dismissLoading());
  }

  editContactAddress(address) {
    this.loadingService.presentLoading();
    address.Tag = localStorage.getItem('userName');
    this.deliveryAddressService.updateContactAddress(address)
      .subscribe((response: any) => {
        this.loadingService.dismissLoading();
        if (response.status === 'success') {
          this.closeModal('edit');
          this.presentToast(response.userMessage);
          this.logAnalyticsEvents('successfully_changed_address');
        } else {
          this.presentToast(response.userMessage);
        }
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name receiveEventPhoneIsVerififed
   * @description Receive verified phone number and update phoneVerificationRequired value
   * @param $event
   */
  receiveEventPhoneIsVerififed($event: any) {
    console.log($event);
    this.deliveryAddressForm.controls.PhoneNumber.enable();
    this.deliveryAddressForm.controls.PhoneNumber.setValue($event);
    // this.deliveryAddressForm.controls.PhoneNumber.disable();
    this.deliveryAddressForm.controls.PhoneNumber.updateValueAndValidity();
    this.phoneVerificationRequired = false;
    this.userService.getPhoneVerificationStatus();
  }
  /*
  * @name logAnalyticsEvents
  * @param eventName
  */
  logAnalyticsEvents(eventName: string) {
    const eventParams = { context: this.eventContext };
    this.analyticsService.logEvent(eventName, eventParams);
  }

  async closeModal(action: string) {
    this.modalCtrl.dismiss(action);
  }

  sendAddressToAddCard() {
    if (this.context === 'addCard') {
      this.modalCtrl.dismiss(this.deliveryAddressForm.value);
    }
  }

  /**
   * @name presentToast
   * @description Show toast message
   * @param message
   */
  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ],
      position: 'bottom',
      duration: 5000,
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

  /**
   * *** GOOGLE MAPS PLACES - AUTOCOMPLETE ***
   */
  /**
   * @description Get address sugestions from Google Places API
   * @param address
   */
  getAddress(address: any) {
    console.log('Address prepared for form', address);
    this.autocompleteAddress = address;
    const street: string = (address.street !== undefined ? address.street : '') + ' ' + (address.streetNumber !== undefined ? address.streetNumber : '');
    this.deliveryAddressForm.patchValue({
      Address: street,
      County: address.county !== undefined ? address.county : '',
      City: address.locality !== undefined ? address.locality : '',
      AddressZip: address.postCode !== undefined ? address.postCode : ''
    });
    console.log(this.deliveryAddressForm.value);
  }

}
