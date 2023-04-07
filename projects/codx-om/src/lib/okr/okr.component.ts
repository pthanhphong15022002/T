import { FormGroup } from '@angular/forms';
declare var window: any;
import { OMCONST } from './../codx-om.constant';
import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  UIComponent,
  ViewModel,
  ViewType,
  AuthStore,
  DialogModel,
  DataRequest,
  FormModel,
  Util,
  NotificationsService,
} from 'codx-core';
import { CodxOmService } from '../codx-om.service';
import { ActivatedRoute } from '@angular/router';
import { PopupOKRWeightComponent } from '../popup/popup-okr-weight/popup-okr-weight.component';
import { PopupAddOKRPlanComponent } from '../popup/popup-add-okr-plan/popup-add-okr-plan.component';
import { PopupShareOkrPlanComponent } from '../popup/popup-share-okr-plans/popup-share-okr-plans.component';
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
  isHiddenChart = true;
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
  curOrg = '';
  curOrgID = '';
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
  interval = 'Y';
  //Năm
  year = new Date().getFullYear();
  fromDate: any;
  toDate: any;
  dataDate = null;
  curUser: any;
  dataRequest = new DataRequest();
  formModelKR = new FormModel();
  formModelSKR = new FormModel();
  formModelOB = new FormModel();
  formModelPlan = new FormModel();
  okrFM = {
    obFM: null,
    krFM: null,
    skrFM: null,
  };
  okrGrv = {
    obGrv: null,
    krGrv: null,
    skrGrv: null,
  };
  okrVll = {
    ob: null,
    kr: null,
    skr: null,
  };
  obFG: FormGroup;
  krFG: FormGroup;
  skrFG: FormGroup;
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
  isAfterRender = false;
  planNull = true;
  addPlanTitle = '';
  //model
  groupModel: any;
  curOrgName: any;
  periodName: any;
  orgUnitTree: any[];
  refIDMeeting:any;
  constructor(
    inject: Injector,
    private activatedRoute: ActivatedRoute,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.auth = inject.get(AuthStore);
    this.okrService = inject.get(CodxOmService);

    this.curUser = this.auth.get();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
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
  }

  onInit(): void {
    
    this.getCacheData();
    this.getOKRModel();
    this.funcIDChanged();
    this.formModelChanged();
    this.createCOObject();
    this.setTitle();
    if (
      this.periodID != null &&
      this.interval != null &&
      this.year != null &&
      this.periodID != '' &&
      this.interval != '' &&
      this.year != 0
    ) {
      this.getOKRPlans(this.periodID, this.interval, this.year);
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  //Lấy form Model con
  formModelChanged() {
    this.codxOmService.getFormModel(this.funcID).then((planFM) => {
      if (planFM) {
        this.formModelPlan = planFM;
      }
    });
    this.codxOmService.getFormModel(this.krFuncID).then((krFM) => {
      if (krFM) {
        this.formModelKR = krFM;
        this.okrFM.krFM = this.formModelKR;

        this.krFG = this.codxService.buildFormGroup(
          this.formModelPlan?.formName,
          this.formModelPlan?.gridViewName
        );

        this.cache
      .gridViewSetup(this.formModelKR?.formName, this.formModelKR?.gridViewName)
      .subscribe((krGrd) => {
        if (krGrd) {
          this.okrGrv.krGrv = Util.camelizekeyObj(krGrd);
        }
      });
    
      }
    });
    this.codxOmService.getFormModel(this.skrFuncID).then((skrFM) => {
      if (skrFM) {
        this.formModelSKR = skrFM;
        this.okrFM.skrFM = this.formModelSKR;
        this.skrFG = this.codxService.buildFormGroup(
          this.formModelSKR?.formName,
          this.formModelSKR?.gridViewName
        );
        this.cache
      .gridViewSetup(
        this.formModelSKR?.formName,
        this.formModelSKR?.gridViewName
      )
      .subscribe((skrGrd) => {
        if (skrGrd) {
          this.okrGrv.skrGrv = Util.camelizekeyObj(skrGrd);
        }
      });
      }
    });
    this.codxOmService.getFormModel(this.obFuncID).then((obFM) => {
      if (obFM) {
        this.formModelOB = obFM;
        this.okrFM.obFM = this.formModelOB;
        this.obFG = this.codxService.buildFormGroup(
          this.formModelOB?.formName,
          this.formModelOB?.gridViewName
        );
        this.cache
      .gridViewSetup(this.formModelOB?.formName, this.formModelOB?.gridViewName)
      .subscribe((obGrd) => {
        if (obGrd) {
          this.okrGrv.obGrv = Util.camelizekeyObj(obGrd);
        }
      });
      }
    });
    //Lấy tiêu đề theo FuncID cho Popup
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.addPlanTitle = res?.description.toString();
      }
    });
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
  getCacheData() {
    this.cache.valueList('OM004').subscribe((vll) => {
      if (vll) {
        this.okrVll.ob=vll?.datas.filter((res) => res.value ==OMCONST.VLL.OKRType.Obj)[0];
        this.okrVll.kr=vll?.datas.filter((res) => res.value ==OMCONST.VLL.OKRType.KResult)[0];
        this.okrVll.skr=vll?.datas.filter((res) => res.value ==OMCONST.VLL.OKRType.SKResult)[0];
        this.okrVll.ob.icon=OMCONST.ASSET_URL+this.okrVll.ob.icon;
        this.okrVll.kr.icon=OMCONST.ASSET_URL+this.okrVll.kr.icon;
        this.okrVll.skr.icon=OMCONST.ASSET_URL+this.okrVll.skr.icon;
      }
    });
    
    
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getOKRModel() {
    this.codxOmService.getOKRModel(this.funcID).subscribe((model: any) => {
      if (model) {
        for (let pro in model) {
          delete model[pro].recID;
          delete model[pro].id;
        }
        this.groupModel = model;
      }
    });
  }
  //Tạo thông tin cho CO
  createCOObject(){
    this.refIDMeeting = {
      projectID: this.dataOKRPlans?.recID ? this.dataOKRPlans?.recID : '',
    };
  }
  //Lấy OKR Plan
  getOKRPlanForComponent(event: any) {
    if (event) {
      if (
        event?.periodID != null &&
        event?.interval != null &&
        event?.year != null &&
        event?.periodID != '' &&
        event?.interval != '' &&
        event?.year != 0
      ) {
        this.getOKRPlans(event?.periodID, event?.interval, event?.year);
      }
    }
  }

  getOKRPlans(periodID: any, interval: any, year: any) {
    if (true) {
      this.okrService
        .getOKRPlans(periodID, interval, year)
        .subscribe((item: any) => {
          //Reset data View
          
          if (item) {            
            this.dataOKRPlans = null;
            this.dataOKRPlans = item;
            this.planNull = false;
            this.isAfterRender = true;
            this.createCOObject();
            this.okrService
              .getAllOKROfPlan(this.dataOKRPlans.recID)
              .subscribe((item1: any) => {
                if (item1) {                  
                  this.dataOKR = null;
                  this.dataOKR = item1;
                }
              });
             this.getOrgTreeOKR();
          } else {
            this.dataOKRPlans = null;
            this.dataOKR = null;
            this.planNull = true;
            this.isAfterRender = true;
          }
        });
    }
  }
getOrgTreeOKR() {
    if (this.curUser?.employee != null) {
      let tempOrgID = '';
      let okrLevel='';
      switch (this.funcID) {
        case OMCONST.FUNCID.COMP:
          tempOrgID = this.curUser?.employee.companyID;
          okrLevel =OMCONST.VLL.OKRLevel.COMP;
          break;
        case OMCONST.FUNCID.DEPT:
          tempOrgID = this.curUser?.employee.departmentID;
          okrLevel =OMCONST.VLL.OKRLevel.DEPT;
          break;
        case OMCONST.FUNCID.ORG:
          tempOrgID = this.curUser?.employee.orgUnitID;
          okrLevel =OMCONST.VLL.OKRLevel.ORG;
          break;
        case OMCONST.FUNCID.PERS:
          tempOrgID = this.curUser?.employee.employeeID;          
          okrLevel =OMCONST.VLL.OKRLevel.PERS;
          break;
      }
      this.codxOmService.getOrgTreeOKR(this.dataOKRPlans?.recID,tempOrgID).subscribe((listOrg: any) => {
        if (listOrg) { 
            this.orgUnitTree=[listOrg];
        }
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
        this.curOrgID = this.curUser?.employee?.companyID;
        this.curOrgName = this.curUser?.employee?.companyName;
        break;
      case OMCONST.FUNCID.DEPT:
        this.skrFuncID = OMCONST.SKRFUNCID.DEPT;
        this.krFuncID = OMCONST.KRFUNCID.DEPT;
        this.obFuncID = OMCONST.OBFUNCID.DEPT;
        this.okrLevel = OMCONST.VLL.OKRLevel.DEPT;
        this.curOrgID = this.curUser?.employee?.departmentID;
        this.curOrgName = this.curUser?.employee?.departmentName;
        break;
      case OMCONST.FUNCID.ORG:
        this.skrFuncID = OMCONST.SKRFUNCID.ORG;
        this.krFuncID = OMCONST.KRFUNCID.ORG;
        this.obFuncID = OMCONST.OBFUNCID.ORG;
        this.okrLevel = OMCONST.VLL.OKRLevel.ORG;
        this.curOrgID = this.curUser?.employee?.orgUnitID;
        this.curOrgName = this.curUser?.employee?.orgUnitName;
        break;
      case OMCONST.FUNCID.PERS:
        this.skrFuncID = OMCONST.SKRFUNCID.PERS;
        this.krFuncID = OMCONST.KRFUNCID.PERS;
        this.obFuncID = OMCONST.OBFUNCID.PERS;
        this.okrLevel = OMCONST.VLL.OKRLevel.PERS;
        this.curOrgID = this.curUser?.employee?.employeeID;
        this.curOrgName = this.curUser?.employee?.employeeName;
        break;
    }
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  //Sự kiện thay đổi view (funcID thay đổi - load lại page với data mới)

  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.getOKRModel();
    this.funcIDChanged();
    this.formModelChanged();
    this.setTitle();
    this.dataOKRPlans = null;
    this.dataOKR = null;
    if(this.periodID !=null && this.interval!=null && this.year!=null && this.periodID !='' && this.interval!='' && this.year!=0){

      this.getOKRPlans(this.periodID, this.interval, this.year);
    }
    this.detectorRef.detectChanges();
  }
  clickMF(evt: any) {
    switch (evt?.functionID) {
      case OMCONST.MFUNCID.PlanWeightCOMP:
      case OMCONST.MFUNCID.PlanWeightDEPT:
      case OMCONST.MFUNCID.PlanWeightORG:
      case OMCONST.MFUNCID.PlanWeightPER:
        this.editPlanWeight(evt?.text);
        break;
      case OMCONST.MFUNCID.ReleasePlanCOMP:
      case OMCONST.MFUNCID.ReleasePlanDEPT:
      case OMCONST.MFUNCID.ReleasePlanORG:
      case OMCONST.MFUNCID.ReleasePlanPER:
        this.changePlanStatus(OMCONST.VLL.PlanStatus.Ontracking);
        break;
      case OMCONST.MFUNCID.UnReleasePlanCOMP:
      case OMCONST.MFUNCID.UnReleasePlanDEPT:
      case OMCONST.MFUNCID.UnReleasePlanORG:
      case OMCONST.MFUNCID.UnReleasePlanPER:
        this.changePlanStatus(OMCONST.VLL.PlanStatus.NotStarted);
        break;
      case OMCONST.MFUNCID.SharesPlanCOMP:
      case OMCONST.MFUNCID.SharesPlanDEPT:
      case OMCONST.MFUNCID.SharesPlanORG:
      case OMCONST.MFUNCID.SharesPlanPER:
        this.sharePlan(evt?.text);
        break;
    }
  }
  changeDataMF(evt:any){
    if(evt !=null){
      // if(this.dataOKR!=null && this.dataOKR.length>0){
      //   evt.forEach((func) => {
      //     if (func.functionID == OMCONST.MFUNCID.PlanWeightPER ||
      //       func.functionID == OMCONST.MFUNCID.PlanWeightORG ||
      //       func.functionID == OMCONST.MFUNCID.PlanWeightDEPT ||
      //       func.functionID == OMCONST.MFUNCID.PlanWeightCOMP ) {
      //       func.disabled = false;
      //     }
      //   });
      // }
      // else{
      //   //nếu ko có OKR thì ẩn MF phân bổ trọng số
      //   evt.forEach((func) => {
      //     if (func.functionID == OMCONST.MFUNCID.PlanWeightPER ||
      //       func.functionID == OMCONST.MFUNCID.PlanWeightORG ||
      //       func.functionID == OMCONST.MFUNCID.PlanWeightDEPT ||
      //       func.functionID == OMCONST.MFUNCID.PlanWeightCOMP ) {
      //       func.disabled = true;
      //     }
      //   });
      // }
    }
  }
  //Hàm click
  click(event: any) {
    switch (event.id) {      
      case 'btnAddPlan': {
        this.addEditOKRPlans(true);
        break;
      }
      case 'Calendar': {
        this.changeCalendar(event.data);
        break;
      }
    }
  }
  //Thời gian thay đổi
  changeCalendar(data: any) {
    let date = new Date(data.toDate);
    this.year = date.getFullYear();
    this.dataDate = {
      formDate: data.fromDate,
      toDate: data.toDate,
    };
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    if (data.type == 'year') {
      this.periodID = this.year.toString();
      this.periodName = this.periodID
      this.interval = 'Y';
    } else if (data.type == 'quarter') {
      this.periodID = data.text;
      this.periodName = this.periodID
      this.interval = 'Q';
    } else if (data.type == 'month') {
      this.periodID = (date.getMonth() + 1).toString();
      this.periodName = data?.text;
      this.interval = 'M';
    }
    this.setTitle();
    if (
      this.periodID != null &&
      this.interval != null &&
      this.year != null &&
      this.periodID != '' &&
      this.interval != '' &&
      this.year != 0
    ) {
      this.getOKRPlans(this.periodID, this.interval, this.year);
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  hiddenChartClick(evt: any) {
    this.isHiddenChart = evt;
    this.detectorRef.detectChanges();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  changePlanStatus(status) {
    this.codxOmService
      .changePlanStatus(this.dataOKRPlans.recID, status)
      .subscribe((res) => {
        if (res) {
          this.dataOKRPlans.status = status;
          this.notificationsService.notifyCode('SYS034'); //đã duyệt
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
  setTitle() {
    this.compName =
      this.curUser?.employee?.companyName != null
        ? this.curUser?.employee?.companyName
        : '';

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
        this.setNotifyPlan();
        this.notifyPlanNull = mess.defaultName;
        this.compPlanNull = this.compName;
        this.deptPlanNull = this.deptName;
        this.orgPlanNull = this.orgName;
        this.persPlanNull = this.persName;
        this.notifyPlanNull = this.notifyPlanNull.replace('{1}', this.periodName);
        this.compPlanNull = this.notifyPlanNull.replace('{0}', this.compName);
        this.deptPlanNull = this.notifyPlanNull.replace('{0}', this.deptName);
        this.orgPlanNull = this.notifyPlanNull.replace('{0}', this.orgPlanNull);
        this.persPlanNull = this.notifyPlanNull.replace(
          '{0}',
          this.persPlanNull
        );
      }
    });
  }
  setNotifyPlan() {
    switch (this.funcID) {
      case OMCONST.FUNCID.COMP:
        this.curOrg = this.compName;
        break;
      case OMCONST.FUNCID.DEPT:
        this.curOrg = this.deptName;
        break;
      case OMCONST.FUNCID.ORG:
        this.curOrg = this.orgName;
        break;
      case OMCONST.FUNCID.PERS:
        this.curOrg = this.persName;
        break;
    }
    this.notifyPlanNull.replace('{0}', this.curOrg);
    this.notifyPlanNull.replace('{1}', this.periodName);
  }


  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  deleteOKRPlans() {
    this.codxOmService
      .deleteOKRPlans(this.dataOKRPlans.recID)
      .subscribe((res) => {
        if (res) {
        }
      });
  }
  //Thêm mới bộ mục tiêu
  addEditOKRPlans(isAdd: boolean) {
    let tmpPlan = this.dataOKRPlans;
    if (isAdd) {
      tmpPlan = { ...this.groupModel.planModel };
      tmpPlan.interval = this.interval;
      tmpPlan.year = this.year;
      tmpPlan.periodID = this.periodID;
      tmpPlan.okrLevel = this.okrLevel;
      tmpPlan.fromDate = this.fromDate;
      tmpPlan.toDate = this.toDate;
    }
    let curFunc = isAdd ? OMCONST.MFUNCID.Add : OMCONST.MFUNCID.Edit;
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    dialogModel.FormModel = this.formModelPlan;
    let dialogAddPlan = this.callfc.openForm(
      PopupAddOKRPlanComponent,
      '',
      null,
      null,
      null,
      [
        this.funcID,
        tmpPlan,
        { ...this.groupModel },
        this.addPlanTitle,
        this.curOrgID,
        this.curOrgName,
        this.okrFM,
        this.okrVll,
        curFunc,
        this.okrGrv,
      ],
      '',
      dialogModel
    );
    dialogAddPlan.closed.subscribe((item) => {
      if (item.event) {
        if (
          this.periodID != null &&
          this.interval != null &&
          this.year != null &&
          this.periodID != '' &&
          this.interval != '' &&
          this.year != 0
        ) {
          this.getOKRPlans(this.periodID, this.interval, this.year);
        }
      }
    });
  }
  editPlanWeight(popupTitle: any) {
    //OM_WAIT: tiêu đề tạm thời gán cứng
    let subTitle = this.curOrgName;
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogEditWeight = this.callfc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [this.dataOKRPlans, OMCONST.VLL.OKRType.Obj, popupTitle, subTitle,this.okrVll,this.okrFM],
      '',
      dModel
    );
    dialogEditWeight.closed.subscribe((item) => {
      if (item.event) {
        if (
          this.periodID != null &&
          this.interval != null &&
          this.year != null &&
          this.periodID != '' &&
          this.interval != '' &&
          this.year != 0
        ) {
          this.getOKRPlans(this.periodID, this.interval, this.year);
        }
      }
    });
  }
  
  //Chia sẻ bộ mục tiêu
  sharePlan(popupTitle: any) {
    let shareFM = new FormModel();
    shareFM.entityName = 'OM_OKRs.Shares';
    shareFM.entityPer = 'OM_OKRs.Shares';
    shareFM.gridViewName = 'grvOKRs.Shares';
    shareFM.formName = 'OKRs.Shares';
    let dialog = this.callfc.openSide(PopupShareOkrPlanComponent, [
      popupTitle,
      this.gridView,
      shareFM,
      this.dataOKRPlans?.recID,
      { ...this.groupModel.sharesModel },
    ]);
  }
}
