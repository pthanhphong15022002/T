import { ApiHttpService, AuthStore, DialogData, DialogRef, CacheService, CRUDService } from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  Optional,
  ViewChild,
} from '@angular/core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { Notes } from '@shared/models/notes.model';
import { falseLine } from '@syncfusion/ej2-gantt/src/gantt/base/css-constants';

@Component({
  selector: 'app-popup-add-update',
  templateUrl: './popup-add-update.component.html',
  styleUrls: ['./popup-add-update.component.scss'],
})
export class PopupAddUpdate implements OnInit {
  title: any;
  memo: any;
  recID: any;
  dialog: any;
  lstNote: any = [];
  checkUpdate = false;
  formType = '';
  readOnly = false;
  data: any;
  header = 'Thêm mới chi tiết sổ tay';
  checkFile = false;
  functionList = {
    entityName: '',
    funcID: '',
  }
  transID = '';
  fileCount: any = 0;
  checkUpload = false;
  dataAdd: any = '';

  note: Notes = new Notes();

  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(
    public atSV: AttachmentService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formType = dt?.data[0].type;
    this.transID = dt?.data[0].parentID;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật chi tiết sổ tay';
      this.note = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
      this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    }
    this.cache.functionList('MWP00941').subscribe(res => {
      if (res) {
        this.functionList.entityName = res.entityName;
        this.functionList.funcID = res.functionID;
      }
    })
  }

  ngOnInit(): void { }

  ngAfterViewInit() {
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.note[field] = dt?.value ? dt?.value : dt;
    }
  }

  saveNoteBookDetails() {
    // this.attachment.saveFiles();
    if (this.formType == 'add') this.addNoteBookDetails();
    else this.updateNote();
  }

  addNoteBookDetails() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          var dt = res.save;
          this.dataAdd = dt;
          if (this.checkFile == true) {
            this.attachment.objectId = dt.recID;
            this.attachment.saveFiles();
            this.checkUpload = true;
          }
        }
      });
  }

  updateNote() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update) {
          if (this.checkFile == true) {
            this.attachment.objectId = res.recID;
            this.attachment.saveFiles();
          }
          this.dialog.close();
        }
      })
  }

  updateNote2(item = null) {
    this.note.fileCount = this.fileCount;
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NoteBooksBusiness',
        'UpdateNoteBookDetailAsync',
        [item?.recID, this.note]
      )
      .subscribe((res) => {
        if (res) {
          (this.dialog.dataService as CRUDService).update(res).subscribe();
          this.dialog.close();
        }
      });
  }

  beforeSave(option: any) {
    this.note.transID = this.transID;
    // this.note.fileCount = this.fileCount;
    if (this.formType == 'add') {
      option.method = 'CreateNoteBookDetailsAsync';
      option.data = this.note;
    }
    else {
      option.method = 'UpdateNoteBookDetailAsync';
      option.data = [this.data?.recID, this.note];
    }
    option.assemblyName = 'ERM.Business.WP';
    option.className = 'NoteBooksBusiness';
    if(this.checkUpload == true) {

    }
    return true;
  }

  popup() {
    this.attachment.uploadFile();
    this.checkFile = true;
  }

  fileAdded(e) {
    if (e) {
      var dt = e.data;
      var count = 0;
      dt.forEach((res) => {
        if (res.status == '0') {
          count++;
        }
      })
      this.fileCount = count;
      this.updateNote2(this.dataAdd);
      // if (this.formType == 'add') this.addNoteBookDetails();
      // else this.updateNote();
    }
  }

  valueChangeTag(e) {
    if (e) {
      this.note.tag = e.data;
    }
  }
}
