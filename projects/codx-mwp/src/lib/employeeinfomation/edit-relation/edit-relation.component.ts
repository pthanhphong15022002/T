import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-edit-relation',
  templateUrl: './edit-relation.component.html',
  styleUrls: ['./edit-relation.component.css']
})
export class EditRelationComponent implements OnInit {
  title = "Cập nhật thông tin";
  dataBind: any = {};
  dialog: any;
  data: any;

  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) { 
    this.data = dialog.dataService!.dataSelected;
    this.dataBind = this.data;
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
    op.method = 'UpdateEmployeeRelationAsync';
    data = [
      this.dataBind,
   
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
}
