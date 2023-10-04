import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FileService } from '@shared/services/file.service';
import { AnimationSettingsModel } from '@syncfusion/ej2-angular-popups';
import {
  AlertConfirmInputConfig,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogModel,
  NotificationsService,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { EditFileComponent } from 'projects/codx-dm/src/lib/editFile/editFile.component';
import { RolesComponent } from 'projects/codx-dm/src/lib/roles/roles.component';
import { environment } from 'src/environments/environment';
import { SystemDialogService } from '../viewFileDialog/systemDialog.service';
import { CodxCommonService } from '../../codx-common.service';

@Component({
  selector: 'codx-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit, OnChanges {
  @Input() files: any;
  @Input() formModel: any;
  @Input() displayThumb: any;
  @Input() hideDelete = '0';
  @Input() isDeleteTemp = '0';
  @Input() hideMoreF = '1';
  @Input() hideHover = '1';
  @Input() isScroll = '0';
  @Input() permissions: any;
  @Input() objectID = '';
  @Input() isReferType: boolean = false;
  @Input() isOpenFile: boolean = false;
  @Input() isFristVer = false;
  @Input() tmpRight?: TemplateRef<any>;
  @Input() tmpCustomMFc?: TemplateRef<any>;
  @Output() fileCount = new EventEmitter<any>();
  @Output() fileDelete = new EventEmitter<any>();
  @Output() viewFile = new EventEmitter<any>();
  titleEditFileDialog = 'Cập nhật file';
  titleUpdateFile = 'Cập nhật file';
  titleUpdateShare = 'Chia sẻ';
  titleRolesDialog = 'Cập nhật quyền';
  titleUpdateProperties = 'Properties';
  titleUpdateBookmark = 'Bookmark';
  titleUpdateUnBookmark = 'UnBookmark';
  titlePermission = 'Permission';
  dataDelete = [];
  dataFile: any;
  showDelete = false;
  // files: any;
  title = 'Thông báo';
  titleDeleteConfirm = 'Bạn có chắc chắn muốn xóa ?';
  animationSettings: AnimationSettingsModel = { effect: 'None' };
  target: string = '.control-section';
  fileName: any;
  visible: boolean = false;
  userID: any;
  file: any;
  constructor(
    private router: Router,
    private cache: CacheService,
    private commonService: CodxCommonService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private callfc: CallFuncService,
    private fileService: FileService,
    public dmSV: CodxDMService,
    private notificationsService: NotificationsService,
    private authStore: AuthStore
  ) {
    // this.dialog.close = function (e) {
    //   this.dialog.destroy();
    // };
  }
  ngOnInit(): void {
    // this.files = JSON.parse(this.data);
    // this.changeDetectorRef.detectChanges();
    //this.Dialog.hide();
    if (!this.files) {
      this.dmSV.isFileEditing.subscribe((item) => {
        if (item) {
          if (this.files.length > 0) {
            var index = -1;
            if (this.files[0].data != null) {
              index = this.files.findIndex((d) => d.data.recID == item.recID);
              if (index > -1) {
                this.files[index].data = item;
              }
            } else {
              index = this.files.findIndex((d) => d.recID == item.recID);
              if (index > -1) {
                this.files[index] = item;
              }
            }
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    }
    //Lấy version đầu tiên
    else if (this.isFristVer) this.formatFristVersion(this.files);
    this.userID = this.authStore.get().userID;
  }

  ngOnChanges(changes: SimpleChanges) {}

  //Lấy version đầu tiên
  formatFristVersion(data) {
    data.forEach((elm) => {
      if (elm.history && elm.history.length > 0) {
        var frist = elm?.history.filter((x) => x.version == 'Ver 001');
        if (frist && frist[0]) {
          var f = frist[0];
          elm.extension = f.extension;
          elm.fileSize = f.fileSize;
          elm.thumbnail = f.thumbnail;
          elm.pathDisk = f.pathDisk;
          elm.uploadId = f.uploadId;
        }
      }
    });
    return data;
  }

  openPermission(data) {
    this.dmSV.dataFileEditing = data;
    this.callfc.openForm(
      RolesComponent,
      this.titleRolesDialog,
      950,
      650,
      '',
      [''],
      ''
    );
  }

  hideMore() {
    document.getElementById('drop').setAttribute('style', 'display: none;');
  }

  // checkDelete(file:any) {
  //   if(file)
  //   {
  //     debugger
  //     var per = file.permissions.filter(x=>x.userID == this.userID || x.objectID == this.userID);
  //     if(per && per[0]) return per[0].delete
  //   }
  //   return false;
  // }
  // isAdmin()
  // {

  // }
  // checkDownloadRight(file:any) {
  //   if(file.permissions)
  //   {
  //     var per = file.permissions.filter(x=>x.userID == this.userID || x.objectID == this.userID);
  //     if(per && per[0]) return per[0].download;
  //   }
  //   return false;
  // }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  deleteFile(file: any) {
    this.fileService.getFile(file.recID).subscribe((item) => {
      if (item && item.delete) {
        var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        this.notificationsService
          .alert(this.title, this.titleDeleteConfirm, config)
          .closed.subscribe((x) => {
            if (x.event.status == 'Y') {
              if (this.isDeleteTemp == '0') {
                this.fileService
                  .deleteFileToTrash(file.recID, '', true, this.objectID)
                  .subscribe((item) => {
                    if (item) {
                      let list = this.files;
                      var index = -1;
                      if (list.length > 0) {
                        if (list[0].data != null) {
                          index = list.findIndex(
                            (d) => d.data.recID.toString() === file.recID
                          );
                        } else {
                          index = list.findIndex(
                            (d) => d.recID.toString() === file.recID
                          );
                        }
                        if (index > -1) {
                          this.dataDelete.push(list[index]);
                          this.fileDelete.emit(this.dataDelete);
                          list.splice(index, 1); //remove element from array
                          this.files = list;
                          this.fileCount.emit(this.files);

                          this.changeDetectorRef.detectChanges();
                        }
                      }
                    }
                  });
              } else {
                let list = this.files;
                var index = -1;
                if (list.length > 0) {
                  if (list[0].data != null) {
                    index = list.findIndex(
                      (d) => d.data.recID.toString() === file.recID
                    );
                  } else {
                    index = list.findIndex(
                      (d) => d.recID.toString() === file.recID
                    );
                  }
                  if (index > -1) {
                    this.dataDelete.push(list[index]);
                    list.splice(index, 1); //remove element from array
                    this.files = list;
                    this.fileCount.emit(this.files);
                    this.fileDelete.emit(this.dataDelete);
                    this.changeDetectorRef.detectChanges();
                  }
                }
              }
            }
          });
      } else this.notificationsService.notifyCode('SYS032');
    });
  }

  async download(file: any): Promise<void> {
    this.fileService.getFile(file.recID).subscribe(async (item) => {
      if (item && item.download) {
        //window.location.href = environment.urlUpload + '/' + item?.pathDisk+"?download=1";
        let blob = await fetch(
          environment.urlUpload + '/' + item.pathDisk
        ).then((r) => r.blob());
        let url = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', item.fileName);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else this.notificationsService.notifyCode('DM060');
    });
  }

  openFile(file: any) {
    if (this.isOpenFile) return;
    this.fileService.getFile(file.recID, true, true).subscribe((item) => {
      if (item && item.read) {
        this.cache
          .moreFunction('FileInfo', 'grvFileInfo')
          .subscribe((item2) => {
            if (item2 && item2.length > 0) {
              var c = item2.filter((x) => x.functionID == 'DMT0210');
              if (c && c[0]) {
                if (c[0].displayMode == '2') {
                  const queryParams = {
                    id: file.recID,
                  };
                  var l = this.router.url.split('/');
                  const url = this.router.serializeUrl(
                    this.router.createUrlTree([`/` + l[1] + `/viewfile`], {
                      queryParams: queryParams,
                    })
                  );
                  window.open(url, '_blank');
                } else {
                  var option = new DialogModel();
                  option.IsFull = true;
                  this.fileName = item.fileName;
                  this.dataFile = item;
                  this.visible = true;
                  this.viewFile.emit(true);
                }
              }
            }
          });
      } else this.notificationsService.notifyCode('SYS032');
    });
  }

  properties() {}

  setBookmark() {}

  setShare() {}

  checkShareRight() {
    return true;
  }

  checkBookmark() {
    return true;
  }

  checkReadRight() {
    return true;
  }

  editfile(file, multi = false, index = 0) {
    this.callfc.openForm(
      EditFileComponent,
      this.titleEditFileDialog,
      800,
      800,
      '',
      ['', file],
      ''
    );
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getExtension(thumbnail, ext) {
    if (thumbnail != '' && thumbnail != undefined)
      return `${environment.urlUpload}/${thumbnail}`;
    else {
      ext = ext.substring(1);
      ext = ext.toLocaleLowerCase();
      return `../../../assets/demos/dms/${ext}.svg`;
    }
  }

  dialogClosed() {
    this.visible = false;
    this.changeDetectorRef.detectChanges();
  }
}
