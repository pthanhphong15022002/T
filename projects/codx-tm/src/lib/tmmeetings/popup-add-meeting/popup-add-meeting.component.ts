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
    this.functionID = this.dialog.formModel.funcID;
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
        'CO_Meetings'
      )
      .subscribe((res) => {
        if (res) {
          this.param = JSON.parse(res.dataValue);
          return callback && callback(true);
        }
      });
  }

  valueChangeTags(e){

  }
}
