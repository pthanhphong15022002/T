import { E } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { iframeMouseDown } from '@syncfusion/ej2-angular-richtexteditor';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { Approvers } from '../../../codx-es.model';
import { CodxEsService } from '../../../codx-es.service';
import { PopupAddApproverComponent } from '../popup-add-approver/popup-add-approver.component';
import { PopupAddEmailTemplateComponent } from '../popup-add-email-template/popup-add-email-template.component';

@Component({
  selector: 'popup-add-approval-step',
  templateUrl: './popup-add-approval-step.component.html',
  styleUrls: ['./popup-add-approval-step.component.scss'],
})
export class PopupAddApprovalStepComponent implements OnInit, AfterViewInit {
  @Output() close = new EventEmitter();
  @Input() transId = '';
  @Input() stepNo = 1;
  @Input() vllShare = 'ES014';
  dataEdit: any;

  isAfterRender = false;
  isAdd = true;
  formModel: FormModel;
  dialogApprovalStep: FormGroup;

  lstApproveMode: any;
  currentApproveMode: string;

  confirmControl: string = '0';
  allowEditAreas: boolean;
  positionDefault: string = '';

  dialog: DialogRef;
  lstStep;
  isSaved = false;
  header1 = 'Thiết lập quy trình duyệt';
  subHeaderText = 'Qui trình duyệt';
  defaultSignType = '';
  eSign: boolean = false;

  data: any = {};
  lstApprover: any = [];

  headerText1;

  title = '';
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'tabInfo' },
    { icon: 'icon-rule', text: 'Điều kiện', name: 'tabQuery' },
    {
      icon: 'icon-email',
      text: 'Email/thông báo',
      name: 'tabEmail',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabAnother',
    },
  ];

  setTitle(e: any) {
    console.log(e);
  }

  buttonClick(e: any) {
    console.log(e);
  }

  constructor(
    private esService: CodxEsService,
    private cr: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.transId = data?.data.transID;
    this.stepNo = data?.data.stepNo;
    this.lstStep = data?.data.lstStep;
    this.isAdd = data?.data.isAdd;
    this.dataEdit = data?.data.dataEdit;
    this.defaultSignType = data?.data?.signatureType;

    this.allowEditAreas = data?.data?.allowEditAreas;
    this.confirmControl = data?.data?.confirmControl;

    this.eSign = data?.data?.eSign ?? false;
    this.data = JSON.parse(JSON.stringify(data?.data.dataEdit));
    this.vllShare = data?.data.vllShare ?? 'ES014';
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      this.dialog.closed.subscribe((res) => {
        if (!this.isSaved) {
        }
      });
    }
  }

  ngOnInit(): void {
    this.esService.getFormModel('EST04').then((res) => {
      if (res) {
        this.formModel = res;
        this.dialog.formModel = this.formModel;
      }
      this.initForm();
    });
  }

  initForm() {
    this.cache
      .gridViewSetup('ApprovalSteps_Approvers', 'grvApprovalSteps_Approvers')
      .subscribe((grv) => {
        if (grv) {
          this.positionDefault = grv['Position']['headerText'];
        }
      });
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogApprovalStep = item;

        if (this.isAdd) {
          this.esService
            .getDataDefault('EST04', this.formModel.entityName, 'recID')
            .subscribe((res: any) => {
              if (res) {
                this.data = res.data;
                this.data.stepNo = this.stepNo;
                this.data.transID = this.transId;
                this.data.signatureType = this.defaultSignType;
                this.dialogApprovalStep.patchValue(this.data);

                this.esService.getNewDefaultEmail().subscribe((emailTmp) => {
                  this.data.emailTemplates = emailTmp;
                  this.dialogApprovalStep.patchValue({
                    emailTemplates: emailTmp,
                  });
                });
                this.currentApproveMode = '1';
                this.formModel.currentData = this.data;
                this.isAfterRender = true;
              }
            });
        } else {
          this.dialogApprovalStep.patchValue(this.dataEdit);
          this.lstApprover = JSON.parse(
            JSON.stringify(this.dataEdit?.approvers)
          );
          if (this.lstApprover?.length > 0) {
            this.lstApprover.forEach((element) => {
              this.confirmControl = element?.confirmControl ?? '0';
              this.allowEditAreas = element?.allowEditAreas ?? false;

              if (element.roleType == 'PA') element.write = true;
              else element.write = false;

              element.delete = true;
              element.share = false;
              element.assign = false;
            });
          }
          this.currentApproveMode = this.dataEdit?.approveMode;
          this.formModel.currentData = this.data;
          this.isAfterRender = true;

          if (!this.dialogApprovalStep.value.emailTemplates) {
            this.esService.getNewDefaultEmail().subscribe((res) => {
              this.dialogApprovalStep.patchValue({ emailTemplates: res });
            });
          }
        }
      });
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event.field == 'allowEditAreas') {
        this.allowEditAreas = event.data;
      } else if (event.field == 'stepType') {
        this.data[event?.field] = event.data;
        this.dialogApprovalStep.patchValue({ [event?.field]: event.data });
        if (this.data.stepName == '' || this.data.stepName == null) {
          let vllName = this.eSign == true ? 'ES002' : 'ES026';
          this.cache.valueList(vllName).subscribe((res) => {
            if (res?.datas) {
              let i = res.datas.findIndex((p) => p.value == event.data);
              this.data.stepName = res.datas[i]?.text;
              this.dialogApprovalStep.patchValue({
                stepName: this.data.stepName,
              });
              this.cr.detectChanges();
            }
          });
        }
      } else {
        this.data[event?.field] = event.data;
        this.dialogApprovalStep.patchValue({ [event?.field]: event.data });
      }

      this.cr.detectChanges();
    }
  }

  changeConfirm(event) {
    if (event?.field && event?.field == 'confirmControl' && event?.component) {
      this.confirmControl = event?.data ? '1' : '0';
      this.cr.detectChanges();
    }
  }

  MFClick(event, data, index) {
    //delete
    if (event?.functionID == 'SYS02') {
      this.notifySvr.alertCode('SYS030').subscribe((x) => {
        if (x.event.status == 'Y') {
          let i = this.lstApprover.indexOf(data);

          if (i != -1) {
            this.lstApprover.splice(i, 1);
          }
        }
      });
    }
    //edit PA
    else if (event?.functionID == 'SYS03') {
      let popupApprover = this.callfc.openForm(
        PopupAddApproverComponent,
        '',
        550,
        screen.height,
        '',
        {
          approverData: data,
          lstApprover: this.lstApprover,
          isAddNew: false,
        }
      );

      popupApprover.closed.subscribe((res) => {
        if (res.event) {
          this.lstApprover[index] = res.event;
        }
      });
    }
  }

  onSaveForm() {
    this.isSaved = true;
    if (this.dialogApprovalStep.invalid == true) {
      this.esService.notifyInvalid(this.dialogApprovalStep, this.formModel);
      return;
    }
    if (this.lstApprover.length == 0) {
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            this.notifySvr.notifyCode(
              'SYS009',
              0,
              '"' + res['Approvers'].headerText + '"'
            );
          }
        });
      return;
    }
    this.lstApprover.forEach((appr) => {
      appr.confirmControl = this.confirmControl;
      appr.allowEditAreas = this.allowEditAreas;
    });
    console.log(this.lstApprover);

    this.dialogApprovalStep.patchValue({
      approveMode: this.currentApproveMode,
      approvers: this.lstApprover,
    });
    this.data.approveMode = this.currentApproveMode;
    this.data.approvers = this.lstApprover;
    if (this.isAdd) {
      this.lstStep.push(this.data);
      this.dialog && this.dialog.close(this.data);
    } else {
      let i = this.lstStep.indexOf(this.dataEdit);
      if (i != -1) {
        this.lstStep[i] = this.data;
        this.dialog && this.dialog.close(this.data);
      }
    }
  }

  checkedOnlineChange(event) {}

  openSetupEmail(email) {
    if (email?.isEmail == '1') {
      let data = {
        formGroup: this.dialogApprovalStep,
        templateID: email?.templateID,
        showIsTemplate: true,
        showIsPublish: true,
        showSendLater: true,
        showFrom: true,
      };

      this.callfc.openForm(
        PopupAddEmailTemplateComponent,
        '',
        800,
        screen.height,
        '',
        data
      );
    }
  }

  valueModeChange(event, item) {
    if (event?.component) {
      this.currentApproveMode = item?.value;
    }
  }

  valueEmailChange(event, eTemplate) {
    let index = this.data?.emailTemplates.indexOf(eTemplate);
    if (index >= 0) {
      this.data.emailTemplates[index][event.field] = event.data ? '1' : '0';
      this.dialogApprovalStep.patchValue({
        emailTemplates: this.dialogApprovalStep.value.emailTemplates,
      });
    }
  }

  testdata(share) {
    this.callfc.openForm(share, '', 420, window.innerHeight);
  }

  applyShare(event) {
    if (event) {
      event.forEach((element) => {
        if (element.objectType.length == 1) {
          let lstID = element?.id.split(';');
          let lstUserName = element?.text.split(';');
          let dataSelected = element?.dataSelected;

          for (let i = 0; i < lstID?.length; i++) {
            let index = this.lstApprover.findIndex(
              (p) => p.approver == lstID[i]
            );
            if (lstID[i].toString() != '' && index == -1) {
              let appr = new Approvers();
              appr.roleType = element.objectType;
              appr.name = lstUserName[i];
              appr.approver = lstID[i];
              this.esService.getDetailApprover(appr).subscribe((oRes) => {
                if (oRes?.length > 0) {
                  appr.position = oRes[0].position;
                  appr.phone = oRes[0].phone;
                  appr.email = oRes[0].email;
                  this.lstApprover.push(appr);
                }
              });
            }
          }
        } else {
          let i = this.lstApprover.findIndex(
            (p) => p.approver == element?.objectType
          );
          if (element?.objectType == 'PA') {
            //loại đối tác mở popup
            let appr = new Approvers();
            appr.write = true;
            appr.roleType = element.objectType;
            //appr.approver = element.objectType;
            appr.icon = element?.icon;

            let popupApprover = this.callfc.openForm(
              PopupAddApproverComponent,
              '',
              550,
              screen.height,
              '',
              {
                approverData: appr,
                lstApprover: this.lstApprover,
                isAddNew: true,
              }
            );

            popupApprover.closed.subscribe((res) => {
              if (res.event) {
                this.lstApprover.push(res.event);
              }
            });
          } else if (i == -1) {
            let appr = new Approvers();
            appr.roleType = element?.objectType;
            appr.name = element?.objectName;
            appr.approver = element?.objectType;
            appr.icon = element?.icon;
            this.lstApprover.push(appr);
          }
        }
      });

      console.log(this.lstApprover);
      console.log(this.dataEdit);
      console.log(this.lstStep);
    }
  }
}

export class Files {
  recID: string;
  fileID: string;
  fileName: string;
  eSign: boolean = true;
  comment: string;
}
