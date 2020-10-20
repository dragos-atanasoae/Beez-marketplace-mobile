import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';

const { Device } = Plugins;
// Segment analytics
declare var analytics;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  username: string;
  baseURL = environment.apiURL;

  constructor(
    private platform: Platform,
    private mixpanel: Mixpanel,
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
   * === MIXPANEL ===
   * ================
   */

  /**
   * @name mixpanelLogEvents
   * @description Mixpanel analytics LogEvents
   * @param event
   * @param params
   */
  mixpanelLogEvents(event: string, params: any) {
    this.mixpanel.track(event, params)
      .then(res => {
        // console.log('Mixpanel log event: ' + res);
      })
      .catch(e => console.log(e));
  }

  /**
   * @name initializeMixpanel
   * @description Initialize Mixpanel: switch Mixpanel token by environment(dev/prod);
   */
  initializeMixpanel() {
    this.mixpanel.init(environment.mixpanelToken)
            .then(() => { console.log('Mixpanel init Success!'); })
            .catch(() => { console.log('Mixpanel init Error!'); });
  }

}
