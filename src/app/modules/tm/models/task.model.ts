import { FormControl, Validators } from '@angular/forms';
import { StatusTaskGoal } from './enum/enum';

export class FileUpload {
    fileName: string;
    avatar: string;
    thumbnail: string;
    userName: string;
    uploadDate: any;
    extension: string;
    size: any;
    type: any;
    fullName: string;
    tags: any;
    subject: any;
    objectType: any;
    objectID: any;
    funcId: any;
    language: any;
    description: string;
    author: string;
    publisher: string;
    publisherYear: any;
    publisherDate: any;
    copyright: string;
    data: string;
    folderId: string;
    createdBy: any;
    createdOn: any;
    fileSize: any;
}
export class TaskGoal {
    status: StatusTaskGoal;
    text: string;
    recID: string;
}
export class ToDo {
    status: boolean;
    text: string;
}
export class InfoOpenForm {
    taskID: string;
    funtionID: string;
    view: string;
    action: string;
    constructor(taskID, funtionID, view, action = '') {
        this.taskID = taskID;
        this.funtionID = funtionID;
        this.view = view;
        this.action = action;
    }
}

export class CopyForm {
    id: string;
    view: string;
    functionID: string
    constructor(id, funtionID, view) {
        this.id = id
        this.view = view;
        this.functionID = funtionID;
    }
}

export class DataSv {
    data: any;
    view: string;
    constructor(data, view) {
        this.data = data
        this.view = view;
    }
}
//Guid->string
export class RangeLine {
  RecID: string;
  RangeID: string;
  BreakName: string;
  BreakValue: number = null;
}

export class rangeLine {
  recID: string;
  rangeID: string;
  breakName: string;
  breakValue: number = null;
  constructor(recID, rangeID, breakName, breakValue) {
    this.recID = recID;
    this.rangeID = rangeID;
    this.breakName = breakName;
    this.breakValue = breakValue;
  }
}

export const RangeLineFormGroup = {
    RecID: new FormControl(''),
    RangeID: new FormControl(''),
    BreakName: new FormControl(null, Validators.required),
    BreakValue: new FormControl(null, Validators.required)
}
