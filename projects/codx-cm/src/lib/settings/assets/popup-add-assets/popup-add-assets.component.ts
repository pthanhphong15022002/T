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
  @ViewChild('cbxPlace') cbxPlace: CodxInputComponent;
  @ViewChild('cbxObjectID') cbxObjectID: CodxInputComponent;
  @ViewChild('cbxZone') cbxZone: CodxInputComponent;

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
  zoneOldData: any;

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
      case 'place':
        if (this.data.place != this.parentID) {
          this.data.zone = null;
          this.data.objectID = null;
          this.parentID = this.data.place;
          (
            this.cbxZone.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxZone.crrValue = null;
          this.cbxZone.model = {
            ParentID: this.parentID,
          };
          // (
          //   this.cbxZone.ComponentCurrent as CodxComboboxComponent
          // ).dataService.predicates = 'ParentID=@0';
          // (
          //   this.cbxZone.ComponentCurrent as CodxComboboxComponent
          // ).dataService.dataValues = `${this.parentID}`;

          this.form.formGroup.patchValue({ zone: this.data['zone'] });

          (
            this.cbxObjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxObjectID.crrValue = null;

          this.changeCbxCustomer();
        }
        break;
      case 'zone':
        if (e?.component?.itemsSelected[0]?.ParentID != this.data.place) {
          this.data.place = e?.component?.itemsSelected[0]?.ParentID;
          this.data.objectID = null;
          this.parentID = this.data.place;
          (
            this.cbxPlace.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxPlace.crrValue = this.parentID;

          this.cbxPlace.model = {
            AssetID: this.data.place,
          };
          this.form.formGroup.patchValue({ place: this.data['place'] });
        }

        if (this.zoneOldData != this.data.zone) {
          this.zoneOldData = this.data.zone;
          (
            this.cbxObjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxObjectID.crrValue = null;

          this.changeCbxCustomer();
        }
        break;
      case 'objectID':
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
        this.data.place,
        this.data.zone,
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
            this.cbxObjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = predicate;
          (
            this.cbxObjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = dataValue;
          // this.form.formGroup.patchValue(this.data);
        } else {
          this.notiService.notify(
            'Không tìm thấy khách hàng ! Vui lòng kiểm tra lại thông tin tòa nhà !',
            '2'
          );
          this.cbxObjectID.ComponentCurrent.dataService.data = [];
          this.cbxObjectID.crrValue = null;
          this.data.objectID = null;
        }
        this.form.formGroup.patchValue({ objectID: this.data['objectID'] });
      });
  }
}
