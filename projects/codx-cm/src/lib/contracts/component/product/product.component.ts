import { Component, ElementRef, Input, OnChanges, OnInit, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, CacheService, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { CM_Quotations } from '../../../models/cm_model';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit,OnChanges{
  @ViewChild('gridQuationsLines') gridQuationsLines: CodxGridviewV2Component;
  @ViewChild('cardbodyGeneral') cardbodyGeneral: ElementRef;
  @ViewChild('quotationGeneral') quotationGeneral: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;

  @Input() dataSource: any;

  dialog;
  quotations: CM_Quotations;
  fmQuotationLines: FormModel = {
    formName: 'CMQuotationsLines',
    gridViewName: 'grvCMQuotationsLines',
    entityName: 'CM_QuotationsLines',
    funcID: 'CM02021',
  };
  gridHeight: number = 300;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  product = [];
  listQuotationLines: Array<any> = [];

  constructor(
    private codxCM: CodxCmService,
    private cache: CacheService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {

  }
  ngOnInit(): void {
    // console.log('thuan');
    // this.codxCM
    // .getQuotationsLinesByTransID('f2c04250-f56d-11ed-a428-c025a5a4cd5d')
    // .subscribe((res) => {
    //   if (res) {
    //     this.dataSource = res;
    //   }
    // });
    
  }

  async ngOnChanges(changes: SimpleChanges){
    if(changes.dataSource && this.dataSource){

    }
  }
  // quotationsLineChanged(e) {
  //   if (!e.field || !e.data) return;
  //   let lineCrr = e.data;

  //   switch (e.field) {
  //     case 'itemID':
  //       this.loadItem(e.value, lineCrr);
  //       break;
  //     case 'VATID':
  //       let crrtaxrate = e?.component?.itemsSelected[0]?.TaxRate;
  //       lineCrr['vatRate'] = crrtaxrate ?? 0;
  //       this.loadChange(lineCrr);
  //       break;
  //     case 'discPct':
  //     case 'quantity':
  //     case 'salesPrice':
  //       this.loadChange(lineCrr);
  //       break;
  //   }
  // }
  // loadItem(itemID, lineCrr) {
  //   this.codxCM.getItem(itemID).subscribe((items) => {
  //     if (items) {
  //       lineCrr['onhand'] = items.quantity;
  //       lineCrr['idiM4'] = items.warehouseID; // kho
  //       lineCrr['costPrice'] = items.costPrice; // gia von
  //       lineCrr['umid'] = items.umid; // don vi tinh
  //       lineCrr['quantity'] = items.minSettledQty; //so luong mua nhieu nhat
  //     }
  //     this.loadDataLines(lineCrr);
  //     // this.form.formGroup.patchValue(this.quotationsLine);
  //   });
  // }
  // loadChange(lineCrr) {
  //   lineCrr['salesAmt'] =
  //     (lineCrr['quantity'] ?? 0) * (lineCrr['salesPrice'] ?? 0);

  //   lineCrr['discAmt'] =
  //     ((lineCrr['discPct'] ?? 0) * (lineCrr['salesAmt'] ?? 0)) / 100;

  //   lineCrr['vatBase'] = (lineCrr['salesAmt'] ?? 0) - (lineCrr['discAmt'] ?? 0);

  //   lineCrr['vatAmt'] = (lineCrr['vatRate'] ?? 0) * (lineCrr['vatBase'] ?? 0);

  //   lineCrr['netAmt'] =
  //     (lineCrr['salesAmt'] ?? 0) -
  //     (lineCrr['discAmt'] ?? 0) +
  //     (lineCrr['vatAmt'] ?? 0);

  //   this.loadDataLines(lineCrr);
  // }

  // loadDataLines(lineCrr) {
  //   var idxLine = this.listQuotationLines.findIndex(
  //     (x) => x.recID == lineCrr.recID
  //   );
  //   if (idxLine != -1) {
  //     this.listQuotationLines[idxLine] = lineCrr;
  //   } else {
  //     this.listQuotationLines.push(lineCrr);
  //   }
  //   this.loadTotal();
  //   this.gridQuationsLines.refresh();
  // }
  // gridCreated(e, grid) {
  //   let hBody, hTab, hNote;
  //   if (this.cardbodyGeneral)
  //     hBody = this.cardbodyGeneral.nativeElement.parentElement.offsetHeight;
  //   if (this.quotationGeneral)
  //     hTab = (this.quotationGeneral as any).element.offsetHeight;
  //   if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

  //   this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  //   //grid.disableField(this.lockFields);
  // }

  // clickMFQuotationLines(e, data) {
  //   switch (e.functionID) {
  //     case 'SYS02':
     
  //       break;
  //     case 'SYS03':
       
  //       break;
  //     case 'SYS04':
       
  //       break;
  //   }
  // }

  // loadTotal() {
  //   let totals = 0;
  //   let totalVAT = 0;
  //   let totalDis = 0;
  //   let totalSales = 0;
  //   if (this.listQuotationLines?.length > 0) {
  //     this.listQuotationLines.forEach((element) => {
  //       //tisnh tong tien
  //       totalSales += element['salesAmt'] ?? 0;
  //       totals += element['netAmt'] ?? 0;
  //       totalVAT += element['vatAmt'] ?? 0;
  //       totalDis += element['discAmt'] ?? 0;
  //     });
  //   }

  //   this.quotations['totalSalesAmt'] = totalSales;
  //   this.quotations['totalAmt'] = totals;
  //   this.quotations['totalTaxAmt'] = totalVAT;
  //   this.quotations['discAmt'] = totalDis;
  // }

}
