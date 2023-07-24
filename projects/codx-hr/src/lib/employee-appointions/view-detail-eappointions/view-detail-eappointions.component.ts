import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, AuthStore, ViewsComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-view-detail-eappointions',
  templateUrl: './view-detail-eappointions.component.html',
  styleUrls: ['./view-detail-eappointions.component.css'],
})
export class ViewDetailEappointionsComponent {
  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  @Input() formModel;
  @Input() grvSetup;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() hideFooter = false;
  @Output() clickMFunction = new EventEmitter();

  user: any; //user loggin
  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;
  appointionsFuncID = 'HRTApp02';

  lstBenefit;
  active = 1;
  console = console;
  isLoaded: boolean = false;
  userID: any;
  //Using render file
  services: string = 'DM';
  assamplyName: string = 'ERM.Business.DM';
  className: string = 'FileBussiness';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];

  constructor(
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private router: ActivatedRoute,
    private api: ApiHttpService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.userID = this.authStore.get().userID;
  }

  ngOnChanges() {
    this.lstFile = [];
    this.getFileDataAsync(this.itemDetail?.recID);
  }

  ngAfterViewInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
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
