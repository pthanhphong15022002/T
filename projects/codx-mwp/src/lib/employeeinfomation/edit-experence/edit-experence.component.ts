import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxMwpService } from '../../codx-mwp.service';

@Component({
  selector: 'lib-edit-experence',
  templateUrl: './edit-experence.component.html',
  styleUrls: ['./edit-experence.component.css']
})
export class EditExperenceComponent implements OnInit {
  title = "";
  dataBind: any = {};
  dialog: any;
  data: any;
  action = '';
  isSaving: boolean = false;
  isAdd = true;

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
    if (dt && dt.data) {
      this.dataBind = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
      this.isAdd = dt.data.isAdd;
    }

    this.dialog = dialog;
  }

  ngOnDestroy(): void {
    this.codxMwp.experienceEdit.next(null);
  }

  ngOnInit(): void {
    if (this.isAdd === false) {
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

  OnSaveForm() {
    this.api.exec('ERM.Business.HR', 'EmployeesBusiness', 'UpdateEmployeeExperiencesAsync', [this.dataBind, this.isAdd])
      .subscribe((res: any) => {
        if (res) {
          if (res.WorkedCompany.fromDate == null && res.WorkedCompany.toDate == null) {
            this.dialog.close(res);
          } else {
          res.WorkedCompany.fromDate = this.dataBind.fromDate.getFullYear();
          res.WorkedCompany.toDate = this.dataBind.toDate.getFullYear();
          // this.codxMwp.EmployeeInfomation.updateExperiences({ Experences: res });          
          this.dialog.close(res);
          }
        }
        else {
          this.notiService.notifyCode("SYS021");
          this.dialog.close();
        }
      });
      // this.dialog.close();
  }
}
