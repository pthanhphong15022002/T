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

  @Output() evtChangeDate = new EventEmitter();
  @Output() evtChangeMonth = new EventEmitter();
  
  views: Array<ViewModel> | any = [];
  codxSchedule: CodxScheduleComponent;
  lstDayOff:any[] = []; // danh sách ngày nghỉ
  calendarID = 'STD';
  
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;

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
          template4: this.resourceTemplate,//template resource 
          template6: this.mfButton,
          template8: this.popupEventTemplate //template popup event
        },
      },
    ];
    // set statusColor & isOutSource for Schedule
    var itv = setInterval(()=> {
      if((this.view?.currentView as any)?.schedule)
      {
        this.codxSchedule = (this.view?.currentView as any)?.schedule;
        this.codxSchedule.isOutSource = this.isOutSource;
        this.codxSchedule.dataSource = this.events;
        this.codxSchedule.resourceDataSource = this.resources;
        this.codxSchedule.selectedDate = this.selectedDate ?? new Date();
        (this.view.currentView as any).statusColor = this.statusColor;
        this.codxSchedule.setEventSettings();
        clearInterval(itv);
      }
    },500)
  }


  //Change date
  changeDate(date:Date){
    if(this.codxSchedule)
    {
      this.codxSchedule.selectedDate = date;
      this.codxSchedule.setEventSettings();
      this.detectorRef.detectChanges();
    }
  }
  
  // change events
  changeEvents(dataSource:any[]) {
    if (this.codxSchedule) 
    {
      this.codxSchedule.dataSource = dataSource;
      this.codxSchedule.setEventSettings();
      this.detectorRef.detectChanges();
    }
  }
  
  // change resource
  changeResource(resources:any[]){
    if(this.codxSchedule)
    {
      this.codxSchedule.resourceDataSource = resources;
      this.codxSchedule.onGroupingChange(resources);
      this.codxSchedule.setEventSettings();
      this.detectorRef.detectChanges();
    }
  }

  // remove resource
  removeResource(){
    if(this.codxSchedule)
    {
      this.codxSchedule.resourceDataSource = null;
      this.codxSchedule.onGroupingChange(null);
      this.codxSchedule.setEventSettings();
      this.detectorRef.detectChanges();
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
  getDayOffHTML(evt: any) {
    let obj = evt.date;
    let cellDay = evt.date;
    let html = "";
    if (this.lstDayOff?.length > 0) 
    {
      let dayOff = this.lstDayOff.find(x => new Date(x.startDate).toLocaleDateString() === cellDay.toLocaleDateString());
      if(dayOff)
      {
        debugger
        let time = obj.getTime();
        let ele = document.querySelectorAll('[data-date="' + time + '"]');
        if (ele?.length > 0) 
        {
          ele.forEach((item) => { (item as any).style.backgroundColor = dayOff.color; });
          html =`<icon class="${dayOff.symbol}"></icon><span>${dayOff.note}</span>`;
        } 
      }
    }
    return html;
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
        if(res) 
        {
          this.lstDayOff = res;
        }
      });
  }
}

enum TimelineSchedule {
  TimelineDay = 0,
  TimelineWeek = 1,
  TimelineWorkWeek = 2,
  TimelineMonth = 3,
  TimelineYear = 4,
  Agenda = 5,
  MonthAgenda = 6
}
