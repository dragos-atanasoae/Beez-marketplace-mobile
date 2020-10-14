import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private username: any;
  private token: any;
  private jwtToken: string;
  private apiURL = environment.apiURL;
  private prefixUrlByCountry: string;

  data: any;
  available: any;
  aproved: any;
  eval: any;
  paid: any;
  panding: any;
  total: any;
  header: any;
  // Vip subscription details
  vipDetails$ = new BehaviorSubject({});

  constructor(public httpClient: HttpClient) {
    this.username = localStorage.getItem('userName');
    this.token = localStorage.getItem('currentUserToken');
  }

  // ======================= 1 =========================
  // ========= GET USER DATA FROM LOCAL STORAGE ========
  // ===================================================
  getDataFromLocalStorage() {
    this.username = localStorage.getItem('userName');
    this.token = localStorage.getItem('currentUserToken');
  }

  /**
   * *** Prepare Headers for Http Request ***
   */
  prepareHeaderForRequest() {
    this.prefixUrlByCountry = 'https://' + localStorage.getItem('country');
    this.username = localStorage.getItem('userName');
    this.token = localStorage.getItem('currentUserToken');
    this.jwtToken = localStorage.getItem('jwtToken');
    this.header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.token)
      .set('X-Token', this.jwtToken)
      .set('Cache-Control', 'no-cache');
  }

  // ================ 2 ================
  // ========= GET GENERAL INFO ========
  // ===================================
  getGeneralInfo() {
    const getGeneralInfoUrl = 'https://ro' + this.apiURL + 'api/utils/generalInfoPanel';
    return this.httpClient.get(getGeneralInfoUrl);
  }

  getDailyGeneralInfo() {
    const dailyGeneralInfoUrl = 'https://ro' + this.apiURL + 'api/Utils/GeneralInfoPanelStatic';
    return this.httpClient.get(dailyGeneralInfoUrl);
  }

  /**
   * @name getWalletInfo
   * @description GET request - wallet info(WalletInfoModel)
   */
  getWalletInfo() {
    this.prepareHeaderForRequest();
    const walletInfoURL = this.prefixUrlByCountry + this.apiURL + 'api/commissionsinfo/GetFloatCommissions?tag=' + this.username;
    return this.httpClient.get(walletInfoURL, { headers: this.header });
  }

  // ====================== 4 ========================
  // ========= GET DETAILED TRANSACTIONS LIST ========
  // =================================================
  /**
   * @name getDetailedTransactions
   * @description Get list of all transactions(cashback, etc)
   */
  getDetailedTransactions() {
    this.getDataFromLocalStorage();
    this.prepareHeaderForRequest();
    const getDetailedTransactionsUrl = this.prefixUrlByCountry + this.apiURL + 'api/CommissionsInfo/GetTransactions?tag=' + this.username;

    return this.httpClient.get(getDetailedTransactionsUrl, { headers: this.header });
  }

  /**
   * @name getCashBackTransactions
   * @description Get list of all transactions(cashback, etc)
   */
  getCashBackTransactions() {
    this.getDataFromLocalStorage();
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/CommissionsInfo/GetCashBackTransactions?tag=' + this.username;

    return this.httpClient.get(url, { headers: this.header });
  }

  /**
   * @name isVipMember
   * @description Check if user is vip member
   */
  isVipMember() {
    this.getDataFromLocalStorage();
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/IsVipMember?email=' + this.username;

    return this.httpClient.get(url, { headers: this.header });
  }

  /**
   * @name getVipDetails
   * @description Get VIP status and VIP expiration date for an user.
   */
  getVipDetails() {
    this.getDataFromLocalStorage();
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/user/Vip';

    return this.httpClient.get(url, { headers: this.header })
      .subscribe((res: any) => {
        console.log('Vip subscription details: ', res);
        this.vipDetails$.next(res);
      }, () => this.vipDetails$.next(false));
  }

  /**
   * *** Get Payments list ***
   * @description Get list of all card payments registered to Beez
   */
  getPaymentsList() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/netopia/PaymentsList';
    return this.httpClient.get(url + '?tag=' + this.username, { headers: this.header });
  }

  getPaymentInfo(id: number) {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/netopia/PaymentInfo?tag=' + this.username + '&id=' + id;
    return this.httpClient.get(url, { headers: this.header });
  }

  // ================= 5 =================
  // ========= GET DATA FOR CHART ========
  // =====================================

  getDataForChart() {
    this.prepareHeaderForRequest();
    const getDataForChartUrl = this.prefixUrlByCountry + this.apiURL + '/api/MobileAppGraph/getdata?tag=' + this.username;

    return this.httpClient.get(getDataForChartUrl, { headers: this.header });
  }


  // ================= 6 =================
  // ========= WITHDRAWAL REQUEST ========
  // =====================================

  requestWithdraw(withdrawalRequestData: any) {
    this.prepareHeaderForRequest();
    const requestWithdrawalUrl = this.prefixUrlByCountry + this.apiURL + 'api/Notifications/SaveRequest?tag=' + this.username
      + '&name=' + withdrawalRequestData.name +
      '&surname=' + withdrawalRequestData.surname +
      '&email=' + withdrawalRequestData.email +
      '&phoneNumber=' + withdrawalRequestData.phoneNumber +
      '&address=' + withdrawalRequestData.address +
      '&account=' + withdrawalRequestData.account +
      '&cnp=' + withdrawalRequestData.cnp +
      '&amount=' + withdrawalRequestData.amount;

    return this.httpClient
      .post(requestWithdrawalUrl, null, { headers: this.header });
  }

  checkSavedDataForWithdrawal() {
    this.prepareHeaderForRequest();
    const savedFilesApiUrl = this.prefixUrlByCountry + this.apiURL + 'api/FileSaving/SavedFiles?tag=' + this.username;
    return this.httpClient.get(savedFilesApiUrl, { headers: this.header });
  }

  sendWithdrawalRequest(data: any) {
    this.prepareHeaderForRequest();
    const withdrawalApiUrl = this.prefixUrlByCountry + this.apiURL + 'api/Withdraw/PostRequest';
    return this.httpClient.post(withdrawalApiUrl, data, { headers: this.header });
  }

  uploadDocument(data: any) {
    this.prepareHeaderForRequest();
    const uploadApiUrl = this.prefixUrlByCountry + this.apiURL + 'api/FileSaving/UploadBase64';
    return this.httpClient.post(uploadApiUrl, data, { headers: this.header });
  }

  getWithdrawalsHistory() {
    this.prepareHeaderForRequest();
    const url = this.prefixUrlByCountry + this.apiURL + 'api/Withdraw/UserHistory';
    return this.httpClient.get(url + '?tag=' + this.username, { headers: this.header });
  }
}

