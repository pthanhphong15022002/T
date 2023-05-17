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
  nameCountry = '';
  nameProvince = '';
  nameDistrict = '';
  nameWard = '';
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
    if (this.action == 'edit') this.setNameAdress();
  }

  setNameAdress() {
    var lstText = this.data?.adressName.split(',');
    if (this.data.countryID != null && this.data.countryID.trim() != '') {
      this.nameCountry = lstText[lstText.length - 1].trim();
    }
    if (this.data.provinceID != null && this.data.provinceID.trim() != '') {
      this.nameProvince = lstText[lstText.length - 2].trim() + ', ';
      if (this.data.districtID != null && this.data.districtID.trim() != '') {
        this.nameDistrict = lstText[lstText.length - 3].trim() + ', ';
        if (this.data.wardID != null && this.data.wardID.trim() != '') {
          this.nameWard = lstText[lstText.length - 4].trim() + ', ';
        }
      } else {
        if (this.data.wardID != null && this.data.wardID.trim() != '') {
          this.nameWard = lstText[lstText.length - 3].trim() + ', ';
        }
      }
    } else {
      if (this.data.districtID != null && this.data.districtID.trim() != '') {
        this.nameDistrict = lstText[lstText.length - 2].trim() + ', ';
        if (this.data.wardID != null && this.data.wardID.trim() != '') {
          this.nameWard = lstText[lstText.length - 3].trim() + ', ';
        }
      } else {
        if (this.data.wardID != null && this.data.wardID.trim() != '') {
          this.nameWard = lstText[lstText.length - 2].trim() + ', ';
        }
      }
    }
  }

  onSave() {
    this.setAdressName();
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if (this.count > 0) return;

    if (this.lstAddress != null && this.lstAddress.length > 0) {
      var checkCoincide = this.lstAddress.some(
        (x) =>
          x.recID != this.data.recID &&
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
          }else{
            this.dialog.close();
            this.notiService.notifyCode('SYS023');

          }
        });
      } else {
        this.cmSv.updateOneAddress(this.data).subscribe((res) => {
          if (res) {
            this.dialog.close(res);
            this.notiService.notifyCode('SYS007');
          }else{
            this.dialog.close();
            this.notiService.notifyCode('SYS021');

          }
        });
      }
    }
  }

  setAdressName() {
    this.data.adressName =
      this.data?.street != null && this.data?.street?.trim() != ''
        ? this.data.street +
          ', ' +
          this.nameWard +
          this.nameDistrict +
          this.nameProvince +
          this.nameCountry
        : this.nameWard +
          this.nameDistrict +
          this.nameProvince +
          this.nameCountry;
  }

  valueIsDefault(e) {
    this.isDefault = e.data;
  }
  valueChange(e) {
    if (e.data) {
      this.data[e.field] = e?.data;
      switch (e.field) {
        case 'countryID':
          this.model = { CountryID: JSON.parse(JSON.stringify(e?.data)) };
          this.nameCountry =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.CountryName
              : null;
          break;
        case 'provinceID':
          this.modelDistrictID = { ProvinceID: JSON.parse(JSON.stringify(e?.data)) };
          this.nameProvince =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.ProvinceName + ', '
              : null;
          break;
        case 'districtID':
          this.modelWardID = { DistrictID: JSON.parse(JSON.stringify(e?.data)) };
          this.nameDistrict =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.DistrictName + ', '
              : null;
          break;
        case 'wardID':
          this.nameWard =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.WardName + ', '
              : null;
          break;
      }
    }
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
