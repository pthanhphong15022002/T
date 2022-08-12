import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { HR_Employees } from 'projects/codx-hr/src/lib/model/HR_Employees.model';
import { CodxMwpService } from '../../codx-mwp.service';

@Component({
  selector: 'lib-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.css']
})
export class EditInfoComponent implements OnInit {
  title = '';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabInfoPersonal'
    },
    {
      icon: 'icon-person',
      text: 'Nhân viên',
      name: 'tabInfoEmploy'
    },
    {
      icon: 'icon-receipt_long',
      text: 'Thông tin cá nhân',
      name: 'tabInfoPrivate',
    },
    {
      icon: 'icon-business_center',
      text: 'Pháp lý',
      name: 'tabInfoLaw',
    },
  ];
  titleAction = 'Sửa';
  currentSection = "InfoPersonal";
  dialog: any;
  data: any;
  isAfterRender = false;
  gridViewSetup: any;
  employee: HR_Employees = new HR_Employees();
  isDisable = false;

  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private codxMwp: CodxMwpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.data = dialog.dataService!.dataSelected;
    this.employee = this.data;
    this.dialog = dialog;

  }

  ngOnInit(): void {

  }

  changeTime(data) {
    if (!data.field || !data.data) return;
    this.employee[data.field] = data.data?.fromDate;
  }

  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e;
    this.detectorRef.detectChanges();
    console.log(e);
  }

  buttonClick(e: any) {
    console.log(e);
  }

  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.employee[field] = e?.data;
      } else {
        this.employee[field] = e[0];
      }
    }
  }

  beforeSave(op: any) {
    var data = [];
    op.methodName = 'UpdateAsync';
    op.className = 'EmployeesBusiness';
    data = [
      this.employee,
    ];
    op.data = data;
    return true;
  }

  OnSaveForm() {
    // this.dialog.dataService
    //   .save((option: any) => this.beforeSave(option))
    //   .subscribe();
    // this.detectorRef.detectChanges();
    // this.dialog.close();

    this.api.call("ERM.Business.HR", "EmployeesBusiness", "UpdateAsync", [this.employee]).subscribe(res => {
      if (res && res.msgBodyData[0]) {
        if (res) {
          this.codxMwp.EmployeeInfomation.loadEmployee(res.msgBodyData[0]);
          this.dialog.close();
        }
        else {
          this.notiService.notify("Error");
        }
      }
    });
  }

  scrollTo(session) {
    this.currentSection = session;
  }
}
