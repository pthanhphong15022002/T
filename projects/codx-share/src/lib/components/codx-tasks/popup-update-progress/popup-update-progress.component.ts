import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import * as moment from 'moment';
import { CodxTasksService } from '../codx-tasks.service';
@Component({
  selector: 'lib-popup-update-progress',
  templateUrl: './popup-update-progress.component.html',
  styleUrls: ['./popup-update-progress.component.css'],
})
export class PopupUpdateProgressComponent implements OnInit {
  comment: string = '';
  data: any;
  dialog: any;
  task: any;
  statusDisplay = '';
  timeStart: any;
  completed: any;
  completedOn: any;
  moreFunc: any;
  url: string;
  status: string;
  title: string = 'Cập nhật tiến độ thực hiện';
  funcID: any;
  updateForm: FormGroup;
  percentage100 = false;
  submitted = false;
  crrpercentage = 0;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private tmSv: CodxTasksService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID;
    this.task = JSON.parse(JSON.stringify(this.data?.data));
    this.moreFunc = this.data?.moreFunc;
    this.title = this.moreFunc.customName;
    this.task.percentage = this.task?.percentage?.toFixed(2)
    this.crrpercentage = this.task.percentage;
  }

  ngOnInit(): void {
    this.task.modifiedOn = moment(new Date()).toDate();
    if (this.task?.percentage == 100) this.percentage100 = true;
  }
  changePercentage(data) {
    if (data?.data) {
      this.task.percentage = data?.data?.toFixed(2);
      if (this.task.percentage == 100) this.percentage100 = true;
      else this.percentage100 = false;
      this.changeDetectorRef.detectChanges();
    }
  }
  valueChangePercentage100(e: any) {
    if (e?.data) {
      this.task.percentage = 100;
      this.percentage100 = true;
    } else {
      this.percentage100 = false;
      this.task.percentage = this.crrpercentage;
    }
  }
  valueChangComment(e){
    this.comment = e.data ;
  }

  saveData() {
    if (this.task.percentage < this.crrpercentage) {
      this.notiService.alertCode('TM056').subscribe((res) => {
        if (res?.event && res?.event?.status == 'Y') {
          this.actionUpdatePercentage();
        } else this.dialog.close();
      });
    }else this.actionUpdatePercentage();
  }
  actionUpdatePercentage() {
   this.tmSv.updateProgressTask(this.funcID,this.task.taskID,this.task.modifiedOn,this.task.percentage,this.comment).subscribe(res=>{
    if(res && res.length > 0){
      this.dialog.close(res) ;
      this.notiService.notifyCode('SYS007');
     // this.notiService.notify("Cập nhật tiến độ thành công !")
    }
   })
  }
}
