import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketplaceProductDetailsPage } from './marketplace-product-details.page';

const routes: Routes = [
  {
    path: '',
    component: MarketplaceProductDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketplaceProductDetailsPageRoutingModule {}
