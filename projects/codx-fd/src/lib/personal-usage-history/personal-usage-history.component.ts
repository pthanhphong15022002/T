import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthStore, ButtonModel, CacheService, UIComponent, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { CodxFdService } from '../codx-fd.service';
import { isObservable } from 'rxjs';
import { listFunction, pointLadder } from './personal-usage-history';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-personal-usage-history',
  templateUrl:'./personal-usage-history.component.html',
  styleUrls: ['./personal-usage-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalUsageHistoryComponent extends UIComponent
implements AfterViewInit, OnChanges{
  @ViewChild('view2') view2: ViewsComponent;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('rowTransDate') rowTransDate: TemplateRef<any>;
  @ViewChild('rowTransType') rowTransType: TemplateRef<any>;
  @ViewChild('rowRefType') rowRefType: TemplateRef<any>;
  @ViewChild('rowCard') rowCard: TemplateRef<any>;
  @ViewChild('rowPolicy') rowPolicy: TemplateRef<any>;
  @ViewChild('rowCoins') rowCoins: TemplateRef<any>;
  @ViewChild('rowKudos') rowKudos: TemplateRef<any>;
  @ViewChild('rowcoCoins') rowcoCoins: TemplateRef<any>;
  @ViewChild('rowObjectName') rowObjectName: TemplateRef<any>;
  @ViewChild('rowStatusMyGift') rowStatusMyGift: TemplateRef<any>;
  @ViewChild('rowItemID') rowItemID: TemplateRef<any>;
  @ViewChild('rowItemID2') rowItemID2: TemplateRef<any>;
  
  @Input() vllRefType = 'FD016';
  
  views: Array<ViewModel> = [];
  views2: Array<ViewModel> = [];
  views3: Array<ViewModel> = [];
  pointLadder = pointLadder;
  crrIndex: number = 0;
  infoPersonal: any;
  wallets:any;
  ranges:any;
  user:any;
  orgUnitStr: any;
  DepartmentStr: any;
  employeeID;
  clmnGrid:any;
  lstAchievements:any = [];

  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  entityName = 'FD_KudosTrans';
  className = 'KudosTransBusiness';
  method = 'LoadDataMyKudoAsync';
  idField = 'recID';
  columnsGrid = [];
  rate: any;
  totalCoreEmp: any;
  listFunc = listFunction;
  active="1";
  exchangerate=0;
  constructor(
    inject: Injector,
    private authStore : AuthStore,
    private df: ChangeDetectorRef,
    private fdService: CodxFdService,
    public sanitizer: DomSanitizer
  ) {
    super(inject);
    this.user = authStore.get();
  }
  ngOnChanges(changes: SimpleChanges): void {}

  onInit(): void {
    //load infor user
    this.getImformationUser();
    //Lấy thông tin setting value
    this.getSettingValue();
    this.getWallet();
  }

  getSettingValue()
  {
    let paras = ["fdparameters","apikey"];
    let keyRoot = "FDSettingValue" + paras.join(";");
    var data = this.fdService.loadData(paras,keyRoot,"SYS","SYS","SettingValuesBusiness","GetByModuleAsync") as any;
    if(isObservable(data))
    {
      data.subscribe((item:any)=>{
        var dtv = JSON.parse(item.dataValue);
        this.exchangerate = Number(dtv.ExchangeRate);
      })
    }
    else
    {
      var dtv = JSON.parse(data.dataValue);
      this.exchangerate = Number(dtv.ExchangeRate);
    }
  }

  getSetting()
  {
    var funcList = this.fdService.loadFunctionList(this.view.funcID) as any;
    if(isObservable(funcList))
    {
      funcList.subscribe((item:any)=>{
        this.getGridView(item.formName , item.gridViewName)
      })
    }
    else this.getGridView(funcList.formName , funcList.gridViewName);


    //Setting của quà tặng
    this.getGridView(this.listFunc[1].formName,this.listFunc[1].gridViewName,2)
    //Setting của EVouchher
    this.getGridView(this.listFunc[2].formName,this.listFunc[2].gridViewName,3)
  }

  getGridView(formName,gridViewName,type=1)
  {
    var gridView = this.fdService.loadGridView(formName,gridViewName) as any;
    if(isObservable(gridView))
    {
      gridView.subscribe((item:any)=>{
       var dt = this.formatColumn(item);
       this.setColumnGrid(dt,type);
      })
    }
    else {
      var dt = this.formatColumn(gridView);
      this.setColumnGrid(dt,type);
    }
  }

  formatColumn(item:any)
  {
    let data = [];
    var key = Object.keys(item);
    for (var i = 0; i < key.length; i++) {
      if (item[key[i]]?.isVisible) {
        var obj = {
          field: this.capitalizeFirstLetter(key[i]),
          headerText: item[key[i]].headerText,
          columnOrder: item[key[i]].columnOrder,
          width: item[key[i]].width
        };
        data.push(obj);
      }
    }

    data = data.sort((a:any,b:any)=> a?.columnOrder - b?.columnOrder);
    return data;
  }
  
  getImformationUser()
  {
    let paras = [this.user?.userID];
    let keyRoot = "FDImforUser" + this.user?.userID;
    var data = this.fdService.loadData(paras,keyRoot,"HR","HR",'EmployeesBusiness','GetOneByDomainUserAsync');

    if(isObservable(data)) data.subscribe(item=>{if(item) this.infoPersonal = item});
    else this.infoPersonal = data
  }

  getWallet()
  {
    let paras = [this.user?.userID];
    let keyRoot = "FDWallets" + this.user?.userID;
    var data = this.fdService.loadData(paras,keyRoot,"FD","FD",'WalletsBusiness','GetWalletsAsync');

    if(isObservable(data)) data.subscribe(item=>{if(item) this.wallets = item});
    else this.wallets = data
    
  }
  
  setColumnGrid(data:any,type:any)
  {
    this.columnsGrid = [];
    data.forEach(elm => {
      var obj = 
      {
        field: elm.field, 
        headerText: elm.headerText,
        width: elm.width
      } as any;

      switch(elm.field)
        {
          case "transDate":
            {
              obj.template = this.rowTransDate;
              obj.matchCase = false
              break;
            }
          case "refType":
            {
              obj.template = this.rowRefType;
              break;
            }
          case "transType":
            {
              obj.template = this.rowTransType;
              break;
            }
          case "situation":
            {
              obj.template = this.rowCard;
              break;
            }
          case "policyID":
            {
              obj.template = this.rowPolicy;
              break;
            }
          case "kudos":
            {
              obj.template = this.rowKudos;
              obj.textAlign = "center";
              break;
            }
          case "coins":
            {
              obj.template = this.rowCoins;
              obj.textAlign = "center";
              break;
            }
          case "coCoins":
            {
              obj.template = this.rowcoCoins;
              obj.textAlign = "center";
              break;
            }
          case "objectName":
            {
              obj.template = this.rowObjectName;
              break;
            }
          case "status":
            {
              if(type == 2 || type == 3) obj.template = this.rowStatusMyGift;
              break;
            }
          case "itemName":
            {
              obj.width = 150;
              if(type == 2) obj.template = this.rowItemID;
              else if(type==3) obj.template = this.rowItemID2;
              break;
            }
          }
      
      this.columnsGrid.push(obj);

    });
    if(type == 1)
    {
      this.views = [
        {
          type: ViewType.grid,
          active: true,
          sameData: true,
          model: {
            hideMoreFunc:true,
            resources: this.columnsGrid,
          },
        },
      ];
    }
    else if(type == 2)
    {
      this.views2 = [
        {
          type: ViewType.grid,
          active: true,
          sameData: true,
          model: {
            hideMoreFunc:true,
            resources: this.columnsGrid,
          },
        },
      ];
    }
    else if(type == 3)
    {
      this.views3 = [
        {
          type: ViewType.grid,
          active: true,
          sameData: true,
          model: {
            hideMoreFunc:true,
            resources: this.columnsGrid,
          },
        },
      ];
    }
    this.detectorRef.detectChanges();
  }
  ngAfterViewInit(): void {
    this.getSetting();
  }

  clickActive(item:any)
  {
    if(this.active == item.id) return;
    this.active = item.id;
  }

  //Chữ đầu thành chữ thường
  capitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }
}
