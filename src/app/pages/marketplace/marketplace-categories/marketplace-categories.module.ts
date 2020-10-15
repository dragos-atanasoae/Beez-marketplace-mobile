import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceCategoriesPageRoutingModule } from './marketplace-categories-routing.module';

import { MarketplaceCategoriesPage } from './marketplace-categories.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    MarketplaceCategoriesPageRoutingModule
  ],
  declarations: [MarketplaceCategoriesPage]
})
export class MarketplaceCategoriesPageModule {}
