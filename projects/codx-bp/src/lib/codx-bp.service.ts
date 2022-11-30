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
import { BP_Processes, tmpInforSentEMail } from './models/BP_Processes.model';

@Injectable({
  providedIn: 'root',
})
export class CodxBpService {
  viewProcesses = new BehaviorSubject<any>(null);
  constructor(private api: ApiHttpService) {}
  public bpProcesses = new BehaviorSubject<BP_Processes>(null);
  isFileEditing = this.bpProcesses.asObservable();
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
  getProcessesByVersionNo(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetProcessesByprocessNoAsync',
      data
    );
  }
  GetProcessStepDetailsByRecID(recID) {
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
}
