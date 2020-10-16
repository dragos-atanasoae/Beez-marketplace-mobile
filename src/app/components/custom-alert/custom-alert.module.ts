import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomAlertComponent } from './custom-alert.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [CustomAlertComponent],
  exports: [CustomAlertComponent],
  imports: [
    CommonModule,
    IonicModule,
  ]
})
export class CustomAlertModule { }
