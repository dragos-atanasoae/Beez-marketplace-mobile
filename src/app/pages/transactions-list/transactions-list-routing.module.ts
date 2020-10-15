import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionsListPage } from './transactions-list.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsListPageRoutingModule {}
