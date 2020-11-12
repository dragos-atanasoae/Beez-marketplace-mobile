import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageDocumentsPage } from './manage-documents.page';

const routes: Routes = [
  {
    path: '',
    component: ManageDocumentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageDocumentsPageRoutingModule {}
