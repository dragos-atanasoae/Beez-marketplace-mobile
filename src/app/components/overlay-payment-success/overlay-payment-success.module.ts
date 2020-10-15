import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayPaymentSuccessComponent } from './overlay-payment-success.component';

@NgModule({
  declarations: [OverlayPaymentSuccessComponent],
  exports: [OverlayPaymentSuccessComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule
  ]
})
export class OverlayPaymentSuccessModule { }
