import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AttachmentComponent } from '../attachment/attachment.component';
import {
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
} from 'codx-core';
import { PopupQuickaddContactComponent } from 'projects/codx-cm/src/lib/cmcustomer/cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';

@Component({
  selector: 'codx-input-custom-field',
  templateUrl: './codx-input-custom-field.component.html',
  styleUrls: ['./codx-input-custom-field.component.css'],
})
export class CodxInputCustomFieldComponent implements OnInit {
  @Input() customField: any = null;
  @Output() valueChangeCustom = new EventEmitter<any>();
  @Output() addFileCompleted = new EventEmitter<boolean>();
  //file - đặc thù cần hỏi lại sauF
  @Input() objectId: any = '';
  @Input() checkValid = true;
  @Input() objectType: any = '';
  @Input() funID: any = '';
  @Input() formModel: any = null;
  @Input() disable = false;
  @Input() viewFieldName = false;
  @Input() objectIdParent: any = '';
  placeholderRole = 'Vai trò........';

  // @Input() readonly = false;
  @ViewChild('attachment') attachment: AttachmentComponent;

  addSuccess = true;
  errorMessage = '';
  showErrMess = false;
  //data tesst
  typeControl = 'text';
  currentRate = 0;
  hovered = 0;

  min = 0;
  max = 9999999;
  formatDate = 'd';
  allowMultiFile = '1';
  isPopupUserCbb = false;
  messCodeEmail = 'SYS037'; // Email ko hợp lê
  messCodePhoneNum = 'RS030';
  listIdUser: string = '';
  arrIdUser = [];
  numberChange = 0;
  listContacts = [];
  dataContact: any;
  formModelContact: FormModel;
  popoverCrr: any;
  moreFunctionSYS: any;

  constructor(
    private cache: CacheService,
    private changeDef: ChangeDetectorRef,
    private callfc: CallFuncService
  ) {
    this.cache.message('SYS028').subscribe((res) => {
      if (res) this.errorMessage = res.customName || res.defaultName;
    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) {
        this.moreFunctionSYS = mFuc;
      }
    });
  }

  ngOnInit(): void {
    switch (this.customField.dataType) {
      case 'D':
        if (this.customField.dataFormat == '3') this.formatDate = 'd';
        if (
          this.customField.dataFormat == '1' ||
          this.customField.dataFormat == '2'
        )
          this.formatDate = 'F';
        if (
          this.customField.dataFormat == '4' ||
          this.customField.dataFormat == '5'
        )
          this.formatDate = 't';
        break;
      case 'P':
        this.listIdUser = this.customField?.dataValue ?? '';
        this.arrIdUser = this.listIdUser ? this.listIdUser.split(';') : [];
        break;
      case 'A':
        this.allowMultiFile = this.customField.multiselect ? '1' : '0';
        break;
      case 'R':
        this.currentRate = Number.parseInt(this.customField.dataValue) ?? 0;
        break;
      case 'C':
        this.formModelContact = new FormModel();
        this.formModelContact.formName = 'CMContacts';
        this.formModelContact.gridViewName = 'grvCMContacts';
        this.formModelContact.entityName = 'CM_Contacts';
        this.formModelContact.funcID = 'CM0102';
        this.cache
          .gridViewSetup(
            this.formModelContact.formName,
            this.formModelContact.gridViewName
          )
          .subscribe((res) => {
            this.placeholderRole =
              res?.Role?.headerText ?? this.placeholderRole;
          });

        let arrValue = JSON.parse(this.customField.dataValue);
        this.listContacts = Array.isArray(arrValue) ? arrValue : [];
        break;
    }
  }

  valueChange(e) {
    let checkNull = !e || !e.data || e.data.toString().trim() == '';
    // if (this.checkValid) {
    if (this.customField.isRequired && checkNull) {
      this.cache.message('SYS028').subscribe((res) => {
        if (res) this.errorMessage = res.customName || res.defaultName;
        this.showErrMess = true;
      });
      if (!this.checkValid) return;
    } else this.showErrMess = false;
    // } else this.showErrMess = false;

    switch (this.customField.dataType) {
      case 'T':
        if (this.customField.dataFormat == 'E') {
          let email = e.data;
          var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (!email.toLocaleLowerCase().match(mailformat)) {
            this.cache.message(this.messCodeEmail).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
              }
              this.showErrMess = true;
              this.changeDef.detectChanges();
            });

            if (!this.checkValid) return;
          } else this.showErrMess = false;
        }
        //format so dien thoai
        if (this.customField.dataFormat == 'P') {
          let phone = e.data;
          var phonenumberFormat =
            /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
          if (!phone.toLocaleLowerCase().match(phonenumberFormat)) {
            this.cache.message(this.messCodePhoneNum).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
              }
              this.showErrMess = true;
              this.changeDef.detectChanges();
            });

            if (!this.checkValid) return;
          } else this.showErrMess = false;
        }
        break;
    }

    this.valueChangeCustom.emit({ e: e, data: this.customField });
  }
  //combox user
  openUserPopup() {
    this.isPopupUserCbb = true;
  }

  valueCbxUserChange(e) {
    if (this.isPopupUserCbb) this.isPopupUserCbb = false;
    if (e && e.id) {
      if (!this.listIdUser || this.customField.dataFormat == '1')
        this.listIdUser = e.id;
      else this.listIdUser += ';' + e.id;
      this.arrIdUser = Array.from(
        new Set(this.listIdUser ? this.listIdUser.split(';') : [])
      );
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  deleteUser(id) {
    let index = this.arrIdUser.indexOf(id);
    if (index > -1) {
      this.arrIdUser.splice(index, 1);
      if (this.arrIdUser?.length > 0)
        this.listIdUser = this.arrIdUser.join(';');
      else this.listIdUser = '';
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  valueChangeTime(e) {
    if (this.customField.dataValue && this.numberChange == 0) {
      this.numberChange = 1;
      return;
    }
    this.valueChangeCustom.emit({ e: e, data: this.customField });
  }

  addFile() {
    this.addSuccess = false;
    this.addFileCompleted.emit(this.addSuccess);
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {}

  fileSave(e) {
    let result = '';
    if (e && typeof e === 'object') {
      var filed = Array.isArray(e) ? e[0].data : e;
      result = filed?.objectID + ';' + filed?.objectType;
    }
    this.addSuccess = true;
    this.valueChangeCustom.emit({ e: result, data: this.customField });
    this.addFileCompleted.emit(this.addSuccess);
  }
  rateChange(e) {
    //rank
    // if (this.customField.dataFormat == 'R') {
    this.valueChangeCustom.emit({
      e: e,
      data: this.customField,
    });
    //  return;
    //}//
  }
  controlBlur(e) {
    // if (e.crrValue) this.valueChange(e.crrValue);
  }

  //Type Contact
  openContact() {
    let action = 'add';
    let data = null;
    let type = 'formAdd';
    let objectID = this.objectIdParent; //recID của co hoi
    let objectType = '4';
    let objectName = '';
    let customerID = null;
    var title = '';
    let opt = new DialogModel();

    let mfc = Array.from<any>(this.moreFunctionSYS).find(
      (x: any) => x.functionID === 'SYS01'
    );

    title = mfc.defaultName;
    opt.FormModel = this.formModelContact;

    this.cache
      .gridViewSetup(
        this.formModelContact.formName,
        this.formModelContact.gridViewName
      )
      .subscribe((res) => {
        var obj = {
          moreFuncName: title,
          action: action,
          dataContact: data,
          type: type,
          recIDCm: objectID,
          objectType: objectType,
          objectName: objectName,
          gridViewSetup: res,
          listContacts: this.listContacts,
          customerID: customerID,
        };
        var dialog = this.callfc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          700,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e?.event && e.event?.recID) {
            let contact = e.event;
            let idx = this.listContacts.findIndex(
              (x) => x.recID == contact?.recID
            );
            if (idx == -1) this.listContacts.push(contact);
            else this.listContacts[idx] = contact;
            this.valueChangeCustom.emit({
              e: JSON.stringify(this.listContacts),
              data: this.customField,
            });
          }
        });
      });
  }

  updateRole(event: string, recID) {
    var index = -1;
    if (event == '' || event.trim() == '') {
      index = -1;
      return;
    }
    index = this.listContacts.findIndex((x) => x.recID == recID);
    if (index != -1) {
      this.listContacts[index]['role'] = event?.trim();
    }
  }

  openPopper(contact, p) {
    if (this.popoverCrr && p != this.popoverCrr && this.popoverCrr.isOpen()) {
      this.popoverCrr.close();
      return;
    }
    this.dataContact = contact;
    p.open();
    this.popoverCrr = p;
  }
  closePopper(p) {
    p.close();
    this.popoverCrr = p;
  }
}
