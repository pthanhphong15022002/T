import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CRUDService, DataRequest, ImageViewerComponent, ResourceModel } from 'codx-core';
import { TabDetailCustomComponent } from '../../deals/deal-detail/tab-detail-custom/tab-detail-custom.component';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'codx-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent  implements OnInit {

  @Input() dataSelected: any;
  @Input() dataService: CRUDService;
  @Input() formModel: any;
  @Input() funcID: any; //
  @Input() gridViewSetup: any;
  @Input() dataObj?: any;
  @Input() colorReasonSuccess: any;
  @Input() colorReasonFail: any;
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail') tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('quotations')quotations: TemplateRef<any>;
  @ViewChild('contract')contract: TemplateRef<any>;

  @ViewChild('references')references: TemplateRef<any>;
  @ViewChild('comment')comment: TemplateRef<any>;


  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    // { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false, template: null },
    { name: 'Task', textDefault: 'Công việc', isActive: false, template: null },
    { name: 'Approve', textDefault: 'Ký duyệt', isActive: false, template: null },
  ];
  treeTask = [];

  nameDetail = '';
  tabClicked = '';

  tabDetail = [
  ]

  contactPerson:any;
  deals:any;
  request: ResourceModel;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService,
  ) {
    this.listTab(this.funcID);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {



  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      this.dataSelected = this.dataSelected;
      if(this.dataSelected.dealID) {
        let references = { name: 'References', textDefault: 'Liên kết', isActive: false, template: this.references};
        this.tabControl.push(references)
      }
      else {
        this.tabControl.pop();
      }
      this.afterLoad();
    }
  }

  listTab(funcID){
    this.tabDetail = [
      { name: 'Information', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
      {
        name: 'Field',
        textDefault: 'Thông tin mở rộng',
        icon: 'icon-add_to_photos',
        isActive: false,
      },
      {
        name: 'Task',
        textDefault: 'Công việc',
        icon: 'icon-more',
        isActive: false,
      },
      {
        name: 'Comment',
        textDefault: 'Thảo luận',
        icon: 'icon-i-chat-right',
        isActive: false,
      },
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
  }

  async afterLoad() {
  }
}

