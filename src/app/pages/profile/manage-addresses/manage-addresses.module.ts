import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAddressesPageRoutingModule } from './manage-addresses-routing.module';

import { ManageAddressesPage } from './manage-addresses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAddressesPageRoutingModule
  ],
  declarations: [ManageAddressesPage]
})
export class ManageAddressesPageModule {}
