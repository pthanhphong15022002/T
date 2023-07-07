import { OKRPlans } from './../model/okrPlan.model';
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
  AuthService,
  SidebarModel,
  PageTitleService,
} from 'codx-core';
import { CodxOmService } from '../codx-om.service';
import { ActivatedRoute } from '@angular/router';
import { PopupOKRWeightComponent } from '../popup/popup-okr-weight/popup-okr-weight.component';
import { PopupAddOKRPlanComponent } from '../popup/popup-add-okr-plan/popup-add-okr-plan.component';
import { PopupShareOkrPlanComponent } from '../popup/popup-share-okr-plans/popup-share-okr-plans.component';
import { PopupAddRoleComponent } from '../popup/popup-add-role/popup-add-role.component';
import { PopupViewVersionComponent } from '../popup/popup-view-version/popup-view-version.component';
import { OM_Statistical } from '../model/okr.model';
import { PopupAddVersionComponent } from '../popup/popup-add-version/popup-add-version.component';
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
  showPlanMF = false;
  //Kỳ
  periodID: string;
  //Loại
  interval: string;
  //Năm
  year: number;
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
  refIDMeeting: any;
  isCollapsed = false;
  listUM = [];
  loadedData: boolean = false;
  loadedDataTree: boolean;
  useSKR = false;
  reloadedMF = true;
  value = new OM_Statistical();
  sharedPlan = [];
  sharedView = false;
  sharedPlanName='';
  adminRole = false;
  constructor(
    inject: Injector,    
    private pageTitle: PageTitleService,
    private activatedRoute: ActivatedRoute,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.auth = inject.get(AuthStore);
    this.curUser = this.auth.get();
    this.curUser= this.authService.userValue;
    this.okrService = inject.get(CodxOmService);
    this.createCOObject();

  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//

  onInit(): void {
    this.pageTitle.setBreadcrumbs([]);
    if (this.curUser.employee == null) {
      this.codxOmService.getUser([this.curUser?.userID]).subscribe((user) => {
        if (user) {
          this.codxOmService
            .getEmployeesByEmpID(user[0]?.employeeID)
            .subscribe((emp) => {
              if (emp) {
                this.curUser.employee = emp;
                this.getCacheData();
                this.getOKRModel();
                this.funcIDChanged();
                this.createCOObject();
                this.setTitle();
                //this.getOKRPlans(this.periodID, this.interval, this.year);
              }
            });
        }
      });
    } else {
      this.getCacheData();
      this.getOKRModel();
      this.funcIDChanged();
      this.createCOObject();
      this.setTitle();
      //this.getOKRPlans(this.periodID, this.interval, this.year);
    }
  }
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
        this.cache
          .gridViewSetup(
            this.formModelKR?.formName,
            this.formModelKR?.gridViewName
          )
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
        this.cache
          .gridViewSetup(
            this.formModelOB?.formName,
            this.formModelOB?.gridViewName
          )
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
    this.codxOmService.roleCheck().subscribe(res=>{
      if(res){
        this.adminRole=true;
      }
    })
    this.cache.valueList('OM004').subscribe((vll) => {
      if (vll) {
        this.okrVll.ob = vll?.datas.filter(
          (res) => res.value == OMCONST.VLL.OKRType.Obj
        )[0];
        this.okrVll.kr = vll?.datas.filter(
          (res) => res.value == OMCONST.VLL.OKRType.KResult
        )[0];
        this.okrVll.skr = vll?.datas.filter(
          (res) => res.value == OMCONST.VLL.OKRType.SKResult
        )[0];
        this.okrVll.ob.icon = OMCONST.ASSET_URL + this.okrVll.ob.icon;
        this.okrVll.kr.icon = OMCONST.ASSET_URL + this.okrVll.kr.icon;
        this.okrVll.skr.icon = OMCONST.ASSET_URL + this.okrVll.skr.icon;
      }
    });
    this.codxOmService.getListUM().subscribe((res: any) => {
      if (res) {
        Array.from(res).forEach((um: any) => {
          this.listUM.push({ umid: um?.umid, umName: um?.umName });
        });
      }
    });
    this.codxOmService
      .getSettingValue(OMCONST.OMPARAM)
      .subscribe((omSetting: any) => {
        if (omSetting) {
          let settingVal = JSON.parse(omSetting?.dataValue);
          if (settingVal?.UseSubKR == '1' || settingVal?.UseSubKR == true) {
            this.useSKR = true;
          }
        }
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getCurrentEmp() {
    this.codxOmService.getUser([this.curUser?.userID]).subscribe((emp) => {
      if (emp) {
        this.curUser.employee = emp[0];
      }
    });
  }
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
  createCOObject() {
    this.refIDMeeting = {
      projectID: this.dataOKRPlans?.recID ? this.dataOKRPlans?.recID : '',
    };
  }
  //Lấy OKR Plan
  getOKRPlanForComponent(event: any) {
    if (event) {
      this.getOKRPlans(event?.periodID, event?.interval, event?.year);
    }
  }

  getSharedPlans(periodID: any, interval: any, year: any) {
    if (
      this.periodID != null &&
      this.interval != null &&
      this.year != null &&
      this.periodID != '' &&
      this.interval != '' &&
      this.year != 0
    ) {
      this.sharedPlan=[];
      this.okrService
        .getSharedPlans(this.dataRequest, periodID, interval, year)
        .subscribe((sharedPlan: any) => {
          //Reset data View
          //this.isCollapsed = false;
          if (sharedPlan) {
            this.sharedPlan = sharedPlan;
          }
        });
    }
  }
  viewSharedPlan(plan: any) {
    if (plan != null) {
      this.sharedPlanName=plan?.planName;
      this.sharedView = true;
      this.showPlanMF = false;
      this.loadedData = false;
      this.dataOKRPlans = plan;
      //this.createCOObject();
      this.okrService.getAllOKROfPlan(plan?.recID).subscribe((okrs: any) => {
        if (okrs) {
          this.dataOKR = okrs;
        } else {
          this.dataOKR = null;
        }
        this.calculateStatistical(null);
        this.isAfterRender = true;
        //this.showPlanMF = true;
        this.loadedData = true;
        this.detectorRef.detectChanges();
      });
    }
  }
  viewMyPlan(){    
    this.getOKRPlans(this.periodID, this.interval, this.year);
  }
  getOKRPlans(periodID: any, interval: any, year: any) {
    this.showPlanMF = false;
    this.loadedData = false;
    this.sharedView=false;
    if (
      this.periodID != null &&
      this.interval != null &&
      this.year != null &&
      this.periodID != '' &&
      this.interval != '' &&
      this.year != 0
    ) {
      this.okrService
        .getOKRPlans(this.dataRequest, periodID, interval, year)
        .subscribe((item: any) => {
          //Reset data View
          //this.isCollapsed = false;
          if (item) {
            this.dataOKRPlans = item;
            this.dataOKRPlans.periodName = this.periodName;
            this.planNull = false;
            this.createCOObject();
            this.okrService
              .getAllOKROfPlan(item?.recID)
              .subscribe((okrs: any) => {
                if (okrs) {
                  this.dataOKR = okrs;
                } else {
                  this.dataOKR = null;
                }
                this.calculateStatistical(null);
                this.isAfterRender = true;
                this.showPlanMF = true;
                this.loadedData = true;
                this.getOrgTreeOKR();
                this.detectorRef.detectChanges();
              });
          } else {
            this.dataOKRPlans = null;
            this.orgUnitTree = [];
            this.dataOKRPlans = null;
            this.dataOKR = null;
            this.planNull = true;
            this.isAfterRender = true;
            this.loadedData = true;
            this.detectorRef.detectChanges();
          }
        });
    } else {
      this.loadedData = true;
      this.orgUnitTree = [];
      this.dataOKRPlans = null;
      this.dataOKR = null;
      this.planNull = true;
      this.isAfterRender = true;
      this.detectorRef.detectChanges();
    }
  }
  updateOKRPlans(planRecID: string) {
    this.okrService.getOKRPlansByID(planRecID).subscribe((res: any) => {
      if (res) {
        this.dataOKRPlans.status = res?.status;
        this.dataOKRPlans.progress = res?.progress;
      }
    });
    this.okrService.getAllOKROfPlan(planRecID).subscribe((okrs: any) => {
      if (okrs) {
        let x = okrs;
        this.getOrgTreeOKR();
        for (let gr of okrs) {
          let filterGR = this.dataOKR?.filter(
            (x) => x?.okrGroupID == gr?.okrGroupID
          );

          if (filterGR != null && filterGR?.length > 0) {
            for (let ob of gr?.listOKR) {
              let filterOB = filterGR[0]?.listOKR.filter(
                (x) => x.recID == ob?.recID
              );
              let newOB = ob;
              if (filterOB != null && filterOB.length > 0) {
                let oldOB = filterOB[0];
                oldOB.actual = newOB?.actual;
                oldOB.target = newOB?.target;
                oldOB.current = newOB?.current;
                oldOB.weight = newOB?.weight;
                oldOB.progress = newOB?.progress;
                oldOB.hasAssign = newOB?.hasAssign;
                oldOB.modifiedOn = new Date();

                this.detectorRef.detectChanges();
                if (newOB?.items != null && newOB?.items?.length > 0) {
                  //update KR
                  for (let k = 0; k < newOB?.items?.length; k++) {
                    let filterKR = oldOB?.items.filter(
                      (x) => x.recID == newOB?.items[k]?.recID
                    );
                    let newKR = newOB?.items[k];
                    if (filterKR != null && filterKR.length > 0) {
                      let oldKR = filterKR[0];
                      oldKR.actual = newKR?.actual;
                      oldKR.target = newKR?.target;
                      oldKR.current = newKR?.current;
                      oldKR.weight = newKR?.weight;
                      oldKR.progress = newKR?.progress;
                      oldKR.targets = newKR?.targets;
                      oldKR.checkIns = newKR?.checkIns;
                      oldKR.hasAssign = newKR?.hasAssign;
                      oldKR.okrLink = newKR?.okrLink;
                      oldKR.notiCheckIn = newKR?.notiCheckIn;
                      oldKR.personIncharge = newKR?.personIncharge;
                      oldKR.modifiedOn = new Date();

                      this.detectorRef.detectChanges();
                      if (newKR?.items != null && newKR?.items?.length > 0) {
                        //update SKR
                        for (let s = 0; s < newKR?.items?.length; s++) {
                          let filterSKR = oldKR?.items.filter(
                            (x) => x.recID == newKR?.items[s]?.recID
                          );
                          let newSKR = newKR?.items[s];
                          if (filterSKR != null && filterSKR.length > 0) {
                            let oldSKR = filterSKR[0];
                            oldSKR.actual = newSKR?.actual;
                            oldSKR.target = newSKR?.target;
                            oldSKR.current = newSKR?.current;
                            oldSKR.weight = newSKR?.weight;
                            oldSKR.progress = newSKR?.progress;
                            oldSKR.targets = newSKR?.targets;
                            oldSKR.checkIns = newSKR?.checkIns;
                            oldSKR.hasAssign = newSKR?.hasAssign;
                            oldSKR.okrLink = newSKR?.okrLink;
                            oldSKR.notiCheckIn = newSKR?.notiCheckIn;
                            oldSKR.personIncharge = newSKR?.personIncharge;
                            oldSKR.modifiedOn = new Date();

                            this.detectorRef.detectChanges();
                          } else {
                            oldKR?.items.push(newSKR);
                          }
                        }
                      }
                    } else {
                      oldOB?.items.push(newKR);
                    }
                  }
                }
              } else {
                filterGR[0].listOKR.push(newOB);
              }
            }
          }
        }
        this.calculateStatistical(null);
        this.detectorRef.detectChanges();
      }
    });
  }
  calculateStatistical(evt: any) {
    if (this.dataOKR != null) {
      var tempValue = new OM_Statistical();
      let countNotStartOB = 0;
      let countStartingOB = 0;
      let countDoneOB = 0;
      for (let gr of this.dataOKR) {
        for (let ob of gr.listOKR) {
          tempValue.totalOB += 1;
          if (ob?.progress == 0) countNotStartOB += 1;
          if (ob?.progress > 0 && ob?.progress < 100) countStartingOB += 1;
          if (ob?.progress == 100) countDoneOB += 1;
          if (ob?.category == '5') tempValue.totalHighOB += 1;
          if (ob?.progress == 100) tempValue.obDone += 1;
          if (ob?.category == '5' && ob?.progress == 100)
            tempValue.highOBDone += 1;

          if (ob?.items?.length > 0) {
            for (let kr of ob?.items) {
              if (kr?.notiCheckIn) tempValue.krLateCheckIn += 1;
              if (kr?.current > kr?.actual) tempValue.krLateProgress += 1;
              if (
                kr?.current == kr?.actual &&
                kr?.current > 0 &&
                kr?.actual > 0
              )
                tempValue.krInProgress += 1;
              if (kr?.current < kr?.actual) tempValue.krOverProgress += 1;
              //if(kr?.items?.length>0){
              // for(let skr of kr?.items){
              //   if(skr?.kr?.notiCheckIn) tempValue.krLateCheckIn+=1;
              //   if(skr?.current > skr?.actual) tempValue.krLateProgress+=1;
              //   if(skr?.current == skr?.actual) tempValue.krInProgress+=1;
              //   if(skr?.current < skr?.actual) tempValue.krOverProgress+=1;
              // }
              //}
            }
          }
        }
      }
      if (tempValue?.totalOB > 0) {
        tempValue.percentOBNotStart = (
          (countNotStartOB / tempValue?.totalOB) *
          100
        ).toFixed(1);
        tempValue.percentOBStarting = (
          (countStartingOB / tempValue?.totalOB) *
          100
        ).toFixed(1);
        tempValue.percentOBDone = (
          (countDoneOB / tempValue?.totalOB) *
          100
        ).toFixed(1);
      } else {
        tempValue.percentOBNotStart = '0';
        tempValue.percentOBStarting = '0';
        tempValue.percentOBDone = '0';
      }
      this.value = tempValue;
      this.detectorRef.detectChanges();
    }
    else{
      this.value = new OM_Statistical();
    }
  }
  getOrgTreeOKR() {
    if (this.curUser?.employee != null) {
      let tempOrgID = '';
      let okrLevel = '';
      switch (this.funcID) {
        case OMCONST.FUNCID.COMP:
          tempOrgID = this.curUser?.employee.companyID;
          okrLevel = OMCONST.VLL.OKRLevel.COMP;
          break;
        case OMCONST.FUNCID.DEPT:
          tempOrgID = this.curUser?.employee.departmentID;
          okrLevel = OMCONST.VLL.OKRLevel.DEPT;
          break;
        case OMCONST.FUNCID.ORG:
          tempOrgID = this.curUser?.employee.orgUnitID;
          okrLevel = OMCONST.VLL.OKRLevel.ORG;
          break;
        case OMCONST.FUNCID.PERS:
          tempOrgID = this.curUser?.employee.employeeID;
          okrLevel = OMCONST.VLL.OKRLevel.PERS;
          break;
      }
      if (okrLevel == OMCONST.VLL.OKRLevel.PERS) return;
      this.codxOmService
        .getOrgTreeOKR(this.dataOKRPlans?.recID, tempOrgID)
        .subscribe((listOrg: any) => {
          if (listOrg) {
            this.orgUnitTree = [listOrg];
            this.loadedDataTree = true;
          } else {
            this.orgUnitTree = null;
            this.loadedDataTree = true;
          }
        });
    }
  }
  //Lấy fucID con
  funcIDChanged() {
    
    this.funcID = this.router.snapshot.params['funcID'];
    this.dataRequest.entityName = 'OM_OKRPlans';
    this.dataRequest.page = 1;
    this.dataRequest.pageSize = 1000;
    this.dataRequest.funcID = this.funcID;
    this.dataRequest.dataValue = 'false;';
    this.dataRequest.predicate = 'Stop==@0 && OKRLevel==@1';

    switch (this.funcID) {
      case OMCONST.FUNCID.COMP:
        this.krFuncID = OMCONST.KRFUNCID.COMP;
        this.skrFuncID = OMCONST.SKRFUNCID.COMP;
        this.obFuncID = OMCONST.OBFUNCID.COMP;
        this.okrLevel = OMCONST.VLL.OKRLevel.COMP;
        this.curOrgID = this.curUser?.employee?.companyID;
        this.curOrgName = this.curUser?.employee?.companyName;
        this.dataRequest.entityPermission = 'OM_OKRCompany';
        this.dataRequest.gridViewName = 'grvOKRCompany';
        this.dataRequest.formName = 'OKRCompany';
        this.dataRequest.dataValue += OMCONST.VLL.OKRLevel.COMP;
        break;
      case OMCONST.FUNCID.DEPT:
        this.skrFuncID = OMCONST.SKRFUNCID.DEPT;
        this.krFuncID = OMCONST.KRFUNCID.DEPT;
        this.obFuncID = OMCONST.OBFUNCID.DEPT;
        this.okrLevel = OMCONST.VLL.OKRLevel.DEPT;
        this.curOrgID = this.curUser?.employee?.departmentID;
        this.curOrgName = this.curUser?.employee?.departmentName;
        this.dataRequest.entityPermission = 'OM_OKRDepartment';
        this.dataRequest.gridViewName = 'grvOKRDepartment';
        this.dataRequest.formName = 'OKRDepartment';
        this.dataRequest.dataValue += OMCONST.VLL.OKRLevel.DEPT;
        break;
      case OMCONST.FUNCID.ORG:
        this.skrFuncID = OMCONST.SKRFUNCID.ORG;
        this.krFuncID = OMCONST.KRFUNCID.ORG;
        this.obFuncID = OMCONST.OBFUNCID.ORG;
        this.okrLevel = OMCONST.VLL.OKRLevel.ORG;
        this.curOrgID = this.curUser?.employee?.orgUnitID;
        this.curOrgName = this.curUser?.employee?.orgUnitName;
        this.dataRequest.entityPermission = 'OM_OKRTeam';
        this.dataRequest.gridViewName = 'grvOKRTeam';
        this.dataRequest.formName = 'OKRTeam';
        this.dataRequest.dataValue += OMCONST.VLL.OKRLevel.ORG;
        break;
      case OMCONST.FUNCID.PERS:
        this.skrFuncID = OMCONST.SKRFUNCID.PERS;
        this.krFuncID = OMCONST.KRFUNCID.PERS;
        this.obFuncID = OMCONST.OBFUNCID.PERS;
        this.okrLevel = OMCONST.VLL.OKRLevel.PERS;
        this.curOrgID = this.curUser?.employee?.employeeID;
        this.curOrgName = this.curUser?.employee?.employeeName;
        this.dataRequest.entityPermission = 'OM_OKRPersonal';
        this.dataRequest.gridViewName = 'grvOKRPersonal';
        this.dataRequest.formName = 'OKRPersonal';
        this.dataRequest.dataValue += OMCONST.VLL.OKRLevel.PERS;
        break;
    }

    this.formModelChanged();
    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  //Sự kiện thay đổi view (funcID thay đổi - load lại page với data mới)

  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.createCOObject();
    this.getOKRModel();
    this.funcIDChanged();
    this.setTitle();
    this.dataOKRPlans = null;
    this.dataOKR = null;
    this.sharedPlan = [];
    this.calculateStatistical(null);
    //this.getOKRPlans(this.periodID, this.interval, this.year);
    //this.getSharedPlans(this.periodID, this.interval, this.year);
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
      case OMCONST.MFUNCID.PermissionCOMP:
      case OMCONST.MFUNCID.PermissionDEPT:
      case OMCONST.MFUNCID.PermissionORG:
      case OMCONST.MFUNCID.PermissionPER:
        this.showPermission(evt?.text);
        break;
      case OMCONST.MFUNCID.ShowVerPlanCOMP:
      case OMCONST.MFUNCID.ShowVerPlanDEPT:
      case OMCONST.MFUNCID.ShowVerPlanORG:
      case OMCONST.MFUNCID.ShowVerPlanPER:
        this.viewListVersion(evt?.text);
        break;
      case OMCONST.MFUNCID.UpdateVerPlanCOMP:
      case OMCONST.MFUNCID.UpdateVerPlanDEPT:
      case OMCONST.MFUNCID.UpdateVerPlanORG:
      case OMCONST.MFUNCID.UpdateVerPlanPER:
        this.updateVersion(evt?.text);
        break;
    }
  }
  changeDataMF(evt: any) {
    if (evt != null) {
      if (this.dataOKR != null && this.dataOKR.length > 0) {
        evt.forEach((func) => {
          if (
            func.functionID == OMCONST.MFUNCID.PlanWeightPER ||
            func.functionID == OMCONST.MFUNCID.PlanWeightORG ||
            func.functionID == OMCONST.MFUNCID.PlanWeightDEPT ||
            func.functionID == OMCONST.MFUNCID.PlanWeightCOMP
          ) {
            func.disabled = false;
          }
        });
      } else {
        //nếu ko có OKR thì ẩn MF phân bổ trọng số
        evt.forEach((func) => {
          if (
            func.functionID == OMCONST.MFUNCID.Copy ||
            func.functionID == OMCONST.MFUNCID.PlanWeightPER ||
            func.functionID == OMCONST.MFUNCID.PlanWeightORG ||
            func.functionID == OMCONST.MFUNCID.PlanWeightDEPT ||
            func.functionID == OMCONST.MFUNCID.PlanWeightCOMP
          ) {
            func.disabled = true;
          }
        });
      }

      //Ẩn MF khi Plan chưa phát hành
      if (this.dataOKRPlans?.status == '1') {
        evt.forEach((func) => {
          if (
            func.functionID == OMCONST.MFUNCID.UnReleasePlanCOMP ||
            func.functionID == OMCONST.MFUNCID.UnReleasePlanDEPT ||
            func.functionID == OMCONST.MFUNCID.UnReleasePlanORG ||
            func.functionID == OMCONST.MFUNCID.UnReleasePlanPER
          ) {
            func.disabled = true;
          }
        });
      }

      //Ẩn MF khi Plan đã phát hành
      else if (this.dataOKRPlans?.status == '2') {
        evt.forEach((func) => {
          if (
            func.functionID == OMCONST.MFUNCID.Copy ||
            func.functionID == OMCONST.MFUNCID.ReleasePlanCOMP ||
            func.functionID == OMCONST.MFUNCID.ReleasePlanDEPT ||
            func.functionID == OMCONST.MFUNCID.ReleasePlanORG ||
            func.functionID == OMCONST.MFUNCID.ReleasePlanPER ||
            func.functionID == OMCONST.MFUNCID.SharesPlanCOMP ||
            func.functionID == OMCONST.MFUNCID.SharesPlanDEPT ||
            func.functionID == OMCONST.MFUNCID.SharesPlanORG ||
            func.functionID == OMCONST.MFUNCID.SharesPlanPER ||
            func.functionID == OMCONST.MFUNCID.PermissionCOMP ||
            func.functionID == OMCONST.MFUNCID.PermissionDEPT ||
            func.functionID == OMCONST.MFUNCID.PermissionORG ||
            func.functionID == OMCONST.MFUNCID.PermissionPER ||
            func.functionID == OMCONST.MFUNCID.PlanWeightCOMP ||
            func.functionID == OMCONST.MFUNCID.PlanWeightDEPT ||
            func.functionID == OMCONST.MFUNCID.PlanWeightORG ||
            func.functionID == OMCONST.MFUNCID.PlanWeightPER
          ) {
            func.disabled = true;
          }
        });
      }
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
    let newFuncID=this.router.snapshot.params['funcID'];
    if(newFuncID!=this.funcID){
      this.viewChanged(null);
      this.detectorRef.detectChanges();
    }
    //this.funcIDChanged();
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
      this.periodName = this.periodID;
      this.interval = 'Y';
    } else if (data.type == 'quarter') {
      this.periodID = data.text;
      this.periodName = this.periodID;
      this.interval = 'Q';
    } else if (data.type == 'month') {
      this.periodID = (date.getMonth() + 1).toString();
      this.periodName = data?.text;
      this.interval = 'M';
    }
    this.setTitle();
    // if (
    //   this.dataOKRPlans != null &&
    //   this.dataOKRPlans.year == this.year &&
    //   this.dataOKRPlans.interval == this.interval &&
    //   this.dataOKRPlans.periodID == this.periodID
    // ) {
    //   this.isAfterRender = true;
    //   return;
    // }

    this.getOKRPlans(this.periodID, this.interval, this.year);

    this.getSharedPlans(this.periodID, this.interval, this.year);
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  hiddenChartClick(evt: any) {
    this.isHiddenChart = evt;
    this.detectorRef.detectChanges();
  }
  clickTreeNode(evt: any) {
    evt.stopPropagation();
    evt.preventDefault();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  changePlanStatus(status) {
    if (status == OMCONST.VLL.PlanStatus.NotStarted) {
      
      this.reloadedMF = false;
      this.detectorRef.detectChanges();
      this.codxOmService
        .beforeUnReleasePlan(this.dataOKRPlans?.recID)
        .subscribe((res) => {
          if (res != null) {
            this.notificationsService.notifyCode(
              'Bộ mục tiêu hiện hành đã phát sinh dữ liệu liên quan. Vui lòng liên hệ với ' +
                res +
                ' để xử lí.'
            ); //OM_WAIT: Đợi mssgCode

            this.reloadedMF = true;
            this.detectorRef.detectChanges();
            return;
          } else {
            this.codxOmService
              .changePlanStatus(this.dataOKRPlans.recID, status,false)
              .subscribe((res) => {
                if (res) {
                  this.dataOKRPlans.status = status;
                  this.detectorRef.detectChanges();
                  this.reloadedMF = true;
                  this.detectorRef.detectChanges();
                  this.updateOKRPlans(this.dataOKRPlans.recID);
                  this.notificationsService.notifyCode('SYS034'); //thành công
                }
                // else{

                //   this.notificationsService.notifyCode('SYS034'); //thành công
                // }
              });
          }
        });
    } else if (status == OMCONST.VLL.PlanStatus.Ontracking) {
      let dialogRelease = this.callfc.openForm(
        PopupAddVersionComponent,
        '',
        600,
        330,
        null,
        [this.dataOKRPlans, "Phát hành bộ mục tiêu", true]
      );
      dialogRelease.closed.subscribe(ver=>{
        if(ver?.event){          
          this.reloadedMF = false;
          this.detectorRef.detectChanges();
          this.codxOmService
          .changePlanStatus(this.dataOKRPlans.recID, status, ver?.event?.autoUpdate)
          .subscribe((res) => {
            if (res) {
              this.dataOKRPlans.status = status;
              this.detectorRef.detectChanges();
              this.reloadedMF = true;
              this.detectorRef.detectChanges();
              this.updateOKRPlans(this.dataOKRPlans.recID);
              this.notificationsService.notifyCode('SYS034'); //thành công
              if ((status = OMCONST.VLL.PlanStatus.Ontracking)) {
                this.codxOmService
                  .sendMailAfterRelease(this.dataOKRPlans?.recID)
                  .subscribe((res) => {
                    if (res) {
                      let x = res;
                    }
                  });
              }
            }
          });
        }
      })
    }
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
        this.notifyPlanNull = this.notifyPlanNull.replace(
          '{1}',
          this.periodName
        );
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
        this.useSKR,
      ],
      '',
      dialogModel
    );
    dialogAddPlan.closed.subscribe((item) => {
      if (item.event) {
        this.getOKRPlans(this.periodID, this.interval, this.year);
      }
    });
  }
  editPlanWeight(popupTitle: any) {
    //Ko có okr nên thông báo ko thể phân bổ trọng số
    // if(this.dataOKR!=null && this.dataOKR.length>0){
    //   this.notificationsService.notify("Bộ mục tiêu chưa có mục tiêu để phân bổ trọng số",'3');
    //   return;
    // }
    let subTitle = this.curOrgName;
    let dModel = new DialogModel();
    dModel.IsFull = true;
    let dialogEditWeight = this.callfc.openForm(
      PopupOKRWeightComponent,
      '',
      null,
      null,
      null,
      [
        this.dataOKRPlans,
        OMCONST.VLL.OKRType.Obj,
        popupTitle,
        subTitle,
        this.okrVll,
        this.okrFM,
      ],
      '',
      dModel
    );
    dialogEditWeight.closed.subscribe((item) => {
      this.updateOKRPlans(this.dataOKRPlans?.recID);
    });
  }
  //Xem quyền
  showPermission(popupTitle: any) {
    let dialogPermission = this.callfc.openForm(
      PopupAddRoleComponent,
      popupTitle,
      950,
      650,
      null,
      [this.dataOKRPlans, popupTitle]
    );
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
  viewListVersion(title: any) {
    let option = new SidebarModel();
    option.FormModel = this.formModelPlan;
    let dialogViewVersion = this.callfc.openSide(
      PopupViewVersionComponent,
      [this.dataOKRPlans, this.okrFM, this.okrGrv, title, this.funcID],
      option
    );
    dialogViewVersion.closed.subscribe((res) => {});
  }
  updateVersion(title: any) {
    let dialogPermission = this.callfc.openForm(
      PopupAddVersionComponent,
      '',
      600,
      330,
      null,
      [this.dataOKRPlans, title]
    );
  }
}
