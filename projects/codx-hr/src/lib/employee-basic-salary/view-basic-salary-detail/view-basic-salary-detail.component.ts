import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CallFuncService,
  NotificationsService,
  AuthStore,
  CacheService,
  FormModel,
  ViewsComponent,
} from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/public-api';
import { CodxHrService } from '../../codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'lib-view-basic-salary-detail',
  templateUrl: './view-basic-salary-detail.component.html',
  styleUrls: ['./view-basic-salary-detail.component.css'],
})
export class ViewBasicSalaryDetailComponent implements OnInit {
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
    this.user = this.authStore.get();
  }

  @Input() itemDetail: any;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() clickMF = new EventEmitter();
  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('addCancelComment') addCancelComment;

  tabControl: TabModel[] = [];

  user: any;
  grvSetup: any = {};
  itemDetailStt;
  itemDetailDataStt;
  gridViewSetup: any = {};

  olderItem: any;
  ngOnInit() {
    this.itemDetailStt = 1;
    this.itemDetailDataStt = 1;
    if (this.formModel) {
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((res) => {
          if (res) this.gridViewSetup = res;
        });
    }

    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Thảo Luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }
  // ngAfterViewInit() {
  //   this.tabControl = [
  //     { name: 'History', textDefault: 'Lịch sử', isActive: true },
  //     { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
  //     { name: 'Comment', textDefault: 'Thảo Luận', isActive: false },
  //     { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  //     { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
  //   ];
  // }
  ngOnChanges(changes: SimpleChanges) {
    this.getOldSalaries();
  }
  changeDataMF(e: any, data: any) {}
  openFormFuncID(event: any, data: any = null) {
    this.clickMF.emit({ event: event, data: data });
  }

  getOldSalaries() {
    if (this.itemDetail) {
      this.hrService.getOldBasicSalary(this.itemDetail).subscribe((res) => {
        this.olderItem = res;
      });
    }
    this.df.detectChanges();
  }
}
