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

  dialogRef: DialogRef;
  formModel: FormModel;
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;

  constructor(
    private injector: Injector,
  ) {
    super(injector);
  
  }
  ngAfterViewInit(): void {
    
  }

  onInit(): void {
    //this.getCacheData();
    
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
}
