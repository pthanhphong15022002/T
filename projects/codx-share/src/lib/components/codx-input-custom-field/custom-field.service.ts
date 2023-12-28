import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomFieldService {
  point = '';
  constructor() {}
  //----------------------CACULATE---------------------------//
  arrCheck = ['+', '-', 'x', '/', 'Avg(', '(', ')'];
  parenthesis = ['(', ')'];
  operator = ['+', '-', 'x', '/', 'Avg('];
  operatorAddMinus = ['+', '-'];
  operatorMulDiv = ['x', '/'];
  //chung all
  caculate(stringMath, point) {
    this.point = point;
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
    const result = Number.parseFloat(string1) - Number.parseFloat(string2);
    if (result > 0) {
      //'Dấu , phân tách phần thập phân 1,234 - 1'
      this.point = ',';
    } else {
      //'Dấu . phân tách phần thập phân 1-1.23'
      this.point = '.';
    }
  }

  agv(arr: Array<number>) {
    let sum = 0;
    arr.forEach((n) => (sum += n));
    return sum / arr.length;
  }
  //------------------END_CACULATE--------------------//
}
