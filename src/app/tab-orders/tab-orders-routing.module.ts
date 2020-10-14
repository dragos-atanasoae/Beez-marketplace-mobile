import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabOrdersPage } from './tab-orders.page';

const routes: Routes = [
  {
    path: '',
    component: TabOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabOrdersPageRoutingModule {}
