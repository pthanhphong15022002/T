import { Component, Injector, Input, SimpleChange, ViewChild, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DataRequest, DialogModel, FormModel, UIComponent } from 'codx-core';
import { AdvancedPaymentLines } from '../../models/AdvancedPaymentLines.model';
import { AdvancedPayment } from '../../models/AdvancedPayment.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { AdvancePaymentAddComponent } from '../advance-payment-add/advance-payment-add.component';

@Component({
  selector: 'lib-advance-payment-detail',
  templateUrl: './advance-payment-detail.component.html',
  styleUrls: ['./advance-payment-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancePaymentDetailComponent extends UIComponent {
  
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() company: any;
  
  headerText: string = '';
  logosrc: any;
  dataCategory: any;
  formType: any;
  private destroy$ = new Subject<void>();
  advancedPayment: AdvancedPayment;
  advancedPaymentLines: Array<AdvancedPaymentLines> = [];
  fmAdvancedPaymentLines: FormModel = {
    entityName: 'AC_AdvancedPaymentLines',
    formName: 'AdvancedPaymentLines',
    gridViewName: 'grvAdvancedPaymentLines',
  }
  grvSetupAdvancedPaymentLines: any;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
  )
  {
    super(inject);

    this.cache.gridViewSetup(this.fmAdvancedPaymentLines.formName, this.fmAdvancedPaymentLines.gridViewName)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
        this.grvSetupAdvancedPaymentLines = res;
    });
  }

  onInit(): void {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnChanges(value: SimpleChange) {
    // this.loadDataLine(this.dataItem,this.recID);

    if(this.dataItem)
    {
      this.loadDataLine(this.dataItem);
    }
    else 
    {
      if(!this.recID)
        return;
      this.api
      .exec('AC', 'AdvancedPaymentBusiness', 'LoadDataByRecIDAsync', [
        this.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          this.dataItem = res;
          this.loadDataLine(this.dataItem);
        }
      });
    }
  }  

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS002':
        this.export(data);
        break;
    }
  }

  edit(e, data) {
    this.dataService
    .edit(data)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
      {
        var obj = {
          formType: 'edit',
          headerText: this.headerText,
          advancedPayment: data,
          company: this.company,
        };
        let opt = new DialogModel();
        opt.FormModel = this.formModel;
        opt.DataService = this.dataService;
        var dialog = this.callfc.openForm(
          AdvancePaymentAddComponent,
          '',
          800,
          850,
          '',
          obj,
          '',
          opt
        );
        dialog.closed
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.event != null) {
          }
        });
      }
    });
  }

  copy(dataCopy) {
    this.dataService
    .copy((o) => this.setDefault())
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
      {
        dataCopy.recID = res.recID;
        dataCopy.voucherNo = res.voucherNo;
        dataCopy.status = res.status;
        dataCopy['_uuid'] = res['_uuid'];
        var obj = {
          formType: 'copy',
          headerText: this.headerText,
          advancedPayment: dataCopy,
          company: this.company,
        };
        let opt = new DialogModel();
        opt.FormModel = this.formModel;
        opt.DataService = this.dataService;
        var dialog = this.callfc.openForm(
          AdvancePaymentAddComponent,
          '',
          800,
          850,
          '',
          obj,
          '',
          opt
        );
        dialog.closed
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.event != null) {
          }
        });
      }
    });
  }

  delete(data) {
    if (data) {
      this.dataService.dataSelected = data;
    }
    this.dataService.delete([data], true).subscribe((res: any) => {
    });
  }

  export(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.page = this.dataService.request.page;
    gridModel.pageSize = this.dataService.request.pageSize;
    gridModel.predicate = this.dataService.request.predicates;
    gridModel.dataValue = this.dataService.request.dataValues;
    gridModel.entityPermission = this.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }
  //#endregion

  //#region Function

  loadDataLine(data) {
    this.api
      .exec('AC', 'AdvancedPaymentLinesBusiness', 'LoadDataAsync', [
        data.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          this.advancedPaymentLines = res;
        }
        this.detectorRef.detectChanges();
      });
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  setDefault() {
    return this.api.exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync');
  }
}
