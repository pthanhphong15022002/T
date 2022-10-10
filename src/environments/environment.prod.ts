export const environment = {
  production: false,
  isDesign: false,
  mutiTenant: true,
  dfPe: '',
  appVersion: 'v101lv',
  TNDATA_KEY: 'tnf649fc9a5f55',
  apiUrl: 'http://172.16.7.34:8011',
  librOfficeUrl: 'http://172.16.7.33:9980/loleaflet/2afbc52/loleaflet.html',
  pdfUrl: 'http://172.16.7.34:8015/api/pdf',
  shopping: 'http://172.16.7.34:8111/Shopping',
  urlUpload: 'http://172.16.1.210:8011',
  urlTenant: '',
  urlThumbnail: 'http://172.16.1.210:8011',
  urlFile: 'http://172.16.1.210:8011',
  reportUrl: '',
  appName: 'hps-file-test', // Tam thoi de hard
  StoreNames: {
    FormLabels: 'FormLabels',
    GridViewSetups: 'GridViewSetups',
    ComboBoxSettings: 'ComboBoxSettings',
    ValueListDatas: 'ValueListDatas',
    ComboBoxDatas: 'ComboBoxDatas',
    SYS: 'SYS',
    Images: 'Images'
  },
  firebase: {
    apiKey: "AIzaSyC1SKqppxpxwT7i3qEdUjJjn-J_SMoUBic",
    authDomain: "ermtest-2a9bb.firebaseapp.com",
    projectId: "ermtest-2a9bb",
    storageBucket: "ermtest-2a9bb.appspot.com",
    messagingSenderId: "319703529330",
    appId: "1:319703529330:web:d0569f86d85524c1ca0feb",
    measurementId: "G-HH40VHYRF0"
  },
  FCMToken: "",
  IMGEXTENSION: ["png", "jpeg", "jpg", "bmp"],
  jsonType: [
    {
      name: 'Owner',
      value: '1',
      icon: 'supervised_user_circle',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: false,
      moreFuntion: false
    },
    {
      name: 'My group',
      value: '2',
      icon: 'groups',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: true,
      moreFuntion: false
    },
    {
      name: 'My team',
      value: '3',
      icon: 'supervised_user_circle',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: true,
      moreFuntion: false
    },
    {
      name: 'My Department',
      value: '4',
      icon: 'device_hub',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: true,
      moreFuntion: false
    },
    {
      name: 'My Division',
      value: '5',
      icon: 'account_tree',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: true,
      moreFuntion: false
    },
    {
      name: 'My company',
      value: '6',
      icon: 'computer',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: true,
      moreFuntion: false
    },
    {
      name: 'Administrator',
      value: '7',
      icon: 'manage_accounts',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: false,
      moreFuntion: false
    },
    {
      name: 'Everyone',
      value: '9',
      icon: 'language',
      icon2: 'task_alt',
      icon3: 'radio_button_unchecked',
      show: false,
      moreFuntion: false
    },
    {
      name: 'OrgHierachy',
      value: 'O',
      icon: 'data_exploration',
      icon2: 'keyboard_arrow_right',
      icon3: '',
      show: false,
      moreFuntion: true
    },
    {
      name: 'Departments',
      value: 'D',
      icon: 'home',
      icon2: 'keyboard_arrow_right', icon3: '',
      show: true,
      moreFuntion: true
    },
    {
      name: 'Positions',
      value: 'P',
      icon: 'person_pin_circle',
      icon2: 'keyboard_arrow_right', icon3: '',
      show: true,
      moreFuntion: true
    },
    {
      name: 'Roles',
      value: 'R',
      icon: 'local_offer',
      icon2: 'keyboard_arrow_right', icon3: '',
      show: true,
      moreFuntion: true
    },
    {
      name: 'Group',
      value: 'G',
      icon: 'group',
      icon2: 'keyboard_arrow_right', icon3: '',
      show: true,
      moreFuntion: true
    },
    {
      name: 'Users',
      value: 'U',
      icon: 'person',
      icon2: 'keyboard_arrow_right', icon3: '',
      show: true,
      moreFuntion: true
    },
  ],
};
