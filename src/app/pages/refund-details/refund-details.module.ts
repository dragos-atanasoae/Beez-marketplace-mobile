import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundDetailsPageRoutingModule } from './refund-details-routing.module';

import { RefundDetailsPage } from './refund-details.page';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundDetailsPageRoutingModule,
    TranslateModule,
    PipesModule,
  ],
  declarations: [RefundDetailsPage]
})
export class RefundDetailsPageModule {}
