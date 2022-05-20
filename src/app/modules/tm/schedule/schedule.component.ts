import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { AuthStore, ApiHttpService, CallFuncService, NotificationsService, CodxScheduleComponent } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { environment } from 'src/environments/environment';
import { InfoOpenForm } from '../models/task.model';
import { TmService } from '../tm.service';
import * as moment from "moment";
import { EventSettingsModel } from '@syncfusion/ej2-angular-schedule';
import { SelectweekComponent } from '@shared/components/selectweek/selectweek.component';
import { CbxpopupComponent } from '../controls/cbxpopup/cbxpopup.component';
import { TaskInfoComponent } from '../controls/task-info/task-info.component';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewListDetailsComponent } from '../view-list-details/view-list-details.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  @Input('taskInfo') taskInfo: TaskInfoComponent;
  @Input() viewPreset: string = "weekAndDay";
  moment = moment().locale("en");
  today: Date = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  daySelected: Date;
  user: any;
  minHeight = 525;
  height: number;
  events = [];
  resources: any;
  data: any = [];
  lstResource = [];
  gridView: any;
  itemSelected = null;
  taskAction: any;

  @ViewChild(SelectweekComponent) selectweekComponent: SelectweekComponent;
  @ViewChild("schedule") schedule: CodxScheduleComponent;

  model = new DataRequest();
  dataSource = [
    {
      "id": "TSK2205-0013",
      "userName": "Phan Mẫn Nhi",
      "userID": "PMNHI",
      "positionName": "Quality Control",
      "userNameStuff": null,
      "backgroundColor": "#DAD4E8",
      "textColor": "#270082",
      "priorityColor": null,
      "priorityIcon": null,
      "priorityText": null,
      "userNameCreate": "Phan Đăng Vui",
      "positionNameCreate": "Dev WEB",
      "emailCreate": "pdvui@lacviet.com.vn",
      "phoneCreate": "0907323494",
      "taskGroupName": null,
      "projectName": null,
      "allDay": false,
      "todo": 2,
      "listTag": null,
      "listTaskGoals": [
        {
          "recID": "33c995ec-cf3a-11ec-a072-707781768eda",
          "refID": null,
          "entityName": null,
          "projectID": null,
          "activityID": null,
          "taskID": "TSK2205-0013",
          "category": null,
          "memo": "1",
          "interval": null,
          "startDate": null,
          "endDate": null,
          "target": 0,
          "status": "0",
          "result": 0,
          "resultNote": null,
          "actualStartDate": null,
          "actualEndDate": null,
          "note": null,
          "sorting": 0,
          "createdOn": "2022-05-09T08:49:13.394747Z",
          "createdBy": "ADMIN",
          "modifiedOn": null,
          "modifiedBy": null,
          "owner": "ADMIN",
          "buid": "O1001",
          "employeeID": "E-0010",
          "positionID": "DEVW",
          "orgUnitID": "THUONG007",
          "divisionID": null,
          "tM_Tasks": null,
          "write": true,
          "delete": true,
          "share": true,
          "assign": true,
          "includeTables": null,
          "updateColumns": ""
        },
        {
          "recID": "33c995ed-cf3a-11ec-a072-707781768eda",
          "refID": null,
          "entityName": null,
          "projectID": null,
          "activityID": null,
          "taskID": "TSK2205-0013",
          "category": null,
          "memo": "2",
          "interval": null,
          "startDate": null,
          "endDate": null,
          "target": 0,
          "status": "0",
          "result": 0,
          "resultNote": null,
          "actualStartDate": null,
          "actualEndDate": null,
          "note": null,
          "sorting": 0,
          "createdOn": "2022-05-09T08:49:13.966226Z",
          "createdBy": "ADMIN",
          "modifiedOn": null,
          "modifiedBy": null,
          "owner": "ADMIN",
          "buid": "O1001",
          "employeeID": "E-0010",
          "positionID": "DEVW",
          "orgUnitID": "THUONG007",
          "divisionID": null,
          "tM_Tasks": null,
          "write": true,
          "delete": true,
          "share": true,
          "assign": true,
          "includeTables": null,
          "updateColumns": ""
        }
      ],
      "items": null,
      "recID": "33c995e8-cf3a-11ec-a072-707781768eda",
      "taskID": "TSK2205-0013",
      "taskName": "test 222222",
      "tags": null,
      "taskType": "1",
      "category": "2",
      "taskGroupID": null,
      "parentID": "TSK2205-0012",
      "sourceID": null,
      "sourceType": null,
      "projectID": null,
      "activityID": null,
      "iterationID": null,
      "recurrence": false,
      "interval": "1",
      "weekday": null,
      "memo": "a",
      "memo2": null,
      "location": null,
      "objectID": null,
      "objectType": null,
      "status": "1",
      "statusCode": null,
      "reasonCode": null,
      "priority": null,
      "rank": null,
      "points": 0,
      "estimated": 25,
      "estimatedCost": 0,
      "remaining": null,
      "assignTo": null,
      "assignedOn": null,
      "dueDate": "2022-05-09T16:59:59Z",
      "startDate": "2022-05-08T17:00:00Z",
      "startTime": "00:00",
      "endDate": "2022-05-09T18:00:00Z",
      "startedOn": null,
      "completed": 0,
      "completedOn": null,
      "completedTime": null,
      "completedQty": 0,
      "duration": 0,
      "lateCode": null,
      "refID": null,
      "refType": null,
      "refNo": null,
      "refNote": null,
      "note": null,
      "owner": "PMNHI",
      "buid": "THUONG006",
      "attachment": null,
      "approvalRule": "0",
      "approveStatus": "1",
      "approvers": null,
      "approvedOn": null,
      "approvedBy": null,
      "privateTask": false,
      "remainder": false,
      "remainderDays": 0,
      "reOpens": 0,
      "splitedNo": 0,
      "attachments": 0,
      "comments": 0,
      "closed": false,
      "createdOn": "2022-05-09T08:49:12.961897Z",
      "createdBy": "ADMIN",
      "modifiedOn": null,
      "modifiedBy": null,
      "employeeID": "E-0000",
      "positionID": "QC",
      "orgUnitID": "THUONG006",
      "divisionID": null,
      "tM_Sprints": null,
      "write": true,
      "delete": true,
      "share": true,
      "assign": true,
      "includeTables": null,
      "updateColumns": ""
    },
    {
      "id": "TSK2205-0011",
      "userName": "Phan Mẫn Nhi",
      "userID": "PMNHI",
      "positionName": "Quality Control",
      "userNameStuff": null,
      "backgroundColor": "#DAD4E8",
      "textColor": "#270082",
      "priorityColor": null,
      "priorityIcon": null,
      "priorityText": null,
      "userNameCreate": "Phan Đăng Vui",
      "positionNameCreate": "Dev WEB",
      "emailCreate": "pdvui@lacviet.com.vn",
      "phoneCreate": "0907323494",
      "taskGroupName": null,
      "projectName": null,
      "allDay": false,
      "todo": 0,
      "listTag": null,
      "listTaskGoals": [],
      "items": null,
      "recID": "a3424e4c-ce13-11ec-a072-707781768eda",
      "taskID": "TSK2205-0011",
      "taskName": "test 33333333333",
      "tags": null,
      "taskType": "1",
      "category": "2",
      "taskGroupID": null,
      "parentID": "TSK2205-0010",
      "sourceID": null,
      "sourceType": null,
      "projectID": null,
      "activityID": null,
      "iterationID": null,
      "recurrence": false,
      "interval": "1",
      "weekday": null,
      "memo": "tạm ổn !!",
      "memo2": null,
      "location": null,
      "objectID": null,
      "objectType": null,
      "status": "1",
      "statusCode": null,
      "reasonCode": null,
      "priority": null,
      "rank": null,
      "points": 0,
      "estimated": 25,
      "estimatedCost": 0,
      "remaining": null,
      "assignTo": null,
      "assignedOn": null,
      "dueDate": "2022-05-07T16:59:59Z",
      "startDate": "2022-05-06T17:00:00Z",
      "startTime": "00:00",
      "endDate": "2022-05-07T18:00:00Z",
      "startedOn": null,
      "completed": 0,
      "completedOn": null,
      "completedTime": null,
      "completedQty": 0,
      "duration": 0,
      "lateCode": null,
      "refID": null,
      "refType": null,
      "refNo": null,
      "refNote": null,
      "note": null,
      "owner": "PMNHI",
      "buid": "THUONG006",
      "attachment": null,
      "approvalRule": "0",
      "approveStatus": "1",
      "approvers": null,
      "approvedOn": null,
      "approvedBy": null,
      "privateTask": false,
      "remainder": false,
      "remainderDays": 0,
      "reOpens": 0,
      "splitedNo": 0,
      "attachments": 0,
      "comments": 0,
      "closed": false,
      "createdOn": "2022-05-07T21:40:35.609158Z",
      "createdBy": "ADMIN",
      "modifiedOn": null,
      "modifiedBy": null,
      "employeeID": "E-0000",
      "positionID": "QC",
      "orgUnitID": "THUONG006",
      "divisionID": null,
      "tM_Sprints": null,
      "write": true,
      "delete": true,
      "share": true,
      "assign": true,
      "includeTables": null,
      "updateColumns": ""
    },
    {
      "id": "TSK2205-0009",
      "userName": "Phan Mẫn Nhi",
      "userID": "PMNHI",
      "positionName": "Quality Control",
      "userNameStuff": null,
      "backgroundColor": "#DAD4E8",
      "textColor": "#270082",
      "priorityColor": null,
      "priorityIcon": null,
      "priorityText": null,
      "userNameCreate": "Phan Đăng Vui",
      "positionNameCreate": "Dev WEB",
      "emailCreate": "pdvui@lacviet.com.vn",
      "phoneCreate": "0907323494",
      "taskGroupName": null,
      "projectName": null,
      "allDay": false,
      "todo": 0,
      "listTag": null,
      "listTaskGoals": [],
      "items": null,
      "recID": "58b2ab1f-ce13-11ec-9427-00155d035517",
      "taskID": "TSK2205-0009",
      "taskName": "test 222222",
      "tags": null,
      "taskType": "1",
      "category": "2",
      "taskGroupID": null,
      "parentID": "TSK2205-0008",
      "sourceID": null,
      "sourceType": null,
      "projectID": null,
      "activityID": null,
      "iterationID": null,
      "recurrence": false,
      "interval": "1",
      "weekday": null,
      "memo": "ttttt",
      "memo2": null,
      "location": null,
      "objectID": null,
      "objectType": null,
      "status": "1",
      "statusCode": null,
      "reasonCode": null,
      "priority": null,
      "rank": null,
      "points": 0,
      "estimated": 49,
      "estimatedCost": 0,
      "remaining": null,
      "assignTo": null,
      "assignedOn": null,
      "dueDate": "2022-05-07T16:59:59Z",
      "startDate": "2022-05-06T17:00:00Z",
      "startTime": "00:00",
      "endDate": "2022-05-08T18:00:00Z",
      "startedOn": null,
      "completed": 0,
      "completedOn": null,
      "completedTime": null,
      "completedQty": 0,
      "duration": 0,
      "lateCode": null,
      "refID": null,
      "refType": null,
      "refNo": null,
      "refNote": null,
      "note": null,
      "owner": "PMNHI",
      "buid": "THUONG006",
      "attachment": null,
      "approvalRule": "0",
      "approveStatus": "1",
      "approvers": null,
      "approvedOn": null,
      "approvedBy": null,
      "privateTask": false,
      "remainder": false,
      "remainderDays": 0,
      "reOpens": 0,
      "splitedNo": 0,
      "attachments": 0,
      "comments": 0,
      "closed": false,
      "createdOn": "2022-05-07T07:38:24.675883Z",
      "createdBy": "ADMIN",
      "modifiedOn": null,
      "modifiedBy": null,
      "employeeID": "E-0000",
      "positionID": "QC",
      "orgUnitID": "THUONG006",
      "divisionID": null,
      "tM_Sprints": null,
      "write": true,
      "delete": true,
      "share": true,
      "assign": true,
      "includeTables": null,
      "updateColumns": ""
    },
    {
      "id": "TSK2205-0003",
      "userName": "Phan Đăng Vui",
      "userID": "ADMIN",
      "positionName": "Dev WEB",
      "userNameStuff": null,
      "backgroundColor": "#DAD4E8",
      "textColor": "#270082",
      "priorityColor": null,
      "priorityIcon": null,
      "priorityText": null,
      "userNameCreate": "Phan Đăng Vui",
      "positionNameCreate": "Dev WEB",
      "emailCreate": "pdvui@lacviet.com.vn",
      "phoneCreate": "0907323494",
      "taskGroupName": null,
      "projectName": null,
      "allDay": false,
      "todo": 0,
      "listTag": null,
      "listTaskGoals": [],
      "items": null,
      "recID": "cbf2955c-cd24-11ec-a3d4-c025a5a4cd5d",
      "taskID": "TSK2205-0003",
      "taskName": "Test lưu data chua aaa",
      "tags": null,
      "taskType": "1",
      "category": "1",
      "taskGroupID": null,
      "parentID": null,
      "sourceID": null,
      "sourceType": null,
      "projectID": null,
      "activityID": null,
      "iterationID": null,
      "recurrence": false,
      "interval": "1",
      "weekday": null,
      "memo": "assssss",
      "memo2": null,
      "location": null,
      "objectID": null,
      "objectType": null,
      "status": "1",
      "statusCode": null,
      "reasonCode": null,
      "priority": null,
      "rank": null,
      "points": 0,
      "estimated": 0,
      "estimatedCost": 0,
      "remaining": null,
      "assignTo": null,
      "assignedOn": null,
      "dueDate": "2022-05-06T16:59:59.037Z",
      "startDate": "2022-05-06T08:00:00Z",
      "startTime": "00:00",
      "endDate": "2022-05-06T17:00:00Z",
      "startedOn": "2022-05-09T11:52:50.250684Z",
      "completed": 8,
      "completedOn": null,
      "completedTime": null,
      "completedQty": 0,
      "duration": 0,
      "lateCode": null,
      "refID": null,
      "refType": null,
      "refNo": null,
      "refNote": null,
      "note": null,
      "owner": "ADMIN",
      "buid": "O1001",
      "attachment": null,
      "approvalRule": "0",
      "approveStatus": "1",
      "approvers": null,
      "approvedOn": null,
      "approvedBy": null,
      "privateTask": false,
      "remainder": false,
      "remainderDays": 0,
      "reOpens": 0,
      "splitedNo": 0,
      "attachments": 0,
      "comments": 0,
      "closed": false,
      "createdOn": "2022-05-06T17:10:52.148245Z",
      "createdBy": "ADMIN",
      "modifiedOn": "2022-05-09T17:27:34.751893Z",
      "modifiedBy": "ADMIN",
      "employeeID": "E-0010",
      "positionID": "DEVW",
      "orgUnitID": "THUONG007",
      "divisionID": null,
      "tM_Sprints": null,
      "write": true,
      "delete": true,
      "share": true,
      "assign": true,
      "includeTables": null,
      "updateColumns": ""
    },
    {
      "id": "TSK2205-0007",
      "userName": "Phan Mẫn Nhi",
      "userID": "PMNHI",
      "positionName": "Quality Control",
      "userNameStuff": null,
      "backgroundColor": "#DAD4E8",
      "textColor": "#270082",
      "priorityColor": null,
      "priorityIcon": null,
      "priorityText": null,
      "userNameCreate": "Phan Đăng Vui",
      "positionNameCreate": "Dev WEB",
      "emailCreate": "pdvui@lacviet.com.vn",
      "phoneCreate": "0907323494",
      "taskGroupName": null,
      "projectName": null,
      "allDay": false,
      "todo": 2,
      "listTag": null,
      "listTaskGoals": [
        {
          "recID": "acb4d7cd-cd28-11ec-9427-00155d035517",
          "refID": null,
          "entityName": null,
          "projectID": null,
          "activityID": null,
          "taskID": "TSK2205-0007",
          "category": null,
          "memo": "aaa",
          "interval": null,
          "startDate": null,
          "endDate": null,
          "target": 0,
          "status": "0",
          "result": 0,
          "resultNote": null,
          "actualStartDate": null,
          "actualEndDate": null,
          "note": null,
          "sorting": 0,
          "createdOn": "2022-05-06T03:38:34.065588Z",
          "createdBy": "ADMIN",
          "modifiedOn": null,
          "modifiedBy": null,
          "owner": "ADMIN",
          "buid": "O1001",
          "employeeID": "E-0010",
          "positionID": "DEVW",
          "orgUnitID": "THUONG007",
          "divisionID": null,
          "tM_Tasks": null,
          "write": true,
          "delete": true,
          "share": true,
          "assign": true,
          "includeTables": null,
          "updateColumns": ""
        },
        {
          "recID": "acb4d7ce-cd28-11ec-9427-00155d035517",
          "refID": null,
          "entityName": null,
          "projectID": null,
          "activityID": null,
          "taskID": "TSK2205-0007",
          "category": null,
          "memo": "aaaaaaaaaa",
          "interval": null,
          "startDate": null,
          "endDate": null,
          "target": 0,
          "status": "0",
          "result": 0,
          "resultNote": null,
          "actualStartDate": null,
          "actualEndDate": null,
          "note": null,
          "sorting": 0,
          "createdOn": "2022-05-06T03:38:34.097693Z",
          "createdBy": "ADMIN",
          "modifiedOn": null,
          "modifiedBy": null,
          "owner": "ADMIN",
          "buid": "O1001",
          "employeeID": "E-0010",
          "positionID": "DEVW",
          "orgUnitID": "THUONG007",
          "divisionID": null,
          "tM_Tasks": null,
          "write": true,
          "delete": true,
          "share": true,
          "assign": true,
          "includeTables": null,
          "updateColumns": ""
        }
      ],
      "items": null,
      "recID": "acb4d7c9-cd28-11ec-9427-00155d035517",
      "taskID": "TSK2205-0007",
      "taskName": "Test lưu data chưa na",
      "tags": null,
      "taskType": "1",
      "category": "2",
      "taskGroupID": null,
      "parentID": "TSK2205-0006",
      "sourceID": null,
      "sourceType": null,
      "projectID": null,
      "activityID": null,
      "iterationID": null,
      "recurrence": false,
      "interval": "1",
      "weekday": null,
      "memo": "aaaaaaaaaaaa",
      "memo2": null,
      "location": null,
      "objectID": null,
      "objectType": null,
      "status": "1",
      "statusCode": null,
      "reasonCode": null,
      "priority": null,
      "rank": null,
      "points": 0,
      "estimated": 25,
      "estimatedCost": 0,
      "remaining": null,
      "assignTo": null,
      "assignedOn": null,
      "dueDate": "2022-05-06T16:59:59Z",
      "startDate": "2022-05-05T17:00:00Z",
      "startTime": "00:00",
      "endDate": "2022-05-06T18:00:00Z",
      "startedOn": null,
      "completed": 0,
      "completedOn": null,
      "completedTime": null,
      "completedQty": 0,
      "duration": 0,
      "lateCode": null,
      "refID": null,
      "refType": null,
      "refNo": null,
      "refNote": null,
      "note": null,
      "owner": "PMNHI",
      "buid": "THUONG006",
      "attachment": null,
      "approvalRule": "0",
      "approveStatus": "1",
      "approvers": null,
      "approvedOn": null,
      "approvedBy": null,
      "privateTask": false,
      "remainder": false,
      "remainderDays": 0,
      "reOpens": 0,
      "splitedNo": 0,
      "attachments": 0,
      "comments": 0,
      "closed": false,
      "createdOn": "2022-05-06T03:38:34.036139Z",
      "createdBy": "ADMIN",
      "modifiedOn": null,
      "modifiedBy": null,
      "employeeID": "E-0000",
      "positionID": "QC",
      "orgUnitID": "THUONG006",
      "divisionID": null,
      "tM_Sprints": null,
      "write": true,
      "delete": true,
      "share": true,
      "assign": true,
      "includeTables": null,
      "updateColumns": ""
    },
    {
      "id": "TSK2205-0005",
      "userName": "Phan Đăng Vui",
      "userID": "ADMIN",
      "positionName": "Dev WEB",
      "userNameStuff": null,
      "backgroundColor": "#DAD4E8",
      "textColor": "#270082",
      "priorityColor": null,
      "priorityIcon": null,
      "priorityText": null,
      "userNameCreate": "Phan Đăng Vui",
      "positionNameCreate": "Dev WEB",
      "emailCreate": "pdvui@lacviet.com.vn",
      "phoneCreate": "0907323494",
      "taskGroupName": null,
      "projectName": null,
      "allDay": false,
      "todo": 0,
      "listTag": null,
      "listTaskGoals": [],
      "items": null,
      "recID": "07f9ce3d-cd28-11ec-9427-00155d035517",
      "taskID": "TSK2205-0005",
      "taskName": "Test lưu data chưaaaaaa",
      "tags": null,
      "taskType": "1",
      "category": "1",
      "taskGroupID": null,
      "parentID": null,
      "sourceID": null,
      "sourceType": null,
      "projectID": null,
      "activityID": null,
      "iterationID": null,
      "recurrence": false,
      "interval": "1",
      "weekday": null,
      "memo": "AAAAAAAAAAAAAAAAAAA",
      "memo2": null,
      "location": null,
      "objectID": null,
      "objectType": null,
      "status": "1",
      "statusCode": null,
      "reasonCode": null,
      "priority": null,
      "rank": null,
      "points": 0,
      "estimated": 0,
      "estimatedCost": 0,
      "remaining": null,
      "assignTo": null,
      "assignedOn": null,
      "dueDate": "2022-05-06T16:59:59Z",
      "startDate": "2022-05-06T08:00:00Z",
      "startTime": "00:00",
      "endDate": "2022-05-06T17:00:00Z",
      "startedOn": "2022-05-09T14:08:56.11351Z",
      "completed": 8,
      "completedOn": "2022-06-09T05:00:00Z",
      "completedTime": null,
      "completedQty": 0,
      "duration": 0,
      "lateCode": null,
      "refID": null,
      "refType": null,
      "refNo": null,
      "refNote": null,
      "note": null,
      "owner": "ADMIN",
      "buid": "O1001",
      "attachment": null,
      "approvalRule": "0",
      "approveStatus": "1",
      "approvers": null,
      "approvedOn": null,
      "approvedBy": null,
      "privateTask": false,
      "remainder": false,
      "remainderDays": 0,
      "reOpens": 0,
      "splitedNo": 0,
      "attachments": 0,
      "comments": 0,
      "closed": false,
      "createdOn": "2022-05-06T03:33:57.065923Z",
      "createdBy": "ADMIN",
      "modifiedOn": "2022-05-09T14:24:58.087509Z",
      "modifiedBy": "ADMIN",
      "employeeID": "E-0010",
      "positionID": "DEVW",
      "orgUnitID": "THUONG007",
      "divisionID": null,
      "tM_Sprints": null,
      "write": true,
      "delete": true,
      "share": true,
      "assign": true,
      "includeTables": null,
      "updateColumns": ""
    },
  ];
  resourceDataSource: any;

  fields = {
    id: 'taskID',
    subject: { name: 'taskName' },
    startTime: { name: 'startDate' },
    endTime: { name: 'endDate' },
    resourceId: { name: "userID" },
  }
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };
  selectedDate = new Date();
  status = [
    { id: 1, status: '0', color: '#ff0000' },
    { id: 2, status: '1', color: '#ff8c1a' },
    { id: 3, status: '2', color: '#3399ff' },
    { id: 4, status: '3', color: '#ff0000' },
    { id: 5, status: '4', color: '#ff0000' },
    { id: 6, status: '5', color: '#010102' },
    { id: 7, status: '9', color: '#030333' },
    { id: 8, status: '8', color: '#420233' },

  ]

  columns = [
    {
      text: 'Tên thành viên', field: 'name', width: 200, htmlEncode: false,
      renderer: (data: any) => {
        if (!data?.value) {
          return "";
        }
        let arrayValue = data.value.split('|');
        let [userID, userName, position] = arrayValue;
        return ` <div class="d-flex align-items-center user-card py-4">
      <div class="symbol symbol-40 symbol-circle mr-4">
          <img  alt="Pic" src="${environment.apiUrl}/api/dm/img?objectID=${userID}&objectType=AD_Users&width=40&userId=${this.user.userID}&tenant=${this.user.tenant}&tk=${this.user.token}" />
      </div>
      <div class="d-flex flex-column flex-grow-1">
          <div class="text-dark font-weight-bold">${userName}</div>
          <div class="text-dark-75 font-weight-bold">${position}</div>
      </div>
  </div>`

      }
    }
  ];
  features: {
    headerZoom: false
  };
  viewBase: any;

  constructor(
    private tmSv: TmService,
    private api: ApiHttpService,
    private auStore: AuthStore,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.user = this.auStore.get();
  }
  scheduleObj: any = undefined;
  ngAfterViewInit(): void {
    this.scheduleObj = this.schedule.scheduleObj;
  }

  group = {
    enableCompactView: false,
    resources: ['Resources'],
  };

  ngOnInit(): void {

    let fied = this.gridView?.dateControl || 'DueDate';
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = '';
    this.model.funcID = "TM003"//this.viewBase.funcID ;
    this.model.page = 1;
    this.model.pageSize = 100;
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate }, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.endDate },
      ],
    };

  }

  addNew(taskAction: any) {
    this.taskInfo.openInfo(taskAction, "add");

  }

  edit(taskAction) {
    this.taskInfo.openInfo(taskAction.id, "edit");
  }

  deleteTask(taskAction) {
    if (taskAction.status == '9') {
      this.notiService.notify(
        'Không thể xóa công việc này. Vui lòng kiểm tra lại!'
      );
      return;
    }
    var message = 'Bạn có chắc chắn muốn xóa task này !';
    this.notiService
      .alert('Cảnh báo', message, { type: 'YesNo' })
      .subscribe((dialog: Dialog) => {
        var that = this;
        dialog.close = function (e) {
          return that.close(e, that);
        }
      });
  }
  viewChange(evt: any) {
    let fied = this.gridView?.dateControl || 'DueDate';
    console.log(evt);
    // lấy ra ngày bắt đầu và ngày kết thúc trong evt
    this.startDate = evt?.fromDate;
    this.endDate = evt?.toDate;
    //Thêm vào option predicate
    this.model.filter = {
      logic: 'and',
      fields: [
        { operator: 'gte', field: fied, value: this.startDate },
        { operator: 'lte', field: fied, value: this.endDate }
      ]
    }
    //reload data
    this.schedule.reloadDataSource()
  }
  close(e: any, t: ScheduleComponent) {
    if (e?.event?.status == "Y") {
      var isCanDelete = true;
      t.api.execSv<any>('TM', 'ERM.Business.TM', 'TaskBusiness', 'GetListDetailTasksAsync', this.fields.id).subscribe((res: any) => {
        if (res) {
          res.forEach((element) => {
            if (element.status != '1') {
              isCanDelete = false;
              return;
            }
          });
          if (!isCanDelete) {
            // this.notiService.notifyCode("TM001")
            t.notiService.notify(
              'Đã có phát sinh công việc liên quan, không thể xóa công việc này. Vui lòng kiểm tra lại!'
            );
          } else {
            t.tmSv.deleteTask(t.fields.id).subscribe((res) => {
              if (res) {
                // this.notiService.notifyCode("TM004")
                return this.notiService.notify('Xóa task thành công !');
              }
              t.notiService.notify(
                'Xóa task không thành công. Vui lòng kiểm tra lại !'
              );
            });
          }
        }
      })
    }
  }

  onCellDblClickScheduler(data) {
    let taskID = data.event.eventRecord.data.id;
    if (taskID) {
      this.viewDetailTask(taskID);
    }
  }
  viewDetailTask(taskID) {
    this.tmSv.showPanel.next(new InfoOpenForm(taskID, "TM003", VIEW_ACTIVE.Schedule, 'edit'));
  }

  testEvent(evt: any) {
    console.log(evt)
  }
}
