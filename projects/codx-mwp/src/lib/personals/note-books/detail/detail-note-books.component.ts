import { ActivatedRoute } from '@angular/router';
import {
  ViewsComponent,
  ButtonModel,
  UIComponent,
  ViewType,
  CodxGridviewComponent,
  DialogRef,
  DialogModel,
  NotificationsService,
  ViewModel,
} from 'codx-core';
import {
  Component,
  TemplateRef,
  ViewChild,
  OnDestroy,
  Injector,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { PopupAddUpdate } from './popup-add-update/popup-add-update.component';
import { A } from '@angular/cdk/keycodes';
@Component({
  selector: 'app-detail-note-books',
  templateUrl: './detail-note-books.component.html',
  styleUrls: ['./detail-note-books.component.scss'],
})
export class DetailNoteBooksComponent extends UIComponent {
  @Input() views: ViewModel[] = [];

  recID: any;
  data: any;
  item: any;
  columnsGrid;
  predicate = 'TransID=@0 && IsNote = false';
  dataValue = '';
  button?: ButtonModel[];
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

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private change: ChangeDetectorRef,
    private notifySvr: NotificationsService
  ) {
    super(injector);
    
  }

  onInit(): void {
    this.button = [{
      id: 'btnAdd',
    }];
    this.route.params.subscribe((params) => {
      if(params){
        this.funcID = params['funcID'];
        this.cache.functionList(this.funcID)
        .subscribe((res) => {
          if (res) {
            this.functionList.formName = res.formName;
            this.functionList.gridViewName = res.gridViewName;
            this.functionList.entityName = res.entityName;
          }
        });
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
    this.cache.gridViewSetup('Notes', 'grvNotes')
    .subscribe((res) => {
      debugger
      if (res) {
        this.gridViewSetup = res;
      }
    });
    this.getQueryParams();

  }

  ngAfterViewInit(): void {
    // this.columnsGrid = [
    //   {
    //     field: 'title',
    //     headerText: this.gridViewSetup.Title.headerText,
    //     template: '',
    //   },
    //   {
    //     field: 'tags',
    //     headerText: this.gridViewSetup.Tags.headerText,
    //     template: this.tags,
    //   },
    //   {
    //     field: 'memo',
    //     headerText: this.gridViewSetup.Memo.headerText,
    //     template: this.memo,
    //   },
    //   {
    //     field: 'attachments',
    //     headerText: this.gridViewSetup.Attachments.headerText,
    //     template: this.fileCount,
    //   },
    //   {
    //     field: 'createdOn',
    //     headerText: this.gridViewSetup.CreatedOn.headerText,
    //     template: this.createdOn,
    //   },
    //   {
    //     field: 'modifiedOn',
    //     headerText: this.gridViewSetup.ModifiedOn.headerText,
    //     template: this.modifiedOn,
    //   },
    // ];
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        id: '1',
        active: true,
        model: {
          hideMoreFunc:true,
        },
      },
      {
        sameData: true,
        id: '2',
        type: ViewType.list,
        active: false,
        model: {
          template: this.listView,
          hideMoreFunc:true,
        },
      },
    ];
    this.change.detectChanges();
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
    if (e?.text) this.headerText = e.text;
    var obj = [
      {
        data: this.view.dataService.data,
        type: 'add',
        parentID: this.recID,
        headerText: this.headerText,
      },
    ];
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new DialogModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      this.dialog = this.callfc.openForm(
        PopupAddUpdate,
        '',
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
        headerText: this.headerText,
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
        let dialog = this.callfc.openForm(
          PopupAddUpdate,
          '',
          1438,
          775,
          '',
          obj,
          '',
          option
        );
        dialog.closed.subscribe((res) => {
          this.view.dataService.update(res.update).subscribe();
        });
      });
  }

  delete(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (option: any) =>
        this.beforeDelete(option, this.view.dataService.dataSelected)
      )
      .subscribe((res: any) => {
        if (res) {
          this.view.dataService.remove(res).subscribe();
          this.api
            .execSv(
              'DM',
              'ERM.Business.DM',
              'FileBussiness',
              'DeleteListFileByListObjectIDAsync',
              [res.recID,true,null]
            )
            .subscribe(res => {
            });
        }
      });
  }

  beforeDelete(op: any, data) {
    op.assemblyName = 'ERM.Business.WP';
    op.className = 'NotesBusiness';
    op.methodName = 'DeleteNoteAsync';
    op.data = data.recID;
    return true;
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res: any) => {
      if (res) {
        var obj = [
          {
            data: res,
            type: 'copy',
            parentID: this.recID,
            headerText: this.headerText,
          },
        ];
      }
      let option = new DialogModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      this.dialog = this.callfc.openForm(
        PopupAddUpdate,
        '',
        1438,
        775,
        '',
        obj,
        '',
        option
      );
    });
  }
  onSearch(e) {
    this.lstGrid.onSearch(e);
    this.detectorRef.detectChanges();
  }

  headerText = '';
  clickMF(e, data) {
    this.headerText = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }
}
