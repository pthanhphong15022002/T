import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  CacheService,
  CRUDService,
  AlertConfirmInputConfig,
  ImageViewerComponent,
  Util,
  CodxFormComponent,
  AuthStore,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { PopupAddressComponent } from '../cmcustomer-detail/codx-address-cm/popup-address/popup-address.component';
import { PopupListContactsComponent } from '../cmcustomer-detail/codx-list-contacts/popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from '../cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { CodxCmService } from '../../codx-cm.service';
import {
  BS_AddressBook,
  CM_Competitors,
  CM_Contacts,
  CM_Customers,
  CM_Partners,
} from '../../models/cm_model';
import { firstValueFrom } from 'rxjs';
import { CM_Address } from '../../models/tmpCrm.model';
import { CodxAddressCmComponent } from '../cmcustomer-detail/codx-address-cm/codx-address-cm.component';

@Component({
  selector: 'lib-popup-add-cmcustomer',
  templateUrl: './popup-add-cmcustomer.component.html',
  styleUrls: ['./popup-add-cmcustomer.component.css'],
})
export class PopupAddCmCustomerComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;
  @ViewChild('codxListAddress') codxListAddress: CodxAddressCmComponent;
  @ViewChild('form') form: CodxFormComponent;

  @Output() loadData = new EventEmitter();

  @ViewChild('vllCbx') vllCbx;
  data: any;
  dialog: any;
  title = '';
  action: any;
  linkAvatar = '';
  funcID = '';
  contacts = [];
  gridViewSetup: any;
  moreFuncAdd = '';
  moreFuncEdit = '';
  contactsPerson: any;
  refValue = '';
  recID: any;
  refValueCbx = '';
  refContactType = '';
  titleAction = '';
  listAddress: BS_AddressBook[] = [];
  formModelAddress: FormModel;
  listAddressDelete: BS_AddressBook[] = [];
  tmpAddress = new BS_AddressBook();
  disableObjectID = true;
  lstContact = [];
  lstContactDeletes = [];
  isAdress = false;

  contactType: any;
  count = 0;
  avatarChange = false;
  autoNumber: any;
  disabledShowInput = false;
  planceHolderAutoNumber = '';
  radioChecked = true;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
    {
      icon: 'icon-location_on',
      text: 'Danh sách địa chỉ',
      name: 'Address',
    },
    {
      icon: 'icon-contact_phone',
      text: 'Người liên hệ',
      name: 'Contacts',
    },
    {
      icon: 'icon-info',
      text: 'Thông tin khác',
      name: 'InformationDefault',
    },
  ];

  checkContact: boolean = false;
  leverSetting: number;
  isSaved = false;
  user: any;
  isView: boolean = false;
  checkType: string;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.action = dt?.data?.action;
    this.titleAction = dt?.data?.title;
    this.autoNumber = dt?.data?.autoNumber;
    this.isView = dt?.data?.isView ?? false;
    this.checkType = dt?.data?.checkType;
    this.user = this.authStore.get();
    if (this.action == 'copy') {
      this.recID = dt?.data[2];
    }
    this.recID = dt?.data[2];
    if (this.checkType == '1') {
      this.checkType = this.data?.category == '2' ? '5' : this.checkType;
    }
    if (this.data?.objectType == '1') {
      this.refValueCbx = 'CMCustomers';
    } else {
      this.refValueCbx = 'CMPartners';
    }
    if (this.checkType == '2') {
      if (this.action == 'add') {
        this.data.owner = null;
        this.data.contactType = null;
        this.data.objectType = null;
      }
    }
  }

  async ngOnInit() {
    this.getTab();
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'AutoNumberDefaultsBusiness',
        'GetFieldAutoNoAsync',
        [this.funcID, this.dialog?.formModel?.entityName]
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.disabledShowInput = true;
          // this.getAutoNumber(this.autoNumber);
          this.cache.message('AD019').subscribe((mes) => {
            if (mes)
              this.planceHolderAutoNumber = mes?.customName || mes?.description;
          });
        } else {
          this.disabledShowInput = false;
        }
      });

    if (this.action == 'add' || this.action == 'copy') {
      this.data.address = null;
      this.data.countryID = null;
      this.data.provinceID = null;
      this.data.districtID = null;
      this.data.regionID = null;
      this.data.wardID = null;
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
    // this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
    //   if (res && res.length) {
    //     let m = res.find((x) => x.functionID == 'SYS01');
    //     let edit = res.find((x) => x.functionID == 'SYS03');
    //     if (m) this.moreFuncAdd = m.customName;
    //     if (edit) this.moreFuncEdit = edit.customName;
    //   }
    // });
  }

  async ngAfterViewInit() {
    if (this.checkType == '2') {
      if (this.action == 'edit') {
        this.api
          .execSv<any>(
            'CM',
            'ERM.Business.CM',
            'ContactsBusiness',
            'CheckContactDealAsync',
            [this.data?.recID]
          )
          .subscribe((res) => {
            this.checkContact = res;
            console.log(this.checkContact);
          });
      }
      if (this.data?.objectID) {
        this.getListContactByObjectID(this.data?.objectID);
      }
    }

    this.gridViewSetup = await firstValueFrom(
      this.cache.gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
    );
    // if (this.action == 'edit') {
    //   // this.listAddress = await firstValueFrom(
    //   //   this.cmSv.getListAddress(
    //   //     this.dialog.formModel.entityName,
    //   //     this.data.recID
    //   //   )
    //   // );
    //   if (this.data.address != null && this.data.address.trim() != '') {
    //     if (this.listAddress != null && this.listAddress.length > 0) {
    //       var index = this.listAddress.findIndex((x) => x.isDefault == true);
    //       if (index != -1) {
    //         this.tmpAddress = this.listAddress[index];
    //       }
    //     }
    //   }
    // }
  }

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
  }

  getTab() {
    if (this.checkType == '1') {
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-read_more',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },
        {
          icon: 'icon-location_on',
          text: 'Danh sách địa chỉ',
          name: 'Address',
        },
        {
          icon: 'icon-contact_phone',
          text: 'Người liên hệ',
          name: 'Contacts',
        },
      ];
    } else if (this.checkType == '2') {
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-read_more',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },
        {
          icon: 'icon-location_on',
          text: 'Danh sách địa chỉ',
          name: 'Address',
        },
      ];
    } else if (this.checkType == '3') {
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-read_more',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },

        {
          icon: 'icon-contact_phone',
          text: 'Người liên hệ',
          name: 'Contacts',
        },
      ];
    } else {
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-read_more',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },
      ];
    }
  }

  changeRadio(e) {
    if (e.field === 'yes' && e.component.checked === true) {
      this.radioChecked = true;
      this.data.category = '1';
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-read_more',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },
        {
          icon: 'icon-location_on',
          text: 'Danh sách địa chỉ',
          name: 'Address',
        },
        {
          icon: 'icon-contact_phone',
          text: 'Người liên hệ',
          name: 'Contacts',
        },
      ];
    } else if (e.field === 'no' && e.component.checked === true) {
      this.radioChecked = false;
      this.data.category = '2';
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-read_more',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },
      ];
    }
    this.changeDetectorRef.detectChanges();
  }

  getListAddress(entityName, recID) {
    this.cmSv.getListAddress(entityName, recID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listAddress = res;
      }
    });
  }
  // getLastAndFirstName(contactName) {
  //   if (contactName != null) {
  //     var nameArr = contactName.split(' ');
  //     if (nameArr != null && nameArr.length > 1) {
  //       this.lastName = nameArr.slice(0, -1).join(' ');
  //       this.firstName = nameArr[nameArr.length - 1];
  //     } else {
  //       this.firstName = contactName;
  //     }
  //   }
  // }

  valueTagChange(e) {
    this.data.tags = e.data;
  }
  valueIndustries(e) {
    if (e.data) {
      this.data.industries = e.data;
    }
  }

  valueChangeAdress(e) {
    this.isSaved = true;
    if (e) {
      this.data.address = e?.data;
      this.setAddress(e?.data);
    }
  }

  focus(e) {
    this.isSaved = true;
    console.log(e);
  }

  async setAddress(name) {
    if (name != null && name?.trim() != '') {
      var tmp = new BS_AddressBook();
      tmp.objectName = this.getNameCrm(this.data);
      tmp.objectID = this.data.recID;
      tmp.objectType = this.dialog?.formModel?.entityName;
      let json = await firstValueFrom(
        this.api.execSv<any>(
          'BS',
          'ERM.Business.BS',
          'ProvincesBusiness',
          'GetLocationAsync',
          [name, this.leverSetting]
        )
      );
      if (json != null && json.trim() != '' && json != 'null') {
        let lstDis = JSON.parse(json);
        if (this.data.provinceID != lstDis?.ProvinceID)
          this.data.provinceID = lstDis?.ProvinceID;
        if (this.data.districtID != lstDis?.DistrictID)
          this.data.districtID = lstDis?.DistrictID;
        if (this.data.wardID != lstDis?.WardID)
          this.data.wardID = lstDis?.WardID;
        this.data.countryID = lstDis?.CountryID;

      } else {
        this.data.provinceID = null;
        this.data.districtID = null;
        this.data.wardID = null;
        this.data.countryID = null;
      }

      if(this.data?.countryID == null || this.data?.countryID?.trim() == ''){
        if(this.data.provinceID){
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
        }
      }

      if (this.action != 'edit') {
        if (this.listAddress != null && this.listAddress.length > 0) {
          var index = this.listAddress.findIndex((x) => x.isDefault == true);
          if (index != -1) {
            this.listAddress[index].address = name;
            this.listAddress[index].isDefault = true;
            this.listAddress[index].provinceID = this.data.provinceID;
            this.listAddress[index].districtID = this.data.districtID;
            this.listAddress[index].wardID = this.data.wardID;
            this.listAddress[index].countryID = this.data.countryID;
          } else {
            tmp.recID = Util.uid();
            tmp.adressType = this.checkType == '2' ? '5' : '6';
            tmp.address = name;
            tmp.provinceID = this.data.provinceID;
            tmp.districtID = this.data.districtID;
            tmp.wardID = this.data.wardID;
            tmp.countryID = this.data.countryID;
            tmp.isDefault = true;
            this.tmpAddress = tmp;
            this.listAddress.push(tmp);
          }
        } else {
          tmp.recID = Util.uid();
          tmp.adressType = this.checkType == '2' ? '5' : '6';
          tmp.address = name;
          tmp.isDefault = true;
          tmp.provinceID = this.data.provinceID;
          tmp.districtID = this.data.districtID;
          tmp.wardID = this.data.wardID;
          tmp.countryID = this.data.countryID;
          this.tmpAddress = tmp;
          this.listAddress.push(tmp);
        }
      } else {
        if (this.listAddress != null && this.listAddress.length > 0) {
          var index = this.listAddress.findIndex(
            (x) => this.tmpAddress?.recID && x.isDefault == true
          );
          if (index != -1) {
            this.listAddress[index].address = name;
            this.listAddress[index].provinceID = this.data.provinceID;
            this.listAddress[index].districtID = this.data.districtID;
            this.listAddress[index].wardID = this.data.wardID;
            this.listAddress[index].countryID = this.data.countryID;

          } else {
            tmp.recID = Util.uid();
            tmp.adressType = this.checkType == '2' ? '5' : '6';
            tmp.address = name;
            tmp.isDefault = true;
            tmp.provinceID = this.data.provinceID;
            tmp.districtID = this.data.districtID;
            tmp.wardID = this.data.wardID;
            tmp.countryID = this.data.countryID;

            this.tmpAddress = tmp;
            this.listAddress.push(tmp);
          }
        } else {
          tmp.recID = Util.uid();
          tmp.adressType = this.checkType == '2' ? '5' : '6';
          tmp.address = name;
          tmp.isDefault = true;
          tmp.provinceID = this.data.provinceID;
          tmp.districtID = this.data.districtID;
          tmp.wardID = this.data.wardID;
          tmp.countryID = this.data.countryID;
          this.tmpAddress = tmp;
          this.listAddress.push(tmp);
        }
      }
    } else {
      this.data.provinceID = null;
      this.data.countryID = null;
      this.data.provinceID = null;
      this.data.districtID = null;
      this.data.regionID = null;
      this.data.wardID = null;
      this.data.address = null;
      if (this.listAddress != null && this.listAddress.length > 0) {
        var indexDelete = this.listAddress.findIndex(
          (x) => x.isDefault == true
        );
        if (this.checkType == '1' || this.checkType == '2') {
          if (indexDelete != -1) {
            this.listAddress[indexDelete].isDefault = false;
          }
        } else {
          this.listAddressDelete.push(this.listAddress[0]);
          this.listAddress.splice(indexDelete, 1);
        }
      }
    }
    if (this.checkType == '1' || this.checkType == '2') {
      if (this.codxListAddress)
        this.codxListAddress.loadListAdress(this.listAddress);
    }
    this.isSaved = false;
  }

  valueChangeContact(e) {
    this.data[e.field] = e?.data;
    if (this.data.objectType && e.field == 'objectType') {
      this.gridViewSetup['ContactType'].isRequire = true;
      this.gridViewSetup['ObjectID'].isRequire = true;
      this.data.objectID = null;
      this.data.objectName = null;
      this.disableObjectID = false;
      if (this.data.objectType == '1') {
        this.refValueCbx = 'CMCustomers';
      } else {
        this.refValueCbx = 'CMPartners';
      }
    }

    if (this.data.objectID && e.field == 'objectID') {
      this.data.objectName =
        e?.component?.itemsSelected != null &&
        e?.component?.itemsSelected.length > 0
          ? e?.component?.itemsSelected[0]?.PartnerName
            ? e?.component?.itemsSelected[0]?.PartnerName
            : e?.component?.itemsSelected[0]?.CustomerName
          : null;
      this.getListContactByObjectID(this.data.objectID);
    }
    this.changeDetectorRef.detectChanges();
  }

  valueChecked(e) {
    if (e) {
      this.data.isDefault = e?.data;
    }
  }

  valueChangeIndustries(e) {
    this.data.industries = e?.data;
    if (e?.data) {
      this.data.owner = e?.component?.itemsSelected[0]?.Owner;
    }
    this.form.formGroup.patchValue(this.data);
    this.changeDetectorRef.detectChanges();
  }

  closePopover() {
    this.isSaved = false;
    this.changeDetectorRef.detectChanges();
  }

  //#region save
  beforeSave(op) {
    var data = [];
    if (this.data?.objectType == null || this.data?.objectType.trim() == '') {
      this.data.contactType = null;
      this.data.objectID = null;
      this.data.objectName = null;
      this.data.isDefault = false;
    }
    op.method = this.action != 'edit' ? 'AddCrmAsync' : 'UpdateCrmAsync';

    switch (this.checkType) {
      case '1':
      case '5':
        op.className = 'CustomersBusiness';
        data =
          this.action != 'edit'
            ? [this.data, this.lstContact, this.listAddress]
            : [
                this.data,
                this.lstContact,
                this.lstContactDeletes,
                this.listAddress,
                this.listAddressDelete,
              ];
        break;
      case '2':
        op.className = 'ContactsBusiness';
        data =
          this.action != 'edit'
            ? [this.data, this.listAddress]
            : [this.data, this.listAddress, this.listAddressDelete];
        break;
      case '3':
        op.className = 'PartnersBusiness';
        data =
          this.action != 'edit'
            ? [this.data, this.lstContact, this.listAddress]
            : [
                this.data,
                this.lstContact,
                this.lstContactDeletes,
                this.listAddress,
                this.listAddressDelete,
              ];
        break;
      case '4':
        op.className = 'CompetitorsBusiness';
        data =
          this.action != 'edit'
            ? [this.data, this.listAddress]
            : [this.data, this.listAddress, this.listAddressDelete];
        break;
    }

    op.data = data;
    return true;
  }

  async onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          var recID = res?.save?.recID;

          this.dialog.close([res.save, this.lstContact, this.listAddress]);
        }
      });
  }

  changeAvatar() {
    this.avatarChange = true;
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe(async (res) => {
        if (res && res.update) {
          // var recID = res.update?.recID;
          // (this.dialog.dataService as CRUDService)
          //   .update(res.update)
          //   .subscribe();

          this.dialog.close([res.update, this.lstContact, this.listAddress]);
        }
      });
  }

  async onSave() {
    if (this.checkType == '1' || this.checkType == '5') {
      this.data.customerName = this.data?.customerName;
    } else if (this.checkType == '3') {
      this.data.partnerName = this.data?.partnerName;
      this.data.annualRevenue =
        this.data?.annualRevenue != null &&
        parseFloat(this.data?.annualRevenue) >= 0
          ? parseFloat(this.data?.annualRevenue)
          : 0;
    }

    if (this.checkType == '4') {
      this.data.annualRevenue =
        this.data?.annualRevenue != null &&
        parseFloat(this.data?.annualRevenue) >= 0
          ? parseFloat(this.data?.annualRevenue)
          : 0;
    }

    if (this.checkType == '2') {
      if (this.data.objectType == null || this.data.objectType.trim() == '') {
        this.gridViewSetup['ContactType'].isRequire = false;
        this.gridViewSetup['ObjectID'].isRequire = false;
      }
    }
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if (this.count > 0) {
      return;
    }

    let check = false;
    if (this.action != 'edit') {
      check = await firstValueFrom(
        this.api.execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CustomersBusiness',
          'IsExitCoincideIDAsync',
          [
            this.data?.recID,
            this.checkType == '2'
              ? this.data?.contactID
              : this.checkType == '3'
              ? this.data?.partnerID
              : this.checkType == '4'
              ? this.data?.competitorID
              : this.data?.customerID,
            this.dialog?.formModel?.entityName,
          ]
        )
      );
    }

    if (check) {
      this.notiService.notifyCode(
        'SYS031',
        null,
        this.checkType == '2'
          ? this.data?.contactID
          : this.checkType == '3'
          ? this.data?.partnerID
          : this.checkType == '4'
          ? this.data?.competitorID
          : this.data?.customerID
      );
      return;
    }

    if (this.data?.taxCode != null && this.data?.taxCode.trim() != '') {
      check = await firstValueFrom(
        this.api.execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CustomersBusiness',
          'IsExitCoincideTaxCodeAsync',
          [
            this.data?.recID,
            this.data?.taxCode.trim(),
            this.dialog?.formModel?.entityName,
          ]
        )
      );
      if (check) {
        this.notiService.notifyCode('CM016');
        return;
      }
    }

    if (this.checkType == '2') {
      if (this.data.mobile != null && this.data.mobile.trim() != '') {
        if (!this.checkEmailOrPhone(this.data.mobile, 'P')) return;
      } else {
        this.data.mobile = null;
      }
      if (
        this.data.personalEmail != null &&
        this.data.personalEmail.trim() != ''
      ) {
        if (!this.checkEmailOrPhone(this.data.personalEmail, 'E')) return;
      } else {
        this.data.personalEmail = null;
      }
    }
    if (this.data.phone != null && this.data.phone.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.phone, 'P')) return;
    }
    if (this.data.email != null && this.data.email.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.email, 'E')) return;
    }
    this.onSaveHanle();
  }

  async onSaveHanle() {
    if (this.checkType == '2') {
      if (this.lstContact != null && this.lstContact.length > 0) {
        var checkMainLst = this.lstContact.some(
          (x) => x.isDefault && x.recID != this.data.recID
        );
        if (checkMainLst) {
          if (this.data?.isDefault) {
            let nameDefault = this.lstContact.find(
              (x) => x.isDefault
            )?.contactName;
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService
              .alertCode('CM005', null, "'" + nameDefault + "'")
              .subscribe((x) => {
                if (x?.event && x.event?.status) {
                  if (x.event.status == 'Y') {
                    this.hanleSave();
                  }
                }
              });
          } else {
            this.hanleSave();
          }
        } else {
          this.hanleSave();
        }
      } else {
        this.hanleSave();
      }
    } else {
      this.hanleSave();
    }
  }

  async hanleSave() {
    if (this.avatarChange) {
      await firstValueFrom(
        this.imageUpload.updateFileDirectReload(this.data?.recID)
      );
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }
  //#endregion

  checkEmailOrPhone(field, type) {
    if (type == 'E') {
      var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!field.toLowerCase().match(validEmail)) {
        this.notiService.notifyCode('SYS037');
        return false;
      }
    }
    if (type == 'P') {
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01|02+([0-9]{9})))\b)/;
      if (!field.toLowerCase().match(validPhone)) {
        this.notiService.notifyCode('RS030');
        return false;
      }
    }
    return true;
  }

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstContact = res;
      }
    });
  }

  lstContactEmit(e) {
    if (e != null && e.length > 0) {
      this.lstContact = e;
    }
  }

  lstContactDeleteEmit(e) {
    if (e != null && e.length > 0) {
      this.lstContactDeletes = e;
    }
  }

  lstAddressEmit(e) {
    this.listAddress = e;
    if (this.listAddress != null && this.listAddress.length > 0) {
      var index = this.listAddress.findIndex((x) => x.isDefault == true);
      if (index != -1) {
        this.tmpAddress = this.listAddress[index];
        this.data.address = this.listAddress[index].address;
      } else {
        this.data.address = null;
      }
    }
    if (this.form) {
      this.form.formGroup.patchValue(this.data);
    }
    this.changeDetectorRef.detectChanges();
  }

  lstAddressDeleteEmit(e) {
    if (e != null && e.length > 0) {
      this.listAddressDelete = e;
      var index = this.listAddressDelete.findIndex(
        (x) => x.recID == this.tmpAddress.recID && x.isDefault == true
      );
      if (index != -1) {
        var tmp = new BS_AddressBook();
        this.data.address = null;
        this.data.provinceID = null;
        this.data.countryID = null;
        this.data.provinceID = null;
        this.data.districtID = null;
        this.data.regionID = null;
        this.data.wardID = null;
        this.tmpAddress = tmp;
        if (this.form) {
          this.form.formGroup.patchValue(this.data);
        }
      }
    }
  }

  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

      this.changeDetectorRef.detectChanges();
    }
  }

  getAvatar(data) {
    let avatar = [
      '',
      this.funcID,
      data.recID,
      this.dialog.formModel.entityName,
      'inline',
      1000,
      this.getNameCrm(data),
      'avt',
      false,
    ];

    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  getNameCrm(data) {
    if (this.checkType == '1' || this.checkType == '5') {
      return data.customerName;
    } else if (this.checkType == '2') {
      return data.contactName;
    } else if (this.checkType == '3') {
      return data.partnerName;
    } else {
      return data.opponentName;
    }
  }

  //#region Contact
  //Open list contacts
  clickPopupContacts() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup(dataModel.formName, dataModel.gridViewName)
      .subscribe((res) => {
        var obj = {
          type: 'formAdd',
        };
        var dialog = this.callFc.openForm(
          PopupListContactsComponent,
          '',
          650,
          550,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            if (e.event?.recID) this.contactsPerson = e.event;
          }
        });
      });
  }

  //Open popup add contacts
  clickAddContact() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup(dataModel.formName, dataModel.gridViewName)
      .subscribe((res) => {
        var obj = {
          moreFuncName: this.moreFuncAdd,
          action: 'add',
          dataContact: null,
          type: 'formAdd',
          gridViewSetup: res,
        };
        var dialog = this.callFc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          500,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            if (e.event?.recID) this.contactsPerson = e.event;
          }
        });
      });
  }
  //#endregion
}

//Dung tam de sinh guid
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
