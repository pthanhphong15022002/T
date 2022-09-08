import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  NotificationsService,
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

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID;
    this.vllUpdate = this.data.vll;
    this.valueDefault = "2" ;
  }
  ngOnInit(): void {}

  valueChange(data) {
    if (data?.data) {
      this.comment = data?.data ? data?.data : '';
    }
    this.changeDetectorRef.detectChanges;
  }

  valueSelected(data) {
    if (data.data) {
     ///
    }
  }

  saveData() {}
}
