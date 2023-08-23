import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  DialogData,
  DialogRef,
  Util,
} from 'codx-core';

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
  userID: any;
  constructor(
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectoref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.userID = this.authstore?.get()?.userID;
  }

  //#region
  onSave() {
    if (this.data.customerName == null || this.data.customerName.trim() == '') {
      return;
    }
    this.dialog.close([this.data, this.radioChecked]);

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
                    this.data.email = ele?.email;
                  }
                });
            }
          }
          this.changeDetectoref.detectChanges();
        });
    }
  }

  valueChange(e) {
    if (e?.data != this.data[e?.field]) {
      this.data[e?.field] = e?.data;
    }
    this.changeDetectoref.detectChanges();
  }
}
