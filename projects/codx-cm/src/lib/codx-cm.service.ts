import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  DataRequest,
  ResourceModel,
} from 'codx-core';
import { PopupSelectTempletComponent } from 'projects/codx-dp/src/lib/instances/popup-select-templet/popup-select-templet.component';
import { Observable, Subject, firstValueFrom, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxCmService {
  titleAction: any;
  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
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

  countDealCompetiorsByCompetitorID(competitorID) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'CountCompetitorByDealCompetitorAsync',
      [competitorID]
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

  addCompetitorByName(name) {
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'AddCompetitorByDealCompetitorAsync',
      [name]
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

  updateStatusDealsCompetitorAsync(dealCompetitor) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'UpdateStatusDealsCompetitorAsync',
      [dealCompetitor]
    );
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

  addOneAddress(address) {
    return this.api.exec<any>('BS', 'AddressBookBusiness', 'AddAdressAsync', [
      address,
    ]);
  }

  updateOneAddress(address) {
    return this.api.exec<any>(
      'BS',
      'AddressBookBusiness',
      'UpdateAdressAsync',
      [address]
    );
  }

  deleteOneAddress(recID) {
    return this.api.exec<any>(
      'BS',
      'AddressBookBusiness',
      'DeleteAdressAsync',
      [recID]
    );
  }

  getAdressNameByIsDefault(id, entityName) {
    return this.api.exec<any>(
      'BS',
      'AddressBookBusiness',
      'GetAdressNameByIsDefaultAsync',
      [id, entityName]
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

  bringDefaultContactToFront(data) {
    const defaultContactIndex = data.findIndex((data) => data.isDefault);

    if (defaultContactIndex !== -1) {
      const defaultContact = data[defaultContactIndex];
      data.splice(defaultContactIndex, 1);
      data.unshift(defaultContact);
    }

    return data;
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

  loadDataAsync(service: string, options: DataRequest): Observable<any[]> {
    return this.api
      .execSv(
        service,
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataAsync',
        options
      )
      .pipe(
        tap((r) => console.log(r)),
        map((r) => r[0]),
        tap((r) => console.log(r))
      );
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
  // getInstanceStepsByMoveStages(data: any) {
  //   return this.api.exec<any>(
  //     'DP',
  //     'InstancesBusiness',
  //     'MoveStageInDealAsync',
  //     data
  //   );
  // }

  addInstance(data: any) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'AddInstanceAsync',
      data
    );
  }
  editInstance(data: any) {
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

  openOrClosedDeal(data:any) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'OpenOrClosedDealAsync',
      data
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
  // API for More in deal

  startDeal(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'StartDealAsync',
      data
    );
  }
  moveStageDeal(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'MoveStageDealAsync',
      data
    );
  }

  updateDeal(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'EditDealAsync',
      data
    );
  }
  moveDealReason(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'MoveDealReasonAsync',
      data
    );
  }

  //#endregion -- Bao

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
  getQuotationsLinesByTransID(transID) {
    return this.api.exec<any>(
      'CM',
      'QuotationsLinesBusiness',
      'GetQuotationsLinesByTransIDAsync',
      transID
    );
  }
  getPaymentsByContract(contractID) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'GetPaymentsAsync',
      contractID
    );
  }
  addPayments(contracts) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'AddPaymentsAsync',
      contracts
    );
  }
  editPayments(contracts) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'UpdatePaymentsAsync',
      contracts
    );
  }
  deletePayments(contractsID) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'DeletePaymentsAsync',
      contractsID
    );
  }

  // -----QuotationLine-----
  // loadItem
  getItem(itemID) {
    return this.api.exec<any>('IV', 'ItemsBusiness', 'LoadDataAsync', itemID);
  }

  // load Tỉ giá
  getExchangeRate(CurrencyID,day ) {
    return this.api.exec<any>(
      'BS',
      'CurrenciesBusiness',
      'GetExchangeRateAsync',
      [CurrencyID, day]
    );
  }

  //getDefault
  getDefault(service, funcID, entityName) {
    return this.api.execSv<any>(
      service,
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName]
    );
  }
  //trinh ký
  getESCategoryByCategoryID(categoryID) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'CategoriesBusiness',
      'GetByCategoryIDAsync',
      categoryID
    );
  }

  /// cance trifnh ki
  cancelSubmit(recID, entityName) {
    return this.api.execSv(
      'CM',
      'ERM.Business.Core',
      'DataBusiness',
      'CancelAsync',
      [recID, '', entityName]
    );
  }

  updateStatusQuotatitons(data) {
    return this.api.exec<any>(
      'CM',
      'QuotationsBusiness',
      'UpdateStatusQuotatitonsByRecIDAsync',
      data
    );
  }
  ///xuat file
  getDataExportByRecIDAsync(procesID) {
    return this.api.exec<any>(
      'CM',
      'QuotationsBusiness',
      'GetDataExportByRecIDAsync',
      procesID
    );
  }
  //check trinfh ki
  checkApprovalStep(recID) {
    return this.api.exec<any>(
      'ES',
      'ApprovalStepsBusiness',
      'CheckApprovalStepByTranIDAsync',
      recID
    );
  }
  //get data instance
  getDataInstance(recID) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'GetInstanceByRecIDAsync',
      recID
    );
  }

  //xuất file - hàm chung
  exportFile(dt, titleAction) {
    this.getDataInstance(dt.refID).subscribe((res) => {
      if (res) {
        let option = new DialogModel();
        option.zIndex = 1001;
        let formModel = new FormModel();

        formModel.entityName = 'DP_Instances';
        formModel.formName = 'DPInstances';
        formModel.gridViewName = 'grvDPInstances';
        formModel.funcID = 'DPT04';

        let obj = {
          data: res,
          formModel: formModel,
          isFormExport: true,
          refID: dt.processID,
          refType: 'DP_Processes',
          titleAction: titleAction,
          loaded: false,
        };
        let dialogTemplate = this.callfc.openForm(
          PopupSelectTempletComponent,
          '',
          600,
          500,
          '',
          obj,
          '',
          option
        );
      }
    });
  }
}
