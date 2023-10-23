import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { FormModel, ResourceModel, UIComponent, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { CodxCoService } from '../../codx-co.service';

@Component({
  selector: 'co-calendar-center',
  templateUrl: './calendar-center.component.html',
  styleUrls: ['./calendar-center.component.scss'],
})
export class CalendarCenterComponent
  extends UIComponent
  implements AfterViewInit,OnChanges
{
  @ViewChild('contentTmp') contentTmp: TemplateRef<any>;
  // @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;


  @Input() resources: any;
  @Input() eventData: any;
  @Input() resourceModel!: any;
  @Input() isOutSource:boolean = false;
  @Input() statusColor:any;
  @Input() selectDate:any;
  @Input() eventTemplate:TemplateRef<any>;
  @Input() resourceTemplate:TemplateRef<any>;

  @Output() evtResourceClick = new EventEmitter();
  @Output() evtAction = new EventEmitter();
  @Output() evtDateSelectChange = new EventEmitter();

  views: Array<ViewModel> | any = [];
  
  startTime: any;
  month: any;
  day: any;
  btnAdd = {
    id: 'btnAdd',
  };
  codxSchedule: any;
  dayoff: any;
  calendarID = 'STD';


  scheduleHeader?: ResourceModel;
  scheduleHeaderModel:any = {
    Name: 'EmployeeName',
    Field: 'EmployeeID',
    IdField: 'EmployeeID',// field mapping vs event Schedule
    TextField: 'EmployeeName',
    Title: 'EmployeeName',
  };

  scheduleEvent?: ResourceModel;
  scheduleEvtModel:any = {
    id: 'recID',
    subject: { name: 'title' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'recID' },// field mapping vs resource Schedule
    status: 'transType',
  };
  resourceDataSource:any = [];


  constructor(injector: Injector, private coService: CodxCoService) {
    super(injector);
  }
  

  onInit(): void {
    this.getDayOff();
    // set statusColor & isOutSource for Schedule
    var itv = setInterval(()=> {
      if((this.view?.currentView as any)?.schedule)
      {
        (this.view.currentView as any).schedule.isOutSource = this.isOutSource;
        (this.view.currentView as any).statusColor = this.statusColor;
        clearInterval(itv);
      }
    },1000)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["eventData"])
    {
      this.changeEvents(this.eventData);
    }
    if(changes["resources"])
    {
      if((this.view?.currentView as any)?.schedule)
      {
        (this.view.currentView as any).schedule.resourceDataSource = this.resourceDataSource;
        (this.view.currentView as any).schedule.setEventSettings();
        this.detectorRef.detectChanges();
      }
    }
    if(changes["selectDate"] && changes["selectDate"].currentValue != changes["selectDate"].previousValue )
    {
      if((this.view?.currentView as any)?.schedule)
      {
        (this.view.currentView as any).schedule.selectedDate = this.selectDate;
        (this.view.currentView as any).schedule.setEventSettings();
        this.detectorRef.detectChanges();
      }
    }
  }

  // init schedule
  
  ngAfterViewInit(): void {
    // setting mode view
    this.views = [
      {
        type: ViewType.schedule,
        active:true,
        showSearchBar: false,
        showFilter: true,
        model: {
          eventModel: this.scheduleEvtModel,// mapping của event schedule
          resourceModel: this.scheduleHeaderModel, // mapping của resource schedule
          template3: this.cellTemplate,
          template4: this.resourceHeader,//template của resource schedule
          template6: this.mfButton,
        },
      },
    ];
    this.evtAction.emit();
    this.detectorRef.detectChanges();
  }

  


  changeResource(datas:any[]){
    if(this.view)
    {
      (this.view.currentView as any).schedule.resourceDataSource = datas;
      (this.view.currentView as any).schedule.setEventSettings();
    }
  }
  //navigate scheduler
  onAction(event: any) {
    if (
      event.data.fromDate === 'Invalid Date' &&
      event.data.toDate === 'Invalid Date'
    ) {
      return;
    }
    if (
      (event?.type === 'navigate' &&
        event.data.fromDate &&
        event.data.toDate) ||
      event?.data?.type === undefined
    ) {
      let obj;
      if (event?.data.type === 'Week') {
        let fromDate = new Date(
          event.data.fromDate.setDate(event.data.fromDate.getDate() + 1)
        );
        let toDate = new Date(
          event.data.toDate.setDate(event.data.toDate.getDate() + 1)
        );
        obj = {
          fromDate: fromDate,
          toDate: toDate,
          type: event?.data.type,
        };
      } else {
        obj = {
          fromDate: event.data.fromDate,
          toDate: event.data.toDate,
          type: event?.data.type,
        };
      }
      this.evtDateSelectChange.emit(obj);
    }
  }

  changeEvents(dataSource: any) {
    let ivt = setInterval(() => 
    {
      this.codxSchedule = (this.view?.currentView as any)?.schedule;
      if (this.codxSchedule) 
      {
        clearInterval(ivt);
        for (const data of dataSource) 
        {
          if (
            data.transType === 'TM_AssignTasks' || data.transType === 'TM_MyTasks') {
            let tempStartDate = new Date(data.startDate);
            let tempEndDate = new Date(data.endDate);
            data.startDate = new Date(
              tempStartDate.getFullYear(),
              tempStartDate.getMonth(),
              tempStartDate.getDate(),
              tempStartDate.getHours(),
              tempStartDate.getMinutes()
            ).toString();
            data.endDate = new Date(
              tempEndDate.getFullYear(),
              tempEndDate.getMonth(),
              tempEndDate.getDate(),
              tempEndDate.getHours(),
              tempEndDate.getMinutes()
            ).toString();
          }
        }
        this.codxSchedule.dataSource = dataSource;
        this.codxSchedule.setEventSettings();
        this.detectorRef.detectChanges();
      }
    });
  }

  showHour(stringDate: any) {
    const date: Date = new Date(stringDate);
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return timeString;
  }


  getDate(data) {
    if (data.startDate) {
      let date = new Date(data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      let endDate = new Date(data.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());
      this.startTime = start + ' - ' + end;
    }
    return this.startTime;
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }

  getResourceID(data) {
    const permissions = data.permissions;
    const permisstionIDs = permissions
      ? permissions.map((r) => r.objectID)
      : [];
    const res = permisstionIDs.join(';');
    return res;
  }

  getCellContent(evt: any) {
    let obj = evt.date;
    if (this.dayoff && this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          obj.getFullYear() === day.getFullYear() &&
          obj.getMonth() === day.getMonth() &&
          obj.getDate() === day.getDate()
        ) {
          let time = obj.getTime();
          let ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
            return (
              `<icon class="'${this.dayoff[i].symbol}'"></icon>
              <span>${this.dayoff[i].note}</span>`
            );
          } else {
            return '';
          }
        }
      }
    }

    return ''; // Return a default value if no conditions are met
  }

  getDayOff(id = null) {
    if (id) this.calendarID = id;
    this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarsBusiness',
        'GetDayWeekAsync',
        [this.calendarID]
      )
      .subscribe((res) => {
        if (res) {
          this.dayoff = res;
        }
      });
  }

  valueChangeCB(e, note, index) {
    for (let i = 0; i < note.checkList.length; i++) {
      if (index == i) note.checkList[i].status = e.data;
    }
    note.createdOn = note.calendarDate;

    // if ((note as any).data != null) {
    //   note.createdOn = (note as any).data.createdOn;
    // }
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        note?.transID,
        note,
      ])
      .subscribe();
  }
}
