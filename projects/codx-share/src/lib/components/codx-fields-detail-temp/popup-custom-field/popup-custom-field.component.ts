import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-popup-custom-field',
  templateUrl: './popup-custom-field.component.html',
  styleUrls: ['./popup-custom-field.component.css'],
})
export class PopupCustomFieldComponent implements OnInit {
  fields = [];
  dialog: any;
  titleHeader = '';
  currentRate = 3.5;
  hovered = 0;
  vllShare = '';
  errorMessage = '';
  checkErr = false;
  checkRequired = false;
  isSaving = false;
  isAddComplete: any = true;
  objectIdParent: any;
  customerID: any; //Khách hàng cơ hội

  arrCaculateField = []; //cac field co tinh toán

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.fields = JSON.parse(JSON.stringify(dt?.data?.data));
    this.titleHeader = dt?.data?.titleHeader;
    this.objectIdParent = dt?.data?.objectIdParent;
    this.customerID = dt?.data?.customerID;
    this.dialog = dialog;
    this.arrCaculateField = this.fields.filter((x) => x.dataType == 'CF');
  }

  ngOnInit(): void {
    // this.checkRequired = this.data.some((x) => x.isRequired == true);
    // this.cache.message('SYS028').subscribe((res) => {
    //   if (res) this.errorMessage = res.customName || res.defaultName;
    // });
  }

  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      var result = event.e?.data;
      var field = event.data;
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
          result = event.e;
          break;
      }

      // this.fields.forEach((x) => {
      //   if (x.recID == field.recID) x.dataValue = result;
      // });
      //no bij map nguoc dataa
      let index = this.fields.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        this.fields[index].dataValue = result;
      }
      if (field.dataType == 'N') this.caculateField(field.fieldName, result);
    }
  }
  // partValue(item) {
  //   return JSON.parse(JSON.stringify(item));
  // }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          //this.notiService.notifyCode('SYS037');
          this.cache.message('SYS037').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          // this.notiService.notifyCode('RS030');
          this.cache.message('RS030').subscribe((res) => {
            if (res) {
              let errorMessage = res.customName || res.defaultName;
              this.notiService.notify(errorMessage, '2');
            }
          });
          return false;
        }
      }
    }
    return true;
  }

  onSave() {
    if (this.fields?.length == 0 || !this.isAddComplete) return;

    let check = true;
    let checkFormat = true;
    this.fields.forEach((f) => {
      if (!f.dataValue || f.dataValue?.toString().trim() == '') {
        if (f.isRequired) {
          this.notiService.notifyCode('SYS009', 0, '"' + f.title + '"');
          check = false;
        }
      } else checkFormat = this.checkFormat(f);
    });
    if (!check || !checkFormat) return;
    if (this.isSaving) return;
    this.isSaving = true;
    let data = [this.fields[0]?.stepID, this.fields];
    this.api
      .exec<any>(
        'DP',
        'InstancesStepsBusiness',
        'UpdateInstanceStepFielsByStepIDAsync',
        data
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close(this.fields);
          this.notiService.notifyCode('SYS007');
          this.changeDetectorRef.detectChanges();
        } else this.dialog.close();
      });
  }

  addFileCompleted(e) {
    this.isAddComplete = e;
  }

  //tính toán
  arrCheck = ['+', '-', 'x', '/', 'Avg(', '(', ')'];
  parenthesis = ['(', ')'];
  operator = ['+', '-', 'x', '/', 'Avg('];
  operatorAddMinus = ['+', '-'];
  operatorMulDiv = ['x', '/'];
  //tính toán
  caculateField(fieldName, dataValue) {
    if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
    this.arrCaculateField.forEach((obj) => {
      let dataFormat = obj.dataFormat;
      this.fields.forEach((f) => {
        if (
          dataFormat.includes('[' + f.fieldName + ']') &&
          f.dataValue &&
          f.dataType == 'N'
        ) {
          dataFormat = dataFormat.replaceAll(
            '[' + f.fieldName + ']',
            f.dataValue
          );
          obj.dataValue = dataFormat;
        }
      });

      if (!dataFormat.includes('[')) {
        //tinh toán
        //Hiện tại sẽ lấy data đã
        obj.dataValue = this.caculate(dataFormat);
        //tính toan end
        let index = this.fields.findIndex((x) => x.recID == obj.recID);
        if (index != -1) {
          this.fields[index].dataValue = dataFormat;
        }
      }
    });
  }

  caculate(stringMath) {
    if (stringMath.includes('_')) return stringMath;
    if (this.isExitOperator(this.arrCheck, stringMath)) {
      if (this.isExitOperator(this.parenthesis, stringMath)) {
        //có ngoặc => chưa làm
      } else if (this.isExitOperator(this.operator, stringMath)) {
        //chi la phep toan
        if (this.isExitOperator(this.operatorMulDiv, stringMath)) {
          // co nhan chia
          stringMath = this.sumAndMul(stringMath);
        } else {
          stringMath = this.sumSub(stringMath);
        }
      }
    }
    return stringMath;
  }

  //phep toan co ban
  sumSub(stringMath, opera = '+') {
    if (!stringMath || !this.isExitOperator(this.operatorAddMinus, stringMath))
      return stringMath;
    let sum = 0;
    let num = stringMath[0];

    for (var i = 1; i < stringMath.length; i++) {
      if (this.operatorAddMinus.includes(stringMath[i])) {
        if (opera == '+') {
          sum += Number.parseFloat(num);
        } else {
          sum -= Number.parseFloat(num);
        }
        num = '';
        opera = stringMath[i];
      } else {
        num += stringMath[i];
      }
    }
    if (opera == '+') {
      sum += Number.parseFloat(num);
    } else {
      sum -= Number.parseFloat(num);
    }
    return sum.toString();
  }

  //phep nhan chia
  multDiv(stringMath, opera = 'x') {
    if (!stringMath || !this.isExitOperator(this.operatorMulDiv, stringMath))
      return stringMath;
    let mul = 1;
    let num = stringMath[0];

    for (var i = 1; i < stringMath.length; i++) {
      if (this.operatorMulDiv.includes(stringMath[i])) {
        if (opera == 'x') {
          mul = mul * Number.parseFloat(num);
        } else {
          if (Number.parseFloat(num) == 0) return '_'; //ko chia dc cho 0
          mul = mul / Number.parseFloat(num);
        }
        num = '';
        opera = stringMath[i];
      } else {
        num += stringMath[i];
      }
    }
    if (opera == 'x') {
      mul = mul * Number.parseFloat(num);
    } else {
      if (Number.parseFloat(num) == 0) return '_'; //ko chia dc cho 0
      mul = mul / Number.parseFloat(num);
    }
    return mul.toString();
  }

  // pheptoan + ,-,x,/
  sumAndMul(stringMath, haveSum = false) {
    if (!stringMath || !this.isExitOperator(this.operator, stringMath))
      return stringMath;
    if (stringMath.includes('+')) {
      let arrAdd = stringMath.trim().split('+');
      if (arrAdd?.length > 0) {
        let arrRes = arrAdd.map((str) => {
          return this.sumAndMul(str, true);
        });
        // stringMath = this.sumAndMul(arrRes.join('+'));
        return this.sumSub(arrRes.join('+'));
      }
    } else if (stringMath.includes('-')) {
      let arrMunus = stringMath.trim().split('-');
      if (arrMunus?.length > 0) {
        let arrRes = arrMunus.map((str) => {
          return this.sumAndMul(str);
        });
        stringMath = arrRes.join('-');
        if (!haveSum) return this.sumSub(stringMath);
      }
    } else stringMath = this.multDiv(stringMath);
    return stringMath;
  }
  //check tồn tại
  isExitOperator(arrOperator, string) {
    var check = false;
    arrOperator.forEach((op) => {
      if (string.includes(op)) {
        check = true;
        return;
      }
    });
    return check;
  }
  //check undifine
  isUndifine(string) {
    return string.includes('_');
  }

  agv(arr: Array<number>) {
    let sum = 0;
    arr.forEach((n) => (sum += n));
    return sum / arr.length;
  }
  //
}
