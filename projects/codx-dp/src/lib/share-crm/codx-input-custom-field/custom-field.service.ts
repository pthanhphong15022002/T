import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CustomFieldService {
  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
  ) { }
  //----------------------CACULATE---------------------------//
  point = '';
  arrCheck = ['+', '-', 'x', '/', 'Avg(', '(', ')'];
  parenthesis = ['(', ')'];
  operator = ['+', '-', 'x', '/', 'Avg('];
  operatorAddMinus = ['+', '-'];
  operatorMulDiv = ['x', '/'];
  //total all - Sư dụng hàm "eval()" để thay thế thử
  caculate(stringMath) {
    if (!this.point) this.decimalPointSeparation();
    if (stringMath.includes('_')) return stringMath;
    if (this.isExitOperator(this.arrCheck, stringMath)) {
      if (this.isExitOperator(this.parenthesis, stringMath)) {
        //có ngoặc
        return this.caculate(this.operatorParentheses(stringMath));
      } else if (this.isExitOperator(this.operator, stringMath)) {
        //chi la phep toan
        if (this.isExitOperator(this.operatorMulDiv, stringMath)) {
          // co nhan chia
          return this.sumAndMul(stringMath);
        } else {
          return this.sumSub(stringMath);
        }
      }
    }
    return stringMath;
  }

  //phep toan co ban
  sumSub(stringMath, opera = '+') {
    if (!stringMath || !this.isExitOperator(this.operatorAddMinus, stringMath))
      return stringMath;
    if (stringMath.includes('+-'))
      stringMath = stringMath.replaceAll('+-', '-');
    if (stringMath.includes('--'))
      stringMath = stringMath.replaceAll('--', '+');
    let sum = 0;
    let num = stringMath[0];

    for (var i = 1; i < stringMath.length; i++) {
      if (this.operatorAddMinus.includes(stringMath[i])) {
        num = this.converCommaDot(num);
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
    num = this.converCommaDot(num);
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
    if (stringMath.includes('xSUB'))
      stringMath = stringMath.replaceAll('xSUB', 'x-');
    if (stringMath.includes('/SUB'))
      stringMath = stringMath.replaceAll('/SUB', '/-');
    let mul = 1;
    let num = stringMath[0];

    for (var i = 1; i < stringMath.length; i++) {
      if (this.operatorMulDiv.includes(stringMath[i])) {
        num = this.converCommaDot(num);
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
    num = this.converCommaDot(num);
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
    if (stringMath.includes('+-'))
      stringMath = stringMath.replaceAll('+-', '-');
    if (stringMath.includes('--'))
      stringMath = stringMath.replaceAll('--', '+');
    if (stringMath.includes('x-'))
      stringMath = stringMath.replaceAll('x-', 'xSUB');
    if (stringMath.includes('/-'))
      stringMath = stringMath.replaceAll('/-', '/SUB');
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
  //xác định dấu "." hay "," ngăn cách phần thập phân
  converCommaDot(num) {
    if (this.point == ',' && num.includes('.')) {
      num = num.replaceAll('.', ',');
    } else if (this.point == '.' && num.includes(','))
      num = num.replaceAll(',', '.');
    return num;
  }
  //Decimal point separation
  decimalPointSeparation() {
    const string1 = '1,23'; //parFloat
    const string2 = '1.23';
    const result = Number.parseFloat(string1) - Number.parseFloat(string2); //string1.localeCompare(string2);
    if (result > 0) {
      //'Dấu , phân tách phần thập phân 1,234 - 1'
      this.point = ',';
    } else {
      //'Dấu . phân tách phần thập phân 1-1.23'
      this.point = '.';
    }
  }

  //toán tử trong dấu ngoặc đơn
  operatorParentheses(stringMath) {
    let lastIndexOpen = stringMath.lastIndexOf('(');
    let lastIndexClose = stringMath.lastIndexOf(')');
    let indexClose = stringMath.indexOf(')');
    while (indexClose < lastIndexOpen) {
      for (let i = indexClose + 1; i <= lastIndexClose; i++) {
        if (stringMath[i] == ')') {
          indexClose = i;
          break;
        }
      }
    }

    let stringReturn = this.caculate(
      stringMath.substring(lastIndexOpen + 1, indexClose)
    );
    stringMath =
      stringMath.substring(0, lastIndexOpen) +
      stringReturn +
      stringMath.substring(indexClose + 1, stringMath.length);

    return stringMath;
  }

  agv(arr: Array<number>) {
    let sum = 0;
    arr.forEach((n) => (sum += n));
    return sum / arr.length;
  }
  //------------------END_CACULATE--------------------//

  //----------------CheckFormat----------------------//  => chưa gom
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
  //--------------------------------------------------//
  //----------------Check conditional Ref----------------------// 
  checkConditionalRef(listField, fieldCrr) {
    if (!fieldCrr?.isApplyConditional || !fieldCrr?.conditionReference || fieldCrr?.conditionReference?.length == 0) return { check: true, conditionRef: [] };

    let arrMess = [];
    (fieldCrr.conditionReference as Array<any>).forEach(x => {
      let result = true;
      let fielRefCon = listField.find(f => f.refID == x.refID);
      if (fielRefCon) {
        if (!fielRefCon.dataValue) {
          arrMess.push(x);
        } else {
          switch (x.compareConditions) {
            case ">=":
              result = fieldCrr.dataValue >= fielRefCon.dataValue;
              break;
            case "<=":
              result = fieldCrr.dataValue <= fielRefCon.dataValue;
              break;
            case ">":
              result = fieldCrr.dataValue > fielRefCon.dataValue;
              break;
            case "<":
              result = fieldCrr.dataValue < fielRefCon.dataValue;
              break;
            case "=":
              result = fieldCrr.dataValue == fielRefCon.dataValue;
              break;
          }
        }

        if (!result) arrMess.push(x);
      }
    })
    let check = true;
    if (arrMess?.length > 0) {
      arrMess.forEach(x => {
        if (x.messageType == '2') check = false;
        this.notiService.notify(x.messageText, x.messageType)
      })
    }
    return { check: check, conditionRef: arrMess };
  }
  //----------------------------------------------------------//
  //---------------Tempmail---------------//
  deletedTempmail(recID) {
    return this.api.execSv<any>("SYS", "AD", "EmailTemplatesBusiness", "DeleteEmailTemplateByRecIDAsync", recID)
  }
}