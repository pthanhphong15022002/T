import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CallFuncService, ApiHttpService, CodxListviewComponent } from 'codx-core';
import { AddNoteComponent } from '@pages/home/add-note/add-note.component';

import { Component, OnInit, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { AddUpdateNoteBookComponent } from 'projects/codx-mwp/src/lib/personals/note-books/add-update-note-book/add-update-note-book.component';

@Component({
  selector: 'app-note-drawer',
  templateUrl: './note-drawer.component.html',
  styleUrls: ['./note-drawer.component.scss'],
})
export class NoteDrawerComponent implements OnInit {

  @Input() dataAdd = new Notes();

  data: any;
  message: any;
  listNote: any[] = [];
  messageOld: any;
  listNoteOld: any[] = [];
  type: any;
  isCalendar = false;
  isCalendarOld: any;
  noteTypeOld: any;
  itemUpdate: any;
  recID: any;
  recIdOld: any;
  isPin: any;
  isPinOld: any;
  countNotePin: any;
  maxPinNotes: any;
  checkUpdateNotePin = false;
  TM_Tasks: any;
  WP_Notes: any;
  TM_TasksParam: any;
  WP_NotesParam: any;
  param: any;
  countIsPin = 0;
  countNotPin = 0;
  typeList = "note-drawer";

  @ViewChild('listview') lstView: CodxListviewComponent;
  constructor(
    private api: ApiHttpService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
  ) { }

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents() {
    this.api
      .callSv("SYS", "ERM.Business.CM", "ParametersBusiness", "GetDataByRecIDAsync", ["WP_Calendars", "", "SettingShow"])
      .subscribe((res) => {
        if (res && res.msgBodyData) {
          this.param = res.msgBodyData[0];
          //this.arrKey = Object.keys(this.param);
          //this.dataObj = {tm_task: "ddddd"};
          this.TM_Tasks = this.param[0];
          this.WP_Notes = this.param[1];
          this.TM_TasksParam = this.param[2].TM_Tasks;
          this.WP_NotesParam = this.param[2].WP_Notes;


          for (let i = 0; i < this.WP_Notes.length; i++) {
            var date = this.WP_Notes[i].createdOn;
            var daq = new Date(Date.parse(date));
            var d = daq.toLocaleDateString();
          }
        }
        this.onCountNotePin();
      });
  }

  valueChange(e, recID = null, item = null) {
    if (e) {
      var field = e.field;
      if (field == "textarea")
        this.message = e.data;
      else if (field == "pinNote") {
        if (e.data == true) {
          if ((this.countNotePin + 1) <= this.maxPinNotes) {
            this.onEditNote();
            this.countNotePin += 1;
          } else if ((this.countNotePin + 1) > this.maxPinNotes) {
            this.checkUpdateNotePin = true;
          }
        } else {
          this.onEditNote();
        }
      } else if (field == "checkboxUpdateNotePin") {
        this.messageOld = item.memo;
        this.listNoteOld = item.checkList;
        this.isPinOld = !item.isPin;
        this.isCalendarOld = item.showCalendar;
        this.recIdOld = recID;
        this.noteTypeOld = item.noteType;
        this.onEditIsPin();
      } else if (field == "WP_Notes_ShowEvent") {
        // if (e.data == false) {
        //   this.checkWP_NotesParam = false;
        // } else {
        //   this.checkWP_NotesParam = true;
        // }

        // var today: any = document.querySelector(".e-footer-container button[aria-label='Today']");
        // if (today) {
        //   today.click();
        // }
        // this.setEventWeek();
      } else if (field == "TM_Tasks_ShowEvent") {
        // if (e.data == false) {
        //   this.checkTM_TasksParam = false;
        // } else {
        //   this.checkTM_TasksParam = true;
        // }

        // var today: any = document.querySelector(".e-footer-container button[aria-label='Today']");
        // if (today) {
        //   today.click();
        // }
        // this.setEventWeek();
      } else if (item) {
        this.message = "";
        item[field] = e.data;
      }
    }
  }

  onCountNotePin() {
    var dt = this.WP_Notes;
    let i = 0;
    let ip = 0;
    let np = 0;
    for (i; i < dt.length; i++) {
      if (dt[i].isPin == true) {
        ip++;
      } else if (dt[i].isPin == false) {
        np++;
      }
    }
    this.countIsPin = ip;
    this.countNotPin = np;
  }

  openFormAddNote() {
    var obj = {
      lstview: this.lstView,
      ngForLstview: this.WP_Notes,
      typeLst: this.typeList,
      formType: 'add',
    }
    this.callfc.openForm(AddNoteComponent, "Thêm mới ghi chú", 600, 450, "", obj);
  }

  openFormPinNote(content, recID, data = null) {
    // this.modalService.open(content, { centered: true });
    this.itemUpdate = data;
    this.listNote = data.checkList;
    this.message = data.memo;
    this.isCalendar = data.showCalendar;
    this.isPin = data.isPin;
    this.recID = recID;
    this.type = data.noteType;
  }

  openFormUpdateIsPin(content) {
    if (this.checkUpdateNotePin == true) {
      this.modalService.open(content, { centered: true });
    } else return;
  }

  onDeleteNote(recID) {
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "DeleteNoteAsync", recID)
      .subscribe((res) => {
        this.lstView.dataService.data = this.lstView.dataService.data.filter(x => x.recID != res.recID);
        this.changeDetectorRef.detectChanges();

        var today: any = document.querySelector(".e-footer-container button[aria-label='Today']");
        if (today) {
          today.click();
        }
      });
  }

  openFormUpdateNote(recID, data = null) {
    var obj = {
      lstview: this.lstView,
      recID: recID,
      data: data,
    }
    this.callfc.openForm(AddUpdateNoteBookComponent, "Cập nhật ghi chú", 0, 0, "", obj);
    this.itemUpdate = data;
    this.listNote = this.itemUpdate.checkList;
    this.type = data.noteType;
    this.recID = recID;
  }

  onEditNote() {
    if (this.type == "check" || this.type == "list") {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.listNote;

    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.message
    }
    // this.api.execAction("WP_Notes", [this.dataAdd], "UpdateAsync").subscribe((res: any) => {
    //   console.log(res);
    // });
    this.dataAdd.isPin = !this.isPin;
    this.dataAdd.showCalendar = this.isCalendar;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.recID, this.dataAdd])
      .subscribe((res) => {
        this.changeDetectorRef.detectChanges();
      });
  }

  onEditIsPin() {
    if (this.noteTypeOld == "check" || this.noteTypeOld == "list") {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.listNoteOld;

    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.messageOld
    }
    this.dataAdd.isPin = this.isPinOld;
    this.dataAdd.showCalendar = this.isCalendarOld;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.recIdOld, this.dataAdd])
      .subscribe((res) => {
        this.changeDetectorRef.detectChanges();
      });
  }
}
