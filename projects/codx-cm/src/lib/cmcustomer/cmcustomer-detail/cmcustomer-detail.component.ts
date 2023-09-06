import { CodxCmService } from '../../codx-cm.service';
import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  SimpleChanges,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CallFuncService,
  CRUDService,
  DialogModel,
  FormModel,
  CacheService,
  AlertConfirmInputConfig,
  NotificationsService,
  Util,
  ApiHttpService,
  AuthStore,
} from 'codx-core';
import { PopupQuickaddContactComponent } from './codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { CM_Contacts } from '../../models/cm_model';
import { PopupListContactsComponent } from './codx-list-contacts/popup-list-contacts/popup-list-contacts.component';
import * as XLSX from 'xlsx';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'codx-cmcustomer-detail',
  templateUrl: './cmcustomer-detail.component.html',
  styleUrls: ['./cmcustomer-detail.component.scss'],
})
export class CmCustomerDetailComponent implements OnInit {
  @ViewChild('contract') contract: TemplateRef<any>;
  @Input() recID: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0101';
  @Input() entityName = '';
  @Input() gridViewSetup: any;
  @Input() lstCustGroups = [];
  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() addressNameCMEmit = new EventEmitter<any>();

  moreFuncAdd = '';
  moreFuncEdit = '';
  vllContactType = '';
  listContacts = [];
  tabControl = [];
  treeTask = [];
  @Input() dataSelected: any;
  name = 'Information';
  id = '';
  tabDetail: { name: string; text: string; icon: string }[] = [];
  formModelContact: FormModel;
  formModelAddress: FormModel;
  listAddress = [];
  contactPerson = new CM_Contacts();
  viewTag = '';
  nameCbxCM = '';
  loaded: boolean;
  addressNameCM: any;
  category = '';
  isAdmin = false;
  user: any;
  isShow = false;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {
    this.user = this.authstore.get();
  }

  async ngOnInit() {
    // this.getGridviewSetup();
    // this.getVllByGridViewSetupContact();
    this.checkAdmin();
    this.getFormModelAddress();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.id = changes['dataSelected'].currentValue?.recID;
        this.getOneCustomerDetail(this.dataSelected);
        this.getTab();
      }
    }
  }

  ngAfterViewInit(): void {}

  getOneCustomerDetail(dataSelected) {
    this.loaded = false;
    this.dataSelected = JSON.parse(JSON.stringify(dataSelected));
    // this.getListContactByObjectID(this.dataSelected?.recID);
    this.addressNameCM = this.dataSelected?.address;
    this.loadTag(this.dataSelected);
    // this.listTab(this.funcID);
    this.loaded = true;
    this.changeDetectorRef.detectChanges();
  }

  loadTag(data) {
    this.viewTag = '';
    setTimeout(() => {
      this.viewTag = data?.tags;
    }, 100);
  }

  async checkAdmin() {
    let data = await firstValueFrom(this.cmSv.getAdminRolesByModule());
    let isAdmin = false;
    if (data) {
      let lstId = data.split(';');
      isAdmin = lstId.some((x) => lstId.includes(this.user.userID));
    }
    this.isAdmin = isAdmin || this.user.administrator;
  }

  getTab() {
    if (
      this.funcID == 'CM0101' ||
      this.funcID == 'CM0102' ||
      this.funcID == 'CM0105'
    ) {
      this.tabControl = [
        {
          name: 'History',
          textDefault: 'Lịch sử',
          isActive: true,
          template: null,
          icon: 'icon-i-clock-history',
        },
        {
          name: 'Comment',
          textDefault: 'Thảo luận',
          isActive: false,
          template: null,
          icon: 'icon-i-chat-right',
        },
        {
          name: 'Attachment',
          textDefault: 'Đính kèm',
          isActive: false,
          template: null,
          icon: 'icon-i-paperclip',
        },
        {
          name: 'Task',
          textDefault: 'Công việc',
          isActive: false,
          template: null,
          icon: 'icon-i-clipboard-check',
        },
        {
          name: 'References',
          textDefault: 'Liên kết',
          isActive: false,
          template: null,
          icon: 'icon-i-link',
        },
      ];
    } else {
      this.tabControl = [
        {
          name: 'History',
          textDefault: 'Lịch sử',
          isActive: true,
          template: null,
          icon: 'icon-i-clock-history',
        },
        {
          name: 'Comment',
          textDefault: 'Thảo luận',
          isActive: false,
          template: null,
          icon: 'icon-i-chat-right',
        },
        {
          name: 'Attachment',
          textDefault: 'Đính kèm',
          isActive: false,
          template: null,
          icon: 'icon-i-paperclip',
        },
      ];
    }
  }

  getAdressNameByIsDefault(objectID, entityName) {
    if (this.funcID == 'CM0101' || this.funcID == 'CM0102') {
      this.cmSv
        .getAdressNameByIsDefault(objectID, entityName)
        .subscribe((res) => {
          if (res) {
            this.addressNameCM = res?.adressName;
          } else {
            this.addressNameCM = null;
          }
        });
    } else {
      this.addressNameCM = this.dataSelected?.address;
    }
  }

  getListAddress(entityName, recID) {
    this.cmSv.getListAddress(entityName, recID).subscribe((res) => {
      this.listAddress = res;
    });
  }

  addressName(e) {
    this.addressNameCM = e;
    this.addressNameCMEmit.emit(this.addressNameCM);
  }

  getNameCbx(recID, objectID) {
    this.cmSv.getNameCbx(recID, objectID).subscribe((res) => {
      this.nameCbxCM = res;
    });
  }

  contactChange($event) {
    if ($event) {
      if ($event?.data && $event?.action != 'add') {
        this.cmSv.getContactDeal($event?.data?.recID).subscribe((res) => {
          if (res && res.length > 0) {
            let lstContact = res;
            let lstInsID = [];
            lstInsID = lstContact.map(x => x.objectID);
            var json = JSON.stringify(lstContact);
            this.cmSv
              .updateFieldContacts(
                lstInsID,
                $event?.action == 'edit' ? json : '',
                $event?.action == 'delete' ? json : ''
              )
              .subscribe((res) => {});
          }
        });
      }
    }
  }

  listTab(funcID) {
    if (funcID == 'CM0101' || funcID == 'CM0105') {
      if (this.dataSelected?.category == '1') {
        this.tabDetail = [
          {
            name: 'Information',
            text: 'Thông tin chung',
            icon: 'icon-info',
          },
          {
            name: 'Contact',
            text: 'Liên hệ',
            icon: 'icon-contact_phone',
          },
          {
            name: 'Address',
            text: 'Địa chỉ',
            icon: 'icon-location_on',
          },
          {
            name: 'Deal',
            text: 'Cơ hội',
            icon: 'icon-add_shopping_cart',
          },
          {
            name: 'Quotations',
            text: 'Báo giá',
            icon: 'icon-monetization_on',
          },
          {
            name: 'Contract',
            text: 'Hợp đồng',
            icon: 'icon-shopping_bag',
          },
          {
            name: 'Task',
            text: 'Công việc',
            icon: 'icon-more',
          },
        ];
      } else if (this.dataSelected?.category == '2') {
        this.tabDetail = [
          {
            name: 'Information',
            text: 'Thông tin chung',
            icon: 'icon-info',
          },

          {
            name: 'Deal',
            text: 'Cơ hội',
            icon: 'icon-add_shopping_cart',
          },
          {
            name: 'Quotations',
            text: 'Báo giá',
            icon: 'icon-monetization_on',
          },
          {
            name: 'Contract',
            text: 'Hợp đồng',
            icon: 'icon-shopping_bag',
          },
        ];
      }
    } else if (funcID == 'CM0102') {
      this.tabDetail = [
        {
          name: 'Information',
          text: 'Thông tin chung',
          icon: 'icon-info',
        },
        {
          name: 'Address',
          text: 'Địa chỉ',
          icon: 'icon-location_on',
        },
      ];
    } else if (funcID == 'CM0103') {
      this.tabDetail = [
        {
          name: 'Information',
          text: 'Thông tin chung',
          icon: 'icon-info',
        },
        {
          name: 'Contact',
          text: 'Liên hệ',
          icon: 'icon-contact_phone',
        },
      ];
    } else {
      this.tabDetail = [
        {
          name: 'Information',
          text: 'Thông tin chung',
          icon: 'icon-info',
        },
        {
          name: 'DealCompetitors',
          text: 'Cơ hội liên quan',
          icon: 'icon-shopping_cart',
        },
      ];
    }
  }
  getFormModelAddress() {
    let dataModel = new FormModel();
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    this.formModelAddress = dataModel;
  }
  getFunctionlist(funcID) {
    this.cache.functionList(funcID).subscribe((fun) => {
      var formMD = new FormModel();
      formMD.entityName = fun.entityName;
      formMD.formName = fun.formName;
      formMD.gridViewName = fun.gridViewName;
      this.formModel = formMD;
    });
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }

  getNameCrm(data) {
    if (this.funcID == 'CM0101' || this.funcID == 'CM0105') {
      return data.customerName;
    } else if (this.funcID == 'CM0102') {
      return data.contactName;
    } else if (this.funcID == 'CM0103') {
      return data.partnerName;
    } else {
      return data.competitorName;
    }
  }

  clickShowTab(isShow) {
    this.isShow = isShow;
    this.changeDetectorRef.detectChanges();
  }

  ReadExcel(e) {
    let file = e?.target?.files[0];
    let fileRead = new FileReader();
    let datas = [];
    fileRead.readAsBinaryString(file);

    fileRead.onload = (e) => {
      var ex = XLSX.read(fileRead.result, { type: 'binary' });
      var sheetName = ex.SheetNames;

      let files = XLSX.utils.sheet_to_json(ex.Sheets[sheetName[0]]);
      datas = files;
      var lstCustomers = [];
      var lstContacts = [];
      var lstAddress = [];
      for (var item of datas) {
        var tmpCus = {};
        var tmpContact = {};
        var tmpAd = {};
        tmpCus['recID'] = Util.uid();
        tmpCus['customerID'] = item['Mã']?.trim();
        tmpCus['customerName'] = item['Tên khách hàng']?.trim();
        tmpCus['shortName'] = item['Tên viết tắt']?.trim();
        tmpCus['address'] = item['Địa chỉ']?.trim();
        tmpCus['webPage'] = item['Website']?.trim();
        tmpCus['Owner'] = item['Nhân viên bán hàng'];
        if (tmpCus['address'] != null && tmpCus['address']?.trim() != '') {
          tmpAd['recID'] = Util.uid();
          tmpAd['adressType'] = '6';
          tmpAd['adressName'] = tmpCus['address'];
          tmpAd['isDefault'] = true;
          tmpAd['objectID'] = tmpCus['recID'];
        }

        if (item['Tên'] != null && item['Tên']?.trim() != '') {
          tmpContact['lastName'] = item['Họ & đệm']?.trim();
          tmpContact['firstName'] = item['Tên']?.trim();
          tmpContact['contactName'] =
            tmpContact['lastName'] + ' ' + tmpContact['firstName'];
          tmpContact['objectID'] = tmpCus['recID'];
          tmpContact['objectName'] = tmpCus['customerName'];
          tmpContact['isDefault'] = true;
          tmpContact['objectType'] = '1';
          tmpContact['mobile'] = item['Điện thoại'];
          tmpContact['personalEmail'] = item['Email'];
        }

        lstCustomers.push(Object.assign({}, tmpCus));
        lstContacts.push(Object.assign({}, tmpContact));
        lstAddress.push(Object.assign({}, tmpAd));
      }
      console.log(lstCustomers);
      console.log(lstContacts);
      this.api
        .execSv<any>(
          'CM',
          'ERM.Business.CM',
          'CustomersBusiness',
          'ImportExcelAsync',
          [lstCustomers, lstContacts, lstAddress]
        )
        .subscribe((res) => {});
    };
  }
}
