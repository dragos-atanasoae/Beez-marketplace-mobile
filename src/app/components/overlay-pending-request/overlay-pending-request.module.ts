import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayPendingRequestComponent } from './overlay-pending-request.component';

@NgModule({
  declarations: [OverlayPendingRequestComponent],
  exports: [OverlayPendingRequestComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule
  ]
})
export class OverlayPendingRequestModule { }
