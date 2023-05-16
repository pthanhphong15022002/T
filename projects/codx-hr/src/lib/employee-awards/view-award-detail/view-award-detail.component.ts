import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogRef,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewsComponent,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { CodxEsService } from 'projects/codx-es/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-view-award-detail',
  templateUrl: './view-award-detail.component.html',
  styleUrls: ['./view-award-detail.component.css'],
})
export class ViewAwardDetailComponent implements OnChanges{
  constructor(
    private api: ApiHttpService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private callFunc: CallFuncService,
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
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  services: string = 'DM';
  assamplyName: string = 'ERM.Business.DM';
  className: string = 'FileBussiness';
  lstFile: any[] = [];
  user: any;
  grvSetup: any = {};
  itemDetailStt;
  itemDetailDataStt;
  gridViewSetup: any = {};

  ngOnInit(): void {
    // this.itemDetailStt = 1;
    // this.itemDetailDataStt = 1;
    if (this.formModel) {
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((res) => {
          if (res) this.gridViewSetup = res;
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
  ngOnChanges() {
    this.lstFile = [];
    this.getFileDataAsync(this.itemDetail?.recID)
  }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.view);
  }

  clickMF(evt: any, data: any = null) {
    this.clickMFunction.emit({ event: evt, data: data });
  }
  getFileDataAsync(pObjectID: string) {
    if (pObjectID) {
      this.api
        .execSv(
          this.services,
          this.assamplyName,
          this.className,
          'GetFilesByIbjectIDAsync',
          pObjectID
        )
        .subscribe((res: any) => {
          if (res.length > 0) {
            let files = res;
            files.map((e: any) => {
              if (e && e.referType == this.REFERTYPE.VIDEO) {
                e[
                  'srcVideo'
                ] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
              }
            });
            this.lstFile = res;
          }
        });
    }
  }
}
