import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { DialogModel, FormModel } from 'codx-core';
import { FormSettingComboboxComponent } from '../../../processes/popup-add-process/form-properties-fields/setting-fields/form-setting-combobox/form-setting-combobox.component';

@Component({
  selector: 'lib-property-combobox',
  templateUrl: './property-combobox.component.html',
  styleUrls: ['./property-combobox.component.css'],
})
export class PropertyComboboxComponent
  extends BasePropertyComponent
  implements OnChanges
{
  dropdown = false;
  popup = false;
  listCbx: any;
  nameCbb: any;
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) {
      if (this.data?.refValue) this.getCombobox();
      if (this.data.refType == '3') this.dropdown = true;
      else this.popup = true;
    }
  }

  getCombobox() {
    this.cache.combobox(this.data.refValue).subscribe((item) => {
      if (item) {
        this.listCbx = item.entityAttributes.split(';');
        this.listCbx = this.listCbx.filter((x) => x != '');
        this.nameCbb = item?.note || item?.comboboxName;
      }
    });
  }

  openSettingCbx(comboboxType: string = '3') {
    let option = new DialogModel();
    option.zIndex = 1200;
    option.FormModel = {
      formName: 'DPStepsFields',
      gridViewName: 'grvDPStepsFields',
      entityName: 'BP_Processes_Steps_ExtendInfo',
    };
    let data = {
      data: this.data,
      title: this.data.text,
      comboboxType: comboboxType,
    };
    let popupDialog = this.callFuc.openForm(
      FormSettingComboboxComponent,
      '',
      900,
      700,
      '',
      data,
      '',
      option
    );
    popupDialog.closed.subscribe((dg) => {
      if (dg && dg?.event) {
        this.data = dg?.event;
        if (dg?.event?.refValue) {
          this.getCombobox();
        }
        //this.listCbx = JSON.parse(this.data.dataFormat);
        this.dataChange.emit(this.data);
      }
    });
  }
}
