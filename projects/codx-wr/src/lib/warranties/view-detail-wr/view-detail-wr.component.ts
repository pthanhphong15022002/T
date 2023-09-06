import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  NotificationsService,
} from 'codx-core';
import { CodxWrService } from '../../codx-wr.service';
import { ViewTabUpdateComponent } from './view-tab-update/view-tab-update.component';

@Component({
  selector: 'codx-view-detail-wr',
  templateUrl: './view-detail-wr.component.html',
  styleUrls: ['./view-detail-wr.component.css'],
})
export class ViewDetailWrComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataSelected: any;
  @Input() funcID = 'WR0101';
  @Input() gridViewSetup: any;
  @Input() entityName = '';
  @Input() listRoles = [];

  @ViewChild('viewUpdate') viewUpdate: ViewTabUpdateComponent;
  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();

  user: any;
  treeTask = [];

  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      template: null,
    },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      template: null,
    },
    {
      name: 'Task',
      textDefault: 'Công việc',
      isActive: false,
      template: null,
    },
    {
      name: 'References',
      textDefault: 'Liên kết',
      isActive: false,
      template: null,
    },
  ];

  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private wrSv: CodxWrService,
    private api: ApiHttpService,
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService
  ) {
    this.user = this.authstore.get();
  }

  ngOnInit(): void {}

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }

  listOrderUpdate(lstUpdate) {
    this.viewUpdate.lstUpdate = JSON.parse(JSON.stringify(lstUpdate));
    this.changeDetectorRef.detectChanges();
  }

  getIcon($event) {
    if ($event == '1') {
      return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
    } else if ($event == '5') {
      return this.listRoles.filter((x) => x.value == '5')[0]?.icon ?? null;
    } else if ($event == '3') {
      return this.listRoles.filter((x) => x.value == '3')[0]?.icon ?? null;
    }
    return this.listRoles.filter((x) => x.value == '1')[0]?.icon ?? null;
  }
}
