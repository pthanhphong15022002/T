import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DialogData,
  DialogRef,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CalendarNotesComponent } from 'projects/codx-share/src/lib/components/calendar-notes/calendar-notes.component';
import { SettingCalendarComponent } from 'projects/codx-share/src/lib/components/setting-calendar/setting-calendar.component';

@Component({
  selector: 'app-home-calendar',
  templateUrl: './home-calendar.component.html',
  styleUrls: ['./home-calendar.component.scss'],
})
export class HomeCalendarComponent extends UIComponent implements OnInit {
  headerText: any;
  dialog: DialogRef;
  funcID: any;
  fields = {
    id: 'TransID',
    subject: { name: 'Title' },
    startTime: { name: 'StartDate' },
    endTime: { name: 'EndDate' },
    status: 'TransType',
  };
  request?: ResourceModel;
  tmpCalendarNote: any;
  resources: any;

  @ViewChild('calendar_notes', { read: ViewContainerRef })
  calendar_notes!: ViewContainerRef;
  @ViewChild('calendar_setting', { read: ViewContainerRef })
  calendar_setting!: ViewContainerRef;
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  views: Array<ViewModel> = [];
  functionList: any;
  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.route.params.subscribe((params) => {
      if (params) {
        this.funcID = params['funcID'];
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) this.functionList = res;
        });
      }
    });
  }

  onInit(): void {
    // this.request = new ResourceModel();
    // this.request.assemblyName = 'SYS';
    // this.request.className = 'SettingValuesBusiness';
    // this.request.service = 'SYS';
    // this.request.method = 'GetDataByDateAsync';
    // this.request.idField = 'recID';
    // this.request.dataObj = 'WPCalendars';
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
    ];
    let myInterval_Calendar = setInterval(() => {
      if (this.calendar_notes) {
        clearInterval(myInterval_Calendar);
        this.getCalendarNotes();
      }
    }, 200);
    // let myInterval_SettingCalendar = setInterval(() => {
    //   if (this.calendar_notes) {
    //     clearInterval(myInterval_SettingCalendar);
    //     this.getCalendarSetting();
    //   }
    // }, 200);
  }

  getCalendarNotes() {
    this.tmpCalendarNote = this.calendar_notes.createComponent(
      CalendarNotesComponent
    );
    this.tmpCalendarNote.instance.showHeader = false;
    this.tmpCalendarNote.instance.typeCalendar = 'month';
    this.tmpCalendarNote.instance.showList = false;
    this.tmpCalendarNote.instance.showListParam = true;
    let myInterval = setInterval(() => {
      if (this.tmpCalendarNote.instance.settingValue) {
        clearInterval(myInterval);
        var TM_Params = [
          {
            color: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.TM_Tasks
            ).ShowBackground,
            borderColor: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.TM_Tasks
            ).ShowColor,
            text: 'TM_Tasks',
            status: 'TM_MyTasks',
          },
        ];
        var WP_Params = [
          {
            color: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.WP_Notes
            ).ShowBackground,
            borderColor: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.WP_Notes
            ).ShowColor,
            text: 'WP_Notes',
            status: 'WP_Notes',
          },
        ];
        var CO_Params = [
          {
            color: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.CO_Meetings
            ).ShowBackground,
            borderColor: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.CO_Meetings
            ).ShowColor,
            text: 'CO_Meetings',
            status: 'CO_Meetings',
          },
        ];
        var EP_BookingRoomParams = [
          {
            color: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.EP_BookingRooms
            ).ShowBackground,
            borderColor: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.EP_BookingRooms
            ).ShowColor,
            text: 'EP_BookingRooms',
            status: 'EP_BookingRooms',
          },
        ];
        var EP_BookingCarParams = [
          {
            color: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.EP_BookingCars
            ).ShowBackground,
            borderColor: JSON.parse(
              this.tmpCalendarNote.instance.settingValue.EP_BookingCars
            ).ShowColor,
            text: 'EP_BookingCars',
            status: 'EP_BookingCars',
          },
        ];
        this.resources = [
          ...TM_Params,
          ...WP_Params,
          ...CO_Params,
          ...EP_BookingRoomParams,
          ...EP_BookingCarParams,
        ];
        this.getCalendarSetting(this.resources);
      }
    });
  }

  getCalendarSetting(resource) {
    var a = this.calendar_setting.createComponent(SettingCalendarComponent);
    a.instance.funcID = this.funcID;
    a.instance.fields = this.fields;
    a.instance.request = this.request;
    a.instance.showHeader = false;
    a.instance.resources = resource;
    a.instance.resourceModel = this.tmpCalendarNote.instance.dataResourceModel;
    debugger
  }
}
