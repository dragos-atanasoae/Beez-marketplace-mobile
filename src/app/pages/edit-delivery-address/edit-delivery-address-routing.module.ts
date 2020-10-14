import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditDeliveryAddressPage } from './edit-delivery-address.page';

const routes: Routes = [
  {
    path: '',
    component: EditDeliveryAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditDeliveryAddressPageRoutingModule {}
