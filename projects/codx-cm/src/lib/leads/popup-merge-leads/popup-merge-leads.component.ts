import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  Util,
} from 'codx-core';
import { CM_Leads } from '../../models/cm_model';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { PopupRemoveAddContactComponent } from './popup-remove-add-contact/popup-remove-add-contact.component';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'lib-popup-merge-leads',
  templateUrl: './popup-merge-leads.component.html',
  styleUrls: ['./popup-merge-leads.component.css'],
})
export class PopupMergeLeadsComponent implements OnInit {
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  @ViewChild('imageAvatarContact') imageAvatarContact: ImageViewerComponent;

  dialog: any;
  leadNew: CM_Leads = new CM_Leads();
  leadOne: CM_Leads = new CM_Leads();
  leadTwo: CM_Leads = new CM_Leads();
  leadThree: CM_Leads = new CM_Leads();
  dialogSup: DialogRef;

  title = '';
  gridViewSetup: any;
  checkAvata = true;
  lstContactNew = [];
  lstContactOne = [];
  lstContactTwo = [];
  lstContactThree = [];
  lstAddressNew = [];
  lstAddressOne = [];
  lstAddressTwo = [];
  lstAddressThree = [];
  fieldContacts = { text: 'contactName', value: 'recID' };
  fieldAddress = { text: 'address', value: 'recID' };
  addressDefault: any;
  contactDefault: any;
  popoverCrr: any;
  contactDefaultOne = '';
  linkAvatarNew: any;
  linkAvatarOne: any;
  linkAvatarTwo: any;
  linkAvatarThree: any;
  changeAvata: boolean = false;
  changeAvataContact: boolean = false;

  recIDLead: any;
  nameLead: any;
  lstLeadCbxOne = [];
  lstLeadCbxTwo = [];
  lstLeadCbxThree = [];
  fieldCbx = { text: 'leadName', value: 'recID' };
  modifyOn: Date;
  countValidate = 0;
  lstVllSupport = [];
  recIDAvt: any;
  nameContact: any;
  modifyOnContact: Date;
  data: any;
  isDate: boolean = false;
  isMulti = false;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private changeDetector: ChangeDetectorRef,
    private api: ApiHttpService,
    private noti: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.leadOne = JSON.parse(JSON.stringify(dt?.data?.leadOne));
    this.leadTwo =
      dt?.data?.leadTwo != null
        ? JSON.parse(JSON.stringify(dt?.data?.leadTwo))
        : new CM_Leads();
    this.leadThree =
      dt?.data?.leadThree != null
        ? JSON.parse(JSON.stringify(dt?.data?.leadThree))
        : new CM_Leads();
    if (dt?.data?.leadThree == null) {
      this.leadThree.recID = null;
    }
    this.isMulti = dt?.data?.isMulti;
  }
  async ngOnInit() {
    this.isDate = false;
    this.changeAvata = false;
    this.changeAvataContact = false;
  }

  async ngAfterViewInit() {
    this.leadNew = JSON.parse(JSON.stringify(this.leadOne));
    this.leadNew.recID = Util.uid();
    this.leadNew.contactID = Util.uid();
    this.leadNew.memo = this.leadNew.memo ?? '';
    this.leadNew.note = this.leadNew.note ?? '';
    this.leadNew.category = this.leadNew.category ?? '1';
    if(this.leadNew.category == '1'){
      this.recIDLead = this.leadOne?.recID;
      this.recIDAvt = this.leadOne?.contactID;
      this.nameContact = this.leadOne.contactName;
      this.nameLead = this.leadOne?.leadName;
      this.modifyOn = this.leadOne?.modifiedOn;
      this.modifyOnContact = this.leadOne?.modifiedOn;
    }
    if (!this.isMulti) {
      this.leadThree.recID = null;
      this.leadTwo.recID = null;
    }
    this.lstLeadCbxOne = await this.getCbxLead(
      null,
      null,
      this.leadOne.category
    );
    this.lstLeadCbxTwo = await this.getCbxLead(
      this.leadOne?.recID,
      this.leadThree?.recID,
      this.leadOne.category
    );
    this.lstLeadCbxThree = await this.getCbxLead(
      this.leadOne?.recID,
      this.leadTwo?.recID,
      this.leadOne.category
    );
    // if (this.leadOne) {
    //   this.lstContactOne = await this.getContacts(this.leadOne?.recID);
    //   this.lstAddressOne = await this.getListAddress(
    //     this.dialog?.formModel?.entityName,
    //     this.leadOne?.recID
    //   );
    // }
    this.gridViewSetup = await firstValueFrom(
      this.cache.gridViewSetup('CMLeads', 'grvCMLeads')
    );
    this.changeDetector.detectChanges();
  }

  getContactDefault(lstContact) {
    return lstContact.filter((x) => x.isDefault);
  }

  async getContacts(objectID) {
    var lst = [];
    lst = await firstValueFrom(this.cmSv.getListContactByObjectID(objectID));
    return lst;
  }
  async getListAddress(entityName, recID) {
    var lst = [];
    lst = await firstValueFrom(this.cmSv.getListAddress(entityName, recID));
    return lst;
  }
  async getCbxLead(id1, id2, category) {
    var options = new DataRequest();
    options.entityName = 'CM_Leads';
    options.predicates = `(Status=@0 or Status=@1) and RecID!=@2 and RecID!=@3 and IsDuplicated==false and Closed==false and ${
      category ? 'Category=@4' : 'Category==NULL'
    }`;
    options.dataValues =
      '15' +
      ';' +
      '1' +
      ';' +
      (id1 ?? Util.uid()) +
      ';' +
      (id2 ?? Util.uid()) +
      (category ? ';' + category : '');

    options.pageLoading = false;
    var lst = await firstValueFrom(this.cmSv.loadDataAsync('CM', options));
    lst =
      lst != null
        ? Array.from(new Set(lst.map((obj) => obj.recID))).map((x) => {
            return lst.find((obj) => obj.recID === x);
          })
        : [];
    return lst;
  }

  //#region  Save
  async onMerge() {
    this.gridViewSetup.ProcessID.isRequire = false;

    this.countValidate = this.cmSv.checkValidate(
      this.gridViewSetup,
      this.leadNew
    );
    if (this.countValidate > 0) {
      return;
    }

    if (
      this.leadNew.companyPhone != null &&
      this.leadNew.companyPhone.trim() != ''
    ) {
      if (!this.checkEmailOrPhone(this.leadNew.companyPhone, 'P')) return;
    }

    if (this.leadTwo == null && this.leadThree == null) {
      this.noti.notifyCode('CM008');
      return;
    }
    var data = [
      this.leadNew,
      this.leadOne?.recID,
      this.leadTwo?.recID,
      this.leadThree?.recID,
      this.changeAvata == false ? this.recIDLead : null,
    ];
    if (this.changeAvata) {
      await firstValueFrom(
        this.imageAvatar.updateFileDirectReload(this.leadNew?.recID)
      );
    }
    if (this.changeAvataContact) {
      await firstValueFrom(
        this.imageAvatarContact.updateFileDirectReload(this.leadNew?.contactID)
      );
    } else {
      await firstValueFrom(
        this.cmSv.copyFileAvata(this.recIDAvt, this.leadNew.contactID)
      );
    }
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'LeadsBusiness',
        'MergeLeadAsync',
        data
      )
      .subscribe(async (res) => {
        if (res) {
          var lstObjectIdFile = [];
          lstObjectIdFile = this.getListIdFile();
          var lstRef = [];
          lstRef.push('avt');
          await firstValueFrom(
            this.api.execSv<any>(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'CopyListFilesFromListObjectIDToObjectIDAsync',
              [this.leadNew?.recID, lstObjectIdFile, lstRef]
            )
          );
          this.dialog.close([res, this.leadOne, this.leadTwo, this.leadThree]);
          this.noti.notifyCode('SYS034');
        }
      });
  }

  onSupport(popup) {
    this.cache.valueList('CRM038').subscribe((vllSFormat) => {
      this.lstVllSupport = vllSFormat?.datas;
      let dialogModel = new DialogModel();
      dialogModel.zIndex = 1001;
      this.dialogSup = this.callFc.openForm(
        popup,
        '',
        600,
        400,
        '',
        null,
        '',
        dialogModel
      );
    });
  }

  checkEmailOrPhone(field, type) {
    if (type == 'E') {
      var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!field.toLowerCase().match(validEmail)) {
        this.noti.notifyCode('SYS037');
        return false;
      }
    }
    if (type == 'P') {
      var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(02+([0-9]{9})))\b)/;
      if (!field.toLowerCase().match(validPhone)) {
        this.noti.notifyCode('RS030');
        return false;
      }
    }
    return true;
  }

  getListIdFile() {
    var lstID = [];

    if (this.leadOne?.recID != null) {
      lstID.push(this.leadOne.recID);
    }
    if (this.leadTwo?.recID != null) {
      lstID.push(this.leadTwo.recID);
    }
    if (this.leadThree?.recID != null) {
      lstID.push(this.leadThree.recID);
    }

    return lstID;
  }

  async getListFile(objectID, objectType) {
    var lst = await firstValueFrom(
      this.cmSv.getListFile('CM0205', objectID, objectType, '')
    );
    return lst ? lst : [];
  }
  //#endregion
  async cbxLeadChange(e, type) {
    if (e) {
      if (type == 'two') {
        if (e != this.leadTwo?.recID) {
          var index = this.lstLeadCbxTwo.findIndex((x) => x.recID == e);
          if (index != -1) {
            this.leadTwo = this.lstLeadCbxTwo[index];
            this.lstLeadCbxThree = await this.getCbxLead(
              this.leadOne?.recID,
              this.leadTwo?.recID,
              this.leadOne.category
            );
            this.lstContactTwo = await this.getContacts(this.leadTwo?.recID);
            this.lstAddressTwo = await this.getListAddress(
              this.dialog?.formModel?.entityName,
              this.leadTwo?.recID
            );
          }
        }
      } else {
        if (e != this.leadThree?.recID) {
          var index = this.lstLeadCbxThree.findIndex((x) => x.recID == e);
          if (index != -1) {
            this.leadThree = this.lstLeadCbxThree[index];

            this.lstLeadCbxTwo = await this.getCbxLead(
              this.leadOne?.recID,
              this.leadThree?.recID,
              this.leadOne.category
            );
            this.lstContactThree = await this.getContacts(
              this.leadThree?.recID
            );
            this.lstAddressThree = await this.getListAddress(
              this.dialog?.formModel?.entityName,
              this.leadThree?.recID
            );
          }
        }
      }
    } else {
      if (type == 'two') {
        this.leadTwo = null;
        this.lstLeadCbxThree = await this.getCbxLead(
          this.leadOne?.recID,
          this.leadTwo?.recID,
          this.leadOne.category
        );
        this.lstContactTwo = [];
      } else {
        this.leadThree = null;
        this.lstContactThree = [];
        this.lstLeadCbxTwo = await this.getCbxLead(
          this.leadOne?.recID,
          this.leadThree?.recID,
          this.leadOne.category
        );
      }
    }

    this.changeDetector.detectChanges();
  }

  changeAvatarNew(type) {
    if (type == 'avata') {
      this.changeAvata = true;
      // if (this.changeAvata) {
      //   this.recIDLead = JSON.parse(JSON.stringify(this.leadNew?.recID));
      //   this.nameLead = JSON.parse(JSON.stringify(this.leadNew?.leadName));
      //   this.modifyOn = JSON.parse(JSON.stringify(this.leadNew?.modifiedOn));
      // }
    } else {
      this.changeAvataContact = true;
      // if (this.changeAvataContact) {
      //   this.recIDAvt = JSON.parse(JSON.stringify(this.leadNew?.contactID));
      //   this.nameContact = JSON.parse(
      //     JSON.stringify(this.leadNew?.contactName)
      //   );
      //   this.modifyOnContact = JSON.parse(
      //     JSON.stringify(this.leadNew?.modifiedOn)
      //   );
      // }
    }

    this.changeDetector.detectChanges();
  }

  valueChange(e) {
    this.leadNew[e.field] = e?.data;
    if (e?.field == 'leadName') {
      this.nameLead = e?.data;
    } else if (e?.field == 'contactName') {
      this.nameContact = e?.data;
    }
  }
  valueDateChange(e) {
    if (e != null) {
      if (this.leadNew.establishDate != e?.data?.fromDate)
        this.leadNew.establishDate = e?.data?.fromDate;
    }
  }

  changlistID(lstContact) {
    var id = '';
    if (lstContact != null) {
      lstContact.forEach((element) => {
        if (id != '') {
          id = id + ';' + element;
        } else {
          id = element;
        }
      });
    }
    return id;
  }

  changeRadio(e, type) {
    switch (type) {
      case 'avata':
        if (e.field === 'avt1' && e.component.checked === true) {
          this.recIDLead = JSON.parse(JSON.stringify(this.leadOne?.recID));
          this.nameLead = JSON.parse(JSON.stringify(this.leadOne?.leadName));
          this.modifyOn = JSON.parse(JSON.stringify(this.leadOne?.modifiedOn));
        } else if (e.field === 'avt2' && e.component.checked === true) {
          this.recIDLead = JSON.parse(JSON.stringify(this.leadTwo?.recID));
          this.nameLead = JSON.parse(JSON.stringify(this.leadTwo?.leadName));
          this.modifyOn = JSON.parse(JSON.stringify(this.leadOne?.modifiedOn));
        } else {
          this.recIDLead = JSON.parse(JSON.stringify(this.leadThree?.recID));
          this.nameLead = JSON.parse(JSON.stringify(this.leadThree?.leadName));
          this.modifyOn = JSON.parse(JSON.stringify(this.leadOne?.modifiedOn));
        }
        this.changeAvata = false;
        this.imageAvatar.objectId = this.recIDLead;
        this.imageAvatar.objectName = this.nameLead;
        this.imageAvatar.imgOn = this.modifyOn;
        this.imageAvatar.loadAvatar();
        this.changeDetector.detectChanges();
        break;
      case 'leadID':
        if (e.field === 'leadID1' && e.component.checked === true) {
          this.leadNew.leadID = this.leadOne?.leadID;
        } else if (e.field === 'leadID2' && e.component.checked === true) {
          this.leadNew.leadID = this.leadTwo?.leadID;
        } else {
          this.leadNew.leadID = this.leadThree?.leadID;
        }
        break;
      case 'leadName':
        if (e.field === 'leadName1' && e.component.checked === true) {
          this.leadNew.leadName = this.leadOne?.leadName;
        } else if (e.field === 'leadName2' && e.component.checked === true) {
          this.leadNew.leadName = this.leadTwo?.leadName;
        } else {
          this.leadNew.leadName = this.leadThree?.leadName;
        }
        break;
      case 'establishDate':
        if (e.field === 'establishDate1' && e.component.checked === true) {
          this.leadNew.establishDate = this.leadOne?.establishDate;
        } else if (
          e.field === 'establishDate2' &&
          e.component.checked === true
        ) {
          this.leadNew.establishDate = this.leadTwo?.establishDate;
        } else {
          this.leadNew.establishDate = this.leadThree?.establishDate;
        }
        break;
      case 'companyPhone':
        if (e.field === 'companyPhone1' && e.component.checked === true) {
          this.leadNew.companyPhone = this.leadOne?.companyPhone;
        } else if (
          e.field === 'companyPhone2' &&
          e.component.checked === true
        ) {
          this.leadNew.companyPhone = this.leadTwo?.companyPhone;
        } else {
          this.leadNew.companyPhone = this.leadThree?.companyPhone;
        }
        break;
      case 'faxNo':
        if (e.field === 'faxNo1' && e.component.checked === true) {
          this.leadNew.faxNo = this.leadOne?.faxNo;
        } else if (e.field === 'faxNo2' && e.component.checked === true) {
          this.leadNew.faxNo = this.leadTwo?.faxNo;
        } else {
          this.leadNew.faxNo = this.leadThree?.faxNo;
        }
        break;
      case 'webPage':
        if (e.field === 'webPage1' && e.component.checked === true) {
          this.leadNew.webPage = this.leadOne?.webPage;
        } else if (e.field === 'webPage2' && e.component.checked === true) {
          this.leadNew.webPage = this.leadTwo?.webPage;
        } else {
          this.leadNew.webPage = this.leadThree?.webPage;
        }
        break;
      case 'industries':
        if (e.field === 'industries1' && e.component.checked === true) {
          this.leadNew.industries = this.leadOne?.industries;
        } else if (e.field === 'industries2' && e.component.checked === true) {
          this.leadNew.industries = this.leadTwo?.industries;
        } else {
          this.leadNew.industries = this.leadThree?.industries;
        }
        break;
      case 'annualRevenue':
        if (e.field === 'annualRevenue1' && e.component.checked === true) {
          this.leadNew.annualRevenue = this.leadOne?.annualRevenue;
        } else if (
          e.field === 'annualRevenue2' &&
          e.component.checked === true
        ) {
          this.leadNew.annualRevenue = this.leadTwo?.annualRevenue;
        } else {
          this.leadNew.annualRevenue = this.leadThree?.annualRevenue;
        }
        break;
      case 'memo':
        if (e.field === 'memo1' && e.component.checked === true) {
          this.leadNew.memo = this.leadOne?.memo;
        } else if (e.field === 'memo2' && e.component.checked === true) {
          this.leadNew.memo = this.leadTwo?.memo;
        } else {
          this.leadNew.memo = this.leadThree?.memo;
        }
        break;
      case 'note':
        if (e.field === 'note1' && e.component.checked === true) {
          this.leadNew.note = this.leadOne?.note;
        } else if (e.field === 'note2' && e.component.checked === true) {
          this.leadNew.note = this.leadTwo?.note;
        } else {
          this.leadNew.note = this.leadThree?.note;
        }
        break;
      case 'headcounts':
        if (e.field === 'headcounts1' && e.component.checked === true) {
          this.leadNew.headcounts = this.leadOne?.headcounts;
        } else if (e.field === 'headcounts2' && e.component.checked === true) {
          this.leadNew.headcounts = this.leadTwo?.headcounts;
        } else {
          this.leadNew.headcounts = this.leadThree?.headcounts;
        }
        break;
      case 'campaignID':
        if (e.field === 'campaignID1' && e.component.checked === true) {
          this.leadNew.campaignID = this.leadOne?.campaignID;
        } else if (e.field === 'campaignID2' && e.component.checked === true) {
          this.leadNew.campaignID = this.leadTwo?.campaignID;
        } else {
          this.leadNew.campaignID = this.leadThree?.campaignID;
        }
        break;
      case 'channelID':
        if (e.field === 'channelID1' && e.component.checked === true) {
          this.leadNew.channelID = this.leadOne?.channelID;
        } else if (e.field === 'channelID2' && e.component.checked === true) {
          this.leadNew.channelID = this.leadTwo?.channelID;
        } else {
          this.leadNew.channelID = this.leadThree?.channelID;
        }
        break;
      case 'salespersonID':
        if (e.field === 'salespersonID1' && e.component.checked === true) {
          this.leadNew.salespersonID = this.leadOne?.salespersonID;
        } else if (
          e.field === 'salespersonID2' &&
          e.component.checked === true
        ) {
          this.leadNew.salespersonID = this.leadTwo?.salespersonID;
        } else {
          this.leadNew.salespersonID = this.leadThree?.salespersonID;
        }
        break;
      case 'owner':
        if (e.field === 'owner1' && e.component.checked === true) {
          this.leadNew.owner = this.leadOne?.owner;
        } else if (e.field === 'owner2' && e.component.checked === true) {
          this.leadNew.owner = this.leadTwo?.owner;
        } else {
          this.leadNew.owner = this.leadThree?.owner;
        }
        break;
      case 'consultantID':
        if (e.field === 'consultantID1' && e.component.checked === true) {
          this.leadNew.consultantID = this.leadOne?.consultantID;
        } else if (
          e.field === 'consultantID2' &&
          e.component.checked === true
        ) {
          this.leadNew.consultantID = this.leadTwo?.consultantID;
        } else {
          this.leadNew.consultantID = this.leadThree?.consultantID;
        }
        break;
      case 'businessLineID':
        if (e.field === 'businessLineID1' && e.component.checked === true) {
          this.leadNew.businessLineID = this.leadOne?.businessLineID;
        } else if (
          e.field === 'businessLineID2' &&
          e.component.checked === true
        ) {
          this.leadNew.businessLineID = this.leadTwo?.businessLineID;
        } else {
          this.leadNew.businessLineID = this.leadThree?.businessLineID;
        }
        break;
      case 'avataContact':
        if (e.field === 'avataContact1' && e.component.checked === true) {
          this.recIDAvt = JSON.parse(JSON.stringify(this.leadOne?.contactID));
          this.nameContact = JSON.parse(
            JSON.stringify(this.leadOne?.contactName)
          );
          this.modifyOnContact = JSON.parse(
            JSON.stringify(this.leadOne?.modifiedOn)
          );
        } else if (
          e.field === 'avataContact2' &&
          e.component.checked === true
        ) {
          this.recIDAvt = JSON.parse(JSON.stringify(this.leadTwo?.contactID));
          this.nameContact = JSON.parse(
            JSON.stringify(this.leadTwo?.contactName)
          );
          this.modifyOnContact = JSON.parse(
            JSON.stringify(this.leadOne?.modifiedOn)
          );
        } else {
          this.recIDAvt = JSON.parse(JSON.stringify(this.leadThree?.contactID));
          this.nameContact = JSON.parse(
            JSON.stringify(this.leadThree?.contactName)
          );
          this.modifyOnContact = JSON.parse(
            JSON.stringify(this.leadOne?.modifiedOn)
          );
        }
        this.changeAvataContact = false;
        this.imageAvatarContact.objectId = this.recIDAvt;
        this.imageAvatarContact.objectName = this.nameContact;
        this.imageAvatarContact.imgOn = this.modifyOnContact;
        this.imageAvatarContact.loadAvatar();
        this.changeDetector.detectChanges();
        break;
      case 'contactName':
        if (e.field === 'contactName1' && e.component.checked === true) {
          this.leadNew.contactName = this.leadOne?.contactName;
        } else if (e.field === 'contactName2' && e.component.checked === true) {
          this.leadNew.contactName = this.leadTwo?.contactName;
        } else {
          this.leadNew.contactName = this.leadThree?.contactName;
        }
        break;
      case 'jobTitle':
        if (e.field === 'jobTitle1' && e.component.checked === true) {
          this.leadNew.jobTitle = this.leadOne?.jobTitle;
        } else if (e.field === 'jobTitle2' && e.component.checked === true) {
          this.leadNew.jobTitle = this.leadTwo?.jobTitle;
        } else {
          this.leadNew.jobTitle = this.leadThree?.jobTitle;
        }
        break;
      case 'phone':
        if (e.field === 'phone1' && e.component.checked === true) {
          this.leadNew.phone = this.leadOne?.phone;
        } else if (e.field === 'phone2' && e.component.checked === true) {
          this.leadNew.phone = this.leadTwo?.phone;
        } else {
          this.leadNew.phone = this.leadThree?.phone;
        }
        break;
      case 'email':
        if (e.field === 'email1' && e.component.checked === true) {
          this.leadNew.email = this.leadOne?.email;
        } else if (e.field === 'email2' && e.component.checked === true) {
          this.leadNew.email = this.leadTwo?.email;
        } else {
          this.leadNew.email = this.leadThree?.email;
        }
        break;
    }
  }

  clickPopupContacts(type, lstContact, data) {
    let obj = {
      list: lstContact,
      type: type,
      lead: data,
      category: 'contact',
    };
    let option = new DialogModel();
    option.zIndex = 1001;
    option.FormModel = this.dialog.formModel;
    let popupContract = this.callFc.openForm(
      PopupRemoveAddContactComponent,
      '',
      700,
      650,
      '',
      obj,
      '',
      option
    );
    popupContract.closed.subscribe((e) => {
      if (e && e.event != null) {
        var lstDeal = [];
        if (e.event.length > 0) {
          lstDeal = e?.event;
          lstDeal.forEach((item) => (item.checked = false));

          if (type == 'add') {
            if (this.lstContactNew != null && this.lstContactNew.length > 0) {
              const filteredContacts = lstDeal.filter(
                (item) =>
                  !this.lstContactNew.some(
                    (contact) => contact.recID === item.recID
                  )
              );

              this.lstContactNew.push(...filteredContacts);
            } else {
              this.lstContactNew = lstDeal;
            }
          } else {
            this.lstContactNew = this.lstContactNew.filter(
              (item1) => !lstDeal.some((item2) => item1.recID === item2.recID)
            );
            if (
              this.contactDefault &&
              !this.lstContactNew.some((x) => x.recID == this.contactDefault)
            ) {
              this.contactDefault = null;
            }
          }
        }
        this.changeDetector.detectChanges();
      }
    });
  }

  clickPopupAddress(type, lstAddress, data) {
    let obj = {
      list: lstAddress,
      type: type,
      lead: data,
      category: 'address',
    };
    let option = new DialogModel();
    option.zIndex = 1001;
    option.FormModel = this.dialog.formModel;
    let popupContract = this.callFc.openForm(
      PopupRemoveAddContactComponent,
      '',
      700,
      650,
      '',
      obj,
      '',
      option
    );
    popupContract.closed.subscribe((e) => {
      if (e && e.event != null) {
        var lstDeal = [];
        if (e.event.length > 0) {
          lstDeal = e?.event;
          lstDeal.forEach((item) => (item.checked = false));

          if (type == 'add') {
            if (this.lstAddressNew != null && this.lstAddressNew.length > 0) {
              const filteredAddress = lstDeal.filter(
                (item) =>
                  !this.lstAddressNew.some(
                    (contact) => contact.recID === item.recID
                  )
              );

              this.lstAddressNew.push(...filteredAddress);
            } else {
              this.lstAddressNew = lstDeal;
            }
          } else {
            this.lstAddressNew = this.lstAddressNew.filter(
              (item1) => !lstDeal.some((item2) => item1.recID === item2.recID)
            );
            if (
              this.addressDefault &&
              !this.lstAddressNew.some((x) => x.recID == this.addressDefault)
            ) {
              this.addressDefault = null;
            }
          }
        }
        this.changeDetector.detectChanges();
      }
    });
  }

  countContactAndAddress(lstNew, lstOld) {
    let count = 0;

    for (const item1 of lstNew) {
      for (const item2 of lstOld) {
        if (item1.recID === item2.recID) {
          count++;
          break; // Nếu tìm thấy đối tượng giống nhau, thoát khỏi vòng lặp trong contact2
        }
      }
    }
    return count;
  }

  cbxContactChange(e, type) {
    if (type == 'contact') {
      if (e != this.contactDefault) {
        this.contactDefault = e;
        var index = this.lstContactNew.findIndex((x) => x.recID == e);
        if (index != -1) {
          this.lstContactNew[index].isDefault = true;
        }
      }
    } else {
      if (e != this.addressDefault) {
        this.addressDefault = e;
        var index = this.lstAddressNew.findIndex((x) => x.recID == e);
        if (index != -1) {
          this.lstAddressNew[index].isDefault = true;
        }
      }
    }
  }

  addAvatar() {
    this.imageAvatar.referType = 'avt';
  }

  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatarNew = e?.data[countListFile - 1].avatar;

      this.changeDetector.detectChanges();
    }
  }
  async getAvatar(data) {
    let avatar = [
      '',
      this.dialog?.formModel?.funcID,
      data.recID,
      this.dialog?.formModel?.entityName,
      'inline',
      1000,
      data.leadName,
      'avt',
      false,
    ];
    var linkAvt = '';
    var avata = await firstValueFrom(this.cmSv.getAvatar(avatar));
    if (avata && avata?.url) {
      linkAvt = environment.urlUpload + '/' + avata?.url;
    } else {
      linkAvt = null;
    }

    this.changeDetector.detectChanges();
    return linkAvt;
  }
}
