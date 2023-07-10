import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CM_Targets, CM_TargetsLines } from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-add-target',
  templateUrl: './popup-add-target.component.html',
  styleUrls: ['./popup-add-target.component.css'],
})
export class PopupAddTargetComponent {
  dialog: any;
  data: CM_Targets;
  action = '';
  headerText = '';
  targetLine: CM_TargetsLines;
  lstTargetLines: CM_TargetsLines[] = [];
  lstOwners = [];
  //calendar - tháng - quý - năm
  date: any = new Date();
  ops = ['m', 'q', 'y'];
  startDate: any;
  endDate: any;
  isPeriod = false;
  isAllocation = false;
  isPopup = false;
  gridViewSetupTarget: any;
  gridViewSetupTargetLine: any;
  user: any;
  intTarget = 1;
  lstTime = [];
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private changedetectorRef: ChangeDetectorRef,
    private authstore: AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.action = data?.data?.action;
    this.headerText = data?.data?.title;
    this.user = this.authstore.get();
  }

  ngOnInit(): void {
    this.isAllocation = this.data?.allocation == '1' ? true : false;
    if (this.action == 'add') this.data.owner = null;
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
  onSave() {}
  //#endregion

  valueChange(e) {
    if (e?.field == 'allocation') {
      this.isAllocation = e?.data;
      this.data.allocation = this.isAllocation ? '1' : '0';
      this.getListTimeCalendar('');
    } else {
      this.data[e?.field] = e?.data;
      if (e?.field == 'target') {
        this.setTargetToLine();
      }
    }
    this.changedetectorRef.detectChanges();
  }

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
    this.changedetectorRef.detectChanges();
    console.log(this.data.owner);
  }

  setTargetToLine() {
    if (this.lstOwners != null && this.lstOwners.length > 0) {
      var target =
        this.data?.target != null
          ? (this.data?.target / this.lstOwners.length).toFixed(2)
          : 0;
      this.lstOwners.every((item) => (item.target = target));
      this.setListTargetLine();
    }
  }

  setListTargetLine() {
    var lstLines = [];
    var intTarget = 1;
    if (this.data?.category == '1') {
      intTarget = 12;
      for (var item of this.lstOwners) {
        lstLines = this.setLine(lstLines, item?.userID, intTarget, 1, 12);
      }
    } else if (this.data?.category == '2') {
      intTarget = 3;

      var i =
        this.data?.interval == 1
          ? 1
          : this.data?.interval == 2
          ? 4
          : this.data?.interval == 3
          ? 7
          : 10;
      var j = i + 2;
      for (var item of this.lstOwners) {
        lstLines = this.setLine(lstLines, item?.userID, intTarget, i, j);
      }
    } else {
      intTarget = 1;
      for (var item of this.lstOwners) {
        lstLines = this.setLine(lstLines, item?.userID, intTarget, 1, 1);
      }
    }
    this.intTarget = intTarget;

    this.lstTargetLines = lstLines;
    console.log('lstTargets: ', this.lstTargetLines);
  }

  setLine(lstLines = [], userID, intTarget = 1, i = 1, index = 12) {
    for (let j = i; j <= index; j++) {
      var line = new CM_TargetsLines();
      line.recID = Util.uid();
      line.salespersonID = userID;
      line.transID = this.data?.recID;
      line.period = this.data?.period;
      line.target = this.data?.target / intTarget;
      line.startDate = new Date(this.startDate?.setMonth(j - 1));
      line.endDate = new Date(this.endDate?.setMonth(j - 1));
      line.createdOn = new Date(Date.now());
      line.createdBy = this.user?.userID;
      lstLines.push(Object.assign({}, line));
      if (j > 12) j = 1;
    }
    return lstLines;
  }

  getTimeDate(data) {
    var inner = '';

    return inner;
  }
  //#endregion

  //#region calendar
  changeCalendar(e) {
    this.startDate = new Date(e?.fromDate);
    this.endDate = new Date(e?.toDate);
    var month = parseInt(this.startDate.getMonth() + 1);
    var year = parseInt(this.startDate.getFullYear());
    if (e?.type == 'year') {
      this.data.category = '1'; //năm
    } else if (e?.type == 'quarter') {
      this.data.category = '2'; // quý
      this.data.interval = this.setPeriod(month);
    } else {
      this.data.category = '3'; // tháng
      this.data.interval = this.setPeriod(month);
      this.data.period = month;
      this.isPeriod = true;
    }
    this.data.year = year;
    this.getListTimeCalendar(e?.text);
    this.setListTargetLine();

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
    var i =
      this.data?.interval == 1
        ? 1
        : this.data?.interval == 2
        ? 4
        : this.data?.interval == 3
        ? 7
        : 10;
    var init =
      this.data?.category == '1' ? 12 : this.data?.category == '2' ? i + 2 : 1;
    var j = this.data?.category == '2' ? i : 1;
    var tmp = {};

    if (this.isAllocation) {
      for (var idex = j; idex <= init; idex++) {
        var month = idex;
        var time = month + '/' + year;
        tmp['text'] = time.toString();
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
}
