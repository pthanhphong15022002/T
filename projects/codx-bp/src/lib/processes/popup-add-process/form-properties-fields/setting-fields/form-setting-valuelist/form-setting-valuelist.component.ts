import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  Util,
} from 'codx-core';

@Component({
  selector: 'lib-form-setting-valuelist',
  templateUrl: './form-setting-valuelist.component.html',
  styleUrls: ['./form-setting-valuelist.component.css'],
})
export class FormSettingValueListComponent {
  dialog!: DialogRef;
  data: any;
  VLLType = [
    { value: 1, text: 1 },
    { value: 2, text: 2 },
    { value: 9, text: 9 },
  ]; //1: icon, 2 icon + text, 9: icon cho cbb 5
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
  }

  changeType(evt: any) {
    this.data.listType = evt.value;
  }

  valueChange(evt: any) {
    var value = evt.data;
    var field = evt.field;
    field = Util.camelize(field);
    this.data[field] = value;
    if (field == 'defaultValues') this.data.customValues = value;
  }

  onSave() {
    this.dialog.close(this.data);
  }
}
