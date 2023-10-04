import { firstValueFrom } from 'rxjs';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CodxDropdownSelectComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxCmService } from 'projects/codx-cm/src/projects';

@Component({
  selector: 'lib-popup-add-campaign-contact',
  templateUrl: './popup-add-campaign-contact.component.html',
  styleUrls: ['./popup-add-campaign-contact.component.scss'],
})
export class PopupAddCampaignContactComponent implements OnInit {
  @ViewChild('cbxProvince') cbxProvince: CodxDropdownSelectComponent;
  @ViewChild('cbxDistrict') cbxDistrict: CodxDropdownSelectComponent;
  @ViewChild('cbxIndustries') cbxIndustries: CodxDropdownSelectComponent;
  @ViewChild('cbxStatus') cbxStatus: CodxDropdownSelectComponent;

  dialog: any;
  data: any;
  transID: any;
  lstCampainsAdd = []; //Add new
  lstCampainsHadAdd = []; //Lst đã có.
  objectType = '';
  titleAction = '';
  provinceIDs = [];
  districtIDs = [];
  industries = [];
  status = [];
  isProvince: boolean = false;
  isDistrict: boolean = false;
  isIndustries: boolean = false;
  isStatus: boolean = false;
  countLeadCus = 0; //Số lượng được tìm thấy
  countHadLeadCus = 0; // Số lượng đã có trong chiến dịch
  countAdd = 0; //Số lượng sẽ được thêm

  countChange = 0; //Để check lần change
  gridViewSetup: any;
  title = '';

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Tiêu chí thêm',
      name: 'Description',
    },
    {
      icon: 'icon-rule',
      text: 'Danh sách khách hàng tiềm năng',
      name: 'ListCustomers',
    },
  ];
  constructor(
    private detector: ChangeDetectorRef,
    private api: ApiHttpService,
    private cmSv: CodxCmService,
    private notiSv: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.titleAction = dt?.data?.title;
    this.transID = dt?.data?.transID;
    this.objectType = dt?.data?.objectType;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }
  ngOnInit(): void {
    if (this.lstCampainsHadAdd == null || this.lstCampainsHadAdd.length == 0) {
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CampaignsBusiness',
          'GetCampaignContactsByTransIDAsync',
          [this.transID, this.objectType]
        )
        .subscribe((res) => {
          if (res) {
            this.lstCampainsHadAdd = res[0] ?? [];
            // this.countHadLeadCus = res[1];
          }
        });
    }
  }

  setTitle() {
    this.title = this.titleAction;
    this.detector.detectChanges();
  }

  //#region save
  async onSave() {
    if (this.lstCampainsAdd != null && this.lstCampainsAdd.length > 0) {
      let lstSaves = await this.convertToCampContacts(this.lstCampainsAdd);
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CampaignsBusiness',
          'AddCampaignContactsAsync',
          [lstSaves]
        )
        .subscribe((res) => {
          if (res) {
            this.dialog.close(res);
            this.notiSv.notifyCode('SYS006');
          }
        });
    } else {
      this.notiSv.notifyCode('Hiện tại không có dữ liệu cần thêm');
      return;
    }
  }

  async convertToCampContacts(list = []) {
    var lstConverts = [];
    var lstContactsCus = [];
    if (this.objectType == '1') {
      var ids = list.map((x) => x.recID);
      lstContactsCus =
        (await firstValueFrom(
          this.api.execSv<any>(
            'CM',
            'ERM.Business.CM',
            'ContactsBusiness',
            'GetDefaultContactByObjectIDAsync',
            [ids]
          )
        )) ?? [];
    }
    for (var item of list) {
      var tmp = {};
      tmp['recID'] = Util.uid();
      tmp['transID'] = this.transID;
      tmp['objectType'] = this.objectType;
      tmp['objectID'] = item?.recID;
      tmp['objectName'] =
        this.objectType == '1' ? item?.customerName : item?.leadName;
      tmp['address'] = item?.address;
      tmp['sendMail'] = 0;
      tmp['sendSMS'] = 0;
      tmp['called'] = 0;
      tmp['owner'] = item?.owner;
      tmp['industries'] = item?.industries;
      tmp['provinceID'] = item?.provinceID;
      tmp['districtID'] = item?.districtID;
      if (this.objectType == '3') {
        tmp['leadStatus'] = item?.status;
        tmp['contactName'] = item?.contactName;
        tmp['jobTitle'] = item?.jobTitle;
        tmp['phone'] = item?.phone;
        tmp['email'] = item?.email;
      } else {
        tmp['customerStatus'] = item?.status;
        if (lstContactsCus != null && lstContactsCus.length > 0) {
          var contactTmp = lstContactsCus.find(
            (x) => x.objectID == item?.recID
          );
          if (contactTmp != null) {
            tmp['contactName'] = contactTmp?.contactName;
            tmp['jobTitle'] = contactTmp?.jobTitle;
            tmp['phone'] = contactTmp?.mobile;
            tmp['email'] = contactTmp?.personalEmail;
          }
        }
      }
      lstConverts.push(tmp);
    }
    return lstConverts;
  }

  //#endregion

  //#region change

  valueChange(e) {
    if (e) {
      this[e?.field] = e?.data;
      this.setBinding(e?.field);
    }

    this.detector.detectChanges();
  }

  valueChangeClick(isChecked, field) {
    this[field] = !isChecked;
    this.setBinding(field);
    this.detector.detectChanges();
  }

  setBinding(field) {
    switch (field) {
      case 'isProvince':
        if (!this.isProvince) {
          if (this.cbxProvince) {
            this.cbxProvince.value = [];
            this.cbxProvince.selectedItems = [];
            this.cbxProvince.setValue('');
          }
          this.provinceIDs = [];
          this.bindingCountCompaign();
        }
        break;
      case 'isDistrict':
        if (!this.isDistrict) {
          this.districtIDs = [];
          this.bindingCountCompaign();
        }
        break;
      case 'isIndustries':
        if (!this.isIndustries) {
          this.industries = [];
          this.bindingCountCompaign();
        }
        break;
      case 'isStatus':
        if (!this.isStatus) {
          this.status = [];
          this.bindingCountCompaign();
        }
        break;
      default:
        this.bindingCountCompaign();
        break;
      // case 'districtIDs':
      //   break;
      // case 'industries':
      //   break;
      // case 'status':
      //   break;
    }
  }

  bindingCountCompaign() {
    this.api
      .execSv<any>(
        'CM',
        'ERM.Business.CM',
        'LeadsBusiness',
        'GetLeadOrCustomersAsync',
        [
          this.objectType,
          this.provinceIDs,
          this.districtIDs,
          this.industries,
          this.status,
        ]
      )
      .subscribe((res) => {
        let lstAllSearchs = [];
        if (res) {
          lstAllSearchs = res[0];
          this.countLeadCus = res[1];
        } else {
          lstAllSearchs = [];
          this.countLeadCus = 0;
        }
        this.lstCampainsAdd = this.setListCampaignContacts(
          lstAllSearchs,
          this.lstCampainsHadAdd
        );
        this.countHadLeadCus = this.countHadLists(
          lstAllSearchs,
          this.lstCampainsHadAdd
        );
        this.countAdd =
          this.lstCampainsAdd != null ? this.lstCampainsAdd.length : 0;
      });
  }

  setListCampaignContacts(list1 = [], list2 = []) {
    const mergedList = [];

    for (const item of list1) {
      const isDuplicate = list2.some(
        (mergedItem) => mergedItem.objectID === item.recID
      );

      if (!isDuplicate) {
        mergedList.push(item);
      }
    }

    return mergedList;
  }

  countHadLists(list1 = [], list2 = []) {
    const mergedList = [];
    let count = 0;
    for (const item of list1) {
      const isDuplicate = list2.some(
        (mergedItem) => mergedItem.objectID === item.recID
      );

      if (isDuplicate) {
        mergedList.push(item);
      }
    }
    count = mergedList.length;
    return count;
  }
  //#endregion
}
