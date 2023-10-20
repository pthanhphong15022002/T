import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  FormModel,
  UIComponent,
  ViewsComponent,
} from 'codx-core';
import moment from 'moment';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-view-detail-ot',
  templateUrl: './view-detail-ot.component.html',
  styleUrls: ['./view-detail-ot.component.css'],
})
export class ViewDetailOtComponent {
  tabControl: TabModel[] = [];

  @Input() recID;
  @Input() view: ViewsComponent;
  @Input() itemDetail: any;
  @Input() grvSetup;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Input() formModel?: FormModel;
  @Input() showMoreFunc?: any;
  @Input() itemSelected?: any;

  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();

  formName = 'TimeKeepingRequestOT';
  entityName = 'PR_TimeKeepingRequest';
  gridViewName = 'grvTimeKeepingRequestOT';
  private destroy$ = new Subject<void>();

  constructor(private df: ChangeDetectorRef, 
    private api: ApiHttpService,
    public sanitizer: DomSanitizer
    ) {}

  ngOnInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];

    // this.hrService.getFormModel('HRT03a1').then((res) => {
    //   if (res) {
    //     this.formModelEmployee = res;
    //   }
    // });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit', this.recID);
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges', this.recID);
    // if (this.recID && !this.itemSelected) {
    //   this.loadData();
    // }
  }

  // changeDataMF(e: any, data: any) {
  //   this.hrService.handleShowHideMF(e, data, this.formModel);

  //   var funcList = this.codxODService.loadFunctionList(
  //     this.view.formModel.funcID
  //   );
  //   if (isObservable(funcList)) {
  //     funcList.subscribe((fc) => {
  //       this.changeDataMFBefore(e, data, fc);
  //     });
  //   } else this.changeDataMFBefore(e, data, funcList);
  // }

  // changeDataMFBefore(e: any, data: any, fc: any) {
  //   if (fc.runMode == '1') {
  //     this.shareService.changeMFApproval(e, data?.unbounds);
  //   }
  // }

  loadData() {
    this.api
      .exec<any>('PR', 'TimeKeepingRequest', 'GetByRecIDAsync', this.recID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        console.log(res);
      });
  }
  clickMF(evt: any, data: any = null) {
    this.clickMoreFunction.emit({ event: evt, data: data });
  }
  changeDataMF(e, data) {
    this.changeMF.emit({ e: e, data: data });
  }
  getHour(data) {
    if (data) {
      return moment(data).format('HH : mm');
    } else {
      return null;
    }
  }
}
