import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { VIEW_ACTIVE } from '@shared/constant/enum';
import { AuthStore, ApiHttpService } from 'codx-core';
import { DataRequest } from '@shared/models/data.request';
import { environment } from 'src/environments/environment';
import { InfoOpenForm } from '../models/task.model';
import { TmService } from '../tm.service';
import * as moment from "moment";
import { EventSettingsModel } from '@syncfusion/ej2-angular-schedule';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Input() viewPreset: string = "weekAndDay";
  user: any;
  minHeight = 525;
  height: number;
  events = [];
  resources: any;
  data: any = [];
  lstResource = [];
  gridView: any;
  itemSelected = null;

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
    resourceId: {name:"userID"},
  }
  resourceField = {
    Name: 'Resources',
    Field: 'userID',
    IdField: 'userID',
    TextField: 'userName',
    Title: 'Resources',
  };
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
  constructor(private tmSv: TmService,
    private api: ApiHttpService,
    private auStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,) {
    this.user = this.auStore.get();
    //  this.getHeightContain();
  }

  getHeightContain(callback = null) {
    var hContainer = $("#kt_wrapper").height();
    if (hContainer && hContainer > 0) this.height = hContainer - 70;

    if (typeof callback === "function") return callback(true);
  }

  group = {
    enableCompactView: false,
    resources: ['Resources'],
  };



  ngOnInit(): void {
    // this.tmSv.changeData.subscribe((result) => {
    //   if (result) {
    //     let data = result.data as Array<any>;
    //     this.resources = [];
    //     //if(this.viewListDetails) this.viewListDetails.detectChanges();
    //     this.resources = data;
    //     // if(this.viewListDetails) this.viewListDetails.detectChanges();

    //     this.handleDataSchedule(data);
    //     this.changeDetectorRef.detectChanges();
    //   }
    // })

    let fied = this.gridView?.dateControl || 'DueDate';
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = '';
    this.model.funcID = "TM003"//this.viewBase.funcID ;
    this.model.page = 1;
    this.model.pageSize = 100;
    // model.dataValue = this.user.userID;
    // set max dinh
    // this.startDate = moment("04/11/2022").toDate();
    // this.endDate = moment("05/11/2022").toDate();
    this.model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate || moment("04/11/2022").toDate()}, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.endDate || moment("05/11/2022").toDate()},
      ],
    };
  }
  resourceData(){
    let fied = this.gridView?.dateControl || 'DueDate';
    let model = new DataRequest();
    model.formName = 'Tasks';
    model.gridViewName = 'grvTasks';
    model.entityName = 'TM_Tasks';
    model.predicate = '';
    model.funcID = "TM003"//this.viewBase.funcID ;
    model.page = 1;
    model.pageSize = 100;
    // model.dataValue = this.user.userID;
   // set max dinh
    // this.startDate =moment("4/15/2022").toDate();
    // this.endDate = moment("5/15/2022").toDate();
    model.filter = {
      logic: 'and',
      filters: [
        { operator: 'gte', field: fied, value: this.startDate || moment("04/11/2022").toDate()}, ///cho mac dinh cho filter
        { operator: 'lte', field: fied, value: this.endDate || moment("05/11/2022").toDate()},
      ],
    };
    const t = this;
    t.tmSv.loadTaskByAuthen(model).subscribe((res)=>{
      if (res && res.length) {
        this.data = res[0]; 
        this.itemSelected = res[1][0] ;
        
      }
    })
  }


  handleDataSchedule(listTask) {
    if (listTask?.length == 0) {
      this.events = [];
      this.resources = [];
      return;
    }
    const key = 'userID';
    const listUser = [...new Map(listTask.map(item =>
      [item[key], item])).values()];
    if (listTask && listTask.length > 0) {
      this.events = listTask.map((item: any) => {
        return {
          resourceId: item.owner,
          startDate: item.startDate,
          endDate: item.endDate,
          id: item.taskID,
          name: item.taskName,
          eventColor: item.backgroundColor,
          write: item.write,
          delete: item.delete,

        }
      });
    }
    if (listUser && listUser.length > 0) {
      this.resources = listUser.map((item: any) => {
        return {
          id: item.userID,
          name: item.userID + "|" + item.userName + "|" + (item.positionName ?? "")
        }
      });
    }
  }

  addNew(evt: any) {
    console.log(evt);
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
}
