import { formatDate } from '@angular/common';
import { EMPTY } from 'rxjs';
import { PopupJobGeneralInfoComponent } from './../../employee-profile/popup-job-general-info/popup-job-general-info.component';
import { PopupEbenefitComponent } from './../../employee-profile/popup-ebenefit/popup-ebenefit.component';
import { PopupEdayoffsComponent } from './../../employee-profile/popup-edayoffs/popup-edayoffs.component';
import { PopupEaccidentsComponent } from './../../employee-profile/popup-eaccidents/popup-eaccidents.component';
import { PopupEappointionsComponent } from './../../employee-profile/popup-eappointions/popup-eappointions.component';
import { PopupEBasicSalariesComponent } from './../../employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { PopupETimeCardComponent } from './../../employee-profile/popup-etime-card/popup-etime-card.component';
import { PopupECalculateSalaryComponent } from './../../employee-profile/popup-ecalculate-salary/popup-ecalculate-salary.component';
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
  Optional,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  CRUDService,
  DataRequest,
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
import { EmployeePositionsComponent } from './employee-positions/employee-positions.component';
import { PopupEhealthsComponent } from '../../employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEVaccineComponent } from '../../employee-profile/popup-evaccine/popup-evaccine.component';
import { PopupEDiseasesComponent } from '../../employee-profile/popup-ediseases/popup-ediseases.component';
import { PopupEContractComponent } from '../../employee-profile/popup-econtract/popup-econtract.component';
import { PopupEmpBusinessTravelsComponent } from '../../employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';
import { log } from 'console';

@Component({
  selector: 'lib-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
    this.funcID = this.routeActive.snapshot.params['funcID'];
    console.log('dtttt', dialog);
  }
  @ViewChild("businessTravelGrid") businessTravelGrid: CodxGridviewComponent;
  @ViewChild("degreeGridView") degreeGrid : CodxGridviewComponent;
  @ViewChild("dayoffGridView") dayoffGrid: CodxGridviewComponent;
  @ViewChild("gridView") grid:CodxGridviewComponent;
  @ViewChild("appointionGridView") appointionGrid:CodxGridviewComponent;
  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;

  views: Array<ViewModel> | any = [];

  infoPersonal: any = {};
  ViewAllEBenefitFlag = false
  crrEContract: any;
  ops = ['y'];


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
  lstEDegrees: any = [];
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
  //Certificate
  lstCertificates: any = [];
  //Diseases
  lstEdiseases: any = [];
  //EExperience
  lstExperience: any = [];
  lstVaccine: any = [];

  //EDiscipline
  lstDiscipline: any = [];

  //EAccident
  lstAccident: any = [];

  //EHealth
  lstEhealth: any = [];

  formModel;
  itemDetail;
  EExperienceColumnsGrid: any;
  className = 'EExperiencesBusiness';

  employeeID;
  hrEContract;
  crrTab: number = 3;
  //EDayOff
  lstDayOffs: any = [];

  //EAsset salary
  lstAsset: any = [];
  //EAppointion
  lstAppointions: any = [];
  //Basic salary
  crrEBSalary: any;
  lstEBSalary: any = [];

  listCrrBenefit: any;

  lstESkill: any = [];
  //Awards
  lstAwards: any = [];

  //#region pageSize
  numPageSizeGridView = 5;

  //#region filter variables of form main eBenefit
  filterByBenefitIDArr: any = []
  yearFilterValue
  startDateEBenefitFilterValue
  endDateEBenefitFilterValue
  filterEBenefitPredicates : string
  filterEBenefitDatavalues

  //#region filter variables of form main eDayoffs
  filterByKowIDArr: []
  yearFilterValueDayOffs
  startDateEDayoffFilterValue
  endDateEDayoffFilterValue
  filterEDayoffPredicates : string
  filterEDayoffDatavalues

  //#region filter variables of form main EBusinessTravel
  yearFilterValueBusinessTravel
  startDateBusinessTravelFilterValue
  endDateBusinessTravelFilterValue
  filterBusinessTravelPredicates : string

  //#region declare columnGrid
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
  benefitColumnGrid;
  appointionColumnGrid;
  dayoffColumnGrid;
  businessTravelColumnGrid;
  degreeColumnGrid;

  //#region ViewChild
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
  @ViewChild('tempToDate', { static: true }) tempToDate: TemplateRef<any>;
 
  @ViewChild('templateBenefitID', {static: true}) 
  templateBenefitID: TemplateRef<any>;
  @ViewChild('templateBenefitAmt', {static: true}) 
  templateBenefitAmt: TemplateRef<any>;
  @ViewChild('templateBenefitEffected', {static: true}) 
  templateBenefitEffected: TemplateRef<any>;
  @ViewChild('templateBenefitIsCurrent', {static: true}) 
  templateBenefitIsCurrent: TemplateRef<any>;
  @ViewChild('templateBenefitMoreFunc', {static: true}) 
  templateBenefitMoreFunc: TemplateRef<any>;
  @ViewChild('filterTemplateBenefit', {static: true}) 
  filterTemplateBenefit: TemplateRef<any>;

  @ViewChild('templateAppointionGridCol1', {static: true}) 
  templateAppointionGridCol1: TemplateRef<any>;
  @ViewChild('templateAppointionGridCol2', {static: true}) 
  templateAppointionGridCol2: TemplateRef<any>;
  @ViewChild('templateAppointionGridCol3', {static: true}) 
  templateAppointionGridCol3: TemplateRef<any>;
  @ViewChild('templateAppointionGridMoreFunc', {static: true}) 
  templateAppointionGridMoreFunc: TemplateRef<any>;

  @ViewChild('templateDayOffGridCol1', {static: true}) 
  templateDayOffGridCol1: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol2', {static: true}) 
  templateDayOffGridCol2: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol3', {static: true}) 
  templateDayOffGridCol3: TemplateRef<any>;
  @ViewChild('templateDayOffGridMoreFunc', {static: true}) 
  templateDayOffGridMoreFunc: TemplateRef<any>;

  @ViewChild('templateDegreeGridCol1', {static: true}) 
  templateDegreeGridCol1: TemplateRef<any>;
  @ViewChild('templateDegreeGridCol2', {static: true}) 
  templateDegreeGridCol2: TemplateRef<any>;
  @ViewChild('templateDegreeGridCol3', {static: true}) 
  templateDegreeGridCol3: TemplateRef<any>;
  @ViewChild('templateDegreeGridMoreFunc', {static: true}) 
  templateDegreeGridMoreFunc: TemplateRef<any>;
  
  @ViewChild('templateBusinessTravelGridCol1', {static: true}) 
  templateBusinessTravelGridCol1: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol2', {static: true}) 
  templateBusinessTravelGridCol2: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol3', {static: true}) 
  templateBusinessTravelGridCol3: TemplateRef<any>;
  @ViewChild('templateBusinessTravelMoreFunc', {static: true}) 
  templateBusinessTravelMoreFunc: TemplateRef<any>;

  //#endregion

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

  listEmp: any;
  request: DataRequest;

  lstTab: any;

  appointionFormodel: FormModel;
  appointionRowCount;
  appointionFuncID = 'HRTEM0502'
  appointionHeaderTexts;
  benefitFormodel: FormModel;
  eBenefitRowCount;
  benefitFuncID = 'HRTEM0403'
  benefitHeaderTexts;
  dayofFormModel: FormModel;
  dayoffRowCount;
  dayoffFuncID = 'HRTEM0503'
  dayoffHeaderTexts
  EBusinessTravelFormodel: FormModel;
  eBusinessTravelRowCount = 0;
  eBusinessTravelFuncID= 'HRTEM0504'
  eBusinessTravelHeaderTexts

  degreeFormodel: FormModel;
  degreeRowCount;
  degreeFuncID = 'HRTEM0601';
  degreeHeaderText;

  onInit(): void {
    this.hrService.getFunctionList(this.funcID).subscribe((res) => {
      console.log('functionList', res);
      if(res && res[1] > 0){
        this.lstTab = res[0].filter(p => p.parentID == this.funcID);
        this.crrFuncTab = this.lstTab[0].functionID;
      }
    });

    this.hrService.getFormModel(this.benefitFuncID).then(res => {
      this.benefitFormodel = res;
    });

    this.hrService.getFormModel(this.appointionFuncID).then(res => {
      this.appointionFormodel = res;
    })

    this.hrService.getFormModel(this.dayoffFuncID).then(res => {
      this.dayofFormModel = res;
    })
    this.hrService.getFormModel(this.degreeFuncID).then(res => {
      this.degreeFormodel = res;
    })

    this.hrService.getFormModel(this.eBusinessTravelFuncID).then(res => {
      this.EBusinessTravelFormodel = res;
      console.log('formmodel cong tac', this.EBusinessTravelFormodel);
    })

    this.hrService.getHeaderText(this.eBusinessTravelFuncID).then(res => {
      this.eBusinessTravelHeaderTexts = res;
      this.businessTravelColumnGrid = [
        {
          headerText: this.eBusinessTravelHeaderTexts['BusinessPlace'] + '|' + this.eBusinessTravelHeaderTexts['KowID'],
          template: this.templateBusinessTravelGridCol1,
          width: '150',
        },
        {
          headerText: this.eBusinessTravelHeaderTexts['PeriodType'] + '|' + this.eBusinessTravelHeaderTexts['Days'],
          template: this.templateBusinessTravelGridCol2,
          width: '150',
        },
        {
          headerText: this.eBusinessTravelHeaderTexts['BusinessPurpose'],
          template: this.templateBusinessTravelGridCol3,
          width: '150',
        },
        {
          template: this.templateBusinessTravelMoreFunc,
          width: '150'
        },
      ]
    })

    let insBusinessTravel = setInterval(()=>{
      if(this.businessTravelGrid){
        clearInterval(insBusinessTravel);
        let t= this;
        this.businessTravelGrid.dataService.onAction.subscribe((res)=>{
          if(res){
            if(res.type != null && res.type == 'loaded'){
              t.eBusinessTravelRowCount = res['data'].length
            }
          }
          
        })
        this.eBusinessTravelRowCount = this.businessTravelGrid.dataService.rowCount; 
      }
    },100)

    this.hrService.getHeaderText(this.dayoffFuncID).then(res =>{
      this.dayoffHeaderTexts = res;
      this.dayoffColumnGrid = [
        {
          headerText: this.dayoffHeaderTexts['KowID'] + '|' + this.dayoffHeaderTexts['RegisteredDate'],
          template: this.templateDayOffGridCol1,
          width: '150',
        },
        {
          headerText: 'Thời gian nghỉ ' + '|' + 'Số ngày',
          template: this.templateDayOffGridCol2,
          width: '150',
        },
        {
          headerText: this.dayoffHeaderTexts['Reason'],
          template: this.templateDayOffGridCol3,
          width: '150',
        },
        {
          template: this.templateDayOffGridMoreFunc,
          width: '150'
        },
      ]
    })

    let insDayOff = setInterval(()=>{
      if(this.dayoffGrid){
        clearInterval(insDayOff);
        let t= this;
        this.dayoffGrid.dataService.onAction.subscribe((res)=>{
          if(res){
            if(res.type != null && res.type == 'loaded'){
              t.dayoffRowCount = res['data'].length
            }
          }
          
        })
        this.dayoffRowCount = this.dayoffGrid.dataService.rowCount; 
      }
    },100)
    
    this.hrService.getHeaderText(this.benefitFuncID).then(res => {
      this.benefitHeaderTexts = res;
      this.benefitColumnGrid = [
        {
          headerText: this.benefitHeaderTexts['BenefitID'],
          template: this.templateBenefitID,
          width: '50',
        },
        {
          headerText: this.benefitHeaderTexts['BenefitAmt'],
          template: this.templateBenefitAmt,
          width: '150'
        },
        {
          headerText: 'Hiệu lực',
          template: this.templateBenefitEffected,
          width: '150'
        },
        {
          template: this.templateBenefitIsCurrent,
          width: '150'
        },
        {
          template: this.templateBenefitMoreFunc,
          width: '150'
        }
      ]
    })

    this.hrService.getHeaderText(this.appointionFuncID).then(res => {
      console.log('headerText bo nhiem dieu chuyen', res);
      
      this.appointionHeaderTexts = res;
      this.appointionColumnGrid = [
        {
          headerText: this.benefitHeaderTexts['Appoint'] + '| Hiệu lực',
          template: this.templateAppointionGridCol1,
          width: '150',
        },
        {
          headerText: this.benefitHeaderTexts['PositionID'],
          template: this.templateAppointionGridCol2,
          width: '150',
        },
        {
          headerText: this.benefitHeaderTexts['OrgUnitID'] + '/ Phòng ban',
          template: this.templateAppointionGridCol3,
          width: '150',
        },
        {
          template: this.templateAppointionGridMoreFunc,
          width: '150',
        },
      ]
    })

    this.hrService.getHeaderText(this.degreeFuncID).then(res => {
      console.log('degreeeeeeeeeeeeeee', res);
      
      this.degreeHeaderText = res;
      this.degreeColumnGrid = [
        {
          headerText: this.degreeHeaderText['DegreeName'] + '|' + this.degreeHeaderText['TrainFieldID'],
          template: this.templateDegreeGridCol1,
          width: '150',
        },
        {
          headerText: this.degreeHeaderText['TrainSupplierID'] + '|' + this.degreeHeaderText['Ranking'],
          template: this.templateDegreeGridCol2,
          width: '150',
        },
        {
          headerText: this.degreeHeaderText['YearGraduated'] + '|' + this.degreeHeaderText['IssuedDate'],
          template: this.templateDegreeGridCol3,
          width: '150',
        },
        {
          template: this.templateDegreeGridMoreFunc,
          width: '150',
        },
      ]
    })

    let insDegree = setInterval(()=>{
      if(this.degreeGrid){
        clearInterval(insDegree);
        let t= this;
        this.degreeGrid.dataService.onAction.subscribe((res)=>{
          if(res){
            if(res.type != null && res.type == 'loaded'){
              t.degreeRowCount = res['data'].length
          }
          }
        })
        this.degreeRowCount = this.degreeGrid.dataService.rowCount; 
      }
    },100)

    let ins = setInterval(()=>{
      if(this.appointionGrid){
        clearInterval(ins);
        let t= this;
        this.appointionGrid.dataService.onAction.subscribe((res)=>{
          if(res){
            if(res.type != null && res.type == 'loaded'){
              t.appointionRowCount = res['data'].length
            }
          }
          
        })
        this.appointionRowCount = this.appointionGrid.dataService.rowCount; 
      }
    },100)


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
        console.log('State', history.state);
        this.listEmp = history.state?.data;
        this.request = history.state?.request;
        if (!this.request && !this.listEmp) {
          let i = 1;
          this.listEmp = [];
          let flag = true;
          //while (flag) {
          this.request = new DataRequest();
          this.request.entityName = 'HR_Employees';
          this.request.gridViewName = 'grvEmployees';
          this.request.page = params?.page ?? 1;
          this.request.predicate = params?.predicate ?? '';
          this.request.dataValue = params?.dataValue ?? '';
          if (params?.filter) this.request.filter = JSON.parse(params?.filter);
          this.request.pageSize = 20;
          this.hrService.getModelFormEmploy(this.request).subscribe((res) => {
            if (res && res[0]) {
              this.listEmp.push(...res[0]);
              let index = this.listEmp?.findIndex(
                (p) => p.employeeID == params.employeeID
              );
              i++;
              if (index > -1) {
                flag = false;
              }
            }
          });
          //}
        }

        let index = this.listEmp?.findIndex(
          (p) => p.employeeID == params.employeeID
        );
        if (index > -1 && !this.listEmp[index + 1]?.employeeID) {
          this.request.page += 1;
          this.hrService.getModelFormEmploy(this.request).subscribe((res) => {
            if (res && res[0]) {
              this.listEmp.push(...res[0]);
            }
          });
        }

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

        let rqEhealth = new DataRequest();
        rqEhealth.gridViewName = 'grvEHealths';
        rqEhealth.entityName = 'HR_EHealths';
        rqEhealth.predicate = 'EmployeeID=@0';
        rqEhealth.dataValue = params.employeeID;
        rqEhealth.page = 1;
        this.hrService
          .loadListDataEHealthsByDatarequest(rqEhealth)
          .subscribe((res) => {
            if (res) this.lstEhealth = res[0];
            console.log('lit e appoint', this.lstAppointions);
          });

        //Appointions
        let rqAppointion = new DataRequest();
        rqAppointion.gridViewName = 'grvEAppointions';
        rqAppointion.entityName = 'HR_EAppointions';
        rqAppointion.predicate = 'EmployeeID=@0';
        rqAppointion.dataValue = params.employeeID;
        rqAppointion.page = 1;
        this.hrService
          .getListAssetByDataRequest(rqAppointion)
          .subscribe((res) => {
            if (res) this.lstAppointions = res[0];
            console.log('lit e appoint', this.lstAppointions);
          });

        //Dayoff
        let rqDayoff = new DataRequest();
        rqDayoff.gridViewName = 'grvEDayOffs';
        rqDayoff.entityName = 'HR_EDayOffs';
        rqDayoff.predicate = 'EmployeeID=@0';
        rqDayoff.dataValue = params.employeeID;
        rqDayoff.page = 1;
        this.hrService
          .getListDisciplineByDataRequest(rqDayoff)
          .subscribe((res) => {
            if (res) this.lstDayOffs = res[0];
          });

        //Discipline
        let rqDiscipline = new DataRequest();
        rqDiscipline.gridViewName = 'grvEDisciplines';
        rqDiscipline.entityName = 'HR_EDisciplines';
        rqDiscipline.predicate = 'EmployeeID=@0';
        rqDiscipline.dataValue = params.employeeID;
        rqDiscipline.page = 1;
        this.hrService
          .getListDisciplineByDataRequest(rqDiscipline)
          .subscribe((res) => {
            if (res) this.lstDiscipline = res[0];
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

        //Certificate
        let rqCertificate = new DataRequest();
        rqCertificate.gridViewName = 'grvEAssets';
        rqCertificate.entityName = 'HR_ECertificates';
        rqCertificate.predicate = 'EmployeeID=@0';
        rqCertificate.dataValue = params.employeeID;
        rqCertificate.page = 1;
        this.hrService
          .getECertificateWithDataRequest(rqCertificate)
          .subscribe((res) => {
            if (res) this.lstCertificates = res[0];
          });

        //Accident
        let rqAccident = new DataRequest();
        rqAccident.gridViewName = 'grvEAccidents';
        rqAccident.entityName = 'HR_EAccidents';
        rqAccident.predicate = 'EmployeeID=@0';
        rqAccident.dataValue = params.employeeID;
        rqAccident.page = 1;
        this.hrService
          .getListAccidentByDataRequest(rqAccident)
          .subscribe((res) => {
            if (res) this.lstAccident = res[0];
            console.log('lit accident', this.lstAccident);
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
              // Thong tin ca nhan
              this.hrService
                .getEmployeeInfo(params.employeeID)
                .subscribe((emp) => {
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
              this.hrService
                .getEFamilyWithDataRequest(opFamily)
                .subscribe((res) => {
                  if (res) this.lstFamily = res[0];
                });

              //Asset
              let rqAsset = new DataRequest();
              rqAsset.gridViewName = 'grvEAssets';
              rqAsset.entityName = 'HR_EAssets';
              rqAsset.predicate = 'EmployeeID=@0';
              rqAsset.dataValue = params.employeeID;
              rqAsset.page = 1;
              this.hrService
                .getListAssetByDataRequest(rqAsset)
                .subscribe((res) => {
                  if (res) this.lstAsset = res[0];
                });

              //Certificate
              let rqCertificate = new DataRequest();
              rqCertificate.gridViewName = 'grvEAssets';
              rqCertificate.entityName = 'HR_ECertificates';
              rqCertificate.predicate = 'EmployeeID=@0';
              rqCertificate.dataValue = params.employeeID;
              rqCertificate.page = 1;
              this.hrService
                .getECertificateWithDataRequest(rqCertificate)
                .subscribe((res) => {
                  if (res) this.lstCertificates = res[0];
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

              //work permit
              let op4 = new DataRequest();
              op4.gridViewName = 'grvEWorkPermits';
              op4.entityName = 'HR_EWorkPermits';
              op4.predicate = 'EmployeeID=@0';
              op4.dataValue = params.employeeID;
              (op4.page = 1),
                this.hrService
                  .getListWorkPermitByEmployeeID(op4)
                  .subscribe((res) => {
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
              (op.page = 1),
              this.hrService.GetListByEmployeeIDAsync(op).subscribe((res) => {
                console.log('e experience', res);
                this.lstExperience = res;
              });

              // Salary
              this.hrService
                .GetCurrentEBasicSalariesByEmployeeID(params.employeeID)
                .subscribe((res) => {
                  if (res) {
                    this.crrEBSalary = res;
                  }
                });

              // Benefit
              this.hrService
                .GetCurrentBenefit(params.employeeID)
                .subscribe((res) => {
                  if (res?.length) {
                    this.listCrrBenefit = res;
                  }
                });
            });

        // lstEdiseases Ediseases
        let rqDiseases = new DataRequest();
        rqDiseases.gridViewName = 'grvEDiseases';
        rqDiseases.entityName = 'HR_EDiseases';
        rqDiseases.predicate = 'EmployeeID=@0';
        rqDiseases.dataValue = params.employeeID;
        rqDiseases.page = 1;
        this.hrService
          .getListDiseasesByDataRequest(rqDiseases)
          .subscribe((res) => {
            if (res) this.lstEdiseases = res[0];
            console.log('lit e di zi', this.lstEdiseases);
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
                this.lstEBSalary = res;
                console.log('e salaries', this.lstEBSalary);
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

        //HR_ESkills
        let rqESkill = new DataRequest();
        rqESkill.entityName = 'HR_ESkills';
        rqESkill.dataValues = params.employeeID;
        rqESkill.predicates = 'EmployeeID=@0';
        rqESkill.page = 1;
        rqESkill.pageSize = 20;
        this.hrService.getViewSkillAsync(rqESkill).subscribe((res) => {
          console.log('e Skill', res);

          if (res) {
            this.lstESkill = res;
          }
          //this.lstSkill = res;
          //this.lstExperience = res;
        });

        //HR_EAwards
        let rqAward = new DataRequest();
        rqAward.entityName = 'HR_ESkills';
        rqAward.dataValues = params.employeeID;
        rqAward.predicates = 'EmployeeID=@0';
        rqAward.page = 1;
        rqAward.pageSize = 20;
        this.hrService.getViewSkillAsync(rqAward).subscribe((res) => {
          if (res) {
            this.lstAwards = res;
          }
          //this.lstSkill = res;
          //this.lstExperience = res;
        });

        //HR_EContracts
        let rqContract = new DataRequest();
        rqContract.entityName = 'HR_EContracts';
        rqContract.dataValues = params.employeeID + ';false;true';
        rqContract.predicates =
          'EmployeeID=@0 and IsAppendix=@1 and IsCurrent=@2';
        rqContract.page = 1;
        rqContract.pageSize = 1;

        this.hrService.getCrrEContract(rqContract).subscribe((res) => {
          if (res && res[0]) {
            this.crrEContract = res[0][0];
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

  async clickMF(event: any, data: any, funcID = null) {
    console.log('event', event)
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
        } else if (funcID == 'eDegrees') {
          this.HandleEmployeeDegreeInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.HandleEmployeeCertificateInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eAppointions') {
          this.HandleEmployeeAppointionInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eExperiences') {
          this.handlEmployeeExperiences('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'Diseases') {
          this.HandleEmployeeDiseaseInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eBenefit') {
          this.handlEmployeeBenefit('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eDayoff'){
          this.HandleEmployeeDayOffInfo('edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eBusinessTravels'){
          this.HandleEBusinessTravel('edit', data);
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
            } else if (funcID == 'eDegrees') {
              this.hrService
                .DeleteEmployeeDegreeInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    (this.degreeGrid.dataService as CRUDService).remove(data).subscribe();
                    // let i = this.lstEDegrees.indexOf(data);
                    // if (i != -1) {
                    //   this.lstEDegrees.splice(i, 1);
                    // }
                    this.degreeRowCount = this.degreeRowCount - 1;
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eSkill') {
              this.hrService.deleteESkill(data.recID).subscribe((res) => {
                if (res) {
                  let grpIndex = this.lstESkill.findIndex(
                    (p) => p.skillID == data.skillID
                  );
                  if (grpIndex > -1) {
                    let lstItem = this.lstESkill[grpIndex]?.listSkill;

                    let skillIndex = lstItem.findIndex(
                      (p) => p.recID == data.recID
                    );
                    if (skillIndex > -1) {
                      lstItem.splice(skillIndex, 1);
                      this.df.detectChanges();
                    }
                  }
                }
              });
            } else if (funcID == 'eCertificate') {
              this.hrService
                .DeleteEmployeeCertificateInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstCertificates.indexOf(data);
                    if (i != -1) {
                      this.lstCertificates.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                  this.df.detectChanges();
                });
            } else if (funcID == 'eAppointions') {
              this.hrService
                .DeleteEmployeeAppointionsInfo(data.recID)
                // .subscribe((p) => {
                //   if (p == true) {
                //     this.notify.notifyCode('SYS008');
                //     let i = this.lstAppointions.indexOf(data);
                //     if (i != -1) {
                //       this.lstAppointions.splice(i, 1);
                //     }
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    (this.appointionGrid.dataService as CRUDService).remove(data).subscribe();
                    this.appointionRowCount = this.appointionRowCount - 1; 
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eExperiences') {
              this.hrService
                .DeleteEmployeeExperienceInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstExperience.indexOf(data);
                    if (i != -1) {
                      this.lstExperience.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'Diseases') {
              this.hrService
                .DeleteEmployeeDiseasesInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstEdiseases.indexOf(data);
                    if (i != -1) {
                      this.lstEdiseases.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            }  else if (funcID == 'eBenefit') {
              this.hrService
                .DeleteEBenefit(data)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    (this.grid.dataService as CRUDService).remove(data).subscribe();
                    this.eBenefitRowCount = this.eBenefitRowCount - 1; 
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            }  else if (funcID == 'eDayoff') {
              this.hrService
                .DeleteEmployeeDayOffInfo(data)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    (this.dayoffGrid.dataService as CRUDService).remove(data).subscribe();
                    this.dayoffRowCount = this.dayoffRowCount - 1; 
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eBusinessTravels') {
              this.hrService
                .deleteEBusinessTravels(data)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    (this.businessTravelGrid.dataService as CRUDService).remove(data).subscribe();
                    this.eBusinessTravelRowCount = this.eBusinessTravelRowCount - 1; 
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
        } else if (funcID == 'eDegrees') {
          this.HandleEmployeeDegreeInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.HandleEmployeeCertificateInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eAppointions') {
          this.copyValue(data, 'eAppointions');
          //this.HandleEmployeeAppointionInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eExperiences') {
          this.handlEmployeeExperiences('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'Diseases') {
          this.HandleEmployeeDiseaseInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eBenefit') {
          this.copyValue(data, 'benefit');
          this.df.detectChanges();
        } else if(funcID == 'eDayoff'){
          this.copyValue(data, 'eDayoff');
          this.df.detectChanges();
        } else if(funcID == 'eBusinessTravels'){
          this.copyValue(data, 'eBusinessTravels');
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
        field: 'decisionNo',
        headerText: 'Loại quyết định',
        width: 250,
      },
      {
        field: 'effectedDate',
        headerText: 'Ngày hiệu lực',
        width: 250,
      },
      {
        field: 'expiredDate',
        headerText: 'Ngày hết hạn',
        width: 250,
      },
      {
        field: 'jobLevel',
        headerText: 'Chức danh',
        width: 250,
      },
      {
        field: 'orgUnitID',
        headerText: 'Phòng ban',
        width: 250,
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

  crrFuncTab: string;
  clickTab(funcList: any) {
    // this.crrTab = tabNumber;
    this.crrFuncTab = funcList.functionID;
    console.log(this.crrFuncTab);
  
  }

  editEmployeePartyInfo() {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEmployeePartyInfoComponent,
      {
        funcID : 'HRTEM0102',
        headerText: 'Thông tin Đảng - Đoàn',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        console.log('data tra ve dang doan', res.event);
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
  }

  editAssuranceTaxBankAccountInfo() {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAssurTaxBankaccInfoComponent,
      PopupEAssurTaxBankComponent,
      {
        isAdd: true,
        funcID : 'HRTEM0201',
        headerText: 'Bảo hiểm - MST - Tài khoản',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
  }

  editEmployeeSelfInfo() {
    this.view.dataService.dataSelected = this.infoPersonal;
    // this.view.dataService
    // .edit(this.data)
    // .subscribe((res) => {
    //   console.log('ress', res);
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupESelfInfoComponent,
      {
        headerText: 'Thông tin bản thân',
        funcID: 'HRTEM0101',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
  }

  HandleEmployeeJobGeneralInfo(actionType: string){
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogEdit = this.callfunc.openSide(
      PopupJobGeneralInfoComponent,
      {
        funcID: 'HRTEM0301',
        headerText: 'Thông tin chung',
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  editEmployeeTimeCardInfo() {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogEdit = this.callfunc.openSide(
      PopupETimeCardComponent,
      {
        isAdd: false,
        funcID: 'HRTEM0302',
        headerText: 'Thông tin chấm công',
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  editEmployeeCaculateSalaryInfo() {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogEdit = this.callfc.openSide(
      PopupECalculateSalaryComponent,
      {
        isAdd: false,
        funcID: 'HRTEM0303',

        headerText: 'Thông tin tính lương',
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
    });
  }

  DeleteEmployeeEHealths(recID: string) {
    console.log('rec ID', recID);
    this.hrService.deleteEHealth(recID).subscribe((p) => {
      if (p != null) {
        this.notify.notifyCode('SYS008');
      } else this.notify.notifyCode('SYS022');
    });
    console.log('delete xong');
  }

  handlEmployeeBenefit(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';    
    let dialogAdd = this.callfunc.openSide(
      PopupEbenefitComponent,
      {
        employeeId: this.data.employeeID,
        actionType: actionType,
        headerText: 'Phụ cấp',
        funcID: this.benefitFuncID,
        benefitObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(res.event){
        if (actionType == 'add' || actionType == 'copy') {
          (this.grid.dataService as CRUDService).add(res.event).subscribe();
          this.eBenefitRowCount += 1;
        }
        else if(actionType == 'edit'){
          (this.grid.dataService as CRUDService).update(res.event).subscribe();
        }
      }
    });
  }


  handlEmployeeExperiences(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    
    let dialogAdd = this.callfunc.openSide(
      PopupEexperiencesComponent,
      {
        actionType: actionType,
        headerText: 'Kinh nghiệm trước đây',
        funcID: 'HRTEM0505',
        lstExperience: this.lstExperience,
        employeeId: this.data.employeeID,
        indexSelected: this.lstExperience.indexOf(data),
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
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEJobSalariesComponent,
      {
        actionType: actionType,
        headerText: 'Lương chức danh',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0402',
        lstJobSalaries: this.lstJobSalaries,
        indexSelected: this.lstJobSalaries.indexOf(data),
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
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEBasicSalariesComponent,
      {
        actionType: actionType,
        lstEBSalary: this.lstEBSalary,
        headerText: 'Lương cơ bản',
        funcID: 'HRTEM0401',
        indexSelected: this.lstExperience.indexOf(data),
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
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeFamilyRelationshipDetailComponent,
      PopupEFamiliesComponent,
      {
        actionType: actionType,
        employeeId: this.data.employeeID,
        headerText: 'Quan hệ gia đình',
        funcID: 'HRTEM0103',
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
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEPassportsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstPassport.indexOf(data),
        lstPassports: this.lstPassport,
        funcID: 'HRTEM0202',
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

  HandleEmployeeDayOffInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeWorkingLisenceDetailComponent,
      PopupEdayoffsComponent,
      {
        actionType: actionType,
        // indexSelected: this.lstDayOffs.indexOf(data),
        dayoffObj: data,
        headerText: 'Nghỉ phép',
        employeeId: this.data.employeeID,
        funcID: this.dayoffFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(res.event){
        if (actionType == 'add' || actionType == 'copy') {
          (this.dayoffGrid.dataService as CRUDService).add(res.event).subscribe();
          this.dayoffRowCount += 1;
        }
        else if(actionType == 'edit'){
          (this.dayoffGrid.dataService as CRUDService).update(res.event).subscribe();
        }
      }
      this.df.detectChanges();
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
        indexSelected: this.lstWorkPermit.indexOf(data),
        lstWorkPermit: this.lstWorkPermit,
        // selectedWorkPermit: data,
        headerText: 'Giấy phép lao động',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0204',
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
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeVisaFormComponent,
      PopupEVisasComponent,
      {
        actionType: actionType,
        indexSelected: this.lstVisa.indexOf(data),
        lstVisas: this.lstVisa,
        headerText: 'Thị thực',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0203',
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

  addEmployeeDisciplinesInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeDisciplinesDetailComponent,
      PopupEDisciplinesComponent,
      {
        actionType: actionType,
        indexSelected: this.lstDiscipline.indexOf(data),
        lstDiscipline: this.lstDiscipline,
        headerText: 'Kỷ luật',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0702',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  addEmployeeAwardsInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAwardsDetailComponent,
      PopupEAwardsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstAsset.indexOf(data),
        lstAwards: this.lstAwards,
        employeeId: this.data.employeeID,
        headerText: 'Khen thưởng',
        funcID: 'HRTEM0701',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandleEmployeeAccidentInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;

    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAllocatedPropertyDetailComponent,
      PopupEaccidentsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstAccident.indexOf(data),
        lstAccident: this.lstAccident,
        employeeId: this.data.employeeID,
        headerText: 'Tai nạn lao động',
        funcID: 'HRTEM0804',
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
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAllocatedPropertyDetailComponent,
      PopupEAssetsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstAsset.indexOf(data),
        lstAssets: this.lstAsset,
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0406',
        headerText: 'Tài sản cấp phát',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandleEmployeeAppointionInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEappointionsComponent,
      {
        actionType: actionType,
        //indexSelected: this.lstAppointions.indexOf(data),
        employeeId: this.data.employeeID,
        //lstEAppointions: this.lstAppointions,
        funcID: this.appointionFuncID,
        appointionObj: data,
        headerText: 'Bổ nhiệm - Điều chuyển',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(res.event){
        if (actionType == 'add' || actionType == 'copy') {
          this.appointionRowCount += 1;
          (this.appointionGrid.dataService as CRUDService).add(res.event).subscribe();
        }
        else if(actionType == 'edit'){
          (this.appointionGrid.dataService as CRUDService).update(res.event).subscribe();
        }
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeCertificateInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupECertificatesComponent,
      {
        actionType: actionType,
        indexSelected: this.lstCertificates.indexOf(data),
        lstCertificates: this.lstCertificates,
        headerText: 'Chứng chỉ',
        funcID: 'HRTEM0602',
        employeeId: this.data.employeeID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandleEmployeeDegreeInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDegreesComponent,
      {
        actionType: actionType,
        //indexSelected: this.lstEDegrees.indexOf(data),
        //lstEDegrees: this.lstEDegrees,
        headerText: 'Bằng cấp',
        employeeId: this.data.employeeID,
        degreeObj: data,
        // dataSelected: data,
        funcID: this.degreeFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (actionType == 'add' || actionType == 'copy') {
        (this.degreeGrid.dataService as CRUDService).add(res.event).subscribe();
        this.degreeRowCount = this.degreeRowCount + 1;
      }
      else if(actionType == 'edit'){
        (this.degreeGrid.dataService as CRUDService).update(res.event).subscribe();
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeSkillsInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupESkillsComponent,
      {
        lstESkill: this.lstESkill,
        indexSelected: this.lstESkill.indexOf(data),
        actionType: actionType,
        headerText: 'Kỹ năng',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0603',
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
        actionType: 'add',
        funcID: 'HRTEM0604',
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

  HandleEmployeeEHealths(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEhealthsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstEhealth.indexOf(data),
        lstEhealth: this.lstEhealth,
        headerText: 'Khám sức khỏe',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0801',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        console.log('current val', res.event);
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
    // this.view.dataService.dataSelected = data;
    let option = new SidebarModel();
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEVaccineComponent,
      {
        actionType: actionType,
        vaccineSelected: data,
        listData: this.lstVaccine,
        headerText: 'Tiêm Vaccine',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0802',
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
  HandleEmployeeDiseaseInfo(actionType: string, data: any) {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDiseasesComponent,
      {
        actionType: actionType,
        indexSelected: this.lstEdiseases.indexOf(data),
        lstEdiseases: this.lstEdiseases,
        funcID: 'HRTEM0803',
        headerText: 'Bệnh nghề nghiệp',
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
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
    });
  }
  //#endregion

  //#region HR_EContracts
  addEContracts() {
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEContractComponent,
      {
        actionType: 'add',
        salarySelected: null,
        headerText: 'Hợp đồng lao động',
        employeeId: this.data.employeeID,
        funcID: 'HRTEM0501',
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

  //#region  HR_EBusinessTravels
  HandleEBusinessTravel(actionType: string, data: any) {
    this.businessTravelGrid.dataService.dataSelected = this.data;
    // (this.businessTravelGrid.dataService as CRUDService).addNew().subscribe(res =>{
    //   console.log('GridComponent', this.businessTravelGrid)
    // });

    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.businessTravelGrid.formModel;
    let dialogAdd = this.callfunc.openSide(
      PopupEmpBusinessTravelsComponent,
      {
        actionType: actionType,
        employeeId: this.data.employeeID,
        headerText: 'Nhật kí công tác',
        funcID: this.eBusinessTravelFuncID,
        businessTravelObj : data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(res.event){
        if (actionType == 'add' || actionType == 'copy') {
          this.eBusinessTravelRowCount += 1;
          (this.businessTravelGrid.dataService as CRUDService).add(res.event).subscribe();
        }
        else if(actionType == 'edit'){
          (this.businessTravelGrid.dataService as CRUDService).update(res.event).subscribe();
        }
      }
      this.df.detectChanges();
    });
  }

  //#endregion
  addSkill() {
    this.hrService.addSkill(null).subscribe();
  }

  addSkillGrade() {
    this.hrService.addSkillGrade(null).subscribe();
  }

  nextEmp() {
    if (this.listEmp) {
      let index = this.listEmp.findIndex(
        (p) => p.employeeID == this.data.employeeID
      );
      if (index > -1 && this.listEmp[index + 1]?.employeeID) {
        let urlView = '/hr/employeedetail/HRT03a1';
        // this.codxService.navigate(
        //   '',
        //   urlView,
        //   {
        //     employeeID: this.listEmp[index + 1]?.employeeID,
        //   },
        //   {
        //     data: this.listEmp,
        //     request: this.request,
        //   }
        // );

        this.codxService.replaceNavigate(
          urlView,
          {
            employeeID: this.listEmp[index + 1]?.employeeID,
            page: this.request?.page,
            predicate:
              this.request?.predicate == ''
                ? undefined
                : this.request?.predicate,
            dataValue:
              this.request?.dataValue == ''
                ? undefined
                : this.request?.dataValue,
            filter: JSON.stringify(this.request?.filter),
          },
          {
            data: this.listEmp,
            request: this.request,
          }
        );
      }
    }
  }

  previousEmp() {
    if (this.listEmp) {
      let index = this.listEmp.findIndex(
        (p) => p.employeeID == this.data.employeeID
      );
      if (index > -1 && this.listEmp[index - 1]?.employeeID) {
        let urlView = '/hr/employeedetail/HRT03a1';
        this.codxService.replaceNavigate(
          urlView,
          {
            employeeID: this.listEmp[index + 1]?.employeeID,
            page: this.request?.page,
            predicate:
              this.request?.predicate == ''
                ? undefined
                : this.request?.predicate,
            dataValue:
              this.request?.dataValue == ''
                ? undefined
                : this.request?.dataValue,
            filter: JSON.stringify(this.request?.filter),
          },
          {
            data: this.listEmp,
            request: this.request,
          }
        );
      }
    }
  }

  addTest() {
    this.hrService.addTest().subscribe();
  }

  valueChangeFilterBenefit(evt){
    console.log('filter theo type', evt);
    this.filterByBenefitIDArr = evt.data;
    this.UpdateEBenefitPredicate();
  }

  UpdateEBenefitPredicate(){
    this.filterEBenefitPredicates = ""
    if(this.filterByBenefitIDArr.length > 0 && this.startDateEBenefitFilterValue != null){
      this.filterEBenefitPredicates = '('
      let i = 0;
      for(i; i< this.filterByBenefitIDArr.length; i++){
        if(i>0){
          this.filterEBenefitPredicates +=' or '
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`
      }
      this.filterEBenefitPredicates += ') ';
      this.filterEBenefitPredicates +=  `and (EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      
      (this.grid.dataService as CRUDService).setPredicates([this.filterEBenefitPredicates],[this.filterByBenefitIDArr.join(';')])
      .subscribe((item) => {
        console.log('item tra ve sau khi loc 1', item);
      });
    }
    else if(this.filterByBenefitIDArr.length > 0 && this.startDateEBenefitFilterValue == undefined || this.startDateEBenefitFilterValue == null){
      let i = 0;
      for(i; i< this.filterByBenefitIDArr.length; i++){
        if(i>0){
          this.filterEBenefitPredicates +=' or '
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`
      }

      (this.grid.dataService as CRUDService).setPredicates([this.filterEBenefitPredicates],[this.filterByBenefitIDArr.join(';')])
      .subscribe((item) => {
        console.log('item tra ve sau khi loc 2', item);
      });
    }
    else if(this.startDateEBenefitFilterValue != null){
      (this.grid.dataService as CRUDService).setPredicates([`EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}"`], [])
      .subscribe((item) => {
        console.log('item tra ve sau khi loc 3', item);
      });
    }
    
  }

  valueChangeYearFilterBenefit(evt){
    console.log('chon year', evt);
    if(evt.formatDate == undefined && evt.toDate == undefined){
      this.startDateEBenefitFilterValue = null;
      this.endDateEBenefitFilterValue = null;
    }
    else{
      this.startDateEBenefitFilterValue = evt.fromDate.toJSON();
      this.endDateEBenefitFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEBenefitPredicate();
    
    // (this.grid.dataService as CRUDService).setPredicates(['EffectedDate>=@0 and EffectedDate<=@1'], [start, endDate]).subscribe((item) => {
    //   console.log('item tra ve', item);
    // });
  }

  
  valueChangeViewAllEBenefit(evt){
    this.ViewAllEBenefitFlag = evt.data;
    let ins = setInterval(()=>{
      if(this.grid){
        clearInterval(ins);
        let t= this;
        this.grid.dataService.onAction.subscribe((res)=>{
          if(res){
            if(res.type != null && res.type == 'loaded'){
              t.eBenefitRowCount = res['data'].length
            }
          }
          
        })
        this.eBenefitRowCount = this.grid.dataService.rowCount; 
      }
    },100)
  }

copyValue(data, flag) {
      if(flag == 'benefit'){
        this.grid.dataService.dataSelected = data;
        (this.grid.dataService as CRUDService).copy().subscribe((res: any) => {
        this.handlEmployeeBenefit('copy', res);
        })
      }
      else if(flag == 'eAppointions'){
        this.appointionGrid.dataService.dataSelected = data;
        (this.appointionGrid.dataService as CRUDService).copy().subscribe((res: any) => {
        this.HandleEmployeeAppointionInfo('copy', res);
        })
      }
      else if(flag == 'eDegrees'){
        this.degreeGrid.dataService.dataSelected = data;
        (this.degreeGrid.dataService as CRUDService).copy().subscribe((res: any) => {
        this.HandleEmployeeAppointionInfo('copy', res);
        })
      }
      else if(flag == 'eDayoff'){
        this.dayoffGrid.dataService.dataSelected = data;
        (this.dayoffGrid.dataService as CRUDService).copy().subscribe((res: any) => {
        this.HandleEmployeeDayOffInfo('copy', res);
        })
      }
      else if(flag == 'eBusinessTravels'){
        this.businessTravelGrid.dataService.dataSelected = data;
        (this.businessTravelGrid.dataService as CRUDService).copy().subscribe((res: any) => {
        this.HandleEBusinessTravel('copy', res);
        })
      }
}

UpdateEDayOffsPredicate(){
  this.filterEDayoffPredicates = ""
  if(this.filterByKowIDArr.length > 0 && this.startDateEDayoffFilterValue != null){
    this.filterEDayoffPredicates = '('
    let i = 0;
    for(i; i< this.filterByKowIDArr.length; i++){
      if(i>0){
        this.filterEDayoffPredicates +=' or '
      }
      this.filterEDayoffPredicates += `KowID==@${i}`
    }
    this.filterEDayoffPredicates += ') ';
    this.filterEDayoffPredicates +=  `and (BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}")`;
    //this.filterEBenefitDatavalues = this.filterByKowIDArr.concat([this.startDateEBenefitFilterValue, this.endDateEBenefitFilterValue]);
    
    (this.dayoffGrid.dataService as CRUDService).setPredicates([this.filterEDayoffPredicates],[this.filterByKowIDArr.join(';')])
    .subscribe((item) => {
      console.log('item tra ve sau khi loc 1', item);
    });
  }
  else if(this.filterByKowIDArr.length > 0 && (this.startDateEDayoffFilterValue == undefined || this.startDateEDayoffFilterValue == null)){
    let i = 0;
    for(i; i< this.filterByKowIDArr.length; i++){
      if(i>0){
        this.filterEDayoffPredicates +=' or '
      }
      this.filterEDayoffPredicates += `KowID==@${i}`
    }

    (this.dayoffGrid.dataService as CRUDService).setPredicates([this.filterEDayoffPredicates],[this.filterByKowIDArr.join(';')])
    .subscribe((item) => {
      console.log('item tra ve sau khi loc 2', item);
    });
  }
  else if(this.startDateEDayoffFilterValue != null){
    (this.dayoffGrid.dataService as CRUDService).setPredicates([`BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}"`], [])
    .subscribe((item) => {
      console.log('item tra ve sau khi loc 3', item);
    });
  }
}

valueChangeFilterDayOff(evt){
  this.filterByKowIDArr = evt.data; 
  
  this.UpdateEDayOffsPredicate();
} 

valueChangeYearFilterDayOff(evt){
  console.log('chon year', evt);
  if(evt.formatDate == undefined && evt.toDate == undefined){
    this.startDateEDayoffFilterValue = null;
    this.endDateEDayoffFilterValue = null;
  }
  else{
    this.startDateEDayoffFilterValue = evt.fromDate.toJSON();
    this.endDateEDayoffFilterValue = evt.toDate.toJSON();
  }
  this.UpdateEDayOffsPredicate();
}

UpdateBusinessTravelPredicate(){
  this.filterBusinessTravelPredicates = "";
  if(this.startDateBusinessTravelFilterValue == null){
    (this.businessTravelGrid.dataService as CRUDService).setPredicates([`EmployeeID=@0`], [this.data.employeeID])
    .subscribe((item) => {
      console.log('item tra ve sau khi loc 3', item);
    });
  }
  else{
    (this.businessTravelGrid.dataService as CRUDService).setPredicates([`BeginDate>="${this.startDateBusinessTravelFilterValue}" and EndDate<="${this.endDateBusinessTravelFilterValue}"`], [])
    .subscribe((item) => {
      console.log('item tra ve sau khi loc 3', item);
    });
  }
}

valueChangeYearFilterBusinessTravel(evt){
  if(evt.formatDate == undefined && evt.toDate == undefined){
    this.startDateBusinessTravelFilterValue = null;
    this.endDateBusinessTravelFilterValue = null;
  }
  else{
    this.startDateBusinessTravelFilterValue = evt.fromDate.toJSON();
    this.endDateBusinessTravelFilterValue = evt.toDate.toJSON();
  }
  this.UpdateBusinessTravelPredicate();
}

}
