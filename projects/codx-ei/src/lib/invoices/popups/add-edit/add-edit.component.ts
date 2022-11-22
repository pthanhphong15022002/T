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
  fmGoods: FormModel = {
    formName: 'EIInvoiceLines',
    gridViewName: 'grvEIInvoiceLines',
    entityName: 'EI_InvoiceLines',
  };
  fgGoods: FormGroup;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: false,
    allowDeleting: true,
  };
  selectedItem: any;
  selectedIndex: number = 0;
  data = [
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
    {
      no: 5,
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
      no: 6,
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
      no: 7,
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
      no: 8,
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
      no: 9,
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
      no: 10,
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
          console.log(this.fgGoods);
        }
      });
  }
  //#endregion

  //#region Event
  actionComplete(e) {
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
    }
  }

  cellEdit(e) {
    console.log('cell edit', e);
  }

  cellSelecting(e) {
    console.log('cell selecting', e);
  }

  cellSelected(e) {
    console.log('cell selected', e);
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
        .exec<any>('EI', 'CustomersBusiness', 'GetByID', e.data)
        .subscribe((res) => {
          if (res) {
            this.form.formGroup.controls['custName'] = res['custName'];
            this.form.formGroup.controls['adddess'] = res['adddess'];
            this.form.formGroup.controls['phone'] = res['phone'];
            this.form.formGroup.controls['email'] = res['email'];
            this.form.formGroup.controls['bankName'] = res['bankName'];
            this.form.formGroup.controls['bankAccount'] = res['bankAccount'];
          } else {
            this.api
              .get(`https://thongtindoanhnghiep.co/api/company/${e.data}`)
              .subscribe((res) => {
                let customers: any = null;
                customers['custID'] = res['MaSoThue'];
                customers['custName'] = res['Title'];
                customers['taxCode'] = res['MaSoThue'];
                customers['adddess'] = res['DiaChiCongTy'];
                customers['contact'] = res['ChuSoHuu'];
                // customers['email'] =  res['MaSoThue'];
                // customers['phone'] = res['MaSoThue'];
                // customers['pmtMethodID'] =  res['MaSoThue'];
                // customers['bankAccount'] =  res['MaSoThue'];
                // customers['bankName'] =  res['MaSoThue'];
              });
          }
        });
    }
  }
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
  //#endregion
}
