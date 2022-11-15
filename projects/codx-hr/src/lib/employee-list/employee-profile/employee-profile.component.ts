import { EmployeeAwardsInfoComponent } from './../../employee-profile/employee-awards-info/employee-awards-info.component';
import { EmployeeDisciplinesInfoComponent } from './../../employee-profile/employee-disciplines-info/employee-disciplines-info.component';
import { EmployeeVisaInfoComponent } from './../../employee-profile/employee-visa-info/employee-visa-info.component';
import { EmployeeWorkingLisenceComponent } from './../../employee-profile/employee-working-lisence/employee-working-lisence.component';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { EmployeeLegalPassportFormComponent } from './../../employee-profile/employee-legal-passport-form/employee-legal-passport-form.component';
import { EmployeeAssurTaxBankaccInfoComponent } from './../../employee-profile/employee-assur-tax-bankacc-info/employee-assur-tax-bankacc-info.component';
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
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { EmployeeSelfInfoComponent } from '../../employee-profile/employee-self-info/employee-self-info.component';
import { PopupAddEmployeesPartyInfoComponent } from '../../employee-profile/popup-add-employees-party-info/popup-add-employees-party-info.component';
import { ActivatedRoute } from '@angular/router';
import { EmployeeFamilyRelationshipComponent } from '../../employee-profile/employee-family-relationship/employee-family-relationship.component';

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

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.auth.get();
  }

  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;

  views: Array<ViewModel> | any = [];

  infoPersonal: any = {};

  statusVll = 'L0225';
  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  className = '';
  idField = 'recID';
  functionID: string;
  data: any = {};
  formModel;
  itemDetail;

  hrEContract;
  crrTab: number = 2;

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
    this.routeActive.queryParams.subscribe((params) => {
      if (params.employeeID || this.user.userID) {
        this.codxMwpService
          .LoadData(params.employeeID, this.user.userID, '0')
          .subscribe((response: any) => {
            if (response) {
              console.log(response);
              this.infoPersonal = response.InfoPersonal;
              this.data = response.Employee;
              console.log(this.data);

              // this.dataEmployee.employeeInfo = response.InfoPersonal;
              // this.codxMwpService.appendID(params.employeeID);
              // this.codxMwpService.empInfo.next(response);
              this.df.detectChanges();
            }
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

  addEmployeePartyInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupAddEmployeesPartyInfoComponent,
      {
        isAdd: true,
        headerText: 'Thông tin Đảng - Đoàn',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  addAssuranceTaxBankAccountInfo() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      EmployeeAssurTaxBankaccInfoComponent,
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

  addEmployeeSelfInfo() {
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
      EmployeeSelfInfoComponent,
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
      EmployeeFamilyRelationshipComponent,
      {
        isAdd: true,
        headerText: 'Quan hệ gia đình',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeePassportInfo(){
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px'
    let dialogAdd = this.callfunc.openSide(
      EmployeeLegalPassportFormComponent,
      {
        isAdd: true,
        headerText: 'Hộ chiếu'
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeWorkingLisenceInfo(){
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px'
    let dialogAdd = this.callfunc.openSide(
      EmployeeWorkingLisenceComponent,
      {
        isAdd: true,
        headerText: 'Giấy phép lao động'
      },
      option
    )
    dialogAdd.closed.subscribe((res) => {
      if(!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeVisaInfo(){
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px'
    let dialogAdd = this.callfunc.openSide(
      EmployeeVisaInfoComponent,
      //TestingTwoSideFormComponent,
      {
        isAdd: true,
        headerText: 'Thị thực'
      },
      option
    )
    dialogAdd.closed.subscribe((res) => {
      if(!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeDisciplinesInfo(){
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px'
    let dialogAdd = this.callfunc.openSide(
      EmployeeDisciplinesInfoComponent,
      {
        isAdd: true,
        headerText: 'Kỷ luật'
      },
      option
    )
    dialogAdd.closed.subscribe((res) => {
      if(!res?.event) this.view.dataService.clear();
    });
  }

  addEmployeeAwardsInfo(){
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px'
    let dialogAdd = this.callfunc.openSide(
      EmployeeAwardsInfoComponent,
      {
        isAdd: true,
        headerText: 'Khen thưởng'
      },
      option
    )
    dialogAdd.closed.subscribe((res) => {
      if(!res?.event) this.view.dataService.clear();
    });
  }


}
