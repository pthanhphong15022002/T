import { PopupEBasicSalariesComponent } from './../../employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { PopupETimeCardComponent } from './../../employee-profile/popup-etime-card/popup-etime-card.component';
import { PopupECalculateSalaryComponent } from './../../employee-profile/popup-ecalculate-salary/popup-ecalculate-salary.component';
import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { PopupEexperiencesComponent } from './../../employee-profile/popup-eexperiences/popup-eexperiences.component';
import { PopupEJobSalariesComponent } from './../../employee-profile/popup-ejob-salaries/popup-ejob-salaries.component';
import { PopupEWorkPermitsComponent } from './../../employee-profile/popup-ework-permits/popup-ework-permits.component';
import { PopupEVisasComponent } from './../../employee-profile/popup-evisas/popup-evisas.component';
import { PopupETraincourseComponent } from './../../employee-profile/popup-etraincourse/popup-etraincourse.component';
import { PopupESkillsComponent } from './../../employee-profile/popup-eskills/popup-eskills.component';
import { PopupESelfInfoComponent } from './../../employee-profile/popup-eself-info/popup-eself-info.component';
import { PopupEFamiliesComponent } from './../../employee-profile/popup-efamilies/popup-efamilies.component';
import { PopupEDisciplinesComponent } from './../../employee-profile/popup-edisciplines/popup-edisciplines.component';
import { PopupEDegreesComponent } from './../../employee-profile/popup-edegrees/popup-edegrees.component';
import { PopupECertificatesComponent } from './../../employee-profile/popup-ecertificates/popup-ecertificates.component';
import { PopupEAwardsComponent } from './../../employee-profile/popup-eawards/popup-eawards.component';
import { PopupEAssurTaxBankComponent } from './../../employee-profile/popup-eassur-tax-bank/popup-eassur-tax-bank.component';
import { PopupEAssetsComponent } from './../../employee-profile/popup-eassets/popup-eassets.component';
import { PopupEmployeePartyInfoComponent } from './../../employee-profile/popup-employee-party-info/popup-employee-party-info.component';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
// import { EmployeeAssurTaxBankaccInfoComponent } from './../../employee-profile/employee-assur-tax-bankacc-info/employee-assur-tax-bankacc-info.component';
import { CheckBox } from '@syncfusion/ej2-angular-buttons';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import {
  Component,
  Injector,
  OnInit,
  Optional,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
// import { EmployeeSelfInfoComponent } from '../../employee-profile/employee-self-info/employee-self-info.component';
import { ActivatedRoute } from '@angular/router';
// import { EmployeeFamilyRelationshipComponent } from '../../employee-profile/employee-family-relationship/employee-family-relationship.component';
import { E, I } from '@angular/cdk/keycodes';
import { PopupEPassportsComponent } from '../../employee-profile/popup-epassports/popup-epassports.component';
import { NoopAnimationPlayer } from '@angular/animations';
import { PopupEhealthsComponent } from '../../employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEVaccineComponent } from '../../employee-profile/popup-evaccine/popup-evaccine.component';
import { PopupEDiseasesComponent } from '../../employee-profile/popup-ediseases/popup-ediseases.component';

@Component({
  selector: 'lib-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent extends UIComponent {
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('button') button: TemplateRef<any>;
  minType = 'MinRange';
  user;
  constructor(
    private inject: Injector,
    private routeActive: ActivatedRoute,
    private hrService: CodxHrService,
    private auth: AuthStore,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private codxMwpService: CodxMwpService,
    private notify: NotificationsService,
    private cacheSv: CacheService,
    private notifySvr: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.auth.get();
    console.log('dtttt', dialog);
  }

  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;

  views: Array<ViewModel> | any = [];

  infoPersonal: any = {};

  formModelVisa: FormModel;
  formModelPassport: FormModel;
  formModelWPermit: FormModel;

  statusVll = 'L0225';
  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  idField = 'recID';
  functionID: string;
  data: any = {};
  //family
  lstFamily: any;
  //degree
  lstEDegrees: any = []
  //passport
  lstPassport: any = [];
  crrPassport: any = {};
  //visa
  lstVisa: any = [];
  crrVisa: any = {};
  //work permit
  lstWorkPermit: any = [];
  //jobInfo
  jobInfo: any;
  crrJobSalaries: any = {};
  lstJobSalaries: any = [];
  //EExperience
  lstExperience: any = [];
  lstVaccine: any = [];
  formModel;
  itemDetail;
  EExperienceColumnsGrid: any;
  className = 'EExperiencesBusiness';

  hrEContract;
  crrTab: number = 6;

  //EAsset salary
  lstAsset: any = [];

  //Basic salary
  crrEBSalary: any;
  lstEBSalary: any = [];
  listCrrBenefit: any;

  healthColumnsGrid;
  vaccineColumnsGrid;
  diseaseColumnsGrid;
  accidentColumnsGrid;
  positionColumnsGrid;
  holidayColumnsGrid;
  workDiaryColumnGrid;
  rewardColumnsGrid;
  disciplineColumnGrid;
  expColumnGrid;

  @ViewChild('healthPeriodID', { static: true })
  healthPeriodID: TemplateRef<any>;
  @ViewChild('healthPeriodDate', { static: true })
  healthPeriodDate: TemplateRef<any>;
  @ViewChild('healthPeriodPlace', { static: true })
  healthPeriodPlace: TemplateRef<any>;
  @ViewChild('healthType', { static: true }) healthType: TemplateRef<any>;
  @ViewChild('healthPeriodResult', { static: true })
  healthPeriodResult: TemplateRef<any>;
  @ViewChild('EExperience', { static: true })
  EExperienceTmp: TemplateRef<any>;
  @ViewChild('tempFromDate', { static: true }) tempFromDate;
  @ViewChild('tempToDate', { static: true })
  tempToDate: TemplateRef<any>;
  objCollapes = {
    '1': false,
    '1.1': false,
    '1.2': false,
    '2': false,
    '2.1': false,
    '2.2': false,
    '3': false,
    '3.1': false,
    '3.2': false,
    '3.3': false,
    '3.4': false,
    '4': false,
    '4.1': false,
    '4.2': false,
    '4.3': false,
    '4.4': false,
    '4.5': false,
    '5': false,
    '5.1': false,
    '5.2': false,
    '5.3': false,
    '5.4': false,
    '6': false,
    '6.1': false,
    '6.2': false,
    '7': false,
    '7.1': false,
    '7.2': false,
    '7.3': false,
    '7.4': false,
  };

  vllTabs = [
    { icon: 'icon-apartment', text: 'Thông tin cá nhân' },
    { icon: 'icon-apartment', text: 'Thông tin công việc' },
    { icon: 'icon-apartment', text: 'Phúc Lợi' },
    { icon: 'icon-apartment', text: 'Quá trình nhân sự' },
    { icon: 'icon-apartment', text: 'Kiến thức' },
    { icon: 'icon-apartment', text: 'Khen thưởng' },
    { icon: 'icon-apartment', text: 'Kỷ luật' },
    { icon: 'icon-apartment', text: 'Sức khỏe' },
    { icon: 'icon-apartment', text: 'Thôi việc' },
  ];

  onInit(): void {
    var a = history.state;
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', a);

    this.EExperienceColumnsGrid = [
      {
        field: 'fromDate',
        headerText: 'Từ tháng năm',
        template: this.tempFromDate,
        width: '200',
      },
      {
        field: 'toDate',
        headerText: 'Đến tháng năm',
        template: this.tempToDate,
        width: '200',
      },
      {
        field: 'companyName',
        headerText: 'Đơn vị công tác',
        width: '250',
      },
      {
        field: 'position',
        headerText: 'Chức danh',
        width: '250',
      },
      // {
      //   headerText: '',
      //   width: '250',
      // },
    ];

    this.formModelVisa = new FormModel();

    this.routeActive.queryParams.subscribe((params) => {
      if (params.employeeID || this.user.userID) {
        // Thong tin ca nhan
        this.hrService.getEmployeeInfo(params.employeeID).subscribe((emp) => {
          if (emp) {
            this.data = emp;
            this.infoPersonal = emp;
            console.log('data', this.data);
          }
        });

        //Quan he gia dinh
        // this.hrService
        //   .getFamilyByEmployeeID(params.employeeID)
        //   .subscribe((res) => {
        //     console.log('family', res);
        //     this.lstFamily = res;
        //   });

        let opFamily = new DataRequest();
        opFamily.gridViewName = 'grvEFamilies';
        opFamily.entityName = 'HR_EFamilies';
        opFamily.predicate = 'EmployeeID=@0';
        opFamily.dataValue = params.employeeID;
        opFamily.page = 1;
        this.hrService.getEFamilyWithDataRequest(opFamily).subscribe((res) => {
          if (res) this.lstFamily = res[0];
        });

        //Asset
        let rqAsset = new DataRequest();
        rqAsset.gridViewName = 'grvEAssets';
        rqAsset.entityName = 'HR_EAssets';
        rqAsset.predicate = 'EmployeeID=@0';
        rqAsset.dataValue = params.employeeID;
        rqAsset.page = 1;
        this.hrService.getListAssetByDataRequest(rqAsset).subscribe((res) => {
          if (res) this.lstAsset = res[0];
        });

        //Passport
        // this.hrService
        //   .GetListPassportByEmpID(params.employeeID)
        //   .subscribe((res) => {
        //     console.log('passport', res);

        //     this.lstPassport = res;
        //     if (this.lstPassport.length > 0) {
        //       this.crrPassport = this.lstPassport[0];
        //     }
        //   });

        let opPassport = new DataRequest();
        opPassport.gridViewName = 'grvEPassports';
        opPassport.entityName = 'HR_EPassports';
        opPassport.predicate = 'EmployeeID=@0';
        opPassport.dataValue = params.employeeID;
        // opPassport.srtColumns = 'Ten field';
        (opPassport.page = 1),
          this.hrService
            .getListVisaByEmployeeID(opPassport)
            .subscribe((res) => {
              if (res) this.lstPassport = res[0];
              if (this.lstPassport.length > 0) {
                this.crrPassport = this.lstPassport[0];
              }
            });

        //Vissa
        // this.hrService
        //   .getListVisaByEmployeeID(params.employeeID)
        //   .subscribe((res) => {
        //     console.log('visa', res);

        //     this.lstVisa = res;
        //     if (this.lstVisa.length > 0) {
        //       this.crrVisa = this.lstVisa[0];
        //     }
        //   });

        let op2 = new DataRequest();
        op2.gridViewName = 'grvEVisas';
        op2.entityName = 'HR_EVisas';
        op2.predicate = 'EmployeeID=@0';
        op2.dataValue = params.employeeID;
        (op2.page = 1),
          this.hrService.getListVisaByEmployeeID(op2).subscribe((res) => {
            if (res) this.lstVisa = res[0];
            if (this.lstVisa.length > 0) {
              this.crrVisa = this.lstVisa[0];
            }
          });
          //Edegrees
          let rqDegrees = new DataRequest();
          rqDegrees.gridViewName = 'grvEDegrees';
          rqDegrees.entityName = 'HR_EDegrees';
          rqDegrees.predicate = 'EmployeeID=@0';
          rqDegrees.dataValue = params.employeeID;
          (rqDegrees.page = 1),
          this.hrService.getEmployeeDregreesInfo(rqDegrees).subscribe((res) => {
            console.log('ret trả về', res);
            
            if (res) this.lstEDegrees = res[0];
            console.log('lít e đì gri', this.lstEDegrees);
            
          });

        //work permit
        let op4 = new DataRequest();
        op4.gridViewName = 'grvEWorkPermits';
        op4.entityName = 'HR_EWorkPermits';
        op4.predicate = 'EmployeeID=@0';
        op4.dataValue = params.employeeID;
        (op4.page = 1),
          this.hrService.getListWorkPermitByEmployeeID(op4).subscribe((res) => {
            if (res) {
              this.lstWorkPermit = res[0];
              console.log('lstWorkPermit', this.lstWorkPermit);
            }
          });

        // this.hrService
        //   .getListWorkPermitByEmployeeID(params.employeeID)
        //   .subscribe((res) => {
        //     console.log('w permit', res);
        //     this.lstWorkPermit = res;
        //   });

        //Job info
        //this.hrService.getJobInfo()

        //Job salaries
        this.hrService
          .GetCurrentJobSalaryByEmployeeID(params.employeeID)
          .subscribe((res) => {
            this.crrJobSalaries = res;
          });

        let op3 = new DataRequest();
        op3.entityName = 'HR_EJobSalaries';
        op3.dataValue = params.employeeID;
        op3.predicate = 'EmployeeID=@0';
        (op3.page = 1),
          this.hrService
            .getListJobSalariesByEmployeeID(op3)
            .subscribe((res) => {
              if (res) {
                this.lstJobSalaries = res[0];
                console.log('e salaries', this.lstJobSalaries);
              }
            });

        //EExperience
        let op = new DataRequest();
        op.entityName = 'HR_EExperiences';
        op.dataValue = params.employeeID;
        op.predicate = 'EmployeeID=@0';
        this.hrService.GetListByEmployeeIDAsync(op).subscribe((res) => {
          console.log('e experience', res);
          this.lstExperience = res;
        });

        // basic Salary
        this.hrService
          .GetCurrentEBasicSalariesByEmployeeID(params.employeeID)
          .subscribe((res) => {
            if (res) {
              this.crrEBSalary = res;
            }
          });

        let rqEBasic = new DataRequest();
        rqEBasic.entityName = 'HR_EBasicSalaries';
        rqEBasic.dataValue = params.employeeID;
        rqEBasic.predicate = 'EmployeeID=@0';
        (rqEBasic.page = 1),
          this.hrService
            .getListBasicSalariesByDataRequest(rqEBasic)
            .subscribe((res) => {
              if (res) {
                this.lstEBSalary = res[0];
                console.log('e salaries', this.lstEBSalary);
              }
            });

        // Benefit
        this.hrService.GetCurrentBenefit(params.employeeID).subscribe((res) => {
          if (res?.length) {
            this.listCrrBenefit = res;
          }
        });

        //Vaccine
        let rqVaccine = new DataRequest();
        rqVaccine.entityName = 'HR_EVaccines';
        rqVaccine.dataValues = params.employeeID;
        rqVaccine.predicates = 'EmployeeID=@0';
        rqVaccine.page = 1;
        rqVaccine.pageSize = 20;
        this.hrService.loadDataEVaccine(rqVaccine).subscribe((res) => {
          console.log('e Vaccine', res);
          this.lstVaccine = res;
          //this.lstExperience = res;
        });
      }
    });
    this.router.params.subscribe((param: any) => {
      if (param) {
        this.functionID = param['funcID'];
        this.getDataAsync(this.functionID);
        this.codxMwpService.empInfo.subscribe((res: string) => {
          if (res) {
            console.log(res);
          }
        });
      }
    });
  }

  clickMF(event: any, data: any, funcID = null) {
    console.log('click vo MF');
    console.log('data ', data);
    switch (event.functionID) {
      case 'SYS03': //edit
        if (funcID == 'passport') {
          this.handleEmployeePassportInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'workpermit') {
          this.handleEmployeeWorkingPermitInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'visa') {
          this.handleEmployeeVisaInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'family') {
          this.handleEFamilyInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'jobSalary') {
          this.HandleEmployeeJobSalariesInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eexperiences') {
          console.log('event eex', event);
        } else if (funcID == 'evaccines') {
          this.addEditEVaccines('edit', data);
        } else if (funcID == 'basicSalary') {
          this.HandleEmployeeBasicSalariesInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'Assets') {
          this.HandlemployeeAssetInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eDegrees'){
          this.HandleEmployeeDegreeInfo('edit', data);
          this.df.detectChanges();
        }
        break;

      case 'SYS02': //delete
        this.notifySvr.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            if (funcID == 'passport') {
              this.hrService
                .DeleteEmployeePassportInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstPassport.indexOf(data);
                    if (i != -1) {
                      this.lstPassport.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'workpermit') {
              this.hrService
                .DeleteEmployeeWorkPermitInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstWorkPermit.indexOf(data);
                    if (i != -1) {
                      this.lstWorkPermit.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'visa') {
              this.hrService
                .DeleteEmployeeVisaInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstVisa.indexOf(data);
                    if (i != -1) {
                      this.lstVisa.splice(i, 1);
                      console.log('delete visa', this.lstVisa);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'family') {
              this.hrService
                .DeleteEmployeeFamilyInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstFamily.indexOf(data);
                    if (i != -1) {
                      this.lstFamily.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'Assets') {
              this.hrService
                .DeleteEmployeeAssetInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstAsset.indexOf(data);
                    if (i != -1) {
                      this.lstAsset.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'jobSalary') {
              this.hrService
                .DeleteEmployeeJobsalaryInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.hrService
                      .GetCurrentJobSalaryByEmployeeID(data.employeeID)
                      .subscribe((p) => {
                        console.log('current employee EJob', p);
                        this.crrJobSalaries = p;
                      });
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'evaccines') {
              this.hrService.deleteEVaccine(data).subscribe((res) => {
                if (res) {
                }
              });
            } else if (funcID == 'basicSalary') {
              this.hrService
                .DeleteEmployeeBasicsalaryInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.hrService
                      .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
                      .subscribe((p) => {
                        this.crrEBSalary = p;
                      });
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'basicSalary') {
              this.hrService
                .DeleteEmployeeBasicsalaryInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.hrService
                      .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
                      .subscribe((p) => {
                        this.crrEBSalary = p;
                      });
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            }
            else if(funcID == 'eDegrees'){
              this.hrService
              .DeleteEmployeeDegreeInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstEDegrees.indexOf(data);
                    if (i != -1) {
                      this.lstEDegrees.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            }
          }
        });
        break;

      case 'SYS04': //copy
        if (funcID == 'passport') {
          this.handleEmployeePassportInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'workpermit') {
          this.handleEmployeeWorkingPermitInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'visa') {
          this.handleEmployeeVisaInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'family') {
          this.handleEFamilyInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'jobSalary') {
          this.HandleEmployeeJobSalariesInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'basicSalary') {
          this.HandleEmployeeBasicSalariesInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'Assets') {
          this.HandlemployeeAssetInfo('copy', data);
          this.df.detectChanges();
        } else if(funcID == 'eDegrees'){
          this.HandleEmployeeDegreeInfo('copy', data);
          this.df.detectChanges();
        }
        break;
    }
  }

  clickMFVaccine(event: any, data: any, vaccineGroup: any) {
    switch (event.functionID) {
      case 'SYS03': //edit
        this.addEditEVaccines('edit', data);
        break;
      case 'SYS02': //delete
        this.notifySvr.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            this.deleteEVaccine(data, vaccineGroup);
          }
        });
        break;
      case 'SYS04': //copy
        break;
    }
  }

  getDataAsync(funcID: string) {
    this.getDataFromFunction(funcID);
  }
  getDataFromFunction(functionID: string) {
    if (functionID) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.SYS',
          'MoreFunctionsBusiness',
          'GetMoreFunctionByHRAsync',
          [this.functionID]
        )
        .subscribe((res: any[]) => {
          if (res && res.length > 0) {
            // this.moreFunc = res;
            // this.defautFunc = res[0];
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  ngAfterViewInit(): void {
    // this.view.dataService.methodDelete = 'DeleteSignFileAsync';
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelRightRef: this.panelContent,
        },
      },
    ];
    this.formModel = this.view.formModel;
    // this.cacheSv
    //   .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
    //   .subscribe((gv) => {
    //     this.rewardColumnsGrid = [
    //       {
    //         field: '',
    //         headerText: '',
    //         width: 30,
    //         template: this.itemAction,
    //         textAlign: 'center',
    //       },
    //       {
    //         field: 'categoryID',
    //         headerText: gv
    //           ? gv['CategoryID'].headerText || 'categoryID'
    //           : 'categoryID',
    //         template: '',
    //         width: 100,
    //       },
    //       {
    //         field: 'categoryName',
    //         headerText: gv
    //           ? gv['CategoryName'].headerText || 'CategoryName'
    //           : 'CategoryName',
    //         template: '',
    //         width: 180,
    //       },
    //       // {
    //       //   field: 'parentID',
    //       //   headerText: gv['ParentID'].headerText,
    //       //   template: this.parentID,
    //       //   width: 120,
    //       // },
    //       {
    //         field: 'icon',
    //         headerText: gv ? gv['Icon'].headerText || 'Icon' : 'Icon',
    //         template: '',
    //         width: 80,
    //       },
    //       {
    //         field: 'memo',
    //         headerText: gv ? gv['Memo'].headerText || 'Memo' : 'Memo',
    //         template: '',
    //         width: 180,
    //       },
    //       {
    //         field: 'eSign',
    //         headerText: gv ? gv['ESign'].headerText || 'ESign' : 'ESign',
    //         template: '',
    //         width: 80,
    //       },
    //       {
    //         field: 'processID',
    //         headerText: 'Quy trình duyệt',
    //         template: '',
    //         width: 220,
    //       },
    //     ];
    //   });

    //Khen thưởng
    this.rewardColumnsGrid = [
      {
        field: '',
        headerText: '',
        width: 30,
        template: this.itemAction,
        textAlign: 'center',
      },
      {
        field: 'inYear',
        headerText: 'InYear',
        template: '',
        width: 100,
      },
      {
        field: 'awardDate',
        headerText: 'AwardDate',
        template: '',
        width: 180,
      },
      {
        field: 'awardID',
        headerText: 'AwardID',
        template: '',
        width: 80,
      },
      {
        field: 'signedDate',
        headerText: 'SignedDate',
        template: '',
        width: 180,
      },
      {
        field: 'decisionNo',
        headerText: 'DecisionNo',
        template: '',
        width: 80,
      },
    ];

    this.disciplineColumnGrid = [
      {
        field: '',
        headerText: '',
        width: 30,
        template: this.itemAction,
        textAlign: 'center',
      },
      {
        field: 'disciplineDate',
        headerText: 'DisciplineDate',
        template: '',
        width: 100,
      },
      {
        field: 'disciplineDate',
        headerText: 'DisciplineDate',
        template: '',
        width: 180,
      },
      {
        field: 'disciplineFormCategory',
        headerText: 'DisciplineFormCategory',
        template: '',
        width: 80,
      },
      {
        field: 'reason',
        headerText: 'Reason',
        template: '',
        width: 180,
      },
    ];
    console.log('afterview init', this.formModel);

    //processingInfo
    this.positionColumnsGrid = [
      {
        field: 'healthPeriodName',
        headerText: 'Loại quyết định',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Ngày hiệu lực',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Ngày hết hạn',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Chức danh',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Phòng ban',
        width: 250,
        template: this.healthPeriodID,
      },
    ];
    this.holidayColumnsGrid = [
      {
        field: 'healthPeriodName',
        headerText: 'Ngày đăng ký',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Nghỉ từ ngày ',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Đến ngày',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Số ngày nghỉ',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Loại nghỉ',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Lý do',
        width: 250,
        template: this.healthPeriodID,
      },
    ];

    //healthInfo
    this.healthColumnsGrid = [
      {
        field: 'healthPeriodName',
        headerText: 'Kỳ khám',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodDate',
        headerText: 'Ngày khám',
        width: 250,
        template: this.healthPeriodDate,
      },
      {
        field: 'healthPeriodPlace',
        headerText: 'Đơn vị khám',
        width: 200,
        template: this.healthPeriodPlace,
      },
      {
        field: 'healthType',
        headerText: 'Phân loại sức khỏe',
        width: 200,
        template: this.healthType,
      },
      {
        field: 'healthPeriodResult',
        headerText: 'Kết quả chẩn đoán',
        width: 50,
        template: this.healthPeriodResult,
      },
    ];
    this.accidentColumnsGrid = [
      {
        field: 'healthPeriodName',
        headerText: 'Ngày xảy ra',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Loại tai nạn lao động',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Nơi xảy ra',
        width: 250,
        template: this.healthPeriodID,
      },
      {
        field: 'healthPeriodName',
        headerText: 'Tình trạng/Mức độ tai nạn',
        width: 250,
        template: this.healthPeriodID,
      },
    ];
  }

  changeItemDetail(item) {}

  clickTab(tabNumber) {
    this.crrTab = tabNumber;
  }

  editEmployeePartyInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEmployeePartyInfoComponent,
      {
        isAdd: false,
        headerText: 'Thông tin Đảng - Đoàn',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  editAssuranceTaxBankAccountInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAssurTaxBankaccInfoComponent,
      PopupEAssurTaxBankComponent,
      {
        isAdd: true,
        headerText: 'Bảo hiểm - MST - Tài khoản',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  editEmployeeSelfInfo() {
    this.view.dataService.dataSelected = this.data;
    // this.view.dataService
    // .edit(this.data)
    // .subscribe((res) => {
    //   console.log('ress', res);
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeSelfInfoComponent,
      PopupESelfInfoComponent,
      {
        isAdd: true,
        headerText: 'Thông tin bản thân',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
    // })
  }

  editEmployeeTimeCardInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogEdit = this.callfunc.openSide(
      PopupETimeCardComponent,
      {
        isAdd: false,
        headerText: 'Thông tin chấm công',
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  editEmployeeCaculateSalaryInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogEdit = this.callfc.openSide(
      PopupECalculateSalaryComponent,
      {
        isAdd: false,
        headerText: 'Thông tin tính lương',
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  handlEmployeeExperiences(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      PopupEexperiencesComponent,
      {
        isAdd: true,
        employeeId: this.data.employeeID,
        actionType: actionType,
        headerText: 'Kinh nghiệm trước đây',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (actionType == 'add') {
        this.lstExperience = res.event;
        console.log('lst ex', this.lstExperience);
        this.df.detectChanges();
      }
      if (!res?.event) this.view.dataService.clear();
    });
  }

  HandleEmployeeJobSalariesInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEJobSalariesComponent,
      {
        actionType: actionType,
        salarySelected: data,
        headerText: 'Lương chức danh',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        // this.hrService
        //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
        //   .subscribe((p) => {
        //     this.crrJobSalaries = p;
        //   });
        console.log('current val', res.event);
        this.crrJobSalaries = res.event;
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandleEmployeeBasicSalariesInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEBasicSalariesComponent,
      {
        actionType: actionType,
        salarySelected: data,
        headerText: 'Lương cơ bản',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        // this.hrService
        //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
        //   .subscribe((p) => {
        //     this.crrJobSalaries = p;
        //   });
        console.log('current val', res.event);
        this.crrEBSalary = res.event;
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  handleEFamilyInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeFamilyRelationshipDetailComponent,
      PopupEFamiliesComponent,
      {
        actionType: actionType,
        employeeId: this.data.employeeID,
        headerText: 'Quan hệ gia đình',
        lstFamilyMembers: this.lstFamily,
        indexSelected: this.lstFamily.indexOf(data),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      // if (actionType == 'add' || actionType == 'copy') {
      //   this.lstFamily.push(res?.event);
      // } else {
      //   let index = this.lstFamily.indexOf(data);
      //   this.lstFamily[index] = res?.event;
      // }
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  handleEmployeePassportInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    console.log('datas', option.DataService);

    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      PopupEPassportsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstPassport.indexOf(data),
        lstPassports: this.lstPassport,
        headerText: 'Hộ chiếu',
        employeeId: this.data.employeeID,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      // if (actionType != 'edit') {
      //   this.lstPassport.push(res.event);
      // } else {
      //   let index = this.lstPassport.indexOf(data);
      //   this.lstPassport[index] = res.event;
      // }

      // console.log('data tra ve', res.event);
      // console.log('lst passport', this.lstPassport);

      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  handleEmployeeWorkingPermitInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeWorkingLisenceDetailComponent,
      PopupEWorkPermitsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstWorkPermit.indexOf(data),
        lstWorkPermit: this.lstWorkPermit,
        // selectedWorkPermit: data,
        headerText: 'Giấy phép lao động',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      // console.log('work permit', res?.event);
      // if (actionType != 'edit') {
      //   this.lstWorkPermit.push(res?.event);
      // } else {
      //   let index = this.lstWorkPermit.indexOf(data);
      //   this.lstWorkPermit[index] = res.event;
      // }
      // console.log(this.lstWorkPermit);
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  handleEmployeeVisaInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeVisaFormComponent,
      PopupEVisasComponent,
      {
        actionType: actionType,
        indexSelected: this.lstVisa.indexOf(data),
        lstVisas: this.lstVisa,
        headerText: 'Thị thực',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event != null) {
        // this.lstVisa = res?.event;
        console.log('sau khi dong form', this.lstVisa);
        if (!res?.event) this.view.dataService.clear();
        this.df.detectChanges();
      }
    });
  }

  // handleEmployeeVisaInfo(actionType: string, data: any) {
  //   this.view.dataService.dataSelected = this.data;
  //   let option = new SidebarModel();
  //   option.DataService = this.view.dataService;
  //   option.FormModel = this.view.formModel;
  //   option.Width = '800px';
  //   let dialogAdd = this.callfunc.openSide(
  //     // EmployeeVisaFormComponent,
  //     PopupEVisasComponent,
  //     {
  //       actionType: actionType,
  //       visaSelected: data,
  //       headerText: 'Thị thực',
  //       employeeId: this.data.employeeID,
  //     },
  //     option
  //   );
  //   dialogAdd.closed.subscribe((res) => {
  //     if(res.event != null){
  //       if (actionType != 'edit') {
  //         console.log('tra ve sau add', res);
  //         this.lstVisa.push(res?.event);
  //         console.log(this.lstVisa);

  //       } else {
  //         let index = this.lstVisa.indexOf(data);
  //         if(index > -1)
  //         this.lstVisa[index] = res.event;
  //       }
  //       console.log(this.lstVisa);
  //       if (!res?.event) this.view.dataService.clear();
  //       this.df.detectChanges()
  //     }
  //   });
  // }

  addEmployeeDisciplinesInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeDisciplinesDetailComponent,
      PopupEDisciplinesComponent,
      {
        isAdd: true,
        employeeId: this.data.employeeID,
        headerText: 'Kỷ luật',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeAwardsInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAwardsDetailComponent,
      PopupEAwardsComponent,
      {
        isAdd: true,
        employeeId: this.data.employeeID,
        headerText: 'Khen thưởng',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandlemployeeAssetInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;

    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAllocatedPropertyDetailComponent,
      PopupEAssetsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstAsset.indexOf(data),
        lstAssets: this.lstAsset,
        employeeId: this.data.employeeID,
        headerText: 'Tài sản cấp phát',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  addEmployeeCertificateInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeCertificateDetailComponent,
      PopupECertificatesComponent,
      {
        isAdd: true,
        headerText: 'Chứng chỉ',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  HandleEmployeeDegreeInfo(actionType: string, data: any ) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeDegreeDetailComponent,
      PopupEDegreesComponent,
      {
        // isAdd: true,
        actionType: actionType,
        indexSelected: this.lstEDegrees.indexOf(data),
        lstEDegrees : this.lstEDegrees,
        headerText: 'Bằng cấp',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeSkillsInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeSkillDetailComponent,
      PopupESkillsComponent,
      {
        isAdd: true,
        headerText: 'Kỹ năng',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeTrainCourseInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeTraincoursesComponent,
      PopupETraincourseComponent,
      {
        isAdd: true,
        headerText: 'Đào tạo',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  collapse(id: any, isCollapse: string = '-1') {
    let numberID = Number(id);
    if (numberID) {
      if (numberID % 1 == 0) {
        for (let i = numberID + 0.1; i < numberID + 1; i = i + 0.1) {
          id = i.toFixed(1);
          if (this.objCollapes[id] != undefined) {
            if (isCollapse != '-1') {
              let value = isCollapse == '0' ? false : true;
              this.objCollapes[id] = value;
            } else {
              this.objCollapes[id] = !this.objCollapes[id];
            }
          }
        }
      } else {
        if (isCollapse != '-1') {
          let value = isCollapse == '0' ? false : true;
          this.objCollapes[id] = value;
        } else {
          this.objCollapes[id] = !this.objCollapes[id];
        }
      }
    }
  }

  HandleBebefitInfo(actionType, s) {
    this.api
      .execSv('HR', 'ERM.Business.HR', 'EBenefitsBusiness', 'AddAsync', null)
      .subscribe((res) => {
        console.log(res);
      });
  }

  //#region HR_EHealths

  addEHealths(actionType: string, data: any) {
    // this.hrService.addEHealth(null).subscribe();
    // return;
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEhealthsComponent,
      {
        actionType: actionType,
        salarySelected: data,
        headerText: 'Khám sức khỏe',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        // this.hrService
        //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
        //   .subscribe((p) => {
        //     this.crrJobSalaries = p;
        //   });
        console.log('current val', res.event);
        this.crrJobSalaries = res.event;
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
    });
  }
  //#endregion

  //#region HR_EVaccines

  addEditEVaccines(actionType: string, data: any) {
    // this.hrService.addEVaccine(null).subscribe();
    // return;
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEVaccineComponent,
      {
        actionType: actionType,
        salarySelected: data,
        headerText: 'Tiêm Vaccine',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        // this.hrService
        //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
        //   .subscribe((p) => {
        //     this.crrJobSalaries = p;
        //   });
        console.log('current val', res.event);
        this.crrJobSalaries = res.event;
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  deleteEVaccine(data: any, vaccineGroup: any) {
    this.hrService.deleteEVaccine(data).subscribe((res) => {
      if (res) {
        let indexGrp = this.lstVaccine.findIndex(
          (p) => p.vaccineTypeID == vaccineGroup.vaccineTypeID
        );
        if (indexGrp > -1) {
          let listVaccine = this.lstVaccine[indexGrp].vaccines;
          if (listVaccine) {
            let index = listVaccine.findIndex((p) => p.recID == data.recID);
            if (index > -1) {
              listVaccine.splice(index, 1);
              if (listVaccine.length == 0) {
                this.lstVaccine.splice(indexGrp, 1);
              }
            }
          }
        }
      }
      this.df.detectChanges();
    });
  }
  //#endregion

  //#region HR_EDesisease
  addEDisease() {
    let data;
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDiseasesComponent,
      {
        actionType: 'add',
        salarySelected: data,
        headerText: 'Tiêm Vaccine',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        // this.hrService
        //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
        //   .subscribe((p) => {
        //     this.crrJobSalaries = p;
        //   });
        console.log('current val', res.event);
        this.crrJobSalaries = res.event;
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
    });
  }
  //#endregion
}
