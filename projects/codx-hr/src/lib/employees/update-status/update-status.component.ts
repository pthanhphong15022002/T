import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { HR_Employees } from '../../model/HR_Employees.model';

@Component({
  selector: 'lib-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.css']
})
export class UpdateStatusComponent implements OnInit {
  data: any;
  dialog: any;
  employStatus: any = {};
  funcID: any;
  title: string = 'Cập nhật tình trạng';
  employee: HR_Employees = new HR_Employees();
  @Input() view: any;
  // moreFunc: any;

  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.employee = this.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID
    // this.moreFunc = this.data.moreFunc;
    // this.title = this.moreFunc.customName;
  }

  ngOnInit(): void {
  }

  // beforeSave(op: any) {
  //   var data = [];
  //   op.methodName = 'UpdateStatusAsync';

  //   data = [
  //     this.employee,
  //   ];
  //   op.data = data;
  //   return true;
  // }

  updateStatus() {
    this.api
      .execSv<any>("HR","ERM.Business.HR", "EmployeesBusiness", "UpdateStatusAsync", this.employee)
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.dialog.close(res)
          // this.notiService.notifyCode('TM009');
        } else {
          this.dialog.close()
          // this.notiService.notifyCode('TM008');
        }
      }
      );
    
    this.dialog.close();
    this.detectorRef.detectChanges();
  }

  valueChange(e) {
    this.employee.status = e.data;
  }
}
