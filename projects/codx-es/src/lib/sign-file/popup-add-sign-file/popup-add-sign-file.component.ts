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
  @ViewChild('content') content;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;

  headerText = '';

  frmModel: FormModel = {
    entityName: 'ES_SignFiles',
    entityPer: 'ES_SignFiles',
    formName: 'SignFiles',
    funcID: 'EST011',
    gridViewName: 'grvSignFiles',
  };

  currentTab = 0; // buoc hiện tại: 0, 1, 2, 3
  processTab = 0; // tổng bước đã đi qua
  formModelCustom: FormModel;
  isAfterRender = false;
  dialogSignFile: FormGroup;
  lstDataFile = [];
  isAddNew: boolean = true; // flag thêm mới signfile
  processID: String = '';
  transID: String = '';
  gvSetup: any;

  eSign: boolean = true; //Phân loại là ký số. defaul true for release form others module
  signatureType; //loai chu ki: cong cong - noi bo

  isSaved: boolean = false; // flag đã gọi hàm lưu signfile
  isEdit: boolean = false; // flag kiểm tra đã chỉnh sửa thông tin signfile

  modeView: string = '0'; //0: chỉnh sủa, 1: view file, 2: view signfile
  lstFile: any = [];

  templateName: string = ''; // tên template khi chọn lưu thành template

  dialog: DialogRef;
  data: any = {};
  autoNo: string; //Số văn bản tự động mặc định

  newNode: number; //vị trí node mớis
  oldNode: number; //vị trí node trước

  type: string; //copy

  disableContinue: boolean = false;
  disableCateID: boolean = false;
  isAfterSaveProcess: boolean = false;
  mssgDelete: string = '';

  option: SidebarModel;
  oSignFile: ES_SignFile;
  user: any = {};
  showPlan: boolean = true;
  oldSfRecID: string;

  cbxCategory: string;

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
    this.modeView = data?.data?.modeView ?? '0';
    /*
    1: view
    */
    this.formModelCustom = data?.data?.formModel;
    this.data = data?.data?.option?.DataService.dataSelected || {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
    this.oSignFile = data?.data?.oSignFile;
    this.disableCateID = data?.data?.disableCateID ?? false;
    this.cbxCategory = data?.data?.cbxCategory ?? null; // Ten CBB
    this.headerText = data?.data?.headerText ?? '';

    if (this.modeView == '2') {
      this.disableCateID = true;
    }

    //bien cho mf copy
    this.type = data?.data?.type;
    this.oldSfRecID = data?.data?.oldSfRecID;

    this.user = this.auth.get();

    if (this.type == 'copy') {
      // copy -> upload lại file

      this.data = data?.data.dataSelected;
    } else if (this.oSignFile) {
      this.currentTab = 1;
      this.processTab = 1;
      this.lstFile = data?.data?.files;
    } else {
      if (!this.isAddNew) {
        this.data = data?.data.dataSelected;
        this.processTab = 4;
      }
      if (
        (this.data?.approveStatus != 1 && this.data?.approveStatus != 2) ||
        this.modeView == '1'
      ) {
        this.currentTab = 3;
        this.processTab = 4;
      }
    }
  }

  ngOnInit(): void {
    if (this.oSignFile) {
      this.data.permissions;
      this.esService.getFormModel('EST011').then((formModel) => {
        this.formModelCustom = formModel;
        this.cache
          .gridViewSetup(
            this.formModelCustom.formName,
            this.formModelCustom.gridViewName
          )
          .subscribe((grv) => {
            if (grv) this.gvSetup = grv;
          });

        let sf = this.esService
          .getSFByID(this.oSignFile.recID)
          .subscribe((signFile) => {
            if (
              signFile &&
              (signFile?.signFile?.approveStatus == '1' ||
                signFile?.signFile?.approveStatus == '2')
            ) {
              this.data = signFile?.signFile;
              this.data.recID = this.oSignFile.recID;
              this.data.title = this.oSignFile.title;
              this.data.categoryID = this.oSignFile.categoryID;
              this.data.files = this.oSignFile.files;
              this.data.refId = this.oSignFile.refId;
              this.data.refType = this.oSignFile.refType;
              this.data.refDate = this.oSignFile.refDate;
              this.data.refNo = this.oSignFile.refNo;
              this.data.priority = this.oSignFile.priority;

              this.isSaved = true;
              this.isAddNew = false;

              this.esService
                .getCategoryByCateID(this.data.categoryID)
                .subscribe((cate) => {
                  if (cate) {
                    this.data.processID = cate.processID;
                    this.processTab = 3;
                    this.initForm();
                  }
                });
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
                    this.data.refType = this.oSignFile.refType;

                    this.esService
                      .getCategoryByCateID(this.data.categoryID)
                      .subscribe((cate) => {
                        if (cate) {
                          this.data.processID = cate.processID;
                          this.initForm();
                        }
                      });
                  }
                });
            }
          });
      });
    } else {
      this.cache
        .gridViewSetup(
          this.formModelCustom.formName,
          this.formModelCustom.gridViewName
        )
        .subscribe((grv) => {
          if (grv) this.gvSetup = grv;
        });
      this.initForm();
    }
  }

  ngAfterViewInit() {
    this.esService
      .getCategoryByCateID(this.data?.categoryID)
      .subscribe((cate) => {
        if (cate) {
          this.eSign = cate?.eSign;
          this.signatureType = cate?.signatureType;
        }
      });
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.esService.loadDataCbx('ES');
    this.user = this.auth.get();
    this.esService.getEmployee(this.user?.userID).subscribe((emp) => {
      if (emp) {
        this.user.employee = emp;
        console.log(this.user);
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
            if (this.type == 'copy') {
              this.esService
                .getDetailSignFile(this.oldSfRecID)
                .subscribe((res) => {
                  if (res) {
                    if (res?.files?.length > 0) {
                      this.eSign = this.data.files[0].eSign;
                      if (res.files[0].areas?.length > 0) {
                        if (this.eSign == true) {
                          this.mssgDelete = 'ES003';
                        }
                      }
                    }
                    //reset files và status
                    this.data.files = null;
                    this.data.approveStatus = '1';

                    res.recID = this.data.recID;
                    res.id = this.data.id;
                    res.files = null;
                    res.permissions = null;
                    res.refNo = this.data.refNo;
                    res.approveStatus = '1';

                    this.data = res;

                    if (this.data.approveControl == '1') {
                      //step theo sf -> tao bộ step mới
                      this.esService
                        .copyApprovalStep(this.oldSfRecID, this.data.recID)
                        .subscribe();
                    }

                    this.autoNo = JSON.parse(JSON.stringify(this.data.refNo));
                    this.formModelCustom.currentData = this.data;
                    this.dialogSignFile.patchValue(this.data);

                    //get autoNumber by category
                    this.esService
                      .getCategoryByCateID(this.data.categoryID)
                      .subscribe((res) => {
                        if (res) {
                          this.eSign = res.eSign;
                          this.esService
                            .getAutoNumberByCategory(res.autoNumber)
                            .subscribe((numberRes) => {
                              if (numberRes) {
                                if (numberRes != null) {
                                  this.data.refNo = numberRes;
                                  this.dialogSignFile.patchValue({
                                    refNo: this.data.refNo,
                                  });
                                  this.cr.detectChanges();
                                }
                              }
                            });
                          this.isAfterRender = true;
                          this.cr.detectChanges();
                        }
                      });
                  }
                });
            }
            if (this.isAddNew && this.type != 'copy') {
              this.data.employeeID = this.user.employee?.employeeID;
              this.data.orgUnitID = this.user.employee?.orgUnitID;
              this.data.deptID = this.user.employee?.departmentID;
              this.data.divisionID = this.user.employee?.divisionID;
              this.data.companyID = this.user.employee?.companyID;
              this.data.approveControl = '3';
              this.data.refDate = new Date();

              this.autoNo = JSON.parse(JSON.stringify(this.data?.refNo));

              this.formModelCustom.currentData = this.data;
              this.dialogSignFile.patchValue(this.data);
              this.isAfterRender = true;
              this.cr.detectChanges();
              if (this.oSignFile) {
                if (this.data.files.length == 1) {
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
              let sfRecID = this.data?.recID;

              this.esService.getDetailSignFile(sfRecID).subscribe((res) => {
                if (res) {
                  this.data = res;
                  if (this.data?.files?.length > 0) {
                    this.eSign = this.data.files[0].eSign;
                    if (this.data.files[0].areas?.length > 0) {
                      if (this.eSign == true) {
                        this.mssgDelete = 'ES003';
                      }
                    }
                  }

                  //default name for signfile by fileName
                  if (this.data?.files?.length == 1) {
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
                    this.eSign = true;
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
    this.onSaveSignFile();
    this.currentTab = tabNo;

    this.cr.detectChanges();
  }

  fileAdded(event) {
    this.isEdit = true;
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
          file.eSign = this.eSign;

          // let index = lstESign.indexOf(file.comment);
          // if (index >= 0) {
          //   file.eSign = true;
          // }

          files.push(file);
        });
      } else {
        let file = new File();
        file.fileID = event.data.recID;
        file.fileName = event.data.fileName;
        file.createdOn = event.data.createdOn;
        file.createdBy = event.data.createdBy;
        file.comment = event.data.extension;
        file.eSign = this.eSign;
        // let index = lstESign.indexOf(file.comment);
        // if (index >= 0) {
        //   file.eSign = true;
        // }

        files.push(file);
      }

      this.data.files = files;
      if (this.data.title == null) {
        if (this.data.files.length == 1) {
          let title = JSON.parse(JSON.stringify(this.data.files[0].fileName));
          for (let i = this.data.files[0].fileName.length; i >= 0; i--) {
            title = title.slice(0, i - 1);
            if (this.data.files[0].fileName[i - 1] === '.') break;
          }

          this.data.title = title;
          this.dialogSignFile.patchValue({ title: title });
        }
      }
      this.dialogSignFile.patchValue({ files: files });
    }
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      this.isEdit = true;

      switch (event.field) {
        case 'categoryID': {
          if (this.data.categoryID != event.data) {
            if ((!this.isAddNew || this.isSaved) && this.processTab >= 3) {
              this.notify.alertCode('ES001').subscribe((x) => {
                //open popup confirm
                let oldValue = JSON.parse(JSON.stringify(this.data.categoryID));
                let category = event.component?.itemsSelected[0];
                if (x.event?.status == 'Y') {
                  this.esService
                    .getAutoNumberByCategory(category?.AutoNumber)
                    .subscribe((autoNum) => {
                      this.data.categoryID = event.data;
                      this.dialogSignFile.patchValue({
                        categoryID: this.data.categoryID,
                      });
                      if (autoNum != null) {
                        this.data.refNo = autoNum;
                      } else if (this.autoNo) {
                        this.data.refNo = this.autoNo;
                      }
                      this.dialogSignFile.patchValue({
                        approveControl: '3',
                      });
                      this.data.approveControl = '3';

                      //delete step of signfile
                      this.esService
                        .deleteStepByTransID(this.data.recID)
                        .subscribe();

                      this.dialogSignFile.patchValue({
                        refNo: this.data.refNo,
                      });
                      //this.dialogSignFile.patchValue({ catagoryID: event?.data });

                      //set info of category

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

                      this.eSign = category?.ESign;
                      this.signatureType = category?.SignatureType;
                      this.afterCategoryChange();
                      this.cr.detectChanges();
                    });
                } else {
                  this.data.categoryID = event.data;
                  this.cr.detectChanges();
                  this.data.categoryID = oldValue;
                  this.cr.detectChanges();
                }
              });
            } else {
              this.data.categoryID = event.data;
              this.dialogSignFile.patchValue({
                categoryID: this.data.categoryID,
              });
              //get info of category
              let category = event.component?.itemsSelected[0];
              this.esService
                .getAutoNumberByCategory(category?.AutoNumber)
                .subscribe((autoNum) => {
                  console.log(this.data);
                  console.log(this.dialogSignFile.value);

                  if (autoNum != null) {
                    this.data.refNo = autoNum;
                  } else if (this.autoNo) {
                    this.data.refNo = this.autoNo;
                  }

                  this.dialogSignFile.patchValue({
                    approveControl: '3',
                  });
                  this.data.approveControl = '3';

                  //delete step of signfile
                  this.esService
                    .deleteStepByTransID(this.data.recID)
                    .subscribe();

                  this.dialogSignFile.patchValue({ refNo: this.data.refNo });
                  //this.dialogSignFile.patchValue({ catagoryID: event?.data });

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
                  this.eSign = category?.ESign;
                  this.signatureType = category?.SignatureType;

                  this.afterCategoryChange();
                  this.cr.detectChanges();
                });
            }
          }
          break;
        }
        case 'refDate': {
          this.dialogSignFile.patchValue({
            [event['field']]: event.data?.fromDate,
          });
          this.data[event['field']] = event.data?.fromDate;
          break;
        }
        case 'templateName': {
          this.templateName = event.data;
          break;
        }
        case 'owner': {
          this.esService.getEmployee(event.data).subscribe((emp) => {
            let employee = event.component?.itemsSelected[0];
            if (emp) {
              employee = emp;
            }
            this.data.employeeID = employee?.employeeID;
            if (employee?.departmentID)
              this.data.deptID = employee?.departmentID;
            this.data.divisionID = employee?.divisionID;
            this.data.companyID = employee?.companyID;

            if (employee?.orgUnitID) {
              this.data.orgUnitID = employee?.orgUnitID;
            }

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
            this.cr.detectChanges();
          });

          this.cr.detectChanges();
        }
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

  //#region Methods Save
  onSaveSignFile() {
    console.log('onSaveSignFile', this.data);
    console.log('onSaveSignFile', this.dialogSignFile.value);

    if (this.dialogSignFile.invalid == true) {
      this.esService.notifyInvalid(this.dialogSignFile, this.formModelCustom);
      return;
    }

    if (!this.isSaved && this.isAddNew) {
      this.esService.addNewSignFile(this.data).subscribe(async (res) => {
        if (res != null) {
          console.log('ADD NEW SIGNFILE: ', res);
          console.log('ADD NEW SIGNFILE: data', this.data);
          console.log('ADD NEW SIGNFILE: formGroup', this.dialogSignFile.value);
          this.data.files = res?.files;
          this.data.permissions = res?.permissions;
          this.dialogSignFile.patchValue({
            files: res?.files,
            permissions: res?.permissions,
          });
          this.isSaved = true;
          if (this.attachment.fileUploadList.length > 0) {
            this.attachment.objectId = res.recID;
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
          console.log('EDIT SIGNFILE: ', res);
          console.log('EDIT SIGNFILE: data', this.data);
          console.log('EDIT SIGNFILE: formGroup', this.dialogSignFile.value);
          this.data.modifiedBy = res?.modifiedBy;
          this.data.modifiedOn = res?.modifiedOn;

          this.dialogSignFile.patchValue({
            modifiedBy: res?.modifiedBy,
            modifiedOn: res?.modifiedOn,
          });

          if (this.currentTab == 1) {
            this.updateNodeStatus(this.oldNode, this.newNode);
            this.currentTab++;
          }
        }
      });
    }
    this.cr.detectChanges();
  }

  processIDChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      if (event?.field == 'processID') {
        this.processID = event?.data;
      }
    }
  }

  onSaveProcessTemplateID(dialogTmp: DialogRef) {
    if (this.processID != '') {
      if ((!this.isAddNew || this.isSaved) && this.eSign == true) {
        this.notify.alertCode('ES002').subscribe((x) => {
          if (x.event.status == 'Y') {
            this.esService.deleteStepByTransID(this.data.recID).subscribe();
            this.dialogSignFile.patchValue({
              processID: this.processID,
              approveControl: '2',
            });
            this.data.processID = this.processID;
            this.data.approveControl = '2';
            //Apply sign areas from template
            this.esService.getSFByID(this.processID).subscribe((res) => {
              if (res?.signFile && res.signFile?.files?.length > 0) {
                let areas = res.signFile?.files[0]?.areas;

                // set new area
                if (areas?.length > 0) {
                  areas.forEach((area) => {
                    delete area.id;
                    delete area.recID;
                    delete area.modifiedBy;
                    delete area.modifiedOn;
                    area.createdOn = new Date();
                    area.createdBy = this.user.userID;
                  });
                }
                if (this.data?.files?.length > 0) {
                  this.data?.files.forEach((element) => {
                    element.areas = areas;
                  });
                }
              }
              this.onSaveSignFile();
              dialogTmp && dialogTmp.close();
            });
          } else {
            this.processID == '';
            return;
          }
        });
      } else {
        this.esService.deleteStepByTransID(this.data.recID).subscribe();
        this.dialogSignFile.patchValue({
          processID: this.processID,
          approveControl: '2',
        });
        this.data.processID = this.processID;
        this.data.approveControl = '2';

        //Apply sign areas from template
        this.esService.getSFByID(this.processID).subscribe((res) => {
          if (res?.signFile && res.signFile?.files?.length > 0) {
            let areas = res.signFile?.files[0]?.areas;
            if (areas?.length > 0) {
              areas.forEach((area) => {
                delete area.id;
                delete area.recID;
                delete area.modifiedBy;
                delete area.modifiedOn;
                area.createdOn = new Date();
                area.createdBy = this.user.userID;
              });
            }
            if (this.data?.files?.length > 0) {
              this.data?.files.forEach((element) => {
                element.areas = areas;
              });
            }
          }
        });
        dialogTmp && dialogTmp.close();
      }
    }
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
      this.notify.notifyCode('SYS009');
    }
  }

  updateApproveTemplate() {
    if (this.data?.approveControl != '1') {
      this.notify.notify('Qui trình chưa thay đổi');
      return;
    }
    this.esService
      .updateApproveTemplate(this.data.recID, this.data.processID)
      .subscribe((res) => {
        if (res != null) {
          this.notify.notifyCode('RS002');
        }
      });
  }
  //#endregion

  //#region Change Tab

  clickTab(tabNo) {
    console.log('clickTab', this.data);
    console.log('clickTab', this.dialogSignFile.value);
    let newNo = tabNo;
    let oldNo = this.currentTab;

    if (oldNo == 3) {
      this.esService.getSFByID(this.data?.recID).subscribe((res) => {
        if (res?.signFile) {
          this.data.files = res?.signFile?.files;
          this.dialogSignFile.patchValue({ files: res?.signFile?.files });

          //Thay doi cau canh bao khi xoa step
          if (this.data.files[0]?.areas?.length > 0) {
            this.mssgDelete = 'ES003';
            this.cr.detectChanges();
          }
        }
      });
    }

    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    }
  }

  async continue(currentTab) {
    console.log('continue', this.data);
    console.log('continue', this.dialogSignFile.value);

    if (this.currentTab > 3) return;

    let oldNode = currentTab;
    let newNode = oldNode + 1;

    switch (currentTab) {
      case 0:
        if (
          this.attachment?.fileUploadList?.length > 0 ||
          this.data?.files?.length > 0
        ) {
          if (this.attachment.fileUploadList?.length > 0) {
            this.disableContinue = true;
            for (let i = 0; i < this.attachment.fileUploadList.length; i++) {
              this.attachment.fileUploadList[i].referType = 'sign';
            }
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                this.disableContinue = false;
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                  this.updateNodeStatus(oldNode, newNode);
                  this.currentTab++;
                  this.processTab == 0 && this.processTab++;
                }
              }
            );
          } else {
            this.updateNodeStatus(oldNode, newNode);
            this.currentTab++;
            this.processTab == 0 && this.processTab++;
          }
        } else {
          this.notify.notifyCode('ES006');
        }
        break;
      case 1:
        // if (this.isAddNew) {
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.onSaveSignFile();
        // } else {
        //   this.updateNodeStatus(oldNode, newNode);
        //   this.processTab == 1 && this.processTab++;
        //   this.currentTab++;
        // }
        break;

      case 2:
        this.updateNodeStatus(oldNode, newNode);

        this.currentTab++;
        this.processTab == 2 && this.processTab++;
        this.cr.detectChanges();
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
  dataStepChange(event) {
    if (event == true) {
      if (this.data.approveControl != '1') {
        this.data.approveControl = '1';
        this.dialogSignFile.patchValue({ approveControl: '1' });
        this.onSaveSignFile();
      }
    }
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
        this.dialog && this.dialog.close(this.data);
      } else if (this.isSaved) {
        this.esService.deleteSignFile(this.data.recID).subscribe((res) => {
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
    if (
      this.processTab == 0 ||
      (this.isAddNew == true &&
        this.dialogSignFile.invalid &&
        this.isSaved == false)
    ) {
      this.dialog && this.dialog.close();
    } else if (this.processTab > 0 && this.isAddNew == true) {
      this.notify.alertCode('ES004').subscribe((x) => {
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
    this.esService.getSFByID(this.data?.recID).subscribe((res) => {
      if (res?.signFile) {
        this.data.files = res?.signFile?.files;
        this.dialogSignFile.patchValue({ files: res?.signFile?.files });
        this.onSaveSignFile();
        this.dialog && this.dialog.close(this.data);
      }
    });
  }

  closeDialogTmp(dialogTmp: DialogRef) {
    if (this.templateName != '') this.templateName = '';
    dialogTmp && dialogTmp.close();
  }

  //#endregion

  setValueAreaControl(event) {}

  release() {
    //Gửi duyệt'

    if (this.user.userID != this.data.owner) {
      return;
    }
    if (this.eSign == true && this.processTab < 3 && this.currentTab == 3) {
      return;
    }

    this.esService
      .release(
        this.data,
        this.formModelCustom.entityName,
        this.formModelCustom.funcID
      )
      .subscribe((res) => {
        if (res?.msgCodeError == null && res?.rowCount > 0) {
          this.esService.getSFByID(this.data?.recID).subscribe((res) => {
            if (res?.signFile) {
              this.data.files = res?.signFile?.files;
              this.dialogSignFile.patchValue({ files: res?.signFile?.files });

              this.dialogSignFile.patchValue({ approveStatus: '3' });
              this.data.approveStatus = '3';

              this.esService.editSignFile(this.data).subscribe((result) => {
                if (result) {
                  //Gen QR code
                  this.esService
                    .addQRBeforeRelease(this.data.recID)
                    .subscribe((res) => {});

                  // Notify
                  this.notify.notifyCode('ES007');
                  this.dialog &&
                    this.dialog.close({
                      data: this.data,
                      approved: true,
                    });
                }
              });
            }
          });
        } else {
          this.notify.notifyCode(res?.msgCodeError);
        }
      });
  }

  afterCategoryChange() {
    if (this.data?.files.length > 0) {
      this.data?.files.forEach((file) => {
        file.eSign = this.eSign;
      });
    }
  }

  fileDelete(event) {
    console.log(event);
  }
}
