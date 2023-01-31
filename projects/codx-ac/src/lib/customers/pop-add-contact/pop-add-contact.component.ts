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
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText:string;
  formModel: FormModel;
  contact:Contact;
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
    @Optional() dialogData?: DialogData,
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.contactName = '';
    this.jobTitle = '';
    this.phone = '';
    this.email = '';
    this.contactType = '';
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

  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.contact = this.form.formGroup.value
    this.contact.longitude = 0;
    this.contact.income = 0;
    this.contact.latitude = 0;
    this.contact.counts = 0;
    this.contact.recID = Guid.newGuid();
  }
  valueChange(e:any,type:any){
    if (type == 'contactName') {
      this.contactName = e.data;
    }
    if (type == 'jobTitle') {
      this.jobTitle = e.data;
    }
    if (type == 'phone') {
      this.phone = e.data;
    }
    if (type == 'email') {
      this.email = e.data;
    }
    if (type == 'contactType') {
      this.contactType = e.data;
    }
    this.contact[e.field] = e.data;
  }
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
