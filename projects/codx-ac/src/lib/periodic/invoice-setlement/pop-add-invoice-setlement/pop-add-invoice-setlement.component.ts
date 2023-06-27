import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Paras } from '../../../models/Paras.model';
import { InvoiceSetlement } from '../../../models/InvoiceSetlement.model';

@Component({
  selector: 'lib-pop-add-invoice-setlement',
  templateUrl: './pop-add-invoice-setlement.component.html',
  styleUrls: ['./pop-add-invoice-setlement.component.css']
})
export class PopAddInvoiceSetlementComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  invoiceSetlement: InvoiceSetlement;
  Paras: Paras;
  gridViewSetup: any;
  validate: any = 0;
  
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    this.Paras = new Paras();
    this.headerText = dialogData.data?.headerText;
    this.invoiceSetlement = dialog.dataService!.dataSelected;
    if(this.invoiceSetlement.paras != null)
    {
      this.Paras = JSON.parse(this.invoiceSetlement.paras);
      this.invoiceSetlement.accountID = this.Paras.accountID;
      this.invoiceSetlement.voucherNo = this.Paras.voucherNo;
      this.invoiceSetlement.objectID = this.Paras.objectID;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('InvoiceSetlement', 'grvInvoiceSetlement')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  //#endregion

  //#region Init

  onInit(): void {
  }

  ngAfterViewInit() {
    this.setFromDateToDate(this.invoiceSetlement.runDate);
    this.form.formGroup.patchValue(this.invoiceSetlement);
  }

  //#endregion

  //region Event

  close(){
    this.onClearParas();
    this.dialog.close();
  }

  //endRegion Event

  //region Function

  valuechange(e){
    switch(e.field)
    {
      case 'runDate':
        this.invoiceSetlement.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.invoiceSetlement.memo = e.data;
        break;
      case 'accountID':
        this.invoiceSetlement.accountID = e.data;
        break;
      case 'voucherNo':
        this.invoiceSetlement.voucherNo = e.data;
        break;
      case 'objectID':
        this.invoiceSetlement.objectID = e.data;
        break;
    }
  }

  onSave(){
    this.checkUpdateTheLedgerValidate();
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.invoiceSetlement.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
      if (this.formType == 'edit') {
        if(this.invoiceSetlement.status == 0)
          this.invoiceSetlement.status = 1;
        this.setParas();
        this.dialog.dataService.save(null, 0, '', '', true).subscribe((res) => {
          if (res && res.update.data != null) {
            this.dialog.close({
              update: true,
              data: res.update,
            });
            this.dt.detectChanges();
          }
        });
      }
    }
  }

  onSaveAdd(){
    this.checkUpdateTheLedgerValidate();
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.invoiceSetlement.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.invoiceSetlement = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.invoiceSetlement);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.invoiceSetlement.accountID = null;
    this.invoiceSetlement.voucherNo = null;
    this.invoiceSetlement.objectID = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.invoiceSetlement);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.invoiceSetlement[keymodel[i]] == null ||
              String(this.invoiceSetlement[keymodel[i]]).match(/^ *$/) !== null
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

  setFromDateToDate(runDate: any)
  {
      this.invoiceSetlement.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.invoiceSetlement.fromDate = result;
  }

  setParas(){
    this.Paras.accountID = this.invoiceSetlement.accountID;
    this.Paras.voucherNo = this.invoiceSetlement.voucherNo;
    this.Paras.objectID = this.invoiceSetlement.objectID;
    this.invoiceSetlement.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}