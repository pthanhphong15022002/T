import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, CRUDService, CacheService, FormModel } from 'codx-core';
import { TabDetailCustomComponent } from './tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contacts } from '../../models/cm_model';
import { async } from '@angular/core/testing';
import { CodxListContactsComponent } from '../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';

@Component({
  selector: 'codx-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Input() gridViewSetup: any;

  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Input() funcID = 'CM0201'; //
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail')
  tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('quotations') quotations: TemplateRef<any>;
  @ViewChild('contract') contract: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;

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
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false, template: null },
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
  ];

  formModelCustomer: FormModel;

  treeTask = [];

  nameDetail = '';
  tabClicked = '';
  contactPerson:any;

  tabDetail = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private api: ApiHttpService,
    private cache: CacheService,
  ) {
    this.listTab(this.funcID);
    this.executeApiCalls();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSelected) {
      this.dataSelected = this.dataSelected;
      this.promiseAllAsync();
    }
  }

  async promiseAllAsync() {
    try {
    await this.getTree() ; //ve cay giao viec
    await this.getContactByDeaID(this.dataSelected.recID);


    } catch (error) {}

  }


  listTab(funcID) {
    this.tabDetail = [
      {
        name: 'Information',
        textDefault: 'Thông tin chung',
        icon: 'icon-info',
        isActive: true,
      },
      {
        name: 'Field',
        textDefault: 'Thông tin mở rộng',
        icon: 'icon-add_to_photos',
        isActive: false,
      },
      {
        name: 'Contact',
        textDefault: 'Liên hệ',
        icon: 'icon-contact_phone',
        isActive: false,
      },
      {
        name: 'Opponent',
        textDefault: 'Đối thủ',
        icon: 'icon-people_alt',
        isActive: false,
      },
      {
        name: 'Task',
        textDefault: 'Công việc',
        icon: 'icon-more',
        isActive: false,
      },
      {
        name: 'Quotation',
        textDefault: 'Báo giá',
        icon: 'icon-monetization_on',
        isActive: false,
      },
      {
        name: 'Contract',
        textDefault: 'Hợp đồng',
        icon: 'icon-sticky_note_2',
        isActive: false,
      },

    ];
  }
  async executeApiCalls() {
    try {
      this.formModelCustomer = await this.codxCmService.getFormModel('CM0101');
    } catch (error) {}
  }

  changeTab(e) {
    this.tabClicked = e;
    this.nameDetail = e;
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMF.emit({
      e: e,
      data: data,
    });
  }

  changeFooter(e) {
  }

  async getContactByDeaID(recID){
    this.codxCmService.getContactByObjectID(recID).subscribe((res) => {
      if (res) {
        this.contactPerson = res;
      }
      else {
        this.contactPerson = null;
      }
    });
  }
 //load giao việc
 async  getTree() {
    let seesionID = this.dataSelected.refID;
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
  saveAssign(e){
    if(e) this.getTree();
  }

  getContactPerson($event){
    if($event) {
      this.contactPerson = $event?.isDefault ? $event: null;
      this.changeDetectorRef.detectChanges();
    }
  }
}
