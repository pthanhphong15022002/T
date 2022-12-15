import { SettingCalendarService } from './setting-calender.service';
import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  Input,
} from '@angular/core';
import {
  UIComponent,
  FormModel,
  ViewType,
  ViewModel,
  ViewsComponent,
  ResourceModel,
} from 'codx-core';
import { PopupAddCalendarComponent } from './popup-add-calendar/popup-add-calendar.component';
import { PopupSettingCalendarComponent } from './popup-setting-calendar/popup-setting-calendar.component';

@Component({
  selector: 'setting-calendar',
  templateUrl: './setting-calendar.component.html',
  styleUrls: ['./setting-calendar.component.scss'],
})
export class SettingCalendarComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('view') viewOrg!: ViewsComponent;
  views: Array<ViewModel> | any = [];
  funcID: string;
  calendarID: string;
  calendarName: string;
  dayWeek = [];
  daysOff = [];
  formModel: FormModel;
  @Input() fields = {
    id: 'recID',
    subject: { name: 'memo' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
  };
  @Input() request?: ResourceModel;
  @Input() resources!: any;
  @Input() showHeader = true;
  @Input() resourceModel!: any;

  constructor(
    private injector: Injector,
    private settingCalendar: SettingCalendarService
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    this.cache.functionList(this.funcID).subscribe((res) => {
      this.getParams(res.module + 'Parameters', 'CalendarID');
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.calendar,
        active: true,
        sameData: false,
        model: {
          eventModel: this.fields,
          template3: this.cellTemplate,
          resources: this.resources,
          resourceModel: this.resourceModel,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  getParams(formName: string, fieldName: string) {
    this.settingCalendar.getParams(formName, fieldName).subscribe((res) => {
      if (res) {
        let dataValue = res[0].dataValue;
        let json = JSON.parse(dataValue);
        if (json.CalendarID && json.CalendarID == '') {
          this.calendarID = 'STD';
        } else {
          this.calendarID = json.CalendarID;
        }
        this.getDayWeek(this.calendarID);
        this.getDaysOff(this.calendarID);
        this.detectorRef.detectChanges();
      }
    });
  }

  getDayWeek(calendarID: string) {
    this.settingCalendar.getDayWeek(calendarID).subscribe((res) => {
      if (res) {
        this.dayWeek = res;
        (
          this.viewOrg.currentView as any
        )?.schedule?.scheduleObj?.first?.refresh();
      }
    });
  }

  getDaysOff(calendarID: string) {
    this.settingCalendar.getDaysOff(calendarID).subscribe((res) => {
      if (res) {
        this.daysOff = res;
        (
          this.viewOrg.currentView as any
        )?.schedule?.scheduleObj?.first?.refresh();
      }
    });
  }

  getCellContent(evt: any): string {
    if (this.daysOff.length > 0) {
      for (let i = 0; i < this.daysOff.length; i++) {
        let day = new Date(this.daysOff[i].calendarDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.color = this.daysOff[i].dayoffColor;
              (item as any).style.backgroundColor =
                this.daysOff[i].dayoffColor + '30';
            });
          }
          let content =
            '<div class="d-flex justify-content-between"><span >' +
            this.daysOff[i].note +
            '</span>' +
            '<span class="' +
            this.daysOff[i].symbol +
            '"></span></div>';
          return content;
        }
      }
    }
    return ``;
  }

  changeCombobox(event) {
    event.data == ''
      ? (this.calendarID = 'STD')
      : (this.calendarID = event.data);
    this.getDaysOff(this.calendarID);
    this.detectorRef.detectChanges();
  }

  addCalendar() {
    this.callfc.openForm(
      PopupAddCalendarComponent,
      'Tạo lịch làm việc',
      500,
      360,
      '',
      [this.formModel, this.calendarID]
    );
  }

  openCalendarSettings() {
    this.callfc.openForm(PopupSettingCalendarComponent, '', 1200, 1000, '', [
      this.formModel,
      this.calendarID,
    ]);
  }

  reloadCalendar() {
    alert('trigger');
    (this.viewOrg.currentView as any).schedule?.scheduleObj?.first?.refresh();
  }

  moreMF(functionID, data) {
    switch (functionID) {
      case 'edit':
        this.onUpdate(data);
        break;
      case 'delete':
        this.onDelete(data);
        break;
      case 'copy':
        this.onCopy(data);
        break;
    }
  }

  onUpdate(data) {}

  onDelete(data) {}

  onCopy(data) {}

  onAction(event) {
    if (event) debugger;
  }
}
