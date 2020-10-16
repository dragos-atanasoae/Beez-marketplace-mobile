import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountSettingsPageRoutingModule } from './account-settings-routing.module';

import { AccountSettingsPage } from './account-settings.page';
import { ConfirmDeleteDataModule } from 'src/app/components/confirm-delete-data/confirm-delete-data.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmDeleteDataModule,
    PipesModule,
    TranslateModule,
    AccountSettingsPageRoutingModule
  ],
  declarations: [AccountSettingsPage]
})
export class AccountSettingsPageModule {}
