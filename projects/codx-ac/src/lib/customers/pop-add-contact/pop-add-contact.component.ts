import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { BankAccount } from '../../models/BankAccount.model';
import { Contact } from '../../models/Contact.model';

@Component({
  selector: 'lib-pop-add-contact',
  templateUrl: './pop-add-contact.component.html',
  styleUrls: ['./pop-add-contact.component.css']
})
export class PopAddContactComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  contact:Contact;
  objectContact: Array<Contact> = [];
  gridViewSetup:any;
  contactName:any;
  jobTitle:any;
  phone:any;
  email:any;
  contactType:any;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData 
     ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.contactName = '';
    this.jobTitle = '';
    this.phone = '';
    this.email = '';
    this.contactType = '';
    this.objectContact = dialogData.data?.datacontact;
    this.cache.gridViewSetup('ContactBook', 'grvContactBook').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (dialogData.data?.data != null) {    
      this.contact = dialogData.data?.data;
      this.contactName = dialogData.data?.data.contactName;
      this.jobTitle = dialogData.data?.data.jobTitle;
      this.phone = dialogData.data?.data.phone;
      this.email = dialogData.data?.data.email;
      this.contactType = dialogData.data?.data.contactType;
    }
  }
//#endregion

//#region Init
  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.contact == null) {
    this.contact = this.form.formGroup.value
    this.contact.longitude = 0;
    this.contact.income = 0;
    this.contact.latitude = 0;
    this.contact.counts = 0;
    this.contact.recID = Guid.newGuid();
    this.contact.contactID = this.randomNumber();
    }
  }
  //#endregion
  
  //#region Function
  randomNumber(){
    var number = Math.floor(Math.random() * 100000);
    return number.toString();
  }
  valueChange(e:any){
    this.contact[e.field] = e.data;   
  }
  valueChangeContactName(e: any) {
    this.contactName = e.data;
    this.contact[e.field] = e.data;
  }
  valueChangeJobTitle(e: any) {
    this.jobTitle = e.data;
    this.contact[e.field] = e.data;
  }
  valueChangePhone(e: any) {
    this.phone = e.data;
    this.contact[e.field] = e.data;
  }
  valueChangeEmail(e: any) {
    this.email = e.data;
    this.contact[e.field] = e.data;
  }
  valueChangeContactType(e: any) {
    this.contactType = e.data;
    this.contact[e.field] = e.data;
  }
  clearContact(){
      this.contactName = ''
      this.jobTitle = '';
  }
  //#endregion

  //#region CRUD
  onSave(){
    if (this.contactName.trim() == '' || this.contactName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ContactName'].headerText + '"'
      );
      return;
    }
    if (this.jobTitle.trim() == '' || this.jobTitle == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['JobTitle'].headerText + '"'
      );
      return;
    }
    if (this.phone.trim() == '' || this.phone == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Phone'].headerText + '"'
      );
      return;
    }
    if (this.email.trim() == '' || this.email == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Email'].headerText + '"'
      );
      return;
    }
    if (this.contactType.trim() == '' || this.contactType == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ContactType'].headerText + '"'
      );
      return;
    }
    window.localStorage.setItem("datacontact",JSON.stringify(this.contact));
    this.dialog.close();
  }
  onSaveAdd(){
      this.clearContact();
      this.objectContact.push(this.contact);
      
  }
  //#endregion
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
