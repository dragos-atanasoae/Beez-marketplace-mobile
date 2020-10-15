import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShoppingCartPageRoutingModule } from './shopping-cart-routing.module';

import { ShoppingCartPage } from './shopping-cart.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { SelectDeliveryAddressComponentModule } from 'src/app/components/select-delivery-address/select-delivery-address.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    SelectDeliveryAddressComponentModule,
    ShoppingCartPageRoutingModule
  ],
  declarations: [ShoppingCartPage]
})
export class ShoppingCartPageModule {}
