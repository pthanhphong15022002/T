import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  EditSettingsModel,
  GridComponent,
  VirtualScrollService,
} from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
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

  constructor(
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.invoices = dialog.dataService!.dataSelected;
    this.action = dialogData.data[0];
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
  keyPressed(e) {
    if (e.keyCode === 13) {
      e.cancel = true;
      if (this.grid.isEdit) {
        this.grid.saveCell();
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

  onDataBound(args) {
    (this.grid as any).keyConfigs.enter = 'tab';
  }

  getSelected(e) {
    if (e && e.data) {
      this.fmGoods.currentData = e.data;
      this.bindData(e.data);
    }
  }

  onChangedValue(e, data) {
    console.log('cbb', e);
    console.log('data', data);
    if (e && e.data) {
      data[e.field] = e.data;
    }
  }

  cellSelecting(e) {
    console.log(e);
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
