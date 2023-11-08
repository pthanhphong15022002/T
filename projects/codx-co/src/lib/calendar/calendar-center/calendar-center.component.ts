import {
  Component,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CodxScheduleComponent, FormModel, ResourceModel, UIComponent, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { CodxCoService } from '../../codx-co.service';

@Component({
  selector: 'co-calendar-center',
  templateUrl: './calendar-center.component.html',
  styleUrls: ['./calendar-center.component.scss'],
})

export class CalendarCenterComponent
  extends UIComponent
  implements AfterViewInit
{

  @Input() resources: any;
  @Input() events: any;
  @Input() eventModel:any;
  @Input() resourceModel: any;
  @Input() isOutSource:boolean = false;
  @Input() statusColor:any;
  @Input() selectedDate:Date = new Date();
  @Input() eventTemplate:TemplateRef<any>;
  @Input() popupEventTemplate:TemplateRef<any>;
  @Input() resourceTemplate:TemplateRef<any>;
  @Input() moreFuncTemplate:TemplateRef<any>;
  @Input() currentView:string;
  @Input() dFormModel:TemplateRef<any>;


  @Output() evtChangeDate = new EventEmitter();
  @Output() evtChangeMonth = new EventEmitter();

  views: Array<ViewModel> | any = [];
  codxSchedule: CodxScheduleComponent;
  lstDayOff:any[] = []; // danh sách ngày nghỉ
  calendarID = 'STD';


  workDays: [1, 2, 3, 4, 5, 6];

  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;

  constructor(injector: Injector, private coService: CodxCoService) {
    super(injector);
  }


  onInit()
  {
    this.getListDayOff();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.schedule,
        active:true,
        showSearchBar: false,
        showFilter: false,
        model: {
          eventModel: this.eventModel,// mapping của event schedule
          resourceModel: this.resourceModel, // mapping của resource schedule
          template: this.eventTemplate, // template event
          template3: this.cellTemplate,
          template4: this.resourceTemplate,//template resource
          template6: this.moreFuncTemplate, // template more funtion
          template8: this.popupEventTemplate, //template popup event
          currentView:'TimelineMonth',
          hideFooter:true
        },
      },
    ];
    // set statusColor & isOutSource for Schedule
    var itv = setInterval(()=> {
      if((this.view?.currentView as any)?.schedule)
      {
        clearInterval(itv);
        this.codxSchedule = (this.view?.currentView as any).schedule;
        this.codxSchedule.isOutSource = this.isOutSource;
        this.codxSchedule.dataSource = this.events;
        this.codxSchedule.selectedDate = this.selectedDate ?? new Date();
        this.codxSchedule.statusColor = this.statusColor;
        this.codxSchedule.isCalendarView = true;
        this.codxSchedule.onTimelineViewChange(false);
        this.codxSchedule.setEventSettings();
      }
    },500)
  }


  //Change date
  changeDate(date:Date){
    if(this.codxSchedule)
    {
      this.codxSchedule.selectedDate = date;
      this.codxSchedule.setEventSettings();
    }
  }

  // change events
  changeEvents(dataSource:any[]) {
    if (this.codxSchedule)
    {
      this.codxSchedule.dataSource = dataSource;
      this.codxSchedule.setEventSettings();
    }
  }

  // change resource
  changeResource(resources:any[]){
    if(this.codxSchedule)
    {
      this.codxSchedule.resourceDataSource = resources;
      this.codxSchedule.onGroupingChange(resources);
      this.codxSchedule.onGridlinesChange(true);
      this.codxSchedule.onTimelineViewChange(true);
      this.codxSchedule.setEventSettings();
    }
  }

  // change mode calendar <-> schedule
  changeModeView(isCalendarView:boolean){
    if(this.codxSchedule)
    {
      this.codxSchedule.isCalendarView = isCalendarView;
      this.codxSchedule.onTimelineViewChange(isCalendarView);
      this.codxSchedule.setEventSettings();
    }
  }
  // remove resource
  removeResource(){
    if(this.codxSchedule)
    {
      this.codxSchedule.resourceDataSource = [];
      this.codxSchedule.onTimelineViewChange(false);
      this.codxSchedule.setEventSettings();
    }
  }

  changeStatusColor(statusColor:any[]){
    if(this.codxSchedule)
    {
      this.codxSchedule.statusColor = statusColor;
      this.codxSchedule.setEventSettings();
    }
  }

  // add event
  addEvent(event:any){
    if(this.codxSchedule)
    {
      this.codxSchedule.addData(event);
    }
  }

  // edit event
  editEvent(event:any){
    if(this.codxSchedule)
    {
      this.codxSchedule.updateData(event);
    }
  }

  //change date scheduler
  onAction(event: any) {
    if(event)
    {
      let date = event.data.currentDate as Date;
      if(this.selectedDate.getMonth() != date.getMonth())
        this.evtChangeMonth.emit({date:date});
      else
        this.evtChangeDate.emit({value:date});
    }
  }

  // render html day off schedule
  getDayOffHTML(evt: any,ele:HTMLElement) {
    if (this.lstDayOff?.length > 0){
      let cellDay = evt.date;
      let dayOff = this.lstDayOff.find(x => new Date(x.startDate).toLocaleDateString() === cellDay.toLocaleDateString());
      if(dayOff)
      {
        ele.style.backgroundColor = dayOff.color;
        ele.style.color = dayOff.color;
        ele.style.display = "flex";
        ele.style.alignItems = "center";
        ele.style.justifyContent = "center";
        ele.style.height = "calc(100% - 20px)";        
       return `${dayOff.note}`;
      }
    }
    return "";
  }

  //get list day off
  getListDayOff(id = null) {
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
        if(res?.length > 0)
        {
          this.lstDayOff = res;
          this.lstDayOff.forEach((e:any) => {
            let time = new Date(e.startDate).getTime();
            let eles = document.querySelectorAll('[data-date="' + time + '"]');
            if (eles?.length > 0){
              eles.forEach((ele:HTMLElement) => {
                if(ele.classList.value.includes("e-work-cells")){
                  ele.style.backgroundColor = e.color;
                  ele.innerText = e.note;
                }
              });
            }
          });
        }
      });
  }
}

