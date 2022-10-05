import { I } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-charts';
import {
  AlertConfirmInputConfig,
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
import { isBuffer } from 'util';
import { ES_SignFile, File } from '../../codx-es.model';
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

  frmModel: FormModel = {
    entityName: 'ES_SignFiles',
    entityPer: 'ES_SignFiles',
    formName: 'SignFiles',
    funcID: 'EST011',
    gridViewName: 'grvSignFiles',
  };

  currentTab = 0; // buoc hiện tại
  processTab = 0; // tổng bước đã đi qua
  formModelCustom: FormModel;
  isAfterRender = false;
  cbxName: any = {};
  dialogSignFile: FormGroup;
  lstDataFile = [];
  isAddNew: boolean = true; // flag thêm mới signfile
  processID: String = '';
  transID: String = '';
  gvSetup: any;

  isSaved: boolean = false; // flag đã gọi hàm lưu signfile
  isEdit: boolean = false; // flag kiểm tra đã chỉnh sửa thông tin signfile

  lstFile: any = [];

  templateName: string = ''; // tên template khi chọn lưu thành template

  dialog: DialogRef;
  data: any = {};
  autoNo: string; //Số văn bản tự động mặc định

  newNode: number; //vị trí node mớis
  oldNode: number; //vị trí node trước

  disableContinue: boolean = false;

  isAfterSaveProcess: boolean = false;

  option: SidebarModel;
  oSignFile: ES_SignFile;
  user: any = {};
  showPlan: boolean = true;
  constructor(
    private auth: AuthStore,
    private esService: CodxEsService,
    private codxService: CodxService,
    private cr: ChangeDetectorRef,
    private callfuncService: CallFuncService,
    public dmSV: CodxDMService,
    private notify: NotificationsService,
    private fileService: FileService,
    private cache: CacheService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModelCustom = data?.data?.formModel;
    this.data = data?.data?.option?.DataService.dataSelected || {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
    this.oSignFile = data?.data?.oSignFile;

    console.log(this.formModelCustom);

    this.user = this.auth.get();
    // if (!this.user.employee || this.user.employee == null) {
    //   this.user.employee = null;
    //   this.esService.getEmployee(this.user?.userID).subscribe((emp) => {
    //     console.log('employee', emp);

    //     if (emp) {
    //       this.user.employee = emp;
    //     }
    //   });
    // }

    if (this.oSignFile) {
      this.currentTab = 1;
      this.processTab = 1;
      this.lstFile = data?.data?.files;
    } else {
      if (!this.isAddNew) {
        this.data = data?.data.dataSelected;
        this.processTab = 4;
      }
      if (this.data?.approveStatus != 1) {
        this.currentTab = 3;
        this.processTab = 4;
      }
    }
  }

  ngOnInit(): void {
    if (this.oSignFile) {
      this.esService.getFormModel('EST011').then((formModel) => {
        this.formModelCustom = formModel;

        let sf = this.esService
          .getSFByID(this.oSignFile.recID)
          .subscribe((signFile) => {
            if (signFile && signFile?.signFile?.approveStatus == '1') {
              this.data = signFile?.signFile;
              this.data.recID = this.oSignFile.recID;
              this.data.title = this.oSignFile.title;
              this.data.categoryID = this.oSignFile.categoryID;
              this.data.files = this.oSignFile.files;
              this.data.refId = this.oSignFile.refId;
              this.data.refDate = this.oSignFile.refDate;
              this.data.refNo = this.oSignFile.refNo;
              this.data.priority = this.oSignFile.priority;

              this.isSaved = true;
              this.isAddNew = false;

              this.processTab = 3;
              this.initForm1();
            } else {
              this.esService
                .getDataDefault(
                  'EST01',
                  this.formModelCustom.entityName,
                  'recID'
                )
                .subscribe((dataDefault: any) => {
                  if (dataDefault) {
                    this.data = dataDefault.data;
                    this.data.recID = this.oSignFile.recID;
                    this.data.title = this.oSignFile.title;
                    this.data.categoryID = this.oSignFile.categoryID;
                    this.data.files = this.oSignFile.files;
                    this.data.refId = this.oSignFile.refId;
                    this.data.refDate = this.oSignFile.refDate;
                    this.data.refNo = this.oSignFile.refNo;
                    this.data.priority = this.oSignFile.priority;
                    this.initForm1();
                  }
                });
            }
          });

        this.esService
          .getComboboxName(
            this.formModelCustom.formName,
            this.formModelCustom.gridViewName
          )
          .then((res) => {
            if (res) this.cbxName = res;
          });
      });
    } else {
      this.initForm1();
      this.esService
        .getComboboxName(
          this.formModelCustom.formName,
          this.formModelCustom.gridViewName
        )
        .then((res) => {
          if (res) this.cbxName = res;
        });
    }
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.esService.getEmployee(this.user?.userID).subscribe((emp) => {
      console.log('employee', emp);

      if (emp) {
        this.user.employee = emp;
      }

      this.esService
        .getFormGroup(
          this.formModelCustom.formName,
          this.formModelCustom.gridViewName
        )
        .then((res) => {
          if (res) {
            this.dialogSignFile = res;
            this.dialogSignFile.addControl('recID', new FormControl(null));
            this.dialogSignFile.addControl('id', new FormControl(null));
            this.dialogSignFile.addControl('icon', new FormControl(null));
            this.dialogSignFile.addControl('color', new FormControl(null));
            this.dialogSignFile.addControl('categoryName', new FormControl(''));
            this.dialogSignFile.addControl(
              'approveControl',
              new FormControl(null)
            );
            if (this.oSignFile) {
              this.dialogSignFile.patchValue(this.data);
              this.dialogSignFile.patchValue({
                approveStatus: '1',
                approveControl: '3',
                employeeID: this.user.employee?.employeeID,
                orgUnitID: this.user.employee?.orgUnitID,
                deptID: this.user.employee?.departmentID,
                divisionID: this.user.employee?.divisionID,
                companyID: this.user.employee?.companyID,
              });

              this.isAfterRender = true;
              this.cr.detectChanges();
              this.updateNodeStatus(0, 1);
            } else {
              this.dialogSignFile.patchValue(this.data);
              if (this.isAddNew) {
                this.dialogSignFile.patchValue({
                  approveControl: '3',
                  priority: '1',
                  approveStatus: '1',
                  categoryID: null,
                  employeeID: this.user.employee?.employeeID,
                  orgUnitID: this.user.employee?.orgUnitID,
                  deptID: this.user.employee?.departmentID,
                  divisionID: this.user.employee?.divisionID,
                  companyID: this.user.employee?.companyID,
                  refDate: new Date(),
                });
                this.codxService
                  .getAutoNumber(
                    this.formModelCustom.funcID,
                    this.formModelCustom.entityName,
                    'CategoryID'
                  )
                  .subscribe((dt: any) => {
                    this.autoNo = dt;
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

                      console.log('main, edit', this.dialogSignFile.value);
                      this.isAfterRender = true;
                      this.cr.detectChanges();
                    }
                  });
              }
            }
          }
        });
    });
  }

  initForm1() {
    this.esService.loadDataCbx('ES');
    const user = this.auth.get();
    this.esService.getEmployee(this.user?.userID).subscribe((emp) => {
      if (emp) {
        this.user.employee = emp;
      }

      this.esService
        .getFormGroup(
          this.formModelCustom.formName,
          this.formModelCustom.gridViewName
        )
        .then((res) => {
          if (res) {
            this.dialogSignFile = res;
            this.dialogSignFile.addControl('recID', new FormControl(null));
            this.dialogSignFile.addControl('id', new FormControl(null));
            this.dialogSignFile.addControl('icon', new FormControl(null));
            this.dialogSignFile.addControl('color', new FormControl(null));
            this.dialogSignFile.addControl('categoryName', new FormControl(''));
            this.dialogSignFile.addControl(
              'approveControl',
              new FormControl('3')
            );
            if (this.isAddNew) {
              this.data.employeeID = user.employee?.employeeID;
              this.data.orgUnitID = user.employee?.orgUnitID;
              this.data.deptID = user.employee?.departmentID;
              this.data.divisionID = user.employee?.divisionID;
              this.data.companyID = user.employee?.companyID;
              this.data.approveControl = '3';
              this.data.refDate = new Date();

              this.autoNo = JSON.parse(JSON.stringify(this.data?.refNo));

              this.formModelCustom.currentData = this.data;
              this.dialogSignFile.patchValue(this.data);
              this.isAfterRender = true;
              this.cr.detectChanges();
              if (this.oSignFile) {
                if (this.data.files.length == 1) {
                  console.log(this.data.files);
                  let title = JSON.parse(
                    JSON.stringify(this.data.files[0].fileName)
                  );
                  for (
                    let i = this.data.files[0].fileName.length;
                    i >= 0;
                    i--
                  ) {
                    title = title.slice(0, i - 1);
                    if (this.data.files[0].fileName[i - 1] === '.') break;
                  }
                }
                this.updateNodeStatus(0, 1);
              }
            } else {
              this.esService
                .getDetailSignFile(this.data?.recID)
                .subscribe((res) => {
                  if (res) {
                    this.data = res;
                    if (this.data.files.length == 1) {
                      console.log(this.data.files);
                      let title = JSON.parse(
                        JSON.stringify(this.data.files[0].fileName)
                      );
                      for (
                        let i = this.data.files[0].fileName.length;
                        i >= 0;
                        i--
                      ) {
                        title = title.slice(0, i - 1);
                        if (this.data.files[0].fileName[i - 1] === '.') break;
                      }
                    }
                    this.autoNo = JSON.parse(JSON.stringify(this.data.refNo));
                    this.formModelCustom.currentData = this.data;
                    this.dialogSignFile.patchValue(this.data);
                    this.isAfterRender = true;
                    this.cr.detectChanges();
                    if (this.oSignFile) {
                      this.updateNodeStatus(0, 1);
                    }
                  }
                });
            }
          }
        });
    });
  }

  popup(data, current) {
    this.attachment.openPopup();
  }

  changeTab(tabNo) {
    // if (this.currentTab == 2) {
    //   this.saveProcessStep();
    // } else {
    this.onSaveSignFile();
    // }

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

      this.data.files = files;
      //this.dialogSignFile.patchValue({ files: files });
      console.log(this.dialogSignFile.value);

      this.esService.editSignFile(this.data).subscribe((res) => {
        console.log('cập nhật file', res);
        this.data = res;
        //this.dialogSignFile.patchValue(res);
      });
    }
  }

  fileAdded1(event) {
    this.isEdit = true;
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

      this.data.files = files;
      //this.dialogSignFile.patchValue({ files: files });
      console.log(this.dialogSignFile.value);
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      this.isEdit = true;
      if (event.field == 'categoryID' && this.data.categoryID != event.data) {
        this.esService
          .getAutoNumberByCategory(event.data)
          .subscribe((autoNum) => {
            if (autoNum != null) {
              this.data.refNo = autoNum;
            } else if (this.autoNo) {
              this.data.refNo = this.autoNo;
            }
            this.dialogSignFile.patchValue({ refNo: this.data.refNo });
            let category = event.component?.itemsSelected[0];
            this.dialogSignFile.patchValue({
              icon: category?.Icon,
              color: category?.Color,
              processID: category?.RecID,
              categoryName: category?.CategoryName,
            });
            this.data.icon = category?.Icon;
            this.data.color = category?.Color;
            this.data.processID = category?.RecID;
            this.data.categoryName = category?.CategoryName;
            this.cr.detectChanges();
          });
      } else if (event?.field == 'refDate') {
        this.dialogSignFile.patchValue({
          [event['field']]: event.data?.fromDate,
        });
        this.data[event['field']] = event.data?.fromDate;
      } else if (event.field == 'owner') {
        this.esService.getEmployee(event.data).subscribe((emp) => {
          console.log('employee', emp);

          let employee = event.component?.itemsSelected[0];
          if (emp) {
            employee = emp;
          }
          this.data.employeeID = employee?.employeeID;
          this.data.deptID = employee?.departmentID;
          this.data.divisionID = employee?.divisionID;
          this.data.companyID = employee?.companyID;

          if (employee?.orgUnitID != null) {
            this.data.orgUnitID = employee?.orgUnitID;
          }

          //this.dialogSignFile.patchValue(this.data);

          this.dialogSignFile.patchValue({
            employeeID: employee?.employeeID,
            deptID: employee?.departmentID,
            divisionID: employee?.divisionID,
            companyID: employee?.companyID,
          });
          if (employee?.orgUnitID && employee?.orgUnitID != null) {
            let arr = employee?.orgUnitID.split(';') || [];

            this.dialogSignFile.patchValue({
              orgUnitID: arr,
            });
          }
          console.log(this.data);
          console.log(this.dialogSignFile.value);

          this.cr.detectChanges();
        });

        this.cr.detectChanges();
      }
    }
  }

  getCurrentStepWhenEdit(oSignFile) {
    if ((oSignFile || oSignFile != null) && this.isAddNew == false) {
      if (oSignFile.files?.length > 0) {
        let lstFile = oSignFile.files;
        lstFile.forEach((element) => {
          if (element?.areas?.length > 0) {
            this.processTab = 3;
            this.currentTab = 3;
            return;
          }
        });

        if (oSignFile.ApproveControl != 1) {
          this.processTab = 1;
          this.currentTab = 1;
          return;
        } else {
          this.processTab = 2;
          this.currentTab = 2;
          return;
        }
      }
    }
  }

  processIDChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event?.field == 'processID') {
        this.processID = event?.data;
      }
    }
  }

  //#region Methods Save
  onSaveSignFile() {
    //this.dialogSignFile.patchValue(this.data);
    if (this.dialogSignFile.invalid == true) {
      this.esService.notifyInvalid(
        this.dialogSignFile,
        this.formModelCustom,
        this.data
      );
      return;
    }

    if (!this.isSaved && this.isAddNew) {
      this.esService.addNewSignFile(this.data).subscribe(async (res) => {
        console.log('ADD NEW SIGNFILE: ', res);
        console.log('...', this.dialogSignFile.value);
        if (res != null) {
          this.isSaved = true;
          //this.dialogSignFile.patchValue(res);
          // this.data = res;
          if (this.attachment.fileUploadList.length > 0) {
            this.attachment.objectId = res.recID;
            // this.attachment
            //   .addFileObservable(this.attachment.fileUploadList[0])
            //   .subscribe((file) => {
            //     if (file) {
            //       this.fileAdded(file);
            //       console.log(this.attachment.fileUploadList);
            //     }
            //   });
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                }
              }
            );
          }
          if (this.currentTab == 1) {
            this.updateNodeStatus(this.oldNode, this.newNode);
            this.currentTab++;
            this.processTab++;
          }
        }
      });
    } else {
      this.esService.editSignFile(this.data).subscribe((res) => {
        if (res) {
          //this.dialogSignFile.patchValue(res);
          // this.data = res;
          console.log('EDIT SIGNFILE: ', res);
          console.log('...', this.dialogSignFile.value);

          if (this.currentTab == 1) {
            this.updateNodeStatus(this.oldNode, this.newNode);
            this.currentTab++;
          }
        }
      });
    }
    this.saveProcessStep();
    this.cr.detectChanges();
  }

  onSaveProcessTemplateID(dialogTmp: DialogRef) {
    if (this.stepAppr?.isEdited) {
      this.notify.alertCode('ES002').subscribe((x) => {
        if (x.event.status == 'Y') {
          if (this.processID != '') {
            this.dialogSignFile.patchValue({
              processID: this.processID,
              approveControl: '2',
            });
            this.data.processID = this.processID;
            this.data.approveControl = '2';
          }
        }
      });
    } else {
      if (this.processID != '') {
        this.dialogSignFile.patchValue({
          processID: this.processID,
          approveControl: '2',
        });
        this.data.processID = this.processID;
        this.data.approveControl = '2';
      }
    }

    if (this.processTab >= 2) {
      this.onSaveSignFile();
    }
    dialogTmp && dialogTmp.close();
  }

  saveProcessStep() {
    console.log('SAVE PROCESS STEP');

    this.stepAppr?.saveStep();
    if (
      this.dialogSignFile.value.approveControl != '1' ||
      this.data.approveControl != '1'
    ) {
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
          element.transID = this.data.recID;
          lstStep.push(element);
        });

        this.esService.addNewApprovalStep(lstStep).subscribe((res) => {
          if (res) {
            this.esService.setApprovalStep(null);
            this.esService.setLstDeleteStep(null);
            console.log('result add new process step:', res);
            this.dialogSignFile.patchValue({ approveControl: '1' });
            this.esService.editSignFile(this.data).subscribe((resSignFile) => {
              if (resSignFile) {
                this.dialogSignFile.patchValue(resSignFile);
                this.data = resSignFile;
                this.isAfterSaveProcess = true;
              }
            });
          }
        });
      }
    } else {
      this.esService.editApprovalStep().subscribe((res) => {
        console.log('result edit step ', res);
        this.isAfterSaveProcess = true;
      });
      this.esService.deleteApprovalStep().subscribe((res) => {
        console.log('result delete step ', res);
      });
    }
    if (this.stepAppr?.isEdited == true) this.stepAppr.isEdited = false;
  }

  saveTemplate(dialogTemplateName) {
    if (this.templateName != '') {
      this.esService
        .saveSignFileIsTemplate(
          this.dialogSignFile.value.recID,
          this.templateName
        )
        .subscribe((res) => {
          if (res) {
            this.notify.alertCode('RS002');
            dialogTemplateName && dialogTemplateName.close();
          }
        });
    } else {
      this.notify.notifyCode('SYS028');
    }
  }

  saveCategoryTemplate() {}
  //#endregion

  //#region Change Tab

  clickTab(tabNo) {
    let newNo = tabNo;
    let oldNo = this.currentTab;

    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      this.updateNodeStatus(oldNo, newNo);
      this.saveProcessStep();
      this.currentTab = tabNo;
    }
  }

  async continue(currentTab) {
    console.log(this.data);

    if (this.currentTab > 3) return;

    let oldNode = currentTab;
    let newNode = oldNode + 1;

    switch (currentTab) {
      case 0:
        if (
          this.attachment.fileUploadList.length > 0 ||
          this.dialogSignFile.value.files?.length > 0
        ) {
          if (this.attachment.fileUploadList.length > 0) {
            this.disableContinue = true;
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.disableContinue = false;
                  this.fileAdded1(item2);
                }
              }
            );
          }

          this.updateNodeStatus(oldNode, newNode);
          this.currentTab++;
          this.processTab == 0 && this.processTab++;
        } else {
          this.notify.notifyCode('ES006');
        }
        break;
      case 1:
        if (this.dialogSignFile.invalid) {
        }
        if (this.isAddNew) {
          this.newNode = newNode;
          this.oldNode = oldNode;
          this.onSaveSignFile();
        } else {
          this.updateNodeStatus(oldNode, newNode);
          this.processTab == 1 && this.processTab++;
          this.currentTab++;
        }
        break;

      case 2:
        this.saveProcessStep();
        //this.onSaveSignFile();
        setTimeout(() => {
          // <<<---using ()=> syntax
          this.updateNodeStatus(oldNode, newNode);

          this.currentTab++;
          this.processTab == 2 && this.processTab++;
        }, 800);
        console.log('cur Tab', this.currentTab);
        console.log('3', this.dialogSignFile);
        break;
      case 3:
        if (this.esService.getApprovalStep) break;
    }

    this.cr.detectChanges();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }

  updateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );

    let newClassName = (nodes[newNode] as HTMLElement).className;
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className;
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    if (oldNode > newNode && this.currentTab == this.processTab) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }
  //#endregion

  //#region Open form
  openFormAdd(event) {
    this.callfuncService.openForm(this.content, '', 700, 1000);
  }

  openPopup(content) {
    this.callfuncService.openForm(content, '', 400, 250);
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  openTemplateName(dialog1) {
    this.callfuncService.openForm(dialog1, '', 400, 250);
  }

  //#endregion

  //#region Method close form

  clickIsSave(isSave) {
    if (this.isAddNew) {
      if (isSave) {
        this.onSaveSignFile();
        this.dialog && this.dialog.close(this.dialogSignFile.value);
      } else if (this.isSaved) {
        this.esService
          .deleteSignFile(this.dialogSignFile.value.recID)
          .subscribe((res) => {
            if (res) {
              this.dialog && this.dialog.close();
            }
          });
      }

      this.dialog && this.dialog.close();
    } else {
      this.esService.editSignFile(this.data).subscribe((res) => {
        if (res) {
          this.dialog && this.dialog.close(this.data);
        }
      });
    }
  }

  clickNotSave(dialogClose: DialogRef) {
    // click thoát
    dialogClose && dialogClose.close();
    this.dialog && this.dialog.close();
  }

  close() {
    if (this.isAddNew == true) {
      this.notify.alertCode('ES002').subscribe((x) => {
        if (x.event.status == 'Y') {
          this.clickIsSave(true);
        } else {
          this.clickIsSave(false);
        }
      });
    } else {
      this.dialog && this.dialog.close();
    }
  }

  saveAndClose() {
    this.onSaveSignFile();
    this.dialog && this.dialog.close(this.dialogSignFile.value);
  }

  closeDialogTmp(dialogTmp: DialogRef) {
    //close dialog ng-template
    if (this.templateName != '') this.templateName = '';
    dialogTmp && dialogTmp.close();
  }

  //#endregion

  setValueAreaControl(event) {
    console.log(event);
  }

  approve() {
    //Gửi duyệt
    this.esService
      .release(
        this.data,
        this.formModelCustom.entityName,
        this.formModelCustom.funcID
      )
      .subscribe((res) => {
        if (res?.msgCodeError == null && res?.rowCount) {
          this.dialogSignFile.patchValue({ approveStatus: '3' });
          this.data.approveStatus = '3';
          this.esService.editSignFile(this.data).subscribe((result) => {
            if (res) {
              this.notify.notifyCode('ES007');
              this.dialog &&
                this.dialog.close({
                  data: this.data,
                  approved: true,
                });
            }
          });
        } else {
          this.notify.notifyCode(res?.msgCodeError);
        }
      });
  }
}
