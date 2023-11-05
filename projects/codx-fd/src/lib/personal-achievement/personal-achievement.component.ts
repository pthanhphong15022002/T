import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthStore, ButtonModel, CacheService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxFdService } from '../codx-fd.service';
import { isObservable } from 'rxjs';
import { pointLadder } from './personal-achievement';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-personal-achievement',
  templateUrl: './personal-achievement.component.html',
  styleUrls: ['./personal-achievement.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalAchievementComponent extends UIComponent
implements AfterViewInit, OnChanges{
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('rowTransDate') rowTransDate: TemplateRef<any>;
  @ViewChild('rowRefType') rowRefType: TemplateRef<any>;
  @ViewChild('rowCard') rowCard: TemplateRef<any>;
  @ViewChild('rowPolicy') rowPolicy: TemplateRef<any>;
  @ViewChild('rowCoins') rowCoins: TemplateRef<any>;
  @ViewChild('rowTransType') rowTransType: TemplateRef<any>;
  @ViewChild('rowObjectName') rowObjectName: TemplateRef<any>;
  @Input() vllRefType = 'FD016';
  
  views: Array<ViewModel> = [];
  pointLadder = pointLadder;
  crrIndex: number = 0;
  infoPersonal: any;
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
  pointAndRanking:any;
  rangsUser:any;
  wRangs:any;
  mssFD007:any;
  mssAdvice:any;
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
    this.getMessage();
    //load infor user
    this.getImformationUser();
    this.getPointAndRangking();
  }

  getMessage()
  {
    this.cache.message("FD007").subscribe(item=>this.mssFD007 = item)
  }

  getImformationUser()
  {
    let paras = [this.user?.userID];
    let keyRoot = "FDImforUser" + this.user?.userID;
    var data = this.fdService.loadData(paras,keyRoot,"HR","HR",'EmployeesBusiness','GetOneByDomainUserAsync');

    if(isObservable(data)) data.subscribe(item=>{if(item) this.infoPersonal = item});
    else this.infoPersonal = data
  }

  getRangs()
  {
    let paras = ["KUDOS"];
    let keyRoot = "FDRangesKUDOS";
    var data = this.fdService.loadData(paras,keyRoot,"BS","BS",'RangeLinesBusiness','GetByRankForTMByID');
    if(isObservable(data)) data.subscribe(item=>{
      if(item) 
        this.ranges = this.formatRangs(item)
    });
    else this.ranges = this.formatRangs(data)
  }

  getPointAndRangking()
  {
    let keyRoot = "FDPointAndRanking" + this.user?.userID;
    var data = this.fdService.loadData(null,keyRoot,"FD","FD",'WalletsBusiness','GetPointsAndRankingsByUserIDAsync');
    if(isObservable(data)) data.subscribe(item=>{
      if(item)
      {
        this.pointAndRanking = item
        this.getRangs();
      } 
    });
    else {
      this.pointAndRanking = data;
      this.getRangs();
    }
  }
  formatRangs(data:any)
  {
    let check = false;
    for(var i = 0 ; i < data.length ; i++)
    {
      if(this.pointAndRanking[0].myKudos <= data[i].breakValue && !check)
      {
        check = true;
        this.rangsUser = {
          name: data[i].breakName,
          index: i == (data.length - 1) ? -1 : (i + 1)
        }
      }
      data[i].width = pointLadder[i].width;
      data[i].zIndex = pointLadder[i].zIndex;
    }

    this.wRangs = (this.pointAndRanking[0].myKudos / data[data.length-1].breakValue) *100;
    this.fmMessage(data);
    return data;
  }

  fmMessage(data:any)
  {
    if(this.rangsUser.index >= 0)
    {
      var point = data[this.rangsUser.index].breakValue - this.pointAndRanking[0].myKudos;
      if(this.mssFD007?.customName) {
        this.mssAdvice = JSON.parse(JSON.stringify(this.mssFD007?.customName));
        this.mssAdvice = this.mssAdvice.replace("{0}",point);
        this.mssAdvice =this.mssAdvice.replace("{1}",data[this.rangsUser.index].breakName);
        this.mssAdvice = this.sanitizer.bypassSecurityTrustHtml(this.mssAdvice);
      }
    }
  }
  
  ngAfterViewInit(): void {
    this.getSetting();
    // this.columnsGrid = [
    //   { field: 'transDate', headerText: 'Ngày phát sinh', width: 150 , template: this.rowTransDate},
    //   { headerText: "Thông điệp", template: this.rowRefType , width: 150 , textAlign: 'center'},
    //   { headerText: "Nội dung", template: this.rowCard , textAlign: 'center'},
    //   { headerText: "Chính sách", template: this.rowPolicy ,textAlign: 'center'},
    //   { headerText: "Điểm" , template: this.rowCoins , textAlign: 'center' , width: 100},
    // ];
    // this.views = [
    //   {
    //     type: ViewType.grid,
    //     active: true,
    //     sameData: true,
    //     model: {
    //       hideMoreFunc:true,
    //       resources: this.columnsGrid,
    //     },
    //   },
    // ];
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
  }

  getGridView(formName,gridViewName)
  {
    var gridView = this.fdService.loadGridView(formName,gridViewName) as any;
    if(isObservable(gridView))
    {
      gridView.subscribe((item:any)=>{
       var dt = this.formatColumn(item);
       this.setColumnGrid(dt);
      })
    }
    else {
      var dt = this.formatColumn(gridView);
      this.setColumnGrid(dt);
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
        };
        data.push(obj);
      }
    }

    data = data.sort((a:any,b:any)=> a?.columnOrder - b?.columnOrder);
    return data;
  }

  setColumnGrid(data:any)
  {
    this.columnsGrid = [];
    data.forEach(elm => {
      var obj = 
      {
        field: elm.field, 
        headerText: elm.headerText
      } as any;

      switch(elm.field)
        {
          case "transDate":
            {
              obj.width = 150;
              obj.template = this.rowTransDate;
              obj.matchCase = false
              break;
            }
          case "transType":
            {
              obj.template = this.rowTransType;
              obj.textAlign = "center";
              break;
            }
          case "refType":
            {
              obj.width = 150;
              obj.template = this.rowRefType;
              obj.textAlign = "center";
              break;
            }
          case "situation":
            {
              obj.template = this.rowCard;
              obj.textAlign = "center";
              break;
            }
          case "policyID":
            {
              obj.template = this.rowPolicy;
              obj.textAlign = "center";
              break;
            }
          case "kudos":
            {
              obj.template = this.rowCoins;
              obj.textAlign = "center";
              break;
            }
          case "objectName":
          {
            obj.template = this.rowObjectName;
            break;
          }
        }
      this.columnsGrid.push(obj);

    });
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
    this.detectorRef.detectChanges();
  }
  //Chữ đầu thành chữ thường
  capitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }
}
