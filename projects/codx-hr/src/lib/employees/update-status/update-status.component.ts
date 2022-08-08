import { Component, Input, OnInit, Optional } from '@angular/core';
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

  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.employee = this.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID
  }

  ngOnInit(): void {
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateStatusAsync';
    op.methodName = 'UpdateStatusAsync';

    data = [
      this.employee,
    ];
    op.data = data;
    return true;
  }

  updateStatus() {
    this.api
      .execSv<any>("HR","ERM.Business.HR", "EmployeesBusiness", "UpdateStatusAsync", this.employee)
      .subscribe(
      );
    // if (this.employStatus.status == "90") {
    //   this.view.removeHandler(this.employStatus, "employeeID");
    // } else {
    //   this.view.addHandler(this.employStatus, false, "employeeID");
    // }
    this.dialog.close();
  }

  valueChange(e) {
    this.employee.status = e.data;
  }
}
