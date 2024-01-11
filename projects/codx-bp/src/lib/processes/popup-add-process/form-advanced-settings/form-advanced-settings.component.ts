import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';
import { DynamicSettingControlComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component';

@Component({
  selector: 'lib-form-advanced-settings',
  templateUrl: './form-advanced-settings.component.html',
  styleUrls: ['./form-advanced-settings.component.scss'],
})
export class FormAdvancedSettingsComponent implements OnInit {
  @ViewChild('settingControl') settingControl: DynamicSettingControlComponent;

  dialog: DialogRef;
  title = 'Thiết lập nâng cao';
  settings = [];
  isLoad = false;
  constructor(
    private api: ApiHttpService,
    @Optional() dg: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dg;
  }
  ngOnInit(): void {
    this.api
      .execSv('BG', 'BG', 'ScheduleTasksBusiness', 'GetScheduleTasksAsync', [
        'ACP101',
      ])
      .subscribe((res: any) => {
        if (res) {
          this.settings = res;
        } else {
          this.settings = [];
        }
        this.isLoad = true;
        this.settingControl.setting = this.settings;
        // this.settingControl.dialog = null;
      });
  }

  valuechange(e) {}
}
