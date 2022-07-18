import { ActivatedRoute } from '@angular/router';
import { ViewsComponent, CodxService, CallFuncService, ApiHttpService, ButtonModel, UIComponent, ViewType, CodxGridviewComponent, SidebarModel, DialogRef, DialogModel } from 'codx-core';
import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, OnDestroy, Injector } from '@angular/core';
import { LayoutModel } from '@shared/models/layout.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { PopupAddUpdate } from '../popup-add-update/popup-add-update.component';
@Component({
  selector: 'app-detail-note-books',
  templateUrl: './detail-note-books.component.html',
  styleUrls: ['./detail-note-books.component.scss']
})
export class DetailNoteBooksComponent extends UIComponent implements OnInit {

  views = [];
  recID: any;
  data: any;
  item: any;
  columnsGrid;
  funcID = '';
  predicate = 'TransID=@0';
  dataValue = '';
  button?: ButtonModel;
  formModel: any = '';
  itemSelected: any;
  dialog!: DialogRef;

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('lstGrid') lstGrid: CodxGridviewComponent;
  @ViewChild('iconMoreFunc', { static: true }) iconMoreFunc;
  @ViewChild('memo', { static: true }) memo;
  @ViewChild('tag', { static: true }) tag;
  @ViewChild('createdOn', { static: true }) createdOn;
  @ViewChild('modifiedOn', { static: true }) modifiedOn;

  constructor(private injector: Injector,
    private changedt: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
    super(injector);
    this.route.params.subscribe(params => {
      this.funcID = params['funcID'];
    })

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
      template: '',
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
    {
      field: '',
      headerText: 'Chức năng',
      template: this.iconMoreFunc,
      width: 150
    },
    ];
  }

  ngAfterViewInit(): void {
    this.formModel = this.view?.formModel;
    debugger;
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
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      this.view.dataService.data.pop();
      this.dialog = this.callfc.openForm(PopupAddUpdate,
        'Thêm mới ghi chú', 1438, 775, '', [this.view.dataService.data, 'add'], '', option
      );
      this.dialog.closed.subscribe(x => {
        this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
      });
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
    if (data) {
      this.view.dataService.dataSelected = data;
    }

    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      this.dialog = this.callfc.openForm(PopupAddUpdate,
        'Thêm mới ghi chú', 1438, 775, '', [this.view.dataService.dataSelected, 'edit'], '', option
      );
      // this.dialog.closed.subscribe(x => {
      //   this.view.dataService.update(this.view.dataService.dataSelected).subscribe();
      // });
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
          this.view.dataService.data = this.view.dataService.data.filter(x => x.recID != data.recID)
          this.changedt.detectChanges();
        }
      });
  }


  onSearch(e) {
    this.lstGrid.onSearch(e);
    this.changedt.detectChanges();
  }

}
