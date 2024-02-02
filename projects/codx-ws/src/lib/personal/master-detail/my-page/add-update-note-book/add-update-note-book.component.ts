import { FormGroup } from '@angular/forms';
import {
  DialogData,
  DialogRef,
  ImageViewerComponent,
  CodxFormComponent,
  RequestOption,
  UIComponent,
  NotificationsService,
} from 'codx-core';
import {
  Component,
  OnInit,
  EventEmitter,
  ViewChild,
  Output,
  Optional,
  Injector,
} from '@angular/core';
import { NoteBooks } from 'projects/codx-mwp/src/lib/model/NoteBooks.model';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-add-update-note-book',
  templateUrl: './add-update-note-book.component.html',
  styleUrls: ['./add-update-note-book.component.scss'],
})
export class AddUpdateNoteBookComponent extends UIComponent implements OnInit {
  title: any;
  memo: any;
  formAdd: FormGroup;
  readOnly = false;
  dialog: DialogRef;
  formType = '';
  formModel: any;
  data: any;
  header = 'Thêm mới sổ tay';
  empty = '';
  gridViewSetup = {
    title: '',
    memo: '',
  };
  isChangeData = false;
  linkAvatar = '';
  noteBooks: NoteBooks = new NoteBooks();
  type = '';
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;

  @ViewChild('form') form: CodxFormComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.formType = dt?.data[1];
    this.formModel = dialog?.formModel;
    this.noteBooks = JSON.parse(JSON.stringify(dt?.data[0]));
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
    }
    this.cache.gridViewSetup('NoteBooks', 'grvNoteBooks').subscribe((res) => {
      if (res) {
        this.gridViewSetup.title = res?.Title?.headerText;
        this.gridViewSetup.memo = res?.Memo?.headerText;
      }
    });
  }

  onInit(): void {
    if (this.formType == 'edit') {
      this.getAvatar(this.noteBooks.recID, this.noteBooks.title);
    }
  }

  ngAfterViewInit() {}

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.noteBooks[field] = dt?.value ? dt?.value : dt;
    }
  }

  async saveNoteBooks(type) {
    this.type = type;
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((img) => {
        // save file
        if (this.formType == 'add') {
          this.addNoteBooks();
        } else this.updateNoteBook();
      });
    } else {
      if (this.formType == 'add') {
        this.addNoteBooks();
      } else this.updateNoteBook();
    }
  }

  addNoteBooks() {
    this.api
      .execSv(
        'WP',
        'WP',
        'NoteBooksBusiness',
        'CreateNoteBookAsync',
        this.noteBooks
      )
      .subscribe(async (item: any) => {
        if (item) {
          if (this.type == 'close') {
            this.dialog.close(item);
          } else {
            this.dialog.close(item);
            let url = ''; // Đợi có url rồi set
            this.codxService.navigate('', url, {
              recID: item.recID,
            });
          }
        }
      });
  }

  updateNoteBook() {
    this.api
      .execSv(
        'WP',
        'WP',
        'NoteBooksBusiness',
        'UpdateNoteBookAsync',
        this.noteBooks
      )
      .subscribe(async (item: any) => {
        if (item) {
          if (this.type == 'close') {
            this.dialog.close(item);
          } else {
            this.dialog.close(item);
            let url = ''; // Đợi có url rồi set
            this.codxService.navigate('', url, {
              recID: item.recID,
            });
          }
        }
      });
  }

  beforeSave(op: RequestOption) {
    var data = [];
    op.service = 'WP';
    op.assemblyName = 'ERM.Business.WP';
    op.className = 'NoteBooksBusiness';
    if (this.formType == 'add') {
      op.methodName = 'CreateNoteBookAsync';
      data = [this.noteBooks];
    }
    if (this.formType == 'edit') {
      op.methodName = 'UpdateNoteBookAsync';
      data = [this.noteBooks];
    }
    op.data = data;
    return true;
  }

  addAvatar() {
    this.imageAvatar.referType = 'image';
    this.imageAvatar.uploadFile();
  }

  handleInput() {
    this.isChangeData = true;
  }
  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      let countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;
      // this.changeDetectorRef.detectChanges();
      this.detectorRef.markForCheck();
    }
  }
  getAvatar(objectID, name) {
    let avatar = [
      '',
      this.formModel?.funcID,
      objectID,
      'WP_NoteBooks',
      'inline',
      1000,
      name,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          // this.changeDetectorRef.detectChanges();
          this.detectorRef.markForCheck();
        }
      });
  }
}
