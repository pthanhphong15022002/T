import { Dialog } from '@syncfusion/ej2-angular-popups';
import { SaveNoteComponent } from './../add-note/save-note/save-note.component';
import { ApiHttpService, CallFuncService, DialogData } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, Input, Optional } from '@angular/core';
import { StatusNote } from '@shared/models/enum/enum';
import { Notes, NoteGoal } from '@shared/models/notes.model';

@Component({
  selector: 'app-update-note',
  templateUrl: './update-note.component.html',
  styleUrls: ['./update-note.component.scss']
})
export class UpdateNoteComponent implements OnInit {

  @Input() dataAdd = new Notes();
  @Input() dataUpdate = new Notes();
  message: any;
  listNote: any[] = [];
  type: any;
  isCalendar = false;
  label = "Hiển thị trên lịch";
  itemUpdate: any;
  recID: any;
  isPin: any
  countNotePin: any;
  maxPinNotes: any;
  lstview: any = [];
  itemFirst: any;
  objectID: any;
  dataEnter: any[] = [{ status: 0, listNote: '' }];
  dialog: Dialog;

  STATUS_NOTE = StatusNote;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    @Optional() data?: DialogData,
    @Optional() dialog?: Dialog
  ) {
    this.dialog = dialog;
    this.lstview = data.data?.lstview;
    this.itemUpdate = data.data?.data;
    this.listNote = this.itemUpdate.checkList;
    if (this.itemUpdate.noteType != "text") {
      this.itemFirst = this.itemUpdate.checkList[0];
    }
    this.recID = data.data?.recID;
  }

  ngOnInit(): void {
  }

  onType(type) {
    this.type = type;
    this.listNote = [];
    if (type == "list" || type == "check") {
      var todoCheck = { "status": type != "check" ? null : 0, "listNote": "" };
      this.listNote.push((Object.assign({}, todoCheck)));
      this.changeDetectorRef.detectChanges();
    }
  }

  valueChange(e, item = null) {
    this.countNotePin = 0;
    if (e) {
      var field = e.field;
      if (field == "textarea")
        this.message = e.data.value;
      else if (field == 'inputFirst') {
        this.itemFirst = { "status": 0, "listNote": e.data };
      } else if (field == 'status') {
        item['status'] = e.data.checked;
      } else if (item) {
        this.message = "";
        item[field] = e.data;
      }
    }
  }

  onGetData() {
    let i = 0;
    for (i; i <= this.itemUpdate.checkList.length; i++) {
      var todoCheck = { "status": this.itemUpdate.checkList[i].status, "listNote": this.itemUpdate.checkList[i].listNote };
      this.listNote.push(Object.assign({}, todoCheck));
    }
    this.changeDetectorRef.detectChanges();
  }

  onUpdateNote(item: NoteGoal) {
    this.dataEnter[0] = { status: 0, listNote: '' };
    var dt = { status: item.status, listNote: item.listNote };
    this.listNote.push(Object.assign({}, dt));
    this.changeDetectorRef.detectChanges();
    this.itemUpdate.checkList = this.listNote;
    var ele = document.getElementsByClassName('test-textbox');
    if (ele) {
      let htmlEle = ele[0] as HTMLElement;
      htmlEle.focus();
    }
  }

  onEditNote() {
    if (this.itemUpdate.noteType == "check" || this.itemUpdate.noteType == "list") {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.listNote;

    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.message;
    }
    this.dataAdd.noteType = this.itemUpdate.noteType;
    this.dataAdd.isPin = this.itemUpdate.isPin;
    this.dataAdd.showCalendar = this.itemUpdate.showCalendar;
    this.dataAdd.transID = null;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.recID, this.dataAdd])
      .subscribe((res) => {
        if (res) {
          var obj: any = {result: res};
          this.dialog.hide(obj);
          for (let i = 0; i < this.lstview.length; i++) {
            if (this.lstview[i].recID == this.recID) {
              this.lstview[i].checkList = res.checkList;
              this.lstview[i].memo = res.memo;
            }
          }
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  openFormNoteBooks() {
    var obj = {
      noteType: this.itemUpdate.noteType,
      memo: this.itemUpdate.memo,
      checkList: this.itemUpdate.checkList,
      recID: this.itemUpdate.recID,
    };
    this.callfc.openForm(
      SaveNoteComponent,
      'Cập nhật ghi chú', 0, 0, '', obj
    );
  }
}
