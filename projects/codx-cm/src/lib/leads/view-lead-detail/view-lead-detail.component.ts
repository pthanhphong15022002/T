import {
  OnInit,
  Optional,
  Component,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts, CM_Customers } from '../../models/cm_model';
import { CacheService, DialogData, DialogRef, NotificationsService} from 'codx-core';
import { ContractsService } from '../../contracts/service-contracts.service';

@Component({
  selector: 'view-lead-detail',
  templateUrl: './view-lead-detail.component.html',
  styleUrls: ['./view-lead-detail.component.scss']
})
export class ViewLeadDetailComponent implements OnInit, OnChanges {
  dialog: DialogRef;
  contract: CM_Contracts;
  Customers: CM_Customers;
  listTabRight = [];
  tabRightSelect;
  tabLeftSelect;

  listInsStep;
  listInsStepStart;

  contact;
  contractRecId;
  customers;

  grvSetup;
  vllStatus;
  oCountFooter: any = {};

  formModelCustomer = {
    formName: 'CMCustomers',
    entityName: 'CM_Customers',
    gridViewName: 'grvCMCustomers',
  };
  formModelContact = {
    formName: 'CMContacts',
    entityName: 'CM_Contacts',
    gridViewName: 'grvCMContacts',
  };
 
  listTabLeft = [
    { id: 'listTabInformation', name: 'Thông tin chung', icon: 'icon-info' },
    { id: 'listContanct', name: 'Liên hệ', icon: 'icon-add_to_photos' },
    { id: 'listOpponent', name: 'Đối thủ', icon: 'icon-add_to_photos' },
    { id: 'listTabTask', name: 'Công việc', icon: 'icon-more' },
    { id: 'listTabComment', name: 'Ghi chú', icon: 'icon-sticky_note_2' },
  ];
  listTabInformation = [
    { id: 'customer', name: 'Khách hàng' },
    { id: 'information', name: 'Thông tin hợp đồng' },
    { id: 'purpose', name: 'Mục đích thuê' },
    { id: 'note', name: 'Ghi chú' },
  ];
  listTabTask = [{ id: 'task', name:'Công việc'}];
  listContanct = [{ id: 'task', name:'Liên hệ'}];
  listOpponent = [{ id: 'task', name:'Đối thủ'}];
  listTabComment = [{ id: 'task', name:'Thảo luận'}];
  constructor(
    private cache: CacheService,
    private codxCmService: CodxCmService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.contract = dt?.data?.contract;
    this.contractRecId = dt?.data?.contactRecId;
    this.listInsStepStart = dt?.data?.listInsStepStart;
    if(!this.dialog?.formModel){
      this.dialog.formModel = {
        entityName: "CM_Contracts",
        entityPer: "CM_Contracts",
        formName: "CMContracts",
        funcID:"CM0204",
        gridViewName:"grvCMContracts",
      }
    }
  }
  ngOnInit() {
    this.listTabRight = this.listTabInformation;
    this.tabRightSelect = this.listTabRight[0]?.id;
    this.tabLeftSelect = this.listTabLeft[0];
    this.listInsStep = this.listInsStepStart;
    this.getContract();
    this.cache
      .gridViewSetup('CMContracts', 'grvCMContracts')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
          this.vllStatus = this.grvSetup['Status'].referedValue;
        }
      });
  }
  ngOnChanges(changes: SimpleChanges) {}

  getContract() {
    if (this.contract) {
      this.getCutomer();
      this.getContact();
      return;
    }
    if (!this.contractRecId) {
      this.dialog.close();
      this.notiService.notify('Không tìm thấy hợp đồng', '3');
      return;
    }
    this.contractService.getContractByRecID(this.contractRecId).subscribe((res) => {
      if (res) {
        this.contract = res;
        this.getCutomer();
        this.getContact();
        this.changeDetectorRef.markForCheck();
      } else {
        this.dialog.close(); 
        this.notiService.notify('Không tìm thấy hợp đồng', '3');
      }
    });
  }

  changeTabLeft(e) {
    this.tabLeftSelect = this.listTabLeft.find((x) => x.id == e);
    this.listTabRight = this[e];
    this.tabRightSelect = this.listTabRight[0]?.id;
    if (
      this.tabLeftSelect?.id == 'listTabTask' &&
      this.contract?.applyProcess &&
      this.listInsStep
    ) {
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

  close() {
    this.dialog.close();
  }

  onSectionChange(data: any, index: number = -1) {
    if (index > -1) {
      this.tabRightSelect = this.listTabInformation?.find((x) => x.id == data)?.id;
      this.changeDetectorRef.markForCheck();
    }
  }

  navChange(evt: any, index: number = -1, btnClick) {
    this.tabRightSelect = evt;
    let element = document.getElementById(evt);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.changeDetectorRef.markForCheck();
  }

  getCutomer() {
    this.contractService
      .getCustomerByRecID(this.contract?.customerID)
      .subscribe((res) => {
        if (res) {
          this.customers = res;
        }
      });
  }
  getContact() {
    this.contractService
      .getContactByRecID(this.contract?.contactID)
      .subscribe((res) => {
        if (res) {
          this.contact = res;
        }
      });
  }

  //comment
  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.markForCheck();
  }
}










