import {
  ChangeDetectorRef,
  Component,
  Optional,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { PopupAddServicetagComponent } from '../popup-add-servicetag/popup-add-servicetag.component';
import { WR_WorkOrders } from '../../_models-wr/wr-model.model';
import { firstValueFrom } from 'rxjs';
import { CodxWrService } from '../../codx-wr.service';
import { PopupAddCustomerWrComponent } from './popup-add-customerwr/popup-add-customerwr.component';

@Component({
  selector: 'lib-popup-add-warranty',
  templateUrl: './popup-add-warranty.component.html',
  styleUrls: ['./popup-add-warranty.component.css'],
})
export class PopupAddWarrantyComponent implements OnInit {
  @ViewChild('seriNo') seriNo: CodxInputComponent;
  @ViewChild('form') form: CodxFormComponent;

  data: WR_WorkOrders;
  dialog: DialogRef;
  title = '';
  userID: any;
  radioChecked = true;
  action = '';
  gridViewSetup: any;
  moreFuncAdd = '';
  user: any;
  isCheckCbx = false;

  constructor(
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private wrSv: CodxWrService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog.dataService?.dataSelected));
    this.title = dt?.data?.title;
    this.user = this.authstore?.get();
    this.userID = this.user?.userID;
    this.action = dt?.data?.action;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }
  ngOnInit(): void {
    if (this.action != 'add') {
      if (new Date(this.data.warrantyExpired) > new Date()) {
        this.data.oow = true;
      } else {
        this.data.oow = false;
      }
      if (this.data?.seriNo == null || this.data?.seriNo?.trim() == '') {
        this.data.seriNo = this.data?.serviceTag;
      }
    } else {
      this.data.oow = true;
      this.api
        .execSv<any>(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness_Old',
          'GetUserManagerByUserIDAsync',
          [this.data.owner]
        )
        .subscribe((res) => {
          if (res) {
            this.data.teamLeader = res?.userID;
          }
        });
    }
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.customName;
      }
    });
  }

  //#region onSave
  beforeSave(op) {
    var data = [];
    data = [this.data];
    op.method =
      this.action != 'edit' ? 'AddWorkOrderAsync' : 'UpdateWorkOrderAsync';
    op.className = 'WorkOrdersBusiness';
    op.data = data;
    return true;
  }

  async onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          this.dialog.close(res.save);
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
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.CustomerID?.headerText + '"'
      );
      return;
    }

    if (this.data?.serviceTag == null || this.data?.serviceTag?.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.SeriNo?.headerText + '"'
      );
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

  async addCustomer() {
    let lstAddress = [];
    if (this.data?.address != null && this.data?.address?.trim() != '') {
      var tmp = {};

      tmp['recID'] = Util.uid();
      tmp['adressType'] = '0';
      tmp['address'] = this.data.address;
      tmp['isDefault'] = true;
      tmp['provinceID'] = this.data?.province;
      tmp['districtID'] = this.data?.district;
      tmp['wardID'] = null;
      lstAddress.push(Object.assign({}, tmp));
    }
    var tmpCus = {};
    tmpCus['recID'] = this.data?.customerID;
    tmpCus['custGroupID'] = this.data?.custGroupID;
    tmpCus['customerName'] = this.data?.customerName;
    tmpCus['phone'] = this.data?.phone;
    tmpCus['address'] = this.data?.address;
    tmpCus['owner'] = this.userID;
    tmpCus['category'] = '1';
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
                lstAddress[0].adressType = '19';
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

  async valueChangeCbx(e) {
    if (e?.data) {
      let serviceTag = await firstValueFrom(
        this.wrSv.getOneServiceTag(e?.data)
      );

      if (serviceTag != null) {
        var key = Object.keys(this.data);
        var keySv = Object.keys(serviceTag);
        for (let index = 0; index < key.length; index++) {
          for (let i = 0; i < keySv.length; i++) {
            if (
              key[index].toLowerCase() != 'owner' &&
              key[index].toLowerCase() != 'buid' &&
              key[index].toLowerCase() != 'createdon' &&
              key[index].toLowerCase() != 'createdby' &&
              key[index].toLowerCase() != 'modifiedon' &&
              key[index].toLowerCase() != 'modifiedby'
            )
              if (key[index].toLowerCase() == keySv[i].toLowerCase()) {
                if (key[index].toLowerCase() == 'warrantyexpired') {
                  this.data[key[index]] = new Date(serviceTag[keySv[i]]);
                } else {
                  this.data[key[index]] = serviceTag[keySv[i]];
                }
              }
          }
        }
        if (new Date(this.data.warrantyExpired) > new Date()) {
          this.data.oow = true;
        } else {
          this.data.oow = false;
        }

        if (this.data.customerID != null && this.data.customerID.trim() != '') {
          var customer = await firstValueFrom(
            this.wrSv.getOneCustomer(this.data.customerID)
          );

          this.isCheckCbx = true;
        }
      }

      // this.data.seriNo = e?.data;
      // this.data.serviceTag = e?.component?.itemsSelected[0]?.ServiceTag;
      // this.data.customerID = e?.component?.itemsSelected[0]?.CustomerID;

      // let customer = await firstValueFrom(
      //   this.wrSv.getOneCustomer(this.data.customerID)
      // );
      // if (customer != null) {
      //   var key = Object.keys(this.data);
      // }
    }

    this.detectorRef.detectChanges();
  }
  //#region popup add

  clickAddServiceTag() {
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    let formModel = new FormModel();
    formModel.formName = this.dialog.formModel?.formName;
    formModel.gridViewName = this.dialog.formModel?.gridViewName;
    formModel.entityName = this.dialog.formModel?.entityName;
    dialogModel.FormModel = formModel;
    let dataService = JSON.parse(JSON.stringify(this.data));
    let obj = {
      title:
        this.moreFuncAdd + ' ' + this.gridViewSetup?.ServiceTag?.headerText,
      data: dataService,
      gridViewSetup: this.gridViewSetup,
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
        if (e && e?.event != null) {
          if (e?.event?.seriNo) {
            this.data = JSON.parse(JSON.stringify(e?.event));
            this.isCheckCbx = false;
            this.form.formGroup.patchValue(this.data);
            this.detectorRef.detectChanges();
          }
        }
      });
  }

  clickAddCustomer(type) {
    this.cache.functionList('CM0101').subscribe((res) => {
      this.radioChecked = true;
      let dialogModel = new DialogModel();
      dialogModel.zIndex = 1010;
      let formModel = new FormModel();
      formModel.formName = this.dialog.formModel?.formName;
      formModel.gridViewName = this.dialog.formModel?.gridViewName;
      formModel.entityName = this.dialog.formModel?.entityName;
      dialogModel.FormModel = formModel;
      let dataService = JSON.parse(JSON.stringify(this.data));
      let obj = {
        title: this.moreFuncAdd + ' ' + res?.defaultName,
        data: dataService,
        gridViewSetup: this.gridViewSetup,
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
            if (e?.event[0]?.customerID) {
              let customerID = this.data.customerID;
              this.data = JSON.parse(JSON.stringify(e?.event[0]));
              if (this.isCheckCbx && type != 'switch') {
                this.setServiceTagEmtry();
                this.isCheckCbx = false;
              }
              this.radioChecked = e?.event[1];
              this.detectorRef.detectChanges();
            }
          }
        });
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
    this.data.phone = '';
    this.data.mobile = '';
    this.data.email = '';
    this.data.address = '';
    this.data.country = '';
    this.data.province = '';
    this.data.district = '';
  }

  setServiceTagEmtry() {
    this.data.seriNo = null;
    this.data.serviceTag = null;
    this.data.lob = '';
    this.data.productID = '';
    this.data.productType = '';
    this.data.productModel = '';
    this.data.productBrand = '';
    this.data.productDesc = '';
    this.data.note = '';
    this.data.warrantyExpired = null;
    (this.seriNo.ComponentCurrent as CodxComboboxComponent).dataService.data =
      [];
    this.seriNo.crrValue = null;
    this.form.formGroup.patchValue(this.data);
  }
}
