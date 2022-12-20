import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataRequest } from '@shared/models/data.request';
import { LayoutModel } from '@shared/models/layout.model';
import { ApiHttpService, AuthStore, CacheService } from 'codx-core';
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

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder
  ) {}
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

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        var model = {};
        model['write'] = [];
        model['delete'] = [];
        model['assign'] = [];
        model['share'] = [];
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            const element = gv[key];
            element.fieldName =
              element.fieldName.charAt(0).toLowerCase() +
              element.fieldName.slice(1);
            model[element.fieldName] = [];
            if (element.fieldName == 'owner') {
              model[element.fieldName].push(user.userID);
            } else if (element.fieldName == 'bUID') {
              model[element.fieldName].push(user['buid']);
            } else if (element.fieldName == 'createdOn') {
              model[element.fieldName].push(new Date());
            } else if (element.fieldName == 'stop') {
              model[element.fieldName].push(false);
            } else if (element.fieldName == 'orgUnitID') {
              model[element.fieldName].push(user['buid']);
            } else if (
              element.dataType == 'Decimal' ||
              element.dataType == 'Int'
            ) {
              model[element.fieldName].push(0);
            } else if (
              element.dataType == 'Bool' ||
              element.dataType == 'Boolean'
            )
              model[element.fieldName].push(false);
            else if (element.fieldName == 'createdBy') {
              model[element.fieldName].push(user.userID);
            } else {
              model[element.fieldName].push(null);
            }

            let modelValidator = [];
            if (element.isRequire) {
              modelValidator.push(Validators.required);
            }
            if (element.fieldName == 'email') {
              modelValidator.push(Validators.email);
            }
            if (modelValidator.length > 0) {
              model[element.fieldName].push(modelValidator);
            }
          }
          model['write'].push(false);
          model['delete'].push(false);
          model['assign'].push(false);
          model['share'].push(false);
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
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

  getMoreFunction(data) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'MoreFunctionsBusiness',
      'GetWithPermAsync',
      data
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

  saveEmployeeSelfInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeSelfInfoAsync',
      data
    );
  }

  saveEmployeeContactInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeContactInfoAsync',
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

  saveEmployeeCertificatesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'AddEmployeeCertificateInfoAsync',
      data
    );
  }

  //#region EPassportsBusiness

  getEmployeePassportModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'GetEmployeePassportModelAsync'
    );
  }

  GetListPassportByEmpID(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'GetListPassportByEmpIDAsync',
      [empID]
    );
  }

  //#endregion

  //#regin EDegrees
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

  //#region EmpVisasBusiness
  getEmployeeVisaModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmpVisasBusiness',
      'GetEmployeeVisaModelAsync'
    );
  }

  updateEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmpVisasBusiness',
      'UpdateEmployeeVisasInfoAsync',
      data
    );
  }

  AddEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmpVisasBusiness',
      'AddEmployeeVisasInfoAsync',
      data
    );
  }

  DeleteEmployeeVisaInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmpVisasBusiness',
      'DeleteEmployeeVisaInfoAsync',
      data
    );
  }

  getListVisaByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmpVisasBusiness',
      'GetListByEmployeeIDAsync',
      data
    );
  }

  //#endregion

  getEmployeeCertificatesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ECertificatesBusiness',
      'GetEmployeeCertificateInfoAsync',
      data
    );
  }

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

  getEmployeeTrainCourse(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'GetEmployeeTrainCoursesInfoAsync',
      data
    );
  }
  //#region EWorkPermitsBusiness
  // getListWorkPermitByEmployeeID(employeeID: string) {
  //   return this.api.execSv<any>(
  //     'HR',
  //     'HR',
  //     'EWorkPermitsBusiness',
  //     'GetListWorkPermitsByEmployeeIDAsync',
  //     [employeeID]
  //   );
  // }

  getListWorkPermitByEmployeeID(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'GetListWorkPermitsByEmployeeIDAsync',
      data
    );
  }

  getEmployeeWorkingLisenceModel() {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EWorkPermitsBusiness',
      'GetEmployeeWorkPermitModelAsync'
    );
  }

  getEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'GetEmployeeAwardInfoAsync',
      data
    );
  }

  getEmployeeDesciplinesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'GetEmployeeDisciplinesInfoAsync',
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

  updateEmployeeTrainCourseInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'ETrainCoursesBusiness',
      'EditEmployeeTraincourseInfoAsync',
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

  updateEmployeeAwardInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EAwardsBusiness',
      'AddEmployeeAwardInfoAsync',
      data
    );
  }

  updateEmployeeDisciplinesInfo(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EDisciplinesBusiness',
      'AddEmployeeDisciplinesInfoAsync',
      data
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
  //#endregion

  //#region EExperience
  GetListByEmployeeIDAsync(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EExperiencesBusiness',
      'GetListByEmployeeIDAsync',
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
      'GetCurrentBasicSalariesByEmployeeIDAsync',
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
  //#endregion

  //#region HR_EBenefits
  GetCurrentBenefit(empID: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EBenefitsBusiness',
      'GetCurrentBenefitAsync',
      [empID]
    );
  }
  //#endregion

  //#region HR_EHealths

  loadDataEHealths(dataRequest: DataRequest) {
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
      'AddEHealthsAsync',
      [data]
    );
  }

  editEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness',
      'EditEHealthsAsync',
      data
    );
  }

  deleteEHealth(data: any) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EHealthsBusiness',
      'DeleteEHealthsAsync',
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
  //#endregion
}
