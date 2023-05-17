import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
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
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'codx-list-contacts',
  templateUrl: './codx-list-contacts.component.html',
  styleUrls: ['./codx-list-contacts.component.css'],
})
export class CodxListContactsComponent implements OnInit {
  @Input() objectID: any;
  @Input() funcID: any;
  @Input() objectName: any;
  @Input() hidenMF = true;
  @Input() type = '';
  @Input() formModel: FormModel;
  @Output() lstContactEmit = new EventEmitter<any>();
  @Output() lstContactDeleteEmit = new EventEmitter<any>();

  listContacts = [];
  formModelContact: FormModel;
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
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {}

  async ngOnInit() {
    this.getListContacts();
    this.formModelContact = await this.cmSv.getFormModel('CM0102');
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
  }

  getListContacts() {
    this.loaded = false;
    this.request.predicates = 'ObjectID=@0';
    this.request.dataValues = this.objectID;
    this.request.entityName = 'CM_Contacts';
    this.request.funcID = 'CM0102';
    this.className = 'ContactsBusiness';
    this.fetch().subscribe((item) => {
      this.listContacts = this.cmSv.bringDefaultContactToFront(item);
      if(this.listContacts != null && this.listContacts.length > 0){
        this.changeContacts(this.listContacts[0]);
      }
      this.loaded = true;
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

  changeContacts(item) {
    this.currentRecID = item.recID;
    this.changeDetectorRef.detectChanges();
  }

  clickMFContact(e, data) {
    this.moreFuncEdit = e.text;
    switch (e.functionID) {
      case 'SYS03':
        if ((this.isButton = true))
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
        if ((this.isButton = true))
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
          objectType: this.funcID == 'CM0101' ? '1' : '3',
          objectName: this.objectName,
          gridViewSetup: res,
          listContacts: this.listContacts,
        };
        var dialog = this.callFc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          action != 'editType' ? 600 : 100,
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

                  this.listContacts = this.cmSv.bringDefaultContactToFront(
                    this.cmSv.loadList(e.event, this.listContacts, 'update')
                  );
                } else {
                  this.listContacts = this.cmSv.bringDefaultContactToFront(
                    this.cmSv.loadList(e.event, this.listContacts, 'update')
                  );
                }
              } else {
                this.listContacts = this.cmSv.bringDefaultContactToFront(
                  this.cmSv.loadList(e.event, this.listContacts, 'update')
                );
              }
              var index = this.listContacts.findIndex(x => x.recID == e.event?.recID);
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
          this.isButton = true;
          if (e && e.event != null) {
            if (e.event?.recID) {
              this.listContacts = this.cmSv.bringDefaultContactToFront(
                this.cmSv.loadList(e.event, this.listContacts, 'update')
              );
              this.lstContactEmit.emit(this.listContacts);
              var index = this.listContacts.findIndex(x => x.recID == e.event?.recID);
              this.changeContacts(this.listContacts[index]);
              this.changeDetectorRef.detectChanges();
            }
          }
        });
      });
  }

  deleteContactToCM(data) {
    var lstDelete = [];
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        if(this.type == 'formDetail'){
          this.cmSv.updateContactCrm(data.recID).subscribe((res) => {
            if (res) {
              // this.getListContactByObjectID(this.objectID);
              this.listContacts = this.cmSv.bringDefaultContactToFront(
                this.cmSv.loadList(data, this.listContacts, 'delete')
              );
              this.changeContacts(this.listContacts[0]);
              this.notiService.notifyCode('SYS008');
              this.changeDetectorRef.detectChanges();
            }
          });
        }else{
          var index = this.listContacts.findIndex(x => x.recID == data.recID);
          if(index != -1){
            this.listContacts.splice(index, 1);
            lstDelete.push(data);
            this.changeContacts(this.listContacts[0]);

            this.lstContactDeleteEmit.emit(lstDelete);
          }
        }
      }
    });
  }


  //#endregion
}
