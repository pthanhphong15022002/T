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
  settingFull = {};
  newSetting = [];
  paravalues: any;
  data: any;
  constructor(
    private api: ApiHttpService,
    @Optional() dg: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dg;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    if (this.data.settings && this.data.settings.length) {
      this.newSetting = JSON.parse(JSON.stringify(this.data.settings));
      const paravalues: { [key: string]: any } = {};

      this.newSetting.forEach((item: any) => {
        const key = Object.keys(item)[0];
        paravalues[item.fieldName] = item.fieldValue;
      });
      this.paravalues = JSON.stringify(paravalues);
      this.settingFull = {
        paras: this.data.settings,
        paraValues: this.paravalues,
      };
    }
  }
  ngOnInit(): void {}

  valuechange(e) {
    this.newSetting.forEach((item) => {
      if (item.fieldName === e?.field) {
        item.fieldValue = e?.data;
      }
    });
    console.log(e);
  }

  onSave() {
    this.data.settings = JSON.parse(JSON.stringify(this.newSetting));
    this.dialog.close(this.data);
  }
}
