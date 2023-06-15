import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { RunPeriodic } from '../../../models/RunPeriodic.model';
import { Paras } from '../../../models/Paras.model';
import { DepreciatingFixedAssets } from '../../../models/DepreciatingFixedAssets.model';

@Component({
  selector: 'lib-pop-add-depreciating-fixed-assets',
  templateUrl: './pop-add-depreciating-fixed-assets.component.html',
  styleUrls: ['./pop-add-depreciating-fixed-assets.component.css']
})
export class PopAddDepreciatingFixedAssetsComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('assetID') assetID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  depreciatingFixedAsset: DepreciatingFixedAssets;
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
    this.depreciatingFixedAsset = dialog.dataService!.dataSelected;
    if(this.depreciatingFixedAsset.paras != null)
    {
      this.Paras = JSON.parse(this.depreciatingFixedAsset.paras);
      this.depreciatingFixedAsset.deprModelID = this.Paras.deprModelID;
      this.depreciatingFixedAsset.assetGroupID = this.Paras.assetGroupID;
      this.depreciatingFixedAsset.assetID = this.Paras.assetID;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('DepreciatingFixedAssets', 'grvDepreciatingFixedAssets')
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
    this.setFromDateToDate(this.depreciatingFixedAsset.runDate);
    this.form.formGroup.patchValue(this.depreciatingFixedAsset);
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
        this.depreciatingFixedAsset.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.depreciatingFixedAsset.memo = e.data;
        break;
      case 'deprModelID':
        this.depreciatingFixedAsset.deprModelID = e.data;
        break;
      case 'assetGroupID':
        this.depreciatingFixedAsset.assetGroupID = e.data;
        if(this.assetID)
        {
          (this.assetID.ComponentCurrent as CodxComboboxComponent).model.assetGroupID = this.depreciatingFixedAsset.assetGroupID;
          (this.assetID.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
          this.assetID.crrValue = null;
          this.depreciatingFixedAsset.assetID = null;
          this.form.formGroup.patchValue(this.depreciatingFixedAsset);
        }
        break;
      case 'assetID':
        this.depreciatingFixedAsset.assetID = e.data;
        break;
    }
  }

  onSave(){
    this.checkdepreciatingFixedAssetValidate();
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.depreciatingFixedAsset.status = 1;
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
        if(this.depreciatingFixedAsset.status == 0)
          this.depreciatingFixedAsset.status = 1;
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
    this.checkdepreciatingFixedAssetValidate();
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.depreciatingFixedAsset.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.depreciatingFixedAsset = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.depreciatingFixedAsset);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.depreciatingFixedAsset.deprModelID = null;
    this.depreciatingFixedAsset.assetGroupID = null;
    this.depreciatingFixedAsset.assetID = null;
  }

  checkdepreciatingFixedAssetValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.depreciatingFixedAsset);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.depreciatingFixedAsset[keymodel[i]] == null ||
              String(this.depreciatingFixedAsset[keymodel[i]]).match(/^ *$/) !== null
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
      this.depreciatingFixedAsset.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.depreciatingFixedAsset.fromDate = result;
  }

  setParas(){
    this.Paras.deprModelID = this.depreciatingFixedAsset.deprModelID;
    this.Paras.assetGroupID = this.depreciatingFixedAsset.assetGroupID;
    this.Paras.assetID = this.depreciatingFixedAsset.assetID;
    this.depreciatingFixedAsset.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}

