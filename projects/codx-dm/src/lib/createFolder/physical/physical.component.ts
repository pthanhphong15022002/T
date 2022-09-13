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
  titleDialog = 'Physical Control';    
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
    this.location = this.floor + "|" + this.range + "|" + this.shelf + "|" + this.compartment;
    this.dmSV.Location.next(this.location);
    this.dialog.close();
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