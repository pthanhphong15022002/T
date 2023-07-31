import { DecimalPipe } from '@angular/common';
import { Component, Optional, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  ApiHttpService,
} from 'codx-core';

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
  isSave = false;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(data?.data?.data));
    this.title = data?.data?.title;
    this.lstLinesBySales = data?.data?.lstLinesBySales;
  }

  ngOnInit() {
    this.setListMonth(); //Set 12 tháng vào 1 list;
    this.setTargetLineToMonth(); //set giá trị trọng số, mục tiêu vào list 12 tháng.
  }

  onSave() {
    if (!this.checkTarget()) {
      this.notiService.notifyCode(
        'Mục tiêu năm không phù hợp với mục tiêu doanh số'
      );
      return;
    }

    if (this.isSave == true) {
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'TargetsLinesBusiness',
          'UpdateListTargetLinesAsync',
          [this.lstLinesBySales]
        )
        .subscribe((res) => {
          if(res && res.length > 0){
            this.notiService.notifyCode('SYS007');
            this.dialog.close();
          }else{
            this.notiService.notifyCode('SYS021');
            this.dialog.close();
          }
        });
    } else {
      this.notiService.notifyCode('SYS007');
      this.dialog.close();
    }
  }

  checkTarget() {
    if (this.lstLinesBySales != null && this.lstLinesBySales.length > 0) {
      var target = 0;
      this.lstLinesBySales.forEach((res) => {
        target += res.target;
      });

      if (Math.round(target) != this.data.target) {
        return false;
      }
    }
    return true;
  }

  setListMonth() {
    //Đợi vll chị Khanh
    let lst = [];
    for (let i = 1; i <= 12; i++) {
      var tmp = {};
      tmp['month'] = i;
      tmp['text'] = 'Tháng ' + i;
      tmp['weight'] = 0;
      tmp['target'] = 0;
      tmp['isExit'] = false;
      tmp['lineID'] = '';
      lst.push(Object.assign({}, tmp));
    }
    this.lstMonths = lst;
    this.changeDetectorRef.detectChanges();
  }

  setTargetLineToMonth() {
    if (this.lstLinesBySales != null && this.lstLinesBySales.length > 0) {
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

  sumTarget() {
    let target = 0;
    this.lstMonths.forEach((res) => (target += res.target));
    return this.targetToFixed(target);
  }

  sumWeight() {
    let weight = 0;
    this.lstMonths.forEach((res) => (weight += res.weight));
    return this.targetToFixed(weight);
  }

  targetToFixedWei(data) {
    return Math.round(data);
  }

  targetToFixed(data) {
    return data ? this.decimalPipe.transform(data, '1.0-0') : 0;
  }

  dbClick(data, type) {
    this.editingItem = data;
    this.typeChange = type;

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
      if (type == 'weight') {
        if (parseFloat(this.lstMonths[index].weight.toFixed(2)) != target) {
          if (this.checkWeight(id, target, 100, 'weight')) {
            this.editingItem = null;
            this.typeChange = '';
            this.notiService.notifyCode('Giá trị không hợp lệ');
            return;
          }
          this.lstMonths[index].weight = target;
          this.lstMonths[index].target = (this.data.target * target) / 100;
          this.lstMonths[index].isExit = true;
          var weigth = 0;
          let count = 0;
          this.lstMonths.forEach((ele) => {
            if (ele.isExit) {
              weigth += ele.weight;
            } else {
              count++;
            }
          });
          this.lstMonths.forEach((res) => {
            if (res.lineID != id && !res.isExit) {
              if (count > 0) {
                res.weight = (100 - weigth) / count;
                res.target = (res.weight * this.data.target) / 100;
              } else {
                res.weight = 0;
                res.target = 0;
              }
            }
          });

          for (let item of this.lstLinesBySales) {
            for (var ow of this.lstMonths) {
              if (item.recID == ow.lineID) {
                item.weight = ow.weight;
                item.target = ow.target;
              }
            }
          }
          this.isSave = true;
        }
      } else {
        if (this.lstMonths[index].target != target) {
          if (this.checkWeight(id, target, this.data.target, 'target')) {
            this.editingItem = null;
            this.typeChange = '';
            this.notiService.notifyCode('Giá trị không hợp lệ');
            return;
          }
          this.lstMonths[index].target = target;
          this.lstMonths[index].isExit = true;
          this.lstMonths[index].weight = (target * 100) / this.data.target;

          let targetExSum = 0;
          let countEx = 0;
          this.lstMonths.forEach((ele) => {
            if (ele.isExit) {
              targetExSum += ele.target;
            } else {
              countEx++;
            }
          });

          this.lstMonths.forEach((res) => {
            if (res.lineID != id && !res.isExit) {
              if (countEx > 0) {
                res.target = (this.data.target - targetExSum) / countEx;
                res.weight = (res.target * 100) / this.data.target;
              } else {
                res.target = 0;
                res.weight = 0;
              }
            }
          });

          for (let item of this.lstLinesBySales) {
            for (var ow of this.lstMonths) {
              if (item.recID == ow.lineID) {
                item.weight = ow.weight;
                item.target = ow.target;
              }
            }
          }
          this.isSave = true;
        }
      }
    }
    this.editingItem = null;
    this.typeChange = '';
    console.log('month: ', this.lstMonths);
    console.log('lines: ', this.lstLinesBySales);

    this.changeDetectorRef.detectChanges();
  }

  checkWeight(id, weight, main: number, type) {
    let weightExit = 0;
    let isCheck = false;
    if (weight > main) return true;
    for (var item of this.lstMonths) {
      if (item.lineID != id && item.isExit) {
        if (type == 'weight') {
          weightExit += item.weight;
        } else {
          weightExit += item.target;
        }
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
          this.lstMonths.filter((x) => !x.isExit).length == 1 &&
          this.lstMonths.some((x) => !x.isExit && x.lineID == id)
        ) {
          isCheck = weightExit + weight !== main ? true : false;
        }
      }
    }
    return isCheck;
  }

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
    this.isSave = true;
  }
}
