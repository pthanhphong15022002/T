import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { InventoryJournalLines } from '../../../models/InventoryJournalLines.model';
import { InventoryJournals } from '../../../models/InventoryJournals.model';

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
  entityLine: any;
  funcID: any;
  inventoryJournalLine: InventoryJournalLines;
  inventoryJournal: InventoryJournals;
  objectInventoryJournalLines: Array<InventoryJournalLines> = [];

  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.inventoryJournalLine = dialogData.data?.data;
    this.inventoryJournal = dialogData.data?.dataInventoryJournal;
    this.objectInventoryJournalLines = dialogData.data?.dataline;
    this.entityLine = dialogData.data?.entityLine;
    this.lockFields = dialogData.data?.lockFields;
    this.funcID = dialogData.data?.funcID;
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
    this.inventoryJournalLine[e.field] = e.data;
      switch (e.field) 
      {
        case 'itemID':
          this.getUMIDAndItemName(e.data);
          if(this.idiM0)
          {
            (this.idiM0.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM0.crrValue = null;
            this.inventoryJournalLine.idiM0 = null;
          }
          if(this.idiM1)
          {
            (this.idiM1.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM1.crrValue = null;
            this.inventoryJournalLine.idiM1 = null;
          }
          if(this.idiM2)
          {
            (this.idiM2.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM2.crrValue = null;
            this.inventoryJournalLine.idiM2 = null;
          }
          if(this.idiM3)
          {
            (this.idiM3.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM3.crrValue = null;
            this.inventoryJournalLine.idiM3 = null;
          }
          if(this.idiM6)
          {
            (this.idiM6.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM6.crrValue = null;
            this.inventoryJournalLine.idiM6 = null;
          }
          if(this.idiM7)
          {
            (this.idiM7.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM7.crrValue = null;
            this.inventoryJournalLine.idiM7 = null;
          }
          if(this.form)
          {
            this.form.formGroup.patchValue(this.inventoryJournalLine);
          }
          break;
        case 'idiM4':
          if(this.idiM5)
          {
            (this.idiM5.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.idiM5.crrValue = null;
            this.inventoryJournalLine.idiM5 = null;
            this.form.formGroup.patchValue(this.inventoryJournalLine);
          }
        break;
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
              this.entityLine,
              [this.inventoryJournalLine],
              'SaveAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.inventoryJournalLine});
              }
            });
          break;
        case 'edit':
          this.api
            .execAction<any>(
              this.entityLine,
              [this.inventoryJournalLine],
              'UpdateAsync'
            )
            .subscribe((res) => {
              if (res) {
                this.dialog.close({data:this.inventoryJournalLine});
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
          this.entityLine,
          [this.inventoryJournalLine],
          'SaveAsync'
        )
        .subscribe((res) => {
          if (res) {
            this.hasSave = true;
            this.objectInventoryJournalLines.push({ ...this.inventoryJournalLine });
            this.clearInventoryJournalLines();
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
    this.form.formGroup.patchValue(this.inventoryJournalLine);
  }

  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.inventoryJournalLine);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.inventoryJournalLine[keymodel[i]] == null ||
              String(this.inventoryJournalLine[keymodel[i]]).match(/^ *$/) !== null
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
      this.inventoryJournalLine[e.ControlName] = e.crrValue;
      switch (e.ControlName) {
        case 'costPrice':
        case 'quantity':
          this.inventoryJournalLine.costAmt =
            this.inventoryJournalLine.quantity *
            this.inventoryJournalLine.costPrice;
          this.form.formGroup.patchValue(this.inventoryJournalLine);
          break;
      }
    }
  }

  clearInventoryJournalLines() {
    let idx = this.objectInventoryJournalLines.length;
    let data = new InventoryJournalLines();
    this.api
      .exec<any>('IV', 'InventoryJournalLinesBusiness', 'SetDefaultAsync', [
        this.inventoryJournal,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          res.rowNo = idx + 1;
          this.inventoryJournalLine = res;
          this.form.formGroup.patchValue(res);
        }
      });
  }

  getUMIDAndItemName(itemID: any){
    this.api.exec('IV', 'ItemsBusiness', 'LoadDataAsync', [itemID])
          .subscribe((res: any) => {
            if (res)
            {
              this.inventoryJournalLine.itemName = res.itemName;
              this.inventoryJournalLine.umid = res.umid;
              this.form.formGroup.patchValue(this.inventoryJournalLine);
            }
            else
            {
              this.inventoryJournalLine.itemName = null;
              this.inventoryJournalLine.umid = null;
              this.form.formGroup.patchValue(this.inventoryJournalLine);
            }
          });
  }
  //endregion Function
}
