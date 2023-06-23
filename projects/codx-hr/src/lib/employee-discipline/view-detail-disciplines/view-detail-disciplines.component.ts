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

@Component({
  selector: 'lib-view-detail-disciplines',
  templateUrl: './view-detail-disciplines.component.html',
  styleUrls: ['./view-detail-disciplines.component.css'],
})
export class ViewDetailDisciplinesComponent {
  console = console;
  constructor(
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private router: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
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
  // benefitFuncID = 'HRTEM0403';
  // benefitFormModel : FormModel;
  benefitFormGroup: FormGroup;
  active = 1;

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      this.hrService
        .loadDataEDisciplines(changes.itemDetail?.currentValue?.recID)
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.df.detectChanges();
          }
        });
    }
  }

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.formModel);
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
