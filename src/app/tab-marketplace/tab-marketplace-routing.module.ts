import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabMarketplacePage } from './tab-marketplace.page';

const routes: Routes = [
  {
    path: '',
    component: TabMarketplacePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabMarketplacePageRoutingModule {}
