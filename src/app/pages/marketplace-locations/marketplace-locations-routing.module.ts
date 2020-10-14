import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketplaceLocationsPage } from './marketplace-locations.page';

const routes: Routes = [
  {
    path: '',
    component: MarketplaceLocationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketplaceLocationsPageRoutingModule {}
