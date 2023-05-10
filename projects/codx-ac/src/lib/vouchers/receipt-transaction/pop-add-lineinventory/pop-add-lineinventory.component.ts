import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { InventoryJournalLines } from '../../../models/InventoryJournalLines.model';

@Component({
  selector: 'lib-pop-add-lineinventory',
  templateUrl: './pop-add-lineinventory.component.html',
  styleUrls: ['./pop-add-lineinventory.component.css']
})
export class PopAddLineinventoryComponent extends UIComponent implements OnInit{

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('idiM0') idiM0: CodxInputComponent;
  @ViewChild('idiM1') idiM1: CodxInputComponent;
  @ViewChild('idiM2') idiM2: CodxInputComponent;
  @ViewChild('idiM3') idiM3: CodxInputComponent;
  @ViewChild('idiM6') idiM6: CodxInputComponent;
  @ViewChild('idiM7') idiM7: CodxInputComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  lsVatCode: any;
  journals: any;
  objectIdim: any;
  lockFields: any;
  inventoryJournalLines: InventoryJournalLines;

  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.inventoryJournalLines = dialogData.data?.data;
    this.lockFields = dialogData.data?.lockFields;
    if (this.lockFields == null) {
      this.lockFields = [];
    }
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.cache
      .gridViewSetup('InventoryJournalLines', 'grvInventoryJournalLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  onInit(): void {}
  ngAfterViewInit() {
    this.loadInit();
  }

  close() {
    this.dialog.close();
  }

  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.type) {
        case 'add':
          this.api
            .execAction<any>(
              'IV_InventoryJournalLines',
              [this.inventoryJournalLines],
              'SaveAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.inventoryJournalLines});
              }
            });
          break;
        case 'edit':
          this.api
            .execAction<any>(
              'IV_InventoryJournalLines',
              [this.inventoryJournalLines],
              'UpdateAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.inventoryJournalLines});
              }
            });
          break;
      }
    }
  }
  loadControl(value) {
    let index = this.lockFields.findIndex((x) => x == value);
    if (index == -1) {
      return true;
    } else {
      return false;
    }
  }
  valueChange(e: any){
    if (e.data) {
      this.inventoryJournalLines[e.field] = e.data;
      switch (e.field) {
        case 'itemID':
          this.api
            .exec('IV', 'ItemsBusiness', 'LoadDataAsync', [e.data])
            .subscribe((res: any) => {
              if (res != null) {
               this.inventoryJournalLines.itemName = res.itemName;
               this.inventoryJournalLines.umid = res.umid;
               this.form.formGroup.patchValue(this.inventoryJournalLines);
              }
            });
            (this.idiM0.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            (this.idiM1.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            (this.idiM2.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            (this.idiM3.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            (this.idiM6.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            (this.idiM7.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM0.crrValue = null;
            this.idiM1.crrValue = null;
            this.idiM2.crrValue = null;
            this.idiM3.crrValue = null;
            this.idiM6.crrValue = null;
            this.idiM7.crrValue = null;
            this.inventoryJournalLines.idiM0 = null;
            this.inventoryJournalLines.idiM1 = null;
            this.inventoryJournalLines.idiM2 = null;
            this.inventoryJournalLines.idiM3 = null;
            this.inventoryJournalLines.idiM6 = null;
            this.inventoryJournalLines.idiM7 = null;
            this.form.formGroup.patchValue(this.inventoryJournalLines);
          break;
      }
    }
  }
  calculateAtm(e:any){
    if (e.crrValue) {
      this.inventoryJournalLines[e.ControlName] = e.crrValue;
      switch (e.ControlName) {
        case 'costPrice':
        case 'quantity':
          this.inventoryJournalLines.costAmt =
            this.inventoryJournalLines.quantity *
            this.inventoryJournalLines.costPrice;
          this.form.formGroup.patchValue(this.inventoryJournalLines);
          break;
      }
    }
  }

  loadInit(){
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.inventoryJournalLines);
  }

  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.inventoryJournalLines);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.inventoryJournalLines[keymodel[i]] == null ||
              String(this.inventoryJournalLines[keymodel[i]]).match(/^ *$/) !== null
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

}
