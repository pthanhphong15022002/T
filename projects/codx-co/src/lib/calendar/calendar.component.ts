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
  listOrgUnit:any[] = [];
  checked:string = "1";
  isLoading:boolean = false;
  selectedDate:Date = null;
  sysMoreFunc:any[] = [];
  startDate:Date = new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm'))
  endDate:Date = new Date(moment().endOf('month').format('YYYY-MM-DD hh:mm'));

  //speedDial
  speedDialItems: SpeedDialItemModel[] = [];
  //
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('ejCalendar') ejCalendar: CalendarComponent;
  @ViewChild('calendarCenter') calendarCenter: CalendarCenterComponent;
  //#endregion 
  
  constructor(
    injector: Injector,
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
          res.forEach((element) => {
            let obj = JSON.parse(element);
            this.statusColor.push({
              color: obj.ShowBackground,
              borderColor: obj.ShowColor,
              text: obj.Template.TransType,
              status: obj.Template.TransType,
            });
            this.dResources[obj.Template.TransType] = {
              color: obj.ShowColor,
              backgroundColor: obj.ShowBackground,
              borderColor: obj.ShowColor,
              text: obj.Template.TransType,
              status: obj.Template.TransType,
            }
            this.calendarParams.push(obj);
            this.settings[obj.Template.TransType] = obj.Predicate;
            this.dPredicate[obj.Template.TransType] = obj.Predicate;
          });
          this.getListEvents();
          this.detectorRef.detectChanges();
        }
      });
  }

  // get list Calendars
  getListCalendars() {
  this.api
    .execSv('SYS','ERM.Business.AD', 'PermissionsBusiness', 'GetCalendarAllowedAsync',[this.funcID])
    .subscribe((res: any) => {
      if(res)
      {
        this.lstCalendars = res;
        this.calendarID = this.defaultFuncID;
        this.detectorRef.detectChanges();
      }
    });
  }

  // get lits HR_OrganizationUnits
  getDataOrgUnit(){
    if(this.listOrgUnit?.length > 0)
      return;
    this.cache.functionList('HRT01')
    .subscribe((func:any) => {
      if(func){
        var request = new DataRequest();
        request.funcID = 'HRT01';
        request.formName  = func.formName;
        request.gridViewName  = func.gridViewName;
        request.entityName  = func.entityName;
        request.entityPermission = func.entityPermission;
        request.predicate = func.predicate;
        request.dataValue = func.dataValue;
        request.pageLoading = false;
        this.api.execSv('HR','ERM.Business.HR','HRBusiness','GetOrgUnitByCOAsync',[request])
        .subscribe((res:any) => {
          this.listOrgUnit = res;
          this.getListEvents();
          this.getListResource();
          this.detectorRef.detectChanges();
        });
      }
    });
  }

  // get list HR_Employes by OrgUnitID
  getListResource(orgUnitID:string = ""){
    this.api.execSv("HR","HR","HRBusiness","GetEmployeeByCOAsync",orgUnitID)
    .subscribe((res:any) => {
      if(res)
      {
        this.lstResources = res[0];
        this.detectorRef.detectChanges();
      }
    });
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
      this.detectorRef.detectChanges();
    }      
    else
    {
      let predicate = this.dPredicate[transType];
      switch(transType){
        case"WP_Notes":
          this.getEventNotes(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if (this.ejCalendar) 
              {
                this.ejCalendar.refresh();
                //this.ejCalendar.value = this.startDate;              
              }
              this.detectorRef.detectChanges();
            }
          });
          break;
        case"TM_MyTasks":
          this.getEventTasks(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if (this.ejCalendar) 
              {
                this.ejCalendar.refresh();
                //this.ejCalendar.value = this.startDate;
              }
              this.detectorRef.detectChanges();

            }
          });
          break;
        case"CO_Meetings":
          this.getEventMeetings(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if (this.ejCalendar) 
              {
                this.ejCalendar.refresh();
                //this.ejCalendar.value = this.startDate;
              }
              this.detectorRef.detectChanges();

            }
          });
          break;
        case"EP_BookingRooms":
          this.getEventBooking(this.calendarID,predicate,"1",this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if (this.ejCalendar) 
              {
                this.ejCalendar.refresh();
                //this.ejCalendar.value = this.startDate;
              }
              this.detectorRef.detectChanges();

            }
          });
          break;
        case"EP_BookingCars":
          this.getEventBooking(this.calendarID,predicate,"2",this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if (this.ejCalendar) 
              {
                this.ejCalendar.refresh();
                //this.ejCalendar.value = this.startDate;
              }
              this.detectorRef.detectChanges();

            }
          });
          break;
        case"TM_AssignTasks":
          this.getEventTasks(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
            if(res?.length > 0)
            {
              this.lstEvents = this.lstEvents.concat(res);
              if (this.ejCalendar) 
              {
                this.ejCalendar.refresh();
                //this.ejCalendar.value = this.startDate;
              }
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
    let arrEvent = this.lstEvents.filter((x:any) => x.startDate != null && new Date(x.startDate).toLocaleDateString() === args.date.toLocaleDateString());
    if (arrEvent.length > 0)
    {
      arrEvent = arrEvent.filter((value, index, self) => self.findIndex((m) => m.transType === value.transType) === index);
      arrEvent.forEach((e:any) => {
        let span: HTMLElement;
        span = document.createElement('span');
        span.setAttribute('class', 'e-icons highlight');
        span.setAttribute('style', `color:${this.dResources[e.transType].color}`);
        addClass([args.element], ['special', 'e-day']);
        args.element.appendChild(span);
        return;
      });
    }
  }

  changeCalendarID(id:string) {
    this.calendarID = id;
    if(id == "COT01") // lịch công ty
      this.getDataOrgUnit();
    else
      this.lstResources = [];
    this.detectorRef.detectChanges();
  }

  // get event source
  getListEvents(){
    this.lstEvents = [];
    this.detectorRef.detectChanges();
    this.calendarParams.forEach((element) => {
      if(element.ShowEvent === "1")
      {
        let predicate = this.dPredicate[element.Template.TransType];
        switch(element.Template.TransType)
        {
          case"WP_Notes":
            this.getEventNotes(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                this.ejCalendar && this.ejCalendar.refresh();
                this.detectorRef.detectChanges();
              }
            });
            break;
          case"TM_MyTasks":
            this.getEventTasks(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                this.ejCalendar && this.ejCalendar.refresh();
                this.detectorRef.detectChanges();
              }
            });
            break;
          case"CO_Meetings":
            this.getEventMeetings(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                this.ejCalendar && this.ejCalendar.refresh();
                this.detectorRef.detectChanges();
              }
            });
            break;
          case"EP_BookingRooms":
            this.getEventBooking(this.calendarID,predicate,"1",this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                this.ejCalendar && this.ejCalendar.refresh();
                this.detectorRef.detectChanges();
              }
            });
            break;
          case"EP_BookingCars":
            this.getEventBooking(this.calendarID,predicate,"2",this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                this.ejCalendar && this.ejCalendar.refresh();
                this.detectorRef.detectChanges();
              }
            });
            break;
          case"TM_AssignTasks":
            this.getEventTasks(this.calendarID,predicate,this.startDate,this.endDate).subscribe((res:any) => {
              if(res?.length > 0)
              {
                this.lstEvents = [...this.lstEvents.concat(res)];
                this.ejCalendar && this.ejCalendar.refresh();
                this.detectorRef.detectChanges();
              }
            });
            break;
        }
      }
    });
  }

  // get event TM
  getEventTasks(funcID:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("TM","ERM.Business.TM", "TaskBusiness", "GetCalendarEventsAsync", [funcID,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }
  // get event CO
  getEventMeetings(funcID:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("CO","ERM.Business.CO", "MeetingsBusiness", "GetCalendarEventsAsync",[funcID,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }
  // get event WP
  getEventNotes(funcID:string,predicate:string,fromDate:Date,toDate:Date){
    return this.api.execSv("WP","ERM.Business.WP", "NotesBusiness", "GetCalendarEventsAsync", [funcID,predicate,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }
  // get event EP
  getEventBooking(funcID:string,predicate:string,resourceType:string,fromDate:Date,toDate:Date){
    return this.api.execSv("EP","ERM.Business.EP", "BookingsBusiness", "GetCalendarEventsAsync", [funcID,predicate,resourceType,fromDate,toDate]).pipe(map((res:any) => {
      return res;
    }));
  }

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
    this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user,"EP4","EP4E"])
    .subscribe((res:boolean) => {
      if(res)
      {
        let option = new SidebarModel();
        option.FormModel = this.carFM;
        option.Width = '800px';
        this.callfc
          .openSide(
            CodxAddBookingCarComponent,
            [this.carFG?.value, 'SYS01', this.addCarTitle, null, null, false],
            option
          ).closed.subscribe((event:any) => {
            debugger
            if(event){

            }
          });
      }
      else
      {
        this.notificationsService.notifyCode('SYS032');
      }
    });
    
  }
  //add booking room
  addBookingRoom() {
    this.api.execSv("SYS","ERM.Business.AD","UserRolesBusiness","CheckUserRolesCOAsync",[this.user,"EP4","EP4E"])
    .subscribe((res:boolean) => {
      if(res)
      {
        let option = new SidebarModel();
        option.FormModel = this.roomFM;
        option.Width = '800px';
        this.callfc
        .openSide(
          CodxAddBookingRoomComponent,
          [this.roomFG?.value, 'SYS01', this.addRoomTitle, null, null, false],
          option
        ).closed.subscribe((event:any) => {
            debugger
            if(event)
            {

            }
          });
      }
      else
      {
        this.notificationsService.notifyCode('SYS032');
      }
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
              debugger
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
          debugger
          if(res2.event)
          {
            let eventModel = {
              transType: "TM_MyTasks",
              functionID: "TMT0201",
              transID: res2.event.RecID,
              calendarDate: res2.event.DueDate,
              startDate: res2.event.StartDate,
              endDate: res2.event.EndDate,
              startTime: res2.event.StartDate,
              endTime: res2.event.EndDate,
              status: res2.event.Status,
              priority: res2.event.Priority,
              title: res2.event.TaskName,
              description: res2.event.TaskName,
              alert: res2.event.IsOverdue,
              memo: res2.event.DueDate
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
          debugger
          if(res2.event)
          {
            let eventModel = {
              transType: "TM_AssignTasks",
              functionID: "TMT0204",
              transID: res2.event.RecID,
              calendarDate: res2.event.DueDate,
              startDate: res2.event.StartDate,
              endDate: res2.event.EndDate,
              startTime: res2.event.StartDate,
              endTime: res2.event.EndDate,
              status: res2.event.Status,
              priority: res2.event.Priority,
              title: res2.event.TaskName,
              description: res2.event.TaskName,
              alert: res2.event.IsOverdue,
              memo: res2.event.DueDate
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

  selectOrg(orgUnitID:string){
    this.api.execSv("HR","HR","HRBusiness","GetEmployeeByCOAsync",orgUnitID)
    .subscribe((res:any) => {
      this.lstResources = res ? res[0] : [];
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
}
