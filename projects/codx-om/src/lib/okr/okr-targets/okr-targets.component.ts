import { CodxOmService } from './../../codx-om.service';
import { OMCONST } from './../../codx-om.constant';
import { Component, Input, OnInit } from '@angular/core';
import {
  CacheService,
  CallFuncService,
  SidebarModel,
  FormModel,
  DialogModel,
  ApiHttpService,
  NotificationsService,
} from 'codx-core';
import { ChartSettings } from '../../model/chart.model';
import { PopupAddKRComponent } from '../../popup/popup-add-kr/popup-add-kr.component';
import { PopupOKRWeightComponent } from '../../popup/popup-okr-weight/popup-okr-weight.component';
import { PopupShowKRComponent } from '../../popup/popup-show-kr/popup-show-kr.component';
import { OkrAddComponent } from '../okr-add/okr-add.component';
import { PopupShowOBComponent } from '../../popup/popup-show-ob/popup-show-ob.component';
import { PopupDistributeOKRComponent } from '../../popup/popup-distribute-okr/popup-distribute-okr.component';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.css'],
})
export class OkrTargetsComponent implements OnInit {
  @Input() dataOKRPlans: any;
  @Input() dataOKR: any;
  @Input() formModel: any;
  @Input() gridView: any;
  @Input() formModelOB: any;
  @Input() formModelKR: any;
  @Input() krFuncID: any;
  @Input() obFuncID: any;
  @Input() funcID: any;
  
  dtStatus = [];
  openAccordion = [];
  krTitle='';
  obTitle='';
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

  Objs = [];
  ObjQty = 0;
  Krs = [];
  KrQty = 0;

  progress: number = 0;

  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private codxOmService: CodxOmService,
    private api: ApiHttpService,
    private notificationsService :NotificationsService,
  ) {}

  ngOnInit(): void {
    //Lấy tiêu đề theo FuncID cho Popup
    this.cache.functionList(this.krFuncID).subscribe((res) => {
      if (res) {
        this.krTitle = res.description.charAt(0).toLowerCase() + res.description.slice(1);
      }
    });
    this.cache.functionList(this.obFuncID).subscribe((res) => {
      if (res) {
        this.obTitle = res.description.charAt(0).toLowerCase() + res.description.slice(1);
        
      }
    });
    this.progress = this.dataOKRPlans?.progress;
    this.api
      .exec('OM', 'DashBoardBusiness', 'GetOKRDashboardByPlanAsync', [
        this.dataOKRPlans?.periodID,
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

    this.cache.valueList('OM002').subscribe((item) => {
      if (item?.datas) this.dtStatus = item?.datas;
    });
    // Tạo FormModel cho OKRs
    this.formModelKR.entityName = 'OM_OKRs';
    this.formModelKR.gridViewName = 'grvOKRs';
    this.formModelKR.formName = 'OKRs';
    this.formModelKR.entityPer = 'OM_OKRs';
  }
  //Lấy danh sách kr của mục tiêu
  getItemOKR(i: any, recID: any) {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }

  clickMF(e: any,data:any) {
    var funcID = e?.functionID;
    switch (funcID) {
      //Chỉnh sửa
      case 'SYS03': {
        let dialog = this.callfunc.openSide(OkrAddComponent, [
          this.gridView,
          this.formModelKR,
          "edit",
          "",
          data
        ]);
        break;
      }
    }
  }
  // Thêm/sửa  KR
  // addKR(o: any) {
  //   let option = new SidebarModel();
  //   option.Width = '550px';
  //   option.FormModel = this.formModel;

  //   let dialogKR = this.callfunc.openSide(
  //     PopupAddKRComponent,
  //     [null, o, this.formModelKR, true, 'Thêm mới kết quả chính',this.dataOKRPlans],
  //     option
  //   );
  // }

  editKR(kr: any, o: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelKR;

    let dialogKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [OMCONST.MFUNCID.Edit, popupTitle, o, kr, this.dataOKRPlans],
      option
    );
  }
  
  
  copyKR(kr: any, o: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelKR;

    let dialogKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [OMCONST.MFUNCID.Copy, popupTitle, o, kr, this.dataOKRPlans],
      option
    );
  }
  
  deleteKR(kr: any) {
    if(kr!=null){
      this.codxOmService.deleteKR(kr).subscribe((res:any)=>{
        if(res){          
          this.notificationsService.notifyCode('SYS008');
        }
        else{
          
          this.notificationsService.notifyCode('SYS022');
        }
      })
    }
  }

  clickKRMF(e: any, kr: any, o: any) {
    let popupTitle = e.text + ' '+ this.krTitle;
    var funcID = e?.functionID;
    switch (funcID) {
      case OMCONST.MFUNCID.Edit: {
        this.editKR(kr, o, popupTitle);
        break;
      }
      // case OMCONST.MFUNCID.Copy: {
      //   this.copyKR(kr, o, popupTitle);
      //   break;
      // }
      case OMCONST.MFUNCID.Delete: {
        this.deleteKR(kr);
        break;
      }
      case 'SYS04': {
        this.distributeKR(kr);
        break;
      }
    }
  }
  //Xem chi tiết OB
  showOB(obj: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowOB = this.callfunc.openForm(
      PopupShowOBComponent,
      '',
      null,
      null,
      null,
      [obj.recID, obj.okrName],
      '',
      dModel
    );
  }
  //Xem chi tiết KR
  showKR(kr: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowKR = this.callfunc.openForm(
      PopupShowKRComponent,
      '',
      null,
      null,
      null,
      [kr.recID, kr.okrName, kr.parentID],
      '',
      dModel
    );
  }
  distributeKR(kr:any){
    let dModel = new DialogModel();    
    dModel.IsFull = true;
    let dialogDisKR = this.callfunc.openForm(
      PopupDistributeOKRComponent,
      '',
      null,
      null,
      null,
      [kr.okrName,kr.recID,OMCONST.VLL.OKRType.KResult,this.funcID],
      '',
      dModel
    );
  }
}
