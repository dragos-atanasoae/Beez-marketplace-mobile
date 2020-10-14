import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageStripeCardsPage } from './manage-stripe-cards.page';

const routes: Routes = [
  {
    path: '',
    component: ManageStripeCardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageStripeCardsPageRoutingModule {}
