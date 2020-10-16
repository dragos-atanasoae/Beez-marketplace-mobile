import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketplaceLocationsPageRoutingModule } from './marketplace-locations-routing.module';

import { MarketplaceLocationsPage } from './marketplace-locations.page';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AutocompleteLibModule,
    TranslateModule,
    MarketplaceLocationsPageRoutingModule
  ],
  declarations: [MarketplaceLocationsPage]
})
export class MarketplaceLocationsPageModule {}
