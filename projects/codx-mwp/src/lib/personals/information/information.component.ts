import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import {
  ImageViewerComponent,
  UIComponent,
  AuthStore,
  AuthService,
  UserModel,
} from 'codx-core';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent extends UIComponent implements OnInit {
  funcID: any;
  formModel: any;
  formModelES: any;
  employeeInfo: any;
  themes = themeDatas;
  theme: ThemeFlag = themeDefault;
  language: LanguageFlag = langDefault;
  langs = languages;
  popoverList: any;
  data: any;
  isModeAddES = true;

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;

  constructor(
    private injector: Injector,
    private auth: AuthService,
    private authstore: AuthStore,
    private mwpService: CodxMwpService,
    private codxShareSV: CodxShareService
  ) {
    super(injector);
    var data: any = this.auth.user$;
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
    this.selectTheme('default');
  }

  onInit(): void {
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
        this.authstore.set(res);
        document.location.reload();
      });
    this.cache.systemSetting().subscribe((systemSetting: any) => {
      systemSetting.language = this.language.lang.toUpperCase();
      var user = this.authstore.get();
      this.api
        .execAction('AD_SystemSettings', [systemSetting], 'UpdateAsync')
        .subscribe((res) => {
          if (res) {
            user.language = this.language.lang.toUpperCase();
            this.auth.userSubject.next(user);
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
      this.mwpService.addNewSignature(this.data).subscribe();
    else this.mwpService.editSignature(this.data).subscribe();
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
