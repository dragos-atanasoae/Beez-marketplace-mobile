import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketplaceProductsPage } from './marketplace-products.page';

const routes: Routes = [
  {
    path: '',
    component: MarketplaceProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketplaceProductsPageRoutingModule {}
