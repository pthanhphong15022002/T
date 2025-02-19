import { filter } from 'rxjs';
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
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  Filters,
  FormModel,
  NotificationsService,
  ScrollComponent,
} from 'codx-core';
import {
  CodxEsService,
  GridModels,
} from 'projects/codx-es/src/lib/codx-es.service';
import { AddEditApprovalStepComponent } from './add-edit-approval-step/add-edit-approval-step.component';
import { CodxShareService } from '../../codx-share.service';
//import { PopupAddApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/popup-add-approval-step/popup-add-approval-step.component';

export class Approver {}
@Component({
  selector: 'codx-approval-steps',
  templateUrl: './codx-approve-steps.component.html',
  styleUrls: ['./codx-approve-steps.component.scss'],
})
export class CodxApproveStepsComponent
  implements OnInit, AfterViewInit
{
  @Input() transId: string = '';
  @Input() type: string = '0'; //0: có nút lưu; 1: không có nút lưu
  @Input() recID: string = '';
  @Input() mssgDelete = '';
  @Input() eSign: boolean = false; //Quy trình ký số
  @Input() signatureType; //Quy trình ký số
  @Input() approveControl = '3'; //Áp dụng quy trình duyệt theo: 1;Theo file trình ký; 2;ProcessID;  3;Category
  @Input() isTemplate = false; //signFile của template mẫu
  @Input() refType = 'ES_SignFiles'; //refType của signFile xử lí cho QTM của category
  @Input() vllShare = null;
  @Input() dynamicApprovers = [];
  @Input() isSettingMode = true; //True: ko hiện user nếu chọn role position
  @Output() addEditItem = new EventEmitter();
  @Output() checkPopupApproverInfo = new EventEmitter();

  headerText = '';
  subHeaderText;

  public isEdited = false;

  currentStepNo = 1;
  dialogApproval: DialogRef;
  formModel: FormModel;
  approvers = [];
  lstStep = [];
  lstDeleteStep = [];
  isDeleteAll = false;
  justView = false;
  isAddNew: boolean = true;

  positionDefault: string = '';

  @Input() data: any = {}; // object category

  model: any;
  isRequestListStep = false; //Thảo thêm ngày 19/04/2023 để xác nhận trả về danh sách listStep - true là trả về
  isAfterRender = false;
  lblAllowEditAreas: any;
  lblConfirmControl: any;
  popupApproverInfo =false;
  constructor(
    private cfService: CallFuncService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private shareService: CodxShareService,
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
      this.data = dialogData?.data.data;
      this.eSign = dialogData?.data?.data?.eSign !=null ? dialogData?.data?.data?.eSign : this.eSign ;
      this.vllShare = this.vllShare ?? dialogData?.data.vllShare;
      console.log(this.data);

      this.dialogApproval = dialog;
      this.isRequestListStep = dialogData?.data?.isRequestListStep ?? false; // Thảo thêm ngày 19/04/2023 để xác nhận trả về danh sách listStep - true là trả về
      this.lstStep = dialogData?.data?.lstStep ?? []; // Thảo thêm ngày 20/04/2023 để gui danh sach step qua ve
      this.justView = dialogData?.data.justView ?? false;
      this.isAddNew = dialogData?.data?.isAddNew ?? true;
    } else {
      this.type = '1';
    }
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.esService.getFormModel('EST04').then((res) => {
  //     if (res) {
  //       this.formModel = res;
  //       this.initForm();
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.cache
      .gridViewSetup('ApprovalSteps_Approvers', 'grvApprovalSteps_Approvers')
      .subscribe((grv) => {
        if (grv) {
          this.positionDefault = grv?.Position?.headerText;
          this.lblAllowEditAreas = grv?.AllowEditAreas?.headerText;
          this.lblConfirmControl = grv?.ConfirmControl?.headerText;
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
    // Thao lam de gui danh sach step qua ve  -20/04/2023
    if (this.isRequestListStep && this.lstStep?.length > 0) {
      this.currentStepNo = this.lstStep.length + 1;
    } else {
      if (this.transId != '') {
        this.shareService
          .viewApprovalStep(
            this.transId,
            this.isSettingMode,
            this.dynamicApprovers
          )
          .subscribe((res) => {
            if (res && res?.length == 2) {
              let tempListStep = res[0] ?? [];
              if (res[1]?.length > 0 && res[0]?.length > 0) {
                let apInfos = res[1];
                for (let st of res[0]) {
                  if (st?.approvers) {
                    for (let ap of st?.approvers) {
                      let curAp = [];
                      if (ap?.roleType == 'PE' ) {//|| ap?.roleType == 'PA'
                        this.popupApproverInfo = true;
                        this.checkPopupApproverInfo.emit(true);
                      }
                      if (ap?.roleType == 'P' || ap?.roleType == 'U') {
                        curAp = apInfos.filter(
                          (x) =>
                            x?.approver == ap?.approver &&
                            x?.roleType == ap?.roleType
                        );
                      } else {
                        curAp = apInfos.filter(
                          (x) => x?.roleType == ap?.roleType
                        );
                      }
                      if (curAp?.length > 0) {
                        ap.userIDs = curAp[0]?.userIDs;
                        //Nếu role Position có nhiều người thì hiện thông tin postion và ds người (ko hiện người cụ thể)
                        if(ap?.userIDs == null || ap.userIDs?.length==0){
                          ap.userID = curAp[0]?.userID;
                          ap.userName = curAp[0]?.userName;
                          ap.employeeID = curAp[0]?.employeeID;
                          ap.position = curAp[0]?.positionName ?? ap.position;
                          ap.orgUnitName = curAp[0]?.orgUnitName;
                        }
                      }
                    }
                  }
                }                 
                this.lstStep = tempListStep?.sort((a,b)=> a?.stepNo - b?.stepNo);               
              }
              else if(res[1]?.length>0){
                this.lstStep = res[1];
                this.cr.detectChanges();  
              }
              else{
                this.lstStep=[];
                this.cr.detectChanges();  
              }

            }
            
            this.isAfterRender = true;
            this.cr.detectChanges();
          });
      } else {
        this.lstStep = [];
        this.currentStepNo = this.lstStep.length + 1;
        this.isAfterRender = true;
        this.cr.detectChanges();
      }
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
      if (this.data) {
        this.data.countStep = this.lstStep.length;
        this.model?.patchValue({ countStep: this.lstStep.length });
      }
      // Thảo cần danh sách này để trả về danh sách Approver để view ở DP-Thảo sửa ngày 19/04/2023- va goi save từ bên DP
      if (this.isRequestListStep) {
        let objRequest = {
          listStepApprover: this.lstStep,
          listStepApproverDelete: this.lstDeleteStep,
        };
        this.dialogApproval && this.dialogApproval.close(objRequest);
      } else {
        this.updateApprovalStep();
        this.dialogApproval && this.dialogApproval.close(true);
      }
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
      vllShare: this.data?.approverList,
      eSign: this.type == '1' ? this.eSign : this.data?.eSign,
      confirmControl: this.data?.confirmControl,
      allowEditAreas: this.data?.allowEditAreas,
      hideTabQuery: false, //
    };
    if (this.isTemplate) {
      data.transID = this.transId;
    }
    this.openPopupAddAppStep(data);
  }

  edit(approvalStep) {
    if (this.lstStep && this.lstStep.length > 0) {
      this.lstStep.forEach((elm) => {
        if (!elm.signatureType)
          elm.signatureType = this.data?.signatureType ?? this.signatureType;
      });
    }

    let data = {
      transID: this.type == '1' ? this.recID : this.transId,
      stepNo: this.currentStepNo,
      lstStep: this.lstStep,
      isAdd: false,
      dataEdit: approvalStep,
      type: '0',
      eSign: this.type == '1' ? this.eSign : this.data?.eSign,
      vllShare: this.data?.approverList,
      hideTabQuery: false, //
    };

    if (this.isTemplate) {
      data.transID = this.transId;
    }
    this.openPopupAddAppStep(data);
  }

  delete(approvalStep) {
    if (this.isTemplate && this.data.refType != 'ES_Categories') {
      this.approveControl = '3';
    } else {
      this.approveControl = '1';
    }
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
            if (this.approveControl == '1') {
              if (this.lstDeleteStep[0].transID != this.recID) {
                this.lstDeleteStep = [];
              }
            } else if (this.approveControl == '3') {
              if (this.lstDeleteStep[0].transID != this.transId) {
                this.lstDeleteStep = [];
              }
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
          // PopupAddApprovalStepComponent,
          AddEditApprovalStepComponent,
          '',
          925,
          1500,
          'EST04',
          data,
          '',
          model
        );

        dialog.closed.subscribe((res) => {
          if (res?.event) {
            if (!this.isTemplate) {
              this.approveControl = '1';
            }
            if (this.type == '1') {
              if (this.lstStep?.length > 0) {
                for (let i = 0; i < this.lstStep.length; i++) {
                  if (this.isTemplate) {
                    if (this.lstStep[i].transID != this.transId) {
                      delete this.lstStep[i].recID;
                      delete this.lstStep[i].id;
                      this.lstStep[i].transID = this.transId;
                    }
                  } else {
                    //ko phải template
                    if (this.lstStep[i].transID != this.recID) {
                      delete this.lstStep[i].recID;
                      delete this.lstStep[i].id;
                      this.lstStep[i].transID = this.recID;
                    }
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
          this.notifySvr.notifyCode('SYS007');
        }
        this.addEditItem.emit(true);
      }
    });
    if (this.lstDeleteStep?.length > 0) {
      this.esService.deleteApprovalStep(this.lstDeleteStep).subscribe((res) => {
        console.log('result delete aaappppp', res);
        if (res == true) {
          this.addEditItem.emit(true);
        }
      });
    }
  }
}
