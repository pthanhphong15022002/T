import { Customers } from './../../../../../codx-sm/src/lib/models/Customers.model';
import { ChangeDetectorRef, Component, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CacheService, DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { CM_Contracts, CM_Customers } from '../../models/cm_model';

@Component({
  selector: 'contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss']
})
export class ContractsDetailComponent implements OnInit,OnChanges{
  dialog: DialogRef;
  contract: CM_Contracts;
  Customers: CM_Customers;
  listTypeContract;
  tabClicked;
  tabClick;
  listTab = [];
  tabSelect;
  listInsStep;
  listInsStepStart;
  listTabRight = [
    {id:'listTabInformation', name:"Thông tin chung", icon:"icon-info"},
    {id:'listTabTask', name:"Công việc", icon:"icon-more"},
    {id:'listTabComment', name:"Ghi chú", icon:"icon-sticky_note_2"},
  ]

  listTabInformation = [
    {id:'customer', name:"Khách hàng"},
    {id:'information', name:"Thông tin hợp đồng"},
    {id:'purpose', name:"Mục đích thuê"},
    {id:'note', name:"Ghi chú"},
  ]
  listTabTask = [
    {id:'task', name:"Công việc"},
  ]
  listTabComment = [
    {id:'comment', name:"Ghi chú"},
  ]
  formModelCustomer = {
    funcID: "CM0101",
    entityName: "CM_Customers",
    entityPer: "CM_Customers",
    formName: "CMCustomers",
    gridViewName: "grvCMCustomers",
  }
  contactPerson;
  formModelContact: FormModel = {
  formName: 'CMContacts',
  gridViewName: 'grvCMContacts',
  entityName: 'CM_Contacts',
};
  customers;
  contact;
  funcID = 'CM0101';
  grvSetup;
  vllStatus;
  oCountFooter: any = {};
  constructor(
    private contractService: ContractsService,
    private codxCmService: CodxCmService,
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.contract = dt?.data?.contract;
    this.listInsStepStart = dt?.data?.listInsStepStart;
  }
  ngOnInit() {
    this.listTypeContract = this.contractService.listTypeContractTask;
    this.listTab = this.listTabInformation;
    this.tabClick = this.listTab[0]?.id;
    this.tabSelect = this.listTabRight[0];
    this.listInsStep = this.listInsStepStart;
    this.getCutomer();
    this.getContact();
    this.cache.gridViewSetup('CMContracts', 'grvCMContracts').subscribe(res => {
      if(res){
        this.grvSetup = res;
        this.vllStatus = this.grvSetup['Status'].referedValue;
      }
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    
  }

  changeTab(e) {
    this.tabClicked = e;
  }

  changeTabRight(e) {
    this.tabSelect = this.listTabRight.find(x => x.id == e);
    this.listTab = this[e];
    this.tabClick = this.listTab[0]?.id;
    if(this.tabSelect?.id == 'listTabTask' && this.contract?.applyProcess && this.listInsStep){
      this.getListInstanceStep(this.contract);
    }
  }

  getListInstanceStep(contract) {
    if (contract?.processID) {
      var data = [contract?.refID, contract?.processID, contract?.status, '4'];
      this.codxCmService.getStepInstance(data).subscribe((res) => {
        if (res) {
          this.listInsStep = res;
        }
      });
    }
  }

  close(){
    this.dialog.close();
  }

  onSectionChange(data: any, index: number = -1) {
    if (index > -1 ) {
      this.tabClick = this.listTabInformation?.find(x => x.id == data)?.id;
      this.changeDetectorRef.markForCheck();
    }
  }

  navChange(evt: any, index: number = -1, btnClick) {
    this.tabClick = evt;
    let element = document.getElementById(evt);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.changeDetectorRef.markForCheck();
  }

  getCutomer(){
    this.contractService.getCustomerByRecID(this.contract?.customerID).subscribe(res =>{
      if(res){
        this.customers = res;
      }
    })
  }
  getContact(){
    this.contractService.getContactByRecID(this.contract?.contactID).subscribe(res =>{
      if(res){
        this.contact = res;
      }
    })
  }
  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.markForCheck();
  }
}
