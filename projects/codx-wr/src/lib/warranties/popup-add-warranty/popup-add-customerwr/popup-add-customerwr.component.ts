import { ChangeDetectorRef, Component, Optional, OnInit } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxWrService } from '../../../codx-wr.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-add-customerwr',
  templateUrl: './popup-add-customerwr.component.html',
  styleUrls: ['./popup-add-customerwr.component.css'],
})
export class PopupAddCustomerWrComponent implements OnInit {
  data: any;
  dialog: DialogRef;
  title = '';
  radioChecked = true;
  userID: any;
  leverSetting: number;
  gridViewSetup: any;
  constructor(
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectoref: ChangeDetectorRef,
    private wrSv: CodxWrService,
    private cache: CacheService,
    private notification: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.userID = this.authstore?.get()?.userID;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }
  async ngOnInit() {
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

  //#region
  onSave() {
    if (this.data.category == '2') this.data.mobile = null;

    if (this.data.customerName == null || this.data.customerName.trim() == '') {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.CustomerName?.headerText + '"'
      );
      return;
    }

    if (this.data.mobile != null && this.data.mobile.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.mobile, 'P')) return;
    } else {
      this.data.mobile = null;
    }
    if (this.data.phone != null && this.data.phone.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.phone, 'P')) return;
    } else {
      this.data.phone = null;
    }

    if (this.data.email != null && this.data.email.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.email, 'E')) return;
    } else {
      this.data.email = null;
    }
    if (!this.radioChecked)
      if (
        !this.checkValidateSetting(
          this.data?.address,
          this.data,
          this.leverSetting,
          this.gridViewSetup,
          this.gridViewSetup?.Address?.headerText
        )
      ) {
        return;
      }
    this.dialog.close([this.data, this.radioChecked]);
    this.data = null;
  }
  //#endregion

  //#region check validate
  checkValidateSetting(address, data, lever = 3, gridViewSetup, headerText) {
    let unFillFields = '';
    if (address == null || address?.trim() == '') return true;
    if (lever == 0) {
      return true;
    }
    if (!(data?.province?.length > 0)) {
      unFillFields += gridViewSetup?.Province?.headerText;
    }
    if (!(data?.district?.length > 0) && lever >= 2) {
      unFillFields += ' ' + gridViewSetup?.District?.headerText;
    }
    if (unFillFields.length > 0) {
      this.notification.notifyCode('CM048', 0, unFillFields, headerText);
      return false;
    }
    return true;
  }

  checkEmailOrPhone(field, type) {
    if (type == 'E') {
      var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!field.toLowerCase().match(validEmail)) {
        this.notification.notifyCode('SYS037');
        return false;
      }
    }
    if (type == 'P') {
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01|02+([0-9]{9})))\b)/;
      if (!field.toLowerCase().match(validPhone)) {
        this.notification.notifyCode('RS030');
        return false;
      }
    }
    return true;
  }
  //#endregion

  changeRadio(e) {
    this.setDataNull();
    if (e.field === 'yes' && e.component.checked === true) {
      this.radioChecked = true;
    } else if (e.field === 'no' && e.component.checked === true) {
      this.radioChecked = false;
      this.data.category = '2';
      this.data.customerID = Util.uid();
    }
    this.changeDetectoref.detectChanges();
  }

  setDataNull() {
    this.data.customerID = '';
    this.data.customerName = '';
    this.data.custGroupID = '';
    this.data.category = '';
    this.data.contactName = '';
    this.data.phone = '';
    this.data.mobile = '';
    this.data.email = '';
    this.data.address = '';
    this.data.country = '';
    this.data.province = '';
    this.data.district = '';
  }

  valueChangeCbx(e) {
    if (e?.data != this.data?.customerID) {
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CustomersBusiness',
          'GetOneAsync',
          [e?.data]
        )
        .subscribe((res) => {
          if (res != null) {
            this.data.customerID = res?.recID;
            this.data.customerName = res?.customerName;
            this.data.custGroupID = res?.custGroupID;
            this.data.category = res?.category;
            this.data.phone = res?.phone;
            this.data.email = res?.category == '2' ? res?.email : '';
            this.data.address = res?.address;
            this.data.country = res?.countryID;
            this.data.province = res?.provinceID;
            this.data.district = res?.districtID;
            if (this.data.category == '1') {
              this.wrSv.getOneContact(res?.recID).subscribe((ele) => {
                if (ele) {
                  this.data.contactName = ele?.contactName;
                  this.data.mobile = ele?.mobile;
                  this.data.email = ele?.email;
                }
              });
            } else {
              this.data.contactName = '';
            }
          }
          this.changeDetectoref.detectChanges();
        });
    }
  }

  async valueChange(e) {
    if (e?.data != this.data[e?.field]) {
      this.data[e?.field] = e?.data;
      if (this.data.category == '2') {
        this.data.contactName = '';
      }
      if (e?.field == 'address') {
        let json = await firstValueFrom(
          this.api.execSv<any>(
            'BS',
            'ERM.Business.BS',
            'ProvincesBusiness',
            'GetLocationAsync',
            [this.data.address, this.leverSetting]
          )
        );

        if (json != null && json.trim() != '') {
          let lstDis = JSON.parse(json);
          this.data.province = lstDis?.ProvinceID;
          this.data.district = lstDis?.DistrictID;
        } else {
          this.data.province = null;
          this.data.district = null;
        }
      }
    }
    this.changeDetectoref.detectChanges();
  }
}
