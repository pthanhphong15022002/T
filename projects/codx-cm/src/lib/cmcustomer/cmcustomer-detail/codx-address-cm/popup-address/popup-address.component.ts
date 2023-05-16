import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogRef,
  DialogData,
  CacheService,
  NotificationsService,
  DataRequest,
  ApiHttpService,
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
  count = 0;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data?.data;

    this.action = dt?.data?.action;

    this.isDisable = this.action == 'edit' && this.data?.adressType == '1';
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }

  ngOnInit(): void {
    if(this.action == 'add'){
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
    this.onAdd();
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if(this.count > 0)
      return;
    this.dialog.close(this.data);
  }

  onAdd() {
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

  valueChange(e) {
    if (e.data) {
      this.data[e.field] = e?.data;
      switch (e.field) {
        case 'countryID':
          this.model = {CountryID: this.data?.countryID}
          this.nameCountry =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.CountryName
              : null;
          break;
        case 'provinceID':
          this.modelDistrictID = {ProvinceID: this.data?.provinceID};
          this.nameProvince =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.ProvinceName + ', '
              : null;
          break;
        case 'districtID':
          this.modelWardID = {DistrictID: this.data?.districtID};
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
