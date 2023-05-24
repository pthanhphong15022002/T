import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CM_Contacts, CM_Contracts, CM_ContractsPayments, CM_Customers } from '../../models/cm_model';
import { ApiHttpService, AuthStore, CRUDService, CacheService, CallFuncService, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, Util } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Observable, map, tap, firstValueFrom } from 'rxjs';
import { ContractsService } from '../service-contracts.service';
import { PaymentsComponent } from '../component/payments/payments.component';

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
  customer: CM_Customers;
  listQuotationsLine = [];
  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  fmContractsPayments: FormModel = {
    formName: 'CMContractsPayments',
    gridViewName: 'grvCMContractsPayments',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02041 ',
  };
  fmContractsPaymentsHistory: FormModel = {
    formName: 'CMContractsPaymentsHistory',
    gridViewName: 'grvCMContractsPaymentsHistory',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02042  ',
  };

  listPayMent: CM_ContractsPayments[] = [];

  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private cmService: CodxCmService,
    private contractService: ContractsService,
    private changeDetector: ChangeDetectorRef,
    private api: ApiHttpService,
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
    // this.loadComboboxData('CMCustomers','CM').subscribe(data => console.log(data));
    
  }

  loadComboboxData(comboboxName: string, service: string): Observable<any> {
    const dataRequest = new DataRequest();
    dataRequest.comboboxName = comboboxName;
    dataRequest.pageLoading = false;
    return this.api
      .execSv(
        service,
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        [dataRequest]
      )
      .pipe(
        tap((p) => console.log(p)),
        map((p) => JSON.parse(p[0])),
        tap((p) => console.log(p))
      );
  }

  setData(data){
    if(this.action == 'add'){
      this.contracts = data;
      this.contracts.recID = Util.uid();
      this.contracts.projectID = this.projectID;
    }
    if(this.action == 'edit'){
      this.contracts = data;
      this.getQuotationsLinesByTransID(this.contracts.quotationID);
    }
    if(this.action == 'copy'){
      this.contracts = data;
      this.contracts.recID = Util.uid();
      delete this.contracts['id'];
      this.getQuotationsLinesByTransID(this.contracts.quotationID);
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
    if(event?.field == 'dealID' && event?.data){
      this.getCustomerByDealID(event?.data);
    }
    if(event?.field == 'customerID' && event?.data){
      this.getCustomerByrecID(event?.data);
    }
    if(event?.field == 'quotationID' && event?.data){
      this.getDataByTransID(event?.data);
    }
  }

  getCustomerByDealID(dealID){
    this.contractService.getCustomerBydealID(dealID).subscribe(res => {
      if(res){
        this.contracts.customerID = res?.recID;
        this.contracts.taxCode = res?.taxCode;
        this.contracts.address = res?.address;
        this.contracts.phone = res?.phone;
        this.contracts.faxNo = res?.faxNo;
        this.contracts.representative = null;
        this.contracts.jobTitle = null;
        this.contracts.bankAccount = res?.bankAccount;
        this.contracts.bankID = res?.bankID;
      }
    })
  }
  getCustomerByrecID(recID){
    this.contractService.getCustomerByRecID(recID).subscribe(res => {
      if(res){
        this.contracts.customerID = res?.recID;
        this.contracts.taxCode = res?.taxCode;
        this.contracts.address = res?.address;
        this.contracts.phone = res?.phone;
        this.contracts.faxNo = res?.faxNo;
        this.contracts.representative = null;
        this.contracts.jobTitle = null;
        this.contracts.bankAccount = res?.bankAccount;
        this.contracts.bankID = res?.bankID;
      }
    })
  }
  getQuotationsLinesByTransID(recID){
    this.contractService.getQuotationsLinesByTransID(recID).subscribe(res => {
      if(res){      
        this.listQuotationsLine = res;       
      }
    })
  }

  getDataByTransID(recID){
    this.contractService.getDataByTransID(recID).subscribe(res => {
      if(res){
        console.log(res);
        let quotation = res[0];
        let quotationsLine = res[1];
        let customer = res[2] ;

        this.listQuotationsLine = quotationsLine;
        this.contracts.customerID = customer?.recID;
        this.contracts.taxCode = customer?.taxCode;
        this.contracts.address = customer?.address;
        this.contracts.phone = customer?.phone;
        this.contracts.faxNo = customer?.faxNo;
        this.contracts.representative = null;
        this.contracts.jobTitle = null;
        this.contracts.bankAccount = customer?.bankAccount;
        this.contracts.bankID = customer?.bankID;

        this.contracts.dealID = quotation?.refID;
      }
    })
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

  addPay(){
    this.openPopupPay('add', 'pay', null);
  }

  async openPopupPay(action,type,data) {
    let dataInput = {
      action,
      data,
      type,
      contractID: this.contracts?.recID,
    };
    let formModel = new FormModel();
    formModel.entityName = 'CM_ContractsPayments';
    formModel.formName = 'CMContractsPayments';
    formModel.gridViewName = 'grvCMContractsPayments';
    
    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.FormModel = formModel;
    let popupTask = this.callfunc.openForm(
      PaymentsComponent,'',
      600,
      400,
      '',
      dataInput,
      '',
      option,
      );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    if(dataPopupOutput?.event?.action == 'add'){
      this.listPayMent.push(dataPopupOutput?.event?.payment);
    }
    return dataPopupOutput;
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
