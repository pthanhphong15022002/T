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
    if(this.funcID == 'CM0101' || this.funcID == 'CM0102'){
      this.tabControl = [
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
          name: 'References',
          textDefault: 'Liên kết',
          isActive: false,
          template: null,
        }
      ];
    }else{
      this.tabControl = [
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
        }
      ];
    }

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
      }
    }
  }

  ngAfterViewInit(): void {}

  getOneCustomerDetail(dataSelected) {
    this.viewTag = '';
    this.loaded = false;
    this.dataSelected = JSON.parse(JSON.stringify(dataSelected));
    // this.getListContactByObjectID(this.dataSelected?.recID);
    this.addressNameCM = this.dataSelected?.address;
    setTimeout(() => {
      this.viewTag = this.dataSelected?.tags
    }, 100);
    this.listTab(this.funcID);
    this.loaded = true;
  }

  getAdressNameByIsDefault(objectID, entityName) {
    if(this.funcID == 'CM0101' || this.funcID == 'CM0102'){
      this.cmSv
      .getAdressNameByIsDefault(objectID, entityName)
      .subscribe((res) => {
        if (res) {
          this.addressNameCM = res?.adressName;
        } else {
          this.addressNameCM = null;
        }
      });
    }else{
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

  listTab(funcID) {
    if (funcID == 'CM0101') {
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
          name: 'task',
          text: 'Công việc',
          icon: 'icon-more',
        },
      ];
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
