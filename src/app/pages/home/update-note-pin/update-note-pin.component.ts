import { ApiHttpService, CallFuncService, DialogData } from 'codx-core';
import { Component, OnInit, Input, ChangeDetectorRef, Optional } from '@angular/core';
import { Notes } from '@shared/models/notes.model';

@Component({
  selector: 'app-update-note-pin',
  templateUrl: './update-note-pin.component.html',
  styleUrls: ['./update-note-pin.component.scss']
})
export class UpdateNotePinComponent implements OnInit {

  @Input() dataAdd = new Notes();
  @Input() dataUpdate = new Notes();
  messageOld: any;
  listNoteOld: any[] = [];
  type: any;
  isCalendarOld: any;
  itemUpdate: any;
  recID: any;
  recIdOld: any;
  isPinOld: any;
  lstview: any;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    @Optional() data?: DialogData,
  ) { 
    this.lstview = data.data?.lstview;
    this.itemUpdate = data.data?.data;
    this.recID = data.data?.recID;
  }

  ngOnInit(): void {
  }

  valueChange(e, recID = null, item = null) {
    var field = e.field;
    if (field == "checkboxUpdateNotePin") {
      this.messageOld = item.memo;
      this.listNoteOld = item.checkList;
      this.isPinOld = !item.isPin;
      this.isCalendarOld = item.showCalendar;
      this.recIdOld = recID;
      this.onEditIsPin();
    }
  }

  valueProperty(e) {
    let i = 0;
    var date;
    var arr = [];
    let countNote = 0;
    let countLstNotePin = 0;
    for (i; i < e.datas.length; i++) {
      date = e.datas[i].createdOn;
      var dateParse = new Date(Date.parse(date));
      arr.push(dateParse);
      countLstNotePin++;
      if (e.datas[i].isPin == true) {
        countNote++;
      }
    }
    console.log("CHECK valueProperty", e)
  }

  onEditIsPin() {
    if (this.type == "check" || this.type == "list") {
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
        console.log("CHECK onEditIsPin", res);
        this.changeDetectorRef.detectChanges();
      });
  }

  onEditNote() {
    if (this.itemUpdate.noteType == "check" || this.itemUpdate.noteType == "list") {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.itemUpdate.checkList;

    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.itemUpdate.memo
    }
    this.dataAdd.isPin = this.itemUpdate.isPin;
    this.dataAdd.showCalendar = this.itemUpdate.showCalendar;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.recID, this.dataAdd])
      .subscribe((res) => {
        this.changeDetectorRef.detectChanges();
      });
  }

  testload(dt){
   console.log(dt);
  }
}
