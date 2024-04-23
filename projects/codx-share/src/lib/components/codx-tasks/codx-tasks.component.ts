import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  DialogRef,
  NotificationsService,
  PageLink,
  PageTitleService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  UrlUtil,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AssignInfoComponent } from '../assign-info/assign-info.component';
import {
  TM_Parameter,
  TM_TaskExtends,
  TM_TaskGroups,
} from './model/task.model';
import moment from 'moment';
import { CodxTasksService } from './codx-tasks.service';
import { ViewDetailComponent } from './view-detail/view-detail.component';
import { PopupAddComponent } from './popup-add/popup-add.component';
import { PopupConfirmComponent } from './popup-confirm/popup-confirm.component';
import { PopupUpdateProgressComponent } from './popup-update-progress/popup-update-progress.component';
import { PopupExtendComponent } from './popup-extend/popup-extend.component';
import { CodxImportComponent } from '../codx-import/codx-import.component';
import { CodxExportComponent } from '../codx-export/codx-export.component';
import { PopupUpdateStatusComponent } from './popup-update-status/popup-update-status.component';
import { AssignTaskModel } from '../../models/assign-task.model';
import { DomSanitizer } from '@angular/platform-browser';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { CodxShareService } from '../../codx-share.service';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'codx-tasks-share', ///tên vậy để sửa lại sau
  templateUrl: './codx-tasks.component.html',
  styleUrls: ['./codx-tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxTasksComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  //#region Constructor
  @Input() dataObj?: any;
  @Input() sessionID?: any;
  @Input() isResourceAssignSession = false; //resourec theo sessionID
  @Input() showButtonAdd = true;
  @Input() showMoreFunc = true;
  @Input() refID?: any;
  @Input() refType?: any;
  @Input() calendarID: string;
  @Input() resourceModel!: any;
  @Input() viewPreset: string = 'weekAndDay';
  @Input() predicate?: string; //truyen predicate dạng 'Status==@0 && Priority=@1'
  @Input() dataValue?: string; //truyen dataValue dạng  "90;1"
  @Input() service = 'TM';
  @Input() entityName = 'TM_Tasks';
  @Input() idField = 'taskID';
  @Input() assemblyName = 'ERM.Business.TM';
  @Input() className = 'TaskBusiness';
  @Input() method = 'GetTasksAsync';
  @Input() hideSearchFav = false; //ẩn/hiện seach fav trên toolbar
  @Input() viewMode: any;

  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  @ViewChild('eventModel') eventModel?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('treeView') treeView!: TemplateRef<any>;
  @ViewChild('footerNone') footerNone!: TemplateRef<any>;
  @ViewChild('detail') detail: ViewDetailComponent;
  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('headerTemp') headerTemp?: TemplateRef<any>;
  @ViewChild('popupToDoList') popupToDoList?: TemplateRef<any>;
  @ViewChild('viewGanttChart') viewGanttChart!: TemplateRef<any>;
  @ViewChild('ganttItems') ganttItems!: TemplateRef<any>;
  @ViewChild('viewTree') viewTree!: TreeViewComponent;

  views: Array<ViewModel> = [];
  viewsDefault: Array<ViewModel> = [];

  //add resourece cho Sprint
  @Output() resourceNew = new EventEmitter<any>();
  //

  button?: ButtonModel[] = [
    {
      id: 'btnAdd',
      // items: [{
      //   id: 'avc',
      //   text: 'xxyz'
      // }]
    },
  ];

  model?: DataRequest;
  request: ResourceModel;
  requestSchedule: ResourceModel;
  requestTree: ResourceModel;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resourceTree: ResourceModel;
  resource: ResourceModel;
  dialog!: DialogRef;
  dialogConfirmStatus!: DialogRef;
  dialogApproveStatus!: DialogRef;
  dialogVerifyStatus!: DialogRef;
  dialogProgess!: DialogRef;
  dialogExtends!: DialogRef;
  selectedDate = new Date();
  startDate: Date;
  endDate: Date;
  dayoff = [];
  eventStatus: any;
  itemSelected: any;
  user: any;
  gridView: any;
  isAssignTask = false;
  param: TM_Parameter = new TM_Parameter();
  paramModule: TM_Parameter = new TM_Parameter();
  paramDefaut: TM_Parameter = new TM_Parameter();
  listTaskResousce = [];
  searchField = '';
  listTaskResousceSearch = [];
  listRoles = [];
  vllRole = 'TM002';
  countResource = 0;
  popoverCrr: any;
  popoverDataSelected: any;
  vllStatusTasks = 'TM004';
  vllStatusAssignTasks = 'TM007';
  vllStatus = 'TM004';
  vllApproveStatus = 'TM011';
  vllVerifyStatus = 'TM008';
  vllExtendStatus = 'TM010';
  vllConfirmStatus = 'TM009';
  vllPriority = 'TM005';
  gridViewSetup: any;
  taskGroup: TM_TaskGroups;
  taskExtend: TM_TaskExtends = new TM_TaskExtends();
  dataTree = [];
  listDataTree = [];
  iterationID: any;
  // viewMode: any;
  projectID?: any;
  listViewModel = [];
  dataReferences = [];
  titleAction = '';
  moreFunction = [];
  crrStatus = '';
  disabledProject = false;
  crrFuncID = '';
  isHoverPop = false;
  timeoutId: any;
  viewCrr: any;
  //porgess
  type: string = 'Circular';
  // startAngle: number = 0;
  // endAngle: number = 0;
  width: string = '40';
  height: string = '40';
  min: number = 0;
  max: number = 100;
  color = '#005DC7';
  // radius: string = '100%';
  // innerRadius: string = '190%';

  // progressThickness2: number = 8;
  // cornerRadius2: string = 'Round';
  // innerRadius2: string = '72';

  // theme: string = 'Material';
  trackThickness: number = 2;
  // cornerRadius: string = 'Round';
  progressThickness: number = 2;
  animation: AnimationModel = { enable: true, duration: 2000, delay: 200 };
  HTMLProgress = `<div id="point1" style="font-size:20px;font-weight:bold;color:#ffffff;fill:#ffffff"><span>60%</span></div>`;
  listTaskGoals = [];
  selectedFirst = true;
  queryParams: any;

  entityID = ''; //get seachface
  func: any;

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTasksService,
    private codxShareService: CodxShareService,
    public sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    private pageTitle: PageTitleService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.queryParams = this.router.snapshot.queryParams;
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }
  subscription:Subscription = new Subscription;
  ngOnDestroy(): void {
    console.log(this.subscription);

    this.subscription.unsubscribe();
  }

  //#region Init
  onInit(): void {
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.crrFuncID = this.funcID;
    this.projectID = this.dataObj?.projectID;
    //tắt vì có input rồi
    // this.viewMode = this.dataObj?.viewMode;

    //them prdicate vao loc
    if (this.predicate && this.dataValue) {
      let object = {
        predicate: this.predicate,
        dataValue: this.dataValue,
      };
      this.dataObj = Object.assign({}, this.dataObj, object);
    }

    if (this.isResourceAssignSession) {
      let object = {
        isResourceAssignSession: '1',
      };
      this.dataObj = Object.assign({}, this.dataObj, object);
    }

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    // this.resourceKanban.dataObj = '';

    this.request = new ResourceModel();
    this.request.service = 'TM';
    this.request.assemblyName = 'TM';
    this.request.className = 'TaskBusiness';
    this.request.method = 'GetTasksAsync';
    this.request.idField = 'taskID';
    this.request.dataObj = this.dataObj;
    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.request.predicate = this.queryParams?.predicate;
      this.request.dataValue = this.queryParams?.dataValue;
    }

    this.requestTree = new ResourceModel();
    this.requestTree.service = 'TM';
    this.requestTree.assemblyName = 'TM';
    this.requestTree.className = 'TaskBusiness';
    this.requestTree.method = 'GetListTreeDetailTasksAsync';
    this.requestTree.idField = 'taskID';

    this.afterLoad();
    //this.getParams(); //cai nay lúc trước lọc ngày schedule
    this.getParam();

    // this.dataObj = JSON.stringify(this.dataObj);
  }

  afterLoad() {
    this.queryParams = this.router.snapshot.queryParams;
      let sub = this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.entityID = f.entityName;
        this.func = f;
        let sub0 = this.cache.moreFunction(f.formName, f.gridViewName).subscribe((res) => {
          if (res) {
            this.moreFunction = res;
          }
        });
        this.subscription.add(sub0);
        let sub1 = this.cache
          .gridViewSetup(f.formName, f.gridViewName)
          .subscribe((grv) => {
            if (grv) {
              this.vllStatus = grv?.Status?.referedValue;
              this.vllApproveStatus = grv?.ApproveStatus?.referedValue;
              this.vllExtendStatus = grv?.ExtendStatus?.referedValue;
              this.vllVerifyStatus = grv?.VerifyStatus?.referedValue;
              this.vllConfirmStatus = grv?.ConfirmStatus?.referedValue;
              this.vllPriority = grv?.Priority?.referedValue;
            }
          });
        this.subscription.add(sub1)
      }
    });
    this.subscription.add(sub);

    this.showButtonAdd =
      this.funcID != 'TMT0206' &&
      this.funcID != 'TMT0202' &&
      this.funcID != 'MWP0063' &&
      this.funcID != 'MWP0064' &&
      this.funcID != 'TMT0402' &&
      this.funcID != 'TMT0403' &&
      this.funcID != 'OMT014';

    this.showMoreFunc = this.funcID != 'TMT0206' && this.funcID != 'MWP0063';

    this.modelResource = new ResourceModel();

    if (this.isResourceAssignSession) {
      //resouce tu cong viec dc giao
      this.modelResource.assemblyName = 'TM';
      this.modelResource.className = 'TaskBusiness';
      this.modelResource.service = 'TM';
      this.modelResource.method = 'GetResoucesScheduleAsync';
      this.modelResource.dataValue = this.dataObj?.sessionID;
    } else {
      if (this.funcID != 'TMT03011' && this.funcID != 'TMT05011') {
        this.modelResource.assemblyName = 'HR';
        this.modelResource.className = 'OrganizationUnitsBusiness_Old';
        this.modelResource.service = 'HR';
        this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';
      } else {
        //request a list resource
        this.modelResource.assemblyName = 'HR';
        this.modelResource.className = 'OrganizationUnitsBusiness_Old';
        this.modelResource.service = 'HR';
        this.modelResource.method = 'GetListUserByResourceAsync';
        this.modelResource.dataValue = this.dataObj?.resources;
      }
    }

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'TM';
    this.requestSchedule.assemblyName = 'TM';
    this.requestSchedule.className = 'TaskBusiness';
    this.requestSchedule.method = 'GetTasksWithScheduleAsync';
    this.requestSchedule.idField = 'taskID';
    this.requestSchedule.dataObj = this.dataObj;

    if (this.queryParams?.predicate && this.queryParams?.dataValue) {
      this.requestSchedule.predicate = this.queryParams?.predicate;
      this.requestSchedule.dataValue = this.queryParams?.dataValue;
    } else {
      this.requestSchedule.predicate = '';
      this.requestSchedule.dataValue = '';
    }
    let i = 0;
    if (this.requestSchedule.dataValue) {
      let arr = this.requestSchedule.dataValue.trim().split(';');
      if (arr?.length > 0) i = arr?.length;
    }
    //fix theo core mới schedule bỏ resoure

    switch (this.funcID) {
      case 'MWP0061':
      case 'TMT0201':
        this.requestSchedule.predicate +=
          (i > 0 ? ' and (' : '') +
          '(Category=@' +
          i +
          ' or Category=@' +
          (i + 1) +
          ') and Owner=@' +
          (i + 2) +
          (i > 0 ? ')' : '');
        this.requestSchedule.dataValue +=
          (i > 0 ? ';' : '') + '1;2;' + this.user.userID;
        break;
      case 'TMT0203':
      case 'MWP0062':
      case 'OMT014':
        this.requestSchedule.predicate +=
          (i > 0 ? ' and (' : '') +
          'Category=@' +
          i +
          ' and CreatedBy=@' +
          (i + 1) +
          (i > 0 ? ')' : '');
        this.requestSchedule.dataValue +=
          (i > 0 ? ';' : '') + '2;' + this.user.userID;
        break;
      case 'MWP0064':
      case 'TMT0202':
      case 'TMT03011':
      case 'TMT05011':
        this.requestSchedule.predicate +=
          (i > 0 ? ' and (' : '') +
          '( Category=@' +
          i +
          ' or Category=@' +
          (i + 1) +
          ')' +
          (i > 0 ? ')' : '');
        this.requestSchedule.dataValue += (i > 0 ? ';' : '') + '1;2';
        break;
      default:
        // this.requestSchedule.predicate = '';
        // this.requestSchedule.dataValue = '';
        break;
    }
    if (this.isResourceAssignSession) {
      this.requestSchedule.predicate = 'Category=@0';
      this.requestSchedule.dataValue = '2';
    }
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.viewsDefault = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
      {
        type: ViewType.calendar,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        showSearchBar: false,
        model: {
          eventModel: this.fields,
          //resourceModel: this.resourceModel,
          // resourceModel: this.resourceField, //ko có thang nay
          //template7: this.footerNone, ///footer
          template4: this.resourceHeader,
          template6: this.mfButton, //header
          // template: this.eventTemplate,
          //template2: this.headerTemp,
          template3: this.cellTemplate,
          template8: this.contentTmp, //content
          statusColorRef: this.vllStatus,
        },
      },
      {
        type: ViewType.schedule,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: true,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          //template7: this.footerNone, ///footer
          template4: this.resourceHeader,
          template6: this.mfButton, //header
          // template: this.eventTemplate, lấy event của temo
          //template2: this.headerTemp,
          template3: this.cellTemplate,
          template8: this.contentTmp, //content
          statusColorRef: this.vllStatus,
        },
      },
      {
        type: ViewType.content,
        active: false,
        sameData: false,
        text: this.user?.language == 'VN' ? 'Cây giao việc' : 'Tree Assign',
        //icon: 'icon-account_tree',
        model: {
          panelLeftRef: this.treeView,
        },
      },
      {
        type: ViewType.gantt,
        active: false,
        sameData: true,

        model: {
          eventModel: this.taskSettings,
          //template:this.ganttItems
        },
      },
    ];

    if (this.funcID == 'TMT03011') {
      let sub = this.cache.viewSettings(this.funcID).subscribe((res) => {
        if (res && res.length > 0) {
          var viewFunc = [];
          res.forEach((x) => {
            var idx = this.viewsDefault.findIndex((obj) => obj.type == x.view);
            if (idx != -1) {
              viewFunc.push(this.viewsDefault[idx]);
              if (x.isDefault && !this.viewMode) this.viewMode = x.view;
            }
          });
          this.views = viewFunc.sort((a, b) => {
            return a.type - b.type;
          });
        }
      });
      this.subscription.add(sub)
    } else this.views = this.viewsDefault;

    this.view.dataService.methodSave = 'AddTaskAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskAsync';
    this.view.dataService.methodDelete = 'DeleteTaskAsync';

    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region CRUD
  add() {
    let sub = this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      option.zIndex = 1001;
      if (this.projectID) {
        this.view.dataService.dataSelected.projectID = this.projectID;
        this.disabledProject = true;
      } else this.disabledProject = false;
      if (this.refID) this.view.dataService.dataSelected.refID = this.refID;
      if (this.refType)
        this.view.dataService.dataSelected.refType = this.refType;
      if (this.sessionID)
        this.view.dataService.dataSelected.sessionID = this.sessionID;
      let obj = {
        data: this.view.dataService.dataSelected,
        action: 'add',
        isAssignTask: this.isAssignTask,
        titleAction: this.titleAction,
        functionID: this.funcID,
        taskCopy: null,
        disabledProject: this.disabledProject,
      };
      var dialog = this.callfc.openSide(PopupAddComponent, obj, option);
      let sub1 = dialog.closed.subscribe((e) => {
        if (!e?.event) {
          this.view.dataService.clear();
        }
        if (e?.event) {
          if (this.funcID == 'TMT03011')
            //chua xu ly this.funcID=="TMT05011"
            this.resourceNew.emit(e?.event?.owner);
        }

        //if (e?.event == null)
        //   this.view.dataService.delete(
        //     [this.view.dataService.dataSelected],
        //     false
        //);
      });
      this.subscription.add(sub1)
    });
    this.subscription.add(sub)
  }

  edit(data?) {
    if (data && !'00,07,09,10,20'.includes(data.status)) {
      this.notiService.notifyCode('TM013');
      return;
    } else if (
      data.category == '1' &&
      data.verifyControl == '1' &&
      data.status != '00'
    ) {
      this.notiService.notifyCode('TM014');
      return;
    }
    if (data.category == '1' || data.category == '2') {
      this.editConfirm(data);
    } else {
      var isCanEdit = true;
      let sub = this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTaskChildDetailAsync',
          data.taskID
        )
        .subscribe((res: any) => {
          if (res && res?.length > 0) {
            for (let i = 0; i < res.length; i++) {
              let element = res[i];
              if (element.status != '00' && element.status != '10') {
                isCanEdit = false;
                break;
              }
            }
            if (!isCanEdit) {
              this.notiService.notifyCode('TM016');
            } else {
              this.editConfirm(data);
            }
          }
        });
      this.subscription.add(sub)
    }
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    let sub = this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      option.zIndex = 1001;
      if (this.projectID) {
        this.view.dataService.dataSelected.projectID = this.projectID;
        this.disabledProject = true;
      } else this.disabledProject = false;
      let obj = {
        data: this.view.dataService.dataSelected,
        action: 'copy',
        isAssignTask: this.isAssignTask,
        titleAction: this.titleAction,
        functionID: this.funcID,
        taskCopy: data,
        disabledProject: this.disabledProject,
      };
      this.dialog = this.callfc.openSide(PopupAddComponent, obj, option);
      let sub1 = this.dialog.closed.subscribe((e) => {
        if (!e?.event) {
          this.view.dataService.clear();
        }
        if (e?.event) {
          if (this.funcID == 'TMT03011')
            //chua xu ly this.funcID=="TMT05011"
            this.resourceNew.emit(e?.event?.owner);
        }
      });
      this.subscription.add(sub1)
    });
    this.subscription.add(sub);
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    if (data.status == '90') {
      this.notiService.notifyCode('TM017');
      return;
    }
    if (
      data.category == '2' &&
      !(data.parentID == null && data.createdBy == this.user.userID)
    ) {
      this.notiService.notifyCode('TM018');
      return;
    }
    if (data.category == '1') {
      this.deleteConfirm(data);
      return;
    }
    var isCanDelete = true;
    let sub = this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskChildDetailAsync',
        data.taskID
      )
      .subscribe((res: any) => {
        if (res) {
          res.forEach((element) => {
            if (element.status != '00' && element.status != '10') {
              isCanDelete = false;
              return;
            }
          });
          if (!isCanDelete) {
            this.notiService.notifyCode('TM001');
          } else {
            this.deleteConfirm(data);
          }
        }
      });
      this.subscription.add(sub)
  }

  assignTask(moreFunc, data) {
    this.view.dataService.dataSelected = data;
    let assignModel: AssignTaskModel = {
      vllRole: 'TM001',
      title: moreFunc.customName,
      vllShare: 'TM003',
      task: this.view.dataService.dataSelected,
      taskParent: data,
    };
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(
      AssignInfoComponent,
      assignModel,
      option
    );
    let sub = this.dialog.closed.subscribe((e) => {
      if (!e.event) this.view.dataService.clear();
      // if (e?.event == null)
      //   this.view.dataService.delete(
      //     [this.view.dataService.dataSelected],
      //     false
      //   );
      if (e?.event && e?.event != null && e?.event[1] != null) {
        if (e.event[0]) {
          this.itemSelected = data;
          this.detail.taskID = this.itemSelected.taskID;
          this.detail.getTaskDetail();
        }
        this.detectorRef.detectChanges();
      }
    });
    this.subscription.add(sub)
  }
  //#endregion

  //#region Function
  editConfirm(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    let sub = this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        option.zIndex = 1001;
        if (this.projectID) {
          this.disabledProject = true;
        } else this.disabledProject = false;
        let obj = {
          data: this.view.dataService.dataSelected,
          action: 'edit',
          isAssignTask: this.isAssignTask,
          titleAction: this.titleAction,
          functionID: this.funcID,
          taskCopy: null,
          disabledProject: this.disabledProject,
        };
        this.dialog = this.callfc.openSide(PopupAddComponent, obj, option);
       let sub1= this.dialog.closed.subscribe((e) => {
          if (!e.event) this.view.dataService.clear();
          // if (e?.event == null)
          //   this.view.dataService.delete(
          //     [this.view.dataService.dataSelected],
          //     false
          //   );
          if (e?.event && e?.event != null) {
            this.view.dataService.update(e?.event).subscribe();
            this.itemSelected = e?.event;
            this.detail.taskID = this.itemSelected.taskID;
            this.detail.getTaskDetail();
          }
          this.detectorRef.detectChanges();
        });
        this.subscription.add(sub1)
      });
      this.subscription.add(sub)
  }

  deleteConfirm(data) {
    let sub =this.notiService.alertCode('TM003').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        let sub1= this.tmSv.deleteTask(data.taskID).subscribe((res) => {
          if (res) {
            var listTaskDelete = res[0];
            var parent = res[1];
            listTaskDelete.forEach((x) => {
              this.view.dataService.remove(x).subscribe();
            });
            this.view.dataService.onAction.next({ type: 'delete', data: data });
            this.notiService.notifyCode('TM004');
            if (parent) {
              let sub2 =this.view.dataService.update(parent).subscribe();
              this.subscription.add(sub2)
            }
            this.itemSelected = this.view.dataService.data[0];
            this.detectorRef.detectChanges();
          }
        });
        this.subscription.add(sub1)
      }
    });
    this.subscription.add(sub)
  }

  beforDelete(opt: RequestOption) {
    opt.methodName = 'DeleteTaskAsync';
    opt.data = this.itemSelected.taskID;
    return true;
  }

  changeStatusTask(moreFunc, taskAction) {
    if (
      (taskAction.createdBy != this.user.userID &&
        taskAction.category == '3') ||
      (taskAction.owner != this.user.userID &&
        (taskAction.category == '2' || taskAction.category == '1'))
    ) {
      //dung chung ma voi ep
      this.notiService.notifyCode('TM052');
      return;
    }
    if (taskAction.status == '05') {
      this.notiService.notifyCode('TM020');
      return;
    }
    if (taskAction.status == '00') {
      this.notiService.notifyCode('TM060');
      return;
    }
    if (taskAction.approveStatus == '3') {
      this.notiService.notifyCode('TM024');
      return;
    }
    if (taskAction.approveStatus == '4' || taskAction.approveStatus == '5') {
      this.notiService.notifyCode('TM025');
      return;
    }

    if (taskAction.status == '90') {
      if (this.paramModule.ReOpenDays) {
        var time =
          moment(new Date()).toDate().getTime() -
          Number.parseFloat(this.paramModule.ReOpenDays) * (3600000 * 24);
        var timeCompletedOn = moment(new Date(taskAction.completedOn))
          .toDate()
          .getTime();
        if (time > timeCompletedOn) {
          this.notiService.notifyCode('TM053');
          return;
        }
      }
      let sub = this.notiService.alertCode('TM054').subscribe((confirm) => {
        if (confirm?.event && confirm?.event?.status == 'Y') {
          this.confirmUpdateStatus(moreFunc, taskAction);
        }
      });
      this.subscription.add(sub)
    } else this.confirmUpdateStatus(moreFunc, taskAction);
  }

  confirmUpdateStatus(moreFunc, taskAction) {
    // const fieldName = 'UpdateControl';
    if (taskAction.taskGroupID) {
      let sub = this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskGroupBusiness',
          'GetAsync',
          taskAction.taskGroupID
        )
        .subscribe((res) => {
          if (res) {
            this.actionUpdateStatus(
              moreFunc,
              taskAction,
              res?.updateControl,
              res?.maxHoursControl,
              res?.maxHours,
              res?.completedControl
            );
          } else {
            this.actionUpdateStatus(
              moreFunc,
              taskAction,
              this.paramDefaut.UpdateControl,
              this.paramDefaut.MaxHoursControl,
              this.paramDefaut.MaxHours,
              this.paramDefaut.CompletedControl
            );
          }
        });
        this.subscription.add(sub)
    } else {
      this.actionUpdateStatus(
        moreFunc,
        taskAction,
        this.paramDefaut.UpdateControl,
        this.paramDefaut.MaxHoursControl,
        this.paramDefaut.MaxHours,
        this.paramDefaut.CompletedControl
      );
    }
  }

  actionUpdateStatus(
    moreFunc,
    taskAction,
    updateControl,
    maxHoursControl,
    maxHours,
    completedControl
  ) {
    var status = UrlUtil.getUrl('defaultValue', moreFunc.url);
    if (
      status == '90' &&
      completedControl != '0' &&
      taskAction.category == '3'
    ) {
      var isCheck = false;
      let sub = this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTaskChildDetailAsync',
          taskAction.taskID
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            isCheck = res.some((obj) => {
              obj.status != '90' && obj.status != '80';
            });
            if (isCheck) {
              this.notiService.notifyCode('TM008');
              return;
            } else
              this.updatStatusAfterCheck(
                moreFunc,
                taskAction,
                updateControl,
                maxHoursControl,
                maxHours
              );
          }
        });
        this.subscription.add(sub)
    } else if (status == '80' && taskAction.category == '3') {
      this.updateStatusCancel(
        moreFunc,
        taskAction,
        updateControl,
        maxHoursControl,
        maxHours
      );
    } else
      this.updatStatusAfterCheck(
        moreFunc,
        taskAction,
        updateControl,
        maxHoursControl,
        maxHours
      );
  }

  //kiểm tra dk Cancel task
  updateStatusCancel(
    moreFunc,
    taskAction,
    updateControl,
    maxHoursControl,
    maxHours
  ) {
    let sub = this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskChildDetailAsync',
        taskAction.taskID
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          var isCheck = res.some((obj) => {
            obj.status != '00' && obj.status != '10';
          });
          if (isCheck) {
            this.notiService.notifyCode('TM008');
            return;
          } else
            this.updatStatusAfterCheck(
              moreFunc,
              taskAction,
              updateControl,
              maxHoursControl,
              maxHours
            );
        }
      });
      this.subscription.add(sub)
  }

  updatStatusAfterCheck(
    moreFunc,
    taskAction,
    updateControl,
    maxHoursControl,
    maxHours
  ) {
    if (updateControl != '0') {
      this.openPopupUpdateStatus(
        moreFunc,
        taskAction,
        updateControl,
        maxHoursControl,
        maxHours
      );
    } else {
      var completedOn = moment(new Date()).toDate();
      var completed = '0';
      if (taskAction.estimated > 0) {
        completed = taskAction.estimated;
      } else {
        var timeStart = moment(
          new Date(
            taskAction.startOn
              ? taskAction.startOn
              : taskAction.startDate
              ? taskAction.startDate
              : taskAction.createdOn
          )
        ).toDate();
        var time = (
          (completedOn.getTime() - timeStart.getTime()) /
          3600000
        ).toFixed(2);
        completed = Number.parseFloat(time).toFixed(2);
      }
      var status = UrlUtil.getUrl('defaultValue', moreFunc.url);

      let sub = this.tmSv
        .setStatusTask(
          this.funcID,
          taskAction.taskID,
          status,
          completedOn,
          completed,
          ''
        )
        .subscribe((res) => {
          let kanban = (this.view.currentView as any).kanban;
          if (res && res.length > 0) {
            res.forEach((obj) => {
              this.view.dataService.update(obj).subscribe();
              if (kanban) kanban.updateCard(obj);
            });
            this.itemSelected = res[0];
            this.detail.getTaskDetail();
            this.detectorRef.detectChanges();
            this.notiService.notifyCode('TM009');
            if (this.itemSelected.status == '90')
              this.detail.getDataHistoryProgress(this.itemSelected.recID);
          } else this.notiService.notifyCode('SYS021');
        });
        this.subscription.add(sub)
    }
  }

  openPopupUpdateStatus(
    moreFunc,
    taskAction,
    updateControl,
    maxHoursControl,
    maxHours
  ) {
    let obj = {
      moreFunc: moreFunc,
      taskAction: taskAction,
      funcID: this.funcID,
      updateControl: updateControl,
      maxHoursControl: maxHoursControl,
      maxHours: maxHours,
    };
    this.dialog = this.callfc.openForm(
      PopupUpdateStatusComponent,
      '',
      500,
      350,
      '',
      obj
    );
    let sub1 = this.dialog.closed.subscribe((e) => {
      let kanban = (this.view.currentView as any).kanban;
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          if (kanban) {
            kanban.updateCard(obj);
          }
          let sub = this.view.dataService.update(obj).subscribe();
          this.subscription.add(sub)
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
        if (this.itemSelected.status == '90')
          this.detail.getDataHistoryProgress(this.itemSelected.recID);
      } else {
        if (kanban) kanban.updateCard(taskAction);
      }
      this.detectorRef.detectChanges();
    });
    this.subscription.add(sub1)
  }
  //#endregion
  //#region Event đã có dùng clickChildrenMenu truyền về
  changeView(evt: any) {
    if (
      this.funcID == 'TMT03011' ||
      this.funcID == 'TMT05011' ||
      this.hideSearchFav
    ) {
      (this.view as any).pageTitle.showBreadcrumbs(false);
      // this.getSearchFav(); // vẽ lại cái searchFav
    }
    this.viewCrr = evt?.view?.type;
    if (this.crrFuncID != this.funcID) {
      this.afterLoad();
      let sub = this.cache.viewSettings(this.funcID).subscribe((views) => {
        if (views?.length > 0) {
          // this.afterLoad();
          this.crrFuncID = this.funcID;
          this.views = [];
          let idxActive = -1;
          let viewOut = false;
          this.viewsDefault.forEach((v, index) => {
            let idx = views.findIndex((x) => x.view == v.type);
            if (idx != -1) {
              v.hide = false;
              if (v.type != this.viewCrr) v.active = false;
              else v.active = true;
              if (views[idx].isDefault) idxActive = index;
            } else {
              v.hide = true;
              v.active = false;
              if (this.viewCrr == v.type) viewOut = true;
            }
            this.views.push(v);
          });
          if (!this.views.some((x) => x.active)) {
            if (idxActive != -1) this.views[idxActive].active = true;
            else this.views[0].active = true;

            let viewModel =
              idxActive != -1 ? this.views[idxActive] : this.views[0];
            this.view.viewActiveType = viewModel.type;
            this.view.viewChange(viewModel);
            if (viewOut) this.view.load();
          }

          this.detectorRef.detectChanges();
        }
      });
      this.subscription.add(sub)
    }
    return;
    // core Hảo sua roi nên không cân đoạn này nữa

    // if (this.crrFuncID != this.funcID) {
    //   this.cache.viewSettings(this.funcID).subscribe((views) => {
    //     if (views) {
    //       this.afterLoad();
    //       this.crrFuncID = this.funcID;
    //       this.views = [];
    //       let idxActive = -1;
    //       this.viewsDefault.forEach((v, index) => {
    //         let idx = views.findIndex((x) => x.view == v.type);
    //         if (idx != -1) {
    //           v.hide = false;
    //           if (v.type != this.viewCrr) v.active = false;
    //           else v.active = true;
    //           if (views[idx].isDefault) idxActive = index;
    //         } else {
    //           v.hide = true;
    //           v.active = false;
    //         }
    //         this.views.push(v);
    //       });
    //       if (!this.views.some((x) => x.active)) {
    //         if (idxActive != -1) this.views[idxActive].active = true;
    //         else this.views[0].active = true;

    //         let viewModel =
    //           idxActive != -1 ? this.views[idxActive] : this.views[0];
    //         //this.view.viewActiveType = viewModel.type;
    //         this.view.viewChange(viewModel);
    //         this.view.load();
    //       }

    //       this.detectorRef.detectChanges();
    //     }
    //   });
    // } else {
    //   //con loi daon nay khi select cung viewModel giua 2 componant
    //   // if (this.view.currentView.funcID != this.funcID) {
    //   //   this.view.currentView.funcID = this.funcID
    //   //   this.view.load();
    //   // }
    //   // this.view.currentView.refesh()
    // }
  }

  requestEnded(evt: any) {}

  onDragDrop(data) {
    if (this.crrStatus == data?.status) return;
    if (
      this.funcID == 'TMT0206' ||
      this.funcID == 'MWP0063' ||
      this.moreFunction?.length == 0 ||
      !this.validateDropKaban(data, this.crrStatus, data.status) // chan keo kanban
    ) {
      data.status = this.crrStatus;
      return;
    }

    var moreFun = this.moreFunction.find(
      (x) =>
        UrlUtil.getUrl('defaultValue', x?.url) == data.status &&
        UrlUtil.getUrl('defaultField', x?.url) == 'Status'
    );
    data.status = this.crrStatus;
    if (moreFun) this.changeStatusTask(moreFun, data);
  }

  //update Status of Tasks

  //codx-view select

  selectedChange(task: any) {
    this.itemSelected = task?.data ? task?.data : task;
    this.detectorRef.detectChanges();
  }

  receiveMF(e: any) {
    this.clickMF(e.e, e?.data);
  }
  receiveChangeMF(e) {
    this.changeDataMF(e.e, e?.data);
  }

  getParam(callback = null) {
    let sub = this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.param = param;
          this.paramModule = JSON.parse(JSON.stringify(param));
          this.paramDefaut = JSON.parse(JSON.stringify(param));
          return callback && callback(true);
        }
      });
      this.subscription.add(sub)
  }

  getTaskGroup(idTasKGroup, e, data) {
    let sub = this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskGroupBusiness',
        'GetAsync',
        idTasKGroup
      )
      .subscribe((res) => {
        if (res) {
          this.taskGroup = res;
          this.convertParameterByTaskGroup(res);
          this.clickMFAfterParameter(e, data);
        } else {
          this.param = JSON.parse(JSON.stringify(this.paramModule));
          this.clickMFAfterParameter(e, data);
        }
      });
      this.subscription.add(sub)
  }

  //#region Convert
  convertParameterByTaskGroup(taskGroup: TM_TaskGroups) {
    this.param.ApproveBy = taskGroup.approveBy;
    this.param.Approvers = taskGroup.approvers;
    this.param.ApproveControl = taskGroup.approveControl;
    this.param.AutoCompleted = taskGroup.autoCompleted;
    this.param.ConfirmControl = taskGroup.confirmControl;
    this.param.EditControl = taskGroup.editControl;
    this.param.LocationControl = taskGroup.locationControl;
    this.param.MaxHours = taskGroup.maxHours.toString();
    this.param.MaxHoursControl = taskGroup.maxHoursControl;
    this.param.PlanControl = taskGroup.planControl;
    this.param.ProjectControl = taskGroup.projectControl;
    this.param.UpdateControl = taskGroup.updateControl;
    this.param.VerifyBy = taskGroup.verifyBy;
    this.param.VerifyByType = taskGroup.verifyByType;
    this.param.VerifyControl = taskGroup.verifyControl;
    this.param.DueDateControl = taskGroup.dueDateControl;
    this.param.ExtendControl = taskGroup.extendControl;
    this.param.ExtendBy = taskGroup.extendBy;
    this.param.CompletedControl = taskGroup.completedControl;
  }
  //#endregion
  //region Popoverer
  popoverEmpList(p: any, task, mouseenter = true) {
    if (
      this.popoverCrr &&
      p != this.popoverCrr &&
      mouseenter &&
      this.popoverCrr.isOpen()
    ) {
      this.popoverCrr.close();
    }
    if (this.popoverDataSelected && this.popoverDataSelected.isOpen()) {
      this.popoverDataSelected.close();
    }
    if (p) {
      var element = document.getElementById(task?.taskID);
      if (element) {
        let t = this;
        this.timeoutId = setTimeout(function () {
          if (t.isHoverPop) return;
          t.isHoverPop = true;
          let sub = t.api
            .execSv<any>(
              'TM',
              'ERM.Business.TM',
              'TaskResourcesBusiness',
              'GetListTaskResourcesByTaskIDAsync',
              task.taskID
            )
            .subscribe((res) => {
              t.listTaskResousceSearch = [];
              t.countResource = 0;
              if (
                t.popoverCrr &&
                p != t.popoverCrr &&
                mouseenter &&
                t.popoverCrr.isOpen()
              )
                t.popoverCrr.close();
              if (t.popoverDataSelected && t.popoverDataSelected.isOpen()) {
                t.popoverDataSelected.close();
              }
              if (res) {
                t.listTaskResousce = res;
                t.listTaskResousceSearch = res;
                t.countResource = res.length;

                if (t.isHoverPop && p) p.open();
                if (p) t.popoverCrr = p;
              } else {
                this.listTaskResousceSearch = [];
                this.countResource = 0;
              }
              t.isHoverPop = false;
            });
            t.subscription.add(sub)
        }, 2000);
      }
    } else {
      if (this.timeoutId) clearTimeout(this.timeoutId);
    }
    // if (this.isHoverPop) return;
    // this.isHoverPop = true;
    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskResourcesBusiness',
    //     'GetListTaskResourcesByTaskIDAsync',
    //     task.taskID
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.listTaskResousce = res;
    //       this.listTaskResousceSearch = res;
    //       this.countResource = res.length;

    //       if (this.isHoverPop && p) p.open();
    //       this.popoverCrr = p;
    //     }
    //     this.isHoverPop = false;
    //   });
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }
    this.listTaskResousce.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }

  hoverPopover(p: any) {
    this.popoverDataSelected = p;
  }
  //#endregion
  //#region Confirm
  openConfirmStatusPopup(moreFunc, data) {
    if (data.owner != this.user.userID) {
      this.notiService.notifyCode('TM026');
      return;
    }
    // if (data.confirmControl != '0') {
    if (data.status > '10') {
      this.notiService.notifyCode('TM039');
      return;
    }
    var obj = {
      moreFunc: moreFunc,
      data: data,
      funcID: this.funcID,
      vll: this.vllConfirmStatus,
      action: 'confirm',
    };
    this.dialogConfirmStatus = this.callfc.openForm(
      PopupConfirmComponent,
      '',
      500,
      350,
      '',
      obj
    );
    let sub = this.dialogConfirmStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          let sub1 = this.view.dataService.update(obj).subscribe();
          this.subscription.add(sub1)
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
    this.subscription.add(sub)
  }

  //#endregion

  //#region ApproveStatus
  openApproveStatusPopup(moreFunc, data) {
    var obj = {
      moreFunc: moreFunc,
      data: data,
      funcID: this.funcID,
      vll: this.vllApproveStatus,
      action: 'approve',
    };
    this.dialogApproveStatus = this.callfc.openForm(
      PopupConfirmComponent,
      '',
      500,
      350,
      '',
      obj
    );
    let sub = this.dialogApproveStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        let sub1= this.view.dataService.update(e?.event).subscribe();
        this.subscription.add(sub1)
        this.itemSelected = e?.event;
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
    this.subscription.add(sub)
  }
  //#endregion
  //#region verifyStatus
  openVerifyStatusPopup(moreFunc, data) {
    var obj = {
      moreFunc: moreFunc,
      data: data,
      funcID: this.funcID,
      vll: this.vllVerifyStatus,
      action: 'verify',
    };
    this.dialogVerifyStatus = this.callfc.openForm(
      PopupConfirmComponent,
      '',
      500,
      350,
      '',
      obj
    );
    let sub = this.dialogVerifyStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          let sub1 = this.view.dataService.update(obj).subscribe();
          this.subscription.add(sub1)
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
    this.subscription.add(sub)
  }
  //#endregion

  //#region Cập nhật tiến độ
  openUpdateProgress(moreFunc, data) {
    if (data.owner != this.user.userID) {
      this.notiService.notifyCode('TM052');
      return;
    }
    if (data.status < '10') {
      this.notiService.notifyCode('TM061');
      return;
    }
    if (data.status == '50' || data.status == '80') {
      this.notiService.notifyCode('TM062');
      return;
    }

    var obj = {
      moreFunc: moreFunc,
      data: data,
      funcID: this.funcID,
    };
    this.dialogProgess = this.callfc.openForm(
      PopupUpdateProgressComponent,
      '',
      560,
      370,
      '',
      obj
    );
    let sub = this.dialogProgess.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        let kanban = (this.view.currentView as any).kanban;
        e?.event.forEach((obj) => {
          let sub1 = this.view.dataService.update(obj).subscribe();
          this.subscription.add(sub1)
          if (kanban) {
            kanban.updateCard(obj);
          }
        });
        this.itemSelected = e?.event[0];

        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
        this.detail.getDataHistoryProgress(this.itemSelected.recID);
      }
      this.detectorRef.detectChanges();
    });
    this.subscription.add(sub)
  }
  //#endregion

  //#region Yêu cầu gia hạn
  openExtendsAction(moreFunc, data) {
    if (data.owner != this.user.userID) {
      this.notiService.notifyCode('TM052');
      return;
    }

    //bo chuc nang nay di
    // if (data.isTimeOut) {
    //   this.notiService.notifyCode('TM023');
    //   return;
    // }

    // if (this.param.ExtendControl == '0') {
    //   this.notiService.notifyCode('TM021');
    //   return;
    // }

    if (data.extendStatus == '3') {
      let sub = this.api
        .execSv<any>(
          'TM',
          'TM',
          'TaskExtendsBusiness',
          'GetExtendDateByTaskIDAsync',
          [data.taskID]
        )
        .subscribe((dt) => {
          if (dt) {
            let sub1= this.notiService.alertCode('TM055').subscribe((confirm) => {
              if (confirm?.event && confirm?.event?.status == 'Y') {
                this.taskExtend = dt;
                this.confirmExtend(data, moreFunc);
              }
            });
            this.subscription.add(sub1)
          } else {
            if (data.createdBy != data.owner)
              this.taskExtend.extendApprover = data.createdBy;
            else this.taskExtend.extendApprover = data.verifyBy;
            this.taskExtend.dueDate = moment(new Date(data.dueDate)).toDate();
            this.taskExtend.reason = '';
            this.taskExtend.taskID = data?.taskID;
            this.taskExtend.extendDate = moment(
              new Date(data.dueDate)
            ).toDate();
            this.confirmExtend(data, moreFunc);
          }
        });
        this.subscription.add(sub)
    } else {
      if (data.createdBy != data.owner)
        this.taskExtend.extendApprover = data.createdBy;
      else this.taskExtend.extendApprover = data.verifyBy;
      this.taskExtend.dueDate = moment(new Date(data.dueDate)).toDate();
      this.taskExtend.reason = '';
      this.taskExtend.taskID = data?.taskID;
      this.taskExtend.extendDate = moment(new Date(data.dueDate)).toDate();
      this.confirmExtend(data, moreFunc);
    }
  }
  confirmExtend(data, moreFunc) {
    let sub = this.api
      .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
        this.taskExtend.extendApprover,
      ])
      .subscribe((res) => {
        if (res) {
          this.taskExtend.extendApproverName = res.userName;

          var obj = {
            moreFunc: moreFunc,
            data: this.taskExtend,
            funcID: this.funcID,
          };
          this.dialogExtends = this.callfc.openForm(
            PopupExtendComponent,
            '',
            500,
            425,
            '',
            obj
          );
          let sub1 = this.dialogExtends.closed.subscribe((e) => {
            if (e?.event && e?.event != null) {
              //gửi mail FE
              // this.tmSv
              //   .sendAlertMail(data?.recID, 'TM_0015', this.funcID)
              //   .subscribe();
              e?.event.forEach((obj) => {
                let sub2 = this.view.dataService.update(obj).subscribe();
                this.subscription.add(sub2)
              });
              this.itemSelected = e?.event[0];
              this.detail.taskID = this.itemSelected.taskID;
              this.detail.getTaskDetail();
            }
            this.detectorRef.detectChanges();
          });
          this.subscription.add(sub1)
        }
      });
      this.subscription.add(sub)
  }

  //region
  //Import file
  importFile() {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfc.openForm(
      CodxImportComponent,
      null,
      null,
      800,
      '',
      [gridModel, this.itemSelected.taskID],
      null
    );
  }
  //Export file
  exportFile() {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, this.itemSelected.taskID],
      null
    );
  }
  //#endregion

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    if (data.taskGroupID) this.getTaskGroup(data.taskGroupID, e, data);
    else {
      this.param = JSON.parse(JSON.stringify(this.paramDefaut));
      this.clickMFAfterParameter(e, data);
    }
  }

  clickMFAfterParameter(e, data) {
    this.titleAction = e.text;
    this.isAssignTask = data?.category == '3';
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS05':
        this.viewTask(data);
        break;
      // case 'sendemail':
      //   break;
      case 'TMT02015':
      case 'TMT02025':
      case 'TMT030115':
        this.assignTask(e.data, data);
        break;
      case 'TMT02016':
      case 'TMT02017':
        this.openConfirmStatusPopup(e.data, data);
        break;
      case 'TMT04021':
      case 'TMT04022':
      case 'TMT04023':
        this.openApproveStatusPopup(e.data, data); //danh gia kết qua
        break;
      case 'TMT04031':
      case 'TMT04032':
        this.openVerifyStatusPopup(e.data, data);
        break;
      case 'TMT02018':
      case 'TMT02026':
      case 'TMT02035':
      case 'TMT030116':
        this.openUpdateProgress(e.data, data);
        break;
      //Hoàn tất
      case 'TMT02011':
      case 'TMT02021':
      case 'TMT02031':
      case 'TMT030111':
      //Đang thực hiện
      case 'TMT02012':
      case 'TMT02022':
      case 'TMT02032':
      case 'TMT030112':
      //Hoãn lai
      case 'TMT02013':
      case 'TMT02023':
      case 'TMT02033':
      case 'TMT030113':
      //Hủy
      case 'TMT02014':
      case 'TMT02024':
      case 'TMT02034':
      case 'TMT030114':
        this.changeStatusTask(e.data, data);
        break;
      //gia han cv
      case 'TMT02019':
      case 'TMT02027':
      case 'TMT030117':
        this.openExtendsAction(e.data, data);
        break;
      case 'SYS008':
        if (this.view.viewActiveType == ViewType.kanban) {
          this.view.currentView.openSetting();
        }
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.view.formModel,
          this.view.dataService,
          this
        );
        this.detectorRef.detectChanges();
        break;
      }
    }
  }
  afterSave(e?: any, that: any = null) {
    //đợi xem chung sửa sao rồi làm tiếp
  }

  changeDataMF(e, data) {
    if (e && data) {
      // sua ngay 08/06/2023
      e.forEach((x) => {
        switch (x.functionID) {
          //tắt duyệt confirm
          case 'TMT02016':
          case 'TMT02017':
            if (!data.write || data.confirmStatus != '1') x.disabled = true;
            break;
          //an gia hạn cong viec
          case 'TMT02019':
          case 'TMT02027':
          case 'TMT030117':
            if (
              !data.write ||
              (data.verifyControl == '0' &&
                (data.category == '1' ||
                  (data.owner == data.createdBy && data.category == '2'))) ||
              data.status == '80' ||
              data.status == '90' ||
              data.status == '05' ||
              data.extendControl == '0'
            )
              x.disabled = true;
            break;
          //tắt duyệt xác nhận:
          case 'TMT04032':
          case 'TMT04031':
            if (data.verifyStatus != '1') x.disabled = true;
            break;
          //tắt duyệt đánh giá
          case 'TMT04021':
          case 'TMT04022':
          case 'TMT04023':
            if (data.approveStatus != '3') x.disabled = true;
            break;
          case 'SYS005':
            x.disabled = true;
            break;
          //an giao viec
          case 'TMT02015':
          case 'TMT02025':
          case 'TMT030115':
            if (
              !data.write ||
              data.status == '90' ||
              data.status == '80' ||
              data.status == '50' ||
              data.status == '05' ||
              data.status == '00'
            )
              x.disabled = true;
            break;
          //an cap nhat tien do khi hoan tat
          case 'TMT02018':
          case 'TMT02026':
          case 'TMT02035':
          case 'TMT030116':
            if (
              !data.write ||
              data.status == '90' ||
              data.status == '80' ||
              data.status == '05' ||
              data.status == '00'
            )
              x.disabled = true;
            break;
          //an voi ca TMT026
          //Xóa
          case 'SYS02':
            if (
              !data.write ||
              (data.category == '2' &&
                !(
                  data.parentID == null && data.createdBy == this.user?.userID
                )) ||
              data.status == '90' ||
              this.funcID == 'TMT0402' ||
              this.funcID == 'TMT0401' ||
              this.funcID == 'TMT0403' ||
              this.funcID == 'TMT0206' ||
              this.funcID == 'MWP0063' ||
              ((this.funcID == 'TMT03011' || this.funcID == 'TMT05011') &&
                data.category == '1' &&
                data.createdBy != this.user?.userID &&
                !this.user?.administrator)
            )
              x.disabled = true;
            break;
          // Edit
          case 'SYS03':
            if (
              !data.write ||
              data.status == '90' ||
              this.funcID == 'TMT0402' ||
              this.funcID == 'TMT0401' ||
              this.funcID == 'TMT0403' ||
              this.funcID == 'TMT0206' ||
              this.funcID == 'MWP0063' ||
              ((this.funcID == 'TMT03011' || this.funcID == 'TMT05011') &&
                data.category == '1' &&
                data.createdBy != this.user?.userID &&
                !this.user?.administrator)
            )
              x.disabled = true;
            break;
          case 'SYS04':
            if (
              !data.write ||
              this.funcID == 'TMT0206' ||
              this.funcID == 'MWP0063' ||
              this.funcID == 'TMT0402' ||
              this.funcID == 'TMT0401' ||
              this.funcID == 'TMT0403'
            )
              x.disabled = true;
            break;

          //ẩn more theo yêu cầu
          //Hoàn tất
          case 'TMT02011':
          case 'TMT02021':
          case 'TMT02031':
          case 'TMT030111':
            if (
              !data.write ||
              (data.status != '20' &&
                data.status != '10' &&
                data.status != '09')
            )
              x.disabled = true;
            break;
          //Đang thực hiện
          case 'TMT02012':
          case 'TMT02022':
          case 'TMT02032':
          case 'TMT030112':
            if (
              !data.write ||
              data.status == '20' ||
              data.status == '00' ||
              data.status == '05' ||
              data.status == '07'
            )
              x.disabled = true;
            break;
          //Hoãn lai
          case 'TMT02013':
          case 'TMT02023':
          case 'TMT02033':
          case 'TMT030113':
            if (
              !data.write ||
              data.status == '90' ||
              data.status == '50' ||
              data.status == '00' ||
              data.status == '05'
              // ||
              // data.status == '07'
            )
              x.disabled = true;
            break;
          //Hủy
          case 'TMT02014':
          case 'TMT02024':
          case 'TMT02034':
          case 'TMT030114':
            if (
              !data.write ||
              data.status == '80' ||
              data.status == '90' ||
              data.status == '00' ||
              data.status == '05'
            )
              x.disabled = true;
            break;
          case 'SYS05': //Bổ sung theo task chị Nhị issue - tắt mf xem tất cả các view duyệt - 24/01/2024 (Phúc làm)
            if (this.funcID == 'TMT0403' || this.funcID == 'TMT0402')
              x.disabled = true;
            break;
        }
      });
    }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    if (
      this.funcID == 'TMT0203' ||
      this.funcID == 'MWP0062' ||
      this.funcID == 'OMT014'
    )
      this.isAssignTask = true;
    else this.isAssignTask = false;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  onActions(e: any) {
    switch (e.type) {
      case 'drop':
        this.onDragDrop(e.data);
        break;
      case 'drag':
        this.crrStatus = e?.data?.status;
        break;
      case 'dbClick': //kaban
      case 'doubleClick': //lich
        if (e?.data) {
          this.itemSelected = e?.data;
          this.viewTask(e?.data);
        }
        break;
      case 'pined-filter':
        if (this.viewTree) {
          this.viewTree.gridModelTree.page = 1;
          this.viewTree.gridModelTree.filter = this.view.dataService.filter;
          this.viewTree.loadData();
        }

        // var index = this.view.views.findIndex((x) => x.active == true);
        // if (index != 1) {
        //   let type = this.view.views[index].type;
        //   if (type == 7 || type == 8) {
        //     // calender + schedule
        //     this.view.currentView['schedule'].dataService.filter.filters = [
        //       this.view.currentView['schedule'].dataService.filter.filters[0],
        //     ];
        //     if (Array.isArray(e.data) && e?.data?.length > 0) {
        //       this.view.currentView['schedule'].applyFilter(e.data);
        //     } else {
        //       this.view.currentView['schedule'].refresh();
        //     }

        //     //if (Array.isArray(e.data)) {
        //     //   e.data.forEach((filter: any) => {
        //     //     if (
        //     //       !this.view.currentView['schedule'].dataService.filter.filters
        //     //     ) {
        //     //       this.view.currentView['schedule'].dataService.filter.filters =
        //     //         [];
        //     //     }
        //     //     this.view.currentView[
        //     //       'schedule'
        //     //     ].dataService.filter.filters[0].filters.push(filter);
        //     //   });
        //     //   this.view.currentView['schedule'].refresh();
        //     //  }
        //   }
        // }
        break;
      case 'changeFavorite':
        if (this.viewTree) {
          this.viewTree.gridModelTree.page = 1;
          this.viewTree.gridModelTree.favoriteID = e.data.recID;
          this.viewTree.favoriteName = e.data.favorite;
          this.viewTree.loadData();
        }
        break;
      case 'search':
        if (this.viewTree) {
          this.viewTree.gridModelTree.page = 1;
          this.viewTree.gridModelTree.searchText = e.data;
          this.viewTree.loadData();
        }
        break;
    }
  }
  searchChanged(e) {
    console.log(e);
  }

  viewTask(data) {
    if (data) {
      var isAssignTask = data?.category == '3';
      var funcID = isAssignTask ? 'TMT0203' : 'TMT0201';
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      let obj = {
        data: data,
        action: 'view',
        isAssignTask: isAssignTask,
        titleAction: '',
        functionID: this.funcID,
      };
      this.callfc.openSide(
        PopupAddComponent,
        obj,
        // [data, 'view', isAssignTask, '', funcID],
        option
      );
    }
  }
  //#endregion

  change() {
    this.view.dataService.setPredicates(['Status=@0'], ['10']);
  }

  //#region schedule

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'owner' }, //trung voi idField của resourceField
  };
  resourceField = {
    Name: 'Resources',
    Field: 'owner',
    IdField: 'owner',
    TextField: 'userName',
    Title: 'Resources',
  };
  taskSettings = {
    id: 'taskID',
    name: 'taskName',
    startDate: 'startDate',
    endDate: 'endDate',
  };
  getCellContent(evt: any) {
    if (this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() == day.getFullYear() &&
          evt.getMonth() == day.getMonth() &&
          evt.getDate() == day.getDate()
        ) {
          var time = evt.getTime();
          var ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
          }
          if (this.dayoff[i].note) {
            return (
              '<icon class="' +
              this.dayoff[i].symbol +
              '"></icon>' +
              '<span>' +
              this.dayoff[i].note +
              '</span>'
            );
          } else return null;
        }
      }
    }

    return ``;
  }

  getDayCalendar(e) {
    var current_day = e.getDay();
    switch (current_day) {
      case 0:
        current_day = 'Chủ nhật';
        break;
      case 1:
        current_day = 'Thứ hai';
        break;
      case 2:
        current_day = 'Thứ ba';
        break;
      case 3:
        current_day = 'Thứ tư';
        break;
      case 4:
        current_day = 'Thứ năm';
        break;
      case 5:
        current_day = 'Thứ sáu';
        break;
      case 6:
        current_day = 'Thứ bảy';
        break;
    }

    return current_day;
  }

  getParams() {
    let sub = this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.calendarID = param.CalendarID;
          this.getDayOff(this.calendarID);
        }
      });
      this.subscription.add(sub)
  }

  getDayOff(id = null) {
    if (id) this.calendarID = id;
    let sub = this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarsBusiness',
        'GetDayWeekAsync',
        [this.calendarID]
      )
      .subscribe((res) => {
        if (res) {
          this.dayoff = res;
          //  res.forEach((ele) => {
          //   this.dayoff = res;
          // });
        }
      });
      this.subscription.add(sub)
  }
  //#endregion schedule

  getDataAsync(pObjectID: string) {
    if (pObjectID) {
      let sub = this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          pObjectID
        )
        .subscribe((res: any) => {
          if (res.length > 0) {
            return res.length;
          }
        });
        this.subscription.add(sub)
    }
  }

  clickShow(e, id) {
    let elementIcon = document.getElementById('icon-' + id);
    let element = document.getElementById(id);
    if (element && elementIcon) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        elementIcon.classList.remove('icon-keyboard_arrow_right');
        elementIcon.classList.add('icon-keyboard_arrow_down');
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
        elementIcon.classList.remove('icon-keyboard_arrow_down');
        elementIcon.classList.add('icon-keyboard_arrow_right');
      }
    }
  }

  getHtml(data) {
    return `<div id="point-${data.recID}" style="font-size:10px;font-weight:500;color:${this.color};fill:${this.color};margin-top: 2px;"><span>${data.percentage}</span></div>`;
  }
  genData(por) {
    return Number.parseInt(por) ?? 0;
  }

  openPopupTodoList(taskID) {
    let sub = this.tmSv.getListTaskGoad(taskID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listTaskGoals = res;
        let option = new DialogModel();
        //option.zIndex = 999;
        let popup = this.callfc.openForm(
          this.popupToDoList,
          '',
          400,
          500,
          '',
          null,
          '',
          option
        );
      }
    });
    this.subscription.add(sub)
  }

  //onLoading
  onLoading(e) {
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // if (!this.crrFuncID || (this.crrFuncID && this.funcID != this.crrFuncID))
    //   return;
    // this.afterLoad();
  }

  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  //return kanban ko cho kéo
  validateDropKaban(data, oldStatus, newStatus) {
    if (!data.write) return false;
    let check = true;
    switch (newStatus) {
      case '00':
        break;
      case '05':
        check = false;
        break;
      case '07':
        check = false;
        break;
      case '09':
        break;
      case '10':
        break;
      case '20':
        if (oldStatus == '00' || oldStatus == '05' || oldStatus == '07')
          check = false;
        break;
      case '50':
        if (oldStatus == '90' || oldStatus == '00' || oldStatus == '05')
          check = false;
        break;
      case '80':
        if (oldStatus == '90' || oldStatus == '00' || oldStatus == '05')
          check = false;
        break;
      case '90':
        if (oldStatus != '20' && oldStatus != '10') check = false;
        break;
    }
    return check;
  }

  //menu 2

  getSearchFav() {
   let sub =  this.api
      .execSv('SYS', 'SYS', 'SearchFavoriteBusiness', 'GetFavoriteAsync', [
        this.entityID,
        1,
        null,
        false,
      ])
      .subscribe((res: any) => {
        let favs = res?.favs;
        let favDefaultID = res?.defaultId;
        let favDefaultName = '';
        let arrChildren: Array<PageLink> = [];
        for (let i = 0; i < favs.length; i++) {
          if (favDefaultID == favs[i].recID) favDefaultName = favs[i].favorite;
          let pageLink: PageLink = {
            title: favs[i].favorite,
          };
          arrChildren.push(pageLink);
        }
        this.pageTitle.setChildren(arrChildren);

        this.setBreadCrumb(favDefaultName);

        // var favIDs: any[] = [];
        // favs.forEach((x: any) => {
        //   favIDs.push(x.recID);
        // });
        // let className = 'DataBusiness';
        // let methol = 'GetCountFavoriteAsync';
        // let assemblyName = 'Core';
        // if (
        //   this.funcID == 'TMT0206' ||
        //   this.funcID == 'TMT0301' ||
        //   this.funcID == 'TMT0302'
        // ) {
        //   assemblyName = 'TM';
        //   className = 'TaskBusiness';
        //   methol = 'CountFavoriteModuleAsync';
        // }
        // this.tmSv
        //   .countFavorite(this.funcID, favIDs, assemblyName, className, methol)
        //   .subscribe((res) => {
        //     favs.forEach((x: any) => {
        //       x.count = res ? res[x.recID] ?? 0 : 0;
        //     });
        //     //tram keu bo vao dday ne
        //     let arrChildren: Array<PageLink> = [];
        //     for (let i = 0; i < favs.length; i++) {
        //       let pageLink: PageLink = {
        //         title: favs[i].favorite,
        //         path: '',
        //         // this.rootFunction.module.toLowerCase() +
        //         // '/report/detail/' +
        //         // this.orgReportList[i].recID,
        //       };
        //       arrChildren.push(pageLink);
        //     }
        //     this.pageTitle.setChildren(arrChildren);
        //     // this.setBreadCrumb(this.func);
        //   });
      });
      this.subscription.add(sub)
  }
  setBreadCrumb(defaultName: any, deleteChild: boolean = false) {
    if (defaultName) {
      !deleteChild && this.pageTitle.setSubTitle(defaultName);
      deleteChild && this.pageTitle.setSubTitle('');
    }
  }
}
