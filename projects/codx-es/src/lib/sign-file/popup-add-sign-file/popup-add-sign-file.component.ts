import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FileService } from '@shared/services/file.service';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ScrollComponent,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { ES_SignFile, File } from '../../codx-es.model';
import { CodxEsService } from '../../codx-es.service';
import { ApprovalStepComponent } from '../../setting/approval-step/approval-step.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';
import { tmpCopyFileInfo } from 'projects/codx-share/src/lib/models/fileInfo.model';
import {
  ApproveProcess,
  Approver,
} from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { PdfComponent } from 'projects/codx-common/src/lib/component/pdf/pdf.component';

@Component({
  selector: 'popup-add-sign-file',
  templateUrl: './popup-add-sign-file.component.html',
  styleUrls: ['./popup-add-sign-file.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddSignFileComponent implements OnInit {
  @ViewChild('view') view: ViewsComponent;
  @ViewChild('status') status: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('content') content;
  @ViewChild('addTemplateName') addTemplateName;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;
  @ViewChild('pdfView') pdfView: PdfComponent;

  headerText = '';

  frmModel: FormModel = {
    entityName: 'ES_SignFiles',
    entityPer: 'ES_SignFiles',
    formName: 'SignFiles',
    funcID: 'EST011',
    gridViewName: 'grvSignFiles',
  };
  showPdf = true;
  fileIndex = 0;
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
  sampleProcessName = '';
  editApprovers = false; // Ẩn quy trình xét duyệt, lấy người duyệt truyền vào
  approvers = null; // Mảng người xét duyệt truyền vào
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

  isTemplate: boolean; // signfile dạng template
  refType: string; // EntityName của nghiệp vụ mặc định là "ES_SignFiles"
  refID: any;

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
  cbbProcess = [];
  listCategory = [];
  curCategory: any;
  confirmControl: any;
  allowEditAreas: any;
  nextClick = false;
  isReleasing = false;
  typeCategory: any;
  loadedTemplateFile = false;
  showAttachment = true;
  approverProcess: ApproveProcess;
  categoryID: any;
  sfTemplates = [];
  dynamicApprovers = [];
  fields: Object = { text: 'title', value: 'recID' };
  cbbDriver:any;
  showStepSetting=true;
  templateRefType: any;
  templateRefID: any;
  constructor(
    private auth: AuthStore,
    private esService: CodxEsService,
    private codxService: CodxService,
    private codxShareService: CodxShareService,
    private cr: ChangeDetectorRef,
    private callfuncService: CallFuncService,
    public dmSV: CodxDMService,
    private notify: NotificationsService,
    private fileService: FileService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    if (!this.dialog.dataService) {
      this.dialog.dataService = data?.data?.dataService;
    }
    this.modeView = data?.data?.modeView ?? '0';
    /*
    1: view
    */
    this.formModelCustom = data?.data?.formModel;
    this.data =
      data?.data?.option?.DataService?.dataSelected ?? data?.data?.data ?? {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
    this.categoryID = data?.data?.oSignFile?.categoryID;
    this.oSignFile = data?.data?.oSignFile;
    this.disableCateID = data?.data?.disableCateID ?? false;
    this.cbxCategory = data?.data?.cbxCategory ?? null; // Ten CBB
    this.headerText = data?.data?.headerText ?? '';
    this.isTemplate = data?.data?.isTemplate ? true : false;
    this.templateRefType = data?.data?.templateRefType;//refType truyền vào form export template
    this.templateRefID = data?.data?.templateRefID;//refID truyền vào form export template
    this.refType = data?.data?.refType ?? 'ES_SignFiles'; // Bắt buộc truyền nếu từ module != ES: Lưu RefType của SignFile và lấy Category của Module
    this.refID = data?.data?.refID; // Bắt buộc truyền nếu từ module != ES: Lưu RefID của SignFile
    this.typeCategory =
      this.refType == 'ES_Categories' ? 'ES_SignFiles' : this.refType; //Dùng để lấy Category của Module
    this.editApprovers = data?.data?.editApprovers ?? false;
    this.approvers = data?.data?.approvers ?? null;
    this.approverProcess = data?.data?.approverProcess ?? null;
    if (this.approverProcess) {
      if (this.approverProcess.approvers?.length > 0) {
        this.dynamicApprovers.push(this.approverProcess.approvers);
      }
      if (this.approverProcess?.data?.employeeID) {
        let appr = new Approver();
        appr.roleType = 'E';
        appr.approver = this.approverProcess?.data?.employeeID;
        this.dynamicApprovers.push(appr);
      }
      if (this.approverProcess?.data?.owner) {
        let appr = new Approver();
        appr.roleType = 'OWN';
        appr.approver = this.approverProcess?.data?.owner;
        this.dynamicApprovers.push(appr);
      }
    }

    if (this.modeView == '2') {
      this.disableCateID = true;
    }

    //bien cho mf copy
    this.type = data?.data?.type;
    this.oldSfRecID = data?.data?.oldSfRecID;

    this.user = this.auth.get();

    if (this.type == 'copy') {
      // copy -> upload lại file

      this.data = data?.data?.dataSelected;
    } else if (this.oSignFile) {
      this.currentTab = 0;
      this.processTab = 0;
      this.lstFile = data?.data?.files;
    } else {
      if (!this.isAddNew) {
        this.data = data?.data.dataSelected ?? data?.data?.data;
        this.processTab = 3;
      }
      if (
        (this.data?.approveStatus != 1 && this.data?.approveStatus != 2) ||
        this.modeView == '1'
      ) {
        this.currentTab = 2;
        this.processTab = 3;
      }
    }
    if (this.data.refType == 'ES_Categories') {
      this.disableCateID = true;
    }
    if (this.data.isTemplate) {
      this.isTemplate = true;
      this.showStepSetting = false;
    }
  }

  ngOnInit(): void {
    this.esService.getAllCategory(this.typeCategory).subscribe((res: any) => {
      if (res) {
        this.listCategory = res;
      }
    });
    if (this.data?.categoryID == null) this.data.categoryID = this.categoryID;
    this.esService
      .getCategoryByCateIDType(this.data?.categoryID, this.typeCategory)
      .subscribe((cate) => {
        if (cate) {
          this.eSign = cate?.eSign;
          this.signatureType = cate?.signatureType;
        }
      });
    //Lấy quy trình mẫu cũ
    if (this.data?.processID && this.data?.approveControl == '2') {
      this.esService
        .getTemplateByProcess(this.data?.processID)
        .subscribe((res: any) => {
          if (res) {
            this.sampleProcessName = res?.title;
            this.cr.detectChanges();
          }
        });
    }
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
          .getSFByID(this.oSignFile?.recID)
          .subscribe((signFile) => {
            if (
              signFile &&
              (signFile?.signFile?.approveStatus == '1' ||
                signFile?.signFile?.approveStatus == '2')
            ) {
              this.data = signFile?.signFile;
              this.data.recID = this.oSignFile?.recID;
              this.data.title = this.oSignFile?.title;
              this.data.categoryID = this.oSignFile?.categoryID;
              this.data.files = this.oSignFile?.files;
              this.data.refID = this.oSignFile.refID;
              this.data.refType = this.oSignFile?.refType;
              this.data.refDate = this.oSignFile?.refDate;
              this.data.refNo = this.oSignFile?.refNo;
              this.data.priority = this.oSignFile?.priority;
              this.data.approveControl =
                this.oSignFile?.approveControl ?? this.data.approveControl;
              this.data.processID =
                this.oSignFile?.processID ?? this.data.processID;

              this.isSaved = true;
              this.isAddNew = false;
              if (this.data.approveControl == '3') {
                this.esService
                  .getCategoryByCateIDType(
                    this.data?.categoryID,
                    this.typeCategory
                  )
                  .subscribe((cate) => {
                    if (cate) {
                      this.data.processID = cate.processID;
                      this.processTab = 3;
                      this.initForm();
                    }
                  });
              } else {
                this.processTab = 3;
                this.initForm();
              }
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
                    this.data.refID = this.oSignFile.refID;
                    this.data.refDate = this.oSignFile.refDate;
                    this.data.refNo = this.oSignFile.refNo;
                    this.data.priority = this.oSignFile.priority;
                    this.data.refType = this.oSignFile.refType;
                    this.data.approveControl =
                      this.oSignFile?.approveControl ??
                      this.data.approveControl;
                    this.data.processID =
                      this.oSignFile?.processID ?? this.data.processID;
                    if (this.data.approveControl == '3') {
                      this.esService
                        .getCategoryByCateIDType(
                          this.data?.categoryID,
                          this.typeCategory
                        )
                        .subscribe((cate) => {
                          if (cate) {
                            this.data.processID = cate.processID;
                            this.initForm();
                          }
                        });
                    } else {
                      this.initForm();
                    }
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
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.esService.loadDataCbx('ES');
    this.user = this.auth.get();
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
            if (this.type == 'copy') {
              this.esService
                .getDetailSignFile(this.oldSfRecID)
                .subscribe((res) => {
                  if (res) {
                    if (res?.files?.length > 0) {
                      //this.eSign = this.data.files[0].eSign;
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
                      .getCategoryByCateIDType(
                        this.data?.categoryID,
                        this.typeCategory
                      )
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
              this.data.approveControl = this.data.approveControl ?? '3';
              this.data.refDate = new Date();

              if (!this.data?.refNo) {
                this.esService
                  .genAutoNumber(
                    this.formModelCustom.funcID,
                    this.formModelCustom.entityName,
                    'RefNo'
                  )
                  .subscribe((res) => {
                    if (res) {
                      this.data.refNo = res;
                      this.dialogSignFile.patchValue({
                        refNo: this.data.refNo,
                      });
                      this.autoNo = JSON.parse(
                        JSON.stringify(this.data?.refNo)
                      );
                    }
                  });
              } else {
                this.autoNo = JSON.parse(JSON.stringify(this.data?.refNo));
              }

              this.formModelCustom.currentData = this.data;
              this.dialogSignFile.patchValue(this.data);
              this.isAfterRender = true;
              this.cr.detectChanges();
              if (this.oSignFile) {
                if (this.data?.files && this.data?.files.length == 1) {
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
                //this.updateNodeStatus(0, 1);
              }
              if (
                this.data.approveControl == '2' &&
                this.approverProcess?.template?.recID != null
              ) {
                this.esService
                  .getDetailSignFile(this.approverProcess?.template?.recID)
                  .subscribe((template) => {
                    if (template && template?.files?.length > 0) {
                      this.applyTemplate(null, template);
                    }
                  });
              }
            } else {
              let sfRecID = this.data?.recID;

              this.esService.getDetailSignFile(sfRecID).subscribe((res) => {
                if (res) {
                  this.data = res;
                  if (this.data?.files?.length > 0) {
                    //this.eSign = this.data.files[0].eSign;
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
                    //this.updateNodeStatus(0, 1);
                  }
                }
              });
            }
          }
        });
    });
  }
  getSFTemplate() {
    this.esService
      .getSFTemplate(this.data?.categoryID, this.data?.category)
      .subscribe((res) => {
        if (res) {
          this.sfTemplates = res;
          this.cr.detectChanges();
        }
      });
  }

  applyTemplate(recID = null, selectedTemplate = null) {
    if (this.sfTemplates?.length > 0 || selectedTemplate != null) {
      if (selectedTemplate == null) {
        if (recID == null) {
          selectedTemplate = this.sfTemplates[0];
        } else {
          let temp = this.sfTemplates.filter((x) => x.recID == recID);
          if (temp?.length > 0) {
            selectedTemplate = temp[0];
          }
        }
      }
      if (
        selectedTemplate != null &&
        selectedTemplate?.files?.length > 0 &&
        this.data?.files?.length > 0
      ) {
        for (let i = 0; i < this.data?.files?.length; i++) {
          if (
            selectedTemplate.files[i] != null &&
            selectedTemplate.files[i]?.areas?.length > 0
          ) {
            let templateArea = selectedTemplate.files[i]?.areas;
            for (let indx = 0; indx < templateArea?.length; indx++) {
              delete templateArea[indx].id;
              delete templateArea[indx].recID;
              delete templateArea[indx].modifiedBy;
              delete templateArea[indx].modifiedOn;
              templateArea[indx].createdOn = new Date();
              templateArea[indx].createdBy = this.user.userID;
            }
            this.data.files[i].areas = selectedTemplate.files[i]?.areas;
          }
        }
      }
      if (recID != null) {
        this.onSaveSignFile();
        this.showPdf = false;
        this.cr.detectChanges();
        this.showPdf = true;
        this.cr.detectChanges();
      }
    }
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
    // let files = [];
    let files = this.data.files ?? [];
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
                this.getCurrentCate(event?.data);
                if (x?.event?.status == 'Y') {
                  //Nếu category có dùng đánh số tự động riêng và sinh số tự động khi tạo mới thì tạo số tự động
                  if (
                    this.curCategory?.autoNumberControl == '1' &&
                    this.curCategory?.autoAssignRule == '1'
                  ) {
                    this.esService
                      .getAutoNumberByCategory(category?.AutoNumber)
                      .subscribe((autoNum) => {
                        if (
                          autoNum != null &&
                          this.curCategory?.autoNumberControl == '1'
                        ) {
                          this.data.refNo = autoNum;
                          this.dialogSignFile.patchValue({
                            refNo: this.data.refNo,
                          });
                          this.cr.detectChanges();
                        }
                      });
                  }
                  //Nếu category có dùng đánh số tự động riêng và sinh số tự động khi lưu thì ko tạo trước số tự động
                  else if (
                    this.curCategory?.autoNumberControl == '1' &&
                    this.curCategory?.autoAssignRule == '2'
                  ) {
                    this.data.refNo = null;
                  }
                  //Nếu ko thì lấy số tự động của trình kí
                  else if (this.curCategory?.autoNumberControl == '0') {
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
                  this.data.category = category?.category;
                  this.eSign = category?.ESign;
                  this.signatureType = category?.SignatureType;

                  this.afterCategoryChange();
                  this.cr.detectChanges();

                  // this.esService
                  //   .getAutoNumberByCategory(category?.AutoNumber)
                  //   .subscribe((autoNum) => {
                  //     this.data.categoryID = event.data;
                  //     this.dialogSignFile.patchValue({
                  //       categoryID: this.data.categoryID,
                  //     });

                  //     if (autoNum != null && this.curCategory?.autoNumberControl=='1') {
                  //       this.data.refNo = autoNum;
                  //     }
                  //     else if (this.autoNo) {
                  //       this.data.refNo = this.autoNo;
                  //     }

                  //   });
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
              this.getCurrentCate(event?.data);
              //Nếu category có dùng đánh số tự động riêng và sinh số tự động khi tạo mới thì tạo số tự động
              if (
                this.curCategory?.autoNumberControl == '1' &&
                this.curCategory?.autoAssignRule == '1'
              ) {
                this.esService
                  .getAutoNumberByCategory(category?.AutoNumber)
                  .subscribe((autoNum) => {
                    if (
                      autoNum != null &&
                      this.curCategory?.autoNumberControl == '1'
                    ) {
                      this.data.refNo = autoNum;
                      this.dialogSignFile.patchValue({
                        refNo: this.data.refNo,
                      });
                      this.cr.detectChanges();
                    }
                  });
              }
              //Nếu category có dùng đánh số tự động riêng và sinh số tự động khi lưu thì ko tạo trước số tự động
              else if (
                this.curCategory?.autoNumberControl == '1' &&
                this.curCategory?.autoAssignRule == '2'
              ) {
                this.data.refNo = null;
              }
              //Nếu ko thì lấy số tự động của trình kí
              else if (this.curCategory?.autoNumberControl == '0') {
                this.data.refNo = this.autoNo;
              }

              this.dialogSignFile.patchValue({
                approveControl: '3',
              });
              this.data.approveControl = '3';

              this.dialogSignFile.patchValue({ refNo: this.data.refNo });
              //delete step of signfile
              this.esService.deleteStepByTransID(this.data.recID).subscribe();

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
              this.data.category = category?.category;
              this.eSign = category?.ESign;
              this.signatureType = category?.SignatureType;

              this.afterCategoryChange();
              this.cr.detectChanges();
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

  getCurrentCate(cateID: string) {
    if (cateID != null && cateID != '') {
      let cate = this.listCategory.filter((item) => item.categoryID == cateID);
      if (cate?.length > 0) {
        this.curCategory = cate[0];
      } else {
        this.esService
          .getCategoryByCateIDType(this.data?.categoryID, this.typeCategory)
          .subscribe((cate) => {
            if (cate) {
              this.curCategory = cate?.signatureType;
            }
          });
      }
    }
  }
  getCurrentStepWhenEdit(oSignFile) {
    if ((oSignFile || oSignFile != null) && this.isAddNew == false) {
      if (oSignFile.files?.length > 0) {
        let lstFile = oSignFile.files;
        lstFile.forEach((element) => {
          if (element?.areas?.length > 0) {
            this.processTab = 2;
            this.currentTab = 2;
            return;
          }
        });

        if (oSignFile.ApproveControl != 1) {
          this.processTab = 0;
          this.currentTab = 0;
          return;
        } else {
          this.processTab = 1;
          this.currentTab = 1;
          return;
        }
      }
    }
  }

  //#region Methods Save
  onSaveSignFile(keepCurrentTab = false) {
    if (this.dialogSignFile.value.buid == null) {
      this.dialogSignFile.patchValue({
        buid: this.user?.buid,
      });
    }

    if (this.dialogSignFile.invalid == true) {
      this.esService.notifyInvalid(this.dialogSignFile, this.formModelCustom);
      return;
    }
    if (!this.data.category) {
      this.data.category = this.refType;
    }
    if (!this.isSaved && this.isAddNew) {
      if (this.data.refType == null || this.data.refType == '') {
        this.data.refType = this.refType;
        this.data.refID = this.refID;
      }
      this.esService.addNewSignFile(this.data).subscribe(async (res) => {
        if (res != null) {
          console.log('ADD NEW SIGNFILE: ', res);
          console.log('ADD NEW SIGNFILE: data', this.data);
          console.log('ADD NEW SIGNFILE: formGroup', this.dialogSignFile.value);
          this.data.files = res?.files;
          this.data.permissions = res?.permissions;
          this.data.recID = res?.recID;
          this.data.refNo = res?.refNo;
          this.data.id = res?.id;
          this.data.category = res?.category;
          this.dialogSignFile.patchValue({
            files: res?.files,
            permissions: res?.permissions,
            id: res?.id,
            recID: res?.recID,
            refNo: res?.refNo,
            category: res?.category,
          });
          this.isSaved = true;
          if (
            this.attachment?.fileUploadList &&
            this.attachment?.fileUploadList.length > 0
          ) {
            this.attachment.objectId = res.recID;
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                }
              }
            );
          }
          if (!keepCurrentTab) {
            if (this.currentTab == 0) {
              this.updateNodeStatus(this.oldNode, this.newNode);
              this.currentTab++;
              this.processTab++;
              this.cr.detectChanges();
            }

            if (this.isAddNew && this.currentTab == 1 && this.nextClick) {
              this.updateNodeStatus(this.oldNode, this.newNode);
              this.currentTab++;
              this.processTab++;
              this.cr.detectChanges();
              this.nextClick = false;
            }
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
          this.data.refNo = res?.refNo;
          this.data.category = res?.category;
          this.dialogSignFile.patchValue({
            modifiedBy: res?.modifiedBy,
            modifiedOn: res?.modifiedOn,
            category: res?.category,
            refNo: res?.refNo,
          });

          if (!keepCurrentTab) {
            if (this.currentTab == 1) {
              this.updateNodeStatus(this.oldNode, this.newNode);
              this.currentTab++;
              this.processTab == 1 && this.processTab++;
              this.cr.detectChanges();
            }
            if (this.currentTab == 0 && !this.showStepSetting) {
              this.updateNodeStatus(this.oldNode, this.newNode);
              this.currentTab = 2;
              this.processTab = 3;
              this.cr.detectChanges();
            }
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
        if (
          this.cbbProcess.length == 0 &&
          event?.component?.dataService?.data &&
          event?.component?.dataService?.data.length > 0
        ) {
          this.cbbProcess = event?.component?.dataService?.data;
        }
      }
    }
  }

  onSaveProcessTemplateID(dialogTmp: DialogRef) {
    if (this.processID != '') {
      if ((!this.isAddNew || this.isSaved) && this.eSign == true) {
        this.notify.alertCode('ES002').subscribe((x) => {
          if (x?.event?.status == 'Y') {
            this.esService.deleteStepByTransID(this.data.recID).subscribe();
            this.dialogSignFile.patchValue({
              processID: this.processID,
              approveControl: '2',
            });
            this.data.processID = this.processID;
            this.data.approveControl = '2';
            this.getSampleProcessName(this.processID);
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
              //this.onSaveSignFile();
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
        this.getSampleProcessName(this.processID);
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

  getSampleProcessName(processID: any) {
    //Lấy tên quy trình mẫu
    if (this.cbbProcess && this.cbbProcess.length > 0 && processID != null) {
      let curProcess = this.cbbProcess.filter(
        (pr: any) => pr.RecID == this.processID
      );
      if (curProcess != null && curProcess.length > 0) {
        this.sampleProcessName = curProcess[0]?.Title;
      }
    }
  }

  saveTemplate(dialogTemplateName) {
    if (this.templateName != '') {
      this.esService
        .saveSignFileIsTemplate(
          this.dialogSignFile.value.recID, //SaveTemplate
          this.templateName
        )
        .subscribe((res) => {
          if (res) {
            this.notify.notifyCode('SYS006');
            let cate = this.listCategory.filter(
              (item) => item.categoryID == res?.categoryID
            );
            if (cate?.length > 0) {
              res.icon = cate[0]?.icon;
              res.color = cate[0]?.color;
              res.categoryName = cate[0]?.categoryName;
            }
            if (this.isTemplate && this.dialog?.dataService) {
              (this.dialog?.dataService as CRUDService)?.add(res)?.subscribe();
            }
            dialogTemplateName && dialogTemplateName.close();
          }
        });
    } else {
      this.notify.notifyCode('SYS009');
    }
  }

  updateApproveTemplate() {
    // if (this.data?.approveControl != '1') {
    //   this.notify.notify('Qui trình chưa thay đổi');
    //   return;
    // }
    this.esService.updateApproveTemplate(this.data).subscribe((res) => {
      if (res != null) {
        this.notify.notifyCode('SYS007');
      }
    });
  }
  //#endregion

  //#region Change Tab

  clickTab(tabNo) {
    let newNo = tabNo;
    let oldNo = this.currentTab;

    if (oldNo == 2) {
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
    if (tabNo != 0 && this.disableContinue) return;

    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    }
  }

  async continue(currentTab) {
    if (this.currentTab > 2) return;

    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
        this.getSFTemplate();
        if (
          this.attachment?.fileUploadList?.length > 0 ||
          this.data?.files?.length > 0
        ) {
          if (!this.showStepSetting) {
            this.oldNode = oldNode + 1;
            this.newNode = newNode + 1;
            this.onSaveSignFile();
            this.nextClick = true;
          } else {
            this.updateNodeStatus(oldNode, newNode);
            this.currentTab == 0 && this.currentTab++;
            this.processTab == 0 && this.processTab++;
          }
        } else {
          this.notify.notifyCode('ES006');
        }

        break;

      case 1:
        if (this.data.approveControl == '3') {
          this.applyTemplate();
        }
        this.oldNode = oldNode;
        this.newNode = newNode;
        this.onSaveSignFile();
        this.nextClick = true;
        break;
      case 2:
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
    if (oldNode == null || newNode == null) {
      return;
    }
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    ).filter((x) => x.nodeName == 'DIV');

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
      this.nextClick = false;
      if (
        this.data.approveControl != '1' &&
        !(this.isTemplate && this.data.refType == 'ES_Categories')
      ) {
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
    // if(this.isAddNew == true && this.isSaved == false && this.data?.category == "ES_SignFiles" && this.data?.refType == "ES_SignFiles"){

    // }
    if (
      this.processTab == 0 ||
      (this.isAddNew == true &&
        this.dialogSignFile.invalid &&
        this.isSaved == false)
    ) {         
      this.dialog && this.dialog.close();
    } 
    else if (this.processTab > 0 && this.isAddNew == true) {
      if (this.data?.files.length == 0) {
        if (this.isSaved && this.isEdit) {
          this.clickIsSave(false);
        }
      } else {
        this.notify.alertCode('ES004').subscribe((x) => {
          if (x?.event?.status == 'Y') {
            this.clickIsSave(true);
          } else {
            this.clickIsSave(false);
          }
        });
      }
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
        if (this.isAddNew) {
          this.notify.notifyCode('SYS006');
        } else {
          this.notify.notifyCode('SYS007');
        }
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
    if (!this.isReleasing) {
      this.isReleasing = true;
      if (this.user.userID != this.data.owner) {
        this.isReleasing = false;
        return;
      }
      if (this.eSign == true && this.processTab < 2 && this.currentTab == 2) {
        this.isReleasing = false;
        return;
      }
      this.codxShareService
        .codxRelease(
          this.approverProcess?.module != null
            ? this.approverProcess?.module
            : 'ES',
          this.data?.recID,
          this.data.approveControl == '1'
            ? this.data?.recID
            : this.data?.processID,
          this.approverProcess?.entityName != null
            ? this.approverProcess?.entityName
            : this.formModelCustom.entityName,
          this.approverProcess?.funcID != null
            ? this.approverProcess?.funcID
            : this.formModelCustom.funcID,
          '',
          this.data?.title,
          this.approverProcess?.customEntityName != null? this.approverProcess?.customEntityName : this.data?.refType
        )
        .subscribe((res) => {
          if (res?.msgCodeError == null && res?.rowCount > 0) {
            let releaseRes = res;
            this.esService.getSFByID(this.data?.recID).subscribe((res) => {
              if (res?.signFile) {
                this.data.files = res?.signFile?.files;
                this.dialogSignFile.patchValue({ files: res?.signFile?.files });

                this.dialogSignFile.patchValue({
                  approveStatus: res?.signFile?.approveStatus,
                });
                this.data.approveStatus = res?.signFile?.approveStatus;

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
                        responseModel: releaseRes,
                      });
                  }
                });
              }
            });
          } else {
            this.notify.notifyCode(res?.msgCodeError);
            this.isReleasing = false;
          }
        });
    }
  }

  afterCategoryChange() {
    if (this.data?.files && this.data?.files.length > 0) {
      this.data?.files.forEach((file) => {
        file.eSign = this.eSign;
      });
    }
    this.data.category = this.curCategory?.category;
    this.cr.detectChanges();
  }

  fileDelete(event) {
    if (event && event?.length > 0) {
      let file = event[0].data ?? event[0];
      // let file = event[0];
      if (file) {
        let i = this.data?.files?.findIndex((p) => p.fileID == file.recID);
        if (i > -1) {
          this.data.files.splice(i, 1);
          console.log(this.data.files);

          this.dialogSignFile.patchValue({ files: this.data.files });
          this.esService
            .deleteFileInSignFile(this.data.recID, file.recID)
            .subscribe((res) => {
              console.log('edit sf', res);
            });
          this.cr.detectChanges();
        }
      }
    }
  }
  dowloadTemplate() {
    //console.log('download');
  }
  async fileCount(event) {
    if (event?.length == 0) {
      this.disableContinue = true;
    } else {
      this.disableContinue = false;
      if (this.data.title == null && event?.data[0]?.fileName != null) {
        let title = JSON.parse(JSON.stringify(event?.data[0].fileName));
        for (let i = event?.data[0].fileName.length; i >= 0; i--) {
          title = title.slice(0, i - 1);
          if (event?.data[0].fileName[i - 1] === '.') break;
        }
        this.data.title = title;
        this.dialogSignFile.patchValue({ title: title });
        this.cr.detectChanges();
      }
      if (this.attachment?.fileUploadList?.length > 0) {
        this.disableContinue = true;
        (await this.attachment.saveFilesObservable()).subscribe(
          (item2: any) => {
            this.disableContinue = false;
            let allSuccess = true;
            let fileAraray: any[] = Array.from(item2);
            if (
              fileAraray == null ||
              fileAraray.filter((x) => x?.status != '0').length > 0
            ) {
              allSuccess = false;
            }

            if (allSuccess) {
              this.fileAdded(item2);
            }
          }
        );
      }
    }
  }
  fileCheckChange(evt: any, file: any) {
    if (evt && this.eSign && this.data?.files && this.data?.files?.length > 0) {
      this.data?.files.forEach((f: any) => {
        if (f?.fileID == file?.recID) {
          f.eSign = evt?.data;
          this.cr.detectChanges();
        }
      });
    }
  }
  checkFileESign(recID: string) {
    if (
      this.data?.files &&
      this.data?.files?.length > 0 &&
      recID != null &&
      recID != ''
    ) {
      for (let i = 0; i < this.data?.files?.length; i++) {
        if (this.data?.files[i]?.fileID == recID) {
          return this.data?.files[i]?.eSign;
        }
      }
    } else {
      return this.eSign;
    }
  }
  showSignAreaCheck() {
    if (this.data?.files && this.data?.files?.length > 0) {
      for (let i = 0; i < this.data?.files?.length; i++) {
        if (this.data.files[i].eSign == true) {
          return true;
        }
      }
    }
    return false;
  }

  chooseTemplateType(type: string) {
    let tempTemplateType = '';
    switch (type) {
      case 'excel':
        tempTemplateType = 'AD_ExcelTemplates';
        break;

      case 'word':
        tempTemplateType = 'AD_WordTemplates';
        break;

      default:
        tempTemplateType = null;
        break;
    }
    if (
      this.data.files?.length > 0 &&
      this.data?.templateType == tempTemplateType
    ) {
      return;
    } else if (
      this.data.files?.length > 0 &&
      this.data?.templateType != tempTemplateType
    ) {
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      //SYS003
      this.notify
        .alert('Thông báo', 'Bạn có chắc chắn muốn xóa ?', config)
        .closed.subscribe((x) => {
          if (x?.event?.status == 'Y') {
            this.esService
              .deleteFileByObjectID(this.data?.recID, 'ES_SignFiles', true)
              .subscribe((deleted) => {
                if (deleted) {
                  //Đã xóa file
                }
                this.showAttachment = false;
                this.cr.detectChanges();
                this.showAttachment = true;
                this.cr.detectChanges();
              });
            if (
              this.data?.templateType != null &&
              this.data?.templateID != null
            ) {
              let method =
                this.type == 'excel' ? 'AD_ExcelTemplates' : 'AD_WordTemplates';
              if (type == 'excel') {
                this.esService
                  .getExcelTemplate(this.data?.templateID)
                  .subscribe((template) => {
                    if (template) {
                      this.api
                        .execActionData<any>(method, [template], 'DeleteAsync')
                        .subscribe((item) => {});
                      this.esService
                        .deleteFileByObjectID(
                          this.data?.templateID,
                          'AD_ExcelTemplates ',
                          true
                        )
                        .subscribe((deleted) => {});
                    }
                  });
              } else {
                this.esService
                  .getWordTemplate(this.data?.templateID)
                  .subscribe((template) => {
                    if (template) {
                      this.api
                        .execActionData<any>(method, [template], 'DeleteAsync')
                        .subscribe((item) => {});
                      this.esService
                        .deleteFileByObjectID(
                          this.data?.templateID,
                          'AD_WordTemplates',
                          true
                        )
                        .subscribe((deleted) => {});
                    }
                  });
              }
            }

            this.data.files = [];
            this.data.templateType = tempTemplateType;
            this.data.templateID = null;
            this.onSaveSignFile(true);
            this.cr.detectChanges();
          }
        });
    } else {
      this.data.files = [];
      this.data.templateType = tempTemplateType;
      this.data.templateID = null;
      this.onSaveSignFile(true);
      this.cr.detectChanges();
    }
  }

  addEditTemplateFile(type: string) {
    switch (type) {
      case 'file':
        this.cr.detectChanges();
        this.attachment.uploadFile();
        break;

      case 'excel':
      case 'word':
        this.cr.detectChanges();
        if (this.data.templateType != null && this.data.templateID != null) {
          if (type == 'excel') {
            this.esService
              .getExcelTemplate(this.data?.templateID)
              .subscribe((template) => {
                if (template) {
                  this.addEditADTemplate('edit', type, template);
                }
              });
          } else {
            this.esService
              .getWordTemplate(this.data?.templateID)
              .subscribe((template) => {
                if (template) {
                  this.addEditADTemplate('edit', type, template);
                }
              });
          }
        } else {
          this.addEditADTemplate('add', type, null);
        }

        break;
    }
  }

  addEditADTemplate(action: string, type: string, templateData: any) {
    var option = new DialogModel();
    option.DataService = templateData;
    this.callfuncService
      .openForm(
        CodxExportAddComponent,
        null,
        900,
        700,
        null,
        {
          action: action,
          type: type,
          refType: this.templateRefType ?? this.refType,
          refID: this.templateRefID ??this.data?.recID,
        },
        '',
        option
      )
      .closed.subscribe((closeEvent) => {
        if (closeEvent?.event) {
          let newCopyFile = new tmpCopyFileInfo();
          newCopyFile.objectID = this.data?.recID;
          newCopyFile.objectType = 'ES_SignFiles';
          newCopyFile.referType = 'source';
          if (action == 'add') {
            this.data.templateID = closeEvent?.event[0].recID;
            this.esService
              .copyFileByObjectID(
                this.data?.templateID,
                this.data?.recID,
                this.data?.templateType,
                '',
                newCopyFile
              )
              .subscribe((copyF) => {
                if (copyF) {
                  this.showAttachment = false;
                  this.cr.detectChanges();
                  let lstFile = [];
                  for (let i = 0; i < copyF?.length; i++) {
                    let file = new File();
                    file.fileID = copyF[i]?.recID;
                    file.fileName = copyF[i]?.fileName;
                    file.createdOn = copyF[i]?.createdOn;
                    file.createdBy = copyF[i]?.createdBy;
                    file.comment = copyF[i]?.extension;
                    file.eSign = this.eSign;
                    lstFile.push(file);
                  }
                  //
                  this.data.files = lstFile;
                  this.showAttachment = true;
                  this.cr.detectChanges();
                } else {
                  this.notify.notify(
                    'Xuất file từ mẫu thiết lập thất bại',
                    '2'
                  );
                  this.data.files = [];
                  this.cr.detectChanges();
                }
              });
          }
          if (action == 'edit') {
            //Có upload lại file
            if (closeEvent?.event?.length > 2 && closeEvent?.event[2] == true) {
              this.esService
                .deleteFileByObjectID(this.data.recID, 'ES_SignFiles', true)
                .subscribe((deleted) => {
                  this.data.templateID = closeEvent?.event[0].recID;
                  this.esService
                    .copyFileByObjectID(
                      this.data?.templateID,
                      this.data?.recID,
                      this.data?.templateType,
                      '',
                      newCopyFile
                    )
                    .subscribe((copyF) => {
                      if (copyF) {
                        this.showAttachment = false;
                        this.cr.detectChanges();
                        let lstFile = [];
                        for (let i = 0; i < copyF?.length; i++) {
                          let file = new File();
                          file.fileID = copyF[i]?.recID;
                          file.fileName = copyF[i]?.fileName;
                          file.createdOn = copyF[i]?.createdOn;
                          file.createdBy = copyF[i]?.createdBy;
                          file.comment = copyF[i]?.extension;
                          file.eSign = this.eSign;
                          lstFile.push(file);
                        }
                        //
                        this.data.files = lstFile;
                        this.dialogSignFile?.patchValue({ files: this.data.files });
                        this.disableContinue=false;
                        this.showAttachment = true;
                        this.cr.detectChanges();
                      } else {
                        this.notify.notify(
                          'Xuất file từ mẫu thiết lập thất bại',
                          '2'
                        );
                        this.data.files = [];
                        this.cr.detectChanges();
                      }
                    });
                });
            }
            //Ko upload lại file thì ko làm gì
          }
        }
      });
  }
  getFileTemplate(recID: any) {
    if (recID != null && !this.loadedTemplateFile) {
      this.codxShareService
        .getFileByObjectID(this.data?.templateID)
        .subscribe((fileTemplate: any) => {
          if (
            fileTemplate?.length > 0 &&
            this.data.files?.length == 0 &&
            !this.loadedTemplateFile
          ) {
            let newCopyFile = new tmpCopyFileInfo();
            newCopyFile.objectID = this.data?.recID;
            newCopyFile.objectType = 'ES_SignFiles';
            newCopyFile.referType = 'source';
            this.esService
              .copyFileByObjectID(
                this.data?.templateID,
                this.data?.recID,
                this.data?.templateType,
                '',
                newCopyFile
              )
              .subscribe((copyF) => {
                if (copyF) {
                  let lstFile = [];
                  for (let i = 0; i < copyF?.length; i++) {
                    let file = new File();
                    file.fileID = copyF[i]?.recID;
                    file.fileName = copyF[i]?.fileName;
                    file.createdOn = copyF[i]?.createdOn;
                    file.createdBy = copyF[i]?.createdBy;
                    file.comment = copyF[i]?.extension;
                    file.eSign = this.eSign;
                    lstFile.push(file);
                  }
                  //
                  this.data.files = lstFile;
                  this.dialogSignFile?.patchValue({ files: this.data.files });
                  this.disableContinue=false;
                  this.loadedTemplateFile = true;
                  this.cr.detectChanges();
                } else {
                  //this.loadedTemplateFile=true;
                }
              });
          }
        });
    }
  }

  openTemplate() {
    var gridModel = new DataRequest();
    gridModel.entityName = this.refType ;
    let tRefType = this.templateRefType ?? this.refType;
    let tRefID = this.templateRefID ?? this.data?.recID;
    let exportForm = this.callfuncService.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, null, null, tRefID, tRefType],
      null
    );
    exportForm.closed.subscribe((res) => {
      if (res?.event) {
        this.esService
          .deleteFileByObjectID(this.data.recID, 'ES_SignFiles', true)
          .subscribe((deleted) => {
            this.data.templateID = res?.event?.templateInfo?.recID;
            this.data.templateType = res?.event?.templateType;
            let newCopyFile = new tmpCopyFileInfo();
            newCopyFile.objectID = this.data?.recID;
            newCopyFile.objectType = 'ES_SignFiles';
            newCopyFile.referType = 'source';
            this.esService
              .copyFileByObjectID(
                this.data?.templateID,
                this.data?.recID,
                this.data?.templateType,
                '',
                newCopyFile
              )
              .subscribe((copyF) => {
                if (copyF) {
                  this.showAttachment = false;
                  this.cr.detectChanges();
                  let lstFile = [];
                  for (let i = 0; i < copyF?.length; i++) {
                    let file = new File();
                    file.fileID = copyF[i]?.recID;
                    file.fileName = copyF[i]?.fileName;
                    file.createdOn = copyF[i]?.createdOn;
                    file.createdBy = copyF[i]?.createdBy;
                    file.comment = copyF[i]?.extension;
                    file.eSign = this.eSign;
                    lstFile.push(file);
                  }
                  //
                  this.data.files = lstFile;
                  this.dialogSignFile?.patchValue({ files: this.data.files });
                  this.disableContinue=false;
                  this.showAttachment = true;
                  this.cr.detectChanges();
                } else {
                  this.notify.notify(
                    'Xuất file từ mẫu thiết lập thất bại',
                    '2'
                  );
                  this.data.templateID = null;
                  this.data.templateType = null;
                  this.data.files = [];
                  this.cr.detectChanges();
                }
              });
          });
      }
    });
  }
}
