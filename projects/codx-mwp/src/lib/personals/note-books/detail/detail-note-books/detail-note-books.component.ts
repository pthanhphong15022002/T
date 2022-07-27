import { CodxShareService } from './../../../../../../../codx-share/src/lib/codx-share.service';
import { CodxMwpService } from 'projects/codx-mwp/src/public-api';
import { ActivatedRoute } from '@angular/router';
import { ViewsComponent, CodxService, CallFuncService, ApiHttpService, ButtonModel, UIComponent, ViewType, CodxGridviewComponent, SidebarModel, DialogRef, DialogModel, CacheService } from 'codx-core';
import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, OnDestroy, Injector } from '@angular/core';
import { LayoutModel } from '@shared/models/layout.model';
import { PopupAddUpdate } from '../popup-add-update/popup-add-update.component';
@Component({
  selector: 'app-detail-note-books',
  templateUrl: './detail-note-books.component.html',
  styleUrls: ['./detail-note-books.component.scss'],
  providers: [CodxShareService]
})
export class DetailNoteBooksComponent extends UIComponent implements OnDestroy {

  views = [];
  recID: any;
  data: any;
  item: any;
  columnsGrid;
  funcID = '';
  predicate = 'TransID=@0';
  dataValue = '';
  button?: ButtonModel;
  itemSelected: any;
  dialog!: DialogRef;
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  }
  gridViewSetup = {
    entityName: '',
    service: '',
    assemblyName: '',
    className: '',
  }

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('lstGrid') lstGrid: CodxGridviewComponent;
  @ViewChild('memo', { static: true }) memo;
  @ViewChild('tag', { static: true }) tag;
  @ViewChild('createdOn', { static: true }) createdOn;
  @ViewChild('modifiedOn', { static: true }) modifiedOn;
  @ViewChild('fileCount', { static: true }) fileCount;

  constructor(injector: Injector,
    private route: ActivatedRoute,
    private codxShareService: CodxShareService
  ) {
    super(injector);
    this.route.params.subscribe(params => {
      if (params)
        this.funcID = params['funcID'];
    })

    this.cache.functionList(this.funcID).subscribe(res => {
      if (res) {
        this.functionList.formName = res.formName;
        this.functionList.gridViewName = res.gridViewName;
        this.functionList.entityName = res.entityName;
      }
    })
    this.codxShareService.hideAside.next(false);
  }
  ngOnDestroy(): void {
    this.codxShareService.hideAside.next(true);
  }

  onInit(): void {
    this.getQueryParams();

    this.button = {
      id: 'btnAdd',
    };

    this.columnsGrid = [{
      field: 'title',
      headerText: 'Tiêu đề',
      template: '',
      width: 150
    },
    {
      field: 'Tag#',
      headerText: 'Tag#',
      template: this.tag,
      width: 100
    },
    {
      field: 'memo',
      headerText: 'Chi tiết',
      template: this.memo,
      innerWidth: 200
    },
    {
      field: 'Đính kèm',
      headerText: 'Đính kèm',
      template: this.fileCount,
      width: 100
    },
    {
      field: 'createdOn',
      headerText: 'Ngày tạo',
      template: this.createdOn,
      width: 150
    },
    {
      field: 'modifiedOn',
      headerText: 'Ngày cập nhật',
      template: this.modifiedOn,
      width: 150
    },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.grid,
      sameData: true,
      active: true,
      model: {
        resources: this.columnsGrid,
      }
    }];
  }

  getQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.recID = params.recID;
        this.dataValue = this.recID;
      }
    });
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  openFormCreateDetail(e) {
    var obj = [{
      data: this.view.dataService.data,
      type: 'add',
      parentID: this.recID,
    }]

    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      this.dialog = this.callfc.openForm(PopupAddUpdate,
        'Thêm mới ghi chú', 1438, 775, '', obj, '', option
      );
    });
  }


  onSelected(e) {
    this.data = e.datas;
  }

  openFormMoreFunc(e) {
    if (e) {
      this.item = e;
    }
  }

  edit(data) {
    var obj = [{
      data: data,
      type: 'edit',
      parentID: this.recID,
    }]

    if (data) {
      this.view.dataService.dataSelected = data;
    }

    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      this.dialog = this.callfc.openForm(PopupAddUpdate,
        'Thêm mới ghi chú', 1438, 775, '', obj, '', option
      );
    });
  }

  delete(data) {
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'DeleteNoteAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.remove(res).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  onSearch(e) {
    this.lstGrid.onSearch(e);
    this.detectorRef.detectChanges();
  }
}
