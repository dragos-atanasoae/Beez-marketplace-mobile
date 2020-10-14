import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditDeliveryAddressPageRoutingModule } from './edit-delivery-address-routing.module';

import { EditDeliveryAddressPage } from './edit-delivery-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditDeliveryAddressPageRoutingModule
  ],
  declarations: [EditDeliveryAddressPage]
})
export class EditDeliveryAddressPageModule {}
