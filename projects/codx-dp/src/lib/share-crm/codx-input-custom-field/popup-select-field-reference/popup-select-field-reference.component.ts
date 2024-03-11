import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-select-field-reference',
  templateUrl: './popup-select-field-reference.component.html',
  styleUrls: ['./popup-select-field-reference.component.css'],
})
export class PopupSelectFieldReferenceComponent implements OnInit {
  dialog: DialogRef;
  listField = [];
  field: any;
  fieldNameRef = '';
  constructor(
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.listField = dt?.data?.listField;
    this.field = JSON.parse(JSON.stringify(dt?.data?.field));
  }
  ngOnInit(): void {}
  valueChange(e, f) {
    if (e.data) {
      if (f.dataType == 'TA') {
        this.referentTA(f);
      } else {
        this.fieldNameRef = e.field;
        this.field.dataValue = f.dataValue;
      }
    }
  }
  selected() {
    this.dialog.close(this.field);
  }

  referentTA(fieldRef) {
    let dataFormatColumm = JSON.parse(fieldRef.dataFormat);
    let dataFormatCrr = JSON.parse(this.field.dataFormat);
    let arrFieldNameRef = [];
    let arrFieldNameAll = [];
    // let arrFieldOther = [];
    dataFormatCrr.forEach((x) => {
      let f = dataFormatColumm.find(
        (f) => f.fieldName == x.fieldName && f.dataType == x.dataType
      );
      if (f) {
        arrFieldNameRef.push(x.fieldName);
      }
      //  else arrFieldOther.push(x.fieldName);
      arrFieldNameAll.push(x.fieldName);
    });

    if (arrFieldNameRef?.length > 0) {
      let dataValueArr = JSON.parse(fieldRef.dataValue);

      if (dataValueArr?.length > 0) {
        let datas = [];
        let datasJson = '';
        dataValueArr.forEach((dt) => {
          let contenJson = '';
          arrFieldNameAll.forEach((fn) => {
            let value = '';
            if (arrFieldNameRef.includes(fn)) value = dt[fn] ?? '';
            contenJson += '"' + fn + '":"' + value + '",';
          });
          contenJson = contenJson.substring(0, contenJson.length - 1);
          // datas.push(JSON.parse('{' + contenJson + '}'));
          datasJson += '{' + contenJson + '},';
        });
        datasJson = datasJson.substring(0, datasJson.length - 1);
        this.field.dataValue = '[' + datasJson + ']';
      }
    } else
      this.notiService.notify(
        'Không có data tham chiếu phù hợp ! Vui lòng nhập giá trị của bạn !',
        '3'
      );
  }
}
