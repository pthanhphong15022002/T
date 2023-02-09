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
        "EmployeesBusiness",
        "UpdateStatusAsync", 
        [this.employee.employeeID, this.value])
        .subscribe((res) => {
          if (res) 
          {
            this.employee.status = this.value;
            this.dialogRef.close(this.employee)
          } 
          else 
          {
            this.dialogRef.close()
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
