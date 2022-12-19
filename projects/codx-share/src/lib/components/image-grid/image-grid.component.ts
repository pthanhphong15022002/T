import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import 'lodash';
import {
  AuthService,
  CallFuncService,
} from 'codx-core';
import { ErmComponent } from '../ermcomponent/erm.component';
import { environment } from 'src/environments/environment';
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
  @Output() evtRemoveFile = new EventEmitter();
  @Output() evtAddFile = new EventEmitter();
  @Output() evtViewDetail = new EventEmitter();
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
            switch(f['referType'])
            {
              case this.FILE_REFERTYPE.IMAGE:
              case this.FILE_REFERTYPE.VIDEO:
                f["source"] = `${environment.urlUpload}`+"/"+f.url; 
                this.file_img_video.push(f);
                break;
              case this.FILE_REFERTYPE.APPLICATION:
                this.file_application.push(f);
                break;
              default:
                break;
            }
          });
          this.files = result;
          this.evtGetFiles.emit(this.files);
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
    this.evtViewDetail.emit(file);
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
    this.evtRemoveFile.emit(file);
    this.dt.detectChanges();
  }
  addFiles(files: any[]) {
    if(this.files.length == 0)
    {
      this.files = [];
      this.file_img_video = [];
      this.file_application = []
    }
    files.forEach((f) => {
      let isExist = this.files.some((x) => x.fileName === f.fileName);
      if(isExist) return;
      if (f.mimeType.includes('image') || f.mimeType.includes('video')) 
      {
        if(f.mimeType.includes('image'))
        {
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
        }
        else
        {
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
        }
        this.file_img_video.push(f);
      }
      else 
      {
        f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        this.file_application.push(f);
      }
    });
    this.filesAdd = this.filesAdd.concat(files);
    this.files = this.files.concat(files);
    this.evtAddFile.emit(files);
    this.dt.detectChanges();
  }
}
