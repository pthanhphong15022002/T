import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { RunPeriodic } from '../../../models/RunPeriodic.model';
import { Paras } from '../../../models/Paras.model';

@Component({
  selector: 'lib-pop-add-run-periodic',
  templateUrl: './pop-add-run-periodic.component.html',
  styleUrls: ['./pop-add-run-periodic.component.css']
})
export class PopAddRunPeriodicComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  runPeriodic: RunPeriodic;
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
    this.runPeriodic = dialog.dataService!.dataSelected;
    if(this.runPeriodic.paras != null)
    {
      this.Paras = JSON.parse(this.runPeriodic.paras);
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('CalculatingTheCostPrice', 'grvCalculatingTheCostPrice')
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
    this.setFromDateToDate(this.runPeriodic.runDate);
    this.form.formGroup.patchValue(this.Paras);
  }

  //#endregion

  //region Event

  close(){
    this.dialog.close();
  }

  //endRegion Event

  //region Function

  valuechange(e){
    switch(e.field)
    {
      case 'runDate':
        this.runPeriodic.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.runPeriodic.memo = e.data;
        break;
      case 'itemGroupID':
        this.Paras.itemGroupID = e.data;
        if(this.itemID)
        {
          (this.itemID.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
          this.itemID.crrValue = null;
          this.Paras.itemID = null;
          this.form.formGroup.patchValue(this.Paras);
        }
        break;
      case 'itemID':
        this.Paras.itemID = e.data;
        break;
      case 'accountID':
        this.Paras.accountID = e.data;
        break;
      case 'warehouseID':
        this.Paras.warehouseID = e.data;
        break;
    }
  }

  onSave(){
    this.checkParasValidate();
    this.checkRunPeriodicValidate();
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.runPeriodic.status = 1;
        this.runPeriodic.paras = JSON.stringify(this.Paras);
        this.dialog.dataService.updateDatas.set(
          this.runPeriodic['_uuid'],
          this.runPeriodic
        );
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res && res.update.data != null) {
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
      if (this.formType == 'edit') {
        if(this.runPeriodic.status == 0)
          this.runPeriodic.status = 1;
        this.runPeriodic.paras = JSON.stringify(this.Paras);
        this.dialog.dataService.updateDatas.set(
          this.runPeriodic['_uuid'],
          this.runPeriodic
        );
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
    this.checkParasValidate();
    this.checkRunPeriodicValidate();
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.runPeriodic.status = 1;
        this.runPeriodic.paras = JSON.stringify(this.Paras);
        this.dialog.dataService.updateDatas.set(
          this.runPeriodic['_uuid'],
          this.runPeriodic
        );
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res && res.update.data != null) {
              this.onClearData();
              this.dialog.dataService.addNew().subscribe((res) => {
                this.form.formGroup.patchValue(res);
                this.form.formGroup.patchValue(this.Paras);
                this.runPeriodic = this.dialog.dataService!.dataSelected;
              });
            }
          });
      }
    }
  }

  onClearData(){
    this.Paras = new Paras();
  }

  checkParasValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.Paras);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.Paras[keymodel[i]] == null ||
              String(this.Paras[keymodel[i]]).match(/^ *$/) !== null
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
  checkRunPeriodicValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.runPeriodic);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.runPeriodic[keymodel[i]] == null ||
              String(this.runPeriodic[keymodel[i]]).match(/^ *$/) !== null
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
      this.runPeriodic.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.runPeriodic.fromDate = result;
  }
  //endRegion Function
}
