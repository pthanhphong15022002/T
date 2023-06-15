import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  CallFuncService,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { CM_Contracts, CM_ContractsPayments, CM_Quotations, CM_QuotationsLines } from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'contracts-view-detail',
  templateUrl: './contracts-view-detail.component.html',
  styleUrls: ['./contracts-view-detail.component.scss']
})
export class ContractsViewDetailComponent extends UIComponent implements  OnChanges {
  @Input() contract: CM_Contracts;
  @Input() formModel: FormModel;
  vllStatus = '';
  grvSetup: any;
  tabClicked = '';

  listPaymentHistory: CM_ContractsPayments[] = [];
  listPayment: CM_ContractsPayments[] = [];

  listQuotationsLine: CM_QuotationsLines[];
  quotations: CM_Quotations;

  account:any;
  listTypeContract = [];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
    { name: 'References', textDefault: 'Liên kết', isActive: false, template: null },
    // { name: 'Quotations', textDefault: 'Báo giá', isActive: false, template: null },
    // { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
  ];
  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  fmQuotations: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    entityName: 'CM_Quotations',
    funcID: 'CM02021',
  };
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private callFunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDetector: ChangeDetectorRef,
    private cmService: CodxCmService,
    private contractService: ContractsService,
  ) {
    super(inject);
    this.listTypeContract = contractService.listTypeContract;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.contract && this.contract){
      this.getQuotationsAndQuotationsLinesByTransID(this.contract.quotationID);
      this.getPayMentByContractID(this.contract?.recID);
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
    switch (e.functionID) {
      case 'SYS02':
        // this.deleteContract(data);
        break;
      case 'SYS03':
        // this.editContract(data);
        break;
      case 'SYS04':
        // this.copyContract(data);
        break;
      case 'CM0204_3':
        //tạo hợp đồng gia hạn
        // this.addContractAdjourn(data)
        break;
      case 'CM0204_5':
        //Đã giao hàng
        // this.updateDelStatus(data);
        break;
      case 'CM0204_6':
        //hoàn tất hợp đồng
        // this.completedContract(data);
        break;
      case 'CM0204_1':
        //Gửi duyệt
       
        break;
      case 'CM0204_2':
        //Hủy yêu cầu duyệt
       
        break;
    }
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
