import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxFormComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
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
    this.form.formGroup.patchValue(this.Paras);
    this.setFromDateToDate(this.runPeriodic.runDate);
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
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.runPeriodic.status = 1;
        this.runPeriodic.paras = JSON.stringify(this.Paras);
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'RunPeriodicBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.runPeriodic];
            return true;
          })
          .subscribe((res) => {
            if (res && res.save != null) {
              this.dialog.close(res.save);
              this.dt.detectChanges();
            }
          });
      }
      if (this.formType == 'edit') {
        if(this.runPeriodic.status == 0)
          this.runPeriodic.status = 1;
        this.runPeriodic.paras = JSON.stringify(this.Paras);
        this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'UpdateAsync';
          opt.className = 'RunPeriodicBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [this.runPeriodic];
          return true;
        })
        .subscribe((res) => {
          if (res.update) {
            this.dialog.close(res.update);
            this.dt.detectChanges();
          }
        });
      }
    }
  }

  onSaveAdd(){

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

  setFromDateToDate(runDate: any)
  {
      this.runPeriodic.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.runPeriodic.fromDate = result;
  }
  //endRegion Function
}
