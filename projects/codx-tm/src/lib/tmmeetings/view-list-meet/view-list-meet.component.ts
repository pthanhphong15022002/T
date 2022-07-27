import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-view-list-meet',
  templateUrl: './view-list-meet.component.html',
  styleUrls: ['./view-list-meet.component.css']
})
export class ViewListMeetComponent implements OnInit {

  @Input() data?: any
  @Input() formModel?: FormModel;

  @Output() clickMoreFunction = new EventEmitter<any>();
  month: any;
  day: any;
  startTime: any;
  endTime: any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) { 
  }

  ngOnInit(): void {
    console.log(this.data);
    
    this.getDate();
  }

  getDate(){
    if(this.data.startDate){
      var date =new Date (this.data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(this.data.endDate);
      let start = this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());     
      let end = this.addZero(endDate.getHours()) + ':' + this.addZero(endDate.getMinutes());

      this.startTime = start + ' - ' + end;
    }
  }

  addZero(i){
    if(i<10){
      i = '0' + i;
    }
    return i;
  }

  convertHtmlAgency(position: any) {
    var desc = '<div class="d-flex">';
    if (position)
      desc += '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="ms-1">' + position + '</span></div>';

    return desc + '</div>';
  }


}
