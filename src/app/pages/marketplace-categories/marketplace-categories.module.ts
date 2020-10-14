import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceCategoriesPageRoutingModule } from './marketplace-categories-routing.module';

import { MarketplaceCategoriesPage } from './marketplace-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarketplaceCategoriesPageRoutingModule
  ],
  declarations: [MarketplaceCategoriesPage]
})
export class MarketplaceCategoriesPageModule {}
