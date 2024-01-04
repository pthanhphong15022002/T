import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  UIDetailComponent,
  Util,
} from 'codx-core';

import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxPrService } from '../../codx-pr.service';

@Component({
  selector: 'view-kowcode',
  templateUrl: './view-kowcode.component.html',
  styleUrls: ['./view-kowcode.component.css'],
})
export class ViewKowcodeComponent extends UIComponent
implements AfterViewInit{
  dialogRef:any;
  @Input() cbbKowCode = [];
  constructor(
    injector: Injector,
    private cacheService: CacheService,
    private df: ChangeDetectorRef,
    @Optional() dialogRef: DialogRef,
    @Optional() dialogData: DialogData
  ) {
    super(injector);
    this.dialogRef = dialogRef;
    this.cbbKowCode = dialogData?.data?.cbbKowCode ?? this.cbbKowCode;
  }
  onInit(): void {
    this.loadCbxKowCode();
    
  }
  loadCbxKowCode(){
    if(this.cbbKowCode?.length==0){
      let gridModel = new DataRequest();
      gridModel.pageLoading = false;
      gridModel.comboboxName ='HRKows';
      this.api.execSv(
        'HR',
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        [gridModel]
      ).subscribe((cbx:any)=>{
        if(cbx && cbx[0]!=null){
          this.cbbKowCode= JSON.parse(cbx[0]);        
        }
        this.df.detectChanges();
      });
    }
    
  }
  ngAfterViewInit(): void {
  }
  
}
