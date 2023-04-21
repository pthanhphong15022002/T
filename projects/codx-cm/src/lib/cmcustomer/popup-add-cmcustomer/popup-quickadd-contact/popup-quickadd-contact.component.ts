import { CodxCmService } from './../../../codx-cm.service';
import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  CacheService,
} from 'codx-core';
import { CM_Contacts } from '../../../models/cm_model';
import { tmpCrm } from '../../../models/tmpCrm.model';

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
  isCheckContactType = false;
  recIDCm: any;
  objectType: any;
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

    this.gridViewSetup = dt?.data?.gridViewSetup;
    if(this.type == 'formAdd'){
      this.contactType = '1';
    }else{
      this.contactType = dt?.data?.contactType
    }
    if (this.action == 'edit') {
      this.data = JSON.parse(JSON.stringify(dt?.data?.dataContact));
      this.contactType = this.data?.contactType;
      if(this.contactType.split(';').some(x=> x == "1")) this.isCheckContactType = true;
    }
  }
  ngOnInit(): void {

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
    if(this.type == 'formDetail'){
      this.data.contactType = this.contactType;
    }
    if (this.action == 'add' || this.action == 'copy') {
      data = [
        null,
        this.data,
        null,
        null,
        this.dialog.formModel.funcID,
        this.dialog.formModel.entityName,
        this.recIDCm,
        this.objectType
      ];

      this.cmSv.quickAddContacts(data).subscribe((res) => {
        if (res) {
          this.data = res;
          this.dialog.close(this.data);
        } else {
          this.dialog.close();
        }
      });
    } else {
      this.dialog.close(this.data);
    }
  }

  onSave() {
    if (this.data.firstName == null || this.data.firstName.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['FirstName'].headerText + '"'
      );
      return;
    }

    if(this.contactType == null || this.contactType.trim() == ''){
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ContactType'].headerText + '"'
      );
      return;
    }


    if (this.data.mobile != null && this.data.mobile.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.mobile, 'P')) return;
    }
    if (this.data.personalEmail != null && this.data.personalEmail.trim() != '') {
      if (!this.checkEmailOrPhone(this.data.personalEmail, 'E')) return;
    }

    this.onAdd();
  }

  valueChange(e) {
    this.contactType = e.data;
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
