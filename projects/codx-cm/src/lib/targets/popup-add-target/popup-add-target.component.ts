import {
  ChangeDetectorRef,
  Component,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CodxDropdownCalendarComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CM_Targets, CM_TargetsLines } from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-target',
  templateUrl: './popup-add-target.component.html',
  styleUrls: ['./popup-add-target.component.scss'],
  providers: [DecimalPipe],
})
export class PopupAddTargetComponent {
  @ViewChild('dropCalendar') dropCalendar: CodxDropdownCalendarComponent;
  dialog: any;
  data: CM_Targets;
  action = '';
  headerText = '';
  targetLine: CM_TargetsLines;
  lstTargetLines: CM_TargetsLines[] = [];
  lstOwners = [];
  lstOwnersOld = [];
  //calendar - tháng - quý - năm
  date: any = new Date();
  ops = ['y'];
  selectedType: string;
  startDate: any;
  endDate: any;
  isPeriod = false;
  isExitTarget = false;
  isAllocation = false;
  isPopup = false;
  gridViewSetupTarget: any;
  gridViewSetupTargetLine: any;
  user: any;
  intTarget = 1;
  lstTime = [];
  month: number;
  text = '';
  isEditLine = false;
  editingItem: any;
  typeChange = 'input';
  isBusiness = false;
  dataOld: CM_Targets;
  quarter1: number = 0;
  quarter2: number = 0;
  quarter3: number = 0;
  quarter4: number = 0;
  lstQuarters = [];
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private changedetectorRef: ChangeDetectorRef,
    private authstore: AuthStore,
    private decimalPipe: DecimalPipe,
    private cmSv: CodxCmService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.action = data?.data?.action;
    this.headerText = data?.data?.title;
    this.user = this.authstore.get();
    if (this.action == 'edit') {
      this.lstOwners = data?.data?.lstOwners;
      this.lstOwnersOld = JSON.parse(JSON.stringify(this.lstOwners));
      this.lstTargetLines = data?.data?.lstTargetLines;
    }
  }

  ngOnInit(): void {
    this.isAllocation = this.data?.allocation == '1' ? true : false;
    this.cache.valueList('CRM046').subscribe((res) => {
      if (res && res.datas) {
        res.datas.forEach((element) => {
          if (
            !this.lstQuarters?.some((x) => x.id == parseInt(element?.value))
          ) {
            var tmp = {};
            tmp['recID'] = Util.uid();
            tmp['id'] = parseInt(element?.value);
            tmp['text'] = element?.text ?? element?.default;
            tmp['target'] = 0;
            tmp['userID'] = null;
            this.lstQuarters.push(Object.assign({}, tmp));
          }
        });
      }
    });
    if (this.action == 'add') {
      this.dataOld = JSON.parse(JSON.stringify(this.data));
      this.selectedType = this.getFormatCalendar(null);
      this.data.owner = null;
      this.data.currencyID = 'VND';
    } else {
      this.selectedType = this.getFormatCalendar(this.data?.category);
      this.isBusiness = true;
      this.isExitTarget = true;
      this.setQuarterInOwner();
      this.setQuartersByTargetOrLines('lines');
      this.setTargetToLine(1, 4);
      this.getListTimeCalendar(this.text);
    }

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  ngAfterViewInit(): void {
    this.gridViewSetupTarget = firstValueFrom(
      this.cache.gridViewSetup('CMTargets', 'grvCMTargets')
    );
    this.gridViewSetupTargetLine = firstValueFrom(
      this.cache.gridViewSetup('CMTargetsLines', 'grvCMTargetsLines')
    );
    this.changedetectorRef.detectChanges();
  }

  //#region  save
  beforeSave(op) {
    var data = [];

    if (this.action === 'add') {
      op.method = 'AddTargetAndTargetLineAsync';
    } else {
      op.method = 'UpdateTargetAndTargetLineAsync';
    }
    op.className = 'TargetsLinesBusiness';
    data = [this.data, this.lstTargetLines];

    op.data = data;
    return true;
  }

  async onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          this.dialog.close([res.save]);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe(async (res) => {
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();

          this.dialog.close(res.update);
        }
      });
  }
  onSave() {
    if (this.action == 'add') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  //#endregion

  //#region value change event
  valueChange(e) {
    if (e?.field == 'allocation') {
      if (this.isAllocation !== e?.data) {
        this.isAllocation = e?.data;
        this.data.allocation = this.isAllocation ? '1' : '0';
        if (this.isAllocation) {
          this.setTargetToLine(1, 4);
        }
        this.getListTimeCalendar(this.text);
      }
    } else {
      if (this.data[e?.field] != e?.data) {
        this.data[e?.field] = e?.data;
        if (e?.field == 'businessLineID' && e?.data?.trim() != '') {
          this.getTargetAndLinesAsync(this.data.businessLineID);
        }
      }
    }
    this.changedetectorRef.detectChanges();
  }

  valueChangeTarget(e, type) {
    if (this.typeChange === type) {
      switch (e?.field) {
        case 'target':
          if (this.data.target !== e.data) {
            this.data.target = e?.data;
            this.setQuartersByTargetOrLines('target');
            this.getListTimeCalendar(this.text);
          }
          break;
        default:
          if (this[e?.field] !== e.data) {
            if (e?.data <= 0) {
              this.sumTargetAll(0, this[e?.field]);
              this[e?.field] = 0;
            } else {
              this.sumTargetAll(e?.data, this[e?.field]);
              this[e?.field] = e?.data;
            }
            var count: number =
              e?.field == 'quarter1'
                ? 1
                : e?.field == 'quarter2'
                ? 2
                : e?.field == 'quarter3'
                ? 3
                : 4;
            this.setTargetToLine(count, count, e?.field);
          }

          break;
      }
    } else {
      this.typeChange = 'input';
    }
    this.changedetectorRef.detectChanges();
  }

  sumTargetAll(targetQuarter: number = 0, quaterOld: number = 0) {
    var target = 0;
    if (quaterOld == 0) {
      target = this.data.target + targetQuarter;
    } else {
      target = this.data.target - quaterOld + targetQuarter;
    }
    this.data.target = target > 0 ? Math.round(target) : 0;
  }

  //#endregion

  //#region TargetLine
  openPopup() {
    this.isPopup = !this.isPopup;
  }
  eventApply(e) {
    var id = '';
    id = this.data?.owner;
    if (id != null && id?.trim() != '') {
      e?.dataSelected?.forEach((user) => {
        if (!id.split(';').includes(user?.UserID)) {
          var tmp = {};
          tmp['recID'] = Util.uid();
          tmp['userID'] = user?.UserID;
          tmp['userName'] = user?.UserName;
          tmp['positionName'] = user?.PositionName;
          tmp['quarters'] = [];
          tmp['target'] = 0;
          id = id + ';' + user?.UserID;
          this.lstOwners.push(Object.assign({}, tmp));
        }
      });
    } else {
      e?.dataSelected?.forEach((user) => {
        var tmp = {};
        tmp['recID'] = Util.uid();
        tmp['userID'] = user?.UserID;
        tmp['userName'] = user?.UserName;
        tmp['positionName'] = user?.PositionName;
        tmp['quarters'] = [];
        tmp['target'] = 0;
        id =
          id != null && id?.trim() != ''
            ? id + ';' + user?.UserID
            : user?.UserID;
        this.lstOwners.push(Object.assign({}, tmp));
      });
    }
    this.data.owner = id;
    this.setQuarterInOwner();
    this.setListTargetLine();
    this.setTargetToLine(1, 4);
    this.getListTimeCalendar(this.text);

    this.changedetectorRef.detectChanges();
  }

  setQuarterInOwner() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      for (var item of this.lstOwners) {
        var lst = [];
        this.lstQuarters.forEach((element) => {
          if (!item.quarters?.some((x) => x.userID == item.userID)) {
            var tmp = {};
            tmp['id'] = parseInt(element?.id);
            tmp['text'] = element?.text;
            tmp['userID'] = item.userID;
            tmp['target'] = 0;
            lst.push(Object.assign({}, tmp));
          }
        });
        item.quarters = lst;
      }
    }
  }

  setTargetToLine(
    countFirst: number,
    countLast: number = 4,
    field: string = ''
  ) {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      var lstQuarInOwners = this.lstOwners.map((x) => x.quarters);
      for (let i = countFirst; i <= countLast; i++) {
        var lstQuarters = [];
        if (lstQuarInOwners != null && lstQuarInOwners.length > 0) {
          for (var ind of lstQuarInOwners) {
            var index = ind?.findIndex((x) => x.id === i);
            if (index != -1) {
              lstQuarters.push(Object.assign({}, ind[index]));
            }
          }
        }
        if (lstQuarters != null && lstQuarters.length > 0) {
          let target = Math.floor(this[`quarter${i}`] / this.lstOwners.length);
          let remainder = this[`quarter${i}`] % this.lstOwners.length;
          for (var item of lstQuarters) {
            item.target = target;
            if (remainder > 0 && remainder < this.lstOwners.length) {
              var j = remainder / remainder;
              if (j > 0) {
                item.target += j;
                remainder = remainder - j;
              }
            }
          }
          for (var ow of this.lstOwners) {
            if (ow?.quarters != null && ow?.quarters.length > 0) {
              ow?.quarters.forEach((element) => {
                if (element?.id === i) {
                  var indexQua = lstQuarters.findIndex(
                    (x) => x.id === element?.id && x.userID === element?.userID
                  );
                  if (indexQua != -1) {
                    element.target = lstQuarters[indexQua]?.target;
                  }
                }
              });
            }
          }
        }
      }
      for (var ow of this.lstOwners) {
        var target = 0;
        if (ow?.quarters != null && ow?.quarters.length > 0) {
          ow?.quarters.forEach((element) => {
            var targetLine = Math.floor(element.target / 3);
            var remainderLine = element.target % 3;

            if (field == '') {
              if (element?.id == 1) {
                this.setLine(element?.userID, 1, 3, targetLine, remainderLine);
              } else if (element?.id == 2) {
                this.setLine(element?.userID, 4, 6, targetLine, remainderLine);
              } else if (element?.id == 3) {
                this.setLine(element?.userID, 7, 9, targetLine, remainderLine);
              } else {
                this.setLine(
                  element?.userID,
                  10,
                  12,
                  targetLine,
                  remainderLine
                );
              }
            } else {
              switch (field) {
                case 'quarter1':
                  if (element?.id == 1)
                    this.setLine(
                      element?.userID,
                      1,
                      3,
                      targetLine,
                      remainderLine
                    );

                  break;
                case 'quarter2':
                  if (element?.id == 2)
                    this.setLine(
                      element?.userID,
                      4,
                      6,
                      targetLine,
                      remainderLine
                    );

                  break;
                case 'quarter3':
                  if (element?.id == 3)
                    this.setLine(
                      element?.userID,
                      7,
                      9,
                      targetLine,
                      remainderLine
                    );

                  break;
                case 'quarter4':
                  if (element?.id == 4)
                    this.setLine(
                      element?.userID,
                      10,
                      12,
                      targetLine,
                      remainderLine
                    );

                  break;
              }
            }

            target += element?.target;
          });
        }
        ow.target = target;
      }
    }
  }

  setListTargetLine() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      for (var item of this.lstOwners) {
        for (let j = 1; j <= 12; j++) {
          var line = new CM_TargetsLines();
          line.recID = Util.uid();
          line.salespersonID = item?.userID;
          line.transID = this.data?.recID;
          line.period = this.data?.period;
          //Thời gian console.log ra đúng nhưng lưu db sai, tạm thời để như vậy. Hiện tại lưu db sai muốn đúng cộng 1 ngày cho startDate
          var month = j - 1;
          var daysInMonth = this.getTotalDaysInMonth(month, this.data.year);
          var startDate = new Date(this.startDate);
          var endDate = new Date(this.startDate);
          startDate.setMonth(month);
          startDate.setDate(startDate.getDate() + 1); //Như này lưu startDate trong mongoDb sẽ đúng nhưng hiển thị và console.log sẽ sai
          endDate.setMonth(month);
          endDate.setDate(endDate.getDate() + daysInMonth);
          line.target = 0;
          line.startDate = startDate;
          line.endDate = endDate;
          line.createdOn = new Date(Date.now());
          line.createdBy = this.user?.userID;
          this.lstTargetLines.push(Object.assign({}, line));
          if (j > 12) j = 1;
        }
      }
    }
  }

  setLine(
    userID: string,
    i = 1,
    index: number = 12,
    targetLine: number,
    remainderLine: number
  ) {
    for (let j = i; j <= index; j++) {
      var indexLine = this.lstTargetLines?.findIndex(
        (x) =>
          x.salespersonID === userID &&
          new Date(x.startDate)?.getMonth() + 1 === j
      );
      if (indexLine != -1) {
        this.lstTargetLines[indexLine].target = targetLine;
        if (remainderLine > 0 && remainderLine < 4) {
          var li = remainderLine / remainderLine;
          if (li > 0) {
            this.lstTargetLines[indexLine].target += li;
            remainderLine = remainderLine - li;
          }
        }
      }
    }
  }

  setQuartersByTargetOrLines(type) {
    if (type === 'target') {
      const quarterValue = Math.floor(this.data.target / 4);
      let remainder = this.data.target % 4;
      for (let i = 0; i < 4; i++) {
        this[`quarter${i + 1}`] = quarterValue;
        if (remainder > 0 && remainder < 4) {
          var j = remainder / remainder;
          if (j > 0) {
            this[`quarter${i + 1}`] += j;
            remainder = remainder - j;
          }
        }
      }
      this.setTargetToLine(1, 4);
    } else {
      if (this.lstTargetLines != null && this.lstTargetLines.length > 0) {
        const quarterlyTotals = [0, 0, 0, 0]; // Tạo một mảng để lưu tổng từng quý

        for (let item of this.lstTargetLines) {
          let month = new Date(item?.startDate)?.getMonth() + 1;
          let quarterIndex = Math.ceil(month / 3) - 1; // Tính chỉ số quý tương ứng

          quarterlyTotals[quarterIndex] += item.target;
        }

        for (let i = 0; i < quarterlyTotals.length; i++) {
          this[`quarter${i + 1}`] = Math.round(quarterlyTotals[i]);
        }
      }
    }
  }

  getTotalDaysInMonth(month, year) {
    if (month === 1) {
      // Tháng 2
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        return 29; // Năm nhuận, tháng 2 có 29 ngày
      } else {
        return 28; // Năm không nhuận, tháng 2 có 28 ngày
      }
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      return 30; // Các tháng có 30 ngày
    } else {
      return 31; // Các tháng có 31 ngày
    }
  }

  targetToFixed(data) {
    return data ? this.decimalPipe.transform(data, '1.0-0') : 0;
  }

  //#endregion

  //#region get target and targetLine

  getTargetAndLinesAsync(businessLineID) {
    this.cmSv.getTargetAndLinesAsync(businessLineID).subscribe((res) => {
      if (res != null) {
        this.data = res[0];
        if (this.data != null) {
          this.isAllocation = this.data?.allocation == '1' ? true : false;
          this.isExitTarget = true;
          this.selectedType = this.getFormatCalendar(this.data?.category);
          this.isBusiness = true;
        }
        this.lstOwners = res[2];
        if (this.lstOwners != null && this.lstOwners.length > 0) {
          this.lstOwners.forEach((owner) => {});
        }

        this.lstOwnersOld = JSON.parse(JSON.stringify(this.lstOwners));
        this.lstTargetLines = res[1];
        this.typeChange = 'noInput';
        // this.setTargetToLine();
        this.setQuarterInOwner();
        this.setQuartersByTargetOrLines('lines');
        this.setTargetToLine(1, 4);
        this.getListTimeCalendar(this.text);
      } else {
        this.lstTargetLines = [];
        let businessLine = this.data?.businessLineID;
        let year = this.data?.year;
        this.data = JSON.parse(JSON.stringify(this.dataOld));
        this.data.businessLineID = businessLine;
        this.data.owner = null;
        this.data.year = year;
        this.data.category = '1';
        this.isPeriod = false;
        this.quarter1 = 0;
        this.quarter2 = 0;
        this.quarter3 = 0;
        this.quarter4 = 0;
        this.data.currencyID = 'VND';
        this.lstTime.forEach((x) => (x.lines = []));
        this.lstOwners = [];
      }
    });
  }
  getFormatCalendar(trainFrom: string) {
    let resultDate = '';
    if (trainFrom) {
      resultDate = trainFrom == '1' ? 'y' : trainFrom == '2' ? 'q' : 'm';
      return resultDate;
    } else return 'y';
  }
  //#endregion

  //#region calendar
  changeCalendar(e) {
    this.isPeriod = false;
    this.startDate = new Date(e?.fromDate);
    this.endDate = new Date(e?.toDate);
    var month = parseInt(this.startDate?.getMonth() + 1);
    this.month = month;
    var year = parseInt(this.startDate.getFullYear());
    this.data.category = '1'; //năm
    this.data.period = year;
    this.data.year = year;
    this.text = e?.text;
    this.getListTimeCalendar(e?.text);
    this.changedetectorRef.detectChanges();
  }

  setPeriod(month = 0) {
    var period = 0;
    if (month > 0 && month <= 3) {
      period = 1;
    } else if (month > 3 && month <= 6) {
      period = 2;
    } else if (month > 6 && month <= 9) {
      period = 3;
    } else {
      period = 4;
    }
    return period;
  }

  getListTimeCalendar(text) {
    var lst = [];
    var year = this.data?.year;
    var tmp = {};

    for (var idex = 1; idex <= 12; idex++) {
      var month = idex;
      var time = month + '/' + year;
      tmp['text'] = time.toString();
      tmp['lines'] = this.lstTargetLines?.filter(
        (x) => new Date(x.startDate)?.getMonth() + 1 == month
      );
      lst.push(Object.assign({}, tmp));
    }
    this.lstTime = lst;
  }
  //#endregion

  //#region dblick Edit targetLine
  onOutsideClick() {
    this.editingItem = null;
  }

  dbClick(data) {
    this.editingItem = data;
    this.changedetectorRef.detectChanges();
  }

  isEditing(item: any, isAllo: boolean): boolean {
    this.isEditLine = this.editingItem === item;
    return this.editingItem === item;
  }

  updateTarget(e, id, isAllo) {
    var valid = /\D/;
    var index = -1;
    var indexTime = -1;
    var month = 0;
    index = this.lstTargetLines?.findIndex((x) => x.recID == id);

    indexTime = this.lstTime?.findIndex((x) =>
      x.lines?.some((y) => y.recID == id)
    );
    var i = 0;
    var targetOld = 0;
    if (parseFloat(e) < 0) {
      // this.lstOwners = JSON.parse(JSON.stringify(this.lstOwners));
      // this.lstTime = JSON.parse(JSON.stringify(this.lstTime));
      this.editingItem = null;
      this.typeChange = 'input';

      return;
    }

    let target = parseFloat(e?.trim());
    if (index != -1) {
      if (this.lstTargetLines[index].target !== target) {
        var indexOwner = this.lstOwners?.findIndex(
          (x) => x.userID === this.lstTargetLines[index].salespersonID
        );

        if (this.lstTargetLines[index].target < target) {
          i = target - this.lstTargetLines[index].target;
          this.data.target = this.data.target + i;
          if (indexOwner != -1) {
            this.lstOwners[indexOwner].target =
              this.lstOwners[indexOwner]?.target + i;

            for (var item of this.lstOwners[indexOwner]?.quarters) {
              var start =
                new Date(this.lstTargetLines[index].startDate)?.getMonth() + 1;
              let count =
                start >= 1 && start < 4
                  ? 1
                  : start >= 4 && start < 7
                  ? 2
                  : start >= 7 && start < 10
                  ? 3
                  : 4;

              if (count === item.id) {
                item.target = item.target + i;
              }
            }
          }
        } else {
          i = this.lstTargetLines[index].target - target;
          this.data.target -= i;
          if (indexOwner != -1) {
            this.lstOwners[indexOwner].target =
              this.lstOwners[indexOwner]?.target - i;
            for (var item of this.lstOwners[indexOwner]?.quarters) {
              var start =
                new Date(this.lstTargetLines[index].startDate)?.getMonth() + 1;
              let count =
                start >= 1 && start < 4
                  ? 1
                  : start >= 4 && start < 7
                  ? 2
                  : start >= 7 && start < 10
                  ? 3
                  : 4;
              if (count === item.id) {
                item.target = item.target - i;
              }
            }
          }
        }
        this.lstTargetLines[index].target = target;
        if (indexTime != -1) {
          this.lstTime[indexTime]?.lines.forEach((element) => {
            if (element?.recID == id) {
              element.target = target;
            }
          });
        }

        this.isExitTarget = true;
        this.setQuartersByTargetOrLines('lines');
        // this.setTargetToLine();
      }
      this.editingItem = null;
      if (this.isAllocation) {
        this.isAllocation = false;
        this.data.allocation = '0';
      }
    }
    this.changedetectorRef.detectChanges();
  }
  //#endregion
}
