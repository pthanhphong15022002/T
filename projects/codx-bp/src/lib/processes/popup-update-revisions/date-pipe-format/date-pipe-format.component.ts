import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit,Input } from '@angular/core';
import { timestamp } from 'rxjs';
import { DateModelView } from './Model/DateModel';

@Component({
  selector: 'lib-date-pipe-format',
  templateUrl: './date-pipe-format.component.html',
  styleUrls: ['./date-pipe-format.component.css']
})
export class DatePipeFormatComponent implements OnInit {
  @Input('dateFormatSimple') dateValue: Date;
  dateFormat: Date;
  dateValueModel= new DateModelView();
  //dateNow= new Date(this.dateValue);
  constructor(public datepipi: DatePipe){
  // let currentDateTime =new Date();
  // console.log(this.dateValue);
  // console.log(datepipi.transform(this.dateValue,'MM/dd/yyyy h:mm:ss'));

  }
  ngOnInit(): void {
    this.dateFormat= new Date(this.dateValue);
    let dateNow = this.mapDateModel(new Date());
    this.dateValueModel.hour = this.dateFormat.getHours();
    let dateOld= this.mapDateModel(this.dateFormat);

    console.log(dateNow);
    console.log(dateOld);


  }
  mapDateModel(date: Date): DateModelView {
    let obj = new DateModelView();
    obj.second = date.getSeconds();
    obj.minute = date.getMinutes();
    obj.hour = date.getHours();
    obj.year = date.getFullYear();
    obj.month = date.getMonth();
    obj.day = date.getDay();
    return obj;
  }
}
