import { ActivatedRoute } from '@angular/router';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'codx-update-progress',
  templateUrl: './update-progress.component.html',
  styleUrls: ['./update-progress.component.scss']
})
export class UpdateProgressComponent implements OnInit,OnChanges {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('popupProgress') popupProgress: AttachmentComponent;
  @Input() formModel: FormModel;
  @Input() dataSource: any;
  @Input() typeProgress = 1;
  @Input() progress = 0;
  @Input() type: string;

  @Input() dataAll: any; // gantchart
  @Input() step: any; // No gantchart

  @Output() valueChange = new EventEmitter<any>();

  progressOld = 0;
  disabledProgressInput = false;
  showLabelAttachment = false;
  user: any;
  dialog: DialogRef;
  isHaveFile = false;
  actualEndMax: Date;
  headerTextInsStep = {};
  id = ''
  HTMLProgress = `<div style="font-size:12px;font-weight:bold;color:#005DC7;fill:#005DC7;margin-top: 2px;"><span></span></div>`
  popupUpdateProgress: DialogRef;

  progressData = 0;
  actualEnd: Date;
  note = '';

  constructor(
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.id = "progress" + (Math.random() * 100000000).toString();
  }

  async ngOnInit() {
    if (this.step) {
      this.actualEndMax = this.step?.actualStart;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataSource && changes.dataSource.currentValue) { 
      this.progressData = Number(this.dataSource['progress'] || 0) ;
      this.actualEnd = this.dataSource['actualEnd'] || null;
      this.note == this.dataSource['note'] || '';
      this.progressOld = this.progressData ;
      this.progress = this.progressData;
    }
    // if (changes.dataSource && JSON.stringify(changes.dataSource.currentValue) !== JSON.stringify(this.previousDataSource)) {
    //   // Xử lý thay đổi của thuộc tính đầu vào
    //   console.log('Có thay đổi bên trong dataSource:', changes.dataSource.currentValue);
    //   // Cập nhật giá trị previousDataSource
    //   this.previousDataSource = changes.dataSource.currentValue;
    // }
    
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

  openPopup() {
    const checkOpen = this.checkConditionOpenPopup();
    if (!checkOpen) {
      this.popupUpdateProgress = this.callfc.openForm(this.popupProgress, '', 550, 400);
    }
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
      this.progressData = this.progressOld;
      this.actualEnd = null;
    }
    this.disabledProgressInput = event?.data;
  }

  changeProgress(e, data) {
    this.progressData= e?.value ? e?.value : 0;
    if (this.progressData < 100) {
      this.actualEnd = null;
    }
    if (this.progressData == 100 && ! this.actualEnd) {
      this.actualEnd = new Date();
    }
  }

  changeValueDate(event, data) {
    data[event?.field] = event?.data?.fromDate;
    if (data['progress'] < 100) {
      data['actualEnd'] = null;
    }
  }

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
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

  async handelProgress() {
    if (this.dataSource?.progress == 100 && !this.dataSource?.actualEnd) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        this.headerTextInsStep['ActualEnd']
      );
      return;
    }
    if (
      this.dataSource?.actualEnd &&
      new Date(this.actualEndMax) > new Date(this.dataSource?.actualEnd)
    ) {
      this.notiService.notifyCode(
        'DP035',
        0,
        this.headerTextInsStep['ActualEnd']
      );
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
      const check = await this.beforeUpdate('DP031');
      this.updateProgress(check);
    } else {
      const check = await this.beforeUpdate('DP028');
      this.updateProgress(check);
    }
  }

  updateProgress(isUpdate = false) {
    let dataSave = new Progress();
    dataSave.stepID = this.step['recID'];
    dataSave.recID = this.dataSource['recID'];
    dataSave.progress = this.progressData 
    dataSave.note = this.note;
    dataSave.actualEnd = this.actualEnd;
    dataSave.type = this.type;
    dataSave.isUpdate = isUpdate;
    
    this.api.exec<any>('DP','InstanceStepsBusiness','UpdateProgressAsync',dataSave).subscribe(res => {
      this.valueChange.emit(res)
      this.dataSource['progress'] = this.progressData ;
      this.dataSource['note'] = this.note ;
      this.dataSource['actualEnd'] = this.actualEnd;
      this.progress = this.progressData;
      this.popupUpdateProgress.close();
      this.notiService.notifyCode('SYS006');
    });
  }

  async beforeUpdate(funcID): Promise<boolean> {
    let check = await firstValueFrom(this.notiService.alertCode(funcID));
    return check?.event?.status === 'Y' ? true : false;
  }

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