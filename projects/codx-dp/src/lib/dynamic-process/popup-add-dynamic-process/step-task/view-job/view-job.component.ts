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
  frmModel: FormModel = {};
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskType = dt?.data?.step?.taskType;
    this.stepsTasks = dt?.data?.step;
    this.taskList = dt?.data?.listStep;
    this. getModeFunction();
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
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
        let type = res.datas.find((x) => x.value === this.taskType);
        this.title = type['text'];
      }
    });
  }

  getModeFunction(){
    var functionID = 'DPT0206';
    this.cache.functionList(functionID).subscribe((f) => {
      this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((grv) => {
        this.frmModel['formName'] = f.formName;
        this.frmModel['gridViewName'] = f.gridViewName;
        this.frmModel['entityName'] = f.entityName;
        this.frmModel['funcID'] = functionID;
      });
    });
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
