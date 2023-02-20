declare var window: any;
import { OMCONST } from './../codx-om.constant';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
  AuthStore,
  CallFuncService,
  DialogModel,
  DataRequest,
  SidebarModel,
  FormModel,
  AuthService,
  Util,
} from 'codx-core';
import { CodxOmService } from '../codx-om.service';
import { PopupAddKRComponent } from '../popup/popup-add-kr/popup-add-kr.component';
import { PopupShowKRComponent } from '../popup/popup-show-kr/popup-show-kr.component';
import { OkrAddComponent } from './okr-add/okr-add.component';
import { OkrPlansComponent } from './okr-plans/okr-plans.component';
import { ActivatedRoute } from '@angular/router';
import { OkrPlanShareComponent } from './okr-plans/okr-plans-share/okr-plans-share.component';
import { PopupAddOBComponent } from '../popup/popup-add-ob/popup-add-ob.component';
import { PopupOKRWeightComponent } from '../popup/popup-okr-weight/popup-okr-weight.component';
const _isAdd = true;
const _isSubKR = true;
const _notSubKR = false;
@Component({
  selector: 'lib-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OKRComponent extends UIComponent implements AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild('panelRight') panelRight: TemplateRef<any>;
  openAccordion = [];
  dataOKR = [];
  dataOKRPlans = null;
  isHiddenChart = false;
  //title//
  dtCompany = null;
  compName = '';
  deptName = '';
  orgName = '';
  persName = '';
  
  compPlanNull = '';
  deptPlanNull = '';
  orgPlanNull = '';
  persPlanNull = '';
  compFuncID = OMCONST.FUNCID.COMP;
  deptFuncID = OMCONST.FUNCID.DEPT;
  orgFuncID = OMCONST.FUNCID.ORG;
  persFuncID = OMCONST.FUNCID.PERS;
  /////////
  auth: AuthStore;
  okrService: CodxOmService;
  gridView: any;

  //Kỳ
  periodID = new Date().getFullYear().toString();
  //Loại
  interval = '';
  //Năm
  year = new Date().getFullYear();
  dataDate = null;
  curUser: any;
  dataRequest = new DataRequest();
  formModelKR = new FormModel();
  formModelSKR = new FormModel();
  formModelOB = new FormModel();
  formModel = new FormModel();
  funcID: any;
  obFuncID: any;
  krFuncID: any;
  skrFuncID: any;
  addKRTitle = '';
  addSKRTitle = '';
  addOBTitle = '';
  okrLevel: string;
  notifyPlanNull = '';
  date: any = new Date();
  ops = ['m', 'q', 'y'];
  isAfterRender=false;
  constructor(
    inject: Injector,
    private activatedRoute: ActivatedRoute,
    private codxOmService: CodxOmService
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.auth = inject.get(AuthStore);
    this.okrService = inject.get(CodxOmService);
    //var x= this.authService.userValue;
    this.codxOmService.getFormModel(this.funcID).then((fm) => {
      if (fm) {
        this.formModel = fm;
      }
    });
  }

  //-----------------------Base Func-------------------------//
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelRightRef: this.panelRight,
        },
      },
    ];
    this.getGridViewSetup();

    this.dataRequest.funcID = this.funcID;
    this.dataRequest.entityName = 'OM_OKRs';
    this.dataRequest.page = 1;
    this.dataRequest.pageSize = 20;
    this.dataRequest.predicate = 'ParentID=@0';
  }

  onInit(): void {  
    this.funcIDChanged();
    this.formModelChanged();
    this.setTitle();
    this.getOKRPlans(this.periodID, this.interval, this.year);
    this.curUser = this.auth.get();

    
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  //Sự kiện thay đổi view (funcID thay đổi - load lại page với data mới)
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.funcIDChanged();
    this.formModelChanged();
    this.setTitle();
    this.dataOKRPlans=null;
    this.dataOKR=null;
    this.getOKRPlans(this.periodID, this.interval, this.year);
    this.detectorRef.detectChanges();
  }

  //Hàm click
  click(event: any) {
    switch (event.id) {
      case 'btnAdd': {
        if (this.dataOKRPlans == null) {
          this.addOKRPlans();
        } else {
          this.addOB();
        }
        break;
      }
      case 'btnAddSKR': {
        if (this.dataOKRPlans == null) {
          this.addOKRPlans();
        } else {
          this.addSKR();
        }
        break;
      }
      case 'btnAddKR': {
        if (this.dataOKRPlans == null) {
          this.addOKRPlans();
        } else {
          this.addKR();
        }
        break;
      }
      case 'btnAddPlan': {
        this.addOKRPlans();
        break;
      }
      case 'btnAddO': {
        if (this.dataOKRPlans == null) {
          this.addOKRPlans();
        } else {
          this.addOB();
        }
        break;
      }
      case 'Calendar': {
        this.changeCalendar(event.data);
        break;
      }
      case 'SharePlan': {
        this.sharePlan();
        break;
      }
    }
  }
  //Thời gian thay đổi
  changeCalendar(data: any) {
    var date = new Date(data.toDate);
    this.year = date.getFullYear();
    this.dataDate = {
      formDate: data.formDate,
      toDate: data.toDate,
    };
    if (data.type == 'year') {
      this.periodID = this.year.toString();
      this.interval = 'Y';
    } else if (data.type == 'quarter') {
      this.periodID = data.text;
      this.interval = 'Q';
    } else if (data.type == 'month') {
      this.periodID = (date.getMonth() + 1).toString();
      this.interval = 'M';
    }
    this.setTitle()
    this.getOKRPlans(this.periodID, this.interval, this.year);

  }

  //-----------------------End-------------------------------//

  //-----------------------Get Data Func---------------------//
  //Lấy OKR Plan
  getOKRPlans(periodID: any, interval: any, year: any) {
    if (true) {
      this.okrService
        .getOKRPlans(periodID, interval, year)
        .subscribe((item: any) => {
          //Reset data View
          this.dataOKRPlans = null;
          this.dataOKR = null;
          if (item) {
            this.dataOKRPlans = item;
            //----------
            this.dataRequest.dataValue = item.recID;
            //----------
            this.okrService
              .getAllOKROfPlan(this.dataOKRPlans.recID)
              .subscribe((item: any) => {
                if (item) {
                  this.dataOKR = item;
                }
                
                this.isAfterRender=true;
              });
          }
          
          this.isAfterRender=true;
        });
    }
  }
  //Lấy fucID con
  funcIDChanged() {
    switch (this.funcID) {
      case OMCONST.FUNCID.COMP:
        this.krFuncID = OMCONST.KRFUNCID.COMP;
        this.skrFuncID = OMCONST.SKRFUNCID.COMP;
        this.obFuncID = OMCONST.OBFUNCID.COMP;
        this.okrLevel = OMCONST.VLL.OKRLevel.COMP;

        break;
      case OMCONST.FUNCID.DEPT:
        this.skrFuncID = OMCONST.SKRFUNCID.DEPT;
        this.krFuncID = OMCONST.KRFUNCID.DEPT;
        this.obFuncID = OMCONST.OBFUNCID.DEPT;
        this.okrLevel = OMCONST.VLL.OKRLevel.DEPT;
        break;
      case OMCONST.FUNCID.ORG:
        this.skrFuncID = OMCONST.SKRFUNCID.ORG;
        this.krFuncID = OMCONST.KRFUNCID.ORG;
        this.obFuncID = OMCONST.OBFUNCID.ORG;
        this.okrLevel = OMCONST.VLL.OKRLevel.ORG;
        break;
      case OMCONST.FUNCID.PERS:
        this.skrFuncID = OMCONST.SKRFUNCID.PERS;
        this.krFuncID = OMCONST.KRFUNCID.PERS;
        this.obFuncID = OMCONST.OBFUNCID.PERS;
        this.okrLevel = OMCONST.VLL.OKRLevel.PERS;
        break;
    }
    this.detectorRef.detectChanges();
  }
  //Lấy form Model con
  formModelChanged() {
    this.codxOmService.getFormModel(this.funcID).then((planFM) => {
      if (planFM) {
        this.formModel = planFM;
      }
    });
    this.codxOmService.getFormModel(this.krFuncID).then((krFM) => {
      if (krFM) {
        this.formModelKR = krFM;
      }
    });
    this.codxOmService.getFormModel(this.skrFuncID).then((skrFM) => {
      if (skrFM) {
        this.formModelSKR = skrFM;
      }
    });
    this.codxOmService.getFormModel(this.obFuncID).then((obFM) => {
      if (obFM) {
        this.formModelOB = obFM;        
      }
    });
    //Lấy tiêu đề theo FuncID cho Popup
    this.cache.functionList(this.skrFuncID).subscribe((res) => {
      if (res) {
        this.addSKRTitle = res.customName.toString();
      }
    });
    this.cache.functionList(this.krFuncID).subscribe((res) => {
      if (res) {
        this.addKRTitle = res.customName.toString();
      }
    });
    this.cache.functionList(this.obFuncID).subscribe((res) => {
      if (res) {
        this.addOBTitle = res.customName.toString();
      }
    });
  }

  //Lấy data danh sách mục tiêu
  getGridViewSetup() {
    this.okrService.loadFunctionList(this.view.funcID).subscribe((fuc) => {
      this.okrService
        .loadGridView(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridView = grd;
        });
    });
  }

  //-----------------------End-------------------------------//

  //-----------------------Validate Func---------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Func------------------------//

  //-----------------------End-------------------------------//

  //-----------------------Logic Event-----------------------//

  //-----------------------End-------------------------------//

  //-----------------------Custom Func-----------------------//
  setTitle(){
    this.compName =
      this.curUser?.employee?.companyName != null
        ? this.curUser?.employee?.companyName
        : '';
    this.compName = this.compName != '' ? this.compName : 'Công ty';

    this.deptName =
      this.curUser?.employee?.departmentName != null
        ? this.curUser?.employee?.departmentName
        : '';

    this.orgName =
      this.curUser?.employee?.orgUnitName != null
        ? this.curUser?.employee?.orgUnitName
        : '';

    this.persName =
      this.curUser?.employee?.employeeName != null
        ? this.curUser?.employee?.employeeName
        : '';
    this.cache.message('OM001').subscribe((mess) => {
      if (mess) {
        this.notifyPlanNull = mess.defaultName;
        this.compPlanNull = '';
        this.deptPlanNull = '';
        this.orgPlanNull = '';
        this.persPlanNull = '';
        this.notifyPlanNull = this.notifyPlanNull.replace('{1}',this.periodID);
        this.compPlanNull= this.notifyPlanNull.replace('{0}',this.compName);
        this.deptPlanNull= this.notifyPlanNull.replace('{0}',this.deptName);
        this.orgPlanNull= this.notifyPlanNull.replace('{0}',this.orgPlanNull);
        this.persPlanNull= this.notifyPlanNull.replace('{0}',this.persPlanNull);
      }
    });
    

  }
  setNotifyPlan() {
    let owner = '';
    switch (this.funcID) {
      case OMCONST.FUNCID.COMP:
        owner = this.compName;
        break;
      case OMCONST.FUNCID.DEPT:
        owner = this.deptName;
        break;
      case OMCONST.FUNCID.ORG:
        owner = this.orgName;
        break;
      case OMCONST.FUNCID.PERS:
        owner = this.persName;
        break;
    }
    this.notifyPlanNull.replace('{0}',owner);
    this.notifyPlanNull.replace('{1}', this.dataOKRPlans.periodID);
    
  }

  editWeight(planRecID: any) {
    //OM_WAIT: tiêu đề tạm thời gán cứng
    let popupTitle = 'Thay đổi trọng số cho mục tiêu';
    let subTitle = 'Trọng số & kết quả thực hiện';
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogShowKR = this.callfc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [planRecID, OMCONST.VLL.OKRType.Obj, popupTitle, subTitle],
      '',
      dModel
    );
  }
  renderOB(ob: any, isAdd: boolean) {
    if (ob != null) {
      if (isAdd) {
        this.dataOKR.push(ob);
      } else {
        for (let oldOB of this.dataOKR) {
          if (oldOB.recID == ob.recID) {
            let tmpChild = oldOB?.child;
            oldOB = ob;
            oldOB.child = tmpChild;
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
          }
        }
      } else {
        debugger;
        for (let ob of this.dataOKR) {
          if (ob.recID == kr.parentID) {
            if (ob.child == null) {
              ob.child = [];
            }
            ob.child.forEach((okr) => {
              if (okr.recID == kr.recID) {
                for (const field in okr) {
                  okr[field] = kr[field];
                }
              }
            });
          }
        }
      }
    }
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
                    debugger;
                    for (const field in oldSKR) {
                      oldSKR[field] = skr[field];
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  //-----------------------End-------------------------------//

  //-----------------------Custom Event-----------------------//
  hiddenChartClick(evt: any) {
    this.isHiddenChart = evt;
    this.detectorRef.detectChanges();
  }

  //-----------------------End-------------------------------//

  //-----------------------Popup-----------------------------//

  //Thêm mới bộ mục tiêu
  addOKRPlans() {
    var dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    let dialog = this.callfc.openForm(
      OkrPlansComponent,
      '',
      null,
      null,
      null,
      [
        this.view.formModel,
        this.periodID,
        this.interval,
        this.year,
        this.dataDate,
        this.dtCompany,
        this.okrLevel,
        this.dataOKR,
      ],
      '',
      dialogModel
    );
    dialog.closed.subscribe((item) => {
      if (item.event) this.dataOKR = this.dataOKR.concat(item.event);
    });
  }

  //Thêm mới mục tiêu
  addOKR() {
    let option = new SidebarModel();
    option.FormModel = this.formModelOB;
    let dialogOB = this.callfc.openSide(
      OkrAddComponent,
      [this.gridView, this.formModelOB, 'add', this.dataOKRPlans, null],
      option
    );
    //   "add",
    //   this.dataOKRPlans,
    //   null
    //  ]
    // );
  }
  addOB() {
    let option = new SidebarModel();
    option.FormModel = this.formModelOB;
    let dialogOB = this.callfc.openSide(
      PopupAddOBComponent,
      [
        this.funcID,
        OMCONST.MFUNCID.Add,
        'Thêm ' + this.addOBTitle.toLowerCase(),
        null,
        this.dataOKRPlans,
      ],
      option
    );
    dialogOB.closed.subscribe((res) => {
      if (res && res?.event) {
        this.dataOKR.push(res?.event);
      }
    });
  }
  //Thêm mới KR
  addKR() {
    let option = new SidebarModel();
    option.FormModel = this.formModelKR;

    let dialogKR = this.callfc.openSide(
      PopupAddKRComponent,
      [
        this.funcID,
        OMCONST.MFUNCID.Add,
        'Thêm ' + this.addKRTitle.toLowerCase(),
        null,
        _notSubKR,
      ],
      option
    );
    dialogKR.closed.subscribe((res) => {
      this.renderKR(res?.event, _isAdd);
    });
  }
  //Thêm mới SKR
  addSKR() {
    let option = new SidebarModel();
    option.FormModel = this.formModelSKR;

    let dialogSKR = this.callfc.openSide(
      PopupAddKRComponent,
      [
        this.funcID,
        OMCONST.MFUNCID.Add,
        'Thêm ' + this.addSKRTitle.toLowerCase(),
        null,
        _isSubKR,
      ],
      option
    );
    dialogSKR.closed.subscribe((res) => {
      this.renderSKR(res?.event, _isAdd);
    });
  }
  //Chia sẻ bộ mục tiêu
  sharePlan() {
    let dialog = this.callfc.openSide(OkrPlanShareComponent, [
      this.gridView,
      this.view.formModel,
      this.dataOKRPlans,
    ]);
  }
  //-----------------------End-------------------------------//
}
