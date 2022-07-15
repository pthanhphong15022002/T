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
        console.log(this.formModel);
        this.dialog.formModel = this.formModel;
      }

      this.esService
        .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
        .then((res) => {
          this.cbxName = res;
          console.log('cbx', this.cbxName);
          this.cache.valueList('ES012').subscribe((res) => {
            console.log('cbx nAME', this.cbxName);
            console.log('res', res);
          });
        });
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
            representative: true,
            sequential: false,
            transID: this.transId,
            stepNo: this.stepNo,
          });

          this.esService.getNewDefaultEmail().subscribe((res) => {
            this.dialogApprovalStep.patchValue({ emailTemplates: res });
            console.log(this.dialogApprovalStep.value);
          });
        } else {
          this.dialogApprovalStep.patchValue(this.dataEdit);
          this.dialogApprovalStep.addControl(
            'id',
            new FormControl(this.dataEdit.id)
          );
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
            console.log(i);

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
    console.log(this.dialogApprovalStep.value);
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

  popup(evt: any) {}

  checkedOnlineChange(event) {}

  openSetupEmail(email) {
    if (email?.IsEmail == '1' || email?.isEmail == '1') {
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
        if (
          event.field == 'representative' &&
          this.dialogApprovalStep.value.representative == true &&
          this.dialogApprovalStep.value.sequential == true
        ) {
          this.dialogApprovalStep.patchValue({
            sequential: false,
          });
        }
        if (
          event.field == 'sequential' &&
          this.dialogApprovalStep.value.sequential == true &&
          this.dialogApprovalStep.value.representative == true
        ) {
          this.dialogApprovalStep.patchValue({
            representative: false,
          });
        }
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

  // valueEmailChange(event, eTemplate) {
  //   debugger;
  // }

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
    if (event[0].id) {
      switch (event[0].objectType) {
        case 'U':
          let lstID = event[0].id.split(';');
          let lstUserName = event[0].text.split(';');
          let lst = this.dialogApprovalStep.value.approvers ?? [];
          for (let i = 0; i < lstID?.length; i++) {
            let appr = new Approvers();
            appr.approverName = lstUserName[i];
            appr.approver = lstID[i];
            lst.push(appr);
          }
          this.dialogApprovalStep.patchValue({ approvers: lst });
          break;
      }
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
