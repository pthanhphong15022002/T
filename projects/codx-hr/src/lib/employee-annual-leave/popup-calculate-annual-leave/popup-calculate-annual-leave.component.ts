import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, NotificationsService, DialogData, DialogRef, AuthStore } from 'codx-core';

@Component({
  selector: 'lib-popup-calculate-annual-leave',
  templateUrl: './popup-calculate-annual-leave.component.html',
  styleUrls: ['./popup-calculate-annual-leave.component.scss']
})
export class PopupCalculateAnnualLeaveComponent implements OnInit {
  data: any;
  dialogRef: any;
  funcID: any;
  headerText: string = "";
  employee: any;
  value: string = "";
  @Input() view: any;

  btnCancel: string = 'Hủy';
  btnCalculate: string = 'Tính';
  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private autStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dt?.data;
    this.headerText = this.data?.headerText;
    this.btnCalculate = this.data?.btnCalculate;
    this.btnCancel = this.data?.btnCancel;
    this.dialogRef = dialogRef;
    //this.funcID = this.data.funcID
  }

  ngOnInit() {
  }

  confirm() {
    this.dialogRef.close();
  }
  cancel() {
    this.dialogRef.close();
  }
}
