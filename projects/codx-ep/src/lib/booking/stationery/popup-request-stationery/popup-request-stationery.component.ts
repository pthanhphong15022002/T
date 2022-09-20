import { ModelPage } from 'projects/codx-ep/src/public-api';
import {
  Component,
  Injector,
  Optional,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DialogData,
  DialogRef,
  SidebarModel,
  UIComponent,
  AuthService,
  CodxService,
  NotificationsService,
  FormModel,
  ViewsComponent,
  ScrollComponent,
  DataRequest,
} from 'codx-core';
import { ApprovalStepComponent } from 'projects/codx-es/src/lib/setting/approval-step/approval-step.component';
import { CodxEsService, ES_SignFile } from 'projects/codx-es/src/public-api';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'popup-request-stationery',
  templateUrl: './popup-request-stationery.component.html',
  styleUrls: ['./popup-request-stationery.component.scss'],
})
export class PopupRequestStationeryComponent extends UIComponent {
  @ViewChild('view') override view: ViewsComponent;
  @ViewChild('status') status: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('stepAppr') stepAppr: ApprovalStepComponent;
  @ViewChild('content') content;
  @ViewChild('viewApprovalStep') viewApprovalStep: ApprovalStepComponent;

  headerText = 'Thêm mới đăng ký';

  currentTab = 0; // buoc hiện tại
  processTab = 0; // tổng bước đã đi qua
  formModel: FormModel;
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

  newNode: number; //vị trí node mới
  oldNode: number; //vị trí node trước

  isAfterSaveProcess: boolean = false;

  option: SidebarModel;
  oSignFile: ES_SignFile;
  user: any = {};
  showPlan: boolean = true;

  lstStationery: any;

  constructor(
    private injector: Injector,
    private auth: AuthService,
    private notify: NotificationsService,
    private esService: CodxEsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = data?.data?.formModel;
    this.data = data?.data?.option?.DataService.dataSelected || {};
    this.isAddNew = data?.data?.isAddNew ?? true;
    this.option = data?.data?.option;
    this.oSignFile = data?.data?.oSignFile;

    this.user = this.auth.userValue;
    if (!this.user.employee || this.user.employee == null) {
      this.user.employee = null;
      this.esService.getEmployee(this.user?.userID).subscribe((emp) => {
        if (emp) {
          this.user.employee = emp;
        }
      });
    }

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

  model: DataRequest;

  onInit(): void {
    if (this.oSignFile) {
      this.esService.getFormModel('EST011').then((formModel) => {
        this.formModel = formModel;

        this.esService
          .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
          .then((res) => {
            if (res) this.cbxName = res;
          });
      });
    } else {
      this.initForm();
      this.esService
        .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
        .then((res) => {
          if (res) this.cbxName = res;
        });
    }

    this.cache.functionList('EPT3').subscribe((res) => {
      this.model = new DataRequest();
      this.model.funcID = 'EPT3';
      this.model.formName = 'BookingStationery';
      this.model.gridViewName = 'grvBookingStationery';
      this.model.entityName = 'EP_Resources';
      this.model.predicate = 'ResourceType=@0';
      this.model.dataValue = '6';
      this.model.pageLoading = false;

      this.api
        .exec('ERM.Business.EP', 'ResourcesBusiness', 'GetListAsync', [
          this.model,
        ])
        .subscribe((res) => {
          console.log(res);
        });
    });
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  initForm() {
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
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
            this.detectorRef.detectChanges();
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
                  this.formModel.funcID,
                  this.formModel.entityName,
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
                    this.isAfterRender = true;
                    this.detectorRef.detectChanges();
                  }
                });
            }
          }
        }
      });
  }

  popup(data, current) {
    this.attachment.openPopup();
  }

  changeTab(tabNo) {
    this.onSaveSignFile();

    this.currentTab = tabNo;

    this.detectorRef.detectChanges();
  }

  valueChange(event) {
    if (event?.field && event?.component && event?.data != '') {
      this.isEdit = true;
      if (event?.field == 'templateName') {
        this.templateName = event.data;
        return;
      }
      if (event?.field == 'refDate') {
        this.dialogSignFile.patchValue({
          [event['field']]: event.data?.fromDate,
        });
      } else if (event?.data === Object(event?.data))
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
        let category = event.component?.itemsSelected[0];
        this.dialogSignFile.patchValue({
          icon: category?.Icon,
          color: category?.Color,
          processID: category?.RecID,
          categoryName: category?.CategoryName,
        });
      }

      if (event.field == 'owner') {
        debugger;
        let employee = event.component?.itemsSelected[0];
        this.dialogSignFile.patchValue({
          employeeID: employee?.employeeID,
          deptID: employee?.departmentID,
          divisionID: employee?.divisionID,
          companyID: employee?.companyID,
        });
        if (employee?.OrgUnitID != null) {
          this.dialogSignFile.patchValue({
            orgUnitID: employee?.OrgUnitID,
          });
        }
      }

      this.detectorRef.detectChanges();
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
    this.detectorRef.detectChanges();
  }

  onSaveProcessTemplateID(dialogTmp: DialogRef) {
    if (
      this.processID != '' &&
      this.dialogSignFile.value.approveControl != '1'
    ) {
      this.dialogSignFile.patchValue({
        processID: this.processID,
        approveControl: '2',
      });
      this.onSaveSignFile();

      dialogTmp && dialogTmp.close();
    }
  }

  saveProcessStep() {
    this.stepAppr?.saveStep();
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
            this.esService.setApprovalStep(null);
            this.esService.setLstDeleteStep(null);

            this.dialogSignFile.patchValue({ approveControl: '1' });
            this.esService
              .editSignFile(this.dialogSignFile.value)
              .subscribe((resSignFile) => {
                if (resSignFile) {
                  this.dialogSignFile.patchValue(resSignFile);
                  this.isAfterSaveProcess = true;
                }
              });
          }
        });
      }
    } else {
      this.esService.editApprovalStep().subscribe((res) => {
        this.isAfterSaveProcess = true;
      });
      this.esService.deleteApprovalStep().subscribe((res) => {});
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
            //this.dialog && this.dialog.close(res);
          }
        });
    } else {
      this.notify.notify('Nhập tên mẫu trước khi lưu!');
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

  continue(currentTab) {
    if (this.currentTab > 3) return;

    //let oldNode = currentTab * 2;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    // let newNode = oldNode + 2;

    switch (currentTab) {
      case 0:
        if (
          this.attachment.fileUploadList.length > 0 ||
          this.dialogSignFile.value.files?.length > 0
        ) {
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

        break;
      case 3:
        if (this.esService.getApprovalStep) break;
    }

    this.detectorRef.detectChanges();
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
    this.callfc.openForm(this.content, 'Quy trình mẫu', 700, 1000);
  }

  openPopup(content) {
    this.callfc.openForm(content, 'Quy trình mẫu', 400, 250);
  }

  extendShowPlan() {
    this.showPlan = !this.showPlan;
  }

  openTemplateName(dialog1) {
    this.callfc.openForm(dialog1, 'Nhập tên', 400, 250);
  }

  //#endregion

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
            this.dialog && this.dialog.close(res);
          }
        });
    }
  }

  clickNotSave(dialogClose: DialogRef) {
    // click thoát
    dialogClose && dialogClose.close();
    this.dialog && this.dialog.close();
  }

  close(dialogClose) {
    if (
      this.processTab == 0 ||
      (this.isAddNew == false && this.isEdit == false) ||
      (this.isAddNew == true && this.dialogSignFile.invalid)
    ) {
      this.dialog && this.dialog.close();
    } else if (this.processTab > 0) {
      this.callfc.openForm(dialogClose, '', 500, 250);
    }
  }

  saveAndClose() {
    this.onSaveSignFile();
    this.dialog && this.dialog.close(this.dialogSignFile.value);
  }

  closeDialogTmp(dialogTmp: DialogRef) {
    if (this.templateName != '') this.templateName = '';
    dialogTmp && dialogTmp.close();
  }

  //#endregion

  setValueAreaControl(event) {}

  approve() {
    //Gửi duyệt
    this.esService
      .release(
        this.dialogSignFile.value,
        this.formModel.entityName,
        this.formModel.funcID
      )
      .subscribe((res) => {
        if (res?.msgCodeError == null && res?.rowCount) {
          this.dialogSignFile.patchValue({ approveStatus: '3' });
          this.esService
            .editSignFile(this.dialogSignFile.value)
            .subscribe((result) => {
              if (res) {
                this.notify.notifyCode('Gửi duyệt thành công!');
                this.dialog &&
                  this.dialog.close({
                    data: this.dialogSignFile.value,
                    approved: true,
                  });
              }
            });
        } else {
          this.notify.notifyCode(res?.msgCodeError);
        }
      });
  }

  click(data) {}

  clickMF($event, data) {}

  test() {
    console.log('test');
  }
}
