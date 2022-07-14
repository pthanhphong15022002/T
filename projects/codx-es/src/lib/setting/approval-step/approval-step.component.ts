import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxEsService } from '../../codx-es.service';
import { PopupAddApprovalStepComponent } from './popup-add-approval-step/popup-add-approval-step.component';

export class Approver {}
@Component({
  selector: 'app-approval-steps',
  templateUrl: './approval-step.component.html',
  styleUrls: ['./approval-step.component.scss'],
})
export class ApprovalStepComponent implements OnInit {
  @Input() transId = '';
  @Output() addEditItem = new EventEmitter();

  headerText = 'Qui trình duyệt';
  subHeaderText;

  currentStepNo = 1;
  dialog: DialogRef;
  formModel: FormModel;
  approvers = [];
  lstStep: any;
  lstDeleteStep = [];
  isDeleteAll = false;

  model: any;

  constructor(
    private cfService: CallFuncService,
    private api: ApiHttpService,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notifySvr: NotificationsService,
    @Optional() data: DialogData,
    @Optional() dialog: DialogRef
  ) {
    this.transId = data?.data.transID;
    this.model = data?.data.model;
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
    this.esService.isSetupApprovalStep.subscribe((res) => {
      if (res != null) {
        this.lstStep = res;
      } else {
        if (this.transId != '') {
          this.api
            .callSv(
              'ES',
              'ES',
              'CategoriesBusiness',
              'GetListApprovalStepAsync',
              [this.transId]
            )
            .subscribe((res) => {
              if (res && res?.msgBodyData[0]) {
                this.lstStep = res.msgBodyData[0];
                console.log(this.lstStep);

                this.currentStepNo = this.lstStep.length + 1;
              } else {
                this.notify.notify('Chưa có dữ liệu');
              }
            });
        }
      }
    });
  }

  addHandler(data, stepNo: number) {
    if (data[stepNo - 1]) {
      this.lstStep[stepNo - 1] = data;
    } else this.lstStep.push(data);
    this.cr.detectChanges();
  }

  setTransID(transID) {
    this.transId = transID;
    this.initForm();
    this.cr.detectChanges();
  }

  onSaveForm() {
    this.esService.setApprovalStep(this.lstStep);
    this.esService.setLstDeleteStep(this.lstDeleteStep);
    this.model.patchValue({ countStep: this.lstStep.length });
    this.dialog && this.dialog.close();
  }

  openFormFuncID(val: any, data: any) {}

  clickMF(event: any, data) {
    switch (event.functionID) {
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }

  add() {
    let data = {
      transID: this.transId,
      stepNo: this.lstStep.length + 1,
      lstStep: this.lstStep,
      isAdd: true,
      dataEdit: null,
    };

    // this.addEditItem.emit(data);
    this.cfService.openForm(
      PopupAddApprovalStepComponent,
      '',
      800,
      1500,
      'EST04',
      data
    );
  }

  edit(approvalStep) {
    let data = {
      transID: this.transId,
      stepNo: this.currentStepNo,
      lstStep: this.lstStep,
      isAdd: false,
      dataEdit: approvalStep,
    };

    this.cfService.openForm(
      PopupAddApprovalStepComponent,
      '',
      800,
      1500,
      'EST04',
      data
    );
  }

  delete(approvalStep) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notifySvr
      .alert(
        'Thông báo',
        'Hệ thống sẽ thu hồi quyền đã chia sẻ của người này bạn có muốn xác nhận hay không ?',
        config
      )
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          let i = this.lstStep.indexOf(approvalStep);

          if (i != -1) {
            this.lstStep.splice(i, 1);
          }
          if (approvalStep.recID && approvalStep.recID != null) {
            this.lstDeleteStep.push(approvalStep);
          }
          for (let i = 0; i < this.lstStep.length; i++) {
            this.lstStep[i].stepNo = i + 1;
          }

          if (this.lstStep.length == 0) {
            this.isDeleteAll = true;
          }
        }
      });
  }

  getLeadTime(event) {
    return '';
  }
}
