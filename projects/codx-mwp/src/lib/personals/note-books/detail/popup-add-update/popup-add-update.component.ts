import {
  ApiHttpService,
  DialogData,
  DialogRef,
  CacheService,
  CRUDService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Optional,
  ViewChild,
  Injector,
} from '@angular/core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { Notes, NoteType, TempNote } from '@shared/models/notes.model';

@Component({
  selector: 'app-popup-add-update',
  templateUrl: './popup-add-update.component.html',
  styleUrls: ['./popup-add-update.component.scss'],
})
export class PopupAddUpdate extends UIComponent implements OnInit {
  title: any;
  memo: any;
  recID: any;
  dialog: any;
  lstNote: any = [];
  checkUpdate = false;
  formType = '';
  readOnly = false;
  data: any;
  header = '';
  checkFile = false;
  functionList = {
    entityName: '',
    funcID: '',
  };
  transID = '';
  fileCount: any = 0;
  checkUpload = false;
  dataAdd: any = '';
  empty = '';
  type = 'text';
  noteType: NoteType = new NoteType();
  tempNote: TempNote = new TempNote();
  listNote: any = [];
  countUpdateTodo = 0;
  note: Notes = new Notes();

  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(
    private injector: Injector,
    public atSV: AttachmentService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.formType = dt?.data[0].type;
    this.transID = dt?.data[0].parentID;
    this.title = dt?.data[0].headerText;
    if (this.formType == 'edit' || this.formType == 'copy') {
      this.note = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      if (this.note.noteType !== 'text') {
        var dtt = {
          status: this.type == 'check' ? 0 : null,
          listNote: '',
        };
        this.note.checkList.push(dtt);
      }
    }
    this.cache.functionList('MWP00941').subscribe((res) => {
      if (res) {
        this.functionList.entityName = res.entityName;
        this.functionList.funcID = res.functionID;
      }
    });
  }

  onInit(): void {
    this.cache.functionList(this.functionList.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
  }

  ngAfterViewInit() {
    if (this.formType == 'edit') {
      this.checkActiveFormEdit();
    }
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
          let i = 0;
          this.listNote.forEach((data) => {
            if (i == index) {
              if (field == 'status') data.status = dt;
            }
            i++;
          });
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
        var dt: any = {
          status: this.tempNote.status,
          listNote: this.tempNote.listNote,
        };
        if (this.countUpdateTodo == 1 && this.formType == 'add') {
          this.listNote.unshift(Object.assign({}, dt));
        } else if (this.countUpdateTodo > 1 || this.formType == 'edit') {
          this.listNote.push(dt);
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
    }
  }

  saveNoteBookDetails() {
    // this.attachment.saveFiles();
    if (this.formType == 'add' || this.formType == 'copy')
      this.addNoteBookDetails();
    else this.updateNote();
  }

  addNoteBookDetails() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 1)
      .subscribe((res) => {
        if (res.save) {
          var dt = res.save;
          this.dataAdd = dt;
          if (this.checkFile == true) {
            this.attachment.objectId = dt.recID;
            this.attachment.saveFiles();
            this.checkUpload = true;
          }
          this.dialog.close(res.save);
        }
      });
  }

  updateNote() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update) {
          if (this.checkFile == true) {
            this.attachment.objectId = res.update.recID;
            this.attachment.saveFiles();
          }
          this.dialog.close(res.update);
        }
      });
  }

  onUpdateNote(e: any) {}

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

  beforeSave(option: RequestOption) {
    this.note.transID = this.transID;
    this.note.checkList = this.listNote;
    if (this.formType == 'edit') {
      this.note.fileCount += this.fileCount;
      if (this.note.noteType !== 'text') this.note.checkList.pop();
    } else {
      this.note.fileCount = this.fileCount;
      if (this.type !== 'text') this.note.checkList.pop();
    }
    this.note.noteType = this.type;
    if (this.formType == 'add' || this.formType == 'copy') {
      option.methodName = 'CreateNoteBookDetailsAsync';
      option.data = this.note;
    } else {
      option.methodName = 'UpdateNoteBookDetailAsync';
      option.data = [this.data?.recID, this.note];
    }
    option.assemblyName = 'ERM.Business.WP';
    option.className = 'NoteBooksBusiness';
    return true;
  }

  popup() {
    this.attachment.uploadFile();
    this.checkFile = true;
  }

  fileAdded(e) {
    if (e.data) this.fileCount = e.data.length;
  }

  valueChangeTag(e) {
    if (e) {
      this.note.tags = e.data;
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
}
