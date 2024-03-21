import {
  AfterViewInit,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  RequestOption,
  Util,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-water-clock',
  templateUrl: './popup-add-water-clock.component.html',
  styleUrls: ['./popup-add-water-clock.component.css'],
})
export class PopupAddWaterClockComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('cbxParentID') cbxParentID: CodxInputComponent;
  @ViewChild('cbxRefID') cbxRefID: CodxInputComponent;
  @ViewChild('cbxSiteID') cbxSiteID: CodxInputComponent;

  dialog: any;
  gridViewSetup: any;

  action: string = '';
  headerText: string = '';
  valueList: string = '';
  objectStatus: string = '';
  planceHolderAutoNumber: string = '';
  disabledShowInput = false;
  valueListStatus: any[] = [];
  data: any;
  arrFieldForm: any[];
  validate = 0;
  viewOnly = true;
  parentID: any;
  oldAssetId: any;
  siteIDOldData: any;
  loadedCus: boolean = false;

  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    private codxCmService: CodxCmService,
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected));
    this.headerText = dt?.data?.headerText;
    this.action = dt?.data?.action;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.viewOnly = this.action == 'view';
    let arrField = Object.values(this.gridViewSetup).filter(
      (x: any) => x.allowPopup
    );
    if (this.action === 'edit') {
      this.oldAssetId = this.data.assetID;
      this.loadedCus = true
    }
    if (Array.isArray(arrField)) {
      this.arrFieldForm = arrField
        .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
        .map((x: any) => Util.camelize(x.fieldName));
    }
    this.parentID = this.data.assetID;
    this.getAutoNumber();
  }

  getAutoNumber() {
    this.codxCmService
      .getFieldAutoNoDefault(
        this.dialog?.formModel?.funcID,
        this.dialog?.formModel?.entityName
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.disabledShowInput = true;
          this.cache.message('AD019').subscribe((mes) => {
            if (mes)
              this.planceHolderAutoNumber = mes?.customName || mes?.description;
          });
        } else {
          this.disabledShowInput = false;
        }
      });
  }
  ngAfterViewInit(): void {
    // if (this.action != 'view')
    this.changeCbxCustomer();
  }
  ngOnInit(): void { }

  valueChange(e) {
    this.data[e.field] = e.data;
    switch (e.field) {
      case 'cumulatedDepr': //Q cap
      case 'purcAmount': //Don giá q cấp
        if (this.data['cumulatedDepr'] && this.data['purcAmount']) {
          this.data['costAmt'] =
            this.data['cumulatedDepr'] * this.data['purcAmount'];
        } else this.data['costAmt'] = 0;
        this.form.formGroup.patchValue({
          costAmt: this.data['costAmt'],
        });
        break;
      case 'estimatedCapacity': //Q xa
      case 'capacityUsed': //Don giá q xa
        if (this.data['estimatedCapacity'] && this.data['capacityUsed']) {
          this.data['capacityPrice'] =
            this.data['estimatedCapacity'] * this.data['capacityUsed'];
        } else this.data['capacityPrice'] = 0;
        this.form.formGroup.patchValue({
          capacityPrice: this.data['capacityPrice'],
        });
        break;
    }
  }

  valueChangeCbx(e) {
    this.data[e.field] = e.data;
    switch (e.field) {
      case 'parentID':
        if (this.gridViewSetup.formName == 'CMWaterClockCustomer') return; //
        //danh cho chi so đông ho
        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];

        if (!e.data) {
          this.data.siteID = null;
          this.data.refID = null;
        } else {
          if (this.parentID == e.data) return;
          this.data.siteID = e?.component?.itemsSelected[0]?.SiteID;
          this.data.refID = e?.component?.itemsSelected[0]?.RefID;

          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = e.data ? 'AssetID=@0' : '';
          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = e.data ? `${this.data.siteID}` : '';
        }
        this.cbxSiteID.crrValue = this.data.siteID;
        this.cbxRefID.crrValue = this.data.refID;

        this.form.formGroup.patchValue({ siteID: this.data['siteID'] });
        this.form.formGroup.patchValue({
          refID: this.data['refID'],
        });
        this.changeCbxCustomer();
        this.parentID = this.data.parentID;
        break;

      case 'siteID':
        this.data.parentID = null;
        this.cbxParentID.crrValue = null;
        let predicate = '';
        let dataValue = '';
        if (e.data) { predicate = 'SiteID=@0'; dataValue = `${this.data.siteID}` };

        if (this.data.refID) {
          if (predicate)
            predicate += 'and RefID=@1'; dataValue += `${this.data.siteID}` + ";" + `${this.data.refID}`
        } else {
          predicate = 'RefID=@0'; dataValue = `${this.data.refID}`
        };


        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.predicates = predicate;
        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.dataValues = dataValue;

        this.form.formGroup.patchValue({ siteID: this.data['parentID'] });


        if (this.loadedCus) return;
        this.data.refID = null;
        //ref
        (
          this.cbxRefID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.cbxRefID.crrValue = null;

        this.changeCbxCustomer();
        break;

      case 'refID':
        if (!e.data) {
          return;
        }
        this.getListLocation();
        break;
    }
  }

  beforeSave(op: RequestOption) {
    op.service = 'AM';
    op.assemblyName = 'ERM.Business.AM';
    op.className = 'AssetsBusiness';
    let data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'SaveAsync';
      data = [this.data];
    } else if (this.action == 'edit') {
      op.methodName = 'UpdateAsync';
      data = [this.data, this.oldAssetId];
    }
    op.data = data;
    return true;
  }

  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res && res.save) {
          (this.dialog.dataService as CRUDService).update(res.save).subscribe();

          this.dialog.close(res.save);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res && res?.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
        }
      });
  }

  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.data);
    let dontCheckField = this.disabledShowInput ? 'businessLineID' : '';
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (
            keygrid[index].toLowerCase() == keymodel[i].toLowerCase() &&
            this.arrFieldForm.includes(keymodel[i]) &&
            dontCheckField != keymodel[i]
          ) {
            if (
              this.data[keymodel[i]] == null ||
              String(this.data[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notiService.notifyCode(
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

  changeCbxCustomer() {
    this.api
      .exec<any>('CM', 'ContractsBusiness', 'GetCbxCustomerContractAsync', [
        this.data.siteID, //CMoffices
        null,
      ])
      .subscribe((res) => {
        if (res) {
          let predicate = '';
          let dataValue = '';

          res.forEach((x, i) => {
            predicate += 'RecID=@' + i + ' or ';
            dataValue += x + ';';
          });
          predicate = predicate.substring(0, predicate.length - 4); //'' or ''
          dataValue = dataValue.substring(0, dataValue.length - 1);

          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = predicate;
          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = dataValue;
          // this.form.formGroup.patchValue(this.data);
        } else {
          this.notiService.notifyCode(
            'CM064',
            0,
            '"' + this.gridViewSetup['RefID'].headerText + '"'
          );
          if (this.loadedCus) {
            this.cbxRefID.ComponentCurrent.dataService.data = [];
            this.cbxRefID.crrValue = null;
            this.data.refID = null;
          }

          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = 'RecID=@0';
          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = '00000000-0000-0000-0000-000000000000'; // dữ liệu ko có
          this.loadedCus = false;
        }
        this.form.formGroup.patchValue({
          refID: this.data['refID'],
        });
      });
  }
  //=== Select nguoi===//
  getListLocation() {
    this.api
      .exec<any>('CM', 'ContractsBusiness', 'GetListAssetByCustomerIDAsync', [
        this.data.refID, //CMCustomer
      ])
      .subscribe((res) => {
        if (res) {
          let predicate = '';
          let dataValue = '';
          this.loadedCus = true
          res.forEach((x, i) => {
            predicate += 'AssetID=@' + i + ' or ';
            dataValue += x + ';';
          });
          predicate = predicate.substring(0, predicate.length - 4); //'' or ''
          dataValue = dataValue.substring(0, dataValue.length - 1);

          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = predicate;
          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = dataValue;
        } else {
          this.notiService.notifyCode(
            'CM064',
            0,
            '"' + this.gridViewSetup['siteID'].headerText + '"'
          );
          this.loadedCus = false
        }

        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.cbxSiteID.crrValue = null;

        this.form.formGroup.patchValue({
          siteID: this.data['siteID'],
        });
      });
  }
}
