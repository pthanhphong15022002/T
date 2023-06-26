import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  UserModel,
  AuthService,
  TenantStore,
  NotificationsService,
  CodxService,
  CacheService,
  MenuComponent,
  ApiHttpService,
  AuthStore,
  CallFuncService,
  AlertConfirmInputConfig,
  FilesService,
} from 'codx-core';
import { Observable, of, Subscription } from 'rxjs';
import { CodxShareService } from '../../../codx-share.service';
import { environment } from 'src/environments/environment';
import { CodxClearCacheComponent } from '../../../components/codx-clear-cache/codx-clear-cache.component';
import { SignalRService } from '../../drawers/chat/services/signalr.service';
import { CodxCreateIndexComponent } from '../../../components/codx-create-index/codx-create-index.component';

@Component({
  selector: 'codx-user-inner',
  templateUrl: './user-inner.component.html',
  styleUrls: ['./user-inner.component.scss'],
})
export class UserInnerComponent implements OnInit, OnDestroy {
  // @HostBinding('class') class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-325px`;
  // @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';
  @HostBinding('class') class = 'd-flex align-items-center';
  @Output() onAvatarChanged = new EventEmitter<any>();
  @Input() user: any;
  @Input() buttonMarginClass: any;
  @Input() hasMenu: boolean = true;
  tenant?: string;
  themeMode: ThemeMode = themeModeDefault;
  language: LanguageFlag = langDefault;
  theme: ThemeFlag = themeDefault;
  user$: Observable<UserModel | null> = of(null);
  langs = languages;
  themes = themeDatas;
  themeModes = themeModeDatas;
  private unsubscribe: Subscription[] = [];
  functionList: any;
  formModel: any;
  modifiedOn = new Date();
  sysSetting;
  constructor(
    public codxService: CodxService,
    private auth: AuthService,
    private authstore: AuthStore,
    private tenantStore: TenantStore,
    private notifyService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    private codxShareSV: CodxShareService,
    private change: ChangeDetectorRef,
    private element: ElementRef,
    private signalRSV: SignalRService,
    private callSV: CallFuncService,
    private fileSv: FilesService
  ) {
    this.cache.functionList('ADS05').subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.formModel = {
          formName: this.functionList.formName,
          gridViewName: this.functionList.gridViewName,
        };
      }
    });
    this.cache.systemSetting().subscribe((res) => {
      console.log('systemSet', res);
      this.sysSetting = res;
    });
  }

  ngOnInit(): void {
    this.user$ = this.auth.user$;
    if (!this.user) this.user = this.authstore.get();
    this.tenant = this.tenantStore.get()?.tenant;
    this.setLanguage(this.auth.userValue?.language?.toLowerCase());

    if (environment.themeMode == 'body')
      document.body.classList.add('codx-theme');
    if (!this.auth.userValue.theme) this.auth.userValue.theme = 'default';

    var arr = this.auth.userValue.theme.split('|');
    let th = arr[0],
      thMode = arr.length > 1 ? arr[1] : 'light';

    this.setTheme(th.toLowerCase());
    this.setThemeMode(thMode.toLowerCase());
    // if (this.functionList) {

    // }
  }

  ngAfterViewInit() {
    MenuComponent.reinitialization();
    MenuComponent.createInstances('[data-kt-menu="true"]');
  }

  logout() {
    // let ele = document.getElementsByTagName('codx-chat-container');
    // if (ele.length > 0) {
    //   ele[0].remove();
    // }
    // this.signalRSV.sendData('LogOutAsync', this.user.tenant, this.user.userID);
    // this.auth.logout('');
    this.codxShareSV.logout();
    // document.location.reload();
  }

  updateSettting(lang: string, theme: string, themeMode: string) {
    let l = '',
      t = '';
    if (lang) {
      this.setLanguage(lang);
      l = this.language.lang.toUpperCase();
    }
    if (theme) {
      this.setTheme(theme);
      t = this.theme.id + '|' + this.themeMode.id;
    }
    if (themeMode) {
      this.setThemeMode(themeMode);
      t = this.theme.id + '|' + this.themeMode.id;
    }

    this.api
      .execSv('SYS', 'AD', 'SystemFormatBusiness', 'UpdateSettingAsync', [l, t])
      .subscribe((res: any) => {
        var user = this.authstore.get();
        user.language = l;
        user.theme = t;
        this.auth.userSubject.next(user);
        this.authstore.set(user);
        if (lang) document.location.reload();
      });
  }

  setLanguage(lang?: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  selectTheme(theme: string) {
    //this.setTheme(theme);
    this.updateSettting('', theme, '');
    // document.location.reload();
  }

  setTheme(value: string) {
    //check exist list theme
    let findtheme = this.themes.find((x) => x.id == value);
    if (!findtheme) value = 'default';
    //Remove Old
    let elm =
      environment.themeMode == 'body'
        ? document.body
        : this.element.nativeElement.closest('.codx-theme');
    if (this.theme && elm) {
      elm.classList.remove(this.theme.id);
    }

    this.themes.forEach((theme: ThemeFlag) => {
      if (theme.id === value) {
        theme.active = true;
        this.theme = theme;

        elm.classList.add(this.theme.id);
      } else {
        theme.active = false;
      }
    });
  }

  setThemeMode(value: string) {
    //check exist list theme
    let findThemeMode = this.themeModes.find((x) => x.id == value);
    if (!findThemeMode) value = 'light';

    //Remove Old
    let elm =
      environment.themeMode == 'body'
        ? document.body
        : this.element.nativeElement.closest('.codx-theme');
    if (this.themeMode && elm) {
      elm.classList.remove(this.themeMode.id);
    }

    this.themeModes.forEach((themeMode: ThemeMode) => {
      if (themeMode.id === value) {
        themeMode.active = true;
        this.themeMode = themeMode;

        elm.classList.add(this.themeMode.id);
      } else {
        themeMode.active = false;
      }
    });

    this.changeCss();
  }

  avatarChanged(data: any) {
    this.onAvatarChanged.emit(data);
    this.modifiedOn = new Date();
    this.fileSv.dataRefreshImage.next(this.user);
  }

  clearCache() {
    this.callSV.openForm(CodxClearCacheComponent, 'Clear cache', 500, 700);
    // this.auth
    //   .clearCache()
    //   .pipe()
    //   .subscribe((data) => {
    //     if (data) {
    //       if (!data.isError) this.notifyService.notifyCode('SYS017');
    //       else this.notifyService.notify(data.error);
    //     }
    //   });
  }

  runCompare() {
    var config = new AlertConfirmInputConfig();
    // config.type = 'YesNo';
    this.notifyService
      .alert(
        'Cánh báo',
        '<span style="color: red">ĐÂY LÀ CHỨC NĂNG NGUY HIỂM!!!! bạn có chắc chắn muốn thực hiện không???</span><div><a href="tel:+84363966390">Gọi hỗ trợ</a></div><div><a href="mailto:Quangvovan22@gmail.com">Gửi mail hỗ trợ</a></div>'
        //config
      )
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          this.api
            .execSv('SYS', 'SYS', 'UpdatesBusiness', 'UpdateDataAsync', [])
            .subscribe((res) => {
              if (res) this.notifyService.notify('Đã compare xong');
              console.log(res);
            });
        }
      });
  }

  createIndex() {
    this.callSV.openForm(CodxCreateIndexComponent, 'Create Index', 700, 700);
  }

  clearTenant() {
    // var config = new AlertConfirmInputConfig();
    // config.type = 'text';
    // config.label = 'predicate';
    // this.notifyService
    //   .alert(
    //     'Cánh báo',
    //     '<span style="color: red">CHỨC NĂNG NÀY SẼ XÓA CÁC TENANT HIỆN TẠI THEO ĐIỀU KIỆN!!!! VUI LÒNG BACKUP DATA TRƯỚC KHI THỰC HIỆN!!! XIN CẢM ƠN!!!</span><div><a href="tel:+84363966390">Gọi hỗ trợ</a></div><div><a href="mailto:Quangvovan22@gmail.com">Gửi mail hỗ trợ</a></div>',
    //     config
    //   )
    //   .closed.subscribe((x) => {
    //     debugger;
    //     if (x.event && x.event.status == 'Y' && x.event.data) {
    //       this.api
    //         .execSv('Tenant', 'Tenant', 'TenantsBusiness', 'DropTenantAsync', [
    //           x.event.data,
    //         ])
    //         .subscribe((res) => {
    //           if (res) console.log(res);
    //         });
    //     }
    //   });
  }

  testFormatString() {
    this.api
      .callSv('SYS', 'ERM.Business.Core', 'CMBusiness', 'ReplaceStringAsync', [
        '',
        null,
      ])
      .subscribe((res) => {
        console.log(res);
      });
  }

  createTemplate() {
    this.api
      .callSv('SYS', 'ERM.Business.Core', 'CMBusiness', 'CreateTemplateAsync', [
        'HRS0211',
      ])
      .subscribe((res) => {
        debugger;
        var sampleArr = this.base64ToArrayBuffer(res);
        this.saveByteArray('excel', sampleArr);
        console.log(res);
      });
  }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  changePass() {
    this.tenant;
    var url = `auth/login`;
    this.codxService.navigate(null, url, { id: 'changePass' });
  }

  changeCss() {
    var lsLinks = document.getElementsByClassName('ejcss');
    for (let i = 0; i < lsLinks.length; i++) {
      let l: any = lsLinks[i];
      l.href =
        this.themeMode.id == 'dark'
          ? l.href.replace('.css', '-dark.css')
          : l.href.replace('-dark.css', '.css');
    }
  }
  // link my profile
  myProfile() {
    debugger;
    this.codxService.navigate('MWP009', '', { funcID: 'MWP009' });
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  enable?: boolean;
  active?: boolean;
}

const languages: LanguageFlag[] = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
    enable: true,
  },
  {
    lang: 'vn',
    name: 'Việt Nam',
    flag: './assets/media/flags/vietnam.svg',
    enable: true,
  },
];

const langDefault = languages[0];

interface ThemeFlag {
  id: string;
  name: string;
  color: string;
  enable?: boolean;
  active?: boolean;
}

interface ThemeMode {
  id: string;
  name: string;
  icon: string;
  active?: boolean;
}

const themeDatas: ThemeFlag[] = [
  {
    id: 'default',
    name: 'Default',
    color: '#005DC7',
    enable: true,
  },
  {
    id: 'orange',
    name: 'Orange',
    color: '#f15711',
    enable: true,
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    color: '#009384',
    enable: true,
  },
  {
    id: 'green',
    name: 'Green',
    color: '#0f8633',
    enable: true,
  },
  {
    id: 'purple',
    name: 'Purple',
    color: '#5710b2',
    enable: true,
  },
  {
    id: 'navy',
    name: 'Navy',
    color: '#192440',
    enable: true,
  },
];

const themeDefault = themeDatas[0];

const themeModeDatas: ThemeMode[] = [
  {
    id: 'light',
    name: 'Light',
    icon: './assets/media/svg/light.svg',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: './assets/media/svg/dark.svg',
  },
];
const themeModeDefault = themeModeDatas[0];
