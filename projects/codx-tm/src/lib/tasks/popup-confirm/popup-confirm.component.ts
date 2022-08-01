import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService, UrlUtil } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'lib-popup-confirm',
  templateUrl: './popup-confirm.component.html',
  styleUrls: ['./popup-confirm.component.css']
})
export class PopupConfirmComponent implements OnInit, AfterViewInit {

  data: any;
  dialog: any;
  task: any;
  url: string;
  status: string;
  title: string = 'Xác nhận ';
  funcID: any
  moreFunc: any
  vllConfirm = 'TM009'
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    this.task = this.data.data;
    this.moreFunc = this.data.moreFunc;
    this.url = this.moreFunc.url;
    this.status = UrlUtil.getUrl('defaultValue', this.url);
  }

  valueChange(data) {

  }

  valueSelected(data) {

  }

  saveData() {
    if (this.task.confirmStatus == "3" && (this.task.confirmComment || this.task.confirmComment.trim() == "")) {
      this.notiService.notifyCode("TM019");

      return;
    }
    ///xu ly save
  }

}
