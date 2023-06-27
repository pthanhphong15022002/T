import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Paras } from '../../../models/Paras.model';
import { ExchangeRateTransaction } from '../../../models/ExchangeRateTransaction.model';

@Component({
  selector: 'lib-pop-add-exchange-rate-transaction',
  templateUrl: './pop-add-exchange-rate-transaction.component.html',
  styleUrls: ['./pop-add-exchange-rate-transaction.component.css']
})
export class PopAddExchangeRateTransactionComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  exchangeRateTransaction: ExchangeRateTransaction;
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
    this.exchangeRateTransaction = dialog.dataService!.dataSelected;
    if(this.exchangeRateTransaction.paras != null)
    {
      this.Paras = JSON.parse(this.exchangeRateTransaction.paras);
      this.exchangeRateTransaction.accountID = this.Paras.accountID;
      this.exchangeRateTransaction.currencyID = this.Paras.currencyID;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('ExchangeRateTransaction', 'grvExchangeRateTransaction')
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
    this.setFromDateToDate(this.exchangeRateTransaction.runDate);
    this.form.formGroup.patchValue(this.exchangeRateTransaction);
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
        this.exchangeRateTransaction.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.exchangeRateTransaction.memo = e.data;
        break;
      case 'accountID':
        this.exchangeRateTransaction.accountID = e.data;
        break;
      case 'currencyID':
        this.exchangeRateTransaction.currencyID = e.data;
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
        this.exchangeRateTransaction.status = 1;
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
        if(this.exchangeRateTransaction.status == 0)
          this.exchangeRateTransaction.status = 1;
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
        this.exchangeRateTransaction.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.exchangeRateTransaction = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.exchangeRateTransaction);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.exchangeRateTransaction.accountID = null;
    this.exchangeRateTransaction.currencyID = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.exchangeRateTransaction);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.exchangeRateTransaction[keymodel[i]] == null ||
              String(this.exchangeRateTransaction[keymodel[i]]).match(/^ *$/) !== null
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
      this.exchangeRateTransaction.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.exchangeRateTransaction.fromDate = result;
  }

  setParas(){
    this.Paras.accountID = this.exchangeRateTransaction.accountID;
    this.Paras.currencyID = this.exchangeRateTransaction.currencyID;
    this.exchangeRateTransaction.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}