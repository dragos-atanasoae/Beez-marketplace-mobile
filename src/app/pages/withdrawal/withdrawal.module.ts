import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WithdrawalPageRoutingModule } from './withdrawal-routing.module';

import { WithdrawalPage } from './withdrawal.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    WithdrawalPageRoutingModule
  ],
  declarations: [WithdrawalPage]
})
export class WithdrawalPageModule {}
