import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CRUDService,
  CacheService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { TabDetailCustomComponent } from './tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contracts } from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';
import { DealsComponent } from '../deals.component';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

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
  @Input() valueListStatusCode: any;
  @Input() funcID = 'CM0201'; //
  @Input() checkMoreReason = true;
  @Input() isChangeOwner = false;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  // @Output() saveAssign = new EventEmitter<any>(); ko can tra ve
  @Output() changeProgress = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail')
  tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @ViewChild('referencesDeal') referencesDeal: TemplateRef<any>;
  @ViewChild('loadContactDeal')
  loadContactDeal: CodxListContactsComponent;
  @ViewChild('tabObj') tabObj: TabComponent;
  formModelCustomer: FormModel;
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

  isShow: boolean = false;
  isCategoryCustomer: boolean = false;
  hasRunOnce: boolean = false;
  customerName;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private cache: CacheService,
    private notificationsService: NotificationsService,
    private dealComponent: DealsComponent
  ) {
    this.executeApiCalls();
  }

  ngOnInit(): void {
    this.listTab();
    this.tabControl = [
      {
        name: 'History',
        textDefault: 'Lịch sử',
        isActive: true,
        template: null,
      },
      // {
      //   name: 'Comment',
      //   textDefault: 'Thảo luận',
      //   isActive: false,
      //   template: null,
      // },
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

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSelected) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        var index = this.tabControl.findIndex((x) => x.name === 'Deal');
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
          this.resetTab(this.dataSelected.categoryCustomer);
        }
        this.oldRecId = changes['dataSelected'].currentValue.recID;
        this.dataSelected = this.dataSelected;
        this.codxCmService.getCustomerNameByrecID(this.dataSelected?.customerID).subscribe(res =>{
          this.customerName = res;
        });
      }
    }
  }

  async promiseAllAsync() {
    this.isDataLoading = true;
    try {
      await this.getListInstanceStep();
      await this.getTree(); //ve cay giao viec
      await this.getListContactByDealID(
        this.dataSelected.recID,
        this.dataSelected?.categoryCustomer
      );
      await this.getHistoryByDeaID();
    } catch (error) {}
  }
  reloadListStep(listSteps: any) {
    this.isDataLoading = true;
    this.listSteps = listSteps;
    this.isDataLoading = false;
    this.changeDetectorRef.detectChanges();
  }
  ngAfterViewChecked() {
    if (!this.hasRunOnce) {
      this.resetTab(this.dataSelected?.categoryCustomer);
    }
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

  listTab() {
    this.tabDetail = [
      {
        name: 'Information',
        text: 'Thông tin chung',
        icon: 'icon-info',
      },
      {
        name: 'Contact',
        text: 'Liên hệ',
        icon: 'icon-contact_phone',
      },
      {
        name: 'Opponent',
        text: 'Đối thủ',
        icon: 'icon-people_alt',
      },
      {
        name: 'Task',
        text: 'Công việc',
        icon: 'icon-more',
      },
      {
        name: 'History',
        text: 'Lịch sử cập nhật',
        icon: 'icon-sticky_note_2',
      },
    ];
  }
  async executeApiCalls() {
    try {
      this.formModelCustomer = await this.codxCmService.getFormModel('CM0101');
      await this.getGridViewQuotation();
      await this.getGridViewContract();
      await this.getGridViewLead();
    //  await this.getValueList();
      await this.getValueListRole();
    //  await this.getListStatusCode();
    } catch (error) {}
  }
  async getValueListRole() {
    this.cache.valueList('CRM040').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }
  // async getValueList() {
  //   this.cache.valueList('CRM010').subscribe((res) => {
  //     if (res.datas) {
  //       this.listCategory = res?.datas;
  //     }
  //   });
  // }
  async getGridViewQuotation() {
    this.grvSetupQuotation = await firstValueFrom(
      this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
    );
    this.vllStatusQuotation = this.grvSetupQuotation['Status'].referedValue;
  }
  async getGridViewContract() {
    this.grvSetupContract = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatusContract = this.grvSetupContract['Status'].referedValue;
  }
  async getGridViewLead() {
    this.grvSetupLead = await firstValueFrom(
      this.cache.gridViewSetup('CMLeads', 'grvCMLeads')
    );
    this.vllStatusLead = this.grvSetupLead['Status'].referedValue;
    this.settingViewValue();
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

  changeFooter(e) {}

  // async getListStatusCode() {
  //     this.codxCmService.getListStatusCode(['5']).subscribe((res) => {
  //       if (res) {
  //         debugger;
  //         this.listStatusCode = res;
  //       }
  //     });
  // }
  async getHistoryByDeaID() {
    if (this.dataSelected?.recID) {
      var data = [this.dataSelected?.recID];
      this.codxCmService.getDataTabHistoryDealAsync(data).subscribe((res) => {
        if (res) {
          this.mergedList = res[0];
        }
      });
    }
  }
  // async getContactByDeaID(recID) {
  //   this.codxCmService.getContactByObjectID(recID).subscribe((res) => {
  //     if (res) {
  //       this.contactPerson = res;
  //     } else {
  //       this.contactPerson = null;
  //     }
  //   });
  // }
  async getListContactByDealID(objectID, categoryCustomer) {
    if (categoryCustomer == '1') {
      this.codxCmService.getListContactByObjectID(objectID).subscribe((res) => {
        if (res && res?.length > 0) {
          let contactMain = res.filter((res) => res.isDefault)[0];
          this.contactPerson = contactMain ? contactMain : null;
          this.loadContactDeal && this.loadContactDeal?.loadListContact(res);
        }
        else {
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
    }else{
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
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      if (res) {
        this.listSteps = res;
        if (this.listSteps) {
          this.lstStepsOld = JSON.parse(JSON.stringify(this.listSteps));
        }
        this.isDataLoading = false;
        this.checkCompletedInstance(this.dataSelected?.status);
      }
    });
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
  settingViewValue() {
    this.viewSettings = {
      '1': {
        icon: 'icon-monetization_on',
        headerText: 'Báo giá',
        deadValue: this.grvSetupQuotation['TotalAmt']?.headerText,
        formModel: this.formModelQuotations,
        status: this.vllStatusQuotation,
        gridViewSetup: this.grvSetupQuotation,
        name: this.grvSetupQuotation['QuotationName']?.headerText,
      },
      '2': {
        icon: 'icon-sticky_note_2',
        headerText: 'Hợp đồng',
        deadValue: this.grvSetupContract['ContractAmt']?.headerText,
        formModel: this.formModelContract,
        status: this.vllStatusContract,
        gridViewSetup: this.grvSetupContract,
        name: this.grvSetupContract['ContractName']?.headerText,
      },
      '3': {
        icon: 'icon-monetization_on',
        headerText: 'Tiềm năng',
        deadValue: this.grvSetupLead['DealValue']?.headerText,
        formModel: this.formModelLead,
        status: this.vllStatusLead,
        gridViewSetup: this.grvSetupLead,
        name: this.grvSetupLead['LeadName']?.headerText,
      },
    };
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
            .subscribe((res) => {});
          if (this.listSteps != null && this.listSteps.length > 0) {
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
    let index = this.lstContacts.findIndex(x => x.isDefault);
    if(index != -1){
      this.getContactPerson(this.lstContacts[index]);
    }else{
      this.getContactPerson(null);
    }
    this.changeDetectorRef.detectChanges();
  }

  async promiseAll(listInstanceStep) {
    try {
      await this.updateMoveStageInstance(listInstanceStep);
      await this.updateMoveStageDeal();
    } catch (err) {}
  }
  async updateMoveStageInstance(listInstanceStep) {
    var data = [listInstanceStep, this.dataSelected.processID];
    this.codxCmService.autoMoveStageInInstance(data).subscribe((res) => {});
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
  getStatusCode(status) {
    if(status) {
      let result = this.valueListStatusCode.filter(x=>x.value === status)[0];
      if(result) {
        return result?.text;
      }
    }
    return '';
  }
}
