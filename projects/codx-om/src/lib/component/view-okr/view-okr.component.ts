import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {
  DialogModel,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';
import { PopupShowOBComponent } from '../../popup/popup-show-ob/popup-show-ob.component';
import { PopupShowKRComponent } from '../../popup/popup-show-kr/popup-show-kr.component';

@Component({
  selector: 'view-okr',
  templateUrl: 'view-okr.component.html',
  styleUrls: ['view-okr.component.scss'],
})
export class ViewOKRComponent extends UIComponent implements AfterViewInit {  
  
  @Input() dataOKR:any;
  @Input() isCollapsedAll=false;
  @Input() isShowBreakLine=false;
  @Input() okrFM:any;
  @Input() okrVll:any;
  @Input() okrGrv:any;
  @Input() allowShowDetail=false;

  @ViewChild('showTask') showTask: any;
  dialogRef: DialogRef;
  formModel: FormModel;
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;
  listUM=[];
  selectOKR: any;

  constructor(
    private injector: Injector,
    private codxOmService: CodxOmService,
  ) {
    super(injector);
  
  }
  ngAfterViewInit(): void {
    
  }

  onInit(): void {
    //this.getCacheData();
    this.codxOmService.getListUM().subscribe((res:any)=>{
      if(res ){
        Array.from(res).forEach((um:any)=>{
          this.listUM.push({umid:um?.umid,umName:um?.umName});
        });        
      }
    });
  }

  //-----------------------End-------------------------------//

  //-----------------------Base Event------------------------//
  click(event: any) {
    switch (event) {
    }
  }

  //-----------------------End-------------------------------//
  
  //-----------------------Get Data Func---------------------//
  
  collapeKR(collapsed: boolean) {
    
    this.dataOKR.forEach((ob) => {
      ob.isCollapse = collapsed;
    });
    this.detectorRef.detectChanges();
    this.dataOKR.forEach((ob) => {
      if (ob.items != null && ob.items.length > 0) {
        ob.items.forEach((kr) => {
          kr.isCollapse = collapsed;
        });
      }
    });
    this.isCollapsedAll = collapsed;
    this.detectorRef.detectChanges();
  }
  
  selectionChange(parent) {
    if (parent.isItem) {
      parent.data.items= parent?.data?.items;
    }
  }
  //Lấy UMName
  getUMName(umid:string){
    let tmpUM = this.listUM.filter((obj) => {
      return obj.umid == umid;
    });
    if(tmpUM!=null && tmpUM.length>0){
      return tmpUM[0]?.umName;
    }
    else{
      return umid;
    }
  }
  showTasks(evt:any,data:any){    
    evt.stopPropagation();
    evt.preventDefault();
    if(evt !=null && data!=null){
      this.selectOKR=data;
      let dialogShowTask = this.callfc.openForm(this.showTask, '', 1280, 720, null);
    }
  }
  //Xem chi tiết OB
  showOB(obj: any, popupTitle: any) {
    if(!this.allowShowDetail){
      return;
    }
    let dModel = new DialogModel();
    dModel.IsFull = true;
    dModel.FormModel = this.okrFM?.obFM;
    let dialogShowOB = this.callfc.openForm(
      PopupShowOBComponent,
      '',
      null,
      null,
      null,
      [obj, popupTitle, this.okrFM,this.okrVll,this.okrGrv],
      '',
      dModel
    );
  }
  //Xem chi tiết KR
  showKR(kr: any, popupTitle: any) {
    if(!this.allowShowDetail){
      return;
    }
    let dModel = new DialogModel();
    popupTitle=popupTitle!=null ? popupTitle :"Xem chi tiết";
    dModel.IsFull = true;
    dModel.FormModel = this.okrFM?.krFM;
    let dialogShowKR = this.callfc.openForm(
      PopupShowKRComponent,
      '',
      null,
      null,
      null,
      [kr, popupTitle, this.okrFM,this.okrVll,this.okrGrv],
      '',
      dModel
    );
  }
  clickTreeNode(evt:any, ){
    evt.stopPropagation();
    evt.preventDefault();
  }
}
