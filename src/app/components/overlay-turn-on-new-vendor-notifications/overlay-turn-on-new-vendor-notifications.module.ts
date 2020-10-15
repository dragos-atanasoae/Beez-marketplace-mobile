import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayTurnOnNewVendorNotificationsComponent } from './overlay-turn-on-new-vendor-notifications.component';



@NgModule({
  entryComponents: [OverlayTurnOnNewVendorNotificationsComponent],
  declarations: [OverlayTurnOnNewVendorNotificationsComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule
  ]
})
export class OverlayTurnOnNewVendorNotificationsModule { }
