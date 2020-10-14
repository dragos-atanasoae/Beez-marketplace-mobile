import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
// import { Mixpanel } from '@ionic-native/mixpanel/ngx';
// import { Facebook } from '@ionic-native/facebook/ngx';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';

const { Device } = Plugins;
// Segment analytics
declare var analytics;
// declare var segmentUkDev;
// declare var segmentRoProd;
// declare var segmentUkProd;



@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  username: string;
  baseURL = environment.apiURL;

  constructor(
    private platform: Platform,
    // private mixpanel: Mixpanel,
    // private facebook: Facebook,
  ) { }

  /**
   * @name logEvent
   * @param event
   * @param eventParams
   */
  logEvent(event: any, eventParams: any) {
    if (!this.platform.is('desktop')) {
      this.mixpanelLogEvents(event, eventParams);
      this.firebaseLogEvents(event, eventParams);
      this.facebookLogEvents(event, eventParams);
      if (this.baseURL === '-prod-api.use-beez.com/') {
        this.segmentLogEvents(event, eventParams);
      }
    } else {
      console.log('Skip analytics');
    }
    // this.segmentLogEvents(event, eventParams);
    // this.openTutorialDetails(event);
  }

  /**
   * @description Segment Analytics - log events
   * @param event
   * @param eventParams
   */
  async segmentLogEvents(event: string, eventParams: any) {
    const info = await Device.getInfo();

    eventParams.deviceInfo = {
      appVersion: info.appVersion,
      platform: info.platform,
      osVersion: info.osVersion,
      deviceManufacturer: info.manufacturer,
      deviceModel: info.model
    };

    analytics.identify(localStorage.getItem('userExternalId'), {
      email: localStorage.getItem('userName'),
      country: localStorage.getItem('country'),
      deviceInfo: eventParams.deviceInfo,
      appVersion: info.appVersion
    });

    eventParams.country = localStorage.getItem('country');
    analytics.track(event, eventParams);
  }

  /**
   * @name facebookLogEvents
   * @description Facebook analytics LogEvents
   * @param event
   * @param params
   */
  facebookLogEvents(event: string, params: any) {
    // this.facebook.logEvent(event, params)
    //   .then(res => {
    //     // console.log('Facebook log event: ' + res);
    //   })
    //   .catch(e => console.log(e));
  }

  /**
   * @name firebaseLogEvents
   * @description Firebase analytics LogEvents
   * @param event
   * @param params
   */
  firebaseLogEvents(event: string, params: any) {
    // this.firebase.logEvent(event, params)
    //   .then(res => {
    //     console.log('Firebase log event: ' + res);
    //   })
    //   .catch(e => console.log(e));
  }

  /**
   * @name mixpanelLogEvents
   * @description Mixpanel analytics LogEvents
   * @param event
   * @param params
   */
  mixpanelLogEvents(event: string, params: any) {
    // this.mixpanel.track(event, params)
    //   .then(res => {
    //     // console.log('Mixpanel log event: ' + res);
    //   })
    //   .catch(e => console.log(e));
  }

  /**
   * @name initializeMixpanel
   * @description Initialize Mixpanel: switch Mixpanel token by url context(RO/UK);
   */
  initializeMixpanel() {
    const country = localStorage.getItem('country');
    const url = this.baseURL;

    // if (url === '-prod-api.use-beez.com/') {
    //   // console.log('LIVE');
    //   switch (country) {
    //     case 'ro':
    //       // Mixpanel - Beez RO (live)
    //       this.mixpanel.init('afb95dca0f6de96dc4a0a8636be4f128')
    //         .then(() => { console.log('MixPanel RO live init Success!'); })
    //         .catch(() => { console.log('MixPanel RO live init Error!'); });
    //       break;
    //     case 'uk':
    //       // Mixpanel - Beez UK (live)
    //       this.mixpanel.init('884493c1b05056cdcb2b7d978130de18')
    //         .then(() => { console.log('MixPanel UK live init Success!'); })
    //         .catch(() => { console.log('MixPanel UK live init Error!'); });
    //       break;
    //     default:
    //       // console.log('Country default', country);
    //       // Mixpanel - Beez RO (live)
    //       this.mixpanel.init('afb95dca0f6de96dc4a0a8636be4f128')
    //         .then(() => { console.log('MixPanel RO live init Success!'); })
    //         .catch(() => { console.log('MixPanel RO live init Error!'); });
    //       break;
    //   }
    // } else {
    //   // console.log('TEST');
    //   switch (country) {
    //     case 'ro':
    //       // Mixpanel - Beez RO (test)
    //       this.mixpanel.init('cf619521742a20d4fc9b60cc32fe8026')
    //         .then(() => { console.log('MixPanel RO test init Success!'); })
    //         .catch(() => { console.log('MixPanel RO test init Error!'); });
    //       break;
    //     case 'uk':
    //       // Mixpanel - Beez UK(test)
    //       this.mixpanel.init('474e7dec815819cb3f067963e40eee89')
    //         .then(() => { console.log('MixPanel UK test init Success!'); })
    //         .catch(() => { console.log('MixPanel UK test init Error!'); });
    //       break;
    //     default:
    //       console.log('Country default', country);
    //       this.mixpanel.init('cf619521742a20d4fc9b60cc32fe8026')
    //         .then(() => { console.log('MixPanel RO test init Success!'); })
    //         .catch(() => { console.log('MixPanel RO test init Error!'); });
    //       break;
    //   }
    // }
  }

}
