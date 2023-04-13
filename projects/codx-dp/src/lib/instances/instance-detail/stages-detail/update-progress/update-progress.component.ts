import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CacheService, CallFuncService, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { AnyARecord } from 'dns';
import { InstancesComponent } from '../../../instances.component';
import { CodxDpService } from 'projects/codx-dp/src/public-api';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'codx-update-progress',
  templateUrl: './update-progress.component.html',
  styleUrls: ['./update-progress.component.scss']
})
export class UpdateProgressComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('popupProgress') popupProgress: AttachmentComponent;
  @Input() formModel: FormModel;
  @Input() dataSource: any;
  @Input() type = 1;

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

  constructor(
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    private dpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.id = "progress" + (Math.random()*100000000).toString();
  }

  async ngOnInit(){  

  }

  openPopup(){
    this.popupUpdateProgress = this.callfc.openForm(this.popupProgress, '', 550, 400);
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
      data[event?.field] = 100;
      data['actualEnd'] = new Date();
    } else {
      data[event?.field] = this.progressOld;
      data['actualEnd'] = null;
    }
    this.disabledProgressInput = event?.data;
  }

  changeProgress(e, data) {
    data['progress'] = e?.value ? e?.value : 0;
    if (data['progress'] < 100) {
      data['actualEnd'] = null;
    }
    if (data['progress'] == 100 && !data['actualEnd']) {
      data['actualEnd'] = new Date();
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

  fileAdded(e) {}

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
       
      });
    } else {
      
    }
  }
}
