import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
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
  selector: 'codx-view2',
  templateUrl: './codx-view2.component.html',
  styleUrls: ['./codx-view2.component.css'],
})
export class CodxView2Component implements OnInit, AfterViewInit {
  @Input() tmpRightToolBar?: TemplateRef<any>;
  @Input() tmpHeader?: TemplateRef<any> = null;
  @Input() tmpItem?: TemplateRef<any>;

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
  @Input() viewActive = '1';
  @Input() isAdd: boolean = true;
  @Input() isToolBar: boolean = true;
  @Input() dataRequest: any;
  @Output() btnClick = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() selectedChange = new EventEmitter();
  @Output() viewChange = new EventEmitter();
  request: DataRequest;
  viewList: Array<ViewModel> = [];
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
      if (document.getElementById('codx-view2-body'))
        document.getElementById('codx-view2-body').style.cssText =
          'height:' + height + 'px !important';
    } else {
      if (document.getElementById('codx-view2-body'))
        document.getElementById('codx-view2-body').style.cssText =
          'height:auto';
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
    this.viewList = [
      {
        id: '1',
        type: ViewType.card,
        active: true,
        sameData: true,
      },
      {
        id: '2',
        type: ViewType.list,
        active: false,
        sameData: true,
      },
    ];

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
        if (this.service.includes('rpt')) this.dataSource = item;
        else this.dataSource = item[0];
        this.dataChange.emit(this.dataSource);
      }
    });
  }

  fetch(): Observable<any> {
    return this.api.execSv(
      this.service,
      this.assemblyName,
      this.className,
      this.method,
      this.dataRequest ? this.dataRequest : this.request
    );
  }

  onSearch(e: any) {}

  viewChanged(e: any) {
    this.acitveMenuView(e);
  }

  acitveMenuView(view: ViewModel) {
    let that = this;
    this.viewList?.filter(function (v) {
      if (v.type == view.type) {
        v.active = true;
        that.viewActive = v.id;
        that.viewChange.emit(v.id);
      } else v.active = false;
    });
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
  selectedItem(e: any) {
    this.selectedChange.emit(e);
  }
}
