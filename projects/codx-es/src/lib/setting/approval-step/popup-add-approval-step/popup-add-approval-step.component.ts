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
import { DateTime } from '@syncfusion/ej2-angular-charts';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { debug } from 'console';
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
  cbxName;
  time: any;

  dialog: DialogRef;
  tmpData: any;
  lstStep;
  isSaved = false;
  header1 = 'Thiết lập qui trình duyệt';
  subHeaderText = 'Qui trình duyệt';

  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Điều kiện', iconCss: 'icon-person_add' },
    { text: 'Email/thông báo', iconCss: 'icon-email' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  headerText1;

  constructor(
    private esService: CodxEsService,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private api: ApiHttpService,
    private cfService: CallFuncService,
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
        } else {
          this.dialogApprovalStep.patchValue(this.dataEdit);
          this.dialogApprovalStep.addControl(
            'id',
            new FormControl(this.dataEdit.id)
          );
        }
      });
  }

  lstApprover = [];

  onSaveForm() {
    this.isSaved = true;
    console.log(this.dialogApprovalStep.value);
    if (this.dialogApprovalStep.invalid == true) {
      this.notify.notify('invalid');
    }
    if (this.isAdd) {
      //#region default Approver cần chỉnh sửa
      let approver1 = new Approvers();
      approver1.approverName = 'Lê Phạm Hoài Thương';
      approver1.positionName = 'Phân tích thiết kế';
      approver1.createdOn = new Date();

      this.lstApprover.push(approver1);
      approver1.position = 'BA';
      this.lstApprover.push(approver1);

      this.dialogApprovalStep.patchValue({ approvers: this.lstApprover });
      //#endregion

      // this.api
      //   .callSv('ES', 'ES', 'CategoriesBusiness', 'AddEditStepAsync', [
      //     this.dialogApprovalStep.value,
      //     this.isAdd,
      //   ])
      //   .subscribe((res) => {
      //     console.log(res);
      //     if (res && res.msgBodyData.length > 0) {
      //       this.lstStep.push(res.msgBodyData[0]);
      //       this.dialog && this.dialog.close();
      //       this.cr.detectChanges();
      //     }
      //   });
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

  openSetupEmail() {
    let data = {
      dialog: this.dialog,
      emailType: 1,
    };
    this.cfService.openForm(
      PopupAddEmailTemplateComponent,
      '',
      750,
      1500,
      '',
      data
    );
  }

  valueChange(event) {
    if (event?.field) {
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
    console.log('sequential', this.dialogApprovalStep.value.sequential);
    console.log('representative', this.dialogApprovalStep.value.representative);

    this.cr.detectChanges();
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
