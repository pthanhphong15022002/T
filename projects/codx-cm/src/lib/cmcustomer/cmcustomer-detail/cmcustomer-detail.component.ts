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
import { PopupQuickaddContactComponent } from '../popup-add-cmcustomer/popup-quickadd-contact/popup-quickadd-contact.component';
import { CM_Contacts } from '../../models/cm_model';
import { PopupListContactsComponent } from '../popup-add-cmcustomer/popup-list-contacts/popup-list-contacts.component';

@Component({
  selector: 'codx-cmcustomer-detail',
  templateUrl: './cmcustomer-detail.component.html',
  styleUrls: ['./cmcustomer-detail.component.css'],
})
export class CmcustomerDetailComponent implements OnInit {
  @ViewChild('contract')contract: TemplateRef<any>;
  @Input() recID: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0101';
  @Input() entityName = '';
  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();

  moreFuncAdd = '';
  moreFuncEdit = '';
  vllContactType = '';
  listContacts = [];
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
    { name: 'References', textDefault: 'Liên kết', isActive: false, template: null },
    { name: 'Quote', textDefault: 'Báo giá', isActive: false, template: null },
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
  ];
  treeTask = [];
  dataSelected: any;
  name = 'Information';
  id = '';
  tabDetail = [];
  formModelContact: FormModel;
  gridViewSetup: any;
  listAddress = [];
  contactPerson = new CM_Contacts();
  viewTag = '';
  nameCbxCM = '';
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
    // this.getGridviewSetup();
    // this.getVllByGridViewSetupContact();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recID']) {
      if (changes['recID'].currentValue) {
        if (this.recID == this.id) return;
        this.id = this.recID;
        this.getOneCustomerDetail(this.id, this.funcID);
      }
    }
  }

  ngAfterViewInit(): void {
     this.tabControl.push({ name: 'Contract', textDefault: 'Hợp đồng', isActive: false, template: this.contract});
   }

  getOneCustomerDetail(id, funcID) {
    this.viewTag = '';
    this.cmSv.getOneCustomer(id, funcID).subscribe((res) => {
      if (res) {
        this.dataSelected = res;
        this.viewTag = this.dataSelected?.tags;
        this.getListContactByObjectID(this.dataSelected?.recID);
        this.getListAddress(this.entityName, this.dataSelected?.recID);
        this.listTab(this.funcID);
      }
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

  getListContactByObjectID(objectID) {
    this.cmSv.getListContactByObjectID(objectID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listContacts = res;
        this.contactPerson = this.listContacts.find((x) =>
          x.contactType.split(';').some((x) => x == '1')
        );
      }
    });
  }

  getListAddress(entityName, recID) {
    this.cmSv.getListAddress(entityName, recID).subscribe((res) => {
      this.listAddress = res;
    });
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
          name: 'Opportunity',
          textDefault: 'Cơ hội liên quan',
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

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
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
    this.cache
      .gridViewSetup(dataModel.formName, dataModel.gridViewName)
      .subscribe((res) => {
        var obj = {
          moreFuncName: title,
          action: action,
          dataContact: data,
          type: 'formDetail',
          recIDCm: this.dataSelected?.recID,
          objectType: this.funcID == 'CM0101' ? '1' : '3',
          objectName:
            this.funcID == 'CM0101'
              ? this.dataSelected.customerName
              : this.dataSelected.partnerName,
          gridViewSetup: res,
          listContacts: this.listContacts,
        };
        var dialog = this.callFc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          action != 'editType' ? 500 : 100,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            this.getListContactByObjectID(this.dataSelected?.recID);
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  //Open list contacts
  clickPopupContacts() {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CMContacts';
    dataModel.gridViewName = 'grvCMContacts';
    dataModel.entityName = 'CM_Contacts';
    dataModel.funcID = 'CM0102';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup(dataModel.formName, dataModel.gridViewName)
      .subscribe((res) => {
        var obj = {
          type: 'formDetail',
          recIDCm: this.dataSelected?.recID,
          objectName:
            this.funcID == 'CM0101'
              ? this.dataSelected.customerName
              : this.dataSelected.partnerName,
          objectType: this.funcID == 'CM0101' ? '1' : '3',
          gridViewSetup: res,
          lstContactCm: this.listContacts,
        };
        var dialog = this.callFc.openForm(
          PopupListContactsComponent,
          '',
          500,
          550,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e.event != null) {
            this.getListContactByObjectID(this.dataSelected?.recID);
          }
        });
      });
  }

  deleteContactToCM(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        if (!(data.recID == this.contactPerson.recID)) {
          this.cmSv.updateContactCrm(data.recID).subscribe((res) => {
            if (res) {
              this.getListContactByObjectID(this.dataSelected?.recID);
              this.notiService.notifyCode('SYS008');
              this.changeDetectorRef.detectChanges();
            }
          });
        } else {
          this.notiService.notifyCode('CM004');
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
      case 'CM0102_2':
      case 'CM0102_3':
        this.deleteContactToCM(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
      case 'CM0102_1':
        this.clickAddContact('editType', data, this.moreFuncEdit);
        break;
    }
  }

  changeDataMFContact(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
          case 'SYS004':
          case 'SYS002':
          case 'SYS02':
          case 'SYS04':
            res.disabled = true;
            break;
          case 'CM0102_2':
            if (this.funcID == 'CM0103') res.disabled = true;
            break;
          case 'CM0102_3':
            if (this.funcID == 'CM0101') res.disabled = true;
            break;
        }
      });
    }
  }
}
