import { ChangeDetectorRef, Component, OnChanges, OnInit, Optional, SimpleChanges, ViewChild, } from '@angular/core';
import { DialogRef, ApiHttpService, DialogData, ScrollComponent, DataRequest, CacheService, CodxService, AuthStore, DialogModel, CallFuncService, FormModel } from 'codx-core';
import { NotifyBodyComponent } from '../notify-body/notify-body.component';
import { NotifyDrawerPopupComponent } from '../notify-drawer-popup/notify-drawer-popup.component';

@Component({
  selector: 'lib-notify-drawer-slider',
  templateUrl: './notify-drawer-slider.component.html',
  styleUrls: ['./notify-drawer-slider.component.scss']
})
export class NotifyDrawerSliderComponent implements OnInit {
  dialogRef: DialogRef;
  messageNoData:string ="";
  vllType:any[] = [];
  type:any = null;
  vllStatus:any[] = [];
  status:any = null;
  moreFC:any[] = [];
  formModel:FormModel = null;
  @ViewChild("notiBody") notiBody:NotifyBodyComponent; 
  constructor(
    private cache:CacheService,
    private callFC:CallFuncService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {    
    this.dialogRef = dialogRef;
    this.formModel = new FormModel();
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
    this.cache.functionList("BGT001")
    .subscribe((func:any)=>{
      this.formModel.funcID = func.functionID;
      this.formModel.formName = func.formName;
      this.formModel.gridViewName = func.gridViewName;
      this.formModel.entityName = func.entityName;
      this.formModel.userPermission = func.userPermission;
      this.cache.moreFunction(this.formModel.formName,this.formModel.gridViewName)
      .subscribe((mfc:any) => {
        this.moreFC = mfc;
      });
    });
  }

  ngAfterViewInit(){

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

  //
  // open popup view all noti
  viewAll(){
    let _option = new DialogModel();
    _option.IsFull = true;
    _option.zIndex = 1001;
    _option.IsModal = false;
    this.callFC.openForm(NotifyDrawerPopupComponent,"",0,0,"",null,"",_option);
  }
  //click more FC
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
   // change More funtion
  changeDataMF(arrMFC){
      arrMFC.map(e => {
        if(e.functionID == "WP009" || e.functionID == "WP010")
          e.disabled = false;
        else
          e.disabled = true;
      });
  }

}
