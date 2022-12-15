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
import { ActivatedRoute, Router } from '@angular/router';
import { DataRequest } from '@shared/models/data.request';
import { FileService } from '@shared/services/file.service';
import {
  AlertConfirmInputConfig,
  AuthStore,
  ButtonModel,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CodxBpService } from '../codx-bp.service';
import { BP_Processes } from '../models/BP_Processes.model';
import { BP_ProcessesPageSize } from '../models/BP_Processes.modelPageSize';
import { PopupViewDetailProcessesComponent } from '../popup-view-detail-processes/popup-view-detail-processes.component';
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
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('itemProcessName', { static: true })
  itemProcessName: TemplateRef<any>;
  @ViewChild('itemOwner', { static: true })
  itemOwner: TemplateRef<any>;
  @ViewChild('itemStatus', { static: true })
  itemStatus: TemplateRef<any>;
  @ViewChild('itemVersionNo', { static: true })
  itemVersionNo: TemplateRef<any>;
  @ViewChild('itemActivedOn', { static: true }) itemActivedOn: TemplateRef<any>;
  @ViewChild('templateListCard', { static: true })
  templateListCard: TemplateRef<any>;
  @ViewChild('templateSearch') templateSearch: TemplateRef<any>;
  @ViewChild('view') codxview!: any;
  @ViewChild('itemMemo', { static: true })
  itemMemo?: TemplateRef<any>;
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
  popoverList: any;
  popoverDetail: any;
  // titleUpdateFolder = 'Cập nhật thư mục';
  viewMode: any;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  moreFuncs: Array<ButtonModel> = [];
  user: any;
  funcID = 'BPT1';
  method = 'GetListProcessesAsync';
  itemSelected: any;
  dialogPopup: DialogRef;
  @ViewChild('viewReName', { static: true }) viewReName;
  @ViewChild('viewReleaseProcess', { static: true }) viewReleaseProcess;

  @Input() process = new BP_Processes();
  newName = '';
  crrRecID = '';
  dataSelected: any;
  gridViewSetup: any;
  listProcess = new Array<BP_Processes>();
  totalRowCount: any;
  totalRecordSearch: any;
  totalPages: number;
  gridModels = new DataRequest();
  listNumberPage = new Array();
  pageNumberDefault: 1;
  pageNumberCliked: number;
  pageNumberSearch: number;
  clickDisable: string;
  moreFunc: any;
  moreFuncDbClick: any;
  heightWin: any;
  widthWin: any;
  isViewCard: boolean = false;
  formModelMF: FormModel;

  statusLable = '';
  commentLable = '';
  titleReleaseProcess = '';
  comment = '';
  processsId = '';
  objectType = '';
  entityName = '';
  statusDefault = '6';
  vllStatus = 'BP003';
  isAcceptEdit: any;
  userGroupID: '';
  userId = '';
  isAdmin = false;
  isAdminBp = false;
  oldName = '';
  crrFunID = '';
  idProccess = '';
  employee: any;
  checkGroupPerm = '';
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private routers: Router,
    private notificationsService: NotificationsService
  ) {
    super(inject);
    this.user = this.authStore.get();
    if (this.user?.employee) this.employee = this.user?.employee;
    this.userGroupID = this.user.groupID;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    //this.showButtonAdd = this.funcID != 'BPT6'
    this.cache.gridViewSetup('Processes', 'grvProcesses').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        console.log(this.gridViewSetup);
      }
    });
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
    this.userId = this.user?.userID;
    this.isAdmin = this.user?.administrator;
  }

  onInit(): void {
    // this.userId = '2207130007';
    // this.isAdmin = false
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
      this.crrFunID = this.funcID;
    }

    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      { headerTemplate: this.itemProcessName, width: 300 },
      { headerTemplate: null, width: 100 },
      { headerTemplate: this.itemOwner, width: 300 },
      { headerTemplate: this.itemStatus, width: 100 },
      { headerTemplate: this.itemVersionNo, width: 100 },
      { headerTemplate: this.itemActivedOn, width: 150 },
      { headerTemplate: this.itemMemo, width: 300 },
      { field: '', headerText: '', width: 100 },
    ];
    this.afterLoad();
    this.acceptEdit();
    this.isAdminBp = this.checkAdminOfBP(this.userId);
  }

  afterLoad() {
    this.showButtonAdd =
      this.funcID != 'BPT6' &&
      this.funcID != 'BPT51' &&
      this.funcID != 'BPT3' &&
      this.funcID != 'BPT7';
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f)
        this.cache.moreFunction(f.formName, f.gridViewName).subscribe((res) => {
          if (res && res.length > 0) {
            this.moreFuncDbClick = res.find(
              (obj) =>
                obj.functionID == 'BPT101' ||
                obj.functionID == 'BPT201' ||
                obj.functionID == 'BPT301' ||
                obj.functionID == 'BPT401' ||
                obj.functionID == 'BPT501' ||
                obj.functionID == 'BPT601' ||
                obj.functionID == 'BPT701'
            );
          }
        });
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          template: this.itemViewList,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.templateListCard,
          headerTemplate: this.headerTemplate,
        },
      },
      // {
      //   id: '4',
      //   active: true,
      //   icon: 'icon-search',
      //   text: 'Search',
      //   hide:true,
      //   type: ViewType.card,
      //   sameData: false,
      //   model: {
      //     panelRightRef: this.templateSearch,
      //     //       template2: this.templateSearch,
      //     //   resizable: false,
      //   },
      // },
    ];
    this.view.dataService.methodSave = 'AddProcessesAsync';
    this.view.dataService.methodUpdate = 'UpdateProcessesAsync';
    this.view.dataService.methodDelete = 'UpdateDeletedProcessesAsync';
    //   this.view.dataService.searchText='GetProcessesByKeyAsync';
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
          this.totalRecordSearch = this.listProcess.length;
          this.totalRowCount = res[1];
          // test phân trang
          this.gridModels.pageSize = 3;
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
    // try {
    //   this.textSearch = $event;
    //   this.searchKey.next($event);
    //   this.isSearch == true;
    //   if (this.textSearch == null || this.textSearch == '') {
    //     this.views.forEach((item) => {
    //       item.active = false;
    //       item.hide = false;
    //       if (item.text == 'Search') item.hide = true;
    //       if (item.text == this.viewActive.text) item.active = true;
    //     });
    //     this.changeDetectorRef.detectChanges();
    //   } else {
    // this.views.forEach((item) => {
    //   item.hide = true;
    //   if (item.text == 'Search') item.hide = false;
    // });
    // this.changeDetectorRef.detectChanges();
    // this.isSearch = true;
    //     this.pageNumberCliked= this.pageNumberDefault;
    //     this.getHomeProcessSearch();
    //   }
    // } catch (ex) {
    //   this.changeDetectorRef.detectChanges();
    // }
    // this.view.dataService.searchText
    this.view.dataService.search($event).subscribe();
    this.changeDetectorRef.detectChanges();
  }

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      // option.zIndex = 499;
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
          if (!e?.event) this.view.dataService.clear();
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          if (e && e.event != null) {
            this.view.dataService.update(e.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      let objCoppy = {
        idOld: data.recID,
        phasesOld: data.phases ?? 0,
        attachOld: data.attachments ?? 0,
        actiOld: data.activities ?? 0,
      };
      this.dialog = this.callfc.openSide(
        PopupAddProcessesComponent,
        ['copy', this.titleAction, objCoppy],
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
    opt.methodName = 'UpdateDeletedProcessesAsync';
    opt.data = [itemSelected.recID, true];
    // opt.methodName = 'DeleteProcessesAsync';
    // opt.data = [itemSelected.recID];
    return true;
  }

  properties(data?: any) {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    // let data = {} as any;
    // data.title = this.titleUpdateFolder;
    // data.id = data.recID;
    this.dialog = this.callfc.openSide(PropertiesComponent, data, option);
    this.dialog.closed.subscribe((e) => {
      if (!e.event) this.view.dataService.clear();
    });
  }

  reName(data) {
    this.dataSelected = data;
    this.newName = data.processName;
    this.oldName = data.processName;
    this.idProccess = data.recID;
    this.crrRecID = data.recID;
    this.dialogPopup = this.callfc.openForm(this.viewReName, '', 500, 10);
  }
  releaseProcess(data) {
    this.statusLable = this.gridViewSetup['Status']['headerText'];
    this.commentLable = this.gridViewSetup['Comments']['headerText'];
    this.dialogPopup = this.callfc.openForm(
      this.viewReleaseProcess,
      '',
      500,
      260
    );
  }

  Updaterevisions(moreFunc, data) {
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
          {
            title: this.titleAction,
            moreFunc: moreFunc,
            userId: this.userId,
            isAdmin: this.isAdmin,
            isAdminBp: this.isAdminBp,
          },
          option
        );
        this.dialog.closed
          .subscribe
          //(e) => {
          // if (e?.event && e?.event != null) {
          //   this.view.dataService.clear();
          //   this.view.dataService.update(e?.event).subscribe();
          //   this.detectorRef.detectChanges();
          // }
          //}
          ();
      });
  }
  revisions(more, data) {
    var obj = {
      more: more,
      data: data,
      funcIdMain: this.funcID,
      formModel: this.formModelMF,
    };

    this.dialog = this.callfc.openForm(
      RevisionsComponent,
      '',
      500,
      400,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.clear();
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  permission(data) {
    if (
      this.moreFunc == 'BPT104' ||
      this.moreFunc == 'BPT205' ||
      this.moreFunc == 'BPT305' ||
      this.moreFunc == 'BPT605' ||
      this.moreFunc == 'BPT204'
    ) {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddPermissionComponent,
        [this.titleAction, data, false],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.clear();
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
    } else if (this.moreFunc == 'BPT105') {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      this.dialog = this.callfc.openSide(
        PopupAddPermissionComponent,
        [this.titleAction, data, true],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.clear();
          this.view.dataService.update(e?.event).subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  roles(e: any) {
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
    this.moreFunc = e.functionID;
    this.entityName = e?.data?.entityName;
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
      case 'BPT606':
      case 'BPT306':
      case 'BPT206':
      case 'BPT106':
        this.properties(data);
        break;
      case 'BPT601':
      case 'BPT301':
      case 'BPT201':
      case 'BPT101':
      case 'BPT701':
        this.viewDetailProcessSteps(e?.data, data);
        break;
      case 'BPT602':
      case 'BPT302':
      case 'BPT202':
      case 'BPT102':
        this.reName(data);
        break;
      case 'BPT609':
      case 'BPT309':
      case 'BPT109':
      case 'BPT209':
        this.releaseProcess(data);
        break;
      case 'BPT607':
      case 'BPT307':
      case 'BPT207':
      case 'BPT107':
        this.Updaterevisions(e?.data, data);
        break;
      case 'BPT105':
      case 'BPT605':
      case 'BPT305':
      case 'BPT205':
      case 'BPT104':
      case 'BPT204':
      case 'BPT304':
      case 'BPT604':
        this.permission(data);
        break;
      case 'BPT608':
      case 'BPT308':
      case 'BPT208':
      case 'BPT108':
        this.roles(data);
        break;
      case 'BPT603':
      case 'BPT303':
      case 'BPT203':
      case 'BPT103':
        this.revisions(e.data, data);
        break;
      case 'BPT702':
        this.restoreBinById(data);
        break;
    }
  }

  valueChange(e) {
    // if(this.oldName =='' || this.oldName==null) {
    //   this.oldName = e.data;
    // }
    // else {
    //   this.newName = e.data;
    // }
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
    if (this.oldName.trim() === this.newName.trim()) {
      this.notification.notifyCode('SYS007');
      this.changeDetectorRef.detectChanges();
      this.dialogPopup.close();
    } else if (
      this.oldName.trim().toLocaleUpperCase() ===
      this.newName.trim().toLocaleUpperCase()
    ) {
      this.CheckExistNameProccess(this.oldName);
    } else {
      this.CheckAllExistNameProccess(this.newName, this.idProccess);
    }
  }
  CheckAllExistNameProccess(newName, idProccess) {
    this.bpService.isCheckExitName(newName, idProccess).subscribe((res) => {
      if (res) {
        this.CheckExistNameProccess(newName);
      } else {
        this.actionReName(newName);
      }
    });
  }
  CheckExistNameProccess(newName) {
    this.notificationsService.alertCode('BP008').subscribe((x) => {
      if (x.event?.status == 'N') {
        return;
      } else if (x.event?.status == 'Y') {
        this.actionReName(newName);
      }
    });
  }
  actionReName(newName) {
    this.api
      .exec('BP', 'ProcessesBusiness', 'UpdateProcessNameAsync', [
        this.crrRecID,
        newName,
      ])
      .subscribe((res) => {
        if (res) {
          this.dataSelected.processName = newName;
          this.view.dataService.update(this.dataSelected).subscribe();
          this.notification.notifyCode('SYS007');
          this.changeDetectorRef.detectChanges();
        }
        this.dialogPopup.close();
      });
  }

  onDragDrop(e: any) {}

  changeDataMF(e, data) {
    if (e != null && data != null) {
      let isOwner = data?.owner == this.userId ? true : false;
      let fullRole = this.isAdmin || isOwner || this.isAdminBp ? true : false;
      var checkGroup = '';

      checkGroup = this.checkGroupId(data);
      this.checkGroupPerm = checkGroup;
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS005':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'SYS003':
            res.disabled = true;
            break;
          case 'BPT609': // phat hanh
          case 'BPT309': // phat hanh
          case 'BPT109': // phat hanh
          case 'BPT209': // phat hanh
            let isPublish = data?.permissions.some(
              (x) => x.objectID == this.checkGroupPerm && x.publish
            );
            if (data.status === '6' || (!isPublish && !fullRole)) {
              res.isblur = true;
            }
            break;
          case 'SYS04': // copy
          case 'SYS003': // them
          case 'SYS003': // them phien ban
            let isCreate = data?.permissions.some(
              (x) => x.objectID == this.checkGroupPerm && x.create
            );
            if ((!isCreate && !fullRole) || data.deleted) {
              if (res.functionID === 'SYS04') {
                res.disabled = true;
              } else {
                res.isblur = true;
              }
            }
            break;
          case 'SYS03': //sua
          case 'BPT102': //sua ten
          case 'BPT202': //sua ten
          case 'BPT302': //sua ten
          case 'BPT602': //sua ten
          case 'BPT203': //luu phien ban
          case 'BPT103': //luu phien ban
          case 'BPT303': //luu phien ban
          case 'BPT603': //luu phien ban
            let isEdit = data?.permissions.some(
              (x) => x.objectID == this.checkGroupPerm && x.edit
            );
            if ((!isEdit && !fullRole) || data.deleted) {
              if (res.functionID === 'SYS03') {
                res.disabled = true;
              } else {
                res.isblur = true;
              }
            }
            break;
          case 'SYS02': // xoa
            let isDelete = data?.permissions.some(
              (x) => x.objectID == this.checkGroupPerm && x.delete
            );
            if ((!isDelete && !fullRole) || data.deleted) {
              res.disabled = true;
            }
            break;
          case 'BPT701': // xem
          case 'BPT101': // xem
          case 'BPT201': // xem
          case 'BPT301': // xem
          case 'BPT601': // xem
          case 'BPT107': //  quan ly phien ban
          case 'BPT207': //  quan ly phien ban
          case 'BPT307': //  quan ly phien ban
          case 'BPT607': //  quan ly phien ban
            let isRead = this.checkPermissionRead(data);
            if (!isRead) {
              res.isblur = true;
            }
            break;
          case 'BPT105': //chia se
          case 'BPT205': //chia se
          case 'BPT305': //chia se
          case 'BPT605': //chia se
            let isShare = data?.permissions.some(
              (x) =>
                x.objectID == this.checkGroupPerm &&
                x.share &&
                x.approveStatus !== '3' &&
                x.approveStatus != '4'
            );
            if (!isShare && !fullRole) {
              res.isblur = true;
            }
            break;
          case 'BPT108': //phan quyen
          case 'BPT208': //phan quyen
          case 'BPT308': //phan quyen
          case 'BPT608': //phan quyen
            let isAssign = data?.permissions.some(
              (x) => x.objectID == this.checkGroupPerm && x.assign
            );
            if (!isAssign && !fullRole) {
              res.isblur = true;
            }

            break;
          case 'BPT702': //Khoi phuc
            let isRestore = data?.permissions.some(
              (x) => x.objectID == this.checkGroupPerm && x.delete
            );
            if (!isRestore && !fullRole) {
              res.isblur = true;
            }
        }
      });
    }
  }

  checkGroupId(data) {
    var isCheck = '';
    if (data.permissions != null) {
      data.permissions.forEach((res) => {
        if (res) {
          switch (res.objectType) {
            case 'O':
              if (res.objectID == this.employee?.orgUnitID)
                isCheck = res.objectID;
              break;
            case 'P':
              if (res.objectID == this.employee?.positionID)
                isCheck = res.objectID;
              break;
            case 'U':
              if (res.objectID == this.user.userID) isCheck = res.objectID;
              break;
          }
        }
      });
    }
    return isCheck;
  }

  checkPermissionRead(data) {
    let isRead = data?.permissions.some(
      (x) =>
        x.objectID == this.checkGroupPerm &&
        x.read &&
        x.approveStatus !== '3' &&
        x.approveStatus !== '4'
    );
    let isOwner = data?.owner == this.userId ? true : false;
    return isRead || this.isAdmin || isOwner || this.isAdminBp ? true : false;
  }

  doubleClickViewProcessSteps(moreFunc, data) {
    let check = this.checkPermissionRead(data);
    // if (check && this.moreFuncDbClick) {
    if (check) {
      this.viewDetailProcessSteps(moreFunc, data);
    }
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

  viewDetailProcessSteps(moreFunc, data) {
    let isEdit = data?.permissions.some(
      (x) => x.objectID == this.checkGroupPerm && x.edit
    );
    let isOwner = data?.owner == this.userId ? true : false;
    let editRole =
      (this.isAdmin || isOwner || this.isAdminBp || isEdit) && !data.deleted
        ? true
        : false;

    let obj = {
      moreFunc: moreFunc,
      data: data,
      formModel: this.view.formModel,
      editRole,
    };

    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    dialogModel.zIndex = 999;
    var dialog = this.callfc.openForm(
      PopupViewDetailProcessesComponent,
      '',
      this.widthWin,
      this.heightWin,
      '',
      obj,
      '',
      dialogModel
    );

    dialog.closed.subscribe((e) => {
      if (e && data.recID) {
        this.bpService.getProcessesByID(data.recID).subscribe((process) => {
          if (process) {
            this.bpService.getFlowChartNew.subscribe((dt) => {
              process.modifiedOn = dt?.createdOn;
              this.view.dataService.update(process).subscribe();
              this.detectorRef.detectChanges();
            });
          }
        });
      }
    });
  }

  approval($event) {}
  //tesst
  // getFlowchart(data) {
  //   this.fileService.getFile('636341e8e82afdc6f9a4ab54').subscribe((dt) => {
  //     if (dt) {
  //       let link = environment.urlUpload + '/' + dt?.pathDisk;
  //       return link;
  //     } else return '../assets/media/img/codx/default/card-default.svg';
  //   });
  // }

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

  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null) p.open();
    } else p.close();
  }

  openPopup() {
    if (this.tmpListItem) {
      let option = new DialogModel();
      let popup = this.callfc.openForm(
        this.tmpListItem,
        '',
        400,
        500,
        '',
        null,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if (res) {
        }
      });
    }
  }

  setComment(e) {
    this.comment = e.data;
  }

  updateReleaseProcess() {
    let processsId = this.itemSelected?.recID;
    this.bpService
      .updateReleaseProcess([
        processsId,
        '1',
        this.comment,
        this.moreFunc,
        this.entityName,
      ])
      .subscribe((res) => {
        if (res) {
          this.notification.notifyCode('SYS007');
          this.dialogPopup.close();
          this.view.dataService.update(res).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  acceptEdit() {
    if (this.user.administrator) {
      this.isAcceptEdit = true;
    } else if (this.checkAdminOfBP(this.user.userId)) {
      this.isAcceptEdit = true;
    } else if (!this.user.edit) {
      this.isAcceptEdit = false;
    }
  }

  checkAdminOfBP(userid: any) {
    let check: boolean;
    this.bpService.checkAdminOfBP(userid).subscribe((res) => (check = res));
    return check;
  }

  deleteBin() {
    // xoa toan bo thung rac ham nay chưa dung
    if (this.view.dataService?.data.length > 0) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      let title = `Bạn có muốn xóa hẳn ${this.view.dataService?.data.length} hai quy trình này không, bạn sẽ không phục hồi được nếu xóa hẳn khỏi thùng rác ?`;
      this.notificationsService
        .alert('Thông báo', title, config)
        .closed.subscribe((x) => {
          if (x.event.status == 'Y') {
            this.bpService.deleteBin([true]).subscribe((res) => {
              if (res) {
                this.notification.notifyCode('SYS008');
                this.view.dataService.data = [];
                this.detectorRef.detectChanges();
              }
            });
          }
        });
    }
  }
  deleteProcessesById(data) {
    //delete ham nay chua dung
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) => {
        var itemSelected = opt.data[0];
        opt.methodName = 'DeleteProcessesAsync';
        opt.data = [itemSelected.recID];
        return true;
      })
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
  }

  restoreBinById(data) {
    if (data.recID) {
      this.view.dataService.dataSelected = data;
      this.bpService.restoreBinById(data.recID).subscribe((res) => {
        if (res) {
          this.notification.notifyCode('SYS034');
          this.view.dataService.remove(data).subscribe();
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  // getAvatar(process) {
  //   let avatar = [
  //     '',
  //     this.funcID,
  //     process?.recID,
  //     'BP_Processes',
  //     'inline',
  //     1000,
  //     process?.processName,
  //     'avt',
  //     false,
  //   ];
  //   this.api
  //     .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
  //     .subscribe((res) => {
  //       if (res) {
  //         // this.linkAvatar = environment.urlUpload + '/' + res?.url;
  //         this.changeDetectorRef.detectChanges();
  //       } else {
  //       }
  //     });
  // }

  //chang data
  viewChanged(e) {
    var funcIDClick = this.activedRouter.snapshot.params['funcID'];
    if (this.crrFunID != funcIDClick) {
      this.funcID = funcIDClick;
      this.afterLoad();
      this.crrFunID = this.funcID;
      this.changeDetectorRef.detectChanges();
    }
  }
}
