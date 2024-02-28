import { firstValueFrom } from 'rxjs';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogRef,
  DialogData,
  CacheService,
  NotificationsService,
  DataRequest,
  ApiHttpService,
  AlertConfirmInputConfig,
  CodxFormComponent,
} from 'codx-core';
import { BS_AddressBook } from '../../../../models/cm_model';
import { CodxCmService } from '../../../../codx-cm.service';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-popup-address',
  templateUrl: './popup-address.component.html',
  styleUrls: ['./popup-address.component.css'],
})
export class PopupAddressComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;

  dialog: any;
  data = new BS_AddressBook();
  gridViewSetup: any;
  title = '';
  nameCountry: any;
  nameProvince: any;
  nameDistrict: any;
  nameWard: any;
  action = '';
  model: any;
  modelDistrictID: any;
  modelWardID: any;
  isDisable = false;
  isDefault = false;
  count = 0;
  type = '';
  objectID = '';
  objectType = '';
  objectName = '';
  lstAddress = [];
  checkAddressName = false;
  checkSetName = false;
  leverSetting: number;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private cmSv: CodxCmService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.action = dt?.data?.action;
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    if (this.action == 'edit') {
      this.data = JSON.parse(JSON.stringify(dt?.data?.data));
      this.isDefault = this.data?.isDefault;
    } else {
      if (dt?.data?.objectType == 'CM_Customers') {
        this.data.adressType = '6';
      } else {
        this.data.adressType = '5';
      }
    }
    this.type = dt?.data?.type;
    this.objectID = dt?.data?.objectID;
    this.objectType = dt?.data?.objectType;
    this.objectName = dt?.data?.objectName;
    this.lstAddress = dt?.data?.listAddress;
  }

  ngAfterViewInit(): void {
    if (this.form && this.form?.formGroup) {
      this.form.formGroup.patchValue({
        countryID: this.data?.countryID,
        provinceID: this.data?.provinceID,
        districtID: this.data?.districtID,
        wardID: this.data?.wardID,
      });
    }
    if (this.action == 'edit') {
      this.setNameAdress();
      this.checkAddressName = !!this.data.address;
    }
    this.detectorRef.checkNoChanges();
  }

  async ngOnInit() {
    if (this.action == 'add') {
      if (this.lstAddress != null && this.lstAddress.length > 0) {
        if (this.lstAddress.some((x) => x.isDefault == true)) {
          this.isDefault = false;
        } else {
          this.isDefault = true;
        }
      } else {
        this.isDefault = true;
      }
      this.data.recID = Guid.newGuid();
    }

    var param = await firstValueFrom(
      this.cache.viewSettingValues('CMParameters')
    );
    let lever = 0;
    if (param?.length > 0) {
      let dataParam = param.filter((x) => x.category == '1' && !x.transType)[0];
      let paramDefault = JSON.parse(dataParam.dataValue);
      lever = paramDefault['ControlInputAddress'] ?? 0;
    }
    this.leverSetting = lever;
  }

  async setNameAdress() {
    this.setCountry();
    this.setProvince();
    this.setDistrict();

    // if(this.data.countryID != null && this.data.countryID.trim() != ''){
    //   this.api.execSv<any>('BS','ERM.Business.BS','CountriesBusiness','GetAsync',this.data.countryID).subscribe(res =>{
    //     this.nameCountry = res;
    //   })
    // }
  }

  async setCountry(){
    if (this.data.countryID != null && this.data.countryID.trim() != '') {
      let country = await firstValueFrom(
        this.api.execSv<any>(
          'BS',
          'ERM.Business.BS',
          'CountriesBusiness',
          'GetAsync',
          this.data?.countryID
        )
      );

      this.nameCountry = country?.countryName;
    }
  }

  async setProvince(){
    if (this.data.provinceID != null && this.data.provinceID.trim() != '') {
      let province = await firstValueFrom(
        this.api.execSv<any>(
          'BS',
          'ERM.Business.BS',
          'ProvincesBusiness',
          'GetAsync',
          this.data?.provinceID
        )
      );

      this.nameProvince = province?.name;
    }
  }

  async setDistrict(){
    if (this.data.districtID != null && this.data.districtID.trim() != '') {
      var district = await firstValueFrom(
        this.api.execSv<any>(
          'BS',
          'ERM.Business.BS',
          'DistrictsBusiness',
          'GetAsync',
          this.data?.districtID
        )
      );

      this.nameDistrict = district?.districtName;
    }
  }

  onSave() {
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if (this.count > 0) return;
    if (
      !this.cmSv.checkValidateSetting(
        this.data.address,
        this.data,
        this.leverSetting,
        this.gridViewSetup,
        this.gridViewSetup?.Address?.headerText
      )
    ) {
      return;
    }

    if (this.lstAddress != null && this.lstAddress.length > 0) {
      var checkCoincide = this.lstAddress.some(
        (x) =>
          x.recID != this.data.recID &&
          x.address == this.data.address &&
          x.adressType == this.data.adressType &&
          x.countryID == this.data.countryID &&
          x.provinceID == this.data.provinceID &&
          x.districtID == this.data.districtID &&
          x.regionID == x.regionID
      );
      if (!checkCoincide) {
        if (
          this.lstAddress.some((x) => x.isDefault && x.recID != this.data.recID)
        ) {
          if (this.isDefault) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event && x.event?.status) {
                if (x.event.status == 'Y') {
                  this.onSaveHanle();
                } else {
                  this.isDefault = false;
                  this.onSaveHanle();
                }
              }
            });
          } else {
            this.onSaveHanle();
          }
        } else {
          this.onSaveHanle();
        }
      } else {
        this.dialog.close();
      }
    } else {
      this.onSaveHanle();
    }
  }

  async onSaveHanle() {
    this.data.isDefault = this.isDefault;
    this.data.objectID = this.objectID;
    this.data.objectType = this.objectType;
    this.data.objectName = this.objectName;
    if (this.type == 'formAdd') {
      this.dialog.close(this.data);
    } else {
      if (this.action == 'add') {
        this.cmSv.addOneAddress(this.data).subscribe((res) => {
          if (res) {
            this.dialog.close(res);
            this.notiService.notifyCode('SYS006');
          } else {
            this.dialog.close();
            this.notiService.notifyCode('SYS023');
          }
        });
      } else {
        this.cmSv.updateOneAddress(this.data).subscribe((res) => {
          if (res) {
            this.dialog.close(res);
            this.notiService.notifyCode('SYS007');
          } else {
            this.dialog.close();
            this.notiService.notifyCode('SYS021');
          }
        });
      }
    }
  }

  clickRefesh() {
    this.setAdressName();
  }
  setAdressName() {
    if (
      this.nameWard == null &&
      this.nameDistrict == null &&
      this.nameProvince == null &&
      this.nameCountry == null
    ) {
      this.data.address = null;
    } else {
      var ward =
        this.nameWard != null && this.nameWard.trim()
          ? ' ' + this.nameWard + ','
          : '';
      var district =
        this.nameDistrict != null && this.nameDistrict.trim()
          ? ' ' + this.nameDistrict + ','
          : '';
      var province =
        this.nameProvince != null && this.nameProvince.trim()
          ? ' ' + this.nameProvince + ','
          : '';
      var country =
        this.nameCountry != null && this.nameCountry.trim()
          ? ' ' + this.nameCountry
          : '';
      var address = ward + district + province + country;
      if (address != null && address.trim() != '') {
        if (address.endsWith(',')) {
          address = address.slice(0, -1);
        }
        this.data.address = address;
      }
    }
  }

  valueIsDefault(e) {
    this.isDefault = e.data;
  }
  async valueChange(e) {
    this.data[e.field] = e?.data?.trim();
    if (e.data) {
      switch (e.field) {
        case 'address':
          // this.checkEventListen();

          this.checkAddressName = !!this.data.address;
          break;
        case 'countryID':
          this.model = { CountryID: JSON.parse(JSON.stringify(e?.data)) };
          this.nameCountry =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.CountryName
              : null;
          break;
        case 'provinceID':
          this.modelDistrictID = {
            ProvinceID: JSON.parse(JSON.stringify(e?.data)),
          };
          this.nameProvince =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.ProvinceName
              : null;
          break;
        case 'districtID':
          this.modelWardID = {
            DistrictID: JSON.parse(JSON.stringify(e?.data)),
          };
          this.nameDistrict =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.DistrictName
              : null;
          break;
        case 'wardID':
          this.nameWard =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.WardName
              : null;
          break;
      }
      if (!this.checkAddressName) {
        this.setAdressName();
      }
    }
    this.detectorRef.detectChanges();
  }

  async checkAdressName() {
    this.checkAddressName = !!this.data.address;

    let json = await firstValueFrom(
      this.api.execSv<any>(
        'BS',
        'ERM.Business.BS',
        'ProvincesBusiness',
        'GetLocationAsync',
        [this.data.address, this.leverSetting]
      )
    );
    if (json != null && json.trim() != '' && json != 'null') {
      let lstDis = JSON.parse(json);
      if (this.data.provinceID != lstDis?.ProvinceID){
        this.data.provinceID = lstDis?.ProvinceID ?? null;
        this.setProvince();
      }
      if (this.data.districtID != lstDis?.DistrictID){
        this.data.districtID = lstDis?.DistrictID ?? null;
        this.setDistrict();
      }
      if (this.data.wardID != lstDis?.WardID)
        this.data.wardID = lstDis?.WardID ?? null;
      this.data.countryID = lstDis?.CountryID ?? null;
      this.setCountry();
    } else {
      this.data.provinceID = null;
      this.data.districtID = null;
      this.data.wardID = null;
      this.data.countryID = null;
    }

    if (this.data?.countryID == null || this.data?.countryID?.trim() == '') {
      if (this.data.provinceID) {
        let province = await firstValueFrom(
          this.api.execSv<any>(
            'BS',
            'ERM.Business.BS',
            'ProvincesBusiness',
            'GetOneProvinceAsync',
            [this.data.provinceID]
          )
        );
        this.data.countryID = province?.countryID;
        this.setCountry();
      }
    }

    this.form.formGroup.patchValue({
      countryID: this.data?.countryID,
      provinceID: this.data?.provinceID,
      districtID: this.data?.districtID,
      wardID: this.data?.wardID,
    });

    // this.cmSv.checkValidateSetting(this.data, this.leverSetting, this.gridViewSetup);
    this.detectorRef.detectChanges();
  }

  checkEventListen() {
    var inputField = document.getElementById('inputAddress');

    // Bắt sự kiện gõ phím
    inputField.addEventListener('keypress', (event) => {
      var keyCode = event.keyCode;

      // Xử lý logic tại đây
      console.log('Phím đã được gõ: ' + String.fromCharCode(keyCode));
    });
  }
}
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
