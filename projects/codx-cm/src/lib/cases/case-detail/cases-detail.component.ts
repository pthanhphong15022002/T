import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { AlertConfirmInputConfig, CRUDService, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { TabDetailCustomComponent } from '../../deals/deal-detail/tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contacts } from '../../models/cm_model';
import { TabCasesDetailComponent } from './tab-cases-detail/tab-cases-detail.component';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { CasesComponent } from '../cases.component';

@Component({
  selector: 'codx-cases-detail',
  templateUrl: './cases-detail.component.html',
  styleUrls: ['./cases-detail.component.scss'],
})
export class CasesDetailComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() dataSelected: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Input() gridViewSetup: any;
  @Input() valueListStatusCode: any;
  @Input() formModel: FormModel;
  @Input() listInsStepStart = [];
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();

  @ViewChild('loadContactDeal')
  loadContactDeal: CodxListContactsComponent;

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
    {
      name: 'References',
      textDefault: 'Liên kết',
      isActive: false,
      template: null,
    },
  ];

  sessionID = '';
  treeTask = [];
  listCategory = [];
  listStepsProcess = [];
  listSteps = [];

  lstContacts = [];
  lstStepsOld = [];

  caseId: string = '';

  vllPriority = 'TM005';
  casesType: string = '';
  oldRecId: string = '';

  contactPerson = new CM_Contacts();
  isDataLoading: boolean = true;

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private caseComponent: CasesComponent,
    private notificationsService: NotificationsService,
  ) {
    super(inject);
    this.executeApiCalls();
  }

  onInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (this.oldRecId !== changes['dataSelected'].currentValue?.recID) {
          this.promiseAllAsync();
        }
        this.oldRecId = changes['dataSelected'].currentValue.recID;
        this.dataSelected = this.dataSelected;
        this.caseId = changes['dataSelected'].currentValue?.recID;
        this.getContactByObjectID(
          this.dataSelected.contactID,
          this.dataSelected.customerID
        );
        // this.sessionID = this.dataSelected?.applyProcess
        //   ? this.dataSelected?.refID
        //   : this.dataSelected?.recID;
        //da doi
        this.sessionID = this.dataSelected?.recID;
       // this.loadTree(this.sessionID);
      }
    }
    // if (changes?.listInsStepStart && changes?.listInsStepStart?.currentValue) {
    //   this.listSteps = this.listInsStepStart;
    // }
  }
  async promiseAllAsync() {
    this.isDataLoading = true;
    try {
      this.dataSelected?.applyProcess && (await this.getListInstanceStep());
    } catch (error) {}
  }
  reloadListStep(listSteps: any) {
    this.isDataLoading = true;
    this.listSteps = listSteps;
    this.isDataLoading = false;
    this.changeDetectorRef.detectChanges();
  }
  getListInstanceStep() {
    var data = [
      this.dataSelected?.refID,
      this.dataSelected?.processID,
      this.dataSelected?.status,
      this.dataSelected.caseType == '1' ? '2' : '3',
    ];
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      if (res) {
        this.listSteps = res;
        this.isDataLoading = false;
        this.checkCompletedInstance(this.dataSelected?.status);
      } else {
        this.listSteps = null;
      }
    });
  }
  checkCompletedInstance(dealStatus: any) {
    if (dealStatus == '1' || dealStatus == '2') {
      this.deleteListReason(this.listSteps);
    }
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }

  getContactByObjectID(contactId, customerID) {
    var data = [customerID, contactId];
    this.codxCmService.getOneContactByObjectID(data).subscribe((res) => {
      if (res) {
        console.log(res);
        this.contactPerson = res;
      }
    });
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

  changeFooter(e) {
    console.log(e);
  }
  //get tree giao viec theo quy trinh
  async getTree() {
    let seesionID = this.dataSelected.recID; ///da doi lai lay theo recID của doi tuong
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
  async executeApiCalls() {
    try {
      await this.getValueList();
      this.getCaseTypeByFuncID();
      this.dataSelected?.applyProcess && (await this.getListInstanceStep());
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
  }

  getCaseTypeByFuncID() {
    this.casesType = this.funcID == 'CM0401' ? '1' : '2';
  }

  async getValueList() {
    this.cache.valueList('CRM010').subscribe((res) => {
      if (res.datas) {
        this.listCategory = res?.datas;
      }
    });
  }
  showColumnControl(stepID) {
    if (this.listStepsProcess?.length > 0) {
      var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepsProcess[idx]?.showColumnControl;
    }
    return 1;
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
      isShowFromTaskAll && this.caseComponent.moveStage(this.dataSelected);
      !isShowFromTaskAll &&
        this.handleMoveStage(this.completedAllTasks(step), step.stepID);
    }

    if (transferControl == '2' && isContinueTaskEnd) {
      isShowFromTaskEnd && this.caseComponent.moveStage(this.dataSelected);
      !isShowFromTaskEnd &&
        this.handleMoveStage(this.completedAllTasks(step), step.stepID);
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
  checkFieldsIEmpty(fields) {
    return fields.some((x) => !x.dataValue && x.isRequired);
  }
  handleMoveStage(isStopAuto, stepID) {
    if (!isStopAuto) {
      this.caseComponent.moveStage(this.dataSelected);
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

         //   this.promiseAll(listInstanceStep);
          }
        });
      }
    }
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
  saveAssign(e) {
    if (e) this.getTree();
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
