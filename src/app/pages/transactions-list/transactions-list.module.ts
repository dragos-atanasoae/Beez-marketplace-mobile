import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsListPageRoutingModule } from './transactions-list-routing.module';

import { TransactionsListPage } from './transactions-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule,
    TransactionsListPageRoutingModule
  ],
  declarations: [TransactionsListPage]
})
export class TransactionsListPageModule {}
