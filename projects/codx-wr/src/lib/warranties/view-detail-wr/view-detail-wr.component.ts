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
  CodxService,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxWrService } from '../../codx-wr.service';
import { ViewTabUpdateComponent } from './view-tab-update/view-tab-update.component';
import { PopupSerProductComponent } from './popup-ser-product/popup-ser-product.component';

@Component({
  selector: 'codx-view-detail-wr',
  templateUrl: './view-detail-wr.component.html',
  styleUrls: ['./view-detail-wr.component.scss'],
})
export class ViewDetailWrComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataSelected: any;
  @Input() funcID = 'WR0101';
  @Input() gridViewSetup: any;
  @Input() entityName = '';
  @Input() listRoles = [];
  @Input() isDbClick: boolean = false;
  @Input() asideMode: string;
  @ViewChild('viewUpdate') viewUpdate: ViewTabUpdateComponent;
  @ViewChild('problem', { read: ElementRef }) memo: ElementRef<HTMLElement>;

  @Output() changeMoreMF = new EventEmitter<any>();
  @Output() clickMoreFunc = new EventEmitter<any>();
  @Output() updateComment = new EventEmitter<any>();
  @Output() updateAssignEngineerEmit = new EventEmitter<any>();
  @Output() changeProducts = new EventEmitter<any>();

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
      textDefault: 'XML File',
      isActive: false,
      template: null,
    },
  ];
  isShow = false;
  contact2JSON: any;
  constructor(
    private authstore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private callFc: CallFuncService,
    private api: ApiHttpService
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
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        if (this.dataSelected?.extendInfo && this.dataSelected?.extendInfo?.trim() != ''){
          this.contact2JSON = JSON.parse(this.dataSelected?.extendInfo);
          console.log(JSON.parse(this.dataSelected?.extendInfo));
        }
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
    this.updateAssignEngineerEmit.emit({ data: data, type: 'engineerID' });
  }

  updateServiceLocator(data) {
    this.updateAssignEngineerEmit.emit({ data: data, type: 'serviceLocator' });
  }

  listOrderUpdate(lstUpdate) {
    if (this.viewUpdate) {
      this.viewUpdate.lstUpdate = JSON.parse(JSON.stringify(lstUpdate));
      this.changeDetectorRef.detectChanges();
    }
  }

  getIcon($event) {
    return this.listRoles.find((x) => x.value == $event)?.icon ?? null;
  }

  editProduct(data) {
    this.changeProducts.emit({ data: data });
  }
}
