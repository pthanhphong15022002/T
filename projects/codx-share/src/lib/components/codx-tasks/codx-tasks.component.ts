import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogRef,
  NotificationsService,
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
import * as moment from 'moment';
import { CodxTasksService } from './codx-tasks.service';
import { ViewDetailComponent } from './view-detail/view-detail.component';
import { PopupAddComponent } from './popup-add/popup-add.component';
import { PopupConfirmComponent } from './popup-confirm/popup-confirm.component';
import { PopupUpdateProgressComponent } from './popup-update-progress/popup-update-progress.component';
import { PopupExtendComponent } from './popup-extend/popup-extend.component';
import { CodxImportComponent } from '../codx-import/codx-import.component';
import { CodxExportComponent } from '../codx-export/codx-export.component';
import { PopupUpdateStatusComponent } from './popup-update-status/popup-update-status.component';

@Component({
  selector: 'codx-tasks-share', ///tên vậy để sửa lại sau
  templateUrl: './codx-tasks.component.html',
  styleUrls: ['./codx-tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxTasksComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  //#region Constructor
  @Input() funcID?: any;
  @Input() dataObj?: any;
  @Input() showButtonAdd = true;
  @Input() showMoreFunc = true;
  @Input() refID?: any;
  @Input() refType?: any;

  @Input() calendarID: string;
  @Input() viewPreset: string = 'weekAndDay';
  @Input() service = 'TM';
  @Input() entityName = 'TM_Tasks';
  @Input() idField = 'taskID';
  @Input() assemblyName = 'ERM.Business.TM';
  @Input() className = 'TaskBusiness';
  @Input() method = 'GetTasksAsync';
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

  views: Array<ViewModel> = [];
  viewsActive: Array<ViewModel> = [];

  button?: ButtonModel = {
    id: 'btnAdd',
    // items: [{
    //   id: 'avc',
    //   text: 'xxyz'
    // }]
  };

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
  // funcID: string;
  gridView: any;
  isAssignTask = false;
  param: TM_Parameter = new TM_Parameter();
  paramModule: any;
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
  viewMode: any;
  projectID?: any;
  listViewModel = [];
  dataReferences = [];
  titleAction = '';
  // predicateSchedule: any;
  // dataValueSchedule: any;

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTasksService
  ) {
    super(inject);
    this.user = this.authStore.get();
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });

    // this.api.execSv<any>('TM',
    // 'TM',
    // 'TaskBusiness',
    // 'AutoUpdateIsOverDueAsync').subscribe();
  }

  //#region Init
  onInit(): void {
    // this.modelResource = new ResourceModel();
    // this.modelResource.assemblyName = 'TM';
    // this.modelResource.className = 'TaskBusiness';
    // this.modelResource.service = 'TM';
    // this.modelResource.method = 'GetUserByTasksAsync';

    this.modelResource = new ResourceModel();
    if (this.funcID != 'TMT03011') {
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';
    } else {
      //xu ly khi truyeefn vao 1 list resourece
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserByResourceAsync';
      this.modelResource.dataValue = this.dataObj?.resources;
    }

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    this.request = new ResourceModel();
    this.request.service = 'TM';
    this.request.assemblyName = 'TM';
    this.request.className = 'TaskBusiness';
    this.request.method = 'GetTasksAsync';
    this.request.idField = 'taskID';
    this.request.dataObj = this.dataObj;

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'TM';
    this.requestSchedule.assemblyName = 'TM';
    this.requestSchedule.className = 'TaskBusiness';
    this.requestSchedule.method = 'GetTasksWithScheduleAsync';
    this.requestSchedule.idField = 'taskID';

    this.requestTree = new ResourceModel();
    this.requestTree.service = 'TM';
    this.requestTree.assemblyName = 'TM';
    this.requestTree.className = 'TaskBusiness';
    this.requestTree.method = 'GetListTreeDetailTasksAsync';
    this.requestTree.idField = 'taskID';
    this.getParams();
  }

  ngAfterViewInit(): void {
    ////cái này để show phân công- chưa có biến nào để xác định là Công việc của tôi hay Giao việc -Trao đổi lại
    //chay code chet cho nhanh, muon dong thi bat len
    // this.cache.functionList(this.funcID).subscribe(f => {
    //   if (f) {
    //     this.cache.gridViewSetup(f?.formName, f?.gridViewName).subscribe(res => {
    //        if(res){
    //         this.vllPriority = res['Priority']['referedValue']
    //         this.vllStatus = res['Status']['referedValue']
    //         this.vllApproveStatus = res['ApproveStatus']['referedValue']
    //         this.vllConfirmStatus = res['ConfirmStatus']['referedValue']
    //         this.vllVerifyStatus = res['VerifyStatus']['referedValue']
    //         this.vllExtendStatus = res['ExtendStatus']['referedValue']
    //        }
    //     })
    //   }
    // })
    if (this.funcID == 'TMT0203') {
      this.vllStatus = this.vllStatusAssignTasks;
    } else {
      this.vllStatus = this.vllStatusTasks;
    }
    this.projectID = this.dataObj?.projectID;
    this.viewMode = this.dataObj?.viewMode;
    this.views = [
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
        sameData: true,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template7: this.footerNone, ///footer
          template4: this.resourceHeader,
          template6: this.mfButton, //header
          // template: this.eventTemplate,
          template2: this.headerTemp,
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
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template7: this.footerNone, ///footer
          template4: this.resourceHeader,
          template6: this.mfButton, //header
          // template: this.eventTemplate, lấy event của temo
          template2: this.headerTemp,
          template3: this.cellTemplate,
          template8: this.contentTmp, //content
          statusColorRef: this.vllStatus,
        },
      },
      {
        type: ViewType.content,
        active: false,
        sameData: false,
        text: 'Cây',
        icon: 'icon-account_tree',
        // request: {
        //   idField: 'recID',
        //   parentIDField: 'ParentID',
        //   service: 'TM',
        //   assemblyName: 'TM',
        //   className: 'TaskBusiness',
        //   method: 'GetTasksAsync',
        //   autoLoad: true,
        //   dataObj: null,
        // },
        model: {
          panelLeftRef: this.treeView,
        },
      },
    ];

    this.view.dataService.methodSave = 'AddTaskAsync';
    this.view.dataService.methodUpdate = 'UpdateTaskAsync';
    this.view.dataService.methodDelete = 'DeleteTaskAsync';
    this.getParam();
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      // option.zIndex = 5000;
      if (this.projectID)
        this.view.dataService.dataSelected.projectID = this.projectID;
      if (this.refID) this.view.dataService.dataSelected.refID = this.refID;
      if (this.refType)
        this.view.dataService.dataSelected.refType = this.refType;

      var dialog = this.callfc.openSide(
        PopupAddComponent,
        [
          this.view.dataService.dataSelected,
          'add',
          this.isAssignTask,
          this.titleAction,
          this.funcID,
        ],
        option
      );
      dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
      });
    });
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
      return;
    }

    var isCanEdit = true;
    this.api
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
              isCanEdit = false;
              return;
            }
          });
          if (!isCanEdit) {
            this.notiService.notifyCode('TM016');
          } else {
            this.editConfirm(data);
          }
        }
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [
          this.view.dataService.dataSelected,
          'copy',
          this.isAssignTask,
          this.titleAction,
          this.funcID,
          data,
        ],
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

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    if (data.status == '90') {
      this.notiService.notifyCode('TM017');
      return;
    }
    if (data.category == '2') {
      this.notiService.notifyCode('TM018');
      return;
    }
    if (data.category == '1') {
      this.deleteConfirm(data);
      return;
    }
    var isCanDelete = true;
    this.api
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
  }

  assignTask(moreFunc, data) {
    this.view.dataService.dataSelected = data;
    var vllControlShare = 'TM003';
    var vllRose = 'TM001';
    var title = moreFunc.customName;
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = '550px';
    this.dialog = this.callfc.openSide(
      AssignInfoComponent,
      [this.view.dataService.dataSelected, vllControlShare, vllRose, title],
      option
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event == null)
        this.view.dataService.delete(
          [this.view.dataService.dataSelected],
          false
        );
      if (e?.event && e?.event != null && e?.event[1] != null) {
        if (e.event[0]) {
          this.itemSelected = data;
          this.detail.taskID = this.itemSelected.taskID;
          this.detail.getTaskDetail();
        }
        //cai này cần dùng khi TMT0202
        // let listTask = e?.event[1];
        // let newTasks = [];
        // for (var i = 0; i < listTask.length; i++) {
        //   if (listTask[i].taskID == data.taskID) {
        //     this.view.dataService.update(listTask[i]).subscribe();
        //     this.view.dataService.setDataSelected(listTask[i]);
        //   } else newTasks.push(listTask[i]);
        // }
        // if (newTasks.length > 0) {
        //   this.view.dataService.data = newTasks.concat(
        //     this.dialog.dataService.data
        //   );
        //   this.view.dataService.afterSave.next(newTasks);
        // }
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

  //#region Function
  editConfirm(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        this.dialog = this.callfc.openSide(
          PopupAddComponent,
          [
            this.view.dataService.dataSelected,
            'edit',
            this.isAssignTask,
            this.titleAction,
            this.funcID,
          ],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          if (e?.event && e?.event != null) {
            this.view.dataService.update(e?.event).subscribe();
            this.itemSelected = e?.event;
            this.detail.taskID = this.itemSelected.taskID;
            this.detail.getTaskDetail();
          }
          this.detectorRef.detectChanges();
        });
      });
  }

  deleteConfirm(data) {
    this.notiService.alertCode('TM003').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        this.tmSv.deleteTask(data.taskID).subscribe((res) => {
          if (res) {
            var listTaskDelete = res[0];
            var parent = res[1];
            listTaskDelete.forEach((x) => {
              this.view.dataService.remove(x).subscribe();
            });
            this.view.dataService.onAction.next({ type: 'delete', data: data });
            this.notiService.notifyCode('TM004');
            if (parent) {
              this.view.dataService.update(parent).subscribe();
            }
            this.itemSelected = this.view.dataService.data[0];
            this.detectorRef.detectChanges();
          }
        });
      }
    });
  }

  beforDelete(opt: RequestOption) {
    opt.methodName = 'DeleteTaskAsync';
    opt.data = this.itemSelected.taskID;
    return true;
  }

  changeStatusTask(moreFunc, taskAction) {
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
          Number.parseFloat(this.paramModule.ReOpenDays) * 3600000;
        var timeCompletedOn = moment(new Date(taskAction.completedOn))
          .toDate()
          .getTime();
        if (time > timeCompletedOn) {
          this.notiService.notifyCode('TM053');
          return;
        }
      }
      this.notiService.alertCode('TM054').subscribe((confirm) => {
        if (confirm?.event && confirm?.event?.status == 'Y') {
          this.confirmUpdateStatus(moreFunc, taskAction);
        }
      });
    } else this.confirmUpdateStatus(moreFunc, taskAction);
  }

  confirmUpdateStatus(moreFunc, taskAction) {
    // const fieldName = 'UpdateControl';
    if (taskAction.taskGroupID) {
      this.api
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
              this.paramModule.UpdateControl,
              this.paramModule.MaxHoursControl,
              this.paramModule.MaxHours,
              this.paramModule.CompletedControl
            );
          }
        });
    } else {
      this.actionUpdateStatus(
        moreFunc,
        taskAction,
        this.paramModule.UpdateControl,
        this.paramModule.MaxHoursControl,
        this.paramModule.MaxHours,
        this.paramModule.CompletedControl
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
    if (status == '90' && completedControl != '0') {
      var isCheck = false;
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTaskChildDetailAsync',
          taskAction.taskID
        )
        .subscribe((res) => {
          if (res) {
            res.forEach((obj) => {
              if (obj.status != '90' && obj.status != '80') {
                isCheck = true;
                return;
              }
            });
            if (isCheck) {
              this.notiService.notifyCode('TM008');
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
    } else if (status == '80') {
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
    var isCheck = false;
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTaskChildDetailAsync',
        taskAction.taskID
      )
      .subscribe((res) => {
        if (res) {
          res.forEach((element) => {
            if (element.status != '00' && element.status != '10') {
              isCheck = false;
              return;
            }
          });
          if (isCheck) {
            this.notiService.notifyCode('TM008');
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

      this.tmSv
        .setStatusTask(
          this.funcID,
          taskAction.taskID,
          status,
          completedOn,
          completed,
          ''
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            let kanban = (this.view.currentView as any).kanban;
            res.forEach((obj) => {
              this.view.dataService.update(obj).subscribe();
              if (kanban) kanban.updateCard(obj);
            });
            this.itemSelected = res[0];
            this.detectorRef.detectChanges();
            this.notiService.notifyCode('TM009');
            if (taskAction.category == '3' && status == '80')
              this.tmSv
                .sendAlertMail(taskAction.recID, 'TM_0004', this.funcID)
                .subscribe();
            if (status == '90' && taskAction.approveControl == '1') {
              this.tmSv
                .sendAlertMail(taskAction.recID, 'TM_0012', this.funcID)
                .subscribe();
            }
          } else {
            this.notiService.notifyCode('TM008');
          }
        });
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
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        let kanban = (this.view.currentView as any).kanban;
        e?.event.forEach((obj) => {
          if (kanban) {
            kanban.updateCard(obj);
          }
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
  }
  //#endregion
  //#region Event
  changeView(evt: any) {
    // let idx = -1;
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];

    // idx = this.viewsActive.findIndex((x) => x.id === '8');
    if (this.funcID != 'TMT0201') {
      if (this.funcID == 'TMT0203') {
        this.requestSchedule.predicate = 'Category=@0 and CreatedBy=@1';
        this.requestSchedule.dataValue = '2;' + this.user.userID;
      } else {
        this.requestSchedule.predicate = 'Category=@0 or Category=@1';
        this.requestSchedule.dataValue = '1;2';

        this.dataObj = null;
      }
    }
    //   if (idx > -1) return;
    //   var schedule = {
    //     id: '8',
    //     type: ViewType.schedule,
    //     active: false,
    //     sameData: false,
    //     request: this.requestSchedule,
    //     request2: this.modelResource,
    //     model: {
    //       eventModel: this.fields,
    //       resourceModel: this.resourceField,
    //       template4: this.resourceHeader,
    //       template: this.eventTemplate,
    //       template3: this.cellTemplate,
    //       statusColorRef: this.vllStatus,
    //     },
    //   };
    //   this.viewsActive.push(schedule);
    // } else {
    //   if (idx > -1) this.viewsActive.splice(idx, 1);
    // }

    // idx = this.viewsActive.findIndex((x) => x.id === '16');
    // if (this.funcID == 'TMT0203') {
    //   if (idx > -1) return;
    //   var tree = {
    //     id: '16',
    //     type: ViewType.content,
    //     active: false,
    //     sameData: false,
    //     text: 'Cây',
    //     icon: 'icon-account_tree',
    //     // request: {
    //     //   idField: 'recID',
    //     //   parentIDField: 'ParentID',
    //     //   service: 'TM',
    //     //   assemblyName: 'TM',
    //     //   className: 'TaskBusiness',
    //     //   method: 'GetTasksAsync',
    //     //   autoLoad: true,
    //     //   dataObj: null,
    //     // },
    //     model: {
    //       // template: this.treeView,
    //       panelLeftRef: this.treeView
    //     },
    //   };
    //   this.viewsActive.push(tree);
    // } else {
    //   if (idx > -1) this.viewsActive.splice(idx, 1);
    // }
  }

  requestEnded(evt: any) {}

  onDragDrop(data) {
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateAsync', data)
      .subscribe((res) => {
        if (res) {
          this.view.dataService.update(data);
        }
      });
  }

  //update Status of Tasks

  //codx-view select

  selectedChange(task: any) {
    this.itemSelected = task?.data ? task?.data : task;
    this.detectorRef.detectChanges();
  }

  receiveMF(e: any) {
    this.clickMF(e.e, this.itemSelected);
  }

  getParam(callback = null) {
    this.api
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
          this.paramModule = param;
          return callback && callback(true);
        }
      });
  }

  getTaskGroup(idTasKGroup, e, data) {
    this.api
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
          this.param = this.paramModule;
          this.clickMFAfterParameter(e, data);
        }
      });
  }

  //#region Convert
  convertParameterByTaskGroup(taskGroup: TM_TaskGroups) {
    this.param.ApproveBy = taskGroup.approveBy;
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

  popoverEmpList(p: any, task) {
    this.listTaskResousceSearch = [];
    this.countResource = 0;
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) this.popoverDataSelected.close();
    }
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskResourcesBusiness',
        'GetListTaskResourcesByTaskIDAsync',
        task.taskID
      )
      .subscribe((res) => {
        if (res) {
          this.listTaskResousce = res;
          this.listTaskResousceSearch = res;
          this.countResource = res.length;
          p.open();
          this.popoverCrr = p;
        }
      });
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
    this.dialogConfirmStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
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
    this.dialogApproveStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
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
    this.dialogVerifyStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
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
      // this.notiService.notify(
      //   'Công việc chưa được xác nhận thực hiện ! Vui lòng xác nhận trước khi cập nhật tiến độ !'
      // );
      return;
    }
    if (data.status == '50' || data.status == '80') {
      this.notiService.notifyCode('TM062');
      // this.notiService.notify(
      //   'Công việc đang bị "Hoãn" hoặc bị "Hủy" ! Vui lòng chuyển trạng thái trước khi cập nhật tiến độ !'
      // );
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
      360,
      '',
      obj
    );
    this.dialogProgess.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
        this.detail.taskID = this.itemSelected.taskID;
        this.detail.getTaskDetail();
      }
      this.detectorRef.detectChanges();
    });
  }
  //#endregion

  //#region Yêu cầu gia hạn
  openExtendsAction(moreFunc, data) {
    if (data.owner != this.user.userID) {
      this.notiService.notifyCode('TM052');
      return;
    }
    if (data.isTimeOut) {
      this.notiService.notifyCode('TM023');
      return;
    }

    if (this.param.ExtendControl == '0') {
      this.notiService.notifyCode('TM021');
      return;
    }

    if (data.extendStatus == '1') {
      this.notiService.alertCode('TM055').subscribe((confirm) => {
        if (confirm?.event && confirm?.event?.status == 'Y') {
          this.confirmExtend(data, moreFunc);
        }
      });
    } else {
      this.confirmExtend(data, moreFunc);
    }
  }
  confirmExtend(data, moreFunc) {
    if (data.createdBy != data.owner)
      this.taskExtend.extendApprover = data.createdBy;
    else this.taskExtend.extendApprover = data.verifyBy;
    this.taskExtend.dueDate = moment(new Date(data.dueDate)).toDate();
    this.taskExtend.reason = '';
    this.taskExtend.taskID = data?.taskID;
    this.taskExtend.extendDate = moment(new Date()).toDate();
    this.api
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
            400,
            '',
            obj
          );
          this.dialogExtends.closed.subscribe((e) => {
            if (e?.event && e?.event != null) {
              this.tmSv
                .sendAlertMail(data?.recID, 'TM_0015', this.funcID)
                .subscribe();
              e?.event.forEach((obj) => {
                this.view.dataService.update(obj).subscribe();
              });
              this.itemSelected = e?.event[0];
              this.detail.taskID = this.itemSelected.taskID;
              this.detail.getTaskDetail();
            }
            this.detectorRef.detectChanges();
          });
        }
      });
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
      this.param = this.paramModule;
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
      case 'sendemail':
        break;
      case 'TMT02015':
      case 'TMT02025':
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
        this.openUpdateProgress(e.data, data);
        break;
      case 'TMT02011':
      case 'TMT02012':
      case 'TMT02013':
      case 'TMT02014':
      case 'TMT02031':
      case 'TMT02032':
      case 'TMT02033':
      case 'TMT02034':
        this.changeStatusTask(e.data, data);
        break;
      case 'TMT02019':
        this.openExtendsAction(e.data, data);
        break;
      case 'SYS001': // cái này phải xem lại , nên có biến gì đó để xét
        //Chung làm
        this.importFile();
        break;
      case 'SYS002': // cái này phải xem lại , nên có biến gì đó để xét
        //Chung làm
        this.exportFile();
        break;
      case 'SYS003': // cái này phải xem lại , nên có biến gì đó để xét
        //???? chắc làm sau ??
        break;
    }
  }

  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        //tắt duyệt confirm
        if (
          (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
          (data.confirmControl == '0' || data.confirmStatus != '1')
        ) {
          x.disabled = true;
        }
        if (
          x.functionID == 'TMT02019' &&
          data.verifyControl == '0' &&
          data.category == '1'
        ) {
          x.disabled = true;
        }
        //tắt duyệt xác nhận
        if (
          (x.functionID == 'TMT04032' || x.functionID == 'TMT04031') &&
          data.verifyStatus != '1'
        ) {
          x.disabled = true;
        }
        //tắt duyệt đánh giá
        if (
          (x.functionID == 'TMT04021' ||
            x.functionID == 'TMT04022' ||
            x.functionID == 'TMT04023') &&
          data.approveStatus != '3'
        ) {
          x.disabled = true;
        }
        //an giao viec 
        if (
          x.functionID =='SYS005'
        ) {
          x.disabled = true;
        }
      });
    }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    if (this.funcID == 'TMT0203') this.isAssignTask = true;
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
      case 'dbClick':
        this.viewTask(e?.data);
        break;
    }
  }

  viewTask(data) {
    if (data) {
      var isAssignTask = data?.category == '3';
      var funcID = isAssignTask ? 'TMT0203' : 'TMT0201';
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.callfc.openSide(
        PopupAddComponent,
        [data, 'view', isAssignTask, funcID],
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

  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
    console.log(evt);
    // lấy ra ngày bắt đầu và ngày kết thúc trong evt
    this.startDate = evt?.fromDate;
    this.endDate = evt?.toDate;
    //Thêm vào option predicate
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate, logic: 'and' },
        { operator: 'lte', field: fied, value: this.endDate, logic: 'and' },
      ],
    };
  }

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
          return (
            '<icon class="' +
            this.dayoff[i].symbol +
            '"></icon>' +
            '<span>' +
            this.dayoff[i].note +
            '</span>'
          );
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
    this.api
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
  }

  getDayOff(id = null) {
    if (id) this.calendarID = id;
    this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarsBusiness',
        'GetDayWeekAsync',
        [this.calendarID]
      )
      .subscribe((res) => {
        if (res) {
          res.forEach((ele) => {
            this.dayoff = res;
          });
        }
      });
  }
  //#endregion schedule
}
