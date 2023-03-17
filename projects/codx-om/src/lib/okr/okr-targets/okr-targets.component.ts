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
const _isAdd = true;
const _isSubKR = true;
const _isEdit = false;
const _notSubKR = false;
@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.scss'],
})
export class OkrTargetsComponent implements OnInit {
  @ViewChild('omTab') omTab: any;
  @ViewChild('treeView') treeView: any;
  @Input() dataOKRPlans: any;
  @Input() dataOKR: any;
  @Input() formModel: any;
  @Input() gridView: any;
  @Input() formModelOB: any;
  @Input() formModelKR: any;
  @Input() formModelSKR: any;
  @Input() skrFuncID: any;
  @Input() krFuncID: any;
  @Input() obFuncID: any;
  @Input() funcID: any;
  @Input() groupModel: any;
  @Input() isHiddenChart: boolean;

  @Output('getOKRPlanForComponent') getOKRPlanForComponent: EventEmitter<any> =
    new EventEmitter();
  isCollapsed = false;
  dtStatus = [];
  openAccordion = [];
  openAccordionKR = [];
  krTitle = '';
  obTitle = '';
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
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;
  tree: any;
  button: ButtonModel;
  isAfterRender: boolean;
  skrTitle: any;
  constructor(
    private callfunc: CallFuncService,
    private cache: CacheService,
    private codxOmService: CodxOmService,
    private api: ApiHttpService,
    private notificationsService: NotificationsService,
    private detec: ChangeDetectorRef
  ) {}
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  ngOnInit(): void {
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
          text: 'Thêm kết quả then chốt',
          id: 'btnAddKR',
        },
      ],
    };
  }

  getCacheData() {
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
            this.button.items.push({
              text: 'Thêm kết quả then chốt cấp con',
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
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd': {
        this.addOB(evt.text);
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
    }
  }
  changeDataKRMF(evt: any, kr: any, isSKR: boolean) {
    if (evt != null && kr != null) {
      if (isSKR) {
      } else {
      }
      evt.forEach((func) => {
        if (
          (func.functionID == 'OMT205' /*Checkin KR*/ ||
            func.functionID == 'OMT304') /*Checkin SKR*/ &&
          kr.assignOKR != null &&
          kr.assignOKR.length > 0
        ) {
          func.disabled = false;
        }
      });
    }
  }
  selectionChange(parent) {
    if (parent.isItem) {
      parent.data.items = parent?.data?.child;
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
            if (ob.child == null) {
              ob.child = [];
            }
            ob.child.push(kr);
            return;
          }
        }
      } else {
        for (let ob of this.dataOKR) {
          if (ob.recID == kr.parentID) {
            if (ob.child == null) {
              ob.child = [];
            }
            for(let i=0;i<ob.child.length;i++){
              if (ob.child[i].recID == kr.recID) {
                this.editRender(ob.child[i], kr);
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
  }
  renderSKR(skr: any, isAdd: boolean) {
    if (skr != null) {
      if (isAdd) {
        for (let ob of this.dataOKR) {
          if (ob.child != null) {
            for (let kr of ob.child) {
              if (kr.recID == skr.parentID) {
                if (kr.child == null) {
                  kr.child = [];
                }
                kr.child.push(skr);
              }
            }
          }
        }
      } else {
        for (let ob of this.dataOKR) {
          if (ob.child != null) {
            for (let kr of ob.child) {
              if (kr.recID == skr.parentID) {
                if (kr.child == null) {
                  kr.child = [];
                }
                for (let oldSKR of kr.child) {
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
  editOKRWeight(ob: any, popupTitle: any) {
    //popupTitle='Thay đổi trọng số cho KRs';
    let subTitle = 'Tính kết quả thực hiện cho mục tiêu';
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogEditWeightKR = this.callfunc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [ob.recID, OMCONST.VLL.OKRType.KResult, popupTitle, subTitle],
      '',
      dModel
    );
  }
  editSKRWeight(kr: any, popupTitle: any) {
    //popupTitle='Thay đổi trọng số cho KRs';
    let subTitle = 'Tính kết quả thực hiện cho mục tiêu';
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogEditWeightSKR = this.callfunc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [kr.recID, OMCONST.VLL.OKRType.SKResult, popupTitle, subTitle],
      '',
      dModel
    );
  }
  checkIn(kr: any, popupTitle: any) {
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
      [kr, popupTitle, { ...this.groupModel?.checkInsModel }]
    );
    dialogCheckIn.closed.subscribe((res) => {
      if (res && res?.event.length > 0) {
        this.caculatorPlanInBackground(res?.event);
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
    option.FormModel = this.formModelOB;
    let dialogOB = this.callfunc.openSide(
      PopupAddOBComponent,
      [this.funcID, OMCONST.MFUNCID.Add, popupTitle, null, this.dataOKRPlans],
      option
    );
    dialogOB.closed.subscribe((res) => {
      this.renderOB(res?.event, _isAdd);
    });
  }
  editOB(ob: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelOB;

    let dialogEditOB = this.callfunc.openSide(
      PopupAddOBComponent,
      [this.krFuncID, OMCONST.MFUNCID.Edit, popupTitle, ob, this.dataOKRPlans],
      option
    );
    dialogEditOB.closed.subscribe((res) => {
      this.renderOB(res?.event, _isEdit);
    });
  }

  copyOB(ob: any, popupTitle: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelOB;

    let dialogCopyOB = this.callfunc.openSide(
      PopupAddOBComponent,
      [this.krFuncID, OMCONST.MFUNCID.Copy, popupTitle, ob, this.dataOKRPlans],
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
    let option = new SidebarModel();

    option.FormModel = isSubKR ? this.formModelSKR : this.formModelKR;

    let dialogKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [this.funcID, OMCONST.MFUNCID.Add, popupTitle, null, isSubKR],
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
    option.FormModel = isSubKR ? this.formModelSKR : this.formModelKR;

    let dialogEditKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [this.krFuncID, OMCONST.MFUNCID.Edit, popupTitle, kr, isSubKR],
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
    option.FormModel = this.formModelKR;

    let dialogCopyKR = this.callfunc.openSide(
      PopupAddKRComponent,
      [this.krFuncID, OMCONST.MFUNCID.Copy, popupTitle, kr, isSubKR],
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
    dModel.FormModel = this.formModelOB;
    let dialogShowOB = this.callfunc.openForm(
      PopupShowOBComponent,
      '',
      null,
      null,
      null,
      [obj.recID, obj.okrName, popupTitle],
      '',
      dModel
    );
  }
  //Xem chi tiết KR
  showKR(kr: any, popupTitle: any) {
    let dModel = new DialogModel();
    dModel.IsFull = true;
    dModel.FormModel = this.formModelKR;
    let dialogShowKR = this.callfunc.openForm(
      PopupShowKRComponent,
      '',
      null,
      null,
      null,
      [kr.recID, kr.okrName, kr.parentID, popupTitle, this.groupModel],
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
      null,
      450,
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
}
