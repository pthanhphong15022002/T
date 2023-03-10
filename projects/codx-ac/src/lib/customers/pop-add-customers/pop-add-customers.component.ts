import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  CodxFormComponent,
  DialogModel,
  RequestOption,
} from 'codx-core';

import { CodxAcService } from '../../codx-ac.service';
import { Address } from '../../models/Address.model';
import { BankAccount } from '../../models/BankAccount.model';
import { Contact } from '../../models/Contact.model';
import { Customers } from '../../models/Customers.model';
import { Objects } from '../../models/Objects.model';
import { PopAddAddressComponent } from '../pop-add-address/pop-add-address.component';
import { PopAddBankComponent } from '../pop-add-bank/pop-add-bank.component';
import { PopAddContactComponent } from '../pop-add-contact/pop-add-contact.component';

@Component({
  selector: 'lib-pop-add-customers',
  templateUrl: './pop-add-customers.component.html',
  styleUrls: ['./pop-add-customers.component.css'],
})
export class PopAddCustomersComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  title: string;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  customers: Customers;
  contact: Contact;
  objects: Objects = new Objects();
  objectBankaccount: Array<BankAccount> = [];
  objectBankaccountDelete: Array<BankAccount> = [];
  objectContact: Array<Contact> = [];
  objectContactDelete: Array<Contact> = [];
  objectAddress: Array<Address> = [];
  objectAddressDelete: Array<Address> = [];
  objectContactAddress: Array<Contact> = [];
  objectContactAddressDelete: Array<Contact> = [];
  objecttype: string = '1';
  moreFuncNameAdd:any;
  moreFuncNameEdit:any;
  funcNameContact: any;
  funcNameBank:any;
  funcNameAddress:any;
  gridViewSetup: any;
  valuelist: any;
  formType: any;
  validate: any = 0;
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
    {
      icon: 'icon-i-credit-card-2-back',
      text: 'Tài khoản ngân hàng',
      name: 'Atm',
    },
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
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.customers = dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let add = res.find((x) => x.functionID == 'SYS01');
        let edit = res.find((x) => x.functionID == 'SYS03');
        if (add) this.moreFuncNameAdd = add.defaultName;
        if (edit) this.moreFuncNameEdit = edit.customName;
      }
    });
    this.cache
      .gridViewSetup('Customers', 'grvCustomers')
      .subscribe((res: []) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.cache.valueList('AC015').subscribe((res) => {
      this.valuelist = res.datas;
    });
    if (this.formType == 'edit') {
      if (this.customers.customerID != null) {
        this.acService
          .loadData(
            'ERM.Business.BS',
            'BankAccountsBusiness',
            'LoadDataAsync',
            [this.objecttype, this.customers.customerID]
          )
          .subscribe((res: any) => {
            this.objectBankaccount = res;
          });
        this.acService
          .loadData('ERM.Business.BS', 'ContactBookBusiness', 'LoadDataAsync', [
            this.objecttype,
            this.customers.customerID,
          ])
          .subscribe((res: any) => {
            this.objectContact = res;
          });
        this.acService
          .loadData('ERM.Business.BS', 'AddressBookBusiness', 'LoadDataAsync', [
            this.objecttype,
            this.customers.customerID,
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
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.cache.moreFunction('BankAccounts', 'grvBankAccounts').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20503');
        this.funcNameBank = m.defaultName;
      }
    });
    this.cache.moreFunction('Contacts', 'grvContacts').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20501');
        this.funcNameContact = m.defaultName;
      }
    });
    this.cache.moreFunction('AddressBook', 'grvAddressBook').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20502');
        this.funcNameAddress = m.defaultName;
      }
    });
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.customers[e.field] = e.data;
  }
  valueChangeOverdueControl(e: any) {
    if (e.data == '0') {
      this.customers[e.field] = false;
    } else {
      this.customers[e.field] = true;
    }
  }
  //#endregion

  //#region Function
  openPopupBank() {
    var obj = {
      headerText: this.moreFuncNameAdd + ' ' + this.funcNameBank,
      dataBank: this.objectBankaccount,
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
      headerText: this.moreFuncNameAdd + ' ' + this.funcNameContact,
      datacontact: this.objectContact,
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
            570,
            '',
            obj,
            '',
            opt
          );
          dialogcontact.closed.subscribe((x) => {
            var datacontact = JSON.parse(
              localStorage.getItem('datacontact')
            );
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
      headerText: this.moreFuncNameAdd + ' ' + this.funcNameAddress,
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
            550,
            650,
            '',
            obj,
            '',
            opt
          );
          dialogaddress.closed.subscribe((x) => {
            var dataaddress = JSON.parse(
              localStorage.getItem('dataaddress')
            );
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
    this.notification.notifyCode('SYS008', 0, '');
  }
  editobjectBank(data: any) {
    let index = this.objectBankaccount.findIndex(
      (x) => x.bankAcctID == data.bankAcctID
    );
    var obj = {
      headerText: this.moreFuncNameEdit + ' ' + this.funcNameBank,
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
      headerText: this.moreFuncNameEdit + ' ' + this.funcNameAddress,
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
            550,
            650,
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
    this.notification.notifyCode('SYS008', 0, '');
  }
  editobjectContact(data: any) {
    let index = this.objectContact.findIndex((x) => x.recID == data.recID);
    var ob = {
      headerText: this.moreFuncNameEdit + ' ' + this.funcNameContact,
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
    this.notification.notifyCode('SYS008', 0, '');
  }
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.customers);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.customers[keymodel[i]] == null ||
              this.customers[keymodel[i]] == ''
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
  addObjects() {
    this.objects.transID = this.customers.recID;
    this.objects.objectID = this.customers.customerID;
    this.objects.objectName = this.customers.customerName;
    this.objects.objectName2 = this.customers.customerName2;
    this.objects.objectType = this.objecttype;
    this.objects.objectGroupID = this.customers.custGroupID;
    this.objects.address = this.customers.address;
    this.objects.countryID = this.customers.countryID;
    this.objects.provinceID = this.customers.provinceID;
    this.objects.districtID = this.customers.districtID;
    this.objects.phone = this.customers.phone;
    this.objects.faxNo = this.customers.faxNo;
    this.objects.email = this.customers.email;
    this.objects.webPage = this.customers.webPage;
    this.objects.status = '1';
    this.objects.note = this.customers.note;
    this.objects.currencyID = this.customers.currencyID;
    this.objects.buid = this.customers.buid;
    this.objects.stop = this.customers.stop;
    this.objects.createdOn = this.customers.createdOn;
    this.objects.createdBy = this.customers.createdBy;
    this.objects.modifiedOn = this.customers.modifiedOn;
    this.objects.modifiedBy = this.customers.modifiedBy;
    this.objects.postDetail = this.customers.postDetail;
    this.objects.postItems = this.customers.postItems;
    this.objects.settleInvoice = this.customers.settleInvoice;
    this.objects.settlePayment = this.customers.settlePayment;
    this.objects.debtComparision = this.customers.debtComparision;
  }
  checkValidEmail() {
    if (this.customers.email != null) {
      const regex = new RegExp(
        '^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([A-Za-z]{2,6}(?:\\.[A-Za-z]{2,6})?)$'
      );
      var checkRegex = regex.test(this.customers.email);
      if (checkRegex == false) {
        this.notification.notifyCode(
          'SYS037',
          0,
          ''
        );
        this.validate++;
        return;
      }
    }
  }
  checkValidPhone(){
    if (this.customers.phone != null) {
      var phonenumberFormat = /(([\+84|84|(+84)|0]+(3|5|7|8|9|1[2|6|8|9])+([0-9]{8}))\b)/;
      var checkRegex = this.customers.phone.toLocaleLowerCase().match(phonenumberFormat)
      if (checkRegex == null) {
        this.notification.notify("'Phone' không hợp lệ", '2');
        this.validate++;
        return;
      }
    }
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.checkValidPhone();  
    this.checkValidEmail();
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.customers.overDueControl == '0') {
        this.customers.overDueControl = false;
      } else {
        this.customers.overDueControl = true;
      }
      if (this.formType == 'add' || this.formType == 'copy') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'CustomersBusiness';
            opt.assemblyName = 'SM';
            opt.service = 'SM';
            opt.data = [this.customers];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.addObjects();
              this.acService
                .addData(
                  'ERM.Business.BS',
                  'BankAccountsBusiness',
                  'AddAsync',
                  [
                    this.objecttype,
                    this.customers.customerID,
                    this.objectBankaccount,
                  ]
                )
                .subscribe((res: []) => {});
              this.acService
                .addData('ERM.Business.BS', 'AddressBookBusiness', 'AddAsync', [
                  this.objecttype,
                  this.customers.customerID,
                  this.objectAddress,
                ])
                .subscribe((res: []) => {});
              this.acService
                .addData('ERM.Business.BS', 'ContactBookBusiness', 'AddAsync', [
                  this.objecttype,
                  this.customers.customerID,
                  this.objectContact,
                  this.objectContactAddress,
                ])
                .subscribe((res: []) => {});
              this.acService
                .addData('ERM.Business.AC', 'ObjectsBusiness', 'AddAsync', [
                  this.objects,
                ])
                .subscribe((res: []) => {});
              this.dialog.close();
              this.dt.detectChanges();
            } else {
              this.notification.notifyCode(
                'SYS031',
                0,
                '"' + this.customers.customerID + '"'
              );
              return;
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'CustomersBusiness';
            opt.assemblyName = 'SM';
            opt.service = 'SM';
            opt.data = [this.customers];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.addObjects();
              this.api
                .exec(
                  'ERM.Business.BS',
                  'BankAccountsBusiness',
                  'UpdateAsync',
                  [
                    this.objecttype,
                    this.customers.customerID,
                    this.objectBankaccount,
                    this.objectBankaccountDelete,
                  ]
                )
                .subscribe((res: any) => {});
              this.api
                .exec('ERM.Business.BS', 'AddressBookBusiness', 'UpdateAsync', [
                  this.objecttype,
                  this.customers.customerID,
                  this.objectAddress,
                  this.objectAddressDelete,
                ])
                .subscribe((res: any) => {});
              this.api
                .exec('ERM.Business.BS', 'ContactBookBusiness', 'UpdateAsync', [
                  this.objecttype,
                  this.customers.customerID,
                  this.objectContact,
                  this.objectContactDelete,
                  this.objectContactAddress,
                  this.objectContactAddressDelete,
                ])
                .subscribe((res: any) => {});
              this.acService
                .addData('ERM.Business.AC', 'ObjectsBusiness', 'UpdateAsync', [
                  this.objects,
                ])
                .subscribe((res: []) => {});
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
    }
  }
  //#endregion
}
