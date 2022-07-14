import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CallFuncService, ApiHttpService, CodxListviewComponent, UIComponent, DialogModel, CRUDService, DialogRef } from 'codx-core';
import { AddNoteComponent } from '@pages/home/add-note/add-note.component';

import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, Injector } from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { AddUpdateNoteBookComponent } from 'projects/codx-mwp/src/lib/personals/note-books/add-update-note-book/add-update-note-book.component';
import { UpdateNotePinComponent } from '@pages/home/update-note-pin/update-note-pin.component';
import { SaveNoteComponent } from '@pages/home/add-note/save-note/save-note.component';
import { NoteService } from '@pages/services/note.services';

@Component({
  selector: 'app-note-drawer',
  templateUrl: './note-drawer.component.html',
  styleUrls: ['./note-drawer.component.scss'],
})
export class NoteDrawerComponent extends UIComponent implements OnInit {

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
  header = 'Ghi chú';
  dialog: DialogRef;

  @ViewChild('listview') lstView: CodxListviewComponent;
  constructor(private injector: Injector,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private noteService: NoteService,
  ) {
    super(injector)
  }

  onInit(): void {
    this.noteService.data.subscribe((res) => {
      (this.lstView.dataService as CRUDService).add(res).subscribe(res=>{
        this.changeDetectorRef.detectChanges();
     });
    })
    this.getMaxPinNote();
  }

  ngAfterViewInit() {
    // this.onCountNotePin();
  }

  getMaxPinNote() {
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'GetParamAsync')
      .subscribe((res) => {
        this.maxPinNotes = res[0].msgBodyData[0].fieldValue;
      });
  }

  valueChange(e, recID = null, item = null) {
    if (e) {
      var field = e.field;
      if (field == 'textarea') this.message = e.data.checked.checked;
      else if (item) {
        this.message = '';
        item[field] = e.data.checked;
      }
    }
  }

  onCountNotePin() {
    // let i = 0;
    // let ip = 0;
    // let np = 0;
    // for (i; i < dt.length; i++) {
    //   if (dt[i].isPin == true) {
    //     ip++;
    //   } else if (dt[i].isPin == false) {
    //     np++;
    //   }
    // }
    // this.countIsPin = ip;
    // this.countNotPin = np;
  }

  openFormUpdateNote(data) {
    var obj = {
      data: this.lstView.dataService.data,
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
    var that = this;
    var dt = that.lstView.dataService.data;
    dt.forEach((res) => {
      if (res.isPin == true || res.isPin == '1') {
        that.countNotePin += 1;
      }
    })
    debugger;
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
        data: this.lstView.dataService.data,
        itemUpdate: data,
      }
      this.callfc.openForm(UpdateNotePinComponent, "Cập nhật ghi chú đã ghim", 500, 600, "", obj);
    } else {
      this.onEditIsPin(data);
    }
  }

  openFormAddNote() {
    var obj = {
      data: this.lstView.dataService.data,
      typeLst: this.typeList,
      formType: 'add',
    };
    let option = new DialogModel();
    option.DataService = this.lstView.dataService as CRUDService;
    option.FormModel = this.lstView.formModel;
    this.callfc
      .openForm(AddNoteComponent, 'Thêm mới ghi chú', 600, 450, '', obj, '', option);
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
        for (let i = 0; i < this.lstView.dataService.data.length; i++) {
          if (this.lstView.dataService.data[i].recID == data?.recID) {
            this.lstView.dataService.data[i].isPin = res.isPin;
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
          this.lstView.dataService.data = this.lstView.dataService.data.filter(x => x.recID != res.recID)
          // this.setEventWeek();
          var today: any = document.querySelector(
            ".e-footer-container button[aria-label='Today']"
          );
          if (today) {
            today.click();
          }
          this.changeDetectorRef.detectChanges();
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
