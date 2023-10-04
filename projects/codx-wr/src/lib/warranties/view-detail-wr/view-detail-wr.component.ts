import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
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
  @ViewChild('problem', { read: ElementRef }) memo: ElementRef<HTMLElement>;

  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() updateComment = new EventEmitter<any>();
  @Output() updateAssignEngineerEmit = new EventEmitter<any>();

  user: any;
  treeTask = [];
  expanding = false;
  overflowed: boolean = false;
  id: any;
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
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.user = this.authstore.get();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null &&
        changes['dataSelected'].currentValue?.recID
      ) {
        if (changes['dataSelected'].currentValue?.recID == this.id) return;
        this.id = changes['dataSelected'].currentValue?.recID;
        this.expanding = false;
        this.overflowed = false;
      }
    }

  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memo?.nativeElement;
    this.overflowed = element?.scrollHeight > element?.clientHeight;
  }

  clickMF(e, data) {
    this.clickMoreFunc.emit({ e: e, data: data });
  }

  changeDataMF(e, data) {
    this.changeMoreMF.emit({ e: e, data: data });
  }

  updateCommentWarranty(e, data) {
    this.updateComment.emit({ e: e, data: data });
  }

  updateAssignEngineer(data) {
    this.updateAssignEngineerEmit.emit({ data: data });
  }

  listOrderUpdate(lstUpdate) {
    this.viewUpdate.lstUpdate = JSON.parse(JSON.stringify(lstUpdate));
    this.changeDetectorRef.detectChanges();
  }

  getIcon($event) {
    if ($event == 'O') {
      return this.listRoles.filter((x) => x.value == 'O')[0]?.icon ?? null;
    } else if ($event == 'I') {
      return this.listRoles.filter((x) => x.value == 'I')[0]?.icon ?? null;
    } else if ($event == 'F') {
      return this.listRoles.filter((x) => x.value == 'F')[0]?.icon ?? null;
    }
    return this.listRoles.filter((x) => x.value == 'O')[0]?.icon ?? null;
  }
}
