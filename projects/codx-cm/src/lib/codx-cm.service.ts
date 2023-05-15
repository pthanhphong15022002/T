import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';
import { Observable, Subject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxCmService {
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private notification: NotificationsService
  ) {}

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

  getListDealsByCustomerID(customerID) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetListDealsByCustomerIDAsync',
      [customerID]
    );
  }

  countDealsByCustomerID(customerID) {
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

  getDealCompetitors(dealID) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetListDealCompetitorsAsync',
      [dealID]
    );
  }

  checkCustomerIDByDealsAsync(customerID) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'CheckCustomerIDByDealsAsync',
      [customerID]
    );
  }

  addDealCompetitor(dealCompetitor) {
    return this.api.exec<any>('CM', 'DealsBusiness', 'AddDealCompetitorAsync', [
      dealCompetitor,
    ]);
  }

  updateDealCompetitorAsync(dealCompetitor) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'UpdateDealCompetitorAsync',
      [dealCompetitor]
    );
  }

  deleteDealCompetitorAsync(recID) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'DeleteDealCompetitorAsync',
      [recID]
    );
  }

  getListAddressByListID(lstID) {
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'GetListAddressByListIDAsync',
      [lstID]
    );
  }

  getListDealAndDealCompetitor(competitorID) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetListDealAndDealCompetitorAsync',
      [competitorID]
    );
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

  loadList(data, list = [], action) {
    var listTmp = [];
    if (list != null && list.length > 0) {
      listTmp = list;
      var index = listTmp.findIndex((x) => x.recID == data.recID);
      if (action != 'delete') {
        if (index != -1) {
          listTmp[index] = data;
        } else {
          listTmp.push(Object.assign({}, data));
        }
      } else {
        listTmp.splice(index, 1);
      }
    } else {
      listTmp.push(Object.assign({}, data));
    }

    return listTmp;
  }

  checkValidate(gridViewSetup, data, count = 0) {
    var countValidate = count;
    var keygrid = Object.keys(gridViewSetup);
    var keymodel = Object.keys(data);
    for (let index = 0; index < keygrid.length; index++) {
      if (gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              data[keymodel[i]] == null ||
              String(data[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + gridViewSetup[keygrid[index]].headerText + '"'
              );
              countValidate++;
              return countValidate;
            }
          }
        }
      }
    }
    return countValidate;
  }

  getAutonumber(functionID, entityName, fieldName): Observable<any> {
    var subject = new Subject<any>();
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'AutoNumbersBusiness',
        'GenAutoNumberAsync',
        [functionID, entityName, fieldName]
      )
      .subscribe((item) => {
        if (item) subject.next(item);
        else subject.next(null);
      });
    return subject.asObservable();
  }

  // #region API OF BAO

  // Combox

  getListCbxProcess(data: any) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetListCbxProcessesAsync',
      data
    );
  }

  getInstancesByListID(lstIns) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'GetListInstanceByLstIDAsync',
      [lstIns]
    );
  }

  getStepsByListID(lstStepIDs, lstInsID) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetListStepsByLstIDAsync',
      [lstStepIDs, lstInsID]
    );
  }

  getInstanceSteps(data: any) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'GetInstanceStepById',
      data
    );
  }

  addInstance(data: any) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'AddInstanceAsync',
      data
    );
  }
  editInstance(data:any){
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'EditInstanceAsync',
      data
    );
  }

  getListCbxCampaigns() {
    return this.api.exec<any>(
      'CM',
      'CampaignsBusiness',
      'GetListCbxCampaignsAsync'
    );
  }

  getListCustomer() {
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'GetListCustomersAsync'
    );
  }
  getListChannels() {
    return this.api.exec<any>('CM', 'ChannelsBusiness', 'GetListChannelsAsync');
  }
  AddDeal(data) {
    return this.api.exec<any>('CM', 'DealsBusiness', 'AddDealAsync', data);
  }
  async getListUserByOrg(list = []) {
    var lstOrg = [];
    if (list != null && list.length > 0) {
      var userOrgID = list
        .filter((x) => x.objectType == 'O')
        .map((x) => x.objectID);
      if (userOrgID != null && userOrgID.length > 0) {
        let o = await firstValueFrom(
          this.getListUserByListOrgUnitIDAsync(userOrgID, 'O')
        );
        if (o != null && o.length > 0) {
          if (lstOrg != null && lstOrg.length > 0) {
            lstOrg = this.getUserArray(lstOrg, o);
          } else {
            lstOrg = o;
          }
        }
      }
      var userDepartmentID = list
        .filter((x) => x.objectType == 'D')
        .map((x) => x.objectID);

      if (userDepartmentID != null && userDepartmentID.length > 0) {
        let d = await firstValueFrom(
          this.getListUserByListOrgUnitIDAsync(userDepartmentID, 'D')
        );
        if (d != null && d.length > 0) {
          if (lstOrg != null && lstOrg.length > 0) {
            lstOrg = this.getUserArray(lstOrg, d);
          } else {
            lstOrg = d;
          }
        }
      }
      var userPositionID = list
        .filter((x) => x.objectType == 'P')
        .map((x) => x.objectID);
      if (userPositionID != null && userPositionID.length > 0) {
        let p = await firstValueFrom(
          this.getListUserByListOrgUnitIDAsync(userPositionID, 'P')
        );
        if (p != null && p.length > 0) {
          if (lstOrg != null && lstOrg.length > 0) {
            lstOrg = this.getUserArray(lstOrg, p);
          } else {
            lstOrg = p;
          }
        }
      }

      var userRoleID = list
        .filter((x) => x.objectType == 'R')
        .map((x) => x.objectID);
      if (userRoleID != null && userRoleID.length > 0) {
        let r = await firstValueFrom(this.getListUserByRoleID(userRoleID));
        if (r != null && r.length > 0) {
          if (lstOrg != null && lstOrg.length > 0) {
            lstOrg = this.getUserArray(lstOrg, r);
          } else {
            lstOrg = r;
          }
        }
      }
      var lstUser = list.filter(
        (x) => x.objectType == 'U' || x.objectType == '1'
      );
      if (lstUser != null && lstUser.length > 0) {
        var tmpList = [];
        lstUser.forEach((element) => {
          var tmp = {};
          if (element != null) {
            tmp['userID'] = element.objectID;
            tmp['userName'] = element.objectName;
            tmpList.push(tmp);
          }
        });
        if (tmpList != null && tmpList.length > 0) {
          lstOrg = this.getUserArray(lstOrg, tmpList);
        }
      }
    }
    return lstOrg;
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
  getUserArray(arr1, arr2) {
    const arr3 = arr1.concat(arr2).reduce((acc, current) => {
      const duplicateIndex = acc.findIndex(
        (el) => el.userID === current.userID
      );
      if (duplicateIndex === -1) {
        acc.push(current);
      } else {
        acc[duplicateIndex] = current;
      }
      return acc;
    }, []);
    return arr3;
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
  getListContactByCustomerID(data) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetListContactByCusomerIDAsync',
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
 //quotation lines test
  getQuotationsLinesByTransID(transID){
    return this.api.exec<any>(
      'CM',
      'QuotationsLinesBusiness',
      'GetQuotationsLinesByTransIDAsync',
      transID
    );
  }
}
