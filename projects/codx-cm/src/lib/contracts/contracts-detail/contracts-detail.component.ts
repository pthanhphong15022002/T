import {
  OnInit,
  Optional,
  Component,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { CM_Contracts, CM_Customers } from '../../models/cm_model';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService} from 'codx-core';

@Component({
  selector: 'contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss'],
})
export class ContractsDetailComponent implements OnInit, OnChanges {
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
  dataTree = [];

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
    { id: 'listTabInformation', name: 'Thông tin hợp đồng', icon: 'icon-info' },
    { id: 'listHistory', name: 'Lịch sử', icon: 'icon-i-clock-history' },
    { id: 'listFile', name: 'Đính kèm', icon: 'icon-i-paperclip' },
    { id: 'listAddTask', name: 'Giao việc', icon: 'icon-i-clipboard-check' },
    { id: 'listApprove', name: 'Ký, duyệt', icon: 'icon-edit-one' },
    { id: 'listLink', name: 'Liên kết', icon: 'icon-i-link' },
  ];
  listTabInformation = [
    { id: 'information', name: 'Thông tin chung' },
    { id: 'fields', name: 'Thông tin mở rộng' },
    { id: 'tasks', name: 'Công việc' },
    { id: 'note', name: 'Ghi chú' },
  ];
  listHistory = [{ id: 'history', name:'Lịch sử'}];
  listFile = [{ id: 'file', name:'Đính kèm'}];
  listAddTask = [{ id: 'addTask', name:'Giao việc'}];
  listApprove = [{ id: 'approve', name:'Ký, duyệt'}];
  listLink = [{ id: 'link', name:'Liên kết'}];
  constructor(
    private cache: CacheService,
    private codxCmService: CodxCmService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
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
  ngOnChanges(changes: SimpleChanges) {
  }

  getContract() {
    if (this.contract) {
      this.getCutomer();
      this.getContact();
      this.getListInstanceStep(this.contract);
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
    if(e == 'listAddTask'){
      this.loadTree(this.contract?.recID);
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
          this.getListInstanceStep(this.contact);
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

  showColumnControl(stepID) {
    // if (this.listStepsProcess?.length > 0) {
    //   var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
    //   if (idx == -1) return 1;
    //   return this.listStepsProcess[idx]?.showColumnControl;
    // }
    return 1;
  }
  saveDataStep(e) {

  }
  fileSave(e) {
    if (e && typeof e === 'object') {
      var createdBy = Array.isArray(e) ? e[0].data.createdBy : e.createdBy;
      this.api
        .execSv<any>('TM', 'TM', 'TaskBusiness', 'AddPermissionFileAsync', [
          this.contract?.recID,
          createdBy,
        ])
        .subscribe();
    }
  }
  loadTree(recID) {
    if (!recID) {
      this.dataTree = [];
      return;
    }
    this.api
      .exec<any>('TM', 'TaskBusiness', 'GetListTaskTreeBySessionIDAsync', recID)
      .subscribe((res) => {
        this.dataTree = res ? res : [];
      });
  }
}
