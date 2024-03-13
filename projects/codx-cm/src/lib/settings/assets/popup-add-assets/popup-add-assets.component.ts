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
  selector: 'lib-popup-add-assets',
  templateUrl: './popup-add-assets.component.html',
  styleUrls: ['./popup-add-assets.component.css'],
})
export class PopupAddAssetsComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('cbxProjectID') cbxProjectID: CodxInputComponent;
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
    this.changeCbxCustomer();
  }
  ngOnInit(): void {}

  valueChange(e) {
    this.data[e.field] = e.data;
  }

  valueChangeCbx(e) {
    this.data[e.field] = e.data;
    switch (e.field) {
      case 'projectID':
        this.data.siteID = null;
        this.data.refID = null;

        if (!e.data) {
          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxSiteID.crrValue = null;
          this.cbxSiteID.model = null;
          this.form.formGroup.patchValue({ siteID: this.data['siteID'] });

          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxRefID.crrValue = null;

          this.changeCbxCustomer();
        } else if (this.data.projectID != this.parentID) {
          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxSiteID.crrValue = null;
          this.cbxSiteID.model = {
            ParentID: this.data.projectID,
          };

          this.form.formGroup.patchValue({ siteID: this.data['siteID'] });

          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxRefID.crrValue = null;

          this.changeCbxCustomer();
        }
        this.parentID = this.data.projectID;
        break;
      case 'siteID':
        if (!e.data) {
          // this.parentID = null;
          // (
          //   this.cbxprojectID.ComponentCurrent as CodxComboboxComponent
          // ).dataService.data = [];
          // this.cbxprojectID.crrValue = this.parentID;

          // this.cbxprojectID.model = null;
          // this.form.formGroup.patchValue({ projectID: this.data['projectID'] });
          // (
          //   this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          // ).dataService.data = [];
          // this.cbxRefID.crrValue = null;

          this.changeCbxCustomer();
        } else if (
          e?.component?.itemsSelected[0]?.ParentID != this.data.projectID
        ) {
          this.data.projectID = e?.component?.itemsSelected[0]?.ParentID;
          this.data.refID = null;
          this.parentID = this.data.projectID;
          (
            this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxProjectID.crrValue = this.parentID;

          this.cbxProjectID.model = {
            AssetID: this.data.projectID,
          };
          this.form.formGroup.patchValue({ projectID: this.data['projectID'] });
        }

        if (this.siteIDOldData != this.data.siteID) {
          this.siteIDOldData = this.data.siteID;
          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxRefID.crrValue = null;

          this.changeCbxCustomer();
        }
        break;
      case 'refID':
        if (!e.data) {
          return;
        }
        this.getListLocation();
        break;
    }

    // this.form.formGroup.patchValue(this.data);
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
        this.data.projectID, //CMBuilding
      ])
      .subscribe((res) => {
        if (res) {
          //dùng kiểu này ko ra
          // let predicate = '@0.Contains(RecID)';
          // let dataValue = '[' + res.join(';') + ']';
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
          this.notiService.notify(
            'Không tìm thấy dữ liệu ! Vui lòng kiểm tra lại !',
            '2'
          );
          this.cbxRefID.ComponentCurrent.dataService.data = [];
          this.cbxRefID.crrValue = null;
          this.data.refID = null;
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
          this.notiService.notify(
            'Không tìm thấy dữ liệu ! Vui lòng kiểm tra lại !',
            '2'
          );
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
