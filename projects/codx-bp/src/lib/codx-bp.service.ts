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
    //.subscribe((res)=>{ console.log(res)});
  }
}
