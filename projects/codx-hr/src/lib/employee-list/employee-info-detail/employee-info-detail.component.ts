import { map } from 'rxjs';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
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
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  CodxGridviewV2Component,
  CRUDService,
  DataRequest,
  DataService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  SortModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupEPassportsComponent } from '../../employee-profile/popup-epassports/popup-epassports.component';
import { PopupEhealthsComponent } from '../../employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEVaccineComponent } from '../../employee-profile/popup-evaccine/popup-evaccine.component';
import { PopupEDiseasesComponent } from '../../employee-profile/popup-ediseases/popup-ediseases.component';
import { PopupEmpBusinessTravelsComponent } from '../../employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';
import { PopupSubEContractComponent } from '../../employee-profile/popup-sub-econtract/popup-sub-econtract.component';
import { PopupEProcessContractComponent } from '../../employee-contract/popup-eprocess-contract/popup-eprocess-contract.component';
import { PopupForeignWorkerComponent } from '../../employee-profile/popup-foreign-worker/popup-foreign-worker.component';
import { PopupViewAllComponent } from './pop-up/popup-view-all/popup-view-all.component';
import { PopupEquitjobComponent } from '../../employee-profile/popup-equitjob/popup-equitjob.component';

@Component({
  selector: 'lib-employee-info-detail',
  templateUrl: './employee-info-detail.component.html',
  styleUrls: ['./employee-info-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeInfoDetailComponent extends UIComponent {
  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('button') button: TemplateRef<any>;
  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;

  views: Array<ViewModel> | any = [];
  minType = 'MinRange';
  user;
  isClick: boolean = false;
  dataService: DataService = null;

  active = [
    'HRTEM0101',
    'HRTEM0301',
    'HRTEM0401',
    'HRTEM0501',
    'HRTEM0601',
    'HRTEM0804',
    'HRTEM0801',
  ];

  infoPersonal: any;
  lineManager: any;
  indirectManager: any;

  crrEContract: any;
  lstContractType: any = []; //phân loại HĐ không xác định

  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  idField = 'recID';
  functionID: string;
  lstFamily: any = [];
  lstOrg: any; //view bo phan
  lstBtnAdd: any = []; //nut add chung

  //Kinh nghiem
  lstExperiences: any;

  crrPassport: any;

  crrVisa: any;

  crrWorkpermit: any;

  crrJobSalaries: any;

  formModel;

  employeeID;
  crrTab: number = 0;

  lstAsset: any;

  crrEBSalary: any;

  listCrrBenefit: any = [];

  lstESkill: any;
  // IsMax = false;
  Current_Grade_ESkill: any = [];

  //#region gridViewSetup
  eVaccineGrvSetup;
  eSkillgrvSetup;
  eBenefitGrvSetup;
  eAssetGrvSetup;
  eDayOffGrvSetup;
  eTrainCourseGrvSetup;
  eDiseasesGrvSetup;
  eAccidentsGrvSetup;
  //#endregion

  //#region sortModels
  dayOffSortModel: SortModel;
  disciplinesSortModel: SortModel;
  assetSortModel: SortModel;
  experienceSortModel: SortModel;
  businessTravelSortModel: SortModel;
  benefitSortModel: SortModel;
  passportSortModel: SortModel;
  workPermitSortModel: SortModel;
  visaSortModel: SortModel;
  skillIDSortModel: SortModel;
  skillGradeSortModel: SortModel;
  appointionSortModel: SortModel;
  bSalarySortModel: SortModel;
  issuedDateSortModel: SortModel;
  TrainFromDateSortModel: SortModel;
  injectDateSortModel: SortModel;
  healthDateSortModel: SortModel;
  diseasesFromDateSortModel: SortModel;
  accidentDateSortModel: SortModel;
  eContractSortModel: SortModel;
  eAwardsSortModel1: SortModel;
  eAwardsSortModel2: SortModel;
  //#endregion

  positionColumnsGrid;
  // holidayColumnsGrid;
  // workDiaryColumnGrid;
  awardColumnsGrid;
  // disciplineColumnGrid;
  eDegreeColumnsGrid;
  eCertificateColumnGrid;
  eExperienceColumnGrid;
  eAssetColumnGrid;
  eSkillColumnGrid;
  // basicSalaryColumnGrid;
  eTrainCourseColumnGrid;
  eHealthColumnGrid;
  businessTravelColumnGrid;
  eVaccineColumnGrid;
  benefitColumnGrid;
  dayoffColumnGrid;
  appointionColumnGrid;
  jobSalaryColumnGrid;
  eContractColumnGrid;
  eDisciplineColumnsGrid;
  eDiseasesColumnsGrid;
  eAccidentsColumnsGrid;
  //#endregion

  filterByBenefitIDArr: any = [];
  filterEBenefitPredicates: string;
  startDateEBenefitFilterValue;
  endDateEBenefitFilterValue;

  // ViewAllEBenefitFlag = false;
  ViewAllEAssetFlag = false;
  // ViewAllVisaFlag = false;
  ViewAllEskillFlag = false;
  ViewAllEBasicSalaryFlag = false;
  ViewAllEJobSalaryFlag = false;
  // ViewAllEContractFlag = false;
  // ViewAllPassportFlag = false;
  ops = ['y'];

  //#region filter variables of form main eAssets
  filterByAssetCatIDArr: any = [];
  startDateEAssetFilterValue;
  endDateEAssetFilterValue;
  filterEAssetPredicates: string;

  //#endregion

  //#region filter variables of form main eDiseases
  Filter_By_EDiseases_IDArr: any = [];
  Filter_EDiseases_Predicates: string;

  //#region filter variables of form main eAccident
  filterByAccidentIDArr: any = [];
  filterAccidentIdPredicate: string;

  //#endregion

  //#region filter variables of form main eVaccine
  filterByVaccineTypeIDArr: any = [];
  startDateEVaccineFilterValue;
  endDateEVaccineFilterValue;
  filterEVaccinePredicates: string;

  //#endregion

  //#region filter variables of form main eSKill
  filterByESkillIDArr: any = [];
  startDateESkillFilterValue;
  endDateESkillFilterValue;
  filterESkillPredicates: string;

  //#endregion

  //#region filter variables of form main eTrainCourse
  Filter_By_ETrainCourse_IDArr: any = [];
  Start_Date_ETrainCourse_Filter_Value;
  End_Date_ETrainCourse_Filter_Value;
  Filter_ETrainCourse_Predicates: string;
  //#endregion

  //#region filter variables of form main eAwards
  Start_Date_Award_Filter_Value;
  End_Date_Award_Filter_Value;
  Filter_Award_Predicates;
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
  @ViewChild('headTempAppointion1', { static: true })
  headTempAppointion1: TemplateRef<any>;
  @ViewChild('headTempAppointion2', { static: true })
  headTempAppointion2: TemplateRef<any>;
  @ViewChild('headTempAppointion3', { static: true })
  headTempAppointion3: TemplateRef<any>;

  //#endregion

  //eDayoff
  @ViewChild('templateDayOffGridCol1', { static: true })
  templateDayOffGridCol1: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol2', { static: true })
  templateDayOffGridCol2: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol3', { static: true })
  templateDayOffGridCol3: TemplateRef<any>;
  @ViewChild('headTempDayOff1', { static: true })
  headTempDayOff1: TemplateRef<any>;
  @ViewChild('headTempDayOff2', { static: true })
  headTempDayOff2: TemplateRef<any>;
  @ViewChild('headTempDayOff3', { static: true })
  headTempDayOff3: TemplateRef<any>;

  // Lương chức danh
  @ViewChild('jobSalaryCol1', { static: true })
  jobSalaryCol1: TemplateRef<any>;
  @ViewChild('jobSalaryCol2', { static: true })
  jobSalaryCol2: TemplateRef<any>;
  @ViewChild('jobSalaryCol3', { static: true })
  jobSalaryCol3: TemplateRef<any>;
  @ViewChild('jobSalaryCol4', { static: true })
  jobSalaryCol4: TemplateRef<any>;

  // Hợp đồng lao động
  @ViewChild('eContractCol1', { static: true })
  eContractCol1: TemplateRef<any>;
  @ViewChild('eContractCol2', { static: true })
  eContractCol2: TemplateRef<any>;
  @ViewChild('eContractCol3', { static: true })
  eContractCol3: TemplateRef<any>;

  //Tai nạn lao động

  @ViewChild('templateEAccidentCol1', { static: true })
  templateEAccidentCol1: TemplateRef<any>;
  @ViewChild('templateEAccidentCol2', { static: true })
  templateEAccidentCol2: TemplateRef<any>;
  @ViewChild('templateEAccidentCol3', { static: true })
  templateEAccidentCol3: TemplateRef<any>;
  @ViewChild('headTempAccident1', { static: true })
  headTempAccident1: TemplateRef<any>;
  @ViewChild('headTempAccident2', { static: true })
  headTempAccident2: TemplateRef<any>;
  @ViewChild('headTempAccident3', { static: true })
  headTempAccident3: TemplateRef<any>;

  //#endregion

  //#region gridView viewChild
  @ViewChild('passportGridview', { static: true })
  passportGridview: CodxGridviewV2Component;
  @ViewChild('visaGridview') visaGridview: CodxGridviewV2Component;
  @ViewChild('workPermitGridview') workPermitGridview: CodxGridviewV2Component;
  @ViewChild('basicSalaryGridview')
  basicSalaryGridview: CodxGridviewV2Component;
  @ViewChild('appointionGridView') appointionGridView: CodxGridviewV2Component;
  @ViewChild('jobSalaryGridview') jobSalaryGridview: CodxGridviewV2Component;
  @ViewChild('eContractGridview') eContractGridview: CodxGridviewV2Component;
  @ViewChild('eAccidentGridView') eAccidentGridView: CodxGridviewV2Component;

  //#endregion

  @ViewChild('tmpTemp', { static: true })
  tmpTemp: TemplateRef<any>;
  @ViewChild('tmpViewAllPassport', { static: true })
  tmpViewAllPassport: TemplateRef<any>;
  @ViewChild('tmpViewAllVisa', { static: true })
  tmpViewAllVisa: TemplateRef<any>;
  @ViewChild('tmpViewAllWorkpermit', { static: true })
  tmpViewAllWorkpermit: TemplateRef<any>;
  @ViewChild('tmpViewAllContract', { static: true })
  tmpViewAllContract: TemplateRef<any>;

  //Declare model ViewAll Salary
  @ViewChild('templateViewSalary', { static: true })
  templateViewSalary: TemplateRef<any>;
  dialogViewSalary: any;

  //Declare model ViewAll Benefit
  @ViewChild('templateViewBenefit', { static: true })
  templateViewBenefit: TemplateRef<any>;
  dialogViewBenefit: any;

  listEmp: any = [];
  request: DataRequest;

  lstTab: any;

  //#region functions list
  lstFuncCurriculumVitae: any = [];
  lstFuncJobInfo: any = [];
  lstFuncSalaryBenefit: any = [];
  lstFuncHRProcess: any = [];
  lstFuncKnowledge: any = [];
  lstFuncHealth: any = [];
  lstFuncQuitJob: any = [];
  lstFuncArchiveRecords: any = [];
  lstFuncSeverance: any = [];
  lstFuncID: any = [];

  //father funcID
  lstFuncLegalInfo: any = [];
  lstFuncForeignWorkerInfo: any = [];

  //#endregion

  //#region RowCount
  eDegreeRowCount: number = 0;
  passportRowCount: number = 0;
  visaRowCount: number = 0;
  workPermitRowCount: number = 0;
  //eExperienceRowCount = 0;
  eCertificateRowCount = 0;
  eBenefitRowCount: number = 0;
  // eBusinessTravelRowCount = 0;
  eSkillRowCount = 0;
  // dayoffRowCount: number = 0;
  eAssetRowCount = 0;
  eBasicSalaryRowCount = 0;
  eTrainCourseRowCount = 0;
  eHealthRowCount = 0;
  eVaccineRowCount = 0;
  //appointionRowCount = 0;
  eJobSalaryRowCount = 0;
  //awardRowCount = 0;
  //eContractRowCount = 0;
  //eDisciplineRowCount = 0;
  eDiseasesRowCount = 0;
  eAccidentsRowCount = 0;
  // eHealthRowCount = 0;
  // eVaccineRowCount = 0;
  appointionRowCount = 0;
  awardRowCount = 0;
  eContractRowCount = 0;
  eDisciplineRowCount = 0;
  // eDiseasesRowCount = 0;
  // eAccidentsRowCount = 0;
  //#endregion

  //#region var functionID
  curriculumVitaeFuncID: string = 'HRTEM01';
  legalInfoFuncID: string = 'HRTEM02';
  foreignWorkerFuncID: string = 'HRTEM0104';
  jobInfoFuncID: string = 'HRTEM03';
  salaryBenefitInfoFuncID: string = 'HRTEM04';
  workingProcessInfoFuncID: string = 'HRTEM05';
  knowledgeInfoFuncID: string = 'HRTEM06';
  healthInfoFuncID: string = 'HRTEM08';
  quitJobInfoFuncID: string = 'HRTEM09';

  eInfoFuncID = 'HRTEM0101';
  ePartyFuncID = 'HRTEM0102';
  eFamiliesFuncID = 'HRTEM0103';
  eAssurFuncID = 'HRTEM0201';
  ePassportFuncID = 'HRTEM0202';
  eDegreeFuncID = 'HRTEM0601';
  eVisaFuncID = 'HRTEM0203';
  eWorkPermitFuncID = 'HRTEM0204';
  eCertificateFuncID = 'HRTEM0602';
  eSkillFuncID = 'HRTEM0603';
  eExperienceFuncID = 'HRTEM0505'; // Kinh nghiệm trước đây
  eAssetFuncID = 'HRTEM0406'; // Tài sản cấp phát
  eTimeCardFuncID = 'HRTEM0302';
  eCalSalaryFuncID = 'HRTEM0303';
  jobGeneralFuncID = 'HRTEM0301';
  eBasicSalaryFuncID = 'HRTEM0401';
  eJobSalFuncID = 'HRTEM0402'; //Lương chức danh
  eTrainCourseFuncID = 'HRTEM0604';
  eBusinessTravelFuncID = 'HRTEM0504';
  eHealthFuncID = 'HRTEM0801'; // Khám sức khỏe
  eVaccinesFuncID = 'HRTEM0802'; // Tiêm vắc xin
  benefitFuncID = 'HRTEM0403';
  dayoffFuncID = 'HRTEM0503';
  appointionFuncID = 'HRTEM0502';
  awardFuncID = 'HRTEM0701';
  eContractFuncID = 'HRTEM0501';
  eDisciplineFuncID = 'HRTEM0702';
  eDiseasesFuncID = 'HRTEM0803';
  eQuitJobFuncID = 'HRTEM0901';
  eAccidentsFuncID = 'HRTEM0804';
  eNeedToSubmitProfileFuncID = 'HRTEM0304';
  //#endregion

  //#region Vll colors
  AssetColorValArr: any = [];
  BeneFitColorValArr: any = [];
  VaccineColorValArr: any = [];
  //#endregion
  crrFuncTab: string;

    //Check loaded ESalary
    loadedESalary: boolean;
    loadEBenefit: boolean;

  //#region var formModel
  benefitFormodel: FormModel;
  EBusinessTravelFormodel: FormModel;
  eInfoFormModel: FormModel; // Thông tin bản thân/ Bảo hiểm
  eFamilyFormModel: FormModel; //Quan hệ gia đình
  ePassportFormModel: FormModel; //Hộ chiếu
  eQuitJobFormModel: FormModel; //Nghỉ việc
  eVisaFormModel: FormModel;
  eWorkPermitFormModel: FormModel; //Giay phep lao dong
  eCertificateFormModel: FormModel; // Chứng chỉ
  eDegreeFormModel: FormModel; // Bằng cấp
  eSkillFormmodel: FormModel; // Kỹ năng
  eExperienceFormModel: FormModel; //Kinh nghiệm trước đây
  eAssetFormModel: FormModel; //Tài sản cấp phát
  eBasicSalaryFormmodel: FormModel; //Lương cơ bản
  eTrainCourseFormModel: FormModel; // Đào tạo
  eHealthFormModel: FormModel; //Khám sức khỏe
  eVaccineFormModel: FormModel; //Tiêm vắc xin
  appointionFormModel: FormModel;
  dayoffFormModel: FormModel;
  eJobSalaryFormModel: FormModel; // Lương chức danh
  awardFormModel: FormModel; // Khen thưởng
  eContractFormModel: FormModel; // Hợp đồng lao động
  eDisciplineFormModel: FormModel; // Kỷ luật
  eDiseasesFormModel: FormModel; // Bệnh nghề nghiệp
  eAccidentsFormModel: FormModel;
  //#endregion

  //#region headerText
  eBusinessTravelHeaderTexts;
  benefitHeaderTexts;
  dayoffHeaderTexts;
  eDegreeHeaderText;
  eExperienceHeaderText;
  eAssetHeaderText;
  eCertificateHeaderText;
  eSkillHeaderText;
  eTrainCourseHeaderText;
  eHealthHeaderText;
  eVaccineHeaderText;
  appointionHeaderTexts;
  eJobSalaryHeaderText;
  awardHeaderText;
  eContractHeaderText;
  eDisciplineHeaderText;
  eDiseasesHeaderText;
  eAccidentHeaderText;
  //#endregion

  pageNum: number = 0;
  maxPageNum: number = 0;
  crrIndex: number = 0;

  currentYear = new Date().getFullYear();
 firstDay = new Date(this.currentYear, 0, 1);
 lastDay = new Date(this.currentYear, 11, 31);
 dayOffInitPredicate =  `(EmployeeID=@0 and (BeginDate>="${this.firstDay.toISOString()}" and EndDate<="${this.lastDay.toISOString()}"))`

  //#region headerTextString
  addHeaderText;
  editHeaderText;
  //#endregion

  //#region filter variables of form main eDayoffs
  filterByKowIDArr: any = [];
  yearFilterValueDayOffs;
  startDateEDayoffFilterValue;
  endDateEDayoffFilterValue;
  filterEDayoffPredicates: string;
  filterEDayoffDatavalues;
  //#endregion

  reRender = false;

  //#region filter variables of form main EBusinessTravel
  yearFilterValueBusinessTravel;
  startDateBusinessTravelFilterValue;
  endDateBusinessTravelFilterValue;
  filterBusinessTravelPredicates: string;
  LoadedEInfo = false;
  //#endregion


  constructor(
    private inject: Injector,
    private routeActive: ActivatedRoute,
    private hrService: CodxHrService,
    private auth: AuthStore,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    public override api: ApiHttpService,
    private notifySvr: NotificationsService
  ) {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.user = this.auth.get();
  }


  onInit(): void {
    if (this.funcID) {
      this.hrService.getFunctionList(this.funcID).subscribe((res: any[]) => {
        if (res && res[1] > 0) {
          this.lstFuncID = Array.from<any>(res[0]);
          if (this.lstFuncID?.length > 0) {
            this.lstTab = this.lstFuncID.filter(
              (p) => p.parentID == this.funcID
            );
            this.crrFuncTab = this.lstTab[this.crrTab]?.functionID;
            this.lstFuncCurriculumVitae = this.lstFuncID.filter(
              (p) => p.parentID == this.curriculumVitaeFuncID
            );
            this.lstBtnAdd = this.lstFuncID.filter(
              (p) =>
                (p.parentID == this.curriculumVitaeFuncID ||
                  p.parentID == this.legalInfoFuncID ||
                  p.parentID == this.foreignWorkerFuncID) &&
                p.entityName != 'HR_Employees'
            );

            this.lstFuncLegalInfo = this.lstFuncID.filter(
              (p) => p.parentID == this.legalInfoFuncID
            );
            this.lstFuncForeignWorkerInfo = this.lstFuncID.filter(
              (p) => p.parentID == this.foreignWorkerFuncID
            );
            this.lstFuncJobInfo = this.lstFuncID.filter(
              (p) => p.parentID == this.jobInfoFuncID
            );
            
            this.lstFuncSalaryBenefit = this.lstFuncID.filter(
              (p) => p.parentID == this.salaryBenefitInfoFuncID
            );
            this.lstFuncHRProcess = this.lstFuncID.filter(
              (p) => p.parentID == this.workingProcessInfoFuncID
            );
            this.lstFuncKnowledge = this.lstFuncID.filter(
              (p) => p.parentID == this.knowledgeInfoFuncID
            );
            this.lstFuncHealth = this.lstFuncID.filter(
              (p) => p.parentID == this.healthInfoFuncID
            );
            this.lstFuncQuitJob = this.lstFuncID.filter(
              (p) => p.parentID == this.quitJobInfoFuncID
            );
          }
        }
      });
    }
    this.routeActive.queryParams.subscribe((params) => {
      this.employeeID = params['employeeID'];
      this.pageNum = params['page'];
      this.maxPageNum = params['totalPage']
      debugger

      if(this.employeeID){
        // Load full thong tin employee
        this.loadEmpFullInfo(this.employeeID).subscribe((res) => {
          if(res){
            console.log('info nv',  res[0]);
            this.infoPersonal = res[0];
            this.infoPersonal.PositionName = res[1]
            this.lstOrg = res[2]
            this.LoadedEInfo = true;
            this.df.detectChanges();
          }
        })
        // Load full thong tin current cua employee
        this.getEmpCurrentData().subscribe((res) => {
          if(res){
            this.crrPassport = res[0];
            this.crrVisa = res[1];
            this.crrWorkpermit = res[2];
            this.lstFamily = res[3];
            this.lstExperiences = res[4];
            this.crrEBSalary = res[5];
            this.loadedESalary = true;
            this.listCrrBenefit = res[6];
            this.loadEBenefit = true;
            this.crrEContract = res[7]
          }
        })
      }
      if (this.employeeID) {
        debugger
        if (history.state) {
          this.listEmp = history.state.data
          this.request = history.state.request;
          if (Array.isArray(this.listEmp)) {
            this.crrIndex = this.listEmp.findIndex(
              (x: any) => this.employeeID == x['EmployeeID']
            )};
            }
      }
    });
    this.initFormModel();
    this.initSortModel();
    this.initHeaderText();
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
    console.log('form Model ne', this.formModel);
    
  }

  initFormModel() {
    this.hrService.getFormModel(this.eContractFuncID).then((res) => {
      this.eContractFormModel = res;
    });

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

    this.hrService.getFormModel(this.quitJobInfoFuncID).then((res) => {
      this.eQuitJobFormModel = res;
    });

    this.hrService.getFormModel(this.eExperienceFuncID).then((res) => {
      this.eExperienceFormModel = res;
    });

    this.hrService.getFormModel(this.eCertificateFuncID).then((res) => {
      this.eCertificateFormModel = res;
    });

    this.hrService.getFormModel(this.eSkillFuncID).then((res) => {
      this.eSkillFormmodel = res;
      this.cache
        .gridViewSetup(
          this.eSkillFormmodel.formName,
          this.eSkillFormmodel.gridViewName
        )
        .subscribe((res) => {
          this.eSkillgrvSetup = res;
        });
    });

    this.hrService.getFormModel(this.eDegreeFuncID).then((res) => {
      this.eDegreeFormModel = res;
    });

    this.hrService.getFormModel(this.eAssetFuncID).then((res) => {
      this.eAssetFormModel = res;
      this.cache
        .gridViewSetup(
          this.eAssetFormModel.formName,
          this.eAssetFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eAssetGrvSetup = res;
          let dataRequest = new DataRequest();
          dataRequest.comboboxName = res.AssetCategory.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            this.AssetColorValArr = JSON.parse(data[0]);
          });
        });
    });

    this.hrService.getFormModel(this.eBasicSalaryFuncID).then((res) => {
      this.eBasicSalaryFormmodel = res;

    });
    this.hrService.getFormModel(this.eTrainCourseFuncID).then((res) => {
      this.eTrainCourseFormModel = res;
      this.cache
        .gridViewSetup(
          this.eTrainCourseFormModel.formName,
          this.eTrainCourseFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eTrainCourseGrvSetup = res;
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
          let dataRequest = new DataRequest();

          dataRequest.comboboxName = res.BenefitID.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            this.BeneFitColorValArr = JSON.parse(data[0]);
          });
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
          let dataRequest = new DataRequest();
          dataRequest.comboboxName = res.VaccineTypeID.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            this.VaccineColorValArr = JSON.parse(data[0]);
          });
        });
    });

    this.hrService.getFormModel(this.dayoffFuncID).then((res) => {
      this.dayoffFormModel = res;
      this.cache
        .gridViewSetup(
          this.dayoffFormModel.formName,
          this.dayoffFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eDayOffGrvSetup = res;
        });
    });

    this.hrService.getFormModel(this.eBusinessTravelFuncID).then((res) => {
      this.EBusinessTravelFormodel = res;
    });

    this.hrService.getFormModel(this.appointionFuncID).then((res) => {
      this.appointionFormModel = res;
    });

    this.hrService.getFormModel(this.eJobSalFuncID).then((res) => {
      this.eJobSalaryFormModel = res;
    });

    this.hrService.getFormModel(this.awardFuncID).then((res) => {
      this.awardFormModel = res;
    });

    this.hrService.getFormModel(this.eDisciplineFuncID).then((res) => {
      this.eDisciplineFormModel = res;
    });

    this.hrService.getFormModel(this.eDiseasesFuncID).then((res) => {
      this.eDiseasesFormModel = res;
      this.cache
        .gridViewSetup(
          this.eDiseasesFormModel.formName,
          this.eDiseasesFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eDiseasesGrvSetup = res;
        });
    });

    this.hrService.getFormModel(this.eAccidentsFuncID).then((res) => {
      this.eAccidentsFormModel = res;
      this.cache
        .gridViewSetup(
          this.eAccidentsFormModel.formName,
          this.eAccidentsFormModel.gridViewName
        )
        .subscribe((res) => {
          this.eAccidentsGrvSetup = res;
        });
    });
  }

  initSortModel() {
    this.dayOffSortModel = new SortModel();
    this.dayOffSortModel.field = 'BeginDate';
    this.dayOffSortModel.dir = 'desc';

    this.assetSortModel = new SortModel();
    this.assetSortModel.field = 'IssuedDate';
    this.assetSortModel.dir = 'desc';

    this.experienceSortModel = new SortModel();
    this.experienceSortModel.field = 'FromDate';
    this.experienceSortModel.dir = 'asc';

    this.businessTravelSortModel = new SortModel();
    this.businessTravelSortModel.field = 'BeginDate';
    this.businessTravelSortModel.dir = 'desc';

    this.benefitSortModel = new SortModel();
    this.benefitSortModel.field = 'EffectedDate';
    this.benefitSortModel.dir = 'desc';

    this.visaSortModel = new SortModel();
    this.visaSortModel.field = 'IssuedDate';
    this.visaSortModel.dir = 'desc';

    this.workPermitSortModel = new SortModel();
    this.workPermitSortModel.field = 'IssuedDate';
    this.workPermitSortModel.dir = 'desc';

    this.passportSortModel = new SortModel();
    this.passportSortModel.field = 'IssuedDate';
    this.passportSortModel.dir = 'desc';

    this.skillIDSortModel = new SortModel();
    this.skillIDSortModel.field = 'SkillID';
    this.skillIDSortModel.dir = 'asc';

    this.skillGradeSortModel = new SortModel();
    this.skillGradeSortModel.field = 'SkillGradeID';
    this.skillGradeSortModel.dir = 'desc';

    this.bSalarySortModel = new SortModel();
    this.bSalarySortModel.field = 'EffectedDate';
    this.bSalarySortModel.dir = 'desc';

    this.issuedDateSortModel = new SortModel();
    this.issuedDateSortModel.field = 'issuedDate';
    this.issuedDateSortModel.dir = 'desc';

    this.TrainFromDateSortModel = new SortModel();
    this.TrainFromDateSortModel.field = 'TrainFromDate';
    this.TrainFromDateSortModel.dir = 'desc';

    this.appointionSortModel = new SortModel();
    this.appointionSortModel.field = 'EffectedDate';
    this.appointionSortModel.dir = 'desc';

    this.eContractSortModel = new SortModel();
    this.eContractSortModel.field = 'EffectedDate';
    this.eContractSortModel.dir = 'desc';

    this.disciplinesSortModel = new SortModel();
    this.disciplinesSortModel.field = 'DisciplineDate';
    this.disciplinesSortModel.dir = 'desc';

    this.injectDateSortModel = new SortModel();
    this.injectDateSortModel.field = '(InjectDate)';
    this.injectDateSortModel.dir = 'desc';

    this.accidentDateSortModel = new SortModel();
    this.accidentDateSortModel.field = '(AccidentDate)';
    this.accidentDateSortModel.dir = 'desc';

    this.diseasesFromDateSortModel = new SortModel();
    this.diseasesFromDateSortModel.field = '(FromDate)';
    this.diseasesFromDateSortModel.dir = 'desc';

    this.healthDateSortModel = new SortModel();
    this.healthDateSortModel.field = '(HealthDate)';
    this.healthDateSortModel.dir = 'desc';

    this.eAwardsSortModel1 = new SortModel();
    this.eAwardsSortModel1.field = 'InYear';
    this.eAwardsSortModel1.dir = 'desc';

    this.eAwardsSortModel2 = new SortModel();
    this.eAwardsSortModel2.field = 'AwardDate';
    this.eAwardsSortModel2.dir = 'desc';
  }

  initHeaderText() {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      this.addHeaderText = res[0].customName;
      this.editHeaderText = res[2].customName;
    });
  }

  //chua dung
  navChange(evt: any, index: number = -1, btnClick) {
    let containerList = document.querySelectorAll('.pw-content')
    let lastDivList = document.querySelectorAll('.div_final')
    let lastDiv = lastDivList[index]
    let container = containerList[index]
    let containerHeight = (container as any).offsetHeight
    let contentHeight = 0;
    for(let i = 0; i< container.children.length; i++){
      contentHeight += (container.children[i] as any).offsetHeight
    }

    if (!evt) return;
    let element = document.getElementById(evt);
    let distanceToBottom = contentHeight - element.offsetTop;
    console.log('khoang cach toi bot', distanceToBottom);
    
    if(distanceToBottom < containerHeight){
      console.log('can phai chinh lai');
      (lastDiv as any).style.width = '200px';
      (lastDiv as any).style.height = `${containerHeight - distanceToBottom + 50}px`;
    }

    if (index > -1) {
      this.active[index] = evt;
      this.detectorRef.detectChanges();
    }
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.isClick = true;
    this.detectorRef.detectChanges();
    setTimeout(() => {
      this.isClick = false;
      return;
    }, 500);
  }

  onSectionChange(data: any, index: number = -1) {
    if (index > -1 && this.isClick == false) {
      // let element = document.getElementById(this.active[index]);
      // element.blur();
      this.active[index] = data;
      this.detectorRef.detectChanges();
    }
  }

  getEmpCurrentData(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmpCurrentInfoAsync',
      this.employeeID
    );
  }

  loadEmpFullInfo(empID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmpFullInfoAsync',
      empID
    )
  }

  initEmpSalary() {
    if (this.employeeID) {
    }
  }

  initEmpKnowledge() {
    // if (this.employeeID) {
    //   //HR_ESkills
    //   if (!this.lstESkill) {
    //     let rqESkill = new DataRequest();
    //     rqESkill.entityName = 'HR_ESkills';
    //     rqESkill.dataValues = this.employeeID;
    //     rqESkill.predicates = 'EmployeeID=@0';
    //     rqESkill.page = 1;
    //     rqESkill.pageSize = 20;
    //     // this.hrService.getViewSkillAsync(rqESkill).subscribe((res) => {
    //     //   if (res) {
    //     //     this.lstESkill = res;
    //     //   }
    //     // });
    //   }
    //   this.df.detectChanges();
    // }

    if (!this.eDegreeColumnsGrid) {
      this.hrService.getHeaderText(this.eDegreeFuncID).then((res) => {
        this.eDegreeHeaderText = res;
        this.eDegreeColumnsGrid = [
          {
            // headerText:
            //   this.eDegreeHeaderText['DegreeName'] +
            //   '|' +
            //   this.eDegreeHeaderText['TrainFieldID'],
            headerTemplate: this.headTempDegree1,
            template: this.templateEDegreeGridCol1,
            width: '150',
          },
          {
            // headerText:
            //   this.eDegreeHeaderText['TrainSupplierID'] +
            //   '|' +
            //   this.eDegreeHeaderText['Ranking'],
            headerTemplate: this.headTempDegree2,
            template: this.templateEDegreeGridCol2,
            width: '150',
          },
          {
            // headerText:
            //   this.eDegreeHeaderText['YearGraduated'] +
            //   '|' +
            //   this.eDegreeHeaderText['IssuedDate'],
            headerTemplate: this.headTempDegree3,
            template: this.templateEDegreeGridCol3,
            width: '150',
          },
        ];
      });

      // let insDegree = setInterval(() => {
      //   if (this.eDegreeGrid) {
      //     clearInterval(insDegree);
      //     let t = this;
      //     this.eDegreeGrid.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.eDegreeRowCount = 0;
      //           t.eDegreeRowCount = res['data']?.length;
      //         }
      //       }
      //     });
      //     this.eDegreeRowCount = this.eDegreeGrid.dataService.rowCount;
      //   }
      // }, 100);

      this.df.detectChanges();
    }

    if (!this.eCertificateColumnGrid) {
      this.hrService.getHeaderText(this.eCertificateFuncID).then((res) => {
        this.eCertificateHeaderText = res;
        this.eCertificateColumnGrid = [
          {
            // headerText: this.eCertificateHeaderText['CertificateID'],
            headerTemplate: this.headTempCertificate1,
            template: this.templateECertificateGridCol1,
            width: '150',
          },
          {
            // headerText:
            //   this.eCertificateHeaderText['TrainSupplierID'] +
            //   '|' +
            //   this.eCertificateHeaderText['Ranking'],
            headerTemplate: this.headTempCertificate2,
            template: this.templateECertificateGridCol2,
            width: '150',
          },
          {
            // headerText:
            //   this.eCertificateHeaderText['IssuedDate'] +
            //   '|' +
            //   this.eCertificateHeaderText['EffectedDate'],
            headerTemplate: this.headTempCertificate3,
            template: this.templateECertificateGridCol3,
            width: '150',
          },
        ];
      });

      // let insCerti = setInterval(() => {
      //   if (this.eCertificateGrid) {
      //     clearInterval(insCerti);
      //     let t = this;
      //     this.eCertificateGrid.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.eCertificateRowCount = 0;
      //           t.eCertificateRowCount = res['data']?.length;
      //         }
      //       }
      //     });
      //     this.eCertificateRowCount =
      //       this.eCertificateGrid.dataService.rowCount;
      //   }
      // }, 100);
    }

    if (!this.eSkillColumnGrid) {
      this.hrService.getHeaderText(this.eSkillFuncID).then((res) => {
        this.eSkillHeaderText = res;
        this.eSkillColumnGrid = [
          {
            // headerText:
            //   this.eSkillHeaderText['SkillID'] +
            //   '|' +
            //   this.eSkillHeaderText['SkillGradeID'],
            headerTemplate: this.headTempSkill1,
            template: this.templateESkillGridCol1,
            width: '150',
          },
          {
            // headerText:
            //   this.eSkillHeaderText['TrainSupplierID'] +
            //   '|' +
            //   this.eSkillHeaderText['Ranking'] +
            //   ' - ' +
            //   this.eSkillHeaderText['TotalScore'],
            headerTemplate: this.headTempSkill2,
            template: this.templateESkillGridCol2,
            width: '150',
          },
          {
            // headerText:
            //   this.eSkillHeaderText['TrainFrom'] +
            //   '|' +
            //   this.eSkillHeaderText['TrainForm'],
            headerTemplate: this.headTempSkill3,
            template: this.templateESkillGridCol3,
            width: '150',
          },
        ];
      });

      // let insSkill = setInterval(() => {
      //   if (this.skillGrid) {
      //     clearInterval(insSkill);
      //     let t = this;
      //     this.skillGrid.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.eSkillRowCount = res['data']?.length;
      //         }
      //       }
      //     });
      //     this.eSkillRowCount = this.skillGrid.dataService.rowCount;
      //   }
      // }, 100);
      this.df.detectChanges();
    }

    if (!this.eTrainCourseColumnGrid) {

    if(!this.eTrainCourseColumnGrid){
      this.hrService.getHeaderText(this.eTrainCourseFuncID).then((res) => {
        this.eTrainCourseHeaderText = res;
        this.eTrainCourseColumnGrid = [
          {
            // headerText:
            //   this.eTrainCourseHeaderText['TrainCourseID'] +
            //   '|' +
            //   this.eTrainCourseHeaderText['TrainForm'],
            headerTemplate: this.headTempTrainCourse1,
            template: this.templateTrainCourseGridCol1,
            width: '150',
          },
          {
            // headerText:
            //   this.eTrainCourseHeaderText['TrainFrom'] +
            //   '|' +
            //   this.eTrainCourseHeaderText['InYear'],
            headerTemplate: this.headTempTrainCourse2,
            template: this.templateTrainCourseGridCol2,
            width: '150',
          },
          {
            // headerText:
            //   this.eTrainCourseHeaderText['TrainSupplierID'] +
            //   '|' +
            //   this.eTrainCourseHeaderText['Result'],
            headerTemplate: this.headTempTrainCourse3,
            template: this.templateTrainCourseGridCol3,
            width: '150',
          },
        ];
      });

      // let insTrain = setInterval(() => {
      //   if (this.eTrainCourseGrid) {
      //     clearInterval(insTrain);
      //     let t = this;
      //     this.eTrainCourseGrid.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.eTrainCourseRowCount = 0;
      //           t.eTrainCourseRowCount = res['data']?.length;
      //         }
      //       }
      //     });
      //     this.eTrainCourseRowCount =
      //       this.eTrainCourseGrid.dataService.rowCount;
      //   }
      // }, 100);
    }
    }
  }

  initEmpHealth(){
    if(!this.eAccidentsColumnsGrid){
    this.hrService.getHeaderText(this.eAccidentsFuncID).then((res) => {
      this.eAccidentHeaderText = res;
      this.eAccidentsColumnsGrid = [
        {
          // headerText:
          //   this.eAccidentHeaderText['AccidentID'] +
          //   ' | ' +
          //   this.eAccidentHeaderText['AccidentDate'],
          headerTemplate: this.headTempAccident1,
          template: this.templateEAccidentCol1,
          width: '150',
        },
        {
          // headerText:
          //   this.eAccidentHeaderText['AccidentPlace'] +
          //   ' | ' +
          //   this.eAccidentHeaderText['AccidentReasonID'],
          headerTemplate: this.headTempAccident2,
          template: this.templateEAccidentCol2,
          width: '150',
        },
        {
          // headerText: this.eAccidentHeaderText['AccidentLevel'],
          headerTemplate: this.headTempAccident3,
          template: this.templateEAccidentCol3,
          width: '150',
        },
      ];
    });
    //#endregion
    }

    if(!this.eDiseasesColumnsGrid){
    this.hrService.getHeaderText(this.eDiseasesFuncID).then((res) => {
      this.eDiseasesHeaderText = res;
      this.eDiseasesColumnsGrid = [
        {
          // headerText: this.eDiseasesHeaderText['DiseaseID'],
          headerTemplate: this.headTempDiseases1,
          template: this.templateDiseasesGridCol1,
          width: '150',
        },
        {
          // headerText:
          //   'Thời gian điều trị' +
          //   ' | ' +
          //   this.eDiseasesHeaderText['TreatHopitalID'],
          headerTemplate: this.headTempDiseases2,
          template: this.templateDiseasesGridCol2,
          width: '150',
        },
        {
          // headerText: this.eDiseasesHeaderText['Conclusion'],
          headerTemplate: this.headTempDiseases3,
          template: this.templateDiseasesGridCol3,
          width: '150',
        },
      ];
    });
    }

    if(!this.eHealthColumnGrid){
    this.hrService.getHeaderText(this.eHealthFuncID).then((res) => {
      this.eHealthHeaderText = res;
      this.eHealthColumnGrid = [
        {
          // headerText:
          //   this.eHealthHeaderText['HealthDate'] +
          //   ' | ' +
          //   this.eHealthHeaderText['HealthPeriodID'] +
          //   ' | ' +
          //   this.eHealthHeaderText['HospitalID'],
          headerTemplate: this.headTempHealth1,
          template: this.tempCol1EHealthGrid,
          width: '150',
        },

        {
          // headerText:
          //   this.eHealthHeaderText['HealthType'] +
          //   ' | ' +
          //   this.eHealthHeaderText['FinalConclusion'],
          headerTemplate: this.headTempHealth2,
          template: this.tempCol2EHealthGrid,
          width: '150',
        },

        {
          // headerText: this.eHealthHeaderText['Suggestion'],
          headerTemplate: this.headTempHealth3,
          template: this.tempCol3EHealthGrid,
          width: '150',
        },
      ];
    });
    }

    if(!this.eVaccineColumnGrid){
    this.hrService.getHeaderText(this.eVaccinesFuncID).then((res) => {
      this.eVaccineHeaderText = res;
      this.eVaccineColumnGrid = [
        {
          // headerText:
          //   this.eVaccineHeaderText['VaccineTypeID'] +
          //   ' | ' +
          //   this.eVaccineHeaderText['HopitalID'],
          headerTemplate: this.headTempVaccine1,
          template: this.tempEVaccineGridCol1,
          width: '150',
        },

        {
          // headerText:
          //   this.eVaccineHeaderText['InjectDate'] +
          //   ' | ' +
          //   this.eVaccineHeaderText['NextInjectDate'],
          headerTemplate: this.headTempVaccine2,
          template: this.tempEVaccineGridCol2,
          width: '150',
        },

        {
          // headerText: this.eVaccineHeaderText['Note'],
          headerTemplate: this.headTempVaccine3,
          template: this.tempEVaccineGridCol3,
          width: '150',
        },
      ];
    });
    }
  }

  //xem lai
  getECurrentContract() {
      let date = new Date();
      //HR_EContracts
      let rqContract = new DataRequest();
      rqContract.entityName = 'HR_EContracts';
      rqContract.dataValues =
        this.employeeID + ';false;' + `${date.toISOString()}`;
      rqContract.predicates =
        'EmployeeID=@0 and IsAppendix=@1 and EffectedDate<=@2 and ExpiredDate>=@2';
      rqContract.page = 1;
      rqContract.pageSize = 1;

      this.hrService.loadData('HR', rqContract).subscribe((res) => {
        if (res && res[0]) {
          this.crrEContract = res[0][0];
        } else {
          this.crrEContract = null;
        }
        this.df.detectChanges();
      });
  }

  initEmpProcess() {
    if (this.employeeID) {
      if (!this.lstContractType) {
        let rqContractType = new DataRequest();
        rqContractType.entityName = 'HR_ContractTypes';
        rqContractType.dataValues = '1';
        rqContractType.predicates = 'ContractGroup =@0';
        rqContractType.pageLoading = false;

        this.hrService.getCrrEContract(rqContractType).subscribe((res) => {
          if (res && res[0]) {
            this.lstContractType = res[0];
            this.df.detectChanges();
          }
        });
      }
    }

    //#region EContract - Hợp đồng lao động
    // if (!this.eContractColumnGrid) {
    //   this.hrService.getHeaderText(this.eContractFuncID).then((res) => {
    //     this.eContractHeaderText = res;
    //     this.eContractColumnGrid = [
    //       {
    //         headerText:
    //           this.eContractHeaderText['ContractTypeID'] +
    //           ' | ' +
    //           this.eContractHeaderText['EffectedDate'],

    //         template: this.eContractCol1,
    //         width: '250',
    //       },
    //       {
    //         // headerText: this.eContractHeaderText['ContractNo'] +
    //         // ' - ' +
    //         // this.eContractHeaderText['SignedDate'],
    //         headerText: 'Hợp đồng',
    //         template: this.eContractCol2,
    //         width: '150',
    //       },
    //       {
    //         headerText: this.eContractHeaderText['Note'],
    //         template: this.eContractCol3,
    //         width: '150',
    //       },
    //     ];
    //   });

    //   // let insEContract = setInterval(() => {
    //   //   if (this.eContractGridview) {
    //   //     clearInterval(insEContract);
    //   //     let t = this;
    //   //     this.eContractGridview.dataService.onAction.subscribe((res) => {
    //   //       if (res) {
    //   //         if (res.type == 'loaded') {
    //   //           t.eContractRowCount = 0;
    //   //           t.eContractRowCount = res['data'].length;
    //   //         }
    //   //       }
    //   //     });
    //   //     this.eContractRowCount = this.eContractGridview.dataService.rowCount;
    //   //   }
    //   // }, 100);
    // }
    //#endregion

    if (!this.appointionColumnGrid) {
      this.hrService.getHeaderText(this.appointionFuncID).then((res) => {
        this.appointionHeaderTexts = res;
        this.appointionColumnGrid = [
          {
            // headerText:
            //   this.appointionHeaderTexts['Appoint'] ?? '' + '| Hiệu lực',
            headerTemplate: this.headTempAppointion1,
            template: this.templateAppointionGridCol1,
            width: '150',
          },
          {
            // headerText: this.appointionHeaderTexts['PositionID'],
            headerTemplate: this.headTempAppointion2,
            template: this.templateAppointionGridCol2,
            width: '150',
          },
          {
            // headerText: this.appointionHeaderTexts['OrgUnitID'] + '/ Phòng ban',
            headerTemplate: this.headTempAppointion3,
            template: this.templateAppointionGridCol3,
            width: '150',
          },
        ];
      });

      // let ins = setInterval(() => {
      //   if (this.appointionGridView) {
      //     clearInterval(ins);
      //     let t = this;
      //     this.appointionGridView.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type != null && res.type == 'loaded') {
      //           t.appointionRowCount = res['data'].length;
      //         }
      //       }
      //     });
      //     this.appointionRowCount =
      //       this.appointionGridView.dataService.rowCount;
      //   }
      // }, 100);
    }

    if(!this.dayoffColumnGrid){
      this.hrService.getHeaderText(this.dayoffFuncID).then((res) => {
        this.dayoffHeaderTexts = res;
        this.dayoffColumnGrid = [
          {
            // headerText:
            //   this.dayoffHeaderTexts['KowID'] +
            //   ' | ' +
            //   this.dayoffHeaderTexts['RegisteredDate'],
            headerTemplate: this.headTempDayOff1,
            template: this.templateDayOffGridCol1,
            width: '150',
          },
          {
            // headerText:
            //   this.dayoffHeaderTexts['BeginDate'] +
            //   ' - ' +
            //   this.dayoffHeaderTexts['EndDate'] +
            //   ' | ' +
            //   this.dayoffHeaderTexts['TotalDaysOff'],
            headerTemplate: this.headTempDayOff2,
            template: this.templateDayOffGridCol2,
            width: '150',
          },
          {
            // headerText: this.dayoffHeaderTexts['Reason'],
            headerTemplate: this.headTempDayOff3,
            template: this.templateDayOffGridCol3,
            width: '150',
          },
        ];
      });
    }

    if(!this.businessTravelColumnGrid){
    this.hrService.getHeaderText(this.eBusinessTravelFuncID).then((res) => {
      this.eBusinessTravelHeaderTexts = res;
      this.businessTravelColumnGrid = [
        {
          // headerText:
          //   this.eBusinessTravelHeaderTexts['BusinessPlace'] +
          //   ' | ' +
          //   this.eBusinessTravelHeaderTexts['KowID'],
          headerTemplate: this.headTempBusinessTravel1,
          template: this.templateBusinessTravelGridCol1,
          width: '150',
        },
        {
          // headerText:
          //   this.eBusinessTravelHeaderTexts['PeriodType'] +
          //   ' | ' +
          //   this.eBusinessTravelHeaderTexts['Days'],
          headerTemplate: this.headTempBusinessTravel2,
          template: this.templateBusinessTravelGridCol2,
          width: '150',
        },
        {
          // headerText: this.eBusinessTravelHeaderTexts['BusinessPurpose'],
          headerTemplate: this.headTempBusinessTravel3,
          template: this.templateBusinessTravelGridCol3,
          width: '150',
        },
      ];
    });
    }

    if(!this.awardColumnsGrid){
    this.hrService.getHeaderText(this.awardFuncID).then((res) => {
      this.awardHeaderText = res;
      this.awardColumnsGrid = [
        {
          // headerText:
          //   this.awardHeaderText['AwardID'] +
          //   '|' +
          //   this.awardHeaderText['AwardFormCategory'],
          headerTemplate: this.headTempAwards1,
          template: this.templateAwardGridCol1,
          width: '150',
        },
        {
          // headerText:
          //   this.awardHeaderText['AwardDate'] +
          //   '-' +
          //   this.awardHeaderText['InYear'] +
          //   '|' +
          //   // this.awardHeaderText['DecisionNo'] +
          //   'Số QĐ' +
          //   '-' +
          //   this.awardHeaderText['SignedDate'],
          headerTemplate: this.headTempAwards2,

          template: this.templateAwardGridCol2,
          width: '150',
        },
        {
          // headerText: this.awardHeaderText['Reason'],
          headerTemplate: this.headTempAwards3,
          template: this.templateAwardGridCol3,
          width: '150',
        },
      ];
    });
    }

    if(!this.eDisciplineColumnsGrid){
    this.hrService.getHeaderText(this.eDisciplineFuncID).then((res) => {
      this.eDisciplineHeaderText = res;
      this.eDisciplineColumnsGrid = [
        {
          // headerText:
          //   this.eDisciplineHeaderText['DisciplineID'] +
          //   '|' +
          //   this.eDisciplineHeaderText['DisciplineFormCategory'],
          headerTemplate: this.headTempDisciplines1,

          template: this.templateDisciplineGridCol1,
          width: '150',
        },
        {
          // headerText:
          //   this.eDisciplineHeaderText['DisciplineDate'] +
          //   '|' +
          //   this.eDisciplineHeaderText['FromDate'] +
          //   '-' +
          //   // this.awardHeaderText['DecisionNo'] +
          //   'Số QĐ',
          headerTemplate: this.headTempDisciplines2,

          template: this.templateDisciplineGridCol2,
          width: '150',
        },
        {
          // headerText: this.eDisciplineHeaderText['Reason'],
          headerTemplate: this.headTempDisciplines3,
          template: this.templateDisciplineGridCol3,
          width: '150',
        },
      ];
    });
    }
  }


  UpdateDataOnGrid(gridView: CodxGridviewV2Component ,lst, prdc, dtvl){
    gridView.predicates = prdc,
    gridView.dataValues = dtvl,
    gridView.dataSource = lst;
  }

  checkIsNewestDate(effectedDate, expiredDate){
    if(effectedDate){
      let eff = new Date(effectedDate).toLocaleDateString();
      let date = new Date().toLocaleDateString();
      if(expiredDate){
        let expire = new Date(expiredDate).toLocaleDateString();
        if(new Date(date) >= new Date(eff) && new Date(date) <= new Date(expire)){
          return true;
        }
        return false;
      }
      else{
        if(new Date(date) >= new Date(eff)){
          return true;
        }
        return false;
      }
    }
    return true;
  }

  // checkIsNewestDate(effectedDate, expiredDate){
  //   if(effectedDate){
  //     let eff = new Date(effectedDate).toISOString();
  //     let date = new Date().toISOString();
  //     if(expiredDate){
  //       let expire = new Date(expiredDate).toISOString();
  //       if(date >= eff && date <= expire){
  //         return true;
  //       }
  //       return false;
  //     }
  //     else{
  //       if(date >= eff){
  //         return true;
  //       }
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  add(functionID) {
    switch (functionID) {
      case this.eFamiliesFuncID:
        this.handleEFamilyInfo(this.addHeaderText, 'add', null);
        break;
      case this.ePassportFuncID:
        this.handleEmployeePassportInfo(this.addHeaderText, 'add', null);
        break;
      case this.eVisaFuncID:
        this.handleEmployeeVisaInfo(this.addHeaderText, 'add', null);
        break;
      case this.eWorkPermitFuncID:
        this.handleEmployeeWorkingPermitInfo(this.addHeaderText, 'add', null);
        break;
      case this.eBasicSalaryFuncID:
        this.HandleEmployeeBasicSalariesInfo(this.addHeaderText, 'add', null);
        break;
      case this.eJobSalFuncID:
        this.HandleEmployeeJobSalariesInfo(this.addHeaderText, 'add', null);
        break;
      case this.benefitFuncID:
        this.handlEmployeeBenefit(this.addHeaderText, 'add', null);
        break;
      case this.eAssetFuncID:
        this.HandlemployeeAssetInfo(this.addHeaderText, 'add', null);
        break;
      case this.eContractFuncID:
        this.HandleEContractInfo(this.addHeaderText, 'add', null);
        break;
      case this.appointionFuncID:
        this.HandleEmployeeAppointionInfo(this.addHeaderText, 'add', null);
        break;
      case this.dayoffFuncID:
        this.HandleEmployeeDayOffInfo(this.addHeaderText, 'add', null);
        break;
      case this.eBusinessTravelFuncID:
        this.HandleEBusinessTravel(this.addHeaderText, 'add', null);
        break;
      case this.eExperienceFuncID:
        this.handlEmployeeExperiences(this.addHeaderText, 'add', null);
        break;
      case this.eDegreeFuncID:
        this.HandleEmployeeEDegreeInfo(this.addHeaderText, 'add', null);
        break;
      case this.eCertificateFuncID:
        this.HandleEmployeeECertificateInfo(this.addHeaderText, 'add', null);
        break;
      case this.eSkillFuncID:
        this.HandleEmployeeESkillsInfo(this.addHeaderText, 'add', null);
        break;
      case this.eTrainCourseFuncID:
        this.HandleEmployeeTrainCourseInfo(this.addHeaderText, 'add', null);
        break;
      case this.awardFuncID:
        this.HandleEmployeeEAwardsInfo(this.addHeaderText, 'add', null);
        break;
      case this.eDisciplineFuncID:
        this.HandleEmployeeEDisciplinesInfo(this.addHeaderText, 'add', null);
        break;
      case this.eHealthFuncID:
        this.HandleEmployeeEHealths(this.addHeaderText, 'add', null);
        break;
      case this.eVaccinesFuncID:
        this.HandleEVaccinesInfo(this.addHeaderText, 'add', null);
        break;
      case this.eDiseasesFuncID:
        this.HandleEmployeeEDiseasesInfo(this.addHeaderText, 'add', null);
        break;
      case this.eAccidentsFuncID:
        this.HandleEmployeeAccidentInfo(this.addHeaderText, 'add', null);
        break;
      // case this.eQuitJobFuncID:
      //   this.HandleEmployeeQuitJobInfo(this.addHeaderText, 'add', null);
      //   break;
    }
  }

  //chua dung
  clickMF(event: any, data: any, funcID = null) {
    switch (event.functionID) {
      case this.ePassportFuncID + 'ViewAll':
        this.popupViewAllPassport();
        break;
      case this.eVisaFuncID + 'ViewAll':
        this.popupViewAllVisa();
        break;
      case this.eWorkPermitFuncID + 'ViewAll':
        this.popupViewAllWorkPermit();
        break;
      case this.eContractFuncID + 'ViewAll':
        this.popupViewAllContract();
        break;

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
          this.HandleEmployeeEDegreeInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.HandleEmployeeECertificateInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eAppointions') {
          this.HandleEmployeeAppointionInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eExperiences') {
          this.handlEmployeeExperiences(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'Diseases') {
          this.HandleEmployeeEDiseasesInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eBenefit') {
          this.handlEmployeeBenefit(event.text, 'edit', data);
        } else if (funcID == 'eSkill') {
          this.HandleEmployeeESkillsInfo(event.text, 'edit', data);
        } else if (funcID == 'eTrainCourses') {
          this.HandleEmployeeTrainCourseInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eHealth') {
          this.HandleEmployeeEHealths(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eVaccine') {
          this.HandleEVaccinesInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eDayoff') {
          this.HandleEmployeeDayOffInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eBusinessTravels') {
          this.HandleEBusinessTravel(event.text, 'edit', data);
        } else if (funcID == 'eAwards') {
          this.HandleEmployeeEAwardsInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eDisciplines') {
          this.HandleEmployeeEDisciplinesInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eDiseases') {
          this.HandleEmployeeEDiseasesInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eAccidents') {
          this.HandleEmployeeAccidentInfo(event.text, 'edit', data);
          this.df.detectChanges();
        } else if (funcID == 'eContract') {
          this.HandleEContractInfo(event.text, 'edit', data);
          this.df.detectChanges();
        }
        break;

      case 'SYS02': //delete
        // if (event.isRenderDelete === true) {
        //   this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
        //     if (res) {
        //       this.listCrrBenefit = res;
        //       this.df.detectChanges();
        //     }
        //   });
        //   break;
        // }

        this.notifySvr.alertCode('SYS030').subscribe((x) => {
          if (x.event?.status == 'Y') {
            if (funcID == 'passport') {
              this.hrService
                .DeleteEmployeePassportInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.hrService
                      .GetEmpCurrentPassport(this.employeeID)
                      .subscribe((res) => {
                        this.crrPassport = res;
                        this.df.detectChanges();
                      });
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
                    this.hrService
                      .GetEmpCurrentWorkpermit(this.employeeID)
                      .subscribe((res) => {
                        this.crrWorkpermit = res;
                        this.df.detectChanges();
                      });
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
                    this.hrService
                      .GetEmpCurrentVisa(this.employeeID)
                      .subscribe((res) => {
                        this.crrVisa = res;
                        this.df.detectChanges();
                      });
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eDayoff') {
              this.hrService
                .DeleteEmployeeDayOffInfo(data.recID)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.dayoffGrid, 'delete', null, data);
                    // (this.dayoffGrid.dataService as CRUDService)
                    //   .remove(data)
                    //   .subscribe();
                    // this.dayoffRowCount = this.dayoffRowCount - 1;
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
                    this.hrService
                      .LoadDataEAsset(this.employeeID)
                      .subscribe((res) => {
                        this.lstAsset = res;
                      });
                    this.df.detectChanges();

                    // let i = this.lstAsset.findIndex(
                    //   (x) => x.recID == data.recID
                    // );
                    // // let i = this.lstAsset.indexOf(data);
                    // console.log('data can xoa', data);

                    // console.log(
                    //   'ds tai trc khi xoa',
                    //   this.lstAsset,
                    //   'index ',
                    //   i
                    // );
                    // if (i != -1) {
                    //   this.lstAsset.splice(i, 1);
                    // }
                    // this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eHealth') {
              this.hrService.deleteEHealth(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  this.updateGridView(this.eHealthsGrid, 'delete', null, data);

                  // (this.eHealthsGrid.dataService as CRUDService)
                  //   .remove(data)
                  //   .subscribe();
                  // this.eHealthRowCount = this.eHealthRowCount - 1;
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eBenefit') {
              this.hrService.DeleteEBenefit(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  let index = this.listCrrBenefit.indexOf(data)
                  if(index > -1){
                    this.listCrrBenefit.splice(index, 1);
                  this.df.detectChanges();
                  }

                //   if (data.isCurrent == true) {
                //     // const index = this.listCrrBenefit.indexOf(data);
                //     // if (index > -1) {
                //     //   this.listCrrBenefit.splice(index, 1);
                //     // }
                //     this.hrService
                //       .GetCurrentBenefit(this.employeeID)
                //       .subscribe((res) => {
                //         if (res) {
                //           this.listCrrBenefit = res;
                //           this.df.detectChanges();
                //         }
                //       });
                //   }
                //   (this.eBenefitGrid?.dataService as CRUDService)
                //     ?.remove(data)
                //     .subscribe();
                //   this.hrService
                //     .GetIsCurrentBenefitWithBenefitID(
                //       this.employeeID,
                //       data.benefitID
                //     )
                //     .subscribe((res) => {
                //       (this.eBenefitGrid?.dataService as CRUDService)
                //         ?.update(res)
                //         .subscribe();
                //     });
                //   // this.eBenefitRowCount = this.eBenefitRowCount - 1;
                //   this.df.detectChanges();
                 } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eVaccine') {
              this.hrService.deleteEVaccine(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  this.updateGridView(this.eVaccinesGrid, 'delete', null, data);
                  // (this.eVaccinesGrid.dataService as CRUDService)
                  //   .remove(data)
                  //   .subscribe();
                  // this.eVaccineRowCount = this.eVaccineRowCount - 1;
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
                    (this.jobSalaryGridview?.dataService as CRUDService)
                      ?.remove(data)
                      .subscribe();
                    this.eJobSalaryRowCount--;
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
                    // this.initBasicSalaryInfo();
                    this.hrService
                      .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
                      .subscribe((dataEBaSlary) => {
                        this.crrEBSalary = dataEBaSlary;
                        this.df.detectChanges();
                      });
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
                    this.updateGridView(this.eDegreeGrid, 'delete', null, data);
                    // (this.eDegreeGrid?.dataService as CRUDService)
                    //   ?.remove(data)
                    //   .subscribe();
                    // this.eDegreeRowCount--;
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eSkill') {
              this.hrService.deleteESkill(data.recID).subscribe((res) => {
                if (res == true) {
                  this.notify.notifyCode('SYS008');
                  this.updateGridView(this.skillGrid, 'delete', null, data);
                  // (this.skillGrid?.dataService as CRUDService)
                  //   ?.remove(data)
                  //   .subscribe();
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
                // if (res) {
                //   if (!this.skillGrid && res[0] == true) {
                //     this.lstESkill = res[1];
                //     this.eSkillRowCount--;
                //   } else if (this.lstESkill && res[0] == true) {
                //     this.notify.notifyCode('SYS008');
                //     this.lstESkill = res[1];
                //     this.eSkillRowCount += this.updateGridView(
                //       this.skillGrid,
                //       'delete',
                //       data
                //     );
                //   } else {
                //     this.notify.notifyCode('SYS022');
                //   }
                //   this.df.detectChanges();
                // }
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
                    // this.eCertificateRowCount--;
                    // (this.eCertificateGrid.dataService as CRUDService)
                    //   .remove(data)
                    //   .subscribe();
                  this.updateGridView(this.eCertificateGrid, 'delete', null, data);
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
                    this.updateGridView(this.appointionGridView, 'delete', null, data);
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
                    let index = this.lstExperiences.indexOf(data);
                    if (index != -1) {
                      this.lstExperiences.splice(index, 1);
                    }
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eDiseases') {
              this.hrService
                .DeleteEmployeeEDiseasesInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                  this.updateGridView(this.eDiseasesGrid, 'delete', null, data);
                    // (this.eDiseasesGrid.dataService as CRUDService)
                    //   .remove(data)
                    //   .subscribe();
                    // this.eDiseasesRowCount--;
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                  this.df.detectChanges();
                });
            } else if (funcID == 'eTrainCourses') {
              this.hrService
                .deleteEmployeeTrainCourseInfo(data.recID)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    // let i = this.lstEdiseases.indexOf(data);
                    // if (i != -1) {
                    //   this.lstEdiseases.splice(i, 1);
                    // }
                    // (this.eTrainCourseGrid.dataService as CRUDService)
                    //   .remove(data)
                    //   .subscribe();
                    // this.eTrainCourseRowCount--;
                    this.updateGridView(this.eTrainCourseGrid, 'delete', null, data);
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eBusinessTravels') {
              this.hrService.deleteEBusinessTravels(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  this.updateGridView(this.businessTravelGrid, 'delete', null, data);
                  // (this.businessTravelGrid.dataService as CRUDService)
                  //   .remove(data)
                  //   .subscribe();
                  // this.eBusinessTravelRowCount =
                  //   this.eBusinessTravelRowCount - 1;
                }
              });
            } else if (funcID == 'eAwards') {
              this.hrService
                .DeleteEmployeeAwardInfo(data.recID)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.AwardGrid, 'delete', null, data);
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eDisciplines') {
              this.hrService
                .DeleteEmployeeDisciplineInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(this.eDisciplineGrid, 'delete', null, data);
                    // (this.eDisciplineGrid.dataService as CRUDService)
                    //   .remove(data)
                    //   .subscribe();
                    //this.eDisciplineRowCount--;
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eContract') {
              this.hrService.deleteEContract(data).subscribe((res) => {
                if (res && res[0]) {
                  this.notify.notifyCode('SYS008');
                  this.getECurrentContract();
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eAccidents') {
              this.hrService.deleteEAccident(data?.recID).subscribe((res) => {
                if (res) {
                  this.notify.notifyCode('SYS008');
                  this.updateGridView(this.eAccidentGridView, 'delete', null, data);

                  // (this.eAccidentGridView.dataService as CRUDService)
                  //   ?.remove(data)
                  //   .subscribe();
                  // this.eAccidentsRowCount--;
                  this.df.detectChanges();
                } else this.notify.notifyCode('SYS022');
              });
            }
          }
        });
        break;

      case 'SYS04': //copy
        if (funcID == 'passport') {
          this.copyValue(event.text, data, 'ePassport');
          this.df.detectChanges();
        } else if (funcID == 'eDayoff') {
          this.copyValue(event.text, data, 'eDayoff');
          this.df.detectChanges();
        } else if (funcID == 'workpermit') {
          this.copyValue(event.text, data, 'eWorkPermit');
          this.df.detectChanges();
        } else if (funcID == 'visa') {
          this.copyValue(event.text, data, 'eVisa');
          this.df.detectChanges();
        } else if (funcID == 'family') {
          this.copyValue(event.text, data, 'eFamilies');
          this.df.detectChanges();
        } else if (funcID == 'jobSalary') {
          this.copyValue(event.text, data, 'jobSalary');
          this.df.detectChanges();
        } else if (funcID == 'basicSalary') {
          this.copyValue(event.text, data, 'basicSalary');
          this.df.detectChanges();
        } else if (funcID == 'Assets') {
          this.copyValue(event.text, data, 'Assets');
          this.df.detectChanges();
        } else if (funcID == 'eDegrees') {
          // this.HandleEmployeeEDegreeInfo(event.text, 'copy', data);
          this.copyValue(event.text, data, 'eDegrees');
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.copyValue(event.text, data, 'eCertificate');
          // this.HandleEmployeeECertificateInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eAppointions') {
          this.copyValue(event.text, data, 'eAppointions');
          // this.HandleEmployeeAppointionInfo(event.text, 'copy', data);
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
          this.HandleEmployeeEDiseasesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eSkill') {
          this.copyValue(event.text, data, 'eSkills');
          this.df.detectChanges();
        } else if (funcID == 'eTrainCourses') {
          this.copyValue(event.text, data, 'eTrainCourses');
          this.df.detectChanges();
        } else if (funcID == 'eBenefit') {
          this.copyValue(event.text, data, 'benefit');
          this.df.detectChanges();
        } else if (funcID == 'eBusinessTravels') {
          this.copyValue(event.text, data, 'eBusinessTravels');
        } else if (funcID == 'eAwards') {
          this.HandleEmployeeEAwardsInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eDisciplines') {
          this.copyValue(event.text, data, 'eDisciplines');
          // this.HandleEmployeeEDisciplinesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eDiseases') {
          this.HandleEmployeeEDiseasesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eAccidents') {
          this.copyValue(event.text, data, 'eAccidents');
          this.df.detectChanges();
        } else if (funcID == 'eContract') {
          this.copyValue(event.text, data, 'eContract');
          this.df.detectChanges();
        }
        break;
    }
  }

  popupViewAllContract() {
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.eContractFuncID,
      {
        funcID: this.eContractFuncID,
        employeeId: this.employeeID,
        headerText: this.getFormHeader(this.eContractFuncID),
        sortModel: this.eContractSortModel,
        //columnGrid: this.passportColumnGrid,
        formModel: this.eContractFormModel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        if (res?.event == 'none') {
          this.crrEContract = null;
        } else {
          this.crrEContract = res.event;
        }
        this.df.detectChanges();
      }
    });
  }

  popupViewAllWorkPermit() {
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.eWorkPermitFuncID,
      {
        funcID: this.eWorkPermitFuncID,
        employeeId: this.employeeID,
        headerText: this.getFormHeader(this.eWorkPermitFuncID),
        sortModel: this.workPermitSortModel,
        //columnGrid: this.passportColumnGrid,
        formModel: this.eWorkPermitFormModel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        if (res?.event == 'none') {
          this.crrWorkpermit = null;
        } else {
          this.crrWorkpermit = res.event;
        }
        this.df.detectChanges();
      }
    });
  }

  popupViewAllVisa() {
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.eVisaFuncID,
      {
        funcID: this.eVisaFuncID,
        employeeId: this.employeeID,
        headerText: this.getFormHeader(this.eVisaFuncID),
        sortModel: this.visaSortModel,
        //columnGrid: this.passportColumnGrid,
        formModel: this.eVisaFormModel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        if (res?.event == 'none') {
          this.crrVisa = null;
        } else {
          this.crrVisa = res.event;
        }
        this.df.detectChanges();
      }
    });
  }

  popupViewAllPassport() {
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.ePassportFuncID,
      {
        funcID: this.ePassportFuncID,
        employeeId: this.employeeID,
        headerText: this.getFormHeader(this.ePassportFuncID),
        sortModel: this.passportSortModel,
        //columnGrid: this.passportColumnGrid,
        formModel: this.ePassportFormModel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        if (res?.event == 'none') {
          this.crrPassport = null;
        } else {
          this.crrPassport = res.event;
        }
        this.df.detectChanges();
      }
    });
  }

  //chua dung
  clickTab(funcList: any) {
    debugger
    this.crrFuncTab = funcList.functionID;
    switch (this.crrFuncTab) {
      case this.curriculumVitaeFuncID:
        this.lstBtnAdd = this.lstFuncID.filter(
          (p) =>
            (p.parentID == this.curriculumVitaeFuncID ||
              p.parentID == this.legalInfoFuncID ||
              p.parentID == this.foreignWorkerFuncID) &&
            p.entityName != this.view.formModel.entityName
        );
        break;
      case this.jobInfoFuncID:
        this.lstBtnAdd = this.lstFuncJobInfo;
        this.lstBtnAdd = this.lstBtnAdd.filter(
          (p) => p.entityName != this.view.formModel.entityName
        );
        break;
      case this.salaryBenefitInfoFuncID:
        this.lstBtnAdd = this.lstFuncSalaryBenefit;
        this.initEmpSalary();
        break;
      case this.workingProcessInfoFuncID:
        this.lstBtnAdd = this.lstFuncHRProcess;
        this.initEmpProcess();
        break;
      case this.knowledgeInfoFuncID:
        this.lstBtnAdd = this.lstFuncKnowledge;
        this.initEmpKnowledge();
        break;
      case this.healthInfoFuncID:
        this.lstBtnAdd = this.lstFuncHealth;
        this.initEmpHealth();
        break;
      case this.quitJobInfoFuncID:
        this.lstBtnAdd = null;
        break;
    }
  }

  editEmployeeQuitJobInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEquitjobComponent,
      {
        funcID: this.eQuitJobFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.ePartyFuncID),
        employeeId: this.employeeID,
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res?.event) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
      }
    });
  }

  editEmployeePartyInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEmployeePartyInfoComponent,
      {
        funcID: this.ePartyFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.ePartyFuncID),
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res?.event) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
  }

  editEmployeeForeignWorkerInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupForeignWorkerComponent,
      {
        funcID: this.ePartyFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.foreignWorkerFuncID),
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res?.event) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
  }

  editAssuranceTaxBankAccountInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEAssurTaxBankComponent,
      {
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eAssurFuncID),
        functionID: this.eAssurFuncID,
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res?.event) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
  }

  editEmployeeSelfInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupESelfInfoComponent,
      {
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eInfoFuncID),
        funcID: this.eInfoFuncID,
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res?.event) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
        this.view.dataService.clear();
      }
    });
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
        if (res.event.orgUnitID != this.infoPersonal.orgUnitID) {
          this.hrService
            .getOrgTreeByOrgID(res.event.orgUnitID, 3)
            .subscribe((res) => {
              if (res) {
                this.lstOrg = res;
              }
            });
        }
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        // this.getManagerEmployeeInfoById();
        this.df.detectChanges();
      }
    });
  }

  editEmployeeTimeCardInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogEdit = this.callfunc.openSide(
      PopupETimeCardComponent,
      {
        funcID: this.eTimeCardFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eTimeCardFuncID),
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
      }
    });
  }

  editEmployeeCaculateSalaryInfo(actionHeaderText) {
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogEdit = this.callfc.openSide(
      PopupECalculateSalaryComponent,
      {
        funcID: this.eCalSalaryFuncID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eCalSalaryFuncID),
        dataObj: this.infoPersonal,
      },
      option
    );
    dialogEdit.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event));
        this.df.detectChanges();
      }
    });
  }

  handlEmployeeBenefit(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.benefitFormodel;
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
          if (res.event){
            if(this.checkIsNewestDate(res.event.effectedDate, res.event.expiredDate) == true){
              this.listCrrBenefit.push(res.event);
            }
          }
        } else if (actionType == 'edit') {
          debugger
          if(res.event){
            let kq = this.checkIsNewestDate(res.event.effectedDate, res.event.expiredDate)
            if(kq == true){
              let index = this.listCrrBenefit.indexOf(data)
              if(index >-1){
                this.listCrrBenefit[index] = res.event;
              }
              // this.listCrrBenefit.push(res.event);
            }
            else if(kq == false){
              let index = this.listCrrBenefit.indexOf(data)
              if(index){
                this.listCrrBenefit.splice(index, 1);
              }
            }
            this.df.detectChanges();
          }
          // (this.eBenefitGrid?.dataService as CRUDService)
          //   ?.update(res.event)
          //   .subscribe();
        }

      }
    });
  }

  handlEmployeeExperiences(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.eExperienceFormModel;
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
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        res.event.fromDate = res.event.fromDate.toISOString();
        if (actionType == 'add' || actionType == 'copy') {

          this.lstExperiences.push(res.event);
        } else if (actionType == 'edit') {
          let index = this.lstExperiences.indexOf(data);
          this.lstExperiences[index] = res.event;
        }
        let sortedList = this.hrService.sortAscByProperty(
          this.lstExperiences,
          'fromDate'
        );
        this.lstExperiences = sortedList;
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeJobSalariesInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.FormModel = this.eJobSalaryFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEJobSalariesComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eJobSalFuncID),
        employeeId: this.employeeID,
        funcID: this.eJobSalFuncID,
        jobSalaryObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.jobSalaryGridview?.dataService as CRUDService)?.clear();
      else {
        this.eJobSalaryRowCount = this.updateGridView(
          this.jobSalaryGridview,
          actionType,
          res.event[0]
        );
        res.event[1]?.forEach((element) => {
          if (element.isCurrent) {
            this.crrJobSalaries = element;
          }
          (this.jobSalaryGridview?.dataService as CRUDService)
            ?.update(element)
            .subscribe();
        });
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeBasicSalariesInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService =
      this.basicSalaryGridview?.dataService ?? this.view?.dataService;
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
      if (!res?.event) {
        (this.basicSalaryGridview?.dataService as CRUDService)?.clear();
      } else {
        if (res.event){
          if(this.checkIsNewestDate(res.event.effectedDate, res.event.expiredDate) == true){
            this.crrEBSalary = res.event;
          }
          else{
            this.hrService
            .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
            .subscribe((dataEBaSlary) => {
              this.crrEBSalary = dataEBaSlary;
            });
          }
        }
      }
      this.df.detectChanges();
    });
  }

  handleEFamilyInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
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
    //option.DataService = this.passportGridview?.dataService;
    option.FormModel = this.ePassportFormModel;
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
      if (!res?.event) {
      } else {
        if (actionType == 'add' || actionType == 'copy') {
          if (
            !this.crrPassport ||
            res?.event.issuedDate > this.crrPassport.issuedDate
          ) {
            this.crrPassport = res?.event;
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          debugger
          if (
            res?.event.issuedDate >= this.crrPassport.issuedDate
          ) {
            this.crrPassport = res.event;
          } else {
            this.hrService
              .GetEmpCurrentPassport(this.employeeID)
              .subscribe((res) => {
                this.crrPassport = res;
                this.df.detectChanges();
              });
          }
        }
      }
      this.df.detectChanges();
    });
  }


  HandleEmployeeDayOffInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.dayoffGrid.dataService;
    option.FormModel = this.dayoffGrid.formModel;
    option.Width = '550px';

    let dialogAdd = this.callfunc.openSide(
      PopupEdayoffsComponent,
      {
        actionType: actionType,
        dayoffObj: data,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.dayoffFuncID),
        employeeID: this.employeeID,
        funcID: this.dayoffFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(this.dayoffGrid, actionType, res.event, null);
      this.df.detectChanges();
    }});
  }

  handleEmployeeWorkingPermitInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEWorkPermitsComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eWorkPermitFuncID),
        employeeId: this.employeeID,
        funcID: this.eWorkPermitFuncID,
        workPermitObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) {
        // (this.passportGridview.dataService as CRUDService).clear();
      } else {
        if (actionType == 'add' || actionType == 'copy') {
          if (
            !this.crrWorkpermit ||
            res?.event.issuedDate > this.crrWorkpermit.issuedDate
          ) {
            this.crrWorkpermit = res?.event;
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          if (
            res?.event.issuedDate >= this.crrWorkpermit.issuedDate
          ) {
            this.crrWorkpermit = res.event
          } else {
            this.hrService
              .GetEmpCurrentWorkpermit(this.employeeID)
              .subscribe((res) => {
                this.crrWorkpermit = res;
                this.df.detectChanges();
              });
          }
        }
        // this.passportRowCount += this.updateGridView(
        //   this.passportGridview,
        //   actionType,
        //   res?.event
        // );
      }
      this.df.detectChanges();
    });
  }

  handleEmployeeVisaInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEVisasComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eVisaFuncID),
        employeeId: this.employeeID,
        funcID: this.eVisaFuncID,
        visaObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) {
        // (this.passportGridview.dataService as CRUDService).clear();
      } else {
        if (actionType == 'add' || actionType == 'copy') {
          debugger
          if (
            !this.crrVisa ||
            res?.event.issuedDate > this.crrVisa.issuedDate
          ) {
            this.crrVisa = res?.event;
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          if (
            res?.event.issuedDate >= this.crrVisa.issuedDate 
          ) {
            this.crrVisa = res.event;
          } else {
            this.hrService
              .GetEmpCurrentPassport(this.employeeID)
              .subscribe((res) => {
                this.crrVisa = res;
                this.df.detectChanges();
              });
          }
        }
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeEDisciplinesInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDisciplinesComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eDisciplineFuncID),
        employeeId: this.employeeID,
        empObj: this.infoPersonal,
        funcID: this.eDisciplineFuncID,
        dataInput: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.eDisciplineGrid?.dataService as CRUDService).clear();
      if (res.event)
        this.updateGridView(this.eDisciplineGrid, actionType, res.event, null);
      this.df.detectChanges();
    });
  }

  HandleEmployeeAccidentInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.eAccidentGridView?.dataService;
    option.FormModel = this.eAccidentsFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEaccidentsComponent,
      {
        actionType: actionType,
        employeeId: this.employeeID,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eAccidentsFuncID),
        funcID: this.eAccidentsFuncID,
        accidentObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.eAccidentGridView?.dataService as CRUDService)?.clear();
      else if(res.event) {
        this.updateGridView(this.eAccidentGridView, actionType, res.event, data);
      }
      this.df.detectChanges();
    });
  }

  HandlemployeeAssetInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.eAssetFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEAssetsComponent,
      {
        actionType: actionType,
        assetObj: data,
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
          (this.eAssetGrid?.dataService as CRUDService)
            ?.add(res.event)
            .subscribe();
        } else if (actionType == 'edit') {
          (this.eAssetGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe();
        }
        this.hrService.LoadDataEAsset(this.employeeID).subscribe((res) => {
          this.lstAsset = res;
        });
        this.df.detectChanges();
      }
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
        employeeId: this.employeeID,
        funcID: this.appointionFuncID,
        appointionObj: data,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.appointionFuncID),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(this.appointionGridView, actionType, res.event);
        this.df.detectChanges();
      }
    });
  }

  HandleEmployeeECertificateInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService = this.eCertificateGrid?.dataService;
    option.FormModel = this.eCertificateFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      PopupECertificatesComponent,
      {
        trainFromHeaderText: this.eSkillHeaderText['TrainFrom'],
        trainToHeaderText: this.eSkillHeaderText['TrainTo'],
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eCertificateFuncID),
        employeeId: this.employeeID,
        funcID: this.eCertificateFuncID,
        dataInput: data,
      },
      option
    );
    // RELOAD
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else if (res.event)
        this.updateGridView(this.eCertificateGrid, actionType, res.event, data);
      this.df.detectChanges();
    });
  }

  HandleEmployeeEDegreeInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.eDegreeGrid?.dataService;
    option.FormModel = this.eDegreeFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDegreesComponent,
      {
        trainFromHeaderText: this.eDegreeHeaderText['TrainFrom'],
        trainToHeaderText: this.eDegreeHeaderText['TrainTo'],
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eDegreeFuncID),
        employeeId: this.employeeID,
        degreeObj: data,
        funcID: this.eDegreeFuncID,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (res.event)
        this.updateGridView(this.eDegreeGrid, actionType, res.event, data);
      this.df.detectChanges();
    });
  }

  HandleEmployeeESkillsInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.skillGrid?.dataService;
    option.FormModel = this.eSkillFormmodel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      PopupESkillsComponent,
      {
        trainFromHeaderText: this.eSkillHeaderText['TrainFrom'],
        trainToHeaderText: this.eSkillHeaderText['TrainTo'],
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eSkillFuncID),
        employeeId: this.employeeID,
        funcID: this.eSkillFuncID,
        dataInput: data,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) (this.skillGrid?.dataService as CRUDService)?.clear();
      else if (res.event != null) {
        this.updateGridView(this.skillGrid, actionType, res.event, data);
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeTrainCourseInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.DataService = this.eTrainCourseGrid?.dataService;
    option.FormModel = this.eTrainCourseFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupETraincourseComponent,
      {
        trainFromHeaderText: this.eSkillHeaderText['TrainFrom'],
        trainToHeaderText: this.eSkillHeaderText['TrainTo'],
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eTrainCourseFuncID),
        employeeId: this.employeeID,
        funcID: this.eTrainCourseFuncID,
        dataInput: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.eTrainCourseGrid?.dataService as CRUDService).clear();
      else if (res.event)
        this.updateGridView(this.eTrainCourseGrid, actionType, res.event, data);
      this.df.detectChanges();
    });
  }


  addEContractInfo(actionHeaderText, actionType: string, data: any) {
    //Cảnh báo nếu thêm mới HĐLĐ, mà trước đó có HĐ đang hiệu lực là HĐ không xác định thời hạn => Kiểm tra trước khi thêm
    if (actionType == 'add' && this.crrEContract && this.lstContractType) {
      var item = this.lstContractType.filter(
        (p) =>
          p.contractTypeID == this.crrEContract.contractTypeID &&
          p.contractGroup == '1'
      );
      if (item && item[0]) {
        this.notify.alertCode('HR008').subscribe((res) => {
          if (res?.event?.status == 'Y') {
            this.HandleEContractInfo(actionHeaderText, actionType, data);
          }
        });
      } else {
        this.HandleEContractInfo(actionHeaderText, actionType, data);
      }
    } else {
      this.HandleEContractInfo(actionHeaderText, actionType, data);
    }
  }

  HandleEContractInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '850px';
    option.FormModel = this.eContractFormModel;
    let isAppendix = false;

    if (
      (actionType == 'edit' || actionType == 'copy') &&
      data.isAppendix == true
    ) {
      isAppendix = true;
    }
    let dialogAdd = this.callfunc.openSide(
      isAppendix ? PopupSubEContractComponent : PopupEProcessContractComponent,
      {
        actionType: actionType,
        dataObj: data,
        empObj: this.infoPersonal,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eContractFuncID),
        employeeId: this.employeeID,
        funcID: this.eContractFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else if (res.event) {
        if(this.checkIsNewestDate(res.event.effectedDate, res.event.expiredDate) == true){
          this.crrEContract = res.event;
        }
        else{
          this.getECurrentContract();
        }
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeEHealths(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '850px';
    option.FormModel = this.eHealthsGrid.formModel;
    let dialogAdd = this.callfunc.openSide(
      PopupEhealthsComponent,
      {
        actionType: actionType,
        healthObj: data,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eHealthFuncID),
        employeeId: this.employeeID,
        funcID: this.eHealthFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(this.eHealthsGrid, actionType, res.event, data);
      }
      this.df.detectChanges();
    });
  }

  HandleEmployeeEAwardsInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.AwardGrid?.dataService;
    option.FormModel = this.awardFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEAwardsComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.awardFuncID),
        employeeId: this.employeeID,
        funcID: this.awardFuncID,
        dataInput: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) (this.AwardGrid?.dataService as CRUDService).clear();
      if (res.event[0])
        this.updateGridView(this.AwardGrid, actionType, res.event[0], data);
      this.df.detectChanges();
    });
  }

  HandleEmployeeEDiseasesInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '850px';
    option.FormModel = this.view.formModel;
    option.DataService = this.eDiseasesGrid?.dataService;
    let dialogAdd = this.callfc.openSide(
      PopupEDiseasesComponent, 
      {
        actionType: actionType,
        funcID: this.eDiseasesFuncID,
        employeeId: this.employeeID,
        dataInput: data,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eDiseasesFuncID),
      }, option);
    dialogAdd.closed.subscribe((res) => {
      if (res.event) this.updateGridView(this.eDiseasesGrid, actionType, res.event, data);
      this.df.detectChanges();
    });
  }

  HandleEBusinessTravel(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.EBusinessTravelFormodel;
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
        this.updateGridView(this.businessTravelGrid, actionType, res.event, null);
      }
      this.df.detectChanges();
    });
  }


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
        this.updateGridView(this.eVaccinesGrid, actionType, res.event, data);
      }
      this.df.detectChanges();
    });
  }

  addSkill() {
    this.hrService.addSkill(null).subscribe();
  }

  addSkillGrade() {
    this.hrService.addSkillGrade(null).subscribe();
  }

  refreshGridViews(){
    // Anh Trầm chỉ, setInterval đợi nó load cái grid xong mới gọi refresh
    let ins = setInterval(()=>{
      if(this.eDisciplineGrid){
        clearInterval(ins);
        this.eDisciplineGrid.refresh();
      }
    },100)

    let ins2 = setInterval(()=>{
      if(this.appointionGridView){
        clearInterval(ins2);
        this.appointionGridView.refresh();
      }
    },100)

    let ins3 = setInterval(()=>{
      if(this.dayoffGrid){
        clearInterval(ins3);
        this.dayoffGrid.refresh();
      }
    },100)

    let ins4 = setInterval(()=>{
      if(this.businessTravelGrid){
        clearInterval(ins4);
        this.businessTravelGrid.refresh();
      }
    },100)

    let ins5 = setInterval(()=>{
      if(this.AwardGrid){
        clearInterval(ins5);
        this.AwardGrid.refresh();
      }
    },100)

    let ins6 = setInterval(()=>{
      if(this.eDegreeGrid){
        clearInterval(ins6);
        this.eDegreeGrid.refresh();
      }
    },100)

    let ins7 = setInterval(()=>{
      if(this.eCertificateGrid){
        clearInterval(ins7);
        this.eCertificateGrid.refresh();
      }
    },100)

    let ins8 = setInterval(()=>{
      if(this.skillGrid){
        clearInterval(ins8);
        this.skillGrid.refresh();
      }
    },100)

    let ins9 = setInterval(()=>{
      if(this.eTrainCourseGrid){
        clearInterval(ins9);
        this.eTrainCourseGrid.refresh();
      }
    },100)

    let ins10 = setInterval(()=>{
      if(this.eAccidentGridView){
        clearInterval(ins10);
        this.eAccidentGridView.refresh();
      }
    },100)

    let ins11 = setInterval(()=>{
      if(this.eDiseasesGrid){
        clearInterval(ins11);
        this.eDiseasesGrid.refresh();
      }
    },100)

    let ins12 = setInterval(()=>{
      if(this.eHealthsGrid){
        clearInterval(ins12);
        this.eHealthsGrid.refresh();
      }
    },100)

    let ins13 = setInterval(()=>{
      if(this.eVaccinesGrid){
        clearInterval(ins13);
        this.eVaccinesGrid.refresh();
      }
    },100)
  }

  loadDataWhenChangeEmp(){
    switch (this.crrFuncTab) {
      case this.curriculumVitaeFuncID:
        // this.lstBtnAdd = this.lstFuncID.filter(
        //   (p) =>
        //     (p.parentID == this.curriculumVitaeFuncID ||
        //       p.parentID == this.legalInfoFuncID ||
        //       p.parentID == this.foreignWorkerFuncID) &&
        //     p.entityName != this.view.formModel.entityName
        // );
        break;
      case this.jobInfoFuncID:
        // this.lstBtnAdd = this.lstFuncJobInfo;
        // this.lstBtnAdd = this.lstBtnAdd.filter(
        //   (p) => p.entityName != this.view.formModel.entityName
        // );
        break;
      case this.salaryBenefitInfoFuncID:
        // this.lstBtnAdd = this.lstFuncSalaryBenefit;
        this.initEmpSalary();
        break;
      case this.workingProcessInfoFuncID:
        // this.lstBtnAdd = this.lstFuncHRProcess;
        this.initEmpProcess();
        break;
      case this.knowledgeInfoFuncID:
        // this.lstBtnAdd = this.lstFuncKnowledge;
        this.initEmpKnowledge();
        break;
      case this.healthInfoFuncID:
        // this.lstBtnAdd = this.lstFuncHealth;
        break;
      // case this.quitJobInfoFuncID:
      //   this.lstBtnAdd = this.lstFuncQuitJob;
      //   break;
    }
  }


  nextEmp() {
    if (this.listEmp) {
      debugger
      // console.log('vi tri tim trong mang', this.listEmp.findIndex(
      //   (x: any) => this.employeeID == x['EmployeeID']
      // ))
      this.crrIndex += 1;
      if(this.crrIndex == this.listEmp.length - 1){
        let requestNewEmpPage = new DataRequest();
        requestNewEmpPage.entityName = this.request.entityName;
        requestNewEmpPage.gridViewName = this.request.gridViewName;
        requestNewEmpPage.page = this.request.page + 1;
        requestNewEmpPage.predicate = this.request.predicate;
        requestNewEmpPage.dataValue = this.request.dataValue;
        requestNewEmpPage.selector = "EmployeeID;";
        requestNewEmpPage.pageSize = this.request.pageSize;
        this.hrService.loadData('HR', requestNewEmpPage).subscribe((res) =>{
          debugger
          if(res && res[0].length > 0){
            this.listEmp.push(...res[0])
            this.request.page += 1;
            this.navigateEmp(0, true);
          }
          else{
            this.navigateEmp(0);
          }
        })
      }
      if (this.crrIndex > -1 && this.crrIndex != this.listEmp.length - 1) {
        this.navigateEmp(0);
      }
      this.loadDataWhenChangeEmp();
      this.refreshGridViews();
    }
  }

  navigateEmp(isNextEmp, isNextPage?){
    if(isNextPage == true){
      debugger
      let newPageNum = Number(this.pageNum) + 1
      this.pageNum = newPageNum;
    }
    if (this.crrIndex > -1) {
      this.LoadedEInfo = false;
      let urlView = '/hr/employeedetail/HRT03b';
      this.codxService.replaceNavigate(
        urlView,
        {
          employeeID: this.listEmp[this.crrIndex + isNextEmp]?.EmployeeID,
          page: this.pageNum.toString(),
          totalPage: this.maxPageNum
        },
        {
          data: this.listEmp,
          request: this.request,
        }
      );
    }
  }

  previousEmp() {
    if (this.listEmp) {
      if (this.crrIndex > -1) {
        this.navigateEmp(-1);
      }
      this.loadDataWhenChangeEmp();
      this.refreshGridViews();
    }
  }

  @ViewChild('eDiseasesGridView') eDiseasesGrid: CodxGridviewV2Component;
  @ViewChild('eAwardGridView') AwardGrid: CodxGridviewV2Component;
  @ViewChild('eDisciplineGridView') eDisciplineGrid: CodxGridviewV2Component;
  @ViewChild('businessTravelGrid') businessTravelGrid: CodxGridviewV2Component;
  @ViewChild('eTrainCourseGridView') eTrainCourseGrid: CodxGridviewV2Component;
  @ViewChild('eSkillGridViewID') skillGrid: CodxGridviewV2Component;
  @ViewChild('eCertificateGridView') eCertificateGrid: CodxGridviewV2Component;
  @ViewChild('eExperienceGridView') eExperienceGrid: CodxGridviewV2Component;
  @ViewChild('eAssetGridView') eAssetGrid: CodxGridviewV2Component;
  @ViewChild('eHealthsGridView') eHealthsGrid: CodxGridviewV2Component;
  @ViewChild('eVaccinesGridView') eVaccinesGrid: CodxGridviewV2Component;
  @ViewChild('gridView') eBenefitGrid: CodxGridviewV2Component;
  @ViewChild('eDegreeGridView') eDegreeGrid: CodxGridviewV2Component;
  @ViewChild('dayoffGridView') dayoffGrid: CodxGridviewV2Component;
  @ViewChild('templateBenefitID', { static: true })
  templateBenefitID: TemplateRef<any>;
  @ViewChild('templateBenefitAmt', { static: true })
  templateBenefitAmt: TemplateRef<any>;
  @ViewChild('templateBenefitEffected', { static: true })
  templateBenefitEffected: TemplateRef<any>;
  @ViewChild('filterTemplateBenefit', { static: true })
  filterTemplateBenefit: TemplateRef<any>;

  @ViewChild('templateEDegreeGridCol1', { static: true })
  templateEDegreeGridCol1: TemplateRef<any>;
  @ViewChild('templateEDegreeGridCol2', { static: true })
  templateEDegreeGridCol2: TemplateRef<any>;
  @ViewChild('templateEDegreeGridCol3', { static: true })
  templateEDegreeGridCol3: TemplateRef<any>;
  @ViewChild('templateEDegreeGridMoreFunc', { static: true })
  templateEDegreeGridMoreFunc: TemplateRef<any>;
  @ViewChild('headTempDegree1', { static: true })
  headTempDegree1: TemplateRef<any>;
  @ViewChild('headTempDegree2', { static: true })
  headTempDegree2: TemplateRef<any>;
  @ViewChild('headTempDegree3', { static: true })
  headTempDegree3: TemplateRef<any>;

  @ViewChild('tempCol1EHealthGrid', { static: true })
  tempCol1EHealthGrid: TemplateRef<any>;
  @ViewChild('tempCol2EHealthGrid', { static: true })
  tempCol2EHealthGrid: TemplateRef<any>;
  @ViewChild('tempCol3EHealthGrid', { static: true })
  tempCol3EHealthGrid: TemplateRef<any>;
  @ViewChild('headTempHealth1', { static: true })
  headTempHealth1: TemplateRef<any>;
  @ViewChild('headTempHealth2', { static: true })
  headTempHealth2: TemplateRef<any>;
  @ViewChild('headTempHealth3', { static: true })
  headTempHealth3: TemplateRef<any>;

  @ViewChild('tempEVaccineGridCol1', { static: true })
  tempEVaccineGridCol1: TemplateRef<any>;
  @ViewChild('tempEVaccineGridCol2', { static: true })
  tempEVaccineGridCol2: TemplateRef<any>;
  @ViewChild('tempEVaccineGridCol3', { static: true })
  tempEVaccineGridCol3: TemplateRef<any>;
  @ViewChild('headTempVaccine1', { static: true })
  headTempVaccine1: TemplateRef<any>;
  @ViewChild('headTempVaccine2', { static: true })
  headTempVaccine2: TemplateRef<any>;
  @ViewChild('headTempVaccine3', { static: true })
  headTempVaccine3: TemplateRef<any>;

  @ViewChild('templateECertificateGridCol1', { static: true })
  templateECertificateGridCol1: TemplateRef<any>;
  @ViewChild('templateECertificateGridCol2', { static: true })
  templateECertificateGridCol2: TemplateRef<any>;
  @ViewChild('templateECertificateGridCol3', { static: true })
  templateECertificateGridCol3: TemplateRef<any>;
  @ViewChild('headTempCertificate1', { static: true })
  headTempCertificate1: TemplateRef<any>;
  @ViewChild('headTempCertificate2', { static: true })
  headTempCertificate2: TemplateRef<any>;
  @ViewChild('headTempCertificate3', { static: true })
  headTempCertificate3: TemplateRef<any>;

  @ViewChild('templateESkillGridCol1', { static: true })
  templateESkillGridCol1: TemplateRef<any>;
  @ViewChild('templateESkillGridCol2', { static: true })
  templateESkillGridCol2: TemplateRef<any>;
  @ViewChild('templateESkillGridCol3', { static: true })
  templateESkillGridCol3: TemplateRef<any>;
  @ViewChild('headTempSkill1', { static: true })
  headTempSkill1: TemplateRef<any>;
  @ViewChild('headTempSkill2', { static: true })
  headTempSkill2: TemplateRef<any>;
  @ViewChild('headTempSkill3', { static: true })
  headTempSkill3: TemplateRef<any>;

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
  @ViewChild('headTempTrainCourse1', { static: true })
  headTempTrainCourse1: TemplateRef<any>;
  @ViewChild('headTempTrainCourse2', { static: true })
  headTempTrainCourse2: TemplateRef<any>;
  @ViewChild('headTempTrainCourse3', { static: true })
  headTempTrainCourse3: TemplateRef<any>;

  @ViewChild('templateBusinessTravelGridCol1', { static: true })
  templateBusinessTravelGridCol1: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol2', { static: true })
  templateBusinessTravelGridCol2: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol3', { static: true })
  templateBusinessTravelGridCol3: TemplateRef<any>;
  @ViewChild('headTempBusinessTravel1', { static: true })
  headTempBusinessTravel1: TemplateRef<any>;
  @ViewChild('headTempBusinessTravel2', { static: true })
  headTempBusinessTravel2: TemplateRef<any>;
  @ViewChild('headTempBusinessTravel3', { static: true })
  headTempBusinessTravel3: TemplateRef<any>;

  @ViewChild('templateAwardGridCol1', { static: true })
  templateAwardGridCol1: TemplateRef<any>;
  @ViewChild('templateAwardGridCol2', { static: true })
  templateAwardGridCol2: TemplateRef<any>;
  @ViewChild('templateAwardGridCol3', { static: true })
  templateAwardGridCol3: TemplateRef<any>;
  @ViewChild('headTempAwards1', { static: true })
  headTempAwards1: TemplateRef<any>;
  @ViewChild('headTempAwards2', { static: true })
  headTempAwards2: TemplateRef<any>;
  @ViewChild('headTempAwards3', { static: true })
  headTempAwards3: TemplateRef<any>;

  @ViewChild('templateDisciplineGridCol1', { static: true })
  templateDisciplineGridCol1: TemplateRef<any>;
  @ViewChild('templateDisciplineGridCol2', { static: true })
  templateDisciplineGridCol2: TemplateRef<any>;
  @ViewChild('templateDisciplineGridCol3', { static: true })
  templateDisciplineGridCol3: TemplateRef<any>;
  @ViewChild('headTempDisciplines1', { static: true })
  headTempDisciplines1: TemplateRef<any>;
  @ViewChild('headTempDisciplines2', { static: true })
  headTempDisciplines2: TemplateRef<any>;
  @ViewChild('headTempDisciplines3', { static: true })
  headTempDisciplines3: TemplateRef<any>;

  @ViewChild('templateDiseasesGridCol1', { static: true })
  templateDiseasesGridCol1: TemplateRef<any>;
  @ViewChild('templateDiseasesGridCol2', { static: true })
  templateDiseasesGridCol2: TemplateRef<any>;
  @ViewChild('templateDiseasesGridCol3', { static: true })
  templateDiseasesGridCol3: TemplateRef<any>;
  @ViewChild('headTempDiseases1', { static: true })
  headTempDiseases1: TemplateRef<any>;
  @ViewChild('headTempDiseases2', { static: true })
  headTempDiseases2: TemplateRef<any>;
  @ViewChild('headTempDiseases3', { static: true })
  headTempDiseases3: TemplateRef<any>;

  valueChangeFilterBenefit(evt) {
    this.filterByBenefitIDArr = evt.data;
    this.UpdateEBenefitPredicate();
  }

  UpdateEBenefitPredicate() {
    this.filterEBenefitPredicates = '';
    if (
      this.filterByBenefitIDArr?.length > 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.filterByBenefitIDArr?.length; i++) {
        if (i > 0) {
          this.filterEBenefitPredicates += ' or ';
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`;
      }
      this.filterEBenefitPredicates += ') ';
      this.filterEBenefitPredicates += `and (EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      this.filterEBenefitPredicates += ') ';
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
    } else if (
      this.filterByBenefitIDArr?.length > 0 &&
      (this.startDateEBenefitFilterValue == undefined ||
        this.startDateEBenefitFilterValue == null)
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.filterByBenefitIDArr?.length; i++) {
        if (i > 0) {
          this.filterEBenefitPredicates += ' or ';
        }
        this.filterEBenefitPredicates += `BenefitID==@${i}`;
      }
      this.filterEBenefitPredicates += ') ';
      this.filterEBenefitPredicates += ') ';
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
    } else if (
      this.filterByBenefitIDArr?.length <= 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}" and EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates([this.filterEBenefitPredicates], [])
    } else if (
      this.filterByBenefitIDArr?.length <= 0 &&
      (this.startDateEBenefitFilterValue == undefined ||
        this.startDateEBenefitFilterValue == null)
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates([this.filterEBenefitPredicates], [''])
    }
  }

  valueChangeYearFilterBenefit(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateEBenefitFilterValue = null;
      this.endDateEBenefitFilterValue = null;
    } else {
      this.startDateEBenefitFilterValue = evt.fromDate.toJSON();
      this.endDateEBenefitFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEBenefitPredicate();
  }

  popupViewBenefit() {
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.benefitFuncID,
      {
        funcID: this.benefitFuncID,
        employeeId: this.employeeID,
        headerText: this.getFormHeader(this.benefitFuncID),
        sortModel: this.benefitSortModel,
        formModel: this.benefitFormodel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {

      // Do popup view all có sử dụng filter nên sẽ ko tiện lấy giá trị mới nhất
      // trả về từ popupview all nữa
      // if (res?.event) {
      //   if (res?.event == 'none') {
      //     this.listCrrBenefit = null;
      //   } else {
      //     this.listCrrBenefit = res.event;
      //   }
      //   this.df.detectChanges();
      // }

      // Thay vào đó gọi api lấy lại tất cả benefit mới nhất luôn
      this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
        if (res) {
          this.listCrrBenefit = res;
          this.df.detectChanges();
        }
      });
    });

    // this.headerTextBenefit =
    //   this.getFormHeader(this.benefitFuncID) + ' | ' + 'Tất cả';
    // let option = new DialogModel();
    // option.zIndex = 999;
    // option.DataService = this.view.dataService;
    // option.FormModel = this.view.formModel;
    // this.dialogViewBenefit = this.callfc.openForm(
    //   this.templateViewBenefit,
    //   '',
    //   850,
    //   550,
    //   '',
    //   null,
    //   '',
    //   option
    // );
    // this.dialogViewBenefit.closed.subscribe((res) => {
    //   if (res?.event) {
    //     this.view.dataService.update(res.event[0]).subscribe((res) => {});
    //   }
    //   this.df.detectChanges();
    // });
  }

  // RenderDataFromPopup(event) {
  //   if (event.isRenderDelete === true) {
  //     this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
  //       if (res) {
  //         this.listCrrBenefit = res;
  //         this.df.detectChanges();
  //       }
  //     });
  //   }
  // }

  valueChangeViewAllEBenefit(evt) {
    this.popupViewBenefit();
  }

  closeModelSalary(dialog: DialogRef) {
    dialog.close();
  }

  popupUpdateEBasicSalaryStatus() {
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.eBasicSalaryFuncID,
      {
        funcID: this.eBasicSalaryFuncID,
        employeeId: this.employeeID,
        headerText: this.getFormHeader(this.eBasicSalaryFuncID),
        sortModel: this.bSalarySortModel,
        formModel: this.eBasicSalaryFormmodel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {
      if (res?.event) {
        if (res?.event == 'none') {
          this.crrEBSalary = null;
        } else {
          this.crrEBSalary = res.event;
        }
        this.df.detectChanges();
      }
    });
  }

  valueChangeViewAllEBasicSalary() {
    this.popupUpdateEBasicSalaryStatus();
  }
  valueChangeViewAllEJobSalary(evt) {
    this.ViewAllEJobSalaryFlag = evt.data;
    let ins = setInterval(() => {
      if (this.jobSalaryGridview) {
        clearInterval(ins);
        let t = this;
        this.jobSalaryGridview.dataService.onAction.subscribe((res) => {
          if (res?.type == 'loaded') {
            t.eJobSalaryRowCount = res['data']?.length;
          }
        });
        this.eJobSalaryRowCount = this.jobSalaryGridview.dataService.rowCount;
      }
    }, 100);
  }

  copyValue(actionHeaderText, data, flag) {
    if (flag == 'benefit') {
      if (this.eBenefitGrid) {
        this.eBenefitGrid.dataService.dataSelected = data;
        (this.eBenefitGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
          });
      } else {
        this.hrService
          .copy(data, this.benefitFormodel, 'RecID')
          .subscribe((res) => {
            this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
          });
      }
    } else if (flag == 'eDisciplines') {
      if (this.eDisciplineGrid) {
        this.eDisciplineGrid.dataService.dataSelected = data;
        (this.eDisciplineGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.HandleEmployeeEDisciplinesInfo(actionHeaderText, 'copy', res);
          });
      } else {
        this.hrService
          .copy(data, this.eDisciplineFormModel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeEDisciplinesInfo(actionHeaderText, 'copy', res);
          });
      }
    } else if (flag == 'eAppointions') {
      this.appointionGridView.dataService.dataSelected = data;
      (this.appointionGridView.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandleEmployeeAppointionInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'ePassport') {
      this.hrService
        .copy(data, this.ePassportFormModel, 'RecID')
        .subscribe((res) => {
          this.handleEmployeePassportInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eWorkPermit') {
      this.hrService
        .copy(data, this.eWorkPermitFormModel, 'RecID')
        .subscribe((res) => {
          this.handleEmployeeWorkingPermitInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eFamilies') {
      this.hrService
        .copy(data, this.eFamilyFormModel, 'RecID')
        .subscribe((res) => {
          this.handleEFamilyInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eVisa') {
      this.hrService
        .copy(data, this.eVisaFormModel, 'RecID')
        .subscribe((res) => {
          this.handleEmployeeVisaInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eExperiences') {
      this.hrService
        .copy(data, this.eExperienceFormModel, 'RecID')
        .subscribe((res) => {
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
      this.hrService
        .copy(data, this.eTrainCourseFormModel, 'RecID')
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
    } else if (flag == 'eCertificate') {
      this.hrService
        .copy(data, this.eCertificateFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeECertificateInfo(actionHeaderText, 'copy', res);
        });
    }
    else if (flag == 'eDayoff') {
      this.dayoffGrid.dataService.dataSelected = data;
      (this.dayoffGrid.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandleEmployeeDayOffInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eBusinessTravels') {
      this.businessTravelGrid.dataService.dataSelected = data;
      (this.businessTravelGrid.dataService as CRUDService)
        .copy()
        .subscribe((res: any) => {
          this.HandleEBusinessTravel(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'basicSalary') {
      this.hrService
        .copy(data, this.eBasicSalaryFormmodel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeBasicSalariesInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'jobSalary') {
      this.hrService
        .copy(data, this.eJobSalaryFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeJobSalariesInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eAccidents') {
      this.hrService
        .copy(data, this.eAccidentsFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeAccidentInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eSkills') {
      this.hrService
        .copy(data, this.eSkillFormmodel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeESkillsInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eContract') {
      this.hrService
        .copy(data, this.eContractFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEContractInfo(actionHeaderText, 'copy', res);
        });
    } else if (flag == 'eDegrees') {
      this.hrService
        .copy(data, this.eDegreeFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeEDegreeInfo(actionHeaderText, 'copy', res);
        });
    }
  }

  getFormHeader(functionID: string) {
    let funcObj = this.lstFuncID.filter((x) => x.functionID == functionID);
    let headerText = '';
    if (funcObj && funcObj?.length > 0) {
      headerText = funcObj[0].description;
    }
    return headerText;
  }

  updateGridView(
    gridView: CodxGridviewV2Component,
    actionType: string,
    newData: any,
    oldData?: any
  ) {
    let returnVal = 0;
    let index = 0;
    if(oldData){
      index = gridView.dataService.data.findIndex(
        (p) => p.recID == oldData.recID
      );
    }
    if (actionType == 'add' || actionType == 'copy') {
      // (gridView?.dataService as CRUDService)?.add(newData, 0).subscribe();
      // gridView.addRow(newData, 0, true);

      //Gọi refresh luôn để dữ liệu hiển thị đúng theo sort
      gridView.refresh();

      returnVal = 1;
    } else if (actionType == 'edit') {
      // (gridView?.dataService as CRUDService)?.update(newData).subscribe();
      // gridView.updateRow(index, newData, false);

      //Gọi refresh luôn để dữ liệu hiển thị đúng theo sort
      gridView.refresh();
    } else if ((actionType = 'delete')) {
      (gridView?.dataService as CRUDService)?.remove(oldData).subscribe();
      gridView.deleteRow(oldData,true);
      returnVal = -1;
    }
    this.df.detectChanges();
    // if (gridView.formModel.entityName == this.ePassportFormModel.entityName) {
    //   this.crrPassport = gridView.dataService.data[0];
    // } else if (
    //   gridView.formModel.entityName == this.eVisaFormModel.entityName
    // ) {
    //   this.crrVisa = gridView.dataService.data[0];
    // } else if (
    //   gridView.formModel.entityName == this.eWorkPermitFormModel.entityName
    // ) {
    //   this.crrWorkpermit = gridView.dataService.data[0];
    // }
    // this.df.detectChanges();
    return returnVal;
  }

  valueChangeFilterAssetCategory(evt) {
    this.filterByAssetCatIDArr = evt.data;
    this.UpdateEAssetPredicate();
  }

  UpdateEAssetPredicate() {
    this.filterEAssetPredicates = '';
    if (
      this.filterByAssetCatIDArr?.length > 0 &&
      this.startDateEAssetFilterValue != null
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.filterByAssetCatIDArr?.length; i++) {
        if (i > 0) {
          this.filterEAssetPredicates += ' or ';
        }
        this.filterEAssetPredicates += `AssetCategory==@${i}`;
      }
      this.filterEAssetPredicates += ') ';
      this.filterEAssetPredicates += `and (IssuedDate>="${this.startDateEAssetFilterValue}" and IssuedDate<="${this.endDateEAssetFilterValue}")`;
      this.filterEAssetPredicates += ') ';
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEAssetPredicates],
          [this.filterByAssetCatIDArr.join(';')]
        )
    } else if (
      this.filterByAssetCatIDArr?.length > 0 &&
      (this.startDateEAssetFilterValue == undefined ||
        this.startDateEAssetFilterValue == null)
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.filterByAssetCatIDArr?.length; i++) {
        if (i > 0) {
          this.filterEAssetPredicates += ' or ';
        }
        this.filterEAssetPredicates += `AssetCategory==@${i}`;
      }
      this.filterEAssetPredicates += ') ';
      this.filterEAssetPredicates += ') ';
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEAssetPredicates],
          [this.filterByAssetCatIDArr]
        )
    } else if (
      this.filterByAssetCatIDArr?.length <= 0 &&
      this.startDateEAssetFilterValue != null
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}" and IssuedDate>="${this.startDateEAssetFilterValue}" and IssuedDate<="${this.endDateEAssetFilterValue}")`;
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(
          ['time'],
          [
            this.employeeID,
            this.startDateEAssetFilterValue,
            this.endDateEAssetFilterValue,
          ]
        )
    } else if (
      this.filterByAssetCatIDArr?.length <= 0 &&
      (this.startDateEAssetFilterValue == undefined ||
        this.startDateEAssetFilterValue == null)
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates([this.filterEAssetPredicates], [this.employeeID])
    }
  }

  valueChangeYearFilterAward(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.Start_Date_Award_Filter_Value = null;
      this.End_Date_Award_Filter_Value = null;
      this.Filter_Award_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.AwardGrid.dataService as CRUDService)
        .setPredicates([this.Filter_Award_Predicates], [''],res => {
          this.UpdateDataOnGrid(this.AwardGrid , res, this.Filter_Award_Predicates,null)
        });
    } else {
      this.Start_Date_Award_Filter_Value = evt.fromDate.toJSON();
      this.End_Date_Award_Filter_Value = evt.toDate.toJSON();
      let inYear =new Date(this.End_Date_Award_Filter_Value).getFullYear();
      this.Filter_Award_Predicates = `(EmployeeID=="${this.employeeID}" and InYear=="${inYear}")`;

      (this.AwardGrid.dataService as CRUDService)
        .setPredicates(
          [
            this.Filter_Award_Predicates
          ],
          [],res => {
          this.UpdateDataOnGrid(this.AwardGrid , res, this.Filter_Award_Predicates,null)
        });
    }
  }

  valueChangeYearFilterEAsset(evt) {
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
      this.filterByVaccineTypeIDArr?.length > 0 &&
      this.startDateEVaccineFilterValue != null
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.filterByVaccineTypeIDArr?.length; i++) {
        if (i > 0) {
          this.filterEVaccinePredicates += ' or ';
        }
        this.filterEVaccinePredicates += `VaccineTypeID==@${i}`;
      }
      this.filterEVaccinePredicates += ') ';
      this.filterEVaccinePredicates += `and (InjectDate>="${this.startDateEVaccineFilterValue}" and InjectDate<="${this.endDateEVaccineFilterValue}")`;
      this.filterEVaccinePredicates += ') ';
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEVaccinePredicates],
          [this.filterByVaccineTypeIDArr.join(';')],res => {
          this.UpdateDataOnGrid(this.eVaccinesGrid , res, this.filterEVaccinePredicates,this.filterByVaccineTypeIDArr.join(';'))
        });
    } else if (
      this.filterByVaccineTypeIDArr?.length > 0 &&
      (this.startDateEVaccineFilterValue == undefined ||
        this.startDateEVaccineFilterValue == null)
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.filterByVaccineTypeIDArr?.length; i++) {
        if (i > 0) {
          this.filterEVaccinePredicates += ' or ';
        }
        this.filterEVaccinePredicates += `VaccineTypeID==@${i}`;
      }
      this.filterEVaccinePredicates += ') ';
      this.filterEVaccinePredicates += ') ';
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEVaccinePredicates],
          [this.filterByVaccineTypeIDArr.join(';')]
        ,res => {
          this.UpdateDataOnGrid(this.eVaccinesGrid , res, this.filterEVaccinePredicates,this.filterByVaccineTypeIDArr.join(';'))
        });
    } else if (
      this.filterByVaccineTypeIDArr?.length <= 0 &&
      this.startDateEVaccineFilterValue != null
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}" and InjectDate>="${this.startDateEVaccineFilterValue}" and InjectDate<="${this.endDateEVaccineFilterValue}")`;
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates([this.filterEVaccinePredicates], [],res=> {
          this.UpdateDataOnGrid(this.eVaccinesGrid , res, this.filterEVaccinePredicates,null)
        });
    } else if (
      this.filterByVaccineTypeIDArr?.length <= 0 &&
      (this.startDateEVaccineFilterValue == undefined ||
        this.startDateEVaccineFilterValue == null)
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates([this.filterEVaccinePredicates], [''],res => {
          this.UpdateDataOnGrid(this.eVaccinesGrid , res, this.filterEVaccinePredicates,null)
        });
    }
  }

  UpdateESkillPredicate(evt) {
    this.filterByESkillIDArr = evt.data;
    let lengthArr = this.filterByESkillIDArr?.length;

    if (lengthArr <= 0) {
      this.filterESkillPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.skillGrid.dataService as CRUDService)
        .setPredicates([this.filterESkillPredicates], [''],res=> {
          this.UpdateDataOnGrid(this.skillGrid , res, this.filterESkillPredicates,null)
        });
    } else {
      this.filterESkillPredicates = `(EmployeeID=="${this.employeeID}" and (`;
      for (let i = 0; i < lengthArr; i++) {
        if (i > 0) {
          this.filterESkillPredicates += ' or ';
        }
        this.filterESkillPredicates += `SkillID==@${i}`;
      }
      this.filterESkillPredicates += ') ';
      this.filterESkillPredicates += ') ';
      (this.skillGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterESkillPredicates],
          [this.filterByESkillIDArr.join(';')],res => {
          this.UpdateDataOnGrid(this.skillGrid , res, this.filterESkillPredicates,this.filterByESkillIDArr.join(';'))
        });
    }
  }

  UpdateTrainCoursePredicate() {
    this.Filter_ETrainCourse_Predicates = '';
    if (
      this.Filter_By_ETrainCourse_IDArr?.length > 0 &&
      this.Start_Date_ETrainCourse_Filter_Value != null
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.Filter_By_ETrainCourse_IDArr?.length; i++) {
        if (i > 0) {
          this.Filter_ETrainCourse_Predicates += ' or ';
        }
        this.Filter_ETrainCourse_Predicates += `TrainForm==@${i}`;
      }
      this.Filter_ETrainCourse_Predicates += ') ';
      this.Filter_ETrainCourse_Predicates += `and (TrainFromDate>="${this.Start_Date_ETrainCourse_Filter_Value}" and TrainFromDate<="${this.End_Date_ETrainCourse_Filter_Value}")`;
      this.Filter_ETrainCourse_Predicates += ') ';
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [this.Filter_ETrainCourse_Predicates],
          [this.Filter_By_ETrainCourse_IDArr.join(';')],res => {
          this.UpdateDataOnGrid(this.eTrainCourseGrid , res, this.Filter_ETrainCourse_Predicates,this.Filter_By_ETrainCourse_IDArr.join(';'))
        });
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length > 0 &&
      (this.Start_Date_ETrainCourse_Filter_Value == undefined ||
        this.Start_Date_ETrainCourse_Filter_Value == null)
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}" and (`;
      let i = 0;
      for (i; i < this.Filter_By_ETrainCourse_IDArr?.length; i++) {
        if (i > 0) {
          this.Filter_ETrainCourse_Predicates += ' or ';
        }
        this.Filter_ETrainCourse_Predicates += `TrainForm==@${i}`;
      }
      this.Filter_ETrainCourse_Predicates += ') ';
      this.Filter_ETrainCourse_Predicates += ') ';
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [this.Filter_ETrainCourse_Predicates],
          [this.Filter_By_ETrainCourse_IDArr.join(';')],res=> {
          this.UpdateDataOnGrid(this.eTrainCourseGrid , res, this.Filter_ETrainCourse_Predicates,this.Filter_By_ETrainCourse_IDArr.join(';'))
        });
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length <= 0 &&
      this.Start_Date_ETrainCourse_Filter_Value != null
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}" and TrainFromDate>="${this.Start_Date_ETrainCourse_Filter_Value}" and TrainFromDate<="${this.End_Date_ETrainCourse_Filter_Value}")`;
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates([this.Filter_ETrainCourse_Predicates], [],res => {
          this.UpdateDataOnGrid(this.eTrainCourseGrid , res, this.Filter_ETrainCourse_Predicates,null)
        });
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length <= 0 &&
      (this.Start_Date_ETrainCourse_Filter_Value == undefined ||
        this.Start_Date_ETrainCourse_Filter_Value == null)
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates([this.Filter_ETrainCourse_Predicates], [''],res => {
          this.UpdateDataOnGrid(this.eTrainCourseGrid , res, this.Filter_ETrainCourse_Predicates,null)
        });
    }
  }

  valueChangeFilterDiseasesTypeID(evt) {
    this.Filter_By_EDiseases_IDArr = evt.data;
    let lengthArr = this.Filter_By_EDiseases_IDArr?.length;
    if (lengthArr <= 0) {
      this.Filter_EDiseases_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eDiseasesGrid.dataService as CRUDService)
        .setPredicates([this.Filter_EDiseases_Predicates], [''],res => {
          this.UpdateDataOnGrid(this.eDiseasesGrid , res, this.Filter_EDiseases_Predicates,null)
        });
    } else {
      this.Filter_EDiseases_Predicates = `(EmployeeID=="${this.employeeID}" and (`;
      for (let i = 0; i < lengthArr; i++) {
        if (i > 0) {
          this.Filter_EDiseases_Predicates += ' or ';
        }
        this.Filter_EDiseases_Predicates += `DiseaseID==@${i}`;
      }
      this.Filter_EDiseases_Predicates += ') ';
      this.Filter_EDiseases_Predicates += ') ';
      (this.eDiseasesGrid.dataService as CRUDService)
        .setPredicates(
          [this.Filter_EDiseases_Predicates],
          [this.Filter_By_EDiseases_IDArr.join(';')],res => {
          this.UpdateDataOnGrid(this.eDiseasesGrid , res, this.Filter_EDiseases_Predicates,this.Filter_By_EDiseases_IDArr.join(';'))
        });
    }
  }

  valueChangeFilterTrainCourse(evt) {
    this.Filter_By_ETrainCourse_IDArr = evt.data;
    this.UpdateTrainCoursePredicate();
  }

  valueChangeFilterSkillID(evt) {
    this.filterByESkillIDArr = evt.data;
    this.UpdateESkillPredicate(evt);
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
      this.Start_Date_ETrainCourse_Filter_Value = null;
      this.End_Date_ETrainCourse_Filter_Value = null;
    } else {
      this.Start_Date_ETrainCourse_Filter_Value = evt.fromDate.toJSON();
      this.End_Date_ETrainCourse_Filter_Value = evt.toDate.toJSON();
    }
    this.UpdateTrainCoursePredicate();
  }

  valueChangeYearFilterBusinessTravel(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateBusinessTravelFilterValue = null;
      this.endDateBusinessTravelFilterValue = null;
      this.filterBusinessTravelPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.businessTravelGrid.dataService as CRUDService)
        .setPredicates([this.filterBusinessTravelPredicates], [''],res => {
          this.UpdateDataOnGrid(this.businessTravelGrid , res, this.filterBusinessTravelPredicates,null)
        });
    } else {
      this.startDateBusinessTravelFilterValue = evt.fromDate.toJSON();
      this.endDateBusinessTravelFilterValue = evt.toDate.toJSON();
      this.filterBusinessTravelPredicates = `(EmployeeID=="${this.employeeID}" and BeginDate>="${this.startDateBusinessTravelFilterValue}" and EndDate<="${this.endDateBusinessTravelFilterValue}")`;
      (this.businessTravelGrid.dataService as CRUDService)
        .setPredicates(
          [
            this.filterBusinessTravelPredicates
          ],
          [],res => {
          this.UpdateDataOnGrid(this.businessTravelGrid , res, this.filterBusinessTravelPredicates,null)
        });
    }
  }

  UpdateEDayOffsPredicate() {
    if(this.dayoffGrid){

      this.filterEDayoffPredicates = '';
      if (
        this.filterByKowIDArr?.length > 0 &&
        this.startDateEDayoffFilterValue != null
      ) {
        this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}" and (`;
        let i = 0;
        for (i; i < this.filterByKowIDArr?.length; i++) {
          if (i > 0) {
            this.filterEDayoffPredicates += ' or ';
          }
          this.filterEDayoffPredicates += `KowID==@${i}`;
        }
        this.filterEDayoffPredicates += ') ';
        this.filterEDayoffPredicates += `and (BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}")`;
        this.filterEDayoffPredicates += ') ';
        (this.dayoffGrid?.dataService as CRUDService)
          .setPredicates(
            [this.filterEDayoffPredicates],
            [this.filterByKowIDArr.join(';')],res => {
            this.UpdateDataOnGrid(this.dayoffGrid , res, this.filterEDayoffPredicates,this.filterByKowIDArr.join(';'))
          });
      } else if (
        this.filterByKowIDArr?.length > 0 &&
        (this.startDateEDayoffFilterValue == undefined ||
          this.startDateEDayoffFilterValue == null)
      ) {
        this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}" and (`;
        let i = 0;
        for (i; i < this.filterByKowIDArr?.length; i++) {
          if (i > 0) {
            this.filterEDayoffPredicates += ' or ';
          }
          this.filterEDayoffPredicates += `KowID==@${i}`;
        }
        this.filterEDayoffPredicates += ') ';
        this.filterEDayoffPredicates += ') ';
        (this.dayoffGrid?.dataService as CRUDService)
          .setPredicates(
            [this.filterEDayoffPredicates],
            [this.filterByKowIDArr.join(';')],res=> {
              this.UpdateDataOnGrid(this.dayoffGrid , res, this.filterEDayoffPredicates,this.filterByKowIDArr.join(';'))
            }
          );
      } else if (
        this.filterByKowIDArr?.length <= 0 &&
        this.startDateEDayoffFilterValue != null
      ) {
        this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}" and BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}")`;
        (this.dayoffGrid?.dataService as CRUDService)
          .setPredicates([this.filterEDayoffPredicates], [],res => {
              this.UpdateDataOnGrid(this.dayoffGrid , res, this.filterEDayoffPredicates,null)
            }
          );
      } else if (
        this.filterByKowIDArr?.length <= 0 &&
        (this.startDateEDayoffFilterValue == undefined ||
          this.startDateEDayoffFilterValue == null)
      ) {
        this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}")`;
        (this.dayoffGrid?.dataService as CRUDService)
          .setPredicates([this.filterEDayoffPredicates], [''],res => {
            this.UpdateDataOnGrid(this.dayoffGrid , res, this.filterEDayoffPredicates,null)
          });
      }
    }
  }

  valueChangeFilterDayOff(evt) {
    this.filterByKowIDArr = evt.data;
    this.UpdateEDayOffsPredicate();
  }

  valueChangeYearFilterDayOff(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.startDateEDayoffFilterValue = null;
      this.endDateEDayoffFilterValue = null;
    } else {
      this.startDateEDayoffFilterValue = evt.fromDate.toJSON();
      this.endDateEDayoffFilterValue = evt.toDate.toJSON();
    }
    this.UpdateEDayOffsPredicate();
  }

  valueChangeFilterAccidentID(evt) {
    this.filterByAccidentIDArr = evt.data;
    let lengthArr = this.filterByAccidentIDArr?.length;

    if (lengthArr <= 0) {
      this.filterAccidentIdPredicate = `(EmployeeID=="${this.employeeID}")`;
      (this.eAccidentGridView.dataService as CRUDService)
        .setPredicates([this.filterAccidentIdPredicate], [''],res => {
          this.UpdateDataOnGrid(this.eAccidentGridView , res, this.filterAccidentIdPredicate,null)
        });
    } else {
      this.filterAccidentIdPredicate = `(EmployeeID=="${this.employeeID}" and (`;
      for (let i = 0; i < lengthArr; i++) {
        if (i > 0) {
          this.filterAccidentIdPredicate += ' or ';
        }
        this.filterAccidentIdPredicate += `AccidentID==@${i}`;
      }
      this.filterAccidentIdPredicate += ') ';
      this.filterAccidentIdPredicate += ') ';
      (this.eAccidentGridView.dataService as CRUDService)
        .setPredicates(
          [this.filterAccidentIdPredicate],
          [this.filterByAccidentIDArr.join(';')],res => {
          this.UpdateDataOnGrid(this.eAccidentGridView , res, this.filterAccidentIdPredicate,this.filterByAccidentIDArr.join(';'))
        });
    }
  }

  isMaxGrade(eSkill: any) {
    let item = this.lstESkill?.filter((p) => p.skillID == eSkill.skillID);
    if (item) {
      let lstSkill = item[0].listSkill;
      if (lstSkill && eSkill.recID == lstSkill[0].recID) {
        return true;
      }
    }
    return false;
  }

  getAssetBackgroundColor(asset) {
    for (let i = 0; i < this.AssetColorValArr?.length; i++) {
      if (this.AssetColorValArr[i].CategoryID == asset) {
        return this.AssetColorValArr[i].Background;
      }
    }
    // return 'badge-primary';
  }

  getAssetFontColor(asset) {
    for (let i = 0; i < this.AssetColorValArr?.length; i++) {
      if (this.AssetColorValArr[i].CategoryID == asset) {
        return this.AssetColorValArr[i].FontColor;
      }
    }
    // return 'badge-primary';
  }


  getBenefitBackgroundColor(benefit) {
    for (let i = 0; i < this.BeneFitColorValArr?.length; i++) {
      if (this.BeneFitColorValArr[i].CategoryID == benefit.benefitID) {
        return this.BeneFitColorValArr[i].Background;
      }
    }
    // return 'badge-primary';
  }

  getBenefitFontColor(benefit) {
    for (let i = 0; i < this.BeneFitColorValArr?.length; i++) {
      if (this.BeneFitColorValArr[i].AllowanceID == benefit.benefitID) {
        return this.BeneFitColorValArr[i].FontColor;
      }
    }
    return '#000205';
  }

  getBenefitIcon(benefit) {
    for (let i = 0; i < this.BeneFitColorValArr?.length; i++) {
      if (this.BeneFitColorValArr[i].AllowanceID == benefit.benefitID) {
        return this.BeneFitColorValArr[i].Icon;
      }
    }
  }

  getVaccineBackgroundColor(vaccine) {
    for (let i = 0; i < this.VaccineColorValArr?.length; i++) {
      if (this.VaccineColorValArr[i].VaccineTypeID == vaccine.vaccineTypeID) {
        return this.VaccineColorValArr[i].Background;
      }
    }
    // return 'badge-primary';
  }

  getVaccineFontColor(vaccine) {
    for (let i = 0; i < this.VaccineColorValArr?.length; i++) {
      if (this.VaccineColorValArr[i].VaccineTypeID == vaccine.vaccineTypeID) {
        return this.VaccineColorValArr[i].FontColor;
      }
    }
    return '#000205';
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  // getManagerEmployeeInfoById() {
  //   if (this.infoPersonal?.lineManager) {
  //     let empRequest = new DataRequest();
  //     empRequest.entityName = 'HR_Employees';
  //     empRequest.dataValues = this.infoPersonal.lineManager;
  //     empRequest.predicates = 'EmployeeID=@0';
  //     empRequest.pageLoading = false;
  //     this.hrService.loadData('HR', empRequest).subscribe((res: any) => {
  //       if (Array.isArray(res) && res[1] > 0) {
  //         this.lineManager = res[0][0];
  //       }
  //     });
  //   }
    // if (this.infoPersonal?.indirectManager) {
    //   let empRequest = new DataRequest();
    //   empRequest.entityName = 'HR_Employees';
    //   empRequest.dataValues = this.infoPersonal.indirectManager;
    //   empRequest.predicates = 'EmployeeID=@0';
    //   empRequest.pageLoading = false;
    //   this.hrService.loadData('HR', empRequest).subscribe((emp) => {
    //     if (emp[1] > 0) {
    //       this.indirectManager = emp[0][0];
    //     }
    //   });
    //   this.hrService.loadData('HR', empRequest).subscribe((emp) => {
    //     if (emp[1] > 0) {
    //       this.indirectManager = emp[0][0];
    //     }
    //   });
    // }
  }

