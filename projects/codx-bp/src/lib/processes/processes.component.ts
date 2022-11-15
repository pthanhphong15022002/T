import { I } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataRequest } from '@shared/models/data.request';
import {
  AuthStore,
  ButtonModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subject } from 'rxjs';
import { CodxBpService } from '../codx-bp.service';
import { BP_Processes } from '../models/BP_Processes.model';
import { BP_ProcessesPageSize } from '../models/BP_Processes.modelPageSize';
import { PropertiesComponent } from '../properties/properties.component';
import { PopupAddPermissionComponent } from './popup-add-permission/popup-add-permission.component';
import { PopupAddProcessesComponent } from './popup-add-processes/popup-add-processes.component';
import { PopupRolesComponent } from './popup-roles/popup-roles.component';
import { PopupUpdateRevisionsComponent } from './popup-update-revisions/popup-update-revisions.component';
import { RevisionsComponent } from './revisions/revisions.component';

@Component({
  selector: 'lib-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css'],
})
export class ProcessesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('itemProcessName', { static: true })
  itemProcessName: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true })
  itemOwner: TemplateRef<any>;
  @ViewChild('itemVersionNo', { static: true })
  itemVersionNo: TemplateRef<any>;
  @ViewChild('itemActivedOn', { static: true }) itemActivedOn: TemplateRef<any>;
  @ViewChild('templateListCard', { static: true })
  templateListCard: TemplateRef<any>;
  @ViewChild('templateSearch') templateSearch: TemplateRef<any>;
  @ViewChild('view') codxview!: any;
  @ViewChild('itemMemo', { static: true })
  itemMemo: TemplateRef<any>;
  @Input() showButtonAdd = true;
  @Input() dataObj?: any;
  dialog!: DialogRef;
  requestSearch: ResourceModel;
  titleAction = '';
  columnsGrid = [];
  textSearch: string;
  textSearchAll: string;
  data = [];
  isSearch = false;
  predicates: any;
  values: any;
  searchAdvance: boolean;
  viewActive: any;
  // titleUpdateFolder = 'Cập nhật thư mục';
  viewMode: any;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  user: any;
  funcID: any;
  itemSelected: any;
  dialogPopupReName: DialogRef;
  @ViewChild('viewReName', { static: true }) viewReName;
  @Input() process = new BP_Processes();
  newName = '';
  crrRecID = '';
  dataSelected: any;
  gridViewSetup: any;
  private searchKey = new Subject<any>();
  listProcess = new Array<BP_Processes>();
  totalRowCount: any;
  totalPages: number;
  gridModels = new DataRequest();
  listNumberPage = new Array();
  pageNumberDefault: 1;
  pageNumberCliked: number;
  pageNumberSearch: number;
  clickDisable: string;
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(inject);

    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cache.gridViewSetup('Processes', 'grvProcesses').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      { headerTemplate: this.itemProcessName, width: 300 },
      { headerTemplate: this.itemOwner, width: 300 },
      { headerTemplate: this.itemVersionNo, width: 100 },
      { headerTemplate: this.itemActivedOn, width: 150 },
      { headerTemplate: this.itemMemo, width: 300 },
      { field: '', headerText: '', width: 100 },
      { field: '', headerText: '', width: 100 },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          template: this.itemViewList,
        },
      },
      {
        id: '2',
        type: ViewType.card,
        sameData: true,
        active: true,
        hide: false,
        model: {
          template: this.templateListCard,
        },
      },
      {
        id: '4',
        icon: 'icon-search',
        text: 'Search',
        type: ViewType.card,
        active: true,
        sameData: false,
        // request: this.requestSearch,
        model: {
          panelRightRef: this.templateSearch,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddProcessesAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessesAsync';
    this.view.dataService.methodDelete = 'DeleteProcessesAsync';
    this.changeDetectorRef.detectChanges();
  }

  getGridModel() {
    this.gridModels.formName = this.view.formModel.formName;
    this.gridModels.entityName = this.view.formModel.entityName;
    this.gridModels.funcID = this.view.formModel.funcID;
    this.gridModels.gridViewName = this.view.formModel.gridViewName;
    this.gridModels.page =
      this.gridModels.page > 1
        ? this.gridModels.page
        : this.view.dataService.request.page;
    this.gridModels.pageSize = this.view.dataService.request.pageSize;
    this.gridModels.predicate = this.view.dataService.request.predicates;
    this.gridModels.dataValue = this.view.dataService.request.dataValues;
    this.gridModels.entityPermission = this.view.formModel.entityPer;
  }
  getHomeProcessSearch(pageClickNumber?: Number) {
    this.getGridModel();
    this.gridModels.dataValues = this.textSearch;
    this.bpService
      .searchDataProcess(this.gridModels, this.textSearch)
      .subscribe((res) => {
        if (res != null) {
          this.listProcess = res[0];
          this.totalRowCount = res[1];
          // test phân trang
          this.gridModels.pageSize = 1;
          this.totalPages = Math.ceil(
            this.totalRowCount / this.gridModels.pageSize
          );
          this.listNumberPage = Array(this.totalPages)
            .fill(0)
            .map((x, i) => i + 1);
          this.pageNumberCliked = this.gridModels.page;
        } else {
          this.listProcess = null;
        }
        this.changeDetectorRef.detectChanges();
      });
  }
  PageClick($event, pageNumClick: any) {
    this.pageNumberCliked = pageNumClick;
    this.gridModels.page = this.pageNumberCliked;
    this.getHomeProcessSearch();
  }
  nextPage($event) {
    this.pageNumberCliked = this.pageNumberCliked + 1;
    this.gridModels.page = this.pageNumberCliked;
    this.getHomeProcessSearch();
  }
  previousPage($event) {
    this.pageNumberCliked = this.pageNumberCliked - 1;
    this.gridModels.page = this.pageNumberCliked;
    this.getHomeProcessSearch();
  }
  firstPage($event) {
    this.pageNumberCliked = this.pageNumberDefault;
    this.gridModels.page = this.pageNumberCliked;
    this.getHomeProcessSearch();
  }
  lastPage($event) {
    this.pageNumberCliked = this.totalPages;
    this.gridModels.page = this.pageNumberCliked;
    this.getHomeProcessSearch();
  }

  searchChange($event) {
    try {
      this.textSearch = $event;
      this.searchKey.next($event);
      this.isSearch == true;
      if (this.textSearch == null || this.textSearch == '') {
        this.views.forEach((item) => {
          item.active = false;
          item.hide = false;
          if (item.text == 'Search') item.hide = true;
          if (item.text == this.viewActive.text) item.active = true;
        });
        this.changeDetectorRef.detectChanges();
      } else {
        this.isSearch = true;
        //     this.pageNumberCliked= this.pageNumberDefault;
        this.getHomeProcessSearch();
      }
    } catch (ex) {
      this.changeDetectorRef.detectChanges();
    }
  }

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddProcessesComponent,
        ['add', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
      });
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupAddProcessesComponent,
          ['edit', this.titleAction],
          option
        );
        this.dialog.closed.subscribe((e) => {
          console.log(e);
          if (e && e.event != null) {
            e?.event.forEach((obj) => {
              this.view.dataService.update(obj).subscribe();
            });
            this.detectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddProcessesComponent,
        ['copy', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
      });
    });
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteProcessesAsync';

    opt.data = itemSelected.recID;
    return true;
  }
  //#endregion

  //#region event
  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e.data);
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'BPT106':
        this.properties(data);
        break;
      case 'BPT101':
        this.viewDetailProcessSteps(e?.data, data);
        break;
      case 'BPT102':
        this.reName(data);
        break;
      case 'BPT103': // gán tạm cập nhật phiên bản
        //this.revisions(e.data, data);
        this.Updaterevisions(e.data,data);
        break;
      case 'BPT104':
        this.permission(data);
        break;
      case 'BPT105':
        this.share(data);
    }
  }

  properties(data?: any) {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    // let data = {} as any;
    // data.title = this.titleUpdateFolder;
    data.id = data.recID;
    this.callfc.openSide(PropertiesComponent, data, option);
  }

  reName(data) {
    this.dataSelected = data;
    this.newName = data.processName;
    this.crrRecID = data.recID;
    this.dialogPopupReName = this.callfc.openForm(this.viewReName, '', 500, 10);
  }

  Updaterevisions(more,data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }

    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '550px';
        this.dialog = this.callfc.openSide(
          PopupUpdateRevisionsComponent,
          [this.titleAction],
          option,
        );
        this.dialog.closed.subscribe();
      });
  }
  revisions(more, data) {
    var obj = {
      more: more,
      data: data,
    };
    this.dialog = this.callfc.openForm(
      RevisionsComponent,
      '',
      500,
      350,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  permission(data) {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    data.id = data.recID;
    this.callfc.openSide(
      PopupAddPermissionComponent,
      [this.titleAction, data, false],
      option
    );
  }

  roles(e: any) {
    console.log(e);
    this.callfc
      .openForm(
        PopupRolesComponent,
        '',
        950,
        650,
        '',
        [this.titleAction, e],
        ''
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  share(data) {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    // let data = {} as any;
    // data.title = this.titleUpdateFolder;
    data.id = data.recID;
    this.callfc.openSide(
      PopupAddPermissionComponent,
      [this.titleAction, data, true],
      option
    );
  }

  valueChange(e) {
    this.newName = e.data;
  }

  onSave() {
    if (this.newName.trim() == '' || this.newName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ProcessName'].headerText + '"'
      );
      return;
    }
    this.api
      .exec('BP', 'ProcessesBusiness', 'UpdateProcessNameAsync', [
        this.crrRecID,
        this.newName,
      ])
      .subscribe((res) => {
        if (res) {
          this.dataSelected.processName = this.newName;
          this.view.dataService.update(this.dataSelected).subscribe();
          this.notification.notifyCode('SYS007');
          this.changeDetectorRef.detectChanges();
        }
        this.dialogPopupReName.close();
      });
  }

  onDragDrop(e: any) {
    console.log(e);
  }

  convertHtmlAgency(position: any) {
    var desc = '<div class="d-flex">';
    if (position)
      desc +=
        '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="">' +
        position +
        '</span></div>';

    return desc + '</div>';
  }

  //#endregion

  //tesst
  viewDetailProcessSteps(e, data) {
    this.bpService.viewProcesses.next(data);
    // this.codxService.navigate('', e?.url); thuong chua add
    // this.codxService.navigate('', 'bp/processstep/BPT11')

    let url = 'bp/processstep/BPT11';
    this.codxService.navigate('', url, { processID: data.recID });
  }

  approval($event) {}

  // Confirm if Date language ENG show MM/dđ/YYYY else Date language VN show dd/MM/YYYY
  // formatAMPM(date) {
  //   var
  //   var hours = date.getHours();
  //   var minutes = date.getMinutes();
  //   var ampm = hours >= 12 ? 'pm' : 'am';
  //   hours = hours % 12;
  //   hours = hours ? hours : 12; // the hour '0' should be '12'
  //   minutes = minutes < 10 ? '0'+minutes : minutes;
  //   var strTime = hours + ':' + minutes + ' ' + ampm;
  //   return strTime;
  // }
}
