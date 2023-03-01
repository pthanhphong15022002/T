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
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  SortModel,
  UIComponent,
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

  active = [
    'HRTEM0101',
    'HRTEM0201',
    'HRTEM0301',
    'HRTEM0401',
    'HRTEM0501',
    'HRTEM0601',
    'HRTEM0701',
    'HRTEM0801',
  ];

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
    // this.infoPersonal =
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

  infoPersonal: any;

  crrEContract: any;

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
  crrPassport: any;
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
  crrTab: number = 0;
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
  IsMax = false;
  Current_Grade_ESkill: any = [];
  //Awards
  lstAwards: any = [];

  //#region getGridView
  eVaccineGrvSetup;
  eSkillgrvSetup;
  eBenefitGrvSetup;
  eAssetGrvSetup;
  eDayOffGrvSetup;
  eTrainCourseGrvSetup;
  eDiseasesGrvSetup;
  eAccidentsGrvSetup
  //#endregion

  //#region sortModels
  dayOffSortModel: SortModel;
  assetSortModel: SortModel;
  experienceSortModel: SortModel;
  businessTravelSortModel: SortModel;
  benefitSortModel: SortModel;
  passportSortModel: SortModel;
  skillIDSortModel: SortModel;
  skillGradeSortModel: SortModel;
  bSalarySortModel: SortModel;
  //#endregion

  reRenderGrid = true;

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
  eAccidentsColumnsGrid
  //#endregion

  filterByBenefitIDArr: any = [];
  filterEBenefitPredicates: string;
  startDateEBenefitFilterValue;
  endDateEBenefitFilterValue;

  ViewAllEBenefitFlag = false;
  ViewAllEAssetFlag = false;
  ViewAllEskillFlag = false;
  ViewAllEBasicSalaryFlag = false;
  ViewAllEJobSalaryFlag = false;
  ViewAllEContractFlag = false;
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
  filterByAccidentIDArr: any = []
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

  //#endregion

  //#region gridView viewChild
  @ViewChild('passportGridview') passportGridview: CodxGridviewComponent;
  @ViewChild('visaGridview') visaGridview: CodxGridviewComponent;
  @ViewChild('workPermitGridview') workPermitGridview: CodxGridviewComponent;
  @ViewChild('basicSalaryGridview') basicSalaryGridview: CodxGridviewComponent;
  @ViewChild('appointionGridView') appointionGridView: CodxGridviewComponent;
  @ViewChild('jobSalaryGridview') jobSalaryGridview: CodxGridviewComponent;
  @ViewChild('eContractGridview') eContractGridview: CodxGridviewComponent;
  @ViewChild('eAccidentGridView') eAccidentGridView: CodxGridviewComponent;

  //#endregion

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
  eDegreeRowCount;
  passportRowCount: number;
  visaRowCount: Number;
  workPermitRowCount: Number;
  eExperienceRowCount;
  eCertificateRowCount;
  eBenefitRowCount: number = 0;
  eBusinessTravelRowCount = 0;
  eSkillRowCount = 0;
  dayoffRowCount: number = 0;
  eAssetRowCount;
  eBasicSalaryRowCount;
  eTrainCourseRowCount;
  eHealthRowCount = 0;
  eVaccineRowCount = 0;
  appointionRowCount;
  eJobSalaryRowCount;
  awardRowCount;
  eContractRowCount;
  eDisciplineRowCount;
  eDiseasesRowCount;
  eAccidentsRowCount;
  //#endregion

  //#region var functionID

  eInfoFuncID = 'HRTEM0101';
  ePartyFuncID = 'HRTEM0102';
  eFamiliesFuncID = 'HRTEM0103';
  eAssurFunc = 'HRTEM0201';
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
  eAccidentsFuncID = 'HRTEM0804';
  //#endregion

  //#region Vll Assets colors
  AssetColorValArr : any = [];
  //#endregion

  //#region var formModel
  benefitFormodel: FormModel;
  EBusinessTravelFormodel: FormModel;
  eInfoFormModel: FormModel; // Thông tin bản thân/ Bảo hiểm
  eFamilyFormModel: FormModel; //Quan hệ gia đình
  ePassportFormModel: FormModel; //Hộ chiếu
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
  dayofFormModel: FormModel;
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
  dataService: DataService = null;
  clickItem(evet) {}

  onSectionChange(data: any) {
    console.log('change section', data);
    this.codxMwpService.currentSection = data.current;
    this.detectorRef.detectChanges();
  }

  onInit(): void {
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

              console.log('gia tri vll lay ra dc tu db asset', data[0]);
              this.AssetColorValArr = JSON.parse(data[0])

        });
    });
  })

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
          console.log('traincourseeeeeeeeeeee', this.eTrainCourseGrvSetup);
        });
    });
    this.hrService.getFormModel(this.eHealthFuncID).then((res) => {
      this.eHealthFormModel = res;
      console.log('ehealth form mo do` ne` ', res);
    });

    this.hrService.getFormModel(this.benefitFuncID).then((res) => {
      this.benefitFormodel = res;
      console.log('benefit form mo do` ne` ', res);

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
      this.cache.gridViewSetup(this.eAccidentsFormModel.formName, this.eAccidentsFormModel.gridViewName).subscribe(res =>{
        this.eAccidentsGrvSetup = res;
      })
    });
    //#endregion

    this.hrService.getFunctionList(this.funcID).subscribe((res) => {
      console.log('functionList', res);
      if (res && res[1] > 0) {
        this.lstTab = res[0].filter((p) => p.parentID == this.funcID);
        this.crrFuncTab = this.lstTab[this.crrTab].functionID;
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
        this.hrService.getHeaderText(this.eCertificateFuncID).then((res) => {
          this.eCertificateHeaderText = res;
          this.eCertificateColumnGrid = [
            {
              headerText: this.eCertificateHeaderText['CertificateID'],
              template: this.templateECertificateGridCol1,
              width: '150',
            },
            {
              headerText:
                this.eCertificateHeaderText['TrainSupplierID'] +
                '|' +
                this.eCertificateHeaderText['Ranking'],
              template: this.templateECertificateGridCol2,
              width: '150',
            },
            {
              headerText:
                this.eCertificateHeaderText['IssuedDate'] +
                '|' +
                this.eCertificateHeaderText['EffectedDate'],
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
                  t.eCertificateRowCount = res['data'].length;
                }
              }
            });
            this.eCertificateRowCount =
              this.eCertificateGrid.dataService.rowCount;
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

        this.hrService.getHeaderText(this.eDegreeFuncID).then((res) => {
          this.eDegreeHeaderText = res;
          this.eDegreeColumnsGrid = [
            {
              headerText:
                this.eDegreeHeaderText['DegreeName'] +
                '|' +
                this.eDegreeHeaderText['TrainFieldID'],
              template: this.templateEDegreeGridCol1,
              width: '150',
            },
            {
              headerText:
                this.eDegreeHeaderText['TrainSupplierID'] +
                '|' +
                this.eDegreeHeaderText['Ranking'],
              template: this.templateEDegreeGridCol2,
              width: '150',
            },
            {
              headerText:
                this.eDegreeHeaderText['YearGraduated'] +
                '|' +
                this.eDegreeHeaderText['IssuedDate'],
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
                  t.eDegreeRowCount = res['data'].length;
                }
              }
            });
            this.eDegreeRowCount = this.eDegreeGrid.dataService.rowCount;
          }
        }, 100);
        //#endregion

        //#region ESKills - Kỹ năng

        this.hrService.getHeaderText(this.eSkillFuncID).then((res) => {
          this.eSkillHeaderText = res;
          this.eSkillColumnGrid = [
            {
              headerText:
                this.eSkillHeaderText['SkillID'] +
                '|' +
                this.eSkillHeaderText['SkillGradeID'],
              template: this.templateESkillGridCol1,
              width: '150',
            },
            {
              headerText:
                this.eSkillHeaderText['TrainSupplierID'] +
                '|' +
                this.eSkillHeaderText['Ranking'] +
                ' - ' +
                this.eSkillHeaderText['TotalScore'],
              template: this.templateESkillGridCol2,
              width: '150',
            },
            {
              headerText:
                this.eSkillHeaderText['TrainFrom'] +
                '|' +
                this.eSkillHeaderText['TrainForm'],
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
                  t.eSkillRowCount = res['data'].length;
                }
              }
            });
            this.eSkillRowCount = this.skillGrid.dataService.rowCount;
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
      if (this.visaGridview) {
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
        this.passportGridview?.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.passportRowCount = res['data'].length;
            }
          }
        });
        this.passportRowCount = this.passportGridview?.dataService.rowCount;
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
      if (this.workPermitGridview) {
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
          width: '100',
        },
        {
          headerText: basicSalaryHeaderText['SISalary'],
          template: this.basicSalaryCol2,
          width: '100',
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

    this.hrService.getHeaderText(this.eTrainCourseFuncID).then((res) => {
      this.eTrainCourseHeaderText = res;
      this.eTrainCourseColumnGrid = [
        {
          headerText:
            this.eTrainCourseHeaderText['TrainCourseID'] +
            '|' +
            this.eTrainCourseHeaderText['TrainForm'],
          template: this.templateTrainCourseGridCol1,
          width: '150',
        },
        {
          headerText:
            this.eTrainCourseHeaderText['TrainFrom'] +
            '|' +
            this.eTrainCourseHeaderText['InYear'],
          template: this.templateTrainCourseGridCol2,
          width: '150',
        },
        {
          headerText:
            this.eTrainCourseHeaderText['TrainSupplierID'] +
            '|' +
            this.eTrainCourseHeaderText['Result'],
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
              t.eTrainCourseRowCount = res['data'].length;
            }
          }
        });
        this.eTrainCourseRowCount = this.eTrainCourseGrid.dataService.rowCount;
      }
    }, 100);

    //#endregion

    //#region get columnGrid EAppointion - Bổ nhiệm điều chuyển
    this.hrService.getHeaderText(this.appointionFuncID).then((res) => {

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

    //#region get columnGrid EJobSalary - Lương chức danh
    this.hrService.getHeaderText(this.eJobSalFuncID).then((res) => {
      this.eJobSalaryHeaderText = res;
      this.jobSalaryColumnGrid = [
        {
          headerText: this.eJobSalaryHeaderText['JSalary'] ?? '' + 'Mức lương',
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
    //#region EReward - Khen thưởng

    this.hrService.getHeaderText(this.awardFuncID).then((res) => {
      this.awardHeaderText = res;
      this.awardColumnsGrid = [
        {
          headerText:
            this.awardHeaderText['AwardID'] +
            '|' +
            this.awardHeaderText['AwardFormCategory'],
          template: this.templateAwardGridCol1,
          width: '150',
        },
        {
          headerText:
            this.awardHeaderText['AwardDate'] +
            '-' +
            this.awardHeaderText['InYear'] +
            '|' +
            // this.awardHeaderText['DecisionNo'] +
            'Số QĐ' +
            '-' +
            this.awardHeaderText['SignedDate'],
          template: this.templateAwardGridCol2,
          width: '150',
        },
        {
          headerText: this.awardHeaderText['Reason'],
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
          headerText:
            this.eDisciplineHeaderText['DisciplineID'] +
            '|' +
            this.eDisciplineHeaderText['DisciplineFormCategory'],
          template: this.templateDisciplineGridCol1,
          width: '150',
        },
        {
          headerText:
            this.eDisciplineHeaderText['DisciplineDate'] +
            '|' +
            this.eDisciplineHeaderText['FromDate'] +
            '-' +
            // this.awardHeaderText['DecisionNo'] +
            'Số QĐ',
          template: this.templateDisciplineGridCol2,
          width: '150',
        },
        {
          headerText: this.eDisciplineHeaderText['Reason'],
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
          headerText: this.eDiseasesHeaderText['DiseaseID'],
          template: this.templateDiseasesGridCol1,
          width: '150',
        },
        {
          headerText:
            'Thời gian điều trị' +
            ' | ' +
            this.eDiseasesHeaderText['TreatHopitalID'],
          template: this.templateDiseasesGridCol2,
          width: '150',
        },
        {
          headerText: this.eDiseasesHeaderText['Conclusion'],
          template: this.templateDiseasesGridCol3,
          width: '150',
        },
      ];
    });

    //#endregion

    //#region EDiseases - Tai nạn lao động

    this.hrService.getHeaderText(this.eAccidentsFuncID).then((res) => {
      this.eAccidentHeaderText = res;
      this.eAccidentsColumnsGrid = [
        {
          headerText: this.eAccidentHeaderText['AccidentID'] + ' | ' + this.eAccidentHeaderText['AccidentDate'],
          template: this.templateEAccidentCol1,
          width: '150',
        },
        {
          headerText:
          this.eAccidentHeaderText['AccidentPlace'] +
            ' | ' +
            this.eAccidentHeaderText['AccidentReasonID'],
          template: this.templateEAccidentCol2,
          width: '150',
        },
        {
          headerText: this.eAccidentHeaderText['AccidentLevel'],
          template: this.templateEAccidentCol3,
          width: '150',
        },
      ];
    });

    let insEAccident = setInterval(() => {
      if (this.eAccidentGridView) {
        clearInterval(insEAccident);
        let t = this;
        this.eAccidentGridView.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.eAccidentsRowCount = 0;
              t.eAccidentsRowCount = res['data'].length;
            }
          }
        });
        this.eAccidentsRowCount = this.eAccidentGridView.dataService.rowCount;
      }
    }, 100);

    //#endregion

    let insDiseases = setInterval(() => {
      if (this.eDiseasesGrid) {
        clearInterval(insDiseases);
        let t = this;
        this.eDiseasesGrid.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type != null && res.type == 'loaded') {
              t.eDiseasesRowCount = 0;
              t.eDiseasesRowCount = res['data'].length;
            }
          }
        });
        this.eDiseasesRowCount = this.eDiseasesGrid.dataService.rowCount;
      }
    }, 100);

    let insJSalary = setInterval(() => {
      if (this.jobSalaryGridview) {
        clearInterval(insJSalary);
        let t = this;
        this.jobSalaryGridview.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type != null && res.type == 'loaded') {
              t.eJobSalaryRowCount = res['data'].length;
            }
          }
        });
        this.eJobSalaryRowCount = this.jobSalaryGridview.dataService.rowCount;
      }
    }, 100);
    let insAward = setInterval(() => {
      if (this.AwardGrid) {
        clearInterval(insAward);
        let t = this;
        this.AwardGrid.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.awardRowCount = 0;
              t.awardRowCount = res['data'].length;
            }
          }
        });
        this.awardRowCount = this.AwardGrid.dataService.rowCount;
      }
    }, 100);

    let insEDiscipline = setInterval(() => {
      if (this.eDisciplineGrid) {
        clearInterval(insEDiscipline);
        let t = this;
        this.eDisciplineGrid.dataService.onAction.subscribe((res) => {
          if (res) {
            if (res.type == 'loaded') {
              t.eDisciplineRowCount = 0;
              t.eDisciplineRowCount = res['data'].length;
            }
          }
        });
        this.eDisciplineRowCount = this.eDisciplineGrid.dataService.rowCount;
      }
    }, 100);

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
      }
    });
    this.router.params.subscribe((param: any) => {
      if (param) {
        this.functionID = param['funcID'];
        if (!this.infoPersonal) {
          let empRequest = new DataRequest();
          empRequest.entityName = 'HR_Employees';
          empRequest.dataValues = this.employeeID;
          empRequest.predicates = 'EmployeeID=@0';
          empRequest.pageLoading = false;
          this.hrService.loadData('HR', empRequest).subscribe((emp) => {
            if (emp[1] > 0) {
              this.infoPersonal = emp[0][0];
              this.initForm();
            }
          });
        } else {
          this.initForm();
        }
        this.getDataAsync(this.functionID);
        this.codxMwpService.empInfo.subscribe((res: string) => {
          if (res) {
            console.log(res);
          }
        });
      }
    });
  }

  initForm() {
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

      let opPassport = new DataRequest();
      opPassport.gridViewName = 'grvEPassports';
      opPassport.entityName = 'HR_EPassports';
      opPassport.predicates = 'EmployeeID=@0';
      opPassport.dataValues = this.employeeID;
      opPassport.srtColumns = 'IssuedDate';
      opPassport.srtDirections = 'desc';
      (opPassport.page = 1),
        this.hrService.loadData('HR', opPassport).subscribe((res) => {
          if (res) this.lstPassport = res[0];
          if (this.lstPassport.length > 0) {
            this.crrPassport = this.lstPassport[0];
            console.log('Current value', this.crrPassport);
          }
        });

                  //Job salaries
                  this.hrService
                  .GetCurrentJobSalaryByEmployeeID(this.employeeID)
                  .subscribe((res) => {
                    this.crrJobSalaries = res;
                  });
      
                // Salary
                this.hrService
                  .GetCurrentEBasicSalariesByEmployeeID(this.employeeID)
                  .subscribe((res) => {
                    if (res) {
                      this.crrEBSalary = res;
                    }
                  });
      
                // Benefit
                this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
                  if (res?.length) {
                    this.listCrrBenefit = res;
                    
                  }
                });

                // Asset 
                this.hrService.LoadDataEAsset(this.employeeID).subscribe((res)=>{
                  if(res){
                    this.lstAsset = res;
                  }
                })
      //work permit
      let op4 = new DataRequest();
      op4.gridViewName = 'grvEWorkPermits';
      op4.entityName = 'HR_EWorkPermits';
      op4.predicate = 'EmployeeID=@0';
      op4.dataValue = this.employeeID;
      (op4.page = 1),
        this.hrService.getListWorkPermitByEmployeeID(op4).subscribe((res) => {
          if (res) {
            this.lstWorkPermit = res[0];
          }
        });

      //Job salaries
      this.hrService
        .GetCurrentJobSalaryByEmployeeID(this.employeeID)
        .subscribe((res) => {
          this.crrJobSalaries = res;
        });

      let op3 = new DataRequest();
      op3.entityName = 'HR_EJobSalaries';
      op3.dataValue = this.employeeID;
      op3.predicate = 'EmployeeID=@0';
      (op3.page = 1),
        this.hrService.getListJobSalariesByEmployeeID(op3).subscribe((res) => {
          if (res) {
            this.lstJobSalaries = res[0];
          }
        });

      //EExperience
      let op = new DataRequest();
      op.entityName = 'HR_EExperiences';
      op.dataValue = this.employeeID;
      op.predicate = 'EmployeeID=@0';
      op.page = 1;
      this.hrService.GetExperienceListByEmployeeIDAsync(op).subscribe((res) => {
        this.lstExperience = res;
      });

      // basic Salary
      this.hrService
        .GetCurrentEBasicSalariesByEmployeeID(this.employeeID)
        .subscribe((res) => {
          if (res) {
            this.crrEBSalary = res;
          }
        });

      let rqEBasic = new DataRequest();
      rqEBasic.entityName = 'HR_EBasicSalaries';
      rqEBasic.dataValue = this.employeeID;
      rqEBasic.predicate = 'EmployeeID=@0';
      (rqEBasic.page = 1),
        this.hrService
          .getListBasicSalariesByDataRequest(rqEBasic)
          .subscribe((res) => {
            if (res) {
              this.lstEBSalary = res;
            }
          });

      //Vaccine
      let rqVaccine = new DataRequest();
      rqVaccine.entityName = 'HR_EVaccines';
      rqVaccine.dataValues = this.employeeID;
      rqVaccine.predicates = 'EmployeeID=@0';
      rqVaccine.page = 1;
      rqVaccine.pageSize = 20;
      this.hrService.loadDataEVaccine(rqVaccine).subscribe((res) => {
        this.lstVaccine = res;
      });

      //HR_ESkills
      let rqESkill = new DataRequest();
      rqESkill.entityName = 'HR_ESkills';
      rqESkill.dataValues = this.employeeID;
      rqESkill.predicates = 'EmployeeID=@0';
      rqESkill.page = 1;
      rqESkill.pageSize = 20;
      this.hrService.getViewSkillAsync(rqESkill).subscribe((res) => {
        if (res) {
          this.lstESkill = res;
        }
      });

      //HR_EAwards
      let rqAward = new DataRequest();
      rqAward.entityName = 'HR_ESkills';
      rqAward.dataValues = this.employeeID;
      rqAward.predicates = 'EmployeeID=@0';
      rqAward.page = 1;
      rqAward.pageSize = 20;
      this.hrService.getViewSkillAsync(rqAward).subscribe((res) => {
        if (res) {
          this.lstAwards = res;
        }
      });

      //HR_EContracts
      let rqContract = new DataRequest();
      rqContract.entityName = 'HR_EContracts';
      rqContract.dataValues = this.employeeID + ';false;true';
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
          this.df.detectChanges();
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
            } else if (funcID == 'eDayoff') {
              this.hrService.DeleteEmployeeDayOffInfo(data).subscribe((p) => {
                if (p != null) {
                  this.notify.notifyCode('SYS008');
                  (this.dayoffGrid.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
                  this.dayoffRowCount = this.dayoffRowCount - 1;
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
                    this.hrService.LoadDataEAsset(this.employeeID).subscribe((res) => {
                      this.lstAsset = res;
                    })
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
                  if (data.isCurrent == true) {
                    const index = this.listCrrBenefit.indexOf(data, 0);
                    if (index > -1) {
                      this.listCrrBenefit.splice(index, 1);
                    }
                        this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
                          if (res?.length) {
                            this.listCrrBenefit = res;
                            
                            this.df.detectChanges();
                          }
                      }
                  )}
                  (this.grid?.dataService as CRUDService)?.remove(data)
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
                    // this.hrService
                    //   .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
                    //   .subscribe((p) => {
                    //     this.crrEBSalary = p;
                    //   });
                    (this.basicSalaryGridview?.dataService as CRUDService)
                      ?.remove(data)
                      .subscribe();
                    this.eBasicSalaryRowCount--;
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
              this.hrService.deleteESkill1(data).subscribe((p) => {
                if (p[0] == true) {
                  this.notify.notifyCode('SYS008');

                  (this.skillGrid?.dataService as CRUDService)
                    .remove(data)
                    .subscribe();
                  this.eSkillRowCount--;
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
                    this.appointionRowCount--;
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
            } else if (funcID == 'eDiseases') {
              this.hrService
                .DeleteEmployeeEDiseasesInfo(data.recID)
                .subscribe((p) => {
                  if (p == true) {
                    (this.eDiseasesGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.eDiseasesRowCount--;
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
                  this.eBusinessTravelRowCount =
                    this.eBusinessTravelRowCount - 1;
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
                    this.awardRowCount--;
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
            } else if (funcID == 'eDisciplines') {
              this.hrService
                .DeleteEmployeeDisciplineInfo(data.recID)
                .subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    (this.eDisciplineGrid.dataService as CRUDService)
                      .remove(data)
                      .subscribe();
                    this.eDisciplineRowCount--;
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
        } else if (funcID == 'eDayoff') {
          this.copyValue(event.text, data, 'eDayoff');
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
          this.copyValue(event.text, data, 'jobSalary');
          this.df.detectChanges();
        } else if (funcID == 'basicSalary') {
          this.copyValue(event.text, data, 'basicSalary');
          this.df.detectChanges();
        } else if (funcID == 'Assets') {
          this.copyValue(event.text, data, 'Assets');
          this.df.detectChanges();
        } else if (funcID == 'eDegrees') {
          this.HandleEmployeeEDegreeInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eCertificate') {
          this.HandleEmployeeECertificateInfo(event.text, 'copy', data);
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
          this.HandleEmployeeEDiseasesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eSkill') {
          this.HandleEmployeeESkillsInfo(event.text, 'copy', data);
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
          this.HandleEmployeeEDisciplinesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        } else if (funcID == 'eDiseases') {
          this.HandleEmployeeEDiseasesInfo(event.text, 'copy', data);
          this.df.detectChanges();
        }else if (funcID == 'eAccidents') {
          this.copyValue(event.text, data, 'eAccidents');
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
  }

  changeItemDetail(item) {}

  crrFuncTab: string;
  clickTab(funcList: any) {
    // this.crrTab = tabNumber;
    this.crrFuncTab = funcList.functionID;
  }

  editEmployeePartyInfo(actionHeaderText) {
    // this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
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

  editAssuranceTaxBankAccountInfo(actionHeaderText) {
    // this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    option.FormModel = this.eInfoFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEAssurTaxBankComponent,
      {
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eAssurFunc),
        functionID: this.eAssurFunc,
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
    // this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
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
    // this.view.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
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
    this.eExperienceGrid.dataService.dataSelected = this.infoPersonal;
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
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
        console.log('11111111', res.event);

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
        this.eBasicSalaryRowCount = this.updateGridView(
          this.basicSalaryGridview,
          actionType,
          res.event[0]
        );
        res.event[1]?.forEach((element) => {
          if (element.isCurrent) {
            this.crrEBSalary = element;
          }
          (this.basicSalaryGridview?.dataService as CRUDService)
            ?.update(element)
            .subscribe();
        });
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
      if (!res?.event)
        (this.passportGridview.dataService as CRUDService).clear();
      else {
        this.passportRowCount += this.updateGridView(
          this.passportGridview,
          actionType,
          res?.event
        );
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
          this.dayoffRowCount += 1;
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
    option.DataService = this.workPermitGridview.dataService;
    option.FormModel = this.workPermitGridview.formModel;
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
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eVisaFuncID),
        employeeId: this.employeeID,
        funcID: this.eVisaFuncID,
        visaObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) (this.visaGridview.dataService as CRUDService).clear();
      else this.updateGridView(this.visaGridview, actionType, res.event);
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
      // EmployeeDisciplinesDetailComponent,
      PopupEDisciplinesComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText + ' ' + this.getFormHeader(this.eDisciplineFuncID),
        employeeId: this.employeeID,
        funcID: this.eDisciplineFuncID,
        dataInput: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event)
        (this.eDisciplineGrid?.dataService as CRUDService).clear();
      if (
        res &&
        (actionType === 'add' || actionType === 'copy') &&
        res.event.isSuccess == true
      ) {
        (this.eDisciplineGrid?.dataService as CRUDService)
          .add(res.event)
          .subscribe();
        this.eDisciplineRowCount++;
      } else {
        (this.eDisciplineGrid?.dataService as CRUDService)
          .update(res.event)
          .subscribe();
      }
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
        headerText: actionHeaderText + ' ' + this.getFormHeader(this.eAccidentsFuncID),
        funcID: this.eAccidentsFuncID,
        accidentObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) (this.eAccidentGridView?.dataService as CRUDService)?.clear();
      else{
        this.eAccidentsRowCount += this.updateGridView(this.eAccidentGridView, actionType, res.event);
      }
      this.df.detectChanges();
    });
  }

  HandlemployeeAssetInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.eAssetFormModel;
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
        })
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
      if (res.event) {
        this.reRenderGrid = false;
        this.df.detectChanges();
        this.reRenderGrid = true;
        this.df.detectChanges();
        if (actionType == 'add') {
          this.appointionRowCount += 1;

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
      if (res != null) {
        if (
          (actionType === 'add' || actionType === 'copy') &&
          res.event.isSuccess === true
        ) {
          (this.eCertificateGrid.dataService as CRUDService)
            .add(res.event)
            .subscribe();
          this.eCertificateRowCount++;
        } else if (actionType === 'edit' && res.event.isSuccess === true) {
          (this.eCertificateGrid.dataService as CRUDService)
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

  HandleEmployeeEDegreeInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.eDegreeGrid?.dataService;
    option.FormModel = this.eDegreeFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDegreesComponent,
      {
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
      if (
        (actionType == 'add' || actionType == 'copy') &&
        res.event.isSuccess === true
      ) {
        (this.eDegreeGrid.dataService as CRUDService)
          .add(res.event)
          .subscribe();
        console.log('res dataaaaa', res);
        this.eDegreeRowCount++;
      } else if (actionType == 'edit') {
        (this.eDegreeGrid.dataService as CRUDService)
          .update(res.event)
          .subscribe();
      }
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
      if (res?.event) {
        (this.skillGrid?.dataService as CRUDService).clear();
        if ((actionType === 'add' || actionType === 'copy') && res.event[0].isSuccess == true) {
          (this.skillGrid?.dataService as CRUDService)
            .add(res.event[0])
            .subscribe();
          this.eSkillRowCount++;
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
    option.DataService = this.eTrainCourseGrid?.dataService;
    option.FormModel = this.eTrainCourseFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupETraincourseComponent,
      {
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
      if (
        res &&
        (actionType === 'add' || actionType === 'copy') &&
        res.event.isSuccess == true
      ) {
        (this.eTrainCourseGrid?.dataService as CRUDService)
          .add(res.event)
          .subscribe();
        this.eTrainCourseRowCount++;
      } else {
        (this.eTrainCourseGrid?.dataService as CRUDService)
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
      if (
        res &&
        (actionType === 'add' || actionType === 'copy') &&
        res.event.isSuccess == true
      ) {
        (this.AwardGrid?.dataService as CRUDService).add(res.event).subscribe();
        this.awardRowCount++;
      } else {
        (this.AwardGrid?.dataService as CRUDService)
          .update(res.event)
          .subscribe();
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
      if (!res?.event)
        (this.eDisciplineGrid?.dataService as CRUDService).clear();
      if (
        res &&
        (actionType === 'add' || actionType === 'copy') &&
        res.event.isSuccess == true
      ) {
        (this.eDiseasesGrid?.dataService as CRUDService)
          .add(res.event)
          .subscribe();
        this.eDiseasesRowCount++;
      } else {
        (this.eDiseasesGrid?.dataService as CRUDService)
          .update(res.event)
          .subscribe();
      }
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
        headerText: actionHeaderText + ' ' + this.getFormHeader('HRTEM0501'),
        employeeId: this.employeeID,
        funcID: 'HRTEM0501',
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
          this.eBusinessTravelRowCount += 1;
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
  @ViewChild('gridView') grid: CodxGridviewComponent;
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

  @ViewChild('templateECertificateGridCol1', { static: true })
  templateECertificateGridCol1: TemplateRef<any>;
  @ViewChild('templateECertificateGridCol2', { static: true })
  templateECertificateGridCol2: TemplateRef<any>;
  @ViewChild('templateECertificateGridCol3', { static: true })
  templateECertificateGridCol3: TemplateRef<any>;

  @ViewChild('templateESkillGridCol1', { static: true })
  templateESkillGridCol1: TemplateRef<any>;
  @ViewChild('templateESkillGridCol2', { static: true })
  templateESkillGridCol2: TemplateRef<any>;
  @ViewChild('templateESkillGridCol3', { static: true })
  templateESkillGridCol3: TemplateRef<any>;

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

  @ViewChild('templateAwardGridCol1', { static: true })
  templateAwardGridCol1: TemplateRef<any>;
  @ViewChild('templateAwardGridCol2', { static: true })
  templateAwardGridCol2: TemplateRef<any>;
  @ViewChild('templateAwardGridCol3', { static: true })
  templateAwardGridCol3: TemplateRef<any>;

  @ViewChild('templateDisciplineGridCol1', { static: true })
  templateDisciplineGridCol1: TemplateRef<any>;
  @ViewChild('templateDisciplineGridCol2', { static: true })
  templateDisciplineGridCol2: TemplateRef<any>;
  @ViewChild('templateDisciplineGridCol3', { static: true })
  templateDisciplineGridCol3: TemplateRef<any>;

  @ViewChild('templateDiseasesGridCol1', { static: true })
  templateDiseasesGridCol1: TemplateRef<any>;
  @ViewChild('templateDiseasesGridCol2', { static: true })
  templateDiseasesGridCol2: TemplateRef<any>;
  @ViewChild('templateDiseasesGridCol3', { static: true })
  templateDiseasesGridCol3: TemplateRef<any>;

  valueChangeFilterBenefit(evt) {
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
        });
    }
  }

  valueChangeYearFilterBenefit(evt) {
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

  valueChangeViewAllEAsset(evt) {
    this.ViewAllEAssetFlag = evt.data;
    let ins = setInterval(() => {
      if (this.eAssetGrid) {
        clearInterval(ins);
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
  }

  valueChangeViewAllESkill(evt) {
    this.ViewAllEskillFlag = evt.data;
    let ins = setInterval(() => {
      if (this.grid) {
        clearInterval(ins);
        let t = this;
        this.grid.dataService.onAction.subscribe((res) => {
          if (res.type == 'loaded') {
            t.eSkillRowCount = res['data'].length;
          }
        });
        this.eSkillRowCount = this.grid.dataService.rowCount;
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
  valueChangeViewAllEJobSalary(evt) {
    this.ViewAllEJobSalaryFlag = evt.data;
    let ins = setInterval(() => {
      if (this.jobSalaryGridview) {
        clearInterval(ins);
        let t = this;
        this.jobSalaryGridview.dataService.onAction.subscribe((res) => {
          if (res?.type == 'loaded') {
            t.eJobSalaryRowCount = res['data'].length;
          }
        });
        this.eJobSalaryRowCount = this.jobSalaryGridview.dataService.rowCount;
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
      this.eTrainCourseGrid.dataService.dataSelected = data;
      (this.eTrainCourseGrid.dataService as CRUDService)
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
        .copy(data, this.eJobSalaryFormModel, 'RecID')
        .subscribe((res) => {
          this.HandleEmployeeAccidentInfo(actionHeaderText, 'copy', res);
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
    if (!dataItem) (gridView?.dataService as CRUDService)?.clear();
    else {
      if (actionType == 'add') {
        (gridView?.dataService as CRUDService)?.add(dataItem, 0).subscribe();
        return 1;
      } else if (actionType == 'edit') {
        (gridView?.dataService as CRUDService)?.update(dataItem).subscribe();
      } else if ((actionType = 'delete')) {
        (gridView?.dataService as CRUDService)?.remove(dataItem).subscribe();
        return -1;
      }
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
      this.filterByAssetCatIDArr.length > 0 &&
      this.startDateEAssetFilterValue != null
    ) {
      this.filterEAssetPredicates = '(';
      let i = 0;
      for (i; i < this.filterByAssetCatIDArr.length; i++) {
        if (i > 0) {
          this.filterEAssetPredicates += ' or ';
        }
      }
      this.filterEAssetPredicates += ') ';
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
  valueChangeYearFilterAward(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.Start_Date_Award_Filter_Value = null;
      this.End_Date_Award_Filter_Value = null;
      (this.AwardGrid.dataService as CRUDService)
        .setPredicates([''], [''])
        .subscribe();
    } else {
      this.Start_Date_Award_Filter_Value = evt.fromDate.toJSON();
      this.End_Date_Award_Filter_Value = evt.toDate.toJSON();
      (this.AwardGrid.dataService as CRUDService)
        .setPredicates(
          [
            `AwardDate>="${this.Start_Date_Award_Filter_Value}" and AwardDate<="${this.End_Date_Award_Filter_Value}"`,
          ],
          []
        )
        .subscribe();
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
      this.filterByESkillIDArr.length > 0 &&
      this.startDateESkillFilterValue != null
    ) {
      this.filterESkillPredicates = '(';
      let i = 0;
      for (i; i < this.filterByESkillIDArr.length; i++) {
        if (i > 0) {
          this.filterESkillPredicates += ' or ';
        }
        this.filterESkillPredicates += `SkillID==@${i}`;
      }
      this.filterESkillPredicates += ') ';
      (this.skillGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterESkillPredicates],
          [this.filterByESkillIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 1', item);
        });
    } else if (
      (this.filterByESkillIDArr.length > 0 &&
        this.startDateESkillFilterValue == undefined) ||
      this.startDateESkillFilterValue == null
    ) {
      let i = 0;
      for (i; i < this.filterByESkillIDArr.length; i++) {
        if (i > 0) {
          this.filterESkillPredicates += ' or ';
        }
        this.filterESkillPredicates += `SkillID==@${i}`;
      }

      (this.skillGrid.dataService as CRUDService)
        .setPredicates(
          [this.filterESkillPredicates],
          [this.filterByESkillIDArr.join(';')]
        )
        .subscribe((item) => {
          console.log('item tra ve sau khi loc 2', item);
        });
    }
  }

  UpdateTrainCoursePredicate() {
    this.Filter_ETrainCourse_Predicates = '';
    if (
      this.Filter_By_ETrainCourse_IDArr.length > 0 &&
      this.Start_Date_ETrainCourse_Filter_Value != null
    ) {
      this.Filter_ETrainCourse_Predicates = '(';
      let i = 0;
      for (i; i < this.Filter_By_ETrainCourse_IDArr.length; i++) {
        if (i > 0) {
          this.Filter_ETrainCourse_Predicates += ' or ';
        }
        this.Filter_ETrainCourse_Predicates += `TrainForm==@${i}`;
      }
      this.Filter_ETrainCourse_Predicates += ') ';
      this.Filter_ETrainCourse_Predicates += `and (TrainFromDate>="${this.Start_Date_ETrainCourse_Filter_Value}" and TrainFromDate<="${this.End_Date_ETrainCourse_Filter_Value}")`;
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [this.Filter_ETrainCourse_Predicates],
          [this.Filter_By_ETrainCourse_IDArr.join(';')]
        )
        .subscribe();
    } else if (
      (this.Filter_By_ETrainCourse_IDArr.length > 0 &&
        this.Start_Date_ETrainCourse_Filter_Value == undefined) ||
      this.Start_Date_ETrainCourse_Filter_Value == null
    ) {
      let i = 0;
      for (i; i < this.Filter_By_ETrainCourse_IDArr.length; i++) {
        if (i > 0) {
          this.Filter_ETrainCourse_Predicates += ' or ';
        }
        this.Filter_ETrainCourse_Predicates += `TrainForm==@${i}`;
      }
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [this.Filter_ETrainCourse_Predicates],
          [this.Filter_By_ETrainCourse_IDArr.join(';')]
        )
        .subscribe();
    } else if (this.Start_Date_ETrainCourse_Filter_Value != null) {
      (this.eTrainCourseGrid.dataService as CRUDService)
        .setPredicates(
          [
            `TrainFromDate>="${this.Start_Date_ETrainCourse_Filter_Value}" and TrainFromDate<="${this.End_Date_ETrainCourse_Filter_Value}"`,
          ],
          []
        )
        .subscribe();
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

  valueChangeFilterDiseasesTypeID(evt) {
    this.Filter_By_EDiseases_IDArr = evt.data;
    let lengthArr = this.Filter_By_EDiseases_IDArr.length;
    let first = 0;
    let last = lengthArr - 1;
    if (this.Filter_By_EDiseases_IDArr > 0) {
      this.Filter_EDiseases_Predicates = '(';
      for (let i = 0; i < lengthArr; i++) {
        if (i == first || i == last)
          this.Filter_EDiseases_Predicates += `DiseaseID==@${i}`;
        else this.Filter_EDiseases_Predicates += `DiseaseID==@${i} or `;
      }
      this.Filter_EDiseases_Predicates += ') ';
      (this.eDiseasesGrid.dataService as CRUDService)
        .setPredicates(
          [this.Filter_EDiseases_Predicates],
          [this.Filter_By_EDiseases_IDArr.join(';')]
        )
        .subscribe();
    } else {
      for (let i = 0; i < lengthArr; i++) {
        if (i > 0) {
          this.Filter_EDiseases_Predicates += ' or ';
        }
        this.Filter_EDiseases_Predicates += `DiseaseID==@${i}`;
      }
      (this.eDiseasesGrid.dataService as CRUDService)
        .setPredicates([''], [''])
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

  valueChangeFilterAccidentID(evt){
    this.filterByAccidentIDArr = evt.data;
    let lengthArr = this.filterByAccidentIDArr.length;
    let first = 0;
    let last = lengthArr - 1;
    if (this.filterByAccidentIDArr?.length > 0) {
      this.filterAccidentIdPredicate = '(';
      for (let i = 0; i < lengthArr; i++) {
        if (i == first || i == last)
        this.filterAccidentIdPredicate += `AccidentID==@${i}`;
        else this.filterAccidentIdPredicate += `AccidentID==@${i} or `;
      }
      this.filterAccidentIdPredicate += ') ';
      (this.eAccidentGridView?.dataService as CRUDService)
        ?.setPredicates(
          [this.filterAccidentIdPredicate],
          [this.filterByAccidentIDArr.join(';')]
        )
        .subscribe();
    } else {
      for (let i = 0; i < lengthArr; i++) {
        if (i > 0) {
          this.filterAccidentIdPredicate += ' or ';
        }
        this.filterAccidentIdPredicate += `AccidentID==@${i}`;
      }
      (this.eAccidentGridView?.dataService as CRUDService)
        ?.setPredicates([''], [''])
        .subscribe();
    }
  }

  isMaxGrade(eSkill: any) {
    let item = this.lstESkill.filter((p) => p.skillID == eSkill.skillID);
    if (item) {
      let lstSkill = item[0].listSkill;
      if (lstSkill && eSkill.recID == lstSkill[0].recID) {
        return true;
      }
    }
    return false;
  }

  //#region AssetBackgroundColor
  getAssetBackgroundColor(asset){
    for(let i = 0; i < this.AssetColorValArr?.length; i++){
      debugger
      if(this.AssetColorValArr[i].CategoryID == asset){
        return this.AssetColorValArr[i].Background;
      }
    }
    // return 'badge-primary';
  }

  getAssetFontColor(asset){
    for(let i = 0; i < this.AssetColorValArr?.length; i++){
      if(this.AssetColorValArr[i].CategoryID == asset){
        return this.AssetColorValArr[i].FontColor;
      }
    }
    // return 'badge-primary';
  }

  //#endregion
}
// <span class="badge" [ngClass]="
// isMaxGrade(data)
//   ? 'badge-primary border-0 fw-bold'
//   : 'border-1 text-dark badge-secondary fw-bold'
// " [style.border-color]="isMaxGrade(data) ? '' : 'black'">

// </span>
