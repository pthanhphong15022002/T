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
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ListViewModule } from '@syncfusion/ej2-angular-lists';
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
import { CodxEsService } from '../../../codx-es.service';
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
  dataEdit: any;

  tmplstDevice;
  lstDeviceRoom;
  isAfterRender = false;
  isAdd = true;

  formModel: FormModel;
  dialogApprovalStep: FormGroup;
  vllEmail = [];
  vllShare = 'ES014';
  lstApproveMode: any;
  cbxName;
  time: any;

  dialog: DialogRef;
  tmpData: any;
  lstStep;
  isSaved = false;
  header1 = 'Thiết lập qui trình duyệt';
  subHeaderText = 'Qui trình duyệt';

  headerText1;

  constructor(
    private esService: CodxEsService,
    private cr: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private api: ApiHttpService,
    private cfService: CallFuncService,
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

      this.cbxName = {};
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((gv) => {
          if (gv) {
            for (const key in gv) {
              if (Object.prototype.hasOwnProperty.call(gv, key)) {
                const element = gv[key];
                if (element.referedValue != null) {
                  this.cbxName[key] = element.referedValue;
                }
              }
            }
            console.log(this.cbxName);

            if (this.cbxName) {
              this.cache.valueList('ES016').subscribe((vllMode) => {
                if (vllMode) {
                  this.lstApproveMode = vllMode.datas;
                  console.log('aaaaaaaaaaaaaaaa', this.lstApproveMode);
                }
              });
            }
          }
        });

      console.log('getComboboxName1', this.cbxName['ApproveMode']);

      // this.esService
      //   .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      //   .then((res) => {
      //     this.cbxName = res;
      //     console.log('cbxName', this.cbxName);

      //     console.log('mode', this.cbxName);

      //     this.cache.valueList('ES012').subscribe((res) => {});
      //   });
      this.initForm();
    });
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogApprovalStep = item;
        this.isAfterRender = true;
        if (this.isAdd) {
          this.dialogApprovalStep.patchValue({
            leadTime: 0,
            approveMode: '1',
            approveControl: '0',
            rejectControl: '1',
            rsedoControl: '1',
            redoStep: 0,
            recallControl: '1',
            cancelControl: '1',
            transID: this.transId,
            stepNo: this.stepNo,
          });

          this.esService.getNewDefaultEmail().subscribe((res) => {
            this.dialogApprovalStep.patchValue({ emailTemplates: res });
          });
        } else {
          this.dialogApprovalStep.patchValue(this.dataEdit);
          this.dialogApprovalStep.addControl(
            'id',
            new FormControl(this.dataEdit.id)
          );
          if (!this.dialogApprovalStep.value.emailTemplates) {
            this.esService.getNewDefaultEmail().subscribe((res) => {
              this.dialogApprovalStep.patchValue({ emailTemplates: res });
            });
          }
        }
      });
  }

  MFClick(event, data) {
    let approvalStep = this.dialogApprovalStep.value.approvers;
    if (event?.functionID == 'delete') {
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
            let i = approvalStep.indexOf(data);

            if (i != -1) {
              approvalStep.splice(i, 1);
              this.dialogApprovalStep.patchValue({ approvers: approvalStep });
            }
          }
        });
    }
  }

  lstApprover = [];

  onSaveForm() {
    this.isSaved = true;
    if (this.dialogApprovalStep.invalid == true) {
      this.notifySvr.notify('invalid');
    }
    if (this.isAdd) {
      this.lstStep.push(this.dialogApprovalStep.value);
      this.dialog && this.dialog.close();
    } else {
      let i = this.lstStep.indexOf(this.dataEdit);
      if (i != -1) {
        this.lstStep[i] = this.dialogApprovalStep.value;
        this.dialog && this.dialog.close();
      }
    }
  }

  checkedOnlineChange(event) {}

  openSetupEmail(email) {
    if (email?.isEmail == '1') {
      let data = {
        dialog: this.dialog,
        formGroup: this.dialogApprovalStep,
        dialogEmail: email,
        showIsTemplate: true,
        showIsPublish: true,
        showSendLater: true,
      };

      this.cfService.openForm(
        PopupAddEmailTemplateComponent,
        '',
        800,
        screen.height,
        '',
        data
      );
    }
  }

  valueChange(event) {
    if (event?.field) {
      if (event.field == 'popup') {
        if (event.data?.length > 0) {
          event.data.forEach((element) => {
            let lst = this.dialogApprovalStep.value.approvers ?? [];

            if (element.objectType == 'U') {
              let appr = new Approvers();
              appr.approverName = element.text;
              appr.approver = element.id;
              lst.push(appr);
            }

            this.dialogApprovalStep.patchValue({ approvers: lst });
          });
        }
      }
      if (event.data === Object(event.data)) {
        this.dialogApprovalStep.patchValue({
          [event['field']]: event.data,
        });
      } else {
        this.dialogApprovalStep.patchValue({ [event['field']]: event.data });
        // if (
        //   event.field == 'representative' &&
        //   this.dialogApprovalStep.value.representative == true &&
        //   this.dialogApprovalStep.value.sequential == true
        // ) {
        //   this.dialogApprovalStep.patchValue({
        //     sequential: false,
        //   });
        // }
        // if (
        //   event.field == 'sequential' &&
        //   this.dialogApprovalStep.value.sequential == true &&
        //   this.dialogApprovalStep.value.representative == true
        // ) {
        //   this.dialogApprovalStep.patchValue({
        //     representative: false,
        //   });
        // }
      }
    }

    this.cr.detectChanges();
  }

  parseInt(data) {
    let leadtime = parseInt(data);
    if (leadtime) {
      return leadtime;
    } else {
      return 0;
    }
  }

  valueModeChange(item) {
    this.dialogApprovalStep.patchValue({ approveMode: item.value });
  }

  valueEmailChange(event, eTemplate) {
    let index = this.dialogApprovalStep.value.emailTemplates.indexOf(eTemplate);
    if (index >= 0) {
      this.dialogApprovalStep.value.emailTemplates[index][event.field] =
        event.data ? '1' : '0';
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
      let lst = this.dialogApprovalStep.value.approvers ?? [];
      event.forEach((element) => {
        if (element.objectType == 'U') {
          let lstID = element?.id.split(';');
          let lstUserName = element?.text.split(';');

          for (let i = 0; i < lstID?.length; i++) {
            let index = lst.findIndex((p) => p.approver == lstID[i]);
            if (lstID[i].toString() != '' && index == -1) {
              let appr = new Approvers();
              appr.roleType = element.objectType;
              appr.approverName = lstUserName[i];
              appr.approver = lstID[i];
              lst.push(appr);
            }
          }
        } else {
          let i = lst.findIndex((p) => p.approver == element?.objectType);
          if (i == -1) {
            let appr = new Approvers();
            appr.roleType = element?.objectType;
            appr.approverName = element?.objectName;
            appr.approver = element?.objectType;
            lst.push(appr);
          }
        }

        this.dialogApprovalStep.patchValue({ approvers: lst });
      });
    }
  }
}
export class Approvers {
  recID: string;
  roleType: String = '11';
  approver: String = 'ADMIN';
  approverName: String;
  position: String = 'KT';
  positionName: String;
  leadTime: any;
  comment: String;

  createdOn: any;
}

export class Files {
  recID: string;
  fileID: string;
  fileName: string;
  eSign: boolean = true;
  comment: string;
}
