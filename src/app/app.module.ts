import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InternationalizationService } from './services/internationalization.service';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import localeRo from '@angular/common/locales/ro';
import localeEnGB from '@angular/common/locales/en-GB';
import { LoadingService } from './services/loading.service';
import { MomentModule } from 'ngx-moment';
import { ReactiveFormsModule } from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { CustomAlertModule } from './components/custom-alert/custom-alert.module';
import { Mixpanel, MixpanelPeople } from '@ionic-native/mixpanel/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
registerLocaleData(localeRo, 'ro');
registerLocaleData(localeEnGB, 'en-GB');

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({scrollAssist: true}),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MomentModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: InternationalizationService,
        deps: [HttpClient],
      }
    }),
    CustomAlertModule
  ],
  providers: [
    CallNumber,
    CurrencyPipe,
    DatePipe,
    InAppBrowser,
    LoadingService,
    Mixpanel,
    MixpanelPeople,
    SplashScreen,
    StatusBar,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
