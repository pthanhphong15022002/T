import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  ChangeDetectorRef,
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
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { PopupAddressComponent } from '../popup-address/popup-address.component';
import { PopupListContactsComponent } from './popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from './popup-quickadd-contact/popup-quickadd-contact.component';
import { CodxCmService } from '../../codx-cm.service';
import { BS_AddressBook } from '../../models/cm_model';

@Component({
  selector: 'lib-popup-add-cmcustomer',
  templateUrl: './popup-add-cmcustomer.component.html',
  styleUrls: ['./popup-add-cmcustomer.component.css'],
})
export class PopupAddCmCustomerComponent implements OnInit {
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
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
  listAddress: BS_AddressBook[] = [];
  formModelAddress: FormModel;
  listAddressDelete: BS_AddressBook[] = [];
  disableObjectID = true;
  lstContact = [];
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
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.action = dt.data[0];
    this.title = dt.data[1];
    if (this.action == 'copy') {
      this.recID = dt?.data[2];
      this.getListAddress(this.dialog.formModel.entityName, this.recID);
    }
    this.recID = dt?.data[2];
    if (this.action == 'edit') {
      if (this.data?.objectType == '1') {
        this.refValueCbx = 'CMCustomers';
      } else {
        this.refValueCbx = 'CMPartners';
      }
      this.cmSv.getContactByObjectID(this.data?.recID).subscribe((res) => {
        if (res) {
          this.contactsPerson = res;
        }
      });
      this.getListAddress(this.dialog.formModel.entityName, this.data.recID);
      this.getAvatar(this.data);
    }
  }

  ngOnInit(): void {
    if(this.data?.objectID){
      this.getListContactByObjectID(this.data?.objectID);
    }
    this.getFormModelAddress();
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
    if (this.action == 'copy') {
      this.data.customerID = null;
      this.data.contactID = null;
      this.data.competitorID = null;
      this.data.partnerID = null;
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
    this.data.industries = e.data;
  }

  valueChangeContact(e) {
    this.data[e.field] = e?.data;
    if (this.data.objectType && e.field == 'objectType') {
      this.disableObjectID = false;
      if (this.data.objectType == '1') {
        this.refValueCbx = 'CMCustomers';
      } else {
        this.refValueCbx = 'CMPartners';
      }
    }

    if (this.data.objectID && e.field == 'objectID') {
      this.getListContactByObjectID(this.data.objectID);
    }
  }

  beforeSave(op) {
    var data = [];
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
      this.contactsPerson?.recID,
      this.funcID == 'CM0101' ? '1' : this.funcID == 'CM0103' ? '3' : null,
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
        this.imageAvatar.clearData();
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.imageAvatar.clearData();
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
        } else {
          this.dialog.close();
        }
      });
  }

  async onSave() {
    if (this.funcID == 'CM0102') {
      if (this.data.objectType) {
        if (
          this.data.contactType == null ||
          this.data.contactType.trim() == ''
        ) {
          this.notiService.notifyCode(
            'SYS009',
            0,
            '"' + this.gridViewSetup['ContactType'].headerText + '"'
          );
          return;
        }
        if (this.data.objectID == null || this.data.objectID.trim() == '') {
          this.notiService.notifyCode(
            'SYS009',
            0,
            '"' + this.gridViewSetup['ObjectID'].headerText + '"'
          );
          return;
        }
      }
      if (this.data.firstName == null || this.data.firstName.trim() == '') {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetup['FirstName'].headerText + '"'
        );
        return;
      }
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

    if (this.funcID != 'CM0102' && this.funcID != 'CM0104') {
      if (this.contactsPerson == null) {
        this.notiService.notifyCode('CM002'); //Chưa có msssg
        return;
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
    if (this.funcID == 'CM0102') {
      if (this.lstContact != null && this.lstContact.length > 0) {
        var checkMainLst = this.lstContact.some(
          (x) =>
            x.contactType.split(';').some((x) => x == '1') &&
            x.recID != this.data.recID
        );
        if (checkMainLst) {
          if (this.data?.contactType.split(';').some((x) => x == '1')) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event.status == 'Y') {
                this.saveFileAndSaveCM();
              }
            });
          } else {
            this.saveFileAndSaveCM();
          }
        } else {
          if (!this.data.contactType.split(';').some((x) => x == '1')) {
            this.notiService.notifyCode('CM002');
          } else {
            this.saveFileAndSaveCM();
          }
        }
      } else {
        this.saveFileAndSaveCM();
      }
    } else {
      this.saveFileAndSaveCM();
    }
  }

  async saveFileAndSaveCM() {
    {
      if (this.imageAvatar?.fileUploadList?.length > 0) {
        (await this.imageAvatar.saveFilesObservable()).subscribe((res) => {
          // save file
          if (res) {
            this.hanleSave();
          }
        });
      } else {
        this.hanleSave();
      }
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
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
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

  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
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

  getFormModelAddress() {
    let dataModel = new FormModel();
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    this.formModelAddress = dataModel;
  }

  openPopupAddress(data = new BS_AddressBook(), action = 'add') {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    var title =
      (action == 'add' ? this.moreFuncAdd : this.moreFuncEdit) +
      ' ' +
      this.gridViewSetup?.Address?.headerText;
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('CMAddressBook', 'grvCMAddressBook')
      .subscribe((res) => {
        if (res) {
          var obj = {
            title: title,
            gridViewSetup: res,
            action: action,
            data: data,
            listAddress: this.listAddress,
          };
          var dialog = this.callFc.openForm(
            PopupAddressComponent,
            '',
            500,
            550,
            '',
            obj,
            '',
            opt
          );
          dialog.closed.subscribe((e) => {
            if (e && e.event != null) {
              if (e?.event?.adressType) {
                var address = new BS_AddressBook();
                address = e.event;
                var index = this.listAddress.findIndex(
                  (x) => x.recID != null && x.recID == address.recID
                );
                var checkCoincide = this.listAddress.some(
                  (x) =>
                    x.recID != address.recID &&
                    x.adressType == address.adressType &&
                    x.street == address.street &&
                    x.countryID == address.countryID &&
                    x.provinceID == address.provinceID &&
                    x.districtID == address.districtID &&
                    x.regionID == x.regionID
                );
                var check = this.listAddress.some(
                  (x) =>
                    x.recID != address.recID &&
                    x.adressType == '1' &&
                    address.adressType == '1'
                );
                if (!checkCoincide && !check) {
                  if (index != -1) {
                    this.listAddress.splice(index, 1);
                  }
                  this.listAddress.push(address);
                } else {
                  this.notiService.notifyCode(
                    'CM003',
                    0,
                    '"' + this.gridViewSetup['Address'].headerText + '"'
                  );
                }
              }
            }
          });
        }
      });
  }

  removeAddress(data, index) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.listAddress.splice(index, 1);
        this.listAddressDelete.push(data);
      }
    });
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
          500,
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
