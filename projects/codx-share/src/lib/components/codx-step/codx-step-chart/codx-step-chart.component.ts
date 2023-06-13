import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-gantt';
import { UIComponent, FormModel, SidebarModel } from 'codx-core';
import { CodxViewTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-view-task/codx-view-task.component';
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';


@Component({
  selector: 'codx-step-chart',
  templateUrl: './codx-step-chart.component.html',
  styleUrls: ['./codx-step-chart.component.scss']
})
export class CodxStepChartComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() ganttDs = [];
  @Input() dataSelected;
  @Input() typeTime;
  @Input() listSteps: DP_Instances_Steps[] = [];

  crrViewGant = 'W';
  vllViewGannt = 'DP042';
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

  tags = '';
  timelineSettingsHour: any = {
    topTier: {
      unit: 'Day',
      formatter: (date: Date) => {
        let day = date.getDay();
        let text = '';
        if (day == 0) {
          text = 'Chủ nhật';
        }
        if (day == 1) {
          text = 'Thứ Hai';
        }
        if (day == 2) {
          text = 'Thứ Ba';
        }
        if (day == 3) {
          text = 'Thứ Tư';
        }
        if (day == 4) {
          text = 'Thứ Năm';
        }
        if (day == 5) {
          text = 'Thứ Sáu';
        }
        if (day == 6) {
          text = 'Thứ Bảy';
        }
        return `${text} ( ${date.toLocaleDateString()} )`; // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Hour',
      //format: 'HH',
      formatter: (h: Date) => {
        return h.getHours();
      },
    },
    timelineUnitSize: 25,
  };
  timelineSettingsDays = {
    topTier: {
      unit: 'Month',
      formatter: (date: Date) => {
        return 'Tháng ' + (date.getMonth() + 1) + '-' + date.getFullYear(); // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Day',
      count: 1,
      formatter: (date: Date) => {
        let day = date.getDay();
        let text = '';
        if (day == 0) {
          text = 'Chủ nhật';
        }
        if (day == 1) {
          text = 'Thứ Hai';
        }
        if (day == 2) {
          text = 'Thứ Ba';
        }
        if (day == 3) {
          text = 'Thứ Tư';
        }
        if (day == 4) {
          text = 'Thứ Năm';
        }
        if (day == 5) {
          text = 'Thứ Sáu';
        }
        if (day == 6) {
          text = 'Thứ Bảy';
        }
        return `${text} ( ${date.toLocaleDateString()} )`;
      },
    },
    timelineUnitSize: 150,
  };
  timelineSettingsWeek = {
    topTier: {
      unit: 'Month',
      formatter: (date: Date) => {
        return 'Tháng ' + (date.getMonth() + 1) + '-' + date.getFullYear(); // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Week',
      count: 1,
      formatter: (date: Date) => {
        return date.toLocaleDateString();
      },
    },
    timelineUnitSize: 100,
  };
  timelineSettingsMonth = {
    topTier: {
      unit: 'Year',
      formatter: (date: Date) => {
        return date.getFullYear(); // format ngôn ngữ hỏi thương
      },
    },
    bottomTier: {
      unit: 'Month',
      count: 1,
      formatter: (date: Date) => {
        return 'Tháng ' + (date.getMonth() + 1);
      },
    },
    timelineUnitSize: 100,
  };

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
    private changeDetec: ChangeDetectorRef
  ) {
    super(inject);
  }
  ngAfterViewInit() {}
  onInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSelected) {
      this.getDataGanttChart(
        this.dataSelected?.refID,
        this.dataSelected?.processID
      );
      //  this.dataSelected? = ch
      //  this.getListContactByObjectID(this.dataSelected?.recID);
    }
    if(changes.typeTime){
      this.changeViewTimeGant(this.typeTime);
    }
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
    let idxCrr = this.ganttDsClone?.findIndex((item) => item.recID === recID);
    if (idxCrr != -1) {
      let data = this.ganttDsClone[idxCrr];
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      let listRefIDAssign = '';
      //a thao viết lấy ref listRefIDAssign
      switch (data?.type) {
        case 'T':
          listRefIDAssign = data.recID;
          break;
        case 'G':
          for (var i = idxCrr + 1; i < this.ganttDsClone.length; i++) {
            if (this.ganttDsClone[i]?.type == 'T') {
              if (listRefIDAssign && listRefIDAssign.trim() != '')
                listRefIDAssign += ';' + this.ganttDsClone[i].recID;
              else listRefIDAssign = this.ganttDsClone[i].recID;
            } else break;
          }
          break;
        case 'P':
          for (var i = idxCrr + 1; i < this.ganttDsClone.length; i++) {
           
            if (this.ganttDsClone[i]?.type == 'G') {
              continue;
            } else if (this.ganttDsClone[i]?.type == 'T') {
              if (listRefIDAssign && listRefIDAssign.trim() != '')
                listRefIDAssign += ';' + this.ganttDsClone[i].recID;
              else listRefIDAssign = this.ganttDsClone[i].recID;
            } else break;
          }
            //thieu cong task ngooai mai hoir thuan de xets
          break;
      }
      //end
      let listData = {
        value: data,
        listIdRoleInstance: this.ownerInstance,
        type: data?.type,
        listRefIDAssign: listRefIDAssign,
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

  changeViewTimeGant(e) {
    this.crrViewGant = e.data;
    switch (this.crrViewGant) {
      case 'D':
        this.timelineSettings = this.timelineSettingsDays;
        break;
      case 'H':
        this.timelineSettings = this.timelineSettingsHour;
        break;
      case 'W':
        this.timelineSettings = this.timelineSettingsWeek;
        break;
      case 'M':
        this.timelineSettings = this.timelineSettingsMonth;
        break;
    }
    this.changeDetec.detectChanges();
  }
}
