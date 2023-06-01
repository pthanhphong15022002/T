import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel, SidebarModel } from 'codx-core';
import { PopupAddCmCustomerComponent } from '../../../cmcustomer/popup-add-cmcustomer/popup-add-cmcustomer.component';
import { CodxCmService } from '../../../codx-cm.service';
import { CodxViewTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-view-task/codx-view-task.component';
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';

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
  titleAction: string = '';
  listStep = [];
  isUpdate = true; //xư lý cho edit trung tuy chinh ko
  listStepsProcess = [];
  listCategory = [];

  ganttDs = [];
  ganttDsClone = [];
  timelineSettings: any;
  ownerInstance: string[] = [];
  columns = [
    { field: 'name', headerText: 'Tên', width: '250' },
    { field: 'startDate', headerText: 'Ngày bắt đầu' },
    { field: 'endDate', headerText: 'Ngày kết thúc' },
  ];
  taskFields = {
    id: 'recID',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    type: 'type',
    color: 'color',
  };
  // titleDefault= "Trường tùy chỉnh"//truyen vay da
  readonly tabInformation: string = 'Information';
  readonly tabField: string = 'Field';
  readonly tabContact: string = 'Contact';
  readonly tabOpponent: string = 'Opponent';
  readonly tabTask: string = 'Task';
  readonly tabProduct: string = 'Product';
  readonly tabGanttChart: string = 'GanttChart';


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

  constructor(private inject: Injector, private codxCmService: CodxCmService) {
    super(inject);

  }
  ngAfterViewInit() {}
  onInit(): void {
    this.executeApiCalls();
  }

  ngOnChanges(changes: SimpleChanges){
    //nvthuan
    if(changes.dataSelected){
      this.getListInstanceStep();
    //  this.dataSelected? = ch
    //  this.getListContactByObjectID(this.dataSelected?.recID);
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
    var data = [this.dataSelected?.refID,this.dataSelected?.processID,this.dataSelected?.status];
      this.codxCmService.getStepInstance(data).subscribe((res) => {
        this.listStep = res;
        this.checkCompletedInstance(this.dataSelected?.status);
      });
  }

  // getListContactByObjectID(objectID) {
  //   this.codxCmService.getListContactByObjectID(objectID).subscribe((res) => {
  //     if (res && res.length > 0) {
  //       this.listContacts = res;
  //       this.contactPerson = this.listContacts.find((x) => x.isDefault);
  //     }
  //   });
  // }

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

  getNameCategory(categoryId:string) {
    return this.listCategory.filter(x=> x.value == categoryId)[0]?.text;
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

  getColor(recID) {
    var idx = this.ganttDs.findIndex((x) => x.recID == recID);
    return this.ganttDs[idx]?.color;
  }

   //ganttchar
   getDataGanttChart(instanceID, processID) {
    this.api
      .exec<any>('DP', 'InstanceStepsBusiness', 'GetDataGanntChartAsync', [
        instanceID,
        processID,
      ])
      .subscribe((res) => {
        if (res && res?.length > 0) {
          this.ganttDs = res;
          this.ganttDsClone = JSON.parse(JSON.stringify(this.ganttDs));
          let test = this.ganttDsClone.map((i) => {
            return {
              name: i.name,
              start: i.startDate,
              end: i.endDate,
            };
          });
        }
      });
  }

  clickDetailGanchart(recID) {
    let data = this.ganttDsClone?.find((item) => item.recID === recID);
    if (data) {
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      let listData = {
        value: data,
        listIdRoleInstance: this.ownerInstance,
        type: data?.type,
      };
      let option = new SidebarModel();
      option.Width = '550px';
      option.zIndex = 1011;
      option.FormModel = frmModel;
      let dialog = this.callfc.openSide(
        CodxViewTaskComponent,
        listData,
        option
      );
      dialog.closed.subscribe((data) => {
        let dataProgress = data?.event;
        if (dataProgress) {
          let stepFind = this.listSteps.find(
            (step) => step.recID == dataProgress?.stepID
          );
          if (stepFind) {
            if (dataProgress?.type == 'P') {
              stepFind.progress = dataProgress?.progressStep;
              stepFind.note = dataProgress?.note;
              stepFind.actualEnd = dataProgress?.actualEnd;
            } else if (dataProgress?.type == 'G') {
              let groupFind = stepFind?.taskGroups?.find(
                (group) => group?.recID == dataProgress?.groupTaskID
              );
              if (groupFind) {
                groupFind.progress = dataProgress?.progressGroupTask;
                groupFind.note = dataProgress?.note;
                groupFind.actualEnd = dataProgress?.actualEnd;
                if (dataProgress?.isUpdate) {
                  stepFind.progress = dataProgress?.progressStep;
                }
              }
            } else {
              let taskFind = stepFind?.tasks?.find(
                (task) => task?.recID == dataProgress?.taskID
              );
              if (taskFind) {
                taskFind.progress = dataProgress?.progressTask;
                taskFind.note = dataProgress?.note;
                taskFind.actualEnd = dataProgress?.actualEnd;
                if (dataProgress?.isUpdate) {
                  let groupFind = stepFind?.taskGroups?.find(
                    (group) => group?.recID == dataProgress?.groupTaskID
                  );
                  if (groupFind) {
                    groupFind.progress = dataProgress?.progressGroupTask;
                  }
                  stepFind.progress = dataProgress?.progressStep;
                }
              }
            }
          }
        }
        console.log(dataProgress?.event);
      });
    }
  }
}
