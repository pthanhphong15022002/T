import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { CodxDMService } from '../../codx-dm.service';
import { SubFolder } from '@shared/models/file.model';

@Component({
  selector: 'subFolder',
  templateUrl: './subFolder.component.html',
  styleUrls: ['./subFolder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
}) 
export class SubFolderComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;    
  @Output() eventShow = new EventEmitter<boolean>();
  titleDialog = 'Thư mục con';    
  titleFloor = 'Tầng';
  titleRange = 'Dãy';
  titleShelf = 'Kệ';
  titleCompartment = 'Ngăn';
  titleSave = 'Lưu';
  titleLevel = 'Cấp thư mục';
  titleLevelFor = 'Phân cấp theo';
  titleFormat = 'Định dạng';
  titleDesc = 'Diễn giải';
  listSubFolder: SubFolder[];
  subitem: SubFolder;
  viewFolderOnly = false;
  location: string;
  floor: string;
  range: string;
  shelf: string;
  compartment: string;
  dialog: any;
  listFormat1: any;
  listFormat2: any;
  listFormat3: any;
  listFormat4: any;
  listLevel: any;
  listType: any;
  indexSub: number;
  subItemLevel: string;
  disableSubItem: boolean;

  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private callfc: CallFuncService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,    
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {      
      this.dialog = dialog;           
      this.indexSub = data.data[1];
      this.subitem = data.data[2];
      this.listSubFolder = data.data[3];          
      this.subitem.type = this.subitem.type;
      this.subitem.format = this.subitem.format;
      this.subItemLevel = this.subitem.level;
      this.subitem.description = this.subitem.description;

      if (this.listSubFolder == null)
        this.listSubFolder = [];

      if ( this.indexSub == -1)
        this.subitem.level = (this.listSubFolder.length + 1).toString();      
  }

  ngOnInit(): void {   
   
  }  

  txtValue($event, type) { 
    switch(type) {
      case "level":
        this.subitem.level = $event.data;
        break;  
      case "type":
        this.subitem.type = $event.data;
        break;  
      case "format":
        this.subitem.format = $event.data;
        break;  
      case "description":
        this.subitem.description = $event.data;
        break;          
    }
  //  console.log($event);
  }

  getSelectText(ctrl, type) {
    var option = ctrl.selectedOptions[0];
    var text = option.outerText;
    var val = option.value;

    switch (type) {
      case "level":
        //if (this.contentSubFolder = false;)
        this.disableSubItem = false;
        if (this.listSubFolder != null) {
          var idx = -1;
          idx = this.listSubFolder.findIndex(x => x.level == val);
          if (idx > -1) {
            if (this.indexSub == -1 || (this.indexSub > -1 && this.listSubFolder[idx].level != this.subItemLevel)) {
              this.disableSubItem = true;
            }
          }
        }

        this.changeDetectorRef.detectChanges();
        this.subitem.levelText = text;
        break;
      case "type":
        this.subitem.typeText = text;
        break;
      case "format":
        this.subitem.formatText = text;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  // onSavePhysical() {
  //   this.location = this.floor + "|" + this.range + "|" + this.shelf + "|" + this.compartment;
  //   this.dialog.close();
  // }

  disableSubItemAdd() {
    return (this.listSubFolder.length >= 5)
  }

  SaveSubFolder() {
    if(!this.subitem.format) this.subitem.format = "1";
    if(this.checkRequied()) return; 
    if (this.indexSub == -1) {
      if (this.listSubFolder == null)
        this.listSubFolder = [];
      this.listSubFolder.push(Object.assign({}, this.subitem));//push(new Object(), this.subitem);
    }
    else {
      this.listSubFolder[this.indexSub] = JSON.parse(JSON.stringify(this.subitem));
    }

    //this.dmSV.ListSubFolder.next(this.listSubFolder);
    this.changeDetectorRef.detectChanges();   
    this.dialog.close(this.listSubFolder);
  }

  checkRequied()
  {
    var arr = [];
    if(!this.subitem.level || this.subitem.level =="") arr.push(this.titleLevel);
    if(!this.subitem.type || this.subitem.type =="") arr.push(this.titleLevelFor);
    if((!this.subitem.format || this.subitem.format =="") &&  this.subitem.type!="1") arr.push(this.titleFormat);
    if(arr.length>0)
    {
      this.notificationsService.notifyCode("SYS009",0,arr.join(' , '));
      return true;
    }
    return false;
  }
  doSubItemValueChange($event) {
    this.subitem.description = $event.target.value;
  }

  changeValue($event, type) {
    console.log($event);
    switch(type) {
      case "floor":
        this.floor = $event.data;    
        break;
      case "range":
        this.range = $event.data;    
        break;
      case "shelf":
        this.shelf = $event.data;    
        break;
      case "compartment":
        this.compartment = $event.data;    
        break;
    }
  }

  viewOnly() {
    return this.viewFolderOnly;
  }

  
}