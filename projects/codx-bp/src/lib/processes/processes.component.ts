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
  AuthStore,
  ButtonModel,
  DialogModel,
  DialogRef,
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
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;
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
  dialogPopupReName: DialogRef;
  @ViewChild('viewReName', { static: true }) viewReName;
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
  heightWin: any;
  widthWin: any;
  isViewCard: boolean = false;
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private routers: Router
  ) {
    super(inject);

    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    if (this.funcID == 'BPT3') {
      this.method = 'GetListShareByProcessAsync';
    }
    if (this.funcID == 'BPT2') {
      this.method = 'GetListMyProcessesAsync';
    }
    this.cache.gridViewSetup('Processes', 'grvProcesses').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });

    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
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
    ];
    // this.views.forEach(x=>{
    //   if (x.type === ViewType.card) {
    //     this.isViewCard=true;
    //   }
    //   else {
    //     this.isViewCard=false;
    //   }
    // })
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
        model: {
          template: this.templateListCard,
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
    this.view.dataService.methodDelete = 'DeleteProcessesAsync';
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
    this.crrRecID = data.recID;
    this.dialogPopupReName = this.callfc.openForm(this.viewReName, '', 500, 10);
  }

  Updaterevisions(moreFunc,data) {
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
    if (this.moreFunc == 'BPT104') {
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
      case 'BPT107':
        //this.revisions(e.data, data);
        this.Updaterevisions(e?.data, data);
        break;
      case 'BPT104':
      case 'BPT105':
        this.permission(data);
        break;
      case 'BPT108':
        this.roles(data);
        break;
      case 'BPT103':
        this.revisions(e.data, data);
        break;
    }
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

  onDragDrop(e: any) {}

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        if (
          res.functionID == 'SYS005' ||
          res.functionID == 'SYS004' ||
          res.functionID == 'SYS001' ||
          res.functionID == 'SYS002' ||
          res.functionID == 'SYS003'
        ) {
          /*Giao việc || Nhập khẩu, xuất khẩu, gửi mail, đính kèm file */ res.disabled =
            true;
        }
      });
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

  //#endregion

  //tesst
  viewDetailProcessSteps(moreFunc, data) {
    //đoi view
    // this.bpService.viewProcesses.next(data);
    // let url = 'bp/processstep/BPT11';
    // this.codxService.navigate('', url, { processID: data.recID });

    //view popup
    let obj = {
      moreFunc: moreFunc,
      data: data,
      formModel: this.view.formModel,
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
          if (process){
            this.view.dataService.update(process).subscribe();
            this.detectorRef.detectChanges();
          }

        });
      }
    });
  }

  approval($event) {}
  //tesst
  getFlowchart(data) {
    this.fileService.getFile('636341e8e82afdc6f9a4ab54').subscribe((dt) => {
      if (dt) {
        let link = environment.urlUpload + '/' + dt?.pathDisk;
        return link;
      } else return '../assets/media/img/codx/default/card-default.svg';
    });
  }

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
      let popup = this.callfc.openForm(this.tmpListItem, "", 400, 500, "", null, "", option);
      popup.closed.subscribe((res: any) => {
        if (res) {

        }
      });
    }
  }

}
