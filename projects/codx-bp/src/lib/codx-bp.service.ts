import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { DataRequest } from 'codx-core/public-api';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
} from 'rxjs';
import { BP_Processes, tmpInforSentEMail, BP_ProcessPermissions } from './models/BP_Processes.model';

@Injectable({
  providedIn: 'root',
})
export class CodxBpService {
  viewProcesses = new BehaviorSubject<any>(null);
  constructor(private api: ApiHttpService) {}
  public bpProcesses = new BehaviorSubject<BP_Processes>(null);
  isProcess = this.bpProcesses.asObservable();
  getListFunctionMenuCreatedStepAsync(funcID) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'GetListFunctionMenuCreatedStepAsync',
      funcID
    );
  }

  getListProcessSteps(gridModel) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'GetProcessStepsAsync',
      gridModel
    );
  }

  addProcessStep(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'AddProcessStepAsync',
      data
    );
  }
  copyProcessStep(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'CopyProcessStepAsync',
      data
    );
  }
  updateProcessStep(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'UpdateProcessStepAsync',
      data
    );
  }

  updateStepNo(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'UpdateStepNoAsync',
      data
    );
  }
  updateDataDrapDrop(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'UpdateProcessStepWithDropDrapAsync',
      data
    );
  }

  updatePermissionProcess(data){
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'UpdatePermissionProcessAsync',
      data
    )
  }

  getOwnersByParentID(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'GetOwnersByParentIDAsync',
      data
    );
  }
  getProcessesByID(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetProcessesAsync',
      data
    );
  }
  getProcessesByVersion(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetProcessesByVersionAsync',
      data
    );
  }
  getListUserIDByListPositionsID(listPositionID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListPositionsIDAsync',
      listPositionID
    );
  }
  getProcessStepDetailsByRecID(recID) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'GetOwnersByParentIDAsync',
      recID
    );
  }

  setViewRattings(recID: string, ratting: string, comment: string, funcID: string, entityName: string){
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'SetViewRattingAsync',
      [recID, ratting, comment, funcID, entityName]
    );
  }

  loadUserName(id: string){
    return this.api.exec<any>(
      'AD',
      'UsersBusiness',
      'GetAsync',
      id
    );
  }

  loadProcess(id: string){
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetAsync',
      id
    );
  }

  setApproveStatus(recID: string, permission: BP_ProcessPermissions, funcID: string, entity: string){
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'SetAprroveStatusPermissionsAsync',
      [recID, permission, funcID, entity]
    );
  }

  updateHistoryViewProcessesAsync(id: string){
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'UpdateHistoryViewAsync',
      id
    );
  }

  public listTags = new BehaviorSubject<any>(null);
  isListTags = this.listTags.asObservable();

  public ChangeData = new BehaviorSubject<boolean>(null);
  isChangeData = this.ChangeData.asObservable();

  searchDataProcess(gridModel,searchKey): Observable<any> {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetProcessesByKeyAsync',
      [gridModel,searchKey]
    );
  }

  updateRevision(funcID,recID,verNo, verName,comment, entityName, fucntionIdMain ): Observable<any> {
    return this.api
      .execSv<any>('BP', 'BP', 'ProcessesBusiness', 'UpdateVersionAsync', [funcID, recID, verNo, verName, comment,entityName,fucntionIdMain]);
  }

  updateReleaseProcess(data){
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'UpdateReleaseProcess',
      data
    );
  }
  checkAdminOfBP(userId ): Observable<any> {
    return this.api
      .execSv<any>('BP', 'BP', 'ProcessesBusiness', 'CheckAdminPermissionBPAsync', [userId]);
  }

  isCheckExitName(nameProcess: String, id: String):  Observable<any>{
    return this.api
    .execSv<any>('BP', 'BP', 'ProcessesBusiness', 'isExitNameProcessAsync', [nameProcess,id]);
  }

  deleteBin(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'DeleteProcessesBinAsync',
      data
    );
  }
  restoreBinById(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'UpdateDeletedProcessesAsync',
      data
    );
  }
  CheckExitStepName(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessStepsBusiness',
      'CheckExitStepNameAsync',
      data
    );
  }
}
