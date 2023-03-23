import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService } from 'codx-core';
import { TabDetailCustomComponent } from './tab-detail-custom/tab-detail-custom.component';

@Component({
  selector: 'codx-opportunity-detail',
  templateUrl: './opportunity-detail.component.html',
  styleUrls: ['./opportunity-detail.component.scss']
})
export class OpportunityDetailComponent implements OnInit {

  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0201'; //True - Khách hàng; False - Liên hệ
  @Output() clickMoreFunc = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;

  @ViewChild('tabDetailViewDetail') tabDetailViewDetail: TabDetailCustomComponent;



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

  nameDetail = 'Information';

  tabDetail = [
  ]
  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log(this.dataSelected.steps);

  }

  ngOnChanges(changes: SimpleChanges): void {
    debugger;
    this.listTab(this.funcID);
    this.nameDetail == 'Information'
  }

  listTab(funcID){
      this.tabDetail = [
        { name: 'Information', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
        { name: 'Field', textDefault: 'Thông tin mở rộng', icon: 'icon-contact_phone', isActive: false },
        { name: 'Contact', textDefault: 'Liên hệ', icon: 'icon-add_shopping_cart', isActive: false },
        { name: 'Opponent', textDefault: 'Đối thủ', icon: 'icon-shopping_bag', isActive: false },
        { name: 'Task', textDefault: 'Quy trình', icon: 'icon-shopping_bag', isActive: false },
        { name: 'Product', textDefault: 'Sản phẩm', icon: 'icon-shopping_bag', isActive: false },
      ]
  }

  clickMenu(item) {
    this.nameDetail = item?.name;
    this.tabDetail = this.tabDetail.map(tabItem => ({
      ...tabItem,
      isActive: tabItem.name === this.nameDetail,
    }));
    this.changeDetectorRef.detectChanges();
  }


  clickMF(e, data){
    this.clickMoreFunc.emit({e: e, data: data});
  }
}
