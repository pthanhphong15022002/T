import { CM_Contacts } from './../../models/tmpCrm.model';
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
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment.prod';
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
  data: any;
  dialog: any;
  title = '';
  action: any;
  linkAvatar = '';
  funcID = '';
  contacts = [];
  contactsPerson: CM_Contacts;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
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
    }else{
      if(this.data.contacts != null && this.data.contacts.length > 0)
        this.contacts = this.data.contacts;
    }
  }

  ngOnInit(): void {}

  valueChange(e) {
    this.data.field = e.data;
  }

  beforeSave(op) {
    var data = [];
    if (this.action === 'add') {
      op.method = 'AddCrmAsync';
      op.className = 'CustomersBusiness';
      data = [
        this.data,
        this.dialog.formModel.formName,
        this.funcID,
        this.dialog.formModel.entityName,
      ];
    }
    if(this.contactsPerson != null){
      if (this.contacts != null && this.contacts.length > 0) {
        this.contacts.forEach((el) => {
          el.contactType = '2';
        });
      }
      this.contacts.push(this.contactsPerson);
      this.data.contacts = this.contacts;
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

  onSave() {
    this.onAdd();
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

  getNameCrm(data){
    if(this.funcID == "CM0101"){
      return data.customerName;
    }else if(this.funcID == "CM0102"){
      return data.contactName;
    }else if(this.funcID == "CM0103"){
      return data.partnerName;
    }else{
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
    dataModel.funcID = this.funcID;
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
    dataModel.funcID = this.funcID;
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
