import { Injectable } from '@angular/core';
import { ApiHttpService, NotificationsService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class StepService {
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService
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
    let check = data?.roles?.some((element) => element?.objectID == user.userID && element.roleType == type) || false;
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
}
