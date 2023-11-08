import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  NotificationsService,
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  CodxFormComponent,
  DialogModel,
  RequestOption,
  AlertConfirmInputConfig,
  ApiHttpService,
  LayoutAddComponent,
  CRUDService,
} from 'codx-core';
import { AddressAddComponent } from '../address-add/address-add.component';
import { BankAddComponent } from '../bank-add/bank-add.component';
import { ContactAddComponent } from '../contact-add/contact-add.component';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-customers',
  templateUrl: './customers-add.component.html',
  styleUrls: ['./customers-add.component.css', '../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('form') form: LayoutAddComponent; //? element form layoutadd
  headerText: string;
  dataDefault: any;
  dialog!: DialogRef;
  dialogData!: DialogData;
  lblAdd: any;
  lblEdit: any;
  dicMST: Map<string, any> = new Map<string, any>();
  addressService: CRUDService;
  fmAddress: FormModel = {
    formName: 'AddressBook',
    gridViewName: 'grvAddressBook',
    entityName: 'BS_AddressBook',
  }
  lstAddress: any = [];
  contactService: CRUDService;
  fmContact: FormModel = {
    formName: 'Contacts',
    gridViewName: 'grvContacts',
    entityName: 'BS_Contacts',
  }
  lstContact: any = [];
  bankService: CRUDService;
  fmBank: FormModel = {
    formName: 'BankAccounts',
    gridViewName: 'grvBankAccounts',
    entityName: 'BS_BankAccounts',
  }
  lstBank: any = [];
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-settings icon-20 me-3', text: 'Thiết lập', name: 'Establish' },
    { icon: 'icon-directions_bus', text: 'Thông tin giao hàng', name: 'Shipment Details' },
    { icon: 'icon-location_on', text: 'Danh sách địa chỉ', name: 'Location' },
    { icon: 'icon-person_pin', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-i-credit-card-2-back', text: 'Tài khoản ngân hàng', name: 'Banking Account' },
    { icon: 'icon-20 me-2 icon-tune', text: 'Thông tin khác', name: 'Other Infomation' }
  ];
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = { ...dialogData };
    this.dataDefault = { ...dialogData?.data?.dataDefault };

    this.addressService = this.acService.createCRUDService(
      inject,
      this.fmAddress,
      'BS'
    );

    this.contactService = this.acService.createCRUDService(
      inject,
      this.fmContact,
      'BS'
    );

    this.bankService = this.acService.createCRUDService(
      inject,
      this.fmBank,
      'BS'
    );

    if (this.dataDefault.isEdit) {
      this.api.exec('BS', 'BSBusiness', 'LoadDataAsync', [this.dataDefault.customerID, "1"]).subscribe((res: any) => {
        this.lstAddress = res?.lstAddress || [];
        this.lstContact = res?.lstcontact || [];
        this.lstBank = res?.lstBank || [];
      })
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

  }
  ngAfterViewInit() {
    this.form.form.onAfterInit.subscribe((res: any) => {
      if (res) {
        this.setValidateForm();
      }
    })
  }
  //#endregion

  //#region Event
  valueChange(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'overduecontrol':
        if (value == '1') {
          this.form.form.setValue(field, true, {});
        } else {
          this.form.form.setValue(field, false, {});
        }
        break;
      case 'custtaxcode':
        let mst = this.dicMST.has(value);
        if (mst) {
          let data = this.dicMST.get(value)
          this.form.form.setValue('address', data['address'], {});
          this.form.form.setValue('customerName', data['customerName'], {});
          this.form.form.setValue('customerID', data['customerID'], {});
        } else {
          this.api
            .exec('SM', 'CustomersBusiness', 'GetCustomerAsync', [value])
            .subscribe((res) => {
              if (res) {
                this.dicMST.set(value, res);
                let data = this.dicMST.get(value)
                this.form.form.setValue('address', data['address'], {});
                this.form.form.setValue('customerName', data['customerName'], {});
                this.form.form.setValue('customerID', data['customerID'], {});
              }
            });
        }
        break;
      default:
        this.form.form.setValue(field, value, {});
        break;
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm thay đổi title cho form
   * @param event 
   */
  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm thay đổi validate form
   */
  setValidateForm() {
    let rCustomerID = true;
    let lsRequire: any = [];
    if (this.form.form.data?._keyAuto == 'CustomerID') rCustomerID = false;
    lsRequire.push({ field: 'CustomerID', isDisable: false, require: rCustomerID });
    this.form.form.setRequire(lsRequire);
  }

  openFormBank() {
    let data = {
      headerText: (this.lblAdd + ' ' + 'tài khoản ngân hàng').toUpperCase(),
      lstBank: this.lstBank,
      dataDefault: null,
    };
    let option = new DialogModel();
    option.FormModel = this.fmBank;
    option.DataService = this.bankService;
    this.bankService.addNew().subscribe((res: any) => {
      if (res) {
        data.dataDefault = { ...res };
        this.cache.gridViewSetup(this.fmBank.formName,this.fmBank.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            BankAddComponent,
            '',
            500,
            400,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstBank.push({...res?.event?.bank});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  openFormContact() {
    let data = {
      headerText: (this.lblAdd + ' ' + 'người liên hệ').toUpperCase(),
      lstContact: [...this.lstContact],
      dataDefault: null,
    };
    let option = new DialogModel();
    option.FormModel = this.fmContact;
    option.DataService = this.contactService;
    this.contactService.addNew().subscribe((res: any) => {
      if (res) {
        data.dataDefault = { ...res };
        this.cache.gridViewSetup(this.fmContact.formName,this.fmContact.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            ContactAddComponent,
            '',
            650,
            600,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstContact.push({...res?.event?.contact});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  openFormAddress() {
    let data = {
      headerText: (this.lblAdd + ' ' + 'địa chỉ').toUpperCase(),
      lstAddress: [...this.lstAddress],
      dataDefault: null,
    };
    let option = new DialogModel();
    option.FormModel = this.fmAddress;
    option.DataService = this.addressService;
    this.addressService.addNew().subscribe((res: any) => {
      if (res) {
        data.dataDefault = { ...res };
        this.cache.gridViewSetup(this.fmAddress.formName,this.fmAddress.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            AddressAddComponent,
            '',
            600,
            500,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstAddress.push({...res?.event?.address});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  deleteobjectBank(data: any) {
    // let index = this.objectBankaccount.findIndex(
    //   (x) => x.bankAcctID == data.bankAcctID && x.bankID == data.bankID
    // );
    // this.objectBankaccount.splice(index, 1);
    // this.objectBankaccountDelete.push(data);
    // this.notification.notifyCode('SYS008', 0, '');
  }
  editobjectBank(data: any) {
    // let index = this.objectBankaccount.findIndex(
    //   (x) => x.bankAcctID == data.bankAcctID
    // );
    // var obj = {
    //   headerText: this.moreFuncNameEdit + ' ' + this.funcNameBank,
    //   type: 'editbank',
    //   data: { ...data },
    // };
    // let opt = new DialogModel();
    // let dataModel = new FormModel();
    // dataModel.formName = 'BankAccounts';
    // dataModel.gridViewName = 'grvBankAccounts';
    // dataModel.entityName = 'BS_BankAccounts';
    // opt.FormModel = dataModel;
    // this.cache
    //   .gridViewSetup('BankAccounts', 'grvBankAccounts')
    //   .subscribe((res) => {
    //     if (res) {
    //       var dialogbank = this.callfc.openForm(
    //         PopAddBankComponent,
    //         '',
    //         500,
    //         400,
    //         '',
    //         obj,
    //         '',
    //         opt
    //       );
    //       dialogbank.closed.subscribe((x) => {
    //         var databankaccount = JSON.parse(
    //           localStorage.getItem('databankaccount')
    //         );
    //         if (databankaccount != null) {
    //           this.objectBankaccount[index] = databankaccount;
    //         }
    //         window.localStorage.removeItem('databankaccount');
    //       });
    //     }
    //   });
  }
  editobjectAddress(data: any) {
    // let index = this.objectAddress.findIndex((x) => x.recID == data.recID);
    // var obs = {
    //   headerText: this.moreFuncNameEdit + ' ' + this.funcNameAddress,
    //   type: 'editaddress',
    //   data: { ...data },
    //   datacontactaddress: [...this.objectContactAddress],
    // };
    // let opt = new DialogModel();
    // let dataModel = new FormModel();
    // dataModel.formName = 'AddressBook';
    // dataModel.gridViewName = 'grvAddressBook';
    // dataModel.entityName = 'BS_AddressBook';
    // opt.FormModel = dataModel;
    // this.cache
    //   .gridViewSetup('AddressBook', 'grvAddressBook')
    //   .subscribe((res) => {
    //     if (res) {
    //       var dialogaddress = this.callfc.openForm(
    //         PopAddAddressComponent,
    //         '',
    //         550,
    //         650,
    //         '',
    //         obs,
    //         '',
    //         opt
    //       );
    //       dialogaddress.closed.subscribe((x) => {
    //         var dataaddress = JSON.parse(localStorage.getItem('dataaddress'));
    //         var datacontactaddress = JSON.parse(
    //           localStorage.getItem('datacontactaddress')
    //         );
    //         var datacontactaddressdelete = JSON.parse(
    //           localStorage.getItem('datacontactaddressdelete')
    //         );
    //         if (dataaddress != null) {
    //           this.objectAddress[index] = dataaddress;
    //         }
    //         if (datacontactaddress != null) {
    //           this.objectContactAddress = datacontactaddress;
    //         }
    //         if (datacontactaddressdelete != null) {
    //           datacontactaddressdelete.forEach((element) => {
    //             this.objectContactAddressDelete.push(element);
    //           });
    //         }
    //         window.localStorage.removeItem('dataaddress');
    //         window.localStorage.removeItem('datacontactaddress');
    //         window.localStorage.removeItem('datacontactaddressdelete');
    //       });
    //     }
    //   });
  }
  deleteobjectAddress(data: any) {
    // let index = this.objectAddress.findIndex((x) => x.recID == data.recID);
    // this.objectContactAddress.forEach((element, index) => {
    //   if (element.reference == data.recID) {
    //     this.objectContactAddress.splice(index, 1);
    //   }
    // });
    // this.objectAddress.splice(index, 1);
    // this.objectAddressDelete.push(data);
    // this.notification.notifyCode('SYS008', 0, '');
  }
  editobjectContact(data: any) {
    // let index = this.objectContact.findIndex((x) => x.recID == data.recID);
    // var ob = {
    //   headerText: this.moreFuncNameEdit + ' ' + this.funcNameContact,
    //   type: 'editContact',
    //   data: { ...data },
    // };
    // let opt = new DialogModel();
    // let dataModel = new FormModel();
    // dataModel.formName = 'ContactBook';
    // dataModel.gridViewName = 'grvContactBook';
    // dataModel.entityName = 'BS_ContactBook';
    // opt.FormModel = dataModel;
    // this.cache
    //   .gridViewSetup('ContactBook', 'grvContactBook')
    //   .subscribe((res) => {
    //     if (res) {
    //       var dialogcontact = this.callfc.openForm(
    //         PopAddContactComponent,
    //         '',
    //         650,
    //         550,
    //         '',
    //         ob,
    //         '',
    //         opt
    //       );
    //       dialogcontact.closed.subscribe((x) => {
    //         var datacontact = JSON.parse(localStorage.getItem('datacontact'));
    //         if (datacontact != null) {
    //           this.objectContact[index] = datacontact;
    //         }
    //         window.localStorage.removeItem('datacontact');
    //       });
    //     }
    //   });
  }
  deleteobjectContact(data: any) {
    // let index = this.objectContact.findIndex(
    //   (x) => x.reference == data.reference && x.recID == data.recID
    // );
    // this.objectContact.splice(index, 1);
    // this.objectContactDelete.push(data);
    // this.notification.notifyCode('SYS008', 0, '');
  }

  checkValidate() {
    // //Note: Tự động khi lưu, Không check BatchNo
    // let ignoredFields: string[] = [];
    // if (this.keyField == 'CustomerID') {
    //   ignoredFields.push(this.keyField);
    // }
    // ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    // //End Node
    // var keygrid = Object.keys(this.gridViewSetup);
    // var keymodel = Object.keys(this.customers);
    // for (let index = 0; index < keygrid.length; index++) {
    //   if (this.gridViewSetup[keygrid[index]].isRequire == true) {
    //     if (ignoredFields.includes(keygrid[index].toLowerCase())) {
    //       continue;
    //     }
    //     for (let i = 0; i < keymodel.length; i++) {
    //       if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
    //         if (
    //           this.customers[keymodel[i]] == null ||
    //           String(this.customers[keymodel[i]]).match(/^ *$/) !== null
    //         ) {
    //           this.notification.notifyCode(
    //             'SYS009',
    //             0,
    //             '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
    //           );
    //           this.validate++;
    //         }
    //       }
    //     }
    //   }
    // }
  }

  checkMST() { }

  addObjects() {
    // this.objects.transID = this.customers.recID;
    // this.objects.objectID = this.customers.customerID;
    // this.objects.objectName = this.customers.customerName;
    // this.objects.objectName2 = this.customers.customerName2;
    // this.objects.objectType = this.objecttype;
    // this.objects.objectGroupID = this.customers.custGroupID;
    // this.objects.address = this.customers.address;
    // this.objects.countryID = this.customers.countryID;
    // this.objects.provinceID = this.customers.provinceID;
    // this.objects.districtID = this.customers.districtID;
    // this.objects.phone = this.customers.phone;
    // this.objects.faxNo = this.customers.faxNo;
    // this.objects.email = this.customers.email;
    // this.objects.webPage = this.customers.webPage;
    // this.objects.status = '1';
    // this.objects.note = this.customers.note;
    // this.objects.currencyID = this.customers.currencyID;
    // this.objects.buid = this.customers.buid;
    // this.objects.stop = this.customers.stop;
    // this.objects.createdOn = this.customers.createdOn;
    // this.objects.createdBy = this.customers.createdBy;
    // this.objects.modifiedOn = this.customers.modifiedOn;
    // this.objects.modifiedBy = this.customers.modifiedBy;
    // this.objects.postDetail = this.customers.postDetail;
    // this.objects.postItems = this.customers.postItems;
    // this.objects.settleInvoice = this.customers.settleInvoice;
    // this.objects.settlePayment = this.customers.settlePayment;
    // this.objects.debtComparision = this.customers.debtComparision;
  }
  checkValidEmail() {
    // if (this.customers.email != null) {
    //   const regex = new RegExp(
    //     '^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([A-Za-z]{2,6}(?:\\.[A-Za-z]{2,6})?)$'
    //   );
    //   var checkRegex = regex.test(this.customers.email);
    //   if (checkRegex == false) {
    //     this.notification.notifyCode('SYS037', 0, '');
    //     this.validate++;
    //     return;
    //   }
    // }
  }
  checkValidPhone() {
    // if (this.customers.phone != null) {
    //   var phonenumberFormat =
    //     /(([\+84|84|(+84)|0]+(3|5|7|8|9|1[2|6|8|9])+([0-9]{8}))\b)/;
    //   var checkRegex = this.customers.phone
    //     .toLocaleLowerCase()
    //     .match(phonenumberFormat);
    //   if (checkRegex == null) {
    //     this.notification.notify(
    //       this.gridViewSetup['Phone'].headerText + ' ' + 'không hợp lệ', ///
    //       '2'
    //     );
    //     this.validate++;
    //     return;
    //   }
    // }
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.form.form.save((o: RequestOption) => {
      o.service = 'SM';
      o.assemblyName = 'SM';
      o.className = 'CustomersBusiness';
      o.methodName = (this.form.form.data.isAdd || this.form.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      o.data = [this.form.form.data,this.lstAddress,this.lstContact,this.lstBank];
      return true;
    }, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res) {
        if (this.form.form.data.isAdd || this.form.form.data.isCopy) {
          this.dialog.dataService
            .add(this.form.form.data)
            .subscribe();
        }else{
          this.dialog.dataService.update({...this.form.form.data},true).subscribe();
          this.detectorRef.detectChanges();
        }
        this.dialog.close();
        if (this.form.data.isAdd || this.form.data.isCopy)
            this.notification.notifyCode('SYS006');
        else 
            this.notification.notifyCode('SYS007');
      }
    })
  }
  //#endregion
}
