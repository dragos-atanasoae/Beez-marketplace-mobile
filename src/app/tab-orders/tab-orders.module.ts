import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabOrdersPageRoutingModule } from './tab-orders-routing.module';

import { TabOrdersPage } from './tab-orders.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TabOrdersPageRoutingModule
  ],
  declarations: [TabOrdersPage]
})
export class TabOrdersPageModule {}
