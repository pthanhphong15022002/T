import { DecimalPipe } from '@angular/common';
import { Component, Optional, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  ApiHttpService,
  AuthService,
  CacheService,
} from 'codx-core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-change-allocation-rate',
  templateUrl: './popup-change-allocation-rate.component.html',
  styleUrls: ['./popup-change-allocation-rate.component.css'],
  providers: [DecimalPipe],
})
export class PopupChangeAllocationRateComponent implements OnInit {
  title = '';
  lstLinesBySales = [];
  data: any;
  dialog!: DialogRef;
  editingItem: any;
  typeChange = '';
  lstMonths = [];
  lstQuarters = [];
  isSave = false;
  language = 'vn';
  isTargetQuarter: boolean = false;
  editingQuarter: any;
  currencyID: string;
  exchangeRate: number;
  targetSys: number;
  isCheckSave = false;
  isView: boolean = false;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private auth: AuthService,
    private cache: CacheService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(data?.data?.data));
    this.language = this.auth.userValue?.language?.toLowerCase();
    this.title = data?.data?.title;
    this.lstLinesBySales = data?.data?.lstLinesBySales;
    this.currencyID = data?.data?.currencyID;
    this.exchangeRate = data?.data?.exchangeRate;
    this.targetSys = data?.data?.targetSys;
    this.isView = data?.data?.isView;
  }

  async ngOnInit() {
    await this.setListQuarters();
    await this.setListMonth(); //Set 12 tháng vào 1 list;
    await this.setTargetLineToMonth(); //set giá trị trọng số, mục tiêu vào list 12 tháng.
  }

  async setListQuarters() {
    //Đợi vll chị Khanh
    let lst = [];
    let data = await firstValueFrom(this.cache.valueList('CRM046'));
    if (data && data.datas != null) {
      for (let item of data.datas) {
        var tmp = {};
        tmp['quarter'] = item?.value;
        tmp['text'] = item.text;
        tmp['weight'] = 0;
        tmp['target'] = 0;
        tmp['isExit'] = false;
        lst.push(Object.assign({}, tmp));
      }
    }

    this.lstQuarters = lst;
    this.changeDetectorRef.detectChanges();
  }

  async setListMonth() {
    //Đợi vll chị Khanh
    let lst = [];
    let data = await firstValueFrom(this.cache.valueList('CRM048'));
    if (data && data.datas != null) {
      for (let item of data.datas) {
        var tmp = {};
        tmp['month'] = item?.value;
        tmp['text'] = item.text;
        tmp['weight'] = 0;
        tmp['target'] = 0;
        tmp['isExit'] = false;
        tmp['lineID'] = '';
        lst.push(Object.assign({}, tmp));
      }
    }

    this.lstMonths = lst;
    this.changeDetectorRef.detectChanges();
  }

  setTargetLineToMonth() {
    if (this.lstLinesBySales != null && this.lstLinesBySales.length > 0) {
      this.lstQuarters.forEach((res) => {
        for (let item of this.lstLinesBySales) {
          var month = new Date(item.startDate)?.getMonth() + 1;
          if (this.checkMonthQuarter(parseInt(res.quarter), month)) {
            res.target += item.target;
          }
        }
      });
      this.lstQuarters.forEach(
        (x) => (x.weight = (x.target / this.data.target) * 100)
      );
      this.lstMonths.forEach((res) => {
        for (let item of this.lstLinesBySales) {
          var month = new Date(item.startDate)?.getMonth() + 1;
          if (month == res.month) {
            res.lineID = item.recID;
            res.target = item.target;
            if (this.data?.target > 0) {
              res.weight = (res.target / this.data.target) * 100;
            } else {
              res.weight = 0;
            }
          }
        }
      });
      this.changeDetectorRef.detectChanges();
    }
  }

  checkMonthQuarter(i, month) {
    if (i == 1) {
      if (month >= 1 && month < 4) {
        return true;
      }
    } else if (i == 2) {
      if (month >= 4 && month < 7) {
        return true;
      }
    } else if (i == 3) {
      if (month >= 7 && month < 10) {
        return true;
      }
    } else if (i == 4) {
      if (month >= 10 && month < 13) {
        return true;
      }
    }
    return false;
  }

  valueChange(e) {
    if (this.isTargetQuarter != e?.data) {
      this.isTargetQuarter = e.data;
    }
  }

  onSave() {
    this.isCheckSave = true;
    if (!this.checkTarget()) {
      this.notiService.notifyCode('CM032');
      this.isCheckSave = false;
      return;
    }

    if (this.isSave == true) {
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'TargetsBusiness',
          'UpdateListTargetLinesAsync',
          [
            this.data?.parentID,
            this.lstLinesBySales,
            this.currencyID,
            this.exchangeRate,
          ]
        )
        .subscribe((res) => {
          if (res) {
            this.notiService.notifyCode('SYS007');
            this.dialog.close(res);
          } else {
            this.notiService.notifyCode('SYS021');
            this.dialog.close();
          }
          this.isCheckSave = false;
        });
    } else {
      this.notiService.notifyCode('SYS007');
      this.dialog.close();
    }
    this.changeDetectorRef.detectChanges();
  }

  outPutClosedSave(lstLinesBySales) {
    if (lstLinesBySales != null && lstLinesBySales.length > 0) {
      var check = lstLinesBySales.every((x) => x.target > 0);
      if (check) {
        this.data.titleMonth = this.language == 'vn' ? 'Cả năm' : 'Whole year';
      } else {
        let titleMonth = '';
        for (var lines of lstLinesBySales) {
          let month = new Date(lines.startDate)?.getMonth() + 1;
          if (lines.target > 0) {
            if (titleMonth == '') {
              titleMonth = titleMonth + month;
            } else {
              titleMonth = titleMonth + ';' + month;
            }
          }
        }
        if (titleMonth !== null && titleMonth !== '') {
          let months = titleMonth.split(';');

          let monthList = [];
          for (let i = 0; i < months.length; i++) {
            let monthStr = months[i];
            let month = parseInt(monthStr, 10);
            if (!isNaN(month)) {
              monthList.push(month);
            }
          }

          monthList.sort((a, b) => a - b);

          titleMonth = monthList.join(';');

          let formattedMonths = [];
          let start = monthList[0];
          let end = monthList[0];
          let lang = this.language === 'vn' ? 'Tháng ' : 'Month ';

          for (let i = 1; i < monthList.length; i++) {
            if (monthList[i] === end + 1) {
              end = monthList[i];
            } else {
              if (start === end) {
                formattedMonths.push(lang + start);
              } else {
                formattedMonths.push(lang + start + ' - ' + lang + end);
              }
              start = end = monthList[i];
            }
          }

          if (start === end) {
            formattedMonths.push(lang + start);
          } else {
            formattedMonths.push(lang + start + ' - ' + lang + end);
          }

          titleMonth = formattedMonths.join(', ');
          this.data.titleMonth = titleMonth;
        }
      }
      this.data.targetsLines = lstLinesBySales;
      this.data.target = this.targetSys;
      this.data.currencyID = this.currencyID;
      this.data.exchangeRate = this.exchangeRate;
    }
  }

  checkTarget() {
    if (this.lstLinesBySales != null && this.lstLinesBySales.length > 0) {
      var target = 0;
      this.lstLinesBySales.forEach((res) => {
        target += res.target;
      });

      if (Math.round(target) != Math.round(this.data.target)) {
        return false;
      }
    }
    return true;
  }

  sumTarget(lst = []) {
    let target = 0;
    lst.forEach((res) => (target += res.target));
    return target.toLocaleString();
  }

  sumWeight(lst = []) {
    let weight = 0;
    lst.forEach((res) => (weight += res.weight));
    return weight.toLocaleString();
  }

  formatNumberWithoutTrailingZeros(num) {
    const roundedNum = parseFloat(num.toFixed(2));

    const formattedNum = roundedNum.toString().replace(/(\.\d*?)0+$/, '$1');

    return formattedNum;
  }

  targetToFixed(data) {
    return data ? this.decimalPipe.transform(data, '1.0-0') : 0;
  }

  targetTng(data) {
    return Math.round(data);
  }

  dbClick(data, type) {
    if (!this.isView) {
      this.editingItem = data;
      this.typeChange = type;
    }

    this.changeDetectorRef.detectChanges();
  }

  updateTargetQuarter(e, id, type) {
    var index = -1;
    if (parseFloat(e) < 0) {
      this.editingItem = null;
      this.typeChange = '';
      return;
    }
    let target = parseFloat(e?.trim());
    index = this.lstQuarters.findIndex((x) => x.quarter == id);
    if (index != -1) {
      if (type == 'weight') {
        if (parseFloat(this.lstQuarters[index].weight.toFixed(2)) != target) {
          if (
            this.checkWeight(
              id,
              target,
              100,
              'weight',
              'quarter',
              this.lstQuarters
            )
          ) {
            this.editingItem = null;
            this.typeChange = '';
            this.notiService.notifyCode('CM035');
            return;
          }
          this.lstQuarters[index].weight = target;
          this.lstQuarters[index].target = (this.data.target * target) / 100;
          this.lstQuarters[index].isExit = true;
          this.lstQuarters = this.updateWeightList(
            'quarter',
            id,
            this.data.target,
            this.lstQuarters,
            100
          );

          this.updateTargetListMonth();
          this.updateListLines();

          this.isSave = true;
        }
      } else {
        if (this.lstQuarters[index].target != target) {
          if (
            this.checkWeight(
              id,
              target,
              this.data.target,
              'target',
              'quarter',
              this.lstQuarters
            )
          ) {
            this.editingItem = null;
            this.typeChange = '';
            this.notiService.notifyCode('CM035');
            return;
          }
          this.lstQuarters[index].target = target;
          this.lstQuarters[index].isExit = true;
          this.lstQuarters[index].weight = (target * 100) / this.data.target;

          this.lstQuarters = this.updateTargetList(
            'quarter',
            id,
            this.data.target,
            this.lstQuarters,
            100
          );
          this.updateTargetListMonth();
          this.updateListLines();

          this.isSave = true;
        }
      }
    }
    this.editingItem = null;
    this.typeChange = '';
    this.changeDetectorRef.detectChanges();
  }

  updateTarget(e, id, type) {
    var index = -1;
    if (parseFloat(e) < 0) {
      this.editingItem = null;
      this.typeChange = '';
      return;
    }
    let target = parseFloat(e?.trim());
    index = this.lstMonths.findIndex((x) => x.lineID == id);
    if (index != -1) {
      if (parseFloat(this.lstMonths[index][type].toFixed(2)) != target) {
        let main = type == 'weight' ? 100 : this.data.target;
        let lstMonthQuarters = this.lstMonths;
        let targetSum = this.data.target;
        let weightSum = 100;
        if (this.isTargetQuarter) {
          let month = this.lstMonths[index].month;
          var indexQuarter = this.lstQuarters.findIndex((x) =>
            this.checkMonthQuarter(parseInt(x.quarter), parseInt(month))
          );

          if (indexQuarter != -1) {
            main = this.lstQuarters[indexQuarter][type];
            targetSum = this.lstQuarters[indexQuarter].target;
            weightSum = this.lstQuarters[indexQuarter].weight;
            lstMonthQuarters = this.lstMonths.filter((x) =>
              this.checkMonthQuarter(
                parseInt(this.lstQuarters[indexQuarter].quarter),
                parseInt(x.month)
              )
            );
          }
        }
        if (
          this.checkWeight(id, target, main, type, 'lineID', lstMonthQuarters)
        ) {
          this.editingItem = null;
          this.typeChange = '';
          this.notiService.notifyCode('CM035');
          return;
        }
        var idxMQ = lstMonthQuarters.findIndex((x) => x.lineID == id);
        if (type == 'weight') {
          if (idxMQ != -1) {
            lstMonthQuarters[idxMQ].weight = target;
            if (weightSum > 0) {
              lstMonthQuarters[idxMQ].target = (targetSum * target) / weightSum;
            } else {
              lstMonthQuarters[idxMQ].target = 0;
            }
            lstMonthQuarters[idxMQ].isExit = true;
          }
          const lstTemps = this.updateWeightList(
            'lineID',
            id,
            targetSum,
            lstMonthQuarters,
            main
          );
          for (var item of this.lstMonths) {
            var temp = lstTemps.find((x) => x.lineID == item.lineID);
            if (temp) {
              item = temp;
            }
          }
          if (!this.isTargetQuarter)
            this.updateQuarterByMonth(this.lstMonths[index].month);
          this.updateListLines();
          this.isSave = true;
        } else {
          if (idxMQ != -1) {
            lstMonthQuarters[idxMQ].target = target;
            lstMonthQuarters[idxMQ].isExit = true;
            if (targetSum > 0) {
              lstMonthQuarters[idxMQ].weight = (target * weightSum) / targetSum;
            } else {
              lstMonthQuarters[idxMQ].weight = 0;
            }
          }
          const lstTemps = this.updateTargetList(
            'lineID',
            id,
            targetSum,
            lstMonthQuarters,
            weightSum
          );
          for (var item of this.lstMonths) {
            var temp = lstTemps.find((x) => x.lineID == item.lineID);
            if (temp) {
              item = temp;
            }
          }
          if (!this.isTargetQuarter)
            this.updateQuarterByMonth(this.lstMonths[index].month);
          this.updateListLines();
          this.isSave = true;
        }
      }
    }
    this.editingItem = null;
    this.typeChange = '';
    this.changeDetectorRef.detectChanges();
  }

  updateWeightList(field: string, id, targetSum, lst = [], value) {
    var weigth = 0;
    let count = 0;
    lst.forEach((ele) => {
      if (ele.isExit) {
        weigth += ele.weight;
      } else {
        count++;
      }
    });
    lst.forEach((res) => {
      if (res[field] != id && !res.isExit) {
        if (count > 0) {
          res.weight = (value - weigth) / count;
          res.target = (res.weight * targetSum) / value;
        } else {
          res.weight = 0;
          res.target = 0;
        }
      }
    });
    return lst;
  }

  updateTargetListMonth() {
    for (var item of this.lstMonths) {
      var month = parseInt(item?.month);
      for (var qua of this.lstQuarters) {
        if (qua.quarter == '1') {
          if (month >= 1 && month < 4) {
            item.weight = qua.weight / 3;
            item.target = qua.target / 3;
          }
        } else if (qua.quarter == '2') {
          if (month >= 4 && month < 7) {
            item.weight = qua.weight / 3;
            item.target = qua.target / 3;
          }
        } else if (qua.quarter == '3') {
          if (month >= 7 && month < 10) {
            item.weight = qua.weight / 3;
            item.target = qua.target / 3;
          }
        } else {
          if (month >= 10 && month < 13) {
            item.weight = qua.weight / 3;
            item.target = qua.target / 3;
          }
        }
      }
    }
  }

  updateTargetList(field: string, id, targetSum, lst = [], weight) {
    let targetExSum = 0;
    let countEx = 0;
    lst.forEach((ele) => {
      if (ele.isExit) {
        targetExSum += ele.target;
      } else {
        countEx++;
      }
    });

    lst.forEach((res) => {
      if (res[field] != id && !res.isExit) {
        if (countEx > 0) {
          res.target = (targetSum - targetExSum) / countEx;
          res.weight = (res.target * weight) / targetSum;
        } else {
          res.target = 0;
          res.weight = 0;
        }
      }
    });
    return lst;
  }

  updateListLines() {
    for (let item of this.lstLinesBySales) {
      for (var ow of this.lstMonths) {
        if (item.recID == ow.lineID) {
          item.weight = ow.weight;
          item.target = ow.target;
        }
      }
    }
  }

  updateQuarterByMonth(monthExit) {
    this.lstQuarters.forEach((res) => {
      let targetQua = 0;
      for (let item of this.lstMonths) {
        var month = parseInt(item.month);
        if (this.checkMonthQuarter(parseInt(res.quarter), month)) {
          targetQua += item.target;
        }
        res.target = targetQua;
        if (this.data.target > 0) {
          res.weight = (res.target * 100) / this.data.target;
        } else {
          res.weight = 0;
        }
      }
    });
  }

  checkWeight(id, weight, main: number, type, fieldID, lst = []) {
    let weightExit = 0;
    let isCheck = false;
    if (weight > main) return true;
    for (var item of lst) {
      if (item.isExit) {
        weightExit += item[type];
      }
    }
    if (weightExit >= main) {
      if (weight > 0) {
        return true;
      }
    } else {
      if (main - weightExit < weight) {
        return true;
      } else {
        if (
          lst.filter((x) => !x.isExit).length == 1 &&
          lst.some((x) => !x.isExit && x[fieldID] == id)
        ) {
          isCheck = weightExit + weight !== main ? true : false;
        }
      }
    }
    return isCheck;
  }

  checkValueIsTarget() {}

  clickRefered() {
    this.lstMonths.forEach((res) => {
      if (this.data.target > 0) {
        res.target = this.data.target / this.lstMonths.length;
        res.weight = (res.target * 100) / this.data.target;
      } else {
        res.target = 0;
        res.weight = 0;
      }
      res.isExit = false;
    });
    for (let item of this.lstLinesBySales) {
      for (var ow of this.lstMonths) {
        if (item.recID == ow.lineID) {
          item.weight = ow.weight;
          item.target = ow.target;
        }
      }
    }
    this.lstQuarters.forEach((res) => {
      let targetQua = 0;
      for (let item of this.lstLinesBySales) {
        var month = new Date(item.startDate)?.getMonth() + 1;
        if (this.checkMonthQuarter(parseInt(res.quarter), month)) {
          targetQua += item.target;
        }
        res.isExit = false;
        res.target = targetQua;
        if (this.data.target > 0) {
          res.weight = (res.target * 100) / this.data.target;
        } else {
          res.weight = 0;
        }
      }
    });
    this.isSave = true;
  }
}
