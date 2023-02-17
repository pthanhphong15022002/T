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
  objectBankaccount: Array<BankAccount> = [];
  objectContact: Array<Contact> = [];
  objectAddress: Array<Address> = [];
  objectContactAddress: Array<Contact> = [];
  objecttype:string = '1';
  gridViewSetup: any;
  valuelist: any;
  gridViewSetupBank: any;
  customerID: any;
  formType: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-settings icon-20 me-3',
      text: 'Thiết lập',
      name: 'Establish',
    },
    {
      icon: 'icon-train',
      text: 'Thông tin giao hàng',
      name: 'Shipment Details',
    },
    {
      icon: 'icon-location_on me-1',
      text: 'Danh sách địa chỉ',
      name: 'Location',
    },
    { icon: 'icon-contacts', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-credit_card', text: 'Tài khoản ngân hàng', name: 'Atm' },
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
    this.customerID = '';
    if (this.customers.overDueControl) {
      this.customers.overDueControl = '1';
    } else {
      this.customers.overDueControl = '0';
    }
    this.cache.gridViewSetup('Customers', 'grvCustomers').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
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
    if (this.customers.customerID != null) {
      this.customerID = this.customers.customerID;
      this.acService
        .loadData(
          'ERM.Business.BS',
          'BankAccountsBusiness',
          'LoadDataAsync',
          [this.objecttype,
          this.customerID]
        )
        .subscribe((res: any) => {
          this.objectBankaccount = res;
        });
      this.acService
        .loadData(
          'ERM.Business.BS',
          'ContactBookBusiness',
          'LoadDataAsync',
          [this.objecttype,
            this.customerID]
        )
        .subscribe((res: any) => {
          this.objectContact = res;
        });
      this.acService
        .loadData(
          'ERM.Business.BS',
          'AddressBookBusiness',
          'LoadDataAsync',
          [this.objecttype,
            this.customerID]
        )
        .subscribe((res: any) => {
          this.objectAddress = res;
          for (var i = 0; i < this.objectAddress.length; i++) {
            var recID = this.objectAddress[i].recID;
            this.acService
              .loadData(
                'ERM.Business.BS',
                'ContactBookBusiness',
                'LoadDataAsync',
                [this.objecttype,recID]
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
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion
  
  //#region Function
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  valueChangeTags(e: any) {
    this.customers[e.field] = e.data;
  }
  valueChange(e: any) {
    this.customers[e.field] = e.data;
  }
  valueChangeCustomerID(e: any) {
    this.customerID = e.data;
    this.customers[e.field] = e.data;
    console.log(this.customerID);
  }
  valueChangeEstablishYear(e: any) {
    e.data = e.data.fromDate;
    this.customers[e.field] = e.data;
  }
  valueChangeOverdueControl(e: any) {
    if (e.data == '0') {
      this.customers[e.field] = false;
    } else {
      this.customers[e.field] = true;
    }
  }
  openPopupBank() {
    var obj = {
      headerText: 'Thêm tài khoản ngân hàng',
      formType: this.formType,
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
            650,
            550,
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
      dataContact: this.objectContact,
      objectype:this.objecttype
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
          });
        }
      });
  }
  deleteobjectBank(data: any) {
      let index = this.objectBankaccount.findIndex(
        (x) => x.bankAcctID == data.bankAcctID && x.bankID == data.bankID
      );
      this.objectBankaccount.splice(index, 1);
      this.api
        .exec('ERM.Business.BS', 'BankAccountsBusiness', 'DeleteAsync', [
          this.objecttype,
          this.customerID,
          data,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.notification.notify('Xóa thành công');
          }
        });
  }
  editobjectBank(data: any) {
      let index = this.objectBankaccount.findIndex(
        (x) => x.bankAcctID == data.bankAcctID
      );
      var obj = {
        headerText: 'Chỉnh sửa',
        data: data,
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
              650,
              550,
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
              if (dataaddress != null) {
                this.objectAddress[index] = dataaddress;
              }
              if (datacontactaddress != null) {
                this.objectContactAddress = datacontactaddress;
              }
              window.localStorage.removeItem('dataaddress');
              window.localStorage.removeItem('datacontactaddress');
            });
          }
        });
  }
  deleteobjectAddress(data: any) {
      let index = this.objectAddress.findIndex(
        (x) =>
          x.adressType == data.adressType && x.adressName == data.adressName
      );
      this.objectContactAddress.forEach((element, index) => {
        if (element.reference == data.recID) {
          this.objectContactAddress.splice(index, 1);
        }
      });
      this.objectAddress.splice(index, 1);
      this.api
        .exec('ERM.Business.BS', 'AddressBookBusiness', 'DeleteAsync', [
          this.objecttype,
          this.customerID,
          data,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.notification.notify('Xóa thành công');
          }
        });
  }
  editobjectContact(data: any) {
      let index = this.objectContact.findIndex(
        (x) => x.recID == data.recID);
      var ob = {
        headerText: 'Chỉnh sửa liên hệ',
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
        (x) => x.reference == data.reference && x.contactID == data.contactID
      );
      this.objectContact.splice(index, 1);
      this.api
        .exec('ERM.Business.BS', 'ContactBookBusiness', 'DeleteAsync', [
          this.objecttype,
          this.customerID,
          data,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.notification.notify('Xóa thành công');
          }
        });
  }
  //#endregion
 
 //#region CRUD
  onSave() {
    if (this.customerID.trim() == '' || this.customerID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CustomerID'].headerText + '"'
      );
      return;
    }
    if (this.customers.overDueControl == '0') {
      this.customers.overDueControl = false;
    } else {
      this.customers.overDueControl = true;
    }
    if (this.formType == 'add') {
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
            this.acService
              .addData('ERM.Business.BS', 'BankAccountsBusiness', 'AddAsync', [
                this.objecttype,
                this.customerID,
                this.objectBankaccount,
              ])
              .subscribe((res: []) => {});
            this.acService
              .addData('ERM.Business.BS', 'AddressBookBusiness', 'AddAsync', [
                this.objecttype,
                this.customerID,
                this.objectAddress,
                
              ])
              .subscribe((res: []) => {});
            this.acService
              .addData('ERM.Business.BS', 'ContactBookBusiness', 'AddAsync', [
                this.objecttype,
                this.customerID,
                this.objectContact,
                this.objectContactAddress,
              ])
              .subscribe((res: []) => {});
            this.dialog.close();
            this.dt.detectChanges();
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.customerID + '"'
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
            this.api
              .exec('ERM.Business.BS', 'BankAccountsBusiness', 'UpdateAsync', [
                this.objecttype,
                this.customerID,
                this.objectBankaccount,
              ])
              .subscribe((res: any) => {});
            this.api
              .exec('ERM.Business.BS', 'AddressBookBusiness', 'UpdateAsync', [
                this.objecttype,
                this.customerID,
                this.objectAddress,
              ])
              .subscribe((res: any) => {});
            this.api
              .exec('ERM.Business.BS', 'ContactBookBusiness', 'UpdateAsync', [
                this.objecttype,
                this.customerID,
                this.objectContact,
                this.objectContactAddress,
              ])
              .subscribe((res: any) => {});
            this.dialog.close();
            this.dt.detectChanges();
          }
        });
    }
  }
//#endregion
}
