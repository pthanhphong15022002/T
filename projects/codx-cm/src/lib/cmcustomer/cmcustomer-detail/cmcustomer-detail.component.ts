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
} from 'codx-core';
import { PopupQuickaddContactComponent } from './codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { CM_Contacts } from '../../models/cm_model';
import { PopupListContactsComponent } from './codx-list-contacts/popup-list-contacts/popup-list-contacts.component';

@Component({
  selector: 'codx-cmcustomer-detail',
  templateUrl: './cmcustomer-detail.component.html',
  styleUrls: ['./cmcustomer-detail.component.scss'],
})
export class CmcustomerDetailComponent implements OnInit {
  @ViewChild('contract') contract: TemplateRef<any>;
  @Input() recID: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0101';
  @Input() entityName = '';
  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() addressNameCMEmit = new EventEmitter<any>();

  moreFuncAdd = '';
  moreFuncEdit = '';
  vllContactType = '';
  listContacts = [];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      template: null,
    },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    {
      name: 'Approve',
      textDefault: 'Ký duyệt',
      isActive: false,
      template: null,
    },
    {
      name: 'References',
      textDefault: 'Liên kết',
      isActive: false,
      template: null,
    },
    // {
    //   name: 'Quotations',
    //   textDefault: 'Báo giá',
    //   icon: 'icon-monetization_on',
    //   isActive: false,
    // },
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
  ];
  treeTask = [];
  @Input() dataSelected: any;
  name = 'Information';
  id = '';
  tabDetail = [];
  formModelContact: FormModel;
  formModelAddress: FormModel;
  gridViewSetup: any;
  listAddress = [];
  contactPerson = new CM_Contacts();
  viewTag = '';
  nameCbxCM = '';
  loaded: boolean;
  addressNameCM: any;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {}

  async ngOnInit() {
    // this.getGridviewSetup();
    // this.getVllByGridViewSetupContact();
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
        this.getOneCustomerDetail();
      }
    }
  }

  ngAfterViewInit(): void {}

  getOneCustomerDetail() {
    this.viewTag = '';
    this.loaded = false;
    this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
    // this.getListContactByObjectID(this.dataSelected?.recID);
    this.getAdressNameByIsDefault(this.dataSelected?.recID, this.entityName);
    this.listTab(this.funcID);
    this.loaded = true;
  }

  getAdressNameByIsDefault(objectID, entityName) {
    this.cmSv
      .getAdressNameByIsDefault(objectID, entityName)
      .subscribe((res) => {
        if (res) {
          this.addressNameCM = res?.adressName;
        }else{
          this.addressNameCM = null;
        }
        this.viewTag = this.dataSelected?.tags;
      });
  }

  getGridviewSetup() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  getVllByGridViewSetupContact() {
    this.cache.gridViewSetup('CMContacts', 'grvCMContacts').subscribe((res) => {
      if (res) {
        this.vllContactType = res?.ContactType?.referedValue;
      }
    });
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

  listTab(funcID) {
    if (funcID == 'CM0101') {
      this.tabDetail = [
        {
          name: 'Information',
          textDefault: 'Thông tin chung',
          icon: 'icon-info',
          isActive: true,
        },
        {
          name: 'Contact',
          textDefault: 'Liên hệ',
          icon: 'icon-contact_phone',
          isActive: false,
        },
        {
          name: 'Address',
          textDefault: 'Địa chỉ',
          icon: 'icon-location_on',
          isActive: false,
        },
        {
          name: 'Deal',
          textDefault: 'Cơ hội',
          icon: 'icon-add_shopping_cart',
          isActive: false,
        },
        {
          name: 'Quotations',
          textDefault: 'Báo giá',
          icon: 'icon-monetization_on',
          isActive: false,
        },
        {
          name: 'Contract',
          textDefault: 'Hợp đồng',
          icon: 'icon-shopping_bag',
          isActive: false,
        },
      ];
    } else if (funcID == 'CM0102') {
      this.tabDetail = [
        {
          name: 'Information',
          textDefault: 'Thông tin chung',
          icon: 'icon-info',
          isActive: true,
        },
        {
          name: 'Address',
          textDefault: 'Địa chỉ',
          icon: 'icon-location_on',
          isActive: false,
        },
      ];
    } else if (funcID == 'CM0103') {
      this.tabDetail = [
        {
          name: 'Information',
          textDefault: 'Thông tin chung',
          icon: 'icon-info',
          isActive: true,
        },
        {
          name: 'Contact',
          textDefault: 'Liên hệ',
          icon: 'icon-contact_phone',
          isActive: false,
        },
        {
          name: 'Address',
          textDefault: 'Địa chỉ',
          icon: 'icon-location_on',
          isActive: false,
        },
      ];
    } else {
      this.tabDetail = [
        {
          name: 'Information',
          textDefault: 'Thông tin chung',
          icon: 'icon-info',
          isActive: true,
        },
        {
          name: 'Address',
          textDefault: 'Địa chỉ',
          icon: 'icon-location_on',
          isActive: false,
        },
        {
          name: 'DealCompetitors',
          textDefault: 'Cơ hội liên quan',
          icon: 'icon-shopping_cart',
          isActive: false,
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
    if (this.funcID == 'CM0101') {
      return data.customerName;
    } else if (this.funcID == 'CM0102') {
      return data.contactName;
    } else if (this.funcID == 'CM0103') {
      return data.partnerName;
    } else {
      return data.competitorName;
    }
  }
}
