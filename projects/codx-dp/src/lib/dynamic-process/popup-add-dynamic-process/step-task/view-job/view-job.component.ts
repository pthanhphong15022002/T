import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, CallFuncService, DialogData, DialogRef, FormModel } from 'codx-core';
import { DP_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-view-job',
  templateUrl: './view-job.component.html',
  styleUrls: ['./view-job.component.scss']
})
export class ViewJobComponent implements OnInit {

  title = '';
  dialog!: DialogRef;
  formModelMenu: FormModel;
  stepsTasks:  DP_Steps_Tasks;
  status = '';
  stepType = '';
  stepID = '';
  listOwner = [];
  taskList: DP_Steps_Tasks[] = [];
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.status = dt?.data[0];
    this.title = dt?.data[1]['text'];
    this.stepType = dt?.data[1]['id'];
    this.stepID = dt?.data[2];
    this.dialog = dialog;
    this.stepsTasks = dt?.data[4] || new DP_Steps_Tasks();
    this.taskList = dt?.data[5];
    this.stepType = this.stepsTasks.taskType;
  }

  ngOnInit(): void {
    this.listOwner = this.stepsTasks?.roles || [];
    console.log(this.taskList);
    
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.id == objectID);
    if (index != -1) data.splice(index, 1);
  }
}
