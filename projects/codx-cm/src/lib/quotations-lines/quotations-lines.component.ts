import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  DialogModel,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddQuotationsLinesComponent } from './popup-add-quotations-lines/popup-add-quotations-lines.component';
import { CM_QuotationsLines } from '../models/cm_model';

@Component({
  selector: 'codx-quotations-lines',
  templateUrl: './quotations-lines.component.html',
  styleUrls: ['./quotations-lines.component.css'],
})
export class QuotationsLinesComponent implements OnInit, AfterViewInit {
  @ViewChild('gridQuationsLines') gridQuationsLines: CodxGridviewV2Component;
  // @Input() dataValues: any;
  // @Input() predicates: any;
  @Input() actionParent = 'add';
  @Input() transID: any;
  @Input() contractID: any;
  @Input() exchangeRate: any;
  @Input() currencyID: any;

  @Input() listQuotationLines: Array<any> = [];
  @Input() quotationLinesAddNew = [];
  @Input() quotationLinesEdit = [];
  @Input() quotationLinesDeleted = [];
  //mac dinh thuộc tính
  @Input() isViewTemp = false;
  @Input() showButtonAdd = true; //
  @Input() hideMoreFunc = '0'; //chua dung
  @Output() eventQuotationLines = new EventEmitter<any>();

  @Input() isSetMoreFunc = false; //thuan them de set quotation của contract

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

  titleActionLine = '';
  columnsGrid = [];
  arrFieldIsVisible: any[];
  formModel: FormModel;
  grvSetupQuotations: any;
  grvSetupQuotationsLines: any;
  crrCustomerID: string;
  objectOut: any;
  titleAdd = 'Thêm'; //sau gọi sys
  readonly hideColums = ['rowno', 'netamt', 'salesamt', 'vatamt', 'discamt'];

  constructor(
    private codxCM: CodxCmService,
    private cache: CacheService,
    private callFC: CallFuncService,
    private changeDetector: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {
    this.cache
      .gridViewSetup(
        this.fmQuotationLines.formName,
        this.fmQuotationLines.gridViewName
      )
      .subscribe((res) => {
        this.grvSetupQuotationsLines = res;
        //lay grid view
        let arrField = Object.values(res).filter((x: any) => x.isVisible);
        if (Array.isArray(arrField)) {
          this.arrFieldIsVisible = arrField
            .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
            .map((x: any) => x.fieldName);
          this.getColumsGrid(res);
        }
      });
  }
  ngAfterViewInit(): void {
    if (this.gridQuationsLines?.visibleColumns?.length > 0) {
      this.gridQuationsLines.visibleColumns.forEach((e, index) => {
        if (
          e?.fieldName &&
          this.hideColums.some((x) => x == e?.fieldName.toLowerCase())
        ) {
          e.allowEdit = false;
        }
      });
    }
  }

  ngOnInit(): void {
    this.objectOut = {
      listQuotationLines: this.listQuotationLines,
      quotationLinesAddNew: this.quotationLinesAddNew,
      quotationLinesEdit: this.quotationLinesEdit,
      quotationLinesDeleted: this.quotationLinesDeleted,
    };
  }

  //#region  CRUD
  // region QuotationLines
  async changeDataMFQuotationLines(event, quotationLine?: CM_QuotationsLines) {
    if (event != null) {
      event.forEach((res) => {
        switch (res.functionID) {
          case 'SYS03': //sửa
          case 'SYS04': //copy
          case 'SYS02': //xóa
            if (this.isSetMoreFunc && quotationLine?.transID) {
              res.isblur = true;
            }
            break;
        }
      });
    }
  }
  clickMFQuotationLines(e, data) {
    this.titleActionLine = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.deleteLine(data);
        break;
      case 'SYS03':
        this.editLine(data);
        break;
      case 'SYS04':
        this.copyLine(data);
        break;
    }
  }

  addPopup() {
    let idx = this.gridQuationsLines.dataSource?.length;
    this.genData(idx);
  }
  addRow() {
    // this.addPopup(); //tam add popup

    let idx = this.listQuotationLines?.length ?? 0;
    this.codxCM
      .getDefault(
        'CM',
        this.fmQuotationLines.funcID,
        this.fmQuotationLines.entityName
      )
      .subscribe((dt) => {
        if (dt && dt.data) {
          let data = dt.data; //ddooi tuong

          data.recID = Util.uid();
          data.transID = this.transID;
          data.contractID = this.contractID;
          data.write = true;
          data.delete = true;
          data.read = true;
          data.rowNo = idx + 1;

          //add tam do loi
          data.salesAmt = data.salesAmt ?? 0;
          data.quantity = data.quantity ?? 0;
          data.discPct = data.discPct ?? 0;
          data.discAmt = data.discAmt ?? 0;
          data.vatBase = data.vatBase ?? 0;
          data.vatAmt = data.vatAmt ?? 0;
          data.vatRate = data.vatRate ?? 0;
          data.exchangeRate = this.exchangeRate;
          data.currencyID = this.currencyID;
          data.transID = this.transID;
          this.listQuotationLines.push(data);
          // this.gridQuationsLines.addRow(data, idx); //add row gridview
          this.gridQuationsLines.refresh();
        }
      });
  }

  genData(idx) {
    this.codxCM
      .getDefault(
        'CM',
        this.fmQuotationLines.funcID,
        this.fmQuotationLines.entityName
      )
      .subscribe((dt) => {
        if (dt && dt.data) {
          //this.gridQuationsLines.formGroup.value = dt.data
          let data = dt.data; //ddooi tuong

          data.recID = Util.uid();
          data.transID = this.transID;
          data.write = true;
          data.delete = true;
          data.read = true;
          data.rowNo = idx + 1;

          //add tam do loi
          data.salesAmt = data.salesAmt ?? 0;
          data.quantity = data.quantity ?? 0;
          data.discPct = data.discPct ?? 0;
          data.discAmt = data.discAmt ?? 0;
          data.vatBase = data.vatBase ?? 0;
          data.vatAmt = data.vatAmt ?? 0;
          data.vatRate = data.vatRate ?? 0;
          data.exchangeRate = this.exchangeRate;
          data.currencyID = this.currencyID;
          data.transID = this.transID;

          this.cache
            .functionList(this.fmQuotationLines.funcID)
            .subscribe((f) => {
              this.cache
                .gridViewSetup(
                  this.fmQuotationLines.formName,
                  this.fmQuotationLines.gridViewName
                )
                .subscribe((res) => {
                  let customName = f.customName || f.description;
                  var obj = {
                    headerText:
                      this.titleAdd +
                      ' ' +
                      customName.charAt(0).toLowerCase() +
                      customName.slice(1),
                    quotationsLine: data,
                    listQuotationLines: this.listQuotationLines,
                    grvSetup: this.grvSetupQuotationsLines,
                  };
                  let opt = new DialogModel();
                  opt.zIndex = 1000;
                  opt.FormModel = this.fmQuotationLines;

                  let dialogQuotations = this.callFC.openForm(
                    PopupAddQuotationsLinesComponent,
                    '',
                    1000,
                    700,
                    '',
                    obj,
                    '',
                    opt
                  );
                  dialogQuotations.closed.subscribe((res) => {
                    if (res?.event) {
                      data = res?.event;
                      this.quotationLinesAddNew.push(data);
                      this.listQuotationLines.push(data);
                      this.gridQuationsLines.refresh();
                      this.loadTotal();
                      this.objectOut.listQuotationLines =
                        this.listQuotationLines;
                      this.objectOut.quotationLinesAddNew =
                        this.quotationLinesAddNew;
                      this.objectOut['quotationLineIdNew'] = data?.recID; // thuan thêm để lấy quotationLines mới thêm
                      this.eventQuotationLines.emit(this.objectOut);
                      this.changeDetector.detectChanges();
                    }
                  });
                });
            });
        }
      });
  }

  deleteLine(data) {
    this.notiService.alertCode('SYS030').subscribe((res) => {
      if (res.event.status === 'Y') {
        //=> delete fe
        this.gridQuationsLines.deleteRow(data);
        if (this.actionParent == 'edit') {
          this.quotationLinesDeleted.push(data);
          let indexAdd = this.quotationLinesAddNew.findIndex(
            (x) => x.recID == data.recID
          );
          if (indexAdd != -1) this.quotationLinesAddNew.splice(indexAdd, 1); //xóa 1 pt trong mang
          let indexEdit = this.quotationLinesEdit.findIndex(
            (x) => x.recID == data.recID
          );
          if (indexEdit != -1) this.quotationLinesEdit.splice(indexAdd, 1);
        }
        if (this.gridQuationsLines.dataSource.length > 0) {
          for (let i = 0; i < this.gridQuationsLines.dataSource.length; i++) {
            if (
              this.gridQuationsLines.dataSource[i].rowNo != i + 1 &&
              this.actionParent == 'edit'
            ) {
              this.linesUpdate(this.gridQuationsLines.dataSource[i]);
            }
            this.gridQuationsLines.dataSource[i].rowNo = i + 1;
          }
        }
        this.listQuotationLines = this.gridQuationsLines.dataSource;
        this.loadTotal();
        this.objectOut.listQuotationLines = this.listQuotationLines;
        this.objectOut.quotationLinesDeleted = this.quotationLinesDeleted;
        this.eventQuotationLines.emit(this.objectOut);
        this.changeDetector.detectChanges();
      }
    });
  }

  editLine(dt) {
    this.cache.functionList(this.fmQuotationLines.funcID).subscribe((f) => {
      this.cache
        .gridViewSetup(
          this.fmQuotationLines.formName,
          this.fmQuotationLines.gridViewName
        )
        .subscribe((res) => {
          var obj = {
            headerText:
              this.titleActionLine + ' ' + f?.customName || f?.description,
            quotationsLine: dt,
            listQuotationLines: this.listQuotationLines,
            grvSetup: this.grvSetupQuotationsLines,
          };
          let opt = new DialogModel();
          opt.zIndex = 1000;
          opt.FormModel = this.fmQuotationLines;

          let dialogQuotations = this.callFC.openForm(
            PopupAddQuotationsLinesComponent,
            '',
            1000,
            700,
            '',
            obj,
            '',
            opt
          );
          dialogQuotations.closed.subscribe((res) => {
            if (res?.event) {
              let data = res?.event;
              let idxUp = this.listQuotationLines.findIndex(
                (x) => x.recID == data.recID
              );
              if (idxUp != -1) {
                this.listQuotationLines[idxUp] = data;
                if (this.actionParent == 'edit') {
                  this.linesUpdate(data);
                }
                this.gridQuationsLines.refresh();
                // this.dialog.dataService.updateDatas.set(
                //   this.quotations['_uuid'],
                //   this.quotations
                // );
                this.loadTotal();
                this.objectOut.listQuotationLines = this.listQuotationLines;

                this.eventQuotationLines.emit(this.objectOut);
                this.changeDetector.detectChanges();
              }
            }
          });
        });
    });
  }

  copyLine(dataCopy) {
    //gọi alow copy
    this.codxCM
      .getDefault(
        'CM',
        this.fmQuotationLines.funcID,
        this.fmQuotationLines.entityName
      )
      .subscribe((dt) => {
        if (dt && dt.data) {
          let data = dt.data;

          let arrField = Object.values(this.grvSetupQuotationsLines).filter(
            (x: any) => x.allowCopy
          );
          if (Array.isArray(arrField)) {
            arrField.forEach((v: any) => {
              let field = Util.camelize(v.fieldName);
              data[field] = dataCopy[field];
            });
          }

          data.rowNo = this.listQuotationLines.length + 1;
          data.exchangeRate = this.exchangeRate;
          data.currencyID = this.currencyID;
          data.transID = this.transID;

          this.cache
            .functionList(this.fmQuotationLines.funcID)
            .subscribe((f) => {
              this.cache
                .gridViewSetup(
                  this.fmQuotationLines.formName,
                  this.fmQuotationLines.gridViewName
                )
                .subscribe((res) => {
                  let title = f?.customName || f?.description;
                  var obj = {
                    headerText:
                      this.titleActionLine +
                      ' ' +
                      title.charAt(0).toLowerCase() +
                      title.slice(1),
                    quotationsLine: data,
                    listQuotationLines: this.listQuotationLines,
                    grvSetup: this.grvSetupQuotationsLines,
                  };
                  let opt = new DialogModel();
                  opt.zIndex = 1000;
                  opt.FormModel = this.fmQuotationLines;

                  let dialogQuotations = this.callFC.openForm(
                    PopupAddQuotationsLinesComponent,
                    '',
                    1000,
                    700,
                    '',
                    obj,
                    '',
                    opt
                  );
                  dialogQuotations.closed.subscribe((res) => {
                    if (res?.event) {
                      if (res?.event) {
                        data = res?.event;
                        this.quotationLinesAddNew.push(data);
                        this.listQuotationLines.push(data);
                        this.gridQuationsLines.refresh();
                        this.loadTotal();
                        this.objectOut.quotationLinesAddNew =
                          this.quotationLinesAddNew;
                        this.objectOut.listQuotationLines =
                          this.listQuotationLines;

                        this.eventQuotationLines.emit(this.objectOut);
                        this.changeDetector.detectChanges();
                      }
                    }
                  });
                });
            });
        }
      });
  }

  linesUpdate(data) {
    let indexAdd = this.quotationLinesAddNew.findIndex(
      (x) => x.recID == data.recID
    );
    if (indexAdd != -1) {
      this.quotationLinesAddNew[indexAdd] = data;
    } else {
      let indexEdit = this.quotationLinesEdit.findIndex(
        (x) => x.recID == data.recID
      );
      if (indexEdit == -1) this.quotationLinesEdit.push(data);
      else this.quotationLinesEdit[indexEdit] = data;
    }
    this.objectOut.quotationLinesAddNew = this.quotationLinesAddNew;
    this.objectOut.quotationLinesEdit = this.quotationLinesEdit;
  }

  // endregion QuotationLines

  ///line
  quotationsLineChanged(e) {
    if (!e.field || !e.data) return;
    let lineCrr = e.data;
    switch (e.field) {
      case 'itemID':
        this.loadItem(e.value, lineCrr);
        break;
      case 'VATID':
        let crrtaxrate = e?.component?.itemsSelected[0]?.TaxRate;
        lineCrr['vatRate'] = crrtaxrate ?? 0;
        this.loadChange(lineCrr);
        break;
      case 'discPct':
      case 'quantity':
      case 'salesPrice':
        this.loadChange(lineCrr);
        break;
    }
  }
  loadChange(lineCrr) {
    lineCrr['salesAmt'] =
      (lineCrr['quantity'] ?? 0) * (lineCrr['salesPrice'] ?? 0);

    lineCrr['discAmt'] =
      ((lineCrr['discPct'] ?? 0) * (lineCrr['salesAmt'] ?? 0)) / 100;

    lineCrr['vatBase'] = (lineCrr['salesAmt'] ?? 0) - (lineCrr['discAmt'] ?? 0);

    lineCrr['vatAmt'] = (lineCrr['vatRate'] ?? 0) * (lineCrr['vatBase'] ?? 0);

    lineCrr['netAmt'] =
      (lineCrr['salesAmt'] ?? 0) -
      (lineCrr['discAmt'] ?? 0) +
      (lineCrr['vatAmt'] ?? 0);

    this.loadDataLines(lineCrr);
  }

  loadItem(itemID, lineCrr) {
    this.codxCM.getItem(itemID).subscribe((items) => {
      if (items) {
        lineCrr['onhand'] = items.quantity;
        lineCrr['idiM4'] = items.warehouseID; // kho
        lineCrr['umid'] = items.umid; // don vi tinh
        lineCrr['quantity'] = items.minSettledQty; //so luong mua nhieu nhat
        lineCrr['salesPrice'] = items.costPrice;
        let priceDefaut =
          items.costPrice / (this.exchangeRate != 0 ? this.exchangeRate : 1); // gia von
        lineCrr['costPrice'] = priceDefaut;
        lineCrr['salesPrice'] = priceDefaut;
      }
      this.loadDataLines(lineCrr);
      // this.form.formGroup.patchValue(this.quotationsLine);
    });
  }

  loadDataLines(lineCrr) {
    var idxLine = this.listQuotationLines.findIndex(
      (x) => x.recID == lineCrr.recID
    );
    if (idxLine != -1) {
      this.listQuotationLines[idxLine] = lineCrr;
    } else {
      this.listQuotationLines.push(lineCrr);
    }
    this.loadTotal();
    this.gridQuationsLines.refresh();
  }

  loadTotal() {
    let totals = 0;
    let totalVAT = 0;
    let totalDis = 0;
    let totalSales = 0;
    if (this.listQuotationLines?.length > 0) {
      this.listQuotationLines.forEach((element) => {
        //tisnh tong tien
        totalSales += element['salesAmt'] ?? 0;
        totals += element['netAmt'] ?? 0;
        totalVAT += element['vatAmt'] ?? 0;
        totalDis += element['discAmt'] ?? 0;
      });
    }

    // this.quotations['totalSalesAmt'] = totalSales;
    // this.quotations['totalAmt'] = totals;
    // this.quotations['totalTaxAmt'] = totalVAT;
    // this.quotations['discAmt'] = totalDis;
  }

  gridCreated(e, grid) {
    // let hBody, hTab, hNote;
    // if (this.cardbodyGeneral)
    //   hBody = this.cardbodyGeneral.nativeElement.parentElement.offsetHeight;
    // if (this.quotationGeneral)
    //   hTab = (this.quotationGeneral as any).element.offsetHeight;
    // if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;
    // this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
    //grid.disableField(this.lockFields);
  }
  //#endregion

  getColumsGrid(grvSetup) {
    this.columnsGrid = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'ItemID':
          // template = this.itemTemp;
          break;
      }

      if (template) {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
          template: template,
          // textAlign: 'center',
        };
      } else {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
        };
      }

      this.columnsGrid.push(colums);
    });
    // this.cache.companySetting().subscribe((res) => {
    //   let baseCurr = res.filter((x) => x.baseCurr != null)[0].baseCurr;
    //   this.columnsGrid = this.columnsGrid.slice();
    //   if (this.gridQuationsLines) {
    //     this.gridQuationsLines.refresh();
    //   }
    // });
  }
  onAddNew(e) {
    debugger;
  }

  onEdit(e) {
    debugger;
  }

  sum(field) {
    let sum = 0;
    this.listQuotationLines.forEach((e) => {
      sum += e[field];
    });

    return sum;
  }
}
