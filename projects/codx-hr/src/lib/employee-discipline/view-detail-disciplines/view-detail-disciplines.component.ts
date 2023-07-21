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
import { isObservable } from 'rxjs';
import {
  AuthStore,
  FormModel,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { FormGroup } from '@angular/forms';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-view-detail-disciplines',
  templateUrl: './view-detail-disciplines.component.html',
  styleUrls: ['./view-detail-disciplines.component.css'],
})
export class ViewDetailDisciplinesComponent {
  constructor(
    private hrService: CodxHrService,
    private router: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService
  ) {}

  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;

  @Input() grvSetup;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Output() uploaded = new EventEmitter();
  @Output() clickMFunction = new EventEmitter();

  tabControl: TabModel[] = [];
  renderFooter = false;
  isAfterRender = true;
  // benefitFuncID = 'HRTEM0403';
  // benefitFormModel : FormModel;
  benefitFormGroup: FormGroup;
  active = 1;
  ngOnChanges(changes: SimpleChanges) {
    // if (
    //   changes?.itemDetail &&
    //   changes.itemDetail?.previousValue?.recID !=
    //     changes.itemDetail?.currentValue?.recID
    // ) {
    //   this.hrService
    //     .loadDataEDisciplines(changes.itemDetail?.currentValue?.recID)
    //     .subscribe((res) => {
    //       if (res) {
    //         this.itemDetail = res;
    //         this.df.detectChanges();
    //       }
    //     });
    // }
  }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.view.formModel);

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

  ngAfterViewInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }
}
