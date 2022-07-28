import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { File } from '../../codx-es.model';
import { CodxEsService } from '../../codx-es.service';
import { ApprovalStepComponent } from '../../setting/approval-step/approval-step.component';

@Component({
  selector: 'popup-add-sign-file',
  templateUrl: './popup-add-sign-file.component.html',
  styleUrls: ['./popup-add-sign-file.component.scss'],
})
export class PopupAddSignFileComponent implements OnInit {
  @ViewChild('view') viewBase: ViewsComponent;
  @ViewChild('status') status: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('content') content;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;

  headerText = 'Thêm mới tài liệu';

  currentTab = 0;
  processTab = 0;
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
  autoNo;

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
              this.autoNo = dt;
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
      let file = new File();
      file.fileID = element.data.recID;
      file.fileName = element.data.fileName;
      file.createdOn = element.data.createdOn;
      file.createdBy = element.data.createdBy;
      files.push(file);
    });
    this.dialogSignFile.patchValue({ files: files });
    this.esService.editSignFile(this.dialogSignFile.value).subscribe((res) => {
      console.log('cập nhật file', res);
    });
  }

  getfileCount(event) { }

  onSaveForm() { }

  onSaveSignFile() {
    if (this.dialogSignFile.invalid == true) {
      return;
    }

    this.esService
      .addNewSignFile(this.dialogSignFile.value)
      .subscribe((res) => {
        if (res != null) {
          console.log(res);

          this.dialogSignFile.patchValue(res);
          this.dialogSignFile.addControl('recID', new FormControl(res.recID));
          this.dialogSignFile.addControl('id', new FormControl(res.id));
          if (this.dmSV.fileUploadList.length > 0) {
            this.attachment.objectId = res.recID;
            console.log(this.attachment.data);

            console.log(this.dmSV.fileUploadList);
            this.attachment.saveFiles();
          }
          if (this.currentTab == 1) {
            this.currentTab++;
          }
        }
      });
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

  close() {
    this.dialog && this.dialog.close();
  }

  valueChange(event) {
    if (event?.field && event?.component) {
      if (event?.data === Object(event?.data))
        this.dialogSignFile.patchValue({ [event['field']]: event.data[0] });
      else this.dialogSignFile.patchValue({ [event['field']]: event.data });

      if (event.field == 'categoryID' && this.dialogSignFile.value != null) {
        this.dialogSignFile.patchValue({ approveControl: '1' });
        this.esService
          .getAutoNumberByCategory(this.dialogSignFile.value.categoryID)
          .subscribe((res) => {
            if (res != null) {
              this.dialogSignFile.patchValue({ refNo: res });
            } else {
              this.dialogSignFile.patchValue({ refNo: this.autoNo });
            }
          });
      }
    }
  }

  openFilePopup() {
    this.attachment.openPopup();
  }

  clickTab(tabNo) {
    debugger;
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      let className = (nodes[tabNo] as HTMLElement).className.toString();
      switch (className) {
        case 'stepper-item':
          (nodes[tabNo] as HTMLElement).classList.add('active');

          break;
        case 'stepper-item approve-disabled':
          (nodes[tabNo] as HTMLElement).classList.remove('approve-disabled');
          (nodes[tabNo] as HTMLElement).classList.add('approve');
          break;
      }

      let oldClassName = (
        nodes[this.currentTab] as HTMLElement
      ).className.toString();
      switch (oldClassName) {
        case 'stepper-item approve':
          (nodes[this.currentTab] as HTMLElement).classList.remove('approve');
          (nodes[this.currentTab] as HTMLElement).classList.add(
            'approve-disabled'
          );
          break;
        case 'stepper-item active':
          (nodes[this.currentTab] as HTMLElement).classList.remove('active');
          break;
      }
      this.currentTab = tabNo;
    }
  }

  continue(currentTab) {
    console.log((this.status.nativeElement as HTMLElement).childNodes);
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    if (currentTab < nodes.length - 1) {
      if (
        (nodes[currentTab] as HTMLElement).classList.contains(
          'approve-disabled'
        )
      ) {
        (nodes[currentTab] as HTMLElement).classList.remove('approve-disabled');
        (nodes[currentTab] as HTMLElement).classList.add('approve');
      }
      (nodes[currentTab] as HTMLElement).classList.add('approve-disabled');
      (nodes[currentTab] as HTMLElement).classList.remove('active');
      (nodes[currentTab + 1] as HTMLElement).classList.add('active');
    }

    switch (currentTab) {
      case 0:
        if (this.dmSV.fileUploadList.length > 0) {
          this.currentTab++;
          this.processTab++;
        } else {
          this.notify.notify('Yêu cầu thêm file');
        }
        break;
      case 1:
        if (this.dialogSignFile.invalid) {
          break;
        }
        this.onSaveSignFile();
        // this.currentTab++;
        break;
      case 2:
        break;
      case 3:
        break;
    }
    if (currentTab == 1) {
      //this.transID = '629de1080d7d066f90f975a3';
      // this.api
      //   .callSv('ES', 'ES', 'SignFilesBusiness', 'AddEditAsync', [
      //     this.dialogSignFile.value,
      //     this.isAdd,
      //     this.transID,
      //   ])
      //   .subscribe((res) => {
      //     if (res && res.msgBodyData != null) {
      //       this.dialogSignFile.patchValue(res.msgBodyData[0]);
      //       this.transID = res.msgBodyData[0].recID;
      //       this.currentTab = currentTab + 1;
      //       this.viewApprovalStep.setTransID(this.transID);
      //       this.cr.detectChanges();
      //     }
      //   });
      this.currentTab = currentTab + 1;
    } else {
      this.currentTab = currentTab + 1;
    }
    this.cr.detectChanges();
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
