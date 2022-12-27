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
} from 'codx-core';
import { Observable, of, Subscription } from 'rxjs';
import { CodxShareService } from '../../../codx-share.service';
import { environment } from 'src/environments/environment';
import { CodxClearCacheComponent } from '../../../components/codx-clear-cache/codx-clear-cache.component';
import { T } from '@angular/cdk/keycodes';

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
    private change: ChangeDetectorRef,
    private element: ElementRef,
    private callSV: CallFuncService
  ) {
    this.cache.functionList('ADS05').subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  ngOnInit(): void {
    this.user$ = this.auth.user$;
    this.tenant = this.tenantStore.get()?.tenant;
    this.setLanguage(this.auth.userValue?.language?.toLowerCase());

    if (environment.themeMode == 'body')
      document.body.classList.add('codx-theme');

    this.setTheme(
      this.auth.userValue.theme
        ? this.auth.userValue.theme.toLowerCase()
        : 'default'
    ); //('default');
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

  updateSettting(lang: string, theme: string) {
    if (lang) this.setLanguage(lang);
    if (theme) this.setTheme(theme);
    var l = this.language.lang.toUpperCase();
    this.api
      .execSv('SYS', 'AD', 'SystemFormatBusiness', 'UpdateSettingAsync', [
        l,
        theme,
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
    //this.setTheme(theme);
    this.updateSettting('', theme);
    // document.location.reload();
  }

  setTheme(value: string) {
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

  avatarChanged(data: any) {
    this.onAvatarChanged.emit(data);
    let modifiedOn = new Date();
    var obj = { modifiedOn: modifiedOn };
    this.codxShareSV.dataRefreshImage.next(obj);
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
    color: '#ff7213',
    enable: true,
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    color: '#23d3c1',
    enable: true,
  },
  {
    id: 'green',
    name: 'Green',
    color: '#15b144',
    enable: true,
  },
];

const themeDefault = themeDatas[0];
