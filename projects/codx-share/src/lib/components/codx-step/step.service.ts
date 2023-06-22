import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxService,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import { TM_Tasks } from '../codx-tasks/model/task.model';
import { AssignTaskModel } from '../../models/assign-task.model';
import { AssignInfoComponent } from '../assign-info/assign-info.component';
import { CodxTypeTaskComponent } from './codx-type-task/codx-type-task.component';
import { firstValueFrom } from 'rxjs';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_Tasks,
} from 'projects/codx-dp/src/lib/models/models';
import { CodxAddGroupTaskComponent } from './codx-add-group-task/codx-add-group-task.component';
import { CodxAddTaskComponent } from './codx-add-stask/codx-add-task.component';
import { CodxAddBookingCarComponent } from '../codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { CodxCalendarService } from '../codx-calendar/codx-calendar.service';

@Injectable({
  providedIn: 'root',
})
export class StepService {
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private cache: CacheService,
    private calendarService: CodxCalendarService,
    private codxService: CodxService
  ) {}

  checkTaskLink(task, step) {
    let check = true;
    let tasks = step?.tasks;
    if (task?.parentID && tasks?.length > 0) {
      //check công việc liên kết hoàn thành trước
      let taskName = '';
      let listID = task?.parentID.split(';');
      listID?.forEach((item) => {
        let taskFind = tasks?.find((task) => task.refID == item);
        if (taskFind?.progress != 100) {
          check = false;
          taskName = taskFind?.taskName;
        }
      });
      if (!check) {
        this.notiService.notifyCode('DP023', 0, "'" + taskName + "'");
      }
    }
    return check;
  }

  checkUpdateProgress(
    dataUpdate,
    type,
    step,
    isRoleAll,
    isOnlyView,
    isUpdateProgressGroup,
    isUpdateProgressStep,
    user
  ) {
    if (isOnlyView) {
      if (type == 'P') {
        return isUpdateProgressStep && isRoleAll ? true : false;
      } else if (type == 'G') {
        let isGroup = false;
        if (!isRoleAll) {
          isGroup = this.checRoleTask(dataUpdate, 'O', user);
        }
        return isUpdateProgressGroup && (isRoleAll || isGroup) ? true : false;
      } else {
        let isGroup = false;
        let isTask = false;
        if (!isRoleAll) {
          let group = step?.taskGroups?.find(
            (g) => g.refID == dataUpdate?.taskGroupID
          );
          isGroup = group ? this.checRoleTask(group, 'O', user) : false;
          if (!isGroup) {
            isTask = this.checRoleTask(dataUpdate, 'O', user);
          }
        }
        return isRoleAll || isGroup || isTask ? true : false;
      }
    }
    return false;
  }

  checRoleTask(data, type, user) {
    let check =
      data?.roles?.some(
        (element) =>
          element?.objectID == user.userID && element.roleType == type
      ) || false;
    return check;
  }
  //setDeFault
  getDefault(funcID, entityName) {
    return this.api.execSv<any>(
      'CO',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName]
    );
  }

  assignTask(moreFunc, stepTask, instanceStep) {
    if (stepTask?.assigned == '1') {
      this.notiService.notify('tesst kiem tra da giao task');
      return;
    }
    var task = new TM_Tasks();
    task.taskName = stepTask.taskName;
    task.refID = stepTask?.recID;
    task.refType = 'DP_Instances_Steps_Tasks';
    task.dueDate = stepTask?.endDate;
    task.sessionID = instanceStep?.instanceID;
    let dataReferences = [
      {
        recIDReferences: stepTask.recID,
        refType: 'DP_Instances_Steps_Tasks',
        createdOn: stepTask.createdOn,
        memo: stepTask.taskName,
        createdBy: stepTask.createdBy,
      },
    ];
    let assignModel: AssignTaskModel = {
      vllRole: 'TM001',
      title: moreFunc.customName,
      vllShare: 'TM003',
      task: task,
    };

    let option = new DialogModel();
    option.FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      funcID: 'DPT040102',
      gridViewName: 'grvDPInstancesStepsTasks',
    };

    var dialogAssign = this.callfc.openForm(
      AssignInfoComponent,
      '',
      600,
      800,
      '',
      assignModel,
      '',
      option
    );

    dialogAssign.closed.subscribe((e) => {
      var doneSave = false;
      if (e && e.event != null) {
        doneSave = true;
        this.api
          .execSv<any>(
            'DP',
            'DP',
            'InstanceStepsBusiness',
            'UpdatedAssignedStepTasksAsync',
            [stepTask.stepID, stepTask.recID]
          )
          .subscribe();
      }
      return doneSave;
    });
  }

  async chooseTypeTask(isAddGroup = true) {
    let popupTypeTask = this.callfc.openForm(
      CodxTypeTaskComponent,
      '',
      450,
      580,
      '',
      { isShowGroup: isAddGroup }
    );
    let dataOutput = await firstValueFrom(popupTypeTask.closed);
    let type = dataOutput?.event ? dataOutput?.event : null;
    return type;
  }

  async addGroupTask(instanceStep: DP_Instances_Steps) {
    let taskGroup = new DP_Instances_Steps_TaskGroups();
    taskGroup.recID = Util.uid();
    taskGroup.refID = Util.uid();
    taskGroup['isTaskDefault'] = false;
    taskGroup['progress'] = 0;
    taskGroup['stepID'] = instanceStep?.recID;

    let listGroup = instanceStep?.taskGroups?.sort(
      (a, b) => a['indexNo'] - b['indexNo']
    );
    let taskBeforeIndex = listGroup?.length;

    if (taskBeforeIndex) {
      taskBeforeIndex -= 1;
      taskGroup['startDate'] =
        listGroup[taskBeforeIndex]?.endDate || instanceStep?.startDate;
      taskGroup['indexNo'] = taskBeforeIndex + 1;
    }
    let groupOutput = await this.openPopupGroup('add', taskGroup, instanceStep);
    return groupOutput;
  }

  async openPopupGroup(action, group, instanceStep) {
    let dataInput = {
      action,
      step: instanceStep,
      dataGroup: group || {},
      isEditTimeDefault: instanceStep?.leadtimeControl,
    };
    let popupTask = this.callfc.openForm(
      CodxAddGroupTaskComponent,
      '',
      500,
      500,
      '',
      dataInput
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    let groupOutput = dataPopupOutput?.event ? dataPopupOutput?.event : null;
    return groupOutput;
  }

  async addTask(taskType, instanceStep, groupID) {
    let task = new DP_Instances_Steps_Tasks();
    task['taskType'] = taskType?.value;
    task['stepID'] = instanceStep?.recID;
    task['progress'] = 0;
    task['taskGroupID'] = groupID || null;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;

    let taskOutput = await this.openPopupTask(
      'add',
      taskType,
      instanceStep,
      task,
      groupID
    );
    return taskOutput;
  }

  async openPopupTask(
    action,
    taskType,
    instanceStep,
    dataTask,
    groupTaskID = null
  ) {
    let dataInput = {
      action,
      taskType: taskType,
      step: instanceStep,
      listGroup: instanceStep?.taskGroups,
      dataTask: dataTask || {},
      listTask: instanceStep?.tasks,
      isEditTimeDefault: instanceStep?.leadtimeControl,
      groupTaskID, // trường hợp chọn thêm từ nhóm
    };
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };

    let opt = new DialogModel();
    opt.FormModel = frmModel;
    let popupTask = this.callfc.openForm(
      CodxAddTaskComponent,
      '',
      600,
      800,
      '',
      dataInput,
      '',
      opt
    );
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    let taskOutput = dataPopupOutput?.event ? dataPopupOutput?.event : null;
    return taskOutput;
  }

  async addBookingCar(isOpenSide = false) {
    let addCarTitle = await firstValueFrom(this.cache.functionList('EPT21'));
    let title = addCarTitle ? addCarTitle?.customName?.toString() : '';

    this.calendarService.getFormModel('EPT21').then((res) => {
      let carFM = res;
      let carFG = this.codxService.buildFormGroup(carFM?.formName,carFM?.gridViewName);
      let popupBookingCar;

      if (isOpenSide) {
        let option = new SidebarModel();
        option.FormModel = carFM;
        option.Width = '800px';
        popupBookingCar = this.callfc.openSide(
          CodxAddBookingCarComponent,
          [carFG?.value, 'SYS01', title, null, null, false],
          option
        );
      } else {
        let opt = new DialogModel();
        opt.FormModel = carFM;
        popupBookingCar = this.callfc.openForm(
          CodxAddBookingCarComponent,
          '',
          800,
          800,
          '',
          [carFG?.value, 'SYS01', title, null, null, false],
          '',
          opt
        );
      }

      popupBookingCar.closed.subscribe((e) => {
        console.log('-------------', e);
      });
    });
  }
}
