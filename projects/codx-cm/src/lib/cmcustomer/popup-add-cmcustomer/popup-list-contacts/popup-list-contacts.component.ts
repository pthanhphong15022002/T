import { CodxCmService } from './../../../codx-cm.service';
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
  contact: any;
  lstSearch = [];
  type: any;
  contactType = '';
  recIDCm = '';
  objectType = '';
  objectName = '';
  gridViewSetup: any;
  lstContactCm = [];
  loaded: boolean;
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
    if (this.type == 'formAdd') {
      this.contactType = '1';
    }
    this.recIDCm = dt?.data?.recIDCm;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.objectType = dt?.data?.objectType;
    this.objectName = dt?.data?.objectName;
    this.lstContactCm = dt?.data?.lstContactCm;
  }

  ngOnInit(): void {
    this.loaded = false;
    this.cmSv.getContacts().subscribe((res) => {
      if (res != null && res.length > 0) {
        this.lstContacts = res;
        this.lstSearch = this.lstContacts;
        this.changeContacts(0, this.lstSearch[0]);
      }
      this.loaded = true;

    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
  }

  onSave() {
    if (this.type == 'formDetail') {
      this.contact.contactType = this.contactType;
      this.contact.objectID = this.recIDCm;
      this.contact.objectType = this.objectType;
      this.contact.objectName = this.objectName;

      if (
        this.contact.contactType == null ||
        this.contact.contactType.trim() == ''
      ) {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetup['ContactType'].headerText + '"'
        );
        return;
      }
      if (this.lstContactCm != null) {
        if (
          this.lstContactCm.some(
            (x) =>
              x.contactType.split(';').some((x) => x == '1') &&
              x.recID != this.contact.recID
          )
        ) {
          if (this.contactType.split(';').some((x) => x == '1')) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notiService.alertCode('CM001').subscribe((x) => {
              if (x.event.status == 'Y') {
                this.cmSv
                  .updateContactByPopupListCt(this.contact)
                  .subscribe((res) => {
                    if (res) {
                      this.dialog.close(res);
                    }
                  });
              }
            });
          } else {
            this.cmSv
              .updateContactByPopupListCt(this.contact)
              .subscribe((res) => {
                if (res) {
                  this.dialog.close(res);
                }
              });
          }
        } else {
          if (!this.contactType.split(';').some((x) => x == '1')) {
            this.notiService.notifyCode('CM002');
          } else {
            this.cmSv
              .updateContactByPopupListCt(this.contact)
              .subscribe((res) => {
                if (res) {
                  this.dialog.close(res);
                }
              });
          }
        }
      } else {
        this.cmSv.updateContactByPopupListCt(this.contact).subscribe((res) => {
          if (res) {
            this.dialog.close(res);
          }
        });
      }
    } else {
      if (this.contact != null) this.dialog.close(this.contact);
      else return;
    }
  }

  valueChange(e) {
    this.contactType = e.data;
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
          600,
          500,
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
