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
  DataService,
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
import { ActivatedRoute, Router } from '@angular/router';
// import { EmployeeFamilyRelationshipComponent } from '../../employee-profile/employee-family-relationship/employee-family-relationship.component';
import { E, I } from '@angular/cdk/keycodes';
import { PopupEPassportsComponent } from '../../employee-profile/popup-epassports/popup-epassports.component';
import { NoopAnimationPlayer } from '@angular/animations';
import { PopupEhealthsComponent } from '../../employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEVaccineComponent } from '../../employee-profile/popup-evaccine/popup-evaccine.component';
import { PopupEDiseasesComponent } from '../../employee-profile/popup-ediseases/popup-ediseases.component';
import { PopupEContractComponent } from '../../employee-profile/popup-econtract/popup-econtract.component';
import { PopupEmpBusinessTravelsComponent } from '../../employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { log } from 'console';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import { Sidebar } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'lib-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeDetailComponent extends UIComponent {
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('button') button: TemplateRef<any>;
  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;

  views: Array<ViewModel> | any = [];
  minType = 'MinRange';
  user;

  active: string = 'HRTEM0101';

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
    private route: ActivatedRoute,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.user = this.auth.get();
    this.funcID = this.routeActive.snapshot.params['funcID'];
  }
  navChange(evt: any) {
    if (!evt) return;
    let element = document.getElementById(evt.nextId);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });

    // let footer = document.querySelector('.codx-detail-footer');
    // if (footer) {
    //   var f = footer as HTMLElement;
    //   let clss = f.classList;
    //   if (!clss.contains('expand')) {
    //     clss.remove('collape');
    //     clss.add('expand');
    //   }
    // }
  }

  infoPersonal: any = {};

  crrEContract: any;

  statusVll = 'L0225';
  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  idField = 'recID';
  functionID: string;
  // data: any = {};
  // //family
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

  //#region getGridView
  eVaccineGrvSetup;
  eSkillgrvSetup;
  eBenefitGrvSetup;
  eDayOffGrvSetup;
  eTrainCourseGrvSetup;
  //#endregion

  //#region ColumnsGrid
  passportColumnGrid;
  visaColumnGrid;
  workPermitColumnGrid;
  healthColumnsGrid;
  vaccineColumnsGrid;
  diseaseColumnsGrid;
  accidentColumnsGrid;
  positionColumnsGrid;
  holidayColumnsGrid;
  workDiaryColumnGrid;
  rewardColumnsGrid;
  disciplineColumnGrid;
  degreeColumnGrid;
  certificateColumnGrid;
  eExperienceColumnGrid;
  eAssetColumnGrid;
  skillColumnGrid;
  basicSalaryColumnGrid;
  trainCourseColumnGrid;
  eHealthColumnGrid;
  businessTravelColumnGrid;
  eVaccineColumnGrid;
  benefitColumnGrid;
  dayoffColumnGrid;
  appointionColumnGrid;
  //#endregion

  filterByBenefitIDArr: any = [];
  filterEBenefitPredicates: string;
  startDateEBenefitFilterValue;
  endDateEBenefitFilterValue;

  ViewAllEBenefitFlag = false;
  ViewAllEskillFlag = false;
  ViewAllEBasicSalaryFlag = false;
  ops = ['y'];

  //#region filter variables of form main eAssets
  filterByAssetCatIDArr: any = [];
  startDateEAssetFilterValue;
  endDateEAssetFilterValue;
  filterEAssetPredicates: string;

  //#endregion

  //#region filter variables of form main eVaccine
  filterByVaccineTypeIDArr: any = [];
  startDateEVaccineFilterValue;
  endDateEVaccineFilterValue;
  filterEVaccinePredicates: string;

  //#endregion

  //#region filter variables of form main eSKill
  filterBySkillIDArr: any = [];
  startDateESkillFilterValue;
  endDateESkillFilterValue;
  filterESkillPredicates: string;

  //#endregion

  //#region filter variables of form main eTrainCourse
  filterByTrainCourseIDArr: any = [];
  startDateTrainCourseFilterValue;
  endDateTrainCourseFilterValue;
  filterTrainCoursePredicates: string;
  //#endregion

  //#region ViewChild template
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

  // ePassPort
  @ViewChild('passportCol1', { static: true }) passportCol1: TemplateRef<any>;
  @ViewChild('passportCol2', { static: true }) passportCol2: TemplateRef<any>;

  // ePassVisa
  @ViewChild('visaCol1', { static: true }) visaCol1: TemplateRef<any>;
  @ViewChild('visaCol2', { static: true }) visaCol2: TemplateRef<any>;

  // eWorkPermit
  @ViewChild('workPermitCol1', { static: true })
  workPermitCol1: TemplateRef<any>;
  @ViewChild('workPermitCol2', { static: true })
  workPermitCol2: TemplateRef<any>;

  // eBasicSalary
  @ViewChild('basicSalaryCol1', { static: true })
  basicSalaryCol1: TemplateRef<any>;
  @ViewChild('basicSalaryCol2', { static: true })
  basicSalaryCol2: TemplateRef<any>;
  @ViewChild('basicSalaryCol3', { static: true })
  basicSalaryCol3: TemplateRef<any>;
  @ViewChild('basicSalaryCol4', { static: true })
  basicSalaryCol4: TemplateRef<any>;

  // eAppointion - Bổ nhiệm điều chuyển
  @ViewChild('templateAppointionGridCol1', { static: true })
  templateAppointionGridCol1: TemplateRef<any>;
  @ViewChild('templateAppointionGridCol2', { static: true })
  templateAppointionGridCol2: TemplateRef<any>;
  @ViewChild('templateAppointionGridCol3', { static: true })
  templateAppointionGridCol3: TemplateRef<any>;

  //#endregion

  //eDayoff
  @ViewChild('templateDayOffGridCol1', { static: true })
  templateDayOffGridCol1: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol2', { static: true })
  templateDayOffGridCol2: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol3', { static: true })
  templateDayOffGridCol3: TemplateRef<any>;
  //#endregion

  //#region gridView viewChild
  @ViewChild('passportGridview') passportGridview: CodxGridviewComponent;
  @ViewChild('visaGridview') visaGridview: CodxGridviewComponent;
  @ViewChild('workPermitGridview') workPermitGridview: CodxGridviewComponent;
  @ViewChild('basicSalaryGridview') basicSalaryGridview: CodxGridviewComponent;
  @ViewChild('appointionGridView') appointionGridView: CodxGridviewComponent;
  //#endregion

  //#endregion
  // objCollapes = {
  //   '1': false,
  //   '1.1': false,
  //   '1.2': false,
  //   '2': false,
  //   '2.1': false,
  //   '2.2': false,
  //   '3': false,
  //   '3.1': false,
  //   '3.2': false,
  //   '3.3': false,
  //   '3.4': false,
  //   '4': false,
  //   '4.1': false,
  //   '4.2': false,
  //   '4.3': false,
  //   '4.4': false,
  //   '4.5': false,
  //   '5': false,
  //   '5.1': false,
  //   '5.2': false,
  //   '5.3': false,
  //   '5.4': false,
  //   '6': false,
  //   '6.1': false,
  //   '6.2': false,
  //   '7': false,
  //   '7.1': false,
  //   '7.2': false,
  //   '7.3': false,
  //   '7.4': false,
  // };

  // vllTabs = [
  //   { icon: 'icon-apartment', text: 'Thông tin cá nhân' },
  //   { icon: 'icon-apartment', text: 'Thông tin công việc' },
  //   { icon: 'icon-apartment', text: 'Phúc Lợi' },
  //   { icon: 'icon-apartment', text: 'Quá trình nhân sự' },
  //   { icon: 'icon-apartment', text: 'Kiến thức' },
  //   { icon: 'icon-apartment', text: 'Khen thưởng' },
  //   { icon: 'icon-apartment', text: 'Kỷ luật' },
  //   { icon: 'icon-apartment', text: 'Sức khỏe' },
  //   { icon: 'icon-apartment', text: 'Thôi việc' },
  // ];

  listEmp: any;
  request: DataRequest;

  lstTab: any;

  //#region functions list
  lstFuncSelfInfo: any = [];
  lstFuncLegalInfo: any = [];
  lstFuncTaskInfo: any = [];
  lstFuncSalary: any = [];
  lstFuncHRProcess: any = [];
  lstFuncKnowledge: any = [];
  lstFuncAward: any = [];
  lstFuncHealth: any = [];
  lstFuncArchiveRecords: any = [];
  lstFuncSeverance: any = [];
  lstFuncID: any = [];
  //#endregion

  //#region RowCount
  degreeRowCount;
  passportRowCount: number;
  visaRowCount: Number;
  workPermitRowCount: Number;
  eExperienceRowCount;
  certificateRowCount;
  eBenefitRowCount: number = 0;
  eBusinessTravelRowCount = 0;
  skillRowCount = 0;
  dayoffRowCount: number = 0;
  eAssetRowCount;
  eBasicSalaryRowCount;
  trainCourseRowCount;
  eHealthRowCount = 0;
  eVaccineRowCount = 0;
  appointionRowCount;
  //#endregion

  //#region var functionID

  eInfoFuncID = 'HRTEM0101';
  ePassportFuncID = 'HRTEM0202';
  eFamiliesFuncID = 'HRTEM0103';
  degreeFuncID = 'HRTEM0601';
  eVisaFuncID = 'HRTEM0203';
  eWorkPermitFuncID = 'HRTEM0204';
  certificateFuncID = 'HRTEM0602';
  skillFuncID = 'HRTEM0603';
  eExperienceFuncID = 'HRTEM0505'; // Kinh nghiệm trước đây
  eAssetFuncID = 'HRTEM0406'; // Tài sản cấp phát
  eTimeCardFuncID = 'HRTEM0302';
  eCalSalaryFuncID = 'HRTEM0303';
  jobGeneralFuncID = 'HRTEM0301';
  eBasicSalaryFuncID = 'HRTEM0401';
  trainCourseFuncID = 'HRTEM0604';
  eBusinessTravelFuncID = 'HRTEM0504';
  eHealthFuncID = 'HRTEM0801'; // Khám sức khỏe
  eVaccinesFuncID = 'HRTEM0802'; // Tiêm vắc xin
  benefitFuncID = 'HRTEM0403';
  dayoffFuncID = 'HRTEM0503';
  appointionFuncID = 'HRTEM0502';
  //#endregion

  //#region var formModel
  benefitFormodel: FormModel;
  EBusinessTravelFormodel: FormModel;
  eInfoFormModel: FormModel; // Thông tin bản thân/ Bảo hiểm
  eFamilyFormModel: FormModel; //Quan hệ gia đình
  ePassportFormModel: FormModel; //Hộ chiếu
  eVisaFormModel: FormModel;
  eWorkPermitFormModel: FormModel; //Giay phep lao dong
  certificateFormModel: FormModel; // Chứng chỉ
  degreeFormModel: FormModel; // Bằng cấp
  skillFormmodel: FormModel; // Kỹ năng
  eExperienceFormModel: FormModel; //Kinh nghiệm trước đây
  eAssetFormModel: FormModel; //Tài sản cấp phát
  eBasicSalaryFormmodel: FormModel; //Lương cơ bản
  trainCourseFormModel: FormModel; // Đào tạo
  eHealthFormModel: FormModel; //Khám sức khỏe
  eVaccineFormModel: FormModel; //Tiêm vắc xin
  appointionFormModel: FormModel;
  dayofFormModel: FormModel;
  //#endregion

  //#region headerText
  eBusinessTravelHeaderTexts;
  benefitHeaderTexts;
  dayoffHeaderTexts;
  degreeHeaderText;
  eExperienceHeaderText;
  eAssetHeaderText;
  certificateHeaderText;
  skillHeaderText;
  trainCourseHeaderText;
  eHealthHeaderText;
  eVaccineHeaderText;
  appointionHeaderTexts;
  //#endregion

  //#region headerTextString
  addHeaderText;
  editHeaderText;
  //#endregion

  //#region filter variables of form main eDayoffs
  filterByKowIDArr: [];
  yearFilterValueDayOffs;
  startDateEDayoffFilterValue;
  endDateEDayoffFilterValue;
  filterEDayoffPredicates: string;
  filterEDayoffDatavalues;
  //#endregion

  //#region filter variables of form main EBusinessTravel
  yearFilterValueBusinessTravel;
  startDateBusinessTravelFilterValue;
  endDateBusinessTravelFilterValue;
  filterBusinessTravelPredicates: string;
  //#endregion
  dataService: DataService = null;
  clickItem(evet) {}

  onSectionChange(data: any) {
    debugger;
    console.log('change section', data);
    this.codxMwpService.currentSection = data.current;
    this.detectorRef.detectChanges();
  }

  onInit(): void {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      this.addHeaderText = res[0].customName;
      this.editHeaderText = res[2].customName;
    });

    //#region get FormModel
    this.hrService.getFormModel(this.eInfoFuncID).then((res) => {
      this.eInfoFormModel = res;
    });

    this.hrService.getFormModel(this.eFamiliesFuncID).then((res) => {
      this.eFamilyFormModel = res;
    });

    this.hrService.getFormModel(this.ePassportFuncID).then((res) => {
      this.ePassportFormModel = res;
    });

    this.hrService.getFormModel(this.eVisaFuncID).then((res) => {
      this.eVisaFormModel = res;
    });

    this.hrService.getFormModel(this.eWorkPermitFuncID).then((res) => {
      this.eWorkPermitFormModel = res;
    });

    this.hrService.getFormModel(this.degreeFuncID).then((res) => {
      this.degreeFormModel = res;
    });

    this.hrService.getFormModel(this.eExperienceFuncID).then((res) => {
      this.eExperienceFormModel = res;
    });

    this.hrService.getFormModel(this.certificateFuncID).then((res) => {
      this.certificateFormModel = res;
    });

    this.hrService.getFormModel(this.skillFuncID).then((res) => {
      this.skillFormmodel = res;
      this.cache
        .gridViewSetup(
          this.skillFormmodel.formName,
          this.skillFormmodel.gridViewName
        )
        .subscribe((res) => {
          this.eSkillgrvSetup = res;
        });
    });

    this.hrService.getFormModel(this.degreeFuncID).then((res) => {
      this.degreeFormModel = res;
    });

    this.hrService.getFormModel(this.eAssetFuncID).then((res) => {
      this.eAssetFormModel = res;
    });

    this.hrService.getFormModel(this.eBasicSalaryFuncID).then((res) => {
      this.eBasicSalaryFormmodel = res;
    });
    this.hrService.getFormModel(this.trainCourseFuncID).then((res) => {
      this.trainCourseFormModel = res;
      this.cache
        .gridViewSetup(
          this.trainCourseFormModel.formName,
          this.trainCourseFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eTrainCourseGrvSetup = res;
          console.log('traincourseeeeeeeeeeee', this.eTrainCourseGrvSetup);
        });
    });
    this.hrService.getFormModel(this.eHealthFuncID).then((res) => {
      this.eHealthFormModel = res;
    });

    this.hrService.getFormModel(this.benefitFuncID).then((res) => {
      this.benefitFormodel = res;
      this.cache
        .gridViewSetup(
          this.benefitFormodel.formName,
          this.benefitFormodel.gridViewName
        )
        .subscribe((res) => {
          this.eBenefitGrvSetup = res;
          console.log('grv set up của ebenefit', this.eBenefitGrvSetup);
        });
    });

    this.hrService.getFormModel(this.eVaccinesFuncID).then((res) => {
      this.eVaccineFormModel = res;
      this.cache
        .gridViewSetup(
          this.eVaccineFormModel.formName,
          this.eVaccineFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eVaccineGrvSetup = res;
          console.log('grv set up của evaccine', this.eVaccineGrvSetup);
        });
    });

    this.hrService.getFormModel(this.dayoffFuncID).then((res) => {
      this.dayofFormModel = res;
      this.cache
        .gridViewSetup(
          this.dayofFormModel.formName,
          this.dayofFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eDayOffGrvSetup = res;
        });
    });

    this.hrService.getFormModel(this.eBusinessTravelFuncID).then((res) => {
      this.EBusinessTravelFormodel = res;
      console.log('formmodel cong tac', this.EBusinessTravelFormodel);
    });

    this.hrService.getFormModel(this.appointionFuncID).then((res) => {
      this.appointionFormModel = res;
    });
    //#endregion

    this.hrService.getFunctionList(this.funcID).subscribe((res) => {
      console.log('functionList', res);
      if (res && res[1] > 0) {
        this.lstTab = res[0].filter((p) => p.parentID == this.funcID);
        this.crrFuncTab = this.lstTab[2].functionID;
        console.log('crrFuncTab', this.crrFuncTab);
        this.lstFuncID = res[0];

        this.lstFuncSelfInfo = res[0].filter((p) => p.parentID == 'HRTEM01');

        this.lstFuncLegalInfo = res[0].filter((p) => p.parentID == 'HRTEM02');

        this.lstFuncTaskInfo = res[0].filter((p) => p.parentID == 'HRTEM03');

        this.lstFuncSalary = res[0].filter((p) => p.parentID == 'HRTEM04');

        this.lstFuncHRProcess = res[0].filter((p) => p.parentID == 'HRTEM05');

        this.lstFuncKnowledge = res[0].filter((p) => p.parentID == 'HRTEM06');

        this.lstFuncAward = res[0].filter((p) => p.parentID == 'HRTEM07');

        this.lstFuncHealth = res[0].filter((p) => p.parentID == 'HRTEM08');

        this.lstFuncArchiveRecords = res[0].filter(
          (p) => p.parentID == 'HRT030210'
        );

        this.lstFuncSeverance = res[0].filter((p) => p.parentID == 'HRT030208');

        //#region - Công tác
        this.hrService.getHeaderText(this.eBusinessTravelFuncID).then((res) => {
          this.eBusinessTravelHeaderTexts = res;
          this.businessTravelColumnGrid = [
            {
              headerText:
                this.eBusinessTravelHeaderTexts['BusinessPlace'] +
                '|' +
                this.eBusinessTravelHeaderTexts['KowID'],
              template: this.templateBusinessTravelGridCol1,
              width: '150',
            },
            {
              headerText:
                this.eBusinessTravelHeaderTexts['PeriodType'] +
                '|' +
                this.eBusinessTravelHeaderTexts['Days'],
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
              width: '150',
            },
          ];
        });

        let insBusinessTravel = setInterval(() => {
          if (this.businessTravelGrid) {
            clearInterval(insBusinessTravel);
            let t = this;
            this.businessTravelGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type != null && res.type == 'loaded') {
                  t.eBusinessTravelRowCount = res['data'].length;
                }
              }
            });
            this.eBusinessTravelRowCount =
              this.businessTravelGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region - Nghỉ phép
        this.hrService.getHeaderText(this.dayoffFuncID).then((res) => {
          this.dayoffHeaderTexts = res;
          this.dayoffColumnGrid = [
            {
              headerText:
                this.dayoffHeaderTexts['KowID'] +
                '|' +
                this.dayoffHeaderTexts['RegisteredDate'],
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
          ];
        });

        let insDayOff = setInterval(() => {
          if (this.dayoffGrid) {
            clearInterval(insDayOff);
            let t = this;
            this.dayoffGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type != null && res.type == 'loaded') {
                  t.dayoffRowCount = res['data'].length;
                }
              }
            });
            this.dayoffRowCount = this.dayoffGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region - Chứng chỉ
        this.hrService.getHeaderText(this.certificateFuncID).then((res) => {
          this.certificateHeaderText = res;
          this.certificateColumnGrid = [
            {
              headerText: this.certificateHeaderText['CertificateID'],
              template: this.templateCertificateGridCol1,
              width: '150',
            },
            {
              headerText:
                this.certificateHeaderText['TrainSupplierID'] +
                '|' +
                this.certificateHeaderText['Ranking'],
              template: this.templateCertificateGridCol2,
              width: '150',
            },
            {
              headerText:
                this.certificateHeaderText['IssuedDate'] +
                '|' +
                this.certificateHeaderText['EffectedDate'],
              template: this.templateCertificateGridCol3,
              width: '150',
            },
          ];
        });

        let insCerti = setInterval(() => {
          if (this.certificateGrid) {
            clearInterval(insCerti);
            let t = this;
            this.certificateGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.certificateRowCount = res['data'].length;
                }
              }
            });
            this.certificateRowCount =
              this.certificateGrid.dataService.rowCount;
          }
        }, 100);

        //#endregion

        //#region eAsset - Tai san cap phat
        this.hrService.getHeaderText(this.eAssetFuncID).then((res) => {
          this.eAssetHeaderText = res;
          this.eAssetColumnGrid = [
            {
              headerText:
                this.eAssetHeaderText['AssetCategory'] +
                '|' +
                this.eAssetHeaderText['AssetNo'],
              template: this.templateEAssetCol1,
              width: '150',
            },
            {
              headerText:
                this.eAssetHeaderText['IssuedDate'] +
                '|' +
                this.eAssetHeaderText['IsAllowReturn'],
              template: this.templateEAssetCol2,
              width: '150',
            },
            {
              headerText: this.eAssetHeaderText['ReturnedDate'],
              template: this.templateEAssetCol3,
              width: '150',
            },
          ];
        });

        let insEAsset = setInterval(() => {
          if (this.eAssetGrid) {
            clearInterval(insEAsset);
            let t = this;
            this.eAssetGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.eAssetRowCount = res['data'].length;
                }
              }
            });
            this.eAssetRowCount = this.eAssetGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region Kham suc khoe
        this.hrService.getHeaderText(this.eHealthFuncID).then((res) => {
          this.eHealthHeaderText = res;
          this.eHealthColumnGrid = [
            {
              headerText:
                this.eHealthHeaderText['HealthDate'] +
                '|' +
                this.eHealthHeaderText['HealthPeriodID'] +
                '|' +
                this.eHealthHeaderText['HospitalID'],
              template: this.tempCol1EHealthGrid,
              width: '150',
            },

            {
              headerText:
                this.eHealthHeaderText['HealthType'] +
                '|' +
                this.eHealthHeaderText['FinalConclusion'],
              template: this.tempCol2EHealthGrid,
              width: '150',
            },

            {
              headerText: this.eHealthHeaderText['Suggestion'],
              template: this.tempCol3EHealthGrid,
              width: '150',
            },
          ];
        });

        let insEHealth = setInterval(() => {
          if (this.eHealthsGrid) {
            clearInterval(insEHealth);
            let t = this;
            this.eHealthsGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.eHealthRowCount = res['data'].length;
                }
              }
            });
            this.eHealthRowCount = this.eHealthsGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region Tiem vaccine
        this.hrService.getHeaderText(this.eVaccinesFuncID).then((res) => {
          this.eVaccineHeaderText = res;
          this.eVaccineColumnGrid = [
            {
              headerText:
                this.eVaccineHeaderText['VaccineTypeID'] +
                '|' +
                this.eVaccineHeaderText['HopitalID'],
              template: this.tempEVaccineGridCol1,
              width: '150',
            },

            {
              headerText:
                this.eVaccineHeaderText['InjectDate'] +
                '|' +
                this.eVaccineHeaderText['NextInjectDate'],
              template: this.tempEVaccineGridCol2,
              width: '150',
            },

            {
              headerText: this.eVaccineHeaderText['Note'],
              template: this.tempEVaccineGridCol3,
              width: '150',
            },
          ];
        });

        let insEVaccines = setInterval(() => {
          if (this.eVaccinesGrid) {
            clearInterval(insEVaccines);
            let t = this;
            this.eVaccinesGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.eVaccineRowCount = res['data'].length;
                }
              }
            });
            this.eVaccineRowCount = this.eVaccinesGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region eExperience - Kinh nghiem truoc day
        this.hrService.getHeaderText(this.eExperienceFuncID).then((res) => {
          this.eExperienceHeaderText = res;
          this.eExperienceColumnGrid = [
            {
              headerText: this.eExperienceHeaderText['FromDate'],
              // field: 'fromDate',
              template: this.tempFromDate,
              width: '150',
            },

            {
              headerText: this.eExperienceHeaderText['ToDate'],
              // field: 'toDate',
              template: this.tempToDate,
              width: '150',
            },

            {
              headerText: this.eExperienceHeaderText['CompanyName'],
              field: 'companyName',
              // template: this.templateEExperienceGridCol3,
              width: '150',
            },

            {
              headerText: this.eExperienceHeaderText['Position'],
              // field: 'position',
              template: this.templateEExperienceGridCol4,
              width: '150',
            },
          ];
        });

        let insExperience = setInterval(() => {
          if (this.eExperienceGrid) {
            clearInterval(insExperience);
            let t = this;
            this.eExperienceGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.eExperienceRowCount = res['data'].length;
                }
              }
            });
            this.eExperienceRowCount =
              this.eExperienceGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion
        ////////////////////

        //#region EDegrees - Bằng cấp

        this.hrService.getHeaderText(this.degreeFuncID).then((res) => {
          this.degreeHeaderText = res;
          this.degreeColumnGrid = [
            {
              headerText:
                this.degreeHeaderText['DegreeName'] +
                '|' +
                this.degreeHeaderText['TrainFieldID'],
              template: this.templateDegreeGridCol1,
              width: '150',
            },
            {
              headerText:
                this.degreeHeaderText['TrainSupplierID'] +
                '|' +
                this.degreeHeaderText['Ranking'],
              template: this.templateDegreeGridCol2,
              width: '150',
            },
            {
              headerText:
                this.degreeHeaderText['YearGraduated'] +
                '|' +
                this.degreeHeaderText['IssuedDate'],
              template: this.templateDegreeGridCol3,
              width: '150',
            },
          ];
        });

        let insDegree = setInterval(() => {
          if (this.degreeGrid) {
            clearInterval(insDegree);
            let t = this;
            this.degreeGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.degreeRowCount = res['data'].length;
                }
              }
            });
            this.degreeRowCount = this.degreeGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region ESKills - Kỹ năng

        this.hrService.getHeaderText(this.skillFuncID).then((res) => {
          this.skillHeaderText = res;
          this.skillColumnGrid = [
            {
              headerText:
                this.skillHeaderText['SkillID'] +
                '|' +
                this.skillHeaderText['SkillGradeID'],
              template: this.templateSkillGridCol1,
              width: '150',
            },
            {
              headerText:
                this.skillHeaderText['TrainSupplierID'] +
                '|' +
                this.skillHeaderText['Ranking'] +
                ' - ' +
                this.skillHeaderText['TotalScore'],
              template: this.templateSkillGridCol2,
              width: '150',
            },
            {
              headerText:
                this.skillHeaderText['TrainFrom'] +
                '|' +
                this.skillHeaderText['TrainForm'],
              template: this.templateSkillGridCol3,
              width: '150',
            },
          ];
        });

        let insSkill = setInterval(() => {
          if (this.skillGrid) {
            clearInterval(insSkill);
            let t = this;
            this.skillGrid.dataService.onAction.subscribe((res) => {
              if (res) {
                if (res.type == 'loaded') {
                  t.skillRowCount = res['data'].length;
                }
              }
            });
            this.skillRowCount = this.skillGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region - Phúc lợi

        this.hrService.getHeaderText(this.benefitFuncID).then((res) => {
          this.benefitHeaderTexts = res;
          this.benefitColumnGrid = [
            {
              headerText: this.benefitHeaderTexts['BenefitID'],
              template: this.templateBenefitID,
              width: '150',
            },
            {
              headerText: this.benefitHeaderTexts['BenefitAmt'],
              template: this.templateBenefitAmt,
              width: '150',
            },
            {
              headerText: 'Hiệu lực',
              template: this.templateBenefitEffected,
              width: '150',
            },
          ];
        });
        //#endregion
      }
    });

    //#region get columnGrid EVisa - Thị thực
    this.hrService.getHeaderText(this.eVisaFuncID).then((res) => {
      let visaHeaderText = res;
      this.visaColumnGrid = [
        {
          headerText:
            visaHeaderText['VisatNo'] + ' | ' + visaHeaderText['IssuedPlace'],
          template: this.visaCol1,
          width: '150',
        },
        {
          headerText:
            visaHeaderText['IssuedDate'] +
            ' | ' +
            visaHeaderText['ExpiredDate'],
          template: this.visaCol2,
          width: '150',
        },
      ];
    });

    let insVisa = setInterval(() => {
      if (this.passportGridview) {
        clearInterval(insVisa);
        let t = this;
        this.visaGridview.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.visaRowCount = res['data'].length;
            }
          }
        });
        this.visaRowCount = this.visaGridview.dataService.rowCount;
      }
    }, 100);

    //#endregion

    //#region get columnGrid EPassport - Hộ chiếu
    this.hrService.getHeaderText(this.ePassportFuncID).then((res) => {
      let passportHeaderText = res;
      this.passportColumnGrid = [
        {
          headerText:
            passportHeaderText['PassportNo'] +
            ' | ' +
            passportHeaderText['IssuedPlace'],
          template: this.passportCol1,
          width: '150',
        },
        {
          headerText:
            passportHeaderText['IssuedDate'] +
            ' | ' +
            passportHeaderText['ExpiredDate'],
          template: this.passportCol2,
          width: '150',
        },
      ];
    });

    let insPassport = setInterval(() => {
      if (this.passportGridview) {
        clearInterval(insPassport);
        let t = this;
        this.passportGridview.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.passportRowCount = res['data'].length;
            }
          }
        });
        this.passportRowCount = this.passportGridview.dataService.rowCount;
      }
    }, 100);

    //#endregion

    //#region get columnGrid EWorkPermit - Giấy phép lao động
    this.hrService.getHeaderText(this.eWorkPermitFuncID).then((res) => {
      let workHeaderText = res;
      this.workPermitColumnGrid = [
        {
          headerText:
            workHeaderText['WorkPermitNo'] +
            ' | ' +
            workHeaderText['IssuedPlace'],
          template: this.workPermitCol1,
          width: '150',
        },
        {
          headerText:
            workHeaderText['IssuedDate'] + ' | ' + workHeaderText['ToDate'],
          template: this.workPermitCol2,
          width: '150',
        },
      ];
    });

    let insWorkPermit = setInterval(() => {
      if (this.passportGridview) {
        clearInterval(insWorkPermit);
        let t = this;
        this.workPermitGridview?.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.workPermitRowCount = res['data'].length;
            }
          }
        });
        this.workPermitRowCount = this.workPermitGridview.dataService.rowCount;
      }
    }, 100);

    //#endregion
    //#region get columnGrid EBasicSalary - Lương cơ bản
    this.hrService.getHeaderText(this.eBasicSalaryFuncID).then((res) => {
      let basicSalaryHeaderText = res;
      this.basicSalaryColumnGrid = [
        {
          headerText: basicSalaryHeaderText['BSalary'],
          template: this.basicSalaryCol1,
          width: '150',
        },
        {
          headerText: basicSalaryHeaderText['SISalary'],
          template: this.basicSalaryCol2,
          width: '150',
        },
        {
          headerText:
            basicSalaryHeaderText['EffectedDate'] +
            ' | ' +
            basicSalaryHeaderText['ExpiredDate'],
          template: this.basicSalaryCol3,
          width: '150',
        },
        {
          headerText:
            basicSalaryHeaderText['DecisionNo'] +
            ' | ' +
            basicSalaryHeaderText['SignedDate'],
          template: this.basicSalaryCol4,
          width: '150',
        },
      ];
    });
    let insBSalary = setInterval(() => {
      if (this.basicSalaryGridview) {
        clearInterval(insBSalary);
        let t = this;
        this.basicSalaryGridview.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.eBasicSalaryRowCount = res['data'].length;
            }
          }
        });
        this.eBasicSalaryRowCount =
          this.basicSalaryGridview.dataService.rowCount;
      }
    }, 100);

    //#endregion

    //#region get columnGrid ETrainCourse - Đào Tạo

    this.hrService.getHeaderText(this.trainCourseFuncID).then((res) => {
      this.trainCourseHeaderText = res;
      this.trainCourseColumnGrid = [
        {
          headerText:
            this.trainCourseHeaderText['TrainCourseID'] +
            '|' +
            this.trainCourseHeaderText['TrainForm'],
          template: this.templateTrainCourseGridCol1,
          width: '150',
        },
        {
          headerText:
            this.trainCourseHeaderText['TrainFrom'] +
            '|' +
            this.trainCourseHeaderText['InYear'],
          template: this.templateTrainCourseGridCol2,
          width: '150',
        },
        {
          headerText:
            this.trainCourseHeaderText['TrainSupplierID'] +
            '|' +
            this.trainCourseHeaderText['Result'],
          template: this.templateTrainCourseGridCol3,
          width: '150',
        },
      ];
    });

    let insTrain = setInterval(() => {
      if (this.trainCourseGrid) {
        clearInterval(insTrain);
        let t = this;
        this.trainCourseGrid.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.trainCourseRowCount = res['data'].length;
            }
          }
        });
        this.trainCourseRowCount = this.trainCourseGrid.dataService.rowCount;
      }
    }, 100);

    //#endregion

    //#region get columnGrid EAppointion - Bổ nhiệm điều chuyển
    this.hrService.getHeaderText(this.appointionFuncID).then((res) => {
      console.log('headerText bo nhiem dieu chuyen', res);

      this.appointionHeaderTexts = res;
      this.appointionColumnGrid = [
        {
          headerText:
            this.appointionHeaderTexts['Appoint'] ?? '' + '| Hiệu lực',
          template: this.templateAppointionGridCol1,
          width: '150',
        },
        {
          headerText: this.appointionHeaderTexts['PositionID'],
          template: this.templateAppointionGridCol2,
          width: '150',
        },
        {
          headerText: this.appointionHeaderTexts['OrgUnitID'] + '/ Phòng ban',
          template: this.templateAppointionGridCol3,
          width: '150',
        },
      ];
    });

    let ins = setInterval(() => {
      if (this.appointionGridView) {
        clearInterval(ins);
        let t = this;
        this.appointionGridView.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type != null && res.type == 'loaded') {
              t.appointionRowCount = res['data'].length;
            }
          }
        });
        this.appointionRowCount = this.appointionGridView.dataService.rowCount;
      }
    }, 100);
    //#endregion

    this.routeActive.queryParams.subscribe((params) => {
      if (params.employeeID || this.user.userID) {
        this.employeeID = params.employeeID;
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
        let empRequest = new DataRequest();
        empRequest.entityName = 'HR_Employees';
        empRequest.dataValues = params.employeeID;
        empRequest.predicates = 'EmployeeID=@0';
        empRequest.pageLoading = false;
        this.hrService.loadData('HR', empRequest).subscribe((emp) => {
          if (emp) {
            this.infoPersonal = emp;
          }
        });
        // this.hrService.getEmployeeInfo(params.employeeID).subscribe((emp) => {
        //   if (emp) {
        //     this.data = emp;
        //     this.infoPersonal = emp;
        //     console.log('data', this.data);
        //   }
        // });

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
                    // this.data = emp;
                    this.infoPersonal = emp;
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
              op.page = 1;
              (op.page = 1),
                this.hrService
                  .GetExperienceListByEmployeeIDAsync(op)
                  .subscribe((res) => {
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
        op.page = 1;
        this.hrService
          .GetExperienceListByEmployeeIDAsync(op)
          .subscribe((res) => {
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

  clickMF(event: any, data: any, funcID = null) {
    console.log('data ', data);
    console.log('evt more func', event.text);

    switch (event.functionID) {
      case 'SYS03': //edit
        if (funcID == 'passport') {
          this.handleEmployeePassportInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'workpermit') {
          this.handleEmployeeWorkingPermitInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'visa') {
          this.handleEmployeeVisaInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'family') {
          this.handleEFamilyInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'jobSalary') {
          this.HandleEmployeeJobSalariesInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eexperiences') {
          this.handlEmployeeExperiences(event.text, 'edit', data);
        } else if (funcID == 'evaccines') {
          this.HandleEVaccinesInfo(event.text, 'edit', data);
        } else if (funcID == 'basicSalary') {
          this.HandleEmployeeBasicSalariesInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'Assets') {
          this.HandlemployeeAssetInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eDegrees') {
          this.HandleEmployeeDegreeInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.HandleEmployeeCertificateInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eAppointions') {
          this.HandleEmployeeAppointionInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eExperiences') {
          this.handlEmployeeExperiences(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'Diseases') {
          this.HandleEmployeeDiseaseInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eBenefit') {
          this.handlEmployeeBenefit(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eSkill') {
          this.HandleEmployeeSkillsInfo(event.text, 'edit', data);
        } else if (funcID == 'eTrainCourses') {
          this.HandleEmployeeTrainCourseInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eHealth') {
          this.HandleEmployeeEHealths(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eVaccine') {
          this.HandleEVaccinesInfo(event.text, 'edit', data);
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
                    this.updateGridView(this.passportGridview, 'delete', data);
                    // let i = this.lstPassport.indexOf(data);
                    // if (i != -1) {
                    //   this.lstPassport.splice(i, 1);
                    // }
                    // this.df.detectChanges();
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
                    // let i = this.lstWorkPermit.indexOf(data);
                    // if (i != -1) {
                    //   this.lstWorkPermit.splice(i, 1);
                    // }
                    this.updateGridView(this.passportGridview, 'delete', data);
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
                    // let i = this.lstVisa.indexOf(data);
                    // if (i != -1) {
                    //   this.lstVisa.splice(i, 1);
                    //   console.log('delete visa', this.lstVisa);
                    // }
                    this.updateGridView(this.visaGridview, 'delete', data);
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
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    (this.eAssetGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.eAssetRowCount = this.eAssetRowCount - 1;
                    // let i = this.lstAsset.indexOf(data);
                    // if (i != -1) {
                    //   this.lstAsset.splice(i, 1);
                    // }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eHealth') {
              this.hrService.deleteEHealth(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  (this.eHealthsGrid.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
                  this.eHealthRowCount = this.eHealthRowCount - 1;
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eBenefit') {
              this.hrService.DeleteEBenefit(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  (this.grid.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
                  this.eBenefitRowCount = this.eBenefitRowCount - 1;
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eVaccine') {
              this.hrService.deleteEVaccine(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  (this.eVaccinesGrid.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
                  this.eVaccineRowCount = this.eVaccineRowCount - 1;
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
                    // let i = this.lstEDegrees.indexOf(data);
                    // if (i != -1) {
                    //   this.lstEDegrees.splice(i, 1);
                    // }
                    (this.degreeGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eSkill') {
              this.hrService.deleteESkill1(data).subscribe((p) => {
                if (p[0] == true) {
                  this.notify.notifyCode('SYS008');

                  (this.skillGrid?.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
                  this.skillRowCount--;
                  this.lstESkill = p[1];
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eCertificate') {
              this.hrService
                .DeleteEmployeeCertificateInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    // let i = this.lstCertificates.indexOf(data);
                    // if (i != -1) {
                    //   this.lstCertificates.splice(i, 1);
                    // }
                    this.certificateRowCount--;
                    (this.certificateGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                  this.df.detectChanges();
                });
            } else if (funcID == 'eAppointions') {
              this.hrService
                .DeleteEmployeeAppointionsInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    let i = this.lstAppointions.indexOf(data);
                    if (i != -1) {
                      this.lstAppointions.splice(i, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eExperiences') {
              this.hrService
                .DeleteEmployeeExperienceInfo(data)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    (this.eExperienceGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.eExperienceRowCount = this.eExperienceRowCount - 1;
                    this.df.detectChanges();
                    // let i = this.lstExperience.indexOf(data);
                    // if (i != -1) {
                    //   this.lstExperience.splice(i, 1);
                    // }
                    // this.df.detectChanges();
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
            } else if (funcID == 'eTrainCourses') {
              this.hrService
                .deleteEmployeeTrainCourseInfo(data.recID)
                .subscribe((p) => {
                  if ((p = !null)) {
                    this.notify.notifyCode('SYS008');
                    // let i = this.lstEdiseases.indexOf(data);
                    // if (i != -1) {
                    //   this.lstEdiseases.splice(i, 1);
                    // }
                    (this.trainCourseGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.trainCourseRowCount--;
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
          this.handleEmployeePassportInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'workpermit') {
          this.handleEmployeeWorkingPermitInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'visa') {
          this.handleEmployeeVisaInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'family') {
          this.handleEFamilyInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'jobSalary') {
          this.HandleEmployeeJobSalariesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'basicSalary') {
          this.HandleEmployeeBasicSalariesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'Assets') {
          this.copyValue(event.text, data, 'Assets');
          // this.HandlemployeeAssetInfo('copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eDegrees') {
          this.HandleEmployeeDegreeInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.HandleEmployeeCertificateInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eAppointions') {
          this.HandleEmployeeAppointionInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eExperiences') {
          this.copyValue(event.text, data, 'eExperiences');
          this.df.detectChanges();
        } else if (funcID == 'eHealth') {
          this.copyValue(event.text, data, 'eHealth');
          this.df.detectChanges();
        } else if (funcID == 'eVaccine') {
          this.copyValue(event.text, data, 'eVaccine');
          this.df.detectChanges();
        } else if (funcID == 'Diseases') {
          this.HandleEmployeeDiseaseInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eSkill') {
          this.HandleEmployeeSkillsInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eTrainCourses') {
          this.copyValue(event.text, data, 'eTrainCourses');
          this.df.detectChanges();
        } else if (funcID == 'eBenefit') {
          this.copyValue(event.text, data, 'benefit');
          this.df.detectChanges();
        }
        break;
    }
  }

  // clickMFVaccine(event: any, data: any, vaccineGroup: any) {
  //   switch (event.functionID) {
  //     case 'SYS03': //edit
  //       this.HandleEVaccinesInfo('edit', data);
  //       break;
  //     case 'SYS02': //delete
  //       this.notifySvr.alertCode('SYS030').subscribe((x) => {
  //         if (x.event?.status == 'Y') {
  //           this.deleteEVaccine(data, vaccineGroup);
  //         }
  //       });
  //       break;
  //     case 'SYS04': //copy
  //       break;
  //   }
  // }

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
  }

  editEmployeePartyInfo(actionHeaderText) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEmployeePartyInfoComponent,
      {
        funcID: 'HRTEM0102',
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0102'),
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

  editAssuranceTaxBankAccountInfo(actionHeaderText) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAssurTaxBankaccInfoComponent,
      PopupEAssurTaxBankComponent,
      {
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0201'),
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

  editEmployeeSelfInfo(actionHeaderText) {
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
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0101'),
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
    // })
  }

  HandleEmployeeJobGeneralInfo(actionHeaderText, actionType: string) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogEdit = this.callfunc.openSide(
      PopupJobGeneralInfoComponent,
      {
        funcID: this.jobGeneralFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.jobGeneralFuncID),
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else {
        this.infoPersonal = res.event;
        this.df.detectChanges();
      }
    });
  }

  editEmployeeTimeCardInfo(actionHeaderText) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogEdit = this.callfunc.openSide(
      PopupETimeCardComponent,
      {
        funcID: this.eTimeCardFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eTimeCardFuncID),
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else {
        this.infoPersonal = res.event;
        this.df.detectChanges();
      }
    });
  }

  editEmployeeCaculateSalaryInfo(actionHeaderText) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogEdit = this.callfc.openSide(
      PopupECalculateSalaryComponent,
      {
        funcID: this.eCalSalaryFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eCalSalaryFuncID),
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else {
        this.infoPersonal = res.event;
        this.df.detectChanges();
      }
    });
  }

  DeleteEmployeeEHealths(recID: string) {
    console.log('rec ID', recID);
    this.hrService.deleteEHealth(recID).subscribe((p) => {
      if (p != null) {
        this.notify.notifyCode('SYS007');
      } else this.notify.notifyCode('DM034');
    });
    console.log('delete xong');
  }

  handlEmployeeBenefit(actionHeaderText, actionType: string, data: any) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEbenefitComponent,
      {
        employeeId: this.employeeID,
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.benefitFuncID),
        funcID: this.benefitFuncID,
        benefitObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          (this.grid?.dataService as CRUDService)?.add(res.event).subscribe();
          this.eBenefitRowCount += 1;
        } else if (actionType == 'edit') {
          (this.grid?.dataService as CRUDService)
            ?.update(res.event)
            .subscribe();
        }
      }
    });
  }

  handlEmployeeExperiences(actionHeaderText, actionType: string, data: any) {
    this.eExperienceGrid.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    option.FormModel = this.eExperienceGrid.formModel;
    option.Width = '550px';

    let dialogAdd = this.callfunc.openSide(
      PopupEexperiencesComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eExperienceFuncID),
        funcID: this.eExperienceFuncID,
        eExperienceObj: data,
        employeeId: this.employeeID,
        //indexSelected: this.lstExperience.indexOf(data),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          this.eExperienceRowCount += 1;
          (this.eExperienceGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.eExperienceGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeJobSalariesInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEJobSalariesComponent,
      {
        actionType: actionType,
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0402'),
        employeeId: this.employeeID,
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

  HandleEmployeeBasicSalariesInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.FormModel = this.eBasicSalaryFormmodel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEBasicSalariesComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eBasicSalaryFuncID),
        funcID: this.eBasicSalaryFuncID,
        employeeId: this.employeeID,
        salaryObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      // if (res?.event) {
      //   // this.hrService
      //   //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
      //   //   .subscribe((p) => {
      //   //     this.crrJobSalaries = p;
      //   //   });
      //   console.log('current val', res.event);
      //   this.crrEBSalary = res.event;
      //   this.df.detectChanges();
      // }
      if (!res?.event && this.basicSalaryGridview)
        (this.basicSalaryGridview.dataService as CRUDService).clear();
      this.df.detectChanges();
    });
  }

  handleEFamilyInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    option.FormModel = this.eFamilyFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEFamiliesComponent,
      {
        actionType: actionType,
        employeeId: this.employeeID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eFamiliesFuncID),
        funcID: this.eFamiliesFuncID,
        familyMemberObj: data,
        // lstFamilyMembers: this.lstFamily,
        // indexSelected: this.lstFamily.indexOf(data),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else {
        if (actionType == 'add' || actionType == 'copy') {
          this.lstFamily.push(res?.event);
        } else {
          let index = this.lstFamily.indexOf(data);
          this.lstFamily[index] = res?.event;
        }
      }
      this.df.detectChanges();
    });
  }

  handleEmployeePassportInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.passportColumnGrid.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEPassportsComponent,
      {
        actionType: actionType,
        funcID: this.ePassportFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.ePassportFuncID),
        employeeId: this.employeeID,
        passportObj: data,
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

      if (!res?.event)
        (this.passportGridview.dataService as CRUDService).clear();
      else {
        this.updateGridView(this.passportGridview, actionType, res?.event);
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeDayOffInfo(actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.dayoffGrid.dataService;
    option.FormModel = this.dayoffGrid.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEdayoffsComponent,
      {
        actionType: actionType,
        dayoffObj: data,
        headerText: 'Nghỉ phép',
        employeeId: this.employeeID,
        funcID: this.dayoffFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          (this.dayoffGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
          this.dayoffRowCount += 1;
        } else if (actionType == 'edit') {
          (this.dayoffGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
    });
  }

  handleEmployeeWorkingPermitInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService = this.workPermitGridview.dataService;
    option.FormModel = this.workPermitGridview.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEWorkPermitsComponent,
      {
        actionType: actionType,
        // indexSelected: this.lstWorkPermit.indexOf(data),
        // lstWorkPermit: this.lstWorkPermit,
        // selectedWorkPermit: data,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eWorkPermitFuncID),
        employeeId: this.employeeID,
        funcID: this.eWorkPermitFuncID,
        workPermitObj: data,
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
      if (!res?.event)
        (this.workPermitGridview.dataService as CRUDService).clear();
      else this.updateGridView(this.workPermitGridview, actionType, data);
      this.df.detectChanges();
    });
  }

  handleEmployeeVisaInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.visaGridview.dataService;
    option.FormModel = this.visaGridview.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEVisasComponent,
      {
        actionType: actionType,
        // indexSelected: this.lstVisa.indexOf(data),
        // lstVisas: this.lstVisa,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eVisaFuncID),
        employeeId: this.employeeID,
        funcID: this.eVisaFuncID,
        visaObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event != null) {
        // this.lstVisa = res?.event;
        console.log('sau khi dong form', this.lstVisa);
        if (!res?.event) (this.visaGridview.dataService as CRUDService).clear();
        else this.updateGridView(this.visaGridview, actionType, res.event);
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

  valueChangeFilterSkill(e) {
    console.log('eeeeeee', e);
  }

  addEmployeeDisciplinesInfo(actionHeaderText, actionType: string, data: any) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeDisciplinesDetailComponent,
      PopupEDisciplinesComponent,
      {
        actionType: actionType,
        indexSelected: this.lstDiscipline.indexOf(data),
        lstDiscipline: this.lstDiscipline,
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0702'),
        employeeId: this.employeeID,
        funcID: 'HRTEM0702',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  addEmployeeAwardsInfo(actionHeaderText, actionType: string, data: any) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAwardsDetailComponent,
      PopupEAwardsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstAwards.indexOf(data),
        lstAwards: this.lstAwards,
        employeeId: this.employeeID,
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0701'),
        funcID: 'HRTEM0701',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandleEmployeeAccidentInfo(actionHeaderText, actionType: string, data: any) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;

    option.Width = '800px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAllocatedPropertyDetailComponent,
      PopupEaccidentsComponent,
      {
        actionType: actionType,
        indexSelected: this.lstAccident.indexOf(data),
        lstAccident: this.lstAccident,
        employeeId: this.employeeID,
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0804'),
        funcID: 'HRTEM0804',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      this.df.detectChanges();
    });
  }

  HandlemployeeAssetInfo(actionHeaderText, actionType: string, data: any) {
    this.eAssetGrid.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.FormModel = this.eAssetGrid.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      // EmployeeAllocatedPropertyDetailComponent,
      PopupEAssetsComponent,
      {
        actionType: actionType,
        assetObj: data,
        ///indexSelected: this.lstAsset.indexOf(data),
        //lstAssets: this.lstAsset,
        employeeId: this.employeeID,
        funcID: this.eAssetFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eAssetFuncID),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          this.eAssetRowCount += 1;
          (this.eAssetGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.eAssetGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeAppointionInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    if (this.appointionGridView)
      this.appointionGridView.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.DataService = this.appointionGridView?.dataService;
    option.FormModel = this.appointionFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEappointionsComponent,
      {
        actionType: actionType,
        //indexSelected: this.lstAppointions.indexOf(data),
        employeeId: this.employeeID,
        //lstEAppointions: this.lstAppointions,
        funcID: this.appointionFuncID,
        appointionObj: data,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.appointionFuncID),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.appointionGridView?.dataService as CRUDService).clear();
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          this.appointionRowCount += 1;
          (this.appointionGridView?.dataService as CRUDService)
            .add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.appointionGridView?.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeCertificateInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService = this.certificateGrid.dataService;
    option.FormModel = this.certificateGrid.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      PopupECertificatesComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.certificateFuncID),
        employeeId: this.employeeID,
        funcID: this.certificateFuncID,
        dataInput: data, // get data
      },
      option
    );
    // RELOAD
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      console.log('res eventttttttttttttttttttttttt', res.event);
      if (res != null) {
        if (actionType === 'add' || actionType === 'copy') {
          (this.certificateGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
          this.certificateRowCount++;
        } else if (actionType === 'edit') {
          (this.certificateGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
        this.df.detectChanges();
      }
    });

    // this.view.dataService.dataSelected = this.data;
    // let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    // option.FormModel = this.view.formModel;
    // option.Width = '550px';
    // let dialogAdd = this.callfunc.openSide(
    //   PopupECertificatesComponent,
    //   {
    //     actionType: actionType,
    //     indexSelected: this.lstCertificates.indexOf(data),
    //     lstCertificates: this.lstCertificates,
    //     headerText: 'Chứng chỉ',
    //     funcID: 'HRT03020502',
    //     employeeId: this.data.employeeID,
    //   },
    //   option
    // );
    // dialogAdd.closed.subscribe((res) => {
    //   if (!res?.event) this.view.dataService.clear();
    //   this.df.detectChanges();
    // });
  }

  HandleEmployeeDegreeInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.degreeGrid?.dataService;
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDegreesComponent,
      {
        actionType: actionType,
        //indexSelected: this.lstEDegrees.indexOf(data),
        //lstEDegrees: this.lstEDegrees,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.degreeFuncID),
        employeeId: this.employeeID,
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
      } else if (actionType == 'edit') {
        (this.degreeGrid.dataService as CRUDService)
          .update(res.event)
          .subscribe();
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeSkillsInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.skillGrid?.dataService;
    option.FormModel = this.skillFormmodel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      PopupESkillsComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.skillFuncID),
        employeeId: this.employeeID,
        funcID: this.skillFuncID,
        dataInput: data,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (res?.event) {
        (this.skillGrid?.dataService as CRUDService).clear();
        if (actionType === 'add' || actionType === 'copy') {
          (this.skillGrid?.dataService as CRUDService)
            .add(res.event[0])
            .subscribe();
          this.skillRowCount++;
          this.lstESkill = res?.event[1];
        } else if (actionType === 'edit') {
          (this.skillGrid?.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
    });

    // this.view.dataService.dataSelected = this.data;
    // let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    // option.FormModel = this.view.formModel;
    // option.Width = '550px';
    // let dialogAdd = this.callfunc.openSide(
    //   PopupESkillsComponent,
    //   {
    //     lstESkill: this.lstESkill,
    //     indexSelected: this.lstESkill.indexOf(data),
    //     actionType: actionType,
    //     // isAdd: true,
    //     headerText: 'Kỹ năng',
    //     employeeId: this.data.employeeID,
    //     funcID: 'HRT03020503',
    //   },
    //   option
    // );
    // dialogAdd.closed.subscribe((res) => {
    //   if (!res?.event) this.view.dataService.clear();
    // });
  }

  HandleEmployeeTrainCourseInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService = this.trainCourseGrid?.dataService;
    option.FormModel = this.trainCourseFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupETraincourseComponent,
      {
        //isAdd: true,
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.trainCourseFuncID),
        employeeId: this.employeeID,
        // actionType: 'add',
        funcID: this.trainCourseFuncID,
        dataInput: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.trainCourseGrid?.dataService as CRUDService).clear();
      if (res && (actionType === 'add' || actionType === 'copy')) {
        (this.trainCourseGrid?.dataService as CRUDService)
          .add(res.event)
          .subscribe();
        this.trainCourseRowCount++;
      } else {
        (this.trainCourseGrid?.dataService as CRUDService)
          .update(res.event)
          .subscribe();
      }
      this.df.detectChanges();
    });
  }

  // collapse(id: any, isCollapse: string = '-1') {
  //   let numberID = Number(id);
  //   if (numberID) {
  //     if (numberID % 1 == 0) {
  //       for (let i = numberID + 0.1; i < numberID + 1; i = i + 0.1) {
  //         id = i.toFixed(1);
  //         if (this.objCollapes[id] != undefined) {
  //           if (isCollapse != '-1') {
  //             let value = isCollapse == '0' ? false : true;
  //             this.objCollapes[id] = value;
  //           } else {
  //             this.objCollapes[id] = !this.objCollapes[id];
  //           }
  //         }
  //       }
  //     } else {
  //       if (isCollapse != '-1') {
  //         let value = isCollapse == '0' ? false : true;
  //         this.objCollapes[id] = value;
  //       } else {
  //         this.objCollapes[id] = !this.objCollapes[id];
  //       }
  //     }
  //   }
  // }

  HandleBebefitInfo(actionType, s) {
    this.api
      .execSv('HR', 'ERM.Business.HR', 'EBenefitsBusiness', 'AddAsync', null)
      .subscribe((res) => {
        console.log(res);
      });
  }

  //#region HR_EHealths

  HandleEmployeeEHealths(actionHeaderText, actionType: string, data: any) {
    if (this.eHealthsGrid)
      this.eHealthsGrid.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.eHealthsGrid.formModel;
    let dialogAdd = this.callfunc.openSide(
      PopupEhealthsComponent,
      {
        actionType: actionType,
        healthObj: data,
        //indexSelected: this.lstEhealth.indexOf(data),
        //lstEhealth: this.lstEhealth,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eHealthFuncID),
        employeeId: this.employeeID,
        funcID: this.eHealthFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          this.eHealthRowCount += 1;
          (this.eHealthsGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.eHealthsGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
    });
  }
  //#endregion

  //#region HR_EVaccines

  HandleEVaccinesInfo(actionHeaderText, actionType: string, data: any) {
    this.eVaccinesGrid.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.eVaccinesGrid.formModel;
    let dialogAdd = this.callfunc.openSide(
      PopupEVaccineComponent,
      {
        actionType: actionType,
        data: data,
        headerText: this.getFormHeader(this.eVaccinesFuncID),
        employeeId: this.employeeID,
        funcID: this.eVaccinesFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          this.eVaccineRowCount += 1;
          (this.eVaccinesGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.eVaccinesGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
      }
      this.df.detectChanges();
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
  HandleEmployeeDiseaseInfo(actionHeaderText, actionType: string, data: any) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDiseasesComponent,
      {
        actionType: actionType,
        indexSelected: this.lstEdiseases.indexOf(data),
        lstEdiseases: this.lstEdiseases,
        funcID: 'HRTEM0803',
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0803'),
        employeeId: this.employeeID,
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
  addEContracts(actionHeaderText) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.FormModel = this.view.formModel
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEContractComponent,
      {
        actionType: 'add',
        salarySelected: null,
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0501'),
        employeeId: this.employeeID,
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
  HandleEBusinessTravel(actionHeaderText, actionType: string, data: any) {
    this.businessTravelGrid.dataService.dataSelected = this.infoPersonal;
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
        employeeId: this.employeeID,
        headerText:
          actionHeaderText +
          ' ' +
          this.getFormHeader(this.eBusinessTravelFuncID),
        funcID: this.eBusinessTravelFuncID,
        businessTravelObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add' || actionType == 'copy') {
          this.eBusinessTravelRowCount += 1;
          (this.businessTravelGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.businessTravelGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
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
        (p) => p.employeeID == this.employeeID
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
        (p) => p.employeeID == this.employeeID
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

  //#region Phụ cấp

  numPageSizeGridView = 5;
  @ViewChild('businessTravelGrid') businessTravelGrid: CodxGridviewComponent;
  @ViewChild('trainCourseGridView') trainCourseGrid: CodxGridviewComponent;
  @ViewChild('skillGridViewID') skillGrid: CodxGridviewComponent;
  @ViewChild('certificateGridView') certificateGrid: CodxGridviewComponent;
  @ViewChild('eExperienceGridView') eExperienceGrid: CodxGridviewComponent;
  @ViewChild('eAssetGridView') eAssetGrid: CodxGridviewComponent;
  @ViewChild('eHealthsGridView') eHealthsGrid: CodxGridviewComponent;
  @ViewChild('eVaccinesGridView') eVaccinesGrid: CodxGridviewComponent;
  @ViewChild('gridView') grid: CodxGridviewComponent;
  @ViewChild('degreeGridView') degreeGrid: CodxGridviewComponent;
  @ViewChild('dayoffGridView') dayoffGrid: CodxGridviewComponent;
  @ViewChild('templateBenefitID', { static: true })
  templateBenefitID: TemplateRef<any>;
  @ViewChild('templateBenefitAmt', { static: true })
  templateBenefitAmt: TemplateRef<any>;
  @ViewChild('templateBenefitEffected', { static: true })
  templateBenefitEffected: TemplateRef<any>;
  @ViewChild('filterTemplateBenefit', { static: true })
  filterTemplateBenefit: TemplateRef<any>;

  @ViewChild('templateDegreeGridCol1', { static: true })
  templateDegreeGridCol1: TemplateRef<any>;
  @ViewChild('templateDegreeGridCol2', { static: true })
  templateDegreeGridCol2: TemplateRef<any>;
  @ViewChild('templateDegreeGridCol3', { static: true })
  templateDegreeGridCol3: TemplateRef<any>;
  @ViewChild('templateDegreeGridMoreFunc', { static: true })
  templateDegreeGridMoreFunc: TemplateRef<any>;

  @ViewChild('tempCol1EHealthGrid', { static: true })
  tempCol1EHealthGrid: TemplateRef<any>;
  @ViewChild('tempCol2EHealthGrid', { static: true })
  tempCol2EHealthGrid: TemplateRef<any>;
  @ViewChild('tempCol3EHealthGrid', { static: true })
  tempCol3EHealthGrid: TemplateRef<any>;

  @ViewChild('tempEVaccineGridCol1', { static: true })
  tempEVaccineGridCol1: TemplateRef<any>;
  @ViewChild('tempEVaccineGridCol2', { static: true })
  tempEVaccineGridCol2: TemplateRef<any>;
  @ViewChild('tempEVaccineGridCol3', { static: true })
  tempEVaccineGridCol3: TemplateRef<any>;

  @ViewChild('templateCertificateGridCol1', { static: true })
  templateCertificateGridCol1: TemplateRef<any>;
  @ViewChild('templateCertificateGridCol2', { static: true })
  templateCertificateGridCol2: TemplateRef<any>;
  @ViewChild('templateCertificateGridCol3', { static: true })
  templateCertificateGridCol3: TemplateRef<any>;
  @ViewChild('templateCertificateGridMoreFunc', { static: true })
  templateCertificateGridMoreFunc: TemplateRef<any>;

  @ViewChild('templateSkillGridCol1', { static: true })
  templateSkillGridCol1: TemplateRef<any>;
  @ViewChild('templateSkillGridCol2', { static: true })
  templateSkillGridCol2: TemplateRef<any>;
  @ViewChild('templateSkillGridCol3', { static: true })
  templateSkillGridCol3: TemplateRef<any>;
  @ViewChild('templateSkillGridMoreFunc', { static: true })
  templateSkillGridMoreFunc: TemplateRef<any>;
  @ViewChild('templateEAssetCol1', { static: true })
  templateEAssetCol1: TemplateRef<any>;
  @ViewChild('templateEAssetCol2', { static: true })
  templateEAssetCol2: TemplateRef<any>;
  @ViewChild('templateEAssetCol3', { static: true })
  templateEAssetCol3: TemplateRef<any>;

  @ViewChild('templateEExperienceGridCol4', { static: true })
  templateEExperienceGridCol4: TemplateRef<any>;

  @ViewChild('templateTrainCourseGridCol1', { static: true })
  templateTrainCourseGridCol1: TemplateRef<any>;
  @ViewChild('templateTrainCourseGridCol2', { static: true })
  templateTrainCourseGridCol2: TemplateRef<any>;
  @ViewChild('templateTrainCourseGridCol3', { static: true })
  templateTrainCourseGridCol3: TemplateRef<any>;

  @ViewChild('templateBusinessTravelGridCol1', { static: true })
  templateBusinessTravelGridCol1: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol2', { static: true })
  templateBusinessTravelGridCol2: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol3', { static: true })
  templateBusinessTravelGridCol3: TemplateRef<any>;
  @ViewChild('templateBusinessTravelMoreFunc', { static: true })
  templateBusinessTravelMoreFunc: TemplateRef<any>;

  valueChangeFilterBenefit(evt) {
    console.log('filter theo type', evt);
    this.filterByBenefitIDArr = evt.data;
    // let predicates = '('
    // for(let i =0 ; i< this.filterByBenefitIDArr.length; i++){
    //   if(i>0){
    //     predicates +=' or '
    //   }
    //   predicates += `BenefitID==@${i}`
    // }
    // predicates += ') and ';

    // (this.grid.dataService as CRUDService).setPredicates(['BenefitID==@0'], ['1']).subscribe((item) => {
    //   console.log('item tra ve', item);
    // });
    this.UpdateEBenefitPredicate();
  }

  UpdateEBenefitPredicate() {
    this.filterEBenefitPredicates = '';
    if (
      this.filterByBenefitIDArr.length > 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = '(';
      let i = 0;
      for (i; i < this.filterByBenefitIDArr.length; i++) {
        if (i > 0) {
          this.filterEBenefitPredicates += ' or ';
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`;
      }
      this.filterEBenefitPredicates += ') ';
      this.filterEBenefitPredicates += `and (EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      //this.filterEBenefitDatavalues = this.filterByBenefitIDArr.concat([this.startDateEBenefitFilterValue, this.endDateEBenefitFilterValue]);

      (this.grid.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      (this.filterByBenefitIDArr.length > 0 &&
        this.startDateEBenefitFilterValue == undefined) ||
      this.startDateEBenefitFilterValue == null
    ) {
      let i = 0;
      for (i; i < this.filterByBenefitIDArr.length; i++) {
        if (i > 0) {
          this.filterEBenefitPredicates += ' or ';
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`;
      }

      (this.grid.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    } else if (this.startDateEBenefitFilterValue != null) {
      (this.grid.dataService as CRUDService)
        .setPredicates(
          [
            `EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    }
  }

  valueChangeYearFilterBenefit(evt) {
    console.log('chon year', evt);
    this.startDateEBenefitFilterValue = evt.fromDate.toJSON();
    this.endDateEBenefitFilterValue = evt.toDate.toJSON();
    this.UpdateEBenefitPredicate();

    // (this.grid.dataService as CRUDService).setPredicates(['EffectedDate>=@0 and EffectedDate<=@1'], [start, endDate]).subscribe((item) => {
    //   console.log('item tra ve', item);
    // });
  }

  valueChangeViewAllEBenefit(evt) {
    this.ViewAllEBenefitFlag = evt.data;
    let ins = setInterval(() => {
      if (this.grid) {
        clearInterval(ins);
        let t = this;
        this.grid.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.eBenefitRowCount = res['data'].length;
            }
          }
        });
        this.eBenefitRowCount = this.grid.dataService.rowCount;
      }
    }, 100);
  }

  valueChangeViewAllESkill(evt) {
    this.ViewAllEskillFlag = evt.data;
    let ins = setInterval(() => {
      if (this.grid) {
        clearInterval(ins);
        let t = this;
        this.grid.dataService.onAction.subscribe((res) => {
          if (res.type == 'loaded') {
            t.skillRowCount = res['data'].length;
          }
        });
        this.skillRowCount = this.grid.dataService.rowCount;
      }
    }, 100);
  }

  valueChangeViewAllEBasicSalary(evt) {
    this.ViewAllEBasicSalaryFlag = evt.data;
    let ins = setInterval(() => {
      if (this.basicSalaryGridview) {
        clearInterval(ins);
        let t = this;
        this.basicSalaryGridview.dataService.onAction.subscribe((res) => {
          if (res?.type == 'loaded') {
            t.eBasicSalaryRowCount = res['data'].length;
          }
        });
        this.eBasicSalaryRowCount =
          this.basicSalaryGridview.dataService.rowCount;
      }
    }, 100);
  }

  copyValue(actionHeaderText, data, flag) {
    if (flag == 'benefit') {
      this.grid.dataService.dataSelected = data;
      (this.grid.dataService as CRUDService).copy().subscribe((res: any) => {
        this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
      });
    } else if (flag == 'eAppointions') {
      this.appointionGridView.dataService.dataSelected = data;
      (this.appointionGridView.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandleEmployeeAppointionInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eExperiences') {
      this.eExperienceGrid.dataService.dataSelected = data;
      (this.eExperienceGrid.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.handlEmployeeExperiences(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'Assets') {
      this.eAssetGrid.dataService.dataSelected = data;
      (this.eAssetGrid.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandlemployeeAssetInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eTrainCourses') {
      this.trainCourseGrid.dataService.dataSelected = data;
      (this.trainCourseGrid.dataService as CRUDService)
        .copy()
        .subscribe((res) => {
          this.HandleEmployeeTrainCourseInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eVaccine') {
      this.eVaccinesGrid.dataService.dataSelected = data;
      (this.eVaccinesGrid.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandleEVaccinesInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eHealth') {
      this.eHealthsGrid.dataService.dataSelected = data;
      (this.eHealthsGrid.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandleEmployeeEHealths(actionHeaderText, 'copy', res);
        });
    }
  }
  //#endregion

  addTest() {
    this.hrService.addTest().subscribe();
  }

  getFormHeader(functionID: string) {
    let funcObj = this.lstFuncID.filter((x) => x.functionID == functionID);
    let headerText = '';
    if (funcObj && funcObj.length > 0) {
      headerText = funcObj[0].description;
    }
    return headerText;
  }

  updateGridView(
    gridView: CodxGridviewComponent,
    actionType: string,
    dataItem: any
  ) {
    if (!dataItem) (gridView.dataService as CRUDService).clear();
    else {
      if (actionType == 'add') {
        (gridView.dataService as CRUDService).add(dataItem, 0).subscribe();
        gridView.rowCount = gridView.rowCount + 1;
      } else if (actionType == 'edit') {
        (gridView.dataService as CRUDService).update(dataItem).subscribe();
      } else if ((actionType = 'delete')) {
        (gridView.dataService as CRUDService).remove(dataItem).subscribe();
        gridView.rowCount = gridView.rowCount - 1;
      }
    }
  }
  valueChangeFilterAssetCategory(evt) {
    console.log('filter theo type', evt);
    this.filterByAssetCatIDArr = evt.data;
    this.UpdateEAssetPredicate();
  }

  UpdateEAssetPredicate() {
    this.filterEAssetPredicates = '';
    if (
      this.filterByAssetCatIDArr.length > 0 &&
      this.startDateEAssetFilterValue != null
    ) {
      this.filterEAssetPredicates = '(';
      let i = 0;
      for (i; i < this.filterByAssetCatIDArr.length; i++) {
        if (i > 0) {
          this.filterEAssetPredicates += ' or ';
        }
        this.filterEAssetPredicates += `AssetCategory==@${i}`;
      }
      this.filterEAssetPredicates += ') ';
      this.filterEAssetPredicates += `and (IssuedDate>="${this.startDateEAssetFilterValue}" and IssuedDate<="${this.endDateEAssetFilterValue}")`;

      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEAssetPredicates],
          [this.filterByAssetCatIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      (this.filterByAssetCatIDArr.length > 0 &&
        this.startDateEAssetFilterValue == undefined) ||
      this.startDateEAssetFilterValue == null
    ) {
      let i = 0;
      for (i; i < this.filterByAssetCatIDArr.length; i++) {
        if (i > 0) {
          this.filterEAssetPredicates += ' or ';
        }
        this.filterEAssetPredicates += `AssetCategory==@${i}`;
      }

      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEAssetPredicates],
          [this.filterByAssetCatIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    } else if (this.startDateEAssetFilterValue != null) {
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(
          [
            `IssuedDate>="${this.startDateEAssetFilterValue}" and IssuedDate<="${this.endDateEAssetFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    }
  }

  valueChangeYearFilterEAsset(evt) {
    console.log('chon year', evt);
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateEAssetFilterValue = null;
      this.endDateEAssetFilterValue = null;
    } else {
      this.startDateEAssetFilterValue = evt.fromDate.toJSON();
      this.endDateEAssetFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEAssetPredicate();
  }

  UpdateEVaccinePredicate() {
    this.filterEVaccinePredicates = '';
    if (
      this.filterByVaccineTypeIDArr.length > 0 &&
      this.startDateEVaccineFilterValue != null
    ) {
      this.filterEVaccinePredicates = '(';
      let i = 0;
      for (i; i < this.filterByVaccineTypeIDArr.length; i++) {
        if (i > 0) {
          this.filterEVaccinePredicates += ' or ';
        }
        this.filterEVaccinePredicates += `VaccineTypeID==@${i}`;
      }
      this.filterEVaccinePredicates += ') ';
      this.filterEVaccinePredicates += `and (InjectDate>="${this.startDateEVaccineFilterValue}" and InjectDate<="${this.endDateEVaccineFilterValue}")`;

      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEVaccinePredicates],
          [this.filterByVaccineTypeIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      (this.filterByVaccineTypeIDArr.length > 0 &&
        this.startDateEVaccineFilterValue == undefined) ||
      this.startDateEVaccineFilterValue == null
    ) {
      let i = 0;
      for (i; i < this.filterByVaccineTypeIDArr.length; i++) {
        if (i > 0) {
          this.filterEVaccinePredicates += ' or ';
        }
        this.filterEVaccinePredicates += `VaccineTypeID==@${i}`;
      }

      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEVaccinePredicates],
          [this.filterByVaccineTypeIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    } else if (this.startDateEVaccineFilterValue != null) {
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates(
          [
            `InjectDate>="${this.startDateEVaccineFilterValue}" and InjectDate<="${this.endDateEVaccineFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    }
  }

  UpdateESkillPredicate() {
    this.filterESkillPredicates = '';
    if (
      this.filterBySkillIDArr.length > 0 &&
      this.startDateESkillFilterValue != null
    ) {
      this.filterESkillPredicates = '(';
      let i = 0;
      for (i; i < this.filterBySkillIDArr.length; i++) {
        if (i > 0) {
          this.filterESkillPredicates += ' or ';
        }
        this.filterESkillPredicates += `SkillID==@${i}`;
      }
      this.filterESkillPredicates += ') ';
      (this.skillGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterESkillPredicates],
          [this.filterBySkillIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      (this.filterBySkillIDArr.length > 0 &&
        this.startDateESkillFilterValue == undefined) ||
      this.startDateESkillFilterValue == null
    ) {
      let i = 0;
      for (i; i < this.filterBySkillIDArr.length; i++) {
        if (i > 0) {
          this.filterESkillPredicates += ' or ';
        }
        this.filterESkillPredicates += `SkillID==@${i}`;
      }

      (this.skillGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterESkillPredicates],
          [this.filterBySkillIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    }
  }

  UpdateTrainCoursePredicate() {
    this.filterTrainCoursePredicates = '';
    if (
      this.filterByTrainCourseIDArr.length > 0 &&
      this.startDateTrainCourseFilterValue != null
    ) {
      this.filterTrainCoursePredicates = '(';
      let i = 0;
      for (i; i < this.filterByTrainCourseIDArr.length; i++) {
        if (i > 0) {
          this.filterTrainCoursePredicates += ' or ';
        }
        this.filterTrainCoursePredicates += `TrainForm==@${i}`;
      }
      this.filterTrainCoursePredicates += ') ';
      this.filterTrainCoursePredicates += `and (TrainFrom>="${this.startDateTrainCourseFilterValue}" and TrainFrom<="${this.endDateTrainCourseFilterValue}")`;
      (this.trainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterTrainCoursePredicates],
          [this.filterByTrainCourseIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      (this.filterByTrainCourseIDArr.length > 0 &&
        this.startDateTrainCourseFilterValue == undefined) ||
      this.startDateTrainCourseFilterValue == null
    ) {
      let i = 0;
      for (i; i < this.filterByTrainCourseIDArr.length; i++) {
        if (i > 0) {
          this.filterTrainCoursePredicates += ' or ';
        }
        this.filterTrainCoursePredicates += `TrainForm==@${i}`;
      }

      (this.trainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterTrainCoursePredicates],
          [this.filterByTrainCourseIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    } else if (this.startDateTrainCourseFilterValue != null) {
      (this.trainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [
            `TrainFrom>="${this.startDateTrainCourseFilterValue}" and TrainFrom<="${this.endDateTrainCourseFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    }
  }
  // UpdateInYearPredicate() {
  //   this.filterInYearPredicates = '';
  //   if (
  //     this.filterByInYearIDArr.length > 0 &&
  //     this.startDateInYearFilterValue != null
  //   ) {
  //     this.filterInYearPredicates = '(';
  //     let i = 0;
  //     for (i; i < this.filterByInYearIDArr.length; i++) {
  //       if (i > 0) {
  //         this.filterInYearPredicates += ' or ';
  //       }
  //       this.filterInYearPredicates += `TrainForm==@${i}`;
  //     }
  //     this.filterInYearPredicates += ') ';
  //     //this.filterTrainFormPredicates += `and (InjectDate>="${this.startDateTrainFormFilterValue}" and InjectDate<="${this.endDateTrainFormFilterValue}")`;

  //     (this.trainCourseGrid.dataService as CRUDService)
  //       .setPredicates(
  //         [this.filterInYearPredicates],
  //         [this.filterByInYearIDArr.join(';')]
  //       )
  //       .subscribe((item) => {
  //         console.log('item tra ve sau khi loc 1', item);
  //       });
  //   } else if (
  //     (this.filterByInYearIDArr.length > 0 &&
  //       this.startDateInYearFilterValue == undefined) ||
  //     this.startDateInYearFilterValue == null
  //   ) {
  //     let i = 0;
  //     for (i; i < this.filterByInYearIDArr.length; i++) {
  //       if (i > 0) {
  //         this.filterInYearPredicates += ' or ';
  //       }
  //       this.filterInYearPredicates += `TrainForm==@${i}`;
  //     }

  //     (this.trainCourseGrid.dataService as CRUDService)
  //       .setPredicates(
  //         [this.filterInYearPredicates],
  //         [this.filterByInYearIDArr.join(';')]
  //       )
  //       .subscribe((item) => {
  //         console.log('item tra ve sau khi loc 2', item);
  //       });
  //   } else if (this.startDateInYearFilterValue != null) {
  //     (this.trainCourseGrid.dataService as CRUDService)
  //       .setPredicates(
  //         [
  //           `InjectDate>="${this.startDateInYearFilterValue}" and InjectDate<="${this.endDateInYearFilterValue}"`,
  //         ],
  //         []
  //       )
  //       .subscribe((item) => {
  //         console.log('item tra ve sau khi loc 3', item);
  //       });
  //   }
  // }

  // valueChangeFilterInYear(evt) {
  //   this.filterByInYearIDArr = evt.data;
  //   this.UpdateInYearPredicate();
  // }

  valueChangeFilterTrainCourse(evt) {
    this.filterByTrainCourseIDArr = evt.data;
    this.UpdateTrainCoursePredicate();
  }
  valueChangeFilterSkillID(evt) {
    this.filterBySkillIDArr = evt.data;
    this.UpdateESkillPredicate();
  }

  valueChangeFilterVaccineTypeID(evt) {
    this.filterByVaccineTypeIDArr = evt.data;
    this.UpdateEVaccinePredicate();
  }

  valueChangeYearFilterEVaccine(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateEVaccineFilterValue = null;
      this.endDateEVaccineFilterValue = null;
    } else {
      this.startDateEVaccineFilterValue = evt.fromDate.toJSON();
      this.endDateEVaccineFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEVaccinePredicate();
  }
  valueChangeYearFilterETrainCourse(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateTrainCourseFilterValue = null;
      this.endDateTrainCourseFilterValue = null;
    } else {
      this.startDateTrainCourseFilterValue = evt.fromDate.toJSON();
      this.endDateTrainCourseFilterValue = evt.toDate.toJSON();
    }
    this.UpdateTrainCoursePredicate();
  }

  UpdateBusinessTravelPredicate() {
    this.filterBusinessTravelPredicates = '';
    if (this.startDateBusinessTravelFilterValue == null) {
      (this.businessTravelGrid.dataService as CRUDService)
        .setPredicates([`EmployeeID=@0`], [this.employeeID])
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    } else {
      (this.businessTravelGrid.dataService as CRUDService)
        .setPredicates(
          [
            `BeginDate>="${this.startDateBusinessTravelFilterValue}" and EndDate<="${this.endDateBusinessTravelFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    }
  }

  valueChangeYearFilterBusinessTravel(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateBusinessTravelFilterValue = null;
      this.endDateBusinessTravelFilterValue = null;
    } else {
      this.startDateBusinessTravelFilterValue = evt.fromDate.toJSON();
      this.endDateBusinessTravelFilterValue = evt.toDate.toJSON();
    }
    this.UpdateBusinessTravelPredicate();
  }

  UpdateEDayOffsPredicate() {
    this.filterEDayoffPredicates = '';
    if (
      this.filterByKowIDArr.length > 0 &&
      this.startDateEDayoffFilterValue != null
    ) {
      this.filterEDayoffPredicates = '(';
      let i = 0;
      for (i; i < this.filterByKowIDArr.length; i++) {
        if (i > 0) {
          this.filterEDayoffPredicates += ' or ';
        }
        this.filterEDayoffPredicates += `KowID==@${i}`;
      }
      this.filterEDayoffPredicates += ') ';
      this.filterEDayoffPredicates += `and (BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}")`;
      //this.filterEBenefitDatavalues = this.filterByKowIDArr.concat([this.startDateEBenefitFilterValue, this.endDateEBenefitFilterValue]);

      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEDayoffPredicates],
          [this.filterByKowIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      this.filterByKowIDArr.length > 0 &&
      (this.startDateEDayoffFilterValue == undefined ||
        this.startDateEDayoffFilterValue == null)
    ) {
      let i = 0;
      for (i; i < this.filterByKowIDArr.length; i++) {
        if (i > 0) {
          this.filterEDayoffPredicates += ' or ';
        }
        this.filterEDayoffPredicates += `KowID==@${i}`;
      }

      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEDayoffPredicates],
          [this.filterByKowIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    } else if (this.startDateEDayoffFilterValue != null) {
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates(
          [
            `BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 3', item);
        });
    }
  }

  valueChangeFilterDayOff(evt) {
    this.filterByKowIDArr = evt.data;

    this.UpdateEDayOffsPredicate();
  }

  valueChangeYearFilterDayOff(evt) {
    console.log('chon year', evt);
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateEDayoffFilterValue = null;
      this.endDateEDayoffFilterValue = null;
    } else {
      this.startDateEDayoffFilterValue = evt.fromDate.toJSON();
      this.endDateEDayoffFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEDayOffsPredicate();
  }
}
