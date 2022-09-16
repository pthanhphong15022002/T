import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import 'lodash';
import {
  AuthService,
  CallFuncService,
  DialogModel,
  FilesService,
  NotificationsService,
} from 'codx-core';
import { ErmComponent } from '../ermcomponent/erm.component';
import { isBuffer } from 'util';
import { environment } from 'src/environments/environment';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from '../attachment/attachment.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { PopupDetailComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/popup-detail/popup-detail.component';
@Component({
  selector: 'codx-file',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ImageGridComponent extends ErmComponent implements OnInit {
  @Input() funcID: string = '';
  @Input() objectID: string = '';
  @Input() objectType: string = '';
  @Input() edit: boolean = false;
  @Input() files: any[] = [];
  @Output() evtGetFiles = new EventEmitter();
  @Output() removeFile = new EventEmitter();
  @Output() addFile = new EventEmitter();
  @Output() viewDetail = new EventEmitter();
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  file_img_video: any[] = [];
  file_application: any[] = [];
  videos: any[] = [];
  filesAdd: any[] = [];
  filesDelete: any[] = [];
  content: string = '';
  user: any = null;
  constructor(
    private injector: Injector,
    private auth: AuthService,
    private callfc: CallFuncService,
    private dt: ChangeDetectorRef
  ) {
    super(injector);
    this.user = this.auth.userValue;
  }

  ngOnInit() {
    if (this.objectID) {
      this.getFileByObjectID();
    } else {
      this.convertFile();
    }
  }
  getFileByObjectID() {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        this.objectID
      )
      .subscribe((result: any[]) => {
        if (result.length > 0) {
          result.forEach((f: any) => {
            if (this.objectType == 'WP_News') {
              if (f.referType == this.FILE_REFERTYPE.IMAGE) {
                this.file_img_video.push(f);
              }
            } else {
              if (f.referType == this.FILE_REFERTYPE.IMAGE) {
                this.file_img_video.push(f);
              } else if (f.referType == this.FILE_REFERTYPE.VIDEO) {
                f[
                  'srcVideo'
                ] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
                this.file_img_video.push(f);
              } else {
                this.file_application.push(f);
              }
            }
          });
          this.files = result;
          this.evtGetFiles.emit(this.files); // Sr tk Lộc, tk Nguyên add thêm dòng này để lấy dữ liệu
          this.dt.detectChanges();
        }
      });
  }

  convertFile() {
    if (this.files) {
      this.files.forEach((f: any) => {
        if (f.referType == this.FILE_REFERTYPE.APPLICATION) {
          this.file_application.push(f);
        } else {
          this.file_img_video.push(f);
        }
      });
      this.dt.detectChanges();
    }
  }

  clickViewDetail(file: any) {
    this.viewDetail.emit(file);
  }

  removeFiles(file: any) {
    switch (file.referType) {
      case this.FILE_REFERTYPE.APPLICATION:
        for (let i = 0; i < this.file_application.length; i++) {
          if (this.file_application[i].fileName == file.fileName) {
            this.file_application.splice(i, 1);
            break;
          }
        }
        break;
      default:
        for (let i = 0; i < this.file_img_video.length; i++) {
          if (this.file_img_video[i].fileName == file.fileName) {
            this.file_img_video.splice(i, 1);
            break;
          }
        }
        break;
    }
    this.files = this.files.filter((f: any) => f.fileName != file.fileName);
    this.filesDelete.push(file);
    this.removeFile.emit(file);
    this.dt.detectChanges();
  }
  addFiles(files: any[]) {
    files.map((f) => {
      if (f.mimeType.indexOf('image') >= 0) {
        f['referType'] = this.FILE_REFERTYPE.IMAGE;
        let a = this.file_img_video.find((f2) => f2.fileName == f.fileName);
        if (a) return;
        this.file_img_video.push(f);
      } else if (f.mimeType.indexOf('video') >= 0) {
        f['referType'] = this.FILE_REFERTYPE.VIDEO;
        let a = this.file_img_video.find((f2) => f2.fileName == f.fileName);
        if (a) return;
        this.file_img_video.push(f);
      } else {
        f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        let a = this.file_application.find((f2) => f2.fileName == f.fileName);
        if (a) return;
        this.file_application.push(f);
      }
    });
    this.filesAdd = this.filesAdd.concat(files);
    this.files = this.files.concat(files);
    this.addFile.emit(files);
    this.dt.detectChanges();
  }
}
