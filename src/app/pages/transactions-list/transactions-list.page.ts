import { AnalyticsService } from 'src/app/services/analytics.service';
import { LoadingService } from './../../services/loading.service';
import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from 'src/app/services/wallet.service';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeOut } from 'ng-animate';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Plugins } from '@capacitor/core';


const { Browser } = Plugins;

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.page.html',
  styleUrls: ['./transactions-list.page.scss'],
  animations: [
    trigger('overlayAccountValidation', [
      transition(':leave', useAnimation(fadeOut), {
        params: { timing: 0.3, delay: 0 }
      })
    ]),
  ]
})
export class TransactionsListPage implements OnInit {

  language: string;
  country: string;
  localeData = new LocaleDataModel();
  referralCode: string;

  // query params
  context = '';

  showOverlayValidationAccount = false;
  skipAccountValidation = true;
  showPaymentDetails = false;
  listOfTransactions: any = [];
  listOfCardPayments: any = [];
  withdrawalsList: any = [];
  selectedPaymentId: number;
  detailsOfSelectedPayment: any;
  walletInfo: any;
  selectedSegment = 'cashbacksList';
  eventContext = 'Transactions List Page';

  constructor(
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    public modalCtrl: ModalController,
    public translate: TranslateService,
    private walletService: WalletService,
    private analyticsService: AnalyticsService,
    private internationalizationService: InternationalizationService
  ) {
    this.country = localStorage.getItem('country');
    this.language = localStorage.getItem('language');
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    console.log(this.language);

    this.referralCode = localStorage.getItem('referralCode');
    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (params && params.contextData) {
        this.context = params.contextData;
      }
    });
  }

  ngOnInit() {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  ionViewWillEnter() {
    switch (this.context) {
      case 'cashback':
        setTimeout(() => {
          this.getWalletInfo();
        }, 500);
        this.getCashBackTransactions();
        this.getWithdrawalsList();
        break;
      case 'payments':
        this.getListOfCardPayments();
        break;
    }
  }

  /**
   * @description Receive event to hide overlay account validation
   * @param $event
   */
  receiveEventAccountValidated($event) {
    console.log('Close overlay validating account', $event);
    if ($event === true) {
      this.showOverlayValidationAccount = false;
    }
  }

  /**
   * @name getWalletInfo
   * @description Get wallet info from database
   */
  getWalletInfo() {
    this.walletService.getWalletInfo().subscribe((res: any) => {
      console.log(res.hasOwnProperty('isSuccess'));
      if (res.hasOwnProperty('isSuccess')) {
        if (res.isSuccess) {
          console.log(res.status);
        }
      } else {
        this.walletInfo = res;
      }
    });
  }

  /**
   * @name getCashBackTransactions
   * @description Get List of cashback transactions
   */
  getCashBackTransactions() {
    this.walletService.getCashBackTransactions().subscribe(data => {
      console.log(data);
      this.listOfTransactions = data;
    });
  }

  /**
   * @name getWithdrawalsList
   * @description Get the list of the withdrawal requests
   */
  getWithdrawalsList() {
    this.walletService.getWithdrawalsHistory()
      .subscribe((response) => {
        this.withdrawalsList = response;
      });
  }

  /**
   * @name getListOfCardPayments
   * @description Get List of Card payments
   */
  getListOfCardPayments() {
    this.loadingService.presentLoading();
    this.walletService.getPaymentsList().subscribe(response => {
      console.log(response);
      const listOfPaymentsResponse: any = response;
      if (listOfPaymentsResponse.status === 'success') {
        if (listOfPaymentsResponse.paymentsList != null) {
          this.listOfCardPayments = listOfPaymentsResponse.paymentsList.slice().reverse();
        }
        this.loadingService.dismissLoading();
      }
    }, () => this.loadingService.dismissLoading());
  }

  /**
   * @name getDetailsOfPayment
   * @description Get Details about Payment
   * @param id
   */
  getDetailsOfPayment(id: number) {
    this.walletService.getPaymentInfo(id).subscribe(response => {
      console.log(response);
      this.detailsOfSelectedPayment = response;
    });
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('payment_details', eventParams);
  }

  /**
   * @name getDetailedTransactions
   * @description Get List of Transactions
   */
  getDetailedTransactions() {
    this.walletService.getDetailedTransactions().subscribe(data => {
      console.log(data);
      this.listOfTransactions = data;
    });
  }

  reloadData() {
    setTimeout(() => {
      this.getWalletInfo();
    }, 500);
    this.getWithdrawalsList();
  }

  /**
   * @name doRefresh
   * @description Action pull to refresh, reload data
   * @param refresher
   */
  doRefresh(refresher) {
    this.getDetailedTransactions();
    this.getListOfCardPayments();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.target.complete();
    }, 2000);
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('pull_to_refresh_transactions_page', eventParams);
  }

  /**
   * @name receiveCloseDetailsViewEvent
   * @description Receive event when Transaction details is closed
   * @param $event
   */
  receiveCloseDetailsViewEvent($event) {
    this.showPaymentDetails = $event;
    this.selectedPaymentId = null;
  }

  /**
   * @name openTransactionsDetailsModal
   */
  async openTransactionsDetailsModal() {
    const transactionsDetailsModal = await this.modalCtrl.create({
      component: 'TransactionsDetailsPage',
    });
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('open_transactions_details_page', eventParams);
    transactionsDetailsModal.present();
  }

  /**
   * @name logChangeView
   * @description Add log for switching segments
   * @param segment
   */
  logChangeView(segment: string) {
    console.log(segment);
    const eventParams = { context: this.eventContext, user_code: this.referralCode };
    this.analyticsService.logEvent('view_' + segment + 'details', eventParams);
  }
}
