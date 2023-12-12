import {
  OnInit,
  Optional,
  Component,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts, CM_Customers, CM_Deals } from '../../models/cm_model';
import { CacheService, DialogData, DialogRef, NotificationsService} from 'codx-core';
import { ContractsService } from '../../contracts/service-contracts.service';

@Component({
  selector: 'view-deal-detail',
  templateUrl: './view-deal-detail.component.html',
  styleUrls: ['./view-deal-detail.component.scss']
})
export class ViewDealDetailComponent implements OnInit, OnChanges {
  dialog: DialogRef;
  deal: CM_Deals;
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
    { id: 'information', name: 'Thông tin cơ hội' },
    { id: 'purpose', name: 'Trường nhập liệu' },
    { id: 'note', name: 'Nhu cầu' },
  ];
  listTabTask = [{ id: 'task', name:'Công việc'}];
  listTabComment = [{ id: 'task', name:'Thảo luận'}];
  listContanct = [{ id: 'task', name:'Liên hệ'}];
  listOpponent = [{ id: 'task', name:'Đối thủ'}];
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
    this.deal = dt?.data?.contract;
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
    if (this.deal) {
      this.getCutomer();
      this.getContact();
      this.getListInstanceStep(this.deal)
      return;
    }
    if (!this.contractRecId) {
      this.dialog.close();
      this.notiService.notify('Không tìm thấy hợp đồng', '3');
      return;
    }
    this.contractService.getContractByRecID(this.contractRecId).subscribe((res) => {
      if (res) {
        this.deal = res;
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
  }

  getListInstanceStep(deal) {
    if (deal?.processID) {
      var data = [deal?.refID, deal?.processID, deal?.status, '1'];
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
      .getCustomerByRecID(this.deal?.customerID)
      .subscribe((res) => {
        if (res) {
          this.customers = res;
        }
      });
  }
  getContact() {
    if (this.deal?.recID) {
      let data = [this.deal?.recID,this.deal?.customerCategory];
      this.codxCmService.getViewDetailDealAsync(data).subscribe((res) => {
        if (res) {
          if(res[0] && res[0].length > 0 ) {
              let listContact = res[0];
              let contactMain = listContact.filter(x=>x.isDefault)[0];
              this.contact = contactMain ? contactMain : null;
          }
          else {
            this.contact = null;
          }
        }
      });
    }
  }

  //comment
  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.markForCheck();
  }

}






