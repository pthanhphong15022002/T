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
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  treeTask = [];

  nameDetail = 'Information';

  tabDetail = [
    { name: 'Information', textDefault: 'Thông tin chung', icon: '', isActive: true },
    { name: 'Contact', textDefault: 'Liên hệ', icon: '', isActive: false },
    { name: 'History', textDefault: 'Lịch sử tác nghiệp', icon: '', isActive: false }
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
