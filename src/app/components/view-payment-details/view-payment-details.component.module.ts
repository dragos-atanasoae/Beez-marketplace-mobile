import { ViewPaymentDetailsComponent } from './view-payment-details.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    PipesModule,
    MomentModule,
  ],
  exports: [
      ViewPaymentDetailsComponent
  ],
  declarations: [ViewPaymentDetailsComponent]
})
export class ViewPaymentDetailsComponentModule {}
