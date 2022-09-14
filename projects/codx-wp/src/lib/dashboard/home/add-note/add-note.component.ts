import {
  CodxFormComponent,
  CRUDService,
  DialogModel,
  NotificationsService,
} from 'codx-core';
import { FormGroup, FormControl } from '@angular/forms';
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
import {
  TempNote,
  Notes,
  NoteFile,
  NoteType,
} from '@shared/models/notes.model';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { editAreaClick } from '@syncfusion/ej2-angular-richtexteditor';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { DatePipe } from '@angular/common';
import { UpdateNotePinComponent } from '../update-note-pin/update-note-pin.component';
import { NoteServices } from '../../../services/note.services';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddNoteComponent implements OnInit {
  note: any = new Notes();
  noteType: NoteType = new NoteType();
  tempNote: TempNote = new TempNote();
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
  empty = '';
  currentDate: any;
  checkUpdate = false;
  maxPinNotes = 0;
  countNotePin = 0;
  component: any;
  countValueChange = 0;
  date1: any;
  date2: any;
  countUpdateTodo = 0;
  defaultShowCalendar = true;
  checkSwitch = false;
  functionList: any;
  listFileUpload: any = new Array();
  listFileEdit: any = new Array();

  @ViewChild('txtNoteEdit') txtNoteEdit: ElementRef;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('attachmentAdd') attachmentAdd: AttachmentComponent;
  @ViewChild('attachmentEdit') attachmentEdit: AttachmentComponent;
  @ViewChild('codxFileAdd') codxFileAdd: ImageGridComponent;
  @ViewChild('codxFileEdit') codxFileEdit: ImageGridComponent;
  @ViewChild('form', { static: true }) form: CodxFormComponent;
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
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt.data?.data;
    this.formType = dt.data?.formType;
    this.dataListView = dt.data?.ngForLstview;
    this.currentDate = dt.data?.currentDate;
    this.maxPinNotes = dt.data?.maxPinNotes;
    this.component = dt.data?.component;
    this.cache.functionList('WPT08').subscribe((res) => {
      if (res) this.functionList = res;
    });
    if (this.component == 'note-drawer') {
      if (this.formType == 'add') this.currentDate = new Date(Date.now());
      else
        this.currentDate = JSON.parse(
          JSON.stringify(dt.data?.dataUpdate?.createdOn)
        );
    }
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
      this.note = JSON.parse(JSON.stringify(dt.data?.dataUpdate));
      this.type = this.note?.noteType;
      this.listFileUpload = this.note?.files;
      var dtt = {
        status: this.type == 'check' ? 0 : null,
        listNote: '',
      };
      if (this.note.noteType != 'text') this.note.checkList.push(dtt);
    }
    this.getNumberNotePin();
    this.noteType.text = true;
  }

  getNumberNotePin() {
    if (this.data) {
      this.data.forEach((res) => {
        if (res.isPin == true || res.isPin == '1') {
          this.countNotePin++;
        }
      });
    }
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
    if (this.formType == 'add') this.checkPinWithFormAdd();
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
    this.countValueChange++;
    var date = new Date(e.data.fromDate);
    var crr = date.toLocaleDateString();
    this.currentDate = '';
    this.currentDate = crr;
    if (this.countValueChange == 1) {
      var date1 = new Date(e.data.fromDate);
      var crr1 = date1.toLocaleDateString();
      this.date1 = crr1;
    } else if (this.countValueChange > 1) {
      var date2 = new Date(e.data.fromDate);
      var crr2 = date2.toLocaleDateString();
      this.date2 = crr2;
    }
  }

  valueChange(e, item = null, index = null) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.note[field] = dt?.value ? dt?.value : dt;
      if (
        this.type == 'check' ||
        this.type == 'list' ||
        this.note?.noteType == 'check' ||
        this.note?.noteType == 'list'
      ) {
        if (item?.lisNote != '') {
          if (this.formType == 'edit') this.listNote = this.note.checkList;
          if (field == 'status') {
            for (let i = 0; i < this.listNote.length; i++) {
              if (i == index) this.listNote[i].status = dt;
            }
          }
        }
      }
      if (field == 'listNote') {
        if (dt == '' && index !== this.listNote.length - 1) {
          for (var i = 0; i < this.listNote.length; i++) {
            if (i === index) {
              this.listNote.splice(i, 1);
              return;
            }
          }
        }
        this.countUpdateTodo++;
        if (this.countUpdateTodo == 1 && this.formType == 'add') {
          this.listNote[this.listNote.length - 1] = {
            status: this.type == 'check' ? 0 : null,
            listNote: '',
          };
        } else if (this.countUpdateTodo > 1 || this.formType == 'edit') {
          this.listNote.pop();
        }
        this.keyUpEnter(e);
        var dt1: any = {
          status: this.tempNote.status,
          listNote: this.tempNote.listNote,
        };
        if (this.countUpdateTodo == 1 && this.formType == 'add') {
          this.listNote.unshift(Object.assign({}, dt1));
        } else if (this.countUpdateTodo > 1 || this.formType == 'edit') {
          if (index == this.listNote.length) this.listNote.push(dt1);
          else {
            if (e.data) {
              this.listNote[index].listNote = e.data;
              this.listNote[index].status = this.tempNote.status;
            }
          }
          var dtt = {
            status: this.type == 'check' ? 0 : null,
            listNote: '',
          };
          this.listNote.push(dtt);
        }
        this.changeDetectorRef.detectChanges();
        var ele = document.getElementsByClassName('test-textbox');
        if (ele) {
          let htmlEle = ele[ele.length - 1] as HTMLElement;
          htmlEle.focus();
        }
      }
      // if (field == 'showCalendar') {
      //   this.checkSwitch == true;
      // }
    }
  }

  onCreateNote() {
    this.note.createdOn = this.currentDate;
    this.note.noteType = this.type;
    this.note.isPin = this.pin;
    // if (this.checkSwitch == false) this.note.showCalendar = true;
    // else this.note.showCalendar = false;
    if (this.type == 'check' || this.type == 'list') {
      this.listNote.pop();
      this.note.checkList = this.listNote;
      this.note.memo = null;
      if (this.listNote == null || this.listNote == '') this.checkNull = true;
      else this.checkNull = false;
    } else {
      this.note.checkList = null;
      if (this.note.memo == null || this.note.memo == '') this.checkNull = true;
      else this.checkNull = false;
    }
    this.note.checkList;
    this.note.fileCount = this.listFileUpload?.length;
    if (this.checkNull == false) {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'NotesBusiness',
          'CreateNoteAsync',
          this.note
        )
        .subscribe(async (res) => {
          if (res) {
            var dtNew = res;
            dtNew.type = 'WP_Notes';
            if (this.listFileUpload.length > 0) {
              this.listFileUpload.forEach((dt) => {
                dt.objectID = dtNew.recID;
              });
              this.attachmentAdd.fileUploadList = [...this.listFileUpload];
              (await this.attachmentAdd.saveFilesObservable()).subscribe(
                (res: any) => {
                  if (res) {
                    this.notificationsService.notifyCode('SYS006');
                    this.dialog.close();
                  }
                }
              );
            }
            var object = [];
            if (this.component == 'note-drawer')
              object = [{ data: dtNew, type: 'add-note-drawer' }];
            else {
              if (this.date2 != undefined)
                object = [{ data: dtNew, type: 'add-otherDate' }];
              else object = [{ data: dtNew, type: 'add-currentDate' }];
            }
            this.noteService.data.next(object);
            this.dialog.close();
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
      this.notificationsService.notifyCode('TM037');

      this.listNote[0] = {
        status: this.type == 'check' ? 0 : null,
        listNote: '',
      };
    }
  }

  openFormUpdateIsPin(data, typeUpdate = null) {
    var obj = {
      data: this.data,
      itemUpdate: data,
      typeUpdate: typeUpdate,
    };
    this.callfc.openForm(
      UpdateNotePinComponent,
      'Cập nhật ghi chú đã ghim',
      500,
      600,
      '',
      obj
    );
    this.noteService.dataUpdate.subscribe((res) => {
      this.countNotePin--;
    });
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
        if (this.pin == '1' || this.pin == true) this.countNotePin += 1;
        else this.countNotePin -= 1;
        this.onEdit();
      }
    } else this.onEdit();
  }

  checkPinWithFormAdd() {
    if (this.checkPin == true) {
      if (this.countNotePin + 1 > this.maxPinNotes)
        this.openFormUpdateIsPin(this.note, 'updateNoteNew');
      else this.onCreateNote();
    } else this.onCreateNote();
  }

  onEdit() {
    this.note.createdOn = this.currentDate;
    this.note.isNote = true;
    if (this.checkPin == true) this.note.isPin = this.pin;
    if (this.listNote.length != 0) this.note.checkList = this.listNote;
    if (this.note.checkList != null) this.note.checkList.pop();
    this.note.fileCount = this.listFileUpload?.length;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.note?.recID,
        this.note,
      ])
      .subscribe(async (res) => {
        if (res) {
          var dtNew = res;
          dtNew.type = 'WP_Notes';
          this.checkUpdate = true;
          if (this.listFileEdit?.length > 0) {
            this.listFileEdit?.forEach((x) => {
              this.deleteFileByRecID(x.recID, true);
            });
          }
          if (this.listFileUpload.length > 0) {
            this.listFileUpload.forEach((dt) => {
              dt.objectID = this.note.recID;
            });
            this.attachmentEdit.fileUploadList = this.listFileUpload;
            (await this.attachmentEdit.saveFilesObservable()).subscribe(
              (res: any) => {
                if (res) {
                  this.notificationsService.notifyCode('SYS006');
                }
              }
            );
          }
          var object = [];
          if (this.component == 'note-drawer')
            object = [{ data: dtNew, type: 'edit-note-drawer' }];
          else {
            if (this.date2 != undefined)
              object = [{ data: dtNew, type: 'edit-otherDate' }];
            else object = [{ data: dtNew, type: 'edit-currentDate' }];
          }
          this.noteService.data.next(object);
        }
      });
    this.dialog.close();
    this.changeDetectorRef.detectChanges();
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

  onUpdateNote(e: any) {}

  isPin() {
    this.checkPin = true;
    this.pin = !this.pin;
    this.changeDetectorRef.detectChanges();
  }

  openFormNoteBooks() {
    if (this.formType == 'edit') {
      var obj = {
        itemUpdate: this.note,
        dialogRef: this.dialog,
      };
      this.callfc.openForm(SaveNoteComponent, '', 900, 650, '', obj, '');
    } else {
      this.notificationsService.notifyCode('TM037');
    }
  }

  close() {
    this.dialog.close();
  }

  getFileByObjectId() {
    this.api
      .exec<any>(
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByObjectIDImageAsync',
        this.note.recID
      )
      .subscribe((res) => {});
  }

  popupFile() {
    this.dmSV.fileUploadList = [];
    if (this.formType == 'edit') {
      this.attachmentEdit.uploadFile();
    } else {
      this.attachmentAdd.uploadFile();
    }
  }

  getFileCount(event: any) {
    if (event && event.data.length > 0) {
      if (this.formType == 'edit') {
        this.codxFileEdit.addFiles(event.data);
      } else {
        this.codxFileAdd.addFiles(event.data);
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  removeFile(file: any) {
    switch (this.formType) {
      case 'edit':
        let lstFileEdit = this.listFileUpload.filter((f: any) => {
          return f.fileName == file.fileName;
        });
        this.listFileEdit = lstFileEdit;
        break;
      default:
        let lstFileAdd = this.listFileUpload.filter((f: any) => {
          return f.fileName != file.fileName;
        });
        this.listFileUpload = lstFileAdd;
    }
    this.changeDetectorRef.detectChanges();
  }

  addFile(files: any) {
    if (this.listFileUpload?.length == 0) {
      this.listFileUpload = files;
    } else {
      if (this.listFileUpload) {
        files.forEach((dt) => {
          this.listFileUpload.push(dt);
        });
      } else this.listFileUpload = files;
    }
    this.changeDetectorRef.detectChanges();
  }

  deleteFileByObjectID(fileID: string, deleted: boolean) {
    if (fileID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'DeleteByObjectIDAsync',
          [fileID, this.functionList.entityName, deleted]
        )
        .subscribe();
    }
  }

  deleteFileByRecID(fileID: string, deleted: boolean) {
    if (fileID) {
      this.api
        .execSv('DM', 'ERM.Business.DM', 'FileBussiness', 'DeleteFileAsync', [
          fileID,
          deleted,
        ])
        .subscribe();
    }
  }

  evtGetFiles(e) {
    if (e) this.listFileUpload = e;
  }
}
