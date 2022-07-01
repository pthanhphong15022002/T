import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { DialogData, NotificationsService, ViewsComponent } from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { objectPara } from '../viewFileDialog/alertRule.model';
import { SystemDialogService } from '../viewFileDialog/systemDialog.service';
import { FileService } from '@shared/services/file.service';
import { DateRangePickerComponent, CalendarView } from '@syncfusion/ej2-angular-calendars';
import moment from 'moment';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { elementAt } from 'rxjs';
import { NumberFormattingEventArgs } from '@syncfusion/ej2-pivotview';
// import moment from 'moment';

@Component({
  selector: 'calendardate',
  templateUrl: './calendardate.component.html',
  styleUrls: ['./calendardate.component.scss']
}) 
export class CalendarDateComponent implements OnInit, OnChanges { 
  @Input() mode: any;   
  @Input() year: any;   
  @Input() month: any;   
  @Input() week: any;   
  @Input() fromDate: Date;   
  @Input() toDate: Date;     
  @Output() dateChanged = new EventEmitter();
  monthFull: any;
  show: boolean;
  weeks: number;     
  today_week: number;
  tabIndex: number;   
  weekFormat = 'Week';
  monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October","November", "December"];
 
  public headerText: Object = [{ text: 'Ngày hết hạn' },{ text: 'Ngày' }, { text: 'Tuần' }, { text: 'Tháng' }, { text: 'Năm' }, { text: 'Khoảng thời gian' }];
  constructor(   
    private changeDetectorRef: ChangeDetectorRef, 
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private systemDialogService: SystemDialogService,
    private fileService: FileService
  ) 
  { 
      
  }

  ngOnInit(): void { 
    if (this.year == undefined) {    
      var d = new Date();
      var year = new Date().getFullYear(); 
      var month = this.monthList[d.getMonth()];
      this.show = false;
      this.year = year;
      this.month = d.getMonth();
      this.monthFull = month;
    }   
    this.weeks = this.weeksInYear();
    this.getWeekNumber();
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {   
  }

  getDateFromWeekNum(weekNo, yearNo) {
    let firstDayofYear = new Date(yearNo, 0, 1);

    if (firstDayofYear.getDay() > 4)  {
        let weekStart = new Date(yearNo, 0, (weekNo - 1) * 7 - firstDayofYear.getDay() + 8);
        let weekEnd = new Date(yearNo, 0, 1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 8 + 5);
        return { fromDate: weekStart, toDate: weekEnd }
    }
    else {
        let weekStart = new Date(yearNo, 0, (weekNo - 1) * 7 - firstDayofYear.getDay() + 1);
        let weekEnd = new Date(yearNo, 0, 1 + (weekNo - 1) * 7 - firstDayofYear.getDay() + 1 + 5);
        return { fromDate: weekStart, toDate: weekEnd }
    }
  }

  displayMonth() {
    if (this.monthFull != undefined && this.monthFull != '')
      return `${this.monthFull} `;
    else
      return `${this.monthFull}`;
  }

  selectDate(event, mode) {       
    // tabIndex = 1: week
    if (this.tabIndex != 1) {    
      var date = event.value;      
      this.year = date.getFullYear();
      this.month = date.getMonth();

      switch(this.tabIndex) {
        case 0:
          this.fromDate = date;             
          this.toDate = date;
          this.year = date.getFullYear();
          this.month = date.getMonth();
          this.monthFull = this.monthList[date.getMonth()];
          this.dateChangeEvent();
          break;
        case 2: // month        
          this.fromDate = new Date(this.year, this.month, 1);             
          this.toDate = new Date(this.year, this.month, 1);
          this.toDate.setMonth(this.toDate.getMonth() + 1);    
          this.toDate.setDate(this.toDate.getDate() - 1);
          this.monthFull = this.monthList[date.getMonth()];
          this.dateChangeEvent();
          break;
        case 3: // year          
          this.fromDate = new Date(this.year, 0, 1);;   
          this.toDate = new Date(this.year, 0, 1);;
          this.toDate.setFullYear(this.fromDate.getFullYear() + 1);
          this.toDate.setDate(this.toDate.getDate() - 1);
          this.monthFull = '';
          this.dateChangeEvent();
          break;
      }
      
      if (this.tabIndex == 3)
        this.monthFull = '';    
      else if (this.tabIndex == 4) {        
         this.monthFull = `${this.fromDate.toLocaleString().split(',')[0]} - ${this.toDate.toLocaleString().split(',')[0]}`;    
         this.year = '';
      }
      let onejan = new Date(date.getFullYear(), 0, 1);
      let week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);   
      this.week = week;      
      this.changeDetectorRef.detectChanges();
    }
  }

  dateChangeEvent() {
    var data: any = {};
    data.fromDate =  this.fromDate;
    data.toDate = this.toDate;
    data.month = this.month;
    data.year = this.year;    
    data.mode = this.mode;
    this.dateChanged.emit({ data: data  });
  }
  
  changeDate(event) {
    this.fromDate = event.startDate;
    this.toDate = event.endDate;  
    this.dateChangeEvent();    
  }

  selectWeek(i) {        
    var date = this.getDateFromWeekNum(i, this.year);        
    this.fromDate = date.fromDate;    
    this.toDate = date.toDate;        
    this.week = i;
    this.monthFull = `${this.weekFormat} ${i+1}`;
    this.dateChangeEvent();
    this.changeDetectorRef.detectChanges();
  }

  checkWeek(week) {
    if (week == this.week)
      return 'label-week week-selected';
    else {
      if (this.today_week != undefined && week == this.today_week)
        return 'label-week today-week';
      else
        return 'label-week';
    }
      
  }

  getWeekNumber() {
    if (this.week == undefined) {
      let now = (this.fromDate == undefined) ?  new Date() : this.fromDate;
      let onejan = new Date(now.getFullYear(), 0, 1);
      let week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);   
      this.week = week; 
    }    
  }

  weeksInYear() {
    var year = this.year;
    return Math.max(
             moment(new Date(year, 11, 31)).isoWeek()
           , moment(new Date(year, 11, 31-7)).isoWeek()
    );
  }  

  counter() {         
    return new Array(this.weeks);
  }

  goYear(mode) {
    if (mode == 'up')
      this.year++;
    else
      this.year--;      
    this.weeks = this.weeksInYear();
    if (this.weeks > this.week)
      this.week = this.weeks;
    
    if (this.fromDate != undefined) {
      var date = this.fromDate;      
      var month = date.getMonth();
      var day = date.getDate();
      this.fromDate = new Date(this.year, month, day);
      date = this.toDate;    
      var month = date.getMonth();
      var day = date.getDate();
      this.toDate = new Date(this.year, month, day);
    }  
   
    this.changeDetectorRef.detectChanges();
  }

  onOpen() {
    this.show = !this.show;
    this.changeDetectorRef.detectChanges();
  }

  clickTabs(e) {    
    this.tabIndex = e.selectedIndex;
    switch(this.tabIndex) {
      case 0:
        this.mode = 'day';
        break;
      case 1:
        this.mode = 'week';
        break;
      case 2:
        this.mode = 'month';
        break;
      case 3:
        this.mode = 'year';
        break;
      case 3:
        this.mode = 'range';
        break;
    }
    
    // week
    if (this.tabIndex == 1) {
      let now = new Date();
      let onejan = new Date(now.getFullYear(), 0, 1);
      this.today_week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);      
    }
    this.changeDetectorRef.detectChanges();    
  } 

  ChangeMode(mode) {
    this.mode = mode;
    this.changeDetectorRef.detectChanges();
  }
}
