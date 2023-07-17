import { addClass } from '@syncfusion/ej2-base';
import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';
import {
  CacheService,
  DialogModel,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { CalendarCenterComponent } from './calendar-center/calendar-center.component';
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CodxCalendarService } from './codx-calendar.service';
import { CodxAddBookingCarComponent } from '../codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { PopupAddMeetingComponent } from '../codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { FormGroup } from '@angular/forms';
import { PopupAddComponent } from '../codx-tasks/popup-add/popup-add.component';
import { AddNoteComponent } from '../calendar-notes/add-note/add-note.component';
import { of, switchMap, take } from 'rxjs';
import {
  SpeedDialComponent,
  SpeedDialItemEventArgs,
  SpeedDialItemModel,
} from '@syncfusion/ej2-angular-buttons';
import { CodxAddBookingRoomComponent } from '../codx-booking/codx-add-booking-room/codx-add-booking-room.component';

@Component({
  selector: 'app-codx-calendar',
  templateUrl: './codx-calendar.component.html',
  styleUrls: ['./codx-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxCalendarComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('ejCalendar') ejCalendar!: CalendarComponent;
  @ViewChild('calendarCenter') calendarCenter!: CalendarCenterComponent;
  @ViewChild('speeddial') speeddial: SpeedDialComponent;

  dataResourceModel = [];
  request?: ResourceModel;
  views: Array<ViewModel> = [];
  calendarParams = {};
  dateChange = new Date();
  FDdate = new Date();
  lstDOWeek = [];
  typeNavigate = 'Month';
  defaultCalendar;
  calendarData = [];
  calendarTempData = [];
  locale = 'vi';
  fields: Object;
  calendarType: string;
  calendarTypes = [];
  resources = [];

  roomFM: FormModel;
  roomFG: FormGroup;
  addRoomTitle = '';

  carFM: FormModel;
  carFG: FormGroup;
  addCarTitle = '';

  meetingFM: FormModel;
  meetingFG: FormGroup;
  //addMeetingTitle = '';

  myTaskFM: FormModel;
  myTaskFG: FormGroup;
  //addMyTaskTitle = '';

  assignTaskFM: FormModel;
  assignTaskFG: FormGroup;

  items: SpeedDialItemModel[] = [];

  isUpdated = false;

  //calendar cell date
  cellStart = null;
  cellEnd = null;
  isChangeMonth = true;
  permission = '';
  settings = {};

  constructor(
    injector: Injector,
    private calendarService: CodxCalendarService,
    private cacheService: CacheService,
    private notificationsService: NotificationsService
  ) {
    super(injector);
    this.roomFM = new FormModel();
    this.carFM = new FormModel();
    this.meetingFM = new FormModel();
    this.myTaskFM = new FormModel();
    this.assignTaskFM = new FormModel();
    this.fields = { text: 'defaultName', value: 'functionID' };
  }

  onInit(): void {
    //Get parameters of calendar
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetParamMyCalendarAsync',
        'WPCalendars'
      )
      .subscribe((res: any) => {
        if (res) {
          for (const prop in res) {
            let param = JSON.parse(res[prop]);
            this.resources.push({
              color: param.ShowBackground,
              borderColor: param.ShowColor,
              text: param.Template.TransType,
              status: param.Template.TransType,
            });

            if (res.hasOwnProperty(prop)) {
              this.calendarParams[prop] = JSON.parse(res[prop]);
              this.settings[prop] = param.Predicate;
            }
          }
        }
      });
    this.navigate();
    this.getCalendarTypes();
    this.getCalendarNotes();
    //Get the list allowed and data of default calendar(COT03)
    // this.api
    //   .exec('CO', 'CalendarsBusiness', 'GetListCalendarAsync')
    //   .pipe(
    //     switchMap((res: any) => {
    //       if (res) {
    //         this.calendarTypes = res;
    //         this.defaultCalendar = 'COT03';
    //         return this.api.exec(
    //           'CO',
    //           'CalendarsBusiness',
    //           'GetCalendarDataAsync',
    //           [this.defaultCalendar]
    //         );
    //       }
    //       return null;
    //     }),
    //     take(1)
    //   )
    //   .subscribe((res: any) => {
    //     if (res) {
    //       this.getDataAfterAddEvent(res);
    //       this.getCalendarNotes();
    //       this.navigate();
    //     }
    //   });

    let myInterval = setInterval(() => {
      if (this.speeddial) {
        clearInterval(myInterval);
        this.cacheService.valueList('WP006').subscribe((res) => {
          for (const data of res.datas) {
            if (this.calendarParams.hasOwnProperty(data.value)) {
              this.items.push({ id: data.value, text: data.text });
            }
          }
          this.speeddial.items = this.items;
          this.speeddial.refresh();
        });
      }
    });
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

    this.calendarService.getFormModel(EPCONST.FUNCID.R_Bookings).then((res) => {
      this.roomFM = res;
      this.roomFG = this.codxService.buildFormGroup(
        this.roomFM?.formName,
        this.roomFM?.gridViewName
      );
    });

    this.cache.functionList(EPCONST.FUNCID.R_Bookings).subscribe((res) => {
      if (res) {
        this.addRoomTitle = res?.customName?.toString();
      }
    });

    this.calendarService.getFormModel(EPCONST.FUNCID.C_Bookings).then((res) => {
      this.carFM = res;
      this.carFG = this.codxService.buildFormGroup(
        this.carFM?.formName,
        this.carFM?.gridViewName
      );
    });

    this.cache.functionList(EPCONST.FUNCID.C_Bookings).subscribe((res) => {
      if (res) {
        this.addCarTitle = res?.customName?.toString();
      }
    });

    this.calendarService.getFormModel('TMT0501').then((res) => {
      this.meetingFM = res;
      this.meetingFG = this.codxService.buildFormGroup(
        this.meetingFM?.formName,
        this.meetingFM?.gridViewName
      );
    });

    this.calendarService.getFormModel('TMT0201').then((res) => {
      this.myTaskFM = res;
      this.myTaskFG = this.codxService.buildFormGroup(
        this.myTaskFM?.formName,
        this.myTaskFM?.gridViewName
      );
    });

    this.calendarService.getFormModel('TMT0203').then((res) => {
      this.assignTaskFM = res;
      this.assignTaskFG = this.codxService.buildFormGroup(
        this.assignTaskFM?.formName,
        this.assignTaskFM?.gridViewName
      );
    });
  }

  firstime() {
    console.log('firsttime start end' + this.cellStart + ' ' + this.cellEnd);

    this.getCalendarData();
  }

  onCreate() {
    let footerElement: HTMLElement = document.getElementsByClassName(
      'e-icon-container'
    )[0] as HTMLElement;
    let btn: HTMLElement = document.createElement('button');
    let proxy = this;

    //remove footer of ejs-calendar
    document
      .querySelector('ejs-calendar')
      .removeChild(document.querySelector('.e-footer-container'));

    //creates the custom element for setToday button
    btn.className = 'e-btn e-today e-flat e-css';
    btn.setAttribute('type', 'button');
    btn.textContent = 'Today';
    footerElement.appendChild(btn);
    footerElement.insertBefore(btn, footerElement.children[1]);

    // custom click handler to update the value property with null values.
    document
      .querySelector('.e-icon-container .e-today')
      .addEventListener('click', function () {
        proxy.ejCalendar.value = new Date();
      });
  }

  getCalendarTypes() {
    this.api
      .exec('CO', 'CalendarsBusiness', 'GetListCalendarAsync')
      .subscribe((res: any) => {
        if (res) {
          this.calendarTypes = res;
          this.defaultCalendar = 'COT03';
          this.calendarType = this.defaultCalendar;
          this.detectorRef.detectChanges();
        }
      });
  }
  navigate() {
    this.calendarService.dateChange$.subscribe((res) => {
      if (res?.fromDate === 'Invalid Date' && res?.toDate === 'Invalid Date') {
        return;
      }

      if (this.dateChange >= res?.fromDate && this.dateChange < res?.toDate) {
        return;
      }
      if (res?.fromDate && res?.toDate) {
        if (res?.type) {
          this.typeNavigate = res.type;
        }
        if (this.typeNavigate === 'Year') {
          this.dateChange = this.FDdate;
        } else {
          this.dateChange = res.fromDate;
        }
        if (this.typeNavigate === 'Year' && res.type === undefined) {
          this.dateChange = res?.toDate;
          return;
        }
      }
    });
  }

  changeDayOfMonth(args) {
    this.FDdate = args.value;
    args['date'] = args.value;
    let crrDate = moment(this.FDdate)
      .startOf('month')
      .add(1, 'day')
      .toISOString();
    let newDate = moment(args.value)
      .startOf('month')
      .add(1, 'day')
      .toISOString();
    this.FDdate = args.value;
    if (crrDate !== newDate) {
      this.changeNewMonth(args);
    } else {
      if (
        this.typeNavigate === 'Day' ||
        this.typeNavigate === 'Week' ||
        this.typeNavigate === 'WorkWeek' ||
        this.typeNavigate === 'Month' ||
        this.typeNavigate === 'Agenda' ||
        this.typeNavigate === 'MonthAgenda'
      ) {
        this.changeNewMonth(args);
      }
    }
  }

  changeNewMonth(args) {
    this.FDdate = args.date;
    console.log('start end ' + this.cellStart + ' ' + this.cellEnd);
    this.getCalendarData();
    this.cellStart = null;
    let ele = document.getElementsByTagName('codx-schedule')[0];
    if (ele) {
      let scheduleEle = ele.querySelector('ejs-schedule');
      if ((scheduleEle as any).ej2_instances[0]) {
        (scheduleEle as any).ej2_instances[0].selectedDate = new Date(
          this.FDdate
        );
      }
    }
  }

  updateSettingValue(e) {
    if (!this.isUpdated) {
      let transType = e.field;
      let value = e.data;

      if (value === false) value = '0';
      else value = '1';

      // this.api
      //   .exec<any>(
      //     'ERM.Business.SYS',
      //     'SettingValuesBusiness',
      //     'AddUpdateByUserIDAsync',
      //     ['WPCalendars', transType, value]
      //   )
      //   .subscribe((res) => {
      //     if (res) {
      //       if (value === '0') {
      //         this.calendarTempData = this.calendarTempData.filter((x) => {
      //           return x.transType !== transType;
      //         });
      //       }
      //       if (value === '1') {
      //         this.calendarTempData.push(
      //           ...this.calendarData.filter((x) => {
      //             return x.transType === transType;
      //           })
      //         );
      //       }

      //       if (this.ejCalendar) {
      //         this.ejCalendar.refresh();
      //         this.ejCalendar.value = this.FDdate;
      //       }

      //       this.calendarService.calendarData$.next(this.calendarTempData);

      //       this.api
      //         .execSv(
      //           'SYS',
      //           'ERM.Business.SYS',
      //           'SettingValuesBusiness',
      //           'GetParamMyCalendarAsync',
      //           'WPCalendars'
      //         )
      //         .subscribe((res: any) => {
      //           if (res) {
      //             for (const prop in res) {
      //               if (res.hasOwnProperty(prop)) {
      //                 this.calendarParams[prop] = JSON.parse(res[prop]);
      //               }
      //             }
      //           }
      //         });
      //     }
      //   });
      this.calendarParams[transType].ShowEvent = value;
      if (value === '0') {
        this.calendarTempData = this.calendarTempData.filter((x) => {
          return x.transType !== transType;
        });
      }
      if (value === '1') {
        this.calendarTempData.push(
          ...this.calendarData.filter((x) => {
            return x.transType === transType;
          })
        );
      }

      if (this.ejCalendar) {
        this.ejCalendar.refresh();
        this.ejCalendar.value = this.FDdate;
      }

      this.calendarService.calendarData$.next(this.calendarTempData);

      // this.api
      //   .execSv(
      //     'SYS',
      //     'ERM.Business.SYS',
      //     'SettingValuesBusiness',
      //     'GetParamMyCalendarAsync',
      //     'WPCalendars'
      //   )
      //   .subscribe((res: any) => {
      //     if (res) {
      //       for (const prop in res) {
      //         if (res.hasOwnProperty(prop)) {
      //           this.calendarParams[prop] = JSON.parse(res[prop]);
      //         }
      //       }
      //     }
      //   });
      this.isUpdated = true;
    } else {
      this.isUpdated = false;
    }
  }

  filterCalendar() {}

  settingCalendar() {}

  convertStrToDate(eleDate) {
    if (eleDate) {
      let str = eleDate.title.split(',');
      let strMonth: any = str[1].split('Tháng');
      let numb: any = strMonth[1] + '-' + strMonth[0];
      numb = numb + '-' + str[2];
      return numb.replaceAll(' ', '');
    }
  }

  getCalendarNotes() {
    if (this.calendarCenter) {
      this.calendarCenter.resources = this.resources;
    }

    this.calendarService.calendarData$.subscribe((res) => {
      if (res) {
        this.calendarCenter && this.calendarCenter.updateData(res);
      }
    });
  }

  onLoad(args) {
    if (this.isChangeMonth) {
      if (this.cellStart == null) {
        this.cellStart = args.date;
      }
      this.cellEnd = args.date;
    } else if (this.cellEnd.toDateString() == args.date.toDateString()) {
      this.cellStart = null;
      this.isChangeMonth = true;
    }

    if (this.calendarTempData.length > 0) {
      for (let i = 0; i < this.calendarTempData.length; i++) {
        let day = new Date(this.calendarTempData[i].startDate);
        if (
          day &&
          args.date.getFullYear() === day.getFullYear() &&
          args.date.getMonth() === day.getMonth() &&
          args.date.getDate() === day.getDate()
        ) {
          let span: HTMLElement;
          span = document.createElement('span');
          span.setAttribute('class', 'e-icons highlight');
          addClass([args.element], ['special', 'e-day']);
          args.element.appendChild(span);
          return;
        }
      }
    }
  }

  getCalendarData(event = null): void {
    if (event == null) {
      event = {
        value: this.calendarType,
      };
    }
    let calendarType = event.value;
    //reset data
    this.calendarService.calendarData$.next([]);
    this.api
      .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [
        calendarType,
        this.cellStart,
        this.cellEnd,
        this.settings,
      ])
      .subscribe((res: any) => {
        if (res) {
          this.calendarType = calendarType;
          this.cellStart = null;
          this.getDataAfterAddEvent(res);
        }
      });
  }

  // getCalendarTasks(){
  //   this.api.exec("ERM.Business.TM", "TaskBusiness", "GetCalendarEventsAsync", [this.permission]).subscribe(res =>{
  //     if (res){
  //       this.calendarData.push(res);
  //     }
  //   })
  // }
  // getCalendarMeetings(){
  //   this.api.exec("ERM.Business.CO", "MeetingsBusiness", "GetCalendarEventsAsync" []).subscribe(res =>{
  //     if (res){
  //       this.calendarData.push(res);
  //     }
  //   })
  // }
  // getCalendarNotes(){
  //   this.api.exec("ERM.Business.WP", "NotesBusiness", "GetCalendarEventsAsync", []).subscribe(res =>{
  //     if (res){
  //       this.calendarData.push(res);
  //     }
  //   })
  // }
  // getCalendarBooking(){
  //   this.api.exec("ERM.Business.EP", "BookingsBusiness", "GetCalendarEventsAsync", []).subscribe(res =>{
  //     if (res){
  //       this.calendarData.push(res);
  //     }
  //   })
  // }

  onFiltering(e: FilteringEventArgs) {
    let query = new Query();
    //frame the query based on search string with filter type.
    query =
      e.text != ''
        ? query.where('defaultName', 'startswith', e.text, true)
        : query;
    //pass the filter data source, filter query to updateData method.
    e.updateData(this.calendarTypes, query);
  }

  //#region Save & reset parameters setting
  saveParams() {}

  resetParams() {}
  //#endregion

  //#region Add event from module on calendar
  addEvent(args: SpeedDialItemEventArgs) {
    let transType = args.item.id;

    this.calendarService
      .checkPermission(transType, '')
      .subscribe((res: boolean) => {
        if (res && res === true) {
          switch (transType) {
            case 'EP_BookingCars':
              this.addBookingCar();
              break;

            case 'EP_BookingRooms':
              this.addBookingRoom();
              break;

            case 'WP_Notes':
              this.addNote();
              break;

            case 'CO_Meetings':
              this.addMeeting();
              break;

            case 'TM_MyTasks':
              this.addMyTask();
              break;

            case 'TM_AssignTasks':
              this.addAssignTask();
              break;
          }
        } else {
          this.notificationsService.notifyCode('SYS032');
        }
      });
  }

  addBookingCar() {
    let option = new SidebarModel();
    option.FormModel = this.carFM;
    option.Width = '800px';
    this.callfc
      .openSide(
        CodxAddBookingCarComponent,
        [this.carFG?.value, 'SYS01', this.addCarTitle, null, null, false],
        option
      )
      .closed.subscribe((returnData) => {
        if (!this.calendarType) {
          this.calendarType = this.defaultCalendar;
        }
        if (returnData.event) {
          this.api
            .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [
              this.calendarType,
            ])
            .subscribe((res: any) => {
              if (res) {
                this.getDataAfterAddEvent(res);
              }
              this.detectorRef.detectChanges();
            });
        }
      });
  }

  addBookingRoom() {
    let option = new SidebarModel();
    option.FormModel = this.roomFM;
    option.Width = '800px';
    this.callfc
      .openSide(
        CodxAddBookingRoomComponent,
        [this.roomFG?.value, 'SYS01', this.addRoomTitle, null, null, false],
        option
      )
      .closed.subscribe((returnData) => {
        if (!this.calendarType) {
          this.calendarType = this.defaultCalendar;
        }
        if (returnData.event) {
          this.api
            .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [
              this.calendarType,
            ])
            .subscribe((res: any) => {
              if (res) {
                this.getDataAfterAddEvent(res);
              }
              this.detectorRef.detectChanges();
            });
        }
      });
  }

  addNote() {
    let obj = {
      //data: this.WP_Notes,
      // typeLst: this.typeList,
      formType: 'add',
      currentDate: new Date(),
      component: 'calendar-notes',
      maxPinNotes: '5',
    };

    let option = new DialogModel();
    // option.DataService = this.lstView.dataService as CRUDService;
    // option.FormModel = this.lstView.formModel;

    this.callfc
      .openForm(
        AddNoteComponent,
        'Thêm mới ghi chú',
        700,
        500,
        '',
        obj,
        '',
        option
      )
      .closed.subscribe((returnData) => {
        if (!this.calendarType) {
          this.calendarType = this.defaultCalendar;
        }
        if (returnData.event) {
          this.api
            .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [
              this.calendarType,
            ])
            .subscribe((res: any) => {
              if (res) {
                this.getDataAfterAddEvent(res);
              }
            });
        }
      });
  }

  addMeeting() {
    let option = new SidebarModel();
    option.FormModel = this.meetingFM;
    option.Width = 'Auto';

    this.api
      .execSv<any>('CO', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'TMT0501',
        'CO_Meetings',
      ])
      .subscribe((res) => {
        //VTHAO truyen lai cho tien
        let obj = {
          action: 'add',
          titleAction: 'Thêm', //Sỹ em ko dc gán cung cai này ? thay đổi ngôn ngữ lỗi á -a tạm copy lại của em để em chạy
          disabledProject: true,
          listPermissions: '',
          data: res.data,
          isOtherModule: true,
        };
        if (res) {
          this.callfc
            .openSide(
              PopupAddMeetingComponent,
              obj,
              // ['add', 'Thêm', true, '', res.data],
              option
            )
            .closed.subscribe((returnData) => {
              if (!this.calendarType) {
                this.calendarType = this.defaultCalendar;
              }
              if (returnData.event) {
                this.api
                  .exec('CO', 'CalendarsBusiness', 'GetCalendarDataAsync', [
                    this.calendarType,
                  ])
                  .subscribe((res: any) => {
                    if (res) {
                      this.getDataAfterAddEvent(res);
                    }
                  });
              }
            });
        }
      });
  }

  addMyTask() {
    let option = new SidebarModel();
    option.FormModel = this.myTaskFM;
    option.Width = '800px';
    option.zIndex = 1001;
    this.api
      .execSv<any>('TM', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'TMT0201',
        'TM_Tasks',
      ])
      .pipe(
        switchMap((res) => {
          let obj = {
            data: res.data,
            action: 'add',
            isAssignTask: false,
            titleAction: 'Thêm', ///cai nay em tu truyen theo more Fun text cua e
            functionID: 'TMT0201',
            disabledProject: false,
            isOtherModule: true, //tu modele khac truyn qua
          };
          return this.callfc.openSide(
            PopupAddComponent,
            obj,
            // [res.data, 'add', false, 'Thêm', 'TMT0201', null, false],
            option
          ).closed;
        }),
        switchMap((returnData) => {
          if (!this.calendarType) {
            this.calendarType = this.defaultCalendar;
          }
          if (returnData.event) {
            return this.api.exec(
              'CO',
              'CalendarsBusiness',
              'GetCalendarDataAsync',
              [this.calendarType]
            );
          }
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res) {
          this.getDataAfterAddEvent(res);
        }
      });
  }

  addAssignTask() {
    let option = new SidebarModel();
    option.FormModel = this.assignTaskFM;
    option.Width = '800px';
    this.api
      .execSv<any>('TM', 'Core', 'DataBusiness', 'GetDefaultAsync', [
        'TMT0203',
        'TM_Tasks',
      ])
      .pipe(
        switchMap((res) => {
          let obj = {
            data: res.data,
            action: 'add',
            isAssignTask: true,
            titleAction: 'Thêm', ///cai nay em tu truyen theo more Fun text cua e
            functionID: 'TMT0203',
            disabledProject: false,
            isOtherModule: true, //tu modele khac truyn qua
          };
          return this.callfc.openSide(
            PopupAddComponent,
            obj,
            // [res.data, 'add', true, 'Thêm', 'TMT0203', null, false, true],
            option
          ).closed;
        }),
        switchMap((returnData) => {
          if (!this.calendarType) {
            this.calendarType = this.defaultCalendar;
          }
          if (returnData.event) {
            return this.api.exec(
              'CO',
              'CalendarsBusiness',
              'GetCalendarDataAsync',
              [this.calendarType]
            );
          }
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res) {
          this.getDataAfterAddEvent(res);
        }
      });
  }

  getDataAfterAddEvent(data) {
    this.calendarData = data;
    this.calendarTempData = [...this.calendarData];
    for (let prop in this.calendarParams) {
      if (this.calendarParams[prop].ShowEvent === '0') {
        this.calendarTempData = this.calendarTempData.filter((x) => {
          return x.transType !== prop.toString();
        });
      }
    }
    this.calendarService.calendarData$.next(this.calendarTempData);
    this.isChangeMonth = false;
    this.ejCalendar.refresh();
    // this.api
    //   .execSv(
    //     'SYS',
    //     'ERM.Business.SYS',
    //     'SettingValuesBusiness',
    //     'GetParamMyCalendarAsync',
    //     'WPCalendars'
    //   )
    //   .subscribe((res: any) => {
    //     if (res) {
    //       for (const prop in res) {
    //         let param = JSON.parse(res[prop]);
    //         this.resources.push({
    //           color: param.ShowBackground,
    //           borderColor: param.ShowColor,
    //           text: param.Template.TransType,
    //           status: param.Template.TransType,
    //         });

    //         if (res.hasOwnProperty(prop)) {
    //           this.calendarParams[prop] = JSON.parse(res[prop]);
    //         }
    //       }

    //     }
    //   });
  }

  //#endregion
}
