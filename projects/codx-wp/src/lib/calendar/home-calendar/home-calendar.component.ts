declare var window: any;
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
  CodxScheduleComponent,
  DialogData,
  DialogRef,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { CalendarNotesComponent } from 'projects/codx-share/src/lib/components/calendar-notes/calendar-notes.component';
import { SettingCalendarComponent } from 'projects/codx-share/src/lib/components/setting-calendar/setting-calendar.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

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
    private codxShareSV: CodxShareService,
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
  }

  getCalendarNotes() {
    let a = this.calendar_notes.createComponent(CalendarNotesComponent);
    a.instance.showHeader = false;
    a.instance.typeCalendar = 'month';
    a.instance.showList = false;
    a.instance.showListParam = true;
    let myInterval = setInterval(() => {
      if (a.instance.settingValue) {
        clearInterval(myInterval);
        let param = a.instance.settingValue;
        let TM_ = JSON.parse(param.TM_Tasks[1]);
        let WP_ = JSON.parse(param.WP_Notes[1]);
        let CO_ = JSON.parse(param.CO_Meetings[1]);
        let EP_BookingRooms_ = JSON.parse(param.EP_BookingRooms[1]);
        let EP_BookingCars_ = JSON.parse(param.EP_BookingCars[1]);
        var TM_Params = [
          {
            color: TM_.ShowBackground,
            borderColor: TM_.ShowColor,
            text: 'TM_Tasks',
            status: 'TM_Tasks',
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
        let myInterval1 = setInterval(() => {
          if (a.instance.dataResourceModel.length > 0) {
            clearInterval(myInterval1);
            this.getCalendarSetting(
              this.resources,
              a.instance.dataResourceModel
            );
          }
        });
      }
    });
  }

  getCalendarSetting(resource, dataResourceModel) {
    let a = this.calendar_setting.createComponent(SettingCalendarComponent);
    // a.instance.funcID = this.funcID;
    a.instance.fields = this.fields;
    a.instance.resources = resource;
    a.instance.resourceModel = dataResourceModel;
    this.codxShareSV.dataResourceModel.subscribe((res) => {
      if (res) {
        let ele = document.getElementsByTagName('codx-schedule')[0];
        if (ele) {
            console.log("check asdasd")
          let cmp = window.ng.getComponent(ele) as CodxScheduleComponent;
          cmp.dataSource = res;
          cmp.setEventSettings();
        }
      }
    });
  }
}
