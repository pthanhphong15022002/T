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
  CodxService,
  FormModel,
  ViewsComponent,
} from 'codx-core';
import moment from 'moment';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-view-detail-contracts',
  templateUrl: './view-detail-contracts.component.html',
  styleUrls: ['./view-detail-contracts.component.css'],
})
export class ViewDetailContractsComponent implements OnInit {
  console = console;
  //Using render file
  services: string = 'DM';
  assemblyName: string = 'ERM.Business.DM';
  className: string = 'FileBussiness';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];
  formModelEmployee;
  // userID: any;

  constructor(
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private router: ActivatedRoute,
    private df: ChangeDetectorRef,
    private api: ApiHttpService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService,
    public codxService : CodxService
  ) {
    this.user = this.authStore.get();
  }

  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() grvSetup;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() clickMFunction = new EventEmitter();

  user: any; //user loggin
  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;
  benefitFuncID = 'HRTEM0403';
  contractFuncID = 'HRTAppro01';
  benefitFormModel: FormModel;
  benefitFormGroup: FormGroup;
  lstBenefit;
  active = 1;
  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');

  ngOnInit(): void {
    // this.userID = this.authStore.get().userID;
    
    this.hrService.getFormModel(this.benefitFuncID).then((formModel) => {
      if (formModel) {
        this.benefitFormModel = formModel;
        this.hrService
          .getFormGroup(
            this.benefitFormModel.formName,
            this.benefitFormModel.gridViewName,
            this.benefitFormModel
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

    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (
    //   changes?.itemDetail &&
    //   changes.itemDetail?.previousValue?.recID !=
    //     changes.itemDetail?.currentValue?.recID
    // ) {
    //   this.hrService
    //     .loadDataEContract(changes.itemDetail?.currentValue?.recID)
    //     .subscribe((res) => {
    //       if (res) {
    //         this.itemDetail = res;
    //         this.df.detectChanges();
    //       }
    //     });
    // }
    console.log('ngonchange');
    debugger

    if (this.itemDetail?.benefits) {
      this.lstBenefit = JSON.parse(this.itemDetail.benefits);
    }

    this.getFileDataAsync(this.itemDetail?.recID);
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
    this.lstFile = [];
    if (pObjectID) {
      this.api
        .execSv(
          this.services,
          this.assemblyName,
          this.className,
          'GetFilesByIbjectIDAsync',
          pObjectID
        )
        .subscribe((res: any) => {
          debugger
          if (res?.length > 0) {
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
