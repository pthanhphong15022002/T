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
import { AuthStore, CacheService, ViewsComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'lib-view-basic-salary-detail',
  templateUrl: './view-basic-salary-detail.component.html',
  styleUrls: ['./view-basic-salary-detail.component.css'],
})
export class ViewBasicSalaryDetailComponent implements OnInit {
  console = console;
  constructor(
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
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
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  tabControl: TabModel[] = [];

  user: any;
  grvSetup: any = {};
  itemDetailStt;

  olderItem: any;
  ngOnInit() {
    this.itemDetailStt = 1;

    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Thảo Luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }

  ngOnChanges() {
    this.getOldSalaries();
  }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.view);
  }

  clickMFunc(event: any, data: any = null) {
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
