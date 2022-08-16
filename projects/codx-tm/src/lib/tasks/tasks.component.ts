import {
  Component,
  TemplateRef,
  ViewChild,
  Injector,
  Input,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DataRequest,
  ViewModel,
  ViewType,
  RequestOption,
  ButtonModel,
  ResourceModel,
  SidebarModel,
  DialogRef,
  AuthStore,
  UrlUtil,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import * as moment from 'moment';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxImportComponent } from 'projects/codx-share/src/lib/components/codx-import/codx-import.component';
import { CodxTMService } from '../codx-tm.service';
import { TM_TaskGroups } from '../models/TM_TaskGroups.model';
import { TM_Parameter, TM_TaskExtends } from '../models/TM_Tasks.model';
import { PopupAddComponent } from './popup-add/popup-add.component';
import { PopupConfirmComponent } from './popup-confirm/popup-confirm.component';
import { PopupExtendComponent } from './popup-extend/popup-extend.component';
import { PopupUpdateProgressComponent } from './popup-update-progress/popup-update-progress.component';
import { PopupViewTaskResourceComponent } from './popup-view-task-resource/popup-view-task-resource.component';
import { UpdateStatusPopupComponent } from './update-status-popup/update-status-popup.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';
@Component({
  selector: 'codx-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TasksComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  //#region Constructor
  @Input() dataObj?: any;
  @Input() calendarID: string;
  @Input() viewPreset: string = 'weekAndDay';
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('eventTemplate') eventTemplate: TemplateRef<any>;
  @ViewChild('eventModel') eventModel?: TemplateRef<any>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('treeView') treeView: TemplateRef<any>;
  @ViewChild('detail') detail: ViewDetailComponent;
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  model?: DataRequest;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  modelResource: ResourceModel;
  resourceTree: ResourceModel;
  resource: ResourceModel;
  resourceTaskExtends: ResourceModel;
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
  funcID: string;
  gridView: any;
  isAssignTask = false;
  param: TM_Parameter;
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
  gridViewSetup: any;
  taskGroup: TM_TaskGroups;
  taskExtend: TM_TaskExtends = new TM_TaskExtends();
  dataTree = [];
  iterationID = '';
  meetingID = '';
  projectID?: any;

  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    // cmt truyền động để chạy debug cho nhanh
    // this.cache.functionList(this.funcID).subscribe(res=
    //   if(res){
    //     this.cache.gridViewSetup(res.formName, res.gridViewName).subscribe(result => {
    //       if (result){
    //         this.vllStatus = result.Status.referedValue ;
    //         this.vllApproveStatus = result.ApproveStatus.referedValue ;
    //         this.vllVerifyStatus = result.VerifyStatus.referedValue;
    //         this.vllExtendStatus = result.ExtendStatus.referedValue;
    //         this.vllConfirmStatus = result.ConfirmStatus.referedValue;
    //       }
    //     })
    //   }
    // })

    //để cái này chay test cho nhanh
    if (this.funcID == 'TMT0203') {
      this.vllStatus = this.vllStatusAssignTasks;
    } else {
      this.vllStatus = this.vllStatusTasks;
    }

    // this.activedRouter.params.subscribe((routeParams) => {
    //   var state = history.state;
    //   if (state) {
    //     this.iterationID = state.iterationID || '';
    //   }
    // });
    // this.activedRouter.firstChild?.params.subscribe(
    //   (data) => (this.iterationID = data.id)
    // );

    //  this.activedRouter.queryParams.subscribe((params) => {
    //   if (params) {
    //     this.meetingID = params?.meetingID;
    //     this.iterationID = params?.iterationID
    //   }
    // });
    // var dataObj = { view: '', calendarID: '', viewBoardID: this.iterationID };
    // this.dataObj = JSON.stringify(dataObj);
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    // this.activedRouter.queryParams.subscribe((params) => {
    //   if (params) {
    //     this.meetingID = params?.meetingID;
    //     this.iterationID = params?.iterationID;
    //   }
    // });

    // if (this.iterationID != '') {
    //   this.tmSv.getSprintsDetails(this.iterationID).subscribe((res) => {
    //     if (res) {
    //       this.projectID = res?.projectID;
    //       var resources = res.resources;
    //       this.dataObj = {
    //         projectID: this.projectID ? this.projectID : '',
    //         resources: resources ? resources : '',
    //         iterationID: this.iterationID ? this.iterationID : '',
    //       };
    //     }
    //   });
    // }
    // if (this.meetingID) {
    //   this.tmSv.getMeetingID(this.meetingID).subscribe((res) => {
    //     if (res) {
    //       this.projectID = res?.projectID;
    //       var resources = res.resources;
    //       this.dataObj = {
    //         projectID: this.projectID ? this.projectID : '',
    //         resources: resources ? resources : '',
    //       };
    //     }
    //   });
    // }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'TM';
    this.modelResource.className = 'TaskBusiness';
    this.modelResource.service = 'TM';
    this.modelResource.method = 'GetUserByTasksAsync';

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    this.request = new ResourceModel();
    this.request.service = 'TM';
    this.request.assemblyName = 'CM';
    this.request.className = 'DataBusiness';
    this.request.method = 'LoadDataAsync';
    this.request.idField = 'taskID';

    this.button = {
      id: 'btnAdd',
    };
    this.getParams();
  }

  ngAfterViewInit(): void {
    this.projectID = this.dataObj?.projectID;
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
        active: true,
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
        type: ViewType.schedule,
        active: false,
        sameData: true,
        request2: this.modelResource,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template: this.eventTemplate,
          template3: this.cellTemplate,
        },
      },
      // {
      //   type: ViewType.treedetail,
      //   active: false,
      //   sameData: true,
      //   // request2: this.resourceTree,
      //   model: {
      //     template: this.treeView,
      //   },
      // },
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
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = 'Auto';
      if (this.projectID)
        this.view.dataService.dataSelected.projectID = this.projectID;
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'add', this.isAssignTask],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        if (e?.event && e?.event != null) {
          this.view.dataService.data = e?.event.concat(
            this.view.dataService.data
          );
          this.view.dataService.setDataSelected(res[0]);
          this.view.dataService.afterSave.next(res);
          this.notiService.notifyCode('TM005');
          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
      });
    });
  }

  edit(data?) {
    if (data && !'00,07,09,10'.includes(data.status)) {
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
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = 'Auto';
      this.dialog = this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'copy', this.isAssignTask, data],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (e?.event == null)
          this.view.dataService.delete(
            [this.view.dataService.dataSelected],
            false
          );
        if (e?.event && e?.event != null) {
          this.view.dataService.data = e?.event.concat(
            this.view.dataService.data
          );
          this.view.dataService.setDataSelected(res[0]);
          this.view.dataService.afterSave.next(res);
          this.notiService.notifyCode('TM005');

          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
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
      if (e?.event && e?.event != null) {
        let listTask = e?.event;
        let newTasks = [];
        for (var i = 0; i < listTask.length; i++) {
          if (listTask[i].taskID == data.taskID) {
            this.view.dataService.update(listTask[i]).subscribe();
            this.view.dataService.setDataSelected(e?.event[0]);
          } else newTasks.push(listTask[i]);
        }
        if (newTasks.length > 0) {
          this.view.dataService.data = newTasks.concat(
            this.dialog.dataService.data
          );
          this.view.dataService.afterSave.next(newTasks);
        }
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
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = 'Auto';
        this.dialog = this.callfc.openSide(
          PopupAddComponent,
          [this.view.dataService.dataSelected, 'edit', this.isAssignTask],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
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
    } else
      this.updatStatusAfterCheck(
        moreFunc,
        taskAction,
        updateControl,
        maxHoursControl,
        maxHours
      );
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
            res.forEach((obj) => {
              this.view.dataService.update(obj).subscribe();
            });
            this.itemSelected = res[0];
            this.detectorRef.detectChanges();
            this.notiService.notifyCode('TM009');
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
      UpdateStatusPopupComponent,
      '',
      500,
      350,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
      }
      this.detectorRef.detectChanges();
    });
  }
  //#endregion
  //#region Event
  changeView(evt: any) {}

  requestEnded(evt: any) {}

  onDragDrop(e: any) {
    if (e.type == 'drop') {
      this.api
        .execSv<any>('TM', 'TM', 'TaskBusiness', 'UpdateAsync', e.data)
        .subscribe((res) => {
          if (res) {
            this.view.dataService.update(e.data);
          }
        });
    }
  }

  //update Status of Tasks

  //codx-view select

  selectedChange(task: any) {
    this.itemSelected = task?.data ?task?.data : task;
    this.loadTreeView();
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

  openViewListTaskResource(data) {
    this.dialog = this.callfc.openForm(
      PopupViewTaskResourceComponent,
      '',
      400,
      500,
      '',
      [data, this.funcID]
    );
  }

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
          // this.titlePopover =
          //   'Danh sách được phân công (' + this.countResource + ')';
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
      }
      this.detectorRef.detectChanges();
    });
    // }
    // else
    //   this.notiService.notify(
    //     'Bạn không thể thực hiện chức năng này với công việc đang chọn !'
    //   );
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
      // this.notiService.notifyCode('cần mess code Hảo ơi !!');
      this.notiService.notify(
        'Công việc chưa được xác nhận thực hiện ! Vui lòng xác nhận trước khi cập nhật tiến độ !'
      );
      return;
    }
    if (data.status == '50' || data.status == '80') {
      // this.notiService.notifyCode('cần mess code Hảo ơi !!');
      this.notiService.notify(
        'Công việc đang bị "Hoãn" hoặc bị "Hủy" ! Vui lòng chuyển trạng thái trước khi cập nhật tiến độ !'
      );
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
      500,
      350,
      '',
      obj
    );
    this.dialogProgess.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
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
              e?.event.forEach((obj) => {
                this.view.dataService.update(obj).subscribe();
              });
              this.itemSelected = e?.event[0];
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
      case 'TMT02044':
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
        if (
          (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
          data.confirmControl == '0'
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
      });
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  onActions(e: any) {
    if (e.type === 'dbClick') {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = 'Auto';
      this.callfc.openSide(
        PopupAddComponent,
        [this.view.dataService.dataSelected, 'view', this.isAssignTask],
        option
      );
    }
  }
  //#endregion

  //#region  tree
  loadTreeView() {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetListTasksTreeAsync',
        this.itemSelected?.taskID
      )
      .subscribe((res) => {
        if (res) this.dataTree = res;
      });
  }
  //#endregion
  change() {
    this.view.dataService.setPredicates(['Status=@0'], ['1']);
  }

  //#region schedule

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'userID' },
  };
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
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

  getParams() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.CM',
        'ParametersBusiness',
        'GetOneField',
        ['TMParameters', null, 'CalendarID']
      )
      .subscribe((res) => {
        if (res) {
          this.calendarID = res.fieldValue;
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
