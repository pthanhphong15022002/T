export abstract class AppConfig {
  shopping: string;
  apiUrl: string;
  urlUpload: string;
  appName: string;
  reportUrl: string;
  office365: string;
  saas: number;
  layoutCZ: string;
  themeMode: string;
  sureMeet: any;
  firebase: any;
  reCaptchaKey: string;
  reCaptchaEnable: number;
  externalLogin: ExternalLogin;
}

export abstract class ExternalLogin {
  amazonId: string;
  facebookId: string;
  googleId: string;
  microsoftId: string;
}

