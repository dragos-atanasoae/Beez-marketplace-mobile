import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DeliveryAddressService {

  token: string;
  jwtToken: string;
  username: string;
  prefixUrlByCountry: string;
  headers: any;
  guestHeader: any;
  apiURL = environment.apiURL;

  public listOfCounties = [
    { Id: 3, Name: 'Alba' }, { Id: 4, Name: 'Arad' }, { Id: 5, Name: 'Arges' }, { Id: 6, Name: 'Bacau' }, { Id: 7, Name: 'Bihor' },
    { Id: 8, Name: 'Bistrita-Nasaud' }, { Id: 9, Name: 'Botosani' }, { Id: 10, Name: 'Braila' }, { Id: 11, Name: 'Brasov' },
    { Id: 12, Name: 'Bucuresti' }, { Id: 13, Name: 'Buzau' }, { Id: 14, Name: 'Calarasi' }, { Id: 15, Name: 'Caras-Severin' },
    { Id: 16, Name: 'Cluj' }, { Id: 17, Name: 'Constanta' }, { Id: 18, Name: 'Covasna' }, { Id: 19, Name: 'Dambovita' },
    { Id: 20, Name: 'Dolj' }, { Id: 21, Name: 'Galati' }, { Id: 22, Name: 'Giurgiu' }, { Id: 23, Name: 'Gorj' }, { Id: 24, Name: 'Harghita' },
    { Id: 25, Name: 'Hunedoara' }, { Id: 26, Name: 'Ialomita' }, { Id: 27, Name: 'Iasi' }, { Id: 28, Name: 'Ilfov' },
    { Id: 29, Name: 'Maramures' }, { Id: 30, Name: 'Mehedinti' }, { Id: 31, Name: 'Mures' }, { Id: 32, Name: 'Neamt' },
    { Id: 33, Name: 'Olt' }, { Id: 34, Name: 'Prahova' }, { Id: 35, Name: 'Salaj' }, { Id: 36, Name: 'Satu Mare' },
    { Id: 37, Name: 'Sibiu' }, { Id: 38, Name: 'Suceava' }, { Id: 39, Name: 'Teleorman' }, { Id: 40, Name: 'Timis' },
    { Id: 41, Name: 'Tulcea' }, { Id: 42, Name: 'Valcea' }, { Id: 43, Name: 'Vaslui' }, { Id: 44, Name: 'Vrancea' }];

  constructor(public httpClient: HttpClient) { }

  /**
   * @name prepareHeadersForRequest
   * @description Get dat from local storage an prepare header for Http requests
   */
  prepareHeaderForRequest() {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.username = localStorage.getItem('userName');
    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');

    this.guestHeader = new HttpHeaders().set('Content-Type', 'application/json').set('Cache-Control', 'no-cache');
  }

  /**
   * @name getListOfCounties
   * @description Get list of counties for selected country
   * @param country
   */
  getListOfCounties(country: string, isMarketplace?: boolean, selectedCityId?: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/administrativeregions?country=' + country + '&county=' + '&area=' + isMarketplace + '&preselectedCityId=' + selectedCityId;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getListOfCities
   * @description Get list of all cities for selected county
   * @param country
   * @param county
   */
  getListOfCities(country: string, county: string, isMarketplace?: boolean, selectedCityId?: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/administrativeregions?country=' + country + '&county=' + county + '&area=' + isMarketplace + '&preselectedCityId=' + selectedCityId;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getDeliveryAddress
   * @description Get the delivery address for current user
   */
  getDeliveryAddress() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/getdeliveryaddress?tag=' + this.username;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getListOfDeliveryAddresses
   * @description Get the list of delivery addresses for current user
   * @param isMarketplace
   * @param selectedCity used for filter delivery addresess
   */
  getListOfDeliveryAddresses(isMarketplace?: boolean, selectedCity?: number, vendorId?: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/DeliveryAddresses?tag=' + this.username + '&area=' + isMarketplace
      + '&preselectedCityId=' + selectedCity + '&vendorId=' + vendorId;
    return this.httpClient.get(url, { headers: this.headers });
  }

  /**
   * @name getAutocompleteCities
   * @param keyword is mandatory and it's the text from the user interface input
   * @param countyId is optional, do not use it unless is necesarry  (you can use it if the ui has
   * a dropdown for selecting the county)
   */
  getAutocompleteCities(keyword: string, countyId?: number) {
    this.prepareHeaderForRequest();
    let apiUrl = this.prefixUrlByCountry + this.apiURL + 'api/AutocompleteAddress/Cities?keyword=' + keyword;
    if (countyId) {
      apiUrl += '&countyId=' + countyId;
    }
    return this.httpClient.get(apiUrl, { headers: this.token ? this.headers : this.guestHeader });
  }

  /**
   * @name getAutocompleteStreets
   * @param keyword is mandatory and it's the text from the user interface input
   * @param cityId  is mandatory and it's the id of the selected city
   */
  getAutocompleteStreets(keyword: string, cityId: number) {
    const apiUrl = this.prefixUrlByCountry + this.apiURL + 'api/AutocompleteAddress/Streets?keyword=' + keyword + '&cityId=' + cityId;
    return this.httpClient.get(apiUrl, { headers: this.headers });
  }

  fiscalNumberValidation(fiscalNumber: string) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/BeezPayActions/CuiValidation';
    return this.httpClient.post(url, { Cui: fiscalNumber }, { headers: this.headers });
  }

  addDeliveryAddress(deliveryAddress: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/DeliveryAddresses';
    deliveryAddress.Tag = this.username;
    return this.httpClient.post(url, deliveryAddress, { headers: this.headers });
  }

  updateDeliveryAddress(deliveryAddress: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/DeliveryAddresses';
    deliveryAddress.Tag = this.username;
    return this.httpClient.put(url, deliveryAddress, { headers: this.headers });
  }

  /**
   * @description Send POST request to delete selected address. Expected parameters in body: Id(id of the address) and Tag(user email)
   * @param data
   */
  deleteDeliveryAddress(data: any) {
    this.prepareHeaderForRequest();
    const options: any = {
      header: this.headers,
      body: data
    };
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/DeliveryAddresses';
    return this.httpClient.request('delete', url, { headers: this.headers, body: data });
  }

  /**
   * @name postDeliveryAddress
   * @description Save to database the delivery address for current user
   * @param deliveryAddress
   */
  postDeliveryAddress(deliveryAddress: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/setdeliveryaddress';
    deliveryAddress.Tag = this.username;
    return this.httpClient.post(url, deliveryAddress, { headers: this.headers });
  }

  updateContactAddress(contactAddress: any) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/ContactAddress';
    return this.httpClient.post(url, contactAddress, { headers: this.headers });
  }
}
