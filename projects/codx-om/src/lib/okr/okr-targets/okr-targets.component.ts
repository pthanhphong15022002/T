declare var window: any;
import { CodxOmService } from './../../codx-om.service';
import { OMCONST } from './../../codx-om.constant';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  SidebarModel,
  DialogModel,
  ApiHttpService,
  NotificationsService,
  ButtonModel,
  FormModel,
} from 'codx-core';
import { ChartSettings } from '../../model/chart.model';
import { PopupAddKRComponent } from '../../popup/popup-add-kr/popup-add-kr.component';
import { PopupShowKRComponent } from '../../popup/popup-show-kr/popup-show-kr.component';
import { PopupShowOBComponent } from '../../popup/popup-show-ob/popup-show-ob.component';
import { PopupDistributeOKRComponent } from '../../popup/popup-distribute-okr/popup-distribute-okr.component';

import { PopupAssignmentOKRComponent } from '../../popup/popup-assignment-okr/popup-assignment-okr.component';
import { PopupAddOBComponent } from '../../popup/popup-add-ob/popup-add-ob.component';
import { PopupOKRWeightComponent } from '../../popup/popup-okr-weight/popup-okr-weight.component';
import { PopupCheckInComponent } from '../../popup/popup-check-in/popup-check-in.component';
import { PopupAddComponent } from 'projects/codx-share/src/lib/components/codx-tasks/popup-add/popup-add.component';
import { TM_Tasks } from 'projects/codx-share/src/lib/components/codx-tasks/model/task.model';
import { AssignTaskModel } from 'projects/codx-share/src/lib/models/assign-task.model';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { ok } from 'assert';
const _isAdd = true;
const _isSubKR = true;
const _isEdit = false;
const _notSubKR = false;
@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class OkrTargetsComponent implements OnInit {
  @ViewChild('omTab') omTab: any;
  @ViewChild('treeView') treeView: any;
  @ViewChild('showTask') showTask: any;
  @ViewChild('showCommnent') showCommnent: any;
  @Input() dataOKRPlans: any;
  @Input() dataOKR: any;
  @Input() formModel: any;
  @Input() groupModel: any;
  @Input() funcID: any;
  @Input() isHiddenChart: boolean;
  @Input() okrFM:any;
  @Input() okrVll:any;  
  @Input() okrGrv:any;  
  @Input() curOrgUnitID:any;// orgUnitID/EmployeesID của owner   
  @Input() isCollapsed = false;
  @Input() listUM=[] ;
  @Output('getOKRPlanForComponent') getOKRPlanForComponent: EventEmitter<any> =new EventEmitter();
  dtStatus = [];
  krTitle = '';
  obTitle = '';
  selectOKR:any;
  chartSettings: ChartSettings = {
    title: '',
    primaryXAxis: {
      valueType: 'Category',
      majorGridLines: { width: 0 },
      edgeLabelPlacement: 'Shift',
    },
    primaryYAxis: {
      minimum: 0,
      maximum: 100,
      interval: 20,
      lineStyle: { width: 0 },
      majorTickLines: { width: 0 },
      minorTickLines: { width: 0 },
    },
    seriesSetting: [
      {
        type: 'StackingArea',
        xName: 'month',
        yName: 'percent',
      },
      {
        type: 'StackingArea',
        xName: 'month',
        yName: 'percent',
      },
      {
        type: 'StackingArea',
        xName: 'month',
        yName: 'percent',
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'DashBoardBusiness',
    method: 'GetChartDataAsync',
  };

  chartSettings1: ChartSettings = {
    title: '15 Objectives',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'DashBoardBusiness',
    method: 'GetChartData1Async',
  };

  chartSettings2: ChartSettings = {
    title: '15 KRs',
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'status',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explode: true,
        endAngle: 360,
        // dataLabel:{visible:true, name:'status', template:'${point.value}',position:'Outside'}
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'OKRBusiness',
    method: 'GetChartData1Async',
  };
  svgOB='';
  svgKR='';
  svgSKR=''
  Objs = [];
  Krs = [];
  defaultOwner:string;
  progress: number = 0;
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;
  OM_UseSKR=false;
  tree: any;
  button: ButtonModel;
  isAfterRender: boolean;
  skrTitle: any;
  skrFuncID: any;
  krFuncID: any;
  obFuncID: any;
  vllRangeDate: any;
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private codxOmService: CodxOmService,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private detec: ChangeDetectorRef
  ) {
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  ngOnInit(): void {
    this.krFuncID=this.okrFM?.krFM?.funID;
    this.skrFuncID=this.okrFM?.skrFM?.funID;
    this.obFuncID=this.okrFM?.obFM?.funID;
    this.createBase();
    this.getCacheData();
    this.getData();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  createBase() {
    this.button = {
      id: 'btnAdd',
      separator: true,
      hasSet: true,
      action: 'Custom',
      items: [
        {
          text: 'Thêm mục tiêu',
          id: 'btnAddO',
        },
        {
          text: 'Thêm kết quả chính',
          id: 'btnAddKR',
        },
      ],
    };
  }

  getCacheData() {
    if(this.funcID== OMCONST.FUNCID.PERS){

      this.codxOmService.getEmployeesByEmpID(this.curOrgUnitID).subscribe((ownerInfo:any) => {
        if (ownerInfo) {
          this.defaultOwner=ownerInfo?.domainUser;
        }
      });
    }
    else{
      this.codxOmService.getManagerByOrgUnitID(this.curOrgUnitID).subscribe((ownerInfo:any) => {
        if (ownerInfo) {
          this.defaultOwner=ownerInfo?.domainUser;
        }
      });
    }

    this.cache.valueList('OM021').subscribe((item) => {
      if (item?.datas) this.vllRangeDate = item?.datas;
      console.log(this.vllRangeDate);
    });
    
    this.cache.valueList('OM002').subscribe((item) => {
      if (item?.datas) this.dtStatus = item?.datas;
    });
    this.codxOmService
      .getSettingValue(OMCONST.OMPARAM)
      .subscribe((omSetting: any) => {
        if (omSetting) {
          let settingVal = JSON.parse(omSetting?.dataValue);
          if (
            settingVal != null &&
            (settingVal?.UseSubKR == '1' || settingVal?.UseSubKR == true)
          ) {
            this.OM_UseSKR=true;
            this.button.items.push({
              text: 'Thêm kết quả phụ',
              id: 'btnAddSKR',
            });
          }
          
        }
      });
      
    this.cache.functionList(this.skrFuncID).subscribe((res) => {
      if (res) {
        this.skrTitle =
          res.description.charAt(0).toLowerCase() + res.description.slice(1);
      }
    });
    this.cache.functionList(this.krFuncID).subscribe((res) => {
      if (res) {
        this.krTitle =
          res.description.charAt(0).toLowerCase() + res.description.slice(1);
      }
    });
    this.cache.functionList(this.obFuncID).subscribe((res) => {
      if (res) {
        this.obTitle =
          res.description.charAt(0).toLowerCase() + res.description.slice(1);
      }
    });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getData() {
    this.progress = this.dataOKRPlans?.progress;

    this.api
      .exec('OM', 'DashBoardBusiness', 'GetOKRDashboardByPlanAsync', [
        this.dataOKRPlans?.recID,
      ])
      .subscribe((res: any) => {
        res[1].map((res) => {
          let qty = res.quantity;
          let type = res.okrType;
          let items = res.items;
          switch (type) {
            case 'O':
              this.chartSettings1.title =
                qty + (qty > 1 ? ' Objectives' : ' Objective');
              this.Objs = items;
              break;
            case 'R':
              this.chartSettings2.title = qty + (qty > 1 ? ' KRs' : ' KR');
              this.Krs = items;
              break;
            default:
              break;
          }
        });
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd': {
        this.addOB(evt.text+ ' mục tiêu');
        break;
      }
      case 'btnAddO':
        this.addOB(evt.text);
        break;

      case 'btnAddKR': {
        this.addKR(evt.text, _notSubKR);
        break;
      }
      case 'btnAddSKR': {
        this.addKR(evt.text, _isSubKR);
        break;
      }
    }
  }

  clickMF(e: any, ob: any) {    
    var funcID = e?.functionID;
    switch (funcID) {
      case OMCONST.MFUNCID.OBDetail:
        this.showOB(ob, e?.text);
        break;
      case OMCONST.MFUNCID.Edit: {
        this.editOB(ob, e?.text + ' ' + this.obTitle);
        break;
      }
      case OMCONST.MFUNCID.Copy: {
        this.copyOB(ob, e?.text + ' ' + this.obTitle);
        break;
      }
      case OMCONST.MFUNCID.Delete: {
        this.deleteOB(ob);
        break;
      }
      case OMCONST.MFUNCID.OBEditKRWeight: {
        this.editOKRWeight(ob, e?.text);
        break;
      }
      //phân bổ OB
      case OMCONST.MFUNCID.OBDistribute: {
        this.distributeOKR(ob, e?.text);
        break;
      }

      //phân công OB
      case OMCONST.MFUNCID.OBAssign: {
        this.assignmentOKR(ob, e?.text);
        break;
      }
    }
  }
  clickKRMF(e: any, kr: any, isSKR: boolean) {
    
    let tempT = isSKR ? this.skrTitle : this.krTitle;
    let popupTitle = e.text + ' ' + tempT;
    var funcID = e?.functionID;
    switch (funcID) {
      case OMCONST.MFUNCID.Edit: {
        this.editKR(kr, popupTitle, isSKR);
        break;
      }
      case OMCONST.MFUNCID.Copy: {
        this.copyKR(kr, popupTitle, isSKR);
        break;
      }
      case OMCONST.MFUNCID.Delete: {
        this.deleteKR(kr, isSKR);
        break;
      }

      case OMCONST.MFUNCID.SKRDetail:
      case OMCONST.MFUNCID.KRDetail: {
        this.showKR(kr, e?.text);
        break;
      }
      case OMCONST.MFUNCID.KRCheckIn:
      case OMCONST.MFUNCID.SKRCheckIn: {
        this.checkIn(kr, e.text);
        break;
      }
      case OMCONST.MFUNCID.KREditSKRWeight: {
        this.editSKRWeight(kr, e?.text);
        break;
      }
      //phân bổ KR
      case OMCONST.MFUNCID.KRDistribute: {
        this.distributeOKR(kr, e?.text);
        break;
      }

      //phân công KR
      case OMCONST.MFUNCID.SKRAssign:
      case OMCONST.MFUNCID.KRAssign: {
        this.assignmentOKR(kr, e.text);
        break;
      }
      //Giao việc
      case OMCONST.MFUNCID.SKRTask:
      case OMCONST.MFUNCID.KRTask: {
        this.addTask(kr, e?.text,e?.data);
        break;
      }
    }
  }
  changeDataKRMF(evt: any, kr: any, isSKR: boolean) {
    if (evt != null && kr != null) {
      if (isSKR) {

      } else {

      }
      //Ẩn phân bổ MF
      evt.forEach((func) => {
        if (
          (func.functionID == OMCONST.MFUNCID.KRDistribute  ||
            func.functionID == OMCONST.MFUNCID.SKRDistribute) 
        ) {
          func.disabled = true;
        }
      });


      evt.forEach((func) => {
        if (
          (func.functionID == OMCONST.MFUNCID.KRCheckIn  ||
            func.functionID == OMCONST.MFUNCID.SKRCheckIn) &&
          kr.assignOKR != null &&
          kr.assignOKR.length > 0
        ) {
          func.disabled = false;
        }
      });
      if(kr.items!=null && kr.items.length>0 ){
        evt.forEach((func) => {
          if (func.functionID == OMCONST.MFUNCID.KREditSKRWeight ) {
            func.disabled = false;
          }
          else{
            func.disabled = true;
          }
        });
      }
      
    }
  }
  changeDataOBMF(evt: any, ob: any){
    if(evt!=null && ob!=null){
      if(ob.items!=null && ob.items.length>0 ){
        evt.forEach((func) => {
          if (func.functionID == OMCONST.MFUNCID.OBEditKRWeight ) {
            func.disabled = false;
          }
          else{
            func.disabled=true
          }
        });
  
      }
      //Ẩn phân bổ MF
      evt.forEach((func) => {
        if (
          func.functionID == OMCONST.MFUNCID.OBDistribute 
        ) {
          func.disabled = true;
        }
      });
    }
    
  }
  selectionChange(parent) {
    if (parent.isItem) {
      parent.data.items = parent?.data?.items;
    }
  }
  // valueChange(evt: any) {
  //   if (evt && evt?.data) {

  //   }
  //   this.detectorRef.detectChanges();
  // }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//

  collapeKR(collapsed: boolean) {
    this.dataOKR.forEach((ob) => {
      ob.isCollapse = collapsed;
    });

    this.detec.detectChanges();

    this.dataOKR.forEach((ob) => {
      if (ob.items != null && ob.items.length > 0) {
        ob.items.forEach((kr) => {
          kr.isCollapse = collapsed;
        });
      }
    });
    this.isCollapsed = collapsed;
    this.detec.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  //Lấy UMName
  getUMName(umid:string){
    let tmpUM = this.listUM.filter((obj) => {
      return obj.umid == umid;
    });
    if(tmpUM!=null && tmpUM.length>0){
      return tmpUM[0]?.umName;
    }
    else{
      return umid;
    }
  }
  getRangeDate(rangeDate:string){ 
    if(rangeDate!=null){
      let listRange= rangeDate.split(';');  
      let range='';    

      Array.from(listRange).forEach(item=>{
        if(item!=null && item!=''){         
          if(item=='Q1-Q4' || item=='1-12'){
            range+= this.getPeriodName(item);
          }
          else if(item.includes('-')){
            let tmpRange= item.split('-');
            if(tmpRange!=null && tmpRange.length==2){
              range+= this.getPeriodName(tmpRange[0])+' - '+this.getPeriodName(tmpRange[1])+'; ';
            }
          }
          else{
            range+= this.getPeriodName(item)+'; ';
          }
        }        
      });
      return range;
    }
    return rangeDate;
  }

  getPeriodName(period:string){
    let periodName = this.vllRangeDate.filter((obj) => {
      return obj.value == period;
    });
    if(periodName!=null && periodName.length>0){
      return periodName[0]?.text;
    }
    else return period;
  }
  //Lọc OKR
  filterOKR(okrType:string, listOKR:any[])
  {
    let listOKRFilter=[];
    if(listOKR!=null && listOKR.length>0){
      let result = listOKR.filter((item) => item.okrType == okrType);
      if(result!=null && result.length>0){
        for (let okr of result) {
          listOKRFilter.push({
            recID:okr?.recID,
            okrName:okr?.okrName,
            meno: okr?.meno,
          })
        }
        return listOKRFilter;
      }
    }
    return null;
  }

  // Dataservice mod
  renderOB(ob: any, isAdd: boolean) {
    if (ob != null) {
      if (isAdd) {
        this.dataOKR.push(ob);
      } else {
        for (let oldOB of this.dataOKR) {
          if (oldOB.recID == ob.recID) {
            this.editRender(oldOB, ob);
          }
        }
      }
    }
  }
  renderKR(kr: any, isAdd: boolean) {
    if (kr != null) {
      if (isAdd) {
        for (let ob of this.dataOKR) {
          if (ob.recID == kr.parentID) {
            if (ob.items == null) {
              ob.items = [];
            }
            ob.items.push(kr);
            ob.hasChildren= true;
            return;
          }
        }
      } else {
        for (let ob of this.dataOKR) {
          if (ob.recID == kr.parentID) {
            if (ob.items == null) {
              ob.items = [];
            }
            for(let i=0;i<ob.items.length;i++){
              if (ob.items[i].recID == kr.recID) {
                this.editRender(ob.items[i], kr);
                return;
              }
            }
            // đổi mục tiêu cho kr            
          }
        }
      }
    }
  }
  editRender(oldOKR: any, newOKR: any) {
    oldOKR.okrName = newOKR?.okrName;
    oldOKR.target = newOKR?.target;
    oldOKR.owner = newOKR?.owner;
    oldOKR.umid = newOKR?.umid;
    oldOKR.confidence = newOKR?.confidence;
    oldOKR.category = newOKR?.category;
    oldOKR.actual = newOKR?.actual;
    oldOKR.current = newOKR?.current;
    oldOKR.rangeDate = newOKR?.rangeDate;
    if(newOKR?.okrTasks !=null && newOKR?.okrTasks.length>0){
      oldOKR.okrTasks= newOKR?.okrTasks;
    }
  }
  renderSKR(skr: any, isAdd: boolean) {
    if (skr != null) {
      if (isAdd) {
        for (let ob of this.dataOKR) {
          if (ob.items != null) {
            for (let kr of ob.items) {
              if (kr.recID == skr.parentID) {
                if (kr.items == null) {
                  kr.items = [];
                }
                kr.items.push(skr);
                kr.hasChildren= true;
              }
            }
          }
        }
      } else {
        for (let ob of this.dataOKR) {
          if (ob.items != null) {
            for (let kr of ob.items) {
              if (kr.recID == skr.parentID) {
                if (kr.items == null) {
                  kr.items = [];
                }
                for (let oldSKR of kr.items) {
                  if (oldSKR.recID == skr.recID) {
                    this.editRender(oldSKR, skr);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  removeOB(ob: any) {
    if (ob != null) {
      this.dataOKR = this.dataOKR.filter((res) => res.recID != ob.recID);
    }
  }
  removeKR(kr: any) {
    if (kr != null) {
      for (let ob of this.dataOKR) {
        if (ob?.recID == kr?.parentID) {
          ob.items = ob?.items.filter((res) => res.recID != kr.recID);
        }
      }
    }
  }
  removeSKR(skr: any) {
    if (skr != null) {
      for (let ob of this.dataOKR) {
        for (let kr of ob?.items) {
          for (let i = 0; i < kr?.items.length; i++) {
            if (skr?.recID == kr.items[i].recID) {
              kr.items = kr.items.filter((res) => res.recID != skr.recID);
              return;
            }
          }
        }
      }
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  addTask(kr:any,popupTitle:string,mfunc:string){

    var task = new TM_Tasks();
        task.refID = kr?.recID;
        task.sessionID=kr?.transID;
        task.refType = 'OM_OKRs';
        task.taskName = kr.okrName;

        let option = new SidebarModel();
        let assignModel: AssignTaskModel = {
          vllRole: 'TM002',
          title: popupTitle,//val?.data.customName,
          vllShare: 'TM003',
          task: task,
          referedData: kr,
          referedFunction: mfunc,
        };
        //option.DataService = this.view.dataService;
        option.FormModel = this.okrFM?.krFM;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          AssignInfoComponent,
          assignModel,
          option
        );

        dialog.closed.subscribe((e) => {
          if (e?.event) {
            if(kr.okrTasks==null){
              kr.okrTasks=[];
            }
            kr.okrTasks.push(task);
            
            if(kr.okrType==this.krType){
              this.renderKR(kr,false);
            }
            else if(kr.okrType==this.skrType){                  
              this.renderSKR(kr,false);
            }
              
            // this.codxOmService.getListOKRTasks(kr?.recID).subscribe((res:any)=>{
            //   if(res){
            //     if(kr.okrType==this.krType){
            //       this.renderKR(kr,false);
            //     }
            //     else if(kr.okrType==this.skrType){                  
            //       this.renderSKR(kr,false);
            //     }
            //   }
            // })
          }
        });
    
  }
  editOKRWeight(ob: any, popupTitle: any) {
    let subTitle = ob?.okrName;
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogEditWeightKR = this.callfunc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [ob, OMCONST.VLL.OKRType.KResult, popupTitle, subTitle,this.okrVll],
      '',
      dModel
    );
  }
  editSKRWeight(kr: any, popupTitle: any) {
    let subTitle = kr?.okrName;
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogEditWeightSKR = this.callfunc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [kr, OMCONST.VLL.OKRType.SKResult, popupTitle, subTitle,this.okrVll],
      '',
      dModel
    );
  }
  checkIn(kr: any, popupTitle: any) {
    // if (this.dataOKRPlans.status!=OMCONST.VLL.PlanStatus.Ontracking ) {
    //   this.notificationsService.notify(
    //     'Bộ mục tiêu chưa được phát hành',
    //     '3',
    //     null
    //   );
    //   return;
    // }
    if (kr?.assignOKR && kr?.assignOKR.length > 0) {
      this.notificationsService.notify(
        'Không thể cập nhật tiến độ kết quả đã được phân công',
        '3',
        null
      );
      return;
    }
    if (kr?.items && kr?.items.length > 0) {
      this.notificationsService.notify(
        'Không thể cập nhật tiến độ kết quả đã có kết quả phụ',
        '3',
        null
      );
      return;
    }
    let dialogCheckIn = this.callfunc.openForm(
      PopupCheckInComponent,
      '',
      800,
      500,
      '',
      [kr, popupTitle, { ...this.groupModel?.checkInsModel },this.okrFM]
    );
    dialogCheckIn.closed.subscribe((res) => {
      if (res?.event && res?.event.length !=null) {        
        this.getOKRPlanForComponent.emit(this.dataOKRPlans);
        if(res?.event.length>0){

          this.caculatorPlanInBackground(res?.event);
        }
      }
    });
  }
  caculatorPlanInBackground(listPlanRecID: any) {
    if (listPlanRecID != null && listPlanRecID.length > 0) {
      this.codxOmService
        .calculatorProgressOfPlan(listPlanRecID)
        .subscribe((listPlan: any) => {
          if (listPlan != null) {            
            this.caculatorPlanInBackground(listPlan);
          }
        });
    }
  }
  //OBject
  addOB(popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.okrFM?.obFM;    
    let baseModel= {...this.groupModel};
    baseModel.obModel.owner=this.defaultOwner;
    let dialogOB = this.callfunc.openSide(
      PopupAddOBComponent,
      [this.funcID, OMCONST.MFUNCID.Add, popupTitle, null, this.dataOKRPlans,baseModel],
      option
    );
    dialogOB.closed.subscribe((res) => {
      this.renderOB(res?.event, _isAdd);
    });
  }
  editOB(ob: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.okrFM?.obFM;

    let dialogEditOB = this.callfunc.openSide(
      PopupAddOBComponent,
      [this.krFuncID, OMCONST.MFUNCID.Edit, popupTitle, ob, this.dataOKRPlans,this.groupModel],
      option
    );
    dialogEditOB.closed.subscribe((res) => {
      this.renderOB(res?.event, _isEdit);
    });
  }

  copyOB(ob: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.okrFM?.obFM;

    let dialogCopyOB = this.callfunc.openSide(
      PopupAddOBComponent,
      [this.krFuncID, OMCONST.MFUNCID.Copy, popupTitle, ob, this.dataOKRPlans,this.groupModel],
      option
    );
    dialogCopyOB.closed.subscribe((res) => {
      if (res && res?.event) {
        this.dataOKR.push(res?.event);
      }
    });
  }
  deleteOB(ob: any) {
    if (true) {
      //Cần thêm kịch bản khi xóa KR
      this.codxOmService.deleteOKR(ob).subscribe((res: any) => {
        if (res) {
          this.notificationsService.notifyCode('SYS008');
          this.removeOB(ob);
        } else {
          this.notificationsService.notifyCode('SYS022');
        }
      });
    }
  }
  //KeyResults && SubKeyResult
  addKR(popupTitle: any, isSubKR = false) {
    let listParent = this.filterOKR(this.obType, this.dataOKR);
    let option = new SidebarModel();
    option.FormModel = isSubKR ? this.okrFM?.skrFM : this.okrFM?.krFM;    
    let baseModel= {...this.groupModel};
    baseModel.krModel.owner=this.defaultOwner;
    baseModel.skrModel.owner=this.defaultOwner;
    let dialogKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [this.funcID, OMCONST.MFUNCID.Add, popupTitle, null, isSubKR,baseModel,this.dataOKRPlans],
      option
    );
    dialogKR.closed.subscribe((res) => {
      if (isSubKR) {
        this.renderSKR(res?.event, _isAdd);
      } else {
        this.renderKR(res?.event, _isAdd);
      }
    });
  }

  editKR(kr: any, popupTitle: any, isSubKR = false) {
    let option = new SidebarModel();
    option.FormModel = isSubKR ?this.okrFM?.skrFM : this.okrFM?.krFM;    

    let dialogEditKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [this.krFuncID, OMCONST.MFUNCID.Edit, popupTitle, kr, isSubKR,this.groupModel,this.dataOKRPlans],
      option
    );
    dialogEditKR.closed.subscribe((res) => {
      if (isSubKR) {
        this.renderSKR(res?.event, _isEdit);
      } else {
        this.renderKR(res?.event, _isEdit);
      }
    });
  }

  copyKR(kr: any, popupTitle: any, isSubKR = false) {
    let option = new SidebarModel();
    option.FormModel = isSubKR ?this.okrFM?.skrFM : this.okrFM?.krFM;  

    let dialogCopyKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [this.krFuncID, OMCONST.MFUNCID.Copy, popupTitle, kr, isSubKR,this.groupModel,this.dataOKRPlans],
      option
    );
    dialogCopyKR.closed.subscribe((res) => {
      if (isSubKR) {
        this.renderSKR(res?.event, _isAdd);
      } else {
        this.renderKR(res?.event, _isAdd);
      }
    });
  }

  deleteKR(kr: any, isSubKR: boolean) {
    if (true) {
      //Cần thêm kịch bản khi xóa KR
      this.codxOmService.deleteOKR(kr).subscribe((res: any) => {
        if (res) {
          this.notificationsService.notifyCode('SYS008');
          if (isSubKR) {
            this.removeSKR(kr);
          } else {
            this.removeKR(kr);
          }
        } else {
          this.notificationsService.notifyCode('SYS022');
        }
      });
    }
  }
  //Xem chi tiết OB
  showOB(obj: any, popupTitle: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    dModel.FormModel = this.okrFM?.obFM;
    let dialogShowOB = this.callfunc.openForm(
      PopupShowOBComponent,
      '',
      null,
      null,
      null,
      [obj, popupTitle, this.okrFM,this.okrVll,this.okrGrv],
      '',
      dModel
    );
  }
  //Xem chi tiết KR
  showKR(kr: any, popupTitle: any) {
    let dModel = new DialogModel();
    popupTitle=popupTitle!=null ? popupTitle :"Xem chi tiết";
    dModel.IsFull = true;
    dModel.FormModel = this.okrFM?.krFM;
    let dialogShowKR = this.callfunc.openForm(
      PopupShowKRComponent,
      '',
      null,
      null,
      null,
      [kr, popupTitle, this.okrFM,this.okrVll,this.okrGrv],
      '',
      dModel
    );
  }
  distributeOKR(okr: any, title: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogDisKR = this.callfunc.openForm(
      PopupDistributeOKRComponent,
      '',
      null,
      null,
      null,
      [okr.okrName, okr.recID, okr.okrType, this.funcID, title],
      '',
      dModel
    );
  }
  assignmentOKR(okr: any, title: any) {
    let dModel = new DialogModel();
    let dialogAssgOKR = this.callfunc.openForm(
      PopupAssignmentOKRComponent,
      '',
      750,
      400,
      null,
      [
        okr.okrName,
        okr.recID,
        okr.okrType,
        this.funcID,
        title,
        this.dataOKRPlans.recID,
      ],
      '',
      dModel
    );
    dialogAssgOKR.closed.subscribe((res) => {
      if (res?.event) {
        this.getOKRPlanForComponent.emit(res?.event);
      }
    });
  }
  clickTreeNode(evt:any, ){
    evt.stopPropagation();
    evt.preventDefault();
  }
  showTasks(evt:any,data:any){    
    evt.stopPropagation();
    evt.preventDefault();
    if(evt !=null && data!=null){
      this.selectOKR=data;
      let dialogShowTask = this.callfunc.openForm(this.showTask, '', 1280, 720, null);
    }
  }
  showComments(evt:any,data:any){    
    evt.stopPropagation();
    evt.preventDefault();
    if(evt !=null && data!=null){
      this.selectOKR=data;
      let dialogShowComment = this.callfunc.openForm(this.showCommnent, '', 500, 720, null);
    }
  }
}
