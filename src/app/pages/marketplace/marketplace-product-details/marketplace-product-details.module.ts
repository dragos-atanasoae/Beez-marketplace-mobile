import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceProductDetailsPageRoutingModule } from './marketplace-product-details-routing.module';

import { MarketplaceProductDetailsPage } from './marketplace-product-details.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    MarketplaceProductDetailsPageRoutingModule
  ],
  declarations: [MarketplaceProductDetailsPage]
})
export class MarketplaceProductDetailsPageModule {}
