import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-grids';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';

@Component({
  selector: 'share-view-gantt-chart',
  templateUrl: './view-gantt-chart.component.html',
  styleUrls: ['./view-gantt-chart.component.css'],
})
export class ViewGanttChartComponent implements OnInit, AfterViewInit {
  @Input() formModel: any;
  @Input() vllStatus = 'TM007'; //'TM007'; //TM004
  @Input() dataObj: any;
  @Input() showMoreFunc = true;

  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() changeMoreFunction = new EventEmitter<any>();
  @Output() viewTask = new EventEmitter<any>();
  dataGanttChart = [
    {
      id: '121212121212121212',
      taskName: 'taskName',
      startDate: '08/01/2024',
      endDate: '09/01/2024',
      status: '05',
    },
  ]; //tesst
  listStatusTask = [];
  //setting gannt chart
  taskFields = {
    id: 'recID',
    taskName: 'taskName',
    startDate: 'startDate',
    endDate: 'endDate',
    status: 'status',
  };
  vllViewGannt = 'DP042';
  vllPriority = 'TM005';

  crrViewGant = 'W';
  columns = [
    { field: 'taskName', headerText: 'Tên công việc', width: '250' },
    { field: 'startDate', headerText: 'Ngày bắt đầu' },
    { field: 'endDate', headerText: 'Ngày kết thúc' },
  ];
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

  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };
  timelineSettings: any;

  constructor(
    private changeDecRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService
  ) {}
  ngOnInit(): void {
    this.cache.valueList(this.vllStatus).subscribe((vll) => {
      this.listStatusTask = vll?.datas;
    });
  }
  ngAfterViewInit(): void {}

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
    this.changeDecRef.detectChanges();
  }

  clickDetailGanchart(e) {}

  //ganttchar
  getDataGanttChart(instanceID, processID) {
    this.api
      .exec<any>('DP', 'InstancesStepsBusiness', 'GetDataGanntChartAsync', [
        instanceID,
        processID,
      ])
      .subscribe((res) => {
        if (res && res?.length > 0) {
          this.dataGanttChart = res;
          // this.ganttDsClone = JSON.parse(JSON.stringify(this.ganttDs));
          // let test = this.ganttDsClone.map((i) => {
          //   return {
          //     name: i.name,
          //     start: i.startDate,
          //     end: i.endDate,
          //   };
          // });
        }
      });
  }
}
