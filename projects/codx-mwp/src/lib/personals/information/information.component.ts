declare var window: any;
import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ImageViewerComponent,
  UIComponent,
  AuthStore,
  AuthService,
  UserModel,
} from 'codx-core';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { UserInnerComponent } from 'projects/codx-share/src/lib/layout/dropdown-inner/user-inner/user-inner.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  enable?: boolean;
  active?: boolean;
}

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
];

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

const langDefault = languages[0];
const themeDefault = themeDatas[0];
const themeModeDefault = themeModeDatas[0];

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent extends UIComponent implements OnInit {
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  funcID: any;
  formModel: any;
  formModelES: any;
  employeeInfo: any;
  themes = themeDatas;
  themeModes = themeModeDatas;
  theme: ThemeFlag = themeDefault;
  themeMode: ThemeMode = themeModeDefault;
  language: LanguageFlag = langDefault;
  langs = languages;
  popoverList: any;
  data: any;
  isModeAddES = true;
  user$: Observable<UserModel | null> = of(null);

  constructor(
    private injector: Injector,
    private auth: AuthService,
    private authstore: AuthStore,
    private mwpService: CodxMwpService,
    private codxShareSV: CodxShareService,
    private element: ElementRef
  ) {
    super(injector);
    let data: any = this.auth.user$;
    this.employeeInfo = data.source._value;
    this.router.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res)
        this.formModel = {
          entityName: res.entityName,
          entityPer: res.entityName,
          formName: res.formName,
          gridViewName: res.gridViewName,
          funcID: this.funcID,
        };
    });
    this.cache.functionList('ESS21').subscribe((x) => {
      if (x)
        this.formModelES = {
          entityName: x.entityName,
          entityPer: x.entityName,
          formName: x.formName,
          gridViewName: x.gridViewName,
          funcID: 'ESS21',
        };
    });
    this.setLanguage(this.auth.userValue?.language?.toLowerCase());
    if (environment.themeMode == 'body')
      document.body.classList.add('codx-theme');
    if (!this.auth.userValue.theme) this.auth.userValue.theme = 'default';
    this.setTheme(this.auth.userValue.theme.toLowerCase()); //('default');
  }

  onInit(): void {
    this.user$ = this.auth.user$;

    if (environment.themeMode == 'body')
      document.body.classList.add('codx-theme');
    if (!this.auth.userValue.theme) this.auth.userValue.theme = 'default';

    var arr = this.auth.userValue.theme.split('|');
    let th = arr[0],
      thMode = arr.length > 1 ? arr[1] : 'light';

    this.setLanguage(this.auth.userValue?.language?.toLowerCase());
    this.setTheme(th.toLowerCase());
    this.setThemeMode(thMode.toLowerCase());

    this.getSignature();
  }

  getSignature() {
    this.api
      .execSv('ES', 'ES', 'SignaturesBusiness', 'GetByUserIDAsync', [
        this.employeeInfo.userID,
        '2',
      ])
      .subscribe((res) => {
        if (res) {
          this.data = res[0];
          this.isModeAddES = res[1];
        }
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
        if (res) {
          let user = this.authstore.get();
          user.language = l;
          user.theme = t;
          this.auth.userSubject.next(user);
          this.authstore.set(user);
          if (lang) document.location.reload();
        }
      });
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

    // let ele = document.getElementsByTagName('codx-user-inner')[0];
    // if (ele) {
    //   let instances = window.ng.getComponent(ele) as UserInnerComponent;
    //   instances.updateSettting('', value, '');
    // }
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

  changeAvatar(event: any) {
    if (event) {
      this.employeeInfo['modifiedOn'] = new Date();
      this.codxShareSV.dataRefreshImage.next(this.employeeInfo);
    }
  }

  valueChange(e) {}

  dataImageChanged(event: any, type: string) {
    if (event) {
      switch (type) {
        case 'S1': {
          if (event && this.data.signature1 == null) {
            this.data.signature1 = (event[0] as any).recID;
          }
          break;
        }
        case 'S2': {
          if (event && this.data.signature2 == null) {
            this.data.signature2 = (event[0] as any).recID;
          }
          break;
        }
        case 'S3': {
          if (event && this.data.stamp == null) {
            this.data.stamp = (event[0] as any).recID;
          }
          break;
        }
      }
    }
    if (this.isModeAddES)
      this.mwpService.addNewSignature(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.isModeAddES = false;
        }
      });
    else
      this.mwpService.editSignature(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.isModeAddES = false;
        }
      });
  }

  changeCss() {
    let lsLinks = document.getElementsByClassName('ejcss');
    for (let i = 0; i < lsLinks.length; i++) {
      let l: any = lsLinks[i];
      l.href =
        this.themeMode.id == 'dark'
          ? l.href.replace('.css', '-dark.css')
          : l.href.replace('-dark.css', '.css');
    }
  }
}
