export const environment = {
  production: false,
  isDesign: false,
  mutiTenant: true,
  isUserBankHub: false,
  dfPe: '',
  appVersion: 'v101lv',
  TNDATA_KEY: 'tnf649fc9a5f55',
  apiUrl: 'http://172.16.7.34:8011',
  pdfUrl: 'http://172.16.7.34:8015/api/pdf',
  shopping: 'http://172.16.7.34:8111/Shopping',
  urlUpload: 'http://172.16.1.210:8011',
  bankhubUrl: '',
  office365: 'https://view.officeapps.live.com/op/view.aspx?src=',
  reportUrl: '',
  appName: 'hps-file-test', // Tam thoi de hard
  saas: 0,
  tenantFirst: true,
  themeMode: 'body', //layout
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
    Active: false,
    Mongo: 'BG,BI,BP,CM,CO,DM,DP,EI,EP,ES,FD,OD,OM,PM,RP,SV,WP',
    Postgre: 'AC,AM,AR,BS,HR,IV,PS,PR,SM,SYS,Tenant,TM,TR,WR',
    ReportMongo: 'RPTBP,RPTCM,RPTDM,RPTDP,RPTEP,RPTES,RPTOD,RPTOM,RPTRP,RPTSV',
    ReportPostgre:
      'RPTAC,RPTAD,RPTAM,RPTHR,RPTIV,RPTSM,RPTTenant,RPTTM,RPTPR,RPTTR',
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
