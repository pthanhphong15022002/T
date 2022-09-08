import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  NotificationsService,
  UrlUtil,
} from 'codx-core';

@Component({
  selector: 'lib-popup-status-meeting',
  templateUrl: './popup-status-meeting.component.html',
  styleUrls: ['./popup-status-meeting.component.css'],
})
export class PopupStatusMeetingComponent implements OnInit {
  data: any;
  dialog: any;
  url: string;
  status: string;
  title: string = 'Xác nhận ';
  funcID: any;
  moreFunc: any;
  vllUpdate = 'CO004';
  fieldDefault = '';
  valueDefault = '1';
  fieldComment = '';
  defautComment = 'Bình luận';
  comment = '';
  meeting :any

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.meeting = this.data?.data
    this.dialog = dialog;
    this.funcID = this.data.funcID;
    this.vllUpdate = this.data.vll;
    this.moreFunc = this.data.moreFunc;
    this.title = this.moreFunc.customName;
 
    this.url = this.moreFunc.url;
    var fieldDefault = UrlUtil.getUrl('defaultField', this.url);
    this.fieldDefault =
      fieldDefault.charAt(0).toLocaleLowerCase() + fieldDefault.slice(1);
    this.valueDefault = UrlUtil.getUrl('defaultValue', this.url);
  }
  ngOnInit(): void {}

  valueChange(data) {
    if (data?.data) {
      this.comment = data?.data ? data?.data : '';
    }
    this.changeDetectorRef.detectChanges;
  }

  saveData() {
    ///xu ly save
    this.api
      .execSv<any>('CO', 'CO', 'MeetingsBusiness', 'SetStatusMeetingAsync', [
        this.funcID,
        this.meeting.meetingID,
        this.valueDefault,
        this.comment,
      ])
      .subscribe((res) => {
        if (res) {
          this.meeting.status = this.valueDefault ;
          this.dialog.close(this.meeting);
          this.notiService.notifyCode('SYS007')
        }  
        this.dialog.close();
      }); 
  }
}
