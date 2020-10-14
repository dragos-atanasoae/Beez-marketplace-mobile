import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceLocationsPageRoutingModule } from './marketplace-locations-routing.module';

import { MarketplaceLocationsPage } from './marketplace-locations.page';
import { TranslateModule } from '@ngx-translate/core';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    AutocompleteLibModule,
    MarketplaceLocationsPageRoutingModule
  ],
  declarations: [MarketplaceLocationsPage]
})
export class MarketplaceLocationsPageModule {}
