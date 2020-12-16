import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsListComponent } from './vendors-list.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';



@NgModule({
  declarations: [VendorsListComponent],
  exports: [VendorsListComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    PipesModule,
  ]
})
export class VendorsListModule { }
