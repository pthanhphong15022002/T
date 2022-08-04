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
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxEsService, GridModels } from '../../codx-es.service';
import { PopupAddApprovalStepComponent } from './popup-add-approval-step/popup-add-approval-step.component';

export class Approver {}
@Component({
  selector: 'app-approval-steps',
  templateUrl: './approval-step.component.html',
  styleUrls: ['./approval-step.component.scss'],
})
export class ApprovalStepComponent implements OnInit {
  @Input() transId = '';
  @Input() type = '0';
  @Output() addEditItem = new EventEmitter();

  headerText = 'Qui trình duyệt';
  subHeaderText;

  currentStepNo = 1;
  dialog: DialogRef;
  formModel: FormModel;
  approvers = [];
  lstStep: any = null;
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
    @Optional() dialogData: DialogData,
    @Optional() dialog: DialogRef
  ) {
    if (dialogData?.data.type) {
      this.type = dialogData?.data.type;
      this.transId = dialogData?.data.transID ?? '';
      this.model = dialogData?.data.model;
      this.dialog = dialog;
    } else {
      this.type = '1';
    }
  }

  ngOnInit(): void {
    this.esService.getFormModel('EST04').then((res) => {
      if (res) {
        this.formModel = res;
        this.initForm();
      }
    });
    console.log('transID', this.transId);
  }

  close() {
    this.dialog && this.dialog.close();
  }

  initForm() {
    this.esService.isSetupApprovalStep.subscribe((res) => {
      if (res != null) {
        this.lstStep = res;
        console.log(this.lstStep);
      } else if (this.transId != '') {
        // if (this.transId != '') {
        let gridModels = new GridModels();
        gridModels.dataValue = this.transId;
        gridModels.predicate = 'TransID=@0';
        gridModels.funcID = this.formModel.funcID;
        gridModels.entityName = this.formModel.entityName;
        gridModels.gridViewName = this.formModel.gridViewName;
        gridModels.pageSize = 20;

        this.esService.getApprovalSteps(gridModels).subscribe((res) => {
          if (res && res?.length >= 0) {
            this.lstStep = res;
            this.currentStepNo = this.lstStep.length + 1;
          }
        });
      } else {
        this.lstStep = [];
        this.currentStepNo = this.lstStep.length + 1;
      }
    });
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

  saveStep() {
    this.esService.setApprovalStep(this.lstStep);
    this.esService.setLstDeleteStep(this.lstDeleteStep);
  }

  openFormFuncID(val: any, data: any) {}

  clickMF(event: any, data) {
    switch (event.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS02':
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
      type: this.type,
    };

    this.openPopupAddAppStep(data);
  }

  edit(approvalStep) {
    let data = {
      transID: this.transId,
      stepNo: this.currentStepNo,
      lstStep: this.lstStep,
      isAdd: false,
      dataEdit: approvalStep,
      type: this.type,
    };
    this.openPopupAddAppStep(data);
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

  openPopupAddAppStep(data) {
    this.esService.getFormModel('EST04').then((res) => {
      if (res) {
        var model = new DialogModel();
        model.FormModel = res;
        this.cfService.openForm(
          PopupAddApprovalStepComponent,
          '',
          850,
          1500,
          'EST04',
          data,
          '',
          model
        );
      }
    });
  }
}
