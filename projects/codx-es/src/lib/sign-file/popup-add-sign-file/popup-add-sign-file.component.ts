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
  AuthStore,
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
import { isBuffer } from 'util';
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
    private auth: AuthStore,
    private esService: CodxEsService,
    private codxService: CodxService,
    private cr: ChangeDetectorRef,
    private callfuncService: CallFuncService,
    public dmSV: CodxDMService,
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
    const user = this.auth.get();
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
            employeeID: user.userID,
          });
          this.dialogSignFile.addControl(
            'approveControl',
            new FormControl('3')
          );

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
            this.processTab++;
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

  close(dialogClose) {
    if (this.processTab > 0) {
      this.callfuncService.openForm(dialogClose, '', 400, 250);
    }
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
    let newNo = 0;
    if (tabNo > 0) {
      newNo = tabNo * 2;
    }

    let oldNo = this.currentTab;
    if (this.currentTab > 0) {
      oldNo = this.currentTab * 2;
    }
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      let className = (nodes[newNo] as HTMLElement).className.toString();
      switch (className) {
        case 'stepper-item':
          (nodes[newNo] as HTMLElement).classList.add('active');

          break;
        case 'stepper-item approve-disabled':
          (nodes[newNo] as HTMLElement).classList.remove('approve-disabled');
          (nodes[newNo] as HTMLElement).classList.add('approve');
          break;
      }

      if (tabNo < this.currentTab) {
        oldNo++;
      }
      let oldClassName = (nodes[oldNo] as HTMLElement).className.toString();
      switch (oldClassName) {
        case 'stepper-item approve':
          (nodes[oldNo] as HTMLElement).classList.remove('approve');
          (nodes[oldNo] as HTMLElement).classList.add('approve-disabled');
          break;
        case 'stepper-item active':
          (nodes[oldNo] as HTMLElement).classList.remove('active');
          break;
      }
      this.currentTab = tabNo;
    }
  }

  continue(currentTab) {
    if (this.currentTab > 3) return;

    let currentNode = currentTab * 2;

    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    if (currentTab < nodes.length - 1) {
      let newNode = currentNode + 2;
      let className = (nodes[newNode] as HTMLElement).className.toString();
      switch (className) {
        case 'stepper-item':
          (nodes[newNode] as HTMLElement).classList.add('active');

          break;
        case 'stepper-item approve-disabled':
          (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
          (nodes[newNode] as HTMLElement).classList.add('approve');
          break;
      }

      let oldClassName = (
        nodes[currentNode] as HTMLElement
      ).className.toString();
      switch (oldClassName) {
        case 'stepper-item approve':
          (nodes[currentNode] as HTMLElement).classList.remove('approve');
          break;
        case 'stepper-item active':
          (nodes[currentNode] as HTMLElement).classList.remove('active');
          break;
      }
      (nodes[currentNode] as HTMLElement).classList.add('approve-disabled');
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
        break;
      case 2:
        this.currentTab++;
        if (this.processTab == 1) this.processTab++;
        break;
      case 3:
        break;
    }

    this.cr.detectChanges();
  }

  openFormAdd(event) {
    this.callfuncService.openForm(this.content, 'Quy trình mẫu', 700, 1000);
  }

  openPopup(content) {
    this.callfuncService.openForm(content, 'Quy trình mẫu', 400, 250);
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  clickIsSave(isSave, dialogClose: DialogRef) {
    if (isSave) {
      if (this.processTab == 1) {
        this.onSaveForm();
      }
      dialogClose && dialogClose.close();
      this.dialog && this.dialog.close();
    } else {
      this.esService
        .deleteSignFile(this.dialogSignFile.value.recID)
        .subscribe((res) => {
          console.log(res);

          if (res) {
            dialogClose && dialogClose.close();
            this.dialog && this.dialog.close();
          }
        });
    }
  }
}
