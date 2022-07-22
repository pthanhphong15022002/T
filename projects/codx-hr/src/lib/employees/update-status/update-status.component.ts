import { Component, OnInit, Optional } from '@angular/core';
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
  
  constructor(
    private api: ApiHttpService,
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

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateStatusAsync';
    data = [
      this.employee,
    ];
    op.data = data;
    return true;
  }

  updateStatus() {

    this.api
      .call("ERM.Business.HR", "EmployeesBusiness", "UpdateStatusAsync", {
        employeeID: this.employStatus.employeeID,
        status: this.employStatus.status,
      })
      .subscribe((res) => { });
    // if (this.employStatus.status == "90") {
    //   this.form.removeHandler(this.employStatus, "employeeID");
    // } else {
    //   this.view.addHandler(this.employStatus, false, "employeeID");
    // }
    this.dialog.close();
  }

}
