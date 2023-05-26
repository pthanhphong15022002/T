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
// import { EmployeeAssurTaxBankaccInfoComponent } from './../../employee-profile/employee-assur-tax-bankacc-info/employee-assur-tax-bankacc-info.component';
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
// import { EmployeeSelfInfoComponent } from '../../employee-profile/employee-self-info/employee-self-info.component';
import { ActivatedRoute, Router } from '@angular/router';
// import { EmployeeFamilyRelationshipComponent } from '../../employee-profile/employee-family-relationship/employee-family-relationship.component';
import { PopupEPassportsComponent } from '../../employee-profile/popup-epassports/popup-epassports.component';
import { PopupEhealthsComponent } from '../../employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEVaccineComponent } from '../../employee-profile/popup-evaccine/popup-evaccine.component';
import { PopupEDiseasesComponent } from '../../employee-profile/popup-ediseases/popup-ediseases.component';
import { PopupEContractComponent } from '../../employee-profile/popup-econtract/popup-econtract.component';
import { PopupEmpBusinessTravelsComponent } from '../../employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';
import { Sort } from '@syncfusion/ej2-angular-grids';
import { PopupSubEContractComponent } from '../../employee-profile/popup-sub-econtract/popup-sub-econtract.component';
import { PopupEProcessContractComponent } from '../../employee-contract/popup-eprocess-contract/popup-eprocess-contract.component';
import { PopupForeignWorkerComponent } from '../../employee-profile/popup-foreign-worker/popup-foreign-worker.component';
import { PopupViewAllComponent } from './pop-up/popup-view-all/popup-view-all.component';
import { PopupEquitjobComponent } from '../../employee-profile/popup-equitjob/popup-equitjob.component';

@Component({
  selector: 'lib-employee-info-detail',
  templateUrl: './employee-info-detail.component.html',
  styleUrls: ['./employee-info-detail.component.scss'],
  encapsulation:ViewEncapsulation.None,
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
  dialogViewAll: any;

  infoPersonal: any;
  infoPersonalContract: any;

  lineManager: any;
  indirectManager: any;

  crrEContract: any;
  lstContractType: any; //phân loại HĐ không xác định

  funcID = '';
  service = '';
  assemblyName = '';
  entity = '';
  idField = 'recID';
  functionID: string;
  // //family
  lstFamily: any;
  lstOrg: any; //view bo phan
  lstBtnAdd: any; //nut add chung

  //Kinh nghiem
  lstExperiences: any;
  //degree
  lstEDegrees: any = [];
  //passport
  lstPassport: any = [];
  crrPassport: any;
  //visa
  lstVisa: any = [];
  crrVisa: any;

  //workpermit
  crrWorkpermit: any;

  //jobInfo
  jobInfo: any;
  crrJobSalaries: any;

  //Certificate
  lstCertificates: any = [];
  //Diseases
  lstEdiseases: any = [];

  //EDiscipline
  lstDiscipline: any = [];

  //EAccident
  lstAccident: any = [];

  //EHealth
  lstEhealth: any = [];

  formModel;
  itemDetail;

  employeeID;
  crrTab: number = 0;
  //EDayOff
  lstDayOffs: any = [];

  //EAsset salary
  lstAsset: any;
  //EAppointion
  lstAppointions: any = [];
  //Basic salary
  employeeGrossSalary;
  crrEBSalary: any;

  listCrrBenefit: any;

  lstESkill: any;
  IsMax = false;
  Current_Grade_ESkill: any = [];

  //#region getGridView
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

  reRenderGrid = true;

  //#region ColumnsGrid
  workPermitColumnGrid;
  healthColumnsGrid;
  vaccineColumnsGrid;
  diseaseColumnsGrid;
  accidentColumnsGrid;
  positionColumnsGrid;
  holidayColumnsGrid;
  workDiaryColumnGrid;
  awardColumnsGrid;
  disciplineColumnGrid;
  eDegreeColumnsGrid;
  eCertificateColumnGrid;
  eExperienceColumnGrid;
  eAssetColumnGrid;
  eSkillColumnGrid;
  basicSalaryColumnGrid;
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

  ViewAllEBenefitFlag = false;
  ViewAllEAssetFlag = false;
  ViewAllVisaFlag = false;
  ViewAllEskillFlag = false;
  ViewAllEBasicSalaryFlag = false;
  ViewAllEJobSalaryFlag = false;
  ViewAllEContractFlag = false;
  ViewAllPassportFlag = false;
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
  @ViewChild('headTempAppointion1', { static: true }) headTempAppointion1: TemplateRef<any>;
  @ViewChild('headTempAppointion2', { static: true }) headTempAppointion2: TemplateRef<any>;
  @ViewChild('headTempAppointion3', { static: true }) headTempAppointion3: TemplateRef<any>;

  //#endregion

  //eDayoff
  @ViewChild('templateDayOffGridCol1', { static: true })
  templateDayOffGridCol1: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol2', { static: true })
  templateDayOffGridCol2: TemplateRef<any>;
  @ViewChild('templateDayOffGridCol3', { static: true })
  templateDayOffGridCol3: TemplateRef<any>;
  @ViewChild('headTempDayOff1', { static: true }) headTempDayOff1: TemplateRef<any>;
  @ViewChild('headTempDayOff2', { static: true }) headTempDayOff2: TemplateRef<any>;
  @ViewChild('headTempDayOff3', { static: true }) headTempDayOff3: TemplateRef<any>;

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
  @ViewChild('headTempAccident1', { static: true }) headTempAccident1: TemplateRef<any>;
  @ViewChild('headTempAccident2', { static: true }) headTempAccident2: TemplateRef<any>;
  @ViewChild('headTempAccident3', { static: true }) headTempAccident3: TemplateRef<any>;

  //#endregion

  //#region gridView viewChild
  @ViewChild('passportGridview', { static: true })
  passportGridview: CodxGridviewComponent;
  @ViewChild('visaGridview') visaGridview: CodxGridviewComponent;
  @ViewChild('workPermitGridview') workPermitGridview: CodxGridviewComponent;
  @ViewChild('basicSalaryGridview') basicSalaryGridview: CodxGridviewComponent;
  @ViewChild('appointionGridView') appointionGridView: CodxGridviewComponent;
  @ViewChild('jobSalaryGridview') jobSalaryGridview: CodxGridviewComponent;
  @ViewChild('eContractGridview') eContractGridview: CodxGridviewComponent;
  @ViewChild('eAccidentGridView') eAccidentGridView: CodxGridviewComponent;

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

  listEmp:any[] = [];
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
  eQuitJobFuncID = 'HRTEM0901'
  eAccidentsFuncID = 'HRTEM0804';
  eNeedToSubmitProfileFuncID = 'HRTEM0304';
  //#endregion

  //#region Vll colors
  AssetColorValArr: any = [];
  BeneFitColorValArr: any = [];
  VaccineColorValArr: any = [];
  //#endregion

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
  constructor(
    private inject: Injector,
    private routeActive: ActivatedRoute,
    private hrService: CodxHrService,
    private auth: AuthStore,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private notifySvr: NotificationsService,
  ) 
  {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID']
    this.user = this.auth.get();
  }

  pageNum:number = 0;
  crrIndex:number = 0;
  onInit(): void {
    if(this.funcID)
    {
      this.hrService.getFunctionList(this.funcID)
      .subscribe((res:any[]) => {
        if (res && res[1] > 0) {
          this.lstFuncID = Array.from<any>(res[0]);
          if(this.lstFuncID?.length > 0){
            this.lstTab = this.lstFuncID.filter((p) => p.parentID == this.funcID);
            this.crrFuncTab = this.lstTab[this.crrTab]?.functionID;
            this.lstFuncCurriculumVitae = this.lstFuncID.filter((p) => p.parentID == this.curriculumVitaeFuncID);
            this.lstBtnAdd = this.lstFuncID.filter(
              (p) =>
                (p.parentID == this.curriculumVitaeFuncID ||
                  p.parentID == this.legalInfoFuncID ||
                  p.parentID == this.foreignWorkerFuncID) &&
                p.entityName != this.view.formModel.entityName
            );
            this.lstFuncLegalInfo = this.lstFuncID.filter((p) => p.parentID == this.legalInfoFuncID);
            this.lstFuncForeignWorkerInfo = this.lstFuncID.filter((p) => p.parentID == this.foreignWorkerFuncID);
            this.lstFuncJobInfo = this.lstFuncID.filter((p) => p.parentID == this.jobInfoFuncID);
            this.lstFuncSalaryBenefit = this.lstFuncID.filter((p) => p.parentID == this.salaryBenefitInfoFuncID);
            this.lstFuncHRProcess = this.lstFuncID.filter((p) => p.parentID == this.workingProcessInfoFuncID);
            this.lstFuncKnowledge = this.lstFuncID.filter((p) => p.parentID == this.knowledgeInfoFuncID);
            this.lstFuncHealth = this.lstFuncID.filter((p) => p.parentID == this.healthInfoFuncID);
            this.lstFuncQuitJob = this.lstFuncID.filter((p) => p.parentID == this.quitJobInfoFuncID);
          }
        }
      });
    }
    this.routeActive.queryParams.subscribe((params) => {
      debugger
      this.employeeID = params["employeeID"];
      this.pageNum = params["page"];
      if (this.employeeID || this.user.userID) 
      {
        debugger
        if(history.state)
        {
          if (history.state.empInfo){
            debugger
            this.infoPersonal = JSON.parse(history.state.empInfo);
            this.getManagerEmployeeInfoById();
          }
          this.listEmp = history.state.data;
          this.request = history.state.request;
          if(Array.isArray(this.listEmp))
          {
            this.crrIndex = this.listEmp.findIndex((x:any) => this.employeeID === x["employeeID"]);
            // if (this.crrIndex === this.pageNum)
            // {
            //   this.request.page += 1;
            //   this.pageNum = this.request.page;
            //   this.hrService.loadData('HR', this.request)
            //   .subscribe((res:any[]) => {
            //     if (Array.isArray(res) && res[1] > 0) 
            //     {
            //       let arrEmp = Array.from<any>(res[0]);
            //       this.listEmp.push(arrEmp);
            //     }
            //   });
            // }
          }
        }
        else
        {
          let i = 1;
          this.listEmp = [];
          this.request = new DataRequest();
          this.request.entityName = 'HR_Employees';
          this.request.gridViewName = 'grvEmployees';
          this.request.page = params?.page ?? 1;
          this.request.predicate = params?.predicate ?? '';
          this.request.dataValue = params?.dataValue ?? '';

          // funcID ; EmpID ; Page ; Index

          
          // if (params?.filter) this.request.filter = JSON.parse(params?.filter);
          // this.request.pageSize = 20;
          // this.hrService.loadData('HR', this.request).subscribe((res) => {
          //   if (res && res[0]) {
          //     this.listEmp.push(...res[0]);
          //     let index = this.listEmp?.findIndex(
          //       (p) => p.employeeID == params.employeeID
          //     );
          //     i++;
          //     if (index > -1) {
          //       flag = false;
          //     }
          //   }
          // });
          //}
        }

        let index = this.listEmp?.findIndex(
          (p) => p.employeeID == params.employeeID
        );

        if (index > -1 && !this.listEmp[index + 1]?.employeeID) {
          this.request.page += 1;
          this.hrService.loadData('HR', this.request).subscribe((res) => {
            if (res && res[0]) {
              this.listEmp.push(...res[0]);
              this.crrIndex = this.listEmp?.findIndex((x) => this.employeeID === x.employeeID);
            }
          });
        }
        
        this.hrService.GetEmpCurrentPassport(this.employeeID)
        .subscribe((res) => {
          this.crrPassport = JSON.parse(JSON.stringify(res));
        });
    
        this.hrService.GetEmpCurrentVisa(this.employeeID)
        .subscribe((res) => {
          this.crrVisa = JSON.parse(JSON.stringify(res));
        });
    
        this.hrService.GetEmpCurrentWorkpermit(this.employeeID)
        .subscribe((res) => {
          this.crrWorkpermit = JSON.parse(JSON.stringify(res));
        });

        this.hrService.getGrossSalary(this.employeeID)
        .subscribe((res) => {
          this.employeeGrossSalary = JSON.parse(JSON.stringify(res));
        });
      }
      
    });
    this.initFormModel();
    this.initSortModel();
    this.initHeaderText();
    this.initLegalInfo();
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.initColumnGrid();
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
    console.log('thong tin ban than nv', this.infoPersonal);
    
  }

  // init formModel
  initFormModel(){
    //#region get FormModel
    this.hrService.getFormModel(this.eInfoFuncID).then((res) => {
      this.eInfoFormModel = res;
    });

    this.hrService.getFormModel(this.eFamiliesFuncID).then((res) => {
      this.eFamilyFormModel = res;
    });

    this.hrService.getFormModel(this.ePassportFuncID).then((res) => {
      this.ePassportFormModel = res;
      console.log('passport form model', this.ePassportFormModel);
      
    });

    this.hrService.getFormModel(this.eVisaFuncID).then((res) => {
      this.eVisaFormModel = res;
    });

    this.hrService.getFormModel(this.eWorkPermitFuncID).then((res) => {
      this.eWorkPermitFormModel = res;
    });

    this.hrService.getFormModel(this.quitJobInfoFuncID).then((res) => {
      this.eQuitJobFormModel = res;
    })

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
    //#endregion
  }

  // init sortModel
  initSortModel(){
    //#region filter
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

    // #region Sức khỏe sort model

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

    //#endregion

    // #region Khen thưởng sort model
    this.eAwardsSortModel1 = new SortModel();
    this.eAwardsSortModel1.field = 'InYear';
    this.eAwardsSortModel1.dir = 'desc';

    this.eAwardsSortModel2 = new SortModel();
    this.eAwardsSortModel2.field = 'AwardDate';
    this.eAwardsSortModel2.dir = 'desc';
    // #endregion

    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      this.addHeaderText = res[0].customName;
      this.editHeaderText = res[2].customName;
    });

    //#endregion
  }

  //init headerText
  initHeaderText(){
    //#region - Công tác
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
    //#endregion

    //#region - Nghỉ phép
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
    //#endregion

    //#region Kham suc khoe
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
    //#endregion

    //#region Tiem vaccine
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
    //#endregion

    //#region eExperience - Kinh nghiem truoc day
      this.hrService.getHeaderText(this.eExperienceFuncID).then((res) => {
        this.eExperienceHeaderText = res;
        this.eExperienceColumnGrid = [
          {
            headerText: this.eExperienceHeaderText['FromDate'],
            field: 'fromDate',
            //template: this.tempFromDate,
            width: '150',
            format: 'MM/y',
            type: 'Date',
          },

          {
            headerText: this.eExperienceHeaderText['ToDate'],
            field: 'toDate',
            // template: this.tempToDate,
            width: '150',
            format: 'MM/y',
            type: 'Date',
          },

          {
            headerText: this.eExperienceHeaderText['CompanyName'],
            field: 'companyName',
            // template: this.templateEExperienceGridCol3,
            width: '150',
          },

          {
            headerText: this.eExperienceHeaderText['Position'],
            //field: 'position',
            template: this.templateEExperienceGridCol4,
            width: '150',
          },
        ];
      });
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

    //#region EReward - Khen thưởng
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
    //#endregion

    //#region EDiscipline - Kỷ luật
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
    //#endregion

    //#region EDiseases - bệnh nghề nghiệp
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
    //#endregion

    //#region Accident - Tai nạn lao động
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

  //init columns grid
  initColumnGrid(){
    //Khen thưởng
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

    console.log('awart', this.AwardGrid);
    
  }
  
  navChange(evt: any, index: number = -1) {
    if (!evt) return;
    // let element = document.getElementById(evt?.nextId);
    let element = document.getElementById(evt);
    if (index > -1) {
      // this.active[index] = evt.nextId;
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

  init

  initPersonalInfo() {
    if (this.employeeID) {
      // Quan hệ gia đình
      let opFamily = new DataRequest();
      opFamily.gridViewName = 'grvEFamilies';
      opFamily.entityName = 'HR_EFamilies';
      opFamily.predicate = 'EmployeeID=@0';
      opFamily.dataValue = this.employeeID;
      opFamily.pageLoading = false;
      this.hrService.getEFamilyWithDataRequest(opFamily).subscribe((res) => {
        if (res) this.lstFamily = res[0];
      });

      let rqExperience = new DataRequest();
      rqExperience.gridViewName = 'grvEExperiences';
      rqExperience.entityName = 'HR_EExperiences';
      rqExperience.predicate = 'EmployeeID=@0';
      rqExperience.dataValue = this.employeeID;
      rqExperience.pageLoading = false;
      this.hrService.GetExperienceListByEmployeeIDAsync(rqExperience).subscribe((res) => {
        if (res) {
          this.lstExperiences = res[0];
          // this.lstExperiences.sort((a, b) => {
          //   let da = new Date(a.fromDate),
          //       db = new Date(b.fromDate);
          //     return da > db;
          // });
          console.log('ds kn 2', this.lstExperiences)
        }
      });


      // let opPassport = new DataRequest();
      // opPassport.gridViewName = 'grvEPassports';
      // opPassport.entityName = 'HR_EPassports';
      // opPassport.predicates = 'EmployeeID=@0';
      // opPassport.dataValues = this.employeeID;
      // opPassport.srtColumns = 'IssuedDate';
      // opPassport.srtDirections = 'desc';
      // (opPassport.page = 1),
      //   this.hrService.loadData('HR', opPassport).subscribe((res) => {
      //     if (res) this.lstPassport = res[0];
      //     if (this.lstPassport.length > 0) {
      //       this.crrPassport = this.lstPassport[0];
      //       console.log('Current value', this.crrPassport);
      //     }
      //   });
    }
  }

  //Check loaded ESalary
  loadedESalary: boolean;
  loadEBenefit: boolean;

  initSalaryInfo() {
    if (this.employeeID) {
      //Job salaries Lương chức danh
      // if (!this.crrJobSalaries) {
      //   let rqJSalary = new DataRequest();
      //   rqJSalary.entityName = 'HR_EJobSalaries';
      //   rqJSalary.dataValues = this.employeeID + ';true';
      //   rqJSalary.predicates = 'EmployeeID=@0 and IsCurrent=@1';
      //   rqJSalary.page = 1;
      //   rqJSalary.pageSize = 1;

      //   this.hrService.loadData('HR', rqJSalary).subscribe((res) => {
      //     if (res && res[0]) {
      //       this.crrJobSalaries = res[0][0];
      //       this.df.detectChanges();
      //     }
      //   });
      // }

      // Salary
      if (!this.crrEBSalary) {
        let date = new Date();
        let rqBSalary = new DataRequest();
        rqBSalary.entityName = 'HR_EBasicSalaries';
        rqBSalary.dataValues = this.employeeID + ';' +`${date.toISOString()}`;
        rqBSalary.predicates = 'EmployeeID=@0 and EffectedDate<=@1';
        rqBSalary.page = 1;
        rqBSalary.pageSize = 1;
        this.loadedESalary = false;

        this.hrService.loadData('HR', rqBSalary).subscribe((res) => {
          if (res && res[0]) {
            let lstTemp = res[0]
            let lstRes = []
            for(let i = 0; i < lstTemp.length; i++){
              if(lstTemp[i].expiredDate){
                let dateExp = new Date(lstTemp[i].expiredDate).toISOString()
                if(date.toISOString() < dateExp){
                  lstRes.push(lstTemp[i]);
                }
              }
              else{
                lstRes.push(lstTemp[i])
              }
            }
            this.crrEBSalary = lstRes[0];
        this.loadedESalary = true;
            this.df.detectChanges();
          }
        });
      }

      // Benefit
      if (!this.listCrrBenefit) {
        this.loadEBenefit = false;
        let date = new Date();
        let rqBenefit = new DataRequest();
        rqBenefit.entityName = 'HR_EBenefits';
        rqBenefit.dataValues = this.employeeID + ';' +`${date.toISOString()}`;
        rqBenefit.predicates = 'EmployeeID=@0 and EffectedDate<=@1';
        rqBenefit.page = 1;
        rqBenefit.pageSize = 1;

        this.hrService.loadData('HR', rqBenefit).subscribe((res) => {
          console.log('ds benefit', res)

          if (res && res[0]) {
            let lstTemp = res[0]
            let lstRes = []
            for(let i = 0; i < lstTemp.length; i++){
              if(lstTemp[i].expiredDate){
                let dateExp = new Date(lstTemp[i].expiredDate).toISOString()
                if(date.toISOString() < dateExp){
                  lstRes.push(lstTemp[i]);
                }
              }
              else{
                lstRes.push(lstTemp[i])
              }
            }
            this.listCrrBenefit = lstRes;
            debugger
          console.log('ds benefit', this.listCrrBenefit)
        this.loadEBenefit = true;
            this.df.detectChanges();
          }
        });
      }

      // if (!this.listCrrBenefit) this.loadEBenefit = false;
      // this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
      //   this.loadEBenefit = true;
      //   if (res?.length) {
      //     this.listCrrBenefit = res;
      //     this.df.detectChanges();
      //   }
      // });

      // Asset
      // if (!this.lstAsset)
      //   this.hrService.LoadListEAsset(this.employeeID).subscribe((res) => {
      //     if (res) {
      //       this.lstAsset = res;
      //       this.df.detectChanges();
      //     }
      //   });
    }
    if (!this.jobSalaryColumnGrid) {
      //#region get columnGrid EJobSalary - Lương chức danh
      this.hrService.getHeaderText(this.eJobSalFuncID).then((res) => {
        this.eJobSalaryHeaderText = res;
        this.jobSalaryColumnGrid = [
          {
            headerText:
              this.eJobSalaryHeaderText['JSalary'] ?? '' + 'Mức lương',
            template: this.jobSalaryCol1,
            width: '150',
          },
          {
            headerText: this.eJobSalaryHeaderText['EffectedDate'],
            template: this.jobSalaryCol2,
            width: '150',
          },
          {
            headerText:
              this.eJobSalaryHeaderText['DecisionNo'] +
              ' | ' +
              this.eJobSalaryHeaderText['SignedDate'],
            template: this.jobSalaryCol3,
            width: '300',
          },
        ];
      });

      let insJSalary = setInterval(() => {
        if (this.jobSalaryGridview) {
          clearInterval(insJSalary);
          let t = this;
          this.jobSalaryGridview.dataService.onAction.subscribe((res) => {
            if (res) {
              if (res.type != null && res.type == 'loaded') {
                t.eJobSalaryRowCount = res['data']?.length;
              }
            }
          });
          this.eJobSalaryRowCount = this.jobSalaryGridview.dataService.rowCount;
        }
      }, 100);

      //#endregion
    }
    if (!this.basicSalaryColumnGrid) {
      //#region get columnGrid EBasicSalary - Lương cơ bản
      this.hrService.getHeaderText(this.eBasicSalaryFuncID).then((res) => {
        let basicSalaryHeaderText = res;
        this.basicSalaryColumnGrid = [
          {
            headerText: basicSalaryHeaderText['BSalary'],
            template: this.basicSalaryCol1,
            width: '100',
          },
          {
            headerText: basicSalaryHeaderText['SISalary'],
            template: this.basicSalaryCol2,
            width: '100',
          },
          {
            headerText: basicSalaryHeaderText['JSalary'],
            template: this.basicSalaryCol3,
            width: '150',
          },
          {
            headerText: basicSalaryHeaderText['EffectedDate'],
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
                t.eBasicSalaryRowCount = 0;
                t.eBasicSalaryRowCount = res['data'].length;
              }
            }
          });
          this.eBasicSalaryRowCount =
            this.basicSalaryGridview.dataService.rowCount;
        }
      }, 100);

      //#endregion

      this.df.detectChanges();
    }
  }

  initKnowledgeInfo() {
    if (this.employeeID) {
      //HR_ESkills
      if (!this.lstESkill) {
        let rqESkill = new DataRequest();
        rqESkill.entityName = 'HR_ESkills';
        rqESkill.dataValues = this.employeeID;
        rqESkill.predicates = 'EmployeeID=@0';
        rqESkill.page = 1;
        rqESkill.pageSize = 20;
        // this.hrService.getViewSkillAsync(rqESkill).subscribe((res) => {
        //   if (res) {
        //     this.lstESkill = res;
        //   }
        // });
      }
      this.df.detectChanges();
    }

    if (!this.eDegreeColumnsGrid) {
      //#region EDegrees - Bằng cấp

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

      let insDegree = setInterval(() => {
        if (this.eDegreeGrid) {
          clearInterval(insDegree);
          let t = this;
          this.eDegreeGrid.dataService.onAction.subscribe((res) => {
            if (res) {
              if (res.type == 'loaded') {
                t.eDegreeRowCount = 0;
                t.eDegreeRowCount = res['data']?.length;
              }
            }
          });
          this.eDegreeRowCount = this.eDegreeGrid.dataService.rowCount;
        }
      }, 100);

      this.df.detectChanges();
      //#endregio
    }

    if (!this.eCertificateColumnGrid) {
      //#region - Chứng chỉ
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

      let insCerti = setInterval(() => {
        if (this.eCertificateGrid) {
          clearInterval(insCerti);
          let t = this;
          this.eCertificateGrid.dataService.onAction.subscribe((res) => {
            if (res) {
              if (res.type == 'loaded') {
                t.eCertificateRowCount = 0;
                t.eCertificateRowCount = res['data']?.length;
              }
            }
          });
          this.eCertificateRowCount =
            this.eCertificateGrid.dataService.rowCount;
        }
      }, 100);

      //#endregion
    }

    if (!this.eSkillColumnGrid) {
      //#region ESKills - Kỹ năng

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

      let insSkill = setInterval(() => {
        if (this.skillGrid) {
          clearInterval(insSkill);
          let t = this;
          this.skillGrid.dataService.onAction.subscribe((res) => {
            if (res) {
              if (res.type == 'loaded') {
                t.eSkillRowCount = res['data']?.length;
              }
            }
          });
          this.eSkillRowCount = this.skillGrid.dataService.rowCount;
        }
      }, 100);
      //#endregion
      this.df.detectChanges();
    }

    if (!this.eTrainCourseColumnGrid) {
      //#region get columnGrid ETrainCourse - Đào Tạo

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

      let insTrain = setInterval(() => {
        if (this.eTrainCourseGrid) {
          clearInterval(insTrain);
          let t = this;
          this.eTrainCourseGrid.dataService.onAction.subscribe((res) => {
            if (res) {
              if (res.type == 'loaded') {
                t.eTrainCourseRowCount = 0;
                t.eTrainCourseRowCount = res['data']?.length;
              }
            }
          });
          this.eTrainCourseRowCount =
            this.eTrainCourseGrid.dataService.rowCount;
        }
      }, 100);

      //#endregion
    }
  }

  getECurrentContract() {
    if (!this.crrEContract) {
      let date = new Date();
      //HR_EContracts
      let rqContract = new DataRequest();
      rqContract.entityName = 'HR_EContracts';
      rqContract.dataValues = this.employeeID + ';false;' +`${date.toISOString()}`;
      rqContract.predicates =
        'EmployeeID=@0 and IsAppendix=@1 and EffectedDate<=@2 and ExpiredDate>=@2';
      rqContract.page = 1;
      rqContract.pageSize = 1;

      this.hrService.loadData('HR', rqContract).subscribe((res) => {
        debugger
        if (res && res[0]) {
          this.crrEContract = res[0][0];
        }
        else{
          this.crrEContract = null;
        }
        this.df.detectChanges();
      });

      // this.hrService.getCrrEContract(rqContract).subscribe((res) => {
      //   if (res && res[0]) {
      //     this.crrEContract = res[0][0];
      //   } else {
      //     this.crrEContract = null;
      //   }
      //   this.df.detectChanges();
      // });
    }
  }

  initHRProcess() {
    if (!this.eContractFormModel) {
      this.hrService.getFormModel(this.eContractFuncID).then((res) => {
        this.eContractFormModel = res;
      });
    }
    if (this.employeeID) {
      this.getECurrentContract();

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
    if (!this.eContractColumnGrid) {
      this.hrService.getHeaderText(this.eContractFuncID).then((res) => {
        this.eContractHeaderText = res;
        this.eContractColumnGrid = [
          {
            headerText:
              this.eContractHeaderText['ContractTypeID'] +
              ' | ' +
              this.eContractHeaderText['EffectedDate'],

            template: this.eContractCol1,
            width: '250',
          },
          {
            // headerText: this.eContractHeaderText['ContractNo'] +
            // ' - ' +
            // this.eContractHeaderText['SignedDate'],
            headerText: 'Hợp đồng',
            template: this.eContractCol2,
            width: '150',
          },
          {
            headerText: this.eContractHeaderText['Note'],
            template: this.eContractCol3,
            width: '150',
          },
        ];
      });

      // let insEContract = setInterval(() => {
      //   if (this.eContractGridview) {
      //     clearInterval(insEContract);
      //     let t = this;
      //     this.eContractGridview.dataService.onAction.subscribe((res) => {
      //       if (res) {
      //         if (res.type == 'loaded') {
      //           t.eContractRowCount = 0;
      //           t.eContractRowCount = res['data'].length;
      //         }
      //       }
      //     });
      //     this.eContractRowCount = this.eContractGridview.dataService.rowCount;
      //   }
      // }, 100);
    }
    //#endregion

    if (!this.appointionColumnGrid) {
      //#region get columnGrid EAppointion - Bổ nhiệm điều chuyển
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
      //#endregion
    }
  }

  initLegalInfo() {
    //#region get columnGrid EVisa - Thị thực
    // if (!this.visaColumnGrid) {
    //   this.hrService.getHeaderText(this.eVisaFuncID).then((res) => {
    //     let visaHeaderText = res;
    //     this.visaColumnGrid = [
    //       {
    //         headerText:
    //           visaHeaderText['VisaNo'] + ' | ' + visaHeaderText['IssuedPlace'],
    //         template: this.visaCol1,
    //         width: '150',
    //       },
    //       {
    //         headerText:
    //           visaHeaderText['IssuedDate'] +
    //           ' | ' +
    //           visaHeaderText['ExpiredDate'],
    //         template: this.visaCol2,
    //         width: '150',
    //       },
    //     ];
    //   });
    //   let insVisa = setInterval(() => {
    //     if (this.visaGridview) {
    //       clearInterval(insVisa);
    //       let t = this;
    //       this.visaGridview.dataService.onAction.subscribe((res) => {
    //         if (res) {
    //           if (res.type == 'loaded') {
    //             t.visaRowCount = res['data'].length;
    //             if (res['data'].length > 0) {
    //               this.crrVisa = res.data[0];
    //             }
    //           }
    //         }
    //       });
    //       this.visaRowCount = this.visaGridview.dataService.rowCount;
    //     }
    //   }, 100);
    // }
    //#endregion
    //#region get columnGrid EWorkPermit - Giấy phép lao động
    // if (!this.workPermitColumnGrid) {
    //   this.hrService.getHeaderText(this.eWorkPermitFuncID).then((res) => {
    //     let workHeaderText = res;
    //     this.workPermitColumnGrid = [
    //       {
    //         headerText:
    //           workHeaderText['WorkPermitNo'] +
    //           ' | ' +
    //           workHeaderText['IssuedPlace'],
    //         template: this.workPermitCol1,
    //         width: '150',
    //       },
    //       {
    //         headerText:
    //           workHeaderText['IssuedDate'] + ' | ' + workHeaderText['ToDate'],
    //         template: this.workPermitCol2,
    //         width: '150',
    //       },
    //     ];
    //   });
    //   let insWorkPermit = setInterval(() => {
    //     if (this.workPermitGridview) {
    //       clearInterval(insWorkPermit);
    //       let t = this;
    //       this.workPermitGridview?.dataService.onAction.subscribe((res) => {
    //         if (res) {
    //           if (res.type == 'loaded') {
    //             t.workPermitRowCount = res['data'].length;
    //             if (res['data'].length > 0) {
    //               this.crrWorkpermit = res.data[0];
    //             }
    //           }
    //         }
    //       });
    //       this.workPermitRowCount =
    //         this.workPermitGridview.dataService.rowCount;
    //     }
    //   }, 100);
    // }
    //#endregion
  }

  initForm() {
    this.initPersonalInfo();
    if (this.infoPersonal) {
      this.hrService
        .getOrgTreeByOrgID(this.infoPersonal.orgUnitID, 3)
        .subscribe((res) => {
          if (res) {
            this.lstOrg = res;
          }
        });
    }

    this.initHRProcess();
  }

  add(functionID) {
    switch (functionID) {
      case this.eFamiliesFuncID: {
        this.handleEFamilyInfo(this.addHeaderText, 'add', null);
        break;
      }
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

  clickMF(event: any, data: any, funcID = null) {
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
          //Close popup when click more function
          // this.dialogViewSalary.close();
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
          //Close popup when click more function
          // this.dialogViewBenefit.close();
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

      case 'SYS02': //delete
        //Render data table when delete from popup (module benefit)
        if (event.isRenderDelete === true) {
          this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
            if (res) {
              this.listCrrBenefit = res;
              this.df.detectChanges();
            }
          });
          break;
        }

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
                    (this.dayoffGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
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
                  (this.eHealthsGrid.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
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
                  if (data.isCurrent == true) {
                    // const index = this.listCrrBenefit.indexOf(data);
                    // if (index > -1) {
                    //   this.listCrrBenefit.splice(index, 1);
                    // }
                    this.hrService
                      .GetCurrentBenefit(this.employeeID)
                      .subscribe((res) => {
                        if (res) {
                          this.listCrrBenefit = res;
                          this.df.detectChanges();
                        }
                      });
                  }
                  (this.eBenefitGrid?.dataService as CRUDService)
                    ?.remove(data)
                    .subscribe();
                  this.hrService
                    .GetIsCurrentBenefitWithBenefitID(
                      this.employeeID,
                      data.benefitID
                    )
                    .subscribe((res) => {
                      (this.eBenefitGrid?.dataService as CRUDService)
                        ?.update(res)
                        .subscribe();
                    });
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
                    this.hrService
                      .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
                      .subscribe((dataEBaSlary) => {
                        this.crrEBSalary = dataEBaSlary;
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
                    (this.eDegreeGrid?.dataService as CRUDService)
                      ?.remove(data)
                      .subscribe();
                    this.eDegreeRowCount--;
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eSkill') {
              this.hrService.deleteESkill(data.recID).subscribe((res) => {
                if (res == true) {
                  this.notify.notifyCode('SYS008');
                  (this.skillGrid?.dataService as CRUDService)
                    ?.remove(data)
                    .subscribe();
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
                    this.eCertificateRowCount--;
                    (this.eCertificateGrid.dataService as CRUDService)
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
                    // let i = this.lstAppointions.indexOf(data);
                    // if (i != -1) {
                    //   this.lstAppointions.splice(i, 1);
                    // }
                    //this.appointionRowCount--;
                    (this.appointionGridView.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    //this.df.detectChanges();
                    //(this.appointionGridView as any).deleteData(data)
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
                    //this.eExperienceRowCount = this.eExperienceRowCount - 1;
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
                    (this.eDiseasesGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
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
                    (this.eTrainCourseGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.eTrainCourseRowCount--;
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eBusinessTravels') {
              this.hrService.deleteEBusinessTravels(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  (this.businessTravelGrid.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
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
                    // let i = this.lstEdiseases.indexOf(data);
                    // if (i != -1) {
                    //   this.lstEdiseases.splice(i, 1);
                    // }
                    (this.AwardGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    //this.awardRowCount--;
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
                    (this.eDisciplineGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
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
                  this.crrEContract = res[1];
                  this.df.detectChanges();
                } else {
                  this.notify.notifyCode('SYS022');
                }
              });
            } else if (funcID == 'eAccidents') {
              this.hrService.deleteEAccident(data?.recID).subscribe((res) => {
                if (res) {
                  this.notify.notifyCode('SYS008');
                  (this.eAccidentGridView.dataService as CRUDService)
                    ?.remove(data)
                    .subscribe();
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
          this.HandleEmployeeECertificateInfo(event.text, 'copy', data);
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
  // getDataAsync(funcID: string) {
  //   this.getDataFromFunction(funcID);
  // }
  // getDataFromFunction(functionID: string) {
  //   if (functionID) {
  //     this.api
  //       .execSv(
  //         'SYS',
  //         'ERM.Business.SYS',
  //         'MoreFunctionsBusiness',
  //         'GetMoreFunctionByHRAsync',
  //         [this.functionID]
  //       )
  //       .subscribe((res: any[]) => {
  //         if (res && res.length > 0) {
  //           // this.moreFunc = res;
  //           // this.defautFunc = res[0];
  //           this.detectorRef.detectChanges();
  //         }
  //       });
  //   }
  // }

  changeItemDetail(item) {}

  crrFuncTab: string;
  clickTab(funcList: any) {
    this.crrFuncTab = funcList.functionID;
    switch (this.crrFuncTab) {
      case this.curriculumVitaeFuncID:
        // console.log('loc kq 1', this.lstFuncID.filter(p => (p.parentID == this.curriculumVitaeFuncID || p.parentID == this.legalInfoFuncID || p.parentID == this.foreignWorkerFuncID)
        //  && p.entityName != this.view.formModel.entityName));

        // this.lstBtnAdd = JSON.parse(JSON.stringify(this.lstFuncCurriculumVitae));
        this.lstBtnAdd = this.lstFuncID.filter(
          (p) =>
            (p.parentID == this.curriculumVitaeFuncID ||
              p.parentID == this.legalInfoFuncID ||
              p.parentID == this.foreignWorkerFuncID) &&
            p.entityName != this.view.formModel.entityName
        );

        // this.lstBtnAdd.splice(0, 2);
        break;
      case this.jobInfoFuncID:
        this.lstBtnAdd = this.lstFuncJobInfo;
        this.lstBtnAdd = this.lstBtnAdd.filter(
          (p) => p.entityName != this.view.formModel.entityName
        );
        // this.lstBtnAdd = null;
        break;
      case this.salaryBenefitInfoFuncID:
        this.lstBtnAdd = this.lstFuncSalaryBenefit;
        this.initSalaryInfo();
        break;
      case this.workingProcessInfoFuncID:
        this.lstBtnAdd = this.lstFuncHRProcess;
        this.initHRProcess();
        break;
      case this.knowledgeInfoFuncID:
        this.lstBtnAdd = this.lstFuncKnowledge;
        this.initKnowledgeInfo();
        break;
      case this.healthInfoFuncID:
        this.lstBtnAdd = this.lstFuncHealth;
        break;
      // case this.quitJobInfoFuncID:
      //   this.lstBtnAdd = this.lstFuncQuitJob;
      //   break;
    }
  }

  editEmployeeQuitJobInfo(actionHeaderText){
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
        this.view.dataService.clear();
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
    option.Width = '550px';
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
        this.getManagerEmployeeInfoById();
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

  DeleteEmployeeEHealths(recID: string) {
    this.hrService.deleteEHealth(recID).subscribe((p) => {
      if (p != null) {
        this.notify.notifyCode('SYS007');
      } else this.notify.notifyCode('DM034');
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
          if (res.event.length > 1) {
            (this.eBenefitGrid?.dataService as CRUDService)
              ?.update(res.event[0])
              .subscribe();
            (this.eBenefitGrid?.dataService as CRUDService)
              ?.add(res.event[1])
              .subscribe();
          } else {
            (this.eBenefitGrid?.dataService as CRUDService)
              ?.add(res.event[0])
              .subscribe();
          }
          this.eBenefitRowCount += 1;
        } else if (actionType == 'edit') {
          (this.eBenefitGrid?.dataService as CRUDService)
            ?.update(res.event)
            .subscribe();
        }

        this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
          if (res?.length) {
            this.listCrrBenefit = res;
            this.df.detectChanges();
          }
        });
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
        if (actionType == 'add' || actionType == 'copy') {
          //this.eExperienceRowCount += 1;
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
        // this.eBasicSalaryRowCount += this.updateGridView(
        //   this.basicSalaryGridview,
        //   actionType,
        //   res.event[0]
        // );
        // res.event[0]?.forEach((element) => {
        //   if (element.isCurrent) {
        //     this.crrEBSalary = element;
        //   }
        //   (this.basicSalaryGridview?.dataService as CRUDService)
        //     ?.update(element)
        //     .subscribe();
        // });
        if (res.event[0].isCurrent) {
          this.crrEBSalary = res.event[0];
        }
        (this.basicSalaryGridview?.dataService as CRUDService)
          ?.update(res.event[0])
          .subscribe();
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
        // (this.passportGridview.dataService as CRUDService).clear();
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
          if (
            res?.event.issuedDate > this.crrPassport.issuedDate ||
            res?.event.issuedDate > this.crrPassport.issuedDate
          ) {
            //do nothing, old is current value is still is current
          } else {
            this.hrService
              .GetEmpCurrentPassport(this.employeeID)
              .subscribe((res) => {
                this.crrPassport = res;
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

  // HandleEmployeeQuitJobInfo(actionHeaderText, actionType: string, data: any) {
  //   let option = new SidebarModel();
  //   //option.DataService = this.passportGridview?.dataService;
  //   option.FormModel = this.eInfoFormModel;
  //   option.Width = '850px';
  //   let dialogAdd = this.callfunc.openSide(
  //     PopupEquitjobComponent,
  //     {
  //       actionType: actionType,
  //       funcID: this.quitJobInfoFuncID,
  //       headerText:
  //         actionHeaderText + ' ' + this.getFormHeader(this.quitJobInfoFuncID),
  //       employeeId: this.employeeID,
  //       dataObj: data,
  //     },
  //     option
  //   );

  //   dialogAdd.closed.subscribe((res) => {
  //     if (res?.event) {
  //       this.infoPersonal = JSON.parse(JSON.stringify(res.event));
  //       this.df.detectChanges();
  //       this.view.dataService.clear();
  //     }
  //   });
  // }

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
        if (actionType == 'add' || actionType == 'copy') {
          (this.dayoffGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe((res) => {
              if (this.dayoffGrid) {
                //this.dayoffGrid.sort = [this.dayOffSortModel]
                //this.dayoffGrid.gridRef.allowSorting =true;
                this.dayoffGrid.gridRef.sortColumn(
                  'BeginDate',
                  'Descending',
                  false
                );
              }
            });
          // this.dayoffRowCount += 1;
        } else if (actionType == 'edit') {
          (this.dayoffGrid.dataService as CRUDService)
            .update(res.event)
            .subscribe((res) => {
              if (this.dayoffGrid) {
                this.dayoffGrid.gridRef.allowSorting = true;
                this.dayoffGrid.gridRef.sortColumn(
                  'BeginDate',
                  'Descending',
                  false
                );
              }
            });
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
    // option.DataService = this.workPermitGridview.dataService;
    // option.FormModel = this.workPermitGridview.formModel;
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
            res?.event.issuedDate > this.crrWorkpermit.issuedDate ||
            res?.event.issuedDate > this.crrWorkpermit.issuedDate
          ) {
            //do nothing, old is current value is still is current
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
    //option.DataService = this.visaGridview.dataService;
    //option.FormModel = this.visaGridview.formModel;
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
          if (
            !this.crrVisa ||
            res?.event.issuedDate > this.crrVisa.issuedDate
          ) {
            this.crrVisa = res?.event;
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          if (
            res?.event.issuedDate > this.crrVisa.issuedDate ||
            res?.event.issuedDate > this.crrVisa.issuedDate
          ) {
            //do nothing, old is current value is still is current
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

  valueChangeFilterSkill(e) {}

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
        this.updateGridView(this.eDisciplineGrid, actionType, res.event);
      this.df.detectChanges();
    });
  }

  HandleEmployeeAccidentInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.eAccidentGridView?.dataService;
    option.FormModel = this.eAccidentsFormModel;
    option.Width = '550px';
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
      else {
        this.updateGridView(
          this.eAccidentGridView,
          actionType,
          res.event
        );
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
        this.reRenderGrid = false;
        this.df.detectChanges();
        this.reRenderGrid = true;
        this.df.detectChanges();
        if (actionType == 'add') {
          //this.appointionRowCount += 1;
          // this.appointionRowCount+=1
          // this.appointionGridView.dataSource = [];
          // this.appointionGridView.gridRef!.dataSource = [];
          // this.appointionGridView.dataService.loading = false;
          // this.appointionGridView.dataService.loaded = false;
          // this.appointionGridView.loadData();
          //Khong duoc xoa comment nay
          // this.appointionGridView.dataService.load().subscribe(res=>{
          //     this.appointionGridView.dataSource = [];
          // this.appointionGridView.gridRef!.dataSource = []
          //   this.appointionGridView.dataSource = this.appointionGridView.dataService.oriData;
          //   this.appointionGridView.gridRef!.dataSource = this.appointionGridView.dataSource;
          //   this.appointionGridView.dataService.data =this.appointionGridView.dataService.oriData;
          //   this.appointionGridView.gridRef?.refreshColumns();
          //   this.appointionRowCount =this.appointionGridView.dataSource.length ;
          // })
        } else if (actionType == 'copy') {
          //this.appointionRowCount += 1;
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
        dataInput: data, // get data
      },
      option
    );
    // RELOAD
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else if (res.event)
        this.eCertificateRowCount += this.updateGridView(
          this.eCertificateGrid,
          actionType,
          res.event
        );
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
      if (res)
        this.eDegreeRowCount += this.updateGridView(
          this.eDegreeGrid,
          actionType,
          res.event
        );
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
        this.lstESkill = res?.event[1];
        if (this.skillGrid) {
          this.eSkillRowCount += this.updateGridView(
            this.skillGrid,
            actionType,
            res.event[0]
          );
        } else {
          if (actionType == 'add' || actionType == 'copy') {
            this.eSkillRowCount++;
          }
        }
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
    option.Width = '550px';
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
        this.eTrainCourseRowCount += this.updateGridView(
          this.eTrainCourseGrid,
          actionType,
          res.event
        );
      this.df.detectChanges();
    });
  }

  HandleBebefitInfo(actionType, s) {
    this.api
      .execSv('HR', 'ERM.Business.HR', 'EBenefitsBusiness', 'AddAsync', null)
      .subscribe((res) => {});
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
        if (res.event.isCurrent == true) {
          this.crrEContract = res.event;
        } else {
          this.getECurrentContract();
        }
      }
      this.df.detectChanges();
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
          // this.eHealthRowCount += 1;
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

  //#region HR_EAward ---------

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
      if (res.event[0]) this.updateGridView(this.AwardGrid, actionType, res.event[0]);
      this.df.detectChanges();
    });
  }
  //#endregion

  //#region HR_EDesisease
  HandleEmployeeEDiseasesInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.view.formModel;
    option.DataService = this.view.dataService;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(PopupEDiseasesComponent, {
      actionType: actionType,
      funcID: this.eDiseasesFuncID,
      employeeId: this.employeeID,
      dataInput: data,
      headerText:
        actionHeaderText + ' ' + this.getFormHeader(this.eDiseasesFuncID),
    });
    dialogAdd.closed.subscribe((res) => {
      if (res)
        this.updateGridView(
          this.eDiseasesGrid,
          actionType,
          res.event
        );
      this.df.detectChanges();
    });

    // let option = new SidebarModel();
    // // option.FormModel = this.view.formModel
    // option.Width = '850px';
    // let dialogAdd = this.callfunc.openSide(
    //   PopupEDiseasesComponent,
    //   {
    //     actionType: actionType,
    //     indexSelected: this.lstEdiseases.indexOf(data),
    //     lstEdiseases: this.lstEdiseases,
    //     funcID: 'HRTEM0803',
    //     headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0803'),
    //     employeeId: this.employeeID,
    //   },
    //   option
    // );
    // dialogAdd.closed.subscribe((res) => {
    //   if (res) {
    //     // this.hrService
    //     //   .GetCurrentJobSalaryByEmployeeID(this.data.employeeID)
    //     //   .subscribe((p) => {
    //     //     this.crrJobSalaries = p;
    //     //   });
    //     console.log('current val', res.event);
    //     this.df.detectChanges();
    //   }
    //   if (res?.event) this.view.dataService.clear();
    // });
  }
  //#endregion

  //#region HR_EContracts
  addEContracts(actionHeaderText) {
    this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEContractComponent,
      {
        actionType: 'add',
        salarySelected: null,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eContractFuncID),
        employeeId: this.employeeID,
        funcID: this.eContractFuncID,
        openFrom: 'empDetail',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res) {
        this.crrJobSalaries = res.event;
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  //#endregion

  //#region  HR_EBusinessTravels
  HandleEBusinessTravel(actionHeaderText, actionType: string, data: any) {
    // this.businessTravelGrid.dataService.dataSelected = this.infoPersonal;
    // (this.businessTravelGrid.dataService as CRUDService).addNew().subscribe(res =>{
    //   console.log('GridComponent', this.businessTravelGrid)
    // });

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
        if (actionType == 'add' || actionType == 'copy') {
          // this.eBusinessTravelRowCount += 1;
          (this.businessTravelGrid?.dataService as CRUDService)
            ?.add(res.event)
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

  //#region handle rewards
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
          // this.eVaccineRowCount += 1;
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
  // #region
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
        let urlView = '/hr/employeedetail/HRT03b';
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
            empInfo: JSON.stringify(this.listEmp[index + 1]),
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
        let urlView = '/hr/employeedetail/HRT03b';
        this.codxService.replaceNavigate(
          urlView,
          {
            employeeID: this.listEmp[index - 1]?.employeeID,
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
            empInfo: JSON.stringify(this.listEmp[index - 1]),
            data: this.listEmp,
            request: this.request,
          }
        );
      }
    }
  }

  //#region Phụ cấp

  numPageSizeGridView = 100;
  @ViewChild('eDiseasesGridView') eDiseasesGrid: CodxGridviewComponent;
  @ViewChild('eAwardGridView') AwardGrid: CodxGridviewComponent;
  @ViewChild('eDisciplineGridView') eDisciplineGrid: CodxGridviewComponent;
  @ViewChild('businessTravelGrid') businessTravelGrid: CodxGridviewComponent;
  @ViewChild('eTrainCourseGridView') eTrainCourseGrid: CodxGridviewComponent;
  @ViewChild('eSkillGridViewID') skillGrid: CodxGridviewComponent;
  @ViewChild('eCertificateGridView') eCertificateGrid: CodxGridviewComponent;
  @ViewChild('eExperienceGridView') eExperienceGrid: CodxGridviewComponent;
  @ViewChild('eAssetGridView') eAssetGrid: CodxGridviewComponent;
  @ViewChild('eHealthsGridView') eHealthsGrid: CodxGridviewComponent;
  @ViewChild('eVaccinesGridView') eVaccinesGrid: CodxGridviewComponent;
  @ViewChild('gridView') eBenefitGrid: CodxGridviewComponent;
  @ViewChild('eDegreeGridView') eDegreeGrid: CodxGridviewComponent;
  @ViewChild('dayoffGridView') dayoffGrid: CodxGridviewComponent;
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
  @ViewChild('headTempDegree1', { static: true }) headTempDegree1: TemplateRef<any>;
  @ViewChild('headTempDegree2', { static: true }) headTempDegree2: TemplateRef<any>;
  @ViewChild('headTempDegree3', { static: true }) headTempDegree3: TemplateRef<any>;

  @ViewChild('tempCol1EHealthGrid', { static: true })
  tempCol1EHealthGrid: TemplateRef<any>;
  @ViewChild('tempCol2EHealthGrid', { static: true })
  tempCol2EHealthGrid: TemplateRef<any>;
  @ViewChild('tempCol3EHealthGrid', { static: true })
  tempCol3EHealthGrid: TemplateRef<any>;
  @ViewChild('headTempHealth1', { static: true }) headTempHealth1: TemplateRef<any>;
  @ViewChild('headTempHealth2', { static: true }) headTempHealth2: TemplateRef<any>;
  @ViewChild('headTempHealth3', { static: true }) headTempHealth3: TemplateRef<any>;

  @ViewChild('tempEVaccineGridCol1', { static: true })
  tempEVaccineGridCol1: TemplateRef<any>;
  @ViewChild('tempEVaccineGridCol2', { static: true })
  tempEVaccineGridCol2: TemplateRef<any>;
  @ViewChild('tempEVaccineGridCol3', { static: true })
  tempEVaccineGridCol3: TemplateRef<any>;
  @ViewChild('headTempVaccine1', { static: true }) headTempVaccine1: TemplateRef<any>;
  @ViewChild('headTempVaccine2', { static: true }) headTempVaccine2: TemplateRef<any>;
  @ViewChild('headTempVaccine3', { static: true }) headTempVaccine3: TemplateRef<any>;

  @ViewChild('templateECertificateGridCol1', { static: true })
  templateECertificateGridCol1: TemplateRef<any>;
  @ViewChild('templateECertificateGridCol2', { static: true })
  templateECertificateGridCol2: TemplateRef<any>;
  @ViewChild('templateECertificateGridCol3', { static: true })
  templateECertificateGridCol3: TemplateRef<any>;
  @ViewChild('headTempCertificate1', { static: true }) headTempCertificate1: TemplateRef<any>;
  @ViewChild('headTempCertificate2', { static: true }) headTempCertificate2: TemplateRef<any>;
  @ViewChild('headTempCertificate3', { static: true }) headTempCertificate3: TemplateRef<any>;

  @ViewChild('templateESkillGridCol1', { static: true })
  templateESkillGridCol1: TemplateRef<any>;
  @ViewChild('templateESkillGridCol2', { static: true })
  templateESkillGridCol2: TemplateRef<any>;
  @ViewChild('templateESkillGridCol3', { static: true })
  templateESkillGridCol3: TemplateRef<any>;
  @ViewChild('headTempSkill1', { static: true }) headTempSkill1: TemplateRef<any>;
  @ViewChild('headTempSkill2', { static: true }) headTempSkill2: TemplateRef<any>;
  @ViewChild('headTempSkill3', { static: true }) headTempSkill3: TemplateRef<any>;

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
  @ViewChild('headTempTrainCourse1', { static: true }) headTempTrainCourse1: TemplateRef<any>;
  @ViewChild('headTempTrainCourse2', { static: true }) headTempTrainCourse2: TemplateRef<any>;
  @ViewChild('headTempTrainCourse3', { static: true }) headTempTrainCourse3: TemplateRef<any>;

  @ViewChild('templateBusinessTravelGridCol1', { static: true })
  templateBusinessTravelGridCol1: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol2', { static: true })
  templateBusinessTravelGridCol2: TemplateRef<any>;
  @ViewChild('templateBusinessTravelGridCol3', { static: true })
  templateBusinessTravelGridCol3: TemplateRef<any>;
  @ViewChild('headTempBusinessTravel1', { static: true }) headTempBusinessTravel1: TemplateRef<any>;
  @ViewChild('headTempBusinessTravel2', { static: true }) headTempBusinessTravel2: TemplateRef<any>;
  @ViewChild('headTempBusinessTravel3', { static: true }) headTempBusinessTravel3: TemplateRef<any>;
 
  @ViewChild('templateAwardGridCol1', { static: true })
  templateAwardGridCol1: TemplateRef<any>;
  @ViewChild('templateAwardGridCol2', { static: true })
  templateAwardGridCol2: TemplateRef<any>;
  @ViewChild('templateAwardGridCol3', { static: true })
  templateAwardGridCol3: TemplateRef<any>;
  @ViewChild('headTempAwards1', { static: true }) headTempAwards1: TemplateRef<any>;
  @ViewChild('headTempAwards2', { static: true }) headTempAwards2: TemplateRef<any>;
  @ViewChild('headTempAwards3', { static: true }) headTempAwards3: TemplateRef<any>;

  //View child ky luat
  @ViewChild('templateDisciplineGridCol1', { static: true })
  templateDisciplineGridCol1: TemplateRef<any>;
  @ViewChild('templateDisciplineGridCol2', { static: true })
  templateDisciplineGridCol2: TemplateRef<any>;
  @ViewChild('templateDisciplineGridCol3', { static: true })
  templateDisciplineGridCol3: TemplateRef<any>;
  @ViewChild('headTempDisciplines1', { static: true }) headTempDisciplines1: TemplateRef<any>;
  @ViewChild('headTempDisciplines2', { static: true }) headTempDisciplines2: TemplateRef<any>;
  @ViewChild('headTempDisciplines3', { static: true }) headTempDisciplines3: TemplateRef<any>;


  @ViewChild('templateDiseasesGridCol1', { static: true })
  templateDiseasesGridCol1: TemplateRef<any>;
  @ViewChild('templateDiseasesGridCol2', { static: true })
  templateDiseasesGridCol2: TemplateRef<any>;
  @ViewChild('templateDiseasesGridCol3', { static: true })
  templateDiseasesGridCol3: TemplateRef<any>;
  @ViewChild('headTempDiseases1', { static: true }) headTempDiseases1: TemplateRef<any>;
  @ViewChild('headTempDiseases2', { static: true }) headTempDiseases2: TemplateRef<any>;
  @ViewChild('headTempDiseases3', { static: true }) headTempDiseases3: TemplateRef<any>;

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
      debugger
      this.filterEBenefitPredicates += `and (EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      this.filterEBenefitPredicates += ') ';
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
        .subscribe();
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
        .subscribe();
    } else if (
      this.filterByBenefitIDArr?.length <= 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}" and EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates([this.filterEBenefitPredicates], [])
        .subscribe();
    } else if (
      this.filterByBenefitIDArr?.length <= 0 &&
      (this.startDateEBenefitFilterValue == undefined ||
        this.startDateEBenefitFilterValue == null)
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eBenefitGrid.dataService as CRUDService)
        .setPredicates([this.filterEBenefitPredicates], [''])
        .subscribe();
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

  closeModelBenefit(dialog: DialogRef) {
    dialog.close();
  }

  // headerTextBenefit;
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
      }
      ,
      null,
      opt
    )
    popup.closed.subscribe((res) => {
      debugger
      if (res?.event) {
        if (res?.event == 'none') {
          this.listCrrBenefit = null;
        } else {
          this.listCrrBenefit = res.event;
        }
        this.df.detectChanges();
      }
    }) 
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

  RenderDataFromPopup(event) {
    if (event.isRenderDelete === true) {
      this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
        if (res) {
          this.listCrrBenefit = res;
          this.df.detectChanges();
        }
      });
    }
    // this.clickMF(event?.event, event?.data, 'eBenefit');
  }

  valueChangeViewAllEBenefit(evt) {
    this.popupViewBenefit();
  }

  valueChangeViewAllEAsset(evt) {
    this.ViewAllEAssetFlag = evt.data;
    let ins = setInterval(() => {
      if (this.eAssetGrid) {
        clearInterval(ins);
        let t = this;
        this.eAssetGrid.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.eAssetRowCount = res['data']?.length;
            }
          }
        });
        this.eAssetRowCount = this.eAssetGrid.dataService.rowCount;
      }
    }, 100);
  }

  valueChangeViewAllESkill(evt) {
    this.ViewAllEskillFlag = evt.data;
    let ins = setInterval(() => {
      if (this.skillGrid) {
        clearInterval(ins);
        let t = this;
        this.skillGrid.dataService.onAction.subscribe((res) => {
          if (res.type == 'loaded') {
            t.eSkillRowCount = res['data']?.length;
          }
        });
        this.eSkillRowCount = this.skillGrid.dataService.rowCount;
      }
    }, 100);
  }

  closeModelSalary(dialog: DialogRef) {
    dialog.close();
  }

  // headerTextSalary;
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
      }
      ,
      null,
      opt
    )
    popup.closed.subscribe((res) => {
      debugger
      if(res?.event){
        if (res?.event == 'none') {
          this.crrEBSalary = null;
        } else {
          this.crrEBSalary = res.event;
        }
        this.df.detectChanges();
      }
    }) 
    // this.headerTextSalary =
    //   this.getFormHeader(this.eBasicSalaryFuncID) + ' | ' + 'Tất cả';
    // let option = new DialogModel();
    // option.zIndex = 999;
    // option.DataService = this.view.dataService;
    // option.FormModel = this.view.formModel;
    // this.dialogViewSalary = this.callfc.openForm(
    //   this.templateViewSalary,
    //   '',
    //   850,
    //   550,
    //   '',
    //   null,
    //   '',
    //   option
    // );
    // this.dialogViewSalary.closed.subscribe((res) => {
    //   this.df.detectChanges();
    // });
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

  //Update data table follow pop up
  // UpdateDataFromPopup(event) {
  //   if (event.isRenderDelete === true) {
  //     this.hrService
  //       .GetCurrentEBasicSalariesByEmployeeID(this.employeeID)
  //       .subscribe((dataEBaSlary) => {
  //         this.crrEBSalary = dataEBaSlary;
  //       });
  //   }
  // }

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
      this.eTrainCourseGrid.dataService.dataSelected = data;
      this.hrService
        .copy(data, this.eTrainCourseFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeTrainCourseInfo(actionHeaderText, 'copy', res);
        });
      // (this.eTrainCourseGrid.dataService as CRUDService)
      //   .copy()
      //   .subscribe((res) => {
      //     console.log('data copyyyyy', res);
      //     this.HandleEmployeeTrainCourseInfo(actionHeaderText, 'copy', res);
      //   });
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
    } else if (flag == 'eDayoff') {
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
  //#endregion

  addTest() {
    this.hrService.addTest().subscribe();
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
    gridView: CodxGridviewComponent,
    actionType: string,
    dataItem: any
  ) {
    if (!dataItem) (gridView?.dataService as CRUDService)?.clear();
    else {
      let returnVal = 0;
      if (actionType == 'add' || actionType == 'copy') {
        (gridView?.dataService as CRUDService)?.add(dataItem, 0).subscribe();
        returnVal = 1;
      } else if (actionType == 'edit') {
        (gridView?.dataService as CRUDService)?.update(dataItem).subscribe();
      } else if ((actionType = 'delete')) {
        (gridView?.dataService as CRUDService)?.remove(dataItem).subscribe();
        returnVal = -1;
      }
      if (gridView.formModel.entityName == this.ePassportFormModel.entityName) {
        this.crrPassport = gridView.dataService.data[0];
        this.df.detectChanges();
      }
      if (gridView.formModel.entityName == this.eVisaFormModel.entityName) {
        this.crrVisa = gridView.dataService.data[0];
        this.df.detectChanges();
      }
      if (
        gridView.formModel.entityName == this.eWorkPermitFormModel.entityName
      ) {
        this.crrWorkpermit = gridView.dataService.data[0];
        this.df.detectChanges();
      }
      return returnVal;
    }
    return 0;
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
        .subscribe();
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
        .subscribe();
    } else if (
      this.filterByAssetCatIDArr?.length <= 0 &&
      this.startDateEAssetFilterValue != null
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}" and IssuedDate>="${this.startDateEAssetFilterValue}" and IssuedDate<="${this.endDateEAssetFilterValue}")`;
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates(["time"], [this.employeeID,this.startDateEAssetFilterValue,this.endDateEAssetFilterValue])
        .subscribe();
    } else if (
      this.filterByAssetCatIDArr?.length <= 0 &&
      (this.startDateEAssetFilterValue == undefined ||
        this.startDateEAssetFilterValue == null)
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eAssetGrid.dataService as CRUDService)
        .setPredicates([this.filterEAssetPredicates], [this.employeeID])
        .subscribe();
    }
  }
  valueChangeYearFilterAward(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.Start_Date_Award_Filter_Value = null;
      this.End_Date_Award_Filter_Value = null;
      this.Filter_Award_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.AwardGrid.dataService as CRUDService)
        .setPredicates([this.Filter_Award_Predicates], [''])
        .subscribe();
    } else {
      this.Start_Date_Award_Filter_Value = evt.fromDate.toJSON();
      this.End_Date_Award_Filter_Value = evt.toDate.toJSON();
      (this.AwardGrid.dataService as CRUDService)
        .setPredicates(
          [
            `(EmployeeID=="${this.employeeID}" and AwardDate>="${this.Start_Date_Award_Filter_Value}" and AwardDate<="${this.End_Date_Award_Filter_Value}")`,
          ],
          []
        )
        .subscribe();
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
          [this.filterByVaccineTypeIDArr.join(';')]
        )
        .subscribe();
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
        )
        .subscribe();
    } else if (
      this.filterByVaccineTypeIDArr?.length <= 0 &&
      this.startDateEVaccineFilterValue != null
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}" and InjectDate>="${this.startDateEVaccineFilterValue}" and InjectDate<="${this.endDateEVaccineFilterValue}")`;
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates([this.filterEVaccinePredicates], [])
        .subscribe();
    } else if (
      this.filterByVaccineTypeIDArr?.length <= 0 &&
      (this.startDateEVaccineFilterValue == undefined ||
        this.startDateEVaccineFilterValue == null)
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eVaccinesGrid.dataService as CRUDService)
        .setPredicates([this.filterEVaccinePredicates], [''])
        .subscribe();
    }
  }

  UpdateESkillPredicate(evt) {
    this.filterByESkillIDArr = evt.data;
    let lengthArr = this.filterByESkillIDArr?.length;

    if (lengthArr <= 0) {
      this.filterESkillPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.skillGrid.dataService as CRUDService)
        .setPredicates([this.filterESkillPredicates], [''])
        .subscribe();
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
          [this.filterByESkillIDArr.join(';')]
        )
        .subscribe();
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
          [this.Filter_By_ETrainCourse_IDArr.join(';')]
        )
        .subscribe();
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
          [this.Filter_By_ETrainCourse_IDArr.join(';')]
        )
        .subscribe();
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length <= 0 &&
      this.Start_Date_ETrainCourse_Filter_Value != null
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}" and TrainFromDate>="${this.Start_Date_ETrainCourse_Filter_Value}" and TrainFromDate<="${this.End_Date_ETrainCourse_Filter_Value}")`;
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates([this.Filter_ETrainCourse_Predicates], [])
        .subscribe();
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length <= 0 &&
      (this.Start_Date_ETrainCourse_Filter_Value == undefined ||
        this.Start_Date_ETrainCourse_Filter_Value == null)
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates([this.Filter_ETrainCourse_Predicates], [''])
        .subscribe();
    }
  }

  valueChangeFilterDiseasesTypeID(evt) {
    this.Filter_By_EDiseases_IDArr = evt.data;
    let lengthArr = this.Filter_By_EDiseases_IDArr?.length;
    if (lengthArr <= 0) {
      this.Filter_EDiseases_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eDiseasesGrid.dataService as CRUDService)
        .setPredicates([this.Filter_EDiseases_Predicates], [''])
        .subscribe();
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
          [this.Filter_By_EDiseases_IDArr.join(';')]
        )
        .subscribe();
    }
  }
  // filter đào tạo
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
  // filter đào tạo 1
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
        .setPredicates([this.filterBusinessTravelPredicates], [''])
        .subscribe();
    } else {
      this.startDateBusinessTravelFilterValue = evt.fromDate.toJSON();
      this.endDateBusinessTravelFilterValue = evt.toDate.toJSON();
      (this.businessTravelGrid.dataService as CRUDService)
        .setPredicates(
          [
            `(EmployeeID=="${this.employeeID}" and BeginDate>="${this.startDateBusinessTravelFilterValue}" and EndDate<="${this.endDateBusinessTravelFilterValue}")`,
          ],
          []
        )
        .subscribe();
    }
  }

  UpdateEDayOffsPredicate() {
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
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEDayoffPredicates],
          [this.filterByKowIDArr.join(';')]
        )
        .subscribe();
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
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterEDayoffPredicates],
          [this.filterByKowIDArr.join(';')]
        )
        .subscribe();
    } else if (
      this.filterByKowIDArr?.length <= 0 &&
      this.startDateEDayoffFilterValue != null
    ) {
      this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}" and BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}")`;
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates([this.filterEDayoffPredicates], [])
        .subscribe();
    } else if (
      this.filterByKowIDArr?.length <= 0 &&
      (this.startDateEDayoffFilterValue == undefined ||
        this.startDateEDayoffFilterValue == null)
    ) {
      this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates([this.filterEDayoffPredicates], [''])
        .subscribe();
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
        .setPredicates([this.filterAccidentIdPredicate], [''])
        .subscribe();
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
          [this.filterByAccidentIDArr.join(';')]
        )
        .subscribe();
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

  //#region AssetBackgroundColor
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

  //#endregion

  //#region EBenefit color format
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
  //#endregion

  //#region EVaccine color format
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
  //#endregion

  close2(dialog: DialogRef) {
    dialog.close();
  }

  getManagerEmployeeInfoById() {
    if (this.infoPersonal?.lineManager) {
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = this.infoPersonal.lineManager;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrService.loadData('HR', empRequest)
      .subscribe((res:any) => {
        if (Array.isArray(res) && res[1] > 0 ) {
          this.lineManager = res[0][0];
        }
      });
    }
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
}
