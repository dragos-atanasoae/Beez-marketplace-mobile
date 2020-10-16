import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditDeliveryAddressPageRoutingModule } from './edit-delivery-address-routing.module';

import { EditDeliveryAddressPage } from './edit-delivery-address.page';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { TranslateModule } from '@ngx-translate/core';
import { PhoneVerificationComponentModule } from 'src/app/components/phone-verification/phone-verification.module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutocompleteLibModule,
    IonicSelectableModule,
    PhoneVerificationComponentModule,
    ReactiveFormsModule,
    TranslateModule,
    EditDeliveryAddressPageRoutingModule
  ],
  declarations: [EditDeliveryAddressPage]
})
export class EditDeliveryAddressPageModule {}
