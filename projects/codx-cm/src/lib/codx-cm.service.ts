import { update } from '@syncfusion/ej2-angular-inplace-editor';
import { Injectable } from '@angular/core';
import { LayoutModel } from '@syncfusion/ej2-angular-diagrams';
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
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  map,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxCmService {
  titleAction: any;
  childMenuClick = new BehaviorSubject<any>(null);
  childMenuDefault = new BehaviorSubject<any>(null);
  private loadingSubject = new BehaviorSubject<Boolean>(false);
  valueRadio = this.loadingSubject.asObservable();

  contactSubject = new BehaviorSubject<any>(null);
  // valueContact = this.contactSubject.asObservable();

  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private cache: CacheService,
    private notification: NotificationsService
  ) {}

  openLoadding(): void {
    setTimeout(() => {
      this.loadingSubject.next(true);
    });
  }

  closeLoadding(): void {
    setTimeout(() => {
      this.loadingSubject.next(false);
    });
  }

  quickAddContacts(data) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'AddQuickContactAsync',
      data
    );
  }

  getAvatar(avata) {
    return this.api.exec<any>('DM', 'FileBussiness', 'GetAvatarAsync', [avata]);
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

  getOneCustomer(recID, entityName) {
    return this.api.exec<any>('CM', 'CustomersBusiness', 'GetOneAsync', [
      recID,
      entityName,
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

  updateStatusCustoemr(recID, status) {
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'UpdateStatusCustomerAsync',
      [recID, status]
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
      'GetStepsByInstanceIDAsync',
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
        tap(),
        map((r) => r[0]),
        tap()
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
  copyFileAvata(idOld, idNew, entityName = null) {
    return this.api.exec<any>('DM', 'FileBussiness', 'CoppyFileByIdAsync', [
      idNew,
      idOld,
      'avt',
      entityName,
    ]);
  }

  getListFile(funcID, objectID, objectType, referType) {
    return this.api.exec<any>(
      'DM',
      'FileBussiness',
      'GetFilesForOutsideAsync',
      [funcID, objectID, objectType, referType]
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
  editInstance(data: any) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'EditInstanceAsync',
      data
    );
  }

  addDeal(data: any) {
    return this.api.exec<any>('CM', 'DealsBusiness', 'AddDealAsync', data);
  }
  editDeal(data: any) {
    return this.api.exec<any>('CM', 'DealsBusiness', 'EditDealAsync', data);
  }

  addCases(data: any) {
    return this.api.exec<any>('CM', 'CasesBusiness', 'AddCasesAsync', data);
  }
  editCases(data: any) {
    return this.api.exec<any>('CM', 'CasesBusiness', 'EditCasesAsync', data);
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

  openOrClosedDeal(data: any) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'OpenOrClosedDealAsync',
      data
    );
  }
  openOrClosedCases(data: any) {
    return this.api.exec<any>(
      'CM',
      'CasesBusiness',
      'OpenOrClosedCasesAsync',
      data
    );
  }
  openOrClosedLead(data: any) {
    return this.api.exec<any>(
      'CM',
      'LeadsBusiness',
      'OpenOrClosedLeadAsync',
      data
    );
  }

  getListChannels() {
    return this.api.exec<any>('CM', 'ChannelsBusiness', 'GetListChannelsAsync');
  }
  AddDeal(data) {
    return this.api.exec<any>('CM', 'DealsBusiness', 'AddDealAsync', data);
  }
  getOneTmpDeal(data) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetOneTmpDealAsync',
      data
    );
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

  getOneContactByObjectID(data) {
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetOneContactAsync',
      data
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
  getEmployeesByDomainID(data) {
    return this.api.execSv(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmpByUserIDAsync',
      data
    );
  }
  changeStatus(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'ChangeStatusLeadAsync',
      data
    );
  }
  isExistLeadId(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'IsExitsAutoCodeNumberAsync',
      data
    );
  }
  startDeal(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'StartDealAsync',
      data
    );
  }
  startCases(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'CasesBusiness',
      'StartCasesAsync',
      data
    );
  }
  startLead(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'StartLeadAsync',
      data
    );
  }
  moveStartFirstLead(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'MoveStartFirstLeadAsync',
      data
    );
  }
  startInstance(data) {
    return this.api.execSv<any>(
      'DP',
      'ERM.Business.DP',
      'InstancesBusiness',
      'StartInstanceInDealAsync',
      data
    );
  }
  moveBackStartInstance(data) {
    return this.api.execSv<any>(
      'DP',
      'ERM.Business.DP',
      'InstanceStepsBusiness',
      'MoveBackStartByIdInstnaceAsync',
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

  moveStageCases(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'CasesBusiness',
      'MoveStageCasesAsync',
      data
    );
  }
  moveStageLead(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'MoveStageLeadAsync',
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
  updateLead(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'EditDealAsync',
      data
    );
  }

  confirmOrRefuse(recID: string, check: boolean, returnedCmt: string) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'ConfirmOrRefuseAsync',
      [recID, check, returnedCmt]
    );
  }
  // moveDealReason(data) {
  //   return this.api.execSv<any>(
  //     'CM',
  //     'ERM.Business.CM',
  //     'DealsBusiness',
  //     'MoveDealReasonAsync',
  //     data
  //   );
  // }
  moveDealReason(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'DealsBusiness',
      'MoveDealReasonAsync',
      data
    );
  }

  moveLeadReason(data) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'LeadsBusiness',
      'MoveLeadReasonAsync',
      data
    );
  }

  getIdBusinessLineByProcessID(data) {
    return this.api.exec<any>(
      'CM',
      'BusinessLinesBusiness',
      'GetOneBusinessLineByProcessIDAsync',
      data
    );
  }

  isCheckDealInUse(data) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'isCheckDealInUseAsync',
      data
    );
  }

  autoMoveStageInInstance(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AutoMoveStageAsync',
      data
    );
  }
  autoMoveStageInDeal(data) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'AutoMoveStageDealAsync',
      data
    );
  }

  getListReasonByProcessId(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetListReasonByProcessIdAsync',
      data
    );
  }
  updateListReason(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateReasonStepAsync',
      data
    );
  }
  deleteListReason(data) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'DeleteReasonStepAsync',
      data
    );
  }

  getListProcessDefault(data) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetProcessDefaultAsync',
      data
    );
  }

  getListPermissionOwner(data) {
    return this.api.exec<any>(
      'DP',
      'InstancesBusiness',
      'GetListPermissionInCMAsync',
      data
    );
  }
  updateOwnerLead(data) {
    return this.api.exec<any>(
      'CM',
      'LeadsBusiness',
      'UpdateOwnerLeadAsync',
      data
    );
  }
  updateOwnerDeal(data) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'UpdateOwnerDealAsync',
      data
    );
  }

  getDataTabHistoryDealAsync(data) {
    return this.api.exec<any>(
      'CM',
      'DealsBusiness',
      'GetDataTabHistoryDealAsync',
      data
    );
  }
  getStepByStepIDAndInID(insID, stepID) {
    return this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetStepByStepIDAndInIDAsync',
      [insID, stepID]
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

  getListContractByDealID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetContractsByDealIDAsync',
      data
    );
  }
  getListContractByCustomersID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetContractsByCustomersIDAsync',
      data
    );
  }
  getListContractByQuotationsID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetContractsByQuotationsIDAsync',
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
  getPaymentsByContractID(contractID) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'GetPaymentsByContractIDAsync',
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

  addPaymentsHistory(contracts) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'AddPaymentsHistoryAsync',
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
  getExchangeRate(CurrencyID, day) {
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

  //load data chua xong
  loadDataApproverByID(id, classMame) {
    return this.api.exec<any>('CM', classMame, 'LoadDataApproverByIDAsync', id);
  }
  //
  getProcess(recID) {
    return this.api.exec<any>('DP', 'ProcessesBusiness', 'GetAsync', recID);
  }
  //get
  getDeals(recID) {
    return this.api.exec<any>(
      'CM',
      'QuotationsBusiness',
      'GetDealsByDealIDAsync',
      recID
    );
  }

  updateApproveStatus(className, recID, status) {
    return this.api.exec<any>('CM', className, 'UpdateApproveStatusAsync', [
      recID,
      status,
    ]);
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
  //get trinh ki mac dinh
  getDeafaultCategory(entityName) {
    return this.api.exec<any>(
      'ES',
      'CategoriesBusiness',
      'GetDefaulProcessIDAsync',
      entityName
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

  //check Validate- Không hiểu thì hỏi ?
  checkValidateForm(
    grvSetup,
    model,
    noValidCout,
    ignoredFields: string[] = []
  ) {
    ignoredFields = ignoredFields.map((i) => i.toLowerCase()); ///1 so truogn hợp ko check bên ngoai là bỏ qua
    var keygrid = Object.keys(grvSetup);
    var keymodel = Object.keys(model);
    for (let index = 0; index < keygrid.length; index++) {
      if (grvSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              model[keymodel[i]] === null ||
              String(model[keymodel[i]]).match(/^ *$/) !== null ||
              model[keymodel[i]] == 0 ||
              model[keymodel[i]].trim() == ''
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + grvSetup[keygrid[index]].headerText + '"'
              );
              noValidCout++;
              return noValidCout;
            }
          }
        }
      }
    }
    return noValidCout;
  }

  ///gen AutoNum - Không hiểu thì hỏi ?
  isExitsAutoCodeNumber(className, ID) {
    return this.api.execSv<any>(
      'CM',
      'CM',
      className,
      'IsExitsAutoCodeNumberAsync',
      ID
    );
  }

  getFieldAutoNoDefault(funcID: any, entityName: string) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'AutoNumberDefaultsBusiness',
      'GetFieldAutoNoAsync',
      [funcID, entityName]
    );
  }

  genAutoNumberDefault(funcID: any, entityName: string, key: any) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GenAutoNumberAsync',
      [funcID, entityName, key]
    );
  }

  genAutoNumberByAutoNoCode(autoNoCode): Observable<any> {
    return this.api.exec(
      'ERM.Business.AD',
      'AutoNumbersBusiness',
      'CreateAutoNumberAsync',
      [autoNoCode, null, true, null]
    );
  }
  //end

  //gettree by sessionID
  getTreeBySessionID(recID) {
    return this.api.exec<any>(
      'TM',
      'TaskBusiness',
      'GetListTaskTreeBySessionIDAsync',
      recID
    );
  }

  getProcessDefault(applyFor) {
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'GetProcessDefaultAsync',
      applyFor
    );
  }

  getProcessByBusinessLineID(bussinessID) {
    return this.api.exec<any>(
      'CM',
      'BusinessLinesBusiness',
      'GetProcessByBussinessIDAsync',
      bussinessID
    );
  }

  //#region target and targetLines
  getTargetAndLinesAsync(bussinessID, year) {
    return this.api.exec<any>(
      'CM',
      'TargetsBusiness',
      'GetTargetAndLinesAsync',
      [bussinessID, year]
    );
  }
  //#region

  getOneObject(recID, className) {
    return this.api.exec<any>('CM', className, 'GetOneAsync', recID);
  }
}
