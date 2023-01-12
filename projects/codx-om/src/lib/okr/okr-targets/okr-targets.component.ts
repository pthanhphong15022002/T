import { text } from 'stream/consumers';
declare var window: any;
import { CodxOmService } from './../../codx-om.service';
import { OMCONST } from './../../codx-om.constant';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { PopupAssignmentOKRComponent } from '../../popup/popup-assignment-okr/popup-assignment-okr.component';
import { PopupAssignmentOKRCComponent } from '../../popup/popup-assigment-okr-c/popup-assignment-okr-c.component';

@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.scss'],
})
export class OkrTargetsComponent implements OnInit {
  @ViewChild('omTab') omTab: any;
  @Input() dataOKRPlans: any;
  @Input() dataOKR: any;
  @Input() formModel: any;
  @Input() gridView: any;
  @Input() formModelOB: any;
  @Input() formModelKR: any;
  @Input() krFuncID: any;
  @Input() obFuncID: any;
  @Input() funcID: any;
  @Input() isHiddenChart: boolean;

  dtStatus = [];
  openAccordion = [];
  krTitle = '';
  obTitle = '';
  isCollaped = false;
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
    private notificationsService: NotificationsService,
    private detec: ChangeDetectorRef
  ) {}
  //_______________________Base Func_________________________//
  ngOnInit(): void {
    this.formModel = this.formModel;
    //Lấy tiêu đề theo FuncID cho Popup
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
  }

  //-----------------------End-------------------------------//

  //_______________________Base Event________________________//

  clickMF(e: any, data: any) {
    var funcID = e?.functionID;
    switch (funcID) {
      //Chỉnh sửa
      case 'SYS03': {
        let dialog = this.callfunc.openSide(OkrAddComponent, [
          this.gridView,
          this.formModelKR,
          'edit',
          '',
          data,
        ]);
        break;
      }
      //Phân công mục tiêu
      // case 'OMT022': //site tester
      // case 'OMT012':
      //   {
      //     let option = new DialogModel();
      //     option.IsFull = true;
      //     this.callfunc.openForm(PopupAssignmentOKRCComponent,"",null,null,this.formModel.funcID,
      //     [
      //       "Phân công mục tiêu",
      //       data
      //     ],"",option);
      //     break;
      //   }
      //phân bổ OB
      case OMCONST.MFUNCID.DOBComp:
      case OMCONST.MFUNCID.DOBDept:
      case OMCONST.MFUNCID.DOBOrg:
      case OMCONST.MFUNCID.DOBPers: {
        this.distributeOKR(data, e?.text);
        break;
      }

      //phân công OB
      case OMCONST.MFUNCID.AOBComp:
      case OMCONST.MFUNCID.AOBDept:
      case OMCONST.MFUNCID.AOBOrg:
      case OMCONST.MFUNCID.AOBPers: {
        this.assignmentOKR(data, e?.text);
        break;
      }
    }
  }
  clickKRMF(e: any, kr: any, o: any) {
    let popupTitle = e.text + ' ' + this.krTitle;
    var funcID = e?.functionID;
    switch (funcID) {
      case OMCONST.MFUNCID.Edit: {
        this.editKR(kr, o, popupTitle);
        break;
      }
      case OMCONST.MFUNCID.Copy: {
        this.copyKR(kr, o, popupTitle);
        break;
      }
      case OMCONST.MFUNCID.Delete: {
        this.deleteKR(kr);
        break;
      }

      //phân bổ KR
      case OMCONST.MFUNCID.DKRComp:
      case OMCONST.MFUNCID.DKRDept:
      case OMCONST.MFUNCID.DKROrg:
      case OMCONST.MFUNCID.DKRPers: {
        this.distributeOKR(kr, e.text);
        break;
      }

      //phân công KR
      case OMCONST.MFUNCID.AKRComp:
      case OMCONST.MFUNCID.AKRDept:
      case OMCONST.MFUNCID.AKROrg:
      case OMCONST.MFUNCID.AKRPers: {
        this.assignmentOKR(kr, e.text);
        break;
      }
    }
  }
  //-----------------------End-------------------------------//

  //_______________________Get Data Func_____________________//

  //-----------------------End-------------------------------//

  //_______________________Validate Func_____________________//

  //-----------------------End-------------------------------//

  //_______________________Logic Func________________________//

  //-----------------------End-------------------------------//

  //_______________________Logic Event_______________________//

  //-----------------------End-------------------------------//

  //_______________________Custom Func_______________________//

  //-----------------------End-------------------------------//

  //_______________________Custom Event______________________//

  //Lấy danh sách kr của mục tiêu
  getItemOKR(i: any, recID: any) {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
    if (this.openAccordion.every((item) => item === true)) {
      this.isCollaped = true;
    } else if (this.openAccordion.every((item) => item === false)) {
      this.isCollaped = false;
    }
    this.detec.detectChanges();
  }
  collapeKR(collape: boolean) {
    if (this.dataOKR && this.openAccordion.length != this.dataOKR.length) {
      this.openAccordion = new Array(this.dataOKR.length).fill(false);
    }
    this.isCollaped = collape;
    let i = 0;
    this.openAccordion.forEach((item) => {
      this.openAccordion[i] = collape;
      i++;
      this.detec.detectChanges();
    });
    this.detec.detectChanges();
  }

  showTabItem(tabIndex: number, tabItemIndex: number) {
    this.openAccordion[tabIndex] = true;
    window.ng.getComponent(
      document.getElementsByClassName('tab-child-' + tabIndex)[0]
    ).selectedItem = tabItemIndex;
    this.detec.detectChanges();
  }
  //-----------------------End-------------------------------//

  //_______________________Popup_____________________________//

  // Thêm/sửa  KR
  // addKR(o: any) {
  //   let option = new SidebarModel();
  //   option.Width = '550px';
  //   option.FormModel = this.formModel;

  //   let dialogKR = this.callfunc.openSide(
  //     PopupAddKRComponent,
  //     [OMCONST.MFUNCID.Add, popupTitle, o, kr],
  //     option
  //   );
  // }

  editKR(kr: any, o: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelKR;

    let dialogEditKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [OMCONST.MFUNCID.Edit, popupTitle, o, kr],
      option
    );
  }

  copyKR(kr: any, o: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelKR;

    let dialogCopyKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [OMCONST.MFUNCID.Copy, popupTitle, o, kr],
      option
    );
  }

  deleteKR(kr: any) {
    if (false) {
      //Cần thêm kịch bản khi xóa KR
      this.codxOmService.deleteKR(kr).subscribe((res: any) => {
        if (res) {
          this.notificationsService.notifyCode('SYS008');
        } else {
          this.notificationsService.notifyCode('SYS022');
        }
      });
    }
  }
  //Xem chi tiết OB
  showOB(obj: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    dModel.FormModel = this.formModelOB;
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
    dModel.FormModel = this.formModelKR;
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
    dModel.IsFull = true;
    let dialogAssgKR = this.callfunc.openForm(
      PopupAssignmentOKRComponent,
      '',
      null,
      null,
      null,
      [okr.okrName, okr.recID, okr.okrType, this.funcID, title],
      '',
      dModel
    );
  }

  //-----------------------End-------------------------------//
}
