import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Optional } from '@angular/core';
import {
  EditSettingsModel,
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
  dialog: DialogRef;
  invoices: any;
  action: string;
  fmGoods: FormModel = {
    formName: 'Goods',
    gridViewName: 'grvGoods',
    entityName: 'EI_Goods',
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
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 2,
      itemDesc: 'Sản phẩm B',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 3,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 4,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 5,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 6,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 7,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 8,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 9,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
    {
      no: 10,
      itemDesc: 'Sản phẩm A',
      umid: 'Cái',
      quantity: 2,
      salesPrice: 40000,
      salesAmt: 80000,
      vatID: 2,
      vatAmt: 1600,
      rotalAmt: 78400,
      lineType: 'Gia dụng',
    },
  ];
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

  ngOnInit(): void {
    this.cache.gridViewSetup('Goods', 'grvGoods').subscribe((res) => {
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
        if (this.data) {
          this.fmGoods.currentData = this.data;
          this.bindData(this.data);
        }
        this.fgGoods = new FormGroup(group);
        console.log(this.fgGoods);
      }
    });
  }

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
}
