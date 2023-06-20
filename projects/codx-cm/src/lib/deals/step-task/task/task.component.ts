import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, FormModel, NotificationsService, SidebarModel, Util } from 'codx-core';
import { DP_Instances_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';
import { CodxAddTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-add-stask/codx-add-task.component';
import { CodxTypeTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-type-task/codx-type-task.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit , AfterViewInit, OnChanges{
  taskType;
  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
  ) {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }

  async chooseTypeTask() {
    setTimeout(async () => {
      let popupTypeTask = this.callFunc.openForm(
        CodxTypeTaskComponent,
        '',
        450,
        580,
        '',
        {isShowGroup: false},
      );
      let dataOutput = await firstValueFrom(popupTypeTask.closed);
      if (dataOutput?.event?.value) {
        this.taskType = dataOutput?.event;
        this.addTask();
      }
    }, 0);
  }
  async addTask() {
    let task = new DP_Instances_Steps_Tasks();
    task['progress'] = 0;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;

    let taskOutput = await this.openPopupTask('add', task);
    if (taskOutput?.event) {
      let data = taskOutput?.event;
      console.log(data);
      
    }
  }

  async openPopupTask(action, dataTask, groupTaskID = null) {
    let dataInput = {
      action,
      taskType: this.taskType,
      step: null,
      listGroup: null,
      dataTask: dataTask || {},
      listTask: null,
      isEditTimeDefault: null,
      groupTaskID, // trường hợp chọn thêm từ nhóm
      isSave: false
    };
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1011;
    option.FormModel = frmModel;
    let popupTask = this.callFunc.openSide(
      CodxAddTaskComponent,
      dataInput,
      option
    );
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }
}
