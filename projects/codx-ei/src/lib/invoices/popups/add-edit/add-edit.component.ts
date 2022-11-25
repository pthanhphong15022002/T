import { InvoicesLine } from '../../../models/invoice.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
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
  DialogData,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';

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
  fmGoods: FormModel = {
    formName: 'EIInvoiceLines',
    gridViewName: 'grvEIInvoiceLines',
    entityName: 'EI_InvoiceLines',
  };
  fgGoods: FormGroup;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };
  selectedItem: any;
  selectedIndex: number = 0;
  data: Array<InvoicesLine> = [
    {
      no: 1,
      itemDesc: 'Sản phẩm A',
      umid: 'CAI',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatid: 2,
      vatAmt: 1600,
      totalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 2,
      itemDesc: 'Sản phẩm B',
      umid: 'CAI',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatid: 2,
      vatAmt: 1600,
      totalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 3,
      itemDesc: 'Sản phẩm A',
      umid: 'CAI',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatid: 2,
      vatAmt: 1600,
      totalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 4,
      itemDesc: 'Sản phẩm A',
      umid: 'CAI',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatid: 2,
      vatAmt: 1600,
      totalAmt: 78400,
      lineType: 'Gia dụng',
    },
  ];

  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('form') public form: CodxFormComponent;
  constructor(
    private cache: CacheService,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private apiv2: HttpClient,
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
    this.form.formGroup.patchValue({ invoiceDate: new Date() });
  }
  //#endregion

  //#region Event
  actionComplete(e) {
    if (e.requestType === 'save' && e.action === 'add') {
      this.grid.selectRow(e.index);
      this.grid.startEdit();
    }
    return;

    if (e.requestType === 'save' && e.action === 'edit') {
      if (
        e.previousData &&
        JSON.stringify(e.data) === JSON.stringify(e.previousData)
      ) {
        e.cancel = true;
        return;
      }
      this.grid.updateRow(e.rowIndex, e.data);
    }
  }

  keyPressed(e) {
    if (e.keyCode === 13) {
      e.cancel = true;
      if (this.grid.isEdit) {
        this.grid.updateRow(this.selectedIndex, this.selectedItem);
      }
      if ((e.target as HTMLElement).classList.contains('e-rowcell')) {
        const rIndex = Number((e.target as HTMLElement).getAttribute('Index'));
        const cIndex = Number(
          (e.target as HTMLElement).getAttribute('aria-colindex')
        );
        const i = { rowIndex: rIndex, cellIndex: cIndex };
        const field: string = this.grid.getColumns()[cIndex].field;
        this.grid.editCell(rIndex, field);
      }
    }
    if (e.key === 'Escape') {
      this.grid.closeEdit();
    }
  }

  getSelected(e) {
    if (e && e.data) {
      this.fmGoods.currentData = e.data;
      this.bindData(e.data);
      this.selectedItem = e.data;
      this.selectedIndex = e.rowIndex;
      console.log(this.selectedIndex, this.selectedItem);
    }
  }

  onChangedValue(e, data) {
    if (e && e.data) {
      if (e.field === 'UMID') this.selectedItem[e.field.toLowerCase()] = e.data;
      else this.selectedItem[e.field] = e.data;
    }
  }

  mstChange(e) {
    if (e && e.data) {
      this.api
        .exec<any>('EI', 'CustomersBusiness', 'GetCustomerAsync', e.data)
        .subscribe((res) => {
          if (res) {
            this.bindingTaxInfor(res);
          }
        });
    }
  }

  addRow() {
    let line = {};
    let idx = this.data.length;
    line['no'] = idx + 1;
    this.grid.addRecord(line, idx);
  }

  navChange(e) {}
  //#endregion

  //#region Function
  bindData(obj: any) {
    var objValue: any = {};
    if (!this.fgGoods || !this.fgGoods.controls) return;
    var fields = Object.keys(this.fgGoods.controls);
    fields.forEach((element) => {
      if (obj) {
        objValue[element] = obj[element];
      }
    });
    this.fgGoods!.patchValue(objValue);
  }

  bindingTaxInfor(data) {
    this.form.formGroup.patchValue({ custName: data['custName'] });
    this.form.formGroup.patchValue({ adddess: data['address'] });
    this.form.formGroup.patchValue({ phone: data['phone'] });
    this.form.formGroup.patchValue({ bankName: data['bankName'] });
    this.form.formGroup.patchValue({ bankAccount: data['bankAccount'] });
  }
  //#endregion
}
