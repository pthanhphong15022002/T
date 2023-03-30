import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  CallFuncService,
  CRUDService,
  DialogModel,
  FormModel,
  CacheService,
} from 'codx-core';
import { PopupQuickaddContactComponent } from '../popup-add-crmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';

@Component({
  selector: 'codx-crmcustomer-detail',
  templateUrl: './crmcustomer-detail.component.html',
  styleUrls: ['./crmcustomer-detail.component.css'],
})
export class CrmcustomerDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0101';
  @Input() entityName = '';
  @Output() clickMoreFunc = new EventEmitter<any>();
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Task', textDefault: 'Công việc', isActive: false },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'Quote', textDefault: 'Báo giá', isActive: false },
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false },
    { name: 'Contract', textDefault: 'Hợp đồng', isActive: false },
  ];
  treeTask = [];

  name = 'Information';
  id = '';
  tabDetail = [];
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataSelected.recID) {
      if (this.dataSelected.recID == this.id) return;
      this.id = this.dataSelected.recID;
      this.listTab(this.funcID);
      console.log(this.formModel);
    }
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
          name: 'Task',
          textDefault: 'Công việc',
          icon: 'icon-format_list_numbered',
          isActive: false,
        },
        {
          name: 'Opportunity',
          textDefault: 'Cơ hội',
          icon: 'icon-add_shopping_cart',
          isActive: false,
        },
        {
          name: 'Product',
          textDefault: 'Sản phẩm đã mua',
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
          name: 'Task',
          textDefault: 'Công việc',
          icon: 'icon-format_list_numbered',
          isActive: false,
        },
        {
          name: 'Opportunity',
          textDefault: 'Cơ hội',
          icon: 'icon-add_shopping_cart',
          isActive: false,
        },
        {
          name: 'Product',
          textDefault: 'Sản phẩm đã mua',
          icon: 'icon-shopping_bag',
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
          name: 'Offered',
          textDefault: 'Sản phẩm cung cấp',
          icon: 'icon-shopping_cart',
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
          name: 'Offered',
          textDefault: 'Sản phẩm cung cấp',
          icon: 'icon-shopping_cart',
          isActive: false,
        },
      ];
    }
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

  clickAddContact() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CRMCustomers';
    dataModel.gridViewName = 'grvCRMCustomers';
    dataModel.entityName = 'CRM_Customers';
    opt.FormModel = dataModel;
    this.callFc.openForm(
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
}
