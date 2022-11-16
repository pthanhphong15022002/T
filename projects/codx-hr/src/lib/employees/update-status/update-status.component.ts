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
  statusSelected:string = "";
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
    this.dialogRef = dialogRef;
    this.funcID = this.data.funcID
  }

  ngOnInit(): void {
  }

  updateStatus() 
  {
    if(this.statusSelected)
    {
      this.api
      .execSv<any>("HR", "ERM.Business.HR", "EmployeesBusiness", "UpdateStatusAsync", [this.employee.employeeID, this.statusSelected])
      .subscribe((res) => {
        if (res) 
        {
          this.employee.status = this.statusSelected;
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
    if (e) {
      var arrData = e.component?.dataSource;
      // this.employee.status = e.data;
      this.statusSelected = e.data;
      // arrData.forEach(obj => {
      //   if (obj.value == e.data) {
      //     this.employee.statusName = obj.text;
      //     this.employee.statusColor = obj.color;
      //   }
      // })
    }
  }

}
