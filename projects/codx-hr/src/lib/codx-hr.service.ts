import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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


  constructor(private api: ApiHttpService, 
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,
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

  saveEmployeeSelfInfo(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeSelfInfoAsync',
      data
    );
  }

  saveEmployeeContactInfo(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeContactInfoAsync',
      data
    )
  }

  saveEmployeeUnionAndPartyInfo(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeUnionAndPartyInfoAsync',
      data
    )
  }

  saveEmployeeAssurTaxBankAccountInfo(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'UpdateEmployeeAssurTaxBankInfoAsync',
      data
    )
  }

  getEmployeePassportInfo(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'GetEmployeePassportInfoAsync',
      data
    )
  }

  saveEmployeePassportInfo(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EPassportsBusiness',
      'AddEmployeePassportInfoAsync',
      data
    )
  }

}
