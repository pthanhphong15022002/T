import { C } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CircularGaugeComponent,
  GaugeTheme,
  IAxisLabelRenderEventArgs,
  ILoadedEventArgs,
} from '@syncfusion/ej2-angular-circulargauge';

import {
  AuthService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { OMCONST } from '../../codx-om.constant';
import { CodxOmService } from '../../codx-om.service';
import { ChartSettings } from '../../model/chart.model';

@Component({
  selector: 'view-okr',
  templateUrl: 'view-okr.component.html',
  styleUrls: ['view-okr.component.scss'],
})
export class ViewOKRComponent extends UIComponent implements AfterViewInit {  
  
  @Input() dataOKR:any;
  @Input() isCollapsedAll=false;
  @Input() isShowBreakLine=false;

  dialogRef: DialogRef;
  formModel: FormModel;
  obType = OMCONST.VLL.OKRType.Obj;
  krType = OMCONST.VLL.OKRType.KResult;
  skrType = OMCONST.VLL.OKRType.SKResult;

  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
  
  }
  ngAfterViewInit(): void {
    
  }

  onInit(): void {
    
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
      parent.data.items= parent?.data?.child;
    }
  }
}
