import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabMarketplacePageRoutingModule } from './tab-marketplace-routing.module';

import { TabMarketplacePage } from './tab-marketplace.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    TabMarketplacePageRoutingModule
  ],
  declarations: [TabMarketplacePage]
})
export class TabMarketplacePageModule {}
