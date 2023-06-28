import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Paras } from '../../../models/Paras.model';
import { CalculatingCostOfProduct } from '../../../models/CalculatingCostOfProduct.model';

@Component({
  selector: 'lib-pop-add-calculating-cost-of-product',
  templateUrl: './pop-add-calculating-cost-of-product.component.html',
  styleUrls: ['./pop-add-calculating-cost-of-product.component.css']
})
export class PopAddCalculatingCostOfProductComponent extends UIComponent implements OnInit{

  //region Constructor

  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemID') itemID: CodxInputComponent;
  headerText: any;
  formType: any;

  dialog!: DialogRef;
  authStore: AuthStore;
  calculatingCostOfProduct: CalculatingCostOfProduct;
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
    this.calculatingCostOfProduct = dialog.dataService!.dataSelected;
    if(this.calculatingCostOfProduct.paras != null)
    {
      this.Paras = JSON.parse(this.calculatingCostOfProduct.paras);
      this.calculatingCostOfProduct.postLG = this.Paras.postLG;
      this.calculatingCostOfProduct.costingGroupID = this.Paras.costingGroupID;
    }
    this.formType = dialogData.data?.formType;
    this.cache
      .gridViewSetup('CalculatingCostOfProduct', 'grvCalculatingCostOfProduct')
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
    this.setFromDateToDate(this.calculatingCostOfProduct.runDate);
    this.form.formGroup.patchValue(this.calculatingCostOfProduct);
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
        this.calculatingCostOfProduct.runDate = e.data;
        this.setFromDateToDate(e.data);
        break;
      case 'memo':
        this.calculatingCostOfProduct.memo = e.data;
        break;
      case 'postLG':
        this.calculatingCostOfProduct.postLG = e.data;
        break;
      case 'costingGroupID':
        this.calculatingCostOfProduct.costingGroupID = e.data;
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
        this.calculatingCostOfProduct.status = 1;
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
        if(this.calculatingCostOfProduct.status == 0)
          this.calculatingCostOfProduct.status = 1;
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
        this.calculatingCostOfProduct.status = 1;
        this.setParas();
        this.dialog.dataService
          .save(null, 0, '', 'SYS006', true)
          .subscribe((res) => {
            if (res.save) {
              this.dialog.dataService.addNew().subscribe((res) => {
                this.calculatingCostOfProduct = this.dialog.dataService!.dataSelected;
                this.onClearParas();
                this.form.formGroup.patchValue(this.calculatingCostOfProduct);
              });
            }
          });
      }
    }
  }

  onClearParas(){
    this.Paras = new Paras();
    this.calculatingCostOfProduct.postLG = false;
    this.calculatingCostOfProduct.costingGroupID = null;
  }

  checkUpdateTheLedgerValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.calculatingCostOfProduct);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.calculatingCostOfProduct[keymodel[i]] == null ||
              String(this.calculatingCostOfProduct[keymodel[i]]).match(/^ *$/) !== null
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
      this.calculatingCostOfProduct.toDate = runDate;
      let result = new Date(runDate);
      result.setDate(1);
      this.calculatingCostOfProduct.fromDate = result;
  }

  setParas(){
    this.Paras.postLG = this.calculatingCostOfProduct.postLG;
    this.Paras.costingGroupID = this.calculatingCostOfProduct.costingGroupID;
    this.calculatingCostOfProduct.paras = JSON.stringify(this.Paras);
  }
  //endRegion Function
}
