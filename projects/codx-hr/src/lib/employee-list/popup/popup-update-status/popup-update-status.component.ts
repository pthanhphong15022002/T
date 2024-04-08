import { ChangeDetectorRef, Component, Input, Optional } from '@angular/core';
import { ApiHttpService, NotificationsService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-update-status',
  templateUrl: './popup-update-status.component.html',
  styleUrls: ['./popup-update-status.component.css']
})
export class PopupUpdateStatusComponent {
  data: any;
  dialogRef: any;
  employStatus: any = {};
  funcID: any;
  title: string = 'Cập nhật tình trạng';
  headerText:string = "";
  employee: any;
  value:string = "";
  @Input() view: any;

  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dt?.data;
    this.employee = this.data;
    this.value = this.employee.status;
    this.dialogRef = dialogRef;
    this.funcID = this.data.funcID
  }

  ngOnInit(): void {
  }

  updateStatus() {
    if(this.value)
    {
      this.api
      .execSv(
        "HR", 
        "ERM.Business.HR",
        "EmployeesBusiness_Old",
        "UpdateStatusAsync", 
        [this.employee.employeeID, this.value])
        .subscribe((res:boolean) => {
          if (res) 
          {
            this.employee.status = this.value;
            this.dialogRef.close(this.employee);
            this.notiService.notifyCode("SYS007");
          } 
          else 
          {
            this.dialogRef.close();
            this.notiService.notifyCode("SYS021");
          }
      });
    }
    
  }

  valueChange(e) {
    if (e && e.data !== this.value) {
      this.value = e.data;
    }
  }

}
