import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { SlidesGeneralInfoComponent } from './slides-general-info.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
  ],
  exports: [
      SlidesGeneralInfoComponent
  ],
  declarations: [SlidesGeneralInfoComponent]
})
export class SlidesGeneralInfoModule {}
