import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentPageRoutingModule } from './payment-routing.module';

import { PaymentPage } from './payment.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { StripeCardsListComponentModule } from 'src/app/components/stripe-cards-list/stripe-cards-list.module';
import { StripeAddPaymentMethodModule } from 'src/app/components/stripe-add-payment-method/stripe-add-payment-method.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PipesModule,
    TranslateModule,
    StripeCardsListComponentModule,
    StripeAddPaymentMethodModule,
    PaymentPageRoutingModule
  ],
  declarations: [PaymentPage]
})
export class PaymentPageModule {}
