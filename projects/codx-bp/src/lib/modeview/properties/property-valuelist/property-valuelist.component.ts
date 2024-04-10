import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { firstValueFrom } from 'rxjs';
import { DialogModel } from 'codx-core';
import { FormSettingValueListComponent } from '../../../processes/popup-add-process/form-properties-fields/setting-fields/form-setting-valuelist/form-setting-valuelist.component';

@Component({
  selector: 'lib-property-valuelist',
  templateUrl: './property-valuelist.component.html',
  styleUrls: ['./property-valuelist.component.css'],
})
export class PropertyValueListComponent
  extends BasePropertyComponent
  implements OnChanges
{
  dropdown = true;
  checkbox = false;
  lstVll = [];
  vll: any = {};
  crr = {
    iconSet: [],
    text: [],
    colorSet: [],
    textColorSet: [],
  };
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) {
      if (this.data.refType == '2C') this.checkbox = true;
      else this.dropdown = true;
      this.lstVll = [];
      this.crr = {
        iconSet: [],
        text: [],
        colorSet: [],
        textColorSet: [],
      };
      this.getVll();
    }
  }

  getVll() {
    if (this.data?.refValue) {
      this.api
        .execSv(
          'SYS',
          'SYS',
          'ValueListBusiness',
          'GetAsync',
          this.data?.refValue
        )
        .subscribe((item) => {
          if (item) {
            this.vll = item;
            this.crr.iconSet = this.vll.iconSet
              ? this.vll.iconSet.split(';')
              : [];
            this.crr.colorSet = this.vll.colorSet
              ? this.vll.colorSet.split(';')
              : [];
            this.crr.textColorSet = this.vll.textColorSet
              ? this.vll.textColorSet.split(';')
              : [];
            this.crr.text = this.vll.customValues
              ? this.vll.customValues.split(';')
              : [];

            this.formatVll();
            this.default();
          }
        });
    } else {
      this.createVll();
      this.default();
    }
  }

  formatVll() {
    let arr = [];
    arr.push(
      this.crr.iconSet,
      this.crr.colorSet,
      this.crr.textColorSet,
      this.crr.text
    );
    let max = Math.max(...arr.map((i) => i.length));
    for (var i = 0; i < max; i++) {
      var obj = {
        iconSet: this.crr.iconSet[i],
        customValues: this.crr.text[i],
        colorSet: this.crr.colorSet[i],
        textColorSet: this.crr.textColorSet[i],
      };
      this.lstVll.push(obj);
    }
  }

  async createVll() {
    var processNo = await firstValueFrom(
      this.bpService.genAutoNumber('BPT01', 'BP_Processes', 'ProcessNo')
    );
    this.vll.listName = 'BPF' + processNo + '-' + this.lstVll.length;
    this.vll.language = this.user.language;
    this.vll.createdBy = this.user.userID;
    this.vll.listType = '1';
    this.vll.version = 'x00.01';
    this.vll.customValues = '';
    this.vll.defaultValues = '';
    this.vll.colorSet = '';
    this.vll.iconSet = '';
    this.vll.textColorSet = '';
    this.api
      .execSv(
        'SYS',
        'SYS',
        'ValueListBusiness',
        'AddValuelistCustomsAsync',
        this.vll
      )
      .subscribe((item) => {
        if (item) {
          this.data.refValue = this.vll.listName;
          this.dataChange.emit(this.data);
        }
      });
  }
  default() {
    var obj = {
      iconSet: null,
      customValues: '',
      colorSet: '',
      textColorSet: '',
    };
    this.lstVll.push(obj);
  }

  valueChangeVll(e: any, index: any) {
    this.lstVll[index][e.field] = e?.data;
    this.crr[e.field][index] = e?.data;
    if (this.vll && this.vll?.listName && this.crr.text[index]) {
      this.vll.iconSet = this.crr.iconSet
        .slice(0, this.lstVll.length - 1)
        .join(';');
      this.vll.colorSet = this.crr.colorSet
        .slice(0, this.lstVll.length - 1)
        .join(';');
      this.vll.textColorSet = this.crr.textColorSet
        .slice(0, this.lstVll.length - 1)
        .join(';');
      this.setTimeoutSaveDataAnswer(this.vll);
    }
  }

  valueChangeVllInput(e: any) {
    this.vll[e?.field] = e?.data;
    var data = JSON.parse(JSON.stringify(this.vll));
    this.setTimeoutSaveDataAnswer(data);
  }

  valueChangeText(e: any, index: any) {
    this.crr.text[index] = this.lstVll[index].customValues = e?.target?.value;
    this.vll.customValues = this.vll.defaultValues = this.crr.text.join(';');
    this.vll.iconSet = this.crr.iconSet.join(';');
    this.vll.colorSet = this.crr.colorSet.join(';');
    this.vll.textColorSet = this.crr.textColorSet.join(';');
    var data = JSON.parse(JSON.stringify(this.vll));
    this.setTimeoutSaveDataAnswer(data);
    if (
      !this.lstVll[index + 1] ||
      (this.lstVll[index + 1] && this.lstVll[index + 1].customValues)
    )
      this.default();
  }

  saveDataTimeout = new Map();
  setTimeoutSaveDataAnswer(data: any) {
    clearTimeout(this.saveDataTimeout?.get(data.listName));
    this.saveDataTimeout?.delete(this.saveDataTimeout?.get(data.listName));
    this.saveDataTimeout.set(
      data.listName,
      setTimeout(this.onSave.bind(this, data), 2000)
    );
  }

  onSave(data: any) {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'ValueListBusiness',
        'EditValuelistCustomsAsync',
        data
      )
      .subscribe();
  }

  deleteValues(index: any) {
    this.lstVll.splice(index, 1);
    this.crr.text.splice(index, 1);
    this.crr.iconSet.splice(index, 1);
    this.crr.colorSet.splice(index, 1);
    this.crr.textColorSet.splice(index, 1);
    this.crr.text.splice(index, 1);
    this.vll.customValues = this.vll.defaultValues = this.crr.text.join(';');
    this.vll.iconSet = this.crr.iconSet.join(';');
    this.vll.colorSet = this.crr.colorSet.join(';');
    this.vll.textColorSet = this.crr.textColorSet.join(';');
    var data = JSON.parse(JSON.stringify(this.vll));
    this.setTimeoutSaveDataAnswer(data);
  }

  openSettingVLL() {
    let option = new DialogModel();
    option.zIndex = 1200;
    option.FormModel = {
      formName: 'DPStepsFields',
      gridViewName: 'grvDPStepsFields',
      entityName: 'BP_Processes_Steps_ExtendInfo',
    };
    let data = {
      data: this.vll,
    };
    let popupDialog = this.callFuc.openForm(
      FormSettingValueListComponent,
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
        let valueList = dg?.event;
        let indexIncrement = 0;
        if (valueList.listType == '1') indexIncrement = 1;
        else if (valueList.listType == '2' || valueList.listType == '9')
          indexIncrement = 2;
        let data = valueList.customValues.split(';');
        let dataDf = valueList.defaultValues.split(';');
        let icons = valueList.iconSet?.split(';');
        let colors = valueList.colorSet?.split(';');
        let textColors = valueList.textColorSet?.split(';');
        for (var i = 0; i < data.length; i += indexIncrement) {
          var idxT = i + (indexIncrement - 1);
          if (idxT >= data.length) continue;
          var text = data[idxT];
          var val = data[i];
          var dfText = null;
          if (dataDf.length > idxT) dfText = dataDf[idxT];
          var obj = {
            iconSet: null,
            customValues: text,
            colorSet: '',
            textColorSet: '',
          };
          if (text || val) {
            if (idxT < icons?.Length)
              obj.iconSet = icons.length > i ? icons[idxT] : '';

            if (idxT < colors?.length)
              obj.colorSet = colors.length > i ? colors[idxT] : '';

            if (idxT < textColors?.length)
              obj.textColorSet = textColors.length > i ? textColors[idxT] : '';

            this.lstVll.push(obj);
          }
        }
        this.onSave(valueList);
      }
    });
  }
}
