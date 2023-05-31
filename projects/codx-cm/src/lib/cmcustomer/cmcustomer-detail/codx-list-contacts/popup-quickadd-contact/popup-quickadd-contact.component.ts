import { CodxCmService } from '../../../../codx-cm.service';
import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  CacheService,
  AlertConfirmInputConfig,
} from 'codx-core';
import { CM_Contacts } from '../../../../models/cm_model';
import { tmpCrm } from '../../../../models/tmpCrm.model';

@Component({
  selector: 'lib-popup-quickadd-contact',
  templateUrl: './popup-quickadd-contact.component.html',
  styleUrls: ['./popup-quickadd-contact.component.css'],
})
export class PopupQuickaddContactComponent implements OnInit {
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
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.moreFuncName;
    this.action = dt?.data?.action;
    this.type = dt?.data?.type;
    this.recIDCm = dt?.data?.recIDCm;
    this.objectType = dt?.data?.objectType;
    this.objectName = dt?.data?.objectName;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.listContacts = dt?.data?.listContacts;
    this.contactType = dt?.data?.contactType;
    if (this.action == 'edit' || this.action == 'editType') {
      this.data = JSON.parse(JSON.stringify(dt?.data?.dataContact));
      this.isDefault = this.data.isDefault;
      this.contactType = this.data?.contactType;
    }
  }
  ngOnInit(): void {
    if (this.action == 'add') {
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

  beforeSave(op) {
    var data = [];
    op.method = 'AddCrmAsync';
    op.className = 'CustomersBusiness';

    op.data = data;
    return true;
  }

  onAdd() {
    var data = [];
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
    if (this.type == 'formDetail') {
      this.data.contactType = this.contactType;
      this.data.isDefault = this.isDefault;
      this.data.objectID = this.recIDCm;
      this.data.objectType = this.objectType;
      this.data.objectName = this.objectName;
    }
    if (this.action == 'add') {
      data = [
        this.data,
        this.dialog.formModel.formName,
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName,
      ];

      this.cmSv.quickAddContacts(data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.isDefault = this.isDefault;
          this.data.contactType = this.contactType;
          this.data.objectID = this.recIDCm;
          this.data.objectType = this.objectType;
          this.data.objectName = this.objectName;
          this.dialog.close(this.data);
          this.notiService.notifyCode('SYS006');
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS023');
        }
      });
    } else {
      if (this.type == 'formDetail') {
        this.cmSv.updateContactByPopupListCt(this.data).subscribe((res) => {
          if (res) {
            this.data = res;
            this.data.isDefault = this.isDefault;
            this.data.contactType = this.contactType;
            this.data.objectID = this.recIDCm;
            this.data.objectType = this.objectType;
            this.data.objectName = this.objectName;
            this.dialog.close(this.data);
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
        this.dialog.close(this.data);
        this.notiService.notifyCode('SYS007');
      }
    }
  }

  onSave() {
    if (this.contactType == null || this.contactType.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ContactType'].headerText + '"'
      );
      return;
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
    }else{
      this.data.mobile = null;
    }
    if (
      this.data.personalEmail != null &&
      this.data.personalEmail.trim() != ''
    ) {
      if (!this.checkEmailOrPhone(this.data.personalEmail, 'E')) return;
    }else{
      this.data.personalEmail = null;
    }

      if (this.listContacts != null) {
        if (
          this.listContacts.some(
            (x) => x.isDefault && x.recID != this.data.recID
          )
        ) {
          if (this.isDefault) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event.status == 'Y') {
                this.onAdd();
              }
            });
          } else {
            this.onAdd();
          }
        } else {
          this.onAdd();
        }
      } else {
        this.onAdd();
      }

  }

  valueChange(e) {
    if (e.field == 'isDefault') {
      this.isDefault = e.data;
    } else {
      this.contactType = e.data;
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
}
