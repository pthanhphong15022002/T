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
import {
  SpeedDialItemModel,
} from '@syncfusion/ej2-angular-buttons';
import { CodxAddBookingCarComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { AddNoteComponent } from 'projects/codx-share/src/lib/components/calendar-notes/add-note/add-note.component';
import { PopupAddMeetingComponent } from 'projects/codx-share/src/lib/components/codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { PopupAddComponent } from 'projects/codx-share/src/lib/components/codx-tasks/popup-add/popup-add.component';
import { PopupSettingsComponent } from '../popup/popup-settings/popup-settings.component';
import { CO_EventModel } from './model/CO_EventModel';
import { Observable, forkJoin, map, of } from 'rxjs';
import { CodxAddBookingRoomComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-room/codx-add-booking-room.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { env } from 'process';
import { CodxTasksService } from 'projects/codx-share/src/lib/components/codx-tasks/codx-tasks.service';


@Component({
  selector: 'co-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class COCalendarComponent extends UIComponent implements AfterViewInit {
  
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
  dFormModel:any = {};
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
  roomFM: FormModel;
  addRoomTitle = '';
  carFM: FormModel;
  addCarTitle = '';
  meetingFM: FormModel;
  myTaskFM: FormModel;
  assignTaskFM: FormModel;
  noteFM: FormModel;

  //
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('ejCalendar') ejCalendar: CalendarComponent;
  @ViewChild('calendarCenter') calendarCenter: CalendarCenterComponent;
  @ViewChild('resourceTemplate') resourceTemplate: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  //#endregion 
  
  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    private codxShareService: CodxShareService,
    private TMService: CodxTasksService,
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

    // get formModel EP
    this.cache.functionList(BUSSINESS_FUNCID.EP_BOOKINGROOMS).subscribe((res) => {
      if (res) 
      {
        let formModel = new FormModel();
        this.addRoomTitle = res.customName;
        formModel.entityName = res.entityName;
        formModel.formName = res.formName;
        formModel.gridViewName = res.gridViewName;
        formModel.funcID = res.functionID;
        formModel.entityPer = res.entityPer;
        this.roomFM = formModel;
        this.dFormModel["EP_BookingRooms"] = formModel;
      }
    });

    this.cache.functionList(BUSSINESS_FUNCID.EP_BOOKINGCARS).subscribe((res) => {
      if (res) 
      {
        this.addCarTitle = res?.customName;
        let formModel = new FormModel();
        this.addCarTitle = res.customName;
        formModel.entityName = res.entityName;
        formModel.formName = res.formName;
        formModel.gridViewName = res.gridViewName;
        formModel.funcID = res.functionID;
        formModel.entityPer = res.entityPer;
        this.carFM = formModel;
        this.dFormModel["EP_BookingCars"] = formModel;
      }
    });
    //get formModel CO
    this.cache.functionList(BUSSINESS_FUNCID.CO_MEETINGS).subscribe((res) => {
      if (res) 
      {
        let formModel = new FormModel();
        formModel.entityName = res.entityName;
        formModel.formName = res.formName;
        formModel.gridViewName = res.gridViewName;
        formModel.funcID = res.functionID;
        formModel.entityPer = res.entityPer;
        this.meetingFM = formModel;
        this.dFormModel["CO_Meetings"] = formModel;
      }
    });

    // get formModel TM
    this.cache.functionList(BUSSINESS_FUNCID.TM_MyTasks).subscribe((res) => {
      if (res) 
      {
        let formModel = new FormModel();
        formModel.entityName = res.entityName;
        formModel.formName = res.formName;
        formModel.gridViewName = res.gridViewName;
        formModel.funcID = res.functionID;
        formModel.entityPer = res.entityPer;
        this.myTaskFM = formModel;
        this.dFormModel["TM_MyTasks"] = formModel;
      }
    });

    this.cache.functionList(BUSSINESS_FUNCID.TM_AssignTasks).subscribe((res) => {
      if (res) 
      {
        let formModel = new FormModel();
        formModel.entityName = res.entityName;
        formModel.formName = res.formName;
        formModel.gridViewName = res.gridViewName;
        formModel.funcID = res.functionID;
        formModel.entityPer = res.entityPer;
        this.assignTaskFM = formModel;
        this.dFormModel["TM_AssignTasks"] = formModel;
      }
    });
    
    // get formModel WP
    this.cache.functionList(BUSSINESS_FUNCID.WP_NOTES).subscribe((res) => {
      if (res) 
      {
        let formModel = new FormModel();
        formModel.entityName = res.entityName;
        formModel.formName = res.formName;
        formModel.gridViewName = res.gridViewName;
        formModel.funcID = res.functionID;
        formModel.entityPer = res.entityPer;
        this.noteFM = formModel;
        this.dFormModel["WP_Notes"] = formModel;
      }
    });
    // get function HR_Organization
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
      if(res)
      {
        for (const key in res) 
        {
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
              textColor: param.TextColor ?? "1F1717"
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
      for (const month in this.dEventMonth) {
        if(this.dEventMonth[month])
        {
          this.dEventMonth[month] = this.dEventMonth[month].filter(x => x.transType != transType);
        }
      }
      this.lstEvents = this.lstEvents.filter(x => x.transType != transType);
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
          let settingCalendars = [];
          let statusColors = [];
          res.event.forEach(element => {
            let param = JSON.parse(element);
            settingCalendars.push(param);
            let obj = {
              color: param.ShowBackground,
              borderColor: param.ShowColor,
              showColor: param.ShowColor,
              text: param.Template.TransType,
              status: param.Template.TransType,
              textColor: param.TextColor ?? "1F1717"
            };
            statusColors.push(obj);
          });
          this.statusColor = statusColors;
          this.settingCalendars = settingCalendars;
          this.calendarCenter && this.calendarCenter.changeStatusColor(this.statusColor);
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
          eventNotes = res[0];
        }
        return {transType:transType, data:eventNotes};
     }));
    }
    else return of({transType:transType, data:[]});
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
        this.calendarCenter && this.calendarCenter.changeResource(res[0].length > 0 ? res[0] : []);
        this.getEventData();
      }
    });
  }

  // select AD_UserGroup
  selectGroupUser(item:any,eleGroup:HTMLElement,eleItem:HTMLElement){
    Array.from(eleGroup.children).forEach((ele:HTMLElement) => {
      if(ele.classList.contains("active"))
      {
        ele.classList.remove("active");
      }
    });
    eleItem.classList.add("active");
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
        this.calendarCenter && this.calendarCenter.changeResource(res[0].length > 0 ? res[0] : []);
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

  // data change more function
  dataChangeMF(event:any[]){
    if(event?.length > 0)
    {
      event.map(x => {
        x.disabled = (x.functionID == "SYS01" || x.functionID == "SYS02" || x.functionID == "SYS03") ? false : true; 
      });
    }
  }

  // click more function
  clickMF(event:any,data:any){
    switch(event.functionID)
    {
      case"SYS01":
      case"SYS03":
        this.addEditEvent(event.functionID,data);
        break;
      case"SYS02":
        this.deleteEvent(data);
        break;
    }
  }

  // add && edit event
  addEditEvent(funcID:string,event:any) {
    if(event.transType)
    {
      switch (event.transType) 
      {
        case 'EP_BookingCars':
          this.addEditBookingCar(funcID,event);
          break;

        case 'EP_BookingRooms':
          this.addEditBookingRoom(funcID,event);
          break;

        case 'WP_Notes':
          this.addEditNote(funcID,event);
          break;

        case 'CO_Meetings':
          this.addEditMetting(funcID,event);
          break;

        case 'TM_MyTasks':
          this.addEditMyTask(funcID,event);
          break;

        case 'TM_AssignTasks':
          this.addEditAssignTask(funcID,event);
          break;
      }
    }
  }

  // get model EP_Bookings
  getModelEP(funcID:string,business_FuncID:string, event :any= null){
    if(funcID == "SYS01")
    {
      return this.api.execSv<any>('EP', 'Core', 'DataBusiness', 'GetDefaultAsync', [business_FuncID,'EP_Bookings'])
      .pipe(map((model:any) => 
      {
        return model != null ?  model.data : null;
      }));
    }
    else if(funcID == "SYS03")
    {
      return this.codxShareService.getBookingByRecID(event?.transID)
      .pipe(map((model:any) => 
      {
        return model != null ?  model : null;
      }));
    }
    else return of(null);
  }

  // add & edit booking car
  addEditBookingCar(funcID:string,event:any = null){
    this.getModelEP(funcID,BUSSINESS_FUNCID.EP_BOOKINGCARS,event).subscribe((model:any) => 
    {
      if(model)
      {
        this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user.userID,["EP4","EP4E"]])
        .subscribe((res:boolean) => {
          let option = new SidebarModel();
          option.FormModel = this.carFM;
          option.Width = '800px';
          this.callfc
            .openSide(
              CodxAddBookingCarComponent,
              [model, funcID, this.addCarTitle, null, null, false,res],
              option
            ).closed.subscribe((res:any) => {
              if(res?.event)
              {
                let booking = this.convertModelEvent(res.event,"EP_BookingCars");
                let month = new Date(booking.startDate)?.getMonth() + 1;
                if(funcID == "SYS03")
                {
                  let idx = this.lstEvents.findIndex(x => x.transID == booking.transID);
                  if(idx > -1)
                    this.lstEvents.splice(idx,1);
                }
                if(!this.dEventMonth[month])
                  this.dEventMonth[month] = [];
                this.lstEvents.push(booking);
                this.dEventMonth[month] = this.lstEvents;
                this.ejCalendar && this.ejCalendar.refresh();
                this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                this.detectorRef.detectChanges();
              }
            });
        });
      }
      else this.notiService.notify("Lỗi đặt xe");
    });
  }
  
  // add & edit booking room
  addEditBookingRoom(funcID:string,event:any = null){
    this.getModelEP(funcID,BUSSINESS_FUNCID.EP_BOOKINGROOMS,event).subscribe((model:any) => 
    {
      if(model)
      {
        this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user.userID,["EP4","EP4E"]])
        .subscribe((res:boolean) => {
          let option = new SidebarModel();
          option.FormModel = this.roomFM;
          option.Width = '800px';
          this.callfc
            .openSide(
              CodxAddBookingRoomComponent,
              [model, funcID, this.addRoomTitle, null, null,false,res],
              option
            ).closed.subscribe((res:any) => {
              if(res?.event)
              {
                let booking = this.convertModelEvent(res.event,"EP_BookingRooms");
                let month = new Date(booking.startDate)?.getMonth() + 1;
                if(funcID == "SYS03")
                {
                  let idx = this.lstEvents.findIndex(x => x.transID == booking.transID);
                  if(idx > -1)
                    this.lstEvents.splice(idx,1);
                }
                if(!this.dEventMonth[month])
                  this.dEventMonth[month] = [];
                this.lstEvents.push(booking);
                this.dEventMonth[month] = this.lstEvents;
                this.ejCalendar && this.ejCalendar.refresh();
                this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                this.detectorRef.detectChanges();
              }
            });
        });
      }
      else this.notiService.notify("Lỗi đặt phòng");
    });
  }  

  // get model CO
  getModelCO(funcID:string,event:any = null){
    if(funcID == "SYS01")
    {
      return this.api.execSv<any>('CO', 'Core', 'DataBusiness', 'GetDefaultAsync', [BUSSINESS_FUNCID.CO_MEETINGS,'CO_Meetings'])
      .pipe(map((model:any) => 
      {
        return model != null ?  model.data : null;
      }));
    }
    else if(funcID == "SYS03")
    {
      return this.api.execSv<any>('CO', 'ERM.Business.CO', 'MeetingsBusiness', 'GetOneByRecIDAsync', event.transID)
      .pipe(map((model:any) => 
      {
        return model != null ?  model : null;
      }));
    }
    else return of(null);
  }

  // add & edit CO
  addEditMetting(funcID:string,event:any = null){
    this.getModelCO(funcID,event).subscribe((model:any) => {
      if(model)
      {
        let option = new SidebarModel();
        option.FormModel = this.meetingFM;
        option.Width = 'Auto';
        let obj = {
          action: funcID == "SYS01" ? "add" : "edit",
          titleAction: funcID == "SYS01" ? "Thêm" : "Chỉnh sửa",
          disabledProject: true,
          listPermissions: '',
          data: model,
          isOtherModule: true,
        };
        this.callfc.openSide(
        PopupAddMeetingComponent,
        obj,
        option).closed.subscribe((res:any) => {
          if (res?.event) 
          {
            let meeting = this.convertModelEvent(res.event,"CO_Meetings");
            let month = new Date(meeting.startDate)?.getMonth() + 1;
            if(funcID == "SYS03")
            {
              let idx = this.lstEvents.findIndex(x => x.transID == meeting.transID);
              if(idx > -1)
                this.lstEvents.splice(idx,1);
            }
            if(!this.dEventMonth[month])
              this.dEventMonth[month] = [];
            this.lstEvents.push(meeting);
            this.dEventMonth[month] = this.lstEvents;
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
            this.detectorRef.detectChanges();
          }
        });
      }
      else this.notiService.notify("Lỗi lịch họp");
    });
  }

  // get model TM
  getModelTM(business_FuncID:string,event = null){
    return this.api.execSv<any>('TM', 'Core', 'DataBusiness', 'GetDefaultAsync', [business_FuncID,'TM_Tasks'])
      .pipe(map((model:any) => 
      {
        return model != null ?  model.data : null;
      }));
  }

  // add edit My_Task
  addEditMyTask(funcID:string, event:any){
    if(funcID == "SYS01")
    {
      this.getModelTM(BUSSINESS_FUNCID.TM_MyTasks,event).subscribe((model:any) => {
        if(model)
        {
          let option = new SidebarModel();
          option.FormModel = this.myTaskFM;
          option.Width = '800px';
          option.zIndex = 1001;
          let obj = {
            data: model,
            action: funcID == "SYS01" ? "add" : "edit",
            isAssignTask: false,
            titleAction: funcID == "SYS01" ? "Thêm" : "Chỉnh sửa", 
            functionID: BUSSINESS_FUNCID.TM_MyTasks,
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
        {
          this.notiService.notify("Lỗi công việc cá nhân");
        }
      });
    }
    else if(funcID == "SYS03")
    {
      this.TMService.editTask(
        event.transID,BUSSINESS_FUNCID.TM_MyTasks,"Chỉnh sửa",this.afterSaveMyTask.bind(this)
      );
    }
  }

  // add & edit  TM_AssignTaskS
  addEditAssignTask(funcID:string, event:any) {
    if(funcID == "SYS01")
    {
      this.getModelTM(BUSSINESS_FUNCID.TM_AssignTasks,event).subscribe((model:any) => {
        if(model)
        {
          let option = new SidebarModel();
          option.FormModel = this.assignTaskFM;
          option.Width = '800px';
          option.zIndex = 1001;
          let obj = {
            data: model,
            action: 'add',
            isAssignTask: true,
            titleAction: 'Thêm', 
            functionID: BUSSINESS_FUNCID.TM_AssignTasks,
            disabledProject: false,
            isOtherModule: true
          };
          this.callfc.openSide(
            PopupAddComponent,
            obj,
            option
          ).closed.subscribe((res:any) => {
            if(res?.event?.length > 0)
            {
              let task = this.convertModelEvent(res.event[0],"TM_AssignTasks")
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
    else if(funcID == "SYS03")
    {
      this.TMService.editTask(event.transID,BUSSINESS_FUNCID.TM_AssignTasks,"Chỉnh sửa",this.afterSaveAssignTask.bind(this));
    }
  }

  // after Save Task 
  afterSaveMyTask(data) {
    debugger
    if(data)
    {
      let task = this.convertModelEvent(data,"TM_MyTasks")
      let month = new Date(task.startDate)?.getMonth() + 1;
      let idx = this.lstEvents.findIndex(x => x.transID == task.transID);
      if(idx > -1)
      {
        this.lstEvents.splice(idx,1);
      }
      if(!this.dEventMonth[month])
        this.dEventMonth[month] = [];
      this.lstEvents.push(task);
      this.dEventMonth[month] = this.lstEvents;
      this.ejCalendar && this.ejCalendar.refresh();
      this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
      this.detectorRef.detectChanges();
    }
  }
  // after Save Task 
  afterSaveAssignTask(data) {
    if(data)
    {
      let task = this.convertModelEvent(data,"TM_AssignTasks")
      let month = new Date(task.startDate)?.getMonth() + 1;
      let idx = this.lstEvents.findIndex(x => x.transID == task.transID);
      if(idx > -1)
      {
        this.lstEvents.splice(idx,1);
      }
      if(!this.dEventMonth[month])
        this.dEventMonth[month] = [];
      this.lstEvents.push(task);
      this.dEventMonth[month] = this.lstEvents;
      this.ejCalendar && this.ejCalendar.refresh();
      this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
      this.detectorRef.detectChanges();
    }
  }

  // get model WP
  getModelWP(funcID:string,business_FuncID:string,event=null){
    if(funcID == "SYS01")
    {
      return this.api.execSv<any>('WP', 'Core', 'DataBusiness', 'GetDefaultAsync', [business_FuncID,'WP_Notes'])
      .pipe(map((model:any) => 
      {
        return model != null ?  model.data : null;
      }));
    }
    else if(funcID == "SYS03")
    {
      return this.api.execSv<any>('WP', 'ERM.Business.WP', 'NotesBusiness', 'GetNoteByCOAsync', event.transID)
      .pipe(map((model:any) => 
      {
        return model != null ?  model : null;
      }));
    }
    else return of(null);
  }

  // add WP_Notes
  addEditNote(funcID:string,event:any = null) {
    this.getModelWP(funcID,BUSSINESS_FUNCID.WP_NOTES,event).subscribe((model:any) => {
      if(model)
      {
        let obj = {
          formType: funcID == "SYS01" ? "add" :"edit",
          currentDate: new Date(),
          component: 'calendar-notes',
          maxPinNotes: '5',
          dataUpdate: model
        };
        let title = funcID == "SYS01" ? "Thêm ghi chú" : "Cập nhật ghi chú";
        let option = new DialogModel();
        option.FormModel = this.noteFM;
        this.callfc
          .openForm(
            AddNoteComponent,
            title,
            700,
            500,
            '',
            obj,
            '',
            option
          ).closed.subscribe((res:any) => {
            if(res?.event)
            {
              this.api.execSv("WP","ERM.Business.WP","NotesBusiness","ConvertNoteToEventAsync",[res.event])
              .subscribe((event:any) => {
                if(event)
                {
                  let note = this.convertModelEvent(event,"WP_Notes");
                  let month = new Date(note.startDate)?.getMonth() + 1;
                  if(funcID == "SYS03")
                  {
                    let idx = this.lstEvents.findIndex(x => x.transID == note.transID);
                    if(idx > -1)
                      this.lstEvents.splice(idx,1);
                  }
                  this.lstEvents.push(note);
                  this.dEventMonth[month] = this.lstEvents;
                  this.ejCalendar && this.ejCalendar.refresh();
                  this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                  this.detectorRef.detectChanges();
                }
              });
            }
          });
      }
      else this.notiService.notify("Lỗi ghi chú");
    });
  }

  //delete event
  deleteEvent(event:any){
    if(event)
    {
      switch (event.transType) 
      {
        case 'EP_BookingCars':
        case 'EP_BookingRooms':
          this.deleteEventEP(event);
          break;
        case 'WP_Notes':
          this.deleteEventWP(event);
          break;
        case 'CO_Meetings':
          this.deleteEventCO(event);
          break;
        case 'TM_MyTasks':
        case 'TM_AssignTasks':
          this.deleteEventTM(event);
          break;
      }
    }

  }

  // delete event EP
  deleteEventEP(event){
    this.api.execSv("EP","ERM.Business.EP","BookingBusiness","DeleteByIDAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let month = new Date(event.startDate)?.getMonth() + 1;
        if(idx > -1)
          this.lstEvents.splice(idx,1);
        this.dEventMonth[month] = this.lstEvents;
        this.ejCalendar && this.ejCalendar.refresh();
        this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
        this.detectorRef.detectChanges();
        this.notiService.notify("Xóa thành công");
      }
      else this.notiService.notify("Xóa không thành công");
    });
  }

  // delete event WP
  deleteEventWP(event){
    this.api.execSv("WP","ERM.Business.WP","NotesBusiness","DeleteByIDAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let month = new Date(event.startDate)?.getMonth() + 1;
        if(idx > -1)
          this.lstEvents.splice(idx,1);
        this.dEventMonth[month] = this.lstEvents;
        this.ejCalendar && this.ejCalendar.refresh();
        this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
        this.detectorRef.detectChanges();
        this.notiService.notify("Xóa thành công");
      }
      else this.notiService.notify("Xóa không thành công");
    });
  }

  // delete event CO
  deleteEventCO(event){
    this.api.execSv("CO","ERM.Business.CO","MeetingsBusiness","DeleteMeetingsAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let month = new Date(event.startDate)?.getMonth() + 1;
        if(idx > -1)
          this.lstEvents.splice(idx,1);
        this.dEventMonth[month] = this.lstEvents;
        this.ejCalendar && this.ejCalendar.refresh();
        this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
        this.detectorRef.detectChanges();
        this.notiService.notify("Xóa thành công");
      }
      else this.notiService.notify("Xóa không thành công");
    });
  }

  // delete event TM
  deleteEventTM(event){
    this.api.execSv("TM","ERM.Business.TM","TaskBusiness","DeleteTaskByRecIDAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let month = new Date(event.startDate)?.getMonth() + 1;
        if(idx > -1)
          this.lstEvents.splice(idx,1);
        this.dEventMonth[month] = this.lstEvents;
        this.ejCalendar && this.ejCalendar.refresh();
        this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
        this.detectorRef.detectChanges();
        this.notiService.notify("Xóa thành công");
      }
      else this.notiService.notify("Xóa không thành công");
    });
  }

  showData(data){
    debugger
    
  }
}
enum BUSSINESS_FUNCID {
  EP_BOOKINGROOMS = 'EPT11',
  EP_BOOKINGCARS = 'EPT21',
  TM_MyTasks = 'TMT0201',
  TM_AssignTasks = 'TMT0203',
  CO_MEETINGS = 'TMT0501',
  WP_NOTES = 'WPT08',

}