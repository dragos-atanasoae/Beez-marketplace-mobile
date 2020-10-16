import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsCenterPage } from './notifications-center.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationsCenterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsCenterPageRoutingModule {}
