import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { AddContractsComponent } from '../add-contracts/add-contracts.component';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { CM_Contracts } from '../../models/cm_model';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { ContractsViewDetailComponent } from '../contracts-view-detail/contracts-view-detail.component';

@Component({
  selector: 'list-contracts',
  templateUrl: './list-contracts.component.html',
  styleUrls: ['./list-contracts.component.scss'],
})
export class ListContractsComponent implements OnInit, OnChanges {
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  //#region Input
  @Input() listContract: CM_Contracts[];
  @Input() customers: any;
  @Input() contactPerson: any;
  @Input() frmModelInstancesTask: FormModel;
  @Input() customersID: string;
  @Input() dealID: string;
  @Input() quotationID: string;
  @Input() type: 'view' | 'deal' | 'quotation' | 'customer';
  @Input() isPause = false;
  @Input() isAddTask = true;

  @Input() funcID: string = 'CM0202';
  @Input() predicates: any; //
  @Input() dataValues: any; //= '
  @Input() customerID: string;
  //#endregion
  account: any;
  customersData: any;
  headerTextTitle = '';
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  projectID: '';
  requestData = new DataRequest();
  dataValuesOld;
  isData = true;

  service = 'CM';
  entityName = 'CM_Contracts';
  className = 'ContractsBusiness';
  assemblyName = 'ERM.Business.CM';
  methodLoadData = 'GetListContractsAsync';

  formModel: FormModel = {
    funcID: 'CM0204',
    formName: 'CMContracts',
    entityPer: 'CM_Contracts',
    entityName: 'CM_Contracts',
    gridViewName: 'grvCMContracts',
  };

  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private stepService: StepService
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.dataValues && this.dataValues != this.dataValuesOld) {
      this.getContracts();
      this.dataValuesOld = this.dataValues;
    }
  }

  async ngOnInit(): Promise<void> {
    this.getAccount();
    this.formModel.entityName = 'CM_Contracts';
    this.formModel.formName = 'CMContracts';
    this.formModel.gridViewName = 'grvCMContracts';
    this.headerTextTitle = await this.stepService.getNameFunctionID('SYS01');
  }

  //#region GetContract
  getContracts() {
    this.requestData.predicates = this.predicates;
    this.requestData.dataValues = this.dataValues;
    this.requestData.entityName = this.entityName;
    this.requestData.funcID = this.funcID;
    this.requestData.pageLoading = false;

    this.fetch().subscribe((res) => {
      this.listContract = res;
      this.isData = this.listContract?.length > 0 ? true : false;
    });
  }

  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.methodLoadData,
        this.requestData
      )
      .pipe(
        finalize(() => {}),
        map((response: any) => {
          return response[0];
        })
      );
  }
  //#endregion

  //#region setData
  setCustomer() {
    let contracts = new CM_Contracts();
    contracts.companyID = this.customersData?.recID;
    contracts.companyName = this.customersData?.customerName;
    contracts.taxCode = this.customersData?.taxCode;
    contracts.address = this.customersData?.address;
    contracts.phone = this.customersData?.phone;
    contracts.faxNo = this.customersData?.faxNo;
    contracts.representative = this.contactPerson?.contactName;
    contracts.jobTitle = this.contactPerson?.jobTitle;
    contracts.bankAccount = this.customersData?.bankAccount;
    contracts.bankID = this.customersData?.bankID;
    return contracts;
  }
  //#endregion

  //#region getData
  getAccount() {
    this.api
      .execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.account = res;
        }
      });
  }

  async getForModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = new FormModel();
    formModel.formName = f?.formName;
    formModel.gridViewName = f?.gridViewName;
    formModel.entityName = f?.entityName;
    formModel.funcID = functionID;
    return formModel;
  }
  //#endregion

  //#region more functions
  changeDataMF(event) {
    if (event != null) {
      event.forEach((res) => {
        switch (res.functionID) {
          case 'CM0204_4':
          case 'CM0204_7':
            res.disabled = true;
            break;
        }
      });
    }
  }

  clickMF(event, contract) {
    this.headerTextTitle = event?.text;
    switch (event.functionID) {
      case 'SYS02': //delete
        this.deleteContract(contract);
        break;
      case 'SYS03': // edit
        this.editContract(contract);
        break;
      case 'SYS04': // copy
        this.copyContract(contract);
        break;
      case 'CM0202_5': // copy
        this.viewContract(contract);
        break;
    }
  }
  //#endregion

  //#region add
  async addContract() {
    let contracts = new CM_Contracts();
    if (this.customersData) {
      contracts = this.setCustomer();
    }
    if (this.type == 'deal') {
      contracts.dealID = this.dataValues;
    }
    if (this.type == 'quotation') {
      contracts.quotationID = this.dataValues;
    }
    if (this.type == 'customer') {
      contracts.customerID = this.dataValues;
    }
    let contractOutput = await this.openPopupContract(null, 'add', contracts);
    if (contractOutput?.event?.contract) {
      if(!this.listContract) this.listContract = [];
      this.listContract.push(contractOutput?.event?.contract);
      this.isData = this.listContract?.length > 0 ? true : false;
    }
  }
  //#endregion

  //#region edit
  async editContract(contract) {
    let dataEdit = JSON.parse(JSON.stringify(contract));
    let dataOutput = await this.openPopupContract(
      this.projectID,
      'edit',
      dataEdit
    );
    let contractOutput = dataOutput?.event?.contract;
    if (contractOutput) {
      let index = this.listContract.findIndex(
        (x) => x.recID == contractOutput?.recID
      );
      if (index >= 0) {
        this.listContract.splice(index, 1, contractOutput);
      }
    }
  }
  //#endregion

  //#region copy
  async copyContract(contract) {
    let dataCopy = JSON.parse(JSON.stringify(contract));
    // let contractOutput = await this.openPopupContract(this.projectID,"copy",dataCopy);
    // if(contractOutput?.event?.contract){
    //   this.listContract.push(contractOutput?.event?.contract);
    // }
  }
  //#endregion

  //#region delete
  deleteContract(contract) {
    if (contract?.recID) {
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.api
            .exec<any>(
              'CM',
              'ContractsBusiness',
              'DeleteContactAsync',
              contract?.recID
            )
            .subscribe((res) => {
              if (res) {
                let index = this.listContract.findIndex(
                  (x) => x.recID == contract.recID
                );
                if (index >= 0) {
                  this.listContract.splice(index, 1);
                }
              }
            });
        }
      });
    }
  }
  //#endregion
  
  //#region open Popup Contract
  async openPopupContract(projectID, action, contract?) {
    let data = {
      projectID,
      action,
      contract: contract || null,
      account: this.account,
      type: this.type,
      actionName: this.headerTextTitle,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    option.FormModel = this.formModel;
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
  //#endregion
  
  //#region vỉew contract
  viewContract(contract){
    var obj = {
      contract,
      formModel: this.formModel,
      isView: true,
    };

    let option = new DialogModel();
    option.zIndex = 1011;
    option.FormModel = this.formModel;
    let dialog = this.callFunc.openForm(
      ContractsViewDetailComponent,
      '',
      1200,
      800,
      '',
      obj,
      '',
      option
    );
  }
  //#endregion
}
