import { DialogData, DialogRef, FormModel, UIComponent } from 'codx-core';
import {
  Input,
  Injector,
  OnChanges,
  Component,
  SimpleChanges,
  Optional,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContractsService } from '../service-contracts.service';
import {
  CM_Contracts,
  CM_ContractsPayments,
  CM_Quotations,
  CM_QuotationsLines,
} from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
@Component({
  selector: 'contracts-view-detail',
  templateUrl: './contracts-view-detail.component.html',
  styleUrls: ['./contracts-view-detail.component.scss'],
})
export class ContractsViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @Input() contract: CM_Contracts;
  @Input() formModel: FormModel;
  @Input() listInsStepStart = [];
  @ViewChild('quotationsTab') quotationsTab: TemplateRef<any>;

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @Output() changeProgress = new EventEmitter<any>();
  @Output() isSusscess = new EventEmitter<any>();
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

  account: any;
  listTypeContract = [];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      template: null,
    },
    {
      name: 'AssignTo',
      textDefault: 'Giao việc',
      isActive: false,
      template: null,
    },
    {
      name: 'Approve',
      textDefault: 'Ký duyệt',
      isActive: false,
      template: null,
    },
    // {
    //   name: 'References',
    //   textDefault: 'Liên kết',
    //   isActive: false,
    //   template: null,
    // },
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
    this.listTypeContract = [];
    if (!this.formModel) {
      this.formModel = dt?.data?.formModel;
    }
    if (!this.contract) {
      this.contract = dt?.data?.contract;
    }
    this.isView = dt?.data?.isView;
    if (this.isView) {
      this.getQuotationsAndQuotationsLinesByTransID(this.contract.quotationID);
      this.getPayMentByContractID(this.contract?.recID);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.loadTabs();
    if (changes?.contract && this.contract) {
      this.getQuotationsAndQuotationsLinesByTransID(this.contract?.quotationID);
      this.getPayMentByContractID(this.contract?.recID);
      if (this.contract?.applyProcess) {
        this.getListInstanceStep(this.contract);
        this.listTypeContract = this.contractService.listTypeContract;
      } else {
        this.listTypeContract = this.contractService.listTypeContractNoTask;
      }
    }
    if (changes?.listInsStepStart && changes?.listInsStepStart?.currentValue) {
      this.listInsStep = this.listInsStepStart;
    }
  }
  async onInit() {
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatus = this.grvSetup['Status'].referedValue;
    this.getAccount();
    this.loadTabs();
  }
  changeTab(e) {
    this.tabClicked = e;
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

  changeDataMF(event, data: CM_Contracts) {
    this.changeMF.emit({ e: event, data: data });
  }
  clickMF(event, data) {
    this.clickMoreFunc.emit({ e: event, data: data });
  }

  getPayMentByContractID(contractID) {
    if (contractID) {
      this.contractService
        .getPaymentsByContractID(contractID)
        .subscribe((res) => {
          if (res) {
            let listPayAll = res as CM_ContractsPayments[];
            this.listPayment = listPayAll.filter((pay) => pay.lineType == '0');
            this.listPaymentHistory = listPayAll.filter(
              (pay) => pay.lineType == '1'
            );
          } else {
            this.listPayment = [];
            this.listPaymentHistory = [];
          }
        });
    } else {
      this.listPayment = [];
      this.listPaymentHistory = [];
    }
  }

  getQuotationsAndQuotationsLinesByTransID(recID) {
    if (recID) {
      this.contractService
        .getQuotationsLinesByTransID(recID)
        .subscribe((res) => {
          if (res) {
            this.quotations = res[0];
            this.listQuotationsLine = res[1];
          } else {
            this.quotations = null;
            this.listQuotationsLine = [];
          }
        });
    } else {
      this.quotations = null;
      this.listQuotationsLine = [];
    }
  }

  getAccount() {
    this.api
      .execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.account = res;
        }
      });
  }
  autoStart(event) {
    this.changeProgress.emit(event);
  }

  loadTabs() {
    // let quotations = {
    //   name: 'Quotations',
    //   textDefault: 'Báo giá',
    //   isActive: false,
    //   icon: 'icon-monetization_on',
    //   template: this.quotationsTab,
    // };
    let quotations = {
      name: 'References',
      textDefault: 'Liên kết',
      isActive: false,
      template: null,
    };
    let idx = this.tabControl.findIndex((x) => x.name == 'References');
    if (idx != -1) this.tabControl.splice(idx, 1);
    this.tabControl.push(quotations);
  }
  checkSusscess(e){
    if(e){
      this.isSusscess.emit(true);
    }
  }
}
