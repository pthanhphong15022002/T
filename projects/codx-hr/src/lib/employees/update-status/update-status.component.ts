import { I } from '@angular/cdk/keycodes';
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
  employee: any;
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

  updateStatus() {
    this.api
      .execSv<any>("HR", "ERM.Business.HR", "EmployeesBusiness", "UpdateStatusAsync", this.employee)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(this.employee)
        } else {
          this.dialog.close()
        }
      }
      );
  }

  valueChange(e) {
    if (e) {
      var arrData = e.component?.dataSource;
      this.employee.status = e.data;
      arrData.forEach(obj => {
        if (obj.value == e.data) {
          this.employee.statusName = obj.text;
          this.employee.statusColor = obj.color;
        }
      })
    }
  }

}
