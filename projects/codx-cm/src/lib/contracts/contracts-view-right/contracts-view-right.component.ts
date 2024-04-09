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
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, TenantStore, UIComponent } from 'codx-core';
@Component({
  selector: 'contracts-view-detail',
  templateUrl: './contracts-view-right.component.html',
  styleUrls: ['./contracts-view-right.component.scss'],
})
export class ContractsViewDetailComponent
  extends UIComponent
  implements OnChanges {
  @ViewChild('quotationsTab') quotationsTab: TemplateRef<any>;
  @ViewChild('contractLinkTem') contractLinkTem: TemplateRef<any>;
  @ViewChild('notificationTemp') notificationTemp: TemplateRef<any>;
  @Input() taskAdd;
  @Input() formModel: FormModel;
  @Input() listInsStepStart = [];
  @Input() contract: CM_Contracts;
  @Input() contractAppendix: CM_Contracts;
  @Input() processID: string;
  @Input() tabDefaut = "";
  @Input() valueListTab;
  @Input() user;

  // @Input() dataSelected: any;
  @Output() changeMF = new EventEmitter<any>();
  @Output() isSusscess = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeProgress = new EventEmitter<any>();
  @Output() moveStage = new EventEmitter<any>();

  quotations: CM_Quotations;
  listPayment: CM_ContractsPayments[] = [];
  listQuotationsLine: CM_QuotationsLines[];
  listPaymentHistory: CM_ContractsPayments[] = [];
  dialog: DialogRef;
  account: any;
  isView = true;
  grvSetup: any;
  stepCurrent: any;
  contactPerson;
  treeTask = [];
  vllStatus = '';
  sessionID = '';
  tabClicked = '';
  listInsStep = [];
  lstStepsOld = [];
  isShowFull = false;
  listTypeContract = [];
  oCountFooter: any = {};
  isLoading: boolean = true;
  contractLink: CM_Contracts;
  deal: CM_Deals;
  quotation: CM_Quotations;
  listContractInParentID: CM_Contracts[] = [];
  isHaveField: boolean = false;
  listStepsProcess = [];
  isLoadingContract = false;
  notificationPopup;
  userOwner;
  idTabShow = "";

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

  lstContacts: any;
  allowTask = false;
  isViewStep = false;
  constructor(
    private inject: Injector,
    private location: Location,
    private tenantStore: TenantStore,
    private callFunc: CallFuncService,
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

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.loadTabs();
    if (changes?.contract && this.contract) {
      await this.getConfigurationProcess();
      this.listInsStep = null;
      this.setDataInput();
      this.getContractLink();
      this.getQuotation();
      this.getDeal();
      this.getListCOntractByParentID();
      this.getUserContract();
    }
    if (changes?.contractAppendix && changes?.contractAppendix?.currentValue) {
      this.listContractInParentID = this.listContractInParentID ? this.listContractInParentID : [];
      this.listContractInParentID?.push(changes?.contractAppendix?.currentValue);
    }
    if (changes?.listInsStepStart && changes?.listInsStepStart?.currentValue) {
      this.listInsStep = this.listInsStepStart;
    }
    this.setTaskBar();
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
    let contractLink = {
      name: 'contractLink',
      textDefault: 'Liên kết',
      isActive: false,
      template: this.contractLinkTem,
      icon: 'icon-i-link',
    };
    this.tabControl.push(contractLink);
  }

  setTaskBar() {
    if (this.contract?.isAdminAll || this.contract?.owner == this.user?.userID) {
      this.idTabShow = this.tabDefaut;
    } else {
      this.idTabShow = this.contract?.config == "full" ? this.tabDefaut: this.contract?.config;
    }
  }

  getUserContract() {
    if (this.contract?.contactID) {
      this.contractService
        .getContactByRecID(this.contract?.contactID)
        .subscribe((res) => {
          if (res) {
            this.contactPerson = res;
          }
        });
    }
    if (this.contract?.owner) {
      this.api
        .exec<any>('HR', 'EmployeesBusiness_Old', 'GetListEmployeesByUserIDAsync', [this.contract?.owner])
        .subscribe((res) => {
          if (res) {
            this.userOwner = res[0];
          }
        });
    }
  }

  setDataInput() {
    this.getQuotationsAndQuotationsLinesByTransID(this.contract?.quotationID);
    this.getPayMentByContractID(this.contract?.recID);
    if (this.contract?.applyProcess) {
      this.getListInstanceStep();
    }
    else {
      this.stepCurrent = null;
    }
    this.sessionID = this.contract?.recID;
    this.loadTree(this.sessionID);
  }

  changeTab(e) {
    this.tabClicked = e;
  }

  getListInstanceStep() {
    this.stepCurrent = null;
    this.isHaveField = false;
    var data = [
      this.contract?.refID,
      this.contract?.processID,
      this.contract?.status,
      '4',
    ];
    this.codxCmService.getViewDetailInstanceStep(data).subscribe((res) => {
      if (res) {
        this.listInsStep = res[0] || [];
        this.isHaveField = res[1];
        if (this.listInsStep) {
          this.lstStepsOld = JSON.parse(JSON.stringify(this.listInsStep));
          this.getStepCurrent(this.contract);
        }
        this.checkCompletedInstance(this.contract?.status);
      } else {
        this.listInsStep = [];
      }
    });
  }

  checkCompletedInstance(dealStatus: any) {
    if (dealStatus == '1' || dealStatus == '2' || dealStatus == '0') {
      this.deleteListReason(this.listInsStep);
    }
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  showColumnControl(stepID) {
    if (this.listStepsProcess?.length > 0) {
      var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepsProcess[idx]?.showColumnControl;
    }
    return 1;
  }

  saveDataStep(e) {
    if (e) {
      if (e?.fields != null && e?.fields?.length > 0) {
        var lstStepsOld = JSON.parse(JSON.stringify(this.lstStepsOld));
        let lstOlds = [];
        if (lstStepsOld != null && lstStepsOld.length > 0) {
          for (var step of lstStepsOld) {
            if (step?.fields != null && step?.fields?.length > 0) {
              let js = step?.fields?.find(
                (x) =>
                  x?.dataType == 'C' &&
                  x?.dataValue != null &&
                  x?.dataValue?.trim() != ''
              );
              if (js != null && js?.dataValue != null) {
                let lsJs = JSON.parse(js?.dataValue);
                lsJs.forEach((element) => {
                  if (!lstOlds.some((x) => x.recID == element?.recID)) {
                    lstOlds.push(element);
                  }
                });
              }
            }
          }
        }
        for (var item of e?.fields) {
          if (
            item?.dataType == 'C' &&
            item?.dataValue != null &&
            item?.dataValue?.trim() != ''
          ) {
            var lst = JSON.parse(item?.dataValue);
            if (lstOlds != null && lstOlds.length > 0) {
              let lstDelete = [];
              if (lst != null && lst.length > 0) {
                lstOlds.forEach((ele) => {
                  let isCheck = lst.some((x) => x.recID == ele?.recID);
                  if (!isCheck) lstDelete.push(ele);
                });
              } else {
                lstDelete = lstOlds;
              }
              for (let i = 0; i < lstDelete.length; i++) {
                let recID = lstDelete[i]?.recID;
                var indx = this.lstContacts.findIndex((x) => x.recID == recID);
                if (indx != -1) {
                  this.lstContacts.splice(indx, 1);
                }
              }
            }
            for (var contact of lst) {
              let idx = this.lstContacts?.findIndex(
                (x) => x.recID == contact?.recID
              );
              if (idx != -1) {
                this.lstContacts[idx] = contact;
              } else {
                this.lstContacts.push(Object.assign({}, contact));
              }
            }
          }
        }
        this.lstStepsOld = this.listInsStep;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  changeDataMF(event, data: CM_Contracts) {
    this.changeMF.emit({ e: event, data: data });
  }

  clickMF(event, data) {
    this.clickMoreFunc.emit({ e: event, data: data });
  }

  getContractLink() {
    this.contractLink = null;
    if (this.contract?.parentID) {
      this.contractService.getContractByRecID(this.contract?.parentID).subscribe((res) => {
        if (res) {
          this.contractLink = res || [];
        } else {
          this.contractLink = null;
        }
      })
    }
  }
  getDeal() {
    this.deal = null;
    if (this.contract?.dealID) {
      this.codxCmService.getDealByRecID(this.contract?.dealID).subscribe((res) => {
        this.deal = res;
      })
    }
  }
  getQuotation() {
    this.quotation = null;
    if (this.contract?.quotationID) {
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

  linkData(type: string, recID: string) {
    if (type && recID) {
      const url1 = this.location.prepareExternalUrl(this.location.path());
      const parser = document.createElement('a');
      parser.href = url1;
      const domain = parser.origin;

      let tenant = this.tenantStore.get().tenant;
      let url = ``
      switch (type) {
        case "contract":
          url = `${domain}/${tenant}/cm/contracts/CM0206?predicate=RecID=@0&dataValue=${recID}`;
          break;
        case "deal":
          url = `${domain}/${tenant}/cm/deals/CM0201?predicate=RecID=@0&dataValue=${recID}`;
          break;
        case "quotation":
          url = `${domain}/${tenant}/cm/quotations/CM0202?predicate=RecID=@0&dataValue=${recID}`;
          break;
      }
      if (url) {
        window.open(url, '_blank');
      }
      return;
    } else {
      this.notiService.notify('Không tìm thấy dữ liệu', '3');
    }
  }

  getListCOntractByParentID() {
    this.listContractInParentID = null;
    this.isLoadingContract = true;
    this.contractService.getContractByParentID([this.contract?.recID, this.contract?.parentID, this.contract?.useType]).subscribe((res) => {
      if (res) {
        this.listContractInParentID = res || [];
      } else {
        this.listContractInParentID = [];
      }
      this.isLoadingContract = false;
    })
  }
  reloadListStep(listSteps: any) {
    this.isLoading = true;
    this.listInsStep = listSteps;
    this.getStepCurrent(this.contract);
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
  }
  getStepCurrent(data) {
    this.stepCurrent = this.listInsStep.filter(x => x.stepID == data.stepID)[0];
  }

  handelMoveStage(event) {
    this.moveStage.emit(event);
  }
  handelMailContract() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID: this.contract?.emailTemplate,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: false,
      notSendMail: true,
    };

    let popEmail = this.callfc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    popEmail.closed.subscribe((res) => {
      if (res && res.event) {
        this.contract.emailTemplate = res.event?.recID ? res.event?.recID : '';
      }
    });
  }
  valueChangeChecked(event, data) {
    if (event) {
      data[event.field] = event?.data || false;
    }
  }

  notificationContract() {
    let opt = new DialogModel();
    opt.zIndex = 1115;
    this.notificationPopup = this.callFunc.openForm(
      this.notificationTemp,
      '',
      400,
      400,
      '',
      null,
      '',
      opt
    );
  }

  async getConfigurationProcess(){
    if(this.contract?.processID){
      const res = await firstValueFrom(this.codxCmService.getConfigurationProcess(this.contract?.processID));
      if(res && res[0] && res[0]?.allowTask){
        this.isViewStep = !(res[0]?.allowTask && this.contract?.approveStatus != '3' && !this.contract?.closed) ;
      }else{
        this.isViewStep = ['1', '2', '15',].includes(this.contract?.status) || this.contract?.closed || this.contract?.approveStatus == '3';
      }
      this.changeDetectorRef.detectChanges();
    }
  }

}
