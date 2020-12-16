import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VendorsListPageRoutingModule } from './vendors-list-routing.module';

import { VendorsListPage } from './vendors-list.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    PipesModule,
    VendorsListPageRoutingModule
  ],
  declarations: [VendorsListPage]
})
export class VendorsListPageModule {}
