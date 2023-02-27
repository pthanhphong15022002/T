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
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { PopAddAddressComponent } from '../../customers/pop-add-address/pop-add-address.component';
import { PopAddBankComponent } from '../../customers/pop-add-bank/pop-add-bank.component';
import { PopAddContactComponent } from '../../customers/pop-add-contact/pop-add-contact.component';
import { Address } from '../../models/Address.model';
import { BankAccount } from '../../models/BankAccount.model';
import { Contact } from '../../models/Contact.model';
import { Customers } from '../../models/Customers.model';
import { Vendors } from '../../models/Vendors.model';

@Component({
  selector: 'lib-pop-add-vendors',
  templateUrl: './pop-add-vendors.component.html',
  styleUrls: ['./pop-add-vendors.component.css'],
})
export class PopAddVendorsComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  title: string;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  vendors: Vendors;
  contact: Contact;
  objectBankaccount: Array<BankAccount> = [];
  objectBankaccountDelete: Array<BankAccount> = [];
  objectContact: Array<Contact> = [];
  objectContactDelete: Array<Contact> = [];
  objectAddress: Array<Address> = [];
  objectAddressDelete: Array<Address> = [];
  objectContactAddress: Array<Contact> = [];
  objectContactAddressDelete: Array<Contact> = [];
  objecttype: string = '2';
  gridViewSetup: any;
  gridViewSetupBank: any;
  vendorID: any;
  valuelist: any;
  formType: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-settings icon-20 me-3',
      text: 'Thiết lập',
      name: 'Establish',
    },
    {
      icon: 'icon-directions_bus',
      text: 'Thông tin giao hàng',
      name: 'Shipment Details',
    },
    {
      icon: 'icon-location_on',
      text: 'Danh sách địa chỉ',
      name: 'Location',
    },
    { icon: 'icon-person_pin', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-i-credit-card-2-back', text: 'Tài khoản ngân hàng', name: 'Atm' },
    {
      icon: 'icon-20 me-2 icon-tune',
      text: 'Thông tin khác',
      name: 'Infomation',
    },
  ];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.vendors = dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.vendorID = '';
    this.cache.gridViewSetup('Vendors', 'grvVendors').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        console.log(this.gridViewSetup);
      }
    });
    this.cache
      .gridViewSetup('BankAccounts', 'grvBankAccounts')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetupBank = res;
        }
      });
    this.cache.valueList('AC015').subscribe((res) => {
      this.valuelist = res.datas;
    });
    if (this.vendors.vendorID != null) {
      this.vendorID = this.vendors.vendorID;
      this.acService
        .loadData('ERM.Business.BS', 'BankAccountsBusiness', 'LoadDataAsync', [
          this.objecttype,
          this.vendorID,
        ])
        .subscribe((res: any) => {
          this.objectBankaccount = res;
        });
      this.acService
        .loadData('ERM.Business.BS', 'ContactBookBusiness', 'LoadDataAsync', [
          this.objecttype,
          this.vendorID,
        ])
        .subscribe((res: any) => {
          this.objectContact = res;
        });
      this.acService
        .loadData('ERM.Business.BS', 'AddressBookBusiness', 'LoadDataAsync', [
          this.objecttype,
          this.vendorID,
        ])
        .subscribe((res: any) => {
          this.objectAddress = res;
          for (var i = 0; i < this.objectAddress.length; i++) {
            var recID = this.objectAddress[i].recID;
            this.acService
              .loadData(
                'ERM.Business.BS',
                'ContactBookBusiness',
                'LoadDataAsync',
                [this.objecttype, recID]
              )
              .subscribe((res: any) => {
                res.forEach((element) => {
                  this.objectContactAddress.push(element);
                });
              });
          }
        });
    }
  }
  //#endregion

  //#region Init
  onInit(): void { }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Functione
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  valueChangeTags(e: any) {
    this.vendors[e.field] = e.data;
  }
  valueChange(e: any) {
    this.vendors[e.field] = e.data;
  }
  valueChangeVendorID(e: any) {
    this.vendorID = e.data;
    this.vendors[e.field] = e.data;
  }
  valueChangeEstablishYear(e: any) {
    e.data = e.data.fromDate;
    this.vendors[e.field] = e.data;
  }
  valueChangeOverdueControl(e: any) {
    if (e.data == '0') {
      this.vendors[e.field] = false;
    } else {
      this.vendors[e.field] = true;
    }
  }
  openPopupBank() {
    var obj = {
      headerText: 'Thêm tài khoản ngân hàng',
      dataBank: this.objectBankaccount
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'BankAccounts';
    dataModel.gridViewName = 'grvBankAccounts';
    dataModel.entityName = 'BS_BankAccounts';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('BankAccounts', 'grvBankAccounts')
      .subscribe((res) => {
        if (res) {
          var dialogbank = this.callfc.openForm(
            PopAddBankComponent,
            '',
            500,
            400,
            '',
            obj,
            '',
            opt
          );
          dialogbank.closed.subscribe((x) => {
            var databankaccount = JSON.parse(
              localStorage.getItem('databankaccount')
            );
            if (databankaccount != null) {
              this.api
                .exec(
                  'ERM.Business.BS',
                  'BankAccountsBusiness',
                  'CheckBankAccount',
                  [this.objectBankaccount, databankaccount]
                )
                .subscribe((res: any) => {
                  if (res) {
                    this.objectBankaccount.push(databankaccount);
                  } else {
                    this.notification.notifyCode(
                      'SYS031',
                      0,
                      '"' + databankaccount.bankAcctID + '"'
                    );
                    return;
                  }
                });
            }
            window.localStorage.removeItem('databankaccount');
          });
        }
      });
  }
  openPopupContact() {
    var obj = {
      headerText: 'Thêm người liên hệ',
      datacontact: this.objectContact
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
              this.objectContact.push(datacontact);
            }
            window.localStorage.removeItem('datacontact');
          });
        }
      });
  }
  openPopupAddress() {
    var obj = {
      headerText: 'Thêm địa chỉ',
      dataAddress: this.objectAddress,
      dataContactAddress: this.objectContactAddress,
      objectype: this.objecttype,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AddressBook';
    dataModel.gridViewName = 'grvAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('AddressBook', 'grvAddressBook')
      .subscribe((res) => {
        if (res) {
          var dialogaddress = this.callfc.openForm(
            PopAddAddressComponent,
            '',
            650,
            600,
            '',
            obj,
            '',
            opt
          );
          dialogaddress.closed.subscribe((x) => {
            console.log(this.objectContactAddress);
            var dataaddress = JSON.parse(localStorage.getItem('dataaddress'));
            var datacontactaddress = JSON.parse(
              localStorage.getItem('datacontactaddress')
            );
            if (dataaddress != null) {
              this.objectAddress.push(dataaddress);
            }
            if (datacontactaddress != null) {
              datacontactaddress.forEach((element) => {
                this.objectContactAddress.push(element);
              });
            }
            window.localStorage.removeItem('dataaddress');
            window.localStorage.removeItem('datacontactaddress');
            window.localStorage.removeItem('datacontactaddressdelete');
          });
        }
      });
  }
  deleteobjectBank(data: any) {
    let index = this.objectBankaccount.findIndex(
      (x) => x.bankAcctID == data.bankAcctID && x.bankID == data.bankID
    );
    this.objectBankaccount.splice(index, 1);
    this.objectBankaccountDelete.push(data);
  }
  editobjectBank(data: any) {
    let index = this.objectBankaccount.findIndex(
      (x) => x.bankAcctID == data.bankAcctID
    );
    var obj = {
      headerText: 'Chỉnh sửa',
      type: 'editbank',
      data: { ...data },
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'BankAccounts';
    dataModel.gridViewName = 'grvBankAccounts';
    dataModel.entityName = 'BS_BankAccounts';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('BankAccounts', 'grvBankAccounts')
      .subscribe((res) => {
        if (res) {
          var dialogbank = this.callfc.openForm(
            PopAddBankComponent,
            '',
            500,
            400,
            '',
            obj,
            '',
            opt
          );
          dialogbank.closed.subscribe((x) => {
            var databankaccount = JSON.parse(
              localStorage.getItem('databankaccount')
            );
            if (databankaccount != null) {
              this.objectBankaccount[index] = databankaccount;
            }
            window.localStorage.removeItem('databankaccount');
          });
        }
      });
  }
  editobjectAddress(data: any) {
    let index = this.objectAddress.findIndex((x) => x.recID == data.recID);
    var obs = {
      headerText: 'Chỉnh sửa địa chỉ',
      type: 'editaddress',
      data: { ...data },
      datacontactaddress: [...this.objectContactAddress],
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AddressBook';
    dataModel.gridViewName = 'grvAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('AddressBook', 'grvAddressBook')
      .subscribe((res) => {
        if (res) {
          var dialogaddress = this.callfc.openForm(
            PopAddAddressComponent,
            '',
            650,
            600,
            '',
            obs,
            '',
            opt
          );
          dialogaddress.closed.subscribe((x) => {
            var dataaddress = JSON.parse(localStorage.getItem('dataaddress'));
            var datacontactaddress = JSON.parse(
              localStorage.getItem('datacontactaddress')
            );
            var datacontactaddressdelete = JSON.parse(
              localStorage.getItem('datacontactaddressdelete')
            );
            if (dataaddress != null) {
              this.objectAddress[index] = dataaddress;
            }
            if (datacontactaddress != null) {
              this.objectContactAddress = datacontactaddress;
            }
            if (datacontactaddressdelete != null) {
              datacontactaddressdelete.forEach((element) => {
                this.objectContactAddressDelete.push(element);
              });
            }
            window.localStorage.removeItem('dataaddress');
            window.localStorage.removeItem('datacontactaddress');
            window.localStorage.removeItem('datacontactaddressdelete');
          });
        }
      });
  }
  deleteobjectAddress(data: any) {
    let index = this.objectAddress.findIndex((x) => x.recID == data.recID);
    this.objectContactAddress.forEach((element, index) => {
      if (element.reference == data.recID) {
        this.objectContactAddress.splice(index, 1);
      }
    });
    this.objectAddress.splice(index, 1);
    this.objectAddressDelete.push(data);
  }
  editobjectContact(data: any) {
    let index = this.objectContact.findIndex((x) => x.recID == data.recID);
    var ob = {
      headerText: 'Chỉnh sửa liên hệ',
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
              this.objectContact[index] = datacontact;
            }
            window.localStorage.removeItem('datacontact');
          });
        }
      });
  }
  deleteobjectContact(data: any) {
    let index = this.objectContact.findIndex(
      (x) => x.reference == data.reference && x.recID == data.recID
    );
    this.objectContact.splice(index, 1);
    this.objectContactDelete.push(data);
  }
  //#endregion

  //#region CRUD
  onSave() {
    if (this.vendorID.trim() == '' || this.vendorID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CustomerID'].headerText + '"'
      );
      return;
    }
    if (this.vendors.overDueControl == '0') {
      this.vendors.overDueControl = false;
    } else {
      this.vendors.overDueControl = true;
    }
    if (this.formType == 'add') {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'VendorsBusiness';
          opt.assemblyName = 'PS';
          opt.service = 'PS';
          opt.data = [this.vendors];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData('ERM.Business.BS', 'BankAccountsBusiness', 'AddAsync', [
                this.objecttype,
                this.vendorID,
                this.objectBankaccount,
              ])
              .subscribe((res: []) => { });
            this.acService
              .addData('ERM.Business.BS', 'AddressBookBusiness', 'AddAsync', [
                this.objecttype,
                this.vendorID,
                this.objectAddress,
              ])
              .subscribe((res: []) => { });
            this.acService
              .addData('ERM.Business.BS', 'ContactBookBusiness', 'AddAsync', [
                this.objecttype,
                this.vendorID,
                this.objectContact,
                this.objectContactAddress,
              ])
              .subscribe((res: []) => { });
            this.dialog.close();
            this.dt.detectChanges();
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.vendorID + '"'
            );
            return;
          }
        });
    }
    if (this.formType == 'edit') {
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'UpdateAsync';
          opt.className = 'VendorsBusiness';
          opt.assemblyName = 'PS';
          opt.service = 'PS';
          opt.data = [this.vendors];
          return true;
        })
        .subscribe((res) => {
          if (res.save || res.update) {
            this.api
              .exec('ERM.Business.BS', 'BankAccountsBusiness', 'UpdateAsync', [
                this.objecttype,
                this.vendorID,
                this.objectBankaccount,
                this.objectBankaccountDelete,
              ])
              .subscribe((res: any) => { });
            this.api
              .exec('ERM.Business.BS', 'AddressBookBusiness', 'UpdateAsync', [
                this.objecttype,
                this.vendorID,
                this.objectAddress,
                this.objectAddressDelete,
              ])
              .subscribe((res: any) => { });
            this.api
              .exec('ERM.Business.BS', 'ContactBookBusiness', 'UpdateAsync', [
                this.objecttype,
                this.vendorID,
                this.objectContact,
                this.objectContactDelete,
                this.objectContactAddress,
                this.objectContactAddressDelete,
              ])
              .subscribe((res: any) => { });
            this.dialog.close();
            this.dt.detectChanges();
          }
        });
    }
  }
  //#endregion
}
