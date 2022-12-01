import {
  ChangeDetectorRef,
  Component,
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
} from 'codx-core';
import { Observable, of, Subscription } from 'rxjs';
import { CodxShareService } from '../../../codx-share.service';

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

  tenant?: string;
  language: LanguageFlag = langDefault;
  theme: ThemeFlag = themeDefault;
  user$: Observable<UserModel | null> = of(null);
  langs = languages;
  themes = themeDatas;
  private unsubscribe: Subscription[] = [];
  functionList: any;
  formModel: any;

  constructor(
    public codxService: CodxService,
    private auth: AuthService,
    private authstore: AuthStore,
    private tenantStore: TenantStore,
    private notifyService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    private codxShareSV: CodxShareService,
    private change: ChangeDetectorRef
  ) {
    this.cache.functionList('ADS05').subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  ngOnInit(): void {
    this.user$ = this.auth.user$;
    this.tenant = this.tenantStore.get()?.tenant;
    this.setLanguage(this.auth.userValue?.language?.toLowerCase());
    this.selectTheme('default'); //(this.auth.userValue.theme.toLowerCase());
    if (this.functionList) {
      this.formModel = {
        formName: this.functionList?.formName,
        gridViewName: this.functionList?.gridViewName,
      };
    }
    this.refreshAvatar();
  }

  ngAfterViewInit() {
    MenuComponent.reinitialization();
  }

  refreshAvatar() {
    //Nguyên thêm để refresh avatar khi change
    this.codxShareSV.dataRefreshImage.subscribe((res) => {
      if (res) {
        debugger
        this.user['modifiedOn'] = res?.modifiedOn;
        this.change.detectChanges();
      }
    });
  }

  mouseEnter(ele: any, sub: any) {
    // let menuInstance = MenuComponent.getInstance(ele);
    // if (menuInstance) menuInstance.show(ele);
  }

  logout() {
    this.auth.logout();
    document.location.reload();
  }

  selectLanguage(lang: string) {
    this.setLanguage(lang);
    var l = this.language.lang.toUpperCase();
    this.api
      .execSv('SYS', 'AD', 'SystemFormatBusiness', 'UpdateSettingAsync', [
        l,
        '',
      ])
      .subscribe((res: UserModel) => {
        this.auth.userSubject.next(res);
        //this.auth.startRefreshTokenTimer();
        this.authstore.set(res);
        document.location.reload();
      });
    this.cache.systemSetting().subscribe((systemSetting: any) => {
      systemSetting.language = this.language.lang.toUpperCase();
      var user = this.authstore.get();
      // this.user$.subscribe((user) => {
      //   user.language = this.language.lang.toUpperCase();
      //   this.auth.userSubject.next(user);
      //   //this.auth.startRefreshTokenTimer();
      //   this.authstore.set(user);
      // });
      this.api
        .execAction('AD_SystemSettings', [systemSetting], 'UpdateAsync')
        .subscribe((res) => {
          if (res) {
            user.language = this.language.lang.toUpperCase();
            //this.auth.stopRefreshTokenTimer();
            //this.authstore.remove();
            //this.auth.userValue = null;
            this.auth.userSubject.next(user);
            //this.auth.startRefreshTokenTimer();
            this.authstore.set(user);
            document.location.reload();
          }
        });
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
    this.setTheme(theme);
    // document.location.reload();
  }

  setTheme(value: string) {
    this.themes.forEach((theme: ThemeFlag) => {
      if (theme.id === value) {
        theme.active = true;
        this.theme = theme;
      } else {
        theme.active = false;
      }
    });
  }

  avatarChanged(data: any) {
    this.onAvatarChanged.emit(data);
  }

  clearCache() {
    this.auth
      .clearCache()
      .pipe()
      .subscribe((data) => {
        if (data) {
          if (!data.isError) this.notifyService.notifyCode('SYS017');
          else this.notifyService.notify(data.error);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  changePass() {
    this.tenant;
    var url = `auth/login`;
    this.codxService.navigate(null, url, { id: 'changePass' });
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

const themeDatas: ThemeFlag[] = [
  {
    id: 'default',
    name: 'Default',
    color: '#187de4',
    enable: true,
  },
  {
    id: 'orange',
    name: 'Orange',
    color: '#f36519',
  },
  {
    id: 'pink',
    name: 'Pink',
    color: '#f70f8f',
  },
];

const themeDefault = themeDatas[0];
