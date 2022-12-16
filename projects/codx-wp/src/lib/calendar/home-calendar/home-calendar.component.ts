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
    id: 'transID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    status: 'transType',
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

  onInit(): void {}

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
        let TM_ = JSON.parse(
          this.tmpCalendarNote.instance.settingValue.TM_Tasks[1]
        );
        let WP_ = JSON.parse(
          this.tmpCalendarNote.instance.settingValue.WP_Notes[1]
        );
        let CO_ = JSON.parse(
          this.tmpCalendarNote.instance.settingValue.CO_Meetings[1]
        );
        let EP_BookingRooms_ = JSON.parse(
          this.tmpCalendarNote.instance.settingValue.EP_BookingRooms[1]
        );
        let EP_BookingCars_ = JSON.parse(
          this.tmpCalendarNote.instance.settingValue.EP_BookingCars[1]
        );
        var TM_Params = [
          {
            color: TM_.ShowBackground,
            borderColor: TM_.ShowColor,
            text: 'TM_Tasks',
            status: 'TM_MyTasks',
          },
        ];
        var WP_Params = [
          {
            color: WP_.ShowBackground,
            borderColor: WP_.ShowColor,
            text: 'WP_Notes',
            status: 'WP_Notes',
          },
        ];
        var CO_Params = [
          {
            color: CO_.ShowBackground,
            borderColor: CO_.ShowColor,
            text: 'CO_Meetings',
            status: 'CO_Meetings',
          },
        ];
        var EP_BookingRoomParams = [
          {
            color: EP_BookingRooms_.ShowBackground,
            borderColor: EP_BookingRooms_.ShowColor,
            text: 'EP_BookingRooms',
            status: 'EP_BookingRooms',
          },
        ];
        var EP_BookingCarParams = [
          {
            color: EP_BookingCars_.ShowBackground,
            borderColor: EP_BookingCars_.ShowColor,
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
    let myInterval = setInterval(() => {
      if (
        this.tmpCalendarNote.instance.dataResourceModel &&
        this.tmpCalendarNote.instance.dataResourceModel.length > 0
      ) {
        clearInterval(myInterval);
        a.instance.resourceModel =
          this.tmpCalendarNote.instance.dataResourceModel;
        debugger;
      }
    });
  }
}
