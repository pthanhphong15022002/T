import {
  ChangeDetectorRef,
  Component,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxDropdownCalendarComponent,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CM_Targets, CM_TargetsLines } from '../../models/cm_model';
import { firstValueFrom, map } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-target',
  templateUrl: './popup-add-target.component.html',
  styleUrls: ['./popup-add-target.component.scss'],
  providers: [DecimalPipe],
})
export class PopupAddTargetComponent {
  @ViewChild('dropCalendar') dropCalendar;
  @ViewChild('codxInput') codxInput: any;
  dialog: any;
  data: CM_Targets;
  action = '';
  headerText = '';
  targetLine: CM_TargetsLines;
  lstTargetLines: CM_TargetsLines[] = [];
  lstTargetLinesDelete: CM_TargetsLines[] = [];
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
  count = 0;
  currencyID: any;
  exchangeRate: number;
  businessLineID: any;
  exchangeRateSys: number;
  currencyIDSys: any;
  isCheckSave = false;
  isView: boolean = false;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private changedetectorRef: ChangeDetectorRef,
    private authstore: AuthStore,
    private decimalPipe: DecimalPipe,
    private cmSv: CodxCmService,
    private callFc: CallFuncService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.action = data?.data?.action;
    this.headerText = data?.data?.title;
    this.currencyIDSys = data?.data?.currencyID;
    this.exchangeRateSys = data?.data?.exchangeRate;
    this.gridViewSetupTarget = data?.data?.gridViewSetupTarget;
    this.user = this.authstore.get();
    this.isView = data?.data?.isView ?? false;
    if (this.action == 'edit') {
      this.lstOwners = data?.data?.lstOwners;
      this.lstOwnersOld = JSON.parse(JSON.stringify(this.lstOwners));
      this.lstTargetLines = data?.data?.lstTargetLines;
      this.currencyID = this.data.currencyID;
      this.exchangeRate = this.data.exchangeRate;
      if (this.exchangeRate <= 0) {
        this.currencyID = 'VND';
        this.exchangeRate = 1;
      }
    } else {
      this.currencyID = this.currencyIDSys;
      this.data.currencyID = this.currencyID;
      this.exchangeRate = this.exchangeRateSys;
      this.data.exchangeRate = this.exchangeRate;
      this.data.status = '1';
      this.data.year = data?.data?.year;
      this.data.period = data?.data?.year;
    }
    let date = new Date().setFullYear(this.data.year);
    this.date = new Date(date);
  }

  async ngOnInit() {
    this.isAllocation = this.data?.allocation == '1' ? true : false;
    if (this.action == 'add') {
      this.dataOld = JSON.parse(JSON.stringify(this.data));
    } else {
      this.lstOwners.forEach((element) => {
        if (this.data.target > 0) {
          element.weight = (element.target * 100) / this.data.target;
        }
      });

      this.exchangeRate = this.data.exchangeRate ?? 0;
    }

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  async ngAfterViewInit() {
    this.businessLineID = this.data?.businessLineID;
    // this.date = date;
    // this.gridViewSetupTarget = await firstValueFrom(
    //   this.cache.gridViewSetup('CMTargets', 'grvCMTargets')
    // );

    this.gridViewSetupTargetLine = await firstValueFrom(
      this.cache.gridViewSetup('CMTargetsLines', 'grvCMTargetsLines')
    );
    this.changedetectorRef.detectChanges();
  }

  //#region
  async exChangeRate(currencyIDOld, currencyID) {
    if (currencyIDOld !== currencyID) {
      let day = this.data.createdOn ?? new Date();

      let exchangeRate = await firstValueFrom(
        this.cmSv.getExchangeRate(currencyID, day)
      );

      if (exchangeRate?.exchRate > 0) {
        this.data.target =
          (this.data.target / exchangeRate?.exchRate) * this.exchangeRate;
        this.lstOwners.forEach((element) => {
          element.target =
            (element.target / exchangeRate?.exchRate) * this.exchangeRate;
        });
        this.lstTargetLines?.forEach((res) => {
          res.target =
            (res.target / exchangeRate?.exchRate) * this.exchangeRate;
          res.currencyID = currencyID;
          res.exchangeRate = exchangeRate.exchRate;
        });
      }
      if (exchangeRate?.exchRate > 0) {
        this.exchangeRate = exchangeRate?.exchRate;
      } else {
        exchangeRate.exchRate = this.exchangeRate;
        currencyID = this.currencyID;
      }
      this.currencyID = currencyID;
      this.exchangeRate = exchangeRate.exchRate;
      this.data.currencyID = this.currencyID;
      this.data.exchangeRate = this.exchangeRate;
    }
  }

  convertDateCalendar(date) {
    return new Date(date);
  }
  //#endregion

  //#region  save
  beforeSave(op) {
    var data = [];
    this.data.exchangeRate = this.exchangeRate ?? 0;
    if (this.action === 'add') {
      op.method = 'AddTargetAndTargetLineAsync';
      data = [
        this.data,
        this.lstTargetLines,
        this.currencyIDSys,
        this.exchangeRateSys,
      ];
    } else {
      op.method = 'UpdateTargetAndTargetLineAsync';
      data = [
        this.data,
        this.lstTargetLines,
        this.lstTargetLinesDelete,
        this.currencyIDSys,
        this.exchangeRateSys,
      ];
    }
    op.className = 'TargetsBusiness';

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
        this.isCheckSave = false;
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

          this.dialog.close([res.update]);
        }
        this.isCheckSave = false;
      });
  }
  onSave() {
    this.isCheckSave = true;
    if (this.action == 'add') this.data.businessLineID = this.businessLineID;

    if (
      this.data?.businessLineID == null ||
      this.data?.businessLineID?.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetupTarget?.BusinessLineID?.headerText + '"'
      );
      this.isCheckSave = false;

      return;
    }

    if (!this.checkTarget()) {
      this.notiService.notifyCode('CM032');
      this.isCheckSave = false;
      return;
    }

    if (this.action == 'add') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  checkTarget() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      var target = 0;
      this.lstOwners.forEach((res) => {
        target += res.target;
      });

      if (Math.round(target) != Math.round(this.data.target)) {
        return false;
      }
    }
    return true;
  }
  //#endregion

  //#region value change event
  valueChange(e) {
    if (e?.field == 'businessLineID') {
      if (this.businessLineID != e?.data) {
        this.businessLineID = e?.data;
        if (e?.data?.trim() != '') {
          this.getTargetAndLinesAsync(this.businessLineID, this.data.year);
          this.data.targetName =
            e?.component?.itemsSelected[0]?.BusinessLineName;
        }
      }
    } else {
      if (this.data[e?.field] != e?.data) {
        this.exChangeRate(this.data.currencyID, e?.data);
      }
    }

    this.changedetectorRef.detectChanges();
  }

  valueChangeTarget(e, type) {
    switch (e?.field) {
      case 'target':
        this.data.target = e?.data;
        this.setTargetOwner();
        this.setListTargetLine();
        // this.setQuartersByTargetOrLines('target');
        // this.getListTimeCalendar(this.text);
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
  openPopup(share) {
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callFc.openForm(share, '', 420, 600, null, null, null, option);
  }
  eventApply(e) {
    var id = '';
    let lstUsers = [];
    let lstUserIDs = '';
    let lstDepartmentIDs = '';
    let lstPositionIDs = '';
    let lstRoleIDs = '';
    if (!e || e?.length == 0) return;
    e.forEach((obj) => {
      if (obj.objectType && obj.id) {
        switch (obj.objectType) {
          case '1':
          case 'U':
            lstUserIDs =
              lstUserIDs.trim() != '' ? lstUserIDs + ';' + obj.id : obj.id;
            break;
          case 'O':
          case 'D':
            lstDepartmentIDs =
              lstDepartmentIDs.trim() != ''
                ? lstDepartmentIDs + ';' + obj.id
                : obj.id;
            break;
          case 'P':
            lstPositionIDs =
              lstPositionIDs.trim() != ''
                ? lstPositionIDs + ';' + obj.id
                : obj.id;
            break;
          case 'R':
            lstRoleIDs =
              lstRoleIDs.trim() != '' ? lstRoleIDs + ';' + obj.id : obj.id;
            break;
        }
      }
    });

    if (lstUserIDs != null && lstUserIDs.trim() != '') {
      this.setListUsers(lstUserIDs);
    }

    if (lstDepartmentIDs != null && lstDepartmentIDs.trim() != '') {
      this.cmSv.getUserByListDepartmentID(lstDepartmentIDs).subscribe((res) => {
        if (res && res.trim() != '') {
          this.setListUsers(res);
        }
      });
    }

    if (lstPositionIDs != null && lstPositionIDs.trim() != '') {
      this.cmSv
        .getListUserIDByListPositionsID(lstPositionIDs)
        .subscribe((res) => {
          if (res && res[0] && res[0]?.trim() != '') {
            this.setListUsers(res[0]);
          }
        });
    }

    if (lstRoleIDs != null && lstRoleIDs.trim() != '') {
      this.cmSv.getListUserByRoleID(lstRoleIDs.split(';')).subscribe((res) => {
        if (res && res.length > 0) {
          let lstIDs = res.map((x) => x.userID)?.join(';');
          this.setListUsers(lstIDs);
        }
      });
    }

    this.changedetectorRef.detectChanges();
  }

  setListUsers(lstIDs) {
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness_Old',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(lstIDs.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          let id = this.data.salespersonID;
          let lstUsers = res;
          if (id != null && id?.trim() != '') {
            lstUsers?.forEach((user) => {
              if (!id.split(';').includes(user?.userID)) {
                var tmp = {};
                tmp['recID'] = Util.uid();
                tmp['userID'] = user?.userID;
                tmp['userName'] = user?.userName;
                tmp['positionName'] = user?.positionName;
                tmp['isExit'] = false;
                tmp['quarters'] = [];
                tmp['target'] = 0;
                tmp['weight'] = 0;

                id = id + ';' + user?.userID;
                this.lstOwners.push(Object.assign({}, tmp));
              }
            });
            this.setTargetOwner('target');
          } else {
            lstUsers?.forEach((user) => {
              var tmp = {};
              tmp['recID'] = Util.uid();
              tmp['userID'] = user?.userID;
              tmp['userName'] = user?.userName;
              tmp['positionName'] = user?.positionName;
              tmp['isExit'] = false;
              tmp['quarters'] = [];
              tmp['target'] = 0;
              tmp['weight'] = 0;
              id =
                id != null && id?.trim() != ''
                  ? id + ';' + user?.userID
                  : user?.userID;
              this.lstOwners.push(Object.assign({}, tmp));
            });
            this.setTargetOwner('user');
          }
          this.data.salespersonID = id;
        }

        this.countClick = 0;
        // this.setQuarterInOwner();
        // this.setTargetToLine(1, 4);
        // this.getListTimeCalendar(this.text);
        this.setListTargetLine();
      });
  }

  setTargetOwner(type = 'target') {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      var weightExit = 0;
      this.lstOwners.forEach((res) => {
        if (res.isExit) weightExit += res.weight;
      });
      for (var item of this.lstOwners) {
        if (!item.isExit) {
          if (type == 'user') {
            item.weight = 100 / this.lstOwners.length;
          } else {
            let all = this.lstOwners.filter((x) => !x.isExit).length;
            if (all > 0) {
              item.weight = (100 - weightExit) / all;
            }
          }
        }
        item.target = (this.data.target * item.weight) / 100;
      }
    }
  }

  setQuarterInOwner() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      for (var item of this.lstOwners.filter((x) => x.isExit == false)) {
        var lst = [];
        if (!item.quarters?.some((x) => x.userID == item.userID)) {
          this.lstQuarters.forEach((element) => {
            var tmp = {};
            tmp['id'] = parseInt(element?.id);
            tmp['text'] = element?.text;
            tmp['userID'] = item.userID;
            tmp['target'] = 0;
            lst.push(Object.assign({}, tmp));
          });
          item.quarters = lst;
        }
      }
    }
  }

  setTargetToLine(
    countFirst: number,
    countLast: number = 4,
    field: string = ''
  ) {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      var lstQuarInOwners = this.lstOwners
        .filter((x) => x.isExit == false)
        .map((x) => x.quarters);
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
          let target = Math.floor(
            this[`quarter${i}`] /
              this.lstOwners.filter((x) => x.isExit == false).length
          );
          let remainder =
            this[`quarter${i}`] %
            this.lstOwners.filter((x) => x.isExit == false).length;
          for (var item of lstQuarters) {
            item.target = target;
            if (
              remainder > 0 &&
              remainder < this.lstOwners.filter((x) => x.isExit == false).length
            ) {
              var j = remainder / remainder;
              if (j > 0) {
                item.target += j;
                remainder = remainder - j;
              }
            }
          }
          for (var ow of this.lstOwners.filter((x) => x.isExit == false)) {
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
      for (var ow of this.lstOwners.filter((x) => x.isExit == false)) {
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
          var index = this.lstTargetLines.findIndex(
            (x) =>
              x.salespersonID == item.userID &&
              new Date(x.startDate)?.getMonth() + 1 == j
          );
          if (index == -1) {
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
            line.target = item.target / 12;
            line.startDate = startDate;
            line.endDate = endDate;
            line.isExit = false;
            line.createdOn = new Date(Date.now());
            line.createdBy = this.user?.userID;
            this.lstTargetLines.push(Object.assign({}, line));
            if (j > 12) j = 1;
          } else {
            this.lstTargetLines[index].target = item.target / 12;
          }
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
        if (this.lstTargetLines[indexLine].isExit == false) {
          this.lstTargetLines[indexLine].target = targetLine;
          if (remainderLine > 0 && remainderLine < 4) {
            var li = remainderLine / remainderLine;
            if (li > 0) {
              this.lstTargetLines[indexLine].target += li;
              remainderLine = remainderLine - li;
            }
          }
        } else {
          this.lstTargetLines[indexLine].target = 0;
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

  formatNumberWithoutTrailingZeros(num) {
    if (num % 1 === 0) {
      return num.toString();
    } else {
      return num.toFixed(2);
    }
  }

  sumTarget() {
    let target = 0;
    this.lstOwners.forEach((res) => (target += res.target));
    return this.targetToFixed(target);
  }

  sumWeight() {
    let weight = 0;
    this.lstOwners.forEach((res) => (weight += res.weight));
    return this.targetToFixed(weight);
  }
  //#endregion

  //#region get target and targetLine

  getTargetAndLinesAsync(businessLineID, year) {
    this.cmSv
      .getTargetAndLinesAsync(businessLineID, year)
      .subscribe(async (res) => {
        if (res != null) {
          this.data = res[0];
          if (this.data != null) {
            this.isAllocation = this.data?.allocation == '1' ? true : false;
            this.isExitTarget = true;
            this.isBusiness = true;
            this.currencyID = this.data.currencyID;
            this.exchangeRate = this.data.exchangeRate;
          }
          this.lstOwners = res[2] ?? [];
          this.lstOwners.forEach((element) => {
            if (this.data.target > 0) {
              element.weight = (element.target * 100) / this.data.target;
            }
          });
          this.lstOwnersOld = JSON.parse(JSON.stringify(this.lstOwners));
          this.lstTargetLines = res[1] ?? [];
        } else {
          if (this.isExitTarget) {
            this.lstTargetLines = [];
            let businessLine = this.data?.businessLineID;
            let targetName = this.data.targetName;
            let year = this.data?.year;
            this.data = JSON.parse(JSON.stringify(this.dataOld));
            this.data.businessLineID = businessLine;
            this.data.salespersonID = null;
            this.data.year = year;
            this.data.category = '1';
            this.data.targetName = targetName;
            this.isPeriod = false;
            this.quarter1 = 0;
            this.quarter2 = 0;
            this.quarter3 = 0;
            this.quarter4 = 0;
            this.currencyID = this.currencyIDSys;
            this.exchangeRate = this.exchangeRateSys;
            this.data.currencyID = this.currencyIDSys;
            this.lstTime.forEach((x) => (x.lines = []));
            this.lstOwners = [];
            this.isExitTarget = false;
          }
        }
        this.changedetectorRef.detectChanges();
      });
  }
  getFormatCalendar(trainFrom: string) {
    let resultDate = '';
    if (trainFrom) {
      resultDate = trainFrom == '1' ? 'y' : trainFrom == '2' ? 'q' : 'm';
      return resultDate;
    } else return 'y';
  }

  setSumTargetQuarterByEdit() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      for (var item of this.lstOwners) {
        var targetUsers = this.lstTargetLines?.filter(
          (x) => x.salespersonID == item?.userID
        );
        for (var qua of item?.quarters) {
          var target = 0;
          for (var line of targetUsers) {
            var month = new Date(line?.startDate)?.getMonth() + 1;
            if (qua?.id === 1) {
              if (month >= 1 && month < 4) {
                target += line.target;
              }
            } else if (qua?.id === 2) {
              if (month >= 4 && month < 7) {
                target += line.target;
              }
            } else if (qua?.id === 3) {
              if (month >= 7 && month < 10) {
                target += line.target;
              }
            } else {
              if (month >= 10 && month <= 12) {
                target += line.target;
              }
            }
          }
          qua.target = target;
        }
      }
    }
  }
  //#endregion

  //#region calendar
  changeCalendar(e) {
    this.isPeriod = false;
    if (e?.fromDate) {
      this.startDate = new Date(e?.fromDate);
      this.endDate = new Date(e?.toDate);
      var month = parseInt(this.startDate?.getMonth() + 1);
      this.month = month;
      var year = parseInt(this.startDate.getFullYear());
      this.data.category = '1'; //năm
      this.data.period = year;
      this.data.year = year;
      this.text = e?.text;
      if (this.businessLineID != null) {
        this.getTargetAndLinesAsync(this.businessLineID, this.data.year);
      }
    } else {
      this.lstTargetLines = [];
      this.data = new CM_Targets();
      this.data.category = '1';
      this.isPeriod = false;
      this.businessLineID = '';
      this.codxInput.crrValue = this.businessLineID;
      this.codxInput.value = this.businessLineID;
      this.data.currencyID = this.currencyID;
      this.lstTime.forEach((x) => (x.lines = []));
      this.lstOwners = [];
      this.isExitTarget = false;
    }
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
        (x) =>
          new Date(x.startDate)?.getMonth() + 1 == month && x.isExit == false
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

  countClick = 0;
  dbClick(data, type) {
    if (!this.isView) {
      if (type == 'target') {
        if (this.data.target == 0) {
          this.notiService.notifyCode('CM033');
          return;
        }
      }
      if (this.countClick == 0) {
        if (this.lstOwners != null && this.lstOwners.length > 1) {
          this.editingItem = data;
          this.typeChange = type;
          this.countClick = 0;
        } else {
          this.countClick += 1;
          this.notiService.notifyCode('CM034');
          return;
        }
      }
    }

    this.changedetectorRef.detectChanges();
  }

  isEditing(item: any, isAllo: boolean): boolean {
    this.isEditLine = this.editingItem === item;
    return this.editingItem === item;
  }

  updateTarget(e, id, type) {
    var index = -1;
    var indexTime = -1;
    var i = 0;
    if (parseFloat(e) < 0) {
      // this.lstOwners = JSON.parse(JSON.stringify(this.lstOwners));
      // this.lstTime = JSON.parse(JSON.stringify(this.lstTime));
      this.editingItem = null;
      this.typeChange = '';
      return;
    }
    let target = parseFloat(e?.trim());

    index = this.lstOwners.findIndex((x) => x.userID == id);
    if (index != -1) {
      if (type == 'weight') {
        if (parseFloat(this.lstOwners[index].weight.toFixed(2)) != target) {
          if (this.checkWeight(id, target, 100, 'weight')) {
            this.editingItem = null;
            this.typeChange = '';
            this.notiService.notifyCode('CM035');
            return;
          }

          this.lstOwners[index].weight = target;
          this.lstOwners[index].target = (this.data.target * target) / 100;
          this.lstOwners[index].isExit = true;
          var weigth = 0;
          let count = 0;
          this.lstOwners.forEach((ele) => {
            if (ele.isExit) {
              weigth += ele.weight;
            } else {
              count++;
            }
          });

          this.lstOwners.forEach((res) => {
            if (res.userID != id && !res.isExit) {
              if (count > 0) {
                res.weight = (100 - weigth) / count;
                res.target = (res.weight * this.data.target) / 100;
              } else {
                res.weight = 0;
                res.target = 0;
              }
            }
          });
          if (this.data.target > 0) {
            this.setListTargetLine();
          }
        }
      } else {
        if (this.lstOwners[index].target != target) {
          if (this.checkWeight(id, target, this.data.target, 'target')) {
            this.editingItem = null;
            this.typeChange = '';
            this.notiService.notifyCode('CM035');
            return;
          }
          this.lstOwners[index].target = target;
          this.lstOwners[index].isExit = true;
          this.lstOwners[index].weight = (target * 100) / this.data.target;

          let targetExSum = 0;
          let countEx = 0;
          this.lstOwners.forEach((ele) => {
            if (ele.isExit) {
              targetExSum += ele.target;
            } else {
              countEx++;
            }
          });

          this.lstOwners.forEach((res) => {
            if (res.userID != id && !res.isExit) {
              if (countEx > 0) {
                res.target = (this.data.target - targetExSum) / countEx;
                res.weight = (res.target * 100) / this.data.target;
              } else {
                res.target = 0;
                res.weight = 0;
              }
            }
          });
          if (this.data.target > 0) {
            this.setListTargetLine();
          }
        }
      }
    }
    this.editingItem = null;
    this.typeChange = '';
    this.changedetectorRef.detectChanges();
  }

  checkWeight(id, weight, main: number, type) {
    let weightExit = 0;
    let isCheck = false;
    if (weight > main) return true;
    for (var item of this.lstOwners) {
      if (item.userID != id && item.isExit) {
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
          this.lstOwners.filter((x) => !x.isExit).length == 1 &&
          this.lstOwners.some((x) => !x.isExit && x.userID == id)
        ) {
          isCheck = weightExit + weight !== main ? true : false;
        }
      }
    }
    return isCheck;
  }

  //#endregion

  //#region remove
  removeUser(item) {
    var index = this.lstOwners.findIndex((x) => x.userID == item?.userID);
    if (index != -1) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x.event && x.event?.status) {
          if (x?.event?.status == 'Y') {
            for (var i = this.lstTargetLines.length - 1; i >= 0; i--) {
              var line = this.lstTargetLines[i];
              if (line.salespersonID === item.userID) {
                this.lstTargetLinesDelete.push(line);
                this.lstTargetLines.splice(i, 1);
              }
            }
            let id = '';
            for (
              var j = 0;
              j < this.data?.salespersonID?.split(';').length;
              j++
            ) {
              let salespersonID = this.data?.salespersonID?.split(';')[j];
              if (salespersonID == item?.userID) {
                this.data?.salespersonID?.split(';').splice(j, 1);
              } else {
                id = id ? id + ';' + salespersonID : salespersonID;
              }
            }
            this.data.salespersonID = id;
            this.lstOwners.forEach((res) => {
              if (res.userID != item?.userID && !res.isExit) {
                res.target +=
                  this.lstOwners[index].target /
                  this.lstOwners.filter(
                    (x) => !x.isExit && item?.userID != x.userID
                  ).length;
                if (this.data.target > 0) {
                  res.weight = (res.target * 100) / this.data.target;
                }
              }
            });

            this.lstOwners.splice(index, 1);
            this.setListTargetLine();
          }
          this.changedetectorRef.detectChanges();
        }
      });
    }
  }
  //#endregion

  clickRefered() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      this.lstOwners.forEach((res) => {
        if (this.data.target > 0) {
          res.target = this.data.target / this.lstOwners.length;
          res.weight = (res.target * 100) / this.data.target;
        } else {
          res.target = 0;
          res.weight = 0;
        }
        res.isExit = false;
      });
      this.setListTargetLine();
    }
  }
}
