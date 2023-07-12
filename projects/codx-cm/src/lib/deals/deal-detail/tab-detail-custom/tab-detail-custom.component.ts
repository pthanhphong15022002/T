import { async } from '@angular/core/testing';
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
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import {
  UIComponent,
  FormModel,
  SidebarModel,
  NotificationsService,
  AlertConfirmInputConfig,
} from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../../../codx-cm.service';
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';
import { DealsComponent } from '../../deals.component';
import { DealDetailComponent } from '../deal-detail.component';
import { CodxListContactsComponent } from '../../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import {
  CM_Contacts,
  CM_Contracts,
  CM_Quotations,
} from '../../../models/cm_model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'codx-tab-deal-detail',
  templateUrl: './tab-detail-custom.component.html',
  styleUrls: ['./tab-detail-custom.component.scss'],
})
export class TabDetailCustomComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() tabClicked: any;
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() checkMoreReason = true;
  @Input() mergedList: any[] = [];
  @Input() listSteps: any;
  @Output() saveAssign = new EventEmitter<any>();
  @ViewChild('loadContactDeal') loadContactDeal: CodxListContactsComponent;
  // @Output() contactEvent = new EventEmitter<any>();
  titleAction: string = '';
  // listStep = [];
  // isUpdate = true; //xư lý cho edit trung tuy chinh ko
  listStepsProcess = [];
  listCategory = [];
  @Input()  tabDetail = [];

  // titleDefault= "Trường tùy chỉnh"//truyen vay da
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabTask: string = 'Task';
  readonly tabContact: string = 'Contact';
  readonly tabOpponent: string = 'Opponent';
  readonly tabHistory: string = 'History';
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
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };

  recIdOld: string = '';
  isDataLoading = true;
  grvSetupQuotation: any[] = [];
  vllStatusQuotation: any;
  grvSetupContract: any[] = [];
  vllStatusContract: any;
  constructor(
    private inject: Injector,
    private codxCmService: CodxCmService,
    private changeDetec: ChangeDetectorRef,
    private dealComponent: DealsComponent,
    private dealDetailComponent: DealDetailComponent,
    private notificationsService: NotificationsService
  ) {
    super(inject);
    this.executeApiCalls();
  }
  ngAfterViewInit() {}
  onInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSelected) {
      this.isDataLoading=true;
      this.dataSelected = this.dataSelected;
      this.loadContactDeal?.getListContactsByObjectId(this.dataSelected?.recID);
    }
    if (changes?.listSteps) {
      if (
        changes?.listSteps?.currentValue?.length > 0 &&
        changes?.listSteps?.currentValue !== null
      ) {
        this.isDataLoading=false;
        this.listSteps = changes?.listSteps.currentValue;
      }
    }
  }

  async executeApiCalls() {
    try {
      await this.getValueList();
      await this.getGridViewQuotation();
      await this.getGridVieContract();
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
  }
  async getGridViewQuotation() {
    this.grvSetupQuotation = await firstValueFrom(
      this.cache.gridViewSetup('CMQuotations', 'grvCMQuotations')
    );
    this.vllStatusQuotation = this.grvSetupQuotation['Status'].referedValue;
  }
  async getGridVieContract() {
    this.grvSetupContract = await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    this.vllStatusContract = this.grvSetupContract['Status'].referedValue;
  }

  async getValueList() {
    this.cache.valueList('CRM010').subscribe((res) => {
      if (res.datas) {
        this.listCategory = res?.datas;
      }
    });
  }

  getNameCategory(categoryId: string) {
    return this.listCategory.filter((x) => x.value == categoryId)[0]?.text;
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

  //event giao viec
  saveAssignTask(e) {
    if (e) this.saveAssign.emit(e);
  }
  contactChange($event) {
    if ($event) {
      this.dealDetailComponent.getContactPerson($event.data);
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
  getHeaderText() {}
  saveDataStep(e) {
    if (e) {
    }
    // this.listSteps = e;
    // this.outDataStep.emit(this.dataStep);
  }
}
