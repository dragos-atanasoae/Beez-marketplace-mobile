import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDetailsPageRoutingModule } from './order-details-routing.module';

import { OrderDetailsPage } from './order-details.page';
import { MomentModule } from 'ngx-moment';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayPaymentSuccessModule } from 'src/app/components/overlay-payment-success/overlay-payment-success.module';
import { ConfirmDeleteDataComponent } from 'src/app/components/confirm-delete-data/confirm-delete-data.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MomentModule,
    PipesModule,
    TranslateModule,
    OverlayPaymentSuccessModule,
    // ConfirmDeleteDataComponent,
    OrderDetailsPageRoutingModule
  ],
  declarations: [OrderDetailsPage]
})
export class OrderDetailsPageModule {}
