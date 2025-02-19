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
    // if (this.action != 'view')
    this.changeCbxCustomer();
  }
  ngOnInit(): void { }

  valueChange(e) {
    this.data[e.field] = e.data;
  }

  valueChangeCbx(e) {
    this.data[e.field] = e.data;
    switch (e.field) {
      case 'projectID':
        if (this.parentID == e.data) return;
        this.data.siteID = null;

        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.cbxSiteID.crrValue = null;
        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.predicates = e.data ? 'ParentID=@0' : '';
        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.dataValues = e.data ? `${this.data.projectID}` : '';

        this.form.formGroup.patchValue({ siteID: this.data['siteID'] });
        if (this.parentID == null && this.data.refID) return;
        this.data.refID = null;
        // //ref
        (
          this.cbxRefID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];
        this.cbxRefID.crrValue = null;
        this.form.formGroup.patchValue({
          refID: this.data['refID'],
        });
        this.changeCbxCustomer();

        this.parentID = this.data.projectID;
        break;
      case 'siteID':
        if (this.siteIDOldData == this.data.siteID) return;

        if (
          e?.component?.itemsSelected[0]?.ParentID != this.data.projectID
        ) {

          this.parentID = this.data.projectID =
            e?.component?.itemsSelected[0]?.ParentID;

          (
            this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxProjectID.crrValue = this.parentID;

          // (
          //   this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          // ).dataService.predicates = e.data ? 'AssetID=@0' : '';
          // (
          //   this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          // ).dataService.dataValues = e.data ? `${this.data.projectID}` : '';
          this.form.formGroup.patchValue({ projectID: this.data['projectID'] });

          if (this.data.refID && !this.siteIDOldData) return;
          //ref

          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cbxRefID.crrValue = null;

          this.changeCbxCustomer();
        }

        this.siteIDOldData = this.data.siteID
        break;
      case 'refID':
        if (!e.data) {
          return;
        };
        if (!this.cbxSiteID.crrValue) {
          (
            this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.form.formGroup.patchValue({
            siteID: this.data['siteID'],
          });
        }
        if (!this.cbxProjectID.crrValue) {
          (
            this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.form.formGroup.patchValue({
            projectID: this.data['projectID'],
          });
        }
        this.getListLocation2()
        // this.getListLocation();
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
        this.data.projectID, //CMBuilding
      ])
      .subscribe((res) => {
        if (res) {
          //dùng kiểu này ko ra
          // let predicate = '@0.Contains(RecID)';
          // let dataValue = '[' + res.join(';') + ']';
          let predicate = '';
          let dataValue = '';
          if (this.data.refID && !res.includes(this.data.refID)) { this.data.refID = null; this.cbxRefID.crrValue = null; }

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

        } else {
          this.data.refID = null;
          this.notiService.notifyCode(
            'CM064',
            0,
            '"' + this.gridViewSetup['RefID'].headerText + '"'
          );
          this.cbxRefID.ComponentCurrent.dataService.data = [];
          this.cbxRefID.crrValue = null;

          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = 'RecID=@0';
          (
            this.cbxRefID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = '00000000-0000-0000-0000-000000000000'; // dữ liệu ko có
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
        if (res && res?.length > 0) {
          let predicate = '';
          let dataValue = '';
          if (this.data.siteID && !res.includes(this.data.siteID)) { this.data.siteID = null; this.cbxSiteID.crrValue = null; }

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
          this.cbxSiteID.crrValue = null;
          this.notiService.notifyCode(
            'CM064',
            0,
            '"' + this.gridViewSetup['SiteID']?.headerText + '"'
          );
        }

        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];


        this.form.formGroup.patchValue({
          siteID: this.data['siteID'],
        });
      });
  }

  getListLocation2() {
    this.api
      .exec<any>('CM', 'ContractsBusiness', 'GetObjectAssetByCustomerIDAsync', [
        this.data.refID, //CMCustomer
      ])
      .subscribe((res) => {
        if (res && res?.length > 0) {
          let objectOff = res[0];
          let predicate = '';
          let dataValue = '';
          if (this.data.siteID && !objectOff.includes(this.data.siteID)) { this.data.siteID = null; this.cbxSiteID.crrValue = null; }
          objectOff.forEach((x, i) => {
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

          //projectID
          let objectBuild = res[1];
          let predicateP = '';
          let dataValueP = '';

          objectBuild.forEach((x, i) => {
            predicateP += 'AssetID=@' + i + ' or ';
            dataValueP += x + ';';
          });
          predicateP = predicateP.substring(0, predicateP.length - 4); //'' or ''
          dataValueP = dataValueP.substring(0, dataValueP.length - 1);

          if (this.data.projectID && !objectBuild.includes(this.data.siteID)) { this.data.projectID = null; this.cbxProjectID.crrValue = null; }
          (
            this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.predicates = predicateP;
          (
            this.cbxProjectID.ComponentCurrent as CodxComboboxComponent
          ).dataService.dataValues = dataValueP;


        } else {
          this.cbxSiteID.crrValue = null;
          this.notiService.notifyCode(
            'CM064',
            0,
            '"' + this.gridViewSetup['SiteID']?.headerText + '"'
          );
        }

        (
          this.cbxSiteID.ComponentCurrent as CodxComboboxComponent
        ).dataService.data = [];

        this.form.formGroup.patchValue({
          projectID: this.data['projectID'],
        });
        this.form.formGroup.patchValue({
          siteID: this.data['siteID'],
        });
      });
  }
}
