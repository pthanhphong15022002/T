import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CallFuncService, CacheService } from 'codx-core';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { Notes } from '@shared/models/notes.model';
import { StatusNote } from '@shared/models/enum/enum';
@Component({
  selector: 'app-calendar-notes',
  templateUrl: './calendar-notes.component.html',
  styleUrls: ['./calendar-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarNotesComponent implements OnInit, AfterViewInit {
  @Input() dataAdd = new Notes();
  @Input() dataUpdate = new Notes();
  message: any;
  messageParam: any;
  listNote: any[] = [];
  messageOld: any;
  listNoteOld: any[] = [];
  type: any;
  getDate: any;
  isCalendar = false;
  isCalendarOld: any;
  noteTypeOld: any;
  typeCalendar = 'week';
  itemUpdate: any;
  recID: any;
  recIdOld: any;
  isPin: any;
  isPinOld: any;
  countNotePin = 0;
  maxPinNotes: any;
  STATUS_NOTE = StatusNote;
  checkUpdateNotePin = false;
  countLstNote: any;
  TM_Tasks: any;
  WP_Notes: any = [];
  TM_TasksParam: any;
  WP_NotesParam: any;
  checkTM_TasksParam: boolean;
  checkWP_NotesParam: boolean;
  events: any;
  dataObj: any;
  param: any;
  daySelected: any;
  toDate: any;
  changeDateSelect = false;
  checkMonth = false;
  checkWeek = true;
  typeList = 'notes-home';

  @ViewChild('listview') lstView;
  @ViewChild('calendar') calendar: any;
  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private cache: CacheService,
    private modalService: NgbModal
  ) {
    this.setEventWeek();
    this.messageParam = this.cache.message('WP003');
  }
  ngAfterViewInit() { }

  ngOnInit(): void {
    this.getEvents();
    this.getMaxPinNote();
  }

  getMaxPinNote() {
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'GetParamAsync')
      .subscribe((res) => {
        this.maxPinNotes = res[0].msgBodyData[0].fieldValue;
      });
  }

  getEvents() {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetDataByRecIDAsync',
        ['WP_Calendars', '', 'SettingShow']
      )
      .subscribe((res) => {
        if (res && res.msgBodyData) {
          this.param = res.msgBodyData[0];
          this.TM_Tasks = this.param[0];
          this.WP_Notes = this.param[1];
          this.TM_TasksParam = this.param[2].TM_Tasks;
          this.WP_NotesParam = this.param[2].WP_Notes;

          for (let i = 0; i < this.WP_Notes?.length; i++) {
            var date = this.WP_Notes[i]?.createdOn;
            var daq = new Date(Date.parse(date));
            var d = daq.toLocaleDateString();
          }
          console.log('WP_NotesParam: ', this.WP_NotesParam);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  onLoad(args): void {
    this.setEvent(args.element, args);
  }

  setEventWeek() {
    this.toDate = new Date();
    var datePare = new Date(Date.parse(this.toDate));
    this.toDate = datePare.toLocaleDateString();

    var ele = document.querySelectorAll('.week-item[data-date]');
    for (var i = 0; i < ele.length; i++) {
      let htmlEle = ele[i] as HTMLElement;
      var date = htmlEle?.dataset?.date;
      let obj = { date: date };
      var eleEvent = htmlEle.querySelector('.week-item-event');
      eleEvent.innerHTML = '';
      this.setEvent(eleEvent, obj);
    }
  }

  compareDate(createdOn, daySelected) {
    var date = new Date(Date.parse(createdOn));
    var dateParse = date.toLocaleDateString();
    if (dateParse == daySelected) {
      return dateParse;
    } else {
      return null;
    }
  }

  getDataByToDay(createdOn, toDate) {
    var date = new Date(Date.parse(createdOn));
    var dateParse = date.toLocaleDateString();
    if (dateParse == toDate) {
      return dateParse;
    } else {
      return null;
    }
  }
  onChangeValueSelectedWeek(e) {
    this.changeDateSelect = true;

    this.daySelected = e.daySelected;
    var daySelected = new Date(Date.parse(this.daySelected));
    this.daySelected = daySelected.toLocaleDateString();
  }

  setEvent(ele = null, args = null) {
    let calendar = 0;
    let calendarTM = 0;
    let countShowCalendar = 0;
    let temp = 0;
    if (args) {
      var date = args.date;
      if (typeof args.date !== 'string') date = date.toLocaleDateString();

      if (this.checkTM_TasksParam == true) {
        for (let i = 0; i < this.TM_TasksParam?.length; i++) {
          if (
            this.TM_TasksParam[i]?.fieldName == 'ShowEvent' &&
            this.TM_TasksParam[i]?.fieldValue == '1'
          ) {
            for (let y = 0; y < this.TM_Tasks?.length; y++) {
              var dateParse = new Date(Date.parse(this.TM_Tasks[y]?.createdOn));
              if (date === dateParse.toLocaleDateString()) {
                calendarTM++;
              }
            }
          }
        }
      }

      if (this.checkWP_NotesParam == true) {
        for (let i = 0; i < this.WP_NotesParam?.length; i++) {
          if (
            this.WP_NotesParam[i]?.fieldName == 'ShowEvent' &&
            this.WP_NotesParam[i]?.fieldValue == '1'
          ) {
            for (let y = 0; y < this.WP_Notes?.length; y++) {
              var dateParse = new Date(Date.parse(this.WP_Notes[y]?.createdOn));
              if (date === dateParse.toLocaleDateString()) {
                calendar++;

                if (this.WP_Notes[y]?.showCalendar == false) {
                  countShowCalendar += 1;
                  // if(this.WP_Notes[y+1]?.showCalendar == true) {
                  //   temp = 0;
                  // } else {
                  //   temp += 1;
                  // }
                } else {
                  countShowCalendar = 0;
                }
              }
            }
          }
        }
      }
    }

    var span: HTMLElement = document.createElement('span');
    var span2: HTMLElement = document.createElement('span');
    var flex: HTMLElement = document.createElement('span');

    // span13.innerText = (`+${total - 2}`);
    flex.className = 'd-flex note-point';
    ele.append(flex);

    if (calendar >= 1 && countShowCalendar < 1) {
      if (this.typeCalendar == 'week') {
        span.setAttribute(
          'style',
          `width: 6px;height: 6px;background-color: orange;border-radius: 50%;margin-left: 5px;margin-top: 6px;`
        );
      } else {
        span.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: orange;border-radius: 50%'
        );
      }
      flex.append(span);
    }

    if (calendarTM >= 1) {
      if (this.typeCalendar == 'week') {
        span2.setAttribute(
          'style',
          'width: 6px;background-color: red;height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 6px;'
        );
      } else {
        span2.setAttribute(
          'style',
          'width: 6px;background-color: red;height: 6px;border-radius: 50%'
        );
      }
      flex.append(span2);
    }

    if (calendar >= 1 && calendarTM >= 1 && countShowCalendar < 1) {
      if (this.typeCalendar == 'week') {
        span.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: orange;border-radius: 50%;margin-top: 6px;'
        );
        span2.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: red;border-radius: 50%;margin-left: 2px;margin-top: 6px;'
        );
      } else {
        span.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: orange;border-radius: 50%'
        );
        span2.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: red;border-radius: 50%;margin-left: 2px'
        );
      }
      flex.append(span);
      flex.append(span2);
    }
  }

  onValueChange(args: any) {
    this.changeDateSelect = true;
    this.daySelected = args.value.toLocaleDateString();
    let title: string = '';
    if (args.event) {
      /*Displays selected date in the label*/
      title = args.event.currentTarget.getAttribute('data-val');
      title = title == null ? '' : ' ( ' + title + ' )';
    }
    document.getElementById('selected').textContent =
      'Selected Value: ' + args.value.toLocaleDateString() + title;
  }

  valueProperty(e) {
    this.lstView = e.datas;
    let i = 0;
    var date;
    var arr = [];
    let countLstNotePin = 0;
    for (i; i < e.datas.length; i++) {
      date = e.datas[i].createdOn;
      var dateParse = new Date(Date.parse(date));
      arr.push(dateParse);
      countLstNotePin++;
      if (e.datas[i].isPin == true) {
        this.countNotePin++;
      }
    }

    this.countLstNote = countLstNotePin;
    this.getDate = arr;
    if (this.typeCalendar == 'week') {
      this.setEventWeek();
    } else {
      var today: any = document.querySelector(
        ".e-footer-container button[aria-label='Today']"
      );
      if (today) {
        today.click();
      }
    }
  }

  openFormUpdateNote(recID, data = null) {
    // var obj = {
    //   lstview: this.WP_Notes,
    //   recID: recID,
    //   data: data,
    // };
    // this.callfc.openForm(
    //   UpdateNoteComponent,
    //   'Cập nhật ghi chú',
    //   0,
    //   0,
    //   '',
    //   obj
    // ).subscribe((dt: any) => {
    //   if (dt) {
    //     var that = this;
    //     dt.close = function (e) {
    //     };
    //   }

    // });;

    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.recID = recID;
  }

  openFormPinNote(recID, data = null) {
    this.itemUpdate = data;
    this.listNote = data.checkList;
    this.message = data.memo;
    this.isCalendar = data.showCalendar;
    this.isPin = data.isPin;
    this.recID = recID;
    this.type = data.noteType;
  }

  openFormUpdateIsPin(content, data) {
    //this.callfc.openForm(content);
    if (this.checkUpdateNotePin == true) {
      this.modalService.open(content, { centered: true });
    } else return;
    // if (this.checkUpdateNotePin == true) {
    //   var obj = {
    //     lstview: this.lstView,
    //     data: data,
    //   }
    //   this.callfc.openForm(UpdateNotePinComponent, "Cập nhật ghi chú đã ghim", 0, 0, "", obj);
    // }
  }

  openFormAddNote() {
    // var obj = {
    //   lstview: this.lstView,
    //   ngForLstview: this.WP_Notes,
    //   typeLst: this.typeList,
    // };
    // this.callfc
    //   .openForm(AddNoteComponent, 'Thêm mới ghi chú', 747, 570, '', obj)
    //   .subscribe((dt: any) => {
    //     if (dt) {
    //       var that = this;
    //       dt.close = function (e) { };
    //     }
    //   });
    // this.changeDetectorRef.detectChanges();
  }

  valueChange(e, recID = null, item = null) {
    if (e) {
      var field = e.field;
      if (field == 'textarea') this.message = e.data.checked.checked;
      else if (field == 'pinNote') {
        if (e.data.checked == true) {
          if (this.countNotePin + 1 <= this.maxPinNotes) {
            this.onEditNote();
            this.countNotePin += 1;
          } else if (this.countNotePin + 1 > this.maxPinNotes) {
            this.checkUpdateNotePin = true;
          }
        } else if (e.data.checked == false) {
          this.countNotePin -= 1;
          this.onEditNote();
        }
      } else if (field == 'checkboxUpdateNotePin') {
        this.messageOld = item.memo;
        this.listNoteOld = item.checkList;
        this.isPinOld = !item.isPin;
        this.isCalendarOld = item.showCalendar;
        this.recIdOld = recID;
        this.noteTypeOld = item.noteType;
        this.onEditIsPin();
      } else if (field == 'WP_Notes_ShowEvent') {
        if (e.data.checked == false) {
          this.checkWP_NotesParam = false;
        } else {
          this.checkWP_NotesParam = true;
        }

        var today: any = document.querySelector(
          ".e-footer-container button[aria-label='Today']"
        );
        if (today) {
          today.click();
        }
        this.setEventWeek();
      } else if (field == 'TM_Tasks_ShowEvent') {
        if (e.data.checked == false) {
          this.checkTM_TasksParam = false;
        } else {
          this.checkTM_TasksParam = true;
        }

        var today: any = document.querySelector(
          ".e-footer-container button[aria-label='Today']"
        );
        if (today) {
          today.click();
        }
        this.setEventWeek();
      } else if (item) {
        this.message = '';
        item[field] = e.data.checked;
      }
    }
  }

  valueChangeTyCalendar(e) {
    if (e) {
      var field = e.field;
      if (field == 'onTypeCalendarByWeek') {
        if (e.data.checked == true) {
          this.checkMonth = false;
          this.checkWeek = true;
          this.typeCalendar = 'week';
        } else {
          this.checkMonth = true;
          this.checkWeek = false;
          this.typeCalendar = 'month';
        }
        this.changeDetectorRef.detectChanges();
      } else {
        if (e.data.checked == true) {
          this.checkWeek = false;
          this.checkMonth = true;
          this.typeCalendar = 'month';
        } else {
          this.checkWeek = true;
          this.checkMonth = false;
          this.typeCalendar = 'week';
        }
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  onEditNote() {
    if (this.type == 'check' || this.type == 'list') {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.listNote;
    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.message;
    }
    this.dataAdd.isPin = !this.isPin;
    this.dataAdd.showCalendar = this.isCalendar;
    this.dataAdd.transID = null;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.recID,
        this.dataAdd,
      ])
      .subscribe((res) => {
        for (let i = 0; i < this.WP_Notes.length; i++) {
          if (this.WP_Notes[i].recID == this.recID) {
            this.WP_Notes[i].isPin = res.isPin;
          }
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  onEditIsPin() {
    if (this.noteTypeOld == 'check' || this.noteTypeOld == 'list') {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.listNoteOld;
    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.messageOld;
    }
    this.dataAdd.isPin = this.isPinOld;
    this.dataAdd.showCalendar = this.isCalendarOld;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.recIdOld,
        this.dataAdd,
      ])
      .subscribe((res) => {
        for (let i = 0; i < this.WP_Notes.length; i++) {
          if (this.WP_Notes[i].recID == this.recIdOld) {
            this.WP_Notes[i].isPin = res.isPin;
          }
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  onDeleteNote() {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'DeleteNoteAsync',
        this.recID
      )
      .subscribe((res) => {
        if (res) {
          // this.lstView.removeHandler(dt, "recID");
          for (let i = 0; i < this.WP_Notes.length; i++) {
            if (this.WP_Notes[i].recID == this.recID) {
              this.WP_Notes.splice(i, 1);
            }
          }
          this.changeDetectorRef.detectChanges();
          this.setEventWeek();
          var today: any = document.querySelector(
            ".e-footer-container button[aria-label='Today']"
          );
          if (today) {
            today.click();
          }
        }
      });
  }
}
