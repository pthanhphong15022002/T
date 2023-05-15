export abstract class AppConfig {
  shopping: string;
  apiUrl: string;
  urlUpload: string;
  appName: string;
  reportUrl: string;
  office365: string;
  saas: number;
  layoutCZ: string;
  layout: any;
  themeMode: string;
  hideFavCount: boolean;
  singleExec: boolean;
  asideMinimize: string;
  sureMeet: any;
  firebase: any;
  captchaKey: string;
  captchaEnable: number;
  externalLogin: ExternalLogin;
}

export abstract class ExternalLogin {
  amazonId: string;
  facebookId: string;
  googleId: string;
  microsoftId: string;
}
