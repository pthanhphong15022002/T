import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
  OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  AuthStore,
  DataRequest,
  FormModel,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-view-detail-contracts',
  templateUrl: './view-detail-contracts.component.html',
  styleUrls: ['./view-detail-contracts.component.css'],
})
export class ViewDetailContractsComponent implements OnInit {
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
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private api: ApiHttpService
  ) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.authStore.get();
  }

  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  @Input() funcID;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() uploaded = new EventEmitter();
  @Output() clickMFunction = new EventEmitter();

  user: any; //user loggin
  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;
  benefitFuncID = 'HRTEM0403';
  benefitFormModel: FormModel;
  benefitFormGroup: FormGroup;
  lstBenefit;
  active = 1;

  ngOnInit(): void {
    this.hrService.getFormModel(this.benefitFuncID).then((formModel) => {
      if (formModel) {
        this.benefitFormModel = formModel;
        this.hrService
          .getFormGroup(
            this.benefitFormModel.formName,
            this.benefitFormModel.gridViewName
          )
          .then((fg) => {
            if (fg) {
              this.benefitFormGroup = fg;
            }
          });
      }
    });

    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      this.hrService
        .loadDataEContract(changes.itemDetail?.currentValue?.recID)
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.df.detectChanges();
          }
        });
    }

    if (this.itemDetail?.benefits) {
      this.lstBenefit = JSON.parse(this.itemDetail.benefits);
    }

    this.lstFile = [];
    this.getFileDataAsync(this.itemDetail?.recID);
  }

  // ngAfterViewInit(): void {
  //   this.tabControl = [
  //     { name: 'History', textDefault: 'Lịch sử', isActive: true },
  //     { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
  //     { name: 'Comment', textDefault: 'Bình luận', isActive: false },
  //     { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  //   ];

  // }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.formModel);
  }

  // clickMF(val: any, datas: any = null){
  //   var funcID = val?.functionID;
  //   if (!datas) {
  //     datas = this.itemDetail;
  //   } else {
  //     var index = this.view.dataService.data.findIndex((object) => {
  //       return object.recID === datas.recID;
  //     });
  //     if (index >= 0) {
  //       datas = this.view.dataService.data[index];
  //     }
  //   }
  //   this.clickMFunction.emit({event: val, data: datas});
  // }

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
