import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VipSubscriptionPageRoutingModule } from './vip-subscription-routing.module';

import { VipSubscriptionPage } from './vip-subscription.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VipSubscriptionPageRoutingModule
  ],
  declarations: [VipSubscriptionPage]
})
export class VipSubscriptionPageModule {}
