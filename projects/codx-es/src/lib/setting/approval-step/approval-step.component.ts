import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';
import { CodxEsService } from '../../codx-es.service';
import { PopupAddApprovalStepComponent } from './popup-add-approval-step/popup-add-approval-step.component';

export class Approver {}
@Component({
  selector: 'app-approval-steps',
  templateUrl: './approval-step.component.html',
  styleUrls: ['./approval-step.component.scss'],
})
export class ApprovalStepComponent implements OnInit {
  @ViewChild('editApprovalStep') editApprovalStep;

  @Input() transId = '';
  @Output() addEditItem = new EventEmitter();

  headerText = 'Qui trình duyệt';
  subHeaderText;

  currentStepNo = 1;
  dialog: DialogRef;
  formModel: FormModel;
  approvers = [];
  data;

  constructor(
    private cfService: CallFuncService,
    private api: ApiHttpService,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    @Optional() data: DialogData,
    @Optional() dialog: DialogRef
  ) {
    this.transId = data?.data ?? '';
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.esService.getFormModel('EST04').then((res) => {
      if (res) {
        this.formModel = res;
      }
    });
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

    // this.addEditItem.emit(data);
    this.cfService.openForm(
      PopupAddApprovalStepComponent,
      '',
      750,
      1000,
      'EST04',
      data
    );
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

  onSaveForm() {}

  openFormFuncID(val: any, data: any) {}
  click(evt: ButtonModel) {
    // switch (evt.id) {
    //   case 'btnAdd':
    //     this.show();
    //     break;
    //   case 'edit':
    //     this.edit();
    //     break;
    //   case 'delete':
    //     this.delete();
    //     break;
    // }
  }

  clickMF(event: any, data) {}
}
