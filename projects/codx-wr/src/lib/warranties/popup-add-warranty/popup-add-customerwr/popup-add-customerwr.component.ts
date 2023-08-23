import { Component, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-customerwr',
  templateUrl: './popup-add-customerwr.component.html',
  styleUrls: ['./popup-add-customerwr.component.css'],
})
export class PopupAddCustomerWrComponent {
  data: any;
  dialog: DialogRef;
  title = '';
  radioChecked = true;
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
  }

  //#region
  onSave() {
    if (this.data.customerName == null || this.data.customerName.trim() == '') {
      return;
    }

    this.dialog.close(this.data);
  }
  //#endregion

  changeRadio(e) {
    this.setDataNull();
    if (e.field === 'yes' && e.component.checked === true) {
      this.radioChecked = true;
    } else if (e.field === 'no' && e.component.checked === true) {
      this.radioChecked = false;
      this.data.category = '2';
    }
  }

  setDataNull() {
    this.data.customerID = '';
    this.data.customerName = '';
    this.data.custGroupID = '';
    this.data.category = '';
    this.data.phone = '';
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
            this.data.email = res?.email;
            this.data.address = res?.address;
            this.data.country = res?.countryID;
            this.data.province = res?.provinceID;
            this.data.district = res?.districtID;
            if (this.data.category == '1') {
              this.api
                .execSv<any>(
                  'CM',
                  'ERM.Business.CM',
                  'CustomersBusiness',
                  'GetOneAsync',
                  [e?.data]
                )
                .subscribe((ele) => {
                  if (ele) {
                    this.data.mobile = ele?.mobile;
                  }
                });
            }
          }
        });
    }
  }

  valueChange(e) {}
}
