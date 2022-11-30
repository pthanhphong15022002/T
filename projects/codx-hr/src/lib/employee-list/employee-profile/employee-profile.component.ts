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
// import { EmployeeFamilyRelationshipDetailComponent } from './../../employee-profile/employee-family-relationship-detail/employee-family-relationship-detail.component';
// import { EmployeeAllocatedPropertyDetailComponent } from './../../employee-profile/employee-allocated-property-detail/employee-allocated-property-detail.component';
// import { EmployeeDisciplinesDetailComponent } from './../../employee-profile/employee-disciplines-detail/employee-disciplines-detail.component';
// import { EmployeeAwardsDetailComponent } from './../../employee-profile/employee-awards-detail/employee-awards-detail.component';
// import { EmployeeWorkingLisenceDetailComponent } from './../../employee-profile/employee-working-lisence-detail/employee-working-lisence-detail.component';
// import { EmployeeTraincoursesComponent } from './../../employee-profile/employee-traincourses/employee-traincourses.component';
// import { EmployeeSkillDetailComponent } from './../../employee-profile/employee-skill-detail/employee-skill-detail.component';
// import { EmployeeDegreeDetailComponent } from './../../employee-profile/employee-degree-detail/employee-degree-detail.component';
// import { EmployeeCertificateDetailComponent } from './../../employee-profile/employee-certificate-detail/employee-certificate-detail.component';
// import { EmployeeVisaFormComponent } from './../../employee-profile/employee-visa-form/employee-visa-form.component';
// import { EmployeeAllocatedPropertyComponent } from './../../employee-profile/employee-allocated-property/employee-allocated-property.component';
// import { EmployeeAwardsInfoComponent } from './../../employee-profile/employee-awards-info/employee-awards-info.component';
// import { EmployeeDisciplinesInfoComponent } from './../../employee-profile/employee-disciplines-info/employee-disciplines-info.component';
// import { EmployeeVisaInfoComponent } from './../../employee-profile/employee-visa-info/employee-visa-info.component';
// import { EmployeeWorkingLisenceComponent } from './../../employee-profile/employee-working-lisence/employee-working-lisence.component';
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
import { I } from '@angular/cdk/keycodes';
import { PopupEPassportsComponent } from '../../employee-profile/popup-epassports/popup-epassports.component';

@Component({
  selector: 'lib-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent extends UIComponent {
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
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

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.auth.get();
    console.log('dtttt', dialog);
  }

  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;

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
  className = '';
  idField = 'recID';
  functionID: string;
  data: any = {};
  //family
  lstFamily: any;
  //passport
  lstPassport: any;
  crrPassport: any = {};
  //visa
  lstVisa: any;
  crrVisa: any = {};
  //work permit
  lstWorkPermit: any;
  //jobInfo
  jobInfo: any;

  formModel;
  itemDetail;

  hrEContract;
  crrTab: number = 0;

  healthColumnsGrid;
  vaccineColumnsGrid;
  diseaseColumnsGrid;
  accidentColumnsGrid;
  positionColumnsGrid;
  holidayColumnsGrid;
  workDiaryColumnGrid;
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
        this.hrService
          .getFamilyByEmployeeID(params.employeeID)
          .subscribe((res) => {
            console.log('family', res);
            this.lstFamily = res;
          });

        //Passport
        this.hrService
          .GetListPassportByEmpID(params.employeeID)
          .subscribe((res) => {
            console.log('passport', res);

            this.lstPassport = res;
            if (this.lstPassport.length > 0) {
              this.crrPassport = this.lstPassport[0];
            }
          });

        //Vissa
        this.hrService
          .getListVisaByEmployeeID(params.employeeID)
          .subscribe((res) => {
            console.log('visa', res);

            this.lstVisa = res;
            if (this.lstVisa.length > 0) {
              this.crrVisa = this.lstVisa[0];
            }
          });

        //work permit
        this.hrService
          .getListWorkPermitByEmployeeID(params.employeeID)
          .subscribe((res) => {
            console.log('w permit', res);
            this.lstWorkPermit = res;
          });

        //Job info
        //this.hrService.getJobInfo()
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
    console.log('data ', data);
    switch (event.functionID) {
      case 'SYS03': //edit
        if (funcID == 'passport') {
          this.handleEmployeePassportInfo('edit', data);
          this.df.detectChanges();
        } 
        else if (funcID == 'workpermit') {
          this.handleEmployeeWorkingPermitInfo('edit', data);
          this.df.detectChanges();
        }
        else if(funcID == 'visa'){
          this.handleEmployeeVisaInfo('edit', data);
          this.df.detectChanges();
        }
        break;

      case 'SYS02': //delete
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
        } 
        else if (funcID == 'workpermit') {
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
        }
        else if(funcID == 'visa'){
          this.hrService
          .DeleteEmployeeVisaInfo(data.recID)
          .subscribe((p) => {
            if (p == true) {
              this.notify.notifyCode('SYS008');
              let i = this.lstVisa.indexOf(data);
              if (i != -1) {
                this.lstVisa.splice(i, 1);
              }
              this.df.detectChanges();
            } else {
              this.notify.notifyCode('SYS022');
            }
          });
        }

        break;

      case 'SYS04': //copy
        if (funcID == 'passport') {
          this.handleEmployeePassportInfo('copy', data);
          this.df.detectChanges();
        }
        else if(funcID == 'workpermit'){
          this.handleEmployeeWorkingPermitInfo('copy', data);
          this.df.detectChanges();
        }
        else if(funcID == 'visa'){
          this.handleEmployeeVisaInfo('copy', data);
          this.df.detectChanges();
        }
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

  addFamilyRelationshipInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeFamilyRelationshipDetailComponent,
      PopupEFamiliesComponent,
      {
        isAdd: true,
        employeeId: this.data.employeeID,
        headerText: 'Quan hệ gia đình',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  handleEmployeePassportInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    console.log('datas', option.DataService);

    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEPassportsComponent,
      {
        actionType: actionType,
        headerText: 'Hộ chiếu',
        employeeId: this.data.employeeID,
        passPortSelected: data,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if(actionType != 'edit'){
        this.lstPassport.push(res.event);
      }
      else{
        let index = this.lstWorkPermit.indexOf(data);
        this.lstWorkPermit[index] = res.event;
      }

      console.log('data tra ve', res.event);
      console.log('lst passport', this.lstPassport);

      if (!res?.event) this.view.dataService.clear();
    });
  }

  handleEmployeeWorkingPermitInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeWorkingLisenceDetailComponent,
      PopupEWorkPermitsComponent,
      {
        actionType: actionType,
        selectedWorkPermit: data,
        headerText: 'Giấy phép lao động',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      console.log('work permit', res?.event);
      if(actionType != 'edit'){
        this.lstWorkPermit.push(res?.event);
      }
      else{
        let index = this.lstWorkPermit.indexOf(data);
        this.lstWorkPermit[index] = res.event;
      }
      console.log(this.lstWorkPermit);
      if (!res?.event) this.view.dataService.clear();
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
        visaSelected: data,
        headerText: 'Thị thực',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(actionType != 'edit'){
        this.lstVisa.push(res?.event);
      }
      else{
        let index = this.lstVisa.indexOf(data);
        this.lstVisa[index] = res.event;
      }
      console.log(this.lstVisa);
      if (!res?.event) this.view.dataService.clear();
    });
  }

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
    });
  }

  addEmployeeAllocatedPropertyInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;

    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAllocatedPropertyDetailComponent,
      PopupEAssetsComponent,
      {
        isAdd: true,
        employeeId: this.data.employeeID,
        headerText: 'Tài sản cấp phát',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
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

  addEmployeeDegreeInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeDegreeDetailComponent,
      PopupEDegreesComponent,
      {
        isAdd: true,
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

  collapse(id: string, isCollapse: string = '-1') {
    if (isCollapse != '-1') {
      let value = isCollapse == '0' ? false : true;
      this.objCollapes[id] = value;
    } else {
      this.objCollapes[id] = !this.objCollapes[id];
    }
  }
}
