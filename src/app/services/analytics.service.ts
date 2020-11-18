import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import Analytics from 'analytics';
import segmentPlugin from '@analytics/segment';
import '@capacitor-community/firebase-analytics';
import { Plugins } from '@capacitor/core';

const { FirebaseAnalytics, Device } = Plugins;
const analytics = Analytics({
  app: 'food-marketplace-by-beez',
  plugins: [
    segmentPlugin({
      writeKey: environment.segmentKey
    })
  ]
});

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  username: string;
  baseURL = environment.apiURL;

  constructor(
    private platform: Platform,
    private mixpanel: Mixpanel,
    private facebook: Facebook,
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
      this.segmentLogEvents(event, eventParams);
    } else {
      console.log('Skip analytics');
    }
  }

  /**
   * @description Identify visitors and send details to Segment
   */
  async segmentIdentify() {
    const info = await Device.getInfo();
    analytics.identify(localStorage.getItem('userExternalId'), {
      email: localStorage.getItem('userName'),
      country: localStorage.getItem('country'),
      deviceInfo: {
        appVersion: info.appVersion,
        platform: info.platform,
        osVersion: info.osVersion,
        deviceManufacturer: info.manufacturer,
        deviceModel: info.model
      },
      appVersion: info.appVersion
    });
  }

  /**
   * @description Track custom events and send to Segment
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
    this.facebook.logEvent(event, params)
      .then(res => {
        // console.log('Facebook log event: ' + res);
      })
      .catch(e => console.log(e));
  }

  /**
   * === FIREBASE ===
   * ================
   */

   /**
    * @name firebaseIdentifyUser
    * @description Set user id to Firebase
    * @param uid
    */
  async firebaseIdentifyUser(uid: string) {
    FirebaseAnalytics.setUserId({ userId: uid});
  }

  /**
   * @name firebaseLogEvents
   * @description Firebase analytics LogEvents
   * @param event
   * @param params
   */
  firebaseLogEvents(event: string, params: any) {
    FirebaseAnalytics.logEvent({ name: event, params })
      .then(res => {
        console.log('Firebase log event: ' + res);
      })
      .catch(e => console.log(e));
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
