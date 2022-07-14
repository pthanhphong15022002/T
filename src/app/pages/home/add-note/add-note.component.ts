import { CodxFormComponent, NotificationsService } from 'codx-core';
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
import { editAreaClick } from '@syncfusion/ej2-angular-richtexteditor';
import { NoteService } from '@pages/services/note.services';
@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
})
export class AddNoteComponent implements OnInit {
  dataAdd = new Notes();
  dataUpdate = new Notes();
  note: any = new Notes();
  noteType: NoteType = new NoteType();
  tempNote: TempNote = new TempNote();
  message: any;
  listNote: any = [];
  type = 'text';
  label = 'Hiển thị trên lịch';
  showCalendar = false;
  pin = false;
  formType = '';
  data: any;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  user: any;
  dialog: DialogRef;
  formAdd: FormGroup;
  readOnly = false;
  header = 'Thêm mới sổ tay';
  dataListView = [];
  checkNull = false;
  save = false;
  gridViewSetup: any;
  checkFile = false;
  checkPin = false;
  empty = "";

  @ViewChild('txtNoteEdit') txtNoteEdit: ElementRef;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent
  @ViewChild("form", { static: true }) form: CodxFormComponent;
  @Output() loadData = new EventEmitter();
  @Output() closePopup = new EventEmitter();

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private callfc: CallFuncService,
    private cache: CacheService,
    private notificationsService: NotificationsService,
    private noteService: NoteService, 
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
      if (this.note.noteType != 'text')
        this.addFirstObjectInArray();
    }
    this.noteType.text = true;
    this.cache.gridViewSetup('PersonalNotes', 'grvPersonalNotes').subscribe(res => {
      console.log("check gridViewSetup", res);
    });
  }

  addFirstObjectInArray() {
    var dtFirst: any;
    if (this.note.noteType == 'check')
      dtFirst = [{ status: 0, listNote: '' }];
    else
      dtFirst = [{ status: null, listNote: '' }];
    this.note.checkList.unshift(dtFirst[0]);
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
              if (field == 'status') data.status = dt;
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
      if (this.listNote == null || this.listNote == '')
        this.checkNull = true;
      else this.checkNull = false;
    } else {
      this.note.checkList = null;
      if (this.note.memo == null || this.note.memo == '')
        this.checkNull = true;
      else this.checkNull = false;

    }
    if (this.checkNull == false) {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'NotesBusiness',
          'CreateNoteAsync',
          this.note
        )
        .subscribe((res) => {
          if (this.checkFile == true) {
            this.attachment.objectId = res.recID;
            this.attachment.saveFiles();
          }
          this.noteService.data.next(res);
          this.dialog.close()
          // this.data.push(res);
          this.dialog.dataService.add(res, 0).subscribe();
          if (this.note?.showCalendar == true) {
            var today: any = document.querySelector(
              ".e-footer-container button[aria-label='Today']"
            );
            if (today) {
              today.click();
            }
          }
          this.changeDetectorRef.detectChanges();
        });
    } else {
      this.notificationsService.notify(
        'Vui lòng nhập ghi chú',
        'error',
        2000
      );

      this.listNote[0] = {
        status: this.type == 'check' ? 0 : null,
        listNote: '',
      };
    }
  }

  onEditNote() {
    if(this.checkPin == true)
      this.note.isPin = this.pin;
    this.note.checkList = this.listNote;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.note?.recID, this.note])
      .subscribe((res) => {
        if (res) {
          if (this.checkFile == true)
            this.attachment.saveFiles();
          this.dialog.close();
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
    this.checkPin = true;
    this.pin = !this.pin;
    this.changeDetectorRef.detectChanges();
  }


  openFormNoteBooks() {
    if (this.formType == 'edit') {
      var obj = {
        itemUpdate: this.note,
      };
      this.callfc.openForm(SaveNoteComponent, 'Cập nhật ghi chú', 900, 650, '', obj);
    } else {
      this.notificationsService.notify(
        'Vui lòng thêm mới ghi chú',
        'error',
        2000
      );
    }
  }

  popupFile() {
    this.attachment.uploadFile();
    this.checkFile = true;
  }

  fileAdded() {
    this.attachment.saveFiles();
  }

  close() {
    this.dialog.close();
  }
}
