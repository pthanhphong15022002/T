import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
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
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;

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
  dataParent: any;
  gridViewSetupQL: any;
  quotationLinesAddNew = [];
  quotationLinesEdit = [];
  quotationLinesDeleted = [];
  disableRefID = false;
  modelObjectIDContacs: any;
  modelCustomerIDDeals: any;
  titleActionLine = '';

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
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.disableRefID = dt?.data?.disableRefID;
    this.listQuotationLines = [];
    this.cache
      .gridViewSetup(
        this.fmQuotationLines.formName,
        this.fmQuotationLines.formName
      )
      .subscribe((res) => {
        this.gridViewSetupQL = res;
      });
  }

  ngOnInit(): void {}

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
          [this.quotations, this.listQuotationLines],
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
          [
            this.quotations,
            this.quotationLinesAddNew,
            this.quotationLinesEdit,
            this.quotationLinesDeleted,
          ],
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
        this.quotations.customerID = e?.component?.itemsSelected[0]?.CustomerID;
        this.modelObjectIDContacs = { objectID: this.quotations.customerID };
        break;
      case 'customerID':
        this.quotations.refID = null;
        this.modelObjectIDContacs = { objectID: this.quotations.customerID };
        break;
    }
  }

  valueChange(e) {
    if (!e?.data || !e?.field) return;
    this.quotations[e.field] = e.data;
  }
  controlBlur(e) {}

  valueChangeDate(e) {
    if (!e?.data || !e?.field) return;
    this.quotations[e.field] = e.data?.fromDate;
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

  // region QuotationLines
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
    let data = this.genData(idx);
    this.cache.functionList(this.fmQuotationLines.funcID).subscribe((f) => {
      this.cache
        .gridViewSetup(
          this.fmQuotationLines.formName,
          this.fmQuotationLines.gridViewName
        )
        .subscribe((res) => {
          var obj = {
            headerText: 'Thêm sản phẩm báo giá',
            quotationsLine: data,
            listQuotationLines: this.listQuotationLines,
          };
          let opt = new DialogModel();
          opt.zIndex = 1000;
          opt.FormModel = this.fmQuotationLines;

          let dialogQuotations = this.callFc.openForm(
            PopupAddQuotationsLinesComponent,
            '',
            650,
            570,
            '',
            obj,
            '',
            opt
          );
          dialogQuotations.closed.subscribe((res) => {
            if (res?.event) {
              data = res?.event;
              // this.gridQuationsLines.addRow(data, idx);
              this.quotationLinesAddNew.push(data);
              this.listQuotationLines.push(data);
              // this.gridQuationsLines.dataSource = this.quotationLines
              this.loadTotal();
              this.changeDetector.detectChanges();
            }
          });
        });
    });
  }
  addRow() {
    let idx = this.gridQuationsLines.dataSource?.length;
    let data = this.genData(idx);
    this.gridQuationsLines.addRow(data, idx); //add row gridview
  }

  genData(idx) {
    let data = this.gridQuationsLines.formGroup.value; //ddooi tuong
    data.recID = Util.uid();
    data.transID = this.quotations.recID;
    data.write = true;
    data.delete = true;
    data.read = true;
    data.rowNo = idx + 1;
    data.transID = this.quotations?.recID;
    return data;
  }
  deleteLine(dt) {}

  editLine(dt) {
    this.cache.functionList(this.fmQuotationLines.funcID).subscribe((f) => {
      this.cache
        .gridViewSetup(
          this.fmQuotationLines.formName,
          this.fmQuotationLines.gridViewName
        )
        .subscribe((res) => {
          var obj = {
            headerText: this.titleActionLine,
            quotationsLine: dt,
            listQuotationLines: this.listQuotationLines,
          };
          let opt = new DialogModel();
          opt.zIndex = 1000;
          opt.FormModel = this.fmQuotationLines;

          let dialogQuotations = this.callFc.openForm(
            PopupAddQuotationsLinesComponent,
            '',
            650,
            570,
            '',
            obj,
            '',
            opt
          );
          dialogQuotations.closed.subscribe((res) => {
            if (res?.event) {
              let data = res?.event;
              let check = this.quotationLinesEdit.some(x=>x.recID==data.recID)
              if(!check)this.quotationLinesEdit.push(data)
              // this.quotationLines.push(data);
              // // this.gridQuationsLines.dataSource = this.quotationLines
              this.loadTotal();
              this.changeDetector.detectChanges();
            }
          });
        });
    });
  }

  copyLine(dt) {}

  // endregion QuotationLines


  loadModegrid() {}

  quotationsLineChanged(e) {
    //cái này change vào để xuất file
    //  const field = [
    //  'rowno',
    //  'itemid',
    //  'quantity',
    //  'umid',
    //  'salesprice',
    //  'salesamt',
    //  'discamt',
    //  'vatid',
    //  'vatamt',
    //  'note'
    //  ];
    // if (field.includes(e.field.toLowerCase())) {
    //   this.api
    //     .exec('CM', 'ProductsBusiness', 'ValueChangedAsync', [
    //       this.dataParent,
    //       e.data,
    //       e.field,
    //       e.data?.isAddNew,
    //     ])
    //     .subscribe((res: any) => {
    //       if (res && res.line)
    //         this.setDataGrid(res.line.updateColumns, res.line);
    //     });
    // }
    // if (e.field.toLowerCase() == 'sublgtype' && e.value) {
    //   if (e.value === '3') {
    //     //Set lock field
    //   } else {
    //     this.api
    //       .exec<any>(
    //         'AC',
    //         'AC',
    //         'CashPaymentsLinesBusiness',
    //         'SetLockFieldAsync'
    //       )
    //       .subscribe((res) => {
    //         if (res) {
    //           //Set lock field
    //         }
    //       });
    //   }
    //}
  }

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
    if (this.listQuotationLines?.length > 0) {
      var totals = 0;
      var totalsdr = 0;
      this.listQuotationLines.forEach((element) => {
        //tisnh tong tien
        totals = totals + element.netAmt ?? 0;
        // totalsdr = totalsdr + element.dR2;
      });
      this.quotations.totalAmt = totals;
      // this.totaldr2 = totalsdr.toLocaleString('it-IT');
    } else this.quotations.totalAmt = 0;
  }

  clearQuotationsLines() {
    let idx = this.listQuotationLines.length;
    let data = new CM_QuotationsLines();
  }

  //#endregion
}
