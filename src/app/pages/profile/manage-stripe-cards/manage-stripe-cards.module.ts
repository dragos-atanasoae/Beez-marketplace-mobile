import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageStripeCardsPageRoutingModule } from './manage-stripe-cards-routing.module';

import { ManageStripeCardsPage } from './manage-stripe-cards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageStripeCardsPageRoutingModule
  ],
  declarations: [ManageStripeCardsPage]
})
export class ManageStripeCardsPageModule {}
