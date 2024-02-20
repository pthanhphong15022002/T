import { Component, ViewEncapsulation, OnInit, AfterViewInit, ChangeDetectorRef, Optional, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DialogData, DialogRef } from "codx-core";

@Component({
  selector: 'popup-project-details',
  templateUrl: './popup-project-details.component.html',
  styleUrls: ['./popup-project-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupProjectDetailsComponent implements OnInit, AfterViewInit{


  resources:any;
  data:any;
  dialog:any;
  nameObj: any;
  projectCategory: string = '2';
  offset = '0px';
  name:string='Tasks';
  tabControl: any= [{ name: 'Tasks', textDefault: 'Công việc', isActive: true },];
  dataObj:any={};
  showMoreFunc:boolean=true;
  showButtonAdd:boolean=true;
  viewMode:any;
  createdByName:string;
  constructor(
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    if(this.data && this.data.settings){
      this.resources = this.data.settings.map((x:any)=> x.objectID)?.join(';');
    }
    this.nameObj = this.data.projectName
    this.dialog = dialog;
  }


  ngAfterViewInit(): void {

  }

  ngOnInit(): void {

  }

  closePopup() {
    this.dialog.close();
  }
}
