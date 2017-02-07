
// Angular 2
// rc2 workaround
import { enableDebugTools, disableDebugTools } from '@angular/platform-browser';
import { enableProdMode, ApplicationRef } from '@angular/core';
// Environment Providers
let PROVIDERS: any[] = [
  // common env directives
];

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T { return value; };

if ('production' === ENV || 'renderer' === ENV) {
  // Production
  disableDebugTools();
  enableProdMode();

  PROVIDERS = [
    ...PROVIDERS,
    // custom providers in production
  ];

} else {

  _decorateModuleRef = (modRef: any) => {
    const appRef = modRef.injector.get(ApplicationRef);
    const cmpRef = appRef.components[0];

    let _ng = (<any>window).ng;
    enableDebugTools(cmpRef);
    (<any>window).ng.probe = _ng.probe;
    (<any>window).ng.coreTokens = _ng.coreTokens;
    return modRef;
  };

  // Development
  PROVIDERS = [
    ...PROVIDERS,
    // custom providers in development
  ];

}

export const decorateModuleRef = _decorateModuleRef;

export const ENV_PROVIDERS = [
  ...PROVIDERS
];

// AWS environment information
export const environment = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_nK9lmbtmz',
  clientId: '5gaaqldcqbc3ea00l745673om',
  identityPoolId: 'us-east-1:f0f95abf-97ad-454b-8e3c-6e905d68f6c9',
  // fineo's test key
  stripeToken: 'pk_test_MObz3yYND5vPL1pp09pjawWy',

  // urls for fineo services
  urls: {
    stream: "https://wj7mcwo8vg.execute-api.us-east-1.amazonaws.com/prod",
    schema: "https://kgtq36jvac.execute-api.us-east-1.amazonaws.com/prod",
    batch: "https://mo2n9uyzo4.execute-api.us-east-1.amazonaws.com/prod",
    meta: "https://q5zrhiqdx4.execute-api.us-east-1.amazonaws.com/prod"
  }
};

if ('production' === ENV ) {
  // fineo's live, publishable, production key
  environment.stripeToken =  'pk_live_qISv2nPFzdZkrDVdjrutvRpV'
}

