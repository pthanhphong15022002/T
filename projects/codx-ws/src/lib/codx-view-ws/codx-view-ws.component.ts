import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  DataRequest,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'lib-codx-view-ws',
  templateUrl: './codx-view-ws.component.html',
  styleUrls: ['./codx-view-ws.component.css'],
})
export class CodxViewWsComponent {
  @Input() tmpRightToolBar?: TemplateRef<any>;
  @Input() tmpHeader?: TemplateRef<any> = null;
  @Input() tmpItem?: TemplateRef<any>;
  @Input() itemTemplateList: TemplateRef<any>;
  @Input() service!: string;
  @Input() assemblyName = 'ERM.Business.Core';
  @Input() className = 'DataBusiness';
  @Input() method = 'LoadDataAsync';
  @Input() predicate: string = '';
  @Input() dataValue: string = '';
  @Input() predicates: string = '';
  @Input() dataValues: string = '';
  @Input() entityName: string = '';
  @Input() formName: string = '';
  @Input() gridViewName: string = '';
  @Input() idFeild = 'recID';
  @Input() dataSource: any;
  @Input() bodyCss: any;
  @Input() modeView: any;
  @Input() isAdd: boolean = true;
  @Output() btnClick = new EventEmitter();
  request: DataRequest;
  @Input() viewList: Array<ViewModel> = [];
  fMoreFuncs: ButtonModel[];
  constructor(
    private ref: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService
  ) {
    this.request = new DataRequest();
    this.request.page = 1;
    this.request.pageSize = 20;
  }
  ngAfterViewInit(): void {
    const elem = document.querySelector('#view2-header');
    if (elem) new ResizeObserver(this.setHeight).observe(elem);
  }

  setHeight() {
    if (!document.getElementById('view2-header')) return;

    var h = document.getElementById('view2-header').offsetHeight;

    if (h > 0) {
      h += 90;
      let height = window.innerHeight - h;
      document.getElementById('codx-view2-body').style.cssText =
        'height:' + height + 'px !important';
    } else {
      document.getElementById('codx-view2-body').style.cssText = 'height:auto';
    }
  }

  ngOnInit(): void {
    this.request.predicate = this.predicate;
    this.request.dataValue = this.dataValue;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.dataValues;
    this.request.entityName = this.entityName;
    this.request.gridViewName = this.gridViewName;
    this.request.formName = this.formName;
    if (this.viewList == null || this.viewList.length == 0) {
      this.viewList = [
        {
          id: '1',
          type: ViewType.card,
          active: true,
          sameData: true,
        },
      ];
      this.modeView = 4;
    } else {
      this.viewList.forEach((view) => {
        if (this.modeView == view.type) {
          view.active = true;
        } else {
          if (view.active) this.modeView = view.type;
        }
      });
    }

    this.fMoreFuncs = [
      {
        id: 'id-select-multi',
        formName: 'System',
        text: 'Chọn nhiều dòng',
        disabled: false,
      },
      // {
      //   id: 'id-refresh',
      //   formName: 'System',
      //   text: 'Làm mới',
      //   disabled: true,
      // },
      {
        id: 'id-codx-open-setting',
        formName: 'System',
        text: 'Thiết lập',
        disabled: false,
      },
    ];

    if (!this.dataSource) this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['dataSource'] &&
      changes['dataSource']?.currentValue !=
        changes['dataSource']?.previousValue
    ) {
      this.dataSource = changes['dataSource']?.currentValue;
      if (!this.dataSource) this.loadData();
    }
  }

  loadData() {
    this.fetch().subscribe((item: any) => {
      if (item && item.length > 0) {
        this.dataSource = item[0];
      }
    });
  }

  fetch(): Observable<any> {
    return this.api.execSv(
      this.service,
      this.assemblyName,
      this.className,
      this.method,
      this.request
    );
  }

  onSearch(e: any) {}

  viewChanged(e: any) {
    if (e?.type != this.modeView) {
      this.modeView = e?.type;
      this.viewList?.filter(function (v) {
        if (v.type == e.type) v.active = true;
        else v.active = false;
      });
      this.ref.detectChanges();
    }
  }

  sortChanged(e: any) {}

  clickToolbarMore(e: any) {}

  addClick() {
    this.btnClick.emit();
  }

  addDataSource(data: any) {
    if (!this.dataSource) this.dataSource = [];
    this.dataSource.push(data);
    this.ref.detectChanges();
  }

  updateDataSource(data: any) {
    if (data[this.idFeild]) {
      var index = this.dataSource.filter(
        (x) => x[this.idFeild] == data[this.idFeild]
      );
      if (index >= 0) this.dataSource[index] = data;
    }
    this.ref.detectChanges();
  }

  deleteDataSource(data: any) {
    if (data[this.idFeild])
      this.dataSource = this.dataSource.filter(
        (x) => x[this.idFeild] != data[this.idFeild]
      );
    this.ref.detectChanges();
  }
}
