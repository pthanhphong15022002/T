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
  CacheService,
  CallFuncService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  ScrollComponent,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { iif } from 'rxjs';
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
  @ViewChild('view') view: ViewsComponent;
  @ViewChild('status') status: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('stepAppr') stepAppr: ApprovalStepComponent;
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
  isAddNew: boolean = true;
  processID: String = '';
  transID: String = '';
  isSaved = false;

  dialog: DialogRef;
  data;
  autoNo: string; //Số văn bản tự động mặc định

  newNode: number; //vị trí node mới
  oldNode: number; //vị trí node trước

  option: SidebarModel;

  showPlan: boolean = true;
  constructor(
    private auth: AuthStore,
    private esService: CodxEsService,
    private codxService: CodxService,
    private cr: ChangeDetectorRef,
    private callfuncService: CallFuncService,
    public dmSV: CodxDMService,
    private notify: NotificationsService,
    private cache: CacheService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModel = data?.data.formModel;
    this.data = data?.data.option.DataService.dataSelected;
    this.isAddNew = data?.data.isAddNew;
    this.option = data?.data.option;
  }

  ngOnInit(): void {
    this.initForm();

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) this.cbxName = res;
      });
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    const user = this.auth.get();
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogSignFile = res;

          this.dialogSignFile.patchValue(this.data);
          if (this.isAddNew) {
            this.dialogSignFile.patchValue({
              priority: '1',
              approveStatus: '1',
              employeeID: user.employee?.employeeID,
              orgUnitID: user.employee?.orgUnitID,
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
                this.isAfterRender = true;
              });
          } else {
            this.esService
              .getDetailSignFile(this.data?.recID)
              .subscribe((res) => {
                if (res) {
                  this.dialogSignFile.patchValue(res);
                  this.dialogSignFile.addControl(
                    'recID',
                    new FormControl(res?.recID ?? null)
                  );
                  this.dialogSignFile.addControl(
                    'id',
                    new FormControl(res?.id ?? null)
                  );

                  console.log(this.dialogSignFile.value);

                  this.cr.detectChanges();
                  this.isAfterRender = true;
                }
              });
            this.dialogSignFile.addControl(
              'approveControl',
              new FormControl(this.data?.approveControl ?? '3')
            );
          }
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

  fileAdded(event) {
    let lstESign = ['.doc', '.pdf', '.xlsx'];
    let files = [];
    if (event) {
      if (event?.length > 0) {
        event.forEach((element) => {
          let file = new File();
          file.fileID = element.data.recID;
          file.fileName = element.data.fileName;
          file.createdOn = element.data.createdOn;
          file.createdBy = element.data.createdBy;
          file.comment = element.data.extension;

          let index = lstESign.indexOf(file.comment);
          if (index >= 0) {
            file.eSign = true;
          }

          files.push(file);
        });
      } else {
        let file = new File();
        file.fileID = event.data.recID;
        file.fileName = event.data.fileName;
        file.createdOn = event.data.createdOn;
        file.createdBy = event.data.createdBy;
        file.comment = event.data.extension;
        let index = lstESign.indexOf(file.comment);
        if (index >= 0) {
          file.eSign = true;
        }

        files.push(file);
      }

      this.dialogSignFile.patchValue({ files: files });
      this.esService
        .editSignFile(this.dialogSignFile.value)
        .subscribe((res) => {
          console.log('cập nhật file', res);
        });
    }
  }

  getfileCount(event) { }

  valueChange(event) {
    if (event?.field && event?.component) {
      if (event?.data === Object(event?.data))
        this.dialogSignFile.patchValue({ [event['field']]: event.data[0] });
      else this.dialogSignFile.patchValue({ [event['field']]: event.data });

      if (event.field == 'categoryID') {
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

      if (event.field == 'employeeID') {
        if (event.component?.itemsSelected[0]?.OrgUnitID) {
          this.dialogSignFile.patchValue({
            orgUnitID: event.component?.itemsSelected[0]?.OrgUnitID,
          });
          this.cr.detectChanges();
        }
      }
    }
  }

  //#region Methods Save
  onSaveSignFile() {
    if (this.dialogSignFile.invalid == true) {
      this.notify.notifyCode('E0016');
      return;
    }

    if (!this.isSaved) {
      this.esService
        .addNewSignFile(this.dialogSignFile.value)
        .subscribe((res) => {
          if (res != null) {
            this.isSaved = true;
            this.dialogSignFile.patchValue(res);
            this.dialogSignFile.addControl('recID', new FormControl(res.recID));
            this.dialogSignFile.addControl('id', new FormControl(res.id));
            if (this.attachment.fileUploadList.length > 0) {
              this.attachment.objectId = res.recID;
              this.attachment.saveFilesObservable().subscribe((res) => {
                if (res) {
                  this.fileAdded(res);
                  console.log(this.attachment.fileUploadList);
                }
              });
            }
            if (this.currentTab == 1) {
              this.upDateNodeStatus(this.oldNode, this.newNode);
              this.currentTab++;
              this.processTab++;
            }
          }
        });
    } else {
      this.esService
        .editSignFile(this.dialogSignFile.value)
        .subscribe((res) => {
          if (res) {
            if (this.currentTab == 1) {
              this.upDateNodeStatus(this.oldNode, this.newNode);
              this.currentTab++;
            }
          }
        });
    }
    this.cr.detectChanges();
  }

  onSaveProcessTemplateID(dialogTmp: DialogRef) {
    if (this.processID != '') {
      this.dialogSignFile.patchValue({
        processID: this.processID,
        approveControl: '2',
      });

      dialogTmp && dialogTmp.close();
    }
  }

  saveProcessStep() {
    this.stepAppr.saveStep();
    if (this.dialogSignFile.value.approveControl != '1') {
      let newProcessStep = [];
      this.esService.approvalStep.subscribe((res) => {
        newProcessStep = res;
      });
      if (newProcessStep != null) {
        let lstStep = [];
        newProcessStep.forEach((element) => {
          if (element?.id) delete element.id;
          if (element?.recID) delete element.recID;
          element.transID = this.dialogSignFile.value.recID;
          lstStep.push(element);
        });

        this.esService.addNewApprovalStep(lstStep).subscribe((res) => {
          if (res) {
            this.dialogSignFile.patchValue({ approveControl: '1' });
          }
        });
      }
    } else {
      this.esService.editApprovalStep().subscribe((res) => { });
      this.esService.deleteApprovalStep().subscribe((res) => { });
    }
  }

  //#endregion

  //#region Change Tab

  clickTab(tabNo) {
    let newNo = tabNo * 2;

    let oldNo = this.currentTab * 2;
    if (tabNo < this.currentTab) {
      oldNo++;
    }

    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      this.upDateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    }
  }

  continue(currentTab) {
    if (this.currentTab > 3) return;

    let oldNode = currentTab * 2;
    let newNode = oldNode + 2;

    switch (currentTab) {
      case 0:
        if (
          this.attachment.fileUploadList.length > 0 ||
          this.dialogSignFile.value.files?.length > 0
        ) {
          this.upDateNodeStatus(oldNode, newNode);
          this.currentTab++;
          this.processTab++;
        } else {
          this.notify.notifyCode('ES006');
        }
        break;
      case 1:
        if (this.dialogSignFile.invalid) {
          break;
        }
        if (this.isAddNew) {
          this.newNode = newNode;
          this.oldNode = oldNode;
          this.onSaveSignFile();
        } else {
          this.upDateNodeStatus(oldNode, newNode);
          this.processTab == this.currentTab && this.processTab++;
          this.currentTab++;
        }
        break;

      case 2:
        this.saveProcessStep();
        this.upDateNodeStatus(oldNode, newNode);
        this.currentTab++;
        if (this.processTab == 1) this.processTab++;
        break;
      case 3:
        if (this.esService.getApprovalStep) break;
    }

    this.cr.detectChanges();
  }

  previous(currentTab) {
    let oldNode = currentTab * 2;
    let newNode = oldNode - 2;
    this.upDateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }

  upDateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    let newClassName = (nodes[newNode] as HTMLElement).className.toString();
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className.toString();
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
  }
  //#endregion

  openFormAdd(event) {
    this.callfuncService.openForm(this.content, 'Quy trình mẫu', 700, 1000);
  }

  openPopup(content) {
    this.callfuncService.openForm(content, 'Quy trình mẫu', 400, 250);
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  //#region Method close form

  clickIsSave(isSave, dialogClose: DialogRef) {
    if (this.isAddNew) {
      if (isSave) {
        this.onSaveSignFile();
        dialogClose && dialogClose.close();
        this.dialog && this.dialog.close(this.dialogSignFile.value);
      } else if (this.isSaved) {
        this.esService
          .deleteSignFile(this.dialogSignFile.value.recID)
          .subscribe((res) => {
            if (res) {
              dialogClose && dialogClose.close();
              this.dialog && this.dialog.close();
            }
          });
      }

      dialogClose && dialogClose.close();
      this.dialog && this.dialog.close();
    } else {
      this.esService
        .editSignFile(this.dialogSignFile.value)
        .subscribe((res) => {
          if (res) {
            dialogClose && dialogClose.close();
            this.dialog && this.dialog.close();
          }
        });
    }
  }

  clickNotSave(dialogClose: DialogRef) {
    dialogClose && dialogClose.close();
    this.dialog && this.dialog.close();
  }

  close(dialogClose) {
    if (this.processTab == 0) {
      this.dialog && this.dialog.close();
    }
    if (this.processTab > 0) {
      this.callfuncService.openForm(dialogClose, '', 400, 250);
    }
  }

  closeDialogTmp(dialogTmp: DialogRef) {
    dialogTmp && dialogTmp.close();
  }

  //#endregion
}
