import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageDocumentsPageRoutingModule } from './manage-documents-routing.module';

import { ManageDocumentsPage } from './manage-documents.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ManageDocumentsPageRoutingModule
  ],
  declarations: [ManageDocumentsPage]
})
export class ManageDocumentsPageModule {}
