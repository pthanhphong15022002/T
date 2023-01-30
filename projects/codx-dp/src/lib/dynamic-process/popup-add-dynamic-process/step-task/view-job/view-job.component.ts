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
    this.stepType = this.stepsTasks.taskType;
    
  }

  ngOnInit(): void {
  }

}
