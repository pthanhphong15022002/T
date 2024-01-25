import {
  OnInit,
  Optional,
  Component,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { Location } from '@angular/common';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts, CM_Customers, CM_Deals } from '../../models/cm_model';
import { ApiHttpService, CacheService, CallFuncService, DialogData, DialogRef, FormModel, NotificationsService, SidebarModel, TenantStore} from 'codx-core';
import { ContractsService } from '../../contracts/service-contracts.service';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';

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
  view;
  listCosts;

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
    { id: 'listTabInformation', name: 'Thông tin cơ hội', icon: 'icon-info'},
    { id: 'listHistory', name: 'Lịch sử', icon: 'icon-i-clock-history'},
    { id: 'listFile', name: 'Đính kèm', icon: 'icon-i-paperclip'},
    { id: 'listAddTask', name: 'Giao việc', icon: 'icon-i-clipboard-check'},
    { id: 'listApprove', name: 'Ký, duyệt', icon: 'icon-edit-one'},
    { id: 'listLink', name: 'Liên kết', icon: 'icon-i-link'},
  ];
  listTabInformation = [
    { id: 'information', name: 'Thông tin dự án'},
    { id: 'costItems', name: 'Chi phí'},
    { id: 'task', name: 'Công việc'},
    { id: 'fields', name: 'Thông tin mở rộng'},
    { id: 'opponent', name: 'Đối thủ'},
    { id: 'note', name: 'Ghi chú'},
  ];
  listHistory = [{ id: 'history', name:'Lịch sử'}];
  listFile = [{ id: 'file', name:'Đính kèm'}];
  listAddTask = [{ id: 'addTask', name:'Giao việc'}];
  listApprove = [{ id: 'approve', name:'Ký, duyệt'}];
  listLink = [{ id: 'link', name:'Liên kết'}];
  totalCost: any;
  isUpDealCost = false;
  dealValueTo: any;
  isUpDealValueTo = false;
  detailViewDeal;
  constructor(
    private cache: CacheService,
    private codxCmService: CodxCmService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private location: Location,
    private tenantStore: TenantStore,
    private api: ApiHttpService,
    private callFunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.deal = dt?.data?.dataView;
    this.contractRecId = dt?.data?.contactRecId;
    this.listInsStepStart = dt?.data?.listInsStepStart;
    this.view = dt?.data?.view;
    this.detailViewDeal = dt?.data?.detailViewDeal;
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
    this.getCostItemsByTransID(this.deal?.recID);
  }
  ngOnChanges(changes: SimpleChanges) {}

  getCostItemsByTransID(transID) {
    this.codxCmService.getCostItemsByTransID(transID).subscribe((res) => {
      if (res) {
        this.listCosts = res;
      }
    });
  }

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

  // lstContactEmit(e) {
  //   this.lstContacts = e ?? [];
  //   let index = this.lstContacts.findIndex((x) => x.isDefault);
  //   if (index != -1) {
  //     this.getContactPerson(this.lstContacts[index]);
  //   } else {
  //     this.getContactPerson(null);
  //   }
  //   this.changeDetectorRef.detectChanges();
  // }

  // contactChange($event) {
  //   if ($event) {
  //     if ($event?.data) {
  //       let data = $event?.data;
  //       if ($event?.action == 'delete') {
  //         data.isDefault = false;
  //       }
  //       if ($event?.action != 'add') {
  //         let lst = [];
  //         lst.push(Object.assign({}, $event.data));
  //         var json = JSON.stringify(lst);
  //         var lstID = [];
  //         lstID.push(this.dataSelected?.refID);
  //         this.codxCmService
  //           .updateFieldContacts(
  //             lstID,
  //             $event?.action == 'edit' ? json : '',
  //             $event?.action == 'delete' ? json : ''
  //           )
  //           .subscribe((res) => {});
  //         if (this.listSteps != null && this.listSteps?.length > 0) {
  //           for (var step of this.listSteps) {
  //             if (step?.fields != null && step?.fields?.length > 0) {
  //               let idx = step?.fields?.findIndex(
  //                 (x) =>
  //                   x?.dataType == 'C' &&
  //                   x?.dataValue != null &&
  //                   x?.dataValue?.trim() != ''
  //               );

  //               if (idx != -1) {
  //                 let lsJs = [];
  //                 lsJs = JSON.parse(step?.fields[idx]?.dataValue) ?? [];
  //                 var idxContactField = lsJs.findIndex(
  //                   (x) => x.recID == data.recID
  //                 );
  //                 if (idxContactField != -1) {
  //                   if ($event?.action == 'edit') {
  //                     lsJs[idxContactField] = data;
  //                   } else {
  //                     lsJs.splice(idxContactField, 1);
  //                   }
  //                   step.fields[idx].dataValue =
  //                     lsJs != null && lsJs?.length > 0
  //                       ? JSON.stringify(lsJs)
  //                       : '';
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   this.changeDetectorRef.detectChanges();
  // }

  moveStage(e) {
    let data = this.deal;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      this.cache
        .gridViewSetup(fun.formName, fun.gridViewName)
        .subscribe((grvSt) => {
          let formMD = new FormModel();
          formMD.funcID = fun.functionID;
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          let oldStatus = data.status;
          let oldStepId = data.stepID;
          let stepReason = {
            isUseFail: false,
            isUseSuccess: false,
          };
          let dataCM = {
            refID: data?.refID,
            processID: data?.processID,
            stepID: data?.stepID,
            nextStep: '',
            isCallInstance: true,
            // listStepCbx: this.lstStepInstances,
          };
          let obj = {
            formModel: formMD,
            deal: data,
            stepReason: stepReason,
            headerTitle: "Chuyển giai đoạn",
            applyFor: "1",
            dataCM: dataCM,
          };
          let dialogMoveStage = this.callFunc.openForm(
            PopupMoveStageComponent,
            '',
            850,
            900,
            '',
            obj
          );
          dialogMoveStage.closed.subscribe((e) => {
            // if (e && e.event != null) {
            //   let instance = e.event?.instance;
            //   let listSteps = e.event?.listStep;
            //   let isMoveBackStage = e.event?.isMoveBackStage;
            //   let tmpInstaceDTO = e.event?.tmpInstaceDTO;
            //   if (isMoveBackStage) {
            //     let dataUpdate = [
            //       tmpInstaceDTO,
            //       e.event?.comment,
            //       e.event?.expectedClosed,
            //       this.statusCodeID,
            //       this.statusCodeCmt,
            //     ];
            //     this.codxCmService
            //       .moveStageBackDataCM(dataUpdate)
            //       .subscribe((res) => {
            //         if (res) {
            //           this.view.dataService.update(res, true).subscribe();
            //           if (this.kanban) {
            //             this.renderKanban(res);
            //           }
            //           if (this.detailViewDeal)
            //             this.detailViewDeal.dataSelected = res;
            //           this.detailViewDeal?.reloadListStep(listSteps);
            //           this.detectorRef.detectChanges();
            //         }
            //       });
            //   } else {
            //     let dataUpdate = [
            //       data.recID,
            //       instance.stepID,
            //       oldStepId,
            //       oldStatus,
            //       e.event?.comment,
            //       e.event?.expectedClosed,
            //       e.event?.permissionCM,
            //     ];
            //     this.codxCmService
            //       .moveStageDeal(dataUpdate)
            //       .subscribe((res) => {
            //         if (res) {
            //           this.view.dataService.update(res, true).subscribe();
            //           if (this.kanban) {
            //             this.renderKanban(res);
            //           }
            //           if (this.detailViewDeal)
            //             this.detailViewDeal.dataSelected = res;
            //           if (e.event.isReason != null) {
            //             this.moveReason(res, e.event.isReason);
            //           }
            //           this.detailViewDeal?.reloadListStep(listSteps);
            //           this.detectorRef.detectChanges();
            //         }
            //       });
            //   }
            // }
          });
        });
    });
  }

  viewContact(){
    if (this.deal.currencyID) {
      const url1 = this.location.prepareExternalUrl(this.location.path());
      const parser = document.createElement('a');
      parser.href = url1;
      const domain = parser.origin;

      let tenant = this.tenantStore.get().tenant;
      let url = `${domain}/${tenant}/cm/customers/CM0101?predicate=RecID=@0&dataValue=${this.deal.customerID}`;
      if(url){
        window.open(url, '_blank');
      }
      return;
    } else {
      this.notiService.notify('Khách hàng không tồn tại', '3');
    }
  }

  totalDataCost(e) {
    this.totalCost = e;
    this.isUpDealCost = true;
  }
  changeDealValueTo(e) {
    this.dealValueTo = e;
    this.isUpDealValueTo = true;
  }
  closePopup() {
    if ((!this.isUpDealCost && !this.isUpDealValueTo)) {
      this.dialog.close();
      return;
    }
    let obj = {
      dealCost: this.totalCost,
      isUpDealCost: this.isUpDealCost,
      dealValueTo: this.dealValueTo,
      isUpDealValueTo: this.isUpDealValueTo,
    };
    this.dialog.close(obj);
  }
  startNow(e) {
    if(e){
      this.notiService
      .alertCode('DP033', null, ['"' + this.deal?.dealName + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.startDeal(this.deal);
        }
      });
    }
  }
  startDeal(data) {
    this.codxCmService
      .startInstance([data.refID, data.recID, 'CM0201', 'CM_Deals'])
      .subscribe((resDP) => {
        if (resDP) {
          let datas = [data.recID, resDP[0]];
          this.codxCmService.startDeal(datas).subscribe((res) => {
            if (res) {
              this.deal = res;
              this.view.dataService.update(this.deal, true).subscribe();
              if (this.detailViewDeal)
                this.detailViewDeal.reloadListStep(resDP[1]);
                this.getListInstanceStep(this.deal);
              this.notiService.notifyCode('SYS007');
            }
            this.changeDetectorRef.markForCheck();
          });
        }
      });
  }
}







