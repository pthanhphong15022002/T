import { CO_Meetings } from './../../models/CO_Meetings.model';
import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css']
})
export class PopupAddMeetingComponent implements OnInit {
  @Input() meeting = new CO_Meetings();

  dialog: any;
  user:any ;
  param: any;
  functionID: string;
  title = 'Thêm họp định kì'
  showPlan = true;
  data: any;
  action: any;
  selectedDate = new Date();
  constructor(
    private changeDetectorRef : ChangeDetectorRef ,
    private api :ApiHttpService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.getParam() ;
    this.data = dialog.dataService!.dataSelected;
    this.meeting = this.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.action = dt.data;
    this.functionID = this.dialog.formModel.funcID;
    if(this.meeting.startDate){
      this.selectedDate = this.meeting.startDate;
    }
   }

  ngOnInit(): void {
 //  this.openFormMeeting()
   
  }
  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'TMMeetings'
      )
      .subscribe((res) => {
        if (res) {
          this.param = JSON.parse(res.dataValue);
          return callback && callback(true);
        }
      });
  }

  beforeSave(op){
    var data = [];
    if(this.action === 'add'){
      op.method = 'AddMeetingsAsync';
      data = [
        this.meeting,
        this.functionID,    
      ];
    }

    op.data = data;
  }

  onSave(){

  }

  valueChange(e){
    if(e.data){
      this.meeting[e.field] = e.data;
      
    }
  }

  valueTime(e){
    debugger
    this.meeting[e.field] = e.data?.fromDate;
    if(e.field=='startDate'){

       let hour = (e.data.fromdate as Date).getHours();
       let minutes = (e.data.fromdate as Date).getMinutes();
       this.meeting.startDate = new Date(this.selectedDate.setHours(hour,minutes,0,0));
       console.log(this.meeting.startDate);
       
    }
  }

  valueChangeTags(e){

  }
}
