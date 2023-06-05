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
import { ApiHttpService, CRUDService, FormModel } from 'codx-core';
import { TabDetailCustomComponent } from './tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { CM_Contacts } from '../../models/cm_model';

@Component({
  selector: 'codx-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() formModel: any;
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

  listContract: CM_Contacts[];
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
    {
      name: 'Quotations',
      textDefault: 'Báo giá',
      isActive: false,
      template: null,
    },
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
    {
      name: 'Contract',
      textDefault: 'Hợp đồng',
      isActive: false,
      template: null,
    },
  ];

  formModelCustomer: FormModel;

  treeTask = [];

  nameDetail = '';
  tabClicked = '';
  test: any;

  tabDetail = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
    private api: ApiHttpService
  ) {
    this.listTab(this.funcID);
    // this.test='Dịch vụ;VIP;Năm 2024';
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    let index = this.tabControl.findIndex((item) => item.name == 'Contract');
    if (index >= 0) {
      let contract = {
        name: 'Contract',
        textDefault: 'Hợp đồng',
        isActive: false,
        template: this.contract,
      };
      this.tabControl.splice(index, 1, contract);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSelected) {
      this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
      this.getTree() ; //ve cay giao viec
      this.getContractByDeaID();
    }
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
        textDefault: 'Quy trình',
        icon: 'icon-more',
        isActive: false,
      },
      {
        name: 'GanttChart',
        textDefault: 'Biểu đồ Gantt',
        icon: 'icon-insert_chart_outlined',
        isActive: false,
      },
    ];
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
    console.log(e);
  }

  getContractByDeaID() {
    if (this.dataSelected?.recID) {
      var data = [this.dataSelected?.recID];
      this.codxCmService.getListContractByDealID(data).subscribe((res) => {
        if (res) {
          this.listContract = res;
        } else {
          this.listContract = [];
        }
      });
    }
  }
 //load giao việc
  getTree() {
    let seesionID = this.dataSelected.refID;
    this.codxCmService.getTreeBySessionID(seesionID).subscribe((tree) => {
      this.treeTask = tree || [];
    });
  }
  saveAssign(e){
    if(e) this.getTree();
  }
}
