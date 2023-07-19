import {
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import {
  Input,
  Injector,
  OnChanges,
  Component,
  SimpleChanges,
  Optional,
  Output,
  EventEmitter,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContractsService } from '../service-contracts.service';
import { CM_Contracts, CM_ContractsPayments, CM_Quotations, CM_QuotationsLines } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
@Component({
  selector: 'contracts-view-detail',
  templateUrl: './contracts-view-detail.component.html',
  styleUrls: ['./contracts-view-detail.component.scss']
})
export class ContractsViewDetailComponent extends UIComponent implements  OnChanges {
  @Input() contract: CM_Contracts;
  @Input() formModel: FormModel;
  @Input() listInsStepStart = [];

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  dialog: DialogRef;
  isView = false;
  vllStatus = '';
  grvSetup: any;
  tabClicked = '';

  listPaymentHistory: CM_ContractsPayments[] = [];
  listPayment: CM_ContractsPayments[] = [];

  listQuotationsLine: CM_QuotationsLines[];
  quotations: CM_Quotations;
  listInsStep = [];

  account:any;
  listTypeContract = [];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
    { name: 'References', textDefault: 'Liên kết', isActive: false, template: null },
  ];
  fmQuotationLines: FormModel = {
    funcID: 'CM02021',
    formName: 'CMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
  };
  fmQuotations: FormModel = {
    funcID: 'CM02021',
    formName: 'CMQuotations',
    entityName: 'CM_Quotations',
    gridViewName: 'grvCMQuotations',
  };
  isLoading: boolean = true;
  constructor(
    private inject: Injector,
    private contractService: ContractsService,
    private codxCmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.listTypeContract = contractService.listTypeContract;
    if(!this.formModel){
      this.formModel = dt?.data?.formModel;
    }
    if(!this.contract){
      this.contract = dt?.data?.contract;
    }
    this.isView = dt?.data?.isView;
    if(this.isView){
      this.getQuotationsAndQuotationsLinesByTransID(this.contract.quotationID);
      this.getPayMentByContractID(this.contract?.recID);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.contract && this.contract){
      this.getQuotationsAndQuotationsLinesByTransID(this.contract.quotationID);
      this.getPayMentByContractID(this.contract?.recID);
      this.getListInstanceStep(this.contract);
    }
    if(changes?.listInsStepStart && changes?.listInsStepStart?.currentValue){
     this.listInsStep = this.listInsStepStart;
    }
  }
  async onInit(){
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatus = this.grvSetup['Status'].referedValue; 
    this.getAccount();
  }
  changeTab(e){
    this.tabClicked = e;
  }

  getListInstanceStep(contract) {
    var data = [
      contract?.refID,
      contract?.processID,
      contract?.status,
    ];
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      if (res) {
        this.listInsStep = res;    
      }
    });
  }

  changeDataMF(event, data:CM_Contracts) {
    if (event != null) {
      event.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02':
        
        break;
      case 'SYS03':
        
        break;
      case 'SYS04':
        
        break;
      case 'CM0204_4':
        res.disabled = true;
        break;
      case 'CM0204_3'://tạo hợp đồng gia hạn
        if(data?.status == '0'){
          res.disabled = true;
        }
        break;
      case 'CM0204_5'://Đã giao hàng
      if(data?.status == '0'){
        res.disabled = true;
      }
        break;
      case 'CM0204_6'://hoàn tất hợp đồng
        if(data?.status == '0'){
          res.disabled = true;
        }
        break;
      case 'CM0204_1'://Gửi duyệt
        if(data?.status != '0'){
          res.disabled = true;
        }
        break;
      case 'CM0204_2'://Hủy yêu cầu duyệt
        if(data?.status == '0'){
          res.disabled = true;
        }
        break;
        }
      });
    }
  }
  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  getPayMentByContractID(contractID) {
    this.contractService.getPaymentsByContractID(contractID).subscribe((res) => {
      if (res) {
        let listPayAll =  res as CM_ContractsPayments[];
        this.listPayment = listPayAll.filter(pay => pay.lineType == '0');
        this.listPaymentHistory = listPayAll.filter(pay => pay.lineType == '1');
      }else{
        this.listPayment = [];
        this.listPaymentHistory = [];
      }
    });
  }

  getQuotationsAndQuotationsLinesByTransID(recID) {
    this.contractService.getQuotationsLinesByTransID(recID).subscribe((res) => {
      if (res) {
        this.quotations = res[0];
        this.listQuotationsLine = res[1];
      }else{
        this.quotations = null;
        this.listQuotationsLine = [];
      }
    });
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
}
