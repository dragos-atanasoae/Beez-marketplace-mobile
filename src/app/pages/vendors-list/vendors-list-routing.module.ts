import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorsListPage } from './vendors-list.page';

const routes: Routes = [
  {
    path: '',
    component: VendorsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorsListPageRoutingModule {}
