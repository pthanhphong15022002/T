import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { environment } from 'src/environments/environment.prod';
import { PopupListContactsComponent } from '../popup-add-crmcustomer/popup-list-contacts/popup-list-contacts.component';
import { PopupQuickaddContactComponent } from '../popup-add-crmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';
import { PopupAddressComponent } from '../popup-address/popup-address.component';

@Component({
  selector: 'lib-popup-add-crm-partner',
  templateUrl: './popup-add-crm-partner.component.html',
  styleUrls: ['./popup-add-crm-partner.component.scss']
})
export class PopupAddCrmPartnerComponent implements OnInit {

  // type any
  dialog:any;
  funcID:any;
  entity:any;
  linkAvatar:any;
  imageAvatar:any;


  //type string
  title:string;
  action:string;

  // type object
  partner:any;
  data:any;
  contactsPerson: any;

  constructor(

  private cache: CacheService,
  private callfc: CallFuncService,
  private authStore: AuthStore,
  private notiService: NotificationsService,
  private api: ApiHttpService,
  private changeDetectorRef: ChangeDetectorRef,
  @Optional() dt?: DialogData,
  @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.action = dt.data[0];
    this.title = dt.data[1];
    if (this.action != 'add') {
      this.getAvatar(this.data.recID);
    }
  }

  ngOnInit(): void {

  }

  valueChangeTag($event){

  }
  onSave(){

  }

  valueChange(e) {
    this.partner[e.field] = e.data;
  }


  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

      this.changeDetectorRef.detectChanges();
    }
  }
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }

  getAvatar(process) {
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
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

  openPopupAddress() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CRMCustomers';
    dataModel.gridViewName = 'grvCRMCustomers';
    dataModel.entityName = 'CRM_Customers';
    opt.FormModel = dataModel;
    this.callfc.openForm(PopupAddressComponent, '', 500, 550, '', '', '', opt);
  }

  //#region Contact
  //Open list contacts
  clickPopupContacts() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CRMCustomers';
    dataModel.gridViewName = 'grvCRMCustomers';
    dataModel.entityName = 'CRM_Customers';
    opt.FormModel = dataModel;
    this.callfc.openForm(
      PopupListContactsComponent,
      '',
      500,
      550,
      '',
      '',
      '',
      opt
    );
  }

  //Open popup add contacts
  clickAddContact() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CRMCustomers';
    dataModel.gridViewName = 'grvCRMCustomers';
    dataModel.entityName = 'CRM_Customers';
    opt.FormModel = dataModel;
    this.callfc.openForm(
      PopupQuickaddContactComponent,
      '',
      500,
      500,
      '',
      '',
      '',
      opt
    );
  }
}
