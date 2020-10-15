import { ConfirmDeleteDataComponent } from './confirm-delete-data.component';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ConfirmDeleteDataComponent],
  exports: [ConfirmDeleteDataComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule
  ]
})
export class ConfirmDeleteDataModule { }
