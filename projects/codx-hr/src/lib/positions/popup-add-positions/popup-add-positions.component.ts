import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { HR_Positions } from '../../model/HR_Positions.module';

@Component({
  selector: 'lib-popup-add-positions',
  templateUrl: './popup-add-positions.component.html',
  styleUrls: ['./popup-add-positions.component.css']
})
export class PopupAddPositionsComponent implements OnInit {
  title = 'Thêm mới';
  dialog: any;
  isNew: false;
  user: any;
  functionID: string;
  action = '';
  position: HR_Positions = new HR_Positions();
  data: any;

  constructor(
    private df: ChangeDetectorRef,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData,
  ) {
    this.action = dt.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
    this.data = dialog.dataService!.dataSelected;
    this.position = this.data;
  }

  ngOnInit(): void {

    if (this.action === 'edit') {
      this.title = 'Chỉnh sửa';
    }
    if (this.action === 'copy') {
      this.title = 'Sao chép';
    }
  }

  // valueChange(e) {
  //   switch (e.field) {
  //     case "orgUnitID":
  //       var value = e.data?.OrgUnitID;
  //       this.position[e.field] = value;
  //       this.position["departmentID"] = e.data?.OrgUnitType;
  //       this.df.detectChanges();
  //       break;
  //     case "departmentID":
  //       value = e.data?.DepartmentID;
  //       break;
  //     case "divisionID":
  //       value = e.data?.DivisionID;
  //       break;
  //     case "companyID":
  //       value = e.data?.CompanyID;
  //       break;
  //     case "reportTo":
  //       value = e.data?.ReportTo;
  //       break;
  //     case "reportTo2":
  //       value = e.data?.eportTo2;
  //       break;
  //     case "jobID":
  //       value = e.data?.JobID;
  //       break;
  //     case "jobGroup":
  //       value = e.data?.JobGroup;
  //       break;

  //   }
  //   this.position[e.field] = value;
  // }

  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.position[field] = e?.data;
      } else {
        this.position[field] = e[0];
      }
    }
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateAsync';
    data = [
      this.position,
      this.isNew
    ];
    op.data = data;
    return true;
  }

  OnSaveForm() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.dialog.close();
        }
      });
  }

  addPosition() {
    var t = this;
    this.dialog.dataService.save((opt: any) => {
      opt.data = [this.position];
      return true;
    })
      .subscribe((res) => {
        if (res.save) {
          this.dialog.close();
        }
      });
  }

  closePanel() {
    this.dialog.close()
  }
}
