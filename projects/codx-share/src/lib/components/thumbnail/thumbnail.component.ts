import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { AlertConfirmInputConfig, CallFuncService, NotificationsService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { EditFileComponent } from 'projects/codx-dm/src/lib/editFile/editFile.component';
import { RolesComponent } from 'projects/codx-dm/src/lib/roles/roles.component';
import { environment } from 'src/environments/environment';
import { objectPara } from '../viewFileDialog/alertRule.model';
import { SystemDialogService } from '../viewFileDialog/systemDialog.service';
import { ViewFileDialogComponent } from '../viewFileDialog/viewFileDialog.component';
@Component({
  selector: 'codx-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit, OnChanges {
  @Input() files: any;
  @Input() formModel: any;
  @Input() displayThumb: any;
  @Input() hideDelete = '1';
  @Input() isDeleteTemp = '0';
  @Input() hideMoreF = '1';
  @Output() fileCount = new EventEmitter<any>();
  @Output() fileDelete = new EventEmitter<any>();
  @Output() viewFile = new EventEmitter<any>();
  titleEditFileDialog = "Cập nhật file";
  titleUpdateFile = "Cập nhật file";
  titleUpdateShare = "Chia sẻ";
  titleRolesDialog = 'Cập nhật quyền';
  titleUpdateProperties = "Properties";
  titleUpdateBookmark = "Bookmark";
  titleUpdateUnBookmark = "UnBookmark";
  titlePermission = "Permission";
  dataDelete = [];
  // files: any;
  title = 'Thông báo';
  titleDeleteConfirm = 'Bạn có chắc chắn muốn xóa ?';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private callfc: CallFuncService,
    private fileService: FileService,
    public dmSV: CodxDMService,
    private notificationsService: NotificationsService,
  ) {

  }
  ngOnInit(): void {
    // this.files = JSON.parse(this.data);
    // this.changeDetectorRef.detectChanges();
    this.dmSV.isFileEditing.subscribe(item => {
      if (item != undefined) {
        if (this.files.length > 0) {
          var index = -1;
          if (this.files[0].data != null) {
            index = this.files.findIndex(d => d.data.recID == item.recID);
            if (index > -1) {
              this.files[index].data = item;
            }
          }
          else {
            index = this.files.findIndex(d => d.recID == item.recID);
            if (index > -1) {
              this.files[index] = item;
            }
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  openPermission(data) {
    this.dmSV.dataFileEditing = data;
    //  this.callfc.openForm(RolesComponent, this.titleRolesDialog, 950, 650, "", [this.functionID], "");
    this.callfc.openForm(RolesComponent, this.titleRolesDialog, 950, 650, "", [""], "");
  }

  hideMore() {
    document.getElementById('drop').setAttribute("style", "display: none;");
  }

  checkDownloadRight(file) {
    return file.download;;
  }

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

  deleteFile(id) {
    var config = new AlertConfirmInputConfig();
    config.type = "YesNo";

    // this.notificationsService.alertCode('TM005', config).subscribe((res) => {
    //   if (res?.event && res?.event?.status == 'Y') {
    //     console.log(res);
    //   }
    // });

    this.notificationsService.alert(this.title, this.titleDeleteConfirm, config).closed.subscribe(x => {
      if (x.event.status == "Y") {
        if (this.isDeleteTemp == '0') {
          this.fileService.deleteFileToTrash(id, "", true).subscribe(item => {
            if (item) {
              let list = this.files;
              var index = -1;
              if (list.length > 0) {
                if (list[0].data != null) {
                  index = list.findIndex(d => d.data.recID.toString() === id);
                }
                else {
                  index = list.findIndex(d => d.recID.toString() === id);
                }
                if (index > -1) {
                  list.splice(index, 1);//remove element from array
                  this.files = list;
                  this.fileCount.emit(this.files);
                  this.changeDetectorRef.detectChanges();
                }
              }
            }
          })
        }
        else {
          let list = this.files;
          var index = -1;
          if (list.length > 0) {
            if (list[0].data != null) {
              index = list.findIndex(d => d.data.recID.toString() === id);
            }
            else {
              index = list.findIndex(d => d.recID.toString() === id);
            }
            if (index > -1) {
              this.dataDelete.push(list[index]);
              list.splice(index, 1);//remove element from array
              this.files = list;
              this.fileCount.emit(this.files);
              this.fileDelete.emit(this.dataDelete);
              this.changeDetectorRef.detectChanges();
            }
          }
        }
      }
    })
  }

  async download(id): Promise<void> {
    this.fileService.getFile(id).subscribe(file => {
      var id = file.recID;
      var that = this;
      if (this.checkDownloadRight(file)) {

        this.fileService.downloadFile(id).subscribe(async res => {
          if (res) {
            fetch(res)
              .then(response => response.blob())
              .then(blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = file.fileName;
                link.click();
              })
              .catch(console.error);
          }
        });
      }
      else {
        this.notificationsService.notifyCode("DM060");
      }
    });
  }

  openFile(id) {
    //var data = JSON.parse(file);
    this.fileService.getFile(id).subscribe(data => {
      this.callfc.openForm(ViewFileDialogComponent, data.fileName, 1000, 800, "", data, "");
      this.viewFile.emit(true);
    });

    //if (this.checkReadRight() ) {
    // var obj = new objectPara();
    // obj.fileID = data.recID;
    // obj.fileName = data.fileName;
    // obj.extension = data.extension;
    // obj.data = JSON.parse(this.data);
    // this.changeDetectorRef.detectChanges();
    // this.systemDialogService.onOpenViewFileDialog.next(obj);
    // this.fileService.getFile(obj.fileID, true).subscribe(item => {
    //   if (item) {
    //     this.changeDetectorRef.detectChanges();
    //     this.systemDialogService.onOpenViewFileDialog.next(obj);
    //   }
    // })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    //   this.files = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();
  }


  properties() {

  }

  setBookmark() {

  }

  setShare() {

  }

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
    this.callfc.openForm(EditFileComponent, this.titleEditFileDialog, 800, 800, "", ["", file], "");
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
    if (thumbnail != "" && thumbnail != undefined)
      return `${environment.urlThumbnail}/${thumbnail}`;
    else {
      ext = ext.substring(1);
      ext = ext.toLocaleLowerCase();
      return `../../../assets/demos/dms/${ext}.svg`;
    }
  }

  getSubTitle(id) {
    var html = `<div class='action-menu d-flex align-items-center cursor-pointer'>
                  <div class='btn btn-sm btn-icon btn-white cursor-pointer' (click)='openFile("${id}")'>
                    <i class='icon-preview text-primary icon-18'></i>
                  </div>
                  <div class='btn btn-sm btn-icon btn-white cursor-pointer' (click)='download("${id}")'>
                    <i class='icon-cloud_download text-primary icon-18'></i>
                  </div>
                </div> `;
    return html;
  }

}
