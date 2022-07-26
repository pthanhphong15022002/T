import { CodxFormComponent, NotificationsService } from 'codx-core';
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
  ViewEncapsulation,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TempNote, Notes, NoteFile, NoteType } from '@shared/models/notes.model';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { editAreaClick } from '@syncfusion/ej2-angular-richtexteditor';
import { NoteServices } from '@pages/services/note.services';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { DatePipe } from '@angular/common';
import { UpdateNotePinComponent } from '../update-note-pin/update-note-pin.component';
@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddNoteComponent implements OnInit {
  dataAdd = new Notes();
  dataUpdate = new Notes();
  note: any = new Notes();
  noteFile: NoteFile = new NoteFile();
  noteType: NoteType = new NoteType();
  tempNote: TempNote = new TempNote();
  message: any;
  listNote: any = [];
  type = 'text';
  label = 'Hiển thị trên lịch';
  showCalendar = false;
  pin: any = false;
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
  currentDate: any;
  checkUpdate = false;
  maxPinNotes = 0;
  countNotePin = 0;
  component: any;
  typeEntity = '';

  @ViewChild('txtNoteEdit') txtNoteEdit: ElementRef;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
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
    private noteService: NoteServices,
    private dmSV: CodxDMService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.data = dt.data?.data;
    this.formType = dt.data?.formType;
    this.dataListView = dt.data?.ngForLstview;
    this.currentDate = dt.data?.currentDate;
    this.maxPinNotes = dt.data?.maxPinNotes;
    this.component = dt.data?.component;
    if (this.component == 'note-drawer')
      this.currentDate = new Date(Date.now());
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
      this.note = JSON.parse(JSON.stringify(dt.data?.dataUpdate));
      this.listFileUploadEdit = this.note.images;
      if (this.note.noteType != 'text')
        this.addFirstObjectInArray();
      this.getNumberNotePin();
    }
    this.noteType.text = true;
    this.cache.gridViewSetup('PersonalNotes', 'grvPersonalNotes').subscribe(res => {
      console.log("check gridViewSetup", res);
    });
  }

  getNumberNotePin() {
    this.data.forEach((res) => {
      if (res.isPin == true || res.isPin == '1') {
        this.countNotePin++;
      }
    })
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
    if (this.formType == 'edit') {
      this.getFileByObjectId();
      this.checkActiveFormEdit();
    }
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

  valueChangeDate(e) {
    if (e.data.fromDate == null || e.data.fromDate == undefined) {
      this.currentDate = "";
      var date = new Date(e.data);
      var crr = date.toLocaleDateString();
      this.currentDate = crr;
    } else {
      var date = new Date(e.data.fromDate);
      var crr = date.toLocaleDateString();
      this.currentDate = "";
      this.currentDate = crr;
    }
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
    this.note.createdOn = this.currentDate;
    var dateNow = new Date(Date.now());

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
          if (res) {
            this.typeEntity = 'WP_Notes';
            if (this.checkFile == true) {
              this.attachment.objectId = res.recID;
              this.attachment.saveFiles();
            }
            var object = [];
            if (this.note.createdOn != dateNow.toLocaleDateString())
              object = [{ data: res, type: 'add-otherDate' }]
            else
              object = [{ data: res, type: 'add-currentDate' }]
            this.noteService.data.next(object);
            this.dialog.close()
            if (this.note?.showCalendar == true) {
              var today: any = document.querySelector(
                ".e-footer-container button[aria-label='Today']"
              );
              if (today) {
                today.click();
              }
            }
            this.changeDetectorRef.detectChanges();
          }
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

  openFormUpdateIsPin(data) {
    var obj = {
      data: this.data,
      itemUpdate: data,
    }
    this.callfc.openForm(UpdateNotePinComponent, "Cập nhật ghi chú đã ghim", 500, 600, "", obj)
  }

  onEditNote() {
    if (this.checkPin == true) {
      if (this.countNotePin + 1 > this.maxPinNotes) {
        if (this.pin == '1' || this.pin == true) {
          this.openFormUpdateIsPin(this.note);
        } else {
          this.countNotePin -= 1;
          this.onEdit();
        }
      } else {
        if (this.pin == '1' || this.pin == true)
          this.countNotePin += 1;
        else this.countNotePin -= 1;
        this.onEdit();
      }
    } else this.onEdit();
  }

  onEdit() {
    var dateNow = new Date(this.note.createdOn);
    this.note.createdOn = this.currentDate;

    if (this.checkPin == true)
      this.note.isPin = this.pin;
    this.note.checkList = this.listNote;
    this.note.checkList.shift()
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.note?.recID, this.note])
      .subscribe((res) => {
        if (res) {
          this.checkUpdate = true;
          if (this.checkFile == true)
            this.attachment.saveFiles();
          var object = [];
          if (dateNow.toLocaleDateString() == this.currentDate)
            object = [{ data: res, type: 'edit-currentDate' }]
          else
            object = [{ data: res, type: 'edit-otherDate' }]
          this.noteService.data.next(object);
          this.dialog.close();
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

  listFileUpload: any[] = []
  listFileUploadEdit: any[] = []
  isUploadImg = false;
  isUploadFile = false;
  getfileCount(event: any) {
    if (!event || event.data.length <= 0) {
      this.isUploadFile = false;
      this.listFileUpload = [];
      this.dmSV.fileUploadList = []
      return;
    }
    else {
      this.isUploadImg = true;
      this.isUploadFile = true;
      this.listFileUpload = event.data;
    }
    this.changeDetectorRef.detectChanges();
  }

  getfile(event: any) {
    if (!event || event.data.length <= 0) {
      this.isUploadFile = false;
      this.listFileUploadEdit = [];
      this.dmSV.fileUploadList = [];
      return;
    }
    else {
      this.isUploadImg = true;
      this.isUploadFile = true;
      var lstFile = event.data;
      this.listFileUploadEdit.push(lstFile)
    }
    this.changeDetectorRef.detectChanges();
  }

  getFileByObjectId() {
    this.api.exec<any>(
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByObjectIDImageAsync',
      this.note.recID
    ).subscribe((res) => {
    })
  }
}
