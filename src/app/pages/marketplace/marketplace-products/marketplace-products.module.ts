import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceProductsPageRoutingModule } from './marketplace-products-routing.module';

import { MarketplaceProductsPage } from './marketplace-products.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarketplaceProductsPageRoutingModule
  ],
  declarations: [MarketplaceProductsPage]
})
export class MarketplaceProductsPageModule {}
