import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel, SidebarModel } from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../../../codx-cm.service';
import { LeadDetailComponent } from '../lead-detail.component';

@Component({
  selector: 'codx-tab-lead-detail',
  templateUrl: './tab-lead-detail.component.html',
  styleUrls: ['./tab-lead-detail.component.scss'],
})
export class TabLeadDetailComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() tabClicked: any;
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Output() saveAssign = new EventEmitter<any>();
  titleAction: string = '';
  listStep = [];
  isUpdate = true;
  listStepsProcess = [];
  // listCategory = [];
  isDataLoading = true;
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabTask: string = 'Task';
  readonly tabComment: string = 'Comment';
  tabControlComment = [
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
  ];
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
  oCountFooter: any = {};
  constructor(
    private inject: Injector,
    private codxCmService: CodxCmService,
    private changeDetectorRef: ChangeDetectorRef,
    private leadDetailComponent: LeadDetailComponent,
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
      this.isDataLoading = true;
      this.getListInstanceStep();
    }
  }

  async executeApiCalls() {
    try {
      //   await this.getValueList();
    } catch (error) {
      console.error('Error executing API calls:', error);
    }
  }

  getListInstanceStep() {
    var data = [
      this.dataSelected?.refID,
      this.dataSelected?.processID,
      this.dataSelected?.status,
    ];
    this.codxCmService.getStepInstance(data).subscribe((res) => {
      if (res) {
        this.listStep = res;
        this.checkCompletedInstance(this.dataSelected?.status);
        this.leadDetailComponent.pushTabFields((this.checkHaveField(this.listStep)));
      }
      else {
        this.listStep = null;
      }
      this.isDataLoading = false;
    });
  }
  checkCompletedInstance(dealStatus: any) {
    if (dealStatus == '1' || dealStatus == '2') {
      this.deleteListReason(this.listStep);
    }
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  checkHaveField(listStep: any){
    var isCheck = false;
    for(let item of listStep) {
        if(item?.fields?.length > 0 && item?.fields) {
          isCheck = true;
          return isCheck;
        }
    }
    return isCheck;
  }
  // async getValueList() {
  //   this.cache.valueList('CRM010').subscribe((res) => {
  //     if (res.datas) {
  //       this.listCategory = res?.datas;
  //     }
  //   });
  // }

  // getNameCategory(categoryId:string) {
  //   return this.listCategory.filter(x=> x.value == categoryId)[0]?.text;
  // }

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

    // let isShowFromTaskEnd = !this.checkContinueStep(true,step);
    // let isContinueTaskEnd = isTaskEnd;
    // let isContinueTaskAll = this.checkContinueStep(false,step);
    // let isShowFromTaskAll = !isContinueTaskAll;

    // if(transferControl == '1' && isContinueTaskAll){
    //   isShowFromTaskAll && this.dealComponent.moveStage(this.dataSelected);
    //   !isShowFromTaskAll && this.handleMoveStage( this.completedAllTasks(step),step.stepID);
    // }

    // if(transferControl == '2' && isContinueTaskEnd){
    //   isShowFromTaskEnd && this.dealComponent.moveStage(this.dataSelected);
    //   !isShowFromTaskEnd && this.handleMoveStage( this.completedAllTasks(step),step.stepID);
    // }
  }
  saveAssignTask(e) {
    // if(e) this.saveAssign.emit(e);
  }

  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.detectChanges();
  }
}
