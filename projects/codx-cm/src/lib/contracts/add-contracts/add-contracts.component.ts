import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CM_Contacts, CM_Contracts } from '../../models/cm_model';
import { AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'add-contracts',
  templateUrl: './add-contracts.component.html',
  styleUrls: ['./add-contracts.component.scss']
})
export class AddContractsComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;
  contracts: CM_Contracts;
  contractsInput: CM_Contracts;
  dialog!: DialogRef;
  isLoadDate: any;
  action = 'add';
  projectID: string;
  tabClicked  = '';
  listClicked = [];
  account: any;
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.projectID = dt?.data?.projectID;
    this.action = dt?.data?.action;
    this.contractsInput = dt?.data?.contract;
    this.account = dt?.data?.account;
  }
  ngOnInit() {
    this.setData(this.contractsInput);
    this.listClicked = [
      { name: 'general', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
      { name: 'detailItem', textDefault: 'Chi tiết mặt hàng', icon: 'icon-link', isActive: false },
      { name: 'pay', textDefault: 'Phương thức và tiến độ thanh toán', icon: 'icon-tune', isActive: false },
      { name: 'termsAndRelated', textDefault: 'Điều khoản và hồ sơ liên quan', icon: 'icon-tune', isActive: false },
    ]
  }

  setData(data){
    if(this.action == 'add'){
      this.contracts = new CM_Contracts();
      this.contracts.recID = Util.uid();
      this.contracts.projectID = this.projectID;
    }
    if(this.action == 'edit'){
      this.contracts = data;
    }
    if(this.action == 'copy'){
      this.contracts = data;
      this.contracts.recID = Util.uid();
      delete this.contracts['id'];
    }
  }

  valueChangeText(event) {
    try {
      this.contracts[event?.field] = event?.data;
    } catch (error) {
      console.log(error);
       
    }
  }

  valueChangeCombobox(event) {
    this.contracts[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.contracts[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.contracts[event?.field] = new Date(event?.data?.fromDate);
    
    // if(this.isLoadDate){
    //   this.isLoadDate = !this.isLoadDate;
    //   return;
    // }
    // const startDate =  new Date(this.contracts['startDate']);
    // const endDate = new Date(this.contracts['endDate']);
   
    // if (endDate && startDate > endDate){
    //   this.isLoadDate = !this.isLoadDate;
    //   this.notiService.notifyCode('DP019');
    //   return;
    // } 
    // if (new Date(startDate.toLocaleString()).getTime() < new Date(this.startDateParent.toLocaleString()).getTime()) {
    // }

    this.isLoadDate = !this.isLoadDate;
  }
  handleSaveContract(){
    switch (this.action){
      case 'add':
      case 'copy':
        this.addContracts();
        break;
      case 'edit':
        this.editContract();
        break;
    }
  }

  addContracts(){
    this.cmService.addContracts(this.contracts).subscribe( res => {
      if(res){
        this.dialog.close({ contract: res, action: this.action });
      }
    })
  }

  editContract(){
    this.cmService.editContracts(this.contracts).subscribe( res => {
      if(res){
        this.dialog.close({ contract: res, action: this.action });
      }
    })
  }
  changeTab(e){
    this.tabClicked = e;
  }
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
}
