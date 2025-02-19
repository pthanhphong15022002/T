import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { PopupQuickaddContactComponent } from './popup-quickadd-contact/popup-quickadd-contact.component';
import { PopupListContactsComponent } from './popup-list-contacts/popup-list-contacts.component';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'codx-list-contacts',
  templateUrl: './codx-list-contacts.component.html',
  styleUrls: ['./codx-list-contacts.component.css'],
})
export class CodxListContactsComponent implements OnInit {
  @Input() objectID: any;
  @Input() funcID: any;
  @Input() objectName: any;
  @Input() objectType: any;
  @Input() hidenMF = true;
  @Input() hidenMFAdd = false;
  @Input() type = '';
  @Input() isConvertLeadToCus = false;
  @Input() selectAll: boolean = false;
  @Input() formModel: FormModel;
  @Input() lstContactRef = [];
  @Input() customerID: any;
  @Input() isRole = true;
  @Output() lstContactEmit = new EventEmitter<any>();
  @Output() lstContactDeleteEmit = new EventEmitter<any>();
  @Output() objectConvert = new EventEmitter<any>();
  @Output() contactEvent = new EventEmitter<any>();

  @Input() listContacts = [];
  formModelContact: FormModel = {
    formName: 'CMContacts',
    gridViewName: 'grvCMContacts',
    entityName: 'CM_Contacts',
  };
  moreFuncEdit = '';
  moreFuncAdd = '';
  loaded: boolean;
  request = new DataRequest();
  predicates = 'ObjectID=@0';
  dataValues = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'ContactsBusiness';
  method = 'GetListContactAsync';
  isButton = true;
  currentRecID = '';
  lstConvertContact = [];
  isCheckedAll: boolean = false;
  id: any;
  placeholder = 'Nhập vai trò...';
  user: any;
  userID: any;
  isLoad = true;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private codxShareSv: CodxShareService
  ) {
    this.user = this.authstore.get();
    this.userID = this.user?.userID;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    if (changes['objectID']) {
      if (
        changes['objectID']?.currentValue != null &&
        changes['objectID']?.currentValue?.trim() != ''
      ) {
        if (this.isRole) {
          this.listContacts = [];
          if (changes['objectID']?.currentValue == this.id) return;
          this.id = changes['objectID']?.currentValue;
          this.loaded = false;
          this.getListContacts();
        }else{
          this.id = changes['objectID']?.currentValue;
        }
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }
  }

  async ngOnInit() {
    // this.getListContacts();
    // this.formModelContact = await this.cmSv.getFormModel('CM0102');
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
    this.cmSv.contactSubject.subscribe((res) => {
      if (res != null) {
        this.lstContactEmit.emit(res);
        if (res != null && res.length > 0) {
          var index = res.findIndex((x) => x.isDefault);
          if (index != -1) {
            this.contactEvent.emit({ data: res[index], action: 'add' });
          } else {
            this.contactEvent.emit({ data: null, action: 'add' });
          }
        }
        // this.listContacts.push(Object.assign({}, res));
        // this.lstContactEmit.emit(this.listContacts);
        this.cmSv.contactSubject.next(null);
      }
    });
    if (this.objectType == '4') {
      this.cache
        .gridViewSetup('CMContacts', 'grvCMContacts')
        .subscribe((res) => {
          if (res) {
            this.placeholder = res?.Role?.description ?? this.placeholder;
          }
        });
    }
  }

  loadListContact(lstContact) {
    this.loaded = true;
    this.listContacts = this.cmSv.bringDefaultContactToFront(lstContact);
    if (this.listContacts != null && this.listContacts.length > 0) {
      this.changeContacts(this.listContacts[0]);
    }
    this.changeDetectorRef.detectChanges();
  }

  getListContacts() {
    let predicate = 'ObjectID=@0';
    let dataValue = this.objectID;
    // if (this.objectType == '1') {
    //   predicate += ' and CreatedBy.Contains(@1)';
    //   dataValue += ';' + this.owner;
    // }
    this.request.predicates = predicate;
    this.request.dataValues = dataValue;
    this.request.pageLoading = false;
    this.request.entityName = 'CM_Contacts';
    this.className = 'ContactsBusiness';
    this.fetch().subscribe((item) => {
      // if (this.listContacts != null && this.listContacts.length > 0) {
      //   this.listContacts.forEach((res) => {
      //     if (!item.some((x) => x.recID == res.recID)) {
      //       item.push(res);
      //     }
      //   });
      // }
      this.listContacts = this.cmSv.bringDefaultContactToFront(item);
      if (this.listContacts != null && this.listContacts.length > 0) {
        this.changeContacts(this.listContacts[0]);
        // if (this.isConvertLeadToCus) this.insertFieldCheckbox();
      }
      if (this.type != 'formDetail')
        this.lstContactEmit.emit(this.listContacts);
      this.loaded = true;
      this.changeDetectorRef.detectChanges();
    });
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }

  insertFieldCheckbox() {
    if (this.isConvertLeadToCus) {
      for (var i = 0; i < this.listContacts.length; i++) {
        if (
          !this.listContacts[i].checked &&
          this.listContacts[i].objectType != this.objectType
        )
          this.listContacts[i].checked = false;
      }
      if (this.lstContactRef != null && this.lstContactRef.length > 0) {
        for (var i = 0; i < this.listContacts.length; i++) {
          let contact = this.listContacts[i];
          if (this.lstContactRef.map((x) => x.refID).includes(contact.recID)) {
            this.listContacts[i].checked = true;
          }
        }
      }
    }
  }

  changeContacts(item) {
    this.currentRecID = item?.recID;
    this.changeDetectorRef.detectChanges();
  }

  clickMFContact(e, data) {
    this.moreFuncEdit = e.text;
    switch (e.functionID) {
      case 'SYS03':
        if (this.isButton == true)
          this.clickAddContact('edit', data, this.moreFuncEdit);
        break;
      case 'CM0102_2':
      case 'CM0102_3':
      case 'SYS02':
        this.deleteContactToCM(data);
        break;
      case 'CM0102_1':
        if (this.isButton == true)
          this.clickAddContact('editType', data, this.moreFuncEdit);
        break;
      case 'CM0102_4':
        this.clickAddContact('editRole', data, this.moreFuncEdit);
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
          case 'SYS001':
          case 'SYS04':
          case 'SYS05':
            res.disabled = true;
            break;
          case 'CM0102_2':
            if (
              this.objectType == '3' ||
              this.objectType == '2' ||
              this.objectType == '4'
            )
              res.disabled = true;
            break;
          case 'CM0102_3':
            if (
              this.objectType == '1' ||
              this.objectType == '2' ||
              this.objectType == '4'
            )
              res.disabled = true;
            break;
          case 'SYS02':
            if (this.objectType == '1' || this.objectType == '3')
              res.disabled = true;
            break;
          case 'CM0102_1':
            if (this.objectType == '4') res.disabled = true;
            break;
          case 'CM0102_4':
            if (this.objectType != '4') res.disabled = true;
            break;
        }
      });
    }
  }

  //#region Crud contacts crm
  clickAddContact(action, data, title) {
    this.isButton = false;
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
          type: this.type,
          recIDCm: this.objectID,
          objectType: this.objectType,
          objectName: this.objectName,
          gridViewSetup: res,
          listContacts: this.listContacts,
          customerID: this.customerID,
        };
        var dialog = this.callFc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          action != 'editType' && action != 'editRole' ? 700 : 300,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          this.isButton = true;
          if (e && e.event != null) {
            if (e.event?.recID) {
              if (action == 'edit') {
                this.codxShareSv.listContactBehavior.next({
                  data: e.event,
                  type: 'edit',
                });
              }
              var index = this.listContacts.findIndex(
                (x) => x.recID != e.event?.recID && x.isDefault
              );
              if (index != -1) {
                if (e?.event?.isDefault) {
                  this.listContacts[index].isDefault = false;
                }
              }
              if (this.objectType != '4') {
                e.event.role = null;
              }
              this.listContacts = this.cmSv.bringDefaultContactToFront(
                this.cmSv.loadList(e.event, this.listContacts, 'update')
              );
              this.contactEvent.emit({ data: e.event, action: action });

              var index = this.listContacts.findIndex(
                (x) => x.recID == e.event?.recID
              );
              this.changeContacts(this.listContacts[index]);

              this.lstContactEmit.emit(this.listContacts);
              this.changeDetectorRef.detectChanges();
            }
          }
        });
      });
  }

  //Open list contacts
  clickPopupContacts() {
    this.isButton = false;
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
          type: this.type,
          recIDCm: this.objectID,
          objectName: this.objectName,
          objectType: this.objectType,
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
          this.isButton = true;

          if (e && e.event != null) {
            if (e.event?.recID) {
              var index = this.listContacts.findIndex(
                (x) => x.recID != e.event?.recID && x.isDefault
              );
              if (index != -1) {
                if (e?.event?.isDefault) {
                  this.listContacts[index].isDefault = false;
                }
              }
              this.listContacts = this.cmSv.bringDefaultContactToFront(
                this.cmSv.loadList(e.event, this.listContacts, 'update')
              );
              this.lstContactEmit.emit(this.listContacts);
              var index = this.listContacts.findIndex(
                (x) => x.recID == e.event?.recID
              );
              if (this.objectType == '4') {
                this.placeholder = JSON.parse(JSON.stringify(this.placeholder));
              }
              this.changeContacts(this.listContacts[index]);
              this.changeDetectorRef.detectChanges();
            }
          }
        });
      });
  }

  updateRole(event: string, recID) {
    var index = -1;
    if (event == '' || event.trim() == '') {
      index = -1;
      return;
    }
    index = this.listContacts.findIndex((x) => x.recID == recID);
    if (index != -1) {
      this.listContacts[index].role = event?.trim();
      this.codxShareSv.listContactBehavior.next({
        data: this.listContacts[index],
        type: 'edit',
      });
      this.lstContactEmit.emit(this.listContacts);
    }

    this.changeDetectorRef.detectChanges();
  }

  async deleteContactToCM(data) {
    var lstDelete = [];
    var check = await firstValueFrom(
      this.api.execSv<any>(
        'CM',
        'ERM.Business.CM',
        'ContactsBusiness',
        'CheckContactDealAsync',
        [data.recID]
      )
    );
    if (check) {
      this.notiService.notifyCode('CM012');
      return;
    }

    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event?.status) {
        if (x?.event?.status == 'Y') {
          if (this.type == 'formDetail') {
            this.cmSv.updateContactCrm(data.recID).subscribe((res) => {
              if (res) {
                // this.getListContactByObjectID(this.objectID);
                this.listContacts = this.cmSv.bringDefaultContactToFront(
                  this.cmSv.loadList(data, this.listContacts, 'delete')
                );
                if (this.listContacts != null && this.listContacts.length > 0)
                  this.changeContacts(this.listContacts[0]);
                this.contactEvent.emit({ data: data, action: 'delete' });
                this.lstContactEmit.emit(this.listContacts);
                this.notiService.notifyCode('SYS008');
                this.changeDetectorRef.detectChanges();
              }
            });
          } else {
            var index = this.listContacts.findIndex(
              (x) => x.recID == data.recID
            );
            if (index != -1) {
              this.contactEvent.emit({ data: data, action: 'delete' });
              this.codxShareSv.listContactBehavior.next({
                data: this.listContacts[index],
                type: 'delete',
              });
              var idxOld = this.listContacts.findIndex(
                (x) => x.recID == data.recID
              );
              if (idxOld != -1) this.listContacts.splice(idxOld, 1);
              lstDelete.push(data);
              if (this.listContacts != null && this.listContacts.length > 0)
                this.changeContacts(this.listContacts[0]);
              this.lstContactEmit.emit(this.listContacts);

              this.lstContactDeleteEmit.emit(lstDelete);
            }
          }
        }
      }
    });
  }

  //#endregion
  toggleAll(e) {
    if (e?.target) {
      this.isCheckedAll = e?.target?.checked;
      this.listContacts.forEach((item) => (item.checked = this.isCheckedAll));
    }
    this.objectConvert.emit({
      e: e?.target?.checked,
      data: null,
      type: 'selectAll',
    });
  }
  valueChange(e, data) {
    this.objectConvert.emit({ e: e?.target?.checked, data: data });
    if (this.selectAll) {
      this.isCheckedAll = this.listContacts.every((item) => item.checked);
    }
  }

  getListContactsByObjectId(objectID) {
    this.loaded = false;
    if (!this.selectAll) {
      this.request.predicates = 'ObjectID=@0';
      this.request.dataValues = objectID;
      this.request.entityName = 'CM_Contacts';
      this.request.funcID = 'CM0102';
      this.className = 'ContactsBusiness';
      this.fetch().subscribe((item) => {
        this.listContacts = this.cmSv.bringDefaultContactToFront(item);
        if (this.listContacts != null && this.listContacts.length > 0) {
          this.changeContacts(this.listContacts[0]);
          if (this.isConvertLeadToCus) this.insertFieldCheckbox();
        }
        this.loaded = true;
      });
    } else {
      this.loadListContact(this.listContacts);
      this.loaded = true;
    }
  }
}
