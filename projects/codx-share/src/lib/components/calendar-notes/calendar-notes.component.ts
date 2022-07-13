import { type } from 'os';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CallFuncService, CacheService, UIComponent, SidebarModel, DialogRef, DialogModel, FormModel, AuthStore, CRUDService, CodxListviewComponent } from 'codx-core';
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
import { Thickness } from '@syncfusion/ej2-angular-charts';
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
  checkTM_TasksParam = true;
  checkWP_NotesParam = true;
  param: any;
  daySelected: any;
  toDate: any;
  changeDateSelect = false;
  checkWeek = true;
  typeList = 'notes-home';
  dataValue = 'WP_Calendars;SettingShow';
  predicate = '';
  dataValue1: any;
  predicate1 = 'CreatedBy=@0';
  userID = ''
  data: any;

  @ViewChild('listview') lstView: CodxListviewComponent
  @ViewChild('calendar') calendar: any;
  constructor(private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private auth: AuthStore,
  ) {
    super(injector);
    this.dataValue1 = this.auth.get();
    this.userID = this.dataValue1?.userID;
    this.messageParam = this.cache.message('WP003');
    this.setEventWeek();
  }

  onInit(): void {
    this.getParam();
    // this.getNoteData();
    this.getMaxPinNote();
  }

  ngAfterViewInit() {
    console.log("check listView", this.lstView.dataService.data);
  }

  requestEnded(evt: any) {
    //this.dialog && this.dialog.close(); sai vẫn bị đóng
    this.view.currentView;
    this.data = this.lstView.dataService.data;
    console.log("check data", this.data);
  }

  getMaxPinNote() {
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'GetParamAsync')
      .subscribe((res) => {
        this.maxPinNotes = res[0].msgBodyData[0].fieldValue;
      });
  }

  // getEvents() {
  // this.api
  //   .callSv(
  //     'SYS',
  //     'ERM.Business.CM',
  //     'ParametersBusiness',
  //     'GetDataByRecIDAsync',
  //     ['WP_Calendars', '', 'SettingShow']
  //   )
  //   .subscribe((res) => {
  //     if (res && res.msgBodyData) {
  //       this.param = res.msgBodyData[0];
  //       this.TM_Tasks = this.param[0];
  //       this.WP_Notes = this.param[1];
  //       this.TM_TasksParam = this.param[2].TM_Tasks;
  //       this.WP_NotesParam = this.param[2].WP_Notes;

  //       for (let i = 0; i < this.WP_Notes?.length; i++) {
  //         var date = this.WP_Notes[i]?.createdOn;
  //         var daq = new Date(Date.parse(date));
  //         var d = daq.toLocaleDateString();
  //       }
  //       this.getNumberNotePin();
  //     }
  //   });
  // }

  getParam() {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetDataParamAsync',
        ['WP_Calendars', '', 'SettingShow']
      )
      .subscribe((res) => {
        if (res && res.msgBodyData) {
          var dt = res.msgBodyData;
          this.TM_TasksParam = dt[0].TM_Tasks;
          this.WP_NotesParam = dt[0].WP_Notes;
        }
      });
  }

  // getNoteData() {
  //   var dtWP_Notes = [];
  //   var dtTM_Tasks = [];
  //   this.data.forEach((res) => {
  //     if (res?.type == 'WP_Notes') {
  //       dtWP_Notes.push(res);
  //     } else if (res?.type == 'TM_Tasks') {
  //       dtTM_Tasks.push(res);
  //     }
  //   })
  //   this.WP_Notes = dtWP_Notes;
  //   this.TM_Tasks = dtTM_Tasks;
  //   this.getNumberNotePin();
  // }

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
    flex.className = 'd-flex note-point';
    ele.append(flex);

    if (calendar >= 1 && countShowCalendar < 1) {
      if (this.typeCalendar == 'week') {
        span.setAttribute(
          'style',
          `width: 6px;height: 6px;background-color: orange;border-radius: 50%;margin-left: 2px;margin-top: 0px;`
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
          'width: 6px;background-color: red;height: 6px;border-radius: 50%;margin-left: 2px;margin-top: 0px;'
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

  onValueChange(args: any) {
    debugger;
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

  openFormUpdateNote(data) {
    var obj = {
      data: this.WP_Notes,
      dataUpdate: data,
      formType: 'edit',
      maxPinNotes: this.maxPinNotes,
    };
    this.callfc.openForm(
      AddNoteComponent,
      'Cập nhật ghi chú',
      600,
      450,
      '',
      obj
    )

    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.recID = data?.recID;
  }

  getNumberNotePin() {
    this.WP_Notes.forEach((res) => {
      if (res.isPin == true || res.isPin == '1') {
        this.countNotePin++;
      }
    })
  }

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
    };
    let option = new DialogModel();
    option.DataService = this.view.dataService as CRUDService;
    option.FormModel = this.view.formModel;
    this.callfc
      .openForm(AddNoteComponent, 'Thêm mới ghi chú', 600, 450, '', obj, '', option)
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

  valueChangeTyCalendar(e) {
    if (e) {
      if (e.data == true) {
        this.typeCalendar = 'week';
      } else {
        this.typeCalendar = 'month';
      }
      this.changeDetectorRef.detectChanges();
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
          this.WP_Notes = this.WP_Notes.filter(x => x.recID != res.recID)
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
