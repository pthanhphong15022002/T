import { mode } from 'crypto-js';
import { TabModel } from './../../../../../../codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { InvoicesLine } from '../../../models/invoice.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  EditSettingsModel,
  GridComponent,
  VirtualScrollService,
} from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogRef,
  FormModel,
  RequestOption,
  Util,
} from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'lib-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css'],
  providers: [VirtualScrollService],
})
export class AddEditComponent implements OnInit {
  //#region Contructor
  @Input() headerText: string;
  dialog: DialogRef;
  invoices: any;
  action: string;
  active = true;
  gridHeight: number;
  fmInvoiceLines: FormModel = {
    formName: 'EIInvoices',
    gridViewName: 'grvEIInvoiceLines',
    entityName: 'EI_InvoiceLines',
  };
  fgGoods: FormGroup;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Batch',
  };
  selectedItem: any;
  selectedIndex: number = 0;
  data: Array<any> = [];
  tabs: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
  ];
  dicMST: Map<string, any> = new Map<string, any>();
  dicCbx: Map<string, any> = new Map<string, any>();

  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('invoicesRef') invoicesRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.invoices = dialog.dataService!.dataSelected;
    this.action = dialogData.data[0];
    this.headerText = dialogData.data[1];
  }
  //#endregion

  //#region Init
  ngOnInit(): void {
    this.cache
      .gridViewSetup('EIInvoiceLines', 'grvEIInvoiceLines')
      .subscribe((res) => {
        if (res) {
          var arrgv = Object.values(res) as any[];
          const group: any = {};
          arrgv.forEach((element) => {
            var keytmp = Util.camelize(element.fieldName);
            var value = null;
            var type = element.dataType.toLowerCase();
            if (type === 'bool') value = false;
            if (type === 'datetime') value = new Date();
            if (type === 'int' || type === 'decimal') value = 0;
            group[keytmp] = element.isRequire
              ? new FormControl(value, Validators.required)
              : new FormControl(value);
          });

          this.fgGoods = new FormGroup(group);
        }
      });
  }

  ngAfterViewInit() {
    if (this.action != 'add') this.form.formGroup.patchValue(this.invoices);
    else {
      this.form.formGroup.patchValue({
        invoiceDate: new Date(),
        invoiceType: '1',
      });
    }
  }
  //#endregion

  //#region Event
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.invoicesRef) hTab = (this.invoicesRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  }

  valueChanged(e) {
    // if (e && e.data) {
    //   if (e.field === 'UMID') this.selectedItem[e.field.toLowerCase()] = e.data;
    //   else this.selectedItem[e.field] = e.data;
    // }
    console.log(e);
  }

  mstChange(e) {
    if (e && e.data) {
      let mst = this.dicMST.has(e.data);
      if (mst) this.bindingTaxInfor(this.dicMST.get(e.data));
      else
        this.api
          .exec<any>('EI', 'CustomersBusiness', 'GetCustomerAsync', e.data)
          .subscribe((res) => {
            if (res) {
              this.dicMST.set(e.data, res);
              this.bindingTaxInfor(res);
            }
          });
    }
  }

  addRow() {
    let idx = this.data.length;
    this.grid.addRow(null, idx);
  }

  cellChanged(e) {
    if (e.field === 'itemDesc') {
      if (this.dicCbx.has(e.value)) {
        let good = this.dicCbx.get(e.value);
        this.updateLine(good, e.data, e.idx);
      } else {
        this.api
          .exec<any>('EI', 'GoodsBusiness', 'GetAsync', e.value)
          .subscribe((res) => {
            if (res) {
              this.dicCbx.set(e.field, res);
              this.updateLine(res, e.data, e.idx);
            }
          });
      }
    }

    if (
      e.field === 'quantity' &&
      (e.data.salesPrice !== '' ||
        e.data.salesPrice !== undefined ||
        e.data.salesPrice >= 0)
    ) {
      debugger;
      e.data.salesAmt = this.salesAmount(e.value, e.data.salesPrice);
      e.data.totalAmount = this.updateVATAtm(e.data.salesAmt, e.data.vatid);
    }
  }
  clickMF(e) {}
  //#endregion

  //#region CRUD
  save() {
    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddAsync';
        opt.className = 'InvoicesBusiness';
        opt.assemblyName = 'EI';
        opt.service = 'EI';
        opt.data = this.invoices;
        return true;
      })
      .subscribe();
  }
  //#endregion

  //#region Function
  bindingTaxInfor(data) {
    this.form.formGroup.patchValue({ custName: data['custName'] });
    this.form.formGroup.patchValue({ adddess: data['address'] });
    this.form.formGroup.patchValue({ phone: data['phone'] });
    this.form.formGroup.patchValue({ bankName: data['bankName'] });
    this.form.formGroup.patchValue({ bankAccount: data['bankAccount'] });
  }

  updateLine(data, rowData, idx: number) {
    rowData.umid = data.umid;
    rowData.quantity = 1;
    rowData.salesPrice = data.salesPrice;
    rowData.vatid = data.vatPct;
    rowData.salesAmt = data.salesPrice;
    rowData.vatAmt = this.updateVATAtm(data.salesPrice, data.vatPct);
    rowData.totalAmt = this.updateTotalAtm(rowData.salesAmt, rowData.vatAmt);
    this.grid.updateRow(idx, rowData);
  }

  salesAmount(quantity: number, price?: any) {
    let q: number,
      p: number,
      v: number,
      totalPrice: number = 0;
    if (quantity && typeof quantity == 'string') q = parseFloat(quantity);
    else q = quantity;

    if (price && typeof price == 'string') p = parseFloat(price);
    else p = price;

    if (q > 0 || price) {
      totalPrice = q * p;
    }

    return totalPrice;
  }

  updateVATAtm(amount: number, vat?: any) {
    let v: number, a: number;
    if (amount && typeof amount == 'string') a = parseFloat(amount);
    else a = amount;

    if (vat && typeof vat == 'string') v = parseFloat(vat);
    else v = vat;

    if (a >= 0 && v >= 0) return a * (vat / 100);

    return 0;
  }

  updateTotalAtm(totalPrice: number, totalAmt: any) {
    let p: number = 0,
      a: number = 0;
    if (totalPrice && typeof totalPrice == 'string') p = parseFloat(totalPrice);
    else p = totalPrice;

    if (totalAmt && typeof totalAmt == 'string') a = parseFloat(totalAmt);
    else a = totalAmt;

    if (p >= 0 && a >= 0 && p > a) return p - a;

    return 0;
  }

  //#endregion
}
