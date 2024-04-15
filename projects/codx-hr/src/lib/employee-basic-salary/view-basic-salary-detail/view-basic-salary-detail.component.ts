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
import { AuthStore, CacheService, CodxService, ViewsComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { isObservable } from 'rxjs';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import moment from 'moment';

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
    private cache: CacheService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService,
    public codxService : CodxService
  ) {
    this.user = this.authStore.get();
  }

  @Input() itemDetail: any;
  @Input() formModel;
  @Input() grvSetup;
  @Input() view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() clickMF = new EventEmitter();
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  tabControl: TabModel[] = [];

  user: any;
  itemDetailStt;
  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');
  formModelEmployee;

  olderItem: any;
  ngOnInit() {
    this.itemDetailStt = 1;

    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Thảo Luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];

    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });
  }

  ngOnChanges() {
    this.getOldSalaries();
  }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.formModel);

    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(e, data, fc);
      });
    } else this.changeDataMFBefore(e, data, funcList);
  }

  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.shareService.changeMFApproval(e, data?.unbounds);
    }
  }

  // changeDataMF(e: any, data: any) {
  //   this.hrService.handleShowHideMF(e, data, this.view);
  // }

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
