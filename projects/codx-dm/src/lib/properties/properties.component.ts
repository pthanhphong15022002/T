import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, HistoryFile, ItemInterval, Permission, SubFolder } from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { RolesComponent } from '../roles/roles.component';

@Component({
  selector: 'properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertiesComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;    
  @Output() eventShow = new EventEmitter<boolean>();
  dialog: any;
  titleDialog = 'Thông tin tài liệu';
  readonly = false;
  currentRate = 0;
  selected = 0;
  hovered = 0;
  totalRating: number;
  totalViews: number;
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
  styleRating: string;
  historyFileName: string;
  fileEditing: FileUpload;
  data: any;
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private fileService: FileService,    
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private callfc: CallFuncService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
      this.dialog = dialog;
      this.data = data.data;
      //this.fileEditing = this.data[1];   
      this.fileEditing =  JSON.parse(JSON.stringify( this.data[0]));  
      // this.data = data.data;
      // //this.fileEditing = this.data[1];   
      // this.fileEditing =  JSON.parse(JSON.stringify( this.data[1]));   
      // this.user = this.auth.get();
      // this.dialog = dialog;     
      // this.id = this.fileEditing.recID;
      // this.dmSV.isFileEditing.subscribe(item => {
      //   if (item != undefined) {
      //     this.fileEditing = item;
      //     this.changeDetectorRef.detectChanges();
      //   }          
      // });
    //  this.changeDetectorRef.detectChanges();
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
   
  }
  
  extendShow(): void {
    // var body = $('#dms_properties');
    // if (body.length == 0) return;
    // if (body.hasClass('extend-show'))
    //   body.removeClass('extend-show');
    // else
    //   body.addClass('extend-show');
  }

  getAvatar(filename: string) {
    if (filename == "" || filename == null)
      return "";
    var ext = filename.substring(filename.lastIndexOf('.'), filename.length) || filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    }
    else {
      switch (ext) {
        case ".txt":
          return "txt.svg";
        case ".doc":
        case ".docx":
          return "doc.svg";
        case ".7z":
        case ".rar":
        case ".zip":
          return "zip.svg";
        case ".jpg":
          return "jpg.svg";
        case ".mp4":
          return "mp4.svg";
        case ".xls":
        case ".xlsx":
          return "xls.svg";
        case ".pdf":
          return "pdf.svg";
        case ".png":
          return "png.svg";
        case ".js":
          return "javascript.svg";
        default:
          return "file.svg";
      }
    }
  }

  setComment() {
    // var that = this;
    // this.fileService.setViewFile(this.id, this.currentRate.toString(), this.commenttext).subscribe(async res => {
    //   if (res.status == 0) {
    //     this.currentRate = 1;
    //     this.readonly = false;
    //     this.commenttext = '';
    //     this.fileEditing = res.data;
    //     this.getRating(res.data.views);
    //     var files = this.dmSV.listFiles.getValue();
    //     let index = files.findIndex(d => d.recID.toString() === this.id);
    //     if (index != -1) {
    //       var thumbnail = files[index].thumbnail;
    //       files[index] = res.data;
    //       files[index].thumbnail = thumbnail;
    //     }
    //     that.dmSV.listFiles.next(files);

    //     this.changeDetectorRef.detectChanges();          //alert(res.message);

    //     this.notificationsService.notify(res.message);
    //   }
    // });
  }

  openRight(mode = 1, type = true) {
    // if (this.fileEditing != null)
    //   this.fileEditingOld = JSON.parse(JSON.stringify(this.fileEditing));
    // if (mode == 2) {
    //   // $('app-customdialog').css('z-index', '1000');
    //   this.onSetPermision(type);
    // }
    // //  $('#dms_properties').css('z-index', '1000');    
    // this.modeRequest = "";
    // this.modeShare = "";
    // var index = 0;
    // var i = 0;
    // this.currentPemission = -1;
    // if (this.modeSharing) { //findIndex
    //   index = this.fileEditing.permissions.findIndex(d => d.isSharing);
    // }

    // if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0 && index > -1) {
    //   if (this.fileEditing.permissions[index].startDate != null && this.fileEditing.permissions[index].startDate != null)
    //     this.startDate = this.formatDate(this.fileEditing.permissions[index].startDate.toString());
    //   if (this.fileEditing.permissions[index].endDate != null && this.fileEditing.permissions[index].endDate != null)
    //     this.endDate = this.formatDate(this.fileEditing.permissions[0].endDate.toString());
    // }

    // // modal-xs/modal-sm/modal-md/modal-lg/modal-xl   
    // this.openDialogFolder(this.contentRight, "lg", "right");
    // if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0)
    //   this.changePermission(index);
    // else {
    //   this.full = false;
    //   this.create = false;
    //   this.read = false;
    //   this.update = false;
    //   this.delete = false;
    //   this.download = false;
    //   this.share = false;
    //   this.upload = false;
    //   this.assign = false;
    // }
    // this.changeDetectorRef.detectChanges();
  }

  getSizeByte(size: any) {
    if (size != null)
      return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else return "";
  }

  getSizeKB(size: any) {
    if (size != null) {
      var kb = size / 1024;
      return kb.toFixed(2);
    }
    else {
      return "";
    }
  }

  setClassRating(i, rating) {
    if (i <= rating)
      return "icon-star text-warning icon-16 mr-1";
    else
      return "icon-star text-muted icon-16 mr-1";
  }

  viewfile(history, content, id) {
    // if (this.checkReadRight()) {
    //  $('#dms_properties').css('z-index', '1');
    // var obj = new objectPara();
    // obj.fileID = id + "|" + history.recID;
    // obj.fileName = history.fileName;
    // obj.extension = history.extension;
    // // obj.data = JSON.parse(this.data);
    // this.systemDialogService.onOpenViewFileDialog.next(obj);
  }

}