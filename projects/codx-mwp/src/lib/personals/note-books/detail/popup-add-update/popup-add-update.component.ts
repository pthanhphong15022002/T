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

  note: Notes = new Notes();

  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    public atSV: AttachmentService,
    private authStore: AuthStore,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formType = dt?.data[0].type;
    this.transID = dt?.data[0].parentID;
    debugger;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật chi tiết sổ tay';
      this.note = dialog.dataService.dataSelected;
      this.data = dialog.dataService.dataSelected;
    }
    this.cache.functionList('MWP00941').subscribe(res => {
      if (res) {
        this.functionList.entityName = res.entityName;
        this.functionList.funcID = res.functionID;
      }
    })
    // this.recID = data.data?.recID;
    // this.lstNote = data.data?.lstNote;
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
    if (this.formType == 'add') this.addNoteBookDetails();
    else this.updateNote();
  }

  addNoteBookDetails() {
    this.note.transID = this.transID;
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NoteBooksBusiness',
        'CreateNoteBookDetailsAsync',
        [this.note]
      )
      .subscribe((res) => {
        if (res) {
          if (this.checkFile == true) {
            this.attachment.objectId = res.recID;
            this.attachment.saveFiles();
          }
          this.dialog.close();
          (this.dialog.dataService as CRUDService).add(res).subscribe();
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  updateNote() {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NoteBooksBusiness',
        'UpdateNoteBookDetailAsync',
        [this.data?.recID, this.note]
      )
      .subscribe((res) => {
        if (res) {
          if (this.checkFile == true) {
            this.attachment.objectId = res.recID;
            this.attachment.saveFiles();
          }
          this.dialog.close();
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  popup() {
    this.attachment.uploadFile();
    this.checkFile = true;
  }

  fileAdded(e) {
    if (e)
      this.attachment.saveFiles();
  }

  valueChangeTag(e) {
    if(e) {
      this.note.tag = e.data;
    }
  }
}
