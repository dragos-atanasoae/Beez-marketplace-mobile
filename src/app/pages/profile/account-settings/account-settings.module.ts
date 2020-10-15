import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountSettingsPageRoutingModule } from './account-settings-routing.module';

import { AccountSettingsPage } from './account-settings.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ConfirmDeleteDataModule } from 'src/app/components/confirm-delete-data/confirm-delete-data.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    AccountSettingsPageRoutingModule,
    ConfirmDeleteDataModule
  ],
  declarations: [AccountSettingsPage]
})
export class AccountSettingsPageModule {}
