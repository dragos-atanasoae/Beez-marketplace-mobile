import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MissingProductsPageRoutingModule } from './missing-products-routing.module';

import { MissingProductsPage } from './missing-products.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    MissingProductsPageRoutingModule
  ],
  declarations: [MissingProductsPage]
})
export class MissingProductsPageModule {}
