import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-send-gift',
  templateUrl: './popup-send-gift.component.html',
  styleUrls: ['./popup-send-gift.component.css']
})
export class PopupSendGiftComponent {
  title: string = 'Xác nhận ';
  fieldComment = 'ConfirmComment';
  fieldDefault = '';
  valueDefault = '';
  dialog: any;
  moreFunc: any;
  vllConfirm = 'L1428';
  comment = '';
  data: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
    this.dialog = dialog;
    this.data = dt?.data;
    this.moreFunc = this.data.moreFunc;
    this.fieldDefault = this.data.fieldDefault;
    this.valueDefault = this.data.valueDefault;
  }

  saveData(){
    this.dialog.close(this.comment);
  }

  valueChange(data) {
    if (data?.data) {
      this.comment = data.data;
    }
    this.changeDetectorRef.detectChanges;
  }
}
