import { mode } from 'crypto-js';
import { TabModel } from './../../../../../../codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { InvoicesLine } from '../../../models/invoice.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  EditSettingsModel,
  GridComponent,
  VirtualScrollService,
} from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogRef,
  FormModel,
  RequestOption,
  Util,
} from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'lib-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css'],
  providers: [VirtualScrollService],
})
export class AddEditComponent implements OnInit {
  //#region Contructor
  @Input() headerText: string;
  dialog: DialogRef;
  invoices: any;
  action: string;
  active = true;
  gridHeight: number;
  fmInvoiceLines: FormModel = {
    formName: 'EIInvoices',
    gridViewName: 'grvEIInvoiceLines',
    entityName: 'EI_InvoiceLines',
  };
  fgGoods: FormGroup;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Batch',
  };
  selectedItem: any;
  selectedIndex: number = 0;
  data = [
    //   {
    //     itemDesc: 'Sản phẩm A',
    //     umid: 'CAI',
    //     quantity: 2,
    //     salesPrice: 40000,
    //     salesAmt: 80000,
    //     vatid: 2,
    //     vatAmt: 1600,
    //     totalAmt: 78400,
    //     lineType: 'Gia dụng',
    //   },
    //   {
    //     itemDesc: 'Sản phẩm A',
    //     umid: 'CAI',
    //     quantity: 2,
    //     salesPrice: 40000,
    //     salesAmt: 80000,
    //     vatid: 2,
    //     vatAmt: 1600,
    //     totalAmt: 78400,
    //     lineType: 'Gia dụng',
    //   },
  ];
  tabs: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
  ];
  dicMST: Map<string, any> = new Map<string, any>();

  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('invoicesRef') invoicesRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.invoices = dialog.dataService!.dataSelected;
    this.action = dialogData.data[0];
    this.headerText = dialogData.data[1];
    this.fmInvoiceLines.funcID = dialog.dataService.formModel.funcID;
  }
  //#endregion

  //#region Init
  ngOnInit(): void {
    this.cache
      .gridViewSetup('EIInvoiceLines', 'grvEIInvoiceLines')
      .subscribe((res) => {
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

          this.fgGoods = new FormGroup(group);
        }
      });
  }
  ngAfterViewInit() {
    if (this.action != 'add') this.form.formGroup.patchValue(this.invoices);
    else {
      this.form.formGroup.patchValue({
        invoiceDate: new Date(),
        invoiceType: '1',
      });
    }
  }
  //#endregion

  //#region Event
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.invoicesRef) hTab = (this.invoicesRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  }

  valueChanged(e) {
    // if (e && e.data) {
    //   if (e.field === 'UMID') this.selectedItem[e.field.toLowerCase()] = e.data;
    //   else this.selectedItem[e.field] = e.data;
    // }
    console.log(e);
  }

  mstChange(e) {
    if (e && e.data) {
      let mst = this.dicMST.has(e.data);
      if (mst) this.bindingTaxInfor(this.dicMST.get(e.data));
      else
        this.api
          .exec<any>('EI', 'CustomersBusiness', 'GetCustomerAsync', e.data)
          .subscribe((res) => {
            if (res) {
              this.dicMST.set(e.data, res);
              this.bindingTaxInfor(res);
            }
          });
    }
  }

  addRow() {
    let idx = this.data.length;
    this.grid.gridRef?.addRecord();
  }

  //#endregion

  //#region CRUD
  save() {
    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddAsync';
        opt.className = 'InvoicesBusiness';
        opt.assemblyName = 'EI';
        opt.service = 'EI';
        opt.data = this.invoices;
        return true;
      })
      .subscribe();
  }
  //#endregion
  //#region Function
  bindingTaxInfor(data) {
    this.form.formGroup.patchValue({ custName: data['custName'] });
    this.form.formGroup.patchValue({ adddess: data['address'] });
    this.form.formGroup.patchValue({ phone: data['phone'] });
    this.form.formGroup.patchValue({ bankName: data['bankName'] });
    this.form.formGroup.patchValue({ bankAccount: data['bankAccount'] });
  }
  //#endregion
}
