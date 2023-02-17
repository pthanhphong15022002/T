
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, CacheService, CodxService, DataRequest, DialogData, DialogRef, FormModel, ScrollComponent } from 'codx-core';
import { NotifyBodyComponent } from '../notify-body/notify-body.component';

@Component({
  selector: 'codx-notify-popup',
  templateUrl: './notify-drawer-popup.component.html',
  styleUrls: ['./notify-drawer-popup.component.scss']
})
export class NotifyDrawerPopupComponent implements OnInit, AfterViewInit {
  dialogRef: DialogRef;
  vllType:any[] = [];
  type:any = null;
  vllStatus:any[] = [];
  status:any = null;
  mode = "0";
  @ViewChild("notiBody") notiBody:NotifyBodyComponent;
  constructor
  (
    private cache:CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
  }
 

  ngOnInit(): void {
    this.cache.valueList("SYS055").subscribe((vll:any) => {
      if(vll){
        this.vllType = vll.datas;
        let _default  = vll.datas.find(x => x.value === "");
        if(_default){
          this.type = _default;
        }
        else{
          this.type = vll.datas[0];
        }
      }
    });
    this.cache.valueList("SYS057").subscribe((vll:any) => {
      if(vll){
        this.vllStatus = vll.datas;
        let _default  = vll.datas.find(x => x.value === "");
        if(_default){
          this.status = _default;
        }
        else{
          this.status = vll.datas[0];
        }
      }
    });
  }
  ngAfterViewInit(): void {
  }
  //
  clickTab(mode:any){
    this.mode = mode;
    this.notiBody.clickTab(mode);
  }
   // filter entityName
   typeChange(event:any){
    this.type = event;
    this.notiBody.typeChange(event);
  }
  // filter isRead
  statusChange(event:any){
    this.status = event;
    this.notiBody.statusChange(event);
  }
}
