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

  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @ViewChild('tabDetailView', { static: true })
  tabDetailView: TemplateRef<any>;
  @ViewChild('tabDetailViewDetail') tabDetailViewDetail: TabDetailCustomComponent;
  @ViewChild('quotations')quotations: TemplateRef<any>;
  @ViewChild('contract')contract: TemplateRef<any>;

  @ViewChild('references')references: TemplateRef<any>;


  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true, template: null },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false, template: null },
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
      let references = { name: 'References', textDefault: 'Liên kết', isActive: false, template: this.references};
      this.tabControl.push(references)

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
      this.afterLoad();
    }
  }

  listTab(funcID){
    this.tabDetail = [
      { name: 'Information', textDefault: 'Thông tin chung', icon: 'icon-info', isActive: true },
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
    var options = new DataRequest();
    options.entityName = 'CM_Deals';
    options.predicates = 'RecID=@0';
    options.dataValues = '61bc2462-069e-11ee-94b2-00155d035517';
    options.pageLoading = false;
    debugger;
    this.deals = await firstValueFrom(
      this.codxCmService.loadDataAsync('CM', options)
    );


  }
}

