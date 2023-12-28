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

  titleHeader: 'Table ne';
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

    this.arrCaculateField = this.listColumns.filter((x) => x.dataType == 'CF');
    if (this.arrCaculateField?.length > 0) this.decimalPointSeparation();
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
      let result = event.e?.data;
      let field = event.data;

      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
        case 'C':
        case 'L':
        case 'TA':
        case 'PA':
          result = event?.e;
          break;
      }

      let idxUp = this.fieldFormat.findIndex((x) => x.recID == field.recID);
      if (idxUp != -1) {
        this.fieldFormat[idxUp]['dataValue'] = result;
        let fieldName = this.fieldFormat[idxUp]['fieldName'];
        this.line[fieldName] = result;
      }

      if (field.dataType == 'N') this.caculateField();
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
        if (dataFormat.includes('[' + f.fieldName + ']') && f.dataValue) {
          let dataValue = f.dataValue;
          if (f.dataFormat == 'P') dataValue = dataValue + '/100';
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            dataValue
          );
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        obj.dataValue = this.customFieldSV.caculate(dataFormat, this.point);
        //tính toan end
        let index = this.fieldFormat.findIndex((x) => x.recID == obj.recID);
        if (index != -1) {
          this.fieldFormat[index]['dataValue'] = obj.dataValue;
          let fieldName = this.fieldFormat[index]['fieldName'];
          this.line[fieldName] = obj.dataValue;
        }
      }
    });
  }
  //Decimal point separation
  decimalPointSeparation() {
    const string1 = '1,23'; //parFloat
    const string2 = '1.23';
    const result = Number.parseFloat(string1) - Number.parseFloat(string2);
    if (result > 0) {
      //'Dấu , phân tách phần thập phân 1,234 - 1'
      this.point = ',';
    } else {
      //'Dấu . phân tách phần thập phân 1-1.23'
      this.point = '.';
    }
  }
  //------------------END_CACULATE--------------------//
}
