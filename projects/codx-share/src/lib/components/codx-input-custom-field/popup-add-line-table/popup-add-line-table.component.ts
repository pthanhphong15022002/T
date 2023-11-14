import { Component, OnInit, Optional } from '@angular/core';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';

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

  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.listColumns = dt?.data?.listColumns
      ? JSON.parse(JSON.stringify(dt?.data?.listColumns))
      : [];
    this.line = JSON.parse(JSON.stringify(dt?.data?.data));
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
}
