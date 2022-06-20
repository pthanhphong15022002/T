import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  NotificationsService,
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';
import { EditApprovalSteps } from './edit-approval-step/edit-approval-step.component';

export class Approver {}
@Component({
  selector: 'app-approval-steps',
  templateUrl: './approval-steps.component.html',
  styleUrls: ['./approval-steps.component.scss'],
})
export class ApprovalStepsComponent implements OnInit {
  @ViewChild('editApprovalStep') editApprovalStep;

  @Input() transId = '';
  @Output() addEditItem = new EventEmitter();

  currentStepNo = 1;
  approvers = [];
  data;

  constructor(
    private cfService: CallFuncService,
    private api: ApiHttpService,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('transID', this.transId);
    this.initForm();
  }

  close() {}

  initForm() {
    if (this.transId != '') {
      this.api
        .callSv('ES', 'ES', 'CategoriesBusiness', 'GetListApprovalStepAsync', [
          this.transId,
        ])
        .subscribe((res) => {
          if (res && res?.msgBodyData[0]) {
            this.data = res.msgBodyData[0];
            this.currentStepNo = this.data.length + 1;
          } else {
            this.notify.notify('Chưa có dữ liệu');
          }
        });
    }
  }

  openAddEdit(content) {
    let data = {
      transID: this.transId,
      stepNo: this.currentStepNo,
    };
    // this.cfService.openForm(content, '', 750, 1000).subscribe((res) => {
    //   res.close = this.close();
    // });
    this.addEditItem.emit(data);
  }

  addHandler(data, stepNo: number) {
    if (data[stepNo - 1]) {
      this.data[stepNo - 1] = data;
    } else this.data.push(data);
    this.cr.detectChanges();
  }

  setTransID(transID) {
    this.transId = transID;
    this.initForm();
    this.cr.detectChanges();
  }
}
