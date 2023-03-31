import { CM_Contacts, tmpCrm } from './../../models/tmpCrm.model';
import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  CacheService,
  CRUDService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { PopupAddressComponent } from '../popup-address/popup-address.component';
import { PopupListContactsComponent } from './popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from './popup-quickadd-contact/popup-quickadd-contact.component';

@Component({
  selector: 'lib-popup-add-crmcustomer',
  templateUrl: './popup-add-crmcustomer.component.html',
  styleUrls: ['./popup-add-crmcustomer.component.css'],
})
export class PopupAddCrmcustomerComponent implements OnInit {
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
  data = new tmpCrm();
  dialog: any;
  title = '';
  action: any;
  linkAvatar = '';
  funcID = '';
  contacts = [];
  firstName: any;
  lastName: any;
  gridViewSetup: any;
  contactsPerson: CM_Contacts;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.action = dt.data[0];
    this.title = dt.data[1];
    if (this.action != 'add') {
      this.getAvatar(this.data);
      if (this.funcID == 'CM0102') {
        this.getLastAndFirstName(this.data?.contactName);
      }
      if (this.data.contacts != null && this.data.contacts.length > 0) {
        this.contacts = this.data.contacts;
        var check = this.contacts.find((x) => x.contactType == '1');
        if (check != null) this.contactsPerson = check;
      }
    }
  }

  ngOnInit(): void {
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  getLastAndFirstName(contactName) {
    if (contactName != null) {
      var nameArr = contactName.split(' ');
      if (nameArr != null && nameArr.length > 1) {
        this.lastName = nameArr.slice(0, -1).join(' ');
        this.firstName = nameArr[nameArr.length - 1];
      } else {
        this.firstName = contactName;
      }
    }
  }

  valueTagChange(e) {
    this.data.field = e.data;
  }

  valueChange(e) {
    if (e.field == 'firstName' || e.field == 'lastName') {
      this.firstName = e.field == 'firstName' ? e.data : this.firstName;
      this.lastName = e.field == 'lastName' ? e.data : this.lastName;
    } else {
      this.data[e.field] = e.data;
      if(this.funcID == 'CM0102'){
        if(e.field == 'isCustomer'){
          if(e.data == true){
            this.data.customerFrom = new Date();
          }else{
            this.data.customerFrom = null;
          }
        }
      }

    }
  }

  beforeSave(op) {
    var data = [];
    if (this.funcID == 'CM0101' || this.funcID == 'CM0103') {
      if (this.contactsPerson != null) {
        if (this.contacts != null && this.contacts.length > 0) {
          var check = this.contacts.find(x=> x.recID == this.contactsPerson.recID);
          if(check == null){
            this.contacts.forEach((el) => {
              el.contactType = '2';
            });
            this.contacts.push(this.contactsPerson);
          }
        }else{
          this.contacts.push(this.contactsPerson);
        }
        this.data.contacts = this.contacts;

      }
    }
    if (this.firstName != null && this.firstName.trim() != '') {
      if (this.lastName != null && this.lastName.trim() != '') {
        this.data.contactName = this.lastName + ' ' + this.firstName;
      } else {
        this.data.contactName = this.firstName;
      }
    } else {
      this.data.contactName = '';
    }
    if (this.action === 'add' || this.action == 'copy') {
      op.method = 'AddCrmAsync';
      op.className = 'CustomersBusiness';

      data = [
        this.data,
        this.dialog.formModel.formName,
        this.funcID,
        this.dialog.formModel.entityName,
        this.contactsPerson?.recID,
      ];
    } else {
      op.method = 'UpdateCustomerAsync';
      op.className = 'CustomersBusiness';

      data = [this.data, this.funcID, this.contactsPerson?.recID];
    }
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        this.imageAvatar.clearData();
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.imageAvatar.clearData();
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
            this.dialog.close(res.update);
        }else{
          this.dialog.close();
        }
      });
  }

  async onSave() {
    if (this.funcID == 'CM0102') {
      if (this.firstName == null || this.firstName.trim() == '') {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetup['ContactName'].headerText + '"'
        );
        return;
      }
      if (this.data.phoneNumber != null && this.data.phoneNumber.trim() != '') {
        if (!this.checkEmailOrPhone(this.data.phoneNumber, 'P')) return;
      }
      if (this.data.email != null && this.data.email.trim() != '') {
        if (!this.checkEmailOrPhone(this.data.email, 'E')) return;
      }
    }

    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((res) => {
        // save file
        if (res) {
          this.hanleSave();
        }
      });
    } else {
      this.hanleSave();
    }
  }

  hanleSave(){
    if(this.action == 'add' || this.action == 'copy'){
      this.onAdd();
    }else{
      this.onUpdate();
    }
  }

  checkEmailOrPhone(field, type) {
    if (type == 'E') {
      var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!field.toLowerCase().match(validEmail)) {
        this.notiService.notifyCode('SYS037');
        return false;
      }
    }
    if (type == 'P') {
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
      if (!field.toLowerCase().match(validPhone)) {
        this.notiService.notifyCode('RS030');
        return false;
      }
    }
    return true;
  }

  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }

  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

      this.changeDetectorRef.detectChanges();
    }
  }

  getAvatar(data) {
    let avatar = [
      '',
      this.funcID,
      data.recID,
      this.dialog.formModel.entityName,
      'inline',
      1000,
      this.getNameCrm(data),
      'avt',
      false,
    ];

    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  getNameCrm(data) {
    if (this.funcID == 'CM0101') {
      return data.customerName;
    } else if (this.funcID == 'CM0102') {
      return data.contactName;
    } else if (this.funcID == 'CM0103') {
      return data.partnerName;
    } else {
      return data.opponentName;
    }
  }

  openPopupAddress() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMAddresses';
    dataModel.gridViewName = 'grvCMAddresses';
    dataModel.entityName = 'CM_Addresses';
    dataModel.funcID = this.funcID;
    opt.FormModel = dataModel;
    this.callFc.openForm(PopupAddressComponent, '', 500, 550, '', '', '', opt);
  }

  //#region Contact
  //Open list contacts
  clickPopupContacts() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    var dialog = this.callFc.openForm(
      PopupListContactsComponent,
      '',
      500,
      550,
      '',
      '',
      '',
      opt
    );
    dialog.closed.subscribe((e) => {
      if (e && e.event != null) {
        //gán tạm thời để xử lí liên hệ chính
        this.contactsPerson = e.event;
        this.contactsPerson.contactType = '1';
      }
    });
  }

  //Open popup add contacts
  clickAddContact() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    var dialog = this.callFc.openForm(
      PopupQuickaddContactComponent,
      '',
      500,
      500,
      '',
      '',
      '',
      opt
    );
    dialog.closed.subscribe((e) => {
      if (e && e.event != null) {
        //gán tạm thời để xử lí liên hệ chính
        this.contactsPerson = e.event;
        this.contactsPerson.contactType = '1';
      }
    });
  }
  //#endregion
}
