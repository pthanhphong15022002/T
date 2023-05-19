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
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
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

@Component({
  selector: 'lib-popup-add-cmcustomer',
  templateUrl: './popup-add-cmcustomer.component.html',
  styleUrls: ['./popup-add-cmcustomer.component.css'],
})
export class PopupAddCmCustomerComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;
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
  disableObjectID = true;
  lstContact = [];
  lstContactDeletes = [];

  contactType: any;
  count = 0;
  avatarChange = false;
  autoNumber: any;

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

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.action = dt?.data?.action;
    this.titleAction = dt?.data?.title;
    this.autoNumber = dt?.data?.autoNumber;
    if (this.action == 'copy') {
      this.recID = dt?.data[2];
    }
    this.recID = dt?.data[2];
    if (this.action == 'edit' || this.action == 'copy') {
      if (this.data?.objectType == '1') {
        this.refValueCbx = 'CMCustomers';
      } else {
        this.refValueCbx = 'CMPartners';
      }
    }
  }

  ngOnInit(): void {
    this.getTab();
    if (this.action == 'add' || this.action == 'copy')
      this.getAutoNumber(this.autoNumber);
    if (this.data?.objectID) {
      this.getListContactByObjectID(this.data?.objectID);
    }
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });

    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        let edit = res.find((x) => x.functionID == 'SYS03');
        if (m) this.moreFuncAdd = m.customName;
        if (edit) this.moreFuncEdit = edit.customName;
      }
    });
  }

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
  }

  getTab() {
    if (this.funcID == 'CM0101' || this.funcID == 'CM0103') {
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-info',
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
        }

      ];
    } else {
      this.tabInfo = [
        { icon: 'icon-info', text: 'Thông tin chung', name: 'Information' },
        {
          icon: 'icon-info',
          text: 'Thông tin khác',
          name: 'InformationDefault',
        },
        {
          icon: 'icon-location_on',
          text: 'Danh sách địa chỉ',
          name: 'Address',
        },

      ];
    }
  }

  getAutoNumber(autoNumber) {
    switch (this.funcID) {
      case 'CM0101':
        this.data.customerID = autoNumber;
        break;
      case 'CM0102':
        this.data.contactID = autoNumber;
        break;
      case 'CM0103':
        this.data.partnerID = autoNumber;
        break;
      case 'CM0104':
        this.data.competitorID = autoNumber;
        break;
    }
  }

  async ngAfterViewInit() {
    if(this.action == 'edit'){
      this.getListAddress(this.dialog.formModel.entityName, this.data.recID);
    }
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
  }

  beforeSave(op) {
    var data = [];
    if (this.data?.objectType == null || this.data?.objectType.trim() == '') {
      this.data.contactType = null;
      this.data.objectID = null;
      this.data.objectName = null;
      this.data.isDefault = false;
    }
    if (this.action === 'add' || this.action == 'copy') {
      op.method = 'AddCrmAsync';
      op.className = 'CustomersBusiness';
    } else {
      op.method = 'UpdateCrmAsync';
      op.className = 'CustomersBusiness';
    }
    data = [
      this.funcID == 'CM0101' ? this.data : null,
      this.funcID == 'CM0102' ? this.data : null,
      this.funcID == 'CM0103' ? this.data : null,
      this.funcID == 'CM0104' ? this.data : null,
      this.funcID,
      this.dialog.formModel.entityName,
      this.lstContact,
      this.action == 'edit' ? this.lstContactDeletes : [],
      this.listAddress,
      this.listAddressDelete,
    ];
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          var recID = res?.save?.recID;
          if (this.avatarChange) {
            this.imageUpload
              .updateFileDirectReload(recID)
              .subscribe((result) => {
                if (result) {
                  this.dialog.close([res.save]);
                } else {
                  this.dialog.close([res.save]);
                }
              });
          } else {
            this.dialog.close([res.save]);
          }
        }
      });
  }

  changeAvatar() {
    this.avatarChange = true;
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res && res.update) {
          var recID = res.update?.recID;
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          if (this.avatarChange) {
            this.imageUpload
              .updateFileDirectReload(recID)
              .subscribe((result) => {
                if (result) {
                  this.dialog.close(res.update);
                }
              });
          } else {
            this.dialog.close(res.update);
          }
        }
      });
  }

  async onSave() {
    if(this.funcID == 'CM0101'){
      this.data.customerName = this.data?.customerName;
    }else if(this.funcID == 'CM0103'){
      this.data.partnerName = this.data?.partnerName;
    }
    if (this.funcID == 'CM0102') {
      if (this.data.firstName != null && this.data.firstName.trim() != '') {
        if (this.data.lastName != null && this.data.lastName.trim() != '') {
          this.data.contactName =
            this.data.lastName.trim() + ' ' + this.data.firstName.trim();
        } else {
          this.data.contactName = this.data.firstName.trim();
        }
      } else {
        this.data.contactName = '';
      }
    }
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if (this.count > 0) {
      return;
    }
    if (this.funcID == 'CM0102') {
      if (this.data.mobile != null && this.data.mobile.trim() != '') {
        if (!this.checkEmailOrPhone(this.data.mobile, 'P')) return;
      }
      if (
        this.data.personalEmail != null &&
        this.data.personalEmail.trim() != ''
      ) {
        if (!this.checkEmailOrPhone(this.data.personalEmail, 'E')) return;
      }
    }

    // if (this.funcID != 'CM0102' && this.funcID != 'CM0104') {
    //   if (this.contactsPerson == null) {
    //     this.notiService.notifyCode('CM002'); //Chưa có msssg
    //     return;
    //   }
    // }
    if (this.data.phone != null && this.data.phone.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.phone, 'P')) return;
    }
    if (this.data.email != null && this.data.email.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.email, 'E')) return;
    }
    this.onSaveHanle();
  }

  async onSaveHanle() {
    if (this.funcID == 'CM0102') {
      if (this.lstContact != null && this.lstContact.length > 0) {
        var checkMainLst = this.lstContact.some(
          (x) => x.isDefault && x.recID != this.data.recID
        );
        if (checkMainLst) {
          if (this.data?.isDefault) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event.status == 'Y') {
                this.hanleSave();
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

  hanleSave() {
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  checkContactMain() {
    if (
      this.lstContact.some(
        (x) =>
          x.contactType.split(';').some((x) => x == '1') &&
          x.recID != this.data.recID
      )
    ) {
      return true;
    } else {
      if (this.data.split(';').some((x) => x == '1')) {
        return false;
      } else {
        return true;
      }
    }
  }

  checkEmailOrPhone(field, type) {
    if (type == 'E') {
      var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!field.toLowerCase().match(validEmail)) {
        this.notiService.notifyCode('SYS037');
        return false;
      }
    }
    if (type == 'P') {
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(02+([0-9]{9})))\b)/;
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

  lstAddressEmit(e){
    if (e != null && e.length > 0) {
      this.listAddress = e;
    }
  }

  lstAddressDeleteEmit(e){
    if (e != null && e.length > 0) {
      this.listAddressDelete = e;
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
    if (this.funcID == 'CM0101') {
      return data.customerName;
    } else if (this.funcID == 'CM0102') {
      return data.contactName;
    } else if (this.funcID == 'CM0103') {
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
