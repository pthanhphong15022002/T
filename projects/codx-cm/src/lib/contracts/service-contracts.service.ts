import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogModel, NotificationsService } from 'codx-core';
import { AddContractsComponent } from './add-contracts/add-contracts.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
  ) { }

  async openPopupContract(projectID,action, contract,formModel){
    let data = {
      projectID,
      action,
      contract: contract || null,
    }
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    option.FormModel = formModel;
    let popupContract = this.callFunc.openForm(
      AddContractsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    let dataPopupOutput = await firstValueFrom(popupContract.closed);
    return dataPopupOutput;
  }

  getCustomerBydealID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetCustomerBydealIDAsync',
      data
    );
  }
  getCustomerByRecID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetCustomerByRecIDAsync',
      data
    );
  }
  getQuotationsLinesByTransID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetQuotationsLinesByTransIDAsync',
      data
    );
  }

  getDataByTransID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetDataByTransIDAsync',
      data
    );
  }

}
