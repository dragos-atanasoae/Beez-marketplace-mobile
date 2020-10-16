import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsCenterPageRoutingModule } from './notifications-center-routing.module';

import { NotificationsCenterPage } from './notifications-center.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsCenterPageRoutingModule
  ],
  declarations: [NotificationsCenterPage]
})
export class NotificationsCenterPageModule {}
