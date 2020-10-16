import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VipSubscriptionPageRoutingModule } from './vip-subscription-routing.module';

import { VipSubscriptionPage } from './vip-subscription.page';
import { MomentModule } from 'ngx-moment';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MomentModule,
    PipesModule,
    TranslateModule,
    VipSubscriptionPageRoutingModule
  ],
  declarations: [VipSubscriptionPage]
})
export class VipSubscriptionPageModule {}
