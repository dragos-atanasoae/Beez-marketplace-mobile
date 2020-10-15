import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketplaceCategoriesPage } from './marketplace-categories.page';

const routes: Routes = [
  {
    path: '',
    component: MarketplaceCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketplaceCategoriesPageRoutingModule {}
