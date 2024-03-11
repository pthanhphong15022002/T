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
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';
import { firstValueFrom } from 'rxjs';
import { CodxViewTaskComponent } from '../codx-view-task/codx-view-task.component';

@Component({
  selector: 'codx-step-chart',
  templateUrl: './codx-step-chart.component.html',
  styleUrls: ['./codx-step-chart.component.scss'],
})
export class CodxStepChartComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() ganttDs = [];
  @Input() instance;
  @Input() typeTime;
  @Input() listInstanceStep;
  @Input() isShowTypeTime = true;
  @Input() isRoleAll = true;
  @Input() listSteps: DP_Instances_Steps[] = [];
  @Input() type = 'DP' || 'CM';

  crrViewGant = 'W';
  vllViewGannt = 'DP042';
  ganttDsClone = [];
  timelineSettings: any;
  ownerInstance: string[] = [];
  listColor = [];
  listTypeTask = [];
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
  formModelInstances = {
    functionID: 'DP21',
    formName: 'DPInstances',
    entityName: 'DP_Instances',
    gridViewName: 'grvDPInstances',
  };

  tags = '';
  //#region timelineSettingsHour
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
  //#endregion
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
  onInit(): void {
    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.instance) {
      let instanceID =
        this.type == 'DP' ? this.instance?.recID : this.instance?.refID;
      this.getDataGanttChart(instanceID, this.instance?.processID);
    }
    if (changes.typeTime) {
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
      .exec<any>('DP', 'InstancesStepsBusiness', 'GetDataGanntChartAsync', [
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
      if (data?.type == 'P') {
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
      } else if (data?.type == 'G') {
        for (var i = idxCrr + 1; i < this.ganttDsClone.length; i++) {
          if (this.ganttDsClone[i]?.type == 'T') {
            if (listRefIDAssign && listRefIDAssign.trim() != '')
              listRefIDAssign += ';' + this.ganttDsClone[i].recID;
            else listRefIDAssign = this.ganttDsClone[i].recID;
          } else break;
        }
      } else {
        listRefIDAssign = data.recID;
      }
      //end
      let instanceStep: DP_Instances_Steps;
      if (data?.type == 'P') {
        instanceStep = this.listInstanceStep?.find(
          (step) => (step.recID = data.recID)
        );
      } else {
        instanceStep = this.listInstanceStep?.find(
          (step) => (step.recID = data.stepID)
        );
      }

      let listData = {
        value: data,
        listIdRoleInstance: this.ownerInstance,
        type: data?.type,
        listRefIDAssign: listRefIDAssign,
        isRoleAll: data?.isRole,
        instanceStep: instanceStep,
        isOnlyView: data?.isOnlyView,
        isUpdateProgressGroup: data?.progressTaskGroupControl,
        isUpdateProgressStep: data?.progressStepControl,
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
        let value = data?.event;
        if (value?.group || value?.task) {
          this.getDataGanttChart(
            this.instance?.refID || this.instance?.recID,
            this.instance?.processID
          );
        }
      });
    }
  }

  changeViewTimeGant(e) {
    this.crrViewGant = e?.data;
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
