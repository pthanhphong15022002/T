import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, FormModel, CacheService, ApiHttpService, CallFuncService, NotificationsService, DialogData } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';

@Component({
  selector: 'lib-pop-add-line',
  templateUrl: './pop-add-line.component.html',
  styleUrls: ['./pop-add-line.component.css']
})
export class PopAddLineComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  purchaseInvoicesLines:PurchaseInvoicesLines;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) { 
    super(inject);
    this.dialog = dialog;
    this.purchaseInvoicesLines = dialogData.data?.data;
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseInvoicesLines);
  }
  onSave(){
    this.purchaseInvoicesLines.itemID = "asd";
    this.purchaseInvoicesLines.idiM4 = "kho";
    this.purchaseInvoicesLines.vatid = "thuế";
    window.localStorage.setItem('dataline', JSON.stringify(this.purchaseInvoicesLines));
    this.dialog.close();
  }
}
