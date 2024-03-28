import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewChild, } from '@angular/core';
import { DialogRef, ApiHttpService, DialogData, ScrollComponent, DataRequest, CacheService, CodxService, AuthStore, DialogModel, CallFuncService, FormModel } from 'codx-core';
import { NotifyBodyComponent } from '../notify-body/notify-body.component';
import { NotifyDrawerPopupComponent } from '../notify-drawer-popup/notify-drawer-popup.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-notify-drawer-slider',
  templateUrl: './notify-drawer-slider.component.html',
  styleUrls: ['./notify-drawer-slider.component.scss']
})
export class NotifyDrawerSliderComponent implements OnInit, OnDestroy {
  dialogRef: DialogRef;
  messageNoData:string ="";
  vllType:any[] = [];
  type:any = null;
  vllStatus:any[] = [];
  status:any = null;
  moreFC:any[] = [];
  formModel:FormModel = null;
  headerText="";
  funcList :any;
  isAfterRender=false;

  subscriptions = new Subscription();
  @ViewChild("notiBody") notiBody:NotifyBodyComponent; 

  constructor(
    private cache:CacheService,
    private callFC:CallFuncService,
    private dt:ChangeDetectorRef,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {    
    this.dialogRef = dialogRef;
    let subcribe = this.cache.functionList('BGT001').subscribe(func=>{
      this.funcList = func;
      this.isAfterRender = true;
      this.headerText = func?.customName;
      this.dt.detectChanges();
    });
    this.subscriptions.add(subcribe);
  }

 

  ngOnInit(): void {
    let subcribe1 = this.cache.valueList("SYS055")
    .subscribe((vll:any) => {
      if(vll)
      {
        this.vllType = vll.datas;
        this.type = vll.datas[0];
        this.dt.detectChanges();
      }
    });
    let subcribe2 = this.cache.valueList("SYS057")
    .subscribe((vll:any) => {
      if(vll)
      {
        this.vllStatus = vll.datas;
        this.status = vll.datas[0];
        this.dt.detectChanges();
      }
    });
    let subcribe3 = this.cache.functionList("BGT001")
    .subscribe((func:any)=>{
      this.formModel = new FormModel();
      this.formModel.funcID = func.functionID;
      this.formModel.formName = func.formName;
      this.formModel.gridViewName = func.gridViewName;
      this.formModel.entityName = func.entityName;
      this.formModel.userPermission = func.userPermission;
      this.cache.moreFunction(this.formModel.formName,this.formModel.gridViewName)
      .subscribe((mfc:any) => {
        this.moreFC = mfc;
      });
      this.dt.detectChanges();
    });
    this.subscriptions.add(subcribe1);
    this.subscriptions.add(subcribe2);
    this.subscriptions.add(subcribe3);

  }

  ngAfterViewInit(){

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  typeChange(event:any){
    this.type = event;
    this.notiBody.typeChange(event);
  }

  statusChange(event:any){
    this.status = event;
    this.notiBody.statusChange(event);
  }

  viewAll(){
    let _option = new DialogModel();
    _option.IsFull = true;
    _option.zIndex = 1001;
    _option.IsModal = false;
    this.callFC.openForm(NotifyDrawerPopupComponent,"",0,0,"",null,"",_option);
  }

  clickMF(event){
    if(event){
      switch(event.functionID){
        case "WP009": // đánh dấu đọc tất cả
          this.notiBody.checkReadAll();
          break;
        case "WP010": // xem tất cả
          this.viewAll();
          break; 
        default:
          break;
      }
    }
  }

  changeDataMF(arrMFC){
      arrMFC.map(e => {
        if(e.functionID == "WP009" || e.functionID == "WP010")
          e.disabled = false;
        else
          e.disabled = true;
      });
  }

}
