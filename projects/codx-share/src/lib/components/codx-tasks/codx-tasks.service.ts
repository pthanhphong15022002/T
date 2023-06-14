import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxTasksService {
  urlback = '';
  constructor(private api: ApiHttpService) {}

  getTask(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetTaskByIdAsync',
      id
    );
  }

  deleteTask(taskID) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'DeleteTaskAsync',
      taskID
    );
  }
  //get Tree
  getListTree(model) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetListTreeDetailTasksAsync',
      model
    );
  }

  getUserByListDepartmentID(listDepID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetUserByListDepartmentIDAsync',
      listDepID
    );
  }
  getListUserIDByListPositionsID(listPositionID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListPositionsIDAsync',
      listPositionID
    );  
  }
  getListUserIDByListEmployeeID(listEmployeeID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDbyListEmployeeIDAsync',
      listEmployeeID
    );  
  }

  getListUserIDByListGroupID(listGroupID){
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'GroupMembersBusiness',
      'GetListUserIDByListGroupIDAsync',
      listGroupID
    );  
  }

  //update status
  setStatusTask(
    funcID: string,
    id: string,
    status: string,
    datacomplete: Date,
    hour: string,
    comment: string
  ) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'SetStatusTaskAsync',
      [funcID, id, status, datacomplete, hour, comment]
    );
  }
  //update tien độ thực hiện
  updateProgressTask(
    funcID: string,
    id: string,
    modifiedOn: Date,
    percentage: string,
    comment: string
  ) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'UpdateProgressTaskAsync',
      [funcID, id, modifiedOn, percentage, comment]
    );
  }

  //sendMail
  sendAlertMail(recID: string, valueRuleNo: string, funcID: string, recIDTaskExtend : string =null) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'SendAlertMailAsync',
      [recID,valueRuleNo,funcID,recIDTaskExtend]
    );
  }

  //getRecID 
  getRecIDTaskByIdAsync(id) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetRecIDTaskByIdAsync',
      id
    );
  }
  saveAssign(data) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'AddAssignToTaskAsync',
      data
    );
  }

  checkEdit(taskID) {
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'IsCanClickEditTaskByTaskIDAsync',
      taskID
    );
  }
 
  //get listTaskGoad
  getListTaskGoad(taskID){
    return this.api.execSv<any>(
      'TM',
      'TM',
      'TaskBusiness',
      'GetListTaskGoalByTaskIDAsync',
      taskID
    );
  }
}
