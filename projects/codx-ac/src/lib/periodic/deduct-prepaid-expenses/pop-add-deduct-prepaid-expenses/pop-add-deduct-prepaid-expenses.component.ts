import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Paras } from '../../../models/Paras.model';
import { DeductPrepaidExpenses } from '../../../models/DeductPrepaidExpenses.model';

@Component({
  selector: 'lib-pop-add-deduct-prepaid-expenses',
  templateUrl: './pop-add-deduct-prepaid-expenses.component.html',
  styleUrls: ['./pop-add-deduct-prepaid-expenses.component.css']
})
export class PopAddDeductPrepaidExpensesComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  deductPrepaidExpenses: DeductPrepaidExpenses;
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
    this.deductPrepaidExpenses = dialog.dataService!.dataSelected;
    if(this.deductPrepaidExpenses.paras != null)
    {
      this.Paras = JSON.parse(this.deductPrepaidExpenses.paras);
      this.deductPrepaidExpenses.calcGroupID = this.Paras.calcGroupID;
      this.deductPrepaidExpenses.buid = this.Paras.buid;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('DeductPrepaidExpenses', 'grvDeductPrepaidExpenses')
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
    this.setFromDateToDate(this.deductPrepaidExpenses.runDate);
    this.form.formGroup.patchValue(this.deductPrepaidExpenses);
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
        this.deductPrepaidExpenses.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.deductPrepaidExpenses.memo = e.data;
        break;
      case 'calcGroupID':
        this.deductPrepaidExpenses.calcGroupID = e.data;
        break;
      case 'buid':
        this.deductPrepaidExpenses.buid = e.data;
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
        this.deductPrepaidExpenses.status = 1;
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
        if(this.deductPrepaidExpenses.status == 0)
          this.deductPrepaidExpenses.status = 1;
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
        this.deductPrepaidExpenses.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.deductPrepaidExpenses = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.deductPrepaidExpenses);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.deductPrepaidExpenses.calcGroupID = null;
    this.deductPrepaidExpenses.buid = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.deductPrepaidExpenses);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.deductPrepaidExpenses[keymodel[i]] == null ||
              String(this.deductPrepaidExpenses[keymodel[i]]).match(/^ *$/) !== null
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
      this.deductPrepaidExpenses.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.deductPrepaidExpenses.fromDate = result;
  }

  setParas(){
    this.Paras.calcGroupID = this.deductPrepaidExpenses.calcGroupID;
    this.Paras.buid = this.deductPrepaidExpenses.buid;
    this.deductPrepaidExpenses.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}

