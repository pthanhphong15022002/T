import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  ViewEncapsulation,
} from '@angular/core';

import {
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';

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

  dialogRef: DialogRef;
  formModel: FormModel;
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;
  listUM=[];

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
}
