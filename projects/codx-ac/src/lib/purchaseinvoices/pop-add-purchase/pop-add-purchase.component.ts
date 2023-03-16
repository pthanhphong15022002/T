import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { resolve } from 'dns';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { PurchaseInvoices } from '../../models/PurchaseInvoices.model';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';
import { VATInvoices } from '../../models/VATInvoices.model';

@Component({
  selector: 'lib-pop-add-purchase',
  templateUrl: './pop-add-purchase.component.html',
  styleUrls: ['./pop-add-purchase.component.css'],
})
export class PopAddPurchaseComponent extends UIComponent implements OnInit {
  @ViewChild('gridPurchase') public gridPurchase: CodxGridviewV2Component;
  @ViewChild('gridInvoices') public gridInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  formType: any;
  gridViewSetup: any;
  validate: any = 0;
  parentID: string;
  purchaseinvoices:PurchaseInvoices;
  purchaseInvoicesLines:Array<PurchaseInvoicesLines> = [];
  vatinvoices:VATInvoices = new VATInvoices();
  objectvatinvoices:Array<VATInvoices> = [];
  fmVATInvoices: FormModel = {
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityName: 'AC_VATInvoices',
  };
  fmPurchaseInvoicesLines: FormModel = {
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityName: 'PS_PurchaseInvoicesLines',
  };
  fgVATInvoices : FormGroup;
  gridHeight: number;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  tabInfo: TabModel[] = [
    { name: 'History',textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.purchaseinvoices = dialog.dataService!.dataSelected;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cache.gridViewSetup('VATInvoices', 'grvVATInvoices').subscribe((gv: any) => {
      if (gv) {
        var arrgv = Object.values(gv) as any[];
        const group: any = {};
        arrgv.forEach((element) => {
          var keytmp = Util.camelize(element.fieldName);
          var value = null;
          var type = element.dataType.toLowerCase();
          if (type === 'bool') value = false;
          if (type === 'datetime') value = null;
          if (type === 'int' || type === 'decimal') value = 0;
          group[keytmp] = element.isRequire
            ? new FormControl(value, Validators.required)
            : new FormControl(value);
        });
        group['updateColumn'] = new FormControl('');
        var formGroup = new FormGroup(group);
        this.fgVATInvoices = formGroup;
        this.fgVATInvoices.patchValue(this.vatinvoices);
      }
    });
   }

   onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseinvoices);
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //this.deleteRow(data);
        break;
      case 'SYS03':
        //this.editRow(data);
        break;
      case 'SYS04':
        //this.copyRow(data);
        break;
    }
  }
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;
    this.gridHeight = hBody - (hTab + hNote + 200); //40 là header của tab
  }
  cellChanged(e:any){

  }
}
