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
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel, SidebarModel } from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../../../codx-cm.service';
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';
import { DealsComponent } from '../../deals.component';
import { DealDetailComponent } from '../deal-detail.component';

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
  @Input() listSteps: DP_Instances_Steps[] = [];
  @Output() saveAssign = new EventEmitter<any>();
  // @Output() contactEvent = new EventEmitter<any>();
  titleAction: string = '';
  listStep = [];
  isUpdate = true; //xư lý cho edit trung tuy chinh ko
  listStepsProcess = [];
  listCategory = [];
  // titleDefault= "Trường tùy chỉnh"//truyen vay da
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabContact: string = 'Contact';
  readonly tabOpponent: string = 'Opponent';
  readonly tabTask: string = 'Task';
  readonly tabProduct: string = 'Product';
  readonly tabGanttChart: string = 'GanttChart';
  readonly tabQuotation: string = 'Quotation';
  readonly tabContract: string = 'Contract';

  fmProcductsLines: FormModel = {
    formName: 'CMProducts',
    gridViewName: 'grvCMProducts',
    entityName: 'CM_Products',
  };
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };

  constructor(
    private inject: Injector,
    private codxCmService: CodxCmService,
    private changeDetec: ChangeDetectorRef,
    private dealComponent: DealsComponent,
    private dealDetailComponent: DealDetailComponent
  ) {
    super(inject);
  }
  ngAfterViewInit() {}
  onInit(): void {
    this.executeApiCalls();
  }

  ngOnChanges(changes: SimpleChanges) {
    //nvthuan
    if (changes.dataSelected) {
      this.getListInstanceStep();
    }
  }

  async executeApiCalls() {
    try {
      await this.getValueList();
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
  }
  //nvthuan
  getListInstanceStep() {
    var data = [
      this.dataSelected?.refID,
      this.dataSelected?.processID,
      this.dataSelected?.status,
    ];
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      this.listStep = res;
      this.checkCompletedInstance(this.dataSelected?.status);
    });
  }

  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }

  checkCompletedInstance(dealStatus: any) {
    if (dealStatus == '1' || dealStatus == '2') {
      this.deleteListReason(this.listStep);
    }
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

  addContact() {
    var contact = 'CM0103'; // contact
    this.cache.functionList(contact).subscribe((fun) => {
      let option = new SidebarModel();
      // option.DataService = this.view.dataService;
      var formMD = new FormModel();
      formMD.entityName = fun.entityName;
      formMD.formName = fun.formName;
      formMD.gridViewName = fun.gridViewName;
      formMD.funcID = contact;
      option.FormModel = JSON.parse(JSON.stringify(formMD));
      option.Width = '800px';
      option.DataService = null;
      this.titleAction = ' Bao test';
      var dialog = this.callfc.openSide(
        PopupAddCmCustomerComponent,
        ['add', this.titleAction],
        option
      );
      dialog.closed.subscribe((e) => {
        //      if (!e?.event) this.view.dataService.clear();
        // if (e && e.event != null) {
        //   this.customerDetail.listTab(this.funcID);
        // }
      });
    });
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

  continueStep(isTaskEnd, step) {
    let transferControl = this.dataSelected.steps.transferControl;
    if(transferControl == '0') return;

    let isShowFromTaskAll = false;
    let isShowFromTaskEnd = !this.checkContinueStep(true,step);
    let isContinueTaskEnd = isTaskEnd;
    let isContinueTaskAll = this.checkContinueStep(false,step);
    let dataInstance = {
      listStep: this.listStep,
      isAuto: {
        isShowFromTaskAll,
        isShowFromTaskEnd,
        isContinueTaskEnd,
        isContinueTaskAll,
      },
    };

    if(transferControl == '1' && isContinueTaskAll){
      this.dealComponent.moveStage(this.dataSelected);
    }
    if(transferControl == '2' && isContinueTaskEnd){
      this.dealComponent.moveStage(this.dataSelected);
    }
//    this.serviceInstance.autoMoveStage(dataInstance);
  }

  checkContinueStep(isDefault,step) {
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
  saveAssignTask(e){
    if(e) this.saveAssign.emit(e);
  }
  contactChange($event) {
    if($event) {
      this.dealDetailComponent.getContactPerson($event.data);
    }
  }
}
