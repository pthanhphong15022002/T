
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthStore, CacheService, CodxService, DataRequest, DialogData, DialogRef, FormModel, ScrollComponent } from 'codx-core';
import { NotifyBodyComponent } from '../notify-body/notify-body.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'codx-notify-popup',
  templateUrl: './notify-drawer-popup.component.html',
  styleUrls: ['./notify-drawer-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotifyDrawerPopupComponent implements OnInit, AfterViewInit,OnDestroy {
  dialogRef: DialogRef;
  vllType: any[] = [];
  type: any = null;
  vllStatus: any[] = [];
  status: any = null;
  mode = "0";
  isAfterRender=false;
  subscritions = new Subscription();
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
    let subscribe1 = this.cache.valueList("SYS055")
    .subscribe((vll:any) => {
      if(vll){
        this.vllType = vll.datas;
        this.type = vll.datas[0];
      }
    });
    let subscribe2 = this.cache.valueList("SYS057")
    .subscribe((vll:any) => {
      if(vll){
        this.vllStatus = vll.datas;
        this.status = vll.datas[0];
      }
    });
    this.subscritions.add(subscribe1);
    this.subscritions.add(subscribe2);
  }
  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscritions.unsubscribe();
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
