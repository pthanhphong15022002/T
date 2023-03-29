import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
@Component({
  selector: 'lib-popup-add-quotations',
  templateUrl: './popup-add-quotations.component.html',
  styleUrls: ['./popup-add-quotations.component.css'],
})
export class PopupAddQuotationsComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('gridVoucherLineRefs')
  public gridProductsLine: CodxGridviewV2Component;
  @ViewChild('cardbodyGeneral') cardbodyGeneral: ElementRef;
  @ViewChild('cashGeneral') cashGeneral: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  quotations: any = {recID: '0000-0000-0000-0000'};
  action = 'add';
  dialog: DialogRef;
  headerText = 'Thêm form test';
  fmProcductsLines: FormModel = {
    formName: 'grvCMProducts',
    gridViewName: 'grvCMProducts',
    entityName: 'CM_Products',
  };
  gridHeight: number;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  productsLine = []; //mang san pham

  constructor(public sanitizer: DomSanitizer) {
    //tesst
    this.quotations.recID = Util.uid();
  }

  ngOnInit(): void {}

  onSave() {}
  valueChange(e) {}
  select(e) {}
  created(e) {}
  productsLineChanged(e) {}
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyGeneral)
      hBody = this.cardbodyGeneral.nativeElement.parentElement.offsetHeight;
    if (this.cashGeneral) hTab = (this.cashGeneral as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  }
  clickMF(e, data) {}

  addRow() {
    let idx = this.gridProductsLine.dataSource?.length;
    let data = this.gridProductsLine.formGroup.value; //ddooi tuong
    data.recID = Util.uid();
    data.write = true;
    data.delete = true;
    data.read = true;
    data.rowNo = idx + 1;
    data.transID = this.quotations?.recID;
    this.gridProductsLine.addRow(data, idx);
  }
}
