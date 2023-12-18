import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { UpdateTheLedger } from '../../../models/UpdateTheLedger.model';
import { AllocateTools } from '../../../models/AllocateTools.model';

@Component({
  selector: 'lib-pop-add-allocate-tools',
  templateUrl: './pop-add-allocate-tools.component.html',
  styleUrls: ['./pop-add-allocate-tools.component.css']
})
export class PopAddAllocateToolsComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  allocateTools: AllocateTools;
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
    this.allocateTools = dialog.dataService!.dataSelected;
    if(this.allocateTools.paras != null)
    {
      this.Paras = JSON.parse(this.allocateTools.paras);
      this.allocateTools.calcGroupID = this.Paras.calcGroupID;
      this.allocateTools.buid = this.Paras.buid;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('AllocatingTools', 'grvAllocatingTools')
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
    this.setFromDateToDate(this.allocateTools.runDate);
    this.form.formGroup.patchValue(this.allocateTools);
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
        this.allocateTools.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.allocateTools.memo = e.data;
        break;
      case 'calcGroupID':
        this.allocateTools.calcGroupID = e.data;
        break;
      case 'buid':
        this.allocateTools.buid = e.data;
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
        this.allocateTools.status = 1;
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
        if(this.allocateTools.status == 0)
          this.allocateTools.status = 1;
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
        this.allocateTools.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.allocateTools = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.allocateTools);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    //this.Paras = new Paras();
    this.allocateTools.calcGroupID = null;
    this.allocateTools.buid = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.allocateTools);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.allocateTools[keymodel[i]] == null ||
              String(this.allocateTools[keymodel[i]]).match(/^ *$/) !== null
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
      this.allocateTools.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.allocateTools.fromDate = result;
  }

  setParas(){
    this.Paras.calcGroupID = this.allocateTools.calcGroupID;
    this.Paras.buid = this.allocateTools.buid;
    this.allocateTools.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}

