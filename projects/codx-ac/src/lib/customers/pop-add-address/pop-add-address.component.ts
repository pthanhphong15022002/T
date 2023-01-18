import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Address } from '../../models/Address.model';

@Component({
  selector: 'lib-pop-add-address',
  templateUrl: './pop-add-address.component.html',
  styleUrls: ['./pop-add-address.component.css']
})
export class PopAddAddressComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
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
  }

  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.address = this.form?.formGroup.value;
  }
  valueChange(e:any,type:any){
    if (type == 'adressType') {
      this.adressType = e.data;
      this.address.adressTypeName = e.component.dropdown.typedString;
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
    this.dialog.close();
  }
}
