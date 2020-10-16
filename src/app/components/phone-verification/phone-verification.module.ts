import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PhoneVerificationComponent } from './phone-verification.component';

@NgModule({
  declarations: [PhoneVerificationComponent],
  exports: [PhoneVerificationComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
  ]
})
export class PhoneVerificationComponentModule { }
