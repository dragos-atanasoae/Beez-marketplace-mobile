import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsListPageRoutingModule } from './transactions-list-routing.module';

import { TransactionsListPage } from './transactions-list.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MomentModule,
    PipesModule,
    TranslateModule,
    TransactionsListPageRoutingModule
  ],
  declarations: [TransactionsListPage]
})
export class TransactionsListPageModule {}
