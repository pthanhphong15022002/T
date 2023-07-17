import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { Vouchers } from '../../../models/Vouchers.model';
import { VouchersLines } from '../../../models/VouchersLines.model';

@Component({
  selector: 'lib-pop-add-line-receipt-transaction',
  templateUrl: './pop-add-line-receipt-transaction.component.html',
  styleUrls: ['./pop-add-line-receipt-transaction.component.css']
})
export class PopAddLineReceiptTransactionComponent extends UIComponent implements OnInit{

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('idiM0') idiM0: CodxInputComponent;
  @ViewChild('idiM1') idiM1: CodxInputComponent;
  @ViewChild('idiM2') idiM2: CodxInputComponent;
  @ViewChild('idiM3') idiM3: CodxInputComponent;
  @ViewChild('idiM5') idiM5: CodxInputComponent;
  @ViewChild('idiM6') idiM6: CodxInputComponent;
  @ViewChild('idiM7') idiM7: CodxInputComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  hasSave: boolean = false;
  type: any;
  lsVatCode: any;
  journals: any;
  objectIdim: any;
  lockFields: any;
  itemName: any;
  funcID: any;
  vouchersLine: VouchersLines;
  vouchers: Vouchers;
  objectVouchersLines: Array<VouchersLines> = [];
  fmVouchersLines: FormModel = {
    formName: '',
    gridViewName: '',
    entityName: '',
  };

  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.vouchersLine = dialogData.data?.data;
    this.vouchers = dialogData.data?.dataVouchers;
    this.objectVouchersLines = dialogData.data?.dataline;
    this.fmVouchersLines = dialogData.data?.formModelLine;
    this.lockFields = dialogData.data?.lockFields;
    this.funcID = dialogData.data?.funcID;
    if (this.lockFields == null) {
      this.lockFields = [];
    }
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.cache
      .gridViewSetup(this.fmVouchersLines.formName, this.fmVouchersLines.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  onInit(): void {
  }
  ngAfterViewInit() {
    this.loadInit();
  }

  //region Event
  close() {
    if(this.hasSave == false)
    {
      this.dialog.close();
    }
    this.dialog.close({
      add: true
    });
  }

  valueChange(e: any){
    this.vouchersLine[e.field] = e.data;
    const postFields: string[] = [
      'itemID',
      'costPrice',
      'quantity',
      'costAmt',
      'lineType',
      'umid',
      'idiM0',
      'idiM1',
      'idiM2',
      'idiM3',
      'idiM4',
      'idiM5',
      'idiM6',
      'idiM7',
      'idiM8',
      'idiM9',
      'lineType'
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('IV', 'VouchersLinesBusiness', 'ValueChangedAsync', [
          e.field,
          this.vouchers,
          this.vouchersLine,
        ])
        .subscribe((line) => {
          console.log(line);

          this.vouchersLine = Object.assign(this.vouchersLine, line);
          switch (e.field) 
          {
            case 'itemID':
              // this.getUMIDAndItemName(e.data);
              if(this.idiM0)
              {
                (this.idiM0.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM0.crrValue = null;
                this.vouchersLine.idiM0 = null;
              }
              if(this.idiM1)
              {
                (this.idiM1.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM1.crrValue = null;
                this.vouchersLine.idiM1 = null;
              }
              if(this.idiM2)
              {
                (this.idiM2.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM2.crrValue = null;
                this.vouchersLine.idiM2 = null;
              }
              if(this.idiM3)
              {
                (this.idiM3.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM3.crrValue = null;
                this.vouchersLine.idiM3 = null;
              }
              if(this.idiM6)
              {
                (this.idiM6.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM6.crrValue = null;
                this.vouchersLine.idiM6 = null;
              }
              if(this.idiM7)
              {
                (this.idiM7.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM7.crrValue = null;
                this.vouchersLine.idiM7 = null;
              }
              break;
            case 'idiM4':
              if(this.idiM5)
              {
                (this.idiM5.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
                this.idiM5.crrValue = null;
                this.vouchersLine.idiM5 = null;
              }
            break;
          }
          if(this.form)
          {
            this.form.formGroup.patchValue(this.vouchersLine);
          }
        });
    }
  }
  //endregion Event

  //region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.type) {
        case 'copy':
        case 'add':
          this.api
            .execAction<any>(
              this.fmVouchersLines.entityName,
              [this.vouchersLine],
              'SaveAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.vouchersLine});
              }
            });
          break;
        case 'edit':
          this.api
            .execAction<any>(
              this.fmVouchersLines.entityName,
              [this.vouchersLine],
              'UpdateAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.vouchersLine});
              }
            });
          break;
      }
    }
  }

  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.api
        .execAction<any>(
          this.fmVouchersLines.entityName,
          [this.vouchersLine],
          'SaveAsync'
        )
        .subscribe((res) => {
          if (res) {
            this.hasSave = true;
            this.objectVouchersLines.push({ ...this.vouchersLine });
            this.clearVouchersLines();
          }
        });
    }
  }
  //endregion Method

  //region Function

  loadControl(value) {
    let index = this.lockFields.findIndex((x) => x == value);
    if (index == -1) {
      return true;
    } else {
      return false;
    }
  }

  loadInit(){
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.vouchersLine);
  }

  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.vouchersLine);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.vouchersLine[keymodel[i]] == null ||
              String(this.vouchersLine[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }

  calculateAtm(e:any){
    if (e.crrValue) {
      this.vouchersLine[e.ControlName] = e.crrValue;
      switch (e.ControlName) {
        case 'costPrice':
        case 'quantity':
        case 'costAmt':
          this.valueChange({
            field: e.ControlName,
            data: e.crrValue,
          });
          break;
      }
    }
  }

  clearVouchersLines() {
    let idx = this.objectVouchersLines.length;
    let data = new VouchersLines();
    this.api
      .exec<any>('IV', 'VouchersLinesBusiness', 'SetDefaultAsync', [
        this.vouchers,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          res.rowNo = idx + 1;
          this.vouchersLine = res;
          this.form.formGroup.patchValue(res);
        }
      });
  }

  getUMIDAndItemName(itemID: any){
    this.api.exec('IV', 'ItemsBusiness', 'LoadDataAsync', [itemID])
          .subscribe((res: any) => {
            if (res)
            {
              this.vouchersLine.itemName = res.itemName;
              this.vouchersLine.umid = res.umid;
              this.form.formGroup.patchValue(this.vouchersLine);
            }
            else
            {
              this.vouchersLine.itemName = null;
              this.vouchersLine.umid = null;
              this.form.formGroup.patchValue(this.vouchersLine);
            }
          });
  }
  //endregion Function
}
