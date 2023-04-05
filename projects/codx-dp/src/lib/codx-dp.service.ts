import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, Util } from 'codx-core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxDpService {
  dataProcess = new BehaviorSubject<any>(null);
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder
  ) {}

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

  GetInstanceByRecID(recID) {
    return this.api.execSv<any>(
      'DP',
      'ERM.Business.DP',
      'InstancesBusiness',
      'GetAsync',
      [recID]
    );
  }

  GetStepsByInstanceIDAsync(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepsByInstanceIDAsync',
      data
    );
  }

  getStepsByInstanceIDAndProcessID(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepsByInstanceIDAndProcessIDAsync',
      data
    );
  }

  GetStepInstance(recID) {
    return this.api.exec<any>('DP', 'InstanceStepsBusiness', 'GetAsync', recID);
  }
  // #step -- nvthuan
  addStep(data) {
    return this.api.exec<any>('DP', 'StepsBusiness', 'AddStepAsync', data);
  }
  editStep(data) {
    return this.api.exec<any>('DP', 'StepsBusiness', 'EditStepAsync', data);
  }

  getStep(data) {
    return this.api.exec<any>('DP', 'StepsBusiness', 'GetStepAsync', data);
  }

  getlistCbxProccess(applyFor: string) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetListCbxProcessesAsync',
      applyFor
    );
  }

  updatePermissionProcess(process) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'UpdatePermissionsProcessAsync',
      process
    );
  }

  createListInstancesStepsByProcess(processID) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'CreateListInstancesStepsByProcessAsync',
      processID
    );
  }
  addInstances(data) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'AddInstanceAsync',
      data
    );
  }
  checkExitsInstancesStep(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'CheckExitsInstancesStep',
      data
    );
  }
  // Instances_Steps_TaskGroups
  addTaskGroups(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddGroupTaskAsync',
      data
    );
  }
  updateTaskGroups(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateGroupTaskAsync',
      data
    );
  }
  deleteTaskGroups(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteGroupTaskAsync',
      data
    );
  }
  addTask(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddTaskAsync',
      data
    );
  }
  updateTask(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateTaskAsync',
      data
    );
  }
  deleteTask(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteTaskAsync',
      data
    );
  }
  deleteFileTask(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'DeleteFilesAsync',
      data
    );
  }
  checkExitsName(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'isExitNameProcessAsync',
      data
    );
  }
  updateDataDrop(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteFilesAsync',
      data
    );
  }
  updateProgressStep(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateProgressStep',
      data
    );
  }
  startInstance(data) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'StartInstanceAsync',
      data
    );
  }

  moveStageByIdInstance(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'MoveStageByIdInstnaceAsync',
      data
    );
  }
  autoMoveStage(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AutoMoveStageAsync',
      data
    );
  }
  moveReasonByIdInstance(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'MoveReasonByIdInstnaceAsync',
      data
    );
  }
  updateListReason(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateReasonStepAsync',
      data
    );
  }
  DeleteListReason(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteReasonStepAsync',
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
    return this.api.exec<any>('DP', 'ProcessesBusiness', 'SetViewRatingAsync', [
      recID,
      ratting,
      comment,
      funcID,
      entityName,
    ]);
  }

  //process
  renameProcess(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'RenameProcessAsync',
      data
    );
  }
  restoreBinById(recID) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'RestoreProcessAsync',
      recID
    );
  }

  getListUserByListOrgUnitIDAsync(lstId, type) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserByListOrgUnitIDAsync',
      [lstId, type]
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

  getUserByID(e) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetAsync',
      e
    );
  }

  getListUserByRoleID(id) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListUserByRoleIDAsync',
      [id]
    );
  }

  getPositionByID(id) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetPositionByUserIDAsync',
      id
    );
  }

  getStepByStepIDAndInID(insID, stepID) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepByStepIDAndInIDAsync',
      [insID, stepID]
    );
  }

  getFirstIntance(processID) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'GetFirstIntanceAsync',
      processID
    );
  }

  getProcess(id) {
    return this.api.exec<any>('DP', 'ProcessesBusiness', 'GetAsync', id);
  }
  getAutoNumberByInstanceNoSetting(instanceNoSetting): Observable<any> {
    return this.api.exec(
      'ERM.Business.AD',
      'AutoNumbersBusiness',
      'CreateAutoNumberAsync',
      [instanceNoSetting, null, true, null]
    );
  }

  getListStepByIdProccessCopy(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetListStepCopyAsync',
      data
    );
  }
  updateFiels(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateInstanceStepFielsByStepIDAsync',
      data
    );
  }
  // getGuide(processID) {
  //   return this.api.exec<any>(
  //     'DP',
  //     'StepsBusiness',
  //     'GetListStepsNameByProcessIDAsync',
  //     processID
  //   );
  // }
  getADAutoNumberByAutoNoCode(autoNoCode): Observable<any> {
    return this.api.execSv(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GetAutoNumberAsync',
      [autoNoCode]
    );
  }

  getListProcessGroups() {
    return this.api.exec<any>('DP', 'ProcessGroupsBusiness', 'GetAsync');
  }

  openOrClosedInstance(recID, check) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'OpenOrClosedInstanceAsync',
      [recID, check]
    );
  }

  countInstanceByProccessId(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'TotalInstanceInProcessAsync',
      data
    );
  }

  getTree(listRef) {
    return this.api.exec<any>(
      'TM',
      'TaskBusiness',
      'GetListTaskTreeByListRefIDAsync',
      listRef
    );
  }

  getProcessByProcessID(processID) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetProcessByProcessIDAsync',
      processID
    );
  }

  getAdminRoleDP(userID){
    return this.api.exec<any>(
      'AD', 'UserRolesBusiness', 'CheckUserRolesAsync',
      [userID, 'DP']
    );
  }
}
