import { PopupEbenefitComponent } from './../../employee-profile/popup-ebenefit/popup-ebenefit.component';
import { PopupEdayoffsComponent } from './../../employee-profile/popup-edayoffs/popup-edayoffs.component';
import { PopupEappointionsComponent } from './../../employee-profile/popup-eappointions/popup-eappointions.component';
import { PopupEJobSalariesComponent } from './../../employee-profile/popup-ejob-salaries/popup-ejob-salaries.component';
import { PopupETraincourseComponent } from './../../employee-profile/popup-etraincourse/popup-etraincourse.component';
import { PopupESkillsComponent } from './../../employee-profile/popup-eskills/popup-eskills.component';
import { PopupEFamiliesComponent } from './../../employee-profile/popup-efamilies/popup-efamilies.component';
import { PopupEDisciplinesComponent } from './../../employee-profile/popup-edisciplines/popup-edisciplines.component';
import { PopupEDegreesComponent } from './../../employee-profile/popup-edegrees/popup-edegrees.component';
import { PopupECertificatesComponent } from './../../employee-profile/popup-ecertificates/popup-ecertificates.component';
import { PopupEAwardsComponent } from './../../employee-profile/popup-eawards/popup-eawards.component';
import { PopupEAssetsComponent } from './../../employee-profile/popup-eassets/popup-eassets.component';

import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  CodxFormDynamicComponent,
  CodxGridviewV2Component,
  CRUDService,
  DataRequest,
  DataService,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutService,
  NotificationsService,
  PageTitleService,
  SidebarModel,
  SortModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { PopupEhealthsComponent } from '../../employee-profile/popup-ehealths/popup-ehealths.component';
import { PopupEmpBusinessTravelsComponent } from '../../employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';
import { PopupSubEContractComponent } from '../../employee-profile/popup-sub-econtract/popup-sub-econtract.component';
import { PopupEProcessContractComponent } from '../../employee-contract/popup-eprocess-contract/popup-eprocess-contract.component';
//import { PopupViewAllComponent } from './pop-up/popup-view-all/popup-view-all.component';
import { FormGroup } from '@angular/forms';
import { PopupEdocumentsComponent } from '../../employee-profile/popup-edocuments/popup-edocuments.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupEBasicSalariesComponent } from '../../employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { PopupViewAllComponent } from '../employee-info-detail/pop-up/popup-view-all/popup-view-all.component';
import { MyTeamComponent } from 'projects/codx-wp/src/lib/dashboard/home/my-team/my-team.component';
import { MyTemComponent } from '../../dashboard/widgets/my-tem/my-tem.component';
import { DialogDetailRegisterApproveComponent } from '../../dashboard/components/dialog-detail-register-approve/dialog-detail-register-approve.component';
import { DialogRegisterApproveComponent } from '../../dashboard/components/dialog-register-approve/dialog-register-approve.component';
import { DialogReviewLeaveApproveComponent } from './components/dialog-review-leave-approve/dialog-review-leave-approve.component';

@Component({
  selector: 'lib-employee-info-profile',
  templateUrl: './employee-info-profile.component.html',
  styleUrls: ['./employee-info-profile.component.css'],
})
export class EmployeeInfoProfileComponent extends UIComponent {
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

  active = [null, null, null, null, null, null, null];

  infoPersonal: any;
  lineManager: any;
  indirectManager: any;

  crrEContract: any;
  lstContractType: any = []; //phân loại HĐ không xác định

  service = '';
  assemblyName = '';
  entity = '';
  idField = 'recID';
  functionID: string;
  lstFamily: any = [];
  lstOrg: any; //view bo phan
  lstBtnAdd: any = []; //nut add chung
  orgUnitStr: any;
  DepartmentStr: any;

  //Kinh nghiem
  lstExperiences: any;

  crrPassport: any;

  crrVisa: any;

  crrWorkpermit: any;

  crrJobSalaries: any;

  formModel;

  employeeID;
  //crrTab: number = 0;

  lstAsset: any;

  crrEBSalary: any;

  listCrrBenefit: any = [];

  lstEmpDocument: any = [];

  lstESkill: any;
  // IsMax = false;
  Current_Grade_ESkill: any = [];

  //#region gridViewSetup
  eDocumentGrvSetup;
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
  isHiddenCbxDocument = true;
  lstCurrentDocumentTypeID: any = [];
  strCurrentDocuments: any;

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

  jobInfoPer = {
    jobGeneralFuncID: {
      view: false,
      write: false,
      delete: false,
    },
    eTimeCardFuncID: {
      view: false,
      write: false,
      delete: false,
    },
    eCalSalaryFuncID: {
      view: false,
      write: false,
      delete: false,
    },
    eNeedToSubmitProfileFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
  };

  salaryBenefitInfoPer = {
    eBasicSalaryFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    benefitFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
  };

  workingProcessInfoPer = {
    eContractFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    appointionFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    dayoffFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eBusinessTravelFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    awardFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eDisciplineFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
  };

  knowledgeInfoPer = {
    eDegreeFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eCertificateFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eSkillFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eTrainCourseFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
  };

  healthInfoPer = {
    eHealthFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eDiseasesFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eVaccinesFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    eAccidentsFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
  };

  quitjobInfoPer = {
    eQuitJobFuncID: {
      view: false,
      write: false,
      delete: false,
    },
  };

  curriculumVitaePermission = {
    eInfoFuncID: {
      view: false,
      write: false,
      delete: false,
    },
    ePartyFuncID: {
      view: false,
      write: false,
      delete: false,
    },
    eFamiliesFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
    foreignWorkerFuncID: {
      view: false,
      write: false,
      delete: false,
      workPermitFuncID: {
        view: false,
        write: false,
        delete: false,
        isPortal: false,
      },
    },
    legalInfoFuncID: {
      view: false,
      write: false,
      delete: false,
      passportFuncID: {
        view: false,
        write: false,
        delete: false,
        isPortal: false,
      },
      visaFuncID: {
        view: false,
        write: false,
        delete: false,
        isPortal: false,
      },
    },
    eExperienceFuncID: {
      view: false,
      write: false,
      delete: false,
      isPortal: false,
    },
  };

  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };

  curriculumVitaeFuncID: string = '';
  legalInfoFuncID: string = '';
  foreignWorkerFuncID: string = '';
  jobInfoFuncID: string = '';
  salaryBenefitInfoFuncID: string = '';
  workingProcessInfoFuncID: string = '';
  knowledgeInfoFuncID: string = '';
  healthInfoFuncID: string = '';
  quitJobInfoFuncID: string = '';

  curriculumVitaeFunc = null;
  legalInfoFunc = null;
  foreignWorkerFunc = null;
  jobInfoFunc = null;
  salaryBenefitInfoFunc = null;
  workingProcessInfoFunc = null;
  knowledgeInfoFunc = null;
  healthInfoFunc = null;
  quitJobInfoFunc = null;
  eInfoFuncID = null;
  ePartyFuncID = null;
  eFamiliesFuncID = null;
  eAssurFuncID = null;
  ePassportFuncID = null;
  eDegreeFuncID = null;
  eVisaFuncID = null;
  eWorkPermitFuncID = null;
  eCertificateFuncID = null;
  eSkillFuncID = null;
  eExperienceFuncID = null; // Kinh nghiệm trước đây
  eAssetFuncID = null; // Tài sản cấp phát
  eTimeCardFuncID = null;
  eCalSalaryFuncID = null;
  jobGeneralFuncID = null;
  eBasicSalaryFuncID = null;
  eJobSalFuncID = null; //Lương chức danh
  eTrainCourseFuncID = null;
  eBusinessTravelFuncID = null;
  eHealthFuncID = null; // Khám sức khỏe
  eVaccinesFuncID = null; // Tiêm vắc xin
  benefitFuncID = null;
  dayoffFuncID = null;
  appointionFuncID = null;
  awardFuncID = null;
  eContractFuncID = null;
  eDisciplineFuncID = null;
  eDiseasesFuncID = null;
  eQuitJobFuncID = null;
  eAccidentsFuncID = null;
  eNeedToSubmitProfileFuncID = null;

  eInfoFunc = null;
  ePartyFunc = null;
  eFamiliesFunc = null;
  eAssurFunc = null;
  ePassportFunc = null;
  eDegreeFunc = null;
  eVisaFunc = null;
  eWorkPermitFunc = null;
  eCertificateFunc = null;
  eSkillFunc = null;
  eExperienceFunc = null; // Kinh nghiệm trước đây
  eAssetFunc = null; // Tài sản cấp phát
  eTimeCardFunc = null;
  eCalSalaryFunc = null;
  jobGeneralFunc = null;
  eBasicSalaryFunc = null;
  eJobSalFunc = null; //Lương chức danh
  eTrainCourseFunc = null;
  eBusinessTravelFunc = null;
  eHealthFunc = null; // Khám sức khỏe
  eVaccinesFunc = null; // Tiêm vắc xin
  benefitFunc = null;
  dayoffFunc = null;
  appointionFunc = null;
  awardFunc = null;
  eContractFunc = null;
  eDisciplineFunc = null;
  eDiseasesFunc = null;
  eQuitJobFunc = null;
  eAccidentsFunc = null;
  eNeedToSubmitProfileFunc = null;
  //#endregion

  //#region urls
  curriculumVitaeURL: string = 'hreprofile01cv'; //SYLL curriculumVitaeFuncID
  legalInfoURL: string = 'hreprofile01cv-law'; //Pháp lý legalInfoFuncID
  foreignWorkerURL: string = 'hreprofile01cv-foreigner'; //foreignWorkerFuncID
  jobInfoURL: string = 'hreprofile02job'; //thông tin nhân viên, jobInfoFuncID
  salaryBenefitInfoURL: string = 'hreprofile03salary'; //Lương phúc lợi salaryBenefitInfoFuncID
  workingProcessInfoURL: string = 'hreprofile04process'; //Quá trình NS workingProcessInfoFuncID
  knowledgeInfoURL: string = 'hreprofile05knowledge'; //Kiến thức knowledgeInfoFuncID
  healthInfoURL: string = 'hreprofile06health'; //sức khỏe healthInfoFuncID
  quitJobInfoURL: string = 'hreprofile07quit'; //thôi việc quitJobInfoFuncID

  eInfoURL = 'hreprofile01cv-personal'; //Thông tin bản thân eInfoFuncID
  ePartyURL = 'hreprofile01cv-party'; // Đảng đoàn ePartyFuncID
  eFamiliesURL = 'hreprofile01cv-efamily'; // Quan hệ gia đình eFamiliesFuncID
  eAssurURL = 'hreprofile01cv-insurance'; // Bảo hiểm - MS thuế - Tài khoản eAssurFuncID
  ePassportURL = 'hreprofile01cv-passport'; //Hộ chiếu ePassportFuncID
  eDegreeURL = 'hreprofile05knowledge-edegree'; // Bằng cấp eDegreeFuncID
  eVisaURL = 'hreprofile01cv-visa'; //Thị thực eVisaFuncID
  eWorkPermitURL = 'hreprofile01cv-workpermit'; // Giấy phép lao động eWorkPermitFuncID
  eCertificateURL = 'hreprofile05knowledge-ecertificate'; // Chứng chỉ eCertificateFuncID
  eSkillURL = 'hreprofile05knowledge-eskill'; // Kỹ năng eSkillFuncID
  eExperienceURL = 'hreprofile01cv-eexperience'; // Kinh nghiệm trước đây eExperienceFuncID
  // eAssetURL = 'HRTEM0406'; // Tài sản cấp phát eAssetFuncID
  eTimeCardURL = 'hreprofile02job-time'; // Chấm công eTimeCardFuncID
  eCalSalaryURL = 'hreprofile02job-payroll'; // Tính lương eCalSalaryFuncID
  jobGeneralURL = 'hreprofile02job-info'; // Thông tin chung jobGeneralFuncID
  eBasicSalaryURL = 'hreprofile03salary-esalary'; // Mức lương eBasicSalaryFuncID
  // eJobSalURL = 'HRTEM0402'; //Lương chức danh eJobSalFuncID
  eTrainCourseURL = 'hreprofile05knowledge-etraincourse'; //Đào tạo eTrainCourseFuncID
  eBusinessTravelURL = 'hreprofile04process-ebusinesstravel'; // Công tác eBusinessTravelFuncID
  eHealthURL = 'hreprofile06health-ehealth'; // Khám sức khỏe eHealthFuncID
  eVaccinesURL = 'hreprofile06health-evaccine'; // Tiêm vắc xin eVaccinesFuncID
  benefitURL = 'hreprofile03salary-ebenefit'; // Phụ cấp benefitFuncID
  dayoffURL = 'hreprofile04process-edayoff'; // Nghỉ phép dayoffFuncID
  appointionURL = 'hreprofile04process-eappointion'; // Bổ nhiệm - Điều chuyển appointionFuncID
  awardURL = 'hreprofile04process-eaward'; // Khen thưởng awardFuncID
  eContractURL = 'hreprofile04process-econtract'; // Hợp đồng lao động eContractFuncID
  eDisciplineURL = 'hreprofile04process-ediscipline'; // Kỷ luật eDisciplineFuncID
  eDiseasesURL = 'hreprofile06health-edisease'; // Bệnh nghề nghiệp eDiseasesFuncID
  eQuitJobURL = 'hreprofile07quit-info'; // Thông tin thôi việc eQuitJobFuncID
  eAccidentsURL = 'hreprofile06health-eaccident'; // Tai nạn lao động eAccidentsFuncID
  eNeedToSubmitProfileURL = 'hreprofile02job-edocument'; // Hồ sơ cần nộp eNeedToSubmitProfileFuncID

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
  edocumentFormModel: FormModel;
  EBusinessTravelFormodel: FormModel;
  eInfoFormModel: FormModel; // Thông tin bản thân/ Bảo hiểm
  eInfoFormGroup: FormGroup;
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
  eFamilyHeaderText;
  //#endregion

  //biến cờ hiệu thể hiện nguồn tới trang này là từ WS không phải DSNV
  fromWS = false;

  pageNum: number = 0;
  maxPageNum: number = 0;
  crrIndex: number = 0;
  totalCount: number = 0;
  fromView: string = '';

  currentDate = new Date();
  passPortIsExpired = false;
  visaIsExpired = false;
  workpermitIsExpired = false;

  currentYear = new Date().getFullYear();
  firstDay = new Date(this.currentYear, 0, 1);
  lastDay = new Date(this.currentYear, 11, 31);
  dayOffInitPredicate = `(EmployeeID=@0 and (BeginDate>="${this.firstDay.toISOString()}" and EndDate<="${this.lastDay.toISOString()}"))`;

  //#region headerTextString
  addHeaderText;
  editHeaderText;
  //#endregion

  loadedLineManager = false;
  loadedIndirectManager = false;

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

  // hãy code vào đây nếu bạn là người fix bug - chứ ở trên tui không biết họ đang code cái gì
  payrollFM: FormModel = null; // THÔNG TIN TÍNH LƯƠNG

  constructor(
    private inject: Injector,
    private routeActive: ActivatedRoute,
    private hrService: CodxHrService,
    private share: CodxShareService,
    private auth: AuthStore,
    private df: ChangeDetectorRef,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    public override api: ApiHttpService,
    private notifySvr: NotificationsService
  ) {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.user = this.auth.get();
  }

  //#region Create dataservice
  edocumentCRUD: CRUDService = null;
  eFamilyCRUD: CRUDService = null;
  eExperiencesCRUD: CRUDService = null;
  //#endregion

  onInit(): void {
    //ẩn logo
    this.layout.setLogo(null);
    //ẩn số đếm tổng nhân viên
    this.pageTitle.setBreadcrumbs([]);
    if (this.funcID) {
      this.hrService.getFunctionList(this.funcID).subscribe((res) => {
        this.lstTab = res;
        console.log(this.lstTab);
        for (let i = 0; i < res.length; i++) {
          switch (res[i].url) {
            case this.curriculumVitaeURL:
              this.curriculumVitaeFuncID = res[i].functionID;
              this.curriculumVitaeFunc = res[i];
              break;
            case this.jobInfoURL:
              this.jobInfoFuncID = res[i].functionID;
              this.jobInfoFunc = res[i];
              break;
            case this.salaryBenefitInfoURL:
              this.salaryBenefitInfoFuncID = res[i].functionID;
              this.salaryBenefitInfoFunc = res[i];
              break;
            case this.workingProcessInfoURL:
              this.workingProcessInfoFuncID = res[i].functionID;
              this.workingProcessInfoFunc = res[i];
              break;
            case this.knowledgeInfoURL:
              this.knowledgeInfoFuncID = res[i].functionID;
              this.knowledgeInfoFunc = res[i];
              break;
            case this.healthInfoURL:
              this.healthInfoFuncID = res[i].functionID;
              this.healthInfoFunc = res[i];
              break;
            case this.quitJobInfoURL:
              this.quitJobInfoFuncID = res[i].functionID;
              this.quitJobInfoFunc = res[i];
              break;
          }
        }
        this.clickTab(this.lstTab[0]);
      });
    }
    this.routeActive.queryParams.subscribe((params) => {
      if (this.crrFuncTab) {
        this.clickTab({ functionID: this.crrFuncTab });
      }
      this.employeeID = params['employeeID'];
      if (!this.employeeID) {
        this.fromWS = true;
        this.share.getEmployeeInfor(this.user.userID).subscribe((res) => {
          this.employeeID = res.employeeID;
        });
      }
      this.pageNum = params['page'];
      if (this.employeeID) {
        // Load full thong tin employee
        this.loadEmpFullInfo(this.employeeID).subscribe((res) => {
          if (res) {
            this.infoPersonal = res[0];
            this.getManagerEmployeeInfoById();
            this.infoPersonal.PositionName = res[1];
            // this.lstOrg = res[2]
            this.orgUnitStr = res[2];
            this.DepartmentStr = res[3];
            this.LoadedEInfo = true;
            this.df.detectChanges();
          }
        });
        // Load full thong tin current cua employee
        this.getEmpCurrentData().subscribe((res) => {
          if (res) {
            this.crrPassport = res[0];
            if (this.crrPassport) {
              this.passPortIsExpired =
                this.currentDate.toISOString() >
                new Date(this.crrPassport?.expiredDate).toISOString();
            }
            this.crrVisa = res[1];
            if (this.crrVisa) {
              this.visaIsExpired =
                this.currentDate.toISOString() >
                new Date(this.crrVisa.expiredDate).toISOString();
            }
            this.crrWorkpermit = res[2];
            if (this.crrWorkpermit) {
              this.workpermitIsExpired =
                this.currentDate.toISOString() >
                new Date(this.crrWorkpermit?.toDate).toISOString();
            }
            this.lstFamily = res[3];
            this.calculateEFamilyAge();
            this.lstExperiences = res[4];
            this.crrEBSalary = res[5];
            this.loadedESalary = true;
            this.listCrrBenefit = res[6];
            this.loadEBenefit = true;
            this.crrEContract = res[7];
          }
        });
      }
      if (this.employeeID) {
        if (history.state) {
          this.totalCount = history.state.totalCount;
          this.maxPageNum = history.state.totalPage;
          this.fromView = history.state.from;
          this.listEmp = history.state.data;
          if (history.state.request) {
            this.request = Object.assign(history.state.request);
            this.request.selector = 'EmployeeID;';
          }
          if (Array.isArray(this.listEmp)) {
            this.crrIndex = this.listEmp.findIndex(
              (x: any) => this.employeeID == x['EmployeeID']
            );
          }
        }
      }
    });
    // this.initFormModel();
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
  }

  handleShowHideMfWs(evt, func) {
    if (func.isPortal == false) {
      //Được add/edit, ko delete
      for (let i = 0; i < evt.length; i++) {
        if (evt[i].functionID == 'SYS02') {
          evt[i].disabled = true;
        }
      }
    }

    if (func.isPortal == true || this.infoPersonal.status == '90') {
      //Hide edit/copy/delete more func
      for (let i = 0; i < evt.length; i++) {
        if (
          evt[i].functionID == 'SYS02' ||
          evt[i].functionID == 'SYS03' ||
          evt[i].functionID == 'SYS01' ||
          evt[i].functionID == 'SYS04'
        ) {
          evt[i].disabled = true;
        }
      }
    }
  }

  eInfoHeaderText: any = null;
  initFormModel() {
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
  }

  handleShowHideMF(evt, func?) {
    for (let i = 0; i < evt.length; i++) {
      if (evt[i].functionID == 'SYS04') {
        evt[i].disabled = true;
        break;
      }
    }
    if (
      (func == this.eNeedToSubmitProfileFunc && this.fromWS == true) ||
      this.infoPersonal.status == '90'
    ) {
      this.handleShowHideMfWs(evt, func);
    }
  }

  viewGridDetail(data, funcID) {
    switch (funcID) {
      case this.appointionFuncID:
        // Phải gán cứng vì hệ thống không có morefunc xem chi tiết nên không lấy action text như add và edit được
        this.HandleEmployeeAppointionInfo('Xem chi tiết', 'view', data);
        break;
      case this.dayoffFuncID:
        this.HandleEmployeeDayOffInfo('Xem chi tiết', 'view', data);
        break;
      case this.eBusinessTravelFuncID:
        this.HandleEBusinessTravel('Xem chi tiết', 'view', data);
        break;
      case this.awardFuncID:
        this.HandleEmployeeEAwardsInfo('Xem chi tiết', 'view', data);
        break;
      case this.eDisciplineFuncID:
        this.HandleEmployeeEDisciplinesInfo('Xem chi tiết', 'view', data);
        break;
      case this.eDegreeFuncID:
        this.HandleEmployeeEDegreeInfo('Xem chi tiết', 'view', data);
        break;
      case this.eCertificateFuncID:
        this.HandleEmployeeECertificateInfo('Xem chi tiết', 'view', data);
        break;
      case this.eSkillFuncID:
        this.HandleEmployeeESkillsInfo('Xem chi tiết', 'view', data);
        break;
      case this.eTrainCourseFuncID:
        this.HandleEmployeeTrainCourseInfo('Xem chi tiết', 'view', data);
        break;
      case this.eAccidentsFuncID:
        this.HandleEmployeeAccidentInfo('Xem chi tiết', 'view', data);
        break;
      case this.eDiseasesFuncID:
        this.HandleEmployeeEDiseasesInfo('Xem chi tiết', 'view', data);
        break;
      case this.eHealthFuncID:
        this.HandleEmployeeEHealths('Xem chi tiết', 'view', data);
        break;
      case this.eVaccinesFuncID:
        this.HandleEVaccinesInfo('Xem chi tiết', 'view', data);
        break;
    }
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
      if (res) {
        if (res[0]) {
          this.addHeaderText = res[0].customName;
        }
        if (res[2]) {
          this.editHeaderText = res[2].customName;
        }
      }
    });
  }

  clickViewDetail(data, funcID) {
    switch (funcID) {
      case this.ePassportFuncID:
        // Phải gán cứng vì hệ thống không có morefunc xem chi tiết nên không lấy action text như add và edit được
        this.handleEmployeePassportInfo('Xem chi tiết', 'view', data);
        break;
      case this.eVisaFuncID:
        this.handleEmployeeVisaInfo('Xem chi tiết', 'view', data);
        break;
      case this.eWorkPermitFuncID:
        this.handleEmployeeWorkingPermitInfo('Xem chi tiết', 'view', data);
        break;
      case this.eContractFuncID:
        this.HandleEContractInfo('Xem chi tiết', 'view', data);
        break;
      case this.eBasicSalaryFuncID:
        this.handleEBasicSalaries('Xem chi tiết', 'view', data);
        break;
      case this.benefitFuncID:
        this.handlEmployeeBenefit('Xem chi tiết', 'view', data);
        break;
      case this.eFamiliesFuncID:
        this.handleEFamilyInfo('Xem chi tiết', 'view', data);
        break;
      case this.eExperienceFuncID:
        this.handlEmployeeExperiences('Xem chi tiết', 'view', data);
        break;
      case this.eNeedToSubmitProfileFuncID:
        this.HandleEDocumentInfo('Xem chi tiết', 'view', data);
        break;
    }
  }

  navChange(evt: any, index: number = -1, btnClick) {
    let containerList = document.querySelectorAll('.pw-content');
    let lastDivList = document.querySelectorAll('.div_final');
    let lastDiv = lastDivList[index];
    let container = containerList[index];
    let containerHeight = (container as any).offsetHeight;
    let contentHeight = 0;
    for (let i = 0; i < container.children.length; i++) {
      contentHeight += (container.children[i] as any).offsetHeight;
    }

    if (!evt) return;
    let element = document.getElementById(evt);
    let distanceToBottom = contentHeight - element.offsetTop;

    if (distanceToBottom < containerHeight) {
      (lastDiv as any).style.width = '200px';
      (lastDiv as any).style.height = `${
        containerHeight - distanceToBottom + 50
      }px`;
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
      this.active[index] = data;
      this.detectorRef.detectChanges();
    }
  }

  getEmpCurrentData() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'GetEmpCurrentInfoAsync',
      this.employeeID
    );
  }

  loadEmpFullInfo(empID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'GetEmpFullInfoAsync',
      empID
    );
  }

  initEmpSalary() {
    if (this.employeeID) {
    }
  }

  initEmpKnowledge() {
    if (!this.eDegreeColumnsGrid) {
      this.hrService.getHeaderText(this.eDegreeFuncID).then((res) => {
        this.eDegreeHeaderText = res;
        this.eDegreeColumnsGrid = [
          {
            headerTemplate: this.headTempDegree1,
            template: this.templateEDegreeGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempDegree2,
            template: this.templateEDegreeGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempDegree3,
            template: this.templateEDegreeGridCol3,
            width: '150',
          },
        ];
      });

      this.df.detectChanges();
    }

    if (!this.eCertificateColumnGrid) {
      this.hrService.getHeaderText(this.eCertificateFuncID).then((res) => {
        this.eCertificateHeaderText = res;
        this.eCertificateColumnGrid = [
          {
            headerTemplate: this.headTempCertificate1,
            template: this.templateECertificateGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempCertificate2,
            template: this.templateECertificateGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempCertificate3,
            template: this.templateECertificateGridCol3,
            width: '150',
          },
        ];
      });
    }

    if (!this.eSkillColumnGrid) {
      this.hrService.getHeaderText(this.eSkillFuncID).then((res) => {
        this.eSkillHeaderText = res;
        this.eSkillColumnGrid = [
          {
            headerTemplate: this.headTempSkill1,
            template: this.templateESkillGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempSkill2,
            template: this.templateESkillGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempSkill3,
            template: this.templateESkillGridCol3,
            width: '150',
          },
        ];
      });
      this.df.detectChanges();
    }

    if (!this.eTrainCourseColumnGrid) {
      if (!this.eTrainCourseColumnGrid) {
        this.hrService.getHeaderText(this.eTrainCourseFuncID).then((res) => {
          this.eTrainCourseHeaderText = res;
          this.eTrainCourseColumnGrid = [
            {
              headerTemplate: this.headTempTrainCourse1,
              template: this.templateTrainCourseGridCol1,
              width: '150',
            },
            {
              headerTemplate: this.headTempTrainCourse2,
              template: this.templateTrainCourseGridCol2,
              width: '150',
            },
            {
              headerTemplate: this.headTempTrainCourse3,
              template: this.templateTrainCourseGridCol3,
              width: '150',
            },
          ];
        });
      }
    }
  }

  initEmpHealth() {
    if (!this.eAccidentsColumnsGrid) {
      this.hrService.getHeaderText(this.eAccidentsFuncID).then((res) => {
        this.eAccidentHeaderText = res;
        this.eAccidentsColumnsGrid = [
          {
            headerTemplate: this.headTempAccident1,
            template: this.templateEAccidentCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempAccident2,
            template: this.templateEAccidentCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempAccident3,
            template: this.templateEAccidentCol3,
            width: '150',
          },
        ];
      });
      //#endregion
    }

    if (!this.eDiseasesColumnsGrid) {
      this.hrService.getHeaderText(this.eDiseasesFuncID).then((res) => {
        this.eDiseasesHeaderText = res;
        this.eDiseasesColumnsGrid = [
          {
            headerTemplate: this.headTempDiseases1,
            template: this.templateDiseasesGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempDiseases2,
            template: this.templateDiseasesGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempDiseases3,
            template: this.templateDiseasesGridCol3,
            width: '150',
          },
        ];
      });
    }

    if (!this.eHealthColumnGrid) {
      this.hrService.getHeaderText(this.eHealthFuncID).then((res) => {
        this.eHealthHeaderText = res;
        this.eHealthColumnGrid = [
          {
            headerTemplate: this.headTempHealth1,
            template: this.tempCol1EHealthGrid,
            width: '150',
          },

          {
            headerTemplate: this.headTempHealth2,
            template: this.tempCol2EHealthGrid,
            width: '150',
          },

          {
            headerTemplate: this.headTempHealth3,
            template: this.tempCol3EHealthGrid,
            width: '150',
          },
        ];
      });
    }

    if (!this.eVaccineColumnGrid) {
      this.hrService.getHeaderText(this.eVaccinesFuncID).then((res) => {
        this.eVaccineHeaderText = res;
        this.eVaccineColumnGrid = [
          {
            headerTemplate: this.headTempVaccine1,
            template: this.tempEVaccineGridCol1,
            width: '150',
          },

          {
            headerTemplate: this.headTempVaccine2,
            template: this.tempEVaccineGridCol2,
            width: '150',
          },

          {
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

  deleteFile(data, formModel) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectIDAsync',
      [data.recID, formModel.entityName, true]
    );
  }

  initEmpProcess() {
    if (!this.appointionColumnGrid) {
      this.hrService.getHeaderText(this.appointionFuncID).then((res) => {
        this.appointionHeaderTexts = res;
        this.appointionColumnGrid = [
          {
            headerTemplate: this.headTempAppointion1,
            template: this.templateAppointionGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempAppointion2,
            template: this.templateAppointionGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempAppointion3,
            template: this.templateAppointionGridCol3,
            width: '150',
          },
        ];
      });
    }

    if (!this.dayoffColumnGrid) {
      this.hrService.getHeaderText(this.dayoffFuncID).then((res) => {
        this.dayoffHeaderTexts = res;
        this.dayoffColumnGrid = [
          {
            headerTemplate: this.headTempDayOff1,
            template: this.templateDayOffGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempDayOff2,
            template: this.templateDayOffGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempDayOff3,
            template: this.templateDayOffGridCol3,
            width: '150',
          },
        ];
      });
    }

    if (!this.businessTravelColumnGrid) {
      this.hrService.getHeaderText(this.eBusinessTravelFuncID).then((res) => {
        this.eBusinessTravelHeaderTexts = res;
        this.businessTravelColumnGrid = [
          {
            headerTemplate: this.headTempBusinessTravel1,
            template: this.templateBusinessTravelGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempBusinessTravel2,
            template: this.templateBusinessTravelGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempBusinessTravel3,
            template: this.templateBusinessTravelGridCol3,
            width: '150',
          },
        ];
      });
    }

    if (!this.awardColumnsGrid) {
      this.hrService.getHeaderText(this.awardFuncID).then((res) => {
        this.awardHeaderText = res;
        this.awardColumnsGrid = [
          {
            headerTemplate: this.headTempAwards1,
            template: this.templateAwardGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempAwards2,

            template: this.templateAwardGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempAwards3,
            template: this.templateAwardGridCol3,
            width: '150',
          },
        ];
      });
    }

    if (!this.eDisciplineColumnsGrid) {
      this.hrService.getHeaderText(this.eDisciplineFuncID).then((res) => {
        this.eDisciplineHeaderText = res;
        this.eDisciplineColumnsGrid = [
          {
            headerTemplate: this.headTempDisciplines1,

            template: this.templateDisciplineGridCol1,
            width: '150',
          },
          {
            headerTemplate: this.headTempDisciplines2,

            template: this.templateDisciplineGridCol2,
            width: '150',
          },
          {
            headerTemplate: this.headTempDisciplines3,
            template: this.templateDisciplineGridCol3,
            width: '150',
          },
        ];
      });
    }
  }

  UpdateDataOnGrid(gridView: CodxGridviewV2Component, lst, prdc, dtvl) {
    (gridView.predicates = prdc),
      (gridView.dataValues = dtvl),
      (gridView.dataSource = lst);
  }

  checkIsNewestDate(effectedDate, expiredDate) {
    if (effectedDate) {
      let eff = new Date(effectedDate).toLocaleDateString();
      let date = new Date().toLocaleDateString();
      if (expiredDate) {
        let expire = new Date(expiredDate).toLocaleDateString();
        if (
          new Date(date) >= new Date(eff) &&
          new Date(date) <= new Date(expire)
        ) {
          return true;
        }
        return false;
      } else {
        if (new Date(date) >= new Date(eff)) {
          return true;
        }
        return false;
      }
    }
    return true;
  }

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
        this.handleEBasicSalaries(this.addHeaderText, 'add', null);
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
      case this.eNeedToSubmitProfileFuncID:
        this.HandleEmployeeDocument();
        break;
    }
  }

  clickMF(event: any, data: any, funcID = null) {
    debugger;
    let subStr = event.functionID.substr(event.functionID.length - 3);
    if (subStr == 'A13') {
      let subFunc = event.functionID.substr(0, event.functionID.length - 3);
      switch (subFunc) {
        case this.benefitFuncID:
          this.copyValue(event.text, data, 'benefit', true); //
          break;
        case this.eBasicSalaryFuncID:
          this.copyValue(event.text, data, 'basicSalary', true); //
          break;
        case this.eContractFuncID:
          this.copyValue(event.text, data, 'eContract', true); //
          break;
        case this.appointionFuncID:
          this.copyValue(event.text, data, 'eAppointions', true);
          break;
        case this.eBusinessTravelFuncID:
          this.copyValue(event.text, data, 'eBusinessTravels', true);
          break;
        case this.awardFuncID:
          this.HandleEmployeeEAwardsInfo(event.text, 'copy', data, true);
          break;
        case this.eDisciplineFuncID:
          this.copyValue(event.text, data, 'eDisciplines', true); //
          break;
      }
    } else {
      switch (event.functionID) {
        // case this.ePassportFuncID + 'ViewAll':
        case 'HRTEM0202ViewAll':
          this.popupViewAllPassport();
          break;
        // case this.eVisaFuncID + 'ViewAll':
        case 'HRTEM0203ViewAll':
          this.popupViewAllVisa();
          break;
        // case this.eWorkPermitFuncID + 'ViewAll':
        case 'HRTEM0204ViewAll':
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
            this.handleEBasicSalaries(event.text, 'edit', data);
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
          } else if (funcID == 'eDocument') {
            this.HandleEDocumentInfo(event.text, 'edit', data);
            this.df.detectChanges();
          }
          break;

        case 'SYS02':
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
                          this.passPortIsExpired =
                            this.currentDate.toISOString() >
                            new Date(
                              this.crrPassport?.expiredDate
                            ).toISOString();
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
                          this.workpermitIsExpired =
                            this.currentDate.toISOString() >
                            new Date(this.crrWorkpermit?.toDate).toISOString();

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
                          this.visaIsExpired =
                            this.currentDate.toISOString() >
                            new Date(this.crrVisa.expiredDate).toISOString();

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
                      this.updateGridView(
                        this.dayoffGrid,
                        'delete',
                        null,
                        data
                      );
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
                    } else {
                      this.notify.notifyCode('SYS022');
                    }
                  });
              } else if (funcID == 'eHealth') {
                this.hrService.deleteEHealth(data).subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(
                      this.eHealthsGrid,
                      'delete',
                      null,
                      data
                    );
                    this.df.detectChanges();
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
              } else if (funcID == 'eBenefit') {
                this.hrService.DeleteEBenefit(data).subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    let index = this.listCrrBenefit.indexOf(data);
                    if (index > -1) {
                      this.listCrrBenefit.splice(index, 1);
                      this.df.detectChanges();
                    }
                  } else {
                    this.notify.notifyCode('SYS022');
                  }
                });
              } else if (funcID == 'eDocument') {
                this.DeleteEDocument(data.recID).subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    this.deleteFile(data, this.edocumentFormModel).subscribe(
                      (res) => {}
                    );
                    let index = this.lstEmpDocument.indexOf(data);
                    if (index > -1) {
                      this.lstEmpDocument.splice(index, 1);
                      this.df.detectChanges();
                    } else {
                      this.notify.notifyCode('SYS022');
                    }
                  }
                });
              } else if (funcID == 'eVaccine') {
                this.hrService.deleteEVaccine(data).subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(
                      this.eVaccinesGrid,
                      'delete',
                      null,
                      data
                    );
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
                      this.deleteFile(data, this.eDegreeFormModel).subscribe(
                        (res) => {}
                      );
                      this.updateGridView(
                        this.eDegreeGrid,
                        'delete',
                        null,
                        data
                      );
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
                      this.deleteFile(
                        data,
                        this.eCertificateFormModel
                      ).subscribe((res) => {});
                      this.updateGridView(
                        this.eCertificateGrid,
                        'delete',
                        null,
                        data
                      );
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
                      this.updateGridView(
                        this.appointionGridView,
                        'delete',
                        null,
                        data
                      );
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
                      this.updateGridView(
                        this.eDiseasesGrid,
                        'delete',
                        null,
                        data
                      );
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
                      this.updateGridView(
                        this.eTrainCourseGrid,
                        'delete',
                        null,
                        data
                      );
                      this.df.detectChanges();
                    } else {
                      this.notify.notifyCode('SYS022');
                    }
                  });
              } else if (funcID == 'eBusinessTravels') {
                this.hrService.deleteEBusinessTravels(data).subscribe((p) => {
                  if (p != null) {
                    this.notify.notifyCode('SYS008');
                    this.updateGridView(
                      this.businessTravelGrid,
                      'delete',
                      null,
                      data
                    );
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
                      this.updateGridView(
                        this.eDisciplineGrid,
                        'delete',
                        null,
                        data
                      );
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
                    this.updateGridView(
                      this.eAccidentGridView,
                      'delete',
                      null,
                      data
                    );

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
            this.copyValue(event.text, data, 'eDegrees');
            this.df.detectChanges();
          } else if (funcID == 'eCertificate') {
            this.copyValue(event.text, data, 'eCertificate');
            this.df.detectChanges();
          } else if (funcID == 'eAppointions') {
            this.copyValue(event.text, data, 'eAppointions');
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
  }

  popupViewAllContract() {
    debugger;
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.eContractFuncID,
      {
        quitjobStatus: this.infoPersonal.status,
        func: this.eContractFunc,
        funcUrl: this.eContractURL,
        fromWS: this.fromWS,
        funcID: this.eContractFuncID,
        employeeId: this.employeeID,
        headerText: this.transText(this.eContractFuncID, this.lstFuncHRProcess),
        sortModel: this.eContractSortModel,
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
        quitjobStatus: this.infoPersonal.status,
        func: this.eWorkPermitFunc,
        funcUrl: this.eWorkPermitURL,
        fromWS: this.fromWS,
        funcID: this.eWorkPermitFuncID,
        employeeId: this.employeeID,
        headerText: this.transText(
          this.eWorkPermitFuncID,
          this.lstFuncForeignWorkerInfo
        ),
        sortModel: this.workPermitSortModel,
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
          this.workpermitIsExpired =
            this.currentDate.toISOString() >
            new Date(this.crrWorkpermit?.toDate).toISOString();
        } else {
          this.crrWorkpermit = res.event;
          this.workpermitIsExpired =
            this.currentDate.toISOString() >
            new Date(this.crrWorkpermit?.toDate).toISOString();
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
        quitjobStatus: this.infoPersonal.status,
        func: this.eVisaFunc,
        funcUrl: this.eVisaURL,
        fromWS: this.fromWS,
        funcID: this.eVisaFuncID,
        employeeId: this.employeeID,
        headerText: this.transText(this.eVisaFuncID, this.lstFuncLegalInfo),
        sortModel: this.visaSortModel,
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
          this.visaIsExpired =
            this.currentDate.toISOString() >
            new Date(this.crrVisa.expiredDate).toISOString();
        } else {
          this.crrVisa = res.event;
          this.visaIsExpired =
            this.currentDate.toISOString() >
            new Date(this.crrVisa.expiredDate).toISOString();
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
        quitjobStatus: this.infoPersonal.status,
        func: this.ePassportFunc,
        funcUrl: this.ePassportURL,
        fromWS: this.fromWS,
        funcID: this.ePassportFuncID,
        employeeId: this.employeeID,
        headerText: this.transText(this.ePassportFuncID, this.lstFuncLegalInfo),
        sortModel: this.passportSortModel,
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
          this.passPortIsExpired =
            this.currentDate.toISOString() >
            new Date(this.crrPassport?.expiredDate).toISOString();
        } else {
          this.crrPassport = res.event;
          this.passPortIsExpired =
            this.currentDate.toISOString() >
            new Date(this.crrPassport?.expiredDate).toISOString();
        }
        this.df.detectChanges();
      }
    });
  }

  clickTab(funcList: any) {
    this.crrFuncTab = funcList.functionID;
    this.hrService.getFunctionList(this.crrFuncTab).subscribe((res) => {
      switch (this.crrFuncTab) {
        case this.curriculumVitaeFuncID:
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.eInfoURL) {
              this.eInfoFuncID = res[i].functionID;
              this.eInfoFunc = res[i];
              if (!this.eInfoHeaderText || !this.eInfoFormModel) {
                this.hrService
                  .getHeaderText(this.eInfoFuncID)
                  .then((headerText) => {
                    this.eInfoHeaderText = headerText;
                  });
                this.hrService.getFormModel(this.eInfoFuncID).then((res) => {
                  this.eInfoFormModel = res;
                  this.hrService
                    .getFormGroup(
                      this.eInfoFormModel.formName,
                      this.eInfoFormModel.gridViewName,
                      this.eInfoFormModel
                    )
                    .then((fg) => {
                      this.eInfoFormGroup = fg;
                      this.eInfoFormGroup.patchValue(this.infoPersonal);
                      this.eInfoFormModel.currentData = this.infoPersonal;
                    });
                });
              }
            } else if (res[i].url == this.legalInfoURL) {
              this.legalInfoFuncID = res[i].functionID;
              this.legalInfoFunc = res[i];
            } else if (res[i].url == this.foreignWorkerURL) {
              this.foreignWorkerFuncID = res[i].functionID;
              this.foreignWorkerFunc = res[i];
            } else if (res[i].url == this.ePartyURL) {
              this.ePartyFuncID = res[i].functionID;
              this.ePartyFunc = res[i];
            } else if (res[i].url == this.eFamiliesURL) {
              this.eFamiliesFuncID = res[i].functionID;
              this.eFamiliesFunc = res[i];

              if (!this.eFamilyFormModel) {
                this.hrService
                  .getFormModel(this.eFamiliesFuncID)
                  .then((res) => {
                    this.eFamilyFormModel = res;
                  });
              }

              if (!this.eFamilyHeaderText) {
                this.hrService
                  .getHeaderText(this.eFamiliesFuncID)
                  .then((res) => {
                    this.eFamilyHeaderText = res;
                  });
              }
            } else if (res[i].url == this.eExperienceURL) {
              this.eExperienceFuncID = res[i].functionID;
              this.eExperienceFunc = res[i];

              if (!this.eExperienceFormModel) {
                this.hrService
                  .getFormModel(this.eExperienceFuncID)
                  .then((res) => {
                    this.eExperienceFormModel = res;
                  });
              }
            }
          }
          if (!this.active[0]) {
            this.active[0] = this.eInfoFuncID;
          }
          this.lstFuncCurriculumVitae = res;
          console.log(this.lstFuncCurriculumVitae);
          this.lstBtnAdd = [];
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.eInfoFuncID:
                this.curriculumVitaePermission.eInfoFuncID.view = true;
                this.curriculumVitaePermission.eInfoFuncID.write = res[i].write;
                this.curriculumVitaePermission.eInfoFuncID.delete =
                  res[i].delete;
                break;

              case this.legalInfoFuncID:
                this.curriculumVitaePermission.legalInfoFuncID.view = true;
                this.curriculumVitaePermission.legalInfoFuncID.write =
                  res[i].write;
                this.curriculumVitaePermission.legalInfoFuncID.delete =
                  res[i].delete;
                this.hrService
                  .getFunctionList(this.legalInfoFuncID)
                  .subscribe((res) => {
                    this.lstFuncLegalInfo = res;
                    for (let i = 0; i < res.length; i++) {
                      if (res[i].url == this.eAssurURL) {
                        this.eAssurFuncID = res[i].functionID;
                        this.eAssurFunc = res[i];
                      } else if (res[i].url == this.ePassportURL) {
                        this.ePassportFuncID = res[i].functionID;
                        this.ePassportFunc = res[i];

                        if (!this.ePassportFormModel) {
                          this.hrService
                            .getFormModel(this.ePassportFuncID)
                            .then((res) => {
                              this.ePassportFormModel = res;
                            });
                        }
                      } else if (res[i].url == this.eVisaURL) {
                        this.eVisaFuncID = res[i].functionID;
                        this.eVisaFunc = res[i];

                        if (!this.eVisaFormModel) {
                          this.hrService
                            .getFormModel(this.eVisaFuncID)
                            .then((res) => {
                              this.eVisaFormModel = res;
                            });
                        }
                      }
                    }

                    for (let i = 0; i < res.length; i++) {
                      if (res[i].functionID == this.ePassportFuncID) {
                        this.curriculumVitaePermission.legalInfoFuncID.passportFuncID.view =
                          true;
                        this.curriculumVitaePermission.legalInfoFuncID.passportFuncID.write =
                          res[i].write;
                        this.curriculumVitaePermission.legalInfoFuncID.passportFuncID.delete =
                          res[i].delete;
                        this.curriculumVitaePermission.legalInfoFuncID.passportFuncID.isPortal =
                          res[i].isPortal;
                        if (
                          res[i].write == true &&
                          (this.fromWS == false || res[i].isPortal == false)
                        ) {
                          this.lstBtnAdd.push(res[i]);
                        }
                      } else if (res[i].functionID == this.eVisaFuncID) {
                        this.curriculumVitaePermission.legalInfoFuncID.visaFuncID.view =
                          true;
                        this.curriculumVitaePermission.legalInfoFuncID.visaFuncID.write =
                          res[i].write;
                        this.curriculumVitaePermission.legalInfoFuncID.visaFuncID.delete =
                          res[i].delete;
                        this.curriculumVitaePermission.legalInfoFuncID.visaFuncID.isPortal =
                          res[i].isPortal;
                        if (
                          res[i].write == true &&
                          (this.fromWS == false || res[i].isPortal == false)
                        ) {
                          this.lstBtnAdd.push(res[i]);
                        }
                      }
                    }
                  });
                break;

              case this.foreignWorkerFuncID:
                this.curriculumVitaePermission.foreignWorkerFuncID.view = true;
                this.curriculumVitaePermission.foreignWorkerFuncID.write =
                  res[i].write;
                this.curriculumVitaePermission.foreignWorkerFuncID.delete =
                  res[i].delete;
                this.hrService
                  .getFunctionList(this.foreignWorkerFuncID)
                  .subscribe((res) => {
                    this.lstFuncForeignWorkerInfo = res;
                    for (let i = 0; i < res.length; i++) {
                      if (res[i].url == this.eWorkPermitURL) {
                        this.eWorkPermitFuncID = res[i].functionID;
                        this.eWorkPermitFunc = res[i];

                        if (!this.eWorkPermitFormModel) {
                          this.hrService
                            .getFormModel(this.eWorkPermitFuncID)
                            .then((res) => {
                              this.eWorkPermitFormModel = res;
                            });
                        }
                      }
                    }
                    for (let i = 0; i < res.length; i++) {
                      if (res[i].functionID == this.eWorkPermitFuncID) {
                        this.curriculumVitaePermission.foreignWorkerFuncID.workPermitFuncID.view =
                          true;
                        this.curriculumVitaePermission.foreignWorkerFuncID.workPermitFuncID.write =
                          res[i].write;
                        this.curriculumVitaePermission.foreignWorkerFuncID.workPermitFuncID.delete =
                          res[i].delete;
                        this.curriculumVitaePermission.foreignWorkerFuncID.workPermitFuncID.isPortal =
                          res[i].isPortal;
                        if (
                          res[i].write == true &&
                          (this.fromWS == false || res[i].isPortal == false)
                        ) {
                          this.lstBtnAdd.push(res[i]);
                        }
                      }
                    }
                  });
                break;

              case this.ePartyFuncID:
                this.curriculumVitaePermission.ePartyFuncID.view = true;
                this.curriculumVitaePermission.ePartyFuncID.write =
                  res[i].write;
                this.curriculumVitaePermission.ePartyFuncID.delete =
                  res[i].delete;
                break;

              case this.eFamiliesFuncID:
                this.curriculumVitaePermission.eFamiliesFuncID.view = true;
                this.curriculumVitaePermission.eFamiliesFuncID.write =
                  res[i].write;
                this.curriculumVitaePermission.eFamiliesFuncID.delete =
                  res[i].delete;
                this.curriculumVitaePermission.eFamiliesFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;

              case this.eExperienceFuncID:
                this.curriculumVitaePermission.eExperienceFuncID.view = true;
                this.curriculumVitaePermission.eExperienceFuncID.write =
                  res[i].write;
                this.curriculumVitaePermission.eExperienceFuncID.delete =
                  res[i].delete;
                this.curriculumVitaePermission.eExperienceFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
            }
          }
          break;
        case this.jobInfoFuncID:
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.jobGeneralURL) {
              this.jobGeneralFuncID = res[i].functionID;
              this.jobGeneralFunc = res[i];
            } else if (res[i].url == this.eTimeCardURL) {
              this.eTimeCardFuncID = res[i].functionID;
              this.eTimeCardFunc = res[i];
            } else if (res[i].url == this.eCalSalaryURL) {
              this.eCalSalaryFuncID = res[i].functionID;
              this.eCalSalaryFunc = res[i];
            } else if (res[i].url == this.eNeedToSubmitProfileURL) {
              this.eNeedToSubmitProfileFuncID = res[i].functionID;
              this.eNeedToSubmitProfileFunc = res[i];
              if (!this.edocumentFormModel) {
                this.hrService
                  .getFormModel(this.eNeedToSubmitProfileFuncID)
                  .then((res) => {
                    this.edocumentFormModel = res;
                    this.cache
                      .gridViewSetup(
                        this.edocumentFormModel.formName,
                        this.edocumentFormModel.gridViewName
                      )
                      .subscribe((res) => {
                        this.eDocumentGrvSetup = res;
                      });
                  });
              }
            }
          }
          if (!this.active[1]) {
            this.active[1] = this.jobGeneralFuncID;
          }
          this.lineManager = null;
          this.indirectManager = null;
          this.loadedLineManager = false;
          this.loadedIndirectManager = false;
          this.getManagerEmployeeInfoById();
          this.lstBtnAdd = [];
          this.lstFuncJobInfo = res;
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.jobGeneralFuncID:
                this.jobInfoPer.jobGeneralFuncID.view = true;
                this.jobInfoPer.jobGeneralFuncID.write = res[i].write;
                this.jobInfoPer.jobGeneralFuncID.delete = res[i].delete;
                break;
              case this.eTimeCardFuncID:
                this.jobInfoPer.eTimeCardFuncID.view = true;
                this.jobInfoPer.eTimeCardFuncID.write = res[i].write;
                this.jobInfoPer.eTimeCardFuncID.delete = res[i].delete;
                break;
              case this.eCalSalaryFuncID:
                this.jobInfoPer.eCalSalaryFuncID.view = true;
                this.jobInfoPer.eCalSalaryFuncID.write = res[i].write;
                this.jobInfoPer.eCalSalaryFuncID.delete = res[i].delete;
                break;
              case this.eNeedToSubmitProfileFuncID:
                this.jobInfoPer.eNeedToSubmitProfileFuncID.view = true;
                this.jobInfoPer.eNeedToSubmitProfileFuncID.write = res[i].write;
                this.jobInfoPer.eNeedToSubmitProfileFuncID.delete =
                  res[i].delete;
                this.jobInfoPer.eNeedToSubmitProfileFuncID.isPortal =
                  res[i].isPortal;
                this.GetEmpDocument(this.infoPersonal.employeeID).subscribe(
                  (res) => {
                    this.lstEmpDocument = res;
                    for (let i = 0; i < this.lstEmpDocument.length; i++) {
                      this.getFileDataAsync(
                        this.lstEmpDocument[i].recID
                      ).subscribe((res) => {
                        this.lstEmpDocument[i].lstFile = res;
                      });
                    }
                  }
                );
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
            }
          }
          break;
        case this.salaryBenefitInfoFuncID:
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.eBasicSalaryURL) {
              this.eBasicSalaryFuncID = res[i].functionID;
              this.eBasicSalaryFunc = res[i];
              if (!this.eBasicSalaryFormmodel) {
                this.hrService
                  .getFormModel(this.eBasicSalaryFuncID)
                  .then((res) => {
                    this.eBasicSalaryFormmodel = res;
                  });
              }
            } else if (res[i].url == this.benefitURL) {
              this.benefitFuncID = res[i].functionID;
              this.benefitFunc = res[i];
              if (!this.benefitFormodel) {
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

                      this.hrService
                        .loadDataCbx('HR', dataRequest)
                        .subscribe((data) => {
                          this.BeneFitColorValArr = JSON.parse(data[0]);
                        });
                    });
                });
              }
            }
          }
          if (!this.active[2]) {
            this.active[2] = this.eBasicSalaryFuncID;
          }
          this.lstBtnAdd = [];
          this.lstFuncSalaryBenefit = res;
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.eBasicSalaryFuncID:
                this.salaryBenefitInfoPer.eBasicSalaryFuncID.view = true;
                this.salaryBenefitInfoPer.eBasicSalaryFuncID.write =
                  res[i].write;
                this.salaryBenefitInfoPer.eBasicSalaryFuncID.delete =
                  res[i].delete;
                this.salaryBenefitInfoPer.eBasicSalaryFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.benefitFuncID:
                this.salaryBenefitInfoPer.benefitFuncID.view = true;
                this.salaryBenefitInfoPer.benefitFuncID.write = res[i].write;
                this.salaryBenefitInfoPer.benefitFuncID.delete = res[i].delete;
                this.salaryBenefitInfoPer.benefitFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
            }
          }
          this.initEmpSalary();
          break;
        case this.workingProcessInfoFuncID:
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.eContractURL) {
              this.eContractFuncID = res[i].functionID;
              this.eContractFunc = res[i];

              if (!this.eContractFormModel) {
                this.hrService
                  .getFormModel(this.eContractFuncID)
                  .then((res) => {
                    this.eContractFormModel = res;
                  });
              }
            } else if (res[i].url == this.appointionURL) {
              this.appointionFuncID = res[i].functionID;
              this.appointionFunc = res[i];

              if (!this.appointionFormModel) {
                this.hrService
                  .getFormModel(this.appointionFuncID)
                  .then((res) => {
                    this.appointionFormModel = res;
                  });
              }
            } else if (res[i].url == this.dayoffURL) {
              this.dayoffFuncID = res[i].functionID;
              this.dayoffFunc = res[i];

              if (!this.dayoffFormModel) {
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
              }
            } else if (res[i].url == this.eBusinessTravelURL) {
              this.eBusinessTravelFuncID = res[i].functionID;
              this.eBusinessTravelFunc = res[i];

              if (!this.EBusinessTravelFormodel) {
                this.hrService
                  .getFormModel(this.eBusinessTravelFuncID)
                  .then((res) => {
                    this.EBusinessTravelFormodel = res;
                  });
              }
            } else if (res[i].url == this.awardURL) {
              this.awardFuncID = res[i].functionID;
              this.awardFunc = res[i];
              if (!this.awardFormModel) {
                this.hrService.getFormModel(this.awardFuncID).then((res) => {
                  this.awardFormModel = res;
                });
              }
            } else if (res[i].url == this.eDisciplineURL) {
              this.eDisciplineFuncID = res[i].functionID;
              this.eDisciplineFunc = res[i];
              if (!this.eDisciplineFormModel) {
                this.hrService
                  .getFormModel(this.eDisciplineFuncID)
                  .then((res) => {
                    this.eDisciplineFormModel = res;
                  });
              }
            }
          }
          if (!this.active[3]) {
            this.active[3] = this.eContractFuncID;
          }
          this.lstBtnAdd = [];
          this.lstFuncHRProcess = res;
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.eContractFuncID:
                this.workingProcessInfoPer.eContractFuncID.view = true;
                this.workingProcessInfoPer.eContractFuncID.write = res[i].write;
                this.workingProcessInfoPer.eContractFuncID.delete =
                  res[i].delete;
                this.workingProcessInfoPer.eContractFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.appointionFuncID:
                this.workingProcessInfoPer.appointionFuncID.view = true;
                this.workingProcessInfoPer.appointionFuncID.write =
                  res[i].write;
                this.workingProcessInfoPer.appointionFuncID.delete =
                  res[i].delete;
                this.workingProcessInfoPer.appointionFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.dayoffFuncID:
                this.workingProcessInfoPer.dayoffFuncID.view = true;
                this.workingProcessInfoPer.dayoffFuncID.write = res[i].write;
                this.workingProcessInfoPer.dayoffFuncID.delete = res[i].delete;
                this.workingProcessInfoPer.dayoffFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eBusinessTravelFuncID:
                this.workingProcessInfoPer.eBusinessTravelFuncID.view = true;
                this.workingProcessInfoPer.eBusinessTravelFuncID.write =
                  res[i].write;
                this.workingProcessInfoPer.eBusinessTravelFuncID.delete =
                  res[i].delete;
                this.workingProcessInfoPer.eBusinessTravelFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.awardFuncID:
                this.workingProcessInfoPer.awardFuncID.view = true;
                this.workingProcessInfoPer.awardFuncID.write = res[i].write;
                this.workingProcessInfoPer.awardFuncID.delete = res[i].delete;
                this.workingProcessInfoPer.awardFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eDisciplineFuncID:
                this.workingProcessInfoPer.eDisciplineFuncID.view = true;
                this.workingProcessInfoPer.eDisciplineFuncID.write =
                  res[i].write;
                this.workingProcessInfoPer.eDisciplineFuncID.delete =
                  res[i].delete;
                this.workingProcessInfoPer.eDisciplineFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
            }
          }
          // this.lstBtnAdd = this.hrService.sortAscByProperty(this.lstBtnAdd, 'sorting');
          this.initEmpProcess();
          break;
        case this.knowledgeInfoFuncID:
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.eDegreeURL) {
              this.eDegreeFuncID = res[i].functionID;
              this.eDegreeFunc = res[i];
              if (!this.eDegreeFormModel) {
                this.hrService.getFormModel(this.eDegreeFuncID).then((res) => {
                  this.eDegreeFormModel = res;
                });
              }
            } else if (res[i].url == this.eCertificateURL) {
              this.eCertificateFuncID = res[i].functionID;
              this.eCertificateFunc = res[i];
              if (!this.eCertificateFormModel) {
                this.hrService
                  .getFormModel(this.eCertificateFuncID)
                  .then((res) => {
                    this.eCertificateFormModel = res;
                  });
              }
            } else if (res[i].url == this.eSkillURL) {
              this.eSkillFuncID = res[i].functionID;
              this.eSkillFunc = res[i];
              if (!this.eSkillFormmodel) {
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
              }
            } else if (res[i].url == this.eTrainCourseURL) {
              this.eTrainCourseFuncID = res[i].functionID;
              this.eTrainCourseFunc = res[i];
              if (!this.eTrainCourseFormModel) {
                this.hrService
                  .getFormModel(this.eTrainCourseFuncID)
                  .then((res) => {
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
              }
            }
          }
          if (!this.active[4]) {
            this.active[4] = this.eDegreeFuncID;
          }
          this.lstBtnAdd = [];
          this.lstFuncKnowledge = res;
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.eDegreeFuncID:
                this.knowledgeInfoPer.eDegreeFuncID.view = true;
                this.knowledgeInfoPer.eDegreeFuncID.write = res[i].write;
                this.knowledgeInfoPer.eDegreeFuncID.delete = res[i].delete;
                this.knowledgeInfoPer.eDegreeFuncID.isPortal = res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eCertificateFuncID:
                this.knowledgeInfoPer.eCertificateFuncID.view = true;
                this.knowledgeInfoPer.eCertificateFuncID.write = res[i].write;
                this.knowledgeInfoPer.eCertificateFuncID.delete = res[i].delete;
                this.knowledgeInfoPer.eCertificateFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eSkillFuncID:
                this.knowledgeInfoPer.eSkillFuncID.view = true;
                this.knowledgeInfoPer.eSkillFuncID.write = res[i].write;
                this.knowledgeInfoPer.eSkillFuncID.delete = res[i].delete;
                this.knowledgeInfoPer.eSkillFuncID.isPortal = res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eTrainCourseFuncID:
                this.knowledgeInfoPer.eTrainCourseFuncID.view = true;
                this.knowledgeInfoPer.eTrainCourseFuncID.write = res[i].write;
                this.knowledgeInfoPer.eTrainCourseFuncID.delete = res[i].delete;
                this.knowledgeInfoPer.eTrainCourseFuncID.isPortal =
                  res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
            }
          }
          this.initEmpKnowledge();
          break;
        case this.healthInfoFuncID:
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.eAccidentsURL) {
              this.eAccidentsFuncID = res[i].functionID;
              this.eAccidentsFunc = res[i];
              if (!this.eAccidentsFormModel) {
                this.hrService
                  .getFormModel(this.eAccidentsFuncID)
                  .then((res) => {
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
            } else if (res[i].url == this.eDiseasesURL) {
              this.eDiseasesFuncID = res[i].functionID;
              this.eDiseasesFunc = res[i];
              if (!this.eDiseasesFormModel) {
                this.hrService
                  .getFormModel(this.eDiseasesFuncID)
                  .then((res) => {
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
              }
            } else if (res[i].url == this.eHealthURL) {
              this.eHealthFuncID = res[i].functionID;
              this.eHealthFunc = res[i];
              if (!this.eHealthFormModel) {
                this.hrService.getFormModel(this.eHealthFuncID).then((res) => {
                  this.eHealthFormModel = res;
                });
              }
            } else if (res[i].url == this.eVaccinesURL) {
              this.eVaccinesFuncID = res[i].functionID;
              this.eVaccinesFunc = res[i];
              if (!this.eVaccineFormModel) {
                this.hrService
                  .getFormModel(this.eVaccinesFuncID)
                  .then((res) => {
                    this.eVaccineFormModel = res;
                    this.cache
                      .gridViewSetup(
                        this.eVaccineFormModel.formName,
                        this.eVaccineFormModel.gridViewName
                      )
                      .subscribe((res) => {
                        this.eVaccineGrvSetup = res;
                        let dataRequest = new DataRequest();
                        dataRequest.comboboxName =
                          res.VaccineTypeID.referedValue;
                        dataRequest.pageLoading = false;

                        this.hrService
                          .loadDataCbx('HR', dataRequest)
                          .subscribe((data) => {
                            this.VaccineColorValArr = JSON.parse(data[0]);
                          });
                      });
                  });
              }
            }
          }
          if (!this.active[5]) {
            this.active[5] = this.eAccidentsFuncID;
          }
          this.lstBtnAdd = [];
          this.lstFuncHealth = res;
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.eHealthFuncID:
                this.healthInfoPer.eHealthFuncID.view = true;
                this.healthInfoPer.eHealthFuncID.write = res[i].write;
                this.healthInfoPer.eHealthFuncID.delete = res[i].delete;
                this.healthInfoPer.eHealthFuncID.isPortal = res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eDiseasesFuncID:
                this.healthInfoPer.eDiseasesFuncID.view = true;
                this.healthInfoPer.eDiseasesFuncID.write = res[i].write;
                this.healthInfoPer.eDiseasesFuncID.delete = res[i].delete;
                this.healthInfoPer.eDiseasesFuncID.isPortal = res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eVaccinesFuncID:
                this.healthInfoPer.eVaccinesFuncID.view = true;
                this.healthInfoPer.eVaccinesFuncID.write = res[i].write;
                this.healthInfoPer.eVaccinesFuncID.delete = res[i].delete;
                this.healthInfoPer.eVaccinesFuncID.isPortal = res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
              case this.eAccidentsFuncID:
                this.healthInfoPer.eAccidentsFuncID.view = true;
                this.healthInfoPer.eAccidentsFuncID.write = res[i].write;
                this.healthInfoPer.eAccidentsFuncID.delete = res[i].delete;
                this.healthInfoPer.eAccidentsFuncID.isPortal = res[i].isPortal;
                if (
                  res[i].write == true &&
                  (this.fromWS == false || res[i].isPortal == false)
                ) {
                  this.lstBtnAdd.push(res[i]);
                }
                break;
            }
          }
          this.initEmpHealth();
          break;
        case this.quitJobInfoFuncID:
          this.lstFuncQuitJob = res;
          for (let i = 0; i < res.length; i++) {
            if (res[i].url == this.eQuitJobURL) {
              this.eQuitJobFuncID = res[i].functionID;
              this.eQuitJobFunc = res[i];
              if (!this.eQuitJobFormModel) {
                this.hrService
                  .getFormModel(this.quitJobInfoFuncID)
                  .then((res) => {
                    this.eQuitJobFormModel = res;
                  });
              }
            }
          }
          if (!this.active[6]) {
            this.active[6] = this.eQuitJobFuncID;
          }
          for (let i = 0; i < res.length; i++) {
            switch (res[i].functionID) {
              case this.eQuitJobFuncID:
                this.quitjobInfoPer.eQuitJobFuncID.view = true;
                this.quitjobInfoPer.eQuitJobFuncID.write = res[i].write;
                this.quitjobInfoPer.eQuitJobFuncID.delete = res[i].delete;
                break;
            }
          }
          this.lstBtnAdd = null;
          break;
      }
    });
  }

  //form động evaccine
  editEmployeeQuitJobInfo(actionHeaderText) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.quitJobInfoFunc?.formName,
      this.quitJobInfoFunc?.gridViewName,
      this.quitJobInfoFunc?.entityName
    );
    request.funcID = this.quitJobInfoFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;
    dataService.updateDatas.set(tempData.recID, tempData);
    this.openFormEQuitjob(
      actionHeaderText,
      'edit',
      dataService,
      tempData,
      this.infoPersonal
    );
  }

  openFormEQuitjob(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.eQuitJobFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
        isView: actionType == 'view' ? true : false,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      dataService.clear();
      if (res?.event) {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event.update.data));
        this.df.detectChanges();
      }
    });
  }

  // Chỉ có mode edit, form động
  editEmployeePartyInfo(actionHeaderText) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.ePartyFunc?.formName,
      this.ePartyFunc?.gridViewName,
      this.ePartyFunc?.entityName
    );
    request.funcID = this.ePartyFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    dataService.updateDatas.set(tempData.recID, tempData);
    this.hrService.getFormModel(this.ePartyFunc.functionID).then((res) => {
      let formM = res;
      this.openFormeParty(
        actionHeaderText,
        'edit',
        dataService,
        tempData,
        this.infoPersonal,
        formM
      );
    });
    // this.openFormeParty(actionHeaderText, 'edit', dataService, tempData, this.infoPersonal);
  }

  openFormeParty(
    actionHeaderText,
    actionType,
    dataService,
    tempData,
    data,
    formModel
  ) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
        isView: actionType == 'view' ? true : false,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      dataService.clear();
      if (res?.event) {
        let temp3 = res.event.update.data;
        this.infoPersonal = temp3;
      }
      this.df.detectChanges();
    });
  }

  // Chỉ có mode edit, form động
  editEmployeeForeignWorkerInfo(actionHeaderText) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    console.log('foreignworker func', this.foreignWorkerFunc);

    let request = new DataRequest(
      this.foreignWorkerFunc?.formName,
      this.foreignWorkerFunc?.gridViewName,
      this.foreignWorkerFunc?.entityName
    );
    request.funcID = this.foreignWorkerFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    dataService.updateDatas.set(tempData.recID, tempData);
    this.hrService
      .getFormModel(this.foreignWorkerFunc.functionID)
      .then((res) => {
        let formM = res;
        this.openFormForeignWorker(
          actionHeaderText,
          'edit',
          dataService,
          tempData,
          this.infoPersonal,
          formM
        );
      });
  }

  openFormForeignWorker(
    actionHeaderText,
    actionType,
    dataService,
    tempData,
    data,
    formModel
  ) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        isView: actionType == 'view' ? true : false,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      dataService.clear();
      if (res?.event) {
        let temp3 = res.event.update.data;
        this.infoPersonal = temp3;
      }
      this.df.detectChanges();
    });
  }

  // Chỉ có mode edit, form động
  editAssuranceTaxBankAccountInfo(actionHeaderText) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    console.log('einfoFunc', this.eAssurFunc);

    let request = new DataRequest(
      this.eAssurFunc?.formName,
      this.eAssurFunc?.gridViewName,
      this.eAssurFunc?.entityName
    );
    request.funcID = this.eAssurFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    dataService.updateDatas.set(tempData.recID, tempData);
    this.hrService.getFormModel(this.eAssurFunc.functionID).then((res) => {
      console.log('in');
      let formM = res;
      this.openFormEditAssure(
        actionHeaderText,
        'edit',
        dataService,
        tempData,
        this.infoPersonal,
        formM
      );
    });
  }

  openFormEditAssure(
    actionHeaderText,
    actionType,
    dataService,
    tempData,
    data,
    formModel
  ) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        isView: actionType == 'view' ? true : false,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      dataService.clear();
      if (res?.event) {
        let temp3 = res.event.update.data;
        this.infoPersonal = temp3;
      }
      this.df.detectChanges();
    });
  }

  // Chỉ có mode edit, form động
  editEmployeeSelfInfo(actionHeaderText) {
    let tempData = this.infoPersonal;
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eInfoFunc?.formName,
      this.eInfoFunc?.gridViewName,
      this.eInfoFunc?.entityName
    );
    request.funcID = this.eInfoFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;
    dataService.edit(this.infoPersonal).subscribe((res) => {
      let option = new SidebarModel();
      option.FormModel = this.eInfoFormModel;
      option.Width = '850px';
      let dialogAdd = this.callfunc.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: res,
          function: null,
          dataService: dataService,
          isView: false,
          titleMore: actionHeaderText,
        },
        option
      );

      dialogAdd.closed.subscribe((res) => {
        dataService.clear();
        if (res?.event) {
          let temp3 = res.event.update.data;
          this.infoPersonal = temp3;
        }
        this.df.detectChanges();
      });
    });
  }

  openFormSelfInfo(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.eInfoFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        isView: actionType == 'view' ? true : false,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      dataService.clear();
      if (res?.event) {
        let temp3 = res.event.update.data;
        this.infoPersonal = temp3;
      }
      this.df.detectChanges();
    });
  }

  // form động
  HandleEmployeeJobGeneralInfo(actionHeaderText, actionType) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.jobGeneralFunc?.formName,
      this.jobGeneralFunc?.gridViewName,
      this.jobGeneralFunc?.entityName
    );
    request.funcID = this.jobGeneralFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;
    dataService.updateDatas.set(tempData.recID, tempData);
    this.hrService.getFormModel(this.jobGeneralFunc.functionID).then((res) => {
      let formM = res;
      this.openFormJobInfo(
        actionHeaderText,
        'edit',
        dataService,
        tempData,
        this.infoPersonal,
        formM
      );
    });
  }

  //fake
  HandleEmployeeJobGeneralInfo2() {
    console.log(0);

    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.jobGeneralFunc?.formName,
      this.jobGeneralFunc?.gridViewName,
      this.jobGeneralFunc?.entityName
    );
    request.funcID = this.jobGeneralFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;
    dataService.updateDatas.set(tempData.recID, tempData);
    this.hrService.getFormModel(this.jobGeneralFunc.functionID).then((res) => {
      let formM = res;
      console.log('in rui');
      this.openFormJobInfo(
        'IS ME',
        'edit',
        dataService,
        tempData,
        this.infoPersonal,
        formM
      );
    });

    console.log(123);
  }

  openFormJobInfo(
    actionHeaderText,
    actionType,
    dataService,
    tempData,
    data,
    formModel
  ) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    let oldManagerID = this.infoPersonal.lineManager;
    let indirectManagerID = this.infoPersonal.indirectManager;
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
        isView: actionType == 'view' ? true : false,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) dataService.clear();
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
        this.infoPersonal = JSON.parse(JSON.stringify(res.event.update.data));
        this.eInfoFormGroup.patchValue(this.infoPersonal);
        this.eInfoFormModel.currentData = this.infoPersonal;
        if (
          oldManagerID != res.event.update.data.lineManager ||
          indirectManagerID != res.event.update.data.indirectManager
        ) {
          this.getManagerEmployeeInfoById();
        }
        this.df.detectChanges();
      }
    });
  }

  // Chỉ có mode edit, form động
  editEmployeeTimeCardInfo(actionHeaderText) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eTimeCardFunc?.formName,
      this.eTimeCardFunc?.gridViewName,
      this.eTimeCardFunc?.entityName
    );
    request.funcID = this.eTimeCardFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    this.hrService.getFormModel(this.eTimeCardFunc.functionID).then((res) => {
      dataService.dataSelected = tempData;
      let option = new SidebarModel();
      option.FormModel = res;
      option.Width = '550px';
      dataService.edit(tempData).subscribe((res) => {
        let dialogAdd = this.callfunc.openSide(
          CodxFormDynamicComponent,
          {
            formModel: option.FormModel,
            data: tempData,
            function: null,
            dataService: dataService,
            titleMore: actionHeaderText,
            isView: false,
          },
          option
        );

        dialogAdd.closed.subscribe((res) => {
          if (!res.event?.update?.data) dataService.clear();
          else {
            this.infoPersonal = JSON.parse(
              JSON.stringify(res.event.update.data)
            );
            this.df.detectChanges();
          }
        });
      });
    });
  }

  openFormTimeCard(
    actionHeaderText,
    actionType,
    dataService,
    tempData,
    formModel
  ) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = formModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
        isView: actionType == 'view' ? true : false,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (!res.event.update.data) dataService.clear();
      else {
        this.infoPersonal = JSON.parse(JSON.stringify(res.event.update.data));
        this.df.detectChanges();
      }
    });
  }

  // Chỉ có mode edit, form động
  editEmployeeCaculateSalaryInfo(actionHeaderText) {
    let tempData = JSON.parse(JSON.stringify(this.infoPersonal));
    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eCalSalaryFunc?.formName,
      this.eCalSalaryFunc?.gridViewName,
      this.eCalSalaryFunc?.entityName
    );
    request.funcID = this.eCalSalaryFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    this.hrService.getFormModel(this.eCalSalaryFunc.functionID).then((res) => {
      let option = new SidebarModel();
      option.FormModel = res;
      option.Width = '550px';
      dataService.edit(tempData).subscribe((o) => {
        let dialogAdd = this.callfunc.openSide(
          CodxFormDynamicComponent,
          {
            formModel: option.FormModel,
            data: tempData,
            function: null,
            dataService: dataService,
            titleMore: actionHeaderText,
            isView: false,
          },
          option
        );

        dialogAdd.closed.subscribe((res) => {
          if (!res.event.update.data) dataService.clear();
          else {
            this.infoPersonal = JSON.parse(
              JSON.stringify(res.event.update.data)
            );
            this.df.detectChanges();
          }
        });
      });
    });
  }

  handlEmployeeBenefit(
    actionHeaderText,
    actionType: string,
    data: any,
    isMulti = false
  ) {
    let option = new SidebarModel();
    option.FormModel = this.benefitFormodel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEbenefitComponent,
      {
        employeeId: this.employeeID,
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.benefitFuncID, this.lstFuncSalaryBenefit),
        funcID: this.benefitFuncID,
        benefitObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (
          actionType == 'add' ||
          actionType == 'copy' ||
          actionType == 'copyMulti'
        ) {
          if (res.event) {
            if (
              this.checkIsNewestDate(
                res.event.effectedDate,
                res.event.expiredDate
              ) == true
            ) {
              this.listCrrBenefit.push(res.event);
            }
          }
        } else if (actionType == 'edit') {
          if (res.event) {
            let kq = this.checkIsNewestDate(
              res.event.effectedDate,
              res.event.expiredDate
            );
            if (kq == true) {
              let index = this.listCrrBenefit.indexOf(data);
              if (index > -1) {
                this.listCrrBenefit[index] = res.event;
              }
              // this.listCrrBenefit.push(res.event);
            } else if (kq == false) {
              let index = this.listCrrBenefit.indexOf(data);
              if (index) {
                this.listCrrBenefit.splice(index, 1);
              }
            }
            this.df.detectChanges();
          }
        }
      }
    });
  }

  // Hàm handle không sử dụng form động, bây giờ chỉ có chức năng xem chi tiết
  handlEmployeeExperiences(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.eExperienceFormModel;
    option.DataService = this.eExperiences();
    option.Width = '550px';
    if (actionType == 'add') {
      option.DataService.addNew().subscribe((res) => {
        if (res)
          this.openFormExperiences(option, actionHeaderText, actionType, res);
      });
    } else if (actionType == 'copy') {
      option.DataService.copy().subscribe((res) => {
        if (res)
          this.openFormExperiences(option, actionHeaderText, actionType, res);
      });
    } else if (actionType == 'edit') {
      option.DataService.edit(data).subscribe((res) => {
        if (res)
          this.openFormExperiences(option, actionHeaderText, actionType, res);
      });
    }
  }

  // open popup Kinh nghiệm
  openFormExperiences(option, actionHeaderText, actionType, data) {
    data.employeeID = this.employeeID;
    this.callfunc
      .openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: data,
          function: null,
          dataService: option.DataService,
          isView: actionType == false,
          headerText:
            actionHeaderText +
            ' ' +
            this.transText(this.eExperienceFuncID, this.lstFuncCurriculumVitae),
        },
        option
      )
      .closed.subscribe((res) => {
        if (res && res?.event) {
          if (actionType === 'add' || actionType === 'copy') {
            let data = res.event.save.data;
            if (!this.lstExperiences) this.lstExperiences = [];
            this.lstExperiences.push(data);
          } else if (actionType == 'edit') {
            let data = res.event.update.data;
            let idx = this.lstExperiences.indexOf(data);
            if (idx < -1) {
              this.lstExperiences[idx] = data;
            }
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
          actionHeaderText +
          ' ' +
          this.transText(this.eJobSalFuncID, this.lstFuncSalaryBenefit),
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

  handleEBasicSalaries(
    actionHeaderText,
    actionType: string,
    data: any,
    isMulti = false
  ) {
    let option = new SidebarModel();
    option.FormModel = this.eBasicSalaryFormmodel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEBasicSalariesComponent,
      {
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.eBasicSalaryFuncID, this.lstFuncSalaryBenefit),
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
        if (res.event) {
          if (
            this.checkIsNewestDate(
              res.event.effectedDate,
              res.event.expiredDate
            ) == true
          ) {
            this.crrEBSalary = res.event;
          } else {
            if (data.employeeID) {
              this.hrService
                .GetCurrentEBasicSalariesByEmployeeID(data.employeeID)
                .subscribe((dataEBaSlary) => {
                  this.crrEBSalary = dataEBaSlary;
                });
            }
          }
        }
      }
      this.df.detectChanges();
    });
  }

  //form tự vẽ efamili
  handleEFamilyInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.FormModel = this.eFamilyFormModel;
    option.DataService = this.eFamily();
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEFamiliesComponent,
      {
        actionType: actionType,
        employeeId: this.employeeID,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.eFamiliesFuncID, this.lstFuncCurriculumVitae),
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
        this.calculateEFamilyAge();
      }
      this.df.detectChanges();
    });
  }

  // form động epassport
  handleEmployeePassportInfo(actionHeaderText, actionType: string, data: any) {
    let tempData = JSON.parse(JSON.stringify(data));

    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.ePassportFunc?.formName,
      this.ePassportFunc?.gridViewName,
      this.ePassportFunc?.entityName
    );
    request.funcID = this.ePassportFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    if (actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.ePassportFormModel.funcID,
          this.ePassportFormModel.entityName,
          'RecID'
        )
        .subscribe((res: any) => {
          tempData = res?.data;
          tempData.issuedDate = null;
          tempData.expiredDate = null;
          tempData.employeeID = this.employeeID;
          dataService.addDatas.set(tempData.recID, tempData);
          this.openFormEPassport(
            actionHeaderText,
            actionType,
            dataService,
            tempData,
            data
          );
        });
    } else if (actionType == 'copy') {
      tempData.recID = Util.uid();
      dataService.addDatas.set(tempData.recID, tempData);
      this.openFormEPassport(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    } else if (actionType == 'edit' || actionType == 'view') {
      dataService.updateDatas.set(tempData.recID, tempData);
      this.openFormEPassport(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    }
  }

  openFormEPassport(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.ePassportFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        isView: actionType == 'view' ? true : false,
        dataService: dataService,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) {
      } else {
        dataService.clear();

        if (actionType == 'add' || actionType == 'copy') {
          if (
            !this.crrPassport ||
            res?.event.save.data.issuedDate > this.crrPassport.issuedDate
          ) {
            this.crrPassport = res?.event.save.data;
            // this.passPortIsExpired = this.currentDate.toISOString() > new Date(this.crrPassport?.expiredDate).toISOString();
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          if (res.event.update.data.issuedDate >= this.crrPassport.issuedDate) {
            this.crrPassport = res.event.update.data;
            // this.passPortIsExpired = this.currentDate.toISOString() > new Date(this.crrPassport?.expiredDate).toISOString();
          } else {
            this.hrService
              .GetEmpCurrentPassport(this.employeeID)
              .subscribe((res) => {
                this.crrPassport = res;
                // this.passPortIsExpired = this.currentDate.toISOString() > new Date(this.crrPassport?.expiredDate).toISOString();
                this.df.detectChanges();
              });
          }
        }
        this.passPortIsExpired =
          this.currentDate.toISOString() >
          new Date(this.crrPassport?.expiredDate).toISOString();
      }
      this.df.detectChanges();
    });
  }

  //form tự vẽ
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
          actionHeaderText +
          ' ' +
          this.transText(this.dayoffFuncID, this.lstFuncHRProcess),
        employeeID: this.employeeID,
        funcID: this.dayoffFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(this.dayoffGrid, actionType, res.event, null);
        this.df.detectChanges();
      }
    });
  }

  // form động eworkpermit
  handleEmployeeWorkingPermitInfo(
    actionHeaderText,
    actionType: string,
    data: any
  ) {
    let tempData = JSON.parse(JSON.stringify(data));

    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eWorkPermitFunc?.formName,
      this.eWorkPermitFunc?.gridViewName,
      this.eWorkPermitFunc?.entityName
    );
    request.funcID = this.eWorkPermitFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    if (actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.eWorkPermitFormModel.funcID,
          this.eWorkPermitFormModel.entityName,
          'RecID'
        )
        .subscribe((res: any) => {
          tempData = res?.data;
          tempData.fromDate = null;
          tempData.toDate = null;
          tempData.employeeID = this.employeeID;
          dataService.addDatas.set(tempData.recID, tempData);
          this.openFormEWorkpermit(
            actionHeaderText,
            actionType,
            dataService,
            tempData,
            data
          );
        });
    } else if (actionType == 'copy') {
      tempData.recID = Util.uid();
      dataService.addDatas.set(tempData.recID, tempData);
      this.openFormEWorkpermit(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    } else if (actionType == 'edit' || actionType == 'view') {
      dataService.updateDatas.set(tempData.recID, tempData);
      this.openFormEWorkpermit(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    }
  }

  openFormEWorkpermit(
    actionHeaderText,
    actionType,
    dataService,
    tempData,
    data
  ) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.eWorkPermitFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        isView: actionType == 'view' ? true : false,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) {
        // (this.passportGridview.dataService as CRUDService).clear();
      } else {
        dataService.clear();

        if (actionType == 'add' || actionType == 'copy') {
          if (
            !this.crrWorkpermit ||
            res.event.save.data.issuedDate > this.crrWorkpermit.issuedDate
          ) {
            this.crrWorkpermit = res.event.save.data;
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          if (
            res.event.update.data.issuedDate >= this.crrWorkpermit.issuedDate
          ) {
            this.crrWorkpermit = res.event.update.data;
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
        this.workpermitIsExpired =
          this.currentDate.toISOString() >
          new Date(this.crrWorkpermit?.toDate).toISOString();
      }
      this.df.detectChanges();
    });
  }

  //form tự vẽ
  HandleEDocumentInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.DataService = this.eDocument();
    option.FormModel = this.edocumentFormModel;
    let dialogAdd = this.callfunc.openSide(
      PopupEdocumentsComponent,
      {
        actionType: actionType,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.eNeedToSubmitProfileFuncID, this.lstFuncJobInfo),
        employeeId: this.employeeID,
        funcID: this.eNeedToSubmitProfileFuncID,
        documentObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (actionType == 'edit') {
        if (res?.event) {
          let index = this.lstEmpDocument.indexOf(data);
          if (index > -1) {
            this.lstEmpDocument[index] = res.event;
          }
        }
      } else if (actionType == 'add') {
        this.lstEmpDocument.push(res.event);
      }
    });
  }

  // form động evisa
  handleEmployeeVisaInfo(actionHeaderText, actionType: string, data: any) {
    let tempData = JSON.parse(JSON.stringify(data));

    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eVisaFunc?.formName,
      this.eVisaFunc?.gridViewName,
      this.eVisaFunc?.entityName
    );
    request.funcID = this.eVisaFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    if (actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.eVisaFormModel.funcID,
          this.eVisaFormModel.entityName,
          'RecID'
        )
        .subscribe((res: any) => {
          tempData = res?.data;
          tempData.effectedDate = null;
          tempData.expiredDate = null;
          tempData.employeeID = this.employeeID;
          dataService.addDatas.set(tempData.recID, tempData);
          this.openFormEVisas(
            actionHeaderText,
            actionType,
            dataService,
            tempData,
            data
          );
        });
    } else if (actionType == 'copy') {
      tempData.recID = Util.uid();
      dataService.addDatas.set(tempData.recID, tempData);
      this.openFormEVisas(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    } else if (actionType == 'edit' || actionType == 'view') {
      dataService.updateDatas.set(tempData.recID, tempData);
      this.openFormEVisas(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    }
  }

  openFormEVisas(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();

    option.FormModel = this.eVisaFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        isView: actionType == 'view' ? true : false,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) {
        // (this.passportGridview.dataService as CRUDService).clear();
      } else {
        dataService.clear();

        if (actionType == 'add' || actionType == 'copy') {
          if (
            !this.crrVisa ||
            res?.event.save.data.issuedDate > this.crrVisa.issuedDate
          ) {
            this.crrVisa = res?.event.save.data;
            this.df.detectChanges();
          }
        } else if (actionType == 'edit') {
          if (res.event.update.data.issuedDate >= this.crrVisa.issuedDate) {
            this.crrVisa = res.event.update.data;
          } else {
            this.hrService
              .GetEmpCurrentPassport(this.employeeID)
              .subscribe((res) => {
                this.crrVisa = res;
                this.df.detectChanges();
              });
          }
        }
        this.visaIsExpired =
          this.currentDate.toISOString() >
          new Date(this.crrVisa.expiredDate).toISOString();
      }
      this.df.detectChanges();
    });
  }

  //form custome kỷ luật
  HandleEmployeeEDisciplinesInfo(
    actionHeaderText,
    actionType: string,
    data: any,
    isMulti = false
  ) {
    let option = new SidebarModel();
    // option.DataService = this.view.dataService;
    option.FormModel = this.eDisciplineFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDisciplinesComponent,
      {
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.eDisciplineFuncID, this.lstFuncHRProcess),
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
      this.updateGridView(this.eDisciplineGrid, actionType, res.event, null);
      this.df.detectChanges();
    });
  }

  // form động tai nạn lđ
  HandleEmployeeAccidentInfo(actionHeaderText, actionType: string, data: any) {
    let tempData = JSON.parse(JSON.stringify(data));

    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eAccidentsFunc?.formName,
      this.eAccidentsFunc?.gridViewName,
      this.eAccidentsFunc?.entityName
    );
    request.funcID = this.eAccidentsFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    if (actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.eAccidentsFormModel.funcID,
          this.eAccidentsFormModel.entityName,
          'RecID'
        )
        .subscribe((res: any) => {
          tempData = res?.data;
          tempData.employeeID = this.employeeID;
          dataService.addDatas.set(tempData.recID, tempData);
          this.openFormEAccident(
            actionHeaderText,
            actionType,
            dataService,
            tempData,
            data
          );
        });
    } else if (actionType == 'copy') {
      tempData.recID = Util.uid();
      dataService.addDatas.set(tempData.recID, tempData);
      this.openFormEAccident(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    } else if (actionType == 'edit' || actionType == 'view') {
      dataService.updateDatas.set(tempData.recID, tempData);
      this.openFormEAccident(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    }
  }

  openFormEAccident(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.eAccidentsFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        function: null,
        dataService: dataService,
        isView: actionType == 'view' ? true : false,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        dataService.clear();
        if (actionType == 'edit') {
          this.updateGridView(
            this.eAccidentGridView,
            actionType,
            res.event.update.data,
            null
          );
        } else if (actionType == 'add' || actionType == 'copy') {
          this.updateGridView(
            this.eAccidentGridView,
            actionType,
            res.event.save.data,
            null
          );
        }
        this.df.detectChanges();
      }
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
          actionHeaderText +
          ' ' +
          this.transText(this.eAssetFuncID, this.lstFuncSalaryBenefit),
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
    data: any,
    isMulti = false
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
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        employeeId: this.employeeID,
        funcID: this.appointionFuncID,
        appointionObj: data,
        empObj: this.infoPersonal,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.appointionFuncID, this.lstFuncHRProcess),
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.LoadedEInfo = false;
        this.updateGridView(this.appointionGridView, actionType, res.event);
        this.loadEmpFullInfo(this.employeeID).subscribe((res) => {
          if (res) {
            this.infoPersonal = res[0];
            this.infoPersonal.PositionName = res[1];
            // this.lstOrg = res[2]
            this.orgUnitStr = res[2];
            this.DepartmentStr = res[3];
            this.LoadedEInfo = true;
            this.df.detectChanges();
          }
        });
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
    option.Width = '850px';
    let dialogAdd = this.callfc.openSide(
      PopupECertificatesComponent,
      {
        trainFromHeaderText: this.eSkillHeaderText['TrainFrom'],
        trainToHeaderText: this.eSkillHeaderText['TrainTo'],
        actionType: actionType,
        headerText: actionHeaderText + ' ', //+this.transText(this.eCertificateFuncID, this.lstFuncKnowledge),
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
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      PopupEDegreesComponent,
      {
        trainFromHeaderText: this.eDegreeHeaderText['TrainFrom'],
        trainToHeaderText: this.eDegreeHeaderText['TrainTo'],
        actionType: actionType,
        headerText: actionHeaderText + ' ', //+this.transText(this.eDegreeFuncID, this.lstFuncKnowledge),
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
          actionHeaderText +
          ' ' +
          this.transText(this.eSkillFuncID, this.lstFuncKnowledge),
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
        headerText: actionHeaderText + ' ', //+this.transText(this.eTrainCourseFuncID, this.lstFuncKnowledge),
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

  HandleEContractInfo(
    actionHeaderText,
    actionType: string,
    data: any,
    isMulti = false
  ) {
    let option = new SidebarModel();
    option.Width = '850px';
    option.FormModel = this.eContractFormModel;
    console.log('contract form model truyen vao', this.eContractFormModel);

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
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        dataObj: data,
        empObj: this.infoPersonal,
        headerText: actionHeaderText + ' ', //+this.transText(this.eContractFuncID, this.lstFuncHRProcess),
        employeeId: this.employeeID,
        funcID: this.eContractFuncID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) this.view.dataService.clear();
      else if (res.event) {
        if (
          this.checkIsNewestDate(
            res.event.effectedDate,
            res.event.expiredDate
          ) == true
        ) {
          this.crrEContract = res.event;
        } else {
          this.getECurrentContract();
        }
      }
      this.df.detectChanges();
    });
  }

  //form custome khám sk
  HandleEmployeeEHealths(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '850px';
    option.FormModel = this.eHealthsGrid.formModel;
    let dialogAdd = this.callfunc.openSide(
      PopupEhealthsComponent,
      {
        actionType: actionType,
        healthObj: data,
        headerText: actionHeaderText + ' ', //+this.transText(this.eHealthFuncID, this.lstFuncHealth),
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

  // form custome khen thưởng
  HandleEmployeeEAwardsInfo(
    actionHeaderText,
    actionType: string,
    data: any,
    isMulti = false
  ) {
    let option = new SidebarModel();
    option.DataService = this.AwardGrid?.dataService;
    option.FormModel = this.awardFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      PopupEAwardsComponent,
      {
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.awardFuncID, this.lstFuncHRProcess),
        employeeId: this.employeeID,
        funcID: this.awardFuncID,
        dataInput: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (!res?.event) (this.AwardGrid?.dataService as CRUDService).clear();
      if (res?.event && res?.event[0])
        this.updateGridView(this.AwardGrid, actionType, res.event[0], data);
      this.df.detectChanges();
    });
  }

  //form động bệnh nghề nghiệp
  HandleEmployeeEDiseasesInfo(actionHeaderText, actionType: string, data: any) {
    let tempData = JSON.parse(JSON.stringify(data));

    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eDiseasesFunc?.formName,
      this.eDiseasesFunc?.gridViewName,
      this.eDiseasesFunc?.entityName
    );
    request.funcID = this.eDiseasesFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;
    if (actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.eDiseasesFormModel.funcID,
          this.eDiseasesFormModel.entityName,
          'RecID'
        )
        .subscribe((res: any) => {
          tempData = res?.data;
          tempData.employeeID = this.employeeID;
          dataService.addDatas.set(tempData.recID, tempData);
          this.openFormEDiseases(
            actionHeaderText,
            actionType,
            dataService,
            tempData,
            data
          );
        });
    } else if (actionType == 'copy') {
      tempData.recID = Util.uid();
      console.log('recID add data', tempData.recID);

      dataService.addDatas.set(tempData.recID, tempData);
      this.openFormEDiseases(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    } else if (actionType == 'edit' || actionType == 'view') {
      dataService.updateDatas.set(tempData.recID, tempData);
      this.openFormEDiseases(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    }

    // dataService.updateDatas.set(tempData.recID, tempData);
  }

  openFormEDiseases(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.eDiseasesFormModel;
    option.Width = '850px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        isView: actionType == 'view' ? true : false,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        dataService.clear();

        if (actionType == 'edit') {
          this.updateGridView(
            this.eDiseasesGrid,
            actionType,
            res.event.update.data,
            null
          );
        } else if (actionType == 'add' || actionType == 'copy') {
          this.updateGridView(
            this.eDiseasesGrid,
            actionType,
            res.event.save.data,
            null
          );
        }
        this.df.detectChanges();
      }
    });
  }

  //form custome
  HandleEBusinessTravel(
    actionHeaderText,
    actionType: string,
    data: any,
    isMulti = false
  ) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.EBusinessTravelFormodel;
    let dialogAdd = this.callfunc.openSide(
      PopupEmpBusinessTravelsComponent,
      {
        actionType:
          actionType == 'copy' && isMulti == true ? 'copyMulti' : actionType,
        employeeId: this.infoPersonal.employeeID,
        headerText:
          actionHeaderText +
          ' ' +
          this.transText(this.eBusinessTravelFuncID, this.lstFuncHRProcess),
        funcID: this.eBusinessTravelFuncID,
        businessTravelObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        this.updateGridView(
          this.businessTravelGrid,
          actionType,
          res.event,
          null
        );
      }
      this.df.detectChanges();
    });
  }

  //form động evaccine
  HandleEVaccinesInfo(actionHeaderText, actionType: string, data: any) {
    let tempData = JSON.parse(JSON.stringify(data));

    var dataService = new CRUDService(this.inject);
    let request = new DataRequest(
      this.eVaccinesFunc?.formName,
      this.eVaccinesFunc?.gridViewName,
      this.eVaccinesFunc?.entityName
    );
    request.funcID = this.eVaccinesFunc?.functionID;
    dataService.service = 'HR';
    dataService.request = request;

    if (actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.eVaccineFormModel.funcID,
          this.eVaccineFormModel.entityName,
          'RecID'
        )
        .subscribe((res: any) => {
          tempData = res?.data;
          tempData.employeeID = this.employeeID;
          dataService.addDatas.set(tempData.recID, tempData);
          this.openFormEVaccine(
            actionHeaderText,
            actionType,
            dataService,
            tempData,
            data
          );
        });
    } else if (actionType == 'copy') {
      tempData.recID = Util.uid();
      dataService.addDatas.set(tempData.recID, tempData);
      this.openFormEVaccine(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    } else if (actionType == 'edit' || actionType == 'view') {
      dataService.updateDatas.set(tempData.recID, tempData);
      this.openFormEVaccine(
        actionHeaderText,
        actionType,
        dataService,
        tempData,
        data
      );
    }
  }

  openFormEVaccine(actionHeaderText, actionType, dataService, tempData, data) {
    dataService.dataSelected = tempData;
    let option = new SidebarModel();
    option.FormModel = this.eVaccineFormModel;
    option.Width = '550px';
    let dialogAdd = this.callfunc.openSide(
      CodxFormDynamicComponent,
      {
        formModel: option.FormModel,
        data: tempData,
        isView: actionType == 'view' ? true : false,
        function: null,
        dataService: dataService,
        titleMore: actionHeaderText,
      },
      option
    );

    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        dataService.clear();

        if (actionType == 'edit') {
          this.updateGridView(
            this.eVaccinesGrid,
            actionType,
            res.event.update.data,
            null
          );
        } else if (actionType == 'add' || actionType == 'copy') {
          this.updateGridView(
            this.eVaccinesGrid,
            actionType,
            res.event.save.data,
            null
          );
        }
        this.df.detectChanges();
      }
    });
  }

  addSkill() {
    this.hrService.addSkill(null).subscribe();
  }

  addSkillGrade() {
    this.hrService.addSkillGrade(null).subscribe();
  }

  refreshGridViews() {
    // Anh Trầm chỉ, setInterval đợi nó load cái grid xong mới gọi refresh
    let ins = setInterval(() => {
      if (this.eDisciplineGrid) {
        clearInterval(ins);
        this.eDisciplineGrid.refresh();
      }
    }, 100);

    let ins2 = setInterval(() => {
      if (this.appointionGridView) {
        clearInterval(ins2);
        this.appointionGridView.refresh();
      }
    }, 100);

    let ins3 = setInterval(() => {
      if (this.dayoffGrid) {
        clearInterval(ins3);
        this.dayoffGrid.refresh();
      }
    }, 100);

    let ins4 = setInterval(() => {
      if (this.businessTravelGrid) {
        clearInterval(ins4);
        this.businessTravelGrid.refresh();
      }
    }, 100);

    let ins5 = setInterval(() => {
      if (this.AwardGrid) {
        clearInterval(ins5);
        this.AwardGrid.refresh();
      }
    }, 100);

    let ins6 = setInterval(() => {
      if (this.eDegreeGrid) {
        clearInterval(ins6);
        this.eDegreeGrid.refresh();
      }
    }, 100);

    let ins7 = setInterval(() => {
      if (this.eCertificateGrid) {
        clearInterval(ins7);
        this.eCertificateGrid.refresh();
      }
    }, 100);

    let ins8 = setInterval(() => {
      if (this.skillGrid) {
        clearInterval(ins8);
        this.skillGrid.refresh();
      }
    }, 100);

    let ins9 = setInterval(() => {
      if (this.eTrainCourseGrid) {
        clearInterval(ins9);
        this.eTrainCourseGrid.refresh();
      }
    }, 100);

    let ins10 = setInterval(() => {
      if (this.eAccidentGridView) {
        clearInterval(ins10);
        this.eAccidentGridView.refresh();
      }
    }, 100);

    let ins11 = setInterval(() => {
      if (this.eDiseasesGrid) {
        clearInterval(ins11);
        this.eDiseasesGrid.refresh();
      }
    }, 100);

    let ins12 = setInterval(() => {
      if (this.eHealthsGrid) {
        clearInterval(ins12);
        this.eHealthsGrid.refresh();
      }
    }, 100);

    let ins13 = setInterval(() => {
      if (this.eVaccinesGrid) {
        clearInterval(ins13);
        this.eVaccinesGrid.refresh();
      }
    }, 100);
  }

  loadDataWhenChangeEmp() {
    switch (this.crrFuncTab) {
      case this.curriculumVitaeFuncID:
        break;
      case this.jobInfoFuncID:
        break;
      case this.salaryBenefitInfoFuncID:
        this.initEmpSalary();
        break;
      case this.workingProcessInfoFuncID:
        this.initEmpProcess();
        break;
      case this.knowledgeInfoFuncID:
        this.initEmpKnowledge();
        break;
      case this.healthInfoFuncID:
        break;
    }
  }

  nextEmp() {
    if (this.listEmp.length <= this.totalCount) {
      this.crrIndex += 1;
      if (this.fromView == 'listView') {
        if (
          this.crrIndex == this.listEmp.length - 1 ||
          (this.crrIndex == this.listEmp.length &&
            this.crrIndex < this.totalCount - 1)
        ) {
          if (
            this.crrIndex == this.listEmp.length &&
            this.crrIndex < this.totalCount - 1
          ) {
            this.request.page = this.request.page;
          } else {
            this.request.page += 1;
          }

          this.hrService.loadData('HR', this.request).subscribe((res) => {
            if (res && res[0].length > 0) {
              this.listEmp.push(...res[0]);
              this.navigateEmp(0, true);
            } else {
              this.navigateEmp(0);
            }
          });
        } else {
          this.navigateEmp(0);
        }
      } else if (this.fromView == 'gridView') {
        if (this.crrIndex == this.listEmp.length) {
          this.request.page += 1;
          this.hrService.loadData('HR', this.request).subscribe((res) => {
            if (res && res[0].length > 0) {
              this.listEmp.push(...res[0]);
              this.navigateEmp(0, true);
            } else {
              this.navigateEmp(0);
            }
          });
        }
        if (this.crrIndex > -1 && this.crrIndex != this.listEmp.length) {
          this.navigateEmp(0);
        }
      }
      this.loadDataWhenChangeEmp();
      this.refreshGridViews();
    }
  }

  navigateEmp(isNextEmp, isNextPage?) {
    if (isNextPage == true) {
      let newPageNum = Number(this.pageNum) + 1;
      this.pageNum = newPageNum;
    }
    if (this.crrIndex > -1) {
      this.LoadedEInfo = false;
      this.infoPersonal = null;
      let urlView = `/hr/employeedetail/${this.funcID}`;
      this.codxService.replaceNavigate(
        urlView,
        {
          employeeID: this.listEmp[this.crrIndex + isNextEmp]?.EmployeeID,
          page: this.pageNum.toString(),
          // totalPage: this.maxPageNum,
          // totalCount: this.totalCount,
          // from: this.fromView
        },
        {
          data: this.listEmp,
          request: this.request,
          totalPage: this.maxPageNum,
          totalCount: this.totalCount,
          from: this.fromView,
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
      (this.eBenefitGrid.dataService as CRUDService).setPredicates(
        [this.filterEBenefitPredicates],
        [this.filterByBenefitIDArr.join(';')]
      );
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
      (this.eBenefitGrid.dataService as CRUDService).setPredicates(
        [this.filterEBenefitPredicates],
        [this.filterByBenefitIDArr.join(';')]
      );
    } else if (
      this.filterByBenefitIDArr?.length <= 0 &&
      this.startDateEBenefitFilterValue != null
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}" and EffectedDate>="${this.startDateEBenefitFilterValue}" and EffectedDate<="${this.endDateEBenefitFilterValue}")`;
      (this.eBenefitGrid.dataService as CRUDService).setPredicates(
        [this.filterEBenefitPredicates],
        []
      );
    } else if (
      this.filterByBenefitIDArr?.length <= 0 &&
      (this.startDateEBenefitFilterValue == undefined ||
        this.startDateEBenefitFilterValue == null)
    ) {
      this.filterEBenefitPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eBenefitGrid.dataService as CRUDService).setPredicates(
        [this.filterEBenefitPredicates],
        ['']
      );
    }
  }

  logDataDegree(data) {
    console.log('data degree load len', data);
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
        quitjobStatus: this.infoPersonal.status,
        func: this.benefitFunc,
        funcUrl: this.benefitURL,
        fromWS: this.fromWS,
        funcID: this.benefitFuncID,
        employeeId: this.employeeID,
        headerText: this.transText(
          this.benefitFuncID,
          this.lstFuncSalaryBenefit
        ),
        sortModel: this.benefitSortModel,
        formModel: this.benefitFormodel,
        hasFilter: false,
      },
      null,
      opt
    );
    popup.closed.subscribe((res) => {
      // Thay vào đó gọi api lấy lại tất cả benefit mới nhất luôn
      this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
        if (res) {
          this.listCrrBenefit = res;
          this.df.detectChanges();
        }
      });
    });
  }

  valueChangeViewAllEBenefit(evt) {
    this.popupViewBenefit();
  }

  closeModelSalary(dialog: DialogRef) {
    dialog.close();
  }

  popupUpdateEBasicSalaryStatus() {
    console.log('hihi');
    let opt = new DialogModel();
    opt.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupViewAllComponent,
      null,
      850,
      550,
      this.eBasicSalaryFuncID,
      {
        quitjobStatus: this.infoPersonal.status,
        func: this.eBasicSalaryFunc,
        funcUrl: this.eBasicSalaryURL,
        fromWS: this.fromWS,
        funcID: this.eBasicSalaryFuncID,
        employeeId: this.employeeID,
        headerText: this.transText(
          this.eBasicSalaryFuncID,
          this.lstFuncSalaryBenefit
        ),
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

  copyValue(actionHeaderText, data, flag, isMulti = false) {
    switch (flag.toLowerCase()) {
      case 'benefit':
        if (this.eBenefitGrid) {
          this.eBenefitGrid.dataService.dataSelected = data;
          (this.eBenefitGrid.dataService as CRUDService)
            .copy()
            .subscribe((res: any) => {
              if (isMulti == true) {
                this.handlEmployeeBenefit(actionHeaderText, 'copy', res, true);
              } else {
                this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
              }
            });
        } else {
          this.hrService
            .copy(data, this.benefitFormodel, 'RecID')
            .subscribe((res) => {
              if (isMulti == true) {
                this.handlEmployeeBenefit(actionHeaderText, 'copy', res, true);
              } else {
                this.handlEmployeeBenefit(actionHeaderText, 'copy', res);
              }
            });
        }
        break;
      case 'edisciplines':
        if (this.eDisciplineGrid) {
          this.eDisciplineGrid.dataService.dataSelected = data;
          (this.eDisciplineGrid.dataService as CRUDService)
            .copy()
            .subscribe((res: any) => {
              if (isMulti == true) {
                this.HandleEmployeeEDisciplinesInfo(
                  actionHeaderText,
                  'copy',
                  res,
                  true
                );
              } else {
                this.HandleEmployeeEDisciplinesInfo(
                  actionHeaderText,
                  'copy',
                  res
                );
              }
            });
        } else {
          this.hrService
            .copy(data, this.eDisciplineFormModel, 'RecID')
            .subscribe((res) => {
              if (isMulti == true) {
                this.HandleEmployeeEDisciplinesInfo(
                  actionHeaderText,
                  'copy',
                  res,
                  true
                );
              } else {
                this.HandleEmployeeEDisciplinesInfo(
                  actionHeaderText,
                  'copy',
                  res
                );
              }
            });
        }
        break;
      case 'eappointions':
        this.appointionGridView.dataService.dataSelected = data;
        (this.appointionGridView.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            if (isMulti == true) {
              this.HandleEmployeeAppointionInfo(
                actionHeaderText,
                'copy',
                res,
                true
              );
            } else {
              this.HandleEmployeeAppointionInfo(actionHeaderText, 'copy', res);
            }
          });
        break;
      case 'epassport':
        this.hrService
          .copy(data, this.ePassportFormModel, 'RecID')
          .subscribe((res) => {
            this.handleEmployeePassportInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'eworkpermit':
        this.hrService
          .copy(data, this.eWorkPermitFormModel, 'RecID')
          .subscribe((res) => {
            this.handleEmployeeWorkingPermitInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'efamilies':
        this.hrService
          .copy(data, this.eFamilyFormModel, 'RecID')
          .subscribe((res) => {
            this.handleEFamilyInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'evisa':
        this.hrService
          .copy(data, this.eVisaFormModel, 'RecID')
          .subscribe((res) => {
            this.handleEmployeeVisaInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'eexperiences':
        this.hrService
          .copy(data, this.eExperienceFormModel, 'RecID')
          .subscribe((res) => {
            this.handlEmployeeExperiences(actionHeaderText, 'copy', res);
          });
        break;
      case 'assets':
        this.eAssetGrid.dataService.dataSelected = data;
        (this.eAssetGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.HandlemployeeAssetInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'etraincourses':
        this.hrService
          .copy(data, this.eTrainCourseFormModel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeTrainCourseInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'evvaccine':
        this.eVaccinesGrid.dataService.dataSelected = data;
        (this.eVaccinesGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.HandleEVaccinesInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'ehealth':
        this.eHealthsGrid.dataService.dataSelected = data;
        (this.eHealthsGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.HandleEmployeeEHealths(actionHeaderText, 'copy', res);
          });
        break;
      case 'ecertificate':
        this.hrService
          .copy(data, this.eCertificateFormModel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeECertificateInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'edayoff':
        this.dayoffGrid.dataService.dataSelected = data;
        (this.dayoffGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            this.HandleEmployeeDayOffInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'ebusinesstravels':
        this.businessTravelGrid.dataService.dataSelected = data;
        (this.businessTravelGrid.dataService as CRUDService)
          .copy()
          .subscribe((res: any) => {
            if (isMulti == true) {
              this.HandleEBusinessTravel(actionHeaderText, 'copy', res, true);
            } else {
              this.HandleEBusinessTravel(actionHeaderText, 'copy', res);
            }
          });
        break;
      case 'basicsalary':
        this.hrService
          .copy(data, this.eBasicSalaryFormmodel, 'RecID')
          .subscribe((res) => {
            if (isMulti == true) {
              this.handleEBasicSalaries(actionHeaderText, 'copy', res, true);
            } else {
              this.handleEBasicSalaries(actionHeaderText, 'copy', res);
            }
          });
        break;
      case 'jobsalary':
        this.hrService
          .copy(data, this.eJobSalaryFormModel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeJobSalariesInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'eaccidents':
        this.hrService
          .copy(data, this.eAccidentsFormModel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeAccidentInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'eskills':
        this.hrService
          .copy(data, this.eSkillFormmodel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeESkillsInfo(actionHeaderText, 'copy', res);
          });
        break;
      case 'econtract':
        this.hrService
          .copy(data, this.eContractFormModel, 'RecID')
          .subscribe((res) => {
            if (isMulti == true) {
              this.HandleEContractInfo(actionHeaderText, 'copy', res, true);
            } else {
              this.HandleEContractInfo(actionHeaderText, 'copy', res);
            }
          });
        break;
      case 'edegrees':
        this.hrService
          .copy(data, this.eDegreeFormModel, 'RecID')
          .subscribe((res) => {
            this.HandleEmployeeEDegreeInfo(actionHeaderText, 'copy', res);
          });
        break;
    }
  }

  updateGridView(
    gridView: CodxGridviewV2Component,
    actionType: string,
    newData: any,
    oldData?: any
  ) {
    let returnVal = 0;
    let index = 0;
    if (oldData) {
      index = gridView.dataService.data.findIndex(
        (p) => p.recID == oldData.recID
      );
    }
    if (
      actionType == 'add' ||
      actionType == 'copy' ||
      actionType == 'copyMulti'
    ) {
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
      gridView.deleteRow(oldData, true);
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
      (this.eAssetGrid.dataService as CRUDService).setPredicates(
        [this.filterEAssetPredicates],
        [this.filterByAssetCatIDArr.join(';')]
      );
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
      (this.eAssetGrid.dataService as CRUDService).setPredicates(
        [this.filterEAssetPredicates],
        [this.filterByAssetCatIDArr]
      );
    } else if (
      this.filterByAssetCatIDArr?.length <= 0 &&
      this.startDateEAssetFilterValue != null
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}" and IssuedDate>="${this.startDateEAssetFilterValue}" and IssuedDate<="${this.endDateEAssetFilterValue}")`;
      (this.eAssetGrid.dataService as CRUDService).setPredicates(
        ['time'],
        [
          this.employeeID,
          this.startDateEAssetFilterValue,
          this.endDateEAssetFilterValue,
        ]
      );
    } else if (
      this.filterByAssetCatIDArr?.length <= 0 &&
      (this.startDateEAssetFilterValue == undefined ||
        this.startDateEAssetFilterValue == null)
    ) {
      this.filterEAssetPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eAssetGrid.dataService as CRUDService).setPredicates(
        [this.filterEAssetPredicates],
        [this.employeeID]
      );
    }
  }

  valueChangeYearFilterAward(evt) {
    if (evt.formatDate == undefined && evt.toDate == undefined) {
      this.Start_Date_Award_Filter_Value = null;
      this.End_Date_Award_Filter_Value = null;
      this.Filter_Award_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.AwardGrid.dataService as CRUDService).setPredicates(
        [this.Filter_Award_Predicates],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.AwardGrid,
            res,
            this.Filter_Award_Predicates,
            null
          );
        }
      );
    } else {
      this.Start_Date_Award_Filter_Value = evt.fromDate.toJSON();
      this.End_Date_Award_Filter_Value = evt.toDate.toJSON();
      let inYear = new Date(this.End_Date_Award_Filter_Value).getFullYear();
      this.Filter_Award_Predicates = `(EmployeeID=="${this.employeeID}" and InYear=="${inYear}")`;

      (this.AwardGrid.dataService as CRUDService).setPredicates(
        [this.Filter_Award_Predicates],
        [],
        (res) => {
          this.UpdateDataOnGrid(
            this.AwardGrid,
            res,
            this.Filter_Award_Predicates,
            null
          );
        }
      );
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
      (this.eVaccinesGrid.dataService as CRUDService).setPredicates(
        [this.filterEVaccinePredicates],
        [this.filterByVaccineTypeIDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.eVaccinesGrid,
            res,
            this.filterEVaccinePredicates,
            this.filterByVaccineTypeIDArr.join(';')
          );
        }
      );
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
      (this.eVaccinesGrid.dataService as CRUDService).setPredicates(
        [this.filterEVaccinePredicates],
        [this.filterByVaccineTypeIDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.eVaccinesGrid,
            res,
            this.filterEVaccinePredicates,
            this.filterByVaccineTypeIDArr.join(';')
          );
        }
      );
    } else if (
      this.filterByVaccineTypeIDArr?.length <= 0 &&
      this.startDateEVaccineFilterValue != null
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}" and InjectDate>="${this.startDateEVaccineFilterValue}" and InjectDate<="${this.endDateEVaccineFilterValue}")`;
      (this.eVaccinesGrid.dataService as CRUDService).setPredicates(
        [this.filterEVaccinePredicates],
        [],
        (res) => {
          this.UpdateDataOnGrid(
            this.eVaccinesGrid,
            res,
            this.filterEVaccinePredicates,
            null
          );
        }
      );
    } else if (
      this.filterByVaccineTypeIDArr?.length <= 0 &&
      (this.startDateEVaccineFilterValue == undefined ||
        this.startDateEVaccineFilterValue == null)
    ) {
      this.filterEVaccinePredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eVaccinesGrid.dataService as CRUDService).setPredicates(
        [this.filterEVaccinePredicates],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.eVaccinesGrid,
            res,
            this.filterEVaccinePredicates,
            null
          );
        }
      );
    }
  }

  UpdateESkillPredicate(evt) {
    this.filterByESkillIDArr = evt.data;
    let lengthArr = this.filterByESkillIDArr?.length;

    if (lengthArr <= 0) {
      this.filterESkillPredicates = `(EmployeeID=="${this.employeeID}")`;
      (this.skillGrid.dataService as CRUDService).setPredicates(
        [this.filterESkillPredicates],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.skillGrid,
            res,
            this.filterESkillPredicates,
            null
          );
        }
      );
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
      (this.skillGrid.dataService as CRUDService).setPredicates(
        [this.filterESkillPredicates],
        [this.filterByESkillIDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.skillGrid,
            res,
            this.filterESkillPredicates,
            this.filterByESkillIDArr.join(';')
          );
        }
      );
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
      (this.eTrainCourseGrid.dataService as CRUDService).setPredicates(
        [this.Filter_ETrainCourse_Predicates],
        [this.Filter_By_ETrainCourse_IDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.eTrainCourseGrid,
            res,
            this.Filter_ETrainCourse_Predicates,
            this.Filter_By_ETrainCourse_IDArr.join(';')
          );
        }
      );
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
      (this.eTrainCourseGrid.dataService as CRUDService).setPredicates(
        [this.Filter_ETrainCourse_Predicates],
        [this.Filter_By_ETrainCourse_IDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.eTrainCourseGrid,
            res,
            this.Filter_ETrainCourse_Predicates,
            this.Filter_By_ETrainCourse_IDArr.join(';')
          );
        }
      );
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length <= 0 &&
      this.Start_Date_ETrainCourse_Filter_Value != null
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}" and TrainFromDate>="${this.Start_Date_ETrainCourse_Filter_Value}" and TrainFromDate<="${this.End_Date_ETrainCourse_Filter_Value}")`;
      (this.eTrainCourseGrid.dataService as CRUDService).setPredicates(
        [this.Filter_ETrainCourse_Predicates],
        [],
        (res) => {
          this.UpdateDataOnGrid(
            this.eTrainCourseGrid,
            res,
            this.Filter_ETrainCourse_Predicates,
            null
          );
        }
      );
    } else if (
      this.Filter_By_ETrainCourse_IDArr?.length <= 0 &&
      (this.Start_Date_ETrainCourse_Filter_Value == undefined ||
        this.Start_Date_ETrainCourse_Filter_Value == null)
    ) {
      this.Filter_ETrainCourse_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eTrainCourseGrid.dataService as CRUDService).setPredicates(
        [this.Filter_ETrainCourse_Predicates],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.eTrainCourseGrid,
            res,
            this.Filter_ETrainCourse_Predicates,
            null
          );
        }
      );
    }
  }

  valueChangeFilterDiseasesTypeID(evt) {
    this.Filter_By_EDiseases_IDArr = evt.data;
    let lengthArr = this.Filter_By_EDiseases_IDArr?.length;
    if (lengthArr <= 0) {
      this.Filter_EDiseases_Predicates = `(EmployeeID=="${this.employeeID}")`;
      (this.eDiseasesGrid.dataService as CRUDService).setPredicates(
        [this.Filter_EDiseases_Predicates],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.eDiseasesGrid,
            res,
            this.Filter_EDiseases_Predicates,
            null
          );
        }
      );
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
      (this.eDiseasesGrid.dataService as CRUDService).setPredicates(
        [this.Filter_EDiseases_Predicates],
        [this.Filter_By_EDiseases_IDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.eDiseasesGrid,
            res,
            this.Filter_EDiseases_Predicates,
            this.Filter_By_EDiseases_IDArr.join(';')
          );
        }
      );
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
      (this.businessTravelGrid.dataService as CRUDService).setPredicates(
        [this.filterBusinessTravelPredicates],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.businessTravelGrid,
            res,
            this.filterBusinessTravelPredicates,
            null
          );
        }
      );
    } else {
      this.startDateBusinessTravelFilterValue = evt.fromDate.toJSON();
      this.endDateBusinessTravelFilterValue = evt.toDate.toJSON();
      this.filterBusinessTravelPredicates = `(EmployeeID=="${this.employeeID}" and BeginDate>="${this.startDateBusinessTravelFilterValue}" and EndDate<="${this.endDateBusinessTravelFilterValue}")`;
      (this.businessTravelGrid.dataService as CRUDService).setPredicates(
        [this.filterBusinessTravelPredicates],
        [],
        (res) => {
          this.UpdateDataOnGrid(
            this.businessTravelGrid,
            res,
            this.filterBusinessTravelPredicates,
            null
          );
        }
      );
    }
  }

  UpdateEDayOffsPredicate() {
    if (this.dayoffGrid) {
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
        (this.dayoffGrid?.dataService as CRUDService).setPredicates(
          [this.filterEDayoffPredicates],
          [this.filterByKowIDArr.join(';')],
          (res) => {
            this.UpdateDataOnGrid(
              this.dayoffGrid,
              res,
              this.filterEDayoffPredicates,
              this.filterByKowIDArr.join(';')
            );
          }
        );
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
        (this.dayoffGrid?.dataService as CRUDService).setPredicates(
          [this.filterEDayoffPredicates],
          [this.filterByKowIDArr.join(';')],
          (res) => {
            this.UpdateDataOnGrid(
              this.dayoffGrid,
              res,
              this.filterEDayoffPredicates,
              this.filterByKowIDArr.join(';')
            );
          }
        );
      } else if (
        this.filterByKowIDArr?.length <= 0 &&
        this.startDateEDayoffFilterValue != null
      ) {
        this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}" and BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}")`;
        (this.dayoffGrid?.dataService as CRUDService).setPredicates(
          [this.filterEDayoffPredicates],
          [],
          (res) => {
            this.UpdateDataOnGrid(
              this.dayoffGrid,
              res,
              this.filterEDayoffPredicates,
              null
            );
          }
        );
      } else if (
        this.filterByKowIDArr?.length <= 0 &&
        (this.startDateEDayoffFilterValue == undefined ||
          this.startDateEDayoffFilterValue == null)
      ) {
        this.filterEDayoffPredicates = `(EmployeeID=="${this.employeeID}")`;
        (this.dayoffGrid?.dataService as CRUDService).setPredicates(
          [this.filterEDayoffPredicates],
          [''],
          (res) => {
            this.UpdateDataOnGrid(
              this.dayoffGrid,
              res,
              this.filterEDayoffPredicates,
              null
            );
          }
        );
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
      (this.eAccidentGridView.dataService as CRUDService).setPredicates(
        [this.filterAccidentIdPredicate],
        [''],
        (res) => {
          this.UpdateDataOnGrid(
            this.eAccidentGridView,
            res,
            this.filterAccidentIdPredicate,
            null
          );
        }
      );
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
      (this.eAccidentGridView.dataService as CRUDService).setPredicates(
        [this.filterAccidentIdPredicate],
        [this.filterByAccidentIDArr.join(';')],
        (res) => {
          this.UpdateDataOnGrid(
            this.eAccidentGridView,
            res,
            this.filterAccidentIdPredicate,
            this.filterByAccidentIDArr.join(';')
          );
        }
      );
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

  calculateEFamilyAge() {
    for (let i = 0; i < this.lstFamily.length; i++) {
      if (this.lstFamily[i].birthday) {
        let birth = new Date(this.lstFamily[i].birthday);
        let birthYear = birth.getFullYear();

        let currentDay = new Date();
        let currentYear = currentDay.getFullYear();

        if (birthYear < currentYear) {
          this.lstFamily[i].age = `${currentYear - birthYear}`;
        } else {
          let birthMonth = birth.getMonth();
          let currentMonth = currentDay.getMonth();
          this.lstFamily[i].age = `${currentMonth - birthMonth} tháng`;
        }
      } else {
        this.lstFamily[i].age = '';
      }
    }
  }

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
      this.hrService.loadData('HR', empRequest).subscribe((res: any) => {
        if (Array.isArray(res) && res[1] > 0) {
          this.lineManager = res[0][0];
          this.loadedLineManager = true;
          this.df.detectChanges();
        }
      });
    } else {
      this.loadedLineManager = true;
      this.df.detectChanges();
    }
    if (this.infoPersonal?.indirectManager) {
      let empRequest = new DataRequest();
      empRequest.entityName = 'HR_Employees';
      empRequest.dataValues = this.infoPersonal.indirectManager;
      empRequest.predicates = 'EmployeeID=@0';
      empRequest.pageLoading = false;
      this.hrService.loadData('HR', empRequest).subscribe((emp) => {
        if (emp[1] > 0) {
          this.indirectManager = emp[0][0];
          this.loadedIndirectManager = true;
          this.df.detectChanges();
        }
      });
    } else {
      this.loadedIndirectManager = true;
      this.df.detectChanges();
    }
  }

  HandleEmployeeDocument() {
    this.isHiddenCbxDocument = false;
    this.lstCurrentDocumentTypeID = this.lstEmpDocument.map((e) => {
      return e.documentTypeID;
    });
    this.strCurrentDocuments = this.lstCurrentDocumentTypeID.join(';');
  }

  onClickHideComboboxPopup(evt) {
    this.isHiddenCbxDocument = true;
    let lstIdReturn = evt.id.split(';');
    let lstIdAdd = [];
    let lstIdAlreadyHave = this.lstEmpDocument.map((x: any) => {
      return x.documentTypeID;
    });

    for (let i = 0; i < lstIdReturn.length; i++) {
      let index = lstIdAlreadyHave.indexOf(lstIdReturn[i]);

      if (index < 0) {
        lstIdAdd.push(lstIdReturn[i]);
      }
    }

    let addedSucess = false;
    for (let i = 0; i < lstIdAdd.length; i++) {
      this.GetDocumentByDocumentTypeID(lstIdAdd[i]).subscribe((res) => {
        console.log(lstIdAdd[i], res);
        if (res) {
          res.employeeId = this.employeeID;
          res.recID = Util.uid();
          // this.lstEmpDocument.push(res);
          this.AddEDocument(res).subscribe((res2) => {
            if (res2) {
              if (addedSucess == false) {
                addedSucess = true;
                this.notify.notifyCode('SYS006');
              }
              this.GetEmpDocument(this.infoPersonal.employeeID).subscribe(
                (res) => {
                  this.lstEmpDocument = res;
                  for (let i = 0; i < this.lstEmpDocument.length; i++) {
                    this.getFileDataAsync(
                      this.lstEmpDocument[i].recID
                    ).subscribe((res) => {
                      this.lstEmpDocument[i].lstFile = res;
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
    this.df.detectChanges();
  }

  transText(value: string, lstFuncID: any): string {
    console.log(value);
    let funcObj = lstFuncID.filter((x) => x.functionID == value);
    let headerText = '';
    if (funcObj && funcObj?.length > 0) {
      headerText = funcObj[0].description;
    }
    return headerText;
  }
  //#region APIs
  GetEmpDocument(empID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'GetDocumentByEmployeeIdAsync',
      [empID]
    );
  }

  GetDocumentByDocumentTypeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'GetDocumentByDocumentTypeIDAsync',
      [data]
    );
  }

  getFileDataAsync(pObjectID: string) {
    return this.api.execSv<any>(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [pObjectID]
    );
  }

  AddEDocument(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'AddEDocumentsAsync',
      data
    );
  }

  DeleteEDocument(recId) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDocumentsBusiness_Old',
      'DeleteEDocumentsAsync',
      recId
    );
  }
  //#endregion

  //#region Init CRUD
  eDocument() {
    if (!this.edocumentCRUD)
      this.edocumentCRUD = this.hrService.createCRUDService(
        this.inject,
        this.edocumentFormModel,
        'HR'
      );
    return this.edocumentCRUD;
  }

  eFamily() {
    if (!this.eFamilyCRUD)
      this.eFamilyCRUD = this.hrService.createCRUDService(
        this.inject,
        this.eFamilyFormModel,
        'HR'
      );
    return this.eFamilyCRUD;
  }

  eExperiences() {
    if (!this.eExperiencesCRUD)
      this.eExperiencesCRUD = this.hrService.createCRUDService(
        this.inject,
        this.eExperienceFormModel,
        'HR'
      );
    return this.eExperiencesCRUD;
  }
  //#endregion

  // get formModel
  getFormModelByFuncID(funcID: string) {
    if (funcID) {
      switch (funcID) {
        case '': //TAB SƠ YẾU LÍ LỊCH
          break;
        case '': //TAB THÔNG TIN NHÂN VIÊN
          break;
        case '': //TAB LƯƠNG PHÚC LỢI
          break;
        case '': //TAB QUÁ TRÌNH NHÂN SỰ
          break;
        case '': //TAB KIẾN THỨC
          break;
        case '': //TAB SỨC KHỎE
          break;
        case '': //TAB THÔI VIỆC
          break;
      }
    }
  }

  //get child function by parent functionID
  getChildFunction(parentFuncID: string) {
    if (parentFuncID) {
      this.api
        .execSv('SYS', 'SYS', 'FunctionListBusiness', 'GetByParentAsync', [
          parentFuncID,
          true,
        ])
        .subscribe((res: any) => {
          if (res && res.length > 0) {
          }
        });
    }
  }

  listField: any = [
    {
      id: 'Employeeinfo',
      name: 'Nhân viên',
      field: 'FullName',
      width: 200,
      textAlign: 'Left',
      type: 'text',
    },
    {
      id: 'StartWorkingDate',
      name: 'Tình trạng',
      field: 'StartWorkingDate',
      width: 100,
      textAlign: 'Left',
      type: 'combobox',
    },
    {
      id: 'Hotline',
      name: 'Liên hệ',
      field: 'Phone',
      width: 100,
      textAlign: 'Left',
      type: 'datetime',
    },
  ];

  listThanNhan: any[] = [
    {
      FullName: 'Vũ Đại Kỳ',
      Gender: 1,
      img: 'assets/images/avar.png',
      EmployeeCode: 'ELV02269',
      JobWorking: 'Kiểm thử chất lượng phần mềm',
      TT: 'Trung tâm CDC',
      WorkingType: 'Thử việc',
      StartWorkingDate: new Date().toISOString(),
      Email: 'nnpvi@lacviet.com.vn',
      Phone: '(+84) 39-1234-5678',
    },
    {
      FullName: 'Vũ Đại Kỳ',
      Gender: 1,
      img: 'assets/images/avar.png',
      EmployeeCode: 'ELV02269',
      JobWorking: 'Kiểm thử chất lượng phần mềm',
      TT: 'Trung tâm CDC',
      WorkingType: 'Thử việc',
      StartWorkingDate: new Date().toISOString(),
      Email: 'nnpvi@lacviet.com.vn',
      Phone: '(+84) 39-1234-5678',
    },
    {
      FullName: 'Vũ Đại Kỳ',
      Gender: 1,
      img: 'assets/images/avar.png',
      EmployeeCode: 'ELV02269',
      JobWorking: 'Kiểm thử chất lượng phần mềm',
      TT: 'Trung tâm CDC',
      WorkingType: 'Thử việc',
      StartWorkingDate: new Date().toISOString(),
      Email: 'nnpvi@lacviet.com.vn',
      Phone: '(+84) 39-1234-5678',
    },
    {
      FullName: 'Vũ Đại Kỳ',
      Gender: 1,
      img: 'assets/images/avar.png',
      EmployeeCode: 'ELV02269',
      JobWorking: 'Kiểm thử chất lượng phần mềm',
      TT: 'Trung tâm CDC',
      WorkingType: 'Thử việc',
      StartWorkingDate: new Date().toISOString(),
      Email: 'nnpvi@lacviet.com.vn',
      Phone: '(+84) 39-1234-5678',
    },
  ];

  registerApprove(event: any) {
    let options = new SidebarModel();

    options.Width = 'Auto';
    this.callfunc.openSide(DialogReviewLeaveApproveComponent, [], options);
  }
}
