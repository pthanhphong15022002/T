import {
  Input,
  Output,
  Optional,
  Injector,
  OnChanges,
  Component,
  ViewChild,
  TemplateRef,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CM_Contracts,
  CM_Quotations,
  CM_QuotationsLines,
  CM_ContractsPayments,
  CM_Deals,
} from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { CodxCmService } from '../../codx-cm.service';
import { ContractsService } from '../service-contracts.service';
import { DialogData, DialogRef, FormModel, NotificationsService, TenantStore, UIComponent } from 'codx-core';
@Component({
  selector: 'contracts-view-detail',
  templateUrl: './contracts-view-right.component.html',
  styleUrls: ['./contracts-view-right.component.scss'],
})
export class ContractsViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('quotationsTab') quotationsTab: TemplateRef<any>;
  @ViewChild('contractLinkTem') contractLinkTem: TemplateRef<any>;
  @Input() taskAdd;
  @Input() formModel: FormModel;
  @Input() listInsStepStart = [];
  @Input() contract: CM_Contracts;

  @Output() changeMF = new EventEmitter<any>();
  @Output() isSusscess = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeProgress = new EventEmitter<any>();

  quotations: CM_Quotations;
  listPayment: CM_ContractsPayments[] = [];
  listQuotationsLine: CM_QuotationsLines[];
  listPaymentHistory: CM_ContractsPayments[] = [];
  dialog: DialogRef;
  account: any;
  isView = true;
  grvSetup: any;
  contactPerson;
  treeTask = [];
  vllStatus = '';
  sessionID = '';
  tabClicked = '';
  listInsStep = [];
  isShowFull = false;  
  listTypeContract = [];
  oCountFooter: any = {};
  isLoading: boolean = true;
  contractLink:CM_Contracts;
  deal: CM_Deals;
  quotation: CM_Quotations;
  listContractInParentID: CM_Contracts[] = [];
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
  fmDeals: FormModel = {
    funcID: 'CM02021',
    formName: 'CMDeals',
    entityName: 'CM_Deals',
    gridViewName: 'grvCMDeals',
  };
  formModelContact: FormModel = {
    formName: 'CMContacts',
    entityName: 'CM_Contacts',
    gridViewName: 'grvCMContacts',
  };
  
  constructor(
    private inject: Injector,
    private location: Location,
    private tenantStore: TenantStore,
    private codxCmService: CodxCmService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData,
  ) {
    super(inject);
    this.dialog = dialog;
    if (!this.formModel) {
      this.formModel = dt?.data?.formModel;
    }
    if (!this.contract) {
      this.contract = dt?.data?.contract;
    }
    this.isView = dt?.data?.isView;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadTabs();
    if (changes?.contract && this.contract) {
      this.setDataInput();
      this.contractService
        .getContactByRecID(this.contract?.contactID)
        .subscribe((res) => {
          if (res) {
            this.contactPerson = res;
          }
        });
      this.getContractLink();
      this.getQuotation();
      this.getDeal();
      this.getListCOntractByParentID();
    }
    if (changes?.listInsStepStart && changes?.listInsStepStart?.currentValue) {
      this.listInsStep = this.listInsStepStart;
    }
    if (changes?.taskAdd) {
      console.log(changes?.taskAdd);
    }
    this.listTypeContract = this.contractService.listTypeContractTask;
  }

  async onInit() {
    this.grvSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    if (this.isView) {
      this.setDataInput();
    }
    this.vllStatus = this.grvSetup['Status'].referedValue;
    this.getAccount();
    this.loadTabs();
  }
  ngAfterViewInit(): void {
    let  contractLink = {
      name: 'contractLink',
      textDefault: 'Liên kết',
      isActive: false,
      template: this.contractLinkTem,
      icon: 'icon-i-link',
    };
    this.tabControl.push(contractLink);
  }

  setDataInput() {
    this.getQuotationsAndQuotationsLinesByTransID(this.contract?.quotationID);
    this.getPayMentByContractID(this.contract?.recID);
    if (this.contract?.applyProcess) {
      this.getListInstanceStep(this.contract);
    }
    this.sessionID = this.contract?.recID;
    this.loadTree(this.sessionID);
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

  getContractLink(){
    this.contractLink = null;
    if(this.contract?.parentID){
      this.contractService.getContractByRecID(this.contract?.parentID).subscribe((res) => {
        this.contractLink = res;
      })
    }
  }
  getDeal(){
    this.deal = null;
    if(this.contract?.dealID){
      this.codxCmService.getDealByRecID(this.contract?.dealID).subscribe((res) => {
        this.deal = res;
      })
    }
  }
  getQuotation(){
    this.quotation = null;
    if(this.contract?.quotationID){
      this.contractService.getQuotationByQuotationID(this.contract?.quotationID).subscribe((res) => {
        this.quotation = res;
      })
    }
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
        if (res) {
          this.account = res;
        }
      });
  }
  autoStart(event) {
    this.changeProgress.emit(event);
  }

  loadTabs() {
    let quotations = {
      name: 'Quotations',
      textDefault: 'Báo giá',
      isActive: false,
      icon: 'icon-monetization_on',
      template: this.quotationsTab,
    };
    // let quotations = {
    //   name: 'References',
    //   textDefault: 'Liên kết',
    //   isActive: false,
    //   icon: 'icon-i-link',
    //   template: this.quotationsTab,
    // };
    let idx = this.tabControl.findIndex((x) => x.name == 'Quotations');
    if (idx != -1) this.tabControl.splice(idx, 1);
    this.tabControl.push(quotations);
  }

  checkSusscess(e) {
    if (e) {
      this.isSusscess.emit(true);
    }
  }

  saveAssign(e) {
    if (e) {
      this.loadTree(this.sessionID);
    }
  }

  loadTree(recID) {
    if (!recID) {
      this.treeTask = [];
      return;
    }
    this.api
      .exec<any>('TM', 'TaskBusiness', 'GetListTaskTreeBySessionIDAsync', recID)
      .subscribe((res) => {
        this.treeTask = res ? res : [];
      });
  }

  clickShowTab(event) {
    this.isShowFull = event;
  }

  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.markForCheck();
  }

  linkData(type:string, recID:string){
    if (type && recID) {
      const url1 = this.location.prepareExternalUrl(this.location.path());
      const parser = document.createElement('a');
      parser.href = url1;
      const domain = parser.origin;

      let tenant = this.tenantStore.get().tenant;
      let url = ``
      switch(type){
        case "contract":
          url = `${domain}/${tenant}/cm/contracts/CM0204?predicate=RecID=@0&dataValue=${recID}`;
          break;
        case "deal":
          url = `${domain}/${tenant}/cm/deals/CM0201?predicate=RecID=@0&dataValue=${recID}`;
          break;
        case "quotation":
          url = `${domain}/${tenant}/cm/quotations/CM0202?predicate=RecID=@0&dataValue=${recID}`;
          break;
      }
      if(url){
        window.open(url, '_blank');
      }
      return;
    } else {
      this.notiService.notify('Không tìm thấy dữ liệu', '3');
    }
  }

  getListCOntractByParentID(){
    this.listContractInParentID = [];
    if(this.contract.parentID) {
      this.contractService.getContractByParentID(this.contract.parentID).subscribe((res)=>{
        if(res){
          this.listContractInParentID = res;
        }
      })
    }
    
  }
}
