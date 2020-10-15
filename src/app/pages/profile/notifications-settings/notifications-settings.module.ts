import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsSettingsPageRoutingModule } from './notifications-settings-routing.module';

import { NotificationsSettingsPage } from './notifications-settings.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    NotificationsSettingsPageRoutingModule
  ],
  declarations: [NotificationsSettingsPage]
})
export class NotificationsSettingsPageModule {}
