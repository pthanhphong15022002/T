import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { AddContractsComponent } from '../add-contracts/add-contracts.component';
import { firstValueFrom } from 'rxjs';
import { CM_Contracts } from '../../models/cm_model';

@Component({
  selector: 'list-contracts',
  templateUrl: './list-contracts.component.html',
  styleUrls: ['./list-contracts.component.scss']
})
export class ListContractsComponent implements OnInit, OnChanges {
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @Input() listContract: CM_Contracts[];
  @Input() customers: any;
  @Input() contactPerson: any;
  @Input() frmModelInstancesTask: FormModel;
  @Input() customersID: string;
  @Input() dealID: string;
  @Input() quotationID: string;
  dateFomat = 'dd/MM/yyyy';
  account: any;
  customersData:any;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  formModel = new FormModel;
  projectID:'';

  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
  ) {
    
  }

  async ngOnChanges(changes: SimpleChanges) {
    // if(changes.projectID){
    //   this.getContracts(this.projectID); 
    // }
    if(changes.customers){
      this.customersData = this.customers;
    }
  }

  ngOnInit(): void {
    this.cache.functionList('DPT040102').subscribe((res) => {
      if (res) {
        let formModel = new FormModel();
        formModel.formName = res?.formName;
        formModel.gridViewName = res?.gridViewName;
        formModel.entityName = res?.entityName;
        formModel.funcID = 'DPT040102';
        this.frmModelInstancesTask = formModel;
        console.log(this.frmModelInstancesTask);
      }
    });
    this.getAccount();
    this.formModel.entityName = 'CM_Contracts';
    this.formModel.formName = 'CMContracts';
    this.formModel.gridViewName = 'grvCMContracts';
  }


  changeDataMFTask(event){

  }

  clickMF(event, contract){
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
    }
  }

  getContracts(data){
    this.api.exec<any>(
      'CM',
      'ContractsBusiness',
      'GetContractsAsync',
      data
    ).subscribe((e) => {
        this.listContract = e || [];
    })
  }

  setCustomer(){
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

  async addContract(){
    let contracts = new CM_Contracts();
    if(this.customersData){
      contracts = this.setCustomer();
    }
    if(this.dealID){
      contracts.dealID = this.dealID;
    }
    if(this.quotationID){
      contracts.quotationID = this.quotationID;
    }
    let contractOutput = await this.openPopupContract(null, "add",contracts);
    if(contractOutput?.event?.contract){
      this.listContract.push(contractOutput?.event?.contract);
    }
  }

  async editContract(contract){
    let dataEdit = JSON.parse(JSON.stringify(contract));
    let dataOutput = await this.openPopupContract(this.projectID,"edit",dataEdit);
    let contractOutput = dataOutput?.event?.contract;
    if(contractOutput){
      let index = this.listContract.findIndex(x => x.recID == contractOutput?.recID);
      if(index >= 0){
        this.listContract.splice(index, 1, contractOutput);
      }
    }
  }

  async copyContract(contract){
    let dataCopy = JSON.parse(JSON.stringify(contract));
    // let contractOutput = await this.openPopupContract(this.projectID,"copy",dataCopy);
    // if(contractOutput?.event?.contract){
    //   this.listContract.push(contractOutput?.event?.contract);
    // }
  }

  deleteContract(contract){
    if(contract?.recID){
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.api.exec<any>(
            'CM',
            'ContractsBusiness',
            'DeleteContactAsync',
            contract?.recID
          ).subscribe(res => {
            if(res){
              let index = this.listContract.findIndex(x => x.recID==contract.recID);
              if(index >= 0){
                this.listContract.splice(index, 1);
              }
            }
          });
        }
      })
    }
  }

  async openPopupContract(projectID,action, contract?){
    let data = {
      projectID,
      action,
      contract: contract || null,
      account: this.account,
      type:'list'
    }
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

  getAccount(){
    this.api.execSv<any>(
      'SYS',
      'AD',
      'CompanySettingsBusiness',
      'GetAsync'
    ).subscribe(res => {
      console.log(res);
      if(res){
        this.account = res;
      }
    })
  }

  async getForModel  (functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = new FormModel;
    formModel.formName = f?.formName;
    formModel.gridViewName = f?.gridViewName;
    formModel.entityName = f?.entityName;
    formModel.funcID = functionID;
    return formModel;
  }
}
