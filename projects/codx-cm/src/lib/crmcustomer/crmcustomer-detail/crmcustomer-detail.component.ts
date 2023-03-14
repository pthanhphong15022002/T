import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CRUDService } from 'codx-core';

@Component({
  selector: 'codx-crmcustomer-detail',
  templateUrl: './crmcustomer-detail.component.html',
  styleUrls: ['./crmcustomer-detail.component.css']
})
export class CrmcustomerDetailComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;

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
    { name: 'Information', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
    { name: 'Contact', textDefault: 'Liên hệ', icon: 'icon-contact_phone', isActive: false },
    { name: 'Opportunity', textDefault: 'Cơ hội', icon: 'icon-add_shopping_cart', isActive: false },
    { name: 'Product', textDefault: 'Sản phẩm đã mua', icon: 'icon-shopping_bag', isActive: false }

  ]
  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }


  clickMenu(item) {
    this.nameDetail = item.name;
    this.tabDetail.forEach((obj) => {
      if (!obj.isActive && obj.name == this.nameDetail) {
        obj.isActive = true;
      } else obj.isActive = false;
    });
    this.changeDetectorRef.detectChanges();
  }
}
