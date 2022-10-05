import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ScrollComponent,
} from 'codx-core';
import { CodxEsService, GridModels } from '../../codx-es.service';
import { PopupAddApprovalStepComponent } from './popup-add-approval-step/popup-add-approval-step.component';

export class Approver {}
@Component({
  selector: 'app-approval-steps',
  templateUrl: './approval-step.component.html',
  styleUrls: ['./approval-step.component.scss'],
})
export class ApprovalStepComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() transId = '';
  @Input() type = '0';
  @Output() addEditItem = new EventEmitter();

  headerText = 'Qui trình duyệt';
  subHeaderText;

  lstOldData;
  public isEdited = false;

  currentStepNo = 1;
  dialogApproval: DialogRef;
  formModel: FormModel;
  approvers = [];
  lstStep: any;
  lstDeleteStep = [];
  isDeleteAll = false;
  justView = false;
  isAddNew: boolean = true;

  data: any = {};

  model: any;

  constructor(
    private cfService: CallFuncService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    @Optional() dialogData: DialogData,
    @Optional() dialog: DialogRef
  ) {
    if (dialogData?.data.type) {
      this.type = dialogData?.data.type;
      this.transId = dialogData?.data.transID ?? '';
      this.model = dialogData?.data.model;
      this.data = dialogData?.data.data;
      this.dialogApproval = dialog;
      this.justView = dialogData?.data.justView ?? false;
      this.isAddNew = dialogData?.data?.isAddNew ?? true;
    } else {
      this.type = '1';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.esService.getFormModel('EST04').then((res) => {
      if (res) {
        this.formModel = res;
        this.initForm();
      }
    });
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

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  close() {
    this.dialogApproval && this.dialogApproval.close();
  }

  initForm() {
    this.esService.isSetupApprovalStep.subscribe((res) => {
      if (res != null) {
        this.lstStep = res;
        this.lstOldData = [...res];
        console.log(this.lstStep);
        this.cr.detectChanges();
        // ScrollComponent.reinitialization();
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
            console.log(this.lstStep);

            this.currentStepNo = this.lstStep.length + 1;
            this.lstOldData = [...res];
            this.cr.detectChanges();
            //ScrollComponent.reinitialization();
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
    //ScrollComponent.reinitialization();
  }

  onSaveForm() {
    this.esService.setApprovalStep(this.lstStep);
    this.esService.setLstDeleteStep(this.lstDeleteStep);
    this.data.countStep = this.lstStep.length;
    this.model.patchValue({ countStep: this.lstStep.length });
    this.updateApprovalStep(this.isAddNew);
    this.dialogApproval && this.dialogApproval.close(true);
  }

  saveStep() {
    if (this.isEdited) {
      console.log('SET VALUE');

      this.esService.setApprovalStep(this.lstStep);
      this.esService.setLstDeleteStep(this.lstDeleteStep);
    } else {
      console.log('SET NULL');

      this.esService.setApprovalStep(null);
      this.esService.setLstDeleteStep(null);
    }
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
      type: '0',
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
      type: '0',
    };
    this.openPopupAddAppStep(data);
  }

  delete(approvalStep) {
    this.notifySvr.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        let i = this.lstStep.indexOf(approvalStep);

        if (i != -1) {
          this.lstStep.splice(i, 1);
          this.isEdited = true;
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
        var dialog = this.cfService.openForm(
          PopupAddApprovalStepComponent,
          '',
          850,
          1500,
          'EST04',
          data,
          '',
          model
        );

        dialog.closed.subscribe((res) => {
          if (res?.event) {
            this.isEdited = true;
          }
        });
      }
    });
  }

  updateApprovalStep(isAddNew) {
    this.esService.editApprovalStep().subscribe((res) => {
      console.log('result edit appp', res);
      if (res) {
        this.notifySvr.notifyCode('RS002');
      }
    });

    this.esService.deleteApprovalStep().subscribe((res) => {
      console.log('result delete aaappppp', res);
    });
  }
}
