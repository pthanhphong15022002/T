import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogRef,
  DialogData,
  CacheService,
  NotificationsService,
  DataRequest,
  ApiHttpService,
  AlertConfirmInputConfig,
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
  lstAddress = [];
  checkAddressName = false;
  checkSetName = false;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private cmSv: CodxCmService,
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
      if (this.dialog.formModel?.funcID == 'CM0101') {
        this.data.adressType = '6';
      } else {
        this.data.adressType = '5';
      }
    }
    this.type = dt?.data?.type;
    this.objectID = dt?.data?.objectID;
    this.objectType = dt?.data?.objectType;
    this.lstAddress = dt?.data?.listAddress;
  }

  ngOnInit(): void {
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
    if (this.action == 'edit'){
      this.setNameAdress();
      this.checkAddressName = !!this.data.adressName;
    }
  }

  setNameAdress() {
    if (this.data.countryID != null && this.data.countryID.trim() != '') {
      this.api
        .execSv<any>(
          'BS',
          'ERM.Business.BS',
          'CountriesBusiness',
          'GetAsync',
          this.data?.countryID
        )
        .subscribe((res) => {
          if (res) {
            this.nameCountry = res?.countryName;
          }
        });
    }
    if (this.data.provinceID != null && this.data.provinceID.trim() != '') {
      this.api
        .execSv<any>(
          'BS',
          'ERM.Business.BS',
          'ProvincesBusiness',
          'GetAsync',
          this.data?.provinceID
        )
        .subscribe((res) => {
          if (res) {
            this.nameProvince = res?.name;
          }
        });
    }
    if (this.data.districtID != null && this.data.districtID.trim() != '') {
      this.api
        .execSv<any>(
          'BS',
          'ERM.Business.BS',
          'DistrictsBusiness',
          'GetAsync',
          this.data?.districtID
        )
        .subscribe((res) => {
          if (res) {
            this.nameDistrict = res?.districtName;
          }
        });
    }
    // if(this.data.countryID != null && this.data.countryID.trim() != ''){
    //   this.api.execSv<any>('BS','ERM.Business.BS','CountriesBusiness','GetAsync',this.data.countryID).subscribe(res =>{
    //     this.nameCountry = res;
    //   })
    // }
  }

  onSave() {
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if (this.count > 0) return;

    if (this.lstAddress != null && this.lstAddress.length > 0) {
      var checkCoincide = this.lstAddress.some(
        (x) =>
          x.recID != this.data.recID &&
          x.adressName == this.data.adressName &&
          x.adressType == this.data.adressType &&
          x.street == this.data.street &&
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
              if (x.event.status == 'Y') {
                this.onSaveHanle();
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

  onSaveHanle() {
    this.data.isDefault = this.isDefault;
    if (this.type == 'formAdd') {
      this.dialog.close(this.data);
    } else {
      if (this.action == 'add') {
        this.data.objectID = this.objectID;
        this.data.objectType = this.objectType;
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
      this.data?.street == null &&
      this.nameWard == null &&
      this.nameDistrict == null &&
      this.nameProvince == null &&
      this.nameCountry == null
    ) {
      this.data.adressName = null;
    } else {
      var street =
        this.data?.street != null && this.data?.street?.trim()
          ? this.data?.street + ','
          : '';
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
      var adressName = street + ward + district + province + country;
      if (adressName != null && adressName.trim() != '') {
        if (adressName.endsWith(',')) {
          adressName = adressName.slice(0, -1);
        }
        this.data.adressName = adressName;
      }
    }
  }

  valueIsDefault(e) {
    this.isDefault = e.data;
  }
  valueChange(e) {
    this.data[e.field] = e?.data?.trim();
    if (e.data) {
      switch (e.field) {
        case 'adressName':
          // this.checkEventListen();
          this.checkAddressName = !!this.data.adressName;
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
  }

  checkAdressName() {
    this.checkAddressName = !!this.data.adressName;

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
