import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Paras } from '../../../models/Paras.model';
import { ClosingData } from '../../../models/ClosingData.model';

@Component({
  selector: 'lib-pop-add-closing-data',
  templateUrl: './pop-add-closing-data.component.html',
  styleUrls: ['./pop-add-closing-data.component.css']
})
export class PopAddClosingDataComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  closingData: ClosingData;
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
    this.closingData = dialog.dataService!.dataSelected;
    if(this.closingData.paras != null)
    {
      this.Paras = JSON.parse(this.closingData.paras);
      this.closingData.accountType = this.Paras.accountType;
      this.closingData.journalNo = this.Paras.journalNo;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('ClosingData', 'grvClosingData')
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
    this.setFromDateToDate(this.closingData.runDate);
    this.form.formGroup.patchValue(this.closingData);
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
        this.closingData.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.closingData.memo = e.data;
        break;
      case 'accountType':
        this.closingData.accountType = e.data;
        break;
      case 'voucherNo':
        this.closingData.journalNo = e.data;
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
        this.closingData.status = 1;
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
        if(this.closingData.status == 0)
          this.closingData.status = 1;
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
        this.closingData.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.closingData = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.closingData);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.closingData.accountType = null;
    this.closingData.journalNo = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.closingData);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.closingData[keymodel[i]] == null ||
              String(this.closingData[keymodel[i]]).match(/^ *$/) !== null
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
      this.closingData.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.closingData.fromDate = result;
  }

  setParas(){
    this.Paras.accountType = this.closingData.accountType;
    this.Paras.voucherNo = this.closingData.journalNo;
    this.closingData.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}