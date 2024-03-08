import { Component, OnInit, Optional } from '@angular/core';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CustomFieldService } from '../custom-field.service';

@Component({
  selector: 'lib-popup-add-line-table',
  templateUrl: './popup-add-line-table.component.html',
  styleUrls: ['./popup-add-line-table.component.css'],
})
export class PopupAddLineTableComponent implements OnInit {
  listColumns = [];
  dialog: any;
  fieldFormat = [];

  titleHeader: '';
  line: any;
  action = 'add';
  //Tisnh
  point = ',';
  arrCaculateField = [];

  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    private customFieldSV: CustomFieldService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.listColumns = dt?.data?.listColumns
      ? JSON.parse(JSON.stringify(dt?.data?.listColumns))
      : [];

    this.line = JSON.parse(JSON.stringify(dt?.data?.data));
    this.action = dt?.data?.action;
    this.titleHeader = dt?.data?.titleAction ?? '';
    this.arrCaculateField = this.listColumns.filter((x) => x.dataType == 'CF');
    if (this.arrCaculateField?.length > 0)
      this.arrCaculateField.sort((a, b) => {
        if (a.dataFormat.includes('[' + b.fieldName + ']')) return 1;
        else if (b.dataFormat.includes('[' + a.fieldName + ']')) return -1;
        else return 0;
      });
  }
  ngOnInit(): void {
    this.listColumns.forEach((x) => {
      let obj = Object.assign(x, {
        dataValue: this.line?.[x?.fieldName] ?? '',
      });
      this.fieldFormat.push(obj);
    });
  }

  addFileCompleted(e) {}

  valueChangeCustom(event) {
    if (event && event.data) {
      var result = event.e;
      var field = event.data;

      // let result = event.e?.data;
      // let field = event.data;

      // switch (field.dataType) {
      //   case 'D':
      //     result = event.e?.data.fromDate;
      //     break;
      //   case 'P':
      //   case 'R':
      //   case 'A':
      //   case 'C':
      //   case 'L':
      //   case 'TA':
      //   case 'PA':
      //     result = event?.e;
      //     break;
      // }

      let idxUp = this.fieldFormat.findIndex((x) => x.recID == field.recID);
      if (idxUp != -1) {
        this.fieldFormat[idxUp]['dataValue'] = result;
        let fieldName = this.fieldFormat[idxUp]['fieldName'];
        this.line[fieldName] = result;
        if (field.dataType == 'N') this.caculateField();
      }
    }
  }

  onSave() {
    if (!this.checkRequire()) {
      return;
    }
    this.dialog.close(this.line);
    this.line = null;
  }

  checkRequire() {
    let check = true;
    this.fieldFormat.forEach((x) => {
      if (x?.isRequire && !x?.dataValue) {
        this.notiService.notifyCode('SYS009', 0, '"' + x.title + '"');
        check = false;
      }
      if (check) check = this.checkFormat(x);
    });
    return check;
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              var errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              var errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
    }
    return true;
  }

  //----------------------CACULATE---------------------------//
  //tính toán
  caculateField() {
    if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
    let fieldsNum = this.fieldFormat.filter((x) => x.dataType == 'N');
    if (!fieldsNum || fieldsNum?.length == 0) return;

    this.arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;
      fieldsNum.forEach((f) => {
        if (dataFormat.includes('[' + f.fieldName + ']')) {
          if (!f.dataValue?.toString()) return;
          let dataValue = f.dataValue;
          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      this.arrCaculateField.forEach((x) => {
        if (dataFormat.includes('[' + x.fieldName + ']')) {
          if (!x.dataValue?.toString()) return;
          let dataValue = x.dataValue;
          dataFormat = dataFormat.replaceAll(
            '[' + x.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat);
        //tính toan end
        let index = this.fieldFormat.findIndex((x) => x.recID == obj.recID);
        if (index != -1) {
          this.fieldFormat[index]['dataValue'] = obj.dataValue;
          let fieldName = this.fieldFormat[index]['fieldName'];
          this.line[fieldName] = obj.dataValue;
        }
        this.setElement(obj.recID, obj.dataValue);
      }
    });
  }

  setElement(recID, value) {
    value =
      value && value != '_'
        ? Number.parseFloat(value)?.toFixed(2).toString()
        : '';
    var codxinput = document.querySelectorAll(
      '.form-group codx-input[data-record="' + recID + '"]'
    );

    if (codxinput?.length > 0) {
      let htmlE = codxinput[0] as HTMLElement;
      let input = htmlE.querySelector('input') as HTMLInputElement;
      if (input) {
        input.value = value;
      }
    }
  }
  //------------------END_CACULATE--------------------//
}
