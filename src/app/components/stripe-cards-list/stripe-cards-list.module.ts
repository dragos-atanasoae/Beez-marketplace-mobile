import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { StripeCardsListComponent } from './stripe-cards-list.component';

@NgModule({
  // entryComponents: [StripeCardsListComponent],
  declarations: [StripeCardsListComponent],
  exports: [StripeCardsListComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
  ]
})
export class StripeCardsListComponentModule { }
