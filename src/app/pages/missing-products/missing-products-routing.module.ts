import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MissingProductsPage } from './missing-products.page';

const routes: Routes = [
  {
    path: '',
    component: MissingProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MissingProductsPageRoutingModule {}
