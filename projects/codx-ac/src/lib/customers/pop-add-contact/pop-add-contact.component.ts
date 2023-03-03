import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { BankAccount } from '../../models/BankAccount.model';
import { Contact } from '../../models/Contact.model';

@Component({
  selector: 'lib-pop-add-contact',
  templateUrl: './pop-add-contact.component.html',
  styleUrls: ['./pop-add-contact.component.css'],
})
export class PopAddContactComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  contact: Contact = new Contact();
  objectContact: Array<Contact> = [];
  gridViewSetup: any;
  recIdAddress: any;
  contactType: any;
  type: any;
  validate: any = 0;
  validateEmail: any = 0;
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
    this.type = dialogData.data?.type;
    this.objectContact = dialogData.data?.datacontact;
    this.recIdAddress = dialogData.data?.recIdAddress;
    this.cache
      .gridViewSetup('ContactBook', 'grvContactBook')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (dialogData.data?.data != null) {
      this.contact = dialogData.data?.data;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.contact.contactID = this.randomNumber();
  }
  //#endregion

  //#region Function
  randomNumber() {
    var number = Math.floor(Math.random() * 100000);
    return number.toString();
  }
  valueChange(e: any) {
    this.contact[e.field] = e.data;
  }
  clearContact() {
    this.form.formGroup.reset();
    this.contact = new Contact();
    this.contact.contactID = this.randomNumber();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.contact);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.contact[keymodel[i]] == null ||
              this.contact[keymodel[i]] == ''
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
  checkValidEmail() {
    const regex = new RegExp(
      '^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([A-Za-z]{2,6}(?:\\.[A-Za-z]{2,6})?)$'
    );
    var checkRegex = regex.test(this.contact.email);
    if (checkRegex == false) {
      this.notification.notify("'Email' không hợp lệ", '2');
      this.validate++;
      return;
    }
  }
  //#endregion

  //#region Method
  onSave() {
    if (this.contact.email != '') {
      this.checkValidEmail();
    }
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.notification.notifyCode('SYS006', 0, '');
      window.localStorage.setItem('datacontact', JSON.stringify(this.contact));
      this.dialog.close();
    }
  }
  onSaveAdd() {
    if (this.contact.email != null) {
      this.checkValidEmail();
    }
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.recIdAddress != null) {
        this.contact.reference = this.recIdAddress;
      }
      this.notification.notifyCode('SYS006', 0, '');
      this.objectContact.push({ ...this.contact });
      this.clearContact();
    }
  }
  //#endregion
}