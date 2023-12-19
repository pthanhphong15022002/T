
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, CacheService, CodxService, DataRequest, DialogData, DialogRef, FormModel, ScrollComponent } from 'codx-core';
import { NotifyBodyComponent } from '../notify-body/notify-body.component';

@Component({
  selector: 'codx-notify-popup',
  templateUrl: './notify-drawer-popup.component.html',
  styleUrls: ['./notify-drawer-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotifyDrawerPopupComponent implements OnInit, AfterViewInit {
  dialogRef: DialogRef;
  vllType: any[] = [];
  type: any = null;
  vllStatus: any[] = [];
  status: any = null;
  mode = "0";
  isAfterRender=false;
  @ViewChild("notiBody") notiBody: NotifyBodyComponent;
  funcList: any;
  constructor
    (
      private cache: CacheService,
      @Optional() dialogData?: DialogData,
      @Optional() dialogRef?: DialogRef
    ) {
    this.dialogRef = dialogRef;
    this.cache.functionList('BGT001').subscribe(func=>{
      this.funcList = func;
      this.isAfterRender = true;
      
    });
  }


  ngOnInit(): void {
    this.cache.valueList("SYS055")
    .subscribe((vll:any) => {
      if(vll){
        this.vllType = vll.datas;
        this.type = vll.datas[0];
      }
    });
    this.cache.valueList("SYS057")
    .subscribe((vll:any) => {
      if(vll){
        this.vllStatus = vll.datas;
        this.status = vll.datas[0];
      }
    });
  }
  ngAfterViewInit(): void {
  }
  //
  clickTab(mode: any) {
    this.mode = mode;
    this.notiBody.clickTab(mode);
  }
  // filter entityName
  typeChange(event: any) {
    this.type = event;
    this.notiBody.typeChange(event);
  }
  // filter isRead
  statusChange(event: any) {
    this.status = event;
    this.notiBody.statusChange(event);
  }
}
