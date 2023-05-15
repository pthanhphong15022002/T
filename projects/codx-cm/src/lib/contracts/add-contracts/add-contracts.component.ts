import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CM_Contacts, CM_Contracts } from '../../models/cm_model';
import { AuthStore, CRUDService, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, RequestOption, Util } from 'codx-core';
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
  type: 'view' | 'list';
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private cmService: CodxCmService,
    private changeDetector: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.projectID = dt?.data?.projectID;
    this.action = dt?.data?.action;
    this.contractsInput = dt?.data?.contract;
    this.account = dt?.data?.account;
    this.type = dt?.data?.type;
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
      this.contracts = data;
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

  beforeSave(op: RequestOption) {
    let data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddContractsAsync';
      data = [this.contracts];
    }
    if (this.action == 'edit') {
      op.methodName = 'UpdateContractAsync';
      data = [this.contracts];
    }
    op.data = data;
    return true;
  }

  addContracts(){
    if(this.type == 'view'){
      this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.save) {
          (this.dialog.dataService as CRUDService).update(res.save).subscribe();
          this.dialog.close(res.save);
        } else {
          this.dialog.close();
        }
        // this.changeDetector.detectChanges();
      });
    }else{
       this.cmService.addContracts(this.contracts).subscribe( res => {
      if(res){
          this.dialog.close({ contract: res, action: this.action });
        }
      })
    }
    // console.log(this.contracts);
  }

  editContract(){
    if(this.type == 'view'){
      this.dialog.dataService
    .save((opt: any) => this.beforeSave(opt))
    .subscribe((res) => {
      this.dialog.close({ contract: res, action: this.action }); 
    })
    }else{
      this.cmService.editContracts(this.contracts).subscribe( res => {
      if(res){
        this.dialog.close({ contract: res, action: this.action });
      }
    })
    }
  }
  changeTab(e){
    this.tabClicked = e;
  }
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
}
