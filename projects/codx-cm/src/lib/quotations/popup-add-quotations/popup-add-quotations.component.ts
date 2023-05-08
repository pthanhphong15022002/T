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
  RequestOption,
  Util,
} from 'codx-core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  CM_Products,
  CM_Quotations,
  CM_QuotationsLines,
} from '../../models/cm_model';
import { PopupAddQuotationsLinesComponent } from '../../quotations-lines/popup-add-quotations-lines/popup-add-quotations-lines.component';
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
  };
  gridHeight: number = 300;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };

  quotationLines: Array<CM_QuotationsLines> = [];
  lockFields = [];
  dataParent: any;
  gridViewSetupQL: any;

  constructor(
    public sanitizer: DomSanitizer,
    private api: ApiHttpService,
    private cache: CacheService,
    private changeDetector: ChangeDetectorRef,
    private callFc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    // this.quotations = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.quotations = JSON.parse(JSON.stringify(dt?.data?.data));
    this.action = dt?.data?.action;
    this.quotationLines = [];
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
      data = [this.quotations];
    }
    if (this.action == 'edit') {
      op.methodName = 'EditQuotationsAsync';
      data = [this.quotations];
    }
    op.data = data;
    return true;
  }
  onAdd() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.save) {
          (this.dialog.dataService as CRUDService).update(res.save).subscribe();
          this.dialog.close(res.save);
        } else {
          this.dialog.close();
        }
        this.changeDetector.detectChanges();
      });
  }

  onUpdate() {
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
  }
  onSave() {
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else if (this.action == 'edit') {
      this.onUpdate();
    }
  }

  valueChange(e) {}
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

  clickMF(e, data) {}

  // region Product
  addRow() {
    let idx = this.gridQuationsLines.dataSource?.length;
    let data = this.gridQuationsLines.formGroup.value; //ddooi tuong
    data.recID = Util.uid();
    data.write = true;
    data.delete = true;
    data.read = true;
    data.rowNo = idx + 1;
    data.transID = this.quotations?.recID;
   // this.gridQuationsLines.addRow(data, idx);  //add row gridview
    var obj = {
      headerText: 'Thêm sản phẩm báo giá',
      quotationsLine: data,
    };
    let opt = new DialogModel();
    opt.zIndex=1000;
    let dataModel = new FormModel();
    opt.FormModel = dataModel;

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
      //lam gi day
    });
  }

  quotionsLineChanged(e) {
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

  //#endregion
}
