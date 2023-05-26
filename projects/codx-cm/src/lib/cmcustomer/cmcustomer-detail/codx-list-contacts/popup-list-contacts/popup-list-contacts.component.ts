import { CodxCmService } from '../../../../codx-cm.service';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import {
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  CacheService,
  NotificationsService,
  AlertConfirmInputConfig,
} from 'codx-core';
import { PopupQuickaddContactComponent } from '../popup-quickadd-contact/popup-quickadd-contact.component';
import { CM_Contacts } from 'projects/codx-cm/src/lib/models/cm_model';

@Component({
  selector: 'lib-popup-list-contacts',
  templateUrl: './popup-list-contacts.component.html',
  styleUrls: ['./popup-list-contacts.component.css'],
})
export class PopupListContactsComponent implements OnInit {
  dialog: any;
  data: any;

  lstContacts = [];
  currentContact = 0;
  moreFuncAdd = '';
  contact: CM_Contacts = new CM_Contacts();
  lstSearch = [];
  type: any;
  contactType = '';
  recIDCm = '';
  objectType = '';
  objectName = '';
  gridViewSetup: any;
  lstContactCm = [];
  loaded: boolean;
  fieldContact = { text: 'contactName', value: 'recID' };
  contactID: any;
  isDefault = false;
  constructor(
    private cache: CacheService,
    private callFc: CallFuncService,
    private changeDet: ChangeDetectorRef,
    private cmSv: CodxCmService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.type;

    this.recIDCm = dt?.data?.recIDCm;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.objectType = dt?.data?.objectType;
    this.objectName = dt?.data?.objectName;
    this.lstContactCm = dt?.data?.lstContactCm;
  }

  ngOnInit(): void {
    this.cmSv.getContacts().subscribe((res) => {
      if (res != null && res.length > 0) {
        this.lstContacts = res;
      }
    });
    this.contactType = '0';

    if (this.lstContactCm != null && this.lstContactCm.length > 0) {
      if (this.lstContactCm.some((x) => x.isDefault == true)) {
        this.isDefault = false;
      } else {
        this.isDefault = true;
      }
    } else {
      this.isDefault = true;
    }
  }

  onSave(type) {
    this.contact.isDefault = this.isDefault;
    this.contact.contactType = this.contactType;
    this.contact.objectID = this.recIDCm;
    this.contact.objectType = this.objectType;
    this.contact.objectName = this.objectName;
    if (this.contactType == null || this.contactType.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ContactType'].headerText + '"'
      );
      return;
    }
    if (this.contactID == null || this.contactID.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['RecID'].headerText + '"'
      );
      return;
    }
    if (this.lstContactCm != null) {
      if (
        this.lstContactCm.some(
          (x) => x.isDefault && x.recID != this.contact.recID
        )
      ) {
        if (this.isDefault) {
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          this.notiService.alertCode('CM001').subscribe((x) => {
            if (x.event.status == 'Y') {
              this.onAdd(type);
            }
          });
        } else {
          this.onAdd(type);
        }
      } else {
        this.onAdd(type);
      }
    } else {
      this.onAdd(type);
    }
  }

  onAdd(type) {
    if (this.type == 'formDetail') {
      this.cmSv.updateContactByPopupListCt(this.contact).subscribe((res) => {
        if (res) {
          if (type == 'save') {
            this.dialog.close(res);
            this.notiService.notifyCode('SYS006');
          } else {
            this.deleteContact(res);
            this.notiService.notifyCode('SYS006');
          }
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS023');
        }
      });
    } else {
      if (this.contact != null) {
        if (type == 'save') {
          this.dialog.close(this.contact);
          this.notiService.notifyCode('SYS006');
        } else {
          this.notiService.notifyCode('SYS006');
          this.deleteContact(this.contact);
        }
      } else {
        this.dialog.close();
        this.notiService.notifyCode('SYS023');
      }
    }
  }

  deleteContact(data) {
    if (data != null) {
      var index = this.lstContacts.findIndex((x) => x.recID == data?.recID);
      if (index != -1) {
        this.lstContacts.splice(index, 1);
        this.lstContacts = JSON.parse(JSON.stringify(this.lstContacts));
      }
      if (data.isDefault) {
        this.lstContactCm.forEach((element) => {
          element.isDefault = false;
        });
      }
      this.lstContactCm.push(data);
      this.contactType = '0';
      this.contactID = null;
      if (this.lstContactCm != null && this.lstContactCm.length > 0) {
        if (this.lstContactCm.some((x) => x.isDefault == true)) {
          this.isDefault = false;
        } else {
          this.isDefault = true;
        }
      } else {
        this.isDefault = true;
      }
      this.changeDet.detectChanges();
    }
  }

  valueChange(e) {
    if (e.field == 'contactType') {
      this.contactType = e.data;
    } else {
      this.isDefault = e.data;
    }
  }
  cbxContact(e) {
    if (e != null) {
      if (this.contactID != e) {
        this.contactID = e;
        if (this.contactID != null && this.contactID.trim() != '') {
          var find = this.lstContacts.findIndex(
            (x) => x.recID == this.contactID
          );
          if (find != -1) {
            this.contact = this.lstContacts[find];
          }
        }
      }
    }
  }
  changeContacts(index, item) {
    this.currentContact = index;
    this.contact = item;
    this.contact.contactType = this.contactType;
    this.changeDet.detectChanges();
  }

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
          type: this.type == 'formAdd' ? this.type : 'formList',
          gridViewSetup: res,
          contactType: this.contactType,
        };
        var dialog = this.callFc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          600,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            //gán tạm thời để xử lí liên hệ chính
            if (e.event?.recID) {
              this.contact = e.event;
              this.contactType = this.contact.contactType;
              this.lstContacts.push(this.contact);
              this.lstSearch = this.lstContacts;
              var index = this.lstSearch.findIndex(
                (x) => x.recID == this.contact.recID
              );
              if (index > -1) {
                this.changeContacts(index, this.contact);
              } else {
                this.changeContacts(0, this.lstSearch[0]);
              }
            } else {
              this.changeContacts(0, this.lstSearch[0]);
            }
            this.changeDet.detectChanges();
          }
        });
      });
  }

  searchName(searchTerm) {
    var search = [];
    if (searchTerm.trim() == '' || searchTerm == null) {
      this.lstSearch = this.lstContacts;
      this.changeContacts(0, this.lstSearch[0]);
      return;
    }

    this.cmSv.searchContacts(searchTerm).subscribe((res) => {
      if (res && res.length > 0) {
        search = res;
        this.lstSearch = search;
        this.changeContacts(0, this.lstSearch[0]);
      } else {
        this.lstSearch = [];
        this.contact = null;
      }
      this.changeDet.detectChanges();
    });
  }
}
