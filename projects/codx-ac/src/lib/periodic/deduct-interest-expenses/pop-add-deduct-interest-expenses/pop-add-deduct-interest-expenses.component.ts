import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { DeductInterestExpenses } from '../../../models/DeductInterestExpenses.model';

@Component({
  selector: 'lib-pop-add-deduct-interest-expenses',
  templateUrl: './pop-add-deduct-interest-expenses.component.html',
  styleUrls: ['./pop-add-deduct-interest-expenses.component.css']
})
export class PopAddDeductInterestExpensesComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  deductInterestExpenses: DeductInterestExpenses;
  Paras: any;
  gridViewSetup: any;
  validate: any = 0;
  
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    //this.Paras = new Paras();
    this.headerText = dialogData.data?.headerText;
    this.deductInterestExpenses = dialog.dataService!.dataSelected;
    if(this.deductInterestExpenses.paras != null)
    {
      this.Paras = JSON.parse(this.deductInterestExpenses.paras);
      this.deductInterestExpenses.loanContractID = this.Paras.loanContractID;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('DeductInterestExpenses', 'grvDeductInterestExpenses')
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
    this.setFromDateToDate(this.deductInterestExpenses.runDate);
    this.form.formGroup.patchValue(this.deductInterestExpenses);
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
        this.deductInterestExpenses.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.deductInterestExpenses.memo = e.data;
        break;
      case 'loanContractID':
        this.deductInterestExpenses.loanContractID = e.data;
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
        this.deductInterestExpenses.status = 1;
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
        if(this.deductInterestExpenses.status == 0)
          this.deductInterestExpenses.status = 1;
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
        this.deductInterestExpenses.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.deductInterestExpenses = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.deductInterestExpenses);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    //this.Paras = new Paras();
    this.deductInterestExpenses.loanContractID = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.deductInterestExpenses);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.deductInterestExpenses[keymodel[i]] == null ||
              String(this.deductInterestExpenses[keymodel[i]]).match(/^ *$/) !== null
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
      this.deductInterestExpenses.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.deductInterestExpenses.fromDate = result;
  }

  setParas(){
    this.Paras.calcGroupID = this.deductInterestExpenses.loanContractID;
    this.deductInterestExpenses.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}