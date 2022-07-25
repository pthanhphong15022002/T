import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FileService } from '@shared/services/file.service';
import {
  ApiHttpService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEsService } from '../../codx-es.service';
import { ApprovalStepComponent } from '../../setting/approval-step/approval-step.component';

@Component({
  selector: 'popup-add-sign-file',
  templateUrl: './popup-add-sign-file.component.html',
  styleUrls: ['./popup-add-sign-file.component.scss'],
})
export class PopupAddSignFileComponent implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('content') content;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;

  headerText = 'Thêm mới tài liệu';

  currentTab = 0;
  formModel: FormModel;
  isAfterRender = false;
  objectIDFile: String;
  cbxName;
  dialogSignFile: FormGroup;
  lstDataFile = [];
  isAdd: boolean = true;
  processID: String = '';
  transID: String = '';

  dialog: DialogRef;
  data;

  showPlan: boolean = true;
  constructor(
    private esService: CodxEsService,
    private codxService: CodxService,
    private cr: ChangeDetectorRef,
    private callfuncService: CallFuncService,
    private api: ApiHttpService,
    private dmSV: CodxDMService,
    private notify: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModel = data?.data.formModel;
    console.log(this.formModel);

    this.data = data;
  }

  ngOnInit(): void {
    this.initForm();

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        console.log('cbName', res);
        if (res) this.cbxName = res;
      });
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogSignFile = res;

          this.isAfterRender = true;
          this.isAdd = true;
          this.dialogSignFile.patchValue({
            approveControl: '1',
            approveStatus: '1',
          });

          this.codxService
            .getAutoNumber(
              this.formModel.funcID,
              this.formModel.entityName,
              'CategoryID'
            )
            .subscribe((dt: any) => {
              this.objectIDFile = dt;
              this.dialogSignFile.patchValue({
                refNo: dt,
              });
            });
        }
      });
  }

  popup(data, current) {
    this.attachment.openPopup();
  }

  changeTab(tabNo) {
    this.currentTab = tabNo;
    this.cr.detectChanges();
  }

  closeDialogTmp(dialogTmp: DialogRef) {
    dialogTmp && dialogTmp.close();
  }

  fileAdded(event) {
    this.lstDataFile = event?.data;
    let files = [];
    this.lstDataFile.forEach((element) => {
      // let file = new Files();
      // file.fileID = element?.objectId;
      // file.fileName = element?.fileName;
      // file.comment = element?.comment;
      // files.push(file);
    });

    this.dialogSignFile.patchValue({ files: files });
  }

  getfileCount(event) {}

  onSaveForm() {}

  onSaveSignFile() {
    if (this.dialogSignFile.invalid == true) {
      return;
    }

    this.esService
      .addNewSignFile(this.dialogSignFile.value)
      .subscribe((res) => {
        if (res != null) {
          console.log(res);
        }
      });
    // this.api
    //   .callSv('ES', 'ES', 'SignFilesBusiness', 'AddEditAsync', [
    //     this.dialogSignFile.value,
    //     this.isAdd,
    //     this.transID,
    //   ])
    //   .subscribe((res) => {
    // if (res && res.msgBodyData[0]) {
    //   if (
    //     this.lstDataFile != undefined &&
    //     this.lstDataFile != null &&
    //     this.lstDataFile.length > 0
    //   ) {
    //     this.lstDataFile.forEach((elm) => {
    //       this.fileService
    //         .updateFileByObjectIDType(
    //           elm.objectId,
    //           res?.msgBodyData[0].recID,
    //           'ES_SignFiles'
    //         )
    //         .subscribe((item) => {
    //           //console.log(item);
    //         });
    //     });
    //   }
    // }
    // });
  }

  onSaveProcessID(dialogTmp: DialogRef) {
    if (this.processID != '') {
      this.dialogSignFile.patchValue({
        processID: this.processID,
        approveControl: '2',
      });

      dialogTmp && dialogTmp.close();
    }
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogSignFile.patchValue({ [event['field']]: event.data.value });
      else this.dialogSignFile.patchValue({ [event['field']]: event.data });

      if (event.field == 'categoryID' && this.dialogSignFile.value != null) {
        this.dialogSignFile.patchValue({ approveControl: '1' });
      }
    }
  }

  getJSONString(data) {
    return JSON.stringify(data);
  }

  openFilePopup() {
    this.attachment.openPopup();
  }

  continue(currentTab) {
    switch (currentTab) {
      case 0:
        if (this.dmSV.fileUploadList.length > 0) {
          this.currentTab++;
        } else {
          this.notify.notify('Yêu cầu thêm file');
        }
        break;
      case 1:
        if (this.dialogSignFile.invalid) {
          break;
        }
        this.transID = '629de1080d7d066f90f975a3';
        this.onSaveSignFile();
        this.currentTab++;
        break;
      case 2:
        break;
      case 3:
        break;
    }
    // if (currentTab == 1) {
    //   this.transID = '629de1080d7d066f90f975a3';
    //   // this.api
    //   //   .callSv('ES', 'ES', 'SignFilesBusiness', 'AddEditAsync', [
    //   //     this.dialogSignFile.value,
    //   //     this.isAdd,
    //   //     this.transID,
    //   //   ])
    //   //   .subscribe((res) => {
    //   //     if (res && res.msgBodyData != null) {
    //   //       this.dialogSignFile.patchValue(res.msgBodyData[0]);
    //   //       this.transID = res.msgBodyData[0].recID;
    //   //       this.currentTab = currentTab + 1;
    //   //       this.viewApprovalStep.setTransID(this.transID);
    //   //       this.cr.detectChanges();
    //   //     }
    //   //   });
    //   this.currentTab = currentTab + 1;
    // } else {
    //   this.currentTab = currentTab + 1;
    // }
    // this.cr.detectChanges();
  }

  openFormAdd(event) {
    this.callfuncService.openForm(this.content, 'Qui trình mẫu', 700, 1000);
  }

  openPopup(content) {
    this.callfuncService.openForm(content, 'Qui trình mẫu', 400, 250);
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  deleteSignFile() {
    if (this.dialogSignFile.value.recID != null) {
      this.api
        .execSv(
          'ES',
          'ERM.Business.ES',
          'SignFilesBusiness',
          'DeleteSignFileAsync',
          [this.dialogSignFile.value.recID]
        )
        .subscribe((res) => {
          if (res) {
          }
        });
    }
  }
}
