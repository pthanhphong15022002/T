import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, CacheService, CallFuncService, DialogRef, NotificationsService, UIComponent, ViewModel, ViewsComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { CodxEsService } from 'projects/codx-es/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';

@Component({
  selector: 'lib-view-award-detail',
  templateUrl: './view-award-detail.component.html',
  styleUrls: ['./view-award-detail.component.css']
})
export class ViewAwardDetailComponent {

  constructor(
    private esService: CodxEsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private notify: NotificationsService,
    private router: ActivatedRoute,
    private authStore: AuthStore,
    private cache: CacheService
  ) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.authStore.get();
  }


  @Input() funcID: any;
  @Input() itemDetail: any;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() clickMFunction = new EventEmitter();
  @Output() uploaded = new EventEmitter();
  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('addCancelComment') addCancelComment;

  tabControl: TabModel[] = [];

  user: any;
  grvSetup: any = {};
  itemDetailStt;
  itemDetailDataStt;
  gridViewSetup: any ={};


  ngOnInit(): void {
    // this.itemDetailStt = 1;
    // this.itemDetailDataStt = 1;
    if(this.formModel){
      this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe(res =>{
        if(res) this.gridViewSetup = res;
      });
    }
  }
  ngAfterViewInit() {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Thảo Luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
      // { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
    ];
  }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.view);
  }
  
  clickMF(evt: any, data: any = null){
    this.clickMFunction.emit({event: evt, data: data});
  }

}
