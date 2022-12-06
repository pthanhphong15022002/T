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
  @Input() transId: string = '';
  @Input() type: string = '0'; //0: có nút lưu; 1: không có nút lưu
  @Input() recID: string = '';
  @Input() mssgDelete = '';
  @Input() eSign: boolean = false; //Quy trình ký số
  @Input() signatureType; //Quy trình ký số
  @Output() addEditItem = new EventEmitter();

  headerText = '';
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

  positionDefault: string = '';

  @Input() data: any = {}; // object category

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

      console.log(this.data);

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
    this.cache
      .gridViewSetup('ApprovalSteps_Approvers', 'grvApprovalSteps_Approvers')
      .subscribe((grv) => {
        if (grv) {
          this.positionDefault = grv['Position']['headerText'];
        }
      });
    this.esService.getFormModel('EST04').then((res) => {
      if (res) {
        this.formModel = res;
        this.initForm();
      }
    });
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  close() {
    this.dialogApproval && this.dialogApproval.close();
  }

  initForm() {
    if (this.transId != '') {
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
          this.lstOldData = [...res];
          this.cr.detectChanges();
        }
      });
    } else {
      this.lstStep = [];
      this.currentStepNo = this.lstStep.length + 1;
    }
  }

  setTransID(transID) {
    this.transId = transID;
    this.initForm();
    this.cr.detectChanges();
    //ScrollComponent.reinitialization();
  }

  onSaveForm() {
    if (this.type == '1') {
      //Lưu khi cập nhật step
      this.updateApprovalStep();
    } else {
      //Nhấn nút lưu
      this.data.countStep = this.lstStep.length;
      this.model.patchValue({ countStep: this.lstStep.length });
      this.updateApprovalStep();
      this.dialogApproval && this.dialogApproval.close(true);
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
      transID: this.type == '1' ? this.recID : this.transId,
      stepNo: this.lstStep.length + 1,
      lstStep: this.lstStep,
      isAdd: true,
      dataEdit: null,
      type: '0',
      signatureType: this.data?.signatureType ?? this.signatureType,
      eSign: this.type == '1' ? this.eSign : this.data?.eSign,
      confirmControl: this.data?.confirmControl,
      allowEditAreas: this.data?.allowEditAreas,
      hideTabQuery: true,
    };

    this.openPopupAddAppStep(data);
  }

  edit(approvalStep) {
    let data = {
      transID: this.type == '1' ? this.recID : this.transId,
      stepNo: this.currentStepNo,
      lstStep: this.lstStep,
      isAdd: false,
      dataEdit: approvalStep,
      type: '0',
      eSign: this.type == '1' ? this.eSign : this.data?.eSign,
      hideTabQuery: true,
    };
    this.openPopupAddAppStep(data);
  }

  delete(approvalStep) {
    let mssgCode = 'SYS030';
    if (this.type == '1' && this.mssgDelete != '') {
      mssgCode = this.mssgDelete;
    }
    this.notifySvr.alertCode(mssgCode).subscribe((x) => {
      if (x.event?.status == 'Y') {
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

        if (this.type == '1' && this.recID != '') {
          //Lưu trực tiếp khi cập nhật form
          let lstNewStep = [];
          if (this.lstStep?.length > 0) {
            this.lstStep.forEach((step) => {
              if (step.transID != this.recID) {
                delete step.recID;
                delete step.id;
                step.transID = this.recID;
                lstNewStep.push(step);
              }
            });
          }
          if (lstNewStep.length > 0) {
            this.lstStep = lstNewStep;
            console.log('new step', this.lstStep);
          }
          if (this.lstDeleteStep.length > 0) {
            if (this.lstDeleteStep[0].transID != this.recID) {
              this.lstDeleteStep = [];
            }
          }

          this.onSaveForm();
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
            if (this.type == '1') {
              if (this.lstStep?.length > 0) {
                for (let i = 0; i < this.lstStep.length; i++) {
                  if (this.lstStep[i].transID != this.recID) {
                    delete this.lstStep[i].recID;
                    delete this.lstStep[i].id;
                    this.lstStep[i].transID = this.recID;
                  }
                }
              }
              this.updateApprovalStep();
            }
          }
        });
      }
    });
  }

  updateApprovalStep() {
    this.esService.editApprovalStep(this.lstStep).subscribe((res) => {
      console.log('result edit appp', res);
      if (res) {
        if (this.lstStep?.length > 0) {
          for (let i = 0; i < this.lstStep?.length; i++) {
            if (!this.lstStep[i].recID) {
              this.lstStep[i].recID = res[i].recID;
              this.lstStep[i].id = res[i].id;
              this.lstStep[i].createdBy = res[i].createdBy;
              this.lstStep[i].createdOn = res[i].createdOn;
            }
          }
        }
        if (this.type == '0') {
          this.notifySvr.notifyCode('RS002');
          this.addEditItem.emit(true);
        }
      }
    });

    this.esService.deleteApprovalStep(this.lstDeleteStep).subscribe((res) => {
      console.log('result delete aaappppp', res);
      if (res == true) {
        this.addEditItem.emit(true);
      }
    });
  }
}
