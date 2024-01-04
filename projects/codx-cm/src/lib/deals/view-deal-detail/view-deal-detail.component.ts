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
import { ApiHttpService, CacheService, DialogData, DialogRef, FormModel, NotificationsService} from 'codx-core';
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

  grvSetupContract;
  vllStatusContract;


  grvSetupLead;
  vllStatusLead;

  grvSetupQuotation;
  vllStatusQuotation;


  oCountFooter: any = {};
  dataTree = [];
  // mergedList: any[] = [];
  listLeads: any[] = [];
  listContracts: any[] = [];
  listQuotations: any[] = [];
  isViewLink: boolean = false;



  viewSettings: any;

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
  formModelQuotations: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    entityName: 'CM_Quotations',
  };
  formModelLead: FormModel = {
    formName: 'CMLeads',
    gridViewName: 'grvCMLeads',
    entityName: 'CM_Leads',
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
    this.deal = dt?.data?.dataView;
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
          this.grvSetupContract = res;
          this.vllStatusContract = this.grvSetupContract['Status'].referedValue;
        }
      });

  }
  ngOnChanges(changes: SimpleChanges) {}



  getContract() {
    if (this.deal) {
      this.getCutomer();
      this.getContact();
      this.getListInstanceStep(this.deal);
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
    if(e == 'listAddTask'){
      this.loadTree(this.deal?.recID);
    }
    if(e == 'listLink') {
      this.getLink();
    }
  }
  getLink() {
    // this.cache
    // .gridViewSetup('CMContracts', 'grvCMContracts')
    // .subscribe((res) => {
    //   if (res) {
    //     this.grvSetup = res;
    //     this.vllStatus = this.grvSetup['Status'].referedValue;
    //   }
    // });
    this.cache
    .gridViewSetup('CMLeads', 'grvCMLeads')
    .subscribe((res) => {
      if (res) {
          this.grvSetupLead = res;
          this.vllStatusLead = this.grvSetupLead['Status'].referedValue;
      }
    });

    this.cache
    .gridViewSetup('CMQuotations', 'grvCMQuotations')
    .subscribe((res) => {
      if (res) {
          this.grvSetupQuotation = res;
          this.vllStatusQuotation = this.grvSetupQuotation['Status'].referedValue;
      }
    });

  this.getHistoryByDeaID();
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
      if(this.deal.customerCategory == '1' ) {
        this.codxCmService.getContactByObjectID(this.deal.recID).subscribe((res) => {
          if (res) {
            this.contact = res;
          } else {
            this.contact = null;
          }
        });
      }
      else {
        this.contact = null;
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
          this.deal?.recID,
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

  async getHistoryByDeaID() {
    if (this.deal?.recID) {
      let data = [this.deal?.recID];
      this.codxCmService.getDataTabHistoryDealAsync(data).subscribe((res) => {
        if (res) {
          // this.mergedList = res;
          this.listQuotations = res[0];
          this.listContracts = res[1];
          this.listLeads = res[2];

          this.isViewLink = (this.listQuotations != null &&  this.listQuotations.length > 0)  ||
          (this.listContracts != null &&  this.listContracts.length > 0)
          || (this.listLeads != null &&  this.listLeads.length > 0)

        }
      });
    }
  }
  getSettingValue(type: string, fieldName: string): any {
    const obj = this.viewSettings[type];
    if (obj) {
      switch (fieldName) {
        case 'icon':
          return obj.icon + ' icon-22 me-2 text-gray-700';
        case 'name':
          return obj.name;
        case 'headerText':
          return obj.headerText;
        case 'deadValue':
          return obj.deadValue;
        case 'formModel':
          return obj.formModel;
        case 'status':
          return obj.status;
        case 'gridViewSetup':
          return obj.gridViewSetup;
        case 'createOn':
          return obj.gridViewSetup['CreatedOn']?.headerText;
      }
    }
    return '';
  }
  settingViewValue() {
    this.viewSettings = {
      '1': {
        icon: 'icon-monetization_on',
        headerText: 'Báo giá',
        // deadValue: this.grvSetupQuotation['TotalAmt']?.headerText,
        // formModel: this.formModelQuotations,
        // status: this.vllStatusQuotation,
        // gridViewSetup: this.grvSetupQuotation,
        // name: this.grvSetupQuotation['QuotationName']?.headerText,
      },
      '2': {
        icon: 'icon-sticky_note_2',
        headerText: 'Hợp đồng',
        // deadValue: this.grvSetupContract['ContractAmt']?.headerText,
        // formModel: this.formModelContract,
        // status: this.vllStatusContract,
        // gridViewSetup: this.grvSetupContract,
        // name: this.grvSetupContract['ContractName']?.headerText,
      },
      '3': {
        icon: 'icon-monetization_on',
        headerText: 'Tiềm năng',
        // deadValue: this.grvSetupLead['DealValue']?.headerText,
        // formModel: this.formModelLead,
        // status: this.vllStatusLead,
        // gridViewSetup: this.grvSetupLead,
        // name: this.grvSetupLead['LeadName']?.headerText,
      },
    };
  }
}







