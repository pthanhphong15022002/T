export abstract class AppConfig {
  isUserBankHub: boolean;
  shopping: string;
  apiUrl: string;
  urlUpload: string;
  bankhubUrl: string;
  appName: string;
  reportUrl: string;
  office365: string;
  saas: number;
  layout: any;
  asideMode: string;
  themeMode: string;
  hideFavCount: boolean;
  singleExec: boolean;
  asideMinimize: string;
  lvai: any;
  sureMeet: any;
  firebase: any;
  captchaKey: string;
  captchaEnable: number;
  externalLogin: ExternalLogin;
  loginHCS: string;
  multiService: any;
  serviceMapping: any;
}

export abstract class ExternalLogin {
  amazonId: string;
  facebookId: string;
  googleId: string;
  microsoftId: string;
}
