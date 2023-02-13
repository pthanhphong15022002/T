import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { AnimationSettingsModel, ButtonPropsModel, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, AuthStore, CallFuncService, DialogModel, NotificationsService } from 'codx-core';
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
  @Input() hideDelete = '0';
  @Input() isDeleteTemp = '0';
  @Input() hideMoreF = '1';
  @Input() hideHover = '1';
  @Input() isScroll = '0';
  @Input() permissions :any ; 
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
  dataFile:any;
  showDelete = false;
  // files: any;
  title = 'Thông báo';
  titleDeleteConfirm = 'Bạn có chắc chắn muốn xóa ?';
  animationSettings: AnimationSettingsModel = { effect: 'None' };
  target: string = '.control-section';
  fileName:any
  visible: boolean = false;
  userID: any;
  file:any
  constructor(
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
    if(!this.files)
    {
      this.dmSV.isFileEditing.subscribe(item => {
        if (item) {
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
    
    this.userID = this.authStore.get().userID;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.changeDetectorRef.detectChanges();
  }
 
  openPermission(data) {
    this.dmSV.dataFileEditing = data;
    //  this.callfc.openForm(RolesComponent, this.titleRolesDialog, 950, 650, "", [this.functionID], "");
    this.callfc.openForm(RolesComponent, this.titleRolesDialog, 950, 650, "", [""], "");
  }

  hideMore() {
    document.getElementById('drop').setAttribute("style", "display: none;");
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

  deleteFile(file:any) {
    if(file && file.delete)
    {
      var config = new AlertConfirmInputConfig();
      config.type = "YesNo";
      this.notificationsService.alert(this.title, this.titleDeleteConfirm, config)
      .closed.subscribe(x => {
        if (x.event.status == "Y") {
          if (this.isDeleteTemp == '0') {
            this.fileService.deleteFileToTrash(file.recID, "", true).subscribe(item => {
              if (item) {
                let list = this.files;
                var index = -1;
                if (list.length > 0) {
                  if (list[0].data != null) {
                    index = list.findIndex(d => d.data.recID.toString() === file.recID);
                  }
                  else {
                    index = list.findIndex(d => d.recID.toString() === file.recID);
                  }
                  if (index > -1) {
                    this.dataDelete.push(list[index]);
                    this.fileDelete.emit(this.dataDelete);
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
                index = list.findIndex(d => d.data.recID.toString() === file.recID);
              }
              else {
                index = list.findIndex(d => d.recID.toString() === file.recID);
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
    else this.notificationsService.notifyCode("SYS032")
   
  }

  async download(file:any): Promise<void> {
    if(file && file.download)
    {
      this.fileService.downloadFile(file.recID).subscribe(async res => {
        if (res) {
          fetch(environment.urlUpload+ "/" + res)
            .then(response => response.blob())
            .then(blob => {
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = file.fileName;
              link.click();
            })
            .catch(console.error);
        }
      })
    }
    else this.notificationsService.notifyCode("DM060");
   
  }

  openFile(file:any) {
    if(file && file.read)
    {
      this.fileService.getFile(file.recID).subscribe(item=>{
        if(item)
        {
          var option = new DialogModel();
          option.IsFull = true;
          this.fileName = item.fileName;
          this.dataFile = item;
          this.visible = true;
          this.viewFile.emit(true);
        }
      })
     
    }
    else this.notificationsService.notifyCode("SYS032")
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
      return `${environment.urlUpload}/${thumbnail}`;
    else {
      ext = ext.substring(1);
      ext = ext.toLocaleLowerCase();
      return `../../../assets/demos/dms/${ext}.svg`;
    }
  }

  dialogClosed(){
    this.visible = false;
    this.changeDetectorRef.detectChanges();
  }
 
}
