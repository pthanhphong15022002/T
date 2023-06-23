import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Paras } from '../../../models/Paras.model';
import { ClosingTransaction } from '../../../models/ClosingTransaction.model';

@Component({
  selector: 'lib-pop-add-closing-transaction',
  templateUrl: './pop-add-closing-transaction.component.html',
  styleUrls: ['./pop-add-closing-transaction.component.css']
})
export class PopAddClosingTransactionComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  closingTransaction: ClosingTransaction;
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
    this.closingTransaction = dialog.dataService!.dataSelected;
    if(this.closingTransaction.paras != null)
    {
      this.Paras = JSON.parse(this.closingTransaction.paras);
      this.closingTransaction.alloMethod = this.Paras.alloMethod;
      this.closingTransaction.alloGroupID = this.Paras.alloGroupID;
      this.closingTransaction.alloEntryID = this.Paras.alloEntryID;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('ClosingTransaction', 'grvClosingTransaction')
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
    this.setFromDateToDate(this.closingTransaction.runDate);
    this.form.formGroup.patchValue(this.closingTransaction);
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
        this.closingTransaction.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.closingTransaction.memo = e.data;
        break;
      case 'alloMethod':
        this.closingTransaction.alloMethod = e.data;
        break;
      case 'alloGroupID':
        this.closingTransaction.alloGroupID = e.data;
        break;
      case 'alloEntryID':
        this.closingTransaction.alloEntryID = e.data;
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
        this.closingTransaction.status = 1;
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
        if(this.closingTransaction.status == 0)
          this.closingTransaction.status = 1;
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
        this.closingTransaction.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.closingTransaction = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.closingTransaction);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.closingTransaction.alloMethod = null;
    this.closingTransaction.alloGroupID = null;
    this.closingTransaction.alloEntryID = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.closingTransaction);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.closingTransaction[keymodel[i]] == null ||
              String(this.closingTransaction[keymodel[i]]).match(/^ *$/) !== null
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
      this.closingTransaction.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.closingTransaction.fromDate = result;
  }

  setParas(){
    this.Paras.alloMethod = this.closingTransaction.alloMethod;
    this.Paras.alloGroupID = this.closingTransaction.alloGroupID;
    this.Paras.alloEntryID = this.closingTransaction.alloEntryID;
    this.closingTransaction.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}
