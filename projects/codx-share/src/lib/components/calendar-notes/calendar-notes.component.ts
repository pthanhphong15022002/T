import { BackgroundImagePipe } from './../../../../../../src/core/pipes/background-image.pipe';
import { type } from 'os';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  CallFuncService,
  CacheService,
  UIComponent,
  SidebarModel,
  DialogRef,
  DialogModel,
  FormModel,
  AuthStore,
  CRUDService,
  CodxListviewComponent,
  RequestOption,
  DataService,
  NotificationsService,
} from 'codx-core';
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
import { Notes } from '@shared/models/notes.model';
import { AddNoteComponent } from 'projects/codx-wp/src/lib/dashboard/home/add-note/add-note.component';
import { UpdateNotePinComponent } from 'projects/codx-wp/src/lib/dashboard/home/update-note-pin/update-note-pin.component';
import { SaveNoteComponent } from 'projects/codx-wp/src/lib/dashboard/home/add-note/save-note/save-note.component';
import { NoteServices } from 'projects/codx-wp/src/lib/services/note.services';
@Component({
  selector: 'app-calendar-notes',
  templateUrl: './calendar-notes.component.html',
  styleUrls: ['./calendar-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarNotesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  message: any;
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
  daySelected: any;
  checkWeek = true;
  typeList = 'notes-home';
  dataValue = '';
  predicate = '';
  userID = '';
  data: any;
  fromDate: any;
  toDate: any;
  dataObj: any;
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  dataUpdate: any;
  functionList: any;

  @ViewChild('listview') lstView: CodxListviewComponent;
  @ViewChild('calendar') calendar: any;
  constructor(
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private auth: AuthStore,
    private noteService: NoteServices,
    private notification: NotificationsService
  ) {
    super(injector);
    this.userID = this.auth.get().userID;
    this.getParam();
    this.cache
      .moreFunction('PersonalNotes', 'grvPersonalNotes')
      .subscribe((res) => {
        if (res) {
          this.editMF = res[2];
          this.deleteMF = res[3];
          this.pinMF = res[0];
          this.saveMF = res[1];
        }
      });
    this.cache.functionList('WPT08').subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {
    this.getMaxPinNote();
    this.loadData();
  }

  loadData() {
    this.noteService.data.subscribe((res) => {
      if (res) {
        var data = res[0]?.data;
        var type = res[0]?.type;
        if (this.lstView) {
          if (type == 'add-otherDate') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.WP_Notes.push(data);
          } else if (type == 'add-currentDate') {
            (this.lstView.dataService as CRUDService).add(data).subscribe();
            this.WP_Notes.push(data);
          } else if (type == 'delete') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.WP_Notes = this.WP_Notes.filter((x) => x.recID != data.recID);
          } else if (type == 'edit-otherDate') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            for (let i = 0; i < this.WP_Notes.length; i++) {
              if (this.WP_Notes[i].recID == data?.recID) {
                this.WP_Notes[i].createdOn = data.createdOn;
              }
            }
          } else if (type == 'edit-currentDate') {
            (this.lstView.dataService as CRUDService).update(data).subscribe();
            if (data?.showCalendar == false) {
              for (let i = 0; i < this.WP_Notes.length; i++) {
                if (this.WP_Notes[i].recID == data?.recID) {
                  this.WP_Notes[i].createdOn = null;
                }
              }
            }
          } else if (type == 'edit') {
            (this.lstView.dataService as CRUDService).update(data).subscribe();
          } else if (type == 'add-note-drawer') {
            (this.lstView.dataService as CRUDService).load().subscribe();
            this.WP_Notes.push(data);
          } else if (type == 'edit-note-drawer') {
            (this.lstView.dataService as CRUDService).remove(data).subscribe();
            this.WP_Notes = this.WP_Notes.filter((x) => x.recID != data.recID);
            (this.lstView.dataService as CRUDService).load().subscribe();
            this.WP_Notes.push(data);
          }
          this.setEventWeek();
          var today: any = document.querySelector(
            ".e-footer-container button[aria-label='Today']"
          );
          if (today) {
            today.click();
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  ngAfterViewInit() {
    this.lstView.dataService.requestEnd = (t, data) => {
      if (t == 'loaded') {
      }
    };
  }

  requestEnded(evt: any) {
    this.view.currentView;
    this.data = this.lstView.dataService.data;
  }

  getMaxPinNote() {
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'GetParamAsync')
      .subscribe((res) => {
        if (res) {
          if (res[0]?.msgBodyData)
            this.maxPinNotes = res[0]?.msgBodyData[0]?.fieldValue;
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

  onChangeValueSelectedWeek(e, lstView) {
    var data = JSON.parse(JSON.stringify(e.daySelected));
    this.setDate(data, lstView);
  }

  onValueChange(args: any, lstView) {
    var data = JSON.parse(JSON.stringify(args.value));
    this.setDate(data, lstView);
  }

  setDate(data, lstView) {
    var dateT = new Date(data);
    var fromDate = dateT.toISOString();
    this.daySelected = fromDate;
    var toDate = new Date(dateT.setDate(dateT.getDate() + 1)).toISOString();
    (lstView.dataService as CRUDService).dataObj = `WPCalendars`;
    (lstView.dataService as CRUDService).predicates =
      'CreatedOn >= @0 && CreatedOn < @1';
    (lstView.dataService as CRUDService).dataValues = `${fromDate};${toDate}`;
    lstView.dataService
      .setPredicate(this.predicate, [this.dataValue])
      .subscribe();
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

  getParam() {
    this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetDataInCalendarAsync',
        'WPCalendars'
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
          if (this.WP_Notes) {
            this.WP_Notes.forEach((res) => {
              if (res.isPin == true || res.isPin == '1') {
                this.countNotePin++;
              }
            });
          }
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

    // if(calendarWP == 0) {
    // var spanT = document.querySelector("span.note-point") as HTMLElement;
    // spanT.parentNode.removeChild(spanT);
    // }
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
      700,
      500,
      '',
      obj,
      '',
      option
    );
    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.recID = data?.recID;
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
      };
      this.callfc.openForm(
        UpdateNotePinComponent,
        'Cập nhật ghi chú đã ghim',
        500,
        600,
        '',
        obj
      );
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
      maxPinNotes: this.maxPinNotes,
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc.openForm(
      AddNoteComponent,
      'Thêm mới ghi chú',
      700,
      500,
      '',
      obj,
      '',
      option
    );
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
    data.isNote = true;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        data?.recID,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          var object = [{ data: data, type: 'edit' }];
          this.noteService.data.next(object);
          for (let i = 0; i < this.WP_Notes.length; i++) {
            if (this.WP_Notes[i].recID == data?.recID) {
              this.WP_Notes[i].isPin = res.isPin;
            }
          }
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  onDeleteNote(item) {
    this.notification.alertCode('SYS027').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.api
          .exec<any>(
            'ERM.Business.WP',
            'NotesBusiness',
            'DeleteNoteAsync',
            item?.recID
          )
          .subscribe((res) => {
            if (res) {
              if (res.fileCount > 0) this.deleteFile(res.recID, true);
              var object = [{ data: res, type: 'delete' }];
              this.noteService.data.next(object);
            }
          });
      } else {
        return;
      }
    });
  }

  deleteFile(fileID: string, deleted: boolean) {
    if (fileID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'DeleteByObjectIDAsync',
          [fileID, 'WP_PersonalNotes', deleted]
        )
        .subscribe();
    }
  }

  openFormNoteBooks(item) {
    var obj = {
      itemUpdate: item,
    };
    this.callfc.openForm(SaveNoteComponent, '', 900, 650, '', obj);
  }
}
