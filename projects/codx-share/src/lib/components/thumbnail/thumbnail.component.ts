import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { AlertConfirmInputConfig, CallFuncService, NotificationsService } from 'codx-core';
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
 // files: any;  
  title = 'Thông báo';
  titleDeleteConfirm = 'Bạn có chắc chắn muốn xóa ?';
  constructor(    
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private callfc: CallFuncService,
    private fileService: FileService,
    private notificationsService: NotificationsService,
  ) {

  }
  ngOnInit(): void {    
   // this.files = JSON.parse(this.data);
    this.changeDetectorRef.detectChanges();

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

    this.notificationsService.alert(this.title, this.titleDeleteConfirm, config).closed.subscribe(x=>{
      if(x.event.status == "Y")
      {        
        this.fileService.deleteFileToTrash(id, "", true).subscribe(item => {
          if (item) {
            let list = this.files;
            var index = -1;
            if (list.length > 0) {
              if (list[0].data != null)
              {
                index = list.findIndex(d => d.data.recID.toString() === id); 
              }
              else {
                index = list.findIndex(d => d.recID.toString() === id); 
              }
              if (index > -1) {
                list.splice(index, 1);//remove element from array
                this.files = list;
                this.changeDetectorRef.detectChanges();
              }
            }            
          }
        })  
      }
    })
  }

  async download(id): Promise<void> {
    this.fileService.getFile(id).subscribe(file => {      
      var id = file.recID;
      var that = this;
      if (this.checkDownloadRight(file)) {
        this.fileService.downloadFile(id).subscribe(async res => {
          if (res && res.content != null) {
            let json = JSON.parse(res.content);
            var bytes = that.base64ToArrayBuffer(json);
            let blob = new Blob([bytes], { type: res.mimeType });
            let url = window.URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", res.fileName);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        });
      }
      else {
        this.notificationsService.notify("Bạn không có quyền download file này");
      }
    });
  }

  openFile(id) {
    //var data = JSON.parse(file);
    this.fileService.getFile(id).subscribe(data => {
      this.callfc.openForm(ViewFileDialogComponent, data.fileName, 1000, 800, "", data, "");
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

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getExtension(ext) {
    ext = ext.substring(1);
    ext = ext.toLocaleLowerCase();
    return `../../../assets/demos/dms/${ext}.svg`;
  }

  getSubTitle(id)
  {    
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
