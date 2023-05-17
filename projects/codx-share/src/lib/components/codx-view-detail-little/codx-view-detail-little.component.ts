import { Component, Input, OnChanges, OnInit, Optional, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-detail-little',
  templateUrl: './codx-view-detail-little.component.html',
  styleUrls: ['./codx-view-detail-little.component.css'],
})
export class CodxViewDetailLittleComponent implements OnInit ,OnChanges{
  @ViewChild('tempTask') tempTask?: TemplateRef<any>;
  @ViewChild('tempMeeting') tempMeeting?: TemplateRef<any>;

  @Input() recID: any;
  @Input() service : any = 'TM' ;
 
  data: any;
  vllPriority = 'TM005'; //truyền thi view khonbg thi mac định
  formModel: FormModel;
  month: any;
  day: any;
  startTime: any;
  objectID: string;
  dialog: DialogRef;
  

  constructor(private api :ApiHttpService) {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
   
  }
  ngOnInit(): void {
    this.loadingData();
  }

  loadingData() {
    switch (this.service) {
      case 'TM':
        this.api.exec<any>('TM','TaskBusiness','GetTaskDetailsViewCalendarAsync',this.recID).subscribe((res) => {
          if (res) {
            this.data = res;
          }
        });
        break;
      case 'CO':
        this.api.exec<any>('CO','MeetingsBusiness','GetMeetingByRecIDAsync',this.recID).subscribe((res) => {
          if (res) {
            this.data = res;
          }
        });
        break;
    }
  }

  getDate(data) {
    if (data.startDate) {
      var date = new Date(data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(data.endDate);
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
    var resources = [];
    this.objectID = '';
    resources = data.permissions;
    var id = '';
    if (resources != null) {
      resources.forEach((e) => {
        id += e.objectID + ';';
      });
    }

    if (id != '') {
      this.objectID = id.substring(0, id.length - 1);
    }
    return this.objectID;
  }
}
