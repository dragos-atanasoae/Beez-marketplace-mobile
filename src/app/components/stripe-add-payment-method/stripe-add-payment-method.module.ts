import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeAddPaymentMethodComponent } from './stripe-add-payment-method.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';



@NgModule({
  // entryComponents: [StripeAddPaymentMethodComponent],
  declarations: [StripeAddPaymentMethodComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
  ],
  exports: [StripeAddPaymentMethodComponent]
})
export class StripeAddPaymentMethodModule { }
