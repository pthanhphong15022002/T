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
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import { FormGroup } from '@angular/forms';
import { map, of, switchMap } from 'rxjs';
import {
  SpeedDialComponent,
  SpeedDialItemEventArgs,
  SpeedDialItemModel,
} from '@syncfusion/ej2-angular-buttons';
import { CodxAddBookingCarComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { CodxAddBookingRoomComponent } from 'projects/codx-share/src/lib/components/codx-booking/codx-add-booking-room/codx-add-booking-room.component';
import { AddNoteComponent } from 'projects/codx-share/src/lib/components/calendar-notes/add-note/add-note.component';
import { PopupAddMeetingComponent } from 'projects/codx-share/src/lib/components/codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { PopupAddComponent } from 'projects/codx-share/src/lib/components/codx-tasks/popup-add/popup-add.component';
import { PopupSettingsComponent } from '../popup/popup-settings/popup-settings.component';
import { CodxCoService } from '../codx-co.service';
import { isElementAccessExpression } from 'typescript';
import { Data } from '@syncfusion/ej2-angular-grids';


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
  calendarParams:any[] = [];
  typeNavigate = 'Month';
  defaultFuncID:string = 'COT03'; // lịch cá nhân
  locale:string = 'vi';
  calendarID:string = 'COT03';
  lstCalendars:any[] = [];
  isChangeMonth = true;
  settings:any = {};
  dPredicate:any = {};
  dResources:any = {};
  statusColor:any[] = [];
  fromDate:Date = new Date();
  toDate:Date = new Date();
  lstEvents:any[] = [];
  lstResources:any[] = [];
  checked:string = "1";
  isLoading:boolean = false;
  selectedDate:Date = null;
  sysMoreFunc:any[] = [];
  id:string = "";

  startDate:Date = new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm'))
  endDate:Date = new Date(moment().endOf('month').format('YYYY-MM-DD hh:mm'));
  //speedDial
  speedDialItems: SpeedDialItemModel[] = [];
  //
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('ejCalendar') ejCalendar: CalendarComponent;
  @ViewChild('calendarCenter') calendarCenter: CalendarCenterComponent;
  @ViewChild('resourceTemplate') resourceTemplate: TemplateRef<any>;

  hrRequest:DataService = null;
  resourceModel:any = {
    // Name: 'employeeName',
    // Field: 'employeeID',
    // IdField: 'employeeID',// field mapping vs event Schedule
    // TextField: 'employeeName',
    // Title: 'employeeName',
    Name: 'name',
    Field: 'field',
    IdField: 'idField',// field mapping vs event Schedule
    TextField: 'textField',
    Title:  'title'
  };
  eventModel:any = {
    id: 'recID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'recID' },// field mapping vs resource Schedule
    status: 'transType',
  };
  //#endregion 
  
  constructor(
    private injector: Injector,
    private coService: CodxCoService,
    private cacheService: CacheService,
    private notificationsService: NotificationsService,
    private cfService: CallFuncService,
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
    this.getListCalendars();
    this.getSettingValue();
    this.getListEventFunc();
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
        this.hrRequest.idField = "OrgUnitID";
        this.hrRequest.selector = "OrgUnitID;OrgUnitName";
      }
    });
  }

  ngAfterViewInit() {
    // setting mode view
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
    var itv = setInterval(() => {
      if(this.ejCalendar)
      {
        document.querySelector(".e-footer-container").firstChild.addEventListener("click",() => {
          this.ejCalendar.value = new Date();
        });
        clearInterval(itv);
      }
    },1000);    
  }

  // get list event function
  getListEventFunc(){
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
            let obj = JSON.parse(element);
            this.statusColor.push({
              color: obj.ShowBackground,
              borderColor: obj.ShowColor,
              text: obj.Template.TransType,
              status: obj.Template.TransType,
              textColor: obj.TextColor ?? "#1F1717" // textColor chưa có thiết lập - gắn để test
            });
            this.dResources[obj.Template.TransType] = {
              color: obj.ShowColor,
              backgroundColor: obj.ShowBackground,
              borderColor: obj.ShowColor,
              text: obj.Template.TransType,
              status: obj.Template.TransType,
            }
            this.dPredicate[obj.Template.TransType] = obj.Predicate;
            arrParam.push(obj);
          });
          this.calendarParams = [...arrParam];
          this.getListEvents();
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

  lstUserGroups:any[] = [];
  // Get list AD_UserGroup
  getListUserGroup(){
    this.api.execSv("SYS","ERM.Business.AD","UserGroupsBusiness","GetUserGroupByCOAsync")
    .subscribe((res:any) => {
      if(res)
      {
        this.lstUserGroups = res[0];
        this.id = this.lstUserGroups[0].groupID;
        this.getListGroupMember(this.id);
        this.getListEvents();
        this.detectorRef.detectChanges();
      }
    });
  }
  //get list group member
  getListGroupMember(groupID=""){
    this.api.execSv("SYS","ERM.Business.AD","UserGroupsBusiness","GetGroupMemberByCOAsync",[groupID])
    .subscribe((res:any) => {
      if(res)
      {
        this.lstResources = res[0];
        this.detectorRef.detectChanges();
      }
    });
  }

  // select day in calendar
  changeDay(args){
    this.selectedDate = new Date(args.value);
    var dateDiff = Math.abs((this.startDate as any) - (this.selectedDate as any));
    if(Math.ceil(dateDiff / (1000 * 60 * 60 * 24)) < 0)
      this.navigateMoth(this.selectedDate); 
    this.detectorRef.detectChanges();
  }

  // navigate moth in
  navigateMoth(args){
    this.startDate = new Date(moment(args.date.toString()).startOf('month').format('YYYY-MM-DD hh:mm'));
    this.endDate = new Date(moment(args.date.toString()).endOf('month').format('YYYY-MM-DD hh:mm'));
    let month = args.date.getMonth() + 1; // javscript month 0-11
    let crrMonth = new Date().getMonth() + 1; // javscript month 0-11
    if(month === crrMonth)
      this.selectedDate = new Date(); // current month set selectedDate is new Date()
    else
      this.selectedDate = this.startDate; // new month set selectedDate is startDate
    this.getListEvents();
    this.detectorRef.detectChanges();
  }

  // show/hide events
  valueChange(e) {
    let transType = e.field;
    let value = e.data === false ? "0" : "1";

    this.calendarParams.map(x => { if(x.Template.transType == transType) {x.ShowEvent = value} });
    if(value == "0")
    {
      this.lstEvents = this.lstEvents.filter((x:any)=> x.transType !== transType); 
      //this.ejCalendar.value = this.startDate;
      // this.ejCalendar.refresh()
      this.detectorRef.detectChanges();
    }      
    else
    {
      let predicate = this.dPredicate[transType];
      switch(transType){
        case"WP_Notes":
          this.getEventNotes(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if(this.ejCalendar)
                this.ejCalendar.value = this.startDate;
              this.detectorRef.detectChanges();
            }
          });
          break;
        case"TM_MyTasks":
          this.getEventTasks(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if(this.ejCalendar)
                this.ejCalendar.value = this.startDate;
              this.detectorRef.detectChanges();
            }
          });
          break;
        case"CO_Meetings":
          this.getEventMeetings(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if(this.ejCalendar)
                this.ejCalendar.value = this.startDate;
              this.detectorRef.detectChanges();
            }
          });
          break;
        case"EP_BookingRooms":
          this.getEventBooking(this.calendarID,"1",this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if(this.ejCalendar)
                this.ejCalendar.value = this.startDate;
              this.detectorRef.detectChanges();
            }
          });
          break;
        case"EP_BookingCars":
          this.getEventBooking(this.calendarID,"2",this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
             // this.ejCalendar.value = this.startDate;
              this.detectorRef.detectChanges();
            }
          });
          break;
        case"TM_AssignTasks":
          this.getEventTasks(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if(this.ejCalendar)
                this.ejCalendar.value = this.startDate;
              this.detectorRef.detectChanges();
            }
          });
          break;
      }      
    }
  }

  //open popup setting
  openPopupSetting() {
    let option = new DialogModel();
    this.cfService.openForm(
      PopupSettingsComponent,
      '',
      600,
      550,
      '',
      this.calendarParams,
      '',
      option
    );
  }

  //
  convertStrToDate(eleDate) {
    if (eleDate) {
      let str = eleDate.title.split(',');
      let strMonth: any = str[1].split('Tháng');
      let numb: any = strMonth[1] + '-' + strMonth[0];
      numb = numb + '-' + str[2];
      return numb.replaceAll(' ', '');
    }
  }

  //render day cell ej2Calendar
  renderDayCell(args:any) {
    let eventDays = this.lstEvents.filter((x:any) => x.startDate != null && new Date(x.startDate).toLocaleDateString() === args.date.toLocaleDateString());
    if (eventDays.length > 0)
    {
      eventDays = eventDays.filter((value, index, self) => self.findIndex((m) => m.transType === value.transType) === index);
      eventDays.forEach((e:any) => {
        let span: HTMLElement;
        span = document.createElement('span');
        span.setAttribute('class', 'e-icons highlight');
        span.setAttribute('style', `color:${this.dResources[e.transType].color}`);
        addClass([args.element], ['special', 'e-day']);
        if((args.element as HTMLElement).children.length > 3)
        {

        }
        args.element.appendChild(span);
        return;
      });
    }
  }

  // change calendarID
  changeCalendarID(id:string) {
    this.calendarID = id;
    switch(id){
      case "COT01": // Lịch công ty
        break;
      case "COT02": // Lịch nhóm
        this.lstResources = [];
        this.getListUserGroup();
        break;
      case "COT03": // Lịch cá nhân
        this.id = "";
        this.lstResources = [];
        this.getListEvents();
        break;
    }
        
    this.detectorRef.detectChanges();
  }

  // get event source
  getListEvents(){
    this.lstEvents = [];
    this.calendarParams.forEach((element) => {
      if(element.ShowEvent === "1")
      {
        let predicate = this.dPredicate[element.Template.TransType];
        switch(element.Template.TransType)
        {
          case"WP_Notes":
            this.getEventNotes(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                if(this.ejCalendar)
                {
                  this.ejCalendar.value = new Date();
                }
              }
            });
            break;
          case"TM_MyTasks":
            this.getEventTasks(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                if(this.ejCalendar)
                {
                  this.ejCalendar.value = new Date();
                }
              }
            });
            break;
          case"CO_Meetings":
            this.getEventMeetings(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                if(this.ejCalendar)
                {
                  this.ejCalendar.value = new Date();
                }
              }
            });
            break;
          case"EP_BookingRooms":
            this.getEventBooking(this.calendarID,"1",this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                if(this.ejCalendar)
                {
                  this.ejCalendar.value = new Date();
                }
              }
            });
            break;
          case"EP_BookingCars":
            this.getEventBooking(this.calendarID,"2",this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                if(this.ejCalendar)
                {
                  this.ejCalendar.value = new Date();
                }
              }
            });
            break;
          case"TM_AssignTasks":
            this.getEventTasks(this.calendarID,this.id,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                if(this.ejCalendar)
                {
                  this.ejCalendar.value = new Date();
                }
              }
            });
            break;
        }
      }
    });
  }

  // get event TM
  getEventTasks(funcID:string,id:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("TM","ERM.Business.TM", "TaskBusiness", "GetCalendarEventsAsync", [funcID,id,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }

  // get event CO
  getEventMeetings(funcID:string,id:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("CO","ERM.Business.CO", "MeetingsBusiness", "GetCalendarEventsAsync",[funcID,id,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }

  // get event WP
  getEventNotes(funcID:string,id:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("WP","ERM.Business.WP", "NotesBusiness", "GetCalendarEventsAsync", [funcID,id,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }

  // get event EP
  getEventBooking(funcID:string,resourceType:string,id:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("EP","ERM.Business.EP", "BookingsBusiness", "GetCalendarEventsAsync", [funcID,resourceType,id,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }

  //on Filter
  onFiltering(e: FilteringEventArgs) {
    let query = new Query();
    query =
      e.text != ''
        ? query.where('defaultName', 'startswith', e.text, true)
        : query;
    e.updateData(this.lstCalendars, query);
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
    // let transType = args.item.id;
    // this.coService.checkPermission(transType, '').subscribe((res: boolean) => {
    //   if (res && res === true) {
    //     switch (transType) {
    //       case 'EP_BookingCars':
    //         this.addBookingCar();
    //         break;

    //       case 'EP_BookingRooms':
    //         this.addBookingRoom();
    //         break;

    //       case 'WP_Notes':
    //         this.addNote();
    //         break;

    //       case 'CO_Meetings':
    //         this.addMeeting();
    //         break;

    //       case 'TM_MyTasks':
    //         this.addMyTask();
    //         break;

    //       case 'TM_AssignTasks':
    //         this.addAssignTask();
    //         break;
    //     }
    //   } else 
    //   {
    //     this.notificationsService.notifyCode('SYS032');
    //   }
    // });
  }

  // add booking car
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
              debugger
              if(res2?.event)
              {
                let eventModel = {
                  transType: "EP_BookingCars",
                  functionID:"EPT2",
                  refID: res2.event.refID,
                  transID: res2.event.recID,
                  calendarDate: res2.event.startDate,
                  startDate: res2.event.startDate,
                  endDate: res2.event.endDate,
                  startTime: res2.event.startDate,
                  endTime: res2.event.endDate,
                  status: "Status|vll:EP022",
                  title: res2.event.title,
                  description: res2.event.memo,
                  memo: "ResourceID | cbx:EP_Cars"
                };
                this.lstEvents.push(eventModel);
                this.lstEvents = [...this.lstEvents];
                this.detectorRef.detectChanges();
              }
              else
                this.notificationsService.notify("Lỗi đặt xe");
            });
        });
      }
      else
        this.notificationsService.notify("Lỗi đặt xe");
    });
  }

  //add booking room
  addBookingRoom() {
    this.api.execSv<any>('EP', 'Core', 'DataBusiness', 'GetDefaultAsync', ['EPT11','EP_Bookings'])
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
              [model.data, 'SYS01', this.addRoomTitle, null, null,res],
              option
            ).closed.subscribe((res2:any) => {
              debugger
              if(res2?.event)
              {
                let eventModel = {
                  transType: "EP_BookingRooms",
                  functionID:"EPT2",
                  refID: res2.event.refID,
                  transID: res2.event.recID,
                  calendarDate: res2.event.startDate,
                  startDate: res2.event.startDate,
                  endDate: res2.event.endDate,
                  startTime: res2.event.startDate,
                  endTime: res2.event.endDate,
                  status: "Status|vll:EP022",
                  title: res2.event.title,
                  description: res2.event.memo,
                  memo: "ResourceID | cbx:EP_Rooms"
                };
                this.lstEvents.push(eventModel);
                this.lstEvents = [...this.lstEvents];
                this.detectorRef.detectChanges();
              }
              else
                this.notificationsService.notify("Lỗi đặt phòng");
            });
        });
      }
      else
        this.notificationsService.notify("Lỗi đặt phòng");
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
              this.lstEvents.push(event);
              this.lstEvents = [... this.lstEvents];
              this.detectorRef.detectChanges();
            }
            else
              this.notificationsService.notify("Lỗi thêm ghi chú");
          });
        }
        else
          this.notificationsService.notify("Lỗi thêm ghi chú");
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
              let eventModel = {
                transType : "CO_Meetings",
                functionID : "TMT0501",
                recID : res2.event.recID,
                transID : res2.event.recID,
                calendarDate : res2.event.startDate,
                startDate : res2.event.startDate,
                endDate : res2.event.endDate,
                startTime : res2.event.startDate,
                endTime : res2.event.endDate,
                status : res2.event.status,
                title : res2.event.eventName,
                description : res2.event.memo,
                memo : res2.event.location,
                icon : "icon - location_on"
              };
              this.lstEvents.push(eventModel);
              this.lstEvents = [...this.lstEvents];
              this.detectorRef.detectChanges();
            }
            else
              this.notificationsService.notify("Lỗi thêm sự kiện");
          });
        }
        else
          this.notificationsService.notify("Lỗi thêm sự kiện");
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
            let task = res2.event[0];
            let eventModel = {
              transType: "TM_MyTasks",
              functionID: "TMT0201",
              transID: task.recID,
              calendarDate: task.dueDate,
              startDate: task.startDate,
              endDate: task.endDate,
              startTime: task.startDate,
              endTime: task.endDate,
              status: task.status,
              priority: task.priority,
              title: task.taskName,
              description: task.taskName,
              alert: task.isOverdue,
              memo: task.dueDate
            };
            this.lstEvents.push(eventModel);
            this.lstEvents = [...this.lstEvents];
            this.detectorRef.detectChanges();
          }
          else
            this.notificationsService.notify("Lỗi thêm công việc");
        });
      }
      else
        this.notificationsService.notify("Lỗi thêm công việc");
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
          if(res2.event)
          {
            let task = res2.event[0];
            let eventModel = {
              transType: "TM_AssignTasks",
              functionID: "TMT0204",
              transID: task.recID,
              calendarDate: task.dueDate,
              startDate: task.startDate,
              endDate: task.endDate,
              startTime: task.startDate,
              endTime: task.endDate,
              status: task.status,
              priority: task.priority,
              title: task.taskName,
              description: task.taskName,
              alert: task.isOverdue,
              memo: task.dueDate
            };
            this.lstEvents.push(eventModel);
            this.lstEvents = [...this.lstEvents];
            this.detectorRef.detectChanges();
          }
          else
            this.notificationsService.notify("Lỗi thêm giao việc");
        });
      }
      else
        this.notificationsService.notify("Lỗi thêm giao việc");
    });
  }

  // date select change
  dateSelectChange(event:any){
    if (event?.fromDate === 'Invalid Date' && event?.toDate === 'Invalid Date') return;
    if (this.selectedDate >= event?.fromDate && this.selectedDate < event?.toDate)return;
    if (event?.fromDate && event?.toDate) 
    {
      if (event?.type) 
      {
        this.typeNavigate = event.type;
      }
      if (this.typeNavigate === 'Year') 
      {
        this.selectedDate = this.startDate;
      } else 
      {
        this.selectedDate = event.fromDate;
      }
      if (this.typeNavigate === 'Year' && event.type === undefined) {
        this.selectedDate = event?.toDate;
        return;
      }
    }
  }

  // selected HR_OrganziUnits
  selectOrganizationUnit(event = null){
    this.id = event.data.OrgUnitID;
    this.api.execSv("HR","ERM.Business.HR","HRBusiness","GetEmployeeByCOAsync","")
    .subscribe((res:any) => 
    { 
      let data = res ? res[0] : [];
      this.lstResources = [...data];
      this.getListEvents();
      this.detectorRef.detectChanges();
    });
  }

  //select AD_UserGroup
  selectUserGroup(item:any){
    this.id = item.groupID;
    this.getListGroupMember(item.groupID);
  }
}
