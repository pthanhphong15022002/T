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
import { forkJoin, map, of } from 'rxjs';
import { CodxAddBookingRoomComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-room/codx-add-booking-room.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxTasksService } from 'projects/codx-share/src/lib/components/codx-tasks/codx-tasks.service';
import { PopupAddMeetingsComponent } from '../popup/popup-add-meeting/popup-add-meeting.component';


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
  defaultFuncID:string = "COT03"; // default mod lịch cá nhân
  calendarID:string = "";
  lstCalendars:any[] = [];
  dResources:any = {};
  statusColor:any[] = [];
  lstEvents:any[] = [];
  lstResources:any[] = [];
  selectedDate:Date = null;
  sysMoreFunc:any[] = [];
  addMoreFunc:any = {
    text: "Thêm",
    action:"add",
    functionID:"SYS01"
  }
  groupID:string = "";
  orgUnitID:string = "";
  dEventMonth:any = {};
  lstUserGroups:any[] = [];
  startDate:Date = null;
  endDate:Date = null;
  month:number = 0; // 0-11
  locale:string = 'vi';
  speedDialItems: SpeedDialItemModel[] = [];
  HRRequest:DataService = null;
  loaded:boolean = false;
  loadUserGroup:boolean = false;
  dFormModel:any = {};
  dFunc:any = {};
  roomFM: FormModel;
  addRoomTitle = '';
  carFM: FormModel;
  addCarTitle = '';
  meetingFM: FormModel;
  myTaskFM: FormModel;
  assignTaskFM: FormModel;
  noteFM: FormModel;
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

  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('ejCalendar') ejCalendar: CalendarComponent;
  @ViewChild('calendarCenter') calendarCenter: CalendarCenterComponent;
  //#endregion

  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    private codxShareService: CodxShareService,
    private TMService: CodxTasksService,
    private authStore:AuthStore
  ) {
    super(injector);
    this.user = this.authStore.get();
  }
  onInit(): void {
    this.router.params.subscribe((param:any) => {
      this.funcID = param["funcID"];
    });
    let crrDate = new Date(), month = crrDate.getMonth(), year = crrDate.getFullYear();
    this.locale = this.user.language != 'VN' ? "en-US" : "vi";
    this.selectedDate = crrDate;
    this.startDate = new Date(year, month, 1);
    this.endDate = moment(this.startDate).add(1, 'M').add(-1,'s').toDate();
    this.month = month + 1;
    this.dEventMonth[month + 1 + "-" + year] = [];
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
      if(res)
      {
        this.sysMoreFunc = res;
        let addMore = res.find(x => x.functionID == "SYS01");
        if(addMore)
        {
          this.addMoreFunc.functionID = addMore.functionID;
          this.addMoreFunc.text = addMore.customName;
        }
      }
    });

    // get formModel EP
    this.cache.functionList(BUSSINESS_FUNCID.EP_BOOKINGROOMS).subscribe((func:any) => {
      if (func)
      {
        let formModel = new FormModel();
        this.addRoomTitle = func.customName;
        formModel.entityName = func.entityName;
        formModel.formName = func.formName;
        formModel.gridViewName = func.gridViewName;
        formModel.funcID = func.functionID;
        formModel.entityPer = func.entityPer;
        this.roomFM = formModel;
        this.dFormModel["EP_BookingRooms"] = formModel;
        this.dFunc["EP_BookingRooms"] = func;
      }
    });

    this.cache.functionList(BUSSINESS_FUNCID.EP_BOOKINGCARS).subscribe((func:any) => {
      if (func)
      {
        this.addCarTitle = func?.customName;
        let formModel = new FormModel();
        this.addCarTitle = func.customName;
        formModel.entityName = func.entityName;
        formModel.formName = func.formName;
        formModel.gridViewName = func.gridViewName;
        formModel.funcID = func.functionID;
        formModel.entityPer = func.entityPer;
        this.carFM = formModel;
        this.dFormModel["EP_BookingCars"] = formModel;
        this.dFunc["EP_BookingCars"] = func;
      }
    });
    //get formModel CO
    this.cache.functionList(BUSSINESS_FUNCID.CO_MEETINGS).subscribe((func) => {
      if (func)
      {
        let formModel = new FormModel();
        formModel.entityName = func.entityName;
        formModel.formName = func.formName;
        formModel.gridViewName = func.gridViewName;
        formModel.funcID = func.functionID;
        formModel.entityPer = func.entityPer;
        this.meetingFM = formModel;
        this.dFormModel["CO_Meetings"] = formModel;
        this.dFunc["CO_Meetings"] = func;
      }
    });

    // get formModel TM
    this.cache.functionList(BUSSINESS_FUNCID.TM_MyTasks).subscribe((func:any) => {
      if (func)
      {
        let formModel = new FormModel();
        formModel.entityName = func.entityName;
        formModel.formName = func.formName;
        formModel.gridViewName = func.gridViewName;
        formModel.funcID = func.functionID;
        formModel.entityPer = func.entityPer;
        this.myTaskFM = formModel;
        this.dFormModel["TM_MyTasks"] = formModel;
        this.dFunc["TM_MyTasks"] = func;
      }
    });

    this.cache.functionList(BUSSINESS_FUNCID.TM_AssignTasks).subscribe((func) => {
      if (func)
      {
        let formModel = new FormModel();
        formModel.entityName = func.entityName;
        formModel.formName = func.formName;
        formModel.gridViewName = func.gridViewName;
        formModel.funcID = func.functionID;
        formModel.entityPer = func.entityPer;
        this.assignTaskFM = formModel;
        this.dFormModel["TM_AssignTasks"] = formModel;
        this.dFunc["TM_AssignTasks"] = func;
      }
    });

    // get formModel WP
    this.cache.functionList(BUSSINESS_FUNCID.WP_NOTES).subscribe((func:any) => {
      if (func)
      {
        let formModel = new FormModel();
        formModel.entityName = func.entityName;
        formModel.formName = func.formName;
        formModel.gridViewName = func.gridViewName;
        formModel.funcID = func.functionID;
        formModel.entityPer = func.entityPer;
        this.noteFM = formModel;
        this.dFormModel["WP_Notes"] = formModel;
        this.dFunc["WP_Notes"] = func;
      }
    });

    // get function HR_Organization
    this.cache.functionList('HRT01')
    .subscribe((func:any) => {
      if(func)
      {
        this.HRRequest = new DataService(this.injector);
        this.HRRequest.predicate = func.predicate;
        this.HRRequest.dataValue = func.dataValue;
        this.HRRequest.service = "HR";
        this.HRRequest.page = 1;
        this.HRRequest.pageSize = 20;
        this.HRRequest.idField = "orgUnitID";
        this.HRRequest.selector= "OrgUnitID;OrgUnitName";
        this.HRRequest.parentIdField = "parentID";
      }
    });

    // remmove codx-fillter form --- showFilter: false ko hoạt động
    let itv = setInterval(() => {
      let codxFillter = document.getElementById("Content-Fillter");
      if(codxFillter)
      {
        clearInterval(itv);
        codxFillter.remove();
      }
    },1000);
  }

  // get list event function
  getSeedDialitem(){
    this.api.execSv("CO","CO","CalendarsBusiness","GetListFunctionEventAsync")
    .subscribe((res:any)=>{
      if(res)
      {
        for (const key in res)
        {
          this.speedDialItems.push({id:key,text:res[key]});
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
        if (res?.length > 0)
        {
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
    let y = args.date.getFullYear(),m =  args.date.getMonth();
    this.startDate = new Date(y, m, 1);
    this.endDate = moment(this.startDate).add(1, 'M').add(-1,'s').toDate();
    this.selectedDate = args.date;
    // if(this.dEventMonth[(m + 1) + "-" + y])
    // {
    //   this.lstEvents = this.dEventMonth[(m + 1) + "-" + y];
    //   if(this.ejCalendar)
    //   {
    //     this.ejCalendar.value = this.selectedDate;
    //     this.ejCalendar.refresh();
    //   }
    //   if(this.calendarCenter)
    //   {
    //     this.calendarCenter.changeDate(this.selectedDate);
    //     this.calendarCenter.changeEvents(this.lstEvents);
    //   }
    // }
    // else
    // {
    //   this.getEventData();
    // }
    this.getEventData();
    this.detectorRef.detectChanges();
  }

  // show/hide events
  valueChange(e) {
    let transType = e.field;
    let value = e.data === false ? "0" : "1";
    this.settingCalendars.map(x => { if(x.Template.transType == transType) {x.ShowEvent = value} });
    if(value == "0")
    {
      for (const key in this.dEventMonth)
      {
        if(this.dEventMonth[key] && this.dEventMonth[key]?.length > 0)
        {
          this.dEventMonth[key] = this.dEventMonth[key].filter(x => x.transType != transType);
        }
      }
      this.lstEvents = this.lstEvents.filter(x => x.transType != transType);
      this.ejCalendar && this.ejCalendar.refresh();
      this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
    }
    else
    {
      let month = this.selectedDate.getMonth() + 1, year = this.selectedDate.getFullYear();
      switch(transType)
      {
        case"WP_Notes":
          this.getEventWP("WP_Notes").subscribe((res:any) => {
            var notes = res.data;
            this.lstEvents = this.lstEvents.concat(notes);
            this.dEventMonth[month + "-" + year] = this.lstEvents;
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
        case"TM_MyTasks":
        case"TM_AssignTasks":
          this.getEventTM(transType).subscribe((res:any) => {
            var tasks = res.data;
            this.lstEvents = this.lstEvents.concat(tasks);
            this.dEventMonth[month + "-" + year] = this.lstEvents
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
        case"CO_Meetings":
          this.getEventCO("CO_Meetings").subscribe((res:any) => {
            var meetings = res.data;
            this.lstEvents = this.lstEvents.concat(meetings);
            this.dEventMonth[month + "-" + year] = this.lstEvents;
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
        case"EP_BookingRooms":
        case"EP_BookingCars":
          this.getEventEP(transType).subscribe((res:any) => {
            var bookings = res.data;
            this.lstEvents = this.lstEvents.concat(bookings);
            this.dEventMonth[month + "-" + year] = this.lstEvents;
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          });
          break;
      }
    }
  }

  // open popup setting
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
              textColor: param.TextColor
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

  // render day cell ej2Calendar
  renderDayCell(args:any) {
    let month = args.date.getMonth() + 1 , year = args.date.getFullYear();
    let events = this.dEventMonth[month + "-" + year];
    if(events && events?.length > 0){
      events = events.filter((x:any) => x.startDate != null && new Date(x.startDate).toLocaleDateString() === args.date.toLocaleDateString());
      if (events.length > 0)
      {
        events = events.filter((value, index, self) => self.findIndex((m) => m.transType === value.transType) === index);
        events.forEach((e:any) => {
          let span: HTMLElement;
          span = document.createElement('span');
          span.setAttribute('class', 'e-icons highlight');
          span.setAttribute('style', `color:${this.dResources[e.transType].showColor}`);
          addClass([args.element], ['special', 'e-day']);
          // if((args.element as HTMLElement).children.length > 3)
          // {

          // }
          args.element.appendChild(span);
          return;
        });
      }
    }
  }

  // change calendarID
  changeCalendarType(id:string) {
    this.calendarID = id;
    this.lstEvents = [];
    this.dEventMonth = {};
    switch(id){
      case "COT01": // Lịch công ty
        this.calendarCenter && this.calendarCenter.changeModeView(false);
        break;
      case "COT02": // Lịch nhóm
        this.calendarCenter && this.calendarCenter.changeModeView(false);
        this.getListUserGroup();
        break;
      case "COT03": // Lịch cá nhân
        this.groupID = "";
        this.orgUnitID = "";
        this.calendarCenter && this.calendarCenter.changeModeView(true);
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
      let month = this.selectedDate.getMonth() + 1, year = this.selectedDate.getFullYear();
      if(res?.length > 0)
      {
        res.forEach(ele => {
          events = events.concat(ele.data);
        });
      }
      this.lstEvents = events;
      this.dEventMonth[month + "-" + year] = events;
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
  // showHour(stringDate: any) {
  //   const date: Date = new Date(stringDate);
  //   const hours: number = date.getHours();
  //   const minutes: number = date.getMinutes();

  //   const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
  //     .toString()
  //     .padStart(2, '0')}`;

  //   return timeString;
  // }

  // show Event Date
  showEventDate(event:any) {
    var sDate = moment(event.startDate).format("LL");
    var sTimeStart = moment(event.startDate).format("LT")
    var sTimeEnd = moment(event.endDate).format("LT")
    var str =  `${sDate} (${sTimeStart} - ${sTimeEnd})`;
    return str;
  }

  // get event title
  showEventTitle(event){
    var sTitle = this.user.language != 'VN' ? "Events" : "Sự kiện";
    if(event?.transType)
    {
      sTitle = this.dFunc[event.transType].customName;
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
        this.addEditEvent(event,data);
        break;
      case"SYS02":
        this.deleteEvent(data);
        break;
    }
  }

  // add && edit event
  addEditEvent(moreFunc:string,event:any) {
    if(event.transType){
      switch (event.transType) {
        case 'EP_BookingCars':
          this.addEditBookingCar(moreFunc,event);
          break;

        case 'EP_BookingRooms':
          this.addEditBookingRoom(moreFunc,event);
          break;

        case 'WP_Notes':
          this.addEditNote(moreFunc,event);
          break;

        case 'CO_Meetings':
          this.addEditMetting(moreFunc,event);
          break;

        case 'TM_MyTasks':
          this.addEditMyTask(moreFunc,event);
          break;

        case 'TM_AssignTasks':
          this.addEditAssignTask(moreFunc,event);
          break;
        case "Test": // gắn để test popup Thêm lịch họp mới
          this.addEditMettingTest(moreFunc,event);
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
  addEditBookingCar(moreFunc:any,event:any = null){
    this.getModelEP(moreFunc.functionID,BUSSINESS_FUNCID.EP_BOOKINGCARS,event).subscribe((model:any) => {
      if(model)
      {
        this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user.userID,["EP4","EP4E"]])
        .subscribe((isAppro:boolean) => {
          let option = new SidebarModel();
          option.FormModel = this.carFM;
          option.Width = '800px';
          this.callfc
            .openSide(
              CodxAddBookingCarComponent,
              [model, moreFunc.functionID, this.addCarTitle, null, null, false,isAppro],
              option
            ).closed.subscribe((res:any) => {
              if(res?.event)
              {
                let booking = this.convertModelEvent(res.event,"EP_BookingCars");
                let date = new Date(booking.startDate);
                let month = date?.getMonth() + 1, year = date.getFullYear();
                if(moreFunc.functionID == "SYS03")
                {
                  let idx = this.lstEvents.findIndex(x => x.transID == booking.transID);
                  if(idx > -1)
                    this.lstEvents.splice(idx,1);
                }
                this.lstEvents.push(booking);
                this.dEventMonth[month + "-" + year] = this.lstEvents;
                this.ejCalendar && this.ejCalendar.refresh();
                this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                this.detectorRef.detectChanges();
              }
            });
        });
      }
    });
  }

  // add & edit booking room
  addEditBookingRoom(moreFunc:any,event:any = null){
    this.getModelEP(moreFunc.functionID,BUSSINESS_FUNCID.EP_BOOKINGROOMS,event).subscribe((model:any) =>
    {
      if(model)
      {
        this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user.userID,["EP4","EP4E"]])
        .subscribe((isPermisson:boolean) => {
          let option = new SidebarModel();
          option.FormModel = this.roomFM;
          option.Width = '800px';
          this.callfc
            .openSide(
              CodxAddBookingRoomComponent,
              [model, moreFunc.functionID, this.addRoomTitle, null, null,false,isPermisson],
              option
            ).closed.subscribe((res:any) => {
              if(res?.event)
              {
                let booking = this.convertModelEvent(res.event,"EP_BookingRooms");
                let date = new Date(booking.startDate);
                let month = date?.getMonth() + 1, year = date.getFullYear();
                if(moreFunc.functionID == "SYS03")
                {
                  let idx = this.lstEvents.findIndex(x => x.transID == booking.transID);
                  if(idx > -1)
                    this.lstEvents.splice(idx,1);
                }
                this.lstEvents.push(booking);
                this.dEventMonth[month + "-" + year] = this.lstEvents;
                this.ejCalendar && this.ejCalendar.refresh();
                this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
              }
            });
        });
      }
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
  addEditMetting(moreFunc:any,event:any = null){
    this.getModelCO(moreFunc.functionID,event).subscribe((model:any) => {
      if(model)
      {
        let option = new SidebarModel();
        option.FormModel = this.meetingFM;
        option.Width = 'Auto';
        let obj = {
          action: moreFunc.functionID == "SYS01" ? "add" : "edit",
          titleAction: moreFunc.text,
          disabledProject: false,
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
            let date = new Date(meeting.startDate);
            let month = date.getMonth() + 1 , year = date.getFullYear();;
            if(moreFunc.functionID == "SYS03")
            {
              let idx = this.lstEvents.findIndex(x => x.transID == meeting.transID);
              if(idx > -1)
                this.lstEvents.splice(idx,1);
            }
            this.lstEvents.push(meeting);
            this.dEventMonth[month + "-" + year] = this.lstEvents;
            this.ejCalendar && this.ejCalendar.refresh();
            this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          }
        });
      }
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
  addEditMyTask(moreFunc:any, event:any){
    if(moreFunc.functionID == "SYS01")
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
            action: moreFunc.functionID == "SYS01" ? "add" : "edit",
            isAssignTask: false,
            titleAction: moreFunc.text,
            functionID: BUSSINESS_FUNCID.TM_MyTasks,
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
              let task = this.convertModelEvent(res.event[0],"TM_MyTasks");
              let date = new Date(task.startDate);
              let month = date.getMonth() + 1, year = date.getFullYear();
              this.lstEvents.push(task);
              this.dEventMonth[month + "-" + year] = this.lstEvents;
              this.ejCalendar && this.ejCalendar.refresh();
              this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
              this.detectorRef.detectChanges();
            }
          });
        }
      });
    }
    else if(moreFunc.functionID == "SYS03")
    {
      this.TMService.editTask(
        event.transID,BUSSINESS_FUNCID.TM_MyTasks,moreFunc.text,this.afterSaveMyTask.bind(this)
      );
    }
  }

  // add & edit  TM_AssignTaskS
  addEditAssignTask(moreFunc:any, event:any) {
    if(moreFunc.functionID == "SYS01"){
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
            titleAction: moreFunc.text,
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
              let date = new Date(task.startDate);
              let month = date.getMonth() + 1, year = date.getFullYear();
              this.lstEvents.push(task);
              this.dEventMonth[month + "-" + year] = this.lstEvents;
              this.ejCalendar && this.ejCalendar.refresh();
              this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
              this.detectorRef.detectChanges();
            }
          });
        }
      });
    }
    else if(moreFunc.functionID == "SYS03")
    {
      this.TMService.editTask(event.transID,BUSSINESS_FUNCID.TM_AssignTasks,moreFunc.text,this.afterSaveAssignTask.bind(this));
    }
  }

  // after Save Task
  afterSaveMyTask(data) {
    if(data)
    {
      let task = this.convertModelEvent(data,"TM_MyTasks")
      let date = new Date(task.startDate);
      let month = date.getMonth() + 1, year = date.getFullYear() ;
      let idx = this.lstEvents.findIndex(x => x.transID == task.transID);
      if(idx > -1)
      {
        this.lstEvents.splice(idx,1);
        this.lstEvents.push(task);
        this.dEventMonth[month + "-" + year] = this.lstEvents;
        this.ejCalendar && this.ejCalendar.refresh();
        this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
      }
    }
  }

  // after Save Task
  afterSaveAssignTask(data) {
    if(data)
    {
      let task = this.convertModelEvent(data,"TM_AssignTasks")
      let date = new Date(task.startDate);
      let month = date.getMonth() + 1, year = date.getFullYear();
      let idx = this.lstEvents.findIndex(x => x.transID == task.transID);
      if(idx > -1)
      {
        this.lstEvents.splice(idx,1);
        this.lstEvents.push(task);
        this.dEventMonth[month + "-" + year] = this.lstEvents;
        this.ejCalendar && this.ejCalendar.refresh();
        this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
      }
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
  addEditNote(moreFunc:any,event:any = null) {
    this.getModelWP(moreFunc.functionID,BUSSINESS_FUNCID.WP_NOTES,event).subscribe((model:any) => {
      if(model)
      {
        let obj = {
          formType: moreFunc.functionID == "SYS01" ? "add" :"edit",
          currentDate: new Date(),
          component: 'calendar-notes',
          maxPinNotes: '5',
          dataUpdate: model
        };
        let title = moreFunc.functionID == "SYS01" ? "Thêm ghi chú" : "Cập nhật ghi chú";
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
                  let date = new Date(note.startDate);
                  let month = date.getMonth() + 1, year = date.getFullYear();
                  if(moreFunc.functionID == "SYS03")
                  {
                    let idx = this.lstEvents.findIndex(x => x.transID == note.transID);
                    if(idx > -1)
                      this.lstEvents.splice(idx,1);
                  }
                  this.lstEvents.push(note);
                  this.dEventMonth[month + "-" + year] = this.lstEvents;
                  this.ejCalendar && this.ejCalendar.refresh();
                  this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
                }
              });
            }
          });
      }
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
        let date = new Date(event.startDate);
        let month = date.getMonth() + 1, year = date.getFullYear();
        if(idx > -1)
        {
          this.lstEvents.splice(idx,1);
          this.dEventMonth[month + "-" + year] = this.lstEvents;
          this.ejCalendar && this.ejCalendar.refresh();
          this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          this.notiService.notifyCode("SYS008");
        }
      }
      else this.notiService.notifyCode("SYS022");
    });
  }

  // delete event WP
  deleteEventWP(event){
    this.api.execSv("WP","ERM.Business.WP","NotesBusiness","DeleteByIDAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let date = new Date(event.startDate);
        let month = date.getMonth() + 1, year = date.getFullYear();
        if(idx > -1)
        {
          this.lstEvents.splice(idx,1);
          this.dEventMonth[month + "-" + year] = this.lstEvents;
          this.ejCalendar && this.ejCalendar.refresh();
          this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          this.notiService.notifyCode("SYS008");
        }
      }
      else this.notiService.notifyCode("SYS022");
    });
  }

  // delete event CO
  deleteEventCO(event){
    this.api.execSv("CO","ERM.Business.CO","MeetingsBusiness","DeleteMeetingsAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let date = new Date(event.startDate);
        let month = date.getMonth() + 1, year = date.getFullYear();
        if(idx > -1)
        {
          this.lstEvents.splice(idx,1);
          this.dEventMonth[month + "-" + year] = this.lstEvents;
          this.ejCalendar && this.ejCalendar.refresh();
          this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          this.notiService.notifyCode("SYS008");
        }
      }
      else this.notiService.notifyCode("SYS022");
    });
  }

  // delete event TM
  deleteEventTM(event){
    this.api.execSv("TM","ERM.Business.TM","TaskBusiness","DeleteTaskByRecIDAsync",event.transID).subscribe((res:any) => {
      if(res)
      {
        let idx = this.lstEvents.findIndex(x => x.transID == event.transID);
        let date = new Date(event.startDate);
        let month = date.getMonth() + 1, year = date.getFullYear();
        if(idx > -1)
        {
          this.lstEvents.splice(idx,1);
          this.dEventMonth[month + "-" + year] = this.lstEvents;
          this.ejCalendar && this.ejCalendar.refresh();
          this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          this.notiService.notifyCode("SYS008");
        }
      }
      else this.notiService.notifyCode("SYS022");
    });
  }

  // open poup add Metting new
  addEditMettingTest(moreFunc:any, event) {
    this.getModelCO(moreFunc.functionID,event).subscribe((model:any) => {
      if(model) {
        let option = new SidebarModel();
        option.FormModel = this.meetingFM;
        option.Width = 'Auto';
        let obj = {
          funcID : "TMT0501",
          action : moreFunc.text,
          data : model,
        };
        this.callfc.openSide(
          PopupAddMeetingsComponent,
        obj,
        option).closed.subscribe((res:any) => {
          if (res?.event)
          {
            // let meeting = this.convertModelEvent(res.event,"CO_Meetings");
            // let date = new Date(meeting.startDate);
            // let month = date.getMonth() + 1 , year = date.getFullYear();;
            // if(moreFunc.functionID == "SYS03")
            // {
            //   let idx = this.lstEvents.findIndex(x => x.transID == meeting.transID);
            //   if(idx > -1)
            //     this.lstEvents.splice(idx,1);
            // }
            // this.lstEvents.push(meeting);
            // this.dEventMonth[month + "-" + year] = this.lstEvents;
            // this.ejCalendar && this.ejCalendar.refresh();
            // this.calendarCenter && this.calendarCenter.changeEvents(this.lstEvents);
          }
        });
      }
    });
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
