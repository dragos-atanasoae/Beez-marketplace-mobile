import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageStripeCardsPageRoutingModule } from './manage-stripe-cards-routing.module';

import { ManageStripeCardsPage } from './manage-stripe-cards.page';
import { TranslateModule } from '@ngx-translate/core';
import { StripeAddPaymentMethodModule } from 'src/app/components/stripe-add-payment-method/stripe-add-payment-method.module';
import { StripeCardsListComponentModule } from 'src/app/components/stripe-cards-list/stripe-cards-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    StripeAddPaymentMethodModule,
    StripeCardsListComponentModule,
    ManageStripeCardsPageRoutingModule
  ],
  declarations: [ManageStripeCardsPage]
})
export class ManageStripeCardsPageModule {}
