import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LanguageService } from './services/language.service';
import { Plugins } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { RedirectDeeplinkService } from './services/redirect-deeplink.service';
import { BranchInitEvent } from 'capacitor-branch-deep-links';
const { SplashScreen, BranchDeepLinks } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  devEnvironment = !environment.production;
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private languageService: LanguageService,
    private redirectDeeplinkService: RedirectDeeplinkService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      SplashScreen.show({
        showDuration: 2500,
        fadeInDuration: 1000,
        fadeOutDuration: 500
      });
      this.languageService.setInitialAppLanguage();
      if (!this.platform.is('desktop')) {
        this.receiveDeepLinkData();
      }
    });
  }

  /**
   * @name receiveDeepLinkData
   * @description Receive data from branch deeplinks
   */
  async receiveDeepLinkData() {
    BranchDeepLinks.addListener('init', (event: BranchInitEvent) => {
      // Retrieve deeplink keys from 'referringParams' and evaluate the values to determine where to route the user
      // Check '+clicked_branch_link' before deciding whether to use your Branch routing logic
      console.log('Deeplink received data: ', event.referringParams);
      if (event.referringParams['+clicked_branch_link']) {
        this.redirectDeeplinkService.managePathRedirect(event.referringParams.$deeplink_path);
      }
    });

    BranchDeepLinks.addListener('initError', (error: any) => {
      console.error(error);
    });
  }
}
