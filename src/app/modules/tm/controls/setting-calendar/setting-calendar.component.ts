import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarDateModel, CalendarModel, CalendarWeekModel, DaysOffModel } from '@modules/tm/models/calendar.model';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { APICONSTANT } from '@shared/constant/api-const';
import { ApiHttpService, CacheService } from 'codx-core';
import * as $ from 'jquery';
import 'lodash';
declare var _;

@Component({
  selector: 'app-setting-calendar',
  templateUrl: './setting-calendar.component.html',
  styleUrls: ['./setting-calendar.component.scss']
})
export class SettingCalendarComponent implements OnInit {
  calendarConfig: any;
  param: any;
  model = new CalendarModel();
  calendarID: any;
  closeResult = '';
  mdTitle: string;
  editTilte: string;
  moreFuncs = [];
  stShift = new CalendarWeekModel();
  ndShift = new CalendarWeekModel();
  dayOff: any;
  vlls: any;
  calendateDate: any;
  mode: string = 'day';
  //Event
  set = false;
  evtData: any;
  evtCDDate: any;
  dayWeeks = [];
  //Const
  entity = {
    Calendars: 'calendar',
    DayOffs: 'dayoff',
    CalendarDate: 'calendarDate'
  }
  @ViewChild('add') add;
  @ViewChild('editCalendar') editCalendar;
  @ViewChild('editEvent') editEvent;
  @ViewChild('editCalendarDate') editCalendarDate;
  @ViewChild('calendar') calendar;
  calendarModal: NgbModalRef;
  dayOffModal: NgbModalRef;
  @ViewChild('comboboxStd') comboboxStd;

  constructor(
    private api: ApiHttpService,
    private modalService: NgbModal,
    private cache: CacheService,
    private df: ChangeDetectorRef,
    private activeRouter: ActivatedRoute,
    //private mainSv: MainService
  ) {
  }

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe(res => {
      if (res.calendarID)
        this.calendarID = res.calendarID;
    })
    this.cache.valueList('L1481').subscribe(res => {
      this.vlls = res.datas;
    });
  }


  ngAfterViewInit(): void {
    this.getParam();
  }


  getParam() {
    this.api.execSv<any>(APICONSTANT.SERVICES.SYS, APICONSTANT.SERVICES.CM, APICONSTANT.BUSINESS.CM.Parameters, 'GetOneField', ['TM_Parameters', null, 'CalendarID']).subscribe(res => {
      if (res) {
        this.param = res;
        this.calendarID = res.fieldValue;
        this.df.detectChanges();
      }
    })
  }

  changeCombobox(e) {
    this.calendarID = e.data.CalendarID;
    this.editTilte = e.data.Description;
    this.calendar.getDayOff(this.calendarID);
  }

  setting() {
    this.openCalendarSettings();
  }

  // modal
  addCalendar() {
    this.model = new CalendarModel();
    this.modalService.open(this.add, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.saveAs();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  //Modal setting
  openCalendarSettings() {
    const t = this;
    this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.Calendars, 'GetSettingCalendarAsync', this.calendarID).subscribe(res => {
      if (res) {
        t.dayOff = res[0];
        t.handleWeekDay(res[1]);
        t.calendateDate = res[2];
        t.modalService.open(this.editCalendar, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' }).result.then((result) => {
        }, (reason) => {
          t.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
      }
    })
  }

  //Modal event dayoff
  openDayOffs(data = null) {
    const t = this;

    t.evtData = new DaysOffModel();
    if (data)
      t.evtData = { ...data };

    t.evtData.dayoffCode = this.calendarID;
    t.evtData.day = data?.day || 1;
    t.evtData.month = data?.month || 1;
    t.evtData.color = data?.color || '#0078ff'
    t.dayOffModal = t.modalService.open(this.editEvent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    t.dayOffModal.result.then((result) => {
      t.evtData = new DaysOffModel();
      t.calendar.getDayOff();
    }, (reason) => {
      t.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  //Modal calendarDate
  openCalendarDate(data = null) {
    const t = this;
    t.evtCDDate = new CalendarDateModel();
    if (data)
      t.evtCDDate = data;

    t.evtCDDate.calendarID = this.calendarID;
    t.evtCDDate.calendarDate = data?.calendarDate ? new Date(data.calendarDate) : new Date();
    t.evtCDDate.dayoffColor = data?.dayoffColor || '#0078ff';
    t.calendarModal = t.modalService.open(this.editCalendarDate, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    t.calendarModal.result.then((result) => {
      t.evtCDDate = new CalendarDateModel();
      t.calendar.getDayOff();
    }, (reason) => {
      t.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  // modal

  //Method
  saveAs() {
    this.api.execSv<any>('BS', 'BS', 'CalendarsBusiness', 'SaveCalendarAsync', this.model).subscribe(res => {
      this.comboboxStd.data = [];
      this.comboboxStd.loadData();
    })
  }

  savaDayOff() {
    const t = this;
    t.evtData.Day
    let data = t.evtData;
    this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.DaysOff, 'SaveDayOffAsync', [this.evtData, this.set]).subscribe(res => {
      if (res) {
        if (res.isAdd)
          t.dayOff.push(res.data);
        else {

          t.dayOff.filter(function (o, i) {
            if (o.recID == data.recID)
              t.dayOff[i] = data;
          })
        }
        t.dayOffModal.close();
      }
    })
  }

  savaCalendarDate() {
    const t = this;
    this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarDate, 'SaveCalendarDateAsync', this.evtCDDate).subscribe(res => {
      if (res) {
        if (res.isAdd) {
          t.calendateDate.push(res.data);
        } else {
          var index = t.calendateDate.findIndex(p => p.recID == t.evtCDDate.recID);
          t.calendateDate[index] = t.evtCDDate;
        }
        t.calendarModal.close();
      }
    })
  }

  removeDayOff(item) {
    // const t = this;
    // this.mainSv.confirmDialog('E0327').then(res => {
    //   if (res) {
    //     t.api.exec(APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.DaysOff, 'DeleteAsync', item).subscribe(res => {
    //       if (res) {
    //         t.dayOff = _.filter(t.dayOff, function (o) {
    //           return o.recID != item.recID;
    //         })
    //         t.mainSv.notifyByMessageCode('E0408');
    //       }
    //     })
    //   }
    // });
  }

  removeCalendateDate(item) {
    // const t = this;
    // this.mainSv.confirmDialog('E0327').then(res => {
    //   if (res) {
    //     t.api.exec(APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarDate, 'DeleteAsync', item).subscribe(res => {
    //       if (res) {
    //         t.calendateDate = _.filter(t.calendateDate, function (o) {
    //           return o.recID != item.recID;
    //         })
    //         t.mainSv.notifyByMessageCode('E0408');
    //       }
    //     })
    //   }
    // });
  }
  //Method


  handleWeekDay(dayOff) {
    const t = this;
    t.stShift.startTime = dayOff.stShift.startTimeSt;
    t.stShift.endTime = dayOff.stShift.endTimeSt;
    t.stShift.data = [];

    t.ndShift.startTime = dayOff.ndShift.startTimeNd;
    t.ndShift.endTime = dayOff.ndShift.endTimeNd;
    t.ndShift.data = [];

    this.vlls.forEach((e, i) => {
      let y = (i + 1).toString();
      let stCheck = _.some(dayOff.stShift.data, { 'weekday': y });
      let ndCheck = _.some(dayOff.ndShift.data, { 'weekday': y });

      t.stShift.data.push({
        Weekday: y,
        checked: stCheck,
        shiftType: 1
      });

      t.ndShift.data.push({
        weekday: y,
        checked: ndCheck,
        shiftType: 2
      })
    });
    this.df.detectChanges();
  }

  weekdayChange(e, item) {
    var model = new CalendarWeekModel();
    model.wKTemplateID = this.calendarID;
    model.shiftType = item.shiftType;
    model.weekday = item.weekday;
    var check = e.data;
    this.api.execSv<any>(APICONSTANT.SERVICES.BS, APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarWeekdays, "SaveWeekdaysAsync", [model, check]).subscribe(res => {
    })
  }

  valueChange(e, entity, element = null) {
    //Param for Calendars
    if (e.field == 'description' && entity == this.entity.Calendars)
      this.model.description = e.data;

    if (e.field == 'calendarName' && entity == this.entity.Calendars)
      this.model.calendarName = e.data;

    if (e.field == 'symbolCld')
      this.evtCDDate.symbol = e.data.value;

    if (e.field == 'symbolDayOff')
      this.evtData.symbol = e.data.value;
    //Param for DayOffs
    if (e.field == "day")
      this.evtData.day = e.data;

    if (e.field == "month")
      this.evtData.month = e.data;

    if (e.field == 'calendar' && entity == this.entity.DayOffs)
      this.evtData.calendar = e.data.value;

    if (e.field == 'set' && entity == this.entity.DayOffs)
      this.set = e.data;

    //Param for CalendarDate & DayOff
    if (e.field == 'note1')
      this.evtData.note = e.data;

    if (e.field == 'note2')
      this.evtCDDate.note = e.data;

    if (e.field === "color" || e.field === "dayoffColor") {

      if (entity == this.entity.DayOffs)
        this.evtData.color = e.data;

      if (entity == this.entity.CalendarDate)
        this.evtCDDate.dayoffColor = e.data;

      var $elm = $('.symbol-label[data-color]', $('.patternt'));
      $elm.removeClass('color-check');
      $('kendo-colorpicker.symbol-label', $(element)).addClass('color-check');
      this.df.detectChanges();
    } else {
      if (element) {
        var $parent = $(element.ele);
        if ($parent && $parent.length > 0) {
          var text = $('.k-selected-color', $parent);
          text.text(e.data);
          text.css("background-color", e);
          if (e.field == "headerColor")
            $('.header-pattent').css('color', e);
          else if (e.field == "textColor")
            $('.content-pattent').css('color', e);
        }
      }
    }
  }

  changeTime(e, entity) {
    if (e.field == "calendarDate")
      this.evtCDDate.calendarDate = e.data;
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      this.model = new CalendarModel();
      this.evtCDDate = new CalendarDateModel();
      this.evtData = new DaysOffModel()
      return `with: ${reason}`;
    }
  }
  //Method
//   action(para: ActionArg) {
//   }
}

