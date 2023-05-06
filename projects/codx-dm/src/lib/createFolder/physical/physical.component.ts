import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { CodxDMService } from '../../codx-dm.service';

@Component({
  selector: 'physical',
  templateUrl: './physical.component.html',
  styleUrls: ['./physical.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
}) 
export class PhysicalComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;    
  @Output() eventShow = new EventEmitter<boolean>();
  titleDialog = 'Kiểm soát kho';    
  titleFloor = 'Tầng';
  titleRange = 'Dãy';
  titleShelf = 'Kệ';
  titleCompartment = 'Ngăn';
  titleSave = 'Lưu';
  viewFolderOnly = false;
  location: string;
  floor: string;
  range: string;
  shelf: string;
  compartment: string;
  dialog: any;
  
  constructor(  
    public dmSV: CodxDMService,
    private notificationsService: NotificationsService,
   // private confirmationDialogService: ConfirmationDialogService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {      
      this.dialog = dialog;
      if (data?.data[1] != undefined){
        this.location = data?.data[1]; 
        let list = this.location.split("|");
        this.floor = list[0];
        this.range = list[1];
        this.shelf = list[2];
        this.compartment = list[3];
      }
      else {
        this.floor = "";
        this.range = "";
        this.shelf = "";
        this.compartment = "";
      }             
  }

  ngOnInit(): void {   
   
  }  

  onSavePhysical() {
    if(this.checkRequired()) return ;
    this.location = this.floor + "|" + this.range + "|" + this.shelf + "|" + this.compartment;
    this.dialog.close(this.location);
  }

  checkRequired()
  {
    var arr = [];
    if(!this.floor) arr.push("tầng");
    if(!this.range) arr.push("dãy");
    if(!this.shelf) arr.push("kệ");
    if(!this.compartment) arr.push("ngăn");
    if(arr.length>0)
    {
      var name = arr.join(" , ");
      this.notificationsService.notifyCode("SYS009",0,name);
      return true;
    }
    return false;
  }
  changeValue($event, type) {
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