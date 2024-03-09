import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CodxService,
  DataRequest,
  PageTitleService,
  SortView,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'codx-view2',
  templateUrl: './codx-view2.component.html',
  styleUrls: ['./codx-view2.component.css'],
})
export class CodxView2Component implements OnInit {
  //#region Contructor
  @Input() funcID?: string;
  @Input() toolbarDisplay: boolean = true;
  @Input() tmpRightToolBar?: TemplateRef<any>;
  @Input() showHeader: boolean = true;
  @Input() showRightToolbar: boolean = true;
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
  @Input() showButton: boolean = true;
  @Input() isToolBar: boolean = true;
  @Input() dataRequest: any;
  
  @Input() hideMoreFuncs: boolean = false;
  @Input() showFilter: boolean = true;
  @Input() showSearchBar: boolean = true;
  @Input() toolbarMode: '1' | '2'| null = '2';
  @Input() titleToolBarTmp: TemplateRef<any> | null = null;
  @Input() button?: ButtonModel[];

  @Output() btnClick = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() selectedChange = new EventEmitter();
  @Output() viewChange = new EventEmitter();
  sortFields: SortView[] = [];
  request: DataRequest;
  views: Array<ViewModel> = [];
  moreFuncs: ButtonModel[];
  title: string = '';

  @HostBinding('class') class='d-flex flex-column w-100 h-100';
  
  constructor(
    private ref: ChangeDetectorRef,
    private codx: CodxService,
    private cache: CacheService,
    private api: ApiHttpService,
    private router: ActivatedRoute,
    private pageTitle: PageTitleService,
    private elRef: ElementRef,
  ) {
    this.request = new DataRequest();
    this.request.page = 1;
    this.request.pageSize = 20;
  }
  //#endregion
  //#region Init
  ngOnInit(): void {
    if(this.toolbarMode == '1')
      this.codx.setStyleToolbarLayout(this.elRef.nativeElement, 'toolbar1');
    else if(this.toolbarMode == '2')
      this.codx.setStyleToolbarLayout(this.elRef.nativeElement, 'toolbar2');
    else
      this.codx.setStyleToolbarLayout(this.elRef.nativeElement, null);

    this.request.predicate = this.predicate;
    this.request.dataValue = this.dataValue;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.dataValues;
    this.request.entityName = this.entityName;
    this.request.gridViewName = this.gridViewName;
    this.request.formName = this.formName;
    this.views = [
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

    this.moreFuncs = [
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

    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    if (this.funcID)
      this.api
        .exec('SYS', 'CommonBusiness', 'GetSettingFormAsync', [
          this.funcID,
          this.formName,
          this.gridViewName,
          this.entityName,
        ])
        .subscribe((res: any) => {
          if(!res || !res.func) return;

          this.cache.setFuncList(res.func.functionID, res.func);
          //this.pageTitle.setBreadcrumbs([]);
          this.pageTitle.setChildren([]);
          this.pageTitle.setFavs(null);
          this.pageTitle.setRootNode(res.func.customName);

          if (res.labels)
            this.cache.setFormLabel(res.func.formName, res.labels);

          if (res.viewSettings && res.viewSettings.length) {
            this.cache.setViewSetting(res.func.functionID, res.viewSettings);
            if (this.views && this.views.length > 0) {
              this.views?.filter(function (o) {
                var v = res.viewSettings?.find(
                  (x) => x.view == o.type.toString()
                );
                if (v) {
                  o.active = v.isDefault;
                  o.hide = false;
                } else {
                  o.hide = true;
                  o.active = false;
                }
              });
              let active = this.views.find(
                (x) => x.active == true && !x.hide
              );
              this.acitveMenuView(active);
            }

            if (res.gridViews) {
              this.cache.setGridView(res.func.gridViewName, res.gridViews);
              //this.gridView = this.dataService.gridView = res.gridViews;
            }

            if (res.gridViewSetups) {
              //this.gridViewSetup = res.gridViewSetups;
              this.cache.setGridViewSetup(
                res.func.formName,
                res.func.gridViewName,
                res.gridViewSetups
              );
  
              this.sortFields = [];
              Object.keys(res.gridViewSetups).forEach((n) => {
                let grv = res.gridViewSetups[n];
                if (grv.allowSort) {
                  let oText = res.labels ? res.labels[grv.fieldName] : undefined;
                  let text = oText ? oText.customName : grv.headerText;
                  let active =
                    grv.fieldName.toLowerCase() ==
                    res.gridViews?.sortColumns?.toLowerCase();
                  let dir = active && res.gridViews?.sortDirections == 'asc';
  
                  this.sortFields.push({
                    field: grv.fieldName,
                    text: text,
                    active: active,
                    dir: dir ? 'asc' : 'desc',
                  });
                }
              });
            }
          }
        });
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

  // setHeight() {
  //   if (!document.getElementById('view2-header')) return;

  //   var h = document.getElementById('view2-header').offsetHeight;

  //   if (h > 0) {
  //     h += 90;
  //     let height = window.innerHeight - h;
  //     if (document.getElementById('codx-view2-body'))
  //       document.getElementById('codx-view2-body').style.cssText =
  //         'height:' + height + 'px !important';
  //   } else {
  //     if (document.getElementById('codx-view2-body'))
  //       document.getElementById('codx-view2-body').style.cssText =
  //         'height:auto';
  //   }
  // }
  //#endregion

  //#region Func
  onSearch(val: string) {
    this.request.searchText = val;
    this.loadData();
  }

  viewChanged(e: any) {
    this.acitveMenuView(e);
  }

  acitveMenuView(view: ViewModel) {
    let that = this;
    this.views?.filter(function (v) {
      if (v.type == view.type) {
        v.active = true;
        that.viewActive = v.id;
        that.viewChange.emit(v.id);
      } else v.active = false;
    });
  }
  sortChanged(e: any) {}

  clickToolbarMore(e: any) {}

  clickButton(event: any) {
    this.btnClick.emit(event);
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

  //#endregion
}
