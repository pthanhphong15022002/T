import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
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
    private df: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    // this.data = dialog.dataService!.dataSelected;
    this.dataBind = dt.data;
    this.dialog = dialog;
  }

  ngOnDestroy(): void {
    this.codxMwp.experienceEdit.next(null);
  }

  ngOnInit(): void {
    if (this.action === 'edit') {
      this.title = 'Cập nhật thông tin';
    }
    this.codxMwp.experienceChange.subscribe((data: any) => {
      if (data) {
        this.dataBind = {};
        this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'GetEmployeeExperiences', data.recID)
          .subscribe((o: any) => {
            if (!o) return;

            // if (o.fromDate)
            //   o.fromDate = parseDate(o.fromDate);

            // if (o.toDate)
            //   o.toDate = parseDate(o.toDate);

            if (!o.employeeID) {
              o.employeeID = data.employeeID;
            }
            this.dialog.openForm();
            this.dataBind = o;
            this.df.detectChanges();
          });

      }

    });
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
    this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeExperiencesAsync', [this.dataBind])
      .subscribe((res: any) => {
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
    this.dialog.close();
  }
}
