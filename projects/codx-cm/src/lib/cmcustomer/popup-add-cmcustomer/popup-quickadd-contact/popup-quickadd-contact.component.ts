import { CodxCmService } from './../../../codx-cm.service';
import { tmpCrm, CM_Contacts } from './../../../models/tmpCrm.model';
import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  CacheService,
} from 'codx-core';

@Component({
  selector: 'lib-popup-quickadd-contact',
  templateUrl: './popup-quickadd-contact.component.html',
  styleUrls: ['./popup-quickadd-contact.component.css'],
})
export class PopupQuickaddContactComponent implements OnInit {
  dialog: any;
  data = new CM_Contacts();
  firstName: any;
  lastName: any;
  gridViewSetup: any;
  title = '';
  action = '';
  contact: CM_Contacts;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data[0];
    this.action = dt?.data[1];
    if (this.action == 'edit') {
      this.data = JSON.parse(JSON.stringify(dt?.data[2]));
      this.getLastAndFirstName(this.data.contactName);
    }
  }
  ngOnInit(): void {
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
  }

  getLastAndFirstName(contactName) {
    if (contactName != null) {
      var nameArr = contactName.split(' ');
      if (nameArr != null && nameArr.length > 1) {
        this.lastName = nameArr.slice(0, -1).join(' ');
        this.firstName = nameArr[nameArr.length - 1];
      } else {
        this.firstName = contactName;
      }
    }
  }

  beforeSave(op) {
    var data = [];
    op.method = 'AddCrmAsync';
    op.className = 'CustomersBusiness';

    op.data = data;
    return true;
  }

  onAdd() {
    var data = [];
    if (this.firstName != null && this.firstName.trim() != '') {
      if (this.lastName != null && this.lastName.trim() != '') {
        this.data.contactName = this.lastName.trim() + ' ' + this.firstName.trim();
      } else {
        this.data.contactName = this.firstName.trim();
      }
    } else {
      this.data.contactName = '';
    }
    if (this.action == 'add' || this.action == 'copy') {
      data = [
        this.data,
        this.dialog.formModel.formName,
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName,
      ];

      this.cmSv.quickAddContacts(data).subscribe((res) => {
        if (res) {
          this.contact = res;
          this.dialog.close(this.contact);
        } else {
          this.dialog.close();
        }
      });
    } else {
      this.dialog.close(this.data);
    }
  }

  onSave() {
    if (this.firstName == null || this.firstName.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ContactName'].headerText + '"'
      );
      return;
    }
    if (this.data.phoneNumber != null && this.data.phoneNumber.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.phoneNumber, 'P')) return;
    }
    if (this.data.email != null && this.data.email.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.email, 'E')) return;
    }

    this.onAdd();
  }

  valueChange(e) {
    if (e.field == 'firstName' || e.field == 'lastName') {
      this.firstName = e.field == 'firstName' ? e.data : this.firstName;
      this.lastName = e.field == 'lastName' ? e.data : this.lastName;
    } else {
      this.data[e.field] = e.data;
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
