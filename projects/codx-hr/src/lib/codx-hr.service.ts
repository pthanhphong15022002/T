import { Injectable, Injector } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LayoutModel } from '@shared/models/layout.model';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CodxService,
  DataRequest,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import {
  BehaviorSubject,
  finalize,
  catchError,
  map,
  Observable,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxHrService {
  acction = new BehaviorSubject<string>(null);
  title = new BehaviorSubject<string>(null);
  layoutcpn = new BehaviorSubject<LayoutModel>(null);
  layoutChange = this.layoutcpn.asObservable();
  reportingLineComponent: any;
  positionsComponent: any;
  orgchart: any;
  expression: RegExp =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

  //#region moreFuncAction
  actionEdit = 'S03';
  actionDelete = 'S02';
  actionAddNew = 'A01';
  actionSubmit = 'A03';
  actionReturn = 'A02';
  actionCancelSubmit = 'A00';
  actionUpdateCanceled = 'AU0';
  actionUpdateInProgress = 'AU3';
  actionUpdateRejected = 'AU4';
  actionUpdateApproved = 'AU5';
  actionUpdateClosed = 'AU9';
  actionExport = 'A20';
  actionAddAppendix = 'A10';
  actionCheckResignApprove = 'A11';
  actionCheckResignCancel = 'A12';
  //#endregion
  childMenuClick = new BehaviorSubject<any>(null);

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private codxService: CodxService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private notiService: NotificationsService
  ) {}

  createCRUDService(
    injector: Injector,
    formModel: FormModel,
    service?: string,
    gridView?: any
  ): CRUDService {
    const crudService = new CRUDService(injector);
    if (service) {
      crudService.service = service;
    }
    if (gridView) {
      crudService.gridView = gridView;
    }
    crudService.request.entityName = formModel.entityName;
    crudService.request.entityPermission = formModel.entityPer;
    crudService.request.formName = formModel.formName;
    crudService.request.gridViewName = formModel.gridViewName;
    return crudService;
  }

  loadEmployByPosition(positionID: string, _status: string): Observable<any> {
    return this.api
      .call(
        'ERM.Business.HR',
        'PositionsBusiness',
        'GetEmployeeListByPositionAsync',
        [positionID, _status]
      )
      .pipe(
        map((data) => {
          if (data.error) return;
          return data.msgBodyData[0];
        }),
        catchError((err) => {
          return of(undefined);
        }),
        finalize(() => null)
      );
  }
  loadEmployByCountStatus(positionID: string, _status: any): Observable<any> {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'PositionsBusiness',
      'GetEmployeeListByPosAsync',
      [positionID, _status]
    );
    // return this.api.call('ERM.Business.HR', 'PositionsBusiness', 'GetEmployeeListByPosAsync', [positionID, _status]).pipe(
    //   map((data) => {
    //     if (data.error) return;
    //     return data.msgBodyData[0];
    //   }),
    //   catchError((err) => {
    //     return of(undefined);
    //   }),
    //   finalize(() => null)
    // );
  }

  loadPosInfo(positionID: string): Observable<any> {
    return this.api
      .call(
        'ERM.Business.HR',
        'PositionsBusiness',
        'GetPosInfoAsync',
        positionID
      )
      .pipe(
        map((data) => {
          if (data.error) return;
          return data.msgBodyData[0];
        }),
        catchError((err) => {
          return of(undefined);
        }),
        finalize(() => null)
      );
  }

  loadOrgchart(
    orgUnitID,
    parentID = '',
    numberLV = '1',
    onlyDepartment = false
  ): Observable<any> {
    if (!orgUnitID && !parentID) return of(null);
    return this.api
      .callSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetDataDiagramAsync',
        [orgUnitID, numberLV, parentID, onlyDepartment]
      )
      .pipe(
        map((data) => {
          if (data.error) return;
          return data.msgBodyData[0];
        })
      );
  }

  addBGTrackLog(
    objectID,
    comment,
    objectType,
    actionType,
    createdBy,
    Bussiness
  ) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      Bussiness,
      'ReceiveToAddBGTrackLog',
      [objectID, comment, objectType, actionType, createdBy]
    );
  }

  getMoreFunction(data) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'MoreFunctionsBusiness',
      'GetWithPermAsync',
      data
    );
  }

  getListApprovalAsync(dtRequest, bussiness) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      bussiness,
      'GetListApprovalAsync',
      dtRequest
    );
  }

  getEmployeeInfo(employeeID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmployeeByEmployeeIDAsync',
      [employeeID]
    );
  }

  saveEmployeeAssureTaxBankInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeAssurTaxBankInfoAsync',
      data
    );
  }

  saveEmployeeSelfInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeSelfInfoAsync',
      data
    );
  }

  SaveEmployeeQuitJobInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeQuitJobInfoAsync',
      data
    );
  }

  saveEmployeeUnionAndPartyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeUnionAndPartyInfoAsync',
      data
    );
  }

  updateEmployeeAssurTaxBankAccountInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeAssurTaxBankInfoAsync',
      data
    );
  }

  saveEmployeeSkillsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ESkillsBusiness',
      'AddEmployeeSkillInfoAsync',
      data
    );
  }

  //#region HR_Employees

  getModelFormEmploy(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'GetModelFormEmployAsync',
      dataRequest
    );
  }

  getGrossSalary(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'LoadGrossSalaryAsync',
      data
    );
  }

  //#endregion

  //#region EPassportsBusiness
  getEmployeePassportModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'GetEmployeePassportModelAsync'
    );
  }

  GetEmpCurrentPassport(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'GetEmpCrrPassportAsync',
      [empID]
    );
  }

  //#endregion

  //#region EDegrees

  getEmployeeDegreeModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness',
      'GetEmployeeDegreesModelAsync'
    );
  }

  updateEmployeeDegreeInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness',
      'UpdateEmployeeDegreeInfoAsync',
      data
    );
  }

  AddEmployeeDegreeInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness',
      'AddEmployeeDegreeInfoAsync',
      data
    );
  }

  DeleteEmployeeDegreeInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness',
      'DeleteEmployeeDegreeInfoAsync',
      data
    );
  }

  getEDegreesWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness',
      'LoadEDegreesAsync',
      data
    );
  }
  //#endregion

  //#region EVisasBusiness

  getEmployeeVisaModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness',
      'GetEmployeeVisaModelAsync'
    );
  }

  updateEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness',
      'UpdateEmployeeVisasInfoAsync',
      data
    );
  }

  AddEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness',
      'AddEmployeeVisasInfoAsync',
      data
    );
  }

  DeleteEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness',
      'DeleteEmployeeVisaInfoAsync',
      data
    );
  }

  GetEmpCurrentVisa(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness',
      'GetEmpCrrVisaAsync',
      [empID]
    );
  }

  //#endregion

  getEmployeeSkillsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ESkillsBusiness',
      'GetEmployeeSkillInfoAsync',
      data
    );
  }

  getEmployeeDregreesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness',
      'LoadEDegreesAsync',
      data
    );
  }

  //#region HR_ETrainCourses

  getDataETrainDefault() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'GetDataETrainDefaultAsync',
      null
    );
  }

  getEmployeeTrainCourse(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'GetETrainCoursesByEmpIDAsync',
      data
    );
  }

  updateEmployeeTrainCourseInfo(data: any, functionID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'EditETraincourseAsync',
      [data, functionID]
    );
  }

  deleteEmployeeTrainCourseInfo(data: any) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'DeleteETraincourseAsync',
      data
    );
  }

  addETraincourse(data: any, functionID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'AddETraincourseAsync',
      [data, functionID]
    );
  }

  GetEmpCurrentWorkpermit(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'GetEmpCrrWorkPermitAsync',
      [empID]
    );
  }

  getListWorkPermitByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'GetListWorkPermitsByEmployeeIDAsync',
      data
    );
  }
  updateEmployeePassportInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'UpdateEmployeePassportInfoAsync',
      data
    );
  }
  addEmployeePassportInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'AddEmployeePassportInfoAsync',
      data
    );
  }
  DeleteEmployeePassportInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'DeleteEmployeePassportInfoAsync',
      data
    );
  }
  updateEmployeeWorkPermitDetail(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'UpdateEmployeeWorkPermitInfoAsync',
      data
    );
  }

  addEmployeeWorkPermitDetail(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'AddEmployeeWorkPermitInfoAsync',
      data
    );
  }

  DeleteEmployeeWorkPermitInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'DeleteEmployeeWorkPermitInfoAsync',
      data
    );
  }
  //#endregion

  //#region EAwardBusiness
  getEmployeeAwardModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'GetEmployeeAwardModelAsync'
    );
  }

  UpdateEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'UpdateEmployeeAwardInfoAsync',
      data
    );
  }

  AddMultiEAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'AddMultiEmployeeEAwardAsync',
      data
    );
  }

  AddEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'AddEmployeeAwardInfoAsync',
      data
    );
  }

  DeleteEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'DeleteEmployeeAwardInfoAsync',
      data
    );
  }

  getListAwardByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'GetListAwardByDataRequestAsyncLogic',
      data
    );
  }

  validateBeforeReleaseAward(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAwardsBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region EDisciplinesBusiness
  getEmployeeDisciplineModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'GetEmployeeDisciplineModelAsync'
    );
  }

  UpdateEmployeeDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'UpdateEmployeeDisciplineInfoAsync',
      data
    );
  }

  AddMultiEDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'AddMultiEmployeeEDisciplineAsync',
      data
    );
  }

  AddEmployeeDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'AddEmployeeDisciplineInfoAsync',
      data
    );
  }

  DeleteEmployeeDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'DeleteEmployeeDisciplineInfoAsync',
      data
    );
  }

  getListDisciplineByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'GetListDisciplineByDataRequestAsync',
      data
    );
  }

  validateBeforeReleaseDiscipline(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EDisciplinesBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region EAccidentBusiness
  getEmployeeAccidentModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness',
      'GetEmployeeAccidentsModelAsync'
    );
  }

  UpdateEmployeeAccidentInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness',
      'EditEAccidentAsync',
      data
    );
  }

  AddEmployeeAccidentInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness',
      'AddEAccidentAsync',
      data
    );
  }

  DeleteEmployeeAccidentInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness',
      'DeleteEAccidentAsync',
      data
    );
  }

  getListAccidentByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness',
      'LoadDataEAccidentAsync',
      data
    );
  }

  //#endregion

  //#region EDayOffBusiness
  getEmployeeDayOffModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness',
      'GetEmployeeDayOffModelAsync'
    );
  }

  UpdateEmployeeDayOffInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness',
      'UpdateEmployeeDayOffInfoAsync',
      data
    );
  }

  AddEmployeeDayOffInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness',
      'AddEmployeeDayOffInfoAsync',
      data
    );
  }

  DeleteEmployeeDayOffInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness',
      'DeleteEmployeeDayOffInfoAsync',
      data
    );
  }

  getListDayOffByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness',
      'GetListDayOffByDataRequestAsync',
      data
    );
  }

  validateBeforeReleaseDayoff(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EDayOffsBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region EAssetBusiness
  getEmployeeAssetsModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'GetEAssetsModelAsync'
    );
  }

  UpdateEmployeeAssetInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'UpdateEAssetsInfoAsync',
      data
    );
  }

  AddEmployeeAssetInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'AddEAssetsInfoAsync',
      data
    );
  }

  DeleteEmployeeAssetInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'DeleteEAssetsInfoAsync',
      data
    );
  }

  getListAssetByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'GetListAssetsByDataRequestAsync',
      data
    );
  }

  LoadDataEAsset(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'LoadDataEAssetAsync',
      data
    );
  }

  LoadListEAsset(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness',
      'LoadListEAssetAsync',
      data
    );
  }
  //#endregion

  //#region EAppointionsBusiness
  getEmployeeAppointionsInfoById(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'GetOneEmployeeCertificateByEmployeeId',
      data
    );
  }

  getEAppointionsWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'GetListAppointionsByDataRequestAsync',
      data
    );
  }

  getEAppointionsModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'GetEmployeeAppointionsModelAsync'
    );
  }

  AddMultiEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'AddMultiEmployeeEAppointionAsync',
      data
    );
  }

  AddEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'AddEmployeeAppointionsInfoAsync',
      data
    );
  }

  UpdateEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'UpdateEmployeeAppointionsInfoAsync',
      data
    );
  }

  UpdateEmployeeAppointionsInfoCore(data) {
    return this.api.execAction('HR_EAppointions', [data], 'UpdateAsync');
  }

  DeleteEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness',
      'DeleteEmployeeAppointionsInfoAsync',
      data
    );
  }

  // EditEmployeeAppointionsMoreFunc(data: any) {
  //   return this.api.execSv<any>(
  //     'HR',
  //     'ERM.Business.HR',
  //     'EAppointionsBusiness',
  //     'EditEAppointionsMoreFuncAsync',
  //     data
  //   );
  // }

  validateBeforeReleaseAppointion(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAppointionsBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }

  //#endregion

  //#region ECertificateBusiness
  getEmployeeCertificatesInfoById(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'GetOneEmployeeCertificateByEmployeeId',
      data
    );
  }

  getECertificateWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'GetListCertificatesByDataRequestAsync',
      data
    );
  }

  getECertificateModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'GetEmployeeCertificatesModelAsync'
    );
  }

  AddECertificateInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'AddECertificatesAsync',
      data
    );
  }

  UpdateEmployeeCertificateInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'UpdateECertificatesAsync',
      data
    );
  }

  DeleteEmployeeCertificateInfo(recID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'DeleteECertificatesAsync',
      recID
    );
  }

  //#endregion

  //#region EDiseases
  getEmployeeDiseasesModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness',
      'GetEmployeeEdiseasesModelAsync'
    );
  }

  UpdateEmployeeDiseasesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness',
      'EditEDiseaseAsync',
      data
    );
  }

  AddEmployeeDiseasesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness',
      'AddEDiseaseAsync',
      data
    );
  }

  DeleteEmployeeEDiseasesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness',
      'DeleteEmployeeDiseaseInfoAsync',
      data
    );
  }

  getListDiseasesByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness',
      'LoadDataEDiseasesAsync',
      data
    );
  }
  //#endregion

  //#region EFamiliesBusiness
  getFamilyByEmployeeID(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness',
      'GetByEmployeeIDAsync',
      [empID]
    );
  }

  // countEFamilyMembers(empID: string) {
  //   return this.api.execSv<any>(
  //     'HR',
  //     'HR',
  //     'EFamiliesBusiness',
  //     'CountEmpFamilyMemberAsync',
  //     [empID]
  //   );
  // }

  getEFamilyWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness',
      'GetListEFamiliesInfoByDataRequestAsync',
      data
    );
  }

  getEFamilyModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness',
      'GetEmployeeFamilyModelAsync'
    );
  }

  AddEmployeeFamilyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness',
      'AddEmployeeFamilyInfoAsync',
      data
    );
  }

  UpdateEmployeeFamilyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness',
      'UpdateEmployeeFamilyInfoAsync',
      data
    );
  }

  DeleteEmployeeFamilyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness',
      'DeleteEmployeeFamilyInfoAsync',
      data
    );
  }

  //#endregion

  //#region ForeignWorker
  saveEmployeeForeignWorkerInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeForeignWorkerInfoAsync',
      data
    );
  }
  //#endregion

  //#region #EJobSalaries
  GetCurrentJobSalaryByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'GetCurrentJobSalariesByEmployeeIDAsync',
      data
    );
  }

  getListJobSalariesByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'GetListJobSalariesByEmployeeIDAsync',
      data
    );
  }

  DeleteEmployeeJobsalaryInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'DeleteEmployeeJobsalaryInfoAsync',
      data
    );
  }

  GetEmployeeJobSalariesModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'GetEmployeeJobSalaryModelAsync'
    );
  }

  AddEmployeeJobSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'AddEmployeeJobSalaryInfoAsync',
      data
    );
  }

  UpdateEmployeeJobSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'UpdateEmployeeJobSalaryInfoAsync',
      data
    );
  }

  EditEmployeeJobSalariesMoreFunc(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EJobSalariesBusiness',
      'EditEJobSalaryMoreFuncAsync',
      data
    );
  }

  GetOldSalaries(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness',
      'GetOldSalariesAsync',
      data
    );
  }
  //#endregion

  //#region EExperience
  GetExperienceListByEmployeeIDAsync(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness',
      'GetExperiencesByEmpIDAsync',
      data
    );
  }

  GetEmployeeExperienceModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness',
      'GetEmployeeExperienceModel'
    );
  }

  AddEmployeeExperienceInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness',
      'AddEmployeeExperienceInfoAsync',
      data
    );
  }

  UpdateEmployeeExperienceInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness',
      'UpdateEmployeeExperienceInfoAsync',
      data
    );
  }

  DeleteEmployeeExperienceInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness',
      'DeleteEmployeeExperienceInfoAsync',
      data
    );
  }
  //#endregion

  //#region HR_EBasicSalaries
  GetCurrentEBasicSalariesByEmployeeID(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBasicSalariesBusiness',
      'GetEmpCurrentSalariesAsync',
      [empID]
    );
  }

  getListBasicSalariesByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'GetListEBasicSalariesAsync',
      data
    );
  }

  DeleteEmployeeBasicsalaryInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'DeleteEmployeeBasicSalariesInfoAsync',
      data
    );
  }

  GetEmployeeBasicSalariesModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'GetEmployeeBasicSalariesModelAsync'
    );
  }

  AddMultiEmployeeBasicSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'AddMultiEmployeeBasicSalariesInfoAsync',
      data
    );
  }

  AddEmployeeBasicSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'AddEmployeeBasicSalariesInfoAsync',
      data
    );
  }

  UpdateEmployeeBasicSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'UpdateEmployeeBasicSalariesInfoAsync',
      data
    );
  }
  getOldBasicSalary(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness',
      'GetOldBasicSalaryAsync',
      data
    );
  }

  validateBeforeReleaseBasicslaries(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EBasicSalariesBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region HR_EHealths

  loadListDataEHealthsByDatarequest(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness',
      'LoadDataEHealthsAsync',
      dataRequest
    );
  }

  addEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness',
      'AddEHealthAsync',
      [data]
    );
  }

  editEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness',
      'EditEHealthAsync',
      data
    );
  }

  deleteEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness',
      'DeleteEmployeEHealthInfoAsync',
      data
    );
  }

  //#endregion

  //#region HR_EVaccines
  loadDataEVaccine(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness',
      'LoadDataEVaccineAsync',
      dataRequest
    );
  }

  addEVaccine(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness',
      'AddEVaccineAsync',
      [data]
    );
  }

  editEVaccine(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness',
      'EditEVaccineAsync',
      data
    );
  }

  deleteEVaccine(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness',
      'DeleteEVaccineAsync',
      data
    );
  }
  //#endregion

  //#region HR_EDiseases
  loadDataEDisease(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness',
      'LoadDataEDiseaseAsync',
      dataRequest
    );
  }

  addEDisease(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness',
      'AddEDiseaseAsync',
      [data]
    );
  }

  editEDisease(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness',
      'EditEDiseaseAsync',
      data
    );
  }

  deleteEDisease(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness',
      'DeleteEDiseaseAsync',
      data
    );
  }
  //#endregion

  //#region HR_Skills
  loadDataSkill(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness',
      'LoadDataSkillAsync',
      dataRequest
    );
  }

  addSkill(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness',
      'AddSkillAsync',
      [data]
    );
  }

  editSkill(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness',
      'EditSkillAsync',
      data
    );
  }

  deleteSkill(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness',
      'DeleteSkillAsync',
      data
    );
  }
  //#endregion

  //#region HR_SkillGrades
  getEmployeeSkillModel() {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness',
      'getEmployeeSkillModelAsync'
    );
  }

  loadDataSkillGrade(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness',
      'LoadDataSkillGradeAsync',
      dataRequest
    );
  }

  addSkillGrade(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness',
      'AddSkillGradeAsync',
      [data]
    );
  }

  editSkillGrade(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness',
      'EditSkillGradeAsync',
      data
    );
  }

  deleteSkillGrade(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness',
      'DeleteSkillGradeAsync',
      data
    );
  }
  //#endregion

  //#region HR_ESkills
  getViewSkillAsync(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness',
      'GetViewSkillAsync',
      dataRequest
    );
  }

  addESlkillInfo(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness',
      'AddEmployeeSkillInfoAsync',
      [data]
    );
  }

  updateEskillInfo(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness',
      'UpdateEmployeeSkillInfoAsync',
      data
    );
  }

  deleteESkill(recID: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness',
      'DeleteESkillAsync',
      recID
    );
  }
  //#endregion

  getHRDataDefault(funcID: string, entityName: string, idField: string) {
    return this.api.execSv<any>(
      'HR',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName, idField]
    );
  }
  //#region HR_EAccidents
  loadDataEAccident(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness',
      'LoadDataEAccidentAsync',
      dataRequest
    );
  }

  addEAccident(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness',
      'AddEAccidentAsync',
      [data]
    );
  }

  editEAccident(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness',
      'EditEAccidentAsync',
      data
    );
  }

  deleteEAccident(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness',
      'DeleteEAccidentAsync',
      data
    );
  }
  //#endregion

  //#region HR_EContracts
  getEContractQuitFortelDays(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'GetEmpContractQuitFortelDaysAsync',
      data
    );
  }

  getEContractDefault() {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'GetEContractDefaultAsync',
      null
    );
  }

  getCrrEContract(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'GetCrrEContractAsync',
      dataRequest
    );
  }

  loadDataEContract(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'LoadDataEContractAsync',
      data
    );
  }

  addEContract(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'AddEContractAsync',
      data
    );
  }

  validateBeforeSaveContract(data: any, isAddNew: boolean) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'ValidateBeforeSaveAsync',
      [data, isAddNew]
    );
  }

  ValidateBeforeSaveAsync;

  editEContract(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'EditEContractAsync',
      data
    );
  }

  deleteEContract(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'DeleteEContractAsync',
      data
    );
  }

  validateBeforeReleaseContract(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region HR_EBenefit

  GetCurrentBenefit(empID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBenefitsBusiness',
      'GetEmpCurrentBenefitAsync',
      empID
    );
  }

  GetIsCurrentBenefitWithBenefitID(employeeID: string, benefitID: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'GetIsCurrentValDueToBenefitIdAsync',
      [employeeID, benefitID]
    );
  }

  AddEBenefitMultiEmp(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'AddMultiEmployeeEBenefitAsync',
      data
    );
  }

  AddEBenefit(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'AddEBenefitAsync',
      data
    );
  }

  EditEBenefit(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'EditEBenefitAsync',
      data
    );
  }

  DeleteEBenefit(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'DeleteEBenefitAsync',
      data
    );
  }

  EditEmployeeBenefitMoreFunc(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'EditEmployeeBenefitMoreFunc',
      data
    );
  }

  validateBeforeReleaseBenefit(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region HR_EBusinessTravels

  getEBTravelDefaultAsync() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBusinessTravelsBusiness',
      'GetEBTravelDefaultAsync',
      null
    );
  }

  addEBusinessTravelsMultiEmp(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness',
      'AddMultiEmployeeBusinessTravelAsync',
      data
    );
  }

  addEBusinessTravels(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness',
      'AddEBusinessTravelsAsync',
      data
    );
  }

  editEBusinessTravels(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness',
      'EditEBusinessTravelsAsync',
      data
    );
  }

  deleteEBusinessTravels(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness',
      'DeleteEBusinessTravelsAsync',
      data
    );
  }

  EditEBusinessTravelMoreFunc(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness',
      'EditEBusinessTravelMoreFuncAsync',
      data
    );
  }

  validateBeforeReleaseBusiness(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }

  AddEQuit(data: object) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness',
      'AddAsync',
      data
    );
  }
  EditEQuit(data: object) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness',
      'EditAsync',
      data
    );
  }
  DeleteEQuit(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness',
      'DeleteAsync',
      recID
    );
  }

  validateBeforeReleaseEQuit(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }

  //#endregion

  //#region Common
  getFormGroup(formName, gridView, formModel): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        if (gv) {
          var arrgv = Object.values(gv) as any[];
          arrgv = arrgv.sort(function (a: any, b: any) {
            return a.columnOrder - b.columnOrder;
          });
          const group: any = {};
          arrgv.forEach((element) => {
            var keytmp = Util.camelize(element.fieldName);
            var value = null;
            var type = element.dataType.toLowerCase();
            if (type === 'bool') value = false;
            if (type === 'datetime') value = null;
            if (type === 'int' || type === 'decimal') value = 0;
            if (element.isRequire && formModel) {
              if (!value) {
                var field = Util.camelize(element.fieldName);
                if (formModel.fieldRequired == undefined)
                  formModel.fieldRequired = '';

                if (!formModel.fieldRequired)
                  formModel.fieldRequired = field + ';';
                else {
                  if (!formModel.fieldRequired.includes(field))
                    formModel.fieldRequired += field + ';';
                }
              }
            }
            group[keytmp] = element.isRequire
              ? new FormControl(value, Validators.required)
              : new FormControl(value);
          });
          group['updateColumn'] = new FormControl('');
          var formGroup = new FormGroup(group);
          resolve(formGroup);
        }
      });
      // this.cache
      //   .gridViewSetup(formName, gridView)
      //   .subscribe((grvSetup: any) => {
      //     let gv = Util.camelizekeyObj(grvSetup);
      //     var model = {};
      //     model['write'] = [];
      //     model['delete'] = [];
      //     model['assign'] = [];
      //     model['share'] = [];
      //     if (gv) {
      //       const user = this.auth.get();
      //       for (const key in gv) {
      //         const element = gv[key];
      //         element.fieldName = Util.camelize(element.fieldName);
      //         model[element.fieldName] = [];
      //         let modelValidator = [];
      //         if (element.isRequire) {
      //           modelValidator.push(Validators.required);
      //         }
      //         if (element.fieldName == 'email') {
      //           modelValidator.push(Validators.email);
      //         }
      //         if (modelValidator.length > 0) {
      //           model[element.fieldName].push(modelValidator);
      //         }
      //       }
      //       model['write'].push(false);
      //       model['delete'].push(false);
      //       model['assign'].push(false);
      //       model['share'].push(false);
      //     }

      //   });
    });
  }

  getDataDefault(funcID: string, entityName: string, idField: string) {
    return this.api.execSv<any>(
      'HR',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName, idField]
    );
  }

  getFormModel(functionID): Promise<FormModel> {
    return new Promise<FormModel>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var formModel = new FormModel();
        if (funcList) {
          formModel.entityName = funcList.entityName;
          formModel.formName = funcList.formName;
          formModel.gridViewName = funcList.gridViewName;
          formModel.funcID = funcList.functionID;
          formModel.entityPer = funcList.entityPer;

          this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
            this.cache.setGridView(formModel.gridViewName, gridView);
            this.cache
              .gridViewSetup(formModel.formName, formModel.gridViewName)
              .subscribe((gridViewSetup) => {
                this.cache.setGridViewSetup(
                  formModel.formName,
                  formModel.gridViewName,
                  gridViewSetup
                );
                resolve(formModel);
              });
          });
        }
      });
    });
  }

  setCacheFormModel(formModel: FormModel) {
    this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
      this.cache.setGridView(formModel.gridViewName, gridView);
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((gridViewSetup) => {
          this.cache.setGridViewSetup(
            formModel.formName,
            formModel.gridViewName,
            gridViewSetup
          );
        });
    });
  }

  notifyInvalid(formGroup: FormGroup, formModel: FormModel) {
    let gridViewSetup;
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        break;
      }
    }
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);

    this.cache
      .gridViewSetup(formModel.formName, formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          gridViewSetup = res;
          let headerText = gridViewSetup[fieldName]?.headerText ?? fieldName;

          if (fieldName == 'Email' && formGroup.value.email != null) {
            this.notiService.notifyCode('E0003', 0, '"' + headerText + '"');
          } else {
            this.notiService.notifyCode('SYS009', 0, '"' + headerText + '"');
          }
        }
      });
  }

  notifyInvalidFromTo(
    FromDateField: string,
    ToDateField: string,
    formModel: FormModel
  ) {
    let gridViewSetup;
    this.cache
      .gridViewSetup(formModel.formName, formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          gridViewSetup = res;
          let text1 = gridViewSetup[FromDateField]?.headerText ?? FromDateField;
          let text2 = gridViewSetup[ToDateField]?.headerText ?? ToDateField;

          this.notiService.notifyCode(
            'HR003',
            0,
            '"' + text2 + '"',
            '"' + text1 + '"'
          );
        }
      });
  }

  loadDataCbx(service: string, dataRequest: DataRequest = null) {
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataCbxAsync',
      [dataRequest]
    );
  }

  loadData(service: string, dataRequest: DataRequest = null) {
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataAsync',
      [dataRequest]
    );
  }

  getHeaderText(functionID): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      var obj: { [key: string]: any } = {};
      this.cache.functionList(functionID).subscribe((func) => {
        if (func) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((gv) => {
              if (gv) {
                for (const key in gv) {
                  if (Object.prototype.hasOwnProperty.call(gv, key)) {
                    const element = gv[key];
                    // if (element.headerText != null) {
                    obj[key] = element.headerText;
                    // }
                  }
                }
                resolve(obj as object);
              }
            });
        }
      });
    });
  }

  gethHeaderText1(formName, gridView) {
    var obj = {};
    this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
      if (gv) {
        for (const key in gv) {
          if (Object.prototype.hasOwnProperty.call(gv, key)) {
            const element = gv[key];
            if (element.headerText != null) {
              obj[key] = element.headerText;
            }
          }
        }
      }
    });

    return obj;
  }

  checkEmail(email: string) {
    return this.expression.test(email);
  }

  handleShowHideMF(evt, data, formModel) {
    // Kiem tra document co ap dung quy trinh xet duyet hay khong, neu khong thi hide di 1 so more func
    let category = '4';
    let formName = 'HRParameters';
    let recID = '717944fc-7799-43c2-b73d-35986fa00c8b';
    let scheduelID = 'HRAutoResignEContract';

    this.getSettingValue(formName, category).subscribe((res) => {
      if (res) {
        let parsedJSON = JSON.parse(res?.dataValue);
        let index = parsedJSON.findIndex(
          (p) => p.Category == formModel.entityName
        );
        if (index > -1) {
          let typeDocObj = parsedJSON[index];

          if (typeDocObj['ApprovalRule'] === '1') {
            let cancel = evt.find(
              (val) =>
                val.functionID.substr(val.functionID.length - 3) ==
                this.actionUpdateCanceled
            );
            if (cancel) {
              cancel.disabled = true;
            }

            let inprogress = evt.find(
              (val) =>
                val.functionID.substr(val.functionID.length - 3) ==
                this.actionUpdateInProgress
            );
            if (inprogress) {
              inprogress.disabled = true;
            }

            let approve = evt.find(
              (val) =>
                val.functionID.substr(val.functionID.length - 3) ==
                this.actionUpdateApproved
            );
            if (approve) {
              approve.disabled = true;
            }
          }

          if (typeDocObj['ApprovalRule'] === '0') {
            let foundSubmit = evt.find(
              (val) =>
                val.functionID.substr(val.functionID.length - 3) ==
                this.actionSubmit
            );
            if (foundSubmit) {
              foundSubmit.disabled = true;
            }

            let foundCancel = evt.find(
              (val) =>
                val.functionID.substr(val.functionID.length - 3) ==
                this.actionCancelSubmit
            );
            if (foundCancel) {
              foundCancel.disabled = true;
            }
          }
        }
      }
    });

    // this.api
    //   .execSv<any>(
    //     'BG',
    //     'BG',
    //     'ScheduleTasksBusiness',
    //     'GetScheduleTasksByIDAsync',
    //     scheduelID
    //   )
    //   .subscribe((res) => {
    //     console.log(res);
    //   });

    for (let i = 0; i < evt.length; i++) {
      let funcIDStr = evt[i].functionID;
      let IDCompare = funcIDStr.substr(funcIDStr.length - 3);

      if (formModel.funcID === 'HRTPro01') {
        //Propose add new Contract
        if (IDCompare === this.actionAddNew) {
          if (
            data.status === '5' &&
            data.isCurrent === true &&
            data.resignStatus === '1'
          ) {
            evt[i].disabled = false;
          } else {
            evt[i].disabled = true;
          }
        }

        //Resign Contract
        if (
          IDCompare == this.actionCheckResignApprove ||
          IDCompare == this.actionCheckResignCancel
        ) {
          this.api
            .execSv<any>('BG', 'BG', 'ScheduleTasksBusiness', 'GetAsync', recID)
            .subscribe((res) => {
              if (
                res.stop == true &&
                data.status === '5' &&
                data.isCurrent === true
              ) {
                evt[i].disabled = false;
              } else {
                evt[i].disabled = true;
              }
            });
        }

        if (IDCompare === this.actionUpdateClosed) {
          if (data.status !== '5') {
            evt[i].disabled = true;
          } else if (data.status === '5' && data.isCurrent === true) {
            evt[i].disabled = false;
          } else {
            evt[i].disabled = true;
          }
        }
      }

      //Gửi mail
      if (IDCompare === '004') {
        evt[i].disabled = true;
      }

      if (IDCompare === this.actionUpdateRejected) {
        evt[i].disabled = true;
      }

      if (IDCompare === this.actionAddAppendix && data.status !== '5') {
        evt[i].disabled = true;
      }

      if (data.status == '3') {
        switch (IDCompare) {
          case this.actionSubmit:
          case this.actionUpdateInProgress:
          case this.actionEdit:
          case this.actionDelete:
            evt[i].disabled = true;
            break;
        }
      }

      if (
        (data?.status === '9' || data?.status === '0') &&
        IDCompare === this.actionExport
      ) {
        evt[i].disabled = true;
      }

      // if (data.status == '2') {
      //   if (IDCompare === this.actionSubmit) {
      //     evt[i].disabled = false;
      //   }
      //   if (IDCompare === this.actionCancelSubmit) {
      //     evt[i].disabled = false;
      //   }
      //   if (IDCompare === this.actionEdit) {
      //     evt[i].disabled = false;
      //   }
      // }

      // if (IDCompare === this.actionDelete) {
      //   if (data.status == '0' || data.status == '4') {
      //     evt[i].disabled = false;
      //   }
      // }

      // if (IDCompare === this.actionSubmit) {
      //   if (
      //     data.status === '0' ||
      //     data.status === '2' ||
      //     data.status === '4' ||
      //     data.status === '5' ||
      //     data.status === '6' ||
      //     data.status === '9'
      //   ) {
      //     evt[i].disabled = true;
      //   } else {
      //     evt[i].disabled = false;
      //   }
      // }

      if (
        data.status == '0' ||
        data.status == '2' ||
        data.status == '4' ||
        data.status == '5' ||
        data.status == '6' ||
        data.status == '9'
      ) {
        switch (IDCompare) {
          case this.actionSubmit:
          case this.actionUpdateCanceled:
          case this.actionCancelSubmit:
          case this.actionUpdateInProgress:
          case this.actionUpdateApproved:
          case this.actionEdit:
          case this.actionDelete:
            evt[i].disabled = true;
            break;
        }

        if (data.status == '2') {
          if (IDCompare === this.actionSubmit) {
            evt[i].disabled = false;
          }
          if (IDCompare === this.actionCancelSubmit) {
            evt[i].disabled = false;
          }
          if (IDCompare === this.actionEdit) {
            evt[i].disabled = false;
          }
        }

        if (data.status == '0' || data.status == '4') {
          if (IDCompare === this.actionDelete) {
            evt[i].disabled = false;
          }
        }
      }
    }
  }

  handleUpdateRecordStatus(functionID, data) {
    let funcIDRecognize = functionID.substr(functionID.length - 3);
    switch (funcIDRecognize) {
      case this.actionUpdateCanceled:
      case this.actionCancelSubmit:
        data.status = '0';
        break;

      case this.actionUpdateInProgress:
        data.status = '3';
        break;

      // case this.actionUpdateRejected:
      //   data.status = '4';
      //   break;

      case this.actionUpdateApproved:
        data.status = '5';
        break;

      case this.actionUpdateClosed:
        data.status = '9';
        break;

      case this.actionCheckResignApprove:
        data.resignStatus = '1';
        break;

      case this.actionCheckResignCancel:
        data.resignStatus = '2';
        break;
    }
  }

  //#endregion

  getFunctionList(funcID: string) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'FunctionListBusiness',
      'GetByParentAsync',
      [funcID, true]
    );
  }

  getOrgTreeByOrgID(orgID: string, level: number) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetOrgTreeByOrgIDAsync',
      [orgID, level]
    );
  }

  //#region HR_Positions
  getPositionByID(positionID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PositionsBusiness',
      'GetAsync',
      positionID
    );
  }

  //#region HR_OrganizationUnits
  getOrgUnitID(orgID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetOrgUnitID',
      orgID
    );
  }

  //#endregion

  sortAscByProperty(array, property) {
    return array.sort((a, b) => {
      if (a[property] < b[property]) {
        return -1;
      }
      if (a[property] > b[property]) {
        return 1;
      }
      return 0;
    });
  }

  sortDescByProperty(array, property) {
    return array.sort((a, b) => {
      if (a[property] < b[property]) {
        return 1;
      }
      if (a[property] > b[property]) {
        return -1;
      }
      return 0;
    });
  }

  addNew(funcID: string, entityName: string, idField: string) {
    return this.api.execSv<any>(
      'HR',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName, idField]
    );
  }

  copy(dataSelected, formModel: FormModel, idField: string) {
    let dataItem = dataSelected;
    return this.addNew(formModel?.funcID, formModel.entityName, idField).pipe(
      mergeMap((res) => {
        let result = res?.data;
        return this.cache
          .gridViewSetup(formModel.formName!, formModel.gridViewName!)
          .pipe(
            map((grv: any[]) => {
              if (grv) {
                Object.values(grv).forEach((v, i) => {
                  if (v.allowCopy) {
                    let field = this.codxService.capitalize(v.fieldName);
                    result[field] = dataItem[field];
                  }
                });
              }
              return result;
            })
          );
      })
    );
  }

  getCategoryByEntityName(entityName: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetCategoryByEntityNameAsync',
      [entityName]
    );
  }

  getSettingValue(formName: string, category: string) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleWithCategoryAsync',
      [formName, category]
    );
  }

  //Setting value HR
  SaveSettingValue(formName: string, category: string, value: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'SaveSettingValueAsync',
      [formName, category, value]
    );
  }

  GetParameterByHRAsync(formName: string, category: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetParameterByHRAsync',
      [formName, category]
    );
  }

  //#region EAnnualLeave
  getDaysOffByEAnnualLeaveAsync(
    employeeID: string,
    alYear: string,
    alYearMonth: string,
    isMonth: any,
    pageIndex: number,
    pageSize: number
  ) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAnnualLeavesBusiness',
      'GetDaysOffByEAnnualLeaveAsync',
      [employeeID, alYear, alYearMonth, isMonth, pageIndex, pageSize]
    );
  }
  getEmployeeListByPopupCalculateAnnualLeaveAsync(
    alYear: string,
    alObjectIDList: any,
    orgUnitIDList: any,
    employeeIDList: any,
    calculateALBy: string,
    alMonth: string,
    isExcept: boolean = false
  ) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAnnualLeavesBusiness',
      'GetEmployeeListByPopupCalculateAnnualLeaveAsync',
      [
        alYear,
        alObjectIDList,
        orgUnitIDList,
        employeeIDList,
        calculateALBy,
        alMonth,
        isExcept,
      ]
    );
  }
  calculateAnnualLeaveAsync(
    alYear: string,
    alObjectIDList: any,
    orgUnitIDList: any,
    employeeIDList: any,
    calculateALBy: string,
    alMonth: string,
    isExcept: boolean = false
  ) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAnnualLeavesBusiness',
      'CalculateAnnualLeaveAsync',
      [
        alYear,
        alObjectIDList,
        orgUnitIDList,
        employeeIDList,
        calculateALBy,
        alMonth,
        isExcept,
      ]
    );
  }
  getEAnnualLeaveMonthsByEmployeeIDAndALYearAsync(
    employeeID: string,
    alYear: string
  ) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAnnualLeavesBusiness',
      'GetListEmployeeAnnualLeaveMonthAsync',
      [employeeID, alYear]
    );
  }
  //#endregion
}

import { Pipe, PipeTransform } from '@angular/core';
import { mergeMap } from 'rxjs';
import { disableDebugTools } from '@angular/platform-browser';
