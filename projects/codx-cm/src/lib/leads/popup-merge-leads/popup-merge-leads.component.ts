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
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-merge-leads',
  templateUrl: './popup-merge-leads.component.html',
  styleUrls: ['./popup-merge-leads.component.css'],
})
export class PopupMergeLeadsComponent implements OnInit {
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;

  dialog: any;
  leadNew: CM_Leads = new CM_Leads();
  leadOne: CM_Leads = new CM_Leads();
  leadTwo: CM_Leads = new CM_Leads();
  leadThree: CM_Leads = new CM_Leads();

  title = '';
  gridViewSetup: any;
  checkAvata = true;
  lstContactNew = [];
  lstContactOne = [];
  lstContactTwo = [];
  lstContactThree = [];

  fieldContacts = { text: 'contactName', value: 'recID' };
  contactDefault: any;
  popoverCrr: any;
  contactDefaultOne = '';
  linkAvatarNew: any;
  linkAvatarOne: any;
  linkAvatarTwo: any;
  linkAvatarThree: any;
  changeAvata: boolean = false;
  recIDLead: any;
  nameLead: any;
  lstLeadCbxOne = [];
  lstLeadCbxTwo = [];
  lstLeadCbxThree = [];
  fieldCbx = { text: 'leadName', value: 'recID' };
  modifyOn: Date;
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
    this.leadOne = JSON.parse(JSON.stringify(dt?.data?.data));
    this.recIDLead = this.leadOne?.recID;
    this.nameLead = this.leadOne?.leadName;
    this.modifyOn = this.leadOne?.modifiedOn;
  }
  async ngOnInit() {
    this.changeAvata = false;
    this.lstLeadCbxOne = await this.getCbxLead(Util.uid());

    this.leadNew = JSON.parse(JSON.stringify(this.leadOne));
    this.leadNew.recID = Util.uid();
  }

  async ngAfterViewInit() {
    this.cache.gridViewSetup('CMLeads', 'grvCMLeads').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (this.leadOne) {
      this.lstContactOne = await this.getContacts(this.leadOne?.recID);
      this.lstLeadCbxTwo = await this.getCbxLead(this.leadOne?.recID);
      this.lstLeadCbxThree = await this.getCbxLead(this.leadTwo?.recID);
    }

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

  async getCbxLead(id) {
    var options = new DataRequest();
    options.entityName = 'CM_Leads';
    options.predicates = 'Status!=@0';
    options.dataValues = '5';
    options.pageLoading = false;
    var lst = await firstValueFrom(this.cmSv.loadDataAsync('CM', options));
    return lst;
  }

  async cbxLeadChange(e, type) {
    if (e) {
      if (type == 'two') {
        if (e == this.leadOne?.recID || e == this.leadThree?.recID) {
          this.noti.notify('Tiềm năng được chọn vui lòng chọn tiềm năng khác');
          this.leadTwo = null;
          return;
        } else {
          var index = this.lstLeadCbxTwo.findIndex((x) => x.recID == e);
          if (index != -1) {
            this.leadTwo = this.lstLeadCbxTwo[index];
            this.lstContactTwo = await this.getContacts(this.leadTwo?.recID);
          }
        }
      } else {
        if (e == this.leadTwo?.recID || e == this.leadOne?.recID) {
          this.noti.notify(
            'Tiềm năng được chọn vui lòng chọn tiềm năng khác'
          );
          this.leadThree = null;
          return;
        } else {
          var index = this.lstLeadCbxThree.findIndex((x) => x.recID == e);
          if (index != -1) {
            this.leadThree = this.lstLeadCbxThree[index];
            this.lstContactThree = await this.getContacts(
              this.leadThree?.recID
            );
          }
        }
      }
    } else {
      if (type == 'two') {
        this.leadTwo = null;
        this.lstContactTwo = [];
      } else {
        this.leadThree = null;
        this.lstContactThree = [];
      }
      if(!this.changeAvata){

      }
    }

    this.changeDetector.detectChanges();
  }

  onMerge() {}

  onSupport() {}

  changeAvatarNew() {
    this.changeAvata = true;
    // if (this.changeAvata) {
    //   this.recIDLead = JSON.parse(JSON.stringify(this.leadNew?.recID));
    //   this.nameLead = JSON.parse(JSON.stringify(this.leadNew?.leadName));
    //   this.modifyOn = JSON.parse(JSON.stringify(this.leadNew?.modifiedOn));
    // }
    this.changeDetector.detectChanges();
  }

  valueChange(e) {}
  valueDateChange(e) {
    if (e != null) {
      this.leadNew.establishDate = e?.data?.fromDate;
    }
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
      case 'phone':
        if (e.field === 'phone1' && e.component.checked === true) {
          this.leadNew.phone = this.leadOne?.phone;
        } else if (e.field === 'phone2' && e.component.checked === true) {
          this.leadNew.phone = this.leadTwo?.phone;
        } else {
          this.leadNew.phone = this.leadThree?.phone;
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
      case 'customerResource':
        if (e.field === 'customerResource1' && e.component.checked === true) {
          this.leadNew.customerResource = this.leadOne?.customerResource;
        } else if (
          e.field === 'customerResource2' &&
          e.component.checked === true
        ) {
          this.leadNew.customerResource = this.leadTwo?.customerResource;
        } else {
          this.leadNew.customerResource = this.leadThree?.customerResource;
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
    }
  }

  clickPopupContacts(type, lstContact, data) {
    let obj = {
      lstContact,
      type: type,
      lead: data,
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

  countContact(lstContactNew, lstContactOld) {
    let count = 0;

    for (const item1 of lstContactNew) {
      for (const item2 of lstContactOld) {
        if (item1.recID === item2.recID) {
          count++;
          break; // Nếu tìm thấy đối tượng giống nhau, thoát khỏi vòng lặp trong contact2
        }
      }
    }
    return count;
  }

  cbxContactChange(e) {
    if (e != this.contactDefault) {
      this.contactDefault = e;
      var index = this.lstContactNew.findIndex((x) => x.recID == e);
      if (index != -1) {
        this.lstContactNew[index].isDefault = true;
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
