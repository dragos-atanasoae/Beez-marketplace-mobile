import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceProductsPageRoutingModule } from './marketplace-products-routing.module';

import { MarketplaceProductsPage } from './marketplace-products.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    MarketplaceProductsPageRoutingModule
  ],
  declarations: [MarketplaceProductsPage]
})
export class MarketplaceProductsPageModule {}
