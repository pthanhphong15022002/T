import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { PopAddContactComponent } from '../pop-add-contact/pop-add-contact.component';
import { Address } from '../../../models/Address.model';
import { Contact } from '../../../models/Contact.model';

@Component({
  selector: 'lib-pop-add-address',
  templateUrl: './pop-add-address.component.html',
  styleUrls: ['./pop-add-address.component.css'],
})
export class PopAddAddressComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form', { static: true }) form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  objectype: any;
  type: any;
  gridViewSetup: any;
  address: Address = new Address();
  validate: any = 0;
  objectAddress: Array<Address> = [];
  objectContactAddress: Array<Contact> = [];
  objectContactAddressAfter: Array<Contact> = [];
  objectContactAddressDelete: Array<Contact> = [];
  lblAdd: any;
  lblEdit: any;
  lblContacts: any;
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.objectype = dialogData.data?.objectype;
    this.objectAddress = dialogData.data?.dataAddress;
    this.objectContactAddressAfter = dialogData.data?.dataContactAddress;
    this.cache
      .gridViewSetup('AddressBook', 'grvAddressBook')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (dialogData.data?.data != null) {
      this.address = dialogData.data?.data;
    }
    if (dialogData.data?.datacontactaddress != null) {
      this.objectContactAddress = dialogData.data?.datacontactaddress;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });

    this.cache.message('AC0034').subscribe((res) => {
      if (res) {
        this.lblEdit = res?.customName;
      }
    });
    this.cache.moreFunction('Contacts', 'grvContacts').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20501');
        if (m) {
          this.lblContacts = m.defaultName.toLowerCase();
        }
      }
    })
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.address[e.field] = e.data;
  }
  //#endregion

  //#region Function
  openPopupContact() {
    var obj = {
      headerText: this.lblAdd + ' ' + this.lblContacts,
      datacontact: this.objectContactAddress,
      recIdAddress: this.address.recID,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ContactBook';
    dataModel.gridViewName = 'grvContactBook';
    dataModel.entityName = 'BS_ContactBook';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('ContactBook', 'grvContactBook')
      .subscribe((res) => {
        if (res) {
          var dialogcontact = this.callfc.openForm(
            PopAddContactComponent,
            '',
            650,
            550,
            '',
            obj,
            '',
            opt
          );
          dialogcontact.closed.subscribe((x) => {
            var datacontact = JSON.parse(localStorage.getItem('datacontact'));
            if (datacontact != null) {
              datacontact.reference = this.address.recID;
              this.objectContactAddress.push(datacontact);
            }
            window.localStorage.removeItem('datacontact');
          });
        }
      });
  }
  editobject(data: any, type: any) {
    let index = this.objectContactAddress.findIndex(
      (x) => x.contactID == data.contactID
    );
    var ob = {
      headerText: this.lblEdit + ' ' + this.lblContacts,
      type: 'editContact',
      data: { ...data },
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ContactBook';
    dataModel.gridViewName = 'grvContactBook';
    dataModel.entityName = 'BS_ContactBook';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('ContactBook', 'grvContactBook')
      .subscribe((res) => {
        if (res) {
          var dialogcontact = this.callfc.openForm(
            PopAddContactComponent,
            '',
            650,
            550,
            '',
            ob,
            '',
            opt
          );
          dialogcontact.closed.subscribe((x) => {
            var datacontact = JSON.parse(localStorage.getItem('datacontact'));
            if (datacontact != null) {
              this.objectContactAddress[index] = datacontact;
            }
            window.localStorage.removeItem('datacontact');
          });
        }
      });
  }
  deleteobject(data: any, type: any) {
    let index = this.objectContactAddress.findIndex(
      (x) => x.reference == data.reference && x.recID == data.recID
    );
    this.objectContactAddress.splice(index, 1);
    this.objectContactAddressDelete.push(data);
    this.notification.notifyCode('SYS008', 0, '');
  }
  clearAddress() {
    this.form.formGroup.reset();
    this.address = new Address();
    this.objectContactAddress = [];
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.address);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.address[keymodel[i]] == null ||
              String(this.address[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      window.localStorage.setItem('dataaddress', JSON.stringify(this.address));
      window.localStorage.setItem(
        'datacontactaddress',
        JSON.stringify(this.objectContactAddress)
      );
      window.localStorage.setItem(
        'datacontactaddressdelete',
        JSON.stringify(this.objectContactAddressDelete)
      );
      if (this.type == 'editaddress') {
        this.notification.notifyCode('SYS007', 0, '');
      } else {
        this.notification.notifyCode('SYS006', 0, '');
      }
      this.dialog.close();
    }
  }
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.objectAddress.push({ ...this.address });
      this.objectContactAddress.forEach((element) => {
        this.objectContactAddressAfter.push({ ...element });
      });
      if (this.type == 'editaddress') {
        this.notification.notifyCode('SYS007', 0, '');
      } else {
        this.notification.notifyCode('SYS006', 0, '');
      }
      this.clearAddress();
    }
  }
  //#endregion
}
