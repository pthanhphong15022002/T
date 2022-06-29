import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NotificationsService } from 'codx-core';
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
  // dataBind: any = {};
  position: HR_Positions = new HR_Positions();
  constructor(
    private dt: ChangeDetectorRef,
    private notiService: NotificationsService,
  ) { }

  ngOnInit(): void {
  }

  valueChange(e) {
    switch (e.field) {
      case "orgUnitID":
        var value = e.data?.OrgUnitID;
        this.position[e.field] = value;
        this.position["departmentID"] = e.data?.OrgUnitType;
        this.dt.detectChanges();
        break;
      case "departmentID":
        value = e.data?.DepartmentID;
        break;
      case "divisionID":
        value = e.data?.DivisionID;
        break;
      case "companyID":
        value = e.data?.CompanyID;
        break;
      case "reportTo":
        value = e.data?.ReportTo;
        break;
      case "reportTo2":
        value = e.data?.eportTo2;
        break;
      case "jobID":
        value = e.data?.JobID;
        break;
      case "jobGroup":
        value = e.data?.JobGroup;
        break;

    }
    this.position[e.field] = value;
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

  addPosition() {
    var t = this;
    this.dialog.dataService.save((opt:any)=>{
      opt.data = [this.position];
      return true;
    })
    .subscribe((res) => {
      if (res.save) {
        this.dialog.close();
        this.notiService.notify('Thêm mới thành công');
      }
    });
  }

  closePanel() {
    this.dialog.close()
  }
}
