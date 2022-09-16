import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderInfo } from '@shared/models/folder.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, ItemInterval } from '@shared/models/file.model';

@Component({
  selector: 'copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyComponent implements OnInit {
  @Input() listFolders: any;
  @Input() listFiles: any;
  @Input() formModel: any;
  @Input() type: any;
  //listFolders: FolderInfo[];
 // listFiles: FileInfo[];
  html: string;
  count: number;
  tenant: string;
  oldFolderId: string;
  _propertyName: string = "";
  fullName: string = "";
  id: string = "";
  ext: string = "";
  user: any;
  item: FolderInfo;
  totalRating: number;
  totalViews: number;  
  //type1: string;
  //data: any;
  //Mustache = require('mustache');
  errorshow = false;
  loaded: boolean;
  loadedFile: boolean;
  loadedFolder: boolean;
  setting: any;  
  title = 'Thông báo';
  titleFullName = 'Nhập lại tên mới';
  titleSave = "Lưu";
  titleMessage = "Tên bắt buộc.";
  titleRequired = "Tên bắt buộc.";
  titleDialog = 'Sao chép';
  dialog: any;
  data: FileInfo;  
  objectType: string;
  copy = false;
  interval: ItemInterval[];
//   @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild('view') view!: ViewsComponent; 
  
  @Output() eventShow = new EventEmitter<boolean>();
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private folderService: FolderService,
    private fileService: FileService,
    private api: ApiHttpService,
    public dmSV: CodxDMService,
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
      this.titleDialog = data.data.title;
      this.objectType = data.data[0];
      this.data = data.data[1];
      this.id = this.data.recID;
      this.titleDialog = data.data[2];
      this.copy = data.data[3];
      if (this.data != null) {
        if (this.objectType == "file") {
          this.fullName = this.data.fileName;
          if (this.copy)
            this.fileService.getFileDuplicate(this.data.fileName ,this.data.folderId).subscribe(item => {
              this.fullName = item;
              this.changeDetectorRef.detectChanges();
            });
        }  
        else 
          this.fullName = this.data.folderName;
      }
    
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
    this.user = this.auth.get();
  }

  displayThumbnail(data) {
    this.dmSV.setThumbnailWait.next(data);
  }

  SaveData() {
    var that = this;
    if (this.fullName === "") {
      this.changeDetectorRef.detectChanges();
      return;      
    }

    if (this.objectType == 'file') {
      // doi ten file   
      if (this.copy) {
        this.fileService.copyFile(that.id, that.fullName, "").subscribe(async res => {
          if (res.status == 0) {
            var files = that.dmSV.listFiles;
            if (files == null) files = [];
            //var ret = `../../../assets/codx/dms/${this.dmSV.getAvatar(res.data.extension)}`
            res.data.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(res.data.extension)}`;//"../../../assets/img/loader.gif";
            files.push(Object.assign({}, res.data));
            this.dmSV.listFiles = files;
            that.dmSV.ChangeData.next(true);
            that.displayThumbnail(res.data);
            this.dialog.close();
            that.notificationsService.notify(res.message);
          }
          else {       
            this.titleMessage = res.message;
            this.errorshow = true;
          }

          if (res.status == 6) 
          {         
            var config = new AlertConfirmInputConfig();
            config.type = "YesNo";
            this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x => { 
              if(x.event.status == "Y") {
                that.fileService.copyFile(that.id, that.fullName, "", 0, 1).subscribe(async item => {
                  if (item.status == 0) {
                    var files = that.dmSV.listFiles;
                    if (files == null) files = [];

                    let index = files.findIndex(d => d.recID.toString() === item.data.recID);
                    if (index != -1) {
                      item.data.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(item.data.extension)}`;//"../../../assets/img/loader.gif";
                      files[index] = item.data;
                      that.displayThumbnail(item.data);
                      that.dmSV.listFiles = files;                      
                      that.dmSV.ChangeData.next(true);
                    }

                    this.changeDetectorRef.detectChanges();  
                    this.dialog.close();                  
                  }
                  that.notificationsService.notify(item.message);
                });
              }
            });         
          }
        });
      }
      else {
        // rename
        this.fileService.renameFile(that.id, that.fullName).subscribe(async res => {
          if (res.status == 0) {
            var files = that.dmSV.listFiles;
            let index = files.findIndex(d => d.recID.toString() === this.id);
            if (index != -1) {
              files[index].fileName = this.fullName;
            }
            this.dmSV.listFiles = files;
            this.dmSV.ChangeData.next(true);
            this.dialog.close();     
         //   that.notificationsService.notify(res.message);    
          }
          else {          
            this.titleMessage = res.message;
            this.errorshow = true;
          }

          if (res.status == 6) {     
            var config = new AlertConfirmInputConfig();
            config.type = "YesNo";
            this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x => { 
              that.fileService.renameFile(that.id, res.data.fileName).subscribe(async item => {
                if (item.status == 0) {
                  var files = that.dmSV.listFiles;
                  let index = files.findIndex(d => d.recID.toString() === this.id);
                  if (index != -1) {
                    files[index].fileName = item.data.fileName;
                  }
                  that.dmSV.listFiles = files;                
                  that.changeDetectorRef.detectChanges();
                  this.dialog.close();
                }
                that.notificationsService.notify(item.message);
              });
            });
          }
          else {
            this.notificationsService.notify(res.message);
            this.dialog.close();         
          }
        });
      }
    }
    else {
      this.folderService.renameFolder(that.id, that.fullName).subscribe(async res => {
        if (res.status == 0) {
          let folder = new FolderInfo();
          folder.recID = that.id;
          folder.folderName = that.fullName;
          //    that.dmSV.nodeChange.next(folder);
          var folders = that.dmSV.listFolder;
          //folders.forEach(item => )
          let index = folders.findIndex(d => d.recID.toString() === that.id);
          if (index != -1) {
            folders[index].folderName = that.fullName;
            that.dmSV.nodeChange.next(folders[index]);
          }
          that.dmSV.listFolder = folders;
          that.dmSV.ChangeData.next(true);
          that.changeDetectorRef.detectChanges();
          this.dialog.close();
         // that.notificationsService.notify(res.message);
         // this.modalService.dismissAll();
        }
        else {
       //   $('#fullName').addClass('form-control is-invalid');
      //    $('#fullName').focus();
          this.titleMessage = res.message;
          this.errorshow = true;
        }

        // thu muc da cc 
        if (res.status == 2) {
          that.fullName = res.data.folderName;
          var config = new AlertConfirmInputConfig();
          config.type = "YesNo";
          this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x => { 
            var id = '';
            this.folderService.copyFolder(that.id, res.data.folderName, "", 1, 1).subscribe(async item => {
              if (item.status == 0) {
                // id = item.data.recID; 
                that.dmSV.isTree = false;
                that.dmSV.currentNode = '';
                that.dmSV.folderId.next(item.data.parentId);
                var folders = this.dmSV.listFolder;
                let index = folders.findIndex(d => d.recID.toString() === that.id);
                if (index > -1) {
                  folders[index] = item.data;
                  that.dmSV.nodeChange.next(folders[index]);
                }
                that.dmSV.listFolder = folders;                    
                that.dmSV.ChangeData.next(true);
              //  that.modalService.dismissAll();                      
                that.changeDetectorRef.detectChanges();
                this.dialog.close();
              }
              else {
                that.titleMessage = item.message;
                that.errorshow = true;
                that.notificationsService.notify(item.message);
              }
            });
          });
        }
        else {
          this.notificationsService.notify(res.message);
          this.dialog.close();
        //  this.modalService.dismissAll();
        }
      });
    }
  }

  checkFolderName() {     
    if (this.fullName === "")
      return "1";  
    else
      return "0";
  }

  validate(item) {  
    this.errorshow = false;
    switch (item) {  
      case "fullName":
        if (this.checkFolderName() != "0") {        
          return "w-100 border border-danger is-invalid";       
        }
        else {
          return "w-100";      
        }
    }  
    return "";    
  }

  changeValue($event, type) {
    console.log($event);
    switch(type) {
      case "fullName":
        this.fullName = $event.data;    
     //   alert(this.folderName);
        break;
    }
  }
}