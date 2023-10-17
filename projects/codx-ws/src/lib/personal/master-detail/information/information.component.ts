import { Component, Input, OnInit } from '@angular/core';
import { AuthStore, CacheService } from 'codx-core';
import { CodxWsService } from '../../../codx-ws.service';
import { isObservable } from 'rxjs';
import { label } from './infomation.variable';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-information',
  templateUrl:'./information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit{
  @Input() menuFunctionID:any;

  adUser:any;
  user:any;
  label = label;
  language
  themes = themeDatas;

  constructor(
    private authstore: AuthStore,
    private wsService: CodxWsService,
    private codxCmService: CodxCommonService,
    private cacheService: CacheService
  ) 
  {
    this.user = this.authstore.get();
    this.user.positionName = "Thông tin chức vụ"
    this.user.departmentName = "Thông tin phòng ban";
    debugger
    var a = this.user.extends.TwoFA
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
    var info = this.wsService.loadData(paras,keyRoot,"HR","HR","EmployeesBusiness","GetByDomainUserAsync") as any;
    if(isObservable(info))
    {
      info.subscribe((item:any)=>{
        if(item)
        {
          this.user.positionName = item?.positionName
          this.user.departmentName = item?.departmentName
        }
      })
    }
    else
    {
      this.user.positionName = info?.positionName
      this.user.departmentName = info?.departmentName
    }
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