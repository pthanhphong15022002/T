import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogModel, NotificationsService } from 'codx-core';
import { AddContractsComponent } from './add-contracts/add-contracts.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  listTypeContractTask = [
    { name: 'general', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
    { name: 'quotations', textDefault: 'Chi tiết mặt hàng', icon: 'icon-link', isActive: false },
    { name: 'pay', textDefault: 'Thanh toán', icon: 'icon-tune', isActive: false },
    { name: 'ship', textDefault: 'Giao hàng', icon: 'icon-tune', isActive: false },
    { name: 'task', textDefault: 'Công việc', icon: 'icon-more', isActive: false },
  ];
  listTypeContractAdd = [
    { name: 'general', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
    { name: 'quotations', textDefault: 'Chi tiết mặt hàng', icon: 'icon-link', isActive: false },
    { name: 'pay', textDefault: 'Thanh toán', icon: 'icon-tune', isActive: false },
    { name: 'ship', textDefault: 'Giao hàng', icon: 'icon-tune', isActive: false },
  ];
  footerTab = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { template: null, isActive: false, name: 'Comment', textDefault: 'Thảo luận'},
    { template: null, isActive: false, name: 'Attachment', textDefault: 'Đính kèm'},
    { template: null, isActive: false, name: 'Task', textDefault: 'Công việc'},
    { template: null, isActive: false, name: 'Approve', textDefault: 'Ký duyệt'},
    { template: null, isActive: false, name: 'References', textDefault: 'Liên kết'},
    { template: null, isActive: false, name: 'Quotations', textDefault: 'Báo giá'},
    { template: null, isActive: false, name: 'Order', textDefault: 'Đơn hàng'},
  ];
  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
  ) { }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {};
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }

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

  getPaymentsByContractID(contractID) {
    return this.api.exec<any>(
      'CM',
      'ContractsPaymentsBusiness',
      'GetPaymentsByContractIDAsync',
      contractID
    );
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
  //xem xét xóa
  getQuotationsLinesByTransID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetQuotationsLinesByTransIDAsync',
      data
    );
  }
  getQuotationsLinesInContract(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetQuotationsLinesInContractAsync',
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

  updateDelStatus(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'UpdateDelStatusAsync',
      data
    );
  }

  updateStatus(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'UpdateStatusAsync',
      data
    );
  }
  getContractByRefID(data) {
    return this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetContractByRefIDAsync',
      data
    );
  }

  // async loadSetting() {
  //   this.grvSetup = await firstValueFrom(
  //     this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
  //   );
  //   this.vllStatus = this.grvSetup['Status'].referedValue;
  //   //lay grid view
  //   let arrField = Object.values(this.grvSetup).filter((x: any) => x.isVisible);
  //   if (Array.isArray(arrField)) {
  //     this.arrFieldIsVisible = arrField
  //       .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
  //       .map((x: any) => x.fieldName);
  //     this.getColumsGrid(this.grvSetup);
  //   }
  // }

  // getColumsGrid(grvSetup) {
  //   this.columnGrids = [];
  //   this.arrFieldIsVisible.forEach((key) => {
  //     let field = Util.camelize(key);
  //     let template: any;
  //     let colums: any;
  //     switch (key) {
  //       case 'Status':
  //         template = this.templateStatus;
  //         break;
  //       case 'CustomerID':
  //         template = this.templateCustomer;
  //         break;
  //       case 'CreatedBy':
  //         template = this.templateCreatedBy;
  //         break;
  //       case 'TotalTaxAmt':
  //         template = this.templateTotalTaxAmt;
  //         break;
  //       case 'TotalAmt':
  //         template = this.templateTotalAmt;
  //         break;
  //       case 'TotalSalesAmt':
  //         template = this.templateTotalSalesAmt;
  //         break;
  //       default:
  //         break;
  //     }
  //     if (template) {
  //       colums = {
  //         field: field,
  //         headerText: grvSetup[key].headerText,
  //         width: grvSetup[key].width,
  //         template: template,
  //         // textAlign: 'center',
  //       };
  //     } else {
  //       colums = {
  //         field: field,
  //         headerText: grvSetup[key].headerText,
  //         width: grvSetup[key].width,
  //       };
  //     }

  //     this.columnGrids.push(colums);
  //   });
}
