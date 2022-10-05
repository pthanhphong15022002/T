import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { HR_Positions } from '../../model/HR_Positions.module';

@Component({
  selector: 'lib-popup-add-positions',
  templateUrl: './popup-add-positions.component.html',
  styleUrls: ['./popup-add-positions.component.css']
})
export class PopupAddPositionsComponent implements OnInit {
  title = 'Thêm mới';
  dialog: any;
  isNew: boolean = true;
  user: any;
  functionID: string;
  action = '';
  position: HR_Positions = new HR_Positions();
  data: any;
  @Output() Savechange = new EventEmitter();

  constructor(
    private detectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private api: ApiHttpService,
    private reportingLine: CodxHrService,
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
      this.isNew = false;
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
    op.methodName = 'UpdateAsync';
    op.className = 'PositionsBusiness';
    if (this.action === 'add') {
      this.isNew = true;
    } else if (this.action === 'edit') {
      this.isNew = false;
    }
    data = [
      this.position,
      this.isNew
    ];
    op.data = data;
    return true;
  }

  OnSaveForm() {
    //   this.dialog.dataService
    //   .save((option: any) => this.beforeSave(option))
    //   .subscribe((res) => {
    //     this.dialog.close(res)
    //   });
    // this.detectorRef.detectChanges();

    this.api.exec("ERM.Business.HR", "PositionsBusiness", "UpdateAsync", [this.data, this.isNew]).subscribe(res => {
      if (res) {
        if (res) {
          if (this.isNew) {
            this.reportingLine.reportingLineComponent.addPosition(res);
          }
          else {
            this.reportingLine.positionsComponent.updatePosition(res);
          }
          // if (continune) {
          //   if (this.isNew) {
          //     this.dataBind = {};
          //     this.api.exec('ERM.Business.HR', 'PositionsBusiness', 'GetAsync', "")
          //       .subscribe((o: any) => {
          //         if (!o) return;

          //         this.dataBind = o;
          //         this.detectorRef.detectChanges();
          //       });
          //   }
          //   return;
          // }
          this.Savechange.emit(res);
          this.dialog.close(res);
        }
        else {
          this.notiService.notify("Error");
        }
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
