import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { StripePaymentService } from 'src/app/services/stripe-payment.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastController, AlertController } from '@ionic/angular';
import { trigger, transition, useAnimation } from '@angular/animations';
import { zoomIn, zoomOut } from 'ng-animate';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/services/analytics.service';


@Component({
  selector: 'app-stripe-cards-list',
  templateUrl: './stripe-cards-list.component.html',
  styleUrls: ['./stripe-cards-list.component.scss'],
  animations: [
    trigger('animationZoomInOut', [
      // transition(':enter', useAnimation(zoomIn), {
      //   params: { timing: 0.3, delay: 0 }
      // }),
      transition(':leave', useAnimation(zoomOut), {
        params: { timing: 0.3, delay: 0 }
      }),
    ]),
  ]
})
export class StripeCardsListComponent implements OnInit, OnDestroy {

  @Output() addNewPaymentMethodEvent = new EventEmitter<boolean>();
  @Output() selectPaymentMethodEvent = new EventEmitter<object>();

  private unsubscribe$: Subject<boolean> = new Subject();
  paymentMethods = [];
  // used fo edit
  editCardId: any;
  selectedCard: any;
  editCard = false;
  eventContext = 'Cards List';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private loadingService: LoadingService,
    private stripePaymentService: StripePaymentService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.getPaymentMethods();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  getPaymentMethods() {
    this.stripePaymentService.paymentMethodsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      // this.paymentMethods = res.reverse();
    });
    console.log('List of cards from Stripe: ', this.paymentMethods);
  }

  updatePaymentMethodName(id: number, name: string) {
    this.loadingService.presentLoading();
    this.analyticsService.logEvent('edit_card_name', { context: this.eventContext });
    this.stripePaymentService.postPaymentMethodName(id, name).subscribe((res: any) => {
      if (res.status === 'success') {
        this.loadingService.dismissLoading();
        this.stripePaymentService.getPaymentMethods('initialize');
        this.editCard = false;
        this.editCardId = null;
        this.presentToast(res.data.userMessage);
      } else {
        this.loadingService.dismissLoading();
        this.presentToast(res.data.userMessage);
      }
    });
  }

  /**
   * @name showAlertRemoveCard
   * @description Show alert prompt confirm action remove card
   * @param cardId
   */
  async removeCard(cardId: number) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('pages.manageCreditCards.labelRemoveCard'),
      message: this.translate.instant('pages.manageCreditCards.messageConfirmRemoveCard'),
      buttons: [
        {
          text: this.translate.instant('buttons.buttonCancel'),
          handler: () => {},
          cssClass: 'alert_btn_cancel'
        },
        {
          text: this.translate.instant('buttons.buttonRemove'),
          handler: () => {
            this.loadingService.presentLoading();
            this.stripePaymentService.removePaymentMethod(cardId).subscribe((res: any) => {
              if (res.status === 'success') {
                this.stripePaymentService.getPaymentMethods('initialize');
                this.loadingService.dismissLoading();
                this.presentToast(res.data.userMessage);
                this.analyticsService.logEvent('remove_card', { context: this.eventContext });
              } else {
                this.presentToast(res.data.userMessage);
                this.loadingService.dismissLoading();
                this.analyticsService.logEvent('remove_card_failed', { context: this.eventContext });
              }
            });
          },
          cssClass: 'alert_btn_action'
        },
      ],
      cssClass: 'alert_remove_item'
    });
    alert.present();
  }

  showAddPaymentMethodForm() {
    this.addNewPaymentMethodEvent.emit(true);
  }

  emitEventSelectPaymentMethod(card: any) {
    this.selectPaymentMethodEvent.emit(card);
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: 'bottom',
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: () => this.toastCtrl.dismiss()
      }],
      cssClass: 'custom_toast'
    });

    toast.present();
  }

}
