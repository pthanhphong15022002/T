import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderInfo } from '@shared/models/folder.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo } from '@shared/models/file.model';

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
  titleFullName = 'Tên';
  titleSave = "Save";
  titleMessage = "Tên bắt buộc.";
  titleRequired = "Tên bắt buộc.";
  titleDialog = 'Sao chép';
  dialog: any;
  data: FileInfo;  
  objectType: string;
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
      this.titleDialog = data.data[2];
      if (this.data != null) {
        if (this.objectType == "file") {
          this.fullName = this.data.fileName;
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

  SaveData() {

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
          return "w-100 text-error is-invalid";       
        }
        else {
          return "w-100";      
        }

        break;
    }  
    return "";    
  }

  changeValue($event, type) {
    console.log($event);
    switch(type) {
      case "folderName":
        this.fullName = $event.data;
     //   alert(this.folderName);
        break;
    }
  }
}