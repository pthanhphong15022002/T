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
import { CRUDService, FormModel, UIComponent } from 'codx-core';
import { TabDetailCustomComponent } from '../../deals/deal-detail/tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contacts } from '../../models/cm_model';
import { TabCasesDetailComponent } from './tab-cases-detail/tab-cases-detail.component';

@Component({
  selector: 'codx-cases-detail',
  templateUrl: './cases-detail.component.html',
  styleUrls: ['./cases-detail.component.scss'],
})
export class CasesDetailComponent extends UIComponent
implements OnInit, AfterViewInit {
  @Input() dataSelected: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Input() gridViewSetup: any;
  @Input() formModel: FormModel;
  @Input() funcID: string; //True - Khách hàng; False - Liên hệ
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabCaseDetailComponent') tabCaseDetailComponent: TabCasesDetailComponent;

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

  id = '';
  treeTask = [];
  listCategory = [];
  listStepsProcess = [];
  listSteps = [];

  caseId: string = '';

  vllPriority = 'TM005';
  casesType:string='';
  oldRecId:string = '';

  contactPerson = new CM_Contacts();
  isDataLoading:boolean = true;

  constructor(
    private inject: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
  ) {
    super(inject);
    this.executeApiCalls();
  }

  onInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {

      if (changes['dataSelected'].currentValue != null && changes['dataSelected'].currentValue?.recID) {
        if(this.oldRecId !== changes['dataSelected'].currentValue?.recID){
          this.promiseAllAsync();
        }
        this.oldRecId = changes['dataSelected'].currentValue.recID;
        this.dataSelected =this.dataSelected;
        this.caseId = changes['dataSelected'].currentValue?.recID;
        this.getContactByObjectID(this.dataSelected.contactID ,this.dataSelected.customerID);
        this.id = this.dataSelected.applyProcess ? this.dataSelected?.refID : this.dataSelected?.recID;
        this.loadTree(this.id);
      }
    }
  }
  async promiseAllAsync() {
    this.isDataLoading = true;
    try {
      this.dataSelected.applyProcess && await this.getListInstanceStep();
    } catch (error) {}
  }
  reloadListStep(listSteps:any) {
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
     this.dataSelected.caseType == "1" ? '2':'3'
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


  getContactByObjectID(contactId,customerID) {
    var data = [customerID,contactId];
    this.codxCmService.getOneContactByObjectID(data).subscribe((res) => {
      if (res) {
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

  changeFooter(e){
    console.log(e);
  }
  //get tree giao viec theo quy trinh
  getTree() {
    let seesionID = this.dataSelected.refID;
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
  async executeApiCalls() {
    try {
      await this.getValueList();
      this.dataSelected.applyProcess &&  await this.getListInstanceStep();
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
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

    // if (transferControl == '1' && isContinueTaskAll) {
    //   isShowFromTaskAll && this.dealComponent.moveStage(this.dataSelected);
    //   !isShowFromTaskAll &&
    //     this.handleMoveStage(this.completedAllTasks(step), step.stepID);
    // }

    // if (transferControl == '2' && isContinueTaskEnd) {
    //   isShowFromTaskEnd && this.dealComponent.moveStage(this.dataSelected);
    //   !isShowFromTaskEnd &&
    //     this.handleMoveStage(this.completedAllTasks(step), step.stepID);
    // }
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
    if (e) {
      this.loadTree(this.id);
    }
  }

  loadTree(recID) {
    if(!recID){
      this.treeTask = [];
      return;
    }
    this.api.exec<any>(
        'TM',
        'TaskBusiness',
        'GetListTaskTreeBySessionIDAsync',
        recID
      ).subscribe((res) => {
        this.treeTask = res ? res : []; 
    });
  }
}
