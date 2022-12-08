import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { DialogData, DialogRef, ResourceModel, UIComponent } from 'codx-core';
import { SettingCalendarComponent } from '../../setting-calendar/setting-calendar.component';
import { CalendarNotesComponent } from '../calendar-notes.component';

@Component({
  selector: 'lib-detail-calendar',
  templateUrl: './detail-calendar.component.html',
  styleUrls: ['./detail-calendar.component.scss'],
})
export class DetailCalendarComponent extends UIComponent implements OnInit {
  headerText: any;
  dialog: DialogRef;
  funcID: any;
  fields = {
    id: 'TransID',
    subject: { name: 'Title' },
    startTime: { name: 'StartDate' },
    endTime: { name: 'EndDate' },
  };
  request?: ResourceModel;

  @ViewChild('calendar_notes', { read: ViewContainerRef })
  calendar_notes!: ViewContainerRef;
  @ViewChild('calendar_setting', { read: ViewContainerRef })
  calendar_setting!: ViewContainerRef;
  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.funcID = dt.data?.funcID;
  }

  onInit(): void {
    this.request = new ResourceModel();
    this.request.assemblyName = 'SYS';
    this.request.className = 'SettingValuesBusiness';
    this.request.service = 'SYS';
    this.request.method = 'GetDataByDateAsync';
    this.request.idField = 'recID';
    this.request.dataObj = 'WPCalendars';
  }

  ngAfterViewInit() {
    this.getCalendarNotes();
    this.getCalendarSetting();
  }

  getCalendarNotes() {
    var a = this.calendar_notes.createComponent(CalendarNotesComponent);
    a.instance.showHeader = false;
    a.instance.typeCalendar = 'month';
    a.instance.showList = false;
    a.instance.showListParam = true;
  }

  getCalendarSetting() {
    var a = this.calendar_setting.createComponent(SettingCalendarComponent);
    a.instance.funcID = this.funcID;
    a.instance.fields = this.fields;
    a.instance.request = this.request;
  }
}
