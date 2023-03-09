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
import { ActivatedRoute, Router } from '@angular/router';
import { Sort } from '@syncfusion/ej2-angular-grids';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
@Component({
  selector: 'lib-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PortalComponent extends UIComponent {
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
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.user = this.auth.get();
    let request = new DataRequest();
    request.entityName = 'HR_Employees';
    request.predicates = 'DomainUser=@0';
    request.dataValues = this.user.userID;
    request.pageLoading = false;
    this.hrService.loadData('HR', request).subscribe((res) => {
      if (res && res[1] > 0) {
        this.infoPersonal = res[0][0];
        this.employeeID = this.infoPersonal.employeeID;
      }
      console.log('employeeeeeeeeeeeeeeee', res);
    });
    console.log(
      'userrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      this.user
    );
  }
  infoPersonal: any;
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
  //degree
  lstEDegrees: any = [];
  //passport
  lstPassport: any = [];
  crrPassport: any;
  //visa
  lstVisa: any = [];
  crrVisa: any = {};

  //jobInfo
  jobInfo: any;
  crrJobSalaries: any;

  //Certificate
  lstCertificates: any = [];

  //EDiscipline
  lstDiscipline: any = [];

  formModel;
  itemDetail;

  employeeID;
  hrEContract;
  crrTab: number = 0;
  //EDayOff
  lstDayOffs: any = [];

  //EAsset salary
  lstAsset: any;
  //EAppointion
  lstAppointions: any = [];
  //Basic salary
  crrEBSalary: any;

  listCrrBenefit: any;

  lstESkill: any;
  IsMax = false;
  Current_Grade_ESkill: any = [];

  //#region getGridView
  eSkillgrvSetup;
  eBenefitGrvSetup;
  eAssetGrvSetup;
  eDayOffGrvSetup;
  eTrainCourseGrvSetup;
  //#endregion

  //#region sortModels
  dayOffSortModel: SortModel;
  assetSortModel: SortModel;
  businessTravelSortModel: SortModel;
  benefitSortModel: SortModel;
  passportSortModel: SortModel;
  skillIDSortModel: SortModel;
  skillGradeSortModel: SortModel;
  appointionSortModel: SortModel;
  bSalarySortModel: SortModel;
  issuedDateSortModel: SortModel;
  TrainFromDateSortModel: SortModel;
  //#endregion

  reRenderGrid = true;

  //#region ColumnsGrid
  passportColumnGrid;
  visaColumnGrid;
  diseaseColumnsGrid;
  positionColumnsGrid;
  holidayColumnsGrid;
  workDiaryColumnGrid;
  awardColumnsGrid;
  disciplineColumnGrid;
  eDegreeColumnsGrid;
  eCertificateColumnGrid;
  eAssetColumnGrid;
  eSkillColumnGrid;
  basicSalaryColumnGrid;
  eTrainCourseColumnGrid;
  businessTravelColumnGrid;
  benefitColumnGrid;
  dayoffColumnGrid;
  appointionColumnGrid;
  jobSalaryColumnGrid;
  eContractColumnGrid;
  eDisciplineColumnsGrid;
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

  @ViewChild('tempFromDate', { static: true }) tempFromDate;
  @ViewChild('tempToDate', { static: true }) tempToDate: TemplateRef<any>;

  // ePassPort
  @ViewChild('passportCol1', { static: true }) passportCol1: TemplateRef<any>;
  @ViewChild('passportCol2', { static: true }) passportCol2: TemplateRef<any>;

  // ePassVisa
  @ViewChild('visaCol1', { static: true }) visaCol1: TemplateRef<any>;
  @ViewChild('visaCol2', { static: true }) visaCol2: TemplateRef<any>;

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

  numPageSizeGridView = 100;
  @ViewChild('eAwardGridView') AwardGrid: CodxGridviewComponent;
  @ViewChild('eDisciplineGridView') eDisciplineGrid: CodxGridviewComponent;
  @ViewChild('businessTravelGrid') businessTravelGrid: CodxGridviewComponent;
  @ViewChild('eTrainCourseGridView') eTrainCourseGrid: CodxGridviewComponent;
  @ViewChild('eSkillGridViewID') skillGrid: CodxGridviewComponent;
  @ViewChild('eCertificateGridView') eCertificateGrid: CodxGridviewComponent;
  @ViewChild('eAssetGridView') eAssetGrid: CodxGridviewComponent;
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

  //#region gridView viewChild
  @ViewChild('passportGridview') passportGridview: CodxGridviewComponent;
  @ViewChild('visaGridview') visaGridview: CodxGridviewComponent;
  @ViewChild('basicSalaryGridview') basicSalaryGridview: CodxGridviewComponent;
  @ViewChild('appointionGridView') appointionGridView: CodxGridviewComponent;
  @ViewChild('jobSalaryGridview') jobSalaryGridview: CodxGridviewComponent;
  @ViewChild('eContractGridview') eContractGridview: CodxGridviewComponent;

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
  dayOffTravelHRProcess: any = [];
  lstFuncKnowledge: any = [];
  lstFuncAward: any = [];
  lstFuncArchiveRecords: any = [];
  lstFuncSeverance: any = [];
  lstFuncID: any = [];
  //#endregion

  //#region RowCount
  eDegreeRowCount;
  passportRowCount: number;
  visaRowCount: Number;
  eCertificateRowCount;
  eBenefitRowCount: number = 0;
  eBusinessTravelRowCount = 0;
  eSkillRowCount = 0;
  dayoffRowCount: number = 0;
  eAssetRowCount;
  eBasicSalaryRowCount;
  eTrainCourseRowCount;
  appointionRowCount;
  eJobSalaryRowCount;
  awardRowCount;
  eContractRowCount;
  eDisciplineRowCount;
  //#endregion

  //#region var functionID
  selfInfoFuncID: string = 'HRPEM01'; //Thong tin ban than
  legalInfoFuncID: string = 'HRPEM02'; //Thong tin phap li
  jobInfoFuncID: string = 'HRPEM03';
  benefitInfoFuncID: string = 'HRPEM04';
  dayoffParentInfoFuncID: string = 'HRPEM05';
  contractInfoFuncID: string = 'HRPEM06';
  knowledgeInfoFuncID: string = 'HRPEM07';
  rewDisInfoFuncID: string = 'HRPEM08';
  awardDisciplineFuncID: string = 'HRPEM08';

  eInfoFuncID = 'HRPEM0101'; // Thông tin bản thân
  eContactFuncID = 'HRPEM0102'; // thông tin liên hệ
  eFamiliesFuncID = 'HRPEM0103'; // Quan hệ gia đình
  eAssurFunc = 'HRPEM0201'; // Bảo hiểm
  eTaxCodeFuncID = 'HRPEM0202'; // Mã số thuế TNCN
  eAccountFuncID = 'HRPEM0203'; // Tài khoản cá nhân
  jobGeneralFuncID = 'HRPEM0301'; // Thông tin chung
  eTimeCardFuncID = 'HRPEM0302'; // Thông tin chấm công
  eCalSalaryFuncID = 'HRPEM0303'; // Thông tin tính lương
  appointionFuncID = 'HRPEM0304'; // Bổ nhiệm - điều chuyển
  eBasicSalaryFuncID = 'HRPEM0401'; // Lương cơ bản
  eJobSalFuncID = 'HRPEM0402'; //Lương chức danh
  benefitFuncID = 'HRPEM0403'; // Phụ cấp
  eAssetFuncID = 'HRPEM0404'; // Tài sản cấp phát
  dayoffFuncID = 'HRPEM0501'; // Nghỉ phép
  eBusinessTravelFuncID = 'HRPEM0502'; // Công tác
  eContractFuncID = 'HRPEM0601'; // Hợp đồng lao động
  eDegreeFuncID = 'HRPEM0701'; // Bằng cấp
  eCertificateFuncID = 'HRPEM0702'; // Chứng chỉ
  eSkillFuncID = 'HRPEM0703'; // Kỹ năng
  eTrainCourseFuncID = 'HRPEM0704'; // đào tạo
  eAwardFuncID = 'HRPEM0801'; // Khen thưởng
  eDisciplineFuncID = 'HRPEM0802'; // Kỷ luật
  ePassportFuncID = 'HRTEM0202';
  eVisaFuncID = 'HRTEM0203';
  //#endregion

  //#region Vll colors
  AssetColorValArr: any = [];
  BeneFitColorValArr: any = [];
  //#endregion

  //#region var formModel
  benefitFormodel: FormModel;
  EBusinessTravelFormodel: FormModel;
  eInfoFormModel: FormModel; // Thông tin bản thân
  eFamilyFormModel: FormModel; //Quan hệ gia đình
  ePassportFormModel: FormModel; //Hộ chiếu
  eVisaFormModel: FormModel;
  eCertificateFormModel: FormModel; // Chứng chỉ
  eDegreeFormModel: FormModel; // Bằng cấp
  eSkillFormmodel: FormModel; // Kỹ năng
  eAssetFormModel: FormModel; //Tài sản cấp phát
  eBasicSalaryFormmodel: FormModel; //Lương cơ bản
  eTrainCourseFormModel: FormModel; // Đào tạo
  appointionFormModel: FormModel;
  dayofFormModel: FormModel;
  eJobSalaryFormModel: FormModel; // Lương chức danh
  awardFormModel: FormModel; // Khen thưởng
  eContractFormModel: FormModel; // Hợp đồng lao động
  eDisciplineFormModel: FormModel; // Kỷ luật
  //#endregion

  //#region headerText
  eBusinessTravelHeaderTexts;
  benefitHeaderTexts;
  dayoffHeaderTexts;
  eDegreeHeaderText;
  eAssetHeaderText;
  eCertificateHeaderText;
  eSkillHeaderText;
  eTrainCourseHeaderText;
  appointionHeaderTexts;
  eJobSalaryHeaderText;
  awardHeaderText;
  eContractHeaderText;
  eDisciplineHeaderText;
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

  navChange(evt: any) {
    if (!evt) return;
    let element = document.getElementById(evt.nextId);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }
  clickItem(evet) {}

  onSectionChange(data: any) {
    console.log('change section', data);
    this.codxMwpService.currentSection = data.current;
    this.detectorRef.detectChanges();
  }

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
        console.log('familyyyyyyy', res);
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
    }
  }

  initSalaryInfo() {
    if (this.employeeID) {
      //Job salaries Lương chức danh
      if (!this.crrJobSalaries) {
        let rqJSalary = new DataRequest();
        rqJSalary.entityName = 'HR_EJobSalaries';
        rqJSalary.dataValues = this.employeeID + ';true';
        rqJSalary.predicates = 'EmployeeID=@0 and IsCurrent=@1';
        rqJSalary.page = 1;
        rqJSalary.pageSize = 1;

        this.hrService.loadData('HR', rqJSalary).subscribe((res) => {
          if (res && res[0]) {
            this.crrJobSalaries = res[0][0];
            this.df.detectChanges();
          }
        });
      }

      // Salary
      if (!this.crrEBSalary) {
        let rqBSalary = new DataRequest();
        rqBSalary.entityName = 'HR_EBasicSalaries';
        rqBSalary.dataValues = this.employeeID + ';true';
        rqBSalary.predicates = 'EmployeeID=@0 and IsCurrent=@1';
        rqBSalary.page = 1;
        rqBSalary.pageSize = 1;

        this.hrService.loadData('HR', rqBSalary).subscribe((res) => {
          if (res && res[0]) {
            this.crrEBSalary = res[0][0];
            this.df.detectChanges();
          }
        });
      }

      // Benefit
      if (!this.listCrrBenefit)
        this.hrService.GetCurrentBenefit(this.employeeID).subscribe((res) => {
          if (res?.length) {
            this.listCrrBenefit = res;
            this.df.detectChanges();
          }
        });

      // Asset
      if (!this.lstAsset)
        this.hrService.LoadDataEAsset(this.employeeID).subscribe((res) => {
          if (res) {
            this.lstAsset = res;
            this.df.detectChanges();
          }
        });
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
                t.eJobSalaryRowCount = res['data'].length;
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
        this.hrService.getViewSkillAsync(rqESkill).subscribe((res) => {
          if (res) {
            this.lstESkill = res;
            console.log('ressssssssssssssssssssss', res);
          }
        });
      }
      this.df.detectChanges();
    }

    if (!this.eDegreeColumnsGrid) {
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

      this.df.detectChanges();
      //#endregio
    }

    if (!this.eCertificateColumnGrid) {
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
    }

    if (!this.eSkillColumnGrid) {
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
      this.df.detectChanges();
    }

    if (!this.eTrainCourseColumnGrid) {
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
          this.eTrainCourseRowCount =
            this.eTrainCourseGrid.dataService.rowCount;
        }
      }, 100);

      //#endregion
    }
  }

  initHRProcess() {
    if (!this.eContractFormModel) {
      this.hrService.getFormModel(this.eContractFuncID).then((res) => {
        this.eContractFormModel = res;
      });
    }
    if (this.employeeID) {
      if (!this.crrEContract) {
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
            this.df.detectChanges();
          }
        });
      }

      if (!this.lstContractType) {
        let rqContractType = new DataRequest();
        rqContractType.entityName = 'HR_ContractTypes';
        rqContractType.dataValues = '1';
        rqContractType.predicates = 'ContractGroup =@0';
        rqContractType.pageLoading = false;

        this.hrService.getCrrEContract(rqContractType).subscribe((res) => {
          if (res && res[0]) {
            this.lstContractType = res[0];
            console.log('aaaaaaaaaaaa', this.lstContractType);

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
              this.eContractHeaderText['ContractNo'] +
              ' - ' +
              this.eContractHeaderText['SignedDate'],
            template: this.eContractCol1,
            width: '250',
          },
          {
            headerText: this.eContractHeaderText['EffectedDate'],
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

      let insEContract = setInterval(() => {
        if (this.eContractGridview) {
          clearInterval(insEContract);
          let t = this;
          this.eContractGridview.dataService.onAction.subscribe((res) => {
            if (res) {
              if (res.type == 'loaded') {
                t.eContractRowCount = 0;
                t.eContractRowCount = res['data'].length;
              }
            }
          });
          this.eContractRowCount = this.eContractGridview.dataService.rowCount;
        }
      }, 100);
    }
    //#endregion

    if (!this.appointionColumnGrid) {
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
          this.appointionRowCount =
            this.appointionGridView.dataService.rowCount;
        }
      }, 100);
      //#endregion
    }
  }

  onInit(): void {
    console.log('funtionID', this.functionID);
    console.log('view', this.view);

    this.hrService.getFunctionList(this.funcID).subscribe((res) => {
      console.log('functionList', res);
      if (res && res[1] > 0) {
        this.lstTab = res[0].filter((p) => p.parentID == this.funcID);
        this.crrFuncTab = this.lstTab[this.crrTab].functionID;
        console.log('crrFuncTab', this.crrFuncTab);
        console.log('crrFuncTab', this.lstTab);
        this.lstFuncID = res[0];

        this.lstFuncSelfInfo = res[0].filter(
          (p) => p.parentID == this.selfInfoFuncID
        );
        this.lstBtnAdd = JSON.parse(JSON.stringify(this.lstFuncSelfInfo));
        this.lstBtnAdd.splice(0, 2);

        this.lstFuncLegalInfo = res[0].filter(
          (p) => p.parentID == this.legalInfoFuncID
        );

        this.lstFuncTaskInfo = res[0].filter(
          (p) => p.parentID == this.jobInfoFuncID
        );

        this.lstFuncSalary = res[0].filter(
          (p) => p.parentID == this.benefitInfoFuncID
        );

        this.dayOffTravelHRProcess = res[0].filter(
          (p) => p.parentID == this.dayoffParentInfoFuncID
        );

        this.lstFuncKnowledge = res[0].filter(
          (p) => p.parentID == this.knowledgeInfoFuncID
        );

        this.lstFuncAward = res[0].filter(
          (p) => p.parentID == this.awardDisciplineFuncID
        );

        this.lstFuncArchiveRecords = res[0].filter(
          (p) => p.parentID == 'HRT030210'
        );

        this.lstFuncSeverance = res[0].filter((p) => p.parentID == 'HRT030208');
      }
    });

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

    //#region filter
    this.dayOffSortModel = new SortModel();
    this.dayOffSortModel.field = 'BeginDate';
    this.dayOffSortModel.dir = 'desc';

    this.assetSortModel = new SortModel();
    this.assetSortModel.field = 'IssuedDate';
    this.assetSortModel.dir = 'desc';

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

    this.issuedDateSortModel = new SortModel();
    this.issuedDateSortModel.field = 'issuedDate';
    this.issuedDateSortModel.dir = 'desc';

    this.TrainFromDateSortModel = new SortModel();
    this.TrainFromDateSortModel.field = 'TrainFromDate';
    this.TrainFromDateSortModel.dir = 'desc';

    this.appointionSortModel = new SortModel();
    this.appointionSortModel.field = '(EffectedDate)';
    this.appointionSortModel.dir = 'desc';

    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      this.addHeaderText = res[0].customName;
      this.editHeaderText = res[2].customName;
    });

    //#region get FormModel
    this.hrService.getFormModel(this.eInfoFuncID).then((res) => {
      this.eInfoFormModel = res;
      console.log('infooooooooooooooooooo', res);
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
          console.log('traincourseeeeeeeeeeee', this.eTrainCourseGrvSetup);
        });
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
          console.log('grid view set up benefit', res);
          let dataRequest = new DataRequest();

          dataRequest.comboboxName = res.BenefitID.referedValue;
          dataRequest.pageLoading = false;

          this.hrService.loadDataCbx('HR', dataRequest).subscribe((data) => {
            this.BeneFitColorValArr = JSON.parse(data[0]);
          });
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

    this.hrService.getFormModel(this.eAwardFuncID).then((res) => {
      this.awardFormModel = res;
    });

    this.hrService.getFormModel(this.eDisciplineFuncID).then((res) => {
      this.eDisciplineFormModel = res;
    });

    //#endregion

    //#region get columnGrid EVisa - Thị thực
    this.hrService.getHeaderText(this.eVisaFuncID).then((res) => {
      let visaHeaderText = res;
      this.visaColumnGrid = [
        {
          headerText:
            visaHeaderText['VisaNo'] + ' | ' + visaHeaderText['IssuedPlace'],
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
    this.hrService.getHeaderText(this.eAwardFuncID).then((res) => {
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

    //#endregion
  }

  initForm() {
    this.initPersonalInfo();

    if (this.employeeID) {
      this.hrService
        .getOrgTreeByOrgID(this.infoPersonal.orgUnitID, 3)
        .subscribe((res) => {
          if (res) {
            this.lstOrg = res;
            console.log('lst Org', this.lstOrg);
          }
        });
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
  }

  changeItemDetail(item) {}

  crrFuncTab: string;
  clickTab(funcList: any) {
    this.crrFuncTab = funcList.functionID;
    switch (this.crrFuncTab) {
      case this.selfInfoFuncID:
        this.lstBtnAdd = JSON.parse(JSON.stringify(this.lstFuncSelfInfo));
        this.lstBtnAdd.splice(0, 2);
        break;
      case this.legalInfoFuncID:
        this.lstBtnAdd = JSON.parse(JSON.stringify(this.lstFuncLegalInfo));
        this.lstBtnAdd.splice(0, 1);
        break;
      case this.jobInfoFuncID:
        this.lstBtnAdd = null;
        break;
      case this.benefitInfoFuncID:
        this.lstBtnAdd = this.lstFuncSalary;
        this.initSalaryInfo();
        break;
      case this.knowledgeInfoFuncID:
        this.lstBtnAdd = this.lstFuncKnowledge;
        this.initKnowledgeInfo();
        break;
      case this.rewDisInfoFuncID:
        this.lstBtnAdd = this.lstFuncAward;
        break;
    }
  }

  valueChangeFilterSkill(e) {}

  HandleBebefitInfo(actionType, s) {
    this.api
      .execSv('HR', 'ERM.Business.HR', 'EBenefitsBusiness', 'AddAsync', null)
      .subscribe((res) => {});
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

  valueChangeFilterBenefit(evt) {
    this.filterByBenefitIDArr = evt.data;
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
      (this.grid.dataService as CRUDService)
        .setPredicates(
          [this.filterEBenefitPredicates],
          [this.filterByBenefitIDArr.join(';')]
        )
        .subscribe((item) => {});
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
        .subscribe((item) => {});
    }
  }

  valueChangeYearFilterBenefit(evt) {
    this.startDateEBenefitFilterValue = evt.fromDate.toJSON();
    this.endDateEBenefitFilterValue = evt.toDate.toJSON();
    this.UpdateEBenefitPredicate();
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
  valueChangeViewAllEContract(evt) {
    this.ViewAllEContractFlag = evt.data;
    let ins = setInterval(() => {
      if (this.eContractGridview) {
        clearInterval(ins);
        let t = this;
        this.eContractGridview?.dataService.onAction.subscribe((res) => {
          if (res?.type == 'loaded') {
            t.eContractRowCount = res['data'].length;
          }
        });
        this.eContractRowCount = this.eContractGridview.dataService.rowCount;
      }
    }, 100);
  }

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
  // filter đào tạo
  valueChangeFilterTrainCourse(evt) {
    this.Filter_By_ETrainCourse_IDArr = evt.data;
    this.UpdateTrainCoursePredicate();
  }
  valueChangeFilterSkillID(evt) {
    this.filterByESkillIDArr = evt.data;
    this.UpdateESkillPredicate();
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
        .subscribe((item) => {});
    } else {
      (this.businessTravelGrid.dataService as CRUDService)
        .setPredicates(
          [
            `BeginDate>="${this.startDateBusinessTravelFilterValue}" and EndDate<="${this.endDateBusinessTravelFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {});
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
    } else if (this.startDateEDayoffFilterValue) {
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates(
          [
            `BeginDate>="${this.startDateEDayoffFilterValue}" and EndDate<="${this.endDateEDayoffFilterValue}"`,
          ],
          []
        )
        .subscribe((item) => {});
    } else {
      (this.dayoffGrid.dataService as CRUDService)
        .setPredicates([`EmployeeID=@0`], [this.employeeID])
        .subscribe((item) => {});
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
}
