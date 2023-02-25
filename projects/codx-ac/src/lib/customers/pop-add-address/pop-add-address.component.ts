import { ChangeDetectorRef, Component, Injector, OnInit, Optional, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent, ViewsComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Address } from '../../models/Address.model';
import { Contact } from '../../models/Contact.model';
import { PopAddContactComponent } from '../pop-add-contact/pop-add-contact.component';

@Component({
  selector: 'lib-pop-add-address',
  templateUrl: './pop-add-address.component.html',
  styleUrls: ['./pop-add-address.component.css']
})
export class PopAddAddressComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form',{ static:true})  form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  adressType:any;
  adressName:any;
  countryID:any;
  provinceID:any;
  districtID:any;
  postalCode:any;
  objectype:any;
  note:any;
  isDefault:any;
  type:any;
  gridViewSetup:any;
  address: Address;
  objectAddress:Array<Address> = [];
  objectContactAddress:Array<Contact> = [];
  objectContactAddressAfter:Array<Contact> = [];
  objectContactAddressDelete:Array<Contact> = [];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.objectype = dialogData.data?.objectype;
    this.objectAddress = dialogData.data?.dataAddress;
    this.objectContactAddressAfter = dialogData.data?.dataContactAddress;  
    this.adressType = null;
    this.adressName = '';
    this.countryID = '';
    this.provinceID = '';
    this.districtID = '';
    this.postalCode = '';
    this.note = '';
    this.isDefault = false;
    this.cache.gridViewSetup('AddressBook', 'grvAddressBook').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (dialogData.data?.data != null) {
      this.address = dialogData.data?.data;
      this.adressType = dialogData.data?.data.adressType;
      this.adressName = dialogData.data?.data.adressName;
      this.countryID = dialogData.data?.data.countryID;
      this.provinceID = dialogData.data?.data.provinceID;
      this.districtID = dialogData.data?.data.districtID;
      this.postalCode = dialogData.data?.data.postalCode;
      this.note = dialogData.data?.data.note;
      this.isDefault = dialogData.data?.data.isDefault;
    }
    if (dialogData.data?.datacontactaddress != null) {
      this.objectContactAddress = dialogData.data?.datacontactaddress;
    }
  }
//#endregion

//#region Init
  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.address == null) {
      this.address = this.form.formGroup.value;
      this.address.longitude = 0;
      this.address.distance = 0;
      this.address.latitude = 0;
      this.address.duration = 0;
      this.address.recID = Guid.newGuid();
    }
  }
  //#endregion

  //#region Function
  valueChange(e:any){
    switch(e.field){
      case 'note':
        this.note = e.data;
      break;
      case 'isDefault':
        this.isDefault = e.data;
      break;
    }
    this.address[e.field] = e.data;
  }
  valueChangeAdressType(e: any) {
    this.adressType = e.data;
    this.address[e.field] = e.data;
  }
  valueChangeAdressName(e: any) {
    this.adressName = e.data;
    this.address[e.field] = e.data;
  }
  valueChangeCountryID(e: any) {
    this.countryID = e.data;
    this.address[e.field] = e.data;
  }
  valueChangeProvinceID(e: any) {
    this.provinceID = e.data;
    this.address[e.field] = e.data;
  }
  valueChangeDistrictID(e: any) {
    this.districtID = e.data;
    this.address[e.field] = e.data;
  }
  valueChangePostalCode(e: any) {
    this.postalCode = e.data;
    this.address[e.field] = e.data;
  }
  openPopupContact(){
    var obj = {
      headerText: 'Thêm người liên hệ',
      datacontact: this.objectContactAddress,
      recIdAddress: this.address.recID
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
            datacontact.reference = this.address.recID;  
            this.objectContactAddress.push(datacontact);
          }
          window.localStorage.removeItem("datacontact");
        });
      }
    });
  }
  editobject(data:any,type:any){
    let index = this.objectContactAddress.findIndex(x => x.contactID == data.contactID);
    var ob = {
      headerText: 'Chỉnh sửa liên hệ',
      type:'editContact',
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
            this.objectContactAddress[index] = datacontact;
          }
          window.localStorage.removeItem("datacontact");
        });
      }
    });
  }
  deleteobject(data:any,type:any){
      let index = this.objectContactAddress.findIndex(x => x.reference == data.reference && x.recID == data.recID);
      this.objectContactAddress.splice(index, 1);
      this.objectContactAddressDelete.push(data);
  }
  clearAddress(){
    this.adressType = null;
    this.adressName = '';
    this.countryID = null;
    this.provinceID = null;
    this.districtID = null;
    this.postalCode = null;
    this.note = '';
    this.isDefault = false;
    this.address.recID = Guid.newGuid();
    this.objectContactAddress = [];
  }
  //#endregion

  //#region CRUD
  onSave(){
    if (this.adressType.trim() == '' || this.adressType == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AdressType'].headerText + '"'
      );
      return;
    }
    if (this.adressName.trim() == '' || this.adressName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AdressName'].headerText + '"'
      );
      return;
    }
    // if (this.countryID.trim() == '' || this.countryID == null) {
    //   this.notification.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['CountryID'].headerText + '"'
    //   );
    //   return;
    // }
    // if (this.provinceID.trim() == '' || this.provinceID == null) {
    //   this.notification.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['ProvinceID'].headerText + '"'
    //   );
    //   return;
    // }
    // if (this.districtID.trim() == '' || this.districtID == null) {
    //   this.notification.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['DistrictID'].headerText + '"'
    //   );
    //   return;
    // }
    // if (this.postalCode.trim() == '' || this.postalCode == null) {
    //   this.notification.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.gridViewSetup['PostalCode'].headerText + '"'
    //   );
    //   return;
    // }
    window.localStorage.setItem("dataaddress",JSON.stringify(this.address));
    window.localStorage.setItem("datacontactaddress",JSON.stringify(this.objectContactAddress));
    window.localStorage.setItem("datacontactaddressdelete",JSON.stringify(this.objectContactAddressDelete));
    this.notification.notifyCode(
      'SYS006',
      0,
      ''
    );
    this.dialog.close();
  } 
  onSaveAdd(){
    if (this.adressType.trim() == '' || this.adressType == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AdressType'].headerText + '"'
      );
      return;
    }
    if (this.adressName.trim() == '' || this.adressName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AdressName'].headerText + '"'
      );
      return;
    }
    this.objectAddress.push({...this.address});
    this.objectContactAddress.forEach((element) => {
    this.objectContactAddressAfter.push({...element});
    });
    this.notification.notifyCode(
      'SYS006',
      0,
      ''
    );
    this.clearAddress();
  }
  //#endregion
}
//#region Guid
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
//#endregion
