import { Component, OnInit, Optional } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { DP_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-view-job',
  templateUrl: './view-job.component.html',
  styleUrls: ['./view-job.component.scss'],
})
export class ViewJobComponent implements OnInit {
  title = '';
  dialog!: DialogRef;
  formModelMenu: FormModel;
  stepsTasks: DP_Steps_Tasks;
  taskType = '';
  listOwner = [];
  taskList: DP_Steps_Tasks[] = [];
  taskListConnect: DP_Steps_Tasks[] = [];
  listTypeTask = [];
  files: any[] = [];
  fileMedias: any[] = [];
  fileDocuments: any[] = [];
  filesDelete: any[] = [];
  filesAdd: any[] = [];
  size: number = 0;
  medias = 0;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  frmModel: FormModel = {
    entityName: 'DP_Steps_Tasks',
    formName: 'DPStepsTasks',
    gridViewName: 'grvDPStepsTasks',
  };
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskType = dt?.data?.step?.stepType;
    this.stepsTasks = dt?.data?.step;
    this.taskList = dt?.data?.listStep;
  }

  ngOnInit(): void {
    this.listOwner = this.stepsTasks?.roles || [];
    if (this.stepsTasks?.parentID) {
      this.taskList.forEach((task) => {
        if (this.stepsTasks?.parentID.includes(task.recID)) {
          this.taskListConnect.push(task);
        }
      });
    }
    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        let type = res.datas.find((x) => x.value === this.taskType);
        this.title = type['text'];
      }
    });
    this.getFileByObjectID('test');

    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.id == objectID);
    if (index != -1) data.splice(index, 1);
  }

  getFileByObjectID(objectID: string) {
    if (objectID) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          [this.stepsTasks?.recID]
        )
        .subscribe((res: any[]) => {
          if (Array.isArray(res) && res.length > 0) {
            this.files = JSON.parse(JSON.stringify(res));
          }
        });
    }
  }

  getIconTask(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return color?.icon;
  }

  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return { 'background-color': color?.color };
  }
  getColorTile(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return { 'border-left': '3px solid'+ color?.color};
  }

}
