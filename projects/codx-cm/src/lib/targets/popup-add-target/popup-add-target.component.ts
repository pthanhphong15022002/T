import {
  ChangeDetectorRef,
  Component,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
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
  styleUrls: ['./popup-add-target.component.css'],
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
    if (this.action == 'add') {
      this.dataOld = JSON.parse(JSON.stringify(this.data));
      this.selectedType = this.getFormatCalendar(null);
      this.data.owner = null;
    } else {
      this.selectedType = this.getFormatCalendar(this.data?.category);
      this.isBusiness = true;
      this.typeChange = 'noInput';
    }
    this.isAllocation = this.data?.allocation == '1' ? true : false;

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

  onSave() {
    this.onAdd();
  }

  //#endregion

  //#region value change event
  valueChange(e) {
    if (e?.field == 'allocation') {
      this.isAllocation = e?.data;
      this.data.allocation = this.isAllocation ? '1' : '0';
      this.getListTimeCalendar(this.text);
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
          if (e.data !== this.data.target) {
            this.data.target = this.convertToFixelNumber(e?.data);
            this.setTargetToLine();
            this.setListTargetLine();
            this.getListTimeCalendar(this.text);
            this.setQuarters();
          }

          break;
        default:
          if (e.data !== this[e?.field]) {
            if (parseInt(e?.data) <= 0) {
              this.sumTargetAll(0, this[e?.field]);
              this[e?.field] = 0;
            } else {
              this.sumTargetAll(e?.data, this[e?.field]);
              this[e?.field] = this.convertToFixelNumber(e?.data);
            }
            this.setTargetToLine();
            this.setTagetByQuarter('noAuto', e?.field);
          }

          break;
      }
    } else {
      this.typeChange = 'input';
    }
    this.changedetectorRef.detectChanges();
  }

  setQuarters() {
    if (this.lstTargetLines != null && this.lstTargetLines.length > 0) {
      for (let i = 1; i <= 4; i++) {
        var total = 0;
        let index = i == 1 ? 1 : i == 2 ? 4 : i == 3 ? 7 : 10;
        for (let j = index; j <= index + 2; j++) {
          for (var item of this.lstTargetLines) {
            let month = item?.startDate.getMonth() + 1;
            if (month == j) {
              total = this.convertToFixelNumber((total += item.target));
            }
          }
        }
        if (i === 1) {
          this.quarter1 = this.convertToFixelNumber(total);
        } else if (i === 2) {
          this.quarter2 = this.convertToFixelNumber(total);
        } else if (i === 3) {
          this.quarter3 = this.convertToFixelNumber(total);
        } else {
          this.quarter4 = this.convertToFixelNumber(total);
        }
      }
    } else {
      this.quarter1 = this.convertToFixelNumber(this.data.target / 4);
      this.quarter2 = this.convertToFixelNumber(this.data.target / 4);
      this.quarter3 = this.convertToFixelNumber(this.data.target / 4);
      this.quarter4 = this.convertToFixelNumber(this.data.target / 4);
      this.setTagetByQuarter();
    }
  }

  sumTargetAll(targetQuarter: number = 0, quaterOld: number = 0) {
    if (quaterOld == 0) {
      this.data.target = this.convertToFixelNumber(
        (this.data.target += targetQuarter)
      );
    } else {
      var target = 0;
      target = this.convertToFixelNumber(
        this.data.target - quaterOld + targetQuarter
      );
      this.data.target = target > 0 ? target : 0;
    }
  }
  //#endregion

  //#region get target and targetLine

  getTargetAndLinesAsync(businessLineID) {
    this.cmSv.getTargetAndLinesAsync(businessLineID).subscribe((res) => {
      if (res != null) {
        this.data = res[0];
        if (this.data != null) {
          this.isAllocation = this.data?.allocation == '1' ? true : false;
          this.selectedType = this.getFormatCalendar(this.data?.category);
          this.isBusiness = true;
        }
        this.lstOwners = res[2];
        this.lstOwnersOld = JSON.parse(JSON.stringify(this.lstOwners));
        this.lstTargetLines = res[1];
        this.typeChange = 'noInput';
        // this.setTargetToLine();
        this.getListTimeCalendar(this.text);
        this.setTagetByQuarter();
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
        tmp['target'] = 0;

        id =
          id != null && id?.trim() != ''
            ? id + ';' + user?.UserID
            : user?.UserID;
        this.lstOwners.push(Object.assign({}, tmp));
      });
    }
    this.data.owner = id;
    this.setTargetToLine();
    this.setListTargetLine();
    this.setTagetByQuarter();
    this.getListTimeCalendar(this.text);
    this.setQuarters();

    this.changedetectorRef.detectChanges();
    console.log(this.data.owner);
  }

  setTargetToLine() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      let target = 0;
      target = this.convertToFixelNumber(
        this.data.target / this.lstOwners.length
      );
      this.lstOwners.every((item) => (item.target = target));
    }
  }

  setListTargetLine() {
    var lstLines = [];
    var intTarget = 12;
    if (this.data?.category == '1') {
      intTarget = 12;
      for (var item of this.lstOwners) {
        lstLines = this.setLine(lstLines, item?.userID, 1, 12, item.target);
      }
    }
    this.intTarget = intTarget;
    this.lstTargetLines = lstLines;
    console.log('lstTargets: ', this.lstTargetLines);
  }

  setLine(lstLines = [], userID, i = 1, index = 12, target) {
    for (let j = i; j <= index; j++) {
      var line = new CM_TargetsLines();
      line.recID = Util.uid();
      line.salespersonID = userID;
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
      line.startDate = startDate;
      line.endDate = endDate;
      line.createdOn = new Date(Date.now());
      line.createdBy = this.user?.userID;
      lstLines.push(Object.assign({}, line));
      if (j > 12) j = 1;
    }
    return lstLines;
  }

  setTagetByQuarter(type: string = 'auto', field = '') {
    if (this.lstTargetLines != null && this.lstTargetLines.length > 0) {
      for (var item of this.lstTargetLines) {
        var startDate = new Date(item.startDate);
        let month = startDate.getMonth() + 1;
        var target = 0;
        if (field === 'quarter1') {
          if (month >= 1 && month < 4) {
            target = Math.round(this.quarter1 / this.lstOwners.length / 3);
            item.target = target > 0 ? target : 0;
          }
        } else if (field === 'quarter2') {
          if (month >= 4 && month < 7) {
            target = Math.round(this.quarter2 / this.lstOwners.length / 3);
            item.target = target > 0 ? target : 0;
          }
        } else if (field === 'quarter3') {
          if (month >= 7 && month < 9) {
            target = Math.round(this.quarter3 / this.lstOwners.length / 3);
            item.target = target > 0 ? target : 0;
          }
        } else {
          if (month >= 10 && month <= 12) {
            target = Math.round(this.quarter4 / this.lstOwners.length / 3);
            item.target = target > 0 ? target : 0;
          }
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

  convertToFixelNumber(target: number) {
    return Math.round(target);
  }
  //#endregion

  //#region calendar
  changeCalendar(e) {
    this.isPeriod = false;
    this.startDate = new Date(e?.fromDate);
    this.endDate = new Date(e?.toDate);
    var month = parseInt(this.startDate.getMonth() + 1);
    this.month = month;
    var year = parseInt(this.startDate.getFullYear());
    this.data.category = '1'; //năm
    this.data.period = year;

    // } else if (e?.type == 'quarter') {
    //   this.data.category = '2'; // quý
    //   this.data.interval = this.setPeriod(month);
    // } else {
    //   this.data.category = '3'; // tháng
    //   this.data.interval = this.setPeriod(month);
    //   this.data.period = month;
    //   this.isPeriod = true;
    // }
    this.data.year = year;
    this.text = e?.text;
    if (this.typeChange != 'noInput') {
      this.setListTargetLine();
    } else {
      this.typeChange = 'input';
    }
    this.getListTimeCalendar(e?.text);

    this.changedetectorRef.detectChanges();

    console.log('year: ', this.data?.year);
    console.log('interval: ', this.data?.interval);
    console.log('period: ', this.data?.period);
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
    // var i =
    //   this.data?.interval == 1
    //     ? 1
    //     : this.data?.interval == 2
    //     ? 4
    //     : this.data?.interval == 3
    //     ? 7
    //     : 10;
    // var init =
    //   this.data?.category == '1'
    //     ? 12
    //     : this.data?.category == '2'
    //     ? i + 2
    //     : this.month;
    // var j =
    //   this.data?.category == '2'
    //     ? i
    //     : this.data?.category == '3'
    //     ? this.month
    //     : 1;
    var tmp = {};

    if (this.isAllocation) {
      for (var idex = 1; idex <= 12; idex++) {
        var month = idex;
        var time = month + '/' + year;
        tmp['text'] = time.toString();
        tmp['lines'] = this.lstTargetLines?.filter(
          (x) => new Date(x.startDate)?.getMonth() + 1 == month
        );
        lst.push(Object.assign({}, tmp));
      }
    } else {
      if (text == null || text?.trim() == '') {
      } else {
        tmp['text'] = text;
      }
      lst.push(Object.assign({}, tmp));
    }
    this.lstTime = lst;
    console.log(this.lstTime);
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
    this.typeChange = 'noInput';
    var valid = /\D/;
    var index = -1;
    var indexTime = -1;
    var month = 0;
    index = isAllo
      ? this.lstTargetLines?.findIndex((x) => x.recID == id)
      : this.lstOwners?.findIndex((x) => x.userID == id);
    indexTime = this.lstTime?.findIndex((x) =>
      x.lines?.some((y) => y.recID == id)
    );
    var i = 0;
    var targetOld = 0;
    if (e?.match(valid) || e == '' || e.trim() == '' || parseInt(e) < 0) {
      this.lstOwners = JSON.parse(JSON.stringify(this.lstOwners));
      this.lstTime = JSON.parse(JSON.stringify(this.lstTime));
      return;
    }

    let target = parseInt(e?.trim());
    if (index != -1) {
      if (isAllo) {
        if (this.lstTargetLines[index].target !== target) {
          if (this.lstTargetLines[index].target < target) {
            i = target - this.lstTargetLines[index].target;
            Math.round((this.data.target += i));
          } else {
            i = this.lstTargetLines[index].target - target;
            Math.round((this.data.target -= i));
          }
          this.lstTargetLines[index].target = target;
          if (indexTime != -1) {
            this.lstTime[indexTime]?.lines.forEach((element) => {
              if (element?.recID == id) {
                element.target = Math.round(target);
              }
            });
          }
          this.setListTargetLine();
          this.setQuarters();
        }
      } else {
        if (this.lstOwners[index].target !== target) {
          if (this.lstOwners[index].target < target) {
            i = target - this.lstOwners[index].target;
            this.data.target = Math.round((this.data.target += i));
          } else {
            i = this.lstOwners[index].target - target;
            this.data.target = Math.round((this.data.target -= i));
          }

          this.lstOwners[index].target = Math.round(target);
          this.lstTargetLines[index].isExit = true;
          this.isExitTarget = true;
          this.setListTargetLine();
          this.setQuarters();
        }
      }
    }
    this.isEditLine = false;
    this.changedetectorRef.detectChanges();
  }
  //#endregion
}
