// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Mixpanel Analytics token
  mixpanelToken: 'acb76fcf96e63e58ac23a4494b4a4937',

  // Stripe token - payment procesor
  stripeToken: 'pk_test_rGzVsaLqy9AQSvCCWhCaNxVK00GhrAj3U5',
  // full path example https://ro-prod-api.use-beez.com
  // Test URL
  // country-env-api.use-beez.com
  apiURL : '-test-api.use-beez.com/',
  // apiURL: '-prod-api.use-beez.com/',


  // headless cms url
  // test
  // headlessCmsUrl: 'https://cdn-test-headless-cms.azureedge.net/',
  // live
  headlessCmsUrl: 'https://cdn-prod-headless-cms.azureedge.net/',
  // update rate in milisecond for the sweet deal fund
  fundSweetDealUpdate: 10000
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
