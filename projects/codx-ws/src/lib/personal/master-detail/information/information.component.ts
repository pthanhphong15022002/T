import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CodxInputComponent, CodxService } from 'codx-core';
import { CodxWsService } from '../../../codx-ws.service';
import { isObservable } from 'rxjs';
import { label } from './infomation.variable';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { LoginSercurityComponent } from './login-sercurity/login-sercurity.component';
import { SercurityTOTPComponent } from './sercurity-totp/sercurity-totp.component';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';

@Component({
  selector: 'lib-information',
  templateUrl:'./information.component.html',
  styleUrls: ['./information.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InformationComponent implements OnInit{
  @Input() menuFunctionID:any;
  @ViewChild('ipTwoFA') ipTwoFA: CodxInputComponent;

  adUser:any;
  user:any;
  label = label;
  language
  themes = themeDatas;
  hasES = false;
  dataSignatures:any;
  formModelES:any;
  isModeAddES = true;

  constructor(
    private api: ApiHttpService,
    private authstore: AuthStore,
    private wsService: CodxWsService,
    private codxCmService: CodxCommonService,
    private cacheService: CacheService,
    private callFunc: CallFuncService,
    private codxService : CodxService,
    private mwpService: CodxMwpService
  ) 
  {
    this.user = this.authstore.get();
    this.user.positionName = "Thông tin chức vụ"
    this.user.departmentName = "Thông tin phòng ban";
  }
  ngOnInit(): void {
    //Lấy thông tin nhân viên
    this.getHREmployee();
    //Lấy thông tin nhân viên
    this.getADUser();
    //Lấy thông tin themes
    this.getThemes();
    //Lấy thông tin ngôn ngữ
    this.getLanguage();
    //Kiểm tra func có ES k
    this.getFunc();
  }

  getThemes()
  {
    this.codxCmService.isSetThemes.subscribe(item=>{
      this.themes = item
    })
  }
  getLanguage()
  {
    this.codxCmService.isSetLanguage.subscribe(item=>{
      this.language = item
    })
  }
  getHREmployee()
  {
    let paras = [this.user?.userID];
    let keyRoot = "WSHREmloyee" + this.user?.userID;
    var info = this.wsService.loadData(paras,keyRoot,"HR","HR","EmployeesBusiness_Old","GetByDomainUserAsync") as any;
    if(isObservable(info))
    {
      info.subscribe((item:any)=>{
        if(item)
        {
          this.user.positionName = item?.positionName || "Thông tin chức vụ"
          this.user.departmentName = item?.departmentName || "Thông tin phòng ban"
        }
      })
    }
    else
    {
      this.user.positionName = info?.positionName || "Thông tin chức vụ"
      this.user.departmentName = info?.departmentName || "Thông tin phòng ban"
    }
  }

  getFunc()
  {
    let paras = ["VN","ES"];
    let keyRoot = "WSFuncIDCheckES";
    var ws = this.wsService.loadData(paras,keyRoot,"SYS","SYS","FunctionListBusiness","GetAsync") as any;
    if(isObservable(ws))
    {
      ws.subscribe((item:any)=>{
        if(item) {
         this.hasES = true;
         this.getCacheSig();
        }
      })
    }
    else if(ws) {
      this.hasES = true;
      this.getCacheSig();
    }
  }

  getCacheSig()
  {
    this.cacheService.functionList('ESS21').subscribe((x) => {
      if (x)
        this.formModelES = {
          entityName: x.entityName,
          entityPer: x.entityName,
          formName: x.formName,
          gridViewName: x.gridViewName,
          funcID: 'ESS21',
        };
        this.getSignature();
    });
  }
  getSignature() {
    this.api
      .execSv('ES', 'ES', 'SignaturesBusiness', 'GetByUserIDAsync', [
        this.user?.userID,
        '2',
      ])
      .subscribe((res) => {
        if (res) {
          this.dataSignatures= res[0];
          this.isModeAddES = res[1];
        }
      });
  }

  getADUser()
  {
    let paras = [this.user?.userID];
    let keyRoot = "WSADUser" + this.user?.userID;
    var info = this.wsService.loadData(paras,keyRoot,"AD","AD","UsersBusiness","GetUserAsync") as any;
    if(isObservable(info))
    {
      info.subscribe((item:any)=>{
        if(item) {
          this.adUser = item;
          var extend = JSON.parse(this.adUser?.extend)
        }
      })
    }
    else {
      this.adUser = info;
      var extend = JSON.parse(this.adUser?.extend)
    }
  }
  selectTheme(id:any)
  {
    this.codxCmService.setChangeThemes.next(id);
  }

  change2FA(e:any)
  {
    if(this.user.extends.TwoFA == e?.data) return
    this.openFormSercurityLogin(e?.data);
    //this.api.execSv("SYS","AD","UsersBusiness" ,"UpdateTwoFAUserAsync","").subscribe(item=>{})
  }

  openFormSercurityLogin(id:any)
  {
    let popup = this.callFunc.openForm(LoginSercurityComponent,"",500,400);
    popup.closed.subscribe(res=>{
      if(res?.event)
      {
        if(id == "1" || id == "4")
        {
          let popup2 = this.callFunc.openForm(SercurityTOTPComponent,"",500,700,"",id);
          popup2.closed.subscribe(res=>{
            if(res?.event)
            {
              this.user.extends.TwoFA = id;
              this.authstore.set(this.user);
            }
            else this.ipTwoFA.currentValue = this.user.extends.TwoFA;
          })
        }
        else
        {
          this.api.execSv("SYS","AD","UsersBusiness" ,"UpdateTwoFAUserAsync",id).subscribe(item=>{
            if(item)
            {
              this.user.extends.TwoFA = id;
              this.authstore.set(this.user);
            }
          })
        }
      }
      else this.ipTwoFA.currentValue = this.user.extends.TwoFA;
    })
  }
  
  changePW() {
    var url = `auth/login`;
    this.codxService.navigate(null, url, { id: 'changePass' });
  }

  expend()
  {
    if(this.user?.extends?.TwoFA != '1' && this.user?.extends?.TwoFA != '4') return;
    this.openFormSercurityLogin(this.user?.extends?.TwoFA);
  }

  dataImageChanged(event:any,type:any)
  {
    if (event) {
      switch (type) {
        case 'S1': {
          if (event && this.dataSignatures.signature1 == null) {
            this.dataSignatures.signature1 = (event[0] as any).recID;
          }
          break;
        }
        case 'S2': {
          if (event && this.dataSignatures.signature2 == null) {
            this.dataSignatures.signature2 = (event[0] as any).recID;
          }
          break;
        }
        case 'S3': {
          if (event && this.dataSignatures.stamp == null) {
            this.dataSignatures.stamp = (event[0] as any).recID;
          }
          break;
        }
      }
    }
    if (this.isModeAddES)
      this.mwpService.addNewSignature(this.dataSignatures).subscribe((res) => {
        if (res) {
          this.dataSignatures = res;
          this.isModeAddES = false;
        }
      });
    else
      this.mwpService.editSignature(this.dataSignatures).subscribe((res) => {
        if (res) {
          this.dataSignatures = res;
          this.isModeAddES = false;
        }
      });
  }
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
interface ThemeFlag {
  id: string;
  name: string;
  color: string;
  enable?: boolean;
  active?: boolean;
}