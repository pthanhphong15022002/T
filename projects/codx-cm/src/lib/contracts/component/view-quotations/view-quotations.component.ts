import { Component, ElementRef, Input, OnChanges, OnInit, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, CacheService, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { CM_Quotations } from '../../../models/cm_model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'view-quotations',
  templateUrl: './view-quotations.component.html',
  styleUrls: ['./view-quotations.component.scss']
})
export class ViewQuotationsComponent implements OnInit,OnChanges{
  @ViewChild('productTable') productTable: CodxGridviewV2Component;
  @ViewChild('cardbodyGeneral') cardbodyGeneral: ElementRef;
  @ViewChild('quotationGeneral') quotationGeneral: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;

  @Input() quotationLines: any;
  @Input() fmQuotationLines: FormModel;
  @Input() fmQuotations: FormModel;
  @Input() quotations: CM_Quotations;

  dialog;
  gridHeight: number = 300;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  product = [];
  listQuotationLines: Array<any> = [];
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvMoreFunction: FormModel;
  fmContractsPayments: FormModel = {
    formName: 'CMContractsPayments',
    gridViewName: 'grvCMContractsPayments',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02041 ',
  };

  constructor(
    private codxCM: CodxCmService,
    private cache: CacheService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    
  }
  async ngOnInit(): Promise<void> {
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    // console.log('thuan');
    // this.codxCM
    // .getQuotationsLinesByTransID('f2c04250-f56d-11ed-a428-c025a5a4cd5d')
    // .subscribe((res) => {
    //   if (res) {
    //     this.dataSource = res;
    //   }
    // });
    
  }
  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {}
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }

  async ngOnChanges(changes: SimpleChanges){
    if(changes.dataSource && this.quotationLines){
      // this.productTable.refresh();
    }
  }
}
