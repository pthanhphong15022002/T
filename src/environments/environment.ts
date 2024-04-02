export const environment = {
  production: false,
  isDesign: false,
  mutiTenant: true,
  isUserBankHub: false,
  dfPe: '',
  appVersion: 'v101lv',
  TNKey: 'tnf649fc9a5f55',
  shopping: '',
  reportUrl: '',
  apiUrl: '',
  bankhubUrl: '',
  pdfUrl: '',
  urlUpload: '',
  office365: '',
  appName: '',
  saas: 1,
  themeMode: 'body', //layout,
  hideFavCount: false,
  singleExec: false,
  asideMinimize: 'icon-title',
  loginHCS: '',
  layout: {
    id: 'lacviet',
    title: '',
    icon: '',
    logo: '',
    appleStore: '',
    playStore: '',
  },
  asideMode: '1',
  externalLogin: {
    amazonId: '',
    facebookId: '',
    googleId:
      '1004809784960-375udeskttcpr03e0pqshf0hpococ0vq.apps.googleusercontent.com',
    microsoftId: '',
  },
  SureMeet: {
    baseUrl: 'https://api.suremeet.vn/',
    tokenUrl: 'api/auth/token',
    addUpdateMeetingUrl: 'PublicMeeting/AddUpdate',
    connectMettingUrl: 'PublicMeeting/Verify',
    client_id: 'portal',
    client_secret: 'lacviet@2022@$%!$$!(@',
    app_id: 'demo.suremeet@gmail.com',
    app_secret: '123456',
  },
  lvai: {
    Url: 'https://api.trogiupluat.vn/api/Chat/v1/document/upload?api-version=1.0',
    API_KEY:
      'NDgyMTEzZTcOGVjZGEMjVmNmVlNzVjMDBjMUwYTUNmMyZWExZGRiNQNGJiNTAwMjcMTdiMjNiYWIYQ',
    AgentDocumentId: '65ee834213439ba7df12c269',
  },
  captchaKey: '6LctVdwkAAAAAF_yJPT2NGF2SvEpCKyLS4t68Ps1',
  captchaEnable: 0,

  firebase: {
    apiKey: 'AIzaSyC1SKqppxpxwT7i3qEdUjJjn-J_SMoUBic',
    authDomain: 'ermtest-2a9bb.firebaseapp.com',
    projectId: 'ermtest-2a9bb',
    storageBucket: 'ermtest-2a9bb.appspot.com',
    messagingSenderId: '319703529330',
    appId: '1:319703529330:web:d0569f86d85524c1ca0feb',
    measurementId: 'G-HH40VHYRF0',
  },
  multiService: {
    active: false,
    mapping:
      'BG,BI,BP,CM,CO,DM,DP,EI,EP,ES,FD,OD,OM,PM,RP,SV,WP|sv1;AC,AM,AR,BS,HR,IV,PS,PR,SM,SYS,Tenant,TM,TR,WR|sv2',
  },
  serviceMapping: {
    RP: {
      service: 'rptrp',
      assemblyName: 'Codx.RptBusiness.RP',
    },
    LS: {
      service: 'HR',
    },
    TS: {
      service: 'HR',
    },
    PR: {
      service: 'HR',
    },
  },
};
