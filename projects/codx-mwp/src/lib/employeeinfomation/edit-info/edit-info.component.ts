import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { HR_Employees } from 'projects/codx-hr/src/lib/model/HR_Employees.model';

@Component({
  selector: 'lib-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.css']
})
export class EditInfoComponent implements OnInit {
  title = 'Chỉnh sửa';
  currentSection = "InfoPersonal";
  dialog: any;
  data: any;
  isAfterRender = false;
  gridViewSetup: any;
  employee: HR_Employees = new HR_Employees();
  dataBind: any = {};
  isDisable = false;
  isNew: false;
  
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) { 
    this.data = dialog.dataService!.dataSelected;
    this.employee = this.data;
    this.dialog = dialog;

  }

  ngOnInit(): void {
   
  }

  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.dataBind[field] = e?.data;
      } else {
        this.dataBind[field] = e[0];
      }
    }
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateAsync';
    data = [
      this.employee,
      this.isNew
    ];
    op.data = data;
    return true;
  }

  OnSaveForm(){
    this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res.save) {
        this.dialog.close();
        this.notiService.notify('Thêm thành công'); 
      }
    });
  }

  scrollTo(session) {
    this.currentSection = session;
  }
}
