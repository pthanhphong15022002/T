import { DataRequest } from './../../../../../../src/shared/models/data.request';
import {
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CodxFormComponent,
  CodxGridviewV2Component,
  FormModel,
  Util,
  CacheService,
} from 'codx-core';

@Component({
  selector: 'lib-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css'],
})
export class VoucherComponent implements OnInit {
  //#region Constructor
  dialog!: DialogRef;
  title: string;
  cashpayment: any;
  vouchers: Array<any> = [];
  gridModel: DataRequest = new DataRequest();
  gridHeight: number = 0;
  formModel: FormModel = {
    gridViewName: 'grvSubLedgerOpen',
    formName: 'SubLedgerOpen',
    entityName: 'AC_SubLedgerOpen',
  };
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  sublegendOpen: Array<any> = [];
  predicates: string;
  dataValues: string;

  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.gridModel.comboboxName = dialogData.data.cbxName;
    this.cashpayment = dialogData.data.cashpayment;
    this.title = dialogData.data.title;
    this.gridModel.pageSize = 20;
    this.gridModel.page = 1;
  }
  //#region Constructor

  //#region Init
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.api
      .execSv<any>(
        'AC',
        'Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        this.gridModel
      )
      .subscribe((res) => {
        if (res && res.length) {
          let data = [];
          let p = JSON.parse(res[0]);
          for (let i = 0; i < p.length; i++) {
            data.push(Util.camelizekeyObj(p[i]));
          }
          this.sublegendOpen = data;
        }
      });
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    let field = e.field;
    if (!e.data) {
      this.mapPredicates.delete(field);
      this.mapDataValues.delete(field);
    }
    if (field === 'voucherType' && e.data) {
      switch (e.data) {
        case '1':
          this.mapPredicates.set('voucherType', 'InvoiceDueDate <=@0');
          this.setDate();
          break;
        case '2':
          this.mapPredicates.set('voucherType', 'InvoiceDueDate <=@0');
          this.setDate();
          break;
      }
    }

    if (field === 'date' && this.mapPredicates.has('voucherType') && e.data)
      this.setDate(e.data);

    if (field === 'accountID' && e.data) {
      this.mapPredicates.set('accountID', 'AccountID.Contains(@0)');
      this.mapDataValues.set('accountID', e.data);
    }

    if (field === 'invoiceDueDate' && e.data) {
      this.mapPredicates.set('invoiceDueDate', 'InvoiceDueDate = @0');
      this.mapDataValues.set('invoiceDueDate', new Date(e.data).toISOString());
    }
  }

  gridCreated(e) {
    let hBody, hTab;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;

    this.gridHeight = hBody - (hTab + 120);
  }

  submit() {
    let predicates = Array.from(
      this.mapPredicates,
      ([name, value]) => value
    ).join('|');
    let dataValues = Array.from(
      this.mapDataValues,
      ([name, value]) => value
    ).join('|');

    this.gridModel.predicates = predicates;
    this.gridModel.dataValues = dataValues;
    this.loadData();
  }

  apply() {
    let data = this.grid.gridRef.getSelectedRecords();
    this.dialog.close(data);
  }
  //#endregion

  //#region function
  setDate(day?: any) {
    let date = new Date(this.cashpayment.voucherDate);
    let aDate = (date as any).addDays(day || 0);
    this.mapDataValues.set('date', aDate.toISOString());
  }
  //#endregion
}
