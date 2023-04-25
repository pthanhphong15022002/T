import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService } from 'codx-core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxCmService {
  constructor(private api: ApiHttpService, private cache: CacheService) {}

  quickAddContacts(data) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'AddQuickContactAsync',
      data
    );
  }

  getContacts(){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetAsync',
    );
  }

  searchContacts(key: string){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'SearchKeyContactsAsync',
      key
    );
  }

  getOneCustomer(recID, funcID){
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'GetOneAsync',
      [recID, funcID]
    );
  }

  setIsBlackList(recID, isBlacklist){
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'SetIsBlackListCustomerAsync',
      [recID, isBlacklist]
    );
  }

  getContactByObjectID(objectID){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetOneAsync',
      [objectID]
    );
  }

  getListContactByObjectID(objectID){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetListContactByObjectIDAsync',
      [objectID]
    );
  }

  updateContactCrm(recID){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'DeleteContactInCMAsync',
      [recID]
    );
  };

  updateContactByPopupListCt(contact){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'UpdateContactByPopContactsAsync',
      [contact]
    );
  }
  getStepInstance(data){
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepsInstanceByInstanceIDAsync',
      data
    );
  }

  getListAddress(entityName, recID){
    return this.api.exec<any>(
      'BS',
      'AddressBookBusiness',
      'LoadDataAsync',
      [entityName, recID]
    );
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {}
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }

  //#region API For Deal
  getListCustomer(){
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetListCustomersAsync'
    );
  }
  //#endregion

}
