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

  getContacts() {
    return this.api.exec<any>('CM', 'ContactsBusiness', 'GetAsync');
  }

  searchContacts(key: string) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'SearchKeyContactsAsync',
      key
    );
  }

  getOneCustomer(recID, funcID) {
    return this.api.exec<any>('CM', 'CustomersBusiness', 'GetOneAsync', [
      recID,
      funcID,
    ]);
  }

  getNameCbx(recID, objectID) {
    return this.api.exec<any>('CM', 'CustomersBusiness', 'GetNameCbxAsync', [
      recID,
      objectID,
    ]);
  }

  setIsBlackList(recID, isBlacklist) {
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'SetIsBlackListCustomerAsync',
      [recID, isBlacklist]
    );
  }

  getContactByObjectID(objectID) {
    return this.api.exec<any>('CM', 'ContactsBusiness', 'GetOneAsync', [
      objectID,
    ]);
  }

  getListContactByObjectID(objectID) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetListContactByObjectIDAsync',
      [objectID]
    );
  }

  getListDealsByCustomerID(customerID){
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetListDealsByCustomerIDAsync',
      [customerID]
    );
  }

  countDealsByCustomerID(customerID){
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'CountDealsByCustomerIDAsync',
      [customerID]
    );
  }

  updateContactCrm(recID) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'DeleteContactInCMAsync',
      [recID]
    );
  }

  updateContactByPopupListCt(contact) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'UpdateContactByPopContactsAsync',
      [contact]
    );
  }
  getStepInstance(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepsInstanceByInstanceIDAsync',
      data
    );
  }

  getListAddress(entityName, recID) {
    return this.api.exec<any>('BS', 'AddressBookBusiness', 'LoadDataAsync', [
      entityName,
      recID,
    ]);
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {};
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }


  // #region API OF BAO

  // Combox

  getListCbxProcess(data:any) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetListCbxProcessesAsync',
      data
    );
  }

  getInstanceSteps(data:any){
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'CreateListInstancesStepsByProcessAsync',
      data
    );
  }

  addInstance(data:any){
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'AddInstanceAsync',
      data
    );
  }

  getListCbxCampaigns() {
    return this.api.exec<any>(
      'CM',
      'CampaignsBusiness',
      'GetListCbxCampaignsAsync',
    );
  }

  getListCustomer() {
    return this.api.exec<any>('CM', 'CustomersBusiness', 'GetListCustomersAsync');
  }
  getListChannels() {
    return this.api.exec<any>('CM', 'ChannelsBusiness', 'GetListChannelsAsync');
  }
  AddDeal(data) {
    return this.api.exec<any>('CM', 'DealsBusiness', 'AddDealAsync',data);
  }

  // genAutoNumber(funcID: any, entityName: string, key: any) {
  //   return this.api.execSv<any>(
  //     'SYS',
  //     'AD',
  //     'AutoNumbersBusiness',
  //     'GenAutoNumberAsync',
  //     [funcID, entityName, key]
  //   );
  // }
  //#endregion

  //contracts -- nvthuan
  addContracts(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'AddContractsAsync',
      data
    );
  }
  editContracts(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'UpdateContractAsync',
      data
    );
  }
}
