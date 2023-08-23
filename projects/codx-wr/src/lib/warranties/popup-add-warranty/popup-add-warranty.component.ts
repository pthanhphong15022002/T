import { ChangeDetectorRef, Component, Optional, OnInit } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  Util,
} from 'codx-core';
import { PopupAddServicetagComponent } from './popup-add-servicetag/popup-add-servicetag.component';
import { PopupAddCustomerWrComponent } from './popup-add-customerwr/popup-add-customerwr.component';
import { WR_WorkOrders } from '../../_models-wr/wr-model.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-add-warranty',
  templateUrl: './popup-add-warranty.component.html',
  styleUrls: ['./popup-add-warranty.component.css'],
})
export class PopupAddWarrantyComponent implements OnInit {
  data: WR_WorkOrders;
  dialog: DialogRef;
  title = '';
  userID: any;
  radioChecked = true;
  action = '';
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog.dataService?.dataSelected));
    this.title = dt?.data?.title;
    this.userID = this.authstore?.get()?.userID;
    this.action = dt?.data?.action;
  }
  ngOnInit(): void {}

  //#region onSave
  beforeSave(op) {
    var data = [];
    op.method =
      this.action != 'edit' ? 'AddWorkOrderAsync' : 'UpdateWorkOrderAsync';
    op.className = 'WorkOrdersBusiness';
    op.data = this.data;
    return true;
  }

  async onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          this.dialog.close([res.save]);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe(async (res) => {
        if (res && res.update) {
          var recID = res.update?.recID;
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();

          this.dialog.close(res.update);
        }
      });
  }

  onSave() {
    if (this.data?.customerID == null || this.data?.customerID?.trim() == '') {
      return;
    }

    if (this.data?.serviceTag == null || this.data?.serviceTag?.trim() == '') {
      return;
    }

    if (this.action != 'edit') {
      if (this.radioChecked) {
        this.onAdd();
      } else {
        this.addCustomer();
      }
    } else {
      this.onUpdate();
    }
  }

  addCustomer() {
    let lstAddress = [];
    if (this.data?.address != null && this.data?.address?.trim() != '') {
      var tmp = {};
      tmp['recID'] = Util.uid();
      tmp['adressType'] = '6';
      tmp['adressName'] = this.data.address;
      tmp['isDefault'] = true;
      lstAddress.push(Object.assign({}, tmp));
    }
    var tmpCus = {};
    tmpCus['recID'] = this.data?.customerID;
    tmpCus['custGroupID'] = this.data?.custGroupID;
    tmpCus['customerName'] = this.data?.customerName;
    tmpCus['phone'] = this.data?.phone;
    tmpCus['address'] = this.data?.address;
    tmpCus['owner'] = this.userID;
    tmpCus['category'] = this.data?.category;
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'CustomersBusiness',
        'AddCrmAsync',
        [tmpCus, [], lstAddress]
      )
      .subscribe(async (res) => {
        if (res) {
          let data = res;
          if (data?.category == '1') {
            if (
              this.data?.contactName != null &&
              this.data?.contactName?.trim() != ''
            ) {
              var tmpContact = {};
              tmpContact['contactName'] = this.data?.contactName?.trim();
              tmpContact['email'] = this.data?.email;
              tmpContact['mobile'] = this.data?.mobile;
              tmpContact['phone'] = this.data?.phone;
              tmpContact['objectType'] = '1';
              tmpContact['contactType'] = '0';
              tmpContact['objectID'] = data?.recID;
              tmpContact['objectName'] = data?.customerName;
              tmpContact['owner'] = data?.owner;
              tmpContact['address'] = this.data?.address;
              if (lstAddress != null && lstAddress.length > 0) {
                lstAddress[0].adressType = '5';
              }
              await firstValueFrom(
                this.api.execSv<any>(
                  'CM',
                  'ERM.Business.CM',
                  'ContactsBusiness',
                  'AddCrmAsync',
                  [tmpContact, lstAddress]
                )
              );
            }
          }
          this.onAdd();
        }
      });
  }
  //#endregion

  valueChange(e) {}

  //#region popup add

  clickAddServiceTag() {
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.dialog?.formModel;
    let obj = {
      title: 'Thêm',
      data: this.data,
    };
    this.callFc
      .openForm(
        PopupAddServicetagComponent,
        '',
        600,
        700,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.data = e?.event;
          this.detectorRef.detectChanges();
        }
      });
  }

  clickAddCustomer() {
    this.radioChecked = true;
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.dialog?.formModel;
    let obj = {
      title: 'Thêm',
      data: this.data,
    };
    this.callFc
      .openForm(
        PopupAddCustomerWrComponent,
        '',
        600,
        800,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          if (this.data.customerID != e?.event[0]?.customerID)
            this.setServiceTagEmtry();
          this.data = e?.event[0];
          this.radioChecked = e?.event[1];
          this.detectorRef.detectChanges();
        }
      });
  }
  //#endregion

  removeUser() {
    this.setCustomerEmtry();
    this.setServiceTagEmtry();
    this.detectorRef.detectChanges();
  }

  setCustomerEmtry() {
    this.data.customerID = '';
    this.data.customerName = '';
    this.data.custGroupID = '';
    this.data.contactName = '';
    this.data.category = '';
    this.data.phone = '';
    this.data.mobile = '';
    this.data.email = '';
    this.data.address = '';
    this.data.country = '';
    this.data.province = '';
    this.data.district = '';
  }

  setServiceTagEmtry() {
    this.data.seriNo = '';
    this.data.serviceTag = '';
    this.data.lob = '';
    this.data.productID = '';
    this.data.productType = '';
    this.data.productModel = '';
    this.data.productBrand = '';
    this.data.productDesc = '';
    this.data.note = '';
    this.data.warrantyExpired = null;
  }
}
