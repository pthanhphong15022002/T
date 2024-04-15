import { Injectable, Injector } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LayoutModel } from '@shared/models/layout.model';
import {
  ApiHttpService,
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
  mergeMap,
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
        'PositionsBusiness_Old',
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
      'PositionsBusiness_Old',
      'GetEmployeeListByPosAsync',
      [positionID, _status]
    );
    // return this.api.call('ERM.Business.HR', 'PositionsBusiness_Old', 'GetEmployeeListByPosAsync', [positionID, _status]).pipe(
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
        'PositionsBusiness_Old',
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
        'OrganizationUnitsBusiness_Old',
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
      'EmployeesBusiness_Old',
      'GetEmployeeByEmployeeIDAsync',
      [employeeID]
    );
  }

  saveEmployeeAssureTaxBankInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'UpdateEmployeeAssurTaxBankInfoAsync',
      data
    );
  }

  saveEmployeeSelfInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'UpdateEmployeeSelfInfoAsync',
      data
    );
  }

  SaveEmployeeQuitJobInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'UpdateEmployeeQuitJobInfoAsync',
      data
    );
  }

  saveEmployeeUnionAndPartyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'UpdateEmployeeUnionAndPartyInfoAsync',
      data
    );
  }

  updateEmployeeAssurTaxBankAccountInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'UpdateEmployeeAssurTaxBankInfoAsync',
      data
    );
  }

  saveEmployeeSkillsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ESkillsBusiness_Old',
      'AddEmployeeSkillInfoAsync',
      data
    );
  }

  //#region HR_Employees

  getModelFormEmploy(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness_Old',
      'GetModelFormEmployAsync',
      dataRequest
    );
  }

  getGrossSalary(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness_Old',
      'LoadGrossSalaryAsync',
      data
    );
  }

  //#endregion

  //#region EPassportsBusiness_Old
  getEmployeePassportModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness_Old',
      'GetEmployeePassportModelAsync'
    );
  }

  GetEmpCurrentPassport(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness_Old',
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
      'EDegreesBusiness_Old',
      'GetEmployeeDegreesModelAsync'
    );
  }

  updateEmployeeDegreeInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness_Old',
      'UpdateEmployeeDegreeInfoAsync',
      data
    );
  }

  AddEmployeeDegreeInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness_Old',
      'AddEmployeeDegreeInfoAsync',
      data
    );
  }

  DeleteEmployeeDegreeInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness_Old',
      'DeleteEmployeeDegreeInfoAsync',
      data
    );
  }

  getEDegreesWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness_Old',
      'LoadEDegreesAsync',
      data
    );
  }
  //#endregion

  //#region EVisasBusiness_Old

  getEmployeeVisaModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness_Old',
      'GetEmployeeVisaModelAsync'
    );
  }

  updateEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness_Old',
      'UpdateEmployeeVisasInfoAsync',
      data
    );
  }

  AddEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness_Old',
      'AddEmployeeVisasInfoAsync',
      data
    );
  }

  DeleteEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness_Old',
      'DeleteEmployeeVisaInfoAsync',
      data
    );
  }

  GetEmpCurrentVisa(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EVisasBusiness_Old',
      'GetEmpCrrVisaAsync',
      [empID]
    );
  }

  //#endregion

  getEmployeeSkillsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ESkillsBusiness_Old',
      'GetEmployeeSkillInfoAsync',
      data
    );
  }

  getEmployeeDregreesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDegreesBusiness_Old',
      'LoadEDegreesAsync',
      data
    );
  }

  //#region HR_ETrainCourses

  getDataETrainDefault() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness_Old',
      'GetDataETrainDefaultAsync',
      null
    );
  }

  getEmployeeTrainCourse(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness_Old',
      'GetETrainCoursesByEmpIDAsync',
      data
    );
  }

  updateEmployeeTrainCourseInfo(data: any, functionID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness_Old',
      'EditETraincourseAsync',
      [data, functionID]
    );
  }

  deleteEmployeeTrainCourseInfo(data: any) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness_Old',
      'DeleteETraincourseAsync',
      data
    );
  }

  addETraincourse(data: any, functionID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness_Old',
      'AddETraincourseAsync',
      [data, functionID]
    );
  }

  GetEmpCurrentWorkpermit(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness_Old',
      'GetEmpCrrWorkPermitAsync',
      [empID]
    );
  }

  getListWorkPermitByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness_Old',
      'GetListWorkPermitsByEmployeeIDAsync',
      data
    );
  }
  updateEmployeePassportInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness_Old',
      'UpdateEmployeePassportInfoAsync',
      data
    );
  }
  addEmployeePassportInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness_Old',
      'AddEmployeePassportInfoAsync',
      data
    );
  }
  DeleteEmployeePassportInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness_Old',
      'DeleteEmployeePassportInfoAsync',
      data
    );
  }
  updateEmployeeWorkPermitDetail(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness_Old',
      'UpdateEmployeeWorkPermitInfoAsync',
      data
    );
  }

  addEmployeeWorkPermitDetail(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness_Old',
      'AddEmployeeWorkPermitInfoAsync',
      data
    );
  }

  DeleteEmployeeWorkPermitInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness_Old',
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
      'EAwardsBusiness_Old',
      'GetEmployeeAwardModelAsync'
    );
  }

  UpdateEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness_Old',
      'UpdateEmployeeAwardInfoAsync',
      data
    );
  }

  AddMultiEAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness_Old',
      'AddMultiEmployeeEAwardAsync',
      data
    );
  }

  AddEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness_Old',
      'AddEmployeeAwardInfoAsync',
      data
    );
  }

  DeleteEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness_Old',
      'DeleteEmployeeAwardInfoAsync',
      data
    );
  }

  getListAwardByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness_Old',
      'GetListAwardByDataRequestAsyncLogic',
      data
    );
  }

  validateBeforeReleaseAward(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAwardsBusiness_Old',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region EDisciplinesBusiness_Old
  getEmployeeDisciplineModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness_Old',
      'GetEmployeeDisciplineModelAsync'
    );
  }

  UpdateEmployeeDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness_Old',
      'UpdateEmployeeDisciplineInfoAsync',
      data
    );
  }

  AddMultiEDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness_Old',
      'AddMultiEmployeeEDisciplineAsync',
      data
    );
  }

  AddEmployeeDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness_Old',
      'AddEmployeeDisciplineInfoAsync',
      data
    );
  }

  DeleteEmployeeDisciplineInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness_Old',
      'DeleteEmployeeDisciplineInfoAsync',
      data
    );
  }

  getListDisciplineByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness_Old',
      'GetListDisciplineByDataRequestAsync',
      data
    );
  }

  validateBeforeReleaseDiscipline(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EDisciplinesBusiness_Old',
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
      'EAccidentsBusiness_Old',
      'GetEmployeeAccidentsModelAsync'
    );
  }

  UpdateEmployeeAccidentInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness_Old',
      'EditEAccidentAsync',
      data
    );
  }

  AddEmployeeAccidentInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness_Old',
      'AddEAccidentAsync',
      data
    );
  }

  DeleteEmployeeAccidentInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness_Old',
      'DeleteEAccidentAsync',
      data
    );
  }

  getListAccidentByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAccidentsBusiness_Old',
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
      'EDayOffsBusiness_Old',
      'GetEmployeeDayOffModelAsync'
    );
  }

  UpdateEmployeeDayOffInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness_Old',
      'UpdateEmployeeDayOffInfoAsync',
      data
    );
  }

  AddEmployeeDayOffInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness_Old',
      'AddEmployeeDayOffInfoAsync',
      data
    );
  }

  DeleteEmployeeDayOffInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness_Old',
      'DeleteEmployeeDayOffInfoAsync',
      data
    );
  }

  getListDayOffByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDayOffsBusiness_Old',
      'GetListDayOffByDataRequestAsync',
      data
    );
  }

  validateBeforeReleaseDayoff(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EDayOffsBusiness_Old',
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
      'EAssetsBusiness_Old',
      'GetEAssetsModelAsync'
    );
  }

  UpdateEmployeeAssetInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness_Old',
      'UpdateEAssetsInfoAsync',
      data
    );
  }

  AddEmployeeAssetInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness_Old',
      'AddEAssetsInfoAsync',
      data
    );
  }

  DeleteEmployeeAssetInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness_Old',
      'DeleteEAssetsInfoAsync',
      data
    );
  }

  getListAssetByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness_Old',
      'GetListAssetsByDataRequestAsync',
      data
    );
  }

  LoadDataEAsset(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness_Old',
      'LoadDataEAssetAsync',
      data
    );
  }

  LoadListEAsset(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAssetsBusiness_Old',
      'LoadListEAssetAsync',
      data
    );
  }
  //#endregion

  //#region EAppointionsBusiness_Old
  getEmployeeAppointionsInfoById(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness_Old',
      'GetOneEmployeeCertificateByEmployeeId',
      data
    );
  }

  getEAppointionsWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness_Old',
      'GetListAppointionsByDataRequestAsync',
      data
    );
  }

  getEAppointionsModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness_Old',
      'GetEmployeeAppointionsModelAsync'
    );
  }

  AddMultiEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness_Old',
      'AddMultiEmployeeEAppointionAsync',
      data
    );
  }

  AddEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness_Old',
      'AddEmployeeAppointionsInfoAsync',
      data
    );
  }

  UpdateEmployeeAppointionsInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAppointionsBusiness_Old',
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
      'EAppointionsBusiness_Old',
      'DeleteEmployeeAppointionsInfoAsync',
      data
    );
  }

  // EditEmployeeAppointionsMoreFunc(data: any) {
  //   return this.api.execSv<any>(
  //     'HR',
  //     'ERM.Business.HR',
  //     'EAppointionsBusiness_Old',
  //     'EditEAppointionsMoreFuncAsync',
  //     data
  //   );
  // }

  validateBeforeReleaseAppointion(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EAppointionsBusiness_Old',
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
      'ECertificatesBusiness_Old',
      'GetOneEmployeeCertificateByEmployeeId',
      data
    );
  }

  getECertificateWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness_Old',
      'GetListCertificatesByDataRequestAsync',
      data
    );
  }

  getECertificateModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness_Old',
      'GetEmployeeCertificatesModelAsync'
    );
  }

  AddECertificateInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness_Old',
      'AddECertificatesAsync',
      data
    );
  }

  UpdateEmployeeCertificateInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness_Old',
      'UpdateECertificatesAsync',
      data
    );
  }

  DeleteEmployeeCertificateInfo(recID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness_Old',
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
      'EDiseasesBusiness_Old',
      'GetEmployeeEdiseasesModelAsync'
    );
  }

  UpdateEmployeeDiseasesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness_Old',
      'EditEDiseaseAsync',
      data
    );
  }

  AddEmployeeDiseasesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness_Old',
      'AddEDiseaseAsync',
      data
    );
  }

  DeleteEmployeeEDiseasesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness_Old',
      'DeleteEmployeeDiseaseInfoAsync',
      data
    );
  }

  getListDiseasesByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDiseasesBusiness_Old',
      'LoadDataEDiseasesAsync',
      data
    );
  }
  //#endregion

  //#region EFamiliesBusiness_Old
  getFamilyByEmployeeID(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness_Old',
      'GetByEmployeeIDAsync',
      [empID]
    );
  }

  // countEFamilyMembers(empID: string) {
  //   return this.api.execSv<any>(
  //     'HR',
  //     'HR',
  //     'EFamiliesBusiness_Old',
  //     'CountEmpFamilyMemberAsync',
  //     [empID]
  //   );
  // }

  getEFamilyWithDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness_Old',
      'GetListEFamiliesInfoByDataRequestAsync',
      data
    );
  }

  getEFamilyModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness_Old',
      'GetEmployeeFamilyModelAsync'
    );
  }

  AddEmployeeFamilyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness_Old',
      'AddEmployeeFamilyInfoAsync',
      data
    );
  }

  UpdateEmployeeFamilyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness_Old',
      'UpdateEmployeeFamilyInfoAsync',
      data
    );
  }

  DeleteEmployeeFamilyInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EFamiliesBusiness_Old',
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
      'EmployeesBusiness_Old',
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
      'EJobSalariesBusiness_Old',
      'GetCurrentJobSalariesByEmployeeIDAsync',
      data
    );
  }

  getListJobSalariesByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness_Old',
      'GetListJobSalariesByEmployeeIDAsync',
      data
    );
  }

  DeleteEmployeeJobsalaryInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness_Old',
      'DeleteEmployeeJobsalaryInfoAsync',
      data
    );
  }

  GetEmployeeJobSalariesModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness_Old',
      'GetEmployeeJobSalaryModelAsync'
    );
  }

  AddEmployeeJobSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness_Old',
      'AddEmployeeJobSalaryInfoAsync',
      data
    );
  }

  UpdateEmployeeJobSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness_Old',
      'UpdateEmployeeJobSalaryInfoAsync',
      data
    );
  }

  EditEmployeeJobSalariesMoreFunc(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EJobSalariesBusiness_Old',
      'EditEJobSalaryMoreFuncAsync',
      data
    );
  }

  GetOldSalaries(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EJobSalariesBusiness_Old',
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
      'EExperiencesBusiness_Old',
      'GetExperiencesByEmpIDAsync',
      data
    );
  }

  GetEmployeeExperienceModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness_Old',
      'GetEmployeeExperienceModel'
    );
  }

  AddEmployeeExperienceInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness_Old',
      'AddEmployeeExperienceInfoAsync',
      data
    );
  }

  UpdateEmployeeExperienceInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness_Old',
      'UpdateEmployeeExperienceInfoAsync',
      data
    );
  }

  DeleteEmployeeExperienceInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness_Old',
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
      'EBasicSalariesBusiness_Old',
      'GetEmpCurrentSalariesAsync',
      [empID]
    );
  }

  getListBasicSalariesByDataRequest(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'GetListEBasicSalariesAsync',
      data
    );
  }

  DeleteEmployeeBasicsalaryInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'DeleteEmployeeBasicSalariesInfoAsync',
      data
    );
  }

  GetEmployeeBasicSalariesModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'GetEmployeeBasicSalariesModelAsync'
    );
  }

  AddMultiEmployeeBasicSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'AddMultiEmployeeBasicSalariesInfoAsync',
      data
    );
  }

  AddEmployeeBasicSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'AddEmployeeBasicSalariesInfoAsync',
      data
    );
  }

  UpdateEmployeeBasicSalariesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'UpdateEmployeeBasicSalariesInfoAsync',
      data
    );
  }
  getOldBasicSalary(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EBasicSalariesBusiness_Old',
      'GetOldBasicSalaryAsync',
      data
    );
  }

  validateBeforeReleaseBasicslaries(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EBasicSalariesBusiness_Old',
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
      'EHealthsBusiness_Old',
      'LoadDataEHealthsAsync',
      dataRequest
    );
  }

  addEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness_Old',
      'AddEHealthAsync',
      [data]
    );
  }

  editEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness_Old',
      'EditEHealthAsync',
      data
    );
  }

  deleteEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness_Old',
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
      'EVaccinesBusiness_Old',
      'LoadDataEVaccineAsync',
      dataRequest
    );
  }

  addEVaccine(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness_Old',
      'AddEVaccineAsync',
      [data]
    );
  }

  editEVaccine(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness_Old',
      'EditEVaccineAsync',
      data
    );
  }

  deleteEVaccine(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EVaccinesBusiness_Old',
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
      'EDiseasesBusiness_Old',
      'LoadDataEDiseaseAsync',
      dataRequest
    );
  }

  addEDisease(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness_Old',
      'AddEDiseaseAsync',
      [data]
    );
  }

  editEDisease(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness_Old',
      'EditEDiseaseAsync',
      data
    );
  }

  deleteEDisease(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EDiseasesBusiness_Old',
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
      'SkillsBusiness_Old',
      'LoadDataSkillAsync',
      dataRequest
    );
  }

  addSkill(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness_Old',
      'AddSkillAsync',
      [data]
    );
  }

  editSkill(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness_Old',
      'EditSkillAsync',
      data
    );
  }

  deleteSkill(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillsBusiness_Old',
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
      'SkillGradesBusiness_Old',
      'getEmployeeSkillModelAsync'
    );
  }

  loadDataSkillGrade(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness_Old',
      'LoadDataSkillGradeAsync',
      dataRequest
    );
  }

  addSkillGrade(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness_Old',
      'AddSkillGradeAsync',
      [data]
    );
  }

  editSkillGrade(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness_Old',
      'EditSkillGradeAsync',
      data
    );
  }

  deleteSkillGrade(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'SkillGradesBusiness_Old',
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
      'ESkillsBusiness_Old',
      'GetViewSkillAsync',
      dataRequest
    );
  }

  addESlkillInfo(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness_Old',
      'AddEmployeeSkillInfoAsync',
      [data]
    );
  }

  updateEskillInfo(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness_Old',
      'UpdateEmployeeSkillInfoAsync',
      data
    );
  }

  deleteESkill(recID: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'ESkillsBusiness_Old',
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
      'EAccidentsBusiness_Old',
      'LoadDataEAccidentAsync',
      dataRequest
    );
  }

  addEAccident(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness_Old',
      'AddEAccidentAsync',
      [data]
    );
  }

  editEAccident(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness_Old',
      'EditEAccidentAsync',
      data
    );
  }

  deleteEAccident(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EAccidentsBusiness_Old',
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
      'EContractsBusiness_Old',
      'GetEmpContractQuitFortelDaysAsync',
      data
    );
  }

  getEContractDefault() {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'GetEContractDefaultAsync',
      null
    );
  }

  getCrrEContract(dataRequest: DataRequest) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'GetCrrEContractAsync',
      dataRequest
    );
  }

  loadDataEContract(data) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'LoadDataEContractAsync',
      data
    );
  }

  addEContract(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'AddEContractAsync',
      data
    );
  }

  validateBeforeSaveContract(data: any, isAddNew: boolean) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'ValidateBeforeSaveAsync',
      [data, isAddNew]
    );
  }

  ValidateBeforeSaveAsync;

  editEContract(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'EditEContractAsync',
      data
    );
  }

  deleteEContract(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
      'DeleteEContractAsync',
      data
    );
  }

  validateBeforeReleaseContract(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EContractsBusiness_Old',
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
      'EBenefitsBusiness_Old',
      'GetEmpCurrentBenefitAsync',
      empID
    );
  }

  GetIsCurrentBenefitWithBenefitID(employeeID: string, benefitID: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
      'GetIsCurrentValDueToBenefitIdAsync',
      [employeeID, benefitID]
    );
  }

  AddEBenefitMultiEmp(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
      'AddMultiEmployeeEBenefitAsync',
      data
    );
  }

  AddEBenefit(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
      'AddEBenefitAsync',
      data
    );
  }

  EditEBenefit(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
      'EditEBenefitAsync',
      data
    );
  }

  DeleteEBenefit(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
      'DeleteEBenefitAsync',
      data
    );
  }

  EditEmployeeBenefitMoreFunc(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
      'EditEmployeeBenefitMoreFunc',
      data
    );
  }

  validateBeforeReleaseBenefit(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness_Old',
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
      'EBusinessTravelsBusiness_Old',
      'GetEBTravelDefaultAsync',
      null
    );
  }

  addEBusinessTravelsMultiEmp(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness_Old',
      'AddMultiEmployeeBusinessTravelAsync',
      data
    );
  }

  addEBusinessTravels(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness_Old',
      'AddEBusinessTravelsAsync',
      data
    );
  }

  editEBusinessTravels(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness_Old',
      'EditEBusinessTravelsAsync',
      data
    );
  }

  deleteEBusinessTravels(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness_Old',
      'DeleteEBusinessTravelsAsync',
      data
    );
  }

  EditEBusinessTravelMoreFunc(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness_Old',
      'EditEBusinessTravelMoreFuncAsync',
      data
    );
  }

  validateBeforeReleaseBusiness(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EBusinessTravelsBusiness_Old',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }

  AddEQuit(data: object) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness_Old',
      'AddAsync',
      data
    );
  }
  EditEQuit(data: object) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness_Old',
      'EditAsync',
      data
    );
  }
  DeleteEQuit(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness_Old',
      'DeleteAsync',
      recID
    );
  }

  validateBeforeReleaseEQuit(recID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'EQuitBusiness_Old',
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
      'OrganizationUnitsBusiness_Old',
      'GetOrgTreeByOrgIDAsync',
      [orgID, level]
    );
  }

  //#region HR_Positions
  getPositionByID(positionID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PositionsBusiness_Old',
      'GetAsync',
      positionID
    );
  }

  //#region HR_OrganizationUnits
  getOrgUnitID(orgID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness_Old',
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
      'EAnnualLeavesBusiness_Old',
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
      'EAnnualLeavesBusiness_Old',
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
      'EAnnualLeavesBusiness_Old',
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
      'EAnnualLeavesBusiness_Old',
      'GetListEmployeeAnnualLeaveMonthAsync',
      [employeeID, alYear]
    );
  }

  getProvincesNameByProvincesName2Async(name: string) {
    return this.api.execSv(
      'BS',
      'ERM.Business.BS',
      'ProvincesBusiness',
      'GetProvincesNameByProvincesName2Async',
      [name]
    );
  }
  //#endregion
}
