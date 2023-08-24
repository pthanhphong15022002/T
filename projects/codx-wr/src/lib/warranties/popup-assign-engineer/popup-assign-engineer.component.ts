import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-assign-engineer',
  templateUrl: './popup-assign-engineer.component.html',
  styleUrls: ['./popup-assign-engineer.component.css'],
})
export class PopupAssignEngineerComponent implements OnInit {
  dialog: any;
  engineerID = '';
  comment = '';
  title = '';
  data: any;
  constructor(
    private api: ApiHttpService,
    private changeDetectoref: ChangeDetectorRef,
    private notiService: NotificationsService,
    @Optional() dt: DialogData,
    @Optional() dialog: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.title = dt?.data?.title;
  }
  ngOnInit(): void {
    this.engineerID = this.data?.engineerID;
    this.comment = this.data?.comment;
  }

  //#region
  onSave() {
    this.api
      .execSv<any>(
        'WR',
        'ERM.Business.WR',
        'WorkOrdersBusiness',
        'UpdateAssignEngineerAsync',
        [this.data?.recID, this.engineerID, this.comment]
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close([this.engineerID, this.comment]);
          this.notiService.notifyCode('SYS007');
        }else{
          this.notiService.notifyCode('SYS021');

        }
      });
  }
  //#endregion

  valueChange(e) {
    this[e?.field] = e?.data;
    this.changeDetectoref.detectChanges();
  }
}
