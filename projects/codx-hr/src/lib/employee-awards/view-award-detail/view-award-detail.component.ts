import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isObservable } from 'rxjs';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CodxService,
  ViewsComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-view-award-detail',
  templateUrl: './view-award-detail.component.html',
  styleUrls: ['./view-award-detail.component.css'],
})
export class ViewAwardDetailComponent {
  constructor(
    private api: ApiHttpService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private router: ActivatedRoute,
    private authStore: AuthStore,
    private cache: CacheService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService,
    public codxService : CodxService
  ) {}

  @Input() itemDetail: any;
  @Input() formModel;
  @Input() grvSetup;
  @Input() view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() clickMFunction = new EventEmitter();
  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('addCancelComment') addCancelComment;

  tabControl: TabModel[] = [];
  // REFERTYPE = {
  //   IMAGE: 'image',
  //   VIDEO: 'video',
  //   APPLICATION: 'application',
  // };
  // services: string = 'DM';
  // assamplyName: string = 'ERM.Business.DM';
  // className: string = 'FileBussiness';
  // lstFile: any[] = [];
  // user: any;
  itemDetailStt;
  itemDetailDataStt;
  gridViewSetup: any = {};
  formModelEmployee;

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

    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });
  }
  ngAfterViewInit() {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Thảo Luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }
  // ngOnChanges() {
  //   this.lstFile = [];
  //   this.getFileDataAsync(this.itemDetail?.recID)
  // }

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

  clickMF(evt: any, data: any = null) {
    this.clickMFunction.emit({ event: evt, data: data });
  }
  // getFileDataAsync(pObjectID: string) {
  //   if (pObjectID) {
  //     this.api
  //       .execSv(
  //         this.services,
  //         this.assamplyName,
  //         this.className,
  //         'GetFilesByIbjectIDAsync',
  //         pObjectID
  //       )
  //       .subscribe((res: any) => {
  //         if (res.length > 0) {
  //           let files = res;
  //           files.map((e: any) => {
  //             if (e && e.referType == this.REFERTYPE.VIDEO) {
  //               e[
  //                 'srcVideo'
  //               ] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
  //             }
  //           });
  //           this.lstFile = res;
  //         }
  //       });
  //   }
  // }
}
