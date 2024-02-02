import { log } from 'console';
import {
  OnInit,
  Optional,
  Component,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ElementRef,
  Renderer2,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import { CM_Contacts, CM_Customers, CM_Deals } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';
import { ContractsService } from '../../../contracts/service-contracts.service';
import { PopupMoveStageComponent } from 'projects/codx-dp/src/lib/instances/popup-move-stage/popup-move-stage.component';

@Component({
  selector: 'current-status',
  templateUrl: './current-status.component.html',
  styleUrls: ['./current-status.component.scss'],
})
export class CurrentStatusComponent implements OnInit, OnChanges {
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
  type = '1';

  oCountFooter: any = {};
  dataTree = [];
  // mergedList: any[] = [];
  listLeads: any[] = [];
  listContracts: any[] = [];
  listQuotations: any[] = [];
  isViewLink: boolean = false;
  view;
  listCosts;
  dealCostOld = 0;
  isChangeCost = false;
  widthDefault = '550'

  viewSettings: any;
  statusCodeID;
  statusCodeCmt;
  detailViewDeal;
  title = '';
  consultant;
  salesperson;
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
  formModelContact = {
    formName: 'CMContacts',
    entityName: 'CM_Contacts',
    gridViewName: 'grvCMContacts',
  };
  listTabLeft = [
    {
      id: 'listTabInformation',
      name: 'Thông tin cơ hội',
      icon: 'icon-info',
      type: '1',
    },
  ];

  listTabInformation = [
    { id: 'sales', name: 'Sales team', icon: "icon-people_alt"},
    { id: 'costItems', name: 'Chi phí', icon: "icon-add_to_photos"},
    { id: 'contact', name: 'Người quyết định', icon: "icon-contact_phone"},
    { id: 'information', name: 'Nhu cầu', icon: "icon-add_box"},
    { id: 'opponent', name: 'Đối thủ', icon: "icon-i-people-fill"},


    // { id: 'fields', name: 'Thông tin mở rộng', icon: "icon-"},
    // { id: 'note', name: 'Ghi chú', icon: "icon-"},
  ];
  totalCost: any;
  isUpDealCost = false;
  dealValueTo: any;
  isUpDealValueTo = false;
  isZoomIn = false;
  isZoomOut = false;
  constructor(
    private cache: CacheService,
    private codxCmService: CodxCmService,
    private contractService: ContractsService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private el: ElementRef, private renderer: Renderer2,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.deal = dt?.data?.dataView;
    this.contractRecId = dt?.data?.contactRecId;
    this.listInsStepStart = dt?.data?.listInsStepStart;
    this.statusCodeID = dt?.data?.statusCodeID;
    this.statusCodeCmt = dt?.data?.statusCodeCmt;
    this.detailViewDeal = dt?.data?.detailViewDeal;
    this.title = dt?.data?.title;
    this.type = dt?.data?.type || '1';
    this.view = dt?.data?.view;
    this.dealCostOld = this.deal?.dealCost;
    if (!this.dialog?.formModel) {
      this.dialog.formModel = {
        entityName: 'CM_Contracts',
        entityPer: 'CM_Contracts',
        formName: 'CMContracts',
        funcID: 'CM0204',
        gridViewName: 'grvCMContracts',
      };
    }
  }
  ngOnInit() {
    this.listTabRight = this.listTabInformation;
    this.tabRightSelect = this.listTabRight[0]?.id;
    this.tabLeftSelect = this.listTabLeft[0];
    this.listInsStep = this.listInsStepStart;
    if (this.type != '1') {
      this.listTabInformation = [{ id: 'tasks', name: 'Công việc', icon:"icon-i-list-task" }];
    }
   
    this.cache
      .gridViewSetup('CMContracts', 'grvCMContracts')
      .subscribe((res) => {
        if (res) {
          this.grvSetupContract = res;
          this.vllStatusContract = this.grvSetupContract['Status'].referedValue;
        }
      });
    // this.getCostItemsByTransID(this.deal?.recID);
    this.widthDefault = this.dialog.dialog.width
    ? this.dialog.dialog.width.toString()
    : '550';   

    let listUserID = JSON.stringify([this.deal?.salespersonID, this.deal?.consultantID]);

    // this.api
    // .exec<any>('HR', 'EmployeesBusiness', 'GetListEmployeesByUserIDAsync', [listUserID])
    // .subscribe((res) => {
    //   if(res){
    //     this.consultant = res.find(x => x.userID == this.deal?.consultantID);
    //     this.salesperson = res.find(x => x.userID == this.deal?.salespersonID);
    //   }
    //   console.log(res);
      
    // });
  }
  
  ngOnChanges(changes: SimpleChanges) {}

  getCostItemsByTransID(transID) {
    this.codxCmService.getCostItemsByTransID(transID).subscribe((res) => {
      if (res) {
        this.listCosts = res ?? [];
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
    this.contractService
      .getContractByRecID(this.contractRecId)
      .subscribe((res) => {
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
    if (e == 'listAddTask') {
      this.loadTree(this.deal?.recID);
    }
    if (e == 'listLink') {
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
    this.cache.gridViewSetup('CMLeads', 'grvCMLeads').subscribe((res) => {
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
          this.vllStatusQuotation =
            this.grvSetupQuotation['Status'].referedValue;
        }
      });

    this.getHistoryByDeaID();
  }

  getListInstanceStep(contract) {
    if (contract?.processID) {
      var data = [contract?.refID, contract?.processID, contract?.status, '5'];
      this.codxCmService.getStepInstance(data).subscribe((res) => {
        if (res) {
          this.listInsStep = res;
        }
      });
    }
  }

  close() {
    this.dialog.close(this.isChangeCost);
  }

  onSectionChange(data: any, index: number = -1) {
    if (index > -1) {
      this.tabRightSelect = this.listTabInformation?.find(
        (x) => x.id == data
      )?.id;
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
    element.scrollTop += 100;
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
    if (this.deal.customerCategory == '1') {
      this.codxCmService
        .getContactByObjectID(this.deal.recID)
        .subscribe((res) => {
          if (res) {
            this.contact = res;
          } else {
            this.contact = null;
          }
        });
    } else {
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
  saveDataStep(e) {}
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

          this.isViewLink =
            (this.listQuotations != null && this.listQuotations.length > 0) ||
            (this.listContracts != null && this.listContracts.length > 0) ||
            (this.listLeads != null && this.listLeads.length > 0);
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
            headerTitle: 'Chuyển giai đoạn',
            applyFor: '1',
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
            if (e && e.event != null) {
              let instance = e.event?.instance;
              let listSteps = e.event?.listStep;
              let isMoveBackStage = e.event?.isMoveBackStage;
              let tmpInstaceDTO = e.event?.tmpInstaceDTO;
              if (isMoveBackStage) {
                let dataUpdate = [
                  tmpInstaceDTO,
                  e.event?.comment,
                  e.event?.expectedClosed,
                  this.statusCodeID,
                  this.statusCodeCmt,
                ];
                this.codxCmService
                  .moveStageBackDataCM(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.detailViewDeal)
                        this.detailViewDeal.dataSelected = res;
                      this.detailViewDeal?.reloadListStep(listSteps);
                      this.getListInstanceStep(this.deal);
                      this.changeDetectorRef.detectChanges();
                    }
                  });
              } else {
                let dataUpdate = [
                  data.recID,
                  instance.stepID,
                  oldStepId,
                  oldStatus,
                  e.event?.comment,
                  e.event?.expectedClosed,
                  e.event?.permissionCM,
                ];
                this.codxCmService
                  .moveStageDeal(dataUpdate)
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.update(res, true).subscribe();
                      if (this.detailViewDeal)
                        this.detailViewDeal.dataSelected = res;
                      this.getListInstanceStep(this.deal);
                      this.detailViewDeal?.reloadListStep(listSteps);
                      this.changeDetectorRef.detectChanges();
                    }
                  });
              }
            }
          });
        });
    });
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
  showMore() {
    let isZoomOut = !this.isZoomOut;
    let width = window.innerWidth.toString();
    this.isZoomOut = isZoomOut;
    this.dialog.setWidth(this.isZoomOut ? width : this.widthDefault);
    let c = document.getElementsByClassName('e-popup-open');
    var a = c[0] as HTMLElement;
    if(this.isZoomOut && a){
      a.style.height = '100%'; 
      a.style.maxHeight = '100%';
    }else if(!this.isZoomOut && a){
      a.style.height = '100%'; 
      a.style.maxHeight = '95%';
    }
    this.changeDetectorRef.detectChanges();
  }
}
