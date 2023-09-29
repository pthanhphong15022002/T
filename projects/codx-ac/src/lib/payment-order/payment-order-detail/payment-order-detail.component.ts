import { Component, Injector, Input, SimpleChange, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DataRequest, DialogModel, FormModel, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { PaymentOrder } from '../../models/PaymentOrder.model';
import { PaymentOrderLines } from '../../models/PaymentOrderLines.model';
import { PaymentOrderAddComponent } from '../payment-order-add/payment-order-add.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { AdvancedPayment } from '../../models/AdvancedPayment.model';


@Component({
  selector: 'lib-payment-order-detail',
  templateUrl: './payment-order-detail.component.html',
  styleUrls: ['./payment-order-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentOrderDetailComponent extends UIComponent {
  
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() company: any;
  @Input() headerText: any;
  
  logosrc: any;
  dataCategory: any;
  formType: any;
  private destroy$ = new Subject<void>();
  advancedPayment: AdvancedPayment = new AdvancedPayment();
  paymentOrder: PaymentOrder;
  paymentOrderLines: Array<PaymentOrderLines> = [];
  fmPaymentOrderLines: FormModel = {
    entityName: 'AC_PaymentOrderLines',
    formName: 'PaymentOrderLines',
    gridViewName: 'grvPaymentOrderLines',
  }
  fmAdvancedPayment: FormModel = {
    entityName: 'AC_AdvancedPayment',
    formName: 'AdvancedPayment',
    gridViewName: 'grvAdvancedPayment',
  }
  grvSetupPaymentOrderLines: any;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
  )
  {
    super(inject);

    this.advancedPayment.totalAmt = 0;

    this.cache.gridViewSetup(this.fmPaymentOrderLines.formName, this.fmPaymentOrderLines.gridViewName)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
        this.grvSetupPaymentOrderLines = res;
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

    if(this.dataItem.refNo)
    {
      this.loadAdvancedPayment();
    }
  }  

  ngAfterViewInit() {
  }

  ngOnDestroy() {
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
          advancedPayment: {...data},
          company: this.company,
        };
        let opt = new DialogModel();
        opt.FormModel = this.formModel;
        opt.DataService = this.dataService;
        var dialog = this.callfc.openForm(
          PaymentOrderAddComponent,
          '',
          800,
          850,
          '',
          obj,
          '',
          opt
        );
      }
    });
  }
  copy(dataCopy) {
    this.view.dataService
    .copy((o) => this.setDefault(dataCopy,'copy'))
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res != null)
      {
        let datas = {...res};
        this.dataService.saveAs(datas).pipe(takeUntil(this.destroy$)).subscribe((res)=>{
          if(res)
          {
            var obj = {
              formType: 'copy',
              headerText: this.headerText,
              advancedPayment: {...datas},
              company: this.company,
            };
            let opt = new DialogModel();
            opt.FormModel = this.formModel;
            opt.DataService = this.dataService;
            var dialog = this.callfc.openForm(
              PaymentOrderAddComponent,
              '',
              800,
              850,
              '',
              obj,
              '',
              opt
            );
            this.dataService.add(datas).pipe(takeUntil(this.destroy$)).subscribe();
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
      .exec('AC', 'PaymentOrderLinesBusiness', 'LoadDataAsync', [
        data.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          this.paymentOrderLines = res;
        }
        this.detectorRef.detectChanges();
      });
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  setDefault(data:any,action:any = '') {
    return this.api.exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync', [
      data,
      action
    ]);
  }

  loadAdvancedPayment(){
    this.api
      .exec<any>('AC', 'AdvancedPaymentBusiness', 'LoadDataByVoucherNoAsync', [
        this.dataItem.refNo,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.advancedPayment = res;
          this.detectorRef.detectChanges();
        }
      });
  }
}

