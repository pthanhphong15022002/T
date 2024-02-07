import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-detail-notebook',
  templateUrl: './detail-notebook.component.html',
  styleUrls: ['./detail-notebook.component.css'],
})
export class DetailNotebookComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
  dialog: any;
  data: any;
  isHaveFile = false;
  linkAvatar = '';
  constructor(
    private detectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt: DialogData,
    @Optional() dialogData: DialogRef
  ) {
    this.dialog = dialogData;
    this.data = JSON.parse(JSON.stringify(dt?.data));
  }
  ngOnInit(): void {
    this.getAvatar(this.data.recID, this.data.title);
  }

  async saveNoteBooks() {
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((img) => {
        this.attachment?.clearData();
      });
    }
    if (this.attachment?.fileUploadList?.length > 0)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        this.attachment?.clearData();
      });
    this.updateNoteBook();
  }

  updateNoteBook() {
    this.api
      .execSv('WP', 'WP', 'NoteBooksBusiness', 'UpdateNoteBookAsync', this.data)
      .subscribe(async (item: any) => {
        if (item) {
          this.dialog.close(item);
        }
      });
  }

  valueChange(e) {
    this.data[e?.field] = e?.data;
    this.detectorRef.detectChanges();
  }
  close() {
    this.dialog.close();
  }

  addFile(e) {
    if (e) {
      this.imageAvatar.referType = 'avt';
      this.imageAvatar.uploadFile();
    } else {
      this.attachment.uploadFile();
    }
  }

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
  }

  fileAdded(e) {}

  fileAddImg(e) {
    if (e?.data && e?.data?.length > 0) {
      let countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;
      this.detectorRef.detectChanges();
    }
  }

  getAvatar(objectID, name) {
    let avatar = [
      '',
      'WS00625',
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
