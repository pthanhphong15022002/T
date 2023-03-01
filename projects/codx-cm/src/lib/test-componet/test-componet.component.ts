import { Component, OnInit } from '@angular/core';
import { auto } from '@popperjs/core';
import { CallFuncService, DialogRef, FormModel, SidebarModel } from 'codx-core';
import { PopupTypeTaskComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { PopupTaskComponent } from '../popup-task/popup-task.component';

@Component({
  selector: 'lib-test-componet',
  templateUrl: './test-componet.component.html',
  styleUrls: ['./test-componet.component.css']
})
export class TestComponetComponent implements OnInit {
  popupJob: DialogRef;
  jobType = '';
  constructor( 
    private callfc: CallFuncService,) { }

  ngOnInit(): void {
  }

  openTypeJob(action: string,task?:any) {
    let popupJob = this.callfc.openForm(PopupTypeTaskComponent, '', 400, 400);
    popupJob.closed.subscribe(async (value) => {
      if (value?.event) {
        let typeTask = value?.event;
        this.handleTask(typeTask,action,task);
      }
    });
  }

  handleTask(typeTask:object, action: string, task?: any) {
    let frmModel: FormModel = {
      entityName: 'DP_Steps_Tasks',
      formName: 'DPStepsTasks',
      gridViewName: 'grvDPStepsTasks',
    };
    let dataInput = {
      typeTask,
      action,
      task,
      frmModel,
    };
    let dialog = this.callfc.openForm(
      PopupTaskComponent,
      '',
      800,
      700,
      '',
      dataInput
    );

    dialog.closed.subscribe((e) => {
      if (e?.event) {

      }
    });
  }

}
