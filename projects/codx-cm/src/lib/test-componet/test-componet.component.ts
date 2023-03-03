import { Component, OnInit } from '@angular/core';
import { auto } from '@popperjs/core';
import { CallFuncService, DialogRef, FormModel, SidebarModel } from 'codx-core';
import { PopupTypeTaskComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { PopupTaskComponent } from '../popup-task/popup-task.component';

@Component({
  selector: 'lib-test-componet',
  templateUrl: './test-componet.component.html',
  styleUrls: ['./test-componet.component.scss']
})
export class TestComponetComponent implements OnInit {
  popupJob: DialogRef;
  jobType = '';
  public type1: string = 'Circular';
  public type2: string = 'Circular';
  public type3: string = 'Circular';
  public min1: number = 0;
  public max1: number = 100;
  public value1: number = 80;
  public startAngle1: number = 0;
  public endAngle1: number = 0;
  public width: string = '55';
  public height: string = '55';
  public min2: number = 0;
  public max2: number = 100;
  public value2: number = 100;
  public min3: number = 0;
  public max3: number = 100;
  public value3: number = 100;
  public animation = { enable: true, duration: 2000, delay: 0 };
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
