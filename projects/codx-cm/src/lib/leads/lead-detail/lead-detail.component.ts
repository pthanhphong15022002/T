import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService } from 'codx-core';
import { TabDetailCustomComponent } from '../../deals/deal-detail/tab-detail-custom/tab-detail-custom.component';

@Component({
  selector: 'codx-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent  implements OnInit {

  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID = 'CM0201'; //
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
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

  nameDetail = '';
  tabClicked = '';

  tabDetail = [
  ]
  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.listTab(this.funcID);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let index = this.tabControl.findIndex(item => item.name == 'Contract');
    if(index >= 0){
      let contract = { name: 'Contract', textDefault: 'Hợp đồng', isActive: false, template: this.contract};
      this.tabControl.splice(index,1,contract)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
  }

  listTab(funcID){
    this.tabDetail = [
      { name: 'Information', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
      { name: 'Contact', textDefault: 'Liên hệ', icon: 'icon-contact_phone', isActive: false },
      { name: 'Address', textDefault: 'Địa chỉ', icon: 'icon-location_on', isActive: false },
    ]
  }

  changeTab(e){
    this.tabClicked = e;
    this.nameDetail = e;
  }

  clickMF(e, data){
    this.clickMoreFunc.emit({e: e, data: data});
  }

  changeDataMF(e, data) {
    this.changeMF.emit({
      e: e,
      data: data,
    });

  }

  changeFooter(e){
    console.log(e);
  }
}

