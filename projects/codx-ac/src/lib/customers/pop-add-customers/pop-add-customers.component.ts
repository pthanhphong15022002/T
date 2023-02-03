import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CacheService, ApiHttpService, CallFuncService, NotificationsService, UIComponent, DialogData, DialogRef, FormModel, CodxFormComponent, DialogModel, RequestOption } from 'codx-core';
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
  styleUrls: ['./pop-add-customers.component.css']
})
export class PopAddCustomersComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  title:string;
  headerText:string;
  formModel: FormModel;
  dialog!: DialogRef;
  customers:Customers;
  contact:Contact;
  objectBankaccount:Array<BankAccount> = [];
  objectContact:Array<Contact> = [];
  objectAddress:Array<Address> = [];
  objectContactAddress:Array<Contact> = [];
  gridViewSetup:any;
  customerID:any;
  formType :any;
  viewTags:string[];
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-settings icon-20 me-3', text: 'Thiết lập', name: 'Establish' },
    { icon: 'icon-train', text: 'Thông tin giao hàng', name: 'Shipment Details'},
    { icon: 'icon-location_on me-1', text: 'Danh sách địa chỉ', name: 'Location' },
    { icon: 'icon-contacts', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-credit_card', text: 'Tài khoản ngân hàng', name: 'Atm' },
    { icon: 'icon-20 me-2 icon-tune', text: 'Thông tin khác', name: 'Infomation' },
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
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.viewTags = ['do go','van chuyen'];
    this.dialog = dialog;
    this.customers=dialog.dataService!.dataSelected;
    this.customers.industries = JSON.stringify(this.viewTags); 
    console.log(this.customers);
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.customerID = '';
    this.cache.gridViewSetup('Customers', 'grvCustomers').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (this.customers.customerID != null) {
      this.customerID = this.customers.customerID;
      this.api.exec(
        'ERM.Business.BS',
        'BankAccountsBusiness',
        'LoadDataAsync',
        [this.customerID]
      ).subscribe((res:any)=>{
        this.objectBankaccount = res;
      });  
      this.api.exec(
        'ERM.Business.BS',
        'AddressBookBusiness',
        'LoadDataAsync',
        [this.customerID]
      ).subscribe((res:any)=>{
        this.objectAddress = res;
        for(var i = 0 ; i<this.objectAddress.length ; i++){
            var recID = this.objectAddress[i].recID;
            this.api.exec(
              'ERM.Business.BS',
              'ContactBookBusiness',
              'LoadDataAsync',
              [recID]
            ).subscribe((res:any)=>{             
              res.forEach(element => {
                this.objectContactAddress.push(element);
              });
            }); 
          }
      }); 
      this.api.exec(
        'ERM.Business.BS',
        'ContactBookBusiness',
        'LoadDataAsync',
        [this.customerID]
      ).subscribe((res:any)=>{
        this.objectContact = res;
      }); 
    }
  }

  onInit(): void {

  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  valueChangeTags(e:any){
    this.customers[e.field].add(e.data);
    console.log(this.customers);
  }
  convertAddressType(addresstype:any){
    this.cache.valueList('AC015').subscribe((res) => {
      res.datas.forEach(element => {
        if (element.value == addresstype) {
          document.getElementById("adressType").innerHTML = element.text;
        }
      });
    });
  }
  valueChange(e:any,type:any){
    if (type == 'establishYear') {            
      e.data = e.data.fromDate;            
    }
    if (type == 'customerID') {            
      this.customerID = e.data;            
    }
    this.customers[e.field] = e.data;
  }
  openPopupBank(){
    var obj = {
      headerText: 'Thêm tài khoản ngân hàng',
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'BankAccounts';
    dataModel.gridViewName = 'grvBankAccounts';
    dataModel.entityName = 'BS_BankAccounts';
    opt.FormModel = dataModel;
    this.cache.gridViewSetup('BankAccounts','grvBankAccounts').subscribe(res=>{
      if(res){  
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
          var databankaccount = JSON.parse(localStorage.getItem('databankaccount'));
          if (databankaccount != null) {      
            this.objectBankaccount.push(databankaccount);
          }
          window.localStorage.removeItem("databankaccount");
        });
      }
    });
  }
  openPopupContact(){
    var obj = {
      headerText: 'Thêm người liên hệ',
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ContactBook';
    dataModel.gridViewName = 'grvContactBook';
    dataModel.entityName = 'BS_ContactBook';
    opt.FormModel = dataModel;
    this.cache.gridViewSetup('ContactBook','grvContactBook').subscribe(res=>{
      if(res){  
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
          window.localStorage.removeItem("datacontact");
        });
      }
    });
  }
  openPopupAddress(){
    var obj = {
      headerText: 'Thêm địa chỉ',
      dataContact:this.objectContact
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AddressBook';
    dataModel.gridViewName = 'grvAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    opt.FormModel = dataModel;
    this.cache.gridViewSetup('AddressBook','grvAddressBook').subscribe(res=>{
      if(res){  
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
          var datacontactaddress = JSON.parse(localStorage.getItem('datacontactaddress'));
          if (dataaddress != null) {      
            this.objectAddress.push(dataaddress);
          }
          if (datacontactaddress != null) {   
            datacontactaddress.forEach(element => {
              element.reference = dataaddress.recID;
              this.objectContactAddress.push(element);
            });
          }
          window.localStorage.removeItem("dataaddress");
          window.localStorage.removeItem("datacontactaddress");
        });
      }
    });
  }
  deleteobject(data:any,type:any){
    if (type == 'databank') {
      let index = this.objectBankaccount.findIndex(x => x.bankAcctID == data.bankAcctID && x.bankID == data.bankID);
      this.objectBankaccount.splice(index, 1);
    }
    if (type == 'datacontact') {
      let index = this.objectContact.findIndex(x => x.contactName == data.contactName && x.phone == data.phone);
      this.objectContact.splice(index, 1);
    }
    if (type == 'dataaddress') {
      let index = this.objectAddress.findIndex(x => x.adressType == data.adressType && x.adressName == data.adressName);
      this.objectContactAddress.forEach((element,index) => {
        if (element.reference == data.recID) {
          this.objectContactAddress.splice(index, 1);
        }
      });
      this.objectAddress.splice(index, 1);

    }
  }
  editobject(data:any,type:any){
    if (type == 'databank') {
      let index = this.objectBankaccount.findIndex(x => x.bankAcctID == data.bankAcctID);
      var obj = {
        headerText: 'Chỉnh sửa',
        data:data
      };
      let opt = new DialogModel();
      let dataModel = new FormModel();
      dataModel.formName = 'BankAccounts';
      dataModel.gridViewName = 'grvBankAccounts';
      dataModel.entityName = 'BS_BankAccounts';
      opt.FormModel = dataModel;
      this.cache.gridViewSetup('BankAccounts','grvBankAccounts').subscribe(res=>{
        if(res){  
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
            var databankaccount = JSON.parse(localStorage.getItem('databankaccount'));
            if (databankaccount != null) {      
              this.objectBankaccount[index] = databankaccount;
            }
            window.localStorage.removeItem("databankaccount");
          });
        }
      });
    }
    if (type == 'datacontact') {
      let index = this.objectContact.findIndex(x => x.contactName == data.contactName && x.phone == data.phone);
      var ob = {
        headerText: 'Chỉnh sửa liên hệ',
        data:{...data}
      };
      let opt = new DialogModel();
      let dataModel = new FormModel();
      dataModel.formName = 'ContactBook';
      dataModel.gridViewName = 'grvContactBook';
      dataModel.entityName = 'BS_ContactBook';
      opt.FormModel = dataModel;
      this.cache.gridViewSetup('ContactBook','grvContactBook').subscribe(res=>{
        if(res){  
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
            window.localStorage.removeItem("datacontact");
          });
        }
      });
    }
    if (type == 'dataaddress') {
      let index = this.objectAddress.findIndex(x => x.adressType == data.adressType && x.adressName == data.adressName);  
      var obs = {
        headerText: 'Chỉnh sửa địa chỉ',
        data : {...data},
        datacontactaddress: [...this.objectContactAddress]
      };
      let opt = new DialogModel();
      let dataModel = new FormModel();
      dataModel.formName = 'AddressBook';
      dataModel.gridViewName = 'grvAddressBook';
      dataModel.entityName = 'BS_AddressBook';
      opt.FormModel = dataModel;
      this.cache.gridViewSetup('AddressBook','grvAddressBook').subscribe(res=>{
        if(res){  
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
            var datacontactaddress = JSON.parse(localStorage.getItem('datacontactaddress'));
            if (dataaddress != null) {     
              this.objectAddress[index] = dataaddress;
            }
            if (datacontactaddress != null) {  
              datacontactaddress.forEach(element => {
                if (element.reference == null) {
                  element.reference = dataaddress.recID;
                  this.objectContactAddress.push(element);
                }else{
                  let index = this.objectContactAddress.findIndex(x => x.reference == element.reference);  
                  this.objectContactAddress[index] = element;
                }    
              });
            }
            window.localStorage.removeItem("dataaddress");
            window.localStorage.removeItem("datacontactaddress");
          });
        }
      });
    }
  }
  onSave(){
    if (this.customerID.trim() == '' || this.customerID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CustomerID'].headerText + '"'
      );
      return;
    }
    if (this.formType == 'add') {
      this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddAsync';
        opt.className = 'CustomersBusiness';
        opt.assemblyName = 'AR';
        opt.service = 'AR';
        opt.data = [this.customers];
        return true;
      })
      .subscribe((res) => {
        if (res.save) {
          this.api.exec(
            'ERM.Business.BS',
            'BankAccountsBusiness',
            'AddAsync',
            [this.customerID,this.objectBankaccount,this.objectAddress,this.objectContact,this.objectContactAddress]
          ).subscribe((res:[])=>{
            if (res) {
              this.dialog.close();
              this.dt.detectChanges();
            }
          });      
        }else{
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
        opt.assemblyName = 'AR';
        opt.service = 'AR';
        opt.data = [this.customers];
        return true;
      }).subscribe((res) => {
        if (res.save || res.update) {
          this.api.exec(
            'ERM.Business.BS',
            'BankAccountsBusiness',
            'UpdateAsync',
            [this.objectBankaccount]
          ).subscribe((res:any)=>{
            
          });  
          this.api.exec(
            'ERM.Business.BS',
            'AddressBookBusiness',
            'UpdateAsync',
            [this.objectAddress,this.objectContactAddress]
          ).subscribe((res:any)=>{
            
          });  
          this.api.exec(
            'ERM.Business.BS',
            'ContactBookBusiness',
            'UpdateAsync',
            [this.objectContact]
          ).subscribe((res:any)=>{
            
          });  
          this.dialog.close();
          this.dt.detectChanges();
        }
      })
    }
  }
}
