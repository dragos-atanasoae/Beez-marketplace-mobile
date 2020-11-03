import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-manage-stripe-cards',
  templateUrl: './manage-stripe-cards.page.html',
  styleUrls: ['./manage-stripe-cards.page.scss'],
})
export class ManageStripeCardsPage implements OnInit {

  paymentDetails = {
    transactionType: 'addCard'
  };
  private unsubscribe$: Subject<boolean> = new Subject();
  paymentMethods = [];
  showAddCardForm = false;
  showCardsList = true;

  constructor(
    private modalCtrl: ModalController,
    private stripePaymentService: StripePaymentService
  ) { }

  ngOnInit() {
    this.getPaymentMethods();
  }

  getPaymentMethods() {
    this.stripePaymentService.getPaymentMethods('initialize');
    this.stripePaymentService.paymentMethodsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.paymentMethods = res);
    console.log('List of cards from Stripe: ', this.paymentMethods);
    if (this.paymentMethods.length > 0) {
      this.showCardsList = true;
      this.showAddCardForm = false;
    } else {
      this.showCardsList = false;
    }
  }

  receiveEventPaymentMethodAdded($event: any) {
    this.stripePaymentService.getPaymentMethods('initialize');
    this.getPaymentMethods();
    this.showAddCardForm = false;
  }


  closeModal() {
    this.modalCtrl.dismiss();
  }

}
