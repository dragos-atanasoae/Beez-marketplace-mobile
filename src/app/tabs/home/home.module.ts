import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { VendorsListModule } from 'src/app/components/vendors-list/vendors-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VendorsListModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
