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
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  FormModel,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/lib/codx-hr.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-detail-employee-business',
  templateUrl: './view-detail-employee-business.component.html',
  styleUrls: ['./view-detail-employee-business.component.css'],
})
export class ViewDetailEmployeeBusinessComponent implements OnInit {
  constructor(
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private router: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService
  ) {
    this.user = this.authStore.get();
  }

  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  @Input() formModel;
  @Input() grvSetup;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() hideFooter = false;
  @Output() uploaded = new EventEmitter();
  @Output() clickMFunction = new EventEmitter();

  user: any; //user loggin
  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;
  benefitFuncID = 'HRTApp10';
  benefitFormModel: FormModel;
  benefitFormGroup: FormGroup;
  active = 1;
  dataOldSalary;
  console = console;

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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      // this.hrService.loadDataEContract(changes.itemDetail?.currentValue?.recID).subscribe((res) => {
      //   if (res) {
      //     this.itemDetail = res;
      //     this.df.detectChanges();
      //   }
      // });
    }
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
}
