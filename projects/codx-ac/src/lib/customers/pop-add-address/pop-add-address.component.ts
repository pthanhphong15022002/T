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
  gridViewSetup:any;
  address: Address;
  objectContactAddress:Array<Contact> = [];
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
    this.adressType = '';
    this.adressName = '';
    this.countryID = '';
    this.provinceID = '';
    this.districtID = '';
    this.postalCode = '';
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
    }
    if (dialogData.data?.datacontactaddress != null) {
      this.objectContactAddress = dialogData.data?.datacontactaddress;
    }
  }

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
  valueChange(e:any,type:any){
    if (type == 'adressType') {
      this.adressType = e.data;
    }
    if (type == 'adressName') {
      this.adressName = e.data;
    }
    if (type == 'countryID') {
      this.countryID = e.data;
    }
    if (type == 'provinceID') {
      this.provinceID = e.data;
    }
    if (type == 'districtID') {
      this.districtID = e.data;
    }
    if (type == 'postalCode') {
      this.postalCode = e.data;
    }
    this.address[e.field] = e.data;
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
            this.objectContactAddress.push(datacontact);
          }
          window.localStorage.removeItem("datacontact");
        });
      }
    });
  }
  editobject(data:any,type:any){
    let index = this.objectContactAddress.findIndex(x => x.contactName == data.contactName && x.phone == data.phone);
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
            this.objectContactAddress[index] = datacontact;
          }
          window.localStorage.removeItem("datacontact");
        });
      }
    });
  }
  deleteobject(data:any,type:any){
    
  }
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
    this.dialog.close();
  } 
}
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
