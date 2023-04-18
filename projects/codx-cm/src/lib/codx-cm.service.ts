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
      'CustomersBusiness',
      'AddCrmAsync',
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

  updateContactCrm(contact, funcID, recIDCrm, isDelete = false){
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'UpdateContactCrmAsync',
      [contact, funcID, recIDCrm, isDelete]
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

}
