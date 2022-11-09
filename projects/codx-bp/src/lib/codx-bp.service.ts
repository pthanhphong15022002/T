import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxBpService {
  viewProcesses = new BehaviorSubject<any>(null);
  constructor(private api: ApiHttpService) {}

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
    return this.api
    .exec<any>('BP', 'ProcessStepsBusiness', 'UpdateProcessStepWithDropDrapAsync', data)
  }
  
  public listTags = new BehaviorSubject<any>(null);
  isListTags = this.listTags.asObservable();

  public ChangeData = new BehaviorSubject<boolean>(null);
  isChangeData = this.ChangeData.asObservable();
}
