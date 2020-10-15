import { LoadingService } from 'src/app/services/loading.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-view-payment-details',
  templateUrl: './view-payment-details.component.html',
  styleUrls: ['./view-payment-details.component.scss'],
})
export class ViewPaymentDetailsComponent implements OnInit {

  @Input() paymentId: number;
  @Output() closeViewEvent = new EventEmitter<boolean>();

  loading: any;
  detailsOfSelectedPayment: any;

  constructor(public loadingService: LoadingService,
              public walletService: WalletService) {
    console.log('Hello ViewPaymentDetailsComponent Component');
  }

  ngOnInit() {
    console.log(this.paymentId);
    this.getDetailsOfPayment(this.paymentId);
  }

  getDetailsOfPayment(id: number) {
    this.loadingService.presentLoading();
    this.walletService.getPaymentInfo(id).subscribe(response => {
      console.log(response);
      this.detailsOfSelectedPayment = response;
      this.loadingService.dismissLoading();
    }, () => this.loadingService.dismissLoading());
  }

  closeDetailsView() {
    this.closeViewEvent.emit(false);
  }
}
