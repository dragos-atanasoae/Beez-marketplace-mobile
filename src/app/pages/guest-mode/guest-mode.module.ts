import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GuestModePageRoutingModule } from './guest-mode-routing.module';

import { GuestModePage } from './guest-mode.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    GuestModePageRoutingModule
  ],
  declarations: [GuestModePage]
})
export class GuestModePageModule {}
