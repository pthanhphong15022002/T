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
  CodxService,
} from 'codx-core';
import { PopupQuickaddContactComponent } from './codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { CM_Contacts } from '../../models/cm_model';
import { PopupListContactsComponent } from './codx-list-contacts/popup-list-contacts/popup-list-contacts.component';
import * as XLSX from 'xlsx';
import { firstValueFrom } from 'rxjs';
import { CodxListContactsComponent } from './codx-list-contacts/codx-list-contacts.component';
import { CodxAddressCmComponent } from './codx-address-cm/codx-address-cm.component';

@Component({
  selector: 'codx-cmcustomer-detail',
  templateUrl: './cmcustomer-detail.component.html',
  styleUrls: ['./cmcustomer-detail.component.scss'],
})
export class CmCustomerDetailComponent implements OnInit {
  @ViewChild('contract') contract: TemplateRef<any>;
  @ViewChild('codxListContact') codxListContact: CodxListContactsComponent;
  @ViewChild('codxAddress') codxAddress: CodxAddressCmComponent;

  @Input() recID: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0101';
  @Input() entityName = '';
  @Input() gridViewSetup: any;
  @Input() checkType: string = '1';
  @Input() lstCustGroups = [];
  @Input() isAdmin: boolean = false;
  @Input() isDbClick: boolean = false;
  @Input() asideMode: string;

  @Input() tabDefaut = "";
  @Input() valueListTab;
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
  user: any;
  isShow = false;
  idTabShow = "";
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private codxService: CodxService
  ) {
    this.user = this.authstore.get();
  }

  async ngOnInit() {
    // this.getGridviewSetup();
    // this.getVllByGridViewSetupContact();
    // this.checkAdmin();
    if (this.checkType == '1')
      this.checkType =
        this.dataSelected?.category == '2' ? '5' : this.checkType;
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
        this.setTaskBar();
      }
    }
  }

  ngAfterViewInit(): void { }

  getOneCustomerDetail(dataSelected) {
    this.loaded = false;
    this.dataSelected = JSON.parse(JSON.stringify(dataSelected));
    // this.getListContactByObjectID(this.dataSelected?.recID);
    this.addressNameCM = this.dataSelected?.address ?? '';
    this.loadTag(this.dataSelected);
    // this.listTab(this.funcID);
    this.loaded = true;
    this.changeDetectorRef.detectChanges();
  }

  loadTag(data) {
    this.viewTag = '';
    setTimeout(() => {
      this.viewTag = data?.tags;
      this.isAdmin = JSON.parse(JSON.stringify(this.isAdmin));
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
      this.checkType == '1' ||
      this.checkType == '2' ||
      this.checkType == '5'
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
          name: 'AssignTo',
          textDefault: 'Giao việc',
          isActive: false,
          template: null,
          icon: 'icon-i-clipboard-check',
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

  addressDefault(e) {
    this.addressNameCM = e ? e?.address : null;
    this.dataSelected.address = e ? e?.address : null;
    this.dataSelected.provinceID = e ? e?.provinceID : null;
    this.dataSelected.districtID = e ? e?.districtID : null;
    this.dataSelected.wardID = e ? e?.wardID : null;
    this.addressNameCMEmit.emit(e);
    this.changeDetectorRef.detectChanges();
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
            let lstDealIDs = [];
            lstDealIDs = lstContact.map((x) => x.objectID);
            if (lstDealIDs != null && lstDealIDs.length > 0) {
              this.api
                .execSv<any>(
                  'CM',
                  'ERM.Business.CM',
                  'DealsBusiness',
                  'GetListIDInstancesByListDealIDAsync',
                  [lstDealIDs]
                )
                .subscribe((ele) => {
                  var lstInsID = ele ?? [];
                  var json = JSON.stringify(lstContact);
                  this.cmSv
                    .updateFieldContacts(
                      lstInsID,
                      $event?.action == 'edit' ? json : '',
                      $event?.action == 'delete' ? json : ''
                    )
                    .subscribe((res) => { });
                });
            }
          }
        });
      }
    }
  }

  onChangeContact(lstContact) {
    if (this.codxListContact) {
      this.codxListContact.loadListContact(lstContact);
      this.changeDetectorRef.detectChanges();
    }
  }

  onChangeAddress(lstAddress) {
    if (this.codxAddress) {
      this.codxAddress.loadListAdress(lstAddress);
      this.changeDetectorRef.detectChanges();
    }
  }

  listTab(checkType) {
    if (checkType == '1' || checkType == '5') {
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
    } else if (checkType == '2') {
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
    } else if (checkType == '3') {
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
    if (this.checkType == '1' || this.checkType == '5') {
      return data.customerName;
    } else if (this.checkType == '2') {
      return data.contactName;
    } else if (this.checkType == '3') {
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
          tmpAd['address'] = tmpCus['address'];
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
        .subscribe((res) => { });
    };
  }

  setTaskBar() {
    if (this.isAdmin || this.dataSelected?.owner == this.user?.userID) {
      this.idTabShow = this.tabDefaut;
    } else {
      this.idTabShow = this.dataSelected?.config;
    }
  }
}
