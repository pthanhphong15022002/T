import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogRef,
  DialogData,
  CacheService,
  NotificationsService,
  DataRequest,
  ApiHttpService,
} from 'codx-core';
import { BS_AddressBook } from '../../models/cm_model';

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
  nameRegion = '';
  action = '';
  isDisable = false;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
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
        if (this.data.regionID != null && this.data.regionID.trim() != '') {
          this.nameRegion = lstText[lstText.length - 4].trim() + ', ';
        }
      } else {
        if (this.data.regionID != null && this.data.regionID.trim() != '') {
          this.nameRegion = lstText[lstText.length - 3].trim() + ', ';
        }
      }
    } else {
      if (this.data.districtID != null && this.data.districtID.trim() != '') {
        this.nameDistrict = lstText[lstText.length - 2].trim() + ', ';
        if (this.data.regionID != null && this.data.regionID.trim() != '') {
          this.nameRegion = lstText[lstText.length - 3].trim() + ', ';
        }
      } else {
        if (this.data.regionID != null && this.data.regionID.trim() != '') {
          this.nameRegion = lstText[lstText.length - 2].trim() + ', ';
        }
      }
    }
  }

  onSave() {
    if (this.data.adressType == null || this.data.adressType.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AdressType'].headerText + '"'
      );
      return;
    }
    if (this.data.countryID == null || this.data.countryID.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CountryID'].headerText + '"'
      );
      return;
    }
    this.onAdd();
    this.dialog.close(this.data);
  }

  onAdd() {
    this.data.adressName =
      this.data?.street != null && this.data?.street?.trim() != ''
        ? this.data.street +
          ', ' +
          this.nameRegion +
          this.nameDistrict +
          this.nameProvince +
          this.nameCountry
        : this.nameRegion +
          this.nameDistrict +
          this.nameProvince +
          this.nameCountry;
  }

  valueChange(e) {
    if (e.data) {
      this.data[e.field] = e?.data;
      switch (e.field) {
        case 'countryID':
          this.nameCountry =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.CountryName
              : '';
          break;
        case 'provinceID':
          this.nameProvince =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.ProvinceName + ', '
              : '';
          break;
        case 'districtID':
          this.nameDistrict =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.DistrictName + ', '
              : '';
          break;
        case 'regionID':
          this.nameRegion =
            e?.component?.itemsSelected != null &&
            e?.component?.itemsSelected.length > 0
              ? e?.component?.itemsSelected[0]?.RegionName + ', '
              : '';
          break;
      }
    }
  }
}
