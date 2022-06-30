import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { debug } from 'console';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'popup-add-approval-step',
  templateUrl: './popup-add-approval-step.component.html',
  styleUrls: ['./popup-add-approval-step.component.scss'],
})
export class PopupAddApprovalStepComponent implements OnInit {
  @Output() close = new EventEmitter();
  @Input() transId = '';
  @Input() stepNo = 1;
  tmplstDevice;
  lstDeviceRoom;
  isAfterRender = false;
  isAdd = true;

  formModel: FormModel;
  dialogApprovalStep: FormGroup;
  cbxName;
  link;
  showPlan = true;
  showPlan1 = true;
  time: any;

  dialog: DialogRef;
  tmpData: any;
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
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.transId = data?.data.transID;
    this.stepNo = data?.data.stepNo;
    console.log(this.transId, this.stepNo);
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
        this.isAdd = true;
        console.log(this.dialogApprovalStep.value);
        this.dialogApprovalStep.patchValue({
          leadTime: 0,
          representative: false,
          sequential: false,
          transID: this.transId,
          stepNo: this.stepNo,
        });
      });
  }

  lstApprover = [];
  onSaveForm() {
    console.log(this.dialogApprovalStep.value);
    if (this.dialogApprovalStep.invalid == true) {
      this.notify.notify('invalid');
    }
    let approver1 = new Approvers();
    this.lstApprover.push(approver1);
    approver1.position = 'BA';
    this.lstApprover.push(approver1);

    this.dialogApprovalStep.patchValue({ approvers: this.lstApprover });
    this.api
      .callSv('ES', 'ES', 'CategoriesBusiness', 'AddEditStepAsync', [
        this.dialogApprovalStep.value,
        this.isAdd,
      ])
      .subscribe((res) => {
        console.log(res);
        if (res && res.msgBodyData.length > 0) {
          //this.dialog.hide(res.msgBodyData);
          this.close.emit(res.msgBodyData[0]);
        }
      });
  }

  popup(evt: any) {}

  checkedOnlineChange(event) {}

  valueChange(event) {
    if (event?.field) {
      if (event.data === Object(event.data)) {
        this.dialogApprovalStep.patchValue({
          [event['field']]: event.data.value ?? event.data.checked,
        });
        if (
          event.field == 'representative' &&
          this.dialogApprovalStep.value.representative == true
        ) {
          this.dialogApprovalStep.patchValue({
            sequential: false,
          });
        }
        if (
          event.field == 'sequential' &&
          this.dialogApprovalStep.value.sequential == true
        ) {
          this.dialogApprovalStep.patchValue({
            representative: false,
          });
        }
      } else {
        this.dialogApprovalStep.patchValue({ [event['field']]: event.data });
        if (
          event.field == 'representative' &&
          this.dialogApprovalStep.value.representative == true
        ) {
          this.dialogApprovalStep.patchValue({
            sequential: false,
          });
        }
        if (
          event.field == 'sequential' &&
          this.dialogApprovalStep.value.sequential == true
        ) {
          this.dialogApprovalStep.patchValue({
            representative: false,
          });
        }
      }
    }
    this.cr.detectChanges();
  }

  valueStartTimeChange(event) {}
  valueEndTimeChange(event) {}

  openPopupLink() {}

  fileAdded(event) {}

  changeLink(event) {}

  checkedChange(event, item) {}

  openPopupDevice() {}

  valueDateChange(event) {}

  closeForm() {
    this.close.emit();
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }
  extendShowPlan1() {
    this.showPlan1 = !this.showPlan1;
  }
}
export class Approvers {
  recID: string;
  roleType: String = '11';
  approver: String = 'ADMIN';
  position: String = 'KT';
  leadTime: any;
  comment: String;
}

export class Files {
  recID: string;
  fileID: string;
  fileName: string;
  eSign: boolean = true;
  comment: string;
}
