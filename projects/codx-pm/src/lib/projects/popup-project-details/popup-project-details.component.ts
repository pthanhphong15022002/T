import { Component, ViewEncapsulation, OnInit, AfterViewInit, ChangeDetectorRef, Optional, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CacheService, DialogData, DialogRef } from "codx-core";

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
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.cache.valueList('PM006').subscribe((res:any)=>{
      if(res && res.datas){
        this.tabControl = res?.datas;
        this.tabControl.map((x:any)=> {if(x.value=='1'){
          x.isActive=true;
          this.selectedTab =x;
        } return x;})
      }

    });
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

  selectedTab:any;
  clickMenu(item) {
    this.name = item.name;
    this.selectedTab = item;
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    // var body = document.querySelectorAll('body.toolbar-enabled');
    // if(body && body.length > 0)
    if (
      this.name == 'Tasks' ||
      this.name == 'AssignTo' ||
      this.name == 'Meetings'
    )
      this.offset = '65px';
    else this.offset = '0px';
    item.isActive = true;
    this.changeDetectorRef.detectChanges();
  }
}
