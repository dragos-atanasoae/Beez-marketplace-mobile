import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundDetailsPage } from './refund-details.page';

const routes: Routes = [
  {
    path: '',
    component: RefundDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundDetailsPageRoutingModule {}
