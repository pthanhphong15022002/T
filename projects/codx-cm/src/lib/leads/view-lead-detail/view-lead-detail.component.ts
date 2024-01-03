import {
  OnInit,
  Optional,
  Component,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts, CM_Customers, CM_Deals, CM_Leads } from '../../models/cm_model';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService} from 'codx-core';
import { ContractsService } from '../../contracts/service-contracts.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'view-lead-detail',
  templateUrl: './view-lead-detail.component.html',
  styleUrls: ['./view-lead-detail.component.scss']
})
export class ViewLeadDetailComponent implements OnInit, OnChanges {
  dialog: DialogRef;
  lead: CM_Leads;
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
  tmpDeal:any;
  gridViewSetupDeal:any;

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

  formModelDeal = {
    formName: 'CMDeals',
    entityName: 'CM_Deals',
    gridViewName: 'grvCMDeals',
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
    this.lead = dt?.data?.dataView;
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
    this.getGridViewSetupDeal();
    this.getTmpDeal();
  }
  ngOnChanges(changes: SimpleChanges) {}

  getContract() {
    if (this.lead) {
      this.getCutomer();
      this.getContact();
      this.getListInstanceStep(this.lead);
      return;
    }
    if (!this.contractRecId) {
      this.dialog.close();
      this.notiService.notify('Không tìm thấy hợp đồng', '3');
      return;
    }
    this.contractService.getContractByRecID(this.contractRecId).subscribe((res) => {
      if (res) {
        this.lead = res;
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
      this.loadTree(this.lead?.recID);
    }
  }

  async getGridViewSetupDeal() {
    this.gridViewSetupDeal = await firstValueFrom(
      this.cache.gridViewSetup(
        this.formModelDeal?.formName,
        this.formModelDeal?.gridViewName
      )
    );
  }

  getListInstanceStep(contract) {
    if (contract?.processID) {
      var data = [contract?.refID, contract?.processID, contract?.status, '1'];
      this.codxCmService.getStepInstance(data).subscribe((res) => {
        if (res) {
          this.listInsStep = res;
        }
      });
    }
  }
  async getTmpDeal() {
    this.codxCmService
      .getOneTmpDeal([this.lead.dealID])
      .subscribe((res) => {
        if (res) {
          this.tmpDeal = res[0];
        } else {
          this.tmpDeal = null;
        }
      });
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
      .getCustomerByRecID(this.lead?.customerID)
      .subscribe((res) => {
        if (res) {
          this.customers = res;
        }
      });
  }
    getContact() {
    if (this.lead?.recID) {
      // let data = [this.lead?.recID,this.lead?.currencyID];
      // this.codxCmService.getViewDetailDealAsync(data).subscribe((res) => {
      //   if (res) {
      //     if(res[0] && res[0].length > 0 ) {
      //         let listContact = res[0];
      //         let contactMain = listContact.filter(x=>x.isDefault)[0];
      //         this.contact = contactMain ? contactMain : null;
      //     }
      //     else {
      //       this.contact = null;
      //     }
      //   }
      // });
    }
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
          this.lead?.recID,
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
