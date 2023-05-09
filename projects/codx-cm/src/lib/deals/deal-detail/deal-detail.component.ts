import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService } from 'codx-core';
import { TabDetailCustomComponent } from './tab-detail-custom/tab-detail-custom.component';

@Component({
  selector: 'codx-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss']
})
export class DealDetailComponent  implements OnInit {

  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0201'; //True - Khách hàng; False - Liên hệ
  @Output() clickMoreFunc = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @Input() tmpDataSelect: any;
  @ViewChild('tabDetailViewDetail') tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('quotations')quotations: TemplateRef<any>;
  @ViewChild('contract')contract: TemplateRef<any>;

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
    { name: 'References', textDefault: 'Liên kết', isActive: false, template: null },
    { name: 'Quotations', textDefault: 'Báo giá', isActive: false, template: null },
    { name: 'Order', textDefault: 'Đơn hàng', isActive: false, template: null },
    { name: 'Contract', textDefault: 'Hợp đồng', isActive: false, template: null},
  ];

  treeTask = [];

  nameDetail = 'Information';

  tabDetail = [
  ]
  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {

    this.nameDetail = 'Information'
    this.listTab(this.funcID);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
   // this.tabControl.push({ name: 'Quotations', textDefault: 'Báo giá', isActive: false, template: this.quotations});
    //this.tabControl.push({ name: 'References', textDefault: 'Liên kết', isActive: false, template: null});
    let index = this.tabControl.findIndex(item => item.name == 'Contract');
    if(index >= 0){
      let contract = { name: 'Contract', textDefault: 'Hợp đồng', isActive: false, template: this.contract};
      this.tabControl.splice(index,1,contract)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  changeFooter(e){
    console.log(e);

  }
}

