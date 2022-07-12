import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { BehaviorSubject } from 'rxjs';
import { CodxAdService } from '../../codx-ad.service';
import { AD_CompanySettings } from '../../models/AD_CompanySettings.models';
import { CompanySettingComponent } from '../company-setting.component';

@Component({
  selector: 'lib-popup-personal',
  templateUrl: './popup-personal.component.html',
  styleUrls: ['./popup-personal.component.css'],
  providers:[CompanySettingComponent ],
})
export class PopupPersonalComponent implements OnInit {
  data: any;
  dialog: any;
  items: AD_CompanySettings;
  title: string = 'Người đại diện';
  dataUpdate = new BehaviorSubject<any>(null);
  isUpdate = this.dataUpdate.asObservable();
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private adService: CodxAdService,

    private loadData: CompanySettingComponent,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.items = this.data;
  }
  saveData() { }
  onEdit() {
    this.UpdateData();
  }

  UpdateData() {
    console.log(this.items);
    this.adService
      .updatePersonalCompanySettings(this.items)
      .subscribe((response) => {
        if (response[1]) {
          this.notiService.notifyCode('thêm thành công');

          // this.dialog.dataService.setDataSelected(response[0]);
          this.dialog.dataService.next(response[0]);

        } else {
          this.notiService.notifyCode('thêm thất bại');
        }
      });
    this.dialog.close();

  }

  txtValueContactName(e: any) {
    this.items.contactName = e.data;
  }


  txtValueJobTitle(e: any) {
    this.items.jobTitle = e.data;
  }

  txtValueEmail(e: any) {
    this.items.personalEmail = e.data;
  }

  txtValuePhone(e: any) {
    this.items.mobile = e.data;
  }

  @ViewChild(CompanySettingComponent)
  public childCmp: CompanySettingComponent;
}
