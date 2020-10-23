// country-env-api.use-beez.com

export const environment = {
  production: true,
  // MIXPANEL Analytics token
  mixpanelToken: 'd9aaa06e882aac726e751378c9cadea2',

  // SEGMENT Analytics
  segmentKey: 'A6OxiEA3BZ62zEAsLdBEehxukjiL3Xef',

  // STRIPE token - payment procesor
  stripeToken: 'pk_live_NuLbq6PSfgLbYZNTWvuURv5B00er7SXsoR',

  // HEADLESS CMS
  // headlessCmsUrl: 'https://cdn-live-headless-cms.azureedge.net/',
  headlessCmsUrl: 'https://cdn-prod-headless-cms.azureedge.net/',

  /* LIVE API URL */
  // full path example https://ro-prod-api.use-beez.com
  apiURL : '-prod-api.use-beez.com/',

  // update rate in milisecond for the sweet deal fund
  fundSweetDealUpdate: 10000
};
