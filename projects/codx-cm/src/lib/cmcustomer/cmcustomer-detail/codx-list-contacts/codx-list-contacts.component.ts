import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertConfirmInputConfig, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { PopupQuickaddContactComponent } from '../../popup-add-cmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';
import { PopupListContactsComponent } from '../../popup-add-cmcustomer/popup-list-contacts/popup-list-contacts.component';

@Component({
  selector: 'codx-list-contacts',
  templateUrl: './codx-list-contacts.component.html',
  styleUrls: ['./codx-list-contacts.component.css']
})
export class CodxListContactsComponent implements OnInit{

  @Input() objectID: any;
  @Input() funcID: any;
  @Input() objectName: any;
  @Input() hidenMF = true;
  @Output() contactPerson = new EventEmitter<any>();
  listContacts = [];
  formModelContact: FormModel;
  moreFuncEdit = '';
  moreFuncAdd = '';
  loaded: boolean;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ){

  }

  async ngOnInit() {
    this.getListContactByObjectID(this.objectID);
    this.formModelContact = await this.cmSv.getFormModel('CM0102');
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
  }

  getListContactByObjectID(objectID) {
    this.loaded = false;
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listContacts = res;
        var contactPerson = this.listContacts.find((x) =>
          x.contactType.split(';').some((x) => x == '1')
        );
        this.contactPerson.emit(contactPerson);
      }
      this.loaded = true;

    });
  }

  clickMFContact(e, data) {
    this.moreFuncEdit = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.clickAddContact('edit', data, this.moreFuncEdit);
        break;
      case 'CM0102_2':
      case 'CM0102_3':
        this.deleteContactToCM(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
      case 'CM0102_1':
        this.clickAddContact('editType', data, this.moreFuncEdit);
        break;
    }
  }

  changeDataMFContact(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
          case 'SYS004':
          case 'SYS002':
          case 'SYS02':
          case 'SYS04':
            res.disabled = true;
            break;
          case 'CM0102_2':
            if (this.funcID == 'CM0103') res.disabled = true;
            break;
          case 'CM0102_3':
            if (this.funcID == 'CM0101') res.disabled = true;
            break;
        }
      });
    }
  }

  //#region Crud contacts crm
  clickAddContact(action, data, title) {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    var title = title;
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup(dataModel.formName, dataModel.gridViewName)
      .subscribe((res) => {
        var obj = {
          moreFuncName: title,
          action: action,
          dataContact: data,
          type: 'formDetail',
          recIDCm: this.objectID,
          objectType: this.funcID == 'CM0101' ? '1' : '3',
          objectName:this.objectName,
          gridViewSetup: res,
          listContacts: this.listContacts,
        };
        var dialog = this.callFc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          action != 'editType' ? 500 : 100,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            this.getListContactByObjectID(this.objectID);
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

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
          type: 'formDetail',
          recIDCm: this.objectID,
          objectName:this.objectName,
          objectType: this.funcID == 'CM0101' ? '1' : '3',
          gridViewSetup: res,
          lstContactCm: this.listContacts,
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
            this.getListContactByObjectID(this.objectID);
          }
        });
      });
  }

  deleteContactToCM(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        var contactPerson = this.listContacts.find((x) =>
          x.contactType.split(';').some((x) => x == '1')
        );
        if (!(data.recID == contactPerson.recID)) {
          this.cmSv.updateContactCrm(data.recID).subscribe((res) => {
            if (res) {
              // this.getListContactByObjectID(this.objectID);
              this.listContacts = this.cmSv.loadList(data, this.listContacts, 'delete');
              this.notiService.notifyCode('SYS008');
              this.changeDetectorRef.detectChanges();
            }
          });
        } else {
          this.notiService.notifyCode('CM004');
          return;
        }
      }
    });
  }

  //#endregion
}
