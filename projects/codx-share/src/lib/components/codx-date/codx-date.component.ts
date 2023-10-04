import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { AuthStore } from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'codx-date',
  templateUrl: './codx-date.component.html',
  styleUrls: ['./codx-date.component.css']
})
export class CodxDateComponent implements OnInit {

  @Input() value:string;
  @Input() option:string = "t" || "d" || "f" ;
  @Input() className:string;
 

  vn = {
    seconds: 'Vừa xong',
    minutes: ' phút',
    hours: ' giờ',
    days: ' ngày ',
    weeks: ' tuần',
    months: ' tháng ',
    years: ' năm ',
    yesterday: 'Hôm qua'
  };

  en = {
    seconds: 'Just now',
    minutes: ' minutes',
    hours: ' hours',
    days: ' days',
    weeks: ' weeks',
    months: ' months ',
    years: ' years',
    yesterday: 'Yesterday',
  };
  user:any;
  locale:any;
  text:string = "";
  constructor(private auth:AuthStore) 
  {
    this.user = auth.get();  
  }
  ngOnInit(): void {
    if (this.user.language.toLowerCase() != "vn")
      this.locale = this.en;  
    else
      this.locale = this.vn; 
    
    if(this.value)
    {
      var str = moment(this.value).format('LLLL'); 
      this.text = str.charAt(0).toUpperCase() + str.slice(1);
    }

    if(this.option.toLowerCase() == "t")
      this.value = this.formatT();
    else if(this.option.toLowerCase() == "d")
      this.value = this.formatD();
    else
      this.value = this.formatF();
    
  }

  formatT(){
    let date = new Date(this.value);
    var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
    var interval = 0;
    interval = seconds / 31536000;
    if (interval > 1) {  
      return moment(date).format('DD/MM/YYYY HH:mm');
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + this.locale.months + " " + moment(date).format('HH:mm');
    }
    interval = seconds / (86400 * 7);
    if (interval > 1) {
      return Math.floor(interval) + this.locale.weeks + " " + moment(date).format('HH:mm');
    }
    interval = seconds / 86400;
    if (interval > 1) {
      if (Math.floor(interval) < 2)
        return this.locale.yesterday + " " + moment(date).format('HH:mm');
      return Math.floor(interval) + this.locale.days  + " "  + moment(date).format('HH:mm');
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + this.locale.hours;
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + this.locale.minutes;
    }
    return this.locale.seconds;
  }

  formatD(){
    let date = new Date(this.value);
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  formatF(){
    let date = new Date(this.value);
    var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
    var interval = 0;
    interval = seconds / (86400 * 7);
    if (interval > 1) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    }
    interval = seconds / 86400;
    if (interval > 1) {
      if (Math.floor(interval) < 2)
        return this.locale.yesterday + " " + moment(date).format('HH:mm');
      return Math.floor(interval) + this.locale.days  + " "  + moment(date).format('HH:mm');
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + this.locale.hours;
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + this.locale.minutes;
    }
    return this.locale.seconds;
  }
}
