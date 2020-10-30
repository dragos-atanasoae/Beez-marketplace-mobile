import { RegisterModel } from './../models/register.model';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginModel } from '../models/login.model';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpResponse, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  baseURL = environment.apiURL;

  Token: any;
  jwtToken: string;
  loginError: string;
  registerResponse: any;
  registerError: string;
  changePasswordResponse: any;
  changePasswordError: any;

  constructor(public httpClient: HttpClient) { }

  /**
   * @name checkIfHasAccountCreated
   * @description Check if user has account created with given email address
   * @param email
   */
  checkIfHasAccountCreated(email: string) {
    const country = localStorage.getItem('country');
    const header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Cache-Control', 'no-cache');
    const apiUrl = 'https://' + country + this.baseURL + 'api/AccountApi/Created?email=' + email;
    return this.httpClient.get(apiUrl, { headers: header });
  }


  /**
   * @name login
   * @description Login user by sending credentials and country
   * @param country
   * @param credentials
   */
  login(country: string, credentials: LoginModel) {
    const loginUrl = 'https://' + country + this.baseURL + 'token';
    const body = {
      email: credentials.username != null || credentials.username !== undefined ? credentials.username : '',
      password: credentials.password != null || credentials.password !== undefined ? credentials.password : '',
      grant_type: 'password'
    };
    const header = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Cache-Control', 'no-cache');

    return this.httpClient.post(loginUrl, ('grant_type=' + body.grant_type + '&username=' + body.email + '&password=' + body.password), { headers: header });
  }

  /**
   * @Name loginHandleError
   * @Param error
   */
  loginHandleError(error: HttpResponse<any>) {
    const errorResponse: any = error;
    console.log(errorResponse.error);
    // tslint:disable-next-line: deprecation
    return Observable.throw(errorResponse.error);
  }

  fastLogin() {
    const country = localStorage.getItem('country');
    const token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    const url = 'https://' + country + this.baseURL + 'api/FastLogin/RequestToken?Tag=' + localStorage.getItem('userName');
    const header = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', 'Bearer ' + token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
    return this.httpClient.get(url, { headers: header });
  }

  /**
   * *** REGISTER REQUEST ***
   * @Param registerData
   */
  register(country: string, registerData: RegisterModel) {
    const registerUrl = 'https://' + country + this.baseURL + 'api/accountext/register';
    const header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Cache-Control', 'no-cache');
    const body = {
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      promoCode: registerData.promoCode,
      isGift: false
    };
    return this.httpClient
      .post(registerUrl, body, { headers: header });
  }

  /**
   * @Name Reset & Recovery Password
   * @Param email
   */
  recoverPassword(country: string, email: string) {
    const resetPasswordUrl = 'https://' + country + this.baseURL + 'api/AccountApi/ForgotPassword';
    const header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Cache-Control', 'no-cache');
    const body = {
      Email: email
    };
    return this.httpClient
      .post(resetPasswordUrl, body, { headers: header });
  }

  /**
   * *** LOGIN/REGISTER with FACEBOOK ***
   * @Param userEmail
   * @Param idProvider
   * @Param emailProvider
   * @Param firstNameProvider
   * @Param lastNameProvider
   * @Param pictureProvider
   * @Param confirmPassword
   * @Param promoCode
   */
  postFacebookLogin(
    country: string,
    userEmail: string,
    idProvider: string,
    emailProvider: string,
    firstNameProvider: string,
    lastNameProvider: string,
    pictureProvider: string,
    confirmPassword: string,
    promoCode: string
  ) {
    const externalLoginUrl = 'https://' + country + this.baseURL + 'api/AccountApi/AccountExternalLogin';
    const header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    const body = 'loginProvider=Facebook'
      + '&idProvider=' + idProvider
      + '&emailProvider=' + emailProvider
      + '&userEmail=' + userEmail
      + '&firstNameProvider=' + firstNameProvider
      + '&lastNameProvider=' + lastNameProvider
      + '&pictureProvider=' + pictureProvider
      + '&promoCode=' + promoCode
      + '&confirmPassword=' + confirmPassword;

    return this.httpClient
      .post(externalLoginUrl, body, { headers: header });
  }

  /**
   * *** FACEBOOK ACCOUNT LINKING ***
   * @Param userEmail
   * @Param idProvider
   * @Param emailProvider
   * @Param firstNameProvider
   * @Param lastNameProvider
   * @Param pictureProvider
   * @Param confirmPassword
   * @Param promoCode
   */
  postFacebookLink(
    userEmail: string,
    idProvider: string,
    emailProvider: string,
    firstNameProvider: string,
    lastNameProvider: string,
    pictureProvider: string,
    confirmPassword: string,
    promoCode: string
  ) {
    const linkToAccountUrl = 'https://' + localStorage.getItem('country') + this.baseURL + 'api/AccountApi/AccountExternalLinkToAccount';
    const header = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    const body = 'loginProvider=Facebook'
      + '&idProvider=' + idProvider
      + '&emailProvider=' + emailProvider
      + '&userEmail=' + userEmail
      + '&firstNameProvider=' + firstNameProvider
      + '&lastNameProvider=' + lastNameProvider
      + '&pictureProvider=' + pictureProvider
      + '&promoCode=' + promoCode
      + '&confirmPassword=' + confirmPassword;

    // console.log(body);
    return this.httpClient
      .post(linkToAccountUrl, body, { headers: header });
  }

  /**
   * *** GET PROFILE INFO ***
   * Get Facebook profile data from Beez database for account linked
   * @Param userEmail
   */
  getLinkedProfileInfo(userEmail: string) {
    const country = localStorage.getItem('country');
    const getProfileInfoUrl = 'https://' + country + this.baseURL + 'api/AccountApi/GetCurrentExternalAssociation?tag=';
    const token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    const header = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', 'Bearer ' + token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');

    return this.httpClient
      .get(getProfileInfoUrl + userEmail, { headers: header });
  }
}
