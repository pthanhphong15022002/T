import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, Util } from 'codx-core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxDpService {
  constructor(private api: ApiHttpService,
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,) {}

  // Gán tạm để show data test
  getUserByProcessId(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetAllUserPermissionAsync',
      data
    );
  }

  onAddProcess(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'AddProcessAsync',
      data
    );
  }

  genAutoNumber(funcID: any, entityName: string, key: any) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GenAutoNumberAsync',
      [funcID, entityName, key]
    );
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache
        .gridViewSetup(formName, gridView)
        .subscribe((grvSetup: any) => {
          let gv = Util.camelizekeyObj(grvSetup);
          var model = {};
          model['write'] = [];
          model['delete'] = [];
          model['assign'] = [];
          model['share'] = [];
          if (gv) {
            const user = this.auth.get();
            for (const key in gv) {
              const element = gv[key];
              element.fieldName = Util.camelize(element.fieldName);
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

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'AutoNumbersBusiness',
        'GenAutoNumberAsync',
        [functionID, entityName, fieldName, null]
      )
      .subscribe((item) => {
        if (item) subject.next(item);
        else subject.next(null);
      });
    return subject.asObservable();
  }

  GetInstanceByRecID(recID){
    return this.api.execSv<any>(
      'DP',
      'ERM.Business.DP',
      'InstancesBusiness',
      'GetAsync',
      [recID]
    );
  }

  GetStepsByInstanceIDAsync(recID){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepsByInstanceIDAsync',
      recID
    );
  }

  GetStepInstance(recID){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetAsync',
      recID
    );
  }
  // #step -- nvthuan
  addStep(data) {
    return this.api.exec<any>(
      'DP',
      'StepsBusiness',
      'AddStepAsync',
      data
    );
  }
  editStep(data) {
    return this.api.exec<any>(
      'DP',
      'StepsBusiness',
      'EditStepAsync',
      data
    );
  }

  getStep(data) {
    return this.api.exec<any>(
      'DP',
      'StepsBusiness',
      'GetStepAsync',
      data
    );
  }

  getlistCbxProccess(applyFor: string){
    return this.api.exec<any>('DP', 'ProcessesBusiness', 'GetListCbxProcessesAsync',applyFor);
  }

  updatePermissionProcess(process){
    return this.api.exec<any>('DP', 'ProcessesBusiness', 'UpdatePermissionsProcessAsync',process);

  }

  createListInstancesStepsByProcess(processID) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'CreateListInstancesStepsByProcessAsync',
      processID
    );
  }
  addInstances(data){
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'AddInstanceAsync',
      data
    );
  }
  // Instances_Steps_TaskGroups
  addTaskGroups(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddGroupTaskAsync',
      data
    );
  }
  updateTaskGroups(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateGroupTaskAsync',
      data
    );
  }
  deleteTaskGroups(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteGroupTaskAsync',
      data
    );
  }
  addTask(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddTaskAsync',
      data
    );
  }
  updateTask(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateTaskAsync',
      data
    );
  }
  deleteTask(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteTaskAsync',
      data
    );
  }
  updateDataDrop(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'updateStepDrapDropAsync',
      data
    );
  }

  moveStageByIdInstance(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'MoveStageByIdInstnaceAsync',
      data
    );
  }
  moveReasonByIdInstance(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'MoveReasonByIdInstnaceAsync',
      data
    );
  }
  updateHistoryViewProcessesAsync(recID: string) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'UpdateHistoryViewAsync',
      recID
    );
  }

  setViewRatings(
    recID: string,
    ratting: string,
    comment: string,
    funcID: string,
    entityName: string
  ) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'SetViewRatingAsync',
      [recID, ratting, comment, funcID, entityName]
    );
  }

  GetListUserIDByListTmpEmpIDAsync(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListTmpEmpIDAsync',
      data
    );
  }

  getListUserIDByListPositionsID(listPositionID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListPositionsIDAsync',
      listPositionID
    );
  }

  getUserByID(e){
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetAsync',
      e
    );
  }
}
