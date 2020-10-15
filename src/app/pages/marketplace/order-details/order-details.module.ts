import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDetailsPageRoutingModule } from './order-details-routing.module';

import { OrderDetailsPage } from './order-details.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';
import { OverlayPaymentSuccessModule } from 'src/app/components/overlay-payment-success/overlay-payment-success.module';
import { MissingProductsPageModule } from '../missing-products/missing-products.module';
import { ConfirmDeleteDataModule } from 'src/app/components/confirm-delete-data/confirm-delete-data.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MomentModule,
    PipesModule,
    TranslateModule,
    OverlayPaymentSuccessModule,
    MissingProductsPageModule,
    OrderDetailsPageRoutingModule,
    ConfirmDeleteDataModule
  ],
  declarations: [OrderDetailsPage]
})
export class OrderDetailsPageModule {}
