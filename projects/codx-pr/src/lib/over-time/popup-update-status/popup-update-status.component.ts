import { Component, Injector, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, RequestOption } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-popup-update-status',
  templateUrl: './popup-update-status.component.html',
  styleUrls: ['./popup-update-status.component.css']
})
export class PopupUpdateStatusComponent {
  comment: string = '';
  data: any;
  dialog: any;
  task: any;
  statusDisplay = '';
  timeStart: any;
  completed: any;
  approvedOn: any;
  moreFunc: any;
  maxHoursControl: any;
  maxHours: any;
  updateControl: any;
  url: string;
  status: string;
  statusName:string;
  title: string;
  funcID: any;
  crrCompleted: any;
  private destroy$ = new Subject<void>();

  /**
   *
   */
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID;
    this.status = this.data.status;
    this.statusName = this.data.statusName;
    this.title = this.data.title;


  }
  changeEstimated(data) {}
  changeComment(data) {
    this.comment = data?.data;
  }
  changeTime(data) {}
  beforeSave(option: RequestOption) {
    option.methodName = 'UpdateStatusAsync';
    option.className = 'TimeKeepingRequest';
    option.assemblyName = 'PR';
    option.service = 'PR';
    option.data = this.data;
    return true;
  }

  onSaveForm() {
    this.dialog.dataService
        .save((opt: RequestOption) => this.beforeSave(opt), 0, null, null, true)
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (res) => {
          this.dialog && this.dialog.close(res.save);
        });
  }
  saveData() {
    this.api.execSv<any>(
      'PR',
      'PR',
      'TimeKeepingRequest',
      'UpdateStatusAsync',
      [this.data.recID,this.status]
    ).pipe(takeUntil(this.destroy$))
    .subscribe(async (res) => {
      this.dialog && this.dialog.close(res.save);
    });
  }
}
