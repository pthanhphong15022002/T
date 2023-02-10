import { Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { DP_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

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
  status = '';
  stepType = '';
  stepID = '';
  listOwner = [];
  taskList: DP_Steps_Tasks[] = [];
  taskListConnect: DP_Steps_Tasks[] = [];

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
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private codxShareSV: CodxShareService,
    private api: ApiHttpService,
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
    if (this.stepsTasks?.parentID) {
      this.taskList.forEach((task) => {
        if (this.stepsTasks?.parentID.includes(task.recID)) {
          this.taskListConnect.push(task);
        }
      });
    }
    this.getFileByObjectID('test');
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
}
