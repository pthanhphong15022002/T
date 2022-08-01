import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxMwpService } from '../../codx-mwp.service';

@Component({
  selector: 'lib-edit-experence',
  templateUrl: './edit-experence.component.html',
  styleUrls: ['./edit-experence.component.css']
})
export class EditExperenceComponent implements OnInit {
  title = "Thêm mới";
  dataBind: any = {};
  dialog: any;
  data: any;
  action = '';
  isSaving: boolean = false;

  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    private codxMwp: CodxMwpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    // this.data = dialog.dataService!.dataSelected;
    this.dataBind = dt.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    if (this.action === 'edit') {
      this.title = 'Cập nhật thông tin';
    }
    // if(this.action==='copy'){
    //   this.title = 'Sao chép';
    // }
  }

  changeTime(data) {
    if (!data.field || !data.data) return;
    this.dataBind[data.field] = data.data?.fromDate;
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

  // beforeSave(op: any) {
  //   var data = [];
  //   op.method = 'UpdateEmployeeExperiencesAsync';
  //   op.service = 'HR';
  //   data = [
  //     this.dataBind,

  //   ];
  //   op.data = data;
  //   return true;
  // }

  OnSaveForm() {
    // this.dialog.dataService
    // .save((option: any) => this.beforeSave(option))
    // .subscribe((res) => {
    //   if (res.save) {
    //     this.dialog.close();
    //     this.notiService.notifyCode('MWP00201');
    //   }
    // });
    this.isSaving = true;
    this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeExperiencesAsync', [this.dataBind])
      .subscribe((res: any) => {
        this.isSaving = false;
        // console.log(res);
        if (res) {
          res.WorkedCompany[0].fromDate = this.dataBind.fromDate.getFullYear();
          res.WorkedCompany[0].toDate = this.dataBind.toDate.getFullYear();

          this.codxMwp.EmployeeInfomation.updateExperiences({ Experences: res });
          this.dialog.close(this.dataBind);
        }
        else {
          this.notiService.notifyCode("SYS021");
        }
      });
    this.dialog.close(this.dataBind);
  }
}
