import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FileService } from '@shared/services/file.service';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Permission } from '@shared/models/file.model';
import { AttachmentComponent } from '../attachment/attachment.component';
import { CodxCommonService } from '../../codx-common.service';
import { ViewFileDialogComponent } from '../viewFileDialog/viewFileDialog.component';

@Component({
  selector: 'codx-view-files',
  templateUrl: './codx-view-files.component.html',
  styleUrls: ['./codx-view-files.component.css'],
})
export class CodxViewFilesComponent implements OnInit {
  @Input() objectID: string = '';
  @Input() objectType: string = '';
  @Input() formModel: FormModel = null;
  @Input() allowEdit: boolean = false;
  @Input() medias: number = 0;
  @Input() format: string = '';

  @Output() selectFile = new EventEmitter();
  @Output() fileEmit = new EventEmitter();

  @ViewChild('codxATM') codxATM: AttachmentComponent;

  user: any = null;
  files: any[] = [];
  documents: number = 0;
  lstFileRemove: any[] = [];
  size: number = 0;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };

  defaultImage = '../../../assets/media/svg/files/blank-image.svg';
  readonly loaderImage = '../../../assets/media/img/loader.gif';

  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private callfc: CallFuncService,
    private dt: ChangeDetectorRef,
    private codxCommonService: CodxCommonService,
    private notifySvr: NotificationsService,
    private fileSV: FileService
  ) {
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.getFileByObjectID(this.objectID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.objectID?.currentValue != changes.objectID?.previousValue &&
      !changes.firstChange
    ) {
      this.getFileByObjectID(this.objectID);
    }
  }
  // get files by objectID
  getFileByObjectID(objectID: string) {
    if (objectID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          [this.objectID]
        )
        .subscribe((res: any[]) => {
          if (Array.isArray(res)) {
            this.medias = res.reduce(
              (count, ele) =>
                ele.referType == this.FILE_REFERTYPE.IMAGE ||
                ele.referType == this.FILE_REFERTYPE.VIDEO
                  ? (count = count + 1)
                  : count,
              0
            );
            this.documents = res.length - this.medias;
            // mode grid view file ở dạng khung chat
            if (this.format == 'grid') {
              res.forEach((x: any) => {
                if (x.referType === this.FILE_REFERTYPE.IMAGE)
                  x['source'] = this.codxCommonService.getThumbByUrl(
                    x.url,
                    300
                  );
                else if (x.referType === this.FILE_REFERTYPE.VIDEO)
                  x['source'] = `${environment.urlUpload}/${x.url}`;
              });
            }
            // view file portal
            else {
              if (this.medias > 0) {
                switch (this.medias) {
                  case 1:
                    res.forEach((x: any) => {
                      if (x.referType === this.FILE_REFERTYPE.IMAGE) {
                        x.source = this.codxCommonService.getThumbByUrl(
                          x.url,
                          900
                        );
                        //return;
                      } else {
                        x.source = `${environment.urlUpload}/${x.url}`;
                        //return;
                      }
                    });
                    break;
                  case 2:
                    res.forEach((x: any) => {
                      if (x.referType === this.FILE_REFERTYPE.IMAGE)
                        x.source = this.codxCommonService.getThumbByUrl(
                          x.url,
                          450
                        );
                      else x.source = `${environment.urlUpload}/${x.url}`;
                    });
                    break;
                  case 3:
                    res.forEach((x: any, index: number) => {
                      if (x.referType === this.FILE_REFERTYPE.IMAGE)
                        x.source = this.codxCommonService.getThumbByUrl(
                          x.url,
                          index == 0 ? 900 : 450
                        );
                      else x.source = `${environment.urlUpload}/${x.url}`;
                    });
                    break;
                  default:
                    res.forEach((x: any) => {
                      if (x.referType === this.FILE_REFERTYPE.IMAGE)
                        x.source = this.codxCommonService.getThumbByUrl(
                          x.url,
                          450
                        );
                      else x.source = `${environment.urlUpload}/${x.url}`;
                    });
                    break;
                }
              }
            }
            this.files = res;
          }
        });
    }
  }

  // click filed
  clickViewDetail(file: any) {
    this.selectFile.emit(file);
  }

  // click upload file
  uploadFiles() {
    this.codxATM.uploadFile();
  }
  // attachment return file
  atmReturnedFile(event: any) {
    if (event.data) {
      this.selectFiles(event.data);
    }
  }
  // add files
  selectFiles(files: any[]) {
    if (Array.isArray(files)) {
      files.map((f: any) => {
        f.recID = Util.uid();
        f.isNew = true;
        if (f.mimeType.includes('image')) {
          f.source = f.avatar;
          f.referType = this.FILE_REFERTYPE.IMAGE;
          // this.fileMedias.push(f);
        } else if (f.mimeType.includes('video')) {
          f.source = f.data.changingThisBreaksApplicationSecurity;
          f.referType = this.FILE_REFERTYPE.VIDEO;
          // this.fileMedias.push(f);
        } else {
          f.referType = this.FILE_REFERTYPE.APPLICATION;
          // this.fileDocuments.push(f);
        }
      });
      this.files = this.files.concat(files);
      this.medias = this.files.reduce(
        (count, ele) =>
          ele.referType == this.FILE_REFERTYPE.IMAGE ||
          ele.referType == this.FILE_REFERTYPE.VIDEO
            ? (count = count + 1)
            : count,
        0
      );
      this.documents = this.files.length - this.medias;
      this.dt.detectChanges();
    }
  }
  // remove files
  removeFiles(event: any, data: any) {
    event.preventDefault();
    event.stopPropagation();
    if (this.files.length > 0) {
      let idx = this.files.findIndex((x) => x.recID === data.recID);
      if (idx != -1) {
        this.files.splice(idx, 1);
        this.files = Array.from<any>(this.files);
        if (!data.isNew) {
          this.lstFileRemove.push(data);
        }
        this.medias = this.files.reduce(
          (count, ele) =>
            ele.referType == this.FILE_REFERTYPE.IMAGE ||
            ele.referType == this.FILE_REFERTYPE.VIDEO
              ? (count = count + 1)
              : count,
          0
        );
        this.documents = this.files.length - this.medias;
        this.dt.detectChanges();
      }
    }
  }
  // save
  save(permissions:Permission[]): Observable<boolean> {
    if (permissions.length > 0 && this.objectID) 
    {
      let lstFileAdd = this.files.filter((x) => x.isNew);
      let $obs1 = this.deleteFiles(this.lstFileRemove);
      let $obs2 = this.addFiles(lstFileAdd, this.objectID, permissions);
      return forkJoin([$obs1, $obs2], (res1, res2) => {
        return res1 && res2;
      });
    }
    return of(false);
  }
  // delete files
  deleteFiles(files: any[]): Observable<boolean> {
    if (files.length > 0) {
      let _fileIDs = files.map((x) => x.recID);
      return this.api
        .execSv<any>(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'DeleteFilesAsync',
          [_fileIDs]
        )
        .pipe(
          map((res: any) => {
            return res ? true : false;
          })
        );
    }
    return of(true);
  }
  addFiles(files: any[], objectID: string, permissisons:Permission[]): Observable<boolean> {
    if (files.length > 0) {
      this.codxATM.objectId = objectID;
      files.forEach(x => x.permissisons = [...permissisons]);
      this.codxATM.fileUploadList = [...files];
      return this.codxATM.saveFilesMulObservable().pipe(
        map((res: any) => {
          return res ? true : false;
        })
      );
    } else return of(true);
  }
  // format file size
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  //click view file document
  clickFileDocument(file: any) {
    if (file.recID) {
      this.fileSV.getFile(file.recID).subscribe((item: any) => {
        if (item) {
          var option = new DialogModel();
          option.IsFull = true;
          this.callfc.openForm(
            ViewFileDialogComponent,
            item.fileName,
            0,
            0,
            '',
            item,
            '',
            option
          );
        }
      });
    } else {
      var option = new DialogModel();
      option.IsFull = true;
      this.callfc.openForm(
        ViewFileDialogComponent,
        file.fileName,
        0,
        0,
        '',
        file,
        '',
        option
      );
    }
  }
  // get file media
  getFileMedia(data: any[]): any[] {
    let files = [];
    if (Array.isArray(data)) {
      files = data.filter(
        (x) =>
          x.referType == this.FILE_REFERTYPE.IMAGE ||
          x.referType == this.FILE_REFERTYPE.VIDEO
      );
    }
    return files;
  }
}
