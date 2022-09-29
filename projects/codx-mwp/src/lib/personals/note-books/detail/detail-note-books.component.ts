import { ActivatedRoute } from '@angular/router';
import {
  ViewsComponent,
  ButtonModel,
  UIComponent,
  ViewType,
  CodxGridviewComponent,
  DialogRef,
  DialogModel,
} from 'codx-core';
import {
  Component,
  TemplateRef,
  ViewChild,
  OnDestroy,
  Injector,
  Input,
} from '@angular/core';
import { PopupAddUpdate } from './popup-add-update/popup-add-update.component';
@Component({
  selector: 'app-detail-note-books',
  templateUrl: './detail-note-books.component.html',
  styleUrls: ['./detail-note-books.component.scss'],
})
export class DetailNoteBooksComponent extends UIComponent {
  @Input() views: any = [];

  recID: any;
  data: any;
  item: any;
  columnsGrid;
  funcID = '';
  predicate = 'TransID=@0 && IsNote = false';
  dataValue = '';
  button?: ButtonModel;
  itemSelected: any;
  dialog!: DialogRef;
  functionList = {
    formName: '',
    gridViewName: '',
    entityName: '',
  };
  editMF: any;
  deleteMF: any;
  pinMF: any;
  saveMF: any;
  gridViewSetup: any;

  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('listView') listView: TemplateRef<any>;
  @ViewChild('lstGrid') lstGrid: CodxGridviewComponent;
  @ViewChild('list') list: TemplateRef<any>;
  @ViewChild('memo', { static: true }) memo;
  @ViewChild('tags', { static: true }) tags;
  @ViewChild('createdOn', { static: true }) createdOn;
  @ViewChild('modifiedOn', { static: true }) modifiedOn;
  @ViewChild('fileCount', { static: true }) fileCount;

  constructor(injector: Injector, private route: ActivatedRoute) {
    super(injector);
    this.route.params.subscribe((params) => {
      if (params) this.funcID = params['funcID'];
    });

    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionList.formName = res.formName;
        this.functionList.gridViewName = res.gridViewName;
        this.functionList.entityName = res.entityName;
      }
    });
    this.cache
      .moreFunction('PersonalNotes', 'grvPersonalNotes')
      .subscribe((res) => {
        if (res) {
          this.editMF = res[2];
          this.deleteMF = res[3];
          this.pinMF = res[0];
          this.saveMF = res[1];
        }
      });
    this.cache.gridViewSetup('Notes', 'grvNotes').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {
    this.getQueryParams();

    this.button = {
      id: 'btnAdd',
    };

    this.columnsGrid = [
      {
        field: 'title',
        headerText: 'Tiêu đề',
        template: '',
        width: 300,
      },
      {
        field: 'Tag#',
        headerText: 'Tag#',
        template: this.tags,
        width: 200,
      },
      {
        field: 'memo',
        headerText: 'Chi tiết',
        template: this.memo,
        innerWidth: 200,
      },
      {
        field: 'Đính kèm',
        headerText: 'Đính kèm',
        template: this.fileCount,
        width: 100,
      },
      {
        field: 'createdOn',
        headerText: 'Ngày tạo',
        template: this.createdOn,
        width: 150,
      },
      {
        field: 'modifiedOn',
        headerText: 'Ngày cập nhật',
        template: this.modifiedOn,
        width: 150,
      },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        id: '1',
        active: true,
        model: {
          resources: this.columnsGrid,
        },
      },
      {
        sameData: true,
        id: '2',
        type: ViewType.list,
        active: false,
        model: {
          template: this.listView,
        },
      },
    ];
  }

  getQueryParams() {
    this.route.queryParams.subscribe((params) => {
      if (params) {
        this.recID = params.recID;
        this.dataValue = this.recID;
      }
    });
  }

  openFormCreateDetail(e) {
    var obj = [
      {
        data: this.view.dataService.data,
        type: 'add',
        parentID: this.recID,
      },
    ];

    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      this.dialog = this.callfc.openForm(
        PopupAddUpdate,
        'Thêm mới ghi chú',
        1438,
        775,
        '',
        obj,
        '',
        option
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
    var obj = [
      {
        data: data,
        type: 'edit',
        parentID: this.recID,
      },
    ];

    if (data) {
      this.view.dataService.dataSelected = data;
    }

    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new DialogModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        this.dialog = this.callfc.openForm(
          PopupAddUpdate,
          'Thêm mới ghi chú',
          1438,
          775,
          '',
          obj,
          '',
          option
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
          this.api
            .execSv(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'DeleteByObjectIDAsync',
              [data.recID, 'WP_Notes', true]
            )
            .subscribe();
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
