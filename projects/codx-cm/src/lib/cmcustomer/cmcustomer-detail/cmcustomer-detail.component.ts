import { CodxCmService } from '../../codx-cm.service';
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
  AlertConfirmInputConfig,
  NotificationsService,
} from 'codx-core';
import { PopupQuickaddContactComponent } from '../popup-add-cmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';

@Component({
  selector: 'codx-cmcustomer-detail',
  templateUrl: './cmcustomer-detail.component.html',
  styleUrls: ['./cmcustomer-detail.component.css'],
})
export class CmcustomerDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0101';
  @Input() entityName = '';
  moreFuncAdd = '';
  moreFuncEdit = '';
  vllContactType = 'CRM025';
  contactPerson: any;
  listContacts = [];
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
  formModelContact: FormModel;
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {}

  async ngOnInit() {
    this.formModelContact = await this.cmSv.getFormModel('CM0102');
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncAdd = m.defaultName;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataSelected.recID) {
      if (this.dataSelected.recID == this.id) return;
      this.id = this.dataSelected.recID;
      this.getContactByObjectID(this.id);
      this.getListContactByObjectID(this.id);
      this.listTab(this.funcID);
      console.log(this.formModel);
    }
  }

  getContactByObjectID(objectID) {
    this.cmSv.getContactByObjectID(objectID).subscribe((res) => {
      if (res) {
        this.contactPerson = res;
      }
    });
  }

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listContacts = res;
      }
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
      if (this.dataSelected.isCustomer == true) {
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
      } else {
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
        ];
      }
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

  //#region Crud contacts crm
  clickAddContact(action, data, title) {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    var title = title;
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    var obj = {
      moreFuncName: title,
      action: action,
      dataContact: data,
      type: 'formDetail',
      recIDCm: this.dataSelected?.recID,
      objectType: '1'
    }
    var dialog = this.callFc.openForm(
      PopupQuickaddContactComponent,
      '',
      500,
      500,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((e) => {
      if (e && e.event != null) {
        this.getListContactByObjectID(this.dataSelected?.recID);
        this.getContactByObjectID(this.dataSelected?.recID);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  delete(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        var check = this.dataSelected.contacts.some(
          (x) => x.recID == data.recID && x.contactType == '1'
        );
        if (!check) {
          this.cmSv
            .updateContactCrm(data, this.funcID, this.dataSelected?.recID, true)
            .subscribe((res) => {
              if (res && res.length > 0) {
                this.dataSelected.contacts = res;
                this.changeDetectorRef.detectChanges();
              }
            });
        } else {
          this.notiService.notifyCode(
            'Liên hệ này đang là liên hệ chính! Không xóa được'
          );
          return;
        }
      }
    });
  }
  //#endregion
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

  clickMFContact(e, data) {
    this.moreFuncEdit = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.clickAddContact('edit', data, this.moreFuncEdit);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
    }
  }
}
