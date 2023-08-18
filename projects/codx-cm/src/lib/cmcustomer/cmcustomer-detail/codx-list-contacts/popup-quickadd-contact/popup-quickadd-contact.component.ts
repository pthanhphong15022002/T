import { firstValueFrom } from 'rxjs';
import { CodxCmService } from '../../../../codx-cm.service';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  CacheService,
  AlertConfirmInputConfig,
  DataRequest,
  Util,
} from 'codx-core';
import { CM_Contacts } from '../../../../models/cm_model';
import { tmpCrm } from '../../../../models/tmpCrm.model';
import { CodxListContactsComponent } from '../codx-list-contacts.component';

@Component({
  selector: 'lib-popup-quickadd-contact',
  templateUrl: './popup-quickadd-contact.component.html',
  styleUrls: ['./popup-quickadd-contact.component.css'],
})
export class PopupQuickaddContactComponent implements OnInit {
  @ViewChild('contactTemp') contactTemp: CodxListContactsComponent;
  dialog: any;
  data = new CM_Contacts();
  gridViewSetup: any;
  title = '';
  action = '';
  type: any;
  contactType = '';
  isDefault = false;
  isCheckContactType = false;
  recIDCm: any;
  objectType: any;
  objectName: any;
  listContacts = [];
  nameDefault: any;
  radioCheckedContact = true;
  fieldContact = { text: 'contactName', value: 'recID' };
  lstContactCbx = [];
  contactID: any;
  actionOld = '';
  customerID: any;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private changeDef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.moreFuncName;
    this.action = dt?.data?.action;
    this.actionOld = this.action;
    this.type = dt?.data?.type;
    this.recIDCm = dt?.data?.recIDCm;
    this.objectType = dt?.data?.objectType;
    this.objectName = dt?.data?.objectName;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.listContacts = dt?.data?.listContacts;
    this.contactType = dt?.data?.contactType;
    this.customerID = dt?.data?.customerID;
    if (this.action != 'add') {
      this.data = JSON.parse(JSON.stringify(dt?.data?.dataContact));
      this.isDefault = this.data.isDefault;
      this.contactType = this.data?.contactType;
    }
  }
  async ngOnInit() {
    if (this.action != 'add') {
      this.radioCheckedContact = false;
    }
    if (this.radioCheckedContact) {
      this.action = 'edit';
      if (this.actionOld == 'add') this.default();
      this.lstContactCbx = await this.loadContact();
    }
    if (this.action == 'add') {
      this.default();
    }
  }

  async loadContact() {
    var options = new DataRequest();
    options.entityName = 'CM_Contacts';
    if (this.objectType == '4') {
      options.predicates = 'ObjectID==@0';
      options.dataValues =
        this.customerID != null && this.customerID?.trim() != ''
          ? this.customerID
          : Util.uid();

      this.action = this.actionOld;
    } else {
      options.predicates = 'ObjectID==null && ObjectName==null';
    }
    options.pageLoading = false;
    var lst = await firstValueFrom(this.cmSv.loadDataAsync('CM', options));

    if (lst != null) lst = this.checkListContact(lst);
    return lst;
  }

  checkListContact(lst = []) {
    if (this.objectType == '4') {
      lst = lst.filter(
        (contact1) =>
          !this.listContacts.some(
            (contact2) => contact2.refID === contact1.recID
          )
      );
    } else {
      lst = lst.filter(
        (contact1) =>
          !this.listContacts.some(
            (contact2) => contact2.recID === contact1.recID
          )
      );
    }

    return lst;
  }

  default() {
    this.contactType = '0';
    if (this.listContacts != null && this.listContacts.length > 0) {
      if (this.listContacts.some((x) => x.isDefault == true)) {
        this.isDefault = false;
      } else {
        this.isDefault = true;
      }
    } else {
      this.isDefault = true;
    }
  }
  //#region save
  beforeSave(type) {
    if (this.type == 'formDetail') {
      this.data.contactType = this.contactType;
      this.data.isDefault = this.isDefault;
      this.data.objectID = this.recIDCm;
      this.data.objectType = this.objectType;
      this.data.objectName = this.objectName;
    }
    if (this.action == 'add') {
      this.onAdd(type);
    } else {
      this.onEdit(type);
    }
  }

  onAdd(type) {
    var data = [];
    data = [
      this.data,
      this.dialog.formModel.formName,
      this.dialog.formModel.funcID,
      this.dialog.formModel.entityName,
    ];
    if(this.data?.role == null || this.data?.role?.trim() == ''){
      this.data.role = null;
    }
    if (
      this.type == 'formDetail' ||
      (this.type == 'formAdd' && this.objectType != '4')
    ) {
      this.cmSv.quickAddContacts(data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.isDefault = this.isDefault;
          this.data.contactType = this.contactType;
          this.data.objectID = this.recIDCm;
          this.data.objectType = this.objectType;
          this.data.objectName = this.objectName;
          if (type == 'save') {
            this.dialog.close(this.data);
          } else {
            this.deleteContact(this.data);
          }
          this.notiService.notifyCode('SYS006');
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS023');
        }
      });
    } else {
      this.data.recID = Util.uid();
      this.data.isDefault = this.isDefault;
      this.data.contactType = this.contactType;
      this.data.objectID = this.recIDCm;
      this.data.objectType = this.objectType;
      this.data.objectName = this.objectName;
      this.data.assign = true;
			this.data.delete = true;
			this.data.write = true;
			this.data.share = true;
      if (type == 'save') {
        this.dialog.close(this.data);
      } else {
        this.deleteContact(this.data);
      }
    }
  }

  onEdit(type) {
    if (this.type == 'formDetail') {
      this.cmSv.updateContactByPopupListCt(this.data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.isDefault = this.isDefault;
          this.data.contactType = this.contactType;
          this.data.objectID = this.recIDCm;
          this.data.objectType = this.objectType;
          this.data.objectName = this.objectName;
          if (type == 'save') {
            this.dialog.close(this.data);
          } else {
            this.deleteContact(this.data);
          }
          this.notiService.notifyCode('SYS007');
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS021');
        }
      });
    } else {
      this.data.isDefault = this.isDefault;
      this.data.contactType = this.contactType;
      this.data.objectID = this.recIDCm;
      this.data.objectType = this.objectType;
      this.data.objectName = this.objectName;
      if (type == 'save') {
        this.dialog.close(this.data);
      } else {
        this.deleteContact(this.data);
      }
      this.notiService.notifyCode('SYS007');
    }
  }

  onSave(type) {
    if(this.data.contactName == null || this.data.contactName.trim() == ''){
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup?.ContactName?.headerText + '"'
      );
      return;
    }
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

    if (this.listContacts != null) {
      if (
        this.listContacts.some((x) => x.isDefault && x.recID != this.data.recID)
      ) {
        if (this.isDefault) {
          this.nameDefault = this.listContacts.find(
            (x) => x.isDefault
          )?.contactName;
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          this.notiService
            .alertCode('CM005', null, "'" + this.nameDefault + "'")
            .subscribe((x) => {
              if (x.event && x.event?.status) {
                if (x.event.status == 'Y') {
                  this.beforeSave(type);
                }
              }
            });
        } else {
          this.beforeSave(type);
        }
      } else {
        this.beforeSave(type);
      }
    } else {
      this.beforeSave(type);
    }
  }
  //#endregion
  valueChange(e) {
    if (e.field == 'isDefault') {
      this.isDefault = e?.data;
    } else {
      if (e.field == 'contactType') {
        this.contactType = e?.data;
      } else if (e.field != 'allowEmail' && e.field != 'allowCall') {
        this.data[e.field] =
          e?.data != null && e?.data?.trim() != '' ? e?.data?.trim() : null;
      } else {
        this.data[e.field] = e?.data;
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
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01|02+([0-9]{9})))\b)/;
      if (!field.toLowerCase().match(validPhone)) {
        this.notiService.notifyCode('RS030');
        return false;
      }
    }
    return true;
  }

  async changeRadio(e) {
    if (e.field === 'yes' && e.component.checked === true) {
      this.radioCheckedContact = true;
      this.contactID = null;
      this.default();
      this.action = 'edit';
      if (this.type == 'formDetail') {
        this.lstContactCbx = await this.loadContact();
      }
    } else if (e.field === 'no' && e.component.checked === true) {
      this.radioCheckedContact = false;
      this.default();
      this.data = new CM_Contacts();
      this.action = this.actionOld;
    }
  }

  cbxContact(e) {
    if (e != null) {
      if (this.contactID != e) {
        this.contactID = e;
        if (this.contactID != null && this.contactID.trim() != '') {
          var find = this.lstContactCbx.findIndex(
            (x) => x.recID == this.contactID
          );
          if (find != -1) {
            this.data = JSON.parse(JSON.stringify(this.lstContactCbx[find]));
            if (this.objectType == '4') {
              this.data.recID = Util.uid();
              this.data.refID = this.contactID;
              this.data.contactID = null;
            }
          }
        }
      }
    }
  }

  deleteContact(data) {
    if (data != null) {
      var index = -1;
      if (this.objectType == '4') {
        index = this.lstContactCbx.findIndex((x) => x.recID == data?.refID);
      } else {
        index = this.lstContactCbx.findIndex((x) => x.recID == data?.recID);
      }
      if (index != -1) {
        this.lstContactCbx.splice(index, 1);
        this.lstContactCbx = JSON.parse(JSON.stringify(this.lstContactCbx));
      }
      if (data.isDefault) {
        this.listContacts.forEach((element) => {
          element.isDefault = false;
        });
      }
      this.listContacts.push(data);
      this.contactType = '0';
      this.contactID = null;
      if (this.listContacts != null && this.listContacts.length > 0) {
        if (this.listContacts.some((x) => x.isDefault == true)) {
          this.isDefault = false;
        } else {
          this.isDefault = true;
        }
      } else {
        this.isDefault = true;
      }
      this.cmSv.contactSubject.next(this.listContacts);

      // this.contactTemp.lstContactEmit.emit(this.listContacts);
      this.listContacts = this.cmSv.bringDefaultContactToFront(
        this.listContacts
      );
      this.data = new CM_Contacts();
      this.default();
      this.changeDef.detectChanges();
    }
  }
}
