import { NoteServices } from './../../../../../../src/app/pages/services/note.services';
import { BackgroundImagePipe } from './../../../../../../src/core/pipes/background-image.pipe';
import { type } from 'os';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CallFuncService, CacheService, UIComponent, SidebarModel, DialogRef, DialogModel, FormModel, AuthStore, CRUDService, CodxListviewComponent, RequestOption } from 'codx-core';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  Injector,
} from '@angular/core';
import { Thickness, DateTime } from '@syncfusion/ej2-angular-charts';
import { Notes } from '@shared/models/notes.model';
import { StatusNote } from '@shared/models/enum/enum';
import { UpdateNotePinComponent } from '@pages/home/update-note-pin/update-note-pin.component';
import { AddNoteComponent } from '@pages/home/add-note/add-note.component';
import { ActivatedRoute } from '@angular/router';
import { SaveNoteComponent } from '@pages/home/add-note/save-note/save-note.component';
@Component({
  selector: 'app-calendar-notes',
  templateUrl: './calendar-notes.component.html',
  styleUrls: ['./calendar-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarNotesComponent extends UIComponent implements OnInit, AfterViewInit {

  @Input() dataAdd = new Notes();
  @Input() dataUpdate = new Notes();
  message: any;
  messageParam: any;
  listNote: any[] = [];
  type: any;
  typeCalendar = 'week';
  itemUpdate: any;
  recID: any;
  countNotePin = 0;
  maxPinNotes: any;
  checkUpdateNotePin = false;
  TM_Tasks: any;
  WP_Notes: any = [];
  TM_TasksParam: any;
  WP_NotesParam: any;
  checkTM_TasksParam: any;
  checkWP_NotesParam: any;
  param: any;
  daySelected: any;
  changeDateSelect = false;
  checkWeek = true;
  typeList = 'notes-home';
  dataValue = 'WP_Calendars;SettingShow';
  predicate = '';
  dataValue1: any;
  predicate1 = 'CreatedBy=@0';
  userID = ''
  data: any;
  fromDate: any;
  toDate: any;
  arrDate: any = [];
  dialog: DialogRef;
  checkUpdate = false;

  @ViewChild('listview') lstView: CodxListviewComponent
  @ViewChild('calendar') calendar: any;
  constructor(private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private auth: AuthStore,
    private noteService: NoteServices,
  ) {
    super(injector);
    this.dataValue1 = this.auth.get();
    this.userID = this.dataValue1?.userID;
    this.messageParam = this.cache.message('WP003');
    this.getParam();
  }

  onInit(): void {
    this.getMaxPinNote();
    this.noteService.data.subscribe((res) => {
      if (res) {
        var data = res[0]?.data;
        var type = res[0]?.type;
        if (this.lstView) {
          if (type == 'add') {
            (this.lstView.dataService as CRUDService).load().subscribe();
            this.WP_Notes.push(data);
            this.setEventWeek();
          } else if (type == 'delete') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.WP_Notes = this.WP_Notes.filter(x => x.recID != data.recID);
            this.setEventWeek();
            var today: any = document.querySelector(
              ".e-footer-container button[aria-label='Today']"
            );
            if (today) {
              today.click();
            }
          } else if (type == 'edit') {
            var dt: any = this.lstView.dataService.data[0];
            for (let i = 0; i < this.WP_Notes.length; i++) {
              if (this.WP_Notes[i].recID == dt?.recID) {
                this.WP_Notes[i].createdOn = dt.createdOn;
              }
            }
            this.setEventWeek();
            var today: any = document.querySelector(
              ".e-footer-container button[aria-label='Today']"
            );
            if (today) {
              today.click();
            }

            (this.lstView.dataService as CRUDService).load().subscribe();
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    })
  }

  ngAfterViewInit() {
  }

  requestEnded(evt: any) {
    console.log("check requestEnded", evt)
    this.view.currentView;
    this.data = this.lstView.dataService.data;
  }

  getMaxPinNote() {
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'GetParamAsync')
      .subscribe((res) => {
        this.maxPinNotes = res[0].msgBodyData[0].fieldValue;
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
    this.daySelected = daySelected.toISOString();
    this.dataValue = '';
    this.dataValue = `WP_Calendars;SettingShow;${this.daySelected}`;
    this.lstView?.dataService.setPredicate(this.predicate, [this.dataValue]).subscribe();
    this.changeDetectorRef.detectChanges();
  }

  onValueChange(args: any) {
    this.changeDateSelect = true;
    this.daySelected = args.value;
    var daySelected = new Date(Date.parse(this.daySelected));
    this.daySelected = daySelected.toISOString();
    this.dataValue = '';
    this.dataValue = `WP_Calendars;SettingShow;${this.daySelected}`;
    this.lstView?.dataService.setPredicate(this.predicate, [this.dataValue]).subscribe();
    this.changeDetectorRef.detectChanges();


    let title: string = '';
    if (args.event) {
      /*Displays selected date in the label*/
      title = args.event.currentTarget.getAttribute('data-val');
      title = title == null ? '' : ' ( ' + title + ' )';
    }
    document.getElementById('selected').textContent =
      'Selected Value: ' + args.value.toLocaleDateString() + title;
  }

  valueChangeTyCalendar(e) {
    if (e) {
      if (e.data == true) {
        this.typeCalendar = 'week';
        this.checkWeek = true;
      } else {
        this.typeCalendar = 'month';
        this.checkWeek = false;
      }
    }
  }

  // getMinMaxDate(calendar: any) {
  //   if (calendar) {
  //     var d = calendar.currentDate;
  //     var localDate = new Date(d.getFullYear(), d.getMonth(), 0, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  //     var firstDayOfWeek = calendar?.firstDayOfWeek

  //     const dayMilliSeconds: number = 86400000
  //     while (localDate.getDay() !== firstDayOfWeek) {
  //       calendar.setStartDate(localDate, -1 * dayMilliSeconds);
  //     }
  //     var fromDate = new Date(localDate);
  //     this.fromDate = fromDate.toLocaleDateString();
  //     var toDate = new Date(calendar.renderDayCellArgs.date);
  //     this.toDate = toDate.toLocaleDateString();

  //     this.getParam(this.fromDate, this.toDate);
  //   }
  // }

  getParam() {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetDataInCalendarAsync',
        'WP_Calendars',
      )
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          var dt = res.msgBodyData[0];
          this.TM_TasksParam = JSON.parse(dt[2].TM_Tasks[0]?.dataValue);
          this.WP_NotesParam = JSON.parse(dt[2].WP_Notes[0]?.dataValue);
          this.checkTM_TasksParam = this.TM_TasksParam?.ShowEvent;
          this.checkWP_NotesParam = this.WP_NotesParam?.ShowEvent;

          this.WP_Notes = dt[0];
          this.TM_Tasks = dt[1];
          this.WP_Notes.forEach((res) => {
            if (res.isPin == true || res.isPin == '1') {
              this.countNotePin++;
            }
          })
        }
      });
    // this.getNumberNotePin(this.WP_Notes);
  }

  setEvent(ele = null, args = null) {
    let calendarWP = 0;
    let calendarTM = 0;
    let countShowCalendar = 0;
    if (args) {
      var date = args.date;
      if (typeof args.date !== 'string') date = date.toLocaleDateString();

      if (this.checkTM_TasksParam == true || this.checkTM_TasksParam == '1') {
        if (this.TM_TasksParam?.ShowEvent == '1') {
          for (let y = 0; y < this.TM_Tasks?.length; y++) {
            var dateParse = new Date(this.TM_Tasks[y]?.createdOn);
            var dataLocal = dateParse.toLocaleDateString();
            if (date == dataLocal) {
              calendarTM++;
              break;
            }
          }
        }
      }

      if (this.checkWP_NotesParam == true || this.checkWP_NotesParam == '1') {
        if (this.WP_NotesParam?.ShowEvent == '1') {
          for (let y = 0; y < this.WP_Notes?.length; y++) {
            var dateParse = new Date(Date.parse(this.WP_Notes[y]?.createdOn));
            if (date == dateParse.toLocaleDateString()) {
              if (this.WP_Notes[y]?.showCalendar == true) {
                calendarWP++;
                if (this.WP_Notes[y]?.showCalendar == false) {
                  countShowCalendar += 1;
                } else {
                  countShowCalendar = 0;
                }
                break;
              }
            }
          }
        }
      }
    }

    var span: HTMLElement = document.createElement('span');
    var span2: HTMLElement = document.createElement('span');
    var flex: HTMLElement = document.createElement('span');
    flex.className = 'd-flex note-point';
    ele.append(flex);

    if (calendarWP >= 1 && countShowCalendar < 1) {
      if (this.typeCalendar == 'week') {
        span.setAttribute(
          'style',
          `width: 6px;height: 6px;background-color: orange;border-radius: 50%;margin-left: 2px;margin-top: 0px;`
        );
      } else {
        span.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: orange;border-radius: 50%;'
        );
      }
      flex.append(span);
    }

    if (calendarTM >= 1) {
      if (this.typeCalendar == 'week') {
        span2.setAttribute(
          'style',
          'width: 6px;background-color: red;height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 0px;'
        );
      } else {
        span2.setAttribute(
          'style',
          'width: 6px;background-color: red;height: 6px;border-radius: 50%;'
        );
      }
      flex.append(span2);
    }

    if (calendarWP >= 1 && calendarTM >= 1 && countShowCalendar < 1) {
      if (this.typeCalendar == 'week') {
        span.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: orange;border-radius: 50%'
        );
        span2.setAttribute(
          'style',
          'width: 6px;height: 6px;background-color: red;border-radius: 50%;margin-left: 2px;margin-top: 0px;'
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

  openFormUpdateNote(data) {
    var obj = {
      data: this.WP_Notes,
      dataUpdate: data,
      formType: 'edit',
      maxPinNotes: this.maxPinNotes,
      currentDate: this.daySelected,
      dataSelected: this.lstView.dataService.dataSelected,
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc.openForm(
      AddNoteComponent,
      'Cập nhật ghi chú',
      600,
      450,
      '',
      obj,
      '',
      option,
    )

    // this.dialog.closed.subscribe(x => {
    //   if (x.event) {
    //     (this.lstView.dataService as CRUDService).update(x.event).subscribe();
    //   }
    // });

    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.recID = data?.recID;
  }

  // getNumberNotePin(WP_Notes) {
  //   debugger;
  //   WP_Notes.forEach((res) => {
  //     if (res.isPin == true || res.isPin == '1') {
  //       this.countNotePin++;
  //     }
  //   })
  // }

  checkNumberNotePin(data) {
    if (data?.isPin == '1' || data?.isPin == true) {
      this.countNotePin -= 1;
      this.checkUpdateNotePin = false;
    } else if (data?.isPin == '0' || data?.isPin == false) {
      if (this.countNotePin + 1 <= this.maxPinNotes) {
        this.countNotePin += 1;
        this.checkUpdateNotePin = false;
      } else {
        this.checkUpdateNotePin = true;
      }
    }
    var object = [{ data: data, type: 'edit' }]
    this.noteService.data.next(object);
    this.openFormUpdateIsPin(data, this.checkUpdateNotePin);
  }

  openFormUpdateIsPin(data, checkUpdateNotePin) {
    if (checkUpdateNotePin == true) {
      var obj = {
        data: this.WP_Notes,
        itemUpdate: data,
      }
      this.callfc.openForm(UpdateNotePinComponent, "Cập nhật ghi chú đã ghim", 500, 600, "", obj);
    } else {
      this.onEditIsPin(data);
    }
  }

  openFormAddNote() {
    var obj = {
      data: this.WP_Notes,
      typeLst: this.typeList,
      formType: 'add',
      currentDate: this.daySelected,
      component: 'calendar-notes',
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc
      .openForm(AddNoteComponent, 'Thêm mới ghi chú', 600, 500, '', obj, '', option)
    // this.dialog.closed.subscribe(x => {
    //   this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
    // });
    // this.lstView.dataService.load().subscribe();

  }

  valueChange(e, recID = null, item = null) {
    if (e) {
      var field = e.field;
      if (field == 'textarea') this.message = e.data.checked.checked;
      else if (field == 'WP_Notes_ShowEvent') {
        if (e.data == false) {
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
        if (e.data == false) {
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

  onEditIsPin(data: Notes) {
    var isPin = !data.isPin;
    data.isPin = isPin;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        data?.recID,
        data
      ])
      .subscribe((res) => {
        for (let i = 0; i < this.WP_Notes.length; i++) {
          if (this.WP_Notes[i].recID == data?.recID) {
            this.WP_Notes[i].isPin = res.isPin;
          }
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  onDeleteNote(item) {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'DeleteNoteAsync',
        item?.recID
      )
      .subscribe((res) => {
        if (res) {
          var object = [{ data: res, type: 'delete' }]
          this.noteService.data.next(object);
        }
      });
  }


  openFormNoteBooks(item) {
    var obj = {
      itemUpdate: item,
    };
    this.callfc.openForm(SaveNoteComponent, 'Cập nhật ghi chú', 900, 650, '', obj);
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'edit':
        this.openFormUpdateNote(data);
        break;
      case 'delete':
        this.onDeleteNote(data)
        break;
      case 'WPT0801':
        this.checkNumberNotePin(data);
        break;
      case 'WPT0802':
        this.openFormNoteBooks(data);
        break;
    }
  }
}
