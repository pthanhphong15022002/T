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
  @Input() vllShare = 'ES014';
  dataEdit: any;

  tmplstDevice;
  lstDeviceRoom;
  isAfterRender = false;
  isAdd = true;

  formModel: FormModel;
  dialogApprovalStep: FormGroup;
  vllEmail = [];

  lstApproveMode: any;
  cbxName;
  time: any;
  currentMode: string;

  dialog: DialogRef;
  tmpData: any;
  lstStep;
  isSaved = false;
  header1 = 'Thiết lập quy trình duyệt';
  subHeaderText = 'Qui trình duyệt';

  showPlan = true;

  lstApprover: any = [];

  headerText1;
  type = null;

  title = '';
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'tabInfo' },
    { icon: 'icon-rule', text: 'Điều kiện', name: 'tabInfo2' },
    {
      icon: 'icon-email',
      text: 'Email/thông báo',
      name: 'tabInfo3',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabInfo4',
    },
  ];

  setTitle(e: any) {
    // this.title = 'Thêm ' + e;
    // this.cr.detectChanges();
    console.log(e);
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  buttonClick(e: any) {
    console.log(e);
  }

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
    this.type = data?.data.type ?? '1';
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
            console.log('cbxName', this.cbxName);

            if (this.cbxName) {
              this.cache.valueList('ES016').subscribe((vllMode) => {
                if (vllMode) {
                  this.lstApproveMode = vllMode.datas;
                }
              });
            }
          }
        });

      this.initForm();
    });
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogApprovalStep = item;
        console.log(this.dialogApprovalStep.value);
        this.dialogApprovalStep.addControl('delete', new FormControl(true));
        this.dialogApprovalStep.addControl('share', new FormControl(true));
        this.dialogApprovalStep.addControl('write', new FormControl(true));
        this.dialogApprovalStep.addControl('assign', new FormControl(true));

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
          this.currentMode = '1';

          this.esService.getNewDefaultEmail().subscribe((res) => {
            this.dialogApprovalStep.patchValue({ emailTemplates: res });
          });
        } else {
          this.dialogApprovalStep.patchValue(this.dataEdit);
          this.lstApprover = JSON.parse(
            JSON.stringify(this.dialogApprovalStep.value.approvers)
          );
          this.currentMode = this.dataEdit?.approveMode;
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
    if (event?.functionID == 'SYS02') {
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
            let i = this.lstApprover.indexOf(data);

            if (i != -1) {
              this.lstApprover.splice(i, 1);
            }
          }
        });
    }
  }

  onSaveForm() {
    this.isSaved = true;
    if (this.dialogApprovalStep.invalid == true) {
      this.notifySvr.notifyCode('E0016');
      return;
    }
    if (this.lstApprover.length == 0) {
      this.notifySvr.notifyCode('E0016');
      return;
    }
    this.dialogApprovalStep.patchValue({
      approveMode: this.currentMode,
      approvers: this.lstApprover,
    });
    if (this.isAdd) {
      this.lstStep.push(this.dialogApprovalStep.value);
      this.dialog && this.dialog.close(this.dialogApprovalStep.value);
    } else {
      let i = this.lstStep.indexOf(this.dataEdit);
      if (i != -1) {
        this.lstStep[i] = this.dialogApprovalStep.value;
        this.dialog && this.dialog.close(this.dialogApprovalStep.value);
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
    if (event?.field && event.component) {
      if (event.data === Object(event.data)) {
        this.dialogApprovalStep.patchValue({
          [event['field']]: event.data,
        });
      } else {
        this.dialogApprovalStep.patchValue({ [event['field']]: event.data });
      }
    }

    this.cr.detectChanges();
  }

  valueModeChange(event, item) {
    if (event?.component) {
      this.currentMode = item?.value;
    }
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
              appr.approverName = lstUserName[i];
              appr.approver = lstID[i];
              appr.position = dataSelected[i]?.PositionID;
              appr.positionName = dataSelected[i]?.PositionName;
              this.lstApprover.push(appr);
            }
          }
        } else {
          let i = this.lstApprover.findIndex(
            (p) => p.approver == element?.objectType
          );
          if (i == -1) {
            let appr = new Approvers();
            appr.roleType = element?.objectType;
            appr.approverName = element?.objectName;
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
export class Approvers {
  recID: string;
  roleType: string;
  approver: string;
  approverName: string;
  position: string;
  positionName: string;
  leadTime: any;
  comment: string;
  icon: string = null;
  createdOn: any;
  delete: boolean = true;
}

export class Files {
  recID: string;
  fileID: string;
  fileName: string;
  eSign: boolean = true;
  comment: string;
}
