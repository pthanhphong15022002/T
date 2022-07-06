import { NoteType } from './../../../../shared/models/notes.model';
import { FormGroup, FormControl } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { SaveNoteComponent } from './save-note/save-note.component';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
} from 'codx-core';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  Optional,
  EventEmitter,
  Output,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TempNote, Notes } from '@shared/models/notes.model';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
})
export class AddNoteComponent implements OnInit {
  dataAdd = new Notes();
  dataUpdate = new Notes();
  note: Notes = new Notes();
  noteType: NoteType = new NoteType();
  tempNote: TempNote = new TempNote();
  message: any;
  listNote: any = [];
  type = 'text';
  label = 'Hiển thị trên lịch';
  showCalendar = false;
  pin = false;
  // lstview: any = [];
  // lstviewNotePin: any;
  // typeList_: any;
  // ngForLstview_: any;
  formType = '';
  data: any;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  user: any;
  dialog: any;
  formAdd: FormGroup;
  readOnly = false;
  header = 'Thêm mới sổ tay';
  dataListView = [];

  @ViewChild('txtNoteEdit') txtNoteEdit: ElementRef;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent
  @ViewChild("form", { static: true }) form: any;
  @Output() loadData = new EventEmitter();
  @Output() closePopup = new EventEmitter();

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private callfc: CallFuncService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.data = dt.data?.data;
    this.formType = dt.data?.formType;
    this.dataListView = dt.data?.ngForLstview;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
      this.note = dt.data?.dataUpdate;
    }
    this.noteType.text = true;
    this.cache.gridViewSetup('PersonalNotes', 'grvPersonalNotes');
  }
  ngAfterViewInit() {
    if (this.formType == 'edit')
      this.checkActiveFormEdit();
  }

  ngOnInit(): void {
    this.initForm();
  }

  checkActiveFormEdit() {
    if (this.note?.noteType == 'text') {
      this.noteType.text = true;
      this.noteType.check = false;
      this.noteType.list = false;
    } else if (this.note?.noteType == 'check') {
      this.noteType.check = true;
      this.noteType.text = false;
      this.noteType.list = false;
    } else {
      this.noteType.list = true;
      this.noteType.check = false;
      this.noteType.text = false;
    }
    this.pin = this.note?.isPin;
  }

  checkActiveFormAdd() {
    if (this.type == 'text') {
      this.noteType.text = true;
      this.noteType.check = false;
      this.noteType.list = false;
    } else if (this.type == 'check') {
      this.noteType.check = true;
      this.noteType.text = false;
      this.noteType.list = false;
    } else {
      this.noteType.list = true;
      this.noteType.check = false;
      this.noteType.text = false;
    }
  }

  saveNote() {
    if (this.formType == 'add') this.onCreateNote();
    else this.onEditNote();
  }

  initForm() {
    this.formAdd = new FormGroup({
      noteType: new FormControl(''),
      memo: new FormControl(''),
      checkList: new FormControl(''),
    });
    this.changeDetectorRef.detectChanges();
  }

  clearForm() {
    this.formAdd.controls['noteType'].setValue(null);
    this.formAdd.controls['memo'].setValue(null);
    this.formAdd.controls['checkList'].setValue(null);
    this.changeDetectorRef.detectChanges();
  }

  valueChange(e, item = null) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.note[field] = dt?.value ? dt?.value : dt;
      if (this.type == 'check' || this.type == 'list'
        || this.note?.noteType == 'check' || this.note?.noteType == 'list') {
        if (item?.lisNote != '') {
          if (this.formType == 'edit') this.listNote = this.note.checkList;
          this.listNote.forEach((data) => {
            if (item?.listNote == data.listNote) {
              if (field == 'status') data.status = dt
              else data.listNote = dt;
            }
          })
        }
      }
    }
  }

  onCreateNote() {
    this.note.noteType = this.type;
    this.note.isPin = this.pin;
    if (this.type == 'check' || this.type == 'list') {
      this.listNote.shift();
      this.note.checkList = this.listNote;
      this.note.memo = null;
    } else {
      this.note.checkList == null;
    }
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'CreateNoteAsync',
        this.note
      )
      .subscribe((res) => {
        this.data.push(res);
        if (this.note?.showCalendar == true) {
          this.changeDetectorRef.detectChanges();
          var today: any = document.querySelector(
            ".e-footer-container button[aria-label='Today']"
          );
          if (today) {
            today.click();
          }
        }
      });
  }

  onEditNote() {
    this.note.checkList = this.listNote;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.note?.recID, this.note])
      .subscribe((res) => {
        if (res) {
          for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].recID == this.note?.recID) {
              this.data[i].checkList = res.checkList;
              this.data[i].memo = res.memo;
            }
          }
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  keyUpEnter(e: any) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (dt) {
        if (this.type == 'check') {
          if (field == 'listNote') {
            this.tempNote['listNote'] = dt;
            this.tempNote['status'] = 0;
          }
        } else {
          this.tempNote['listNote'] = dt;
          this.tempNote['status'] = null;
        }
      }
    }
  }

  onType(type) {
    if (this.formType == 'add') {
      this.type = type;
      this.listNote = [];
      if (type == 'list' || type == 'check') {
        var todoCheck = { status: type == 'check' ? 0 : null, listNote: '' };
        this.listNote.push(todoCheck);
        this.changeDetectorRef.detectChanges();
      }
      this.checkActiveFormAdd();
    }
  }

  onUpdateNote(e: any) {
    this.listNote[0] = {
      status: this.type == 'check' ? 0 : null,
      listNote: '',
    };
    this.keyUpEnter(e);

    var dt = { status: this.tempNote.status, listNote: this.tempNote.listNote };
    this.listNote.push(Object.assign({}, dt));
    this.changeDetectorRef.detectChanges();
    var ele = document.getElementsByClassName('test-textbox');
    if (ele) {
      let htmlEle = ele[0] as HTMLElement;
      htmlEle.focus();
    }
  }

  isPin() {
    this.pin = !this.pin;
    this.changeDetectorRef.detectChanges();
  }

  // onEditNote(recID) {
  //   if (this.type == 'check' || this.type == 'list') {
  //     this.dataUpdate.memo = null;
  //     this.dataUpdate.checkList = this.listNote;
  //   } else {
  //     this.dataUpdate.checkList = null;
  //     this.dataUpdate.memo = this.message;
  //   }
  //   this.dataUpdate.noteType = this.type;
  //   this.dataUpdate.isPin = false;
  //   this.dataUpdate.showCalendar = false;
  //   this.dataUpdate.transID = recID;
  //   this.api
  //     .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
  //       this.data.recID,
  //       this.dataUpdate,
  //     ])
  //     .subscribe((res) => {
  //       if (res) {
  //         this.changeDetectorRef.detectChanges();
  //       }
  //     });
  // }

  openFormNoteBooks() {
    var obj = {
      data: this.note,
    };
    this.callfc.openForm(SaveNoteComponent, 'Cập nhật ghi chú', 900, 650, '', obj);
  }

  popupFile() {
    this.attachment.uploadFile();
  }

  fileAdded() {
    this.attachment.saveFiles();
  }
}
