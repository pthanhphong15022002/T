import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInputComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  Util,
} from 'codx-core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  CM_Deals,
  CM_Products,
  CM_Quotations,
  CM_QuotationsLines,
} from '../../models/cm_model';
import { PopupAddQuotationsLinesComponent } from '../../quotations-lines/popup-add-quotations-lines/popup-add-quotations-lines.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contacts } from '../../models/tmpCrm.model';
import { TempComponent } from 'codx-core/lib/templates/base-temp/base.component';
import { firstValueFrom, map } from 'rxjs';
import { DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { QuotationsLinesComponent } from '../../quotations-lines/quotations-lines.component';
@Component({
  selector: 'lib-popup-add-quotations',
  templateUrl: './popup-add-quotations.component.html',
  styleUrls: ['./popup-add-quotations.component.css'],
})
export class PopupAddQuotationsComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('gridQuationsLines') gridQuationsLines: CodxGridviewV2Component;
  @ViewChild('cardbodyGeneral') cardbodyGeneral: ElementRef;
  @ViewChild('quotationGeneral') quotationGeneral: ElementRef;
  @ViewChild('dealsCbx') dealsCbx: CodxInputComponent;
  @ViewChild('customerCbx') customerCbx: CodxInputComponent;
  @ViewChild('contactCbx') contactCbx: CodxInputComponent;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;

  @ViewChild('itemTemp') itemTemp: TemplateRef<any>;
  @ViewChild('viewQuotationsLine') viewQuotationsLine: QuotationsLinesComponent;

  quotations: CM_Quotations;
  action = 'add';
  dialog: DialogRef;
  headerText = 'Thêm form test';

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

  listQuotationLines: Array<any> = [];
  lockFields = [];
  quotationLinesAddNew = [];
  quotationLinesEdit = [];
  quotationLinesDeleted = [];
  disableRefID = false;
  disableCusID = false;
  disableContactsID = false;
  modelObjectIDContacs: any;
  // modelCustomerIDDeals: any;
  titleActionLine = '';
  columnsGrid = [];
  arrFieldIsVisible: any[];
  formModel: FormModel;
  currencyIDOld = 'VND';
  grvSetupQuotations: any;
  grvSetupQuotationsLines: any;
  crrCustomerID: string;
  copyToRecID: any;

  constructor(
    public sanitizer: DomSanitizer,
    private api: ApiHttpService,
    private codxCM: CodxCmService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private changeDetector: ChangeDetectorRef,
    private callFc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    // this.quotations = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.quotations = JSON.parse(JSON.stringify(dt?.data?.data));
    if (!this.quotations.recID) {
      this.quotations.recID = Util.uid();
    }
    if (this.quotations.currencyID) {
      this.currencyIDOld = this.quotations.currencyID;
      this.loadExchangeRate();
    }
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.disableRefID = dt?.data?.disableRefID;
    this.disableCusID = dt?.data?.disableCusID;
    this.disableContactsID = dt?.data?.disableContactsID;
    this.copyToRecID = dt?.data?.copyToRecID;
    this.listQuotationLines = [];

    if (this.action == 'edit' || this.action == 'copy') {
      let tranID =
        this.action == 'edit' ? this.quotations.recID : this.copyToRecID;
      this.codxCM.getQuotationsLinesByTransID(tranID).subscribe((res) => {
        if (res) {
          this.listQuotationLines = res;
          if (this.action == 'copy') {
            this.listQuotationLines.forEach((x) => {
              x.recID = Util.uid();
              x.Id = null;
              x.transID = this.quotations.recID;
            });
          }
        }
      });
    }
    this.loadDefault();
  }

  ngOnInit(): void {}

  //load Default
  loadDefault() {
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
          // this.getColumsGrid(res);
        }
      });

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        this.grvSetupQuotations = res;
      });
  }

  beforeSave(op: RequestOption) {
    let data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddQuotationsAsync';
      data = [this.quotations, this.listQuotationLines];
    }
    if (this.action == 'edit') {
      op.methodName = 'EditQuotationsAsync';
      data = [
        this.quotations,
        this.quotationLinesAddNew,
        this.quotationLinesEdit,
        this.quotationLinesDeleted,
      ];
    }
    op.data = data;
    return true;
  }

  onAdd() {
    if (this.dialog.dataService) {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt), 0)
        .subscribe((res) => {
          if (res.save) {
            (this.dialog.dataService as CRUDService)
              .update(res.save)
              .subscribe();
            this.dialog.close(res.save);
          } else {
            this.dialog.close();
          }
          this.changeDetector.detectChanges();
        });
    } else {
      this.api
        .exec<any>('CM', 'QuotationsBusiness', 'AddQuotationsAsync', [
          this.quotations,
          this.listQuotationLines,
        ])
        .subscribe((res) => {
          if (res) {
            this.notiService.notifyCode('SYS006');
            this.dialog.close(res);
          } else {
            this.notiService.notifyCode('SYS023');
            this.dialog.close();
          }
        });
    }
  }

  onUpdate() {
    if (this.dialog.dataService) {
      this.dialog.dataService
        .save((opt: any) => this.beforeSave(opt))
        .subscribe((res) => {
          if (res.update) {
            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
            this.dialog.close(res.update);
          } else {
            this.dialog.close();
          }
          this.changeDetector.detectChanges();
        });
    } else {
      this.api
        .exec<any>('CM', 'QuotationsBusiness', 'EditQuotationsAsync', [
          this.quotations,
          this.quotationLinesAddNew,
          this.quotationLinesEdit,
          this.quotationLinesDeleted,
        ])
        .subscribe((res) => {
          if (res) {
            this.notiService.notifyCode('SYS007');
            this.dialog.close(res);
          } else {
            this.notiService.notifyCode('SYS021');
            this.dialog.close();
          }
        });
    }
  }

  onSave() {
    let count = this.codxCM.checkValidateForm(
      this.grvSetupQuotations,
      this.quotations,
      0
    );
    if (count > 0) return;
    if (!(this.listQuotationLines?.length > 0)) {
      this.notiService.notifyCode('CM013');
      return;
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else if (this.action == 'edit') {
      this.onUpdate();
    }
  }

  //change Data
  changeCombox(e) {
    if (!e?.data || !e?.field) return;

    this.quotations[e.field] = e.data;
    switch (e?.field) {
      case 'refID':
        if (
          this.quotations.customerID !=
          e?.component?.itemsSelected[0]?.CustomerID
        ) {
          this.customerCbx.ComponentCurrent.dataService.data = [];
          this.customerCbx.crrValue = null;

          this.quotations.customerID =
            e?.component?.itemsSelected[0]?.CustomerID;
          this.customerCbx.crrValue = this.quotations.customerID;

          this.contactCbx.ComponentCurrent.dataService.data = [];
          this.contactCbx.crrValue = null;
          this.crrCustomerID = this.quotations.customerID;
        }
        break;
      case 'customerID':
        if (this.crrCustomerID != this.quotations.customerID) {
          //co hoi
          this.dealsCbx.ComponentCurrent.dataService.data = [];
          this.dealsCbx.crrValue = null;
          this.quotations.refID = null;
          // lien he
          this.contactCbx.ComponentCurrent.dataService.data = [];
          this.contactCbx.crrValue = null;
          this.quotations.contactID = null;
        }

        break;
      case 'contactID':
        if (
          this.quotations.customerID != e?.component?.itemsSelected[0]?.ObjectID
        ) {
          this.customerCbx.ComponentCurrent.dataService.data = [];
          this.customerCbx.crrValue = null;

          this.dealsCbx.ComponentCurrent.dataService.data = [];
          this.quotations.refID = null;
          this.dealsCbx.crrValue = null;

          this.quotations.customerID = e?.component?.itemsSelected[0]?.ObjectID;
          this.customerCbx.crrValue = this.quotations.customerID;
        }
        break;
    }

    this.form.formGroup.patchValue(this.quotations);
    // }
  }

  valueChange(e) {
    if (!e?.data || !e?.field) return;

    if (e.field == 'currencyID') {
      this.loadExchangeRate();
    }
    this.quotations[e.field] = e.data;
  }
  controlBlur(e) {}

  valueChangeDate(e) {
    if (!e?.data || !e?.field) return;
    //luc truoc add formDate
    this.quotations[e.field] = e.data?.fromDate ?? e?.data;
  }

  select(e) {}

  created(e) {}

  gridCreated(e, grid) {
    let hBody, hTab, hNote;
    if (this.cardbodyGeneral)
      hBody = this.cardbodyGeneral.nativeElement.parentElement.offsetHeight;
    if (this.quotationGeneral)
      hTab = (this.quotationGeneral as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
    //grid.disableField(this.lockFields);
  }

  // region QuotationLines ========== DA CHUYEN QUOTIONLINES========
  // clickMFQuotationLines(e, data) {
  //   this.titleActionLine = e.text;
  //   switch (e.functionID) {
  //     case 'SYS02':
  //       this.deleteLine(data);
  //       break;
  //     case 'SYS03':
  //       this.editLine(data);
  //       break;
  //     case 'SYS04':
  //       this.copyLine(data);
  //       break;
  //   }
  // }

  // addPopup() {
  //   let idx = this.gridQuationsLines.dataSource?.length;
  //   this.genData(idx);
  //   // cu
  //   // let data = this.genData(idx) ;
  //   // this.cache.functionList(this.fmQuotationLines.funcID).subscribe((f) => {
  //   //   this.cache
  //   //     .gridViewSetup(
  //   //       this.fmQuotationLines.formName,
  //   //       this.fmQuotationLines.gridViewName
  //   //     )
  //   //     .subscribe((res) => {
  //   //       var obj = {
  //   //         headerText: 'Thêm sản phẩm báo giá',
  //   //         quotationsLine: data,
  //   //         listQuotationLines: this.listQuotationLines,
  //   //       };
  //   //       let opt = new DialogModel();
  //   //       opt.zIndex = 1000;
  //   //       opt.FormModel = this.fmQuotationLines;

  //   //       let dialogQuotations = this.callFc.openForm(
  //   //         PopupAddQuotationsLinesComponent,
  //   //         '',
  //   //         650,
  //   //         850,
  //   //         '',
  //   //         obj,
  //   //         '',
  //   //         opt
  //   //       );
  //   //       dialogQuotations.closed.subscribe((res) => {
  //   //         if (res?.event) {
  //   //           data = res?.event;
  //   //           this.quotationLinesAddNew.push(data);
  //   //           this.listQuotationLines.push(data);
  //   //           this.gridQuationsLines.refresh();
  //   //           this.loadTotal();
  //   //           this.changeDetector.detectChanges();
  //   //         }
  //   //       });
  //   //     });
  //   // });
  // }
  // addRow() {
  //   this.addPopup(); //tam add popup
  //   // let idx = this.gridQuationsLines.dataSource?.length;
  //   // let data = this.genData(idx);
  //   // this.gridQuationsLines.addRow(data, idx); //add row gridview
  // }

  // genData(idx) {
  //   this.codxCM
  //     .getDefault(
  //       'CM',
  //       this.fmQuotationLines.funcID,
  //       this.fmQuotationLines.entityName
  //     )
  //     .subscribe((dt) => {
  //       if (dt && dt.data) {
  //         //this.gridQuationsLines.formGroup.value = dt.data
  //         let data = dt.data; //ddooi tuong

  //         data.recID = Util.uid();
  //         data.transID = this.quotations.recID;
  //         data.write = true;
  //         data.delete = true;
  //         data.read = true;
  //         data.rowNo = idx + 1;

  //         //add tam do loi
  //         data.salesAmt = data.salesAmt ?? 0;
  //         data.quantity = data.quantity ?? 0;
  //         data.discPct = data.discPct ?? 0;
  //         data.discAmt = data.discAmt ?? 0;
  //         data.vatBase = data.vatBase ?? 0;
  //         data.vatAmt = data.vatAmt ?? 0;
  //         data.vatRate = data.vatRate ?? 0;
  //         data.exchangeRate = this.quotations?.exchangeRate;
  //         data.currencyID = this.quotations?.currencyID;
  //         data.transID = this.quotations?.recID;

  //         this.cache
  //           .functionList(this.fmQuotationLines.funcID)
  //           .subscribe((f) => {
  //             this.cache
  //               .gridViewSetup(
  //                 this.fmQuotationLines.formName,
  //                 this.fmQuotationLines.gridViewName
  //               )
  //               .subscribe((res) => {
  //                 var obj = {
  //                   headerText: 'Thêm sản phẩm báo giá',
  //                   quotationsLine: data,
  //                   listQuotationLines: this.listQuotationLines,
  //                   grvSetup: this.grvSetupQuotationsLines,
  //                 };
  //                 let opt = new DialogModel();
  //                 opt.zIndex = 1000;
  //                 opt.FormModel = this.fmQuotationLines;

  //                 let dialogQuotations = this.callFc.openForm(
  //                   PopupAddQuotationsLinesComponent,
  //                   '',
  //                   650,
  //                   850,
  //                   '',
  //                   obj,
  //                   '',
  //                   opt
  //                 );
  //                 dialogQuotations.closed.subscribe((res) => {
  //                   if (res?.event) {
  //                     data = res?.event;
  //                     this.quotationLinesAddNew.push(data);
  //                     this.listQuotationLines.push(data);
  //                     this.gridQuationsLines.refresh();
  //                     this.loadTotal();
  //                     this.changeDetector.detectChanges();
  //                   }
  //                 });
  //               });
  //           });
  //       }
  //     });
  // }

  // deleteLine(data) {
  //   this.notiService.alertCode('SYS030').subscribe((res) => {
  //     if (res.event.status === 'Y') {
  //       //=> delete fe
  //       this.gridQuationsLines.deleteRow(data);
  //       if (this.action == 'edit') {
  //         this.quotationLinesDeleted.push(data);
  //         let indexAdd = this.quotationLinesAddNew.findIndex(
  //           (x) => x.recID == data.recID
  //         );
  //         if (indexAdd != -1) this.quotationLinesAddNew.splice(indexAdd, 1); //xóa 1 pt trong mang
  //         let indexEdit = this.quotationLinesEdit.findIndex(
  //           (x) => x.recID == data.recID
  //         );
  //         if (indexEdit != -1) this.quotationLinesEdit.splice(indexAdd, 1);
  //       }
  //       if (this.gridQuationsLines.dataSource.length > 0) {
  //         for (let i = 0; i < this.gridQuationsLines.dataSource.length; i++) {
  //           if (
  //             this.gridQuationsLines.dataSource[i].rowNo != i + 1 &&
  //             this.action == 'edit'
  //           ) {
  //             this.linesUpdate(this.gridQuationsLines.dataSource[i]);
  //           }
  //           this.gridQuationsLines.dataSource[i].rowNo = i + 1;
  //         }
  //       }
  //       this.listQuotationLines = this.gridQuationsLines.dataSource;
  //       this.loadTotal();
  //       this.changeDetector.detectChanges();
  //     }
  //   });
  // }

  // editLine(dt) {
  //   this.cache.functionList(this.fmQuotationLines.funcID).subscribe((f) => {
  //     this.cache
  //       .gridViewSetup(
  //         this.fmQuotationLines.formName,
  //         this.fmQuotationLines.gridViewName
  //       )
  //       .subscribe((res) => {
  //         var obj = {
  //           headerText: this.titleActionLine + f?.customName || f?.description,
  //           quotationsLine: dt,
  //           listQuotationLines: this.listQuotationLines,
  //           grvSetup: this.grvSetupQuotationsLines,
  //         };
  //         let opt = new DialogModel();
  //         opt.zIndex = 1000;
  //         opt.FormModel = this.fmQuotationLines;

  //         let dialogQuotations = this.callFc.openForm(
  //           PopupAddQuotationsLinesComponent,
  //           '',
  //           650,
  //           570,
  //           '',
  //           obj,
  //           '',
  //           opt
  //         );
  //         dialogQuotations.closed.subscribe((res) => {
  //           if (res?.event) {
  //             let data = res?.event;
  //             let idxUp = this.listQuotationLines.findIndex(
  //               (x) => x.recID == data.recID
  //             );
  //             if (idxUp != -1) {
  //               this.listQuotationLines[idxUp] = data;
  //               if (this.action == 'edit') {
  //                 this.linesUpdate(data);
  //               }

  //               this.gridQuationsLines.refresh();
  //               // this.dialog.dataService.updateDatas.set(
  //               //   this.quotations['_uuid'],
  //               //   this.quotations
  //               // );
  //               this.loadTotal();
  //               this.changeDetector.detectChanges();
  //             }
  //           }
  //         });
  //       });
  //   });
  // }

  // copyLine(dataCopy) {
  //   //gọi alow copy
  //   this.codxCM
  //     .getDefault(
  //       'CM',
  //       this.fmQuotationLines.funcID,
  //       this.fmQuotationLines.entityName
  //     )
  //     .subscribe((dt) => {
  //       if (dt && dt.data) {
  //         let data = dt.data;

  //         let arrField = Object.values(this.grvSetupQuotationsLines).filter(
  //           (x: any) => x.allowCopy
  //         );
  //         if (Array.isArray(arrField)) {
  //           arrField.forEach((v: any) => {
  //             let field = Util.camelize(v.fieldName);
  //             data[field] = dataCopy[field];
  //           });
  //         }

  //         data.rowNo = this.listQuotationLines.length + 1;
  //         data.exchangeRate = this.quotations?.exchangeRate;
  //         data.currencyID = this.quotations?.currencyID;
  //         data.transID = this.quotations?.recID;

  //         this.cache
  //           .functionList(this.fmQuotationLines.funcID)
  //           .subscribe((f) => {
  //             this.cache
  //               .gridViewSetup(
  //                 this.fmQuotationLines.formName,
  //                 this.fmQuotationLines.gridViewName
  //               )
  //               .subscribe((res) => {
  //                 let title = f?.customName || f?.description;
  //                 var obj = {
  //                   headerText:
  //                     this.titleActionLine +
  //                     ' ' +
  //                     title.charAt(0).toLowerCase() +
  //                     title.slice(1),
  //                   quotationsLine: data,
  //                   listQuotationLines: this.listQuotationLines,
  //                   grvSetup: this.grvSetupQuotationsLines,
  //                 };
  //                 let opt = new DialogModel();
  //                 opt.zIndex = 1000;
  //                 opt.FormModel = this.fmQuotationLines;

  //                 let dialogQuotations = this.callFc.openForm(
  //                   PopupAddQuotationsLinesComponent,
  //                   '',
  //                   650,
  //                   570,
  //                   '',
  //                   obj,
  //                   '',
  //                   opt
  //                 );
  //                 dialogQuotations.closed.subscribe((res) => {
  //                   if (res?.event) {
  //                     if (res?.event) {
  //                       data = res?.event;
  //                       this.quotationLinesAddNew.push(data);
  //                       this.listQuotationLines.push(data);
  //                       this.gridQuationsLines.refresh();
  //                       this.loadTotal();
  //                       this.changeDetector.detectChanges();
  //                     }
  //                   }
  //                 });
  //               });
  //           });
  //       }
  //     });
  // }

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
  }

  // // endregion QuotationLines

  loadModegrid() {}

  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      var arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridQuationsLines.rowDataSelected[field] = data[field];
            this.gridQuationsLines.rowDataSelected = {
              ...data,
            };
            this.gridQuationsLines.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
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

    this.quotations['totalSalesAmt'] = totalSales;
    this.quotations['totalAmt'] = totals;
    this.quotations['totalTaxAmt'] = totalVAT;
    this.quotations['discAmt'] = totalDis;
  }

  //// change RATE
  loadExchangeRate() {
    let day = this.quotations.createdOn ?? new Date();
    this.codxCM
      .getExchangeRate(this.quotations.currencyID, day)
      .subscribe((res) => {
        let exchangeRateNew = res?.exchRate ?? 0;
        if (exchangeRateNew == 0) {
          this.notiService.notify(
            'Tỷ giá tiền tệ "' +
              this.quotations.currencyID +
              '" chưa thiết lập xin hay chọn lại !',
            '3'
          );
          this.quotations.currencyID = this.currencyIDOld;
          this.form.formGroup.patchValue(this.quotations);
          return;
        }
        this.currencyIDOld = this.quotations.currencyID;
        let exchangeRateOld = this.quotations.exchangeRate;
        if (exchangeRateOld != exchangeRateNew) {
          this.quotations.exchangeRate = exchangeRateNew;
          this.quotations['totalSalesAmt'] =
            (this.quotations['totalSalesAmt'] * exchangeRateOld) /
            exchangeRateNew;
          this.quotations['totalAmt'] =
            (this.quotations['totalAmt'] * exchangeRateOld) / exchangeRateNew;
          this.quotations['totalTaxAmt'] =
            (this.quotations['totalTaxAmt'] * exchangeRateOld) /
            exchangeRateNew;
          this.quotations['discAmt'] =
            (this.quotations['discAmt'] * exchangeRateOld) / exchangeRateNew;
        }

        this.form.formGroup.patchValue(this.quotations);
        if (this.listQuotationLines?.length > 0) {
          this.listQuotationLines.forEach((ql) => {
            ql['currencyID'] = this.quotations.currencyID;
            ql['exchangeRate'] = this.quotations.exchangeRate;

            ql['salesPrice'] =
              (ql['salesPrice'] * exchangeRateOld) / exchangeRateNew;
            ql['costPrice'] =
              (ql['costPrice'] * exchangeRateOld) / exchangeRateNew;
            ql['discAmt'] = (ql['discAmt'] * exchangeRateOld) / exchangeRateNew;
            ql['salesAmt'] =
              (ql['salesAmt'] * exchangeRateOld) / exchangeRateNew;
            ql['vatBase'] = (ql['vatBase'] * exchangeRateOld) / exchangeRateNew;
            ql['vatAmt'] = (ql['vatAmt'] * exchangeRateOld) / exchangeRateNew;
            ql['netAmt'] = (ql['netAmt'] * exchangeRateOld) / exchangeRateNew;

            if (this.action == 'edit') {
              this.linesUpdate(ql);
            }
          });
          this.viewQuotationsLine.gridQuationsLines.refresh();
        }
      });
  }

  clearQuotationsLines() {
    let idx = this.listQuotationLines.length;
    let data = new CM_QuotationsLines();
  }

  //#endregion

  //Begin add line
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
    this.viewQuotationsLine.gridQuationsLines.refresh();
  }

  checkLines(lineCrr) {
    let check = this.quotationLinesAddNew.some((x) => x.recID == lineCrr.recID);
    if (!check) this.quotationLinesAddNew.push(lineCrr);
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
        lineCrr['costPrice'] = items.costPrice; // gia von
        lineCrr['umid'] = items.umid; // don vi tinh
        lineCrr['quantity'] = items.minSettledQty; //so luong mua nhieu nhat
      }
      this.loadDataLines(lineCrr);
      // this.form.formGroup.patchValue(this.quotationsLine);
    });
  }

  getColumsGrid(grvSetup) {
    this.columnsGrid = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'ItemID':
          template = this.itemTemp;
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
  //end

  //setData
  eventQuotationLines(e) {
    this.listQuotationLines = e?.listQuotationLines;
    this.quotationLinesAddNew = e?.quotationLinesAddNew;
    this.quotationLinesEdit = e?.quotationLinesEdit;
    this.quotationLinesDeleted = e?.quotationLinesDeleted;
    this.loadTotal();
  }
}
