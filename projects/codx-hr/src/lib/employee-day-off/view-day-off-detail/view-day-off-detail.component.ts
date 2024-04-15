import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  CacheService,
  CallFuncService,
  CodxService,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { CodxEsService } from 'projects/codx-es/src/public-api';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

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
  @Output() clickMFunction = new EventEmitter();
  @Output() uploaded = new EventEmitter();
  @ViewChild('attachment') attachment;
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('addCancelComment') addCancelComment;

  tabControl: TabModel[] = [];
  formModelEmployee;
  user: any;
  itemDetailStt;
  itemDetailDataStt;
  // gridViewSetup: any = {};
  knowType = {
    type1: ['N20', 'N22', 'N23', 'N24', 'N25', 'N26', 'N35'],
    type2: ['N21'],
    type3: ['N31'],
    type4: ['N33'],
    type5: ['N34'],
  };
  groupKowTypeView: any;
  showInfoDayoffType = false;

  ngOnInit(): void {
    this.itemDetailStt = 1;
    this.itemDetailDataStt = 1;
    // if (this.formModel) {
    //   this.cache
    //     .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
    //     .subscribe((res) => {
    //       if (res) this.gridViewSetup = res;
    //     });
    // }

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
      // { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
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

  // changeDataMF(e: any, data: any) {
  //   this.hrService.handleShowHideMF(e, data, this.view);
  // }

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
    if (this.itemDetail?.kowID) {
      this.showInfoDayoffType = false;
      for (let i in this.groupKowTypeView) {
        this.groupKowTypeView[i].isShow = this.groupKowTypeView[
          i
        ].value.includes(this.itemDetail?.kowID);

        if (
          this.groupKowTypeView[i].value.includes(this.itemDetail?.kowID) ==
          true
        ) {
          this.showInfoDayoffType = true;
        }
      }
      // for (let i in this.groupKowTypeView) {
      //   this.groupKowTypeView[i].isShow = this.groupKowTypeView[
      //     i
      //   ].value.includes(this.itemDetail['kowID']);
      // }
    } else this.getGroupKowTypeView();
  }
}
