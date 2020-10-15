import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { SelectDeliveryAddressComponent } from './select-delivery-address.component';
import { EditDeliveryAddressPageModule } from 'src/app/pages/edit-delivery-address/edit-delivery-address.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    // EditDeliveryAddressPageModule
  ],
  exports: [
      SelectDeliveryAddressComponent
  ],
  declarations: [SelectDeliveryAddressComponent]
})
export class SelectDeliveryAddressComponentModule {}
