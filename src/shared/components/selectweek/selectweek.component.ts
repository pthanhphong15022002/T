import { InlineSVGModule } from 'ng-inline-svg';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'selectweek',
  templateUrl: './selectweek.component.html',
  styleUrls: ['./selectweek.component.scss'],
})
export class SelectweekComponent implements OnInit {
  moment = moment().locale('en');
  today = moment().startOf('day').toDate();
  week: number;
  month: number;
  fullDateName: string;
  isChangeWeek: boolean = false;
  isFinished: boolean = false;
  fromDate: Date;
  toDate: Date;
  lstDateInWeek: Date[] = [];
  daySelected = this.today;
  daySelectedFrom;
  daySelectedTo;
  beginMonth: Date;
  endMonth: Date;
  @Output() onChangeValue = new EventEmitter();
  @Output() onChangeWeek = new EventEmitter();
  isGenerateWeek = false;
  constructor(private changdefect: ChangeDetectorRef) {
    this.generateDateInWeek(this.today);
  }
  changeDaySelected(date: Date, changeWeek = false) {
    this.isGenerateWeek = true;
    this.daySelected = date;
    this.week = moment(date).locale('en').week();
    this.month = moment(date).month();
    this.beginMonth = moment(date).startOf('month').toDate();
    this.endMonth = moment(date).endOf('month').toDate();
    this.daySelectedFrom = moment(date).startOf('day').toDate();
    this.daySelectedTo = moment(date).endOf('day').toDate();
    this.onChangeValue.emit({
      daySelected: date,
      fromDate: this.fromDate,
      toDate: this.toDate,
      week: this.week,
      month: this.month,
      beginMonth: this.beginMonth,
      endMonth: this.endMonth,
      daySelectedFrom: this.daySelectedFrom,
      daySelectedTo: this.daySelectedTo,
    });
    this.fullDateName =
      moment(date).format('dd') +
      ', ' +
      moment(date).format('MMM') +
      ', ' +
      moment(date).format('YYYY');
      
  }

  LoadFinished(i){
    if(this.isChangeWeek == true && this.isFinished == false){
      this.isFinished = true;
      this.onChangeWeek.emit();
    }
    this.isChangeWeek == false;

  }
  
  changeTimeByControl(data) {
    if (this.isGenerateWeek)
      //console.log('data',data.data);
      // this.changeDaySelected(data.data);
      this.isGenerateWeek = false;
    else this.generateDateInWeek(data.data);
  }
  ngOnInit(): void {}
  changeWeek(numberDay) {
    this.isFinished = false;
    this.isChangeWeek = true;
    let day = moment(this.fromDate).add(numberDay, 'd').toDate();
    this.generateDateInWeek(day, true);
  }
  generateDateInWeek(daySelected, changeWeek = false) {
    this.fromDate = moment(daySelected).locale('en').startOf('week').toDate();
    this.toDate = moment(daySelected).locale('en').endOf('week').toDate();
    this.lstDateInWeek = [];
    let fromDate = this.fromDate;
    while (fromDate <= this.toDate) {
      this.lstDateInWeek.push(fromDate);
      fromDate = moment(fromDate).add(1, 'd').toDate();
    }
    let chooseDay: Date = daySelected;
    if (this.today >= this.fromDate && this.today <= this.toDate) {
      chooseDay = this.today;
    } else {
      chooseDay = daySelected;
    }
    this.changeDaySelected(chooseDay, changeWeek);
  }

  renderEvent(date) {
    var dt = date?.getDate();
    var ele = document.querySelector(".week-item[data-date='" + dt + "']");
  }
}
