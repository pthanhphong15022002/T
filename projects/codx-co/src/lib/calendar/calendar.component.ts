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
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DataService,
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
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { FormGroup } from '@angular/forms';
import {
  SpeedDialComponent,
  SpeedDialItemEventArgs,
  SpeedDialItemModel,
} from '@syncfusion/ej2-angular-buttons';
import { CodxAddBookingCarComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { AddNoteComponent } from 'projects/codx-share/src/lib/components/calendar-notes/add-note/add-note.component';
import { PopupAddMeetingComponent } from 'projects/codx-share/src/lib/components/codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { PopupAddComponent } from 'projects/codx-share/src/lib/components/codx-tasks/popup-add/popup-add.component';
import { PopupSettingsComponent } from '../popup/popup-settings/popup-settings.component';
import { CodxCoService } from '../codx-co.service';
import { CO_EventModel } from './model/CO_EventModel';
import {  elementAt, forkJoin, map, of } from 'rxjs';
import { CodxAddBookingRoomComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-room/codx-add-booking-room.component';
import { Month } from '@syncfusion/ej2-angular-schedule';


@Component({
  selector: 'co-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class COCalendarComponent extends UIComponent implements AfterViewInit {
  
  roomFM: FormModel;
  roomFG: FormGroup;
  addRoomTitle = '';

  carFM: FormModel;
  carFG: FormGroup;
  addCarTitle = '';

  meetingFM: FormModel;
  meetingFG: FormGroup;


  myTaskFM: FormModel;
  myTaskFG: FormGroup;


  assignTaskFM: FormModel;
  assignTaskFG: FormGroup;

  //#region variable
  user:any = null;
  views: Array<ViewModel> = [];
  settingCalendars:any[] = [];
  typeNavigate = 'Month';
  defaultFuncID:string = 'COT03'; // lịch cá nhân
  locale:string = 'vi';
  calendarID:string = 'COT03';
  lstCalendars:any[] = [];
  dPredicate:any = {};
  dResources:any = {};
  statusColor:any[] = [];
  fromDate:Date = new Date();
  toDate:Date = new Date();
  lstEvents:any[] = [];
  lstResources:any[] = [];
  selectedDate:Date = null;
  sysMoreFunc:any[] = [];
  groupID:string = "";
  orgUnitID:string = "";
  dEventMonth:any = {};
  lstUserGroups:any[] = [];
  startDate:Date = null;
  endDate:Date = null;
  month:number = 0 // 0-11 
  speedDialItems: SpeedDialItemModel[] = [];
  hrRequest:DataService = null;
  mapEvents:any[] = [];
  loaded:boolean = false;
  loadUserGroup:boolean = false;
  resourceModel:any = {
    Name: 'resourceName',
    Field: 'resourceID',
    IdField: 'resourceID',// field mapping với event Schedule
    TextField: 'resourceName',
    Title: 'resourceName',
  };
  eventModel:any = {
    id: 'recID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'resourceID' },// field mapping với resource Schedule
    status: 'transType',
  };
  //
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('ejCalendar') ejCalendar: CalendarComponent;
  @ViewChild('calendarCenter') calendarCenter: CalendarCenterComponent;
  @ViewChild('resourceTemplate') resourceTemplate: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  //#endregion 
  
  constructor(
    private injector: Injector,
    private coService: CodxCoService,
    private notiService: NotificationsService,
    private authStore:AuthStore
  ) {
    super(injector);
    this.roomFM = new FormModel();
    this.carFM = new FormModel();
    this.meetingFM = new FormModel();
    this.myTaskFM = new FormModel();
    this.assignTaskFM = new FormModel();
    this.user = this.authStore.get();
  }
  onInit(): void {
    this.router.params.subscribe((param:any) => {
      this.funcID = param["funcID"];
    });
    this.selectedDate = new Date();
    var date = new Date(), year = date.getFullYear(), month = date.getMonth();
    this.startDate = new Date(year, month, 1);
    this.endDate = moment(this.startDate).add(1, 'M').add(-1,'s').toDate();
    this.month = month + 1;
    this.getListCalendars();
    this.getSettingValue();
    this.getSeedDialitem();
  }

  ngAfterViewInit() {
    // setting mode view
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        showFilter: false,
        model: {
          panelLeftRef: this.templateLeft,
        },
      },
    ];

    // get sys more function
    this.cache.moreFunction('CoDXSystem', '').subscribe((res:any) => {
      if(res){
        this.sysMoreFunc = res;
      }
    });

    this.coService.getFormModel(EPCONST.FUNCID.R_Bookings).then((res) => {
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

    this.coService.getFormModel(EPCONST.FUNCID.C_Bookings).then((res) => {
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

    this.coService.getFormModel('TMT0501').then((res) => {
      this.meetingFM = res;
      this.meetingFG = this.codxService.buildFormGroup(
        this.meetingFM?.formName,
        this.meetingFM?.gridViewName
      );
    });

    this.coService.getFormModel('TMT0201').then((res) => {
      this.myTaskFM = res;
      this.myTaskFG = this.codxService.buildFormGroup(
        this.myTaskFM?.formName,
        this.myTaskFM?.gridViewName
      );
    });

    this.coService.getFormModel('TMT0203').then((res) => {
      this.assignTaskFM = res;
      this.assignTaskFG = this.codxService.buildFormGroup(
        this.assignTaskFM?.formName,
        this.assignTaskFM?.gridViewName
      );
    });

    this.cache.functionList('HRT01')
    .subscribe((func:any) => {
      if(func)
      {
        this.hrRequest = new DataService(this.injector);
        this.hrRequest.predicate = func.predicate;
        this.hrRequest.dataValue = func.dataValue;
        this.hrRequest.service = "HR";
        this.hrRequest.page = 1;
        this.hrRequest.pageSize = 20;
        this.hrRequest.idField = "orgUnitID";
        this.hrRequest.selector= "OrgUnitID;OrgUnitName";
        this.hrRequest.parentIdField = "parentID";
      }
    });

      
  }

  // get list event function
  getSeedDialitem(){
    this.api.execSv("CO","CO","CalendarsBusiness","GetListFunctionEventAsync")
    .subscribe((res:any)=>{
      if(res){
        for (const key in res) {
          this.speedDialItems.push({id:key,text:res[key]})
        } 
      }
    })
  }
  
  // get settingValue CO
  getSettingValue(){
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetParamMyCalendarAsync',
        ['WPCalendars'])
        .subscribe((res: any) => {
        if (res?.length > 0) {
          let arrParam = [];
          res.forEach((element) => {
            let param = JSON.parse(element);
            if(!param["TextColor"])
              param["TextColor"] = "#1F1717"; // textColor chưa có thiết lập - gắn để test
            let obj = {
              color: param.ShowBackground,
              borderColor: param.ShowColor,
              showColor: param.ShowColor,
              text: param.Template.TransType,
              status: param.Template.TransType,
              textColor: param.TextColor 
            };
            this.statusColor.push(obj);
            this.dResources[param.Template.TransType] = obj;
            this.dPredicate[param.Template.TransType] = param.Predicate;
            arrParam.push(param);
          });
          this.settingCalendars = arrParam;
          this.getEventData();
          this.detectorRef.detectChanges();
        }
      });
  }

  // get list Calendars
  getListCalendars() {
  this.api
    .execSv('SYS','ERM.Business.SYS', 'FunctionListBusiness', 'GetCalendarAllowedAsync',[this.funcID])
    .subscribe((res: any) => {
      if(res)
      {
        this.lstCalendars = res;
        this.calendarID = this.defaultFuncID;
        this.detectorRef.detectChanges();
      }
    });
  }

  // Get list AD_UserGroup
  getListUserGroup(){
    if(this.lstUserGroups.length > 0)
    {
      this.groupID = this.lstUserGroups[0].groupID;
      this.loadUserGroup = true;
      this.getListGroupMember(this.groupID);
    }
    else
    {
      this.api.execSv("SYS","ERM.Business.AD","UserGroupsBusiness","GetUserGroupByCOAsync")
      .subscribe((res:any) => {
        if(res?.length > 0 && res[0]?.length > 0)
        {
          this.loadUserGroup = true;
          this.lstUserGroups = res[0];
          this.groupID = this.lstUserGroups[0].groupID;
          this.getListGroupMember(this.groupID);
          this.detectorRef.detectChanges();
        }
      });
    }
    
  }

  // select day in calendar
  changeDay(args){
    let date = new Date(args.value);
    let y = date.getFullYear()
    let m =  date.getMonth();
    let d = date.getDate();
    let d1 = moment([y,m,d]);
    let d2 = moment([this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()]);
    let day = d1.diff(d2,"day");
    if(day <= 0 || day > 30)
    {
      this.changeMonth({date:date});
    }
    else
    {
      this.selectedDate = date;
      this.calendarCenter && this.calendarCenter.changeDate(this.selectedDate);
      this.detectorRef.detectChanges();
    }
  }

  // navigate moth in
  changeMonth(args){
    let y = args.date.getFullYear()
    let m =  args.date.getMonth();
    let d = args.date.getDate();
    this.startDate = new Date(y, m, 1);
    this.endDate = moment(this.startDate).add(1, 'M').add(-1,'s').toDate();
    this.month = m + 1; 
    this.selectedDate = new Date(y,m,d); 
    if(this.dEventMonth[this.month])
    {
      if(this.ejCalendar)
      {
        this.ejCalendar.value = this.selectedDate;
        this.ejCalendar.refresh();
      }
      this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
      this.calendarCenter && this.calendarCenter.changeDate(this.selectedDate);
    }
    else
    {
      this.getEventData();
    }
    this.detectorRef.detectChanges();
  }

  // show/hide events
  valueChange(e) {
    let transType = e.field;
    let value = e.data === false ? "0" : "1";
    this.settingCalendars.map(x => { if(x.Template.transType == transType) {x.ShowEvent = value} });
    if(value == "0")
    {
      this.lstEvents = this.lstEvents.filter(x => x.transType != transType);
      // this.dEventMonth[this.month] = this.lstEvents;
      // this.mapEvents[transType] = [];
      this.ejCalendar && this.ejCalendar.refresh();
      this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
      this.detectorRef.detectChanges();
    }      
    else
    {
      switch(transType)
      {
        case"WP_Notes":
          this.getEventWP("WP_Notes").subscribe((res:any) => {
            var notes = res.data;
            this.lstEvents = this.lstEvents.concat(notes);
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
        case"TM_MyTasks":
        case"TM_AssignTasks":
          this.getEventTM(transType).subscribe((res:any) => {
            var tasks = res.data;
            this.lstEvents = this.lstEvents.concat(tasks);
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
        case"CO_Meetings":
          this.getEventCO("CO_Meetings").subscribe((res:any) => {
            var meetings = res.data;
            this.lstEvents = this.lstEvents.concat(meetings);
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
        case"EP_BookingRooms":
        case"EP_BookingCars":
          this.getEventEP(transType).subscribe((res:any) => {
            var bookings = res.data;
            this.lstEvents = this.lstEvents.concat(bookings);
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
      }      
    }
  }

  //open popup setting
  openPopupSetting() {
    if(this.settingCalendars)
    {
      let option = new DialogModel();
      this.callfc.openForm(
        PopupSettingsComponent,
        '',
        600,
        550,
        '',
        this.settingCalendars,
        '',
        option
      ).closed.subscribe((res:any) =>
      {
        if(res?.event)
        {
          debugger
          let settings = [];
          res.event.forEach(element => {
            let setting = JSON.parse(element);
            if(!setting["TextColor"])
              setting["TextColor"] = "#1F1717";
              settings.push(setting);
          });
          this.settingCalendars = settings;
        }
      });
    }
    
  }

  //render day cell ej2Calendar
  renderDayCell(args:any) {
    if(this.dEventMonth[this.month])
    {
      let events = this.dEventMonth[this.month];
      let eventDays = events.filter((x:any) => x.startDate != null && new Date(x.startDate).toLocaleDateString() === args.date.toLocaleDateString());
      if (eventDays.length > 0)
      {
        eventDays = eventDays.filter((value, index, self) => self.findIndex((m) => m.transType === value.transType) === index);
        eventDays.forEach((e:any) => {
          let span: HTMLElement;
          span = document.createElement('span');
          span.setAttribute('class', 'e-icons highlight');
          span.setAttribute('style', `color:${this.dResources[e.transType].showColor}`);
          addClass([args.element], ['special', 'e-day']);
          if((args.element as HTMLElement).children.length > 3)
          {
  
          }
          args.element.appendChild(span);
          return;
        });
      }
    }
  }

  // change calendarID
  changeCalendarID(id:string) {
    this.calendarID = id;
    this.lstEvents = [];
    this.dEventMonth = {};
    this.calendarCenter && this.calendarCenter.changeEvents([]);
    switch(id){
      case "COT01": // Lịch công ty
        break;
      case "COT02": // Lịch nhóm
        this.getListUserGroup();
        break;
      case "COT03": // Lịch cá nhân
        this.groupID = "";
        this.orgUnitID = "";
        this.calendarCenter && this.calendarCenter.removeResource();
        this.getEventData();
        break;
    }
    this.detectorRef.detectChanges();
  }

  // get events
  getEventData(){
    let api1 = this.getEventTM("TM_MyTasks");
    let api2 = this.getEventTM("TM_AssignTasks");
    let api3 = this.getEventEP("EP_BookingCars");
    let api4 = this.getEventEP("EP_BookingRooms");
    let api5 = this.getEventCO("CO_Meetings");
    let api6 = this.getEventWP("WP_Notes");
    let obs = forkJoin([api1,api2,api3,api4,api5,api6]);
    obs.subscribe((res:any) => 
    {
      let events = [];
      if(res?.length > 0)
      {
        res.forEach(ele => {
          events = events.concat(ele.data);
        });
      }
      this.lstEvents = this.lstEvents.concat(events);
      this.dEventMonth[this.month] = events;
      if(!this.loaded)
        this.loaded = true;
      if(this.ejCalendar)
      {
        this.ejCalendar.value = this.selectedDate;
        this.ejCalendar.refresh();
      }
      if(this.calendarCenter)
      {
        this.calendarCenter.changeDate(this.selectedDate)
        this.calendarCenter.changeEvents(this.lstEvents);
      }
      this.detectorRef.detectChanges();
    });
  }

  // get event TM
  getEventTM(transType){
    let param = this.settingCalendars.find(x => x.Template.TransType == transType);
    if(param.ShowEvent == "1")
    {
      var grdModel = new DataRequest();
      grdModel.funcID = param.Template.FunctionID;
      grdModel.entityName = "TM_Tasks";
      grdModel.predicates = param.Predicate;
      grdModel.dataValues = `${this.startDate};${this.endDate}`;
      grdModel.pageLoading = false;
      grdModel.dataObj = JSON.stringify({calendarID:this.calendarID,orgUnitID:this.orgUnitID,groupID:this.groupID,startDate:this.startDate,endDate:this.endDate});
      return this.api.execSv("TM","ERM.Business.TM", "TaskBusiness", "GetEventTMByCOAsync", grdModel).pipe(map((res:any) => {
        let eventTasks = [];
        if(res?.length > 0 && res[0]?.length > 0)
        {
          eventTasks = res[0].map((note:any) => {
            return this.convertModelEvent(note,transType);
          });
        }
        return {transType:transType, data:eventTasks};
       }));
    }
    else
      return of({transType:transType, data:[]});
    
  }

// get event CO
  getEventCO(transType){
    let param = this.settingCalendars.find(x => x.Template.TransType == transType);
    if(param.ShowEvent == "1"){
      return this.api.execSv("CO","ERM.Business.CO", "MeetingsBusiness", "GetCalendarEventsAsync",
      [this.calendarID,param.Predicate,this.groupID,this.orgUnitID,this.startDate,this.endDate]).pipe(map((res:any) => {
        let eventMeetings = [];
        if(res?.length > 0 && res[0]?.length > 0)
        {
          // eventMeetings = res[0].map((note:any) => {
          //   return this.convertModelEvent(note,transType);
          // });
          eventMeetings = res[0];
        }
        return {transType:transType, data:eventMeetings};
      }));
    }
    else return of({transType:transType, data:[]});
    
  }

  // get event EP
  getEventEP(transType){
    let param = this.settingCalendars.find(x => x.Template.TransType == transType);
    if(param.ShowEvent == "1"){
      var grdModel = new DataRequest();
      grdModel.funcID = param.Template.FunctionID;
      grdModel.entityName = "EP_Bookings";
      grdModel.predicates = param.Predicate;
      grdModel.pageLoading = false;
      grdModel.dataObj = JSON.stringify({calendarID:this.calendarID,orgUnitID:this.orgUnitID,groupID:this.groupID,startDate:this.startDate,endDate:this.endDate});
      return this.api.execSv("EP","ERM.Business.EP", "BookingsBusiness", "GetListBookingScheduleAsync", grdModel)
      .pipe(map((res:any) => {
        let eventBookings = [];
        if(res?.length > 0 && res[0]?.length > 0)
        {
          eventBookings = res[0].map((note:any) => {
            return this.convertModelEvent(note,transType);
          });
        }
        return {transType:transType, data:eventBookings};
      }));
    }
    else return of({transType:transType, data:[]});
  }

  // get event WP
  getEventWP(transType){
    let param = this.settingCalendars.find(x => x.Template.TransType == transType);
    if(param.ShowEvent == "1"){
      return this.api.execSv("WP","ERM.Business.WP", "NotesBusiness", "GetCalendarEventsAsync",
      [this.calendarID,param.Predicate,this.groupID,this.orgUnitID,this.startDate,this.endDate]).pipe(map((res:any) => {
        let eventNotes = [];
        if(res?.length > 0 && res[0]?.length > 0)
        {
          let eventNotes = res[0].map((note:any) => {
            return this.convertModelEvent(note,transType);
          });
        }
        return {transType:transType, data:eventNotes};
     }));
    }
    else return of({transType:transType, data:[]});
  }

  // add event
  addEvent(args: SpeedDialItemEventArgs) {
    if(args?.item?.id){
      switch (args?.item?.id) 
      {
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
    }
  }

  // add EP_BookingCars
  addBookingCar() {
    this.api.execSv<any>('EP', 'Core', 'DataBusiness', 'GetDefaultAsync', ['EPT21','EP_Bookings'])
    .subscribe((model:any) => {
      if(model?.data)
      {
        this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user.userID,["EP4","EP4E"]])
        .subscribe((res:boolean) => {
          let option = new SidebarModel();
          option.FormModel = this.carFM;
          option.Width = '800px';
          this.callfc
            .openSide(
              CodxAddBookingCarComponent,
              [model.data, 'SYS01', this.addCarTitle, null, null, false,res],
              option
            ).closed.subscribe((res2:any) => {
              if(res2?.event)
              {
                let booking = this.convertModelEvent(res2.event,"EP_BookingCars");
                let month = new Date(booking.startDate)?.getMonth() + 1;
                if(!this.dEventMonth[month])
                  this.dEventMonth[month] = [];
                this.dEventMonth[month].push(booking);
                this.lstEvents.push(booking);
                this.ejCalendar && this.ejCalendar.refresh();
                this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                this.detectorRef.detectChanges();
              }
            });
        });
      }
      else
        this.notiService.notify("Lỗi đặt xe");
    });
  }

  //add EP_BookingRooms
  addBookingRoom() {
    this.api.execSv<any>('EP', 'Core', 'DataBusiness', 'GetDefaultAsync', ['EPT11','EP_Bookings'])
    .subscribe((model:any) => {
      if(model?.data)
      {
        this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user.userID,["EP4","EP4E"]])
        .subscribe((res:boolean) => {
          let option = new SidebarModel();
          option.FormModel = this.roomFM;
          option.Width = '800px';
          this.callfc
            .openSide(
              CodxAddBookingRoomComponent,
              [model.data, 'SYS01', this.addRoomTitle, null, null,false,res],
              option
            ).closed.subscribe((res2:any) => {
              if(res2?.event)
              {
                let booking = this.convertModelEvent(res2.event,"EP_BookingRooms");
                let month = new Date(booking.startDate)?.getMonth() + 1;
                if(!this.dEventMonth[month])
                  this.dEventMonth[month] = [];
                this.dEventMonth[month].push(booking);
                this.lstEvents.push(booking);
                this.ejCalendar && this.ejCalendar.refresh();
                this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                this.detectorRef.detectChanges();
              }
            });
        });
      }
      else
        this.notiService.notify("Lỗi đặt phòng");
    });
  }

  // add WP_Notes
  addNote() {
    let obj = {
      formType: 'add',
      currentDate: new Date(),
      component: 'calendar-notes',
      maxPinNotes: '5',
    };
    let option = new DialogModel();
    //let moreFuc = this.sysMoreFunc.find(x => x.functionID == "SYS01")?.customName ?? "Thêm";
    this.callfc
      .openForm(
        AddNoteComponent,
        'Thêm ghi chú',
        700,
        500,
        '',
        obj,
        '',
        option
      )
      .closed.subscribe((res:any) => {
        if(res?.event)
        {
          this.api.execSv("WP","ERM.Business.WP","NotesBusiness","ConvertNoteToEventAsync",[res.event])
          .subscribe((event:any) => {
            if(event)
            {
              let note = this.convertModelEvent(event,"WP_Notes");
              let month = new Date(note.startDate)?.getMonth() + 1;
              this.lstEvents.push(note);
              this.dEventMonth[month].push(note);
              this.ejCalendar && this.ejCalendar.refresh();
              this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }

  // add CO_Mettings
  addMeeting() {
    let option = new SidebarModel();
    option.FormModel = this.meetingFM;
    option.Width = 'Auto';
    this.api
      .execSv<any>('CO', 'Core', 'DataBusiness', 'GetDefaultAsync', ['TMT0501','CO_Meetings'])
      .subscribe((res) => {
        if (res) {
          let obj = {
            action: 'add',
            titleAction: 'Thêm',
            disabledProject: true,
            listPermissions: '',
            data: res.data,
            isOtherModule: true,
          };
          this.callfc.openSide(
          PopupAddMeetingComponent,
          obj,
          option).closed.subscribe((res2:any) => {
            if (res2?.event) 
            {
              let meeting = this.convertModelEvent(res2.event,"CO_Meetings");
              let month = new Date(meeting.startDate)?.getMonth() + 1;
              if(!this.dEventMonth[month])
                this.dEventMonth[month] = [];
              this.dEventMonth[month].push(meeting);
              this.lstEvents.push(meeting);
              this.ejCalendar && this.ejCalendar.refresh();
              this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
              this.detectorRef.detectChanges();
            }
          });
        }
        else
          this.notiService.notify("Lỗi thêm sự kiện");
      });
  }

  // add TM_Tasks
  addMyTask() {
    let option = new SidebarModel();
    option.FormModel = this.myTaskFM;
    option.Width = '800px';
    option.zIndex = 1001;
    this.api
    .execSv<any>('TM', 'ERM.Business.Core', 'DataBusiness', 'GetDefaultAsync', ['TMT0201','TM_Tasks'])
    .subscribe((res:any) => {
      if(res)
      {
        let obj = {
          data: res.data,
          action: 'add',
          isAssignTask: false,
          titleAction: 'Thêm', 
          functionID: 'TMT0201',
          disabledProject: false,
          isOtherModule: true
        };
        this.callfc.openSide(
          PopupAddComponent,
          obj,
          option
        ).closed.subscribe((res2:any) => {
          if(res2.event)
          {
            let task = this.convertModelEvent(res2.event[0],"TM_MyTasks")
            let month = new Date(task.startDate)?.getMonth() + 1;
            if(!this.dEventMonth[month])
              this.dEventMonth[month] = [];
            this.dEventMonth[month].push(task);
            this.lstEvents.push(task);
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
            this.detectorRef.detectChanges();
          }
        });
      }
      else
        this.notiService.notify("Lỗi thêm công việc");
    });
  }

  // add TM_Tasks Assign Task
  addAssignTask() {
    let option = new SidebarModel();
    option.FormModel = this.assignTaskFM;
    option.Width = '800px';
    this.api.execSv<any>('TM', 'Core', 'DataBusiness', 'GetDefaultAsync', ['TMT0203','TM_Tasks'])
    .subscribe((res:any) => {
      if(res)
      {
        let obj = {
          data: res.data,
          action: 'add',
          isAssignTask: true,
          titleAction: 'Thêm', 
          functionID: 'TMT0203',
          disabledProject: false,
          isOtherModule: true
        };
        this.callfc.openSide(
          PopupAddComponent,
          obj,
          option
        ).closed.subscribe((res2:any) => {
          if(res2?.event?.length > 0)
          {
            let task = this.convertModelEvent(res2.event[0],"TM_AssignTasks")
            let month = new Date(task.startDate)?.getMonth() + 1;
            if(!this.dEventMonth[month])
              this.dEventMonth[month] = [];
            this.dEventMonth[month].push(task);
            this.lstEvents.push(task);
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
            this.detectorRef.detectChanges();
          }
        });
      }
      else
        this.notiService.notify("Lỗi thêm giao việc");
    });
  }

  // selected HR_OrganziUnits
  selectOrgUnit(event:any){
    this.lstEvents = [];
    this.orgUnitID = event?.data?.orgUnitID;
    this.getEmployeeByOrgUnit(this.orgUnitID);
  }

  // get Employee by OrgUnitID
  getEmployeeByOrgUnit(orgUnitID:string){
    this.api.execSv("HR","ERM.Business.HR","HRBusiness","GetEmployeeByCOAsync",orgUnitID)
    .subscribe((res:any) => { 
      if(res)
      {
        this.calendarCenter && this.calendarCenter.changeResource(res ? res[0] : []);
        this.getEventData();
      }
    });
  }

  // select AD_UserGroup
  selectGroupUser(item:any){
    this.lstEvents = [];
    this.groupID = item.groupID;
    this.getListGroupMember(item.groupID);
  }

  //get list group member
  getListGroupMember(groupID:string){
    this.api.execSv("SYS","ERM.Business.AD","UserGroupsBusiness","GetGroupMemberByCOAsync",groupID)
    .subscribe((res:any) => {
      if(res)
      {
        this.calendarCenter && this.calendarCenter.changeResource(res ? res[0] : []);
        this.getEventData();
      }
    });
  }

  // show Hour
  showHour(stringDate: any) {
    const date: Date = new Date(stringDate);
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return timeString;
  }

  // show Event Date
  showEventDate(event:any) {
    var sDate = moment(event.startDate).format("LL");
    var sTimeStart = moment(event.startDate).format("LT")
    var sTimeEnd = moment(event.endDate).format("LT")
    var str =  `${sDate} (${sTimeStart} - ${sTimeEnd})`;
    return str;
  }

  // get event title
  getEventTitle(event){
    var sTitle = "Sự kiện";
    switch(event.transType)
    {
      case"WP_Notes":
        sTitle = "Ghi chú";
        break;
      case"CO_Meetings":
        sTitle = "Lịch họp";
        break;
      case"TM_MyTasks":
        sTitle = "Công việc cá nhân";
        break;
      case"TM_AssignTasks":
        sTitle = "Giao việc";
        break;
      case"EP_BookingCars":
        sTitle = "Đặt xe";
        break;
      case"EP_BookingRooms":
        sTitle = "Đặt phòng";
        break;
    }
    return sTitle;
  }

  // convert Event to Event CO
  convertModelEvent(obj:any,transType:string){
    let template = this.settingCalendars.find(x => x.Template.TransType == transType)?.Template;
    let event = new CO_EventModel();
    for(const field in template)
    {
      if(field === "Resources" ) continue;
      let objKey = template[field];
      let eventKey = field[0].toLocaleLowerCase() + field.slice(1);
      if(field=="TransType" || field=="FunctionID" || field=="Icon")
      {
        event[eventKey] = template[field];
      }
      else
      {
        if(objKey && objKey !== "")
        {
          var ext = "";
          if(objKey.indexOf("|") > 0)
          {
            var arrValue = objKey.split("|");
            objKey = arrValue[0]; 
            ext = arrValue[1];
          }
          objKey = objKey[0].toLocaleLowerCase() + objKey.slice(1);
          event[eventKey] = (obj[objKey] ?? "") + ext;
        }
        else
          event[eventKey] = "";
      }
    }
    event["resourceID"] = obj["createdBy"] ?? "";
    return event;
  }
}
