// country-env-api.use-beez.com

export const environment = {
  production: true,
  mixpanelToken: 'd9aaa06e882aac726e751378c9cadea2',
  // full path example https://ro-prod-api.use-beez.com
  /* LIVE */
  // headlessCmsUrl: 'https://cdn-live-headless-cms.azureedge.net/',
  headlessCmsUrl: 'https://cdn-prod-headless-cms.azureedge.net/',
  apiURL : '-prod-api.use-beez.com/',

  /* TESTING */
  // apiURL : '-testapi.use-beez.com/',

  // update rate in milisecond for the sweet deal fund
  fundSweetDealUpdate: 10000
};
