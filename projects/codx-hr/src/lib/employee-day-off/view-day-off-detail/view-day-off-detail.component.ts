import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  OnChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
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

@Component({
  selector: 'lib-view-day-off-detail',
  templateUrl: './view-day-off-detail.component.html',
  styleUrls: ['./view-day-off-detail.component.css'],
})
export class ViewDayOffDetailComponent implements OnChanges {
  constructor(
    private esService: CodxEsService,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private notify: NotificationsService,
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

  user: any;
  grvSetup: any = {};
  itemDetailStt;
  itemDetailDataStt;
  gridViewSetup: any = {};
  knowType = {
    type1: ['N20', 'N22', 'N23', 'N24', 'N25', 'N26', 'N35'],
    type2: ['N21'],
    type3: ['N31'],
    type4: ['N33'],
    type5: ['N34'],
  };
  groupKowTypeView: any;

  ngOnInit(): void {
    this.itemDetailStt = 1;
    this.itemDetailDataStt = 1;
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

  changeDataMF(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.view);
  }

  clickMF(evt: any, data: any = null) {
    this.clickMFunction.emit({ event: evt, data: data });
  }
  ngOnChanges() {
    this.getGroupKowTypeView();
    this.checkViewKowTyeGroup();
  }
  getGroupKowTypeView() {
    this.groupKowTypeView = {
      groupA: {
        value: this.knowType.type1
          .concat(this.knowType.type2)
          .concat(this.knowType.type4)
          .concat(this.knowType.type5),
        isShow: false,
        field: ['siLeaveNo', 'hospitalLine'],
      },
      groupB: {
        value: this.knowType.type2,
        isShow: false,
        field: ['childID', 'childHICardNo'],
      },
      groupC: {
        value: this.knowType.type4.concat(this.knowType.type5),
        isShow: false,
        field: ['pregnancyFrom', 'pregnancyWeeks'],
      },
      groupD: {
        value: this.knowType.type3,
        isShow: false,
        field: [
          'newChildBirthDate',
          'newChildNum',
          'isNewChildUnder32W',
          'newChildBirthType',
          'wifeID',
          'wifeIDCardNo',
          'wifeSINo',
        ],
      },
    };
  }
  checkViewKowTyeGroup() {
    if (this.itemDetail['kowID']) {
      for (let i in this.groupKowTypeView) {
        this.groupKowTypeView[i].isShow = this.groupKowTypeView[
          i
        ].value.includes(this.itemDetail['kowID']);
      }
    } else this.getGroupKowTypeView();
  }
}
