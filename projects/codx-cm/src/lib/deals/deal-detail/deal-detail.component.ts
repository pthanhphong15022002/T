import {
  Input,
  OnInit,
  Output,
  ViewChild,
  Component,
  TemplateRef,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormModel,
  CodxService,
  CacheService,
  NotificationsService,
  AlertConfirmInputConfig,
  TenantStore
} from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { DealsComponent } from '../deals.component';
import { CM_Contracts } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';

@Component({
  selector: 'codx-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() gridViewSetup: any;
  @Input() listSteps: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Input() funcID = 'CM0201';
  @Input() checkMoreReason = true;
  @Input() isChangeOwner = false;
  @Input() taskAdd;

  @Input() tabDefaut = "";
  @Input() valueListTab;
  @Input() user;

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @Output() changeProgress = new EventEmitter<any>();
  @Output() changeDataCustomers = new EventEmitter<any>();
  @Output() moveStage = new EventEmitter<any>();
  @Input() isChangeViewDetails = true; //chỉ change khi view details

  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('referencesDeal') referencesDeal: TemplateRef<any>;
  @ViewChild('loadContactDeal')
  loadContactDeal: CodxListContactsComponent;
  @ViewChild('tabObj') tabObj: TabComponent;

  formModelQuotations: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    entityName: 'CM_Quotations',
  };
  formModelContract: FormModel = {
    formName: 'CMContracts',
    gridViewName: 'grvCMContracts',
    entityName: 'CM_Contracts',
  };
  formModelLead: FormModel = {
    formName: 'CMLeads',
    gridViewName: 'grvCMLeads',
    entityName: 'CM_Leads',
  };
  formModelContact: FormModel = {
    formName: 'CMContacts',
    gridViewName: 'grvCMContacts',
    entityName: 'CM_Contacts',
  };

  isDataLoading: boolean = true;

  nameDetail = '';
  tabClicked = '';

  viewTag: string = '';
  oldRecId: string = '';
  asideMode: string = '';
  treeTask = [];
  grvSetupQuotation: any[] = [];
  grvSetupLead: any[] = [];
  grvSetupContract: any[] = [];
  tabControl: any[] = [];
  tabDetail = [];
  listStepsProcess = [];
  listContract: CM_Contracts[];
  mergedList: any[] = [];
  // listCategory = [];
  listRoles = [];
  lstContacts = [];
  lstStepsOld = [];
  //listStatusCode = [];
  vllStatusQuotation: any;
  vllStatusContract: any;
  vllStatusLead: any;
  viewSettings: any;
  contactPerson: any;
  oCountFooter: any = {};
  stepCurrent: any;

  listLeads: any[] = [];
  listContracts: any[] = [];
  listQuotations: any[] = [];
  isViewLink: boolean = false;

  isShow: boolean = false;
  isCategoryCustomer: boolean = false;
  hasRunOnce: boolean = false;
  isHaveField: boolean = false;
  customerName;
  idTabShow = "";
  isViewStep = false;
  isUpdateTask = false;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private cache: CacheService,
    private notificationsService: NotificationsService,
    private dealComponent: DealsComponent,
    private location: Location,
    private tenantStore: TenantStore,
    codxService: CodxService
  ) {
    this.asideMode = codxService.asideMode;
    this.executeApiCalls();
  }

  ngOnInit(): void {
    this.tabControl = [
      {
        name: 'History',
        textDefault: 'Lịch sử',
        isActive: true,
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
      {
        name: 'Deal',
        textDefault: 'Liên kết',
        isActive: false,
        template: this.referencesDeal,
        icon: 'icon-i-link',
      },
    ];
  }

  ngAfterViewInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isChangeViewDetails) return;

    if (changes.dataSelected) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        let index = this.tabControl.findIndex((x) => x.name === 'Deal');
        if (index != -1) {
          this.tabControl.splice(index, 1);
        }
        let references = {
          name: 'Deal',
          textDefault: 'Liên kết',
          isActive: false,
          template: this.referencesDeal,
          icon: 'icon-i-link',
        };
        this.tabControl.push(references);
        this.getTags(this.dataSelected);
        if (this.oldRecId !== changes['dataSelected'].currentValue?.recID) {
          this.promiseAllAsync();
          this.hasRunOnce = true;
          this.resetTab(this.dataSelected.customerCategory);
        }
        this.oldRecId = changes['dataSelected'].currentValue.recID;
        this.dataSelected = this.dataSelected;

        //cái này đã có customer Name
        if (this.dataSelected?.customerName)
          this.customerName = this.dataSelected?.customerName;
        //cái này bua cho data cux
        else
          this.codxCmService
            .getCustomerNameByrecID(this.dataSelected?.customerID)
            .subscribe((res) => {
              this.customerName = res;
            });
      }
      this.setTaskBar();
      this.getConfigurationProcess();
    }
  }

  promiseAllAsync() {
    this.isDataLoading = true;
    this.dataSelected.applyProcess && (this.getListInstanceStep());
    this.getTree(); //ve cay giao viec
    this.getLink();
    this.getContactByDeaID(this.dataSelected.recID);
  }
  reloadListStep(listSteps: any) {
    this.isDataLoading = true;
    this.listSteps = listSteps;
    this.getStepCurrent(this.dataSelected);
    this.isDataLoading = false;
    this.changeDetectorRef.detectChanges();
  }
  ngAfterViewChecked() {
    if (!this.hasRunOnce) {
      this.resetTab(this.dataSelected?.customerCategory);
    }
  }

  getLink() {
    this.cache
      .gridViewSetup('CMContracts', 'grvCMContracts')
      .subscribe((res) => {
        if (res) {
          this.grvSetupContract = res;
          this.vllStatusContract = this.grvSetupContract['Status'].referedValue;
        }
      });
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

  resetTab(data) {
    if (this.tabObj) {
      this.isCategoryCustomer = data == '1';
      if (this.isCategoryCustomer) {
        (this.tabObj as TabComponent).hideTab(1, false);
      } else {
        (this.tabObj as TabComponent).hideTab(1, true);
      }
    }
  }

  async executeApiCalls() {
    try {
      await this.getValueListRole();
    } catch (error) { }
  }

  async getValueListRole() {
    this.cache.valueList('CRM040').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  changeTab(e) {
    this.tabClicked = e;
    this.nameDetail = e;
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMF.emit({
      e: e,
      data: data,
    });
  }

  changeFooter(e) { }

  async getHistoryByDeaID() {
    if (this.dataSelected?.recID) {
      let data = [this.dataSelected?.recID];
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

  loadContactEdit() {
    this.loadContactDeal && this.loadContactDeal?.getListContacts();
    this.changeDetectorRef.detectChanges();
  }
  async getContactByDeaID(recID) {
    if (this.dataSelected.customerCategory == '1') {
      this.codxCmService.getContactByObjectID(recID).subscribe((res) => {
        if (res) {
          this.contactPerson = res;
        } else {
          this.contactPerson = null;
        }
      });
    } else {
      this.contactPerson = null;
    }
  }
  //load giao việc
  async getTree() {
    let seesionID = this.dataSelected.recID; ///da doi lai lay theo recID của doi tuong
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
  getContactPerson($event) {
    if ($event) {
      this.contactPerson = $event?.isDefault ? $event : null;
      this.changeDetectorRef.detectChanges();
    } else {
      this.contactPerson = null;
    }
  }

  getTags(data) {
    this.viewTag = '';
    setTimeout(() => {
      this.viewTag = this.dataSelected?.tags;
    }, 100);
  }

  getListInstanceStep() {
    var data = [
      this.dataSelected?.refID,
      this.dataSelected?.processID,
      this.dataSelected?.status,
      '1',
    ];

    this.codxCmService.getViewDetailInstanceStep(data).subscribe((res) => {
      if (res) {
        this.listSteps = res[0];
        this.isHaveField = res[1];
        if (this.listSteps) {
          this.lstStepsOld = JSON.parse(JSON.stringify(this.listSteps));
          this.getStepCurrent(this.dataSelected);
        }
        this.isDataLoading = false;
        this.checkCompletedInstance(this.dataSelected?.status);
      } else {
        this.listSteps = [];
        this.stepCurrent = null;
        this.isHaveField = false;
      }
    });
  }
  getStepCurrent(data) {
    this.stepCurrent = null;
    if (this.listSteps != null && this.listSteps.length > 0) {
      this.stepCurrent = this.listSteps.filter(
        (x) => x.stepID == data.stepID
      )[0];
    }
  }
  checkCompletedInstance(dealStatus: any) {
    if (dealStatus == '1' || dealStatus == '2' || dealStatus == '0') {
      this.deleteListReason(this.listSteps);
    }
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  //truong tuy chinh - đang cho bằng 1
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
        this.lstStepsOld = this.listSteps;
        if (this.loadContactDeal) {
          this.loadContactDeal.loadListContact(this.lstContacts);
        }
      }
      this.changeDetectorRef.detectChanges();
    }

    // this.listSteps = e;
    // this.outDataStep.emit(this.dataStep);
  }

  contactChange($event) {
    if ($event) {
      if ($event?.data) {
        let data = $event?.data;
        if ($event?.action == 'delete') {
          data.isDefault = false;
        }
        if ($event?.action != 'add') {
          let lst = [];
          lst.push(Object.assign({}, $event.data));
          var json = JSON.stringify(lst);
          var lstID = [];
          lstID.push(this.dataSelected?.refID);
          this.codxCmService
            .updateFieldContacts(
              lstID,
              $event?.action == 'edit' ? json : '',
              $event?.action == 'delete' ? json : ''
            )
            .subscribe((res) => { });
          if (this.listSteps != null && this.listSteps?.length > 0) {
            for (var step of this.listSteps) {
              if (step?.fields != null && step?.fields?.length > 0) {
                let idx = step?.fields?.findIndex(
                  (x) =>
                    x?.dataType == 'C' &&
                    x?.dataValue != null &&
                    x?.dataValue?.trim() != ''
                );

                if (idx != -1) {
                  let lsJs = [];
                  lsJs = JSON.parse(step?.fields[idx]?.dataValue) ?? [];
                  var idxContactField = lsJs.findIndex(
                    (x) => x.recID == data.recID
                  );
                  if (idxContactField != -1) {
                    if ($event?.action == 'edit') {
                      lsJs[idxContactField] = data;
                    } else {
                      lsJs.splice(idxContactField, 1);
                    }
                    step.fields[idx].dataValue =
                      lsJs != null && lsJs?.length > 0
                        ? JSON.stringify(lsJs)
                        : '';
                  }
                }
              }
            }
          }
        }
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  lstContactEmit(e) {
    this.lstContacts = e ?? [];
    let index = this.lstContacts.findIndex((x) => x.isDefault);
    if (index != -1) {
      this.getContactPerson(this.lstContacts[index]);
    } else {
      this.getContactPerson(null);
    }
    this.changeDetectorRef.detectChanges();
  }

  async promiseAll(listInstanceStep) {
    try {
      await this.updateMoveStageInstance(listInstanceStep);
      await this.updateMoveStageDeal();
    } catch (err) { }
  }
  async updateMoveStageInstance(listInstanceStep) {
    var data = [listInstanceStep, this.dataSelected.processID];
    this.codxCmService.autoMoveStageInInstance(data).subscribe((res) => { });
  }

  async updateMoveStageDeal() {
    var data = [this.dataSelected];
    this.codxCmService.autoMoveStageInDeal(data).subscribe((res) => {
      if (res[0] && res) {
        this.dataSelected = res[0];
        this.dealComponent.autoMoveStage(this.dataSelected);
      }
    });
  }

  continueStep(event) {
    let isTaskEnd = event?.isTaskEnd;
    let step = event?.step;

    let transferControl = this.dataSelected.steps.transferControl;
    if (transferControl == '0') return;

    let isShowFromTaskEnd = !this.checkContinueStep(true, step);
    let isContinueTaskEnd = isTaskEnd;
    let isContinueTaskAll = this.checkContinueStep(false, step);
    let isShowFromTaskAll = !isContinueTaskAll;

    if (transferControl == '1' && isContinueTaskAll) {
      isShowFromTaskAll && this.dealComponent.moveStage(this.dataSelected);
      !isShowFromTaskAll &&
        this.handleMoveStage(this.completedAllTasks(step), step.stepID);
    }

    if (transferControl == '2' && isContinueTaskEnd) {
      isShowFromTaskEnd && this.dealComponent.moveStage(this.dataSelected);
      !isShowFromTaskEnd &&
        this.handleMoveStage(this.completedAllTasks(step), step.stepID);
    }
  }
  handleMoveStage(isStopAuto, stepID) {
    if (!isStopAuto) {
      this.dealComponent.moveStage(this.dataSelected);
    } else {
      let index = this.listSteps.findIndex((x) => x.stepID === stepID);
      let isUpdate = false;
      let nextStep;
      if (index != -1) {
        nextStep = this.listSteps.findIndex(
          (x) => x.stepID == this.listSteps[index + 1].stepID
        );
        if (nextStep != -1) {
          isUpdate = true;
        }
      }
      if (isUpdate) {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notificationsService.alertCode('DP034', config).subscribe((x) => {
          if (x.event?.status == 'Y') {
            this.listSteps[nextStep].stepStatus = '1';
            this.listSteps[nextStep].actualStart = new Date();
            this.listSteps[index].stepStatus = '3';
            if (this.listSteps[index].actualEnd !== null) {
              this.listSteps[index].actualEnd = new Date();
            }

            var listInstanceStep = [];
            listInstanceStep.push(this.listSteps[index]);
            listInstanceStep.push(this.listSteps[nextStep]);
            var nextStepDeal = this.listSteps.find(
              (x) => x.stepID == this.listSteps[nextStep + 1].stepID
            );
            this.dataSelected.stepID = this.listSteps[nextStep].stepID;
            if (nextStepDeal) {
              this.dataSelected.nextStep = nextStepDeal.stepID;
            } else {
              this.dataSelected.nextStep = null;
            }

            this.promiseAll(listInstanceStep);
          }
        });
      }
    }
  }
  completedAllTasks(instanceSteps): boolean {
    var isCheckOnwer = instanceSteps?.owner ? false : true;
    if (isCheckOnwer) {
      return false;
    }
    var isCheckFields = this.checkFieldsIEmpty(instanceSteps.fields);
    if (isCheckFields) {
      return false;
    }
    return true;
  }
  checkContinueStep(isDefault, step) {
    let check = true;
    let listTask = isDefault
      ? step?.tasks?.filter((task) => task?.requireCompleted)
      : step?.tasks;
    if (listTask?.length <= 0) {
      return isDefault ? true : false;
    }
    for (let task of listTask) {
      if (task.progress != 100) {
        check = false;
        break;
      }
    }
    return check;
  }
  checkFieldsIEmpty(fields) {
    return fields.some((x) => !x.dataValue && x.isRequired);
  }
  saveAssignTask(e) {
    // if (e) this.saveAssign.emit(e);
    if (e) this.getTree();
  }
  // getNameCategory(categoryId: string) {
  //   return this.listCategory.filter((x) => x.value == categoryId)[0]?.text;
  // }
  getIcon($event) {
    if ($event == '1') {
      return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
    } else if ($event == '5') {
      return this.listRoles.filter((x) => x.value == '5')[0]?.icon ?? null;
    } else if ($event == '3') {
      return this.listRoles.filter((x) => x.value == '3')[0]?.icon ?? null;
    }
    return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
  }

  autoStart(event) {
    this.changeProgress.emit(event);
  }
  clickShowTab(isShow) {
    this.isShow = isShow;
    this.changeDetectorRef.detectChanges();
  }
  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.detectChanges();
  }
  //#region edit customer
  editCustomer(data) {
    this.changeDataCustomers.emit({ data: data });
  }
  handelMoveStage(event) {
    this.moveStage.emit(event);
  }
  //#endregion
  setTaskBar() {
    if (this.dataSelected?.isAdminAll || this.dataSelected?.owner == this.user?.userID) {
      this.idTabShow = "1,2,5,6,7";
    } else {
      this.idTabShow = this.dataSelected?.config == "full" ? this.tabDefaut: this.dataSelected?.config;
    }
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
      this.notificationsService.notify('Không tìm thấy dữ liệu', '3');
    }
  }
  async getConfigurationProcess(){
    if(this.dataSelected?.processID){
      this.isViewStep = !['1', '2', '15',].includes(this.dataSelected?.status) || this.dataSelected?.closed || this.dataSelected?.approveStatus == '3';
      const res = await firstValueFrom(this.codxCmService.getConfigurationProcess(this.dataSelected?.processID));
      if(res && res[0] && res[0]?.allowTask){
        this.isUpdateTask = (res[0]?.allowTask && this.dataSelected?.approveStatus != '3' && (['3', '4', '5', '6',].includes(this.dataSelected?.status) || 
        this.dataSelected.closed)) ;
        this.changeDetectorRef.markForCheck();
      }
    }
  }
}
