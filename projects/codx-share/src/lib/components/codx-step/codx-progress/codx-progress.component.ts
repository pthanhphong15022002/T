import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';


@Component({
  selector: 'codx-progress',
  templateUrl: './codx-progress.component.html',
  styleUrls: ['./codx-progress.component.scss']
})
export class UpdateProgressComponent implements OnInit, OnChanges {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() formModel: FormModel;
  @Input() typeProgress = 1; // nếu % ko lên dùng type 2
  @Input() dataSource: any; // data chứa tiến độ
  @Input() progress = 0; // tiến độ
  @Input() type: string;
  @Input() isSave = true; //true:lưu lên db không
  @Input() isUpdate = true; // true: hiện form cho update
  @Input() dataAll: any; // gantchart
  @Input() step: any; // No gantchart
  @Output() valueChange = new EventEmitter<any>();

  note = '';
  user: any;
  actualEnd: Date;
  dialog: DialogRef;
  actualEndMax: Date;
  progressOld = 0;
  progressData = 0;
  isHaveFile = false;
  headerTextInsStep = {};
  showLabelAttachment = false;
  disabledProgressInput = false;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.type = dt?.data?.type;
    this.step = dt?.data?.step;
    this.dataSource = dt?.data?.data;
    this.isSave = dt?.data?.isSave;
  }

  async ngOnInit() {
    if (this.isUpdate && this.step) {
      this.actualEndMax = this.step?.actualStart;
    }
    this.progressOld = this.progressData;
    this.note = this.dataSource['note'] || '';
    this.actualEnd = this.dataSource['actualEnd'] || null;
    this.progressData = Number(this.dataSource['progress'] || 0);
    this.getgridViewSetup(this.dialog.formModel);
    this.disabledProgressInput = this.progressData == 100 ? true : false;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  checkConditionOpenPopup() {
    let check = false;
    if (this.step && this.dataSource?.parentID) {
      //check công việc liên kết hoàn thành trước
      let taskName = '';
      let listID = this.dataSource?.parentID.split(';');
      listID?.forEach((item) => {
        let taskFind = this.step?.tasks?.find((task) => task.refID == item);
        if (taskFind?.progress != 100) {
          check = true;
          taskName = taskFind?.taskName;
        } else {// ngày kết thúc của task này phải lớn ngày kết thúc của task liên kết
          this.actualEndMax = !this.actualEndMax || taskFind?.actualEnd > this.actualEndMax ? taskFind?.actualEnd : this.actualEndMax;
        }
      });
      if (check) {
        this.notiService.notifyCode('DP023', 0, taskName);
      }
    }
    return check;
  }

  getgridViewSetup(data) {
    this.cache
      .gridViewSetup(data?.formName, data?.gridViewName)
      .subscribe((res) => {
        if (res) {
          for (let item in res) {
            this.headerTextInsStep[item] = res[item]['headerText'];
          }
        }
      });
  }
  // check checkbox 100%
  checkRadioProgress(event, data) {
    if (event?.data) {
      this.progressData = 100;
      this.actualEnd = new Date();
    } else {
      this.progressData = this.progressOld == 100 ? 0 : this.progressOld;
      this.actualEnd = null;
    }
    this.disabledProgressInput = event?.data;
  }

  changeProgress(e, data) {
    this.progressData = e?.value ? e?.value : 0;
    if (this.progressData < 100) {
      this.actualEnd = null;
    }
    if (this.progressData == 100 && !this.actualEnd) {
      this.actualEnd = new Date();
    }
  }

  changeValueDate(event, data) {
    this.actualEnd = event?.data?.fromDate;
    if (this.progressData < 100) {
      this.actualEnd = null;
    }
  }

  changeValueInput(event, data) {
    this.note = event?.data;
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(e) { }

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  getfileDelete(event) {
    event.data.length;
  }

  async save() {
    if (this.progressData == 100 && !this.actualEnd) {
      this.notiService.notifyCode('SYS009', 0, this.headerTextInsStep['ActualEnd']);
      return;
    }
    if (this.actualEnd && new Date(this.actualEndMax) > new Date(this.actualEnd)) {
      this.notiService.notifyCode('DP035',0,this.headerTextInsStep['ActualEnd']);
      return;
    }

    if (this.attachment && this.attachment.fileUploadList.length) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.handeleUpdate();
        }
      });
    } else {
      this.handeleUpdate();
    }
  }

  async handeleUpdate() {
    if (this.type === 'P') {
      this.updateProgress();
    } else if (this.type === 'G') {
      const check = await this.beforeUpdate('DP031'); // hỏi có cập nhật step
      if (check == undefined) return;
      let isUpdate = check == "Y" ? true : false;
      this.updateProgress(isUpdate);
    } else {
      const check = await this.beforeUpdate('DP028');// hỏi có cập nhật step và group
      if (check == undefined) return;
      let isUpdate = check == "Y" ? true : false;
      this.updateProgress(isUpdate);
    }
  }

  updateProgress(isUpdate = false) {
    let dataSave = new Progress();
    dataSave.stepID = this.step['recID'];
    dataSave.recID = this.dataSource['recID'];
    dataSave.progress = this.progressData;
    dataSave.note = this.note;
    dataSave.actualEnd = this.actualEnd;
    dataSave.type = this.type;
    dataSave.isUpdate = isUpdate;
    if (this.isSave) {
      this.api.exec<any>('DP', 'InstanceStepsBusiness', 'UpdateProgressAsync', dataSave).subscribe(res => {
        this.dialog.close(res)
        this.notiService.notifyCode('SYS007');
      });
    } else {
      let dataOutput = this.handelDataOutput(isUpdate)
      this.dialog.close(dataOutput);
    }
  }

  handelDataOutput(isUpdate) {
    let dataOutput = new progressOutput();
    dataOutput.isUpdate = isUpdate;
    dataOutput.actualEnd = this.actualEnd;
    dataOutput.note = this.note;
    dataOutput.type = this.type;
    if(this.type == 'P'){
      dataOutput.progressStep = this.progressData;
        dataOutput.stepID = this.dataSource['recID'];
    }else if(this.type == 'G'){
      dataOutput.progressGroupTask = this.progressData;
      dataOutput.groupTaskID = this.dataSource['recID'];
      dataOutput.stepID = this.step['recID'];
    }else{
      dataOutput.groupTaskID = this.dataSource['taskGroupID'];
      dataOutput.taskID = this.dataSource['recID'];
      dataOutput.stepID = this.step['recID'];
      dataOutput.progressTask = this.progressData;
      if (isUpdate) {
        this.progressGroupTask(dataOutput);
      }
    }
    return dataOutput;
  }

  progressGroupTask(dataOutput: progressOutput) {
    if (this.step) {
      let step = JSON.parse(JSON.stringify(this.step));
      if (dataOutput.groupTaskID) {
        let listTask = step?.tasks?.filter(task => task.taskGroupID == dataOutput.groupTaskID) || [];
        let task = listTask?.find(t => t.recID == dataOutput.taskID);
        task.progress = dataOutput.progressTask;
        const sum = listTask.reduce((acc, task) => {
          return acc + task.progress;
        }, 0);
        dataOutput.progressGroupTask = Number((sum / listTask.length).toFixed(2));
      }
    }

  }

  async beforeUpdate(funcID): Promise<any> {
    let check = await firstValueFrom(this.notiService.alertCode(funcID));
    return check?.event?.status;
  }

}
export class progressOutput {
  stepID: string = null;
  groupTaskID: string = null;
  taskID: string = null;
  type: string;
  progressStep: number = 0;
  progressGroupTask: number = 0;
  progressTask: number = 0;
  note: string = '';
  actualEnd: Date = null;
  isUpdate: boolean = false;
}
export class Progress {
  stepID: string;
  recID: string;
  note: string;
  progress: number;
  actualEnd: Date;
  type: string;
  isUpdate: boolean;
}