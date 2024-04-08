import {
  AfterViewInit,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import {
  CM_Cases,
  CM_Contracts,
  CM_Customers,
  CM_Deals,
  CM_Leads,
} from '../../models/cm_model';
import { StepService } from 'projects/codx-dp/src/lib/share-crm/codx-step/step.service';
import { CodxViewTaskComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-view-task/codx-view-task.component';

@Component({
  selector: 'lib-view-calendar',
  templateUrl: './view-calendar.component.html',
  styleUrls: ['./view-calendar.component.css'],
})
export class ViewCalendarComponent
  extends UIComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('cellTemplate') cellTemplate!: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp!: TemplateRef<any>;
  @ViewChild('resourceHeader') resourceHeader!: TemplateRef<any>; //ressouce cuar schedule
  @ViewChild('eventTemplate') eventTemplate!: TemplateRef<any>; //event schedule
  @ViewChild('headerTempContent') headerTempContent!: TemplateRef<any>; //temp Content

  @ViewChild('popupChoiseTypeCM') popupChoiseTypeCM: TemplateRef<any>;

  @Input() viewActiveType = '7';
  views: Array<ViewModel> = [];
  requestSchedule: ResourceModel;
  modelResource: ResourceModel;

  fields = {
    id: 'recID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: 'owner' },
    status: 'taskType',
  };

  resourceField = {
    Name: 'Resources',
    Field: 'owner',
    IdField: 'owner',
    TextField: 'userName',
    Title: 'Resources',
  };

  vllTypeTask = 'DP050';
  dayoff: any;
  calendarID = 'STD';

  user: any;
  crrFuncID: any;

  formModelActivities: FormModel = {
    gridViewName: 'grvDPActivities',
    formName: 'DPActivities',
  };
  viewCrr: any;

  titleAction: string;
  button: ButtonModel[] = [
    {
      id: 'btnAdd',
    },
  ];

  taskType;
  popupTypeCM: DialogRef;
  fieldsGroup = { text: 'text', value: 'entityName' };
  fieldsStep = { text: 'stepName', value: 'recID' };

  fieldsCustomer = { text: 'customerName', value: 'recID' };
  fieldsLead = { text: 'leadName', value: 'recID' };
  fieldsDeal = { text: 'dealName', value: 'recID' };
  fieldsCase = { text: 'caseName', value: 'recID' };
  fieldsContract = { text: 'contractName', value: 'recID' };

  typeCMs = [
    { text: 'Khách hàng', entityName: 'CM_Customers', funcID: 'CM0101' },
    { text: 'Tiềm năng', entityName: 'CM_Leads', funcID: 'CM0205' },
    { text: 'Cơ hội', entityName: 'CM_Deals', funcID: 'CM0201' },
    { text: 'Chăm sóc khách hàng', entityName: 'CM_Cases', funcID: 'CM0401' },
    { text: 'Hợp đồng', entityName: 'CM_Contracts', funcID: 'CM0204' },
  ];

  insStep;
  listStep: any[];
  listLead: CM_Leads[];
  listDeal: CM_Deals[];
  listCase: CM_Cases[];
  listCustomer: CM_Customers[];
  listContract: CM_Contracts[];

  actionName = '';
  disableButton = true;
  objectID = '';
  isActivitie = false;
  isStepTask = false;
  fieldTypeCm = '';
  service = 'CM';
  entityName = 'CM_Contracts';
  className = 'ContractsBusiness';
  assemblyName = 'ERM.Business.CM';
  methodLoadData = 'GetAllContractsAsync';
  requestData = new DataRequest();
  listTaskType = [];
  isAdmin = false;
  constructor(
    private inject: Injector,
    private authstore: AuthStore,
    private cmService: CodxCmService,
    private stepService: StepService,
    private notiService: NotificationsService,
    private callFunc: CallFuncService
  ) {
    super(inject);
    this.router.params.subscribe((param: any) => {
      if (param.funcID) {
        this.funcID = param.funcID;
      }
    });
    this.user = this.authstore.get();
    this.afterLoad();
  }

  ngOnChanges() {
    this.getDayOff();
    this.afterLoad();
  }
  onInit(): void {
    this.getDayOff();
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTaskType = res.datas;
      }
    });
    this.api
      .exec<any>('CM', 'DealsBusiness', 'CheckAdminDealAsync', [])
      .subscribe((res) => {
        this.isAdmin = res ? true : false;
      });
  }
  ngAfterViewInit(): void {
    this.afterLoad();
    console.log(this.view.dataService);
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
          this.dayoff = res;
        }
      });
  }
  //#region view
  viewTask(
    data,
    customerName = '',
    dealName = '',
    contractName = '',
    leadName = ''
  ) {
    if (data) {
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      //a thao laasy refID
      let listRefIDAssign = '';

      let listData = {
        type: data?.taskType,
        value: data,
        step: null,
        isRoleAll: true,
        isUpdate: true,
        isOnlyView: true,
        isUpdateProgressGroup: false,
        listRefIDAssign: listRefIDAssign,
        instanceStep: null,
        isActivitie: true,
        // sessionID: this.sessionID, // session giao việc
        // formModelAssign: this.formModelAssign, // formModel của giao việc
        customerName,
        dealName,
        contractName,
        leadName,
      };
      let option = new SidebarModel();
      option.Width = '550px';
      option.zIndex = 1011;
      option.FormModel = frmModel;
      let dialog = this.callFunc.openSide(
        CodxViewTaskComponent,
        listData,
        option
      );
      dialog.closed.subscribe(async (dataOuput) => {
        // if (dataOuput?.event?.dataProgress) {
        //   this.handelProgress(data, dataOuput?.event?.dataProgress);
        // }
        // if(dataOuput?.event?.task || dataOuput?.event?.group){
        //   await this.getStepById();
        // }
      });
    }
  }
  //#endregion

  getCellContent(evt: any) {
    if (this.dayoff && this.dayoff.length > 0) {
      for (let i = 0; i < this.dayoff.length; i++) {
        let day = new Date(this.dayoff[i].startDate);
        if (
          day &&
          evt.getFullYear() === day.getFullYear() &&
          evt.getMonth() === day.getMonth() &&
          evt.getDate() === day.getDate()
        ) {
          let time = evt.getTime();
          let ele = document.querySelectorAll('[data-date="' + time + '"]');
          if (ele.length > 0) {
            ele.forEach((item) => {
              (item as any).style.backgroundColor = this.dayoff[i].color;
            });
            return (
              '<icon class="' +
              this.dayoff[i].symbol +
              '"></icon>' +
              '<span>' +
              this.dayoff[i].note +
              '</span>'
            );
          } else {
            return '';
          }
        }
      }
    }

    return ''; // Return a default value if no conditions are met
  }

  afterLoad() {
    //lấy list step istances step task + Activities => tmpEvents
    this.requestSchedule = new ResourceModel();
    this.requestSchedule.assemblyName = 'DP';
    this.requestSchedule.className = 'ActivitiesBusiness';
    this.requestSchedule.service = 'DP';
    this.requestSchedule.method = 'GetListEventCalendarAsync';
    this.requestSchedule.idField = 'recID';

    //xu ly khi truyeefn vao 1 list resourece
    this.modelResource = new ResourceModel();
    if (this.funcID == 'CM0702') {
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness_Old';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserBeLongToOrgOfAcountAsync';
    } else {
      //truyen lay resourse
      this.modelResource.assemblyName = 'HR';
      this.modelResource.className = 'OrganizationUnitsBusiness_Old';
      this.modelResource.service = 'HR';
      this.modelResource.method = 'GetListUserByResourceAsync';
      this.modelResource.dataValue = this.user.userID;
    }

    this.views = [
      {
        type: ViewType.calendar,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        showSearchBar: false,
        model: {
          eventModel: this.fields,
          // resourceModel: this.resourceField, //calendar  not take
          // template4: this.resourceHeader,
          template6: this.headerTempContent, //header morefun
          //template7: this.footerNone, ///footer
          // template: this.eventTemplate,
          //template2: this.headerTemp,
          template3: this.cellTemplate,
          template8: this.contentTmp, //content  nội dung chính
          statusColorRef: this.vllTypeTask,
        },
      },
      {
        type: ViewType.schedule,
        active: false,
        sameData: false,
        request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: false,
        model: {
          eventModel: this.fields,
          resourceModel: this.resourceField,
          template4: this.resourceHeader, //temp ressources
          template6: this.headerTempContent, //header // more
          //template7: this.footerNone, ///footer
          // template: this.eventTemplate, //lấy event của temo
          //template2: this.headerTemp,
          template3: this.cellTemplate, //tem cell
          template8: this.contentTmp, //content
          statusColorRef: this.vllTypeTask,
        },
      },
    ];
  }
  //#endregion setting

  showHour(stringDate: any) {
    const date: Date = new Date(stringDate);
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    const timeString: string = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    return timeString;
  }

  viewChanged(e) {
    this.viewCrr = e?.view?.type ?? '7';
    this.cmService.viewActiveType.next(this.viewCrr.toString());
    // this.viewCrr = evt?.view?.type;
    // this.funcID = this.router.snapshot.params['funcID'];
    // if (this.crrFuncID != this.funcID) {
    //   this.afterLoad();
    //   this.crrFuncID = this.funcID;
    //   this.view.load();
    //   this.view.currentView.refesh();
    // }
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.chooseTask();
        break;
    }
  }

  settingViews() {}

  //------------------More Func-----------------//
  //chua goi tho phan quyền -- đang full true
  changeDataMF(e, data) {}

  clickMF(e, data) {
    this.actionName = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(data);
        break;
      case 'SYS03':
        this.editTask(data);
        break;
      case 'SYS04':
        this.copyTask(data);
        break;
    }
  }

  //------------------More Func-----------------//

  onAction(e) {
    if (e?.type == 'doubleClick' && e?.data) {
      this.getParentTask(e?.data);
    }
    if (e?.type == 'fav' && e?.data) {
      this.beforeAddTask(e?.data);
    }
  }

  getParentTask(task) {
    if (task) {
      let recID = task?.recID;
      let taskGroupID = task?.taskGroupID;
      let stepID = task?.stepID;
      let instanceID = task?.instanceID;
      let objectID = task?.objectID;
      let objectType = task?.objectType;
      this.api
        .exec<any>('DP', 'ActivitiesBusiness', 'GetParentOfTaskAsync', [
          recID,
          taskGroupID,
          stepID,
          instanceID,
          objectID,
          objectType,
        ])
        .subscribe((res) => {
          if (res) {
            let customerName = res?.customerName;
            let dealName = res?.applyFor == '1' ? res?.parentTaskName : '';
            let contractName = res?.applyFor == '4' ? res?.parentTaskName : '';
            let leadName = res?.applyFor == '5' ? res?.parentTaskName : '';
            this.viewTask(task, customerName, dealName, contractName, leadName);
          } else {
            this.viewTask(task);
          }
        });
    }
  }

  async getTask(data, action = null) {
    let task;
    if (data) {
      const type = this.listTaskType?.find((t) => t?.value === data?.taskType);
      if (data?.entityName == 'DP_Instances_Steps_Tasks' && type) {
        task = await firstValueFrom(
          this.api.exec<any>(
            'DP',
            'InstancesStepsBusiness',
            'GetTaskInCalendarAsync',
            [data?.stepID, data?.recID, action]
          )
        );
        this.isStepTask = true;
        this.isActivitie = false;
      } else if (data?.entityName == 'DP_Activities' && type) {
        task = await firstValueFrom(
          this.api.exec<any>(
            'DP',
            'ActivitiesBusiness',
            'GetActivitieInCalendarAsync',
            [data?.recID]
          )
        );
        this.isStepTask = false;
        this.isActivitie = true;
      }
    }
    return task;
  }

  async chooseTask() {
    let typeTask = await this.stepService.chooseTypeTask(['G', 'F']);
    console.log(typeTask);
    if (typeTask) {
      this.beforeAddTask(typeTask);
    }
  }

  async beforeAddTask(taskType) {
    this.handleTask('calendar', taskType, 'add');
  }

  async handleTask(
    type,
    taskType,
    action,
    taskData = null,
    listInsStep = null
  ) {
    let dataInput = {
      action,
      titleName: this.titleAction,
      taskType,
      instanceStep: this.insStep,
      dataTask: taskData || {},
      type: type,
      isSave: false,
    };

    let taskOutput = await this.stepService.openPopupCodxTask(
      dataInput,
      'right'
    );
    let task = taskOutput?.task;
    this.isActivitie = taskOutput?.isActivitie;
    if (task && (action == 'add' || action == 'copy')) {
      this.isActivitie && this.addActivitie(task);
      !this.isActivitie && this.addStepTask(task);
    }
    return taskOutput;
  }

  addActivitie(task) {
    task['progress'] = 0;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;
    this.api
      .exec<any>('DP', 'ActivitiesBusiness', 'AddActivitiesAsync', [
        task,
        this.entityName,
      ])
      .subscribe((res) => {
        if (res) {
          this.convertDataCalendar(task);
          this.isActivitie = false;
          this.view.dataService.add(res).subscribe();
          this.view.currentView['schedule'].refresh();
          1;
          this.notiService.notifyCode('SYS006');
          this.detectorRef.detectChanges();
        }
      });
  }
  addStepTask(task) {
    console.log(task);
    this.api
      .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', task)
      .subscribe((res) => {
        if (res) {
          let task = res[0];
          this.convertDataCalendar(task);
          this.view.dataService.add(task).subscribe();
          this.view.currentView['schedule'].refresh();
          this.isStepTask = false;
          this.notiService.notifyCode('SYS006');
          this.detectorRef.detectChanges();
        }
      });
  }

  convertDataCalendar(taskData) {
    taskData.StartDate = taskData.ActualStart ?? taskData.StartDate;
    taskData.EndDate = taskData.ActualEnd ?? taskData.EndDate;
    taskData.isActual = taskData.ActualStart != null ? true : false;
    if (this.isStepTask) {
      taskData.entityName = 'DP_Instances_Steps_Tasks';
    } else if (this.isActivitie) {
      taskData.entityName = 'DP_Activities';
    }
  }
  //#endregion
  //#region edit task
  async editTask(data) {
    if (data) {
      const type = this.listTaskType?.find((t) => t?.value === data?.taskType);
      let task = await this.getTask(data);
      if (task) {
        let dataEdit = await this.handleTask('calendar', type, 'edit', task);
        if (dataEdit) {
          let taskEdit = dataEdit?.task;
          let fields = taskEdit.fields;
          if (!this.isActivitie) {
            this.api
              .exec<any>(
                'DP',
                'InstancesStepsBusiness',
                'UpdateTaskStepAsync',
                [taskEdit, fields]
              )
              .subscribe((res) => {
                if (res) {
                  this.convertDataCalendar(res);
                  this.view.dataService.update(res).subscribe();
                  this.view.currentView['schedule'].refresh();
                  this.detectorRef.detectChanges();
                  this.notiService.notifyCode('SYS007');
                }
              });
          }
          if (this.isActivitie) {
            this.api
              .exec<any>('DP', 'ActivitiesBusiness', 'EditActivitiesAsync', [
                taskEdit,
              ])
              .subscribe((res) => {
                if (res) {
                  this.convertDataCalendar(res);
                  this.view.dataService.update(res).subscribe();
                  this.view.currentView['schedule'].refresh();
                  this.detectorRef.detectChanges();
                  this.notiService.notifyCode('SYS007');
                }
              });
          }
        }
      } else {
        this.notiService.notifyCode('');
      }
    }
  }
  //#endregion

  //#region copy task
  async copyTask(data) {
    if (data) {
      const type = this.listTaskType?.find((t) => t?.value === data?.taskType);
      let task = await this.getTask(data, 'copy');
      if (task) {
        delete task?.id;
        await this.handleTask('calendar', type, 'copy', task);
      } else {
        this.notiService.notifyCode('Bạn không có quyền thêm công việc');
      }
    }
  }
  //#endregion

  //#region delete task
  async deleteTask(data) {
    if (data) {
      let task = await this.getTask(data);
      if (task?.isTaskDefault) {
        this.notiService.notifyCode('Bạn không có quyền xóa công việc này');
        return;
      }
      if (task) {
        this.notiService.alertCode('SYS030').subscribe((x) => {
          if (x.event && x.event.status == 'Y') {
            if (this.isStepTask) {
              this.api
                .exec<any>(
                  'DP',
                  'InstancesStepsBusiness',
                  'DeleteTaskStepAsync',
                  task
                )
                .subscribe((rec) => {
                  this.view.dataService.remove(rec).subscribe();
                  this.view.currentView['schedule'].refresh();
                  this.detectorRef.detectChanges();
                  this.notiService.notifyCode('SYS007');
                });
            } else if (this.isActivitie) {
              this.api
                .exec<any>(
                  'DP',
                  'ActivitiesBusiness',
                  'DeleteActivitiesAsync',
                  [task?.recID, task?.objectType]
                )
                .subscribe((res) => {
                  this.view.dataService.remove(res).subscribe();
                  this.view.currentView['schedule'].refresh();
                  this.detectorRef.detectChanges();
                  this.notiService.notifyCode('SYS007');
                });
            }
          }
        });
      } else {
        this.notiService.notifyCode('');
      }
    }
  }
  //#endregion
}
// async beforeAddTask(taskType) {
//   let option = new DialogModel();
//   let data = {
//     taskType,
//     isAdmin: this.isAdmin,
//   };
//   option.zIndex = 1001;
//   this.popupTypeCM = this.callfc.openForm(
//     PopupAddTaskCalendarComponent,
//     '',
//     650,
//     500,
//     '',
//     data,
//     '',
//     option
//   );
//   let dataOuput = await firstValueFrom(this.popupTypeCM.closed);
//   if (dataOuput?.event) {
//     let taskType = dataOuput?.event?.taskType;
//     let dataTypeCM = dataOuput?.event?.dataCheck;
//     let listInsStep = [];
//     if (dataTypeCM && taskType) {
//       this.isStepTask = dataTypeCM?.applyProcess;
//       this.isActivitie = !this.isStepTask;
//       if (this.isStepTask) {
//         this.api
//           .exec<any>(
//             'DP',
//             'InstancesStepsBusiness',
//             'GetInscestepCalendarAsync',
//             [dataTypeCM?.refID, dataTypeCM?.full]
//           )
//           .subscribe((res) => {
//             if (res) {
//               if (res?.length > 0) {
//                 this.handleTask(taskType, 'add', null, res);
//               }
//             }
//           });
//       } else {
//         this.entityName = dataTypeCM?.entityName;
//         this.objectID = dataTypeCM?.recID;
//         this.handleTask(taskType, 'add', null);
//       }
//     }
//   }
// }
